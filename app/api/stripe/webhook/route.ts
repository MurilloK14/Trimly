import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { db } from '@/lib/db'
import { barbershops } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'
import type Stripe from 'stripe'

/**
 * POST /api/stripe/webhook
 *
 * Webhook oficial do Stripe para o Trimly.
 *
 * Princípios de Segurança & Idempotência:
 * 1. O corpo bruto (raw body) é lido como string para validação criptográfica.
 * 2. Toda requisição valida o header `stripe-signature` com `STRIPE_WEBHOOK_SECRET`.
 * 3. Assinaturas ausentes ou inválidas recebem HTTP 400 imediatamente.
 * 4. Nenhum dado do frontend é considerado: o Stripe é a única fonte de verdade.
 * 5. As atualizações no banco são idempotentes: receber o mesmo evento mais de uma vez
 *    produz o mesmo estado consistente sem criar duplicatas.
 * 6. Retorna HTTP 200 somente após o processamento bem-sucedido.
 *
 * Eventos tratados:
 *   - checkout.session.completed     → Vincula customer e subscription à barbearia
 *   - customer.subscription.created  → Sincroniza status e datas da assinatura
 *   - customer.subscription.updated  → Sincroniza status e datas da assinatura
 *   - customer.subscription.deleted  → Atualiza status para 'canceled'
 *   - invoice.paid                   → Atualiza status para 'active' e renova período
 *   - invoice.payment_succeeded      → Atualiza status para 'active'
 *   - invoice.payment_failed         → Atualiza status para 'past_due'
 */
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    console.error('[stripe/webhook] Header stripe-signature ausente.')
    return NextResponse.json({ error: 'Assinatura ausente.' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET não configurada no servidor.')
    return NextResponse.json({ error: 'Configuração do webhook ausente.' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err: any) {
    console.error('[stripe/webhook] Assinatura inválida:', err?.message)
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 })
  }

  console.log(`[stripe/webhook] Evento recebido: ${event.type} (ID: ${event.id})`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await handleSubscriptionUpsert(event.data.object as Stripe.Subscription)
        break
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      }

      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break
      }

      case 'invoice.payment_failed': {
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      }

      default: {
        // Evento reconhecido mas não requer ação no Trimly
        console.log(`[stripe/webhook] Evento ignorado (sem ação necessária): ${event.type}`)
      }
    }
  } catch (err: any) {
    console.error(`[stripe/webhook] Erro ao processar evento ${event.type}:`, err)
    // Retorna HTTP 500 para que o Stripe tente reenviar o webhook
    return NextResponse.json(
      { error: 'Erro interno ao processar webhook.' },
      { status: 500 }
    )
  }

  // HTTP 200 confirmando recepção e processamento seguro
  return NextResponse.json({ received: true })
}

// ─── Handlers Específicos ───────────────────────────────────────────────────

/**
 * Trata o checkout finalizado.
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== 'subscription') {
    return
  }

  const barbershopId = session.metadata?.barbershop_id
  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id

  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id

  if (!customerId || !subscriptionId) {
    console.error('[stripe/webhook] checkout.session.completed sem customerId ou subscriptionId')
    return
  }

  // Busca dados completos e atualizados da assinatura diretamente no Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const dates = extractSubscriptionDates(subscription)
  const priceId = subscription.items?.data?.[0]?.price?.id ?? null

  // Localiza a barbearia por barbershopId (do metadata) ou por stripeCustomerId
  if (barbershopId) {
    await db
      .update(barbershops)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId,
        subscriptionStatus: subscription.status,
        subscriptionStart: dates.subscriptionStart,
        subscriptionEnd: dates.subscriptionEnd,
        trialStart: dates.trialStart,
        trialEnd: dates.trialEnd,
        updatedAt: new Date(),
      })
      .where(eq(barbershops.id, barbershopId))

    console.log(`[stripe/webhook] Assinatura vinculada à barbearia ${barbershopId} via metadata. Status: ${subscription.status}`)
    return
  }

  // Fallback: busca pelo stripeCustomerId
  await db
    .update(barbershops)
    .set({
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      subscriptionStatus: subscription.status,
      subscriptionStart: dates.subscriptionStart,
      subscriptionEnd: dates.subscriptionEnd,
      trialStart: dates.trialStart,
      trialEnd: dates.trialEnd,
      updatedAt: new Date(),
    })
    .where(eq(barbershops.stripeCustomerId, customerId))

  console.log(`[stripe/webhook] Assinatura vinculada à barbearia com customer ${customerId}. Status: ${subscription.status}`)
}

/**
 * Trata criação ou atualização de subscription.
 */
async function handleSubscriptionUpsert(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id

  const barbershopId = subscription.metadata?.barbershop_id
  const dates = extractSubscriptionDates(subscription)
  const priceId = subscription.items?.data?.[0]?.price?.id ?? null

  if (barbershopId) {
    await db
      .update(barbershops)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        subscriptionStatus: subscription.status,
        subscriptionStart: dates.subscriptionStart,
        subscriptionEnd: dates.subscriptionEnd,
        trialStart: dates.trialStart,
        trialEnd: dates.trialEnd,
        updatedAt: new Date(),
      })
      .where(eq(barbershops.id, barbershopId))

    console.log(`[stripe/webhook] Assinatura atualizada para barbearia ${barbershopId}. Status: ${subscription.status}`)
    return
  }

  if (customerId) {
    await db
      .update(barbershops)
      .set({
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        subscriptionStatus: subscription.status,
        subscriptionStart: dates.subscriptionStart,
        subscriptionEnd: dates.subscriptionEnd,
        trialStart: dates.trialStart,
        trialEnd: dates.trialEnd,
        updatedAt: new Date(),
      })
      .where(or(
        eq(barbershops.stripeCustomerId, customerId),
        eq(barbershops.stripeSubscriptionId, subscription.id)
      ))

    console.log(`[stripe/webhook] Assinatura atualizada para customer ${customerId}. Status: ${subscription.status}`)
  }
}

/**
 * Trata o cancelamento da assinatura.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id

  const dates = extractSubscriptionDates(subscription)

  await db
    .update(barbershops)
    .set({
      subscriptionStatus: 'canceled',
      subscriptionEnd: dates.subscriptionEnd,
      updatedAt: new Date(),
    })
    .where(or(
      eq(barbershops.stripeSubscriptionId, subscription.id),
      ...(customerId ? [eq(barbershops.stripeCustomerId, customerId)] : [])
    ))

  console.log(`[stripe/webhook] Assinatura ${subscription.id} marcada como canceled.`)
}

/**
 * Trata fatura paga (invoice.paid ou invoice.payment_succeeded).
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id

  // Extrai o ID da assinatura com suporte a Stripe v22 e versões anteriores
  const invoiceAny = invoice as any
  const subscriptionId =
    (typeof invoiceAny.subscription === 'string' ? invoiceAny.subscription : invoiceAny.subscription?.id) ||
    invoiceAny.subscription_details?.subscription ||
    invoiceAny.parent?.subscription_details?.subscription

  if (subscriptionId && typeof subscriptionId === 'string') {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const dates = extractSubscriptionDates(subscription)

    await db
      .update(barbershops)
      .set({
        subscriptionStatus: subscription.status,
        subscriptionEnd: dates.subscriptionEnd,
        updatedAt: new Date(),
      })
      .where(or(
        eq(barbershops.stripeSubscriptionId, subscriptionId),
        ...(customerId ? [eq(barbershops.stripeCustomerId, customerId)] : [])
      ))

    console.log(`[stripe/webhook] Fatura paga para assinatura ${subscriptionId}. Status: ${subscription.status}`)
    return
  }

  // Se não foi possível obter subscription diretamente, mas temos o customer
  if (customerId) {
    await db
      .update(barbershops)
      .set({
        subscriptionStatus: 'active',
        updatedAt: new Date(),
      })
      .where(eq(barbershops.stripeCustomerId, customerId))

    console.log(`[stripe/webhook] Fatura paga para customer ${customerId}. Status: active`)
  }
}

/**
 * Trata falha no pagamento da fatura (invoice.payment_failed).
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id

  const invoiceAny = invoice as any
  const subscriptionId =
    (typeof invoiceAny.subscription === 'string' ? invoiceAny.subscription : invoiceAny.subscription?.id) ||
    invoiceAny.subscription_details?.subscription ||
    invoiceAny.parent?.subscription_details?.subscription

  await db
    .update(barbershops)
    .set({
      subscriptionStatus: 'past_due',
      updatedAt: new Date(),
    })
    .where(or(
      ...(subscriptionId && typeof subscriptionId === 'string' ? [eq(barbershops.stripeSubscriptionId, subscriptionId)] : []),
      ...(customerId ? [eq(barbershops.stripeCustomerId, customerId)] : [])
    ))

  console.log(`[stripe/webhook] Pagamento de fatura falhou para customer ${customerId}. Status: past_due`)
}

// ─── Utilitários ─────────────────────────────────────────────────────────────

/**
 * Extrai com segurança as datas da assinatura respeitando tanto a SDK v22
 * quanto compatibilidade retroativa.
 */
function extractSubscriptionDates(subscription: Stripe.Subscription) {
  const subAny = subscription as any
  const firstItem = subscription.items?.data?.[0] as any

  const startTimestamp = subscription.start_date ?? subAny.start_date
  const currentPeriodEnd = firstItem?.current_period_end ?? subAny.current_period_end
  const trialStart = subscription.trial_start ?? subAny.trial_start
  const trialEnd = subscription.trial_end ?? subAny.trial_end

  return {
    subscriptionStart: startTimestamp ? new Date(startTimestamp * 1000) : null,
    subscriptionEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
    trialStart: trialStart ? new Date(trialStart * 1000) : null,
    trialEnd: trialEnd ? new Date(trialEnd * 1000) : null,
  }
}
