import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { db } from '@/lib/db'
import { barbershops } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/stripe/session-info?session_id=cs_...
 *
 * Valida a Checkout Session do Stripe após o pagamento/trial ser concluído.
 * Retorna os dados do cliente para preencher a tela de Onboarding.
 *
 * Segurança: Requer autenticação via Supabase.
 */
export async function GET(req: NextRequest) {
  try {
    // Verificação de autenticação
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Parâmetro session_id não informado.' },
        { status: 400 }
      )
    }

    // Busca a sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Sessão de pagamento não encontrada no Stripe.' },
        { status: 404 }
      )
    }

    if (session.status !== 'complete') {
      return NextResponse.json(
        { error: 'A assinatura ainda não foi concluída no Stripe.', status: session.status },
        { status: 400 }
      )
    }

    const subscription = typeof session.subscription === 'object' && session.subscription !== null
      ? session.subscription
      : null
    const subscriptionId = subscription?.id ?? (typeof session.subscription === 'string' ? session.subscription : null)

    // Verifica se esta sessão já foi utilizada para criar uma barbearia
    if (subscriptionId) {
      const [existingShop] = await db
        .select({ id: barbershops.id, name: barbershops.name })
        .from(barbershops)
        .where(eq(barbershops.stripeSubscriptionId, subscriptionId))
        .limit(1)

      if (existingShop) {
        return NextResponse.json({
          valid: true,
          alreadyCompleted: true,
          message: 'Esta assinatura já foi configurada para a barbearia ' + existingShop.name,
        })
      }
    }

    const email =
      session.customer_details?.email ||
      (typeof session.customer === 'object' && session.customer ? (session.customer as any).email : null) ||
      ''

    const customerName =
      session.customer_details?.name ||
      (typeof session.customer === 'object' && session.customer ? (session.customer as any).name : null) ||
      ''

    return NextResponse.json({
      valid: true,
      alreadyCompleted: false,
      email,
      customerName,
      subscriptionId,
      customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
      trialEnd: subscription?.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    })
  } catch (err: any) {
    console.error('[GET /api/stripe/session-info] Erro:', err)
    return NextResponse.json(
      { error: 'Erro ao validar sessão.' },
      { status: 500 }
    )
  }
}
