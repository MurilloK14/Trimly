import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { db } from '@/lib/db'
import { barbershops } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * POST /api/stripe/sync-session
 *
 * Endpoint de sincronização imediata pós-checkout.
 * Chamado pela página /assinar/sucesso para garantir que o status da assinatura
 * seja atualizado no banco mesmo se o webhook ainda não tiver chegado ou se
 * o Stripe CLI não estiver rodando no ambiente de desenvolvimento local.
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Session ID é obrigatório' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Busca a sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    if (!session || session.status !== 'complete') {
      return NextResponse.json({ error: 'Sessão ainda não concluída' }, { status: 400 })
    }

    // Validação de segurança: a sessão precisa pertencer ao usuário logado
    const ownerId = session.metadata?.owner_id
    const barbershopId = session.metadata?.barbershop_id

    if (ownerId && ownerId !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const subscription = typeof session.subscription === 'object' && session.subscription !== null
      ? session.subscription
      : null

    const status = subscription?.status ?? 'trialing'
    const subscriptionId = subscription?.id ?? (typeof session.subscription === 'string' ? session.subscription : null)
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
    const priceId = subscription?.items?.data?.[0]?.price?.id ?? null

    const subAny = subscription as any
    const firstItem = subscription?.items?.data?.[0] as any

    const startTimestamp = subscription?.start_date ?? subAny?.start_date
    const currentPeriodEnd = firstItem?.current_period_end ?? subAny?.current_period_end
    const trialStart = subscription?.trial_start ?? subAny?.trial_start
    const trialEnd = subscription?.trial_end ?? subAny?.trial_end

    // Atualiza a barbearia no banco
    if (barbershopId) {
      await db
        .update(barbershops)
        .set({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          subscriptionStatus: status,
          subscriptionStart: startTimestamp ? new Date(startTimestamp * 1000) : new Date(),
          subscriptionEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
          trialStart: trialStart ? new Date(trialStart * 1000) : new Date(),
          trialEnd: trialEnd ? new Date(trialEnd * 1000) : null,
          updatedAt: new Date(),
        })
        .where(eq(barbershops.id, barbershopId))
    }

    return NextResponse.json({ success: true, status })
  } catch (err: any) {
    console.error('[POST /api/stripe/sync-session] Erro ao sincronizar:', err)
    return NextResponse.json({ error: 'Erro ao sincronizar assinatura.' }, { status: 500 })
  }
}
