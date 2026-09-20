'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { db } from '@/lib/db'
import { barbershops } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { ActionResult } from '@/lib/booking/types'

const TRIAL_PERIOD_DAYS = 14

/**
 * Cria uma Stripe Checkout Session para o plano mensal do Trimly.
 *
 * Fluxo:
 *   1. Verifica autenticação via Supabase
 *   2. Busca a barbearia do usuário logado
 *   3. Cria ou reutiliza um Stripe Customer
 *   4. Cria a Checkout Session com trial de 14 dias
 *   5. Retorna a URL de redirecionamento para o Stripe Checkout
 *
 * Segurança:
 *   - Toda lógica ocorre no servidor
 *   - O frontend recebe apenas a URL de redirecionamento
 *   - Nenhum dado de cartão transita pelo Trimly
 */
export async function createCheckoutSession(): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Você precisa estar logado para assinar.' }
    }

    // Busca a barbearia do usuário
    const [barbershop] = await db
      .select()
      .from(barbershops)
      .where(eq(barbershops.ownerId, user.id))
      .limit(1)

    if (!barbershop) {
      return {
        success: false,
        error: 'Barbearia não encontrada. Conclua o cadastro antes de assinar.',
      }
    }

    // Se já tem assinatura ativa, não cria nova sessão
    if (
      barbershop.subscriptionStatus === 'active' ||
      barbershop.subscriptionStatus === 'trialing'
    ) {
      return { success: false, error: 'Você já possui uma assinatura ativa.' }
    }

    // Cria ou reutiliza o Stripe Customer
    let customerId = barbershop.stripeCustomerId ?? undefined

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: barbershop.name,
        metadata: {
          barbershop_id: barbershop.id,
          owner_id: user.id,
        },
      })
      customerId = customer.id

      // Persiste o customer_id imediatamente para evitar duplicatas
      await db
        .update(barbershops)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(barbershops.id, barbershop.id))
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    // Cria a Checkout Session
    // payment_method_collection: 'always' → coleta cartão antes do trial
    // Necessário para que a cobrança automática funcione ao final dos 14 dias.
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: TRIAL_PERIOD_DAYS,
        metadata: {
          barbershop_id: barbershop.id,
          owner_id: user.id,
        },
      },
      payment_method_collection: 'always',
      allow_promotion_codes: true,
      success_url: `${baseUrl}/assinar/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/assinar/cancelado`,
      locale: 'pt-BR',
      metadata: {
        barbershop_id: barbershop.id,
        owner_id: user.id,
      },
    })

    if (!session.url) {
      return { success: false, error: 'Erro ao iniciar o checkout. Tente novamente.' }
    }

    return { success: true, data: session.url }
  } catch (err) {
    console.error('[createCheckoutSession]', err)
    return { success: false, error: 'Erro ao conectar com o sistema de pagamentos.' }
  }
}
