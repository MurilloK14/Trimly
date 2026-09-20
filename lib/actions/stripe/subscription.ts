'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { barbershops } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { SubscriptionStatus } from '@/lib/stripe/access'
import type { ActionResult } from '@/lib/booking/types'

export interface SubscriptionInfo {
  status: SubscriptionStatus
  trialEnd: Date | null
  subscriptionEnd: Date | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

/**
 * Retorna as informações de assinatura do usuário logado.
 *
 * Usado para exibir o estado atual na página /dashboard/assinatura.
 * NÃO usar para controlar acesso — use o middleware para isso.
 */
export async function getSubscriptionInfo(): Promise<ActionResult<SubscriptionInfo>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Não autorizado.' }
    }

    const [barbershop] = await db
      .select({
        subscriptionStatus:   barbershops.subscriptionStatus,
        trialEnd:             barbershops.trialEnd,
        subscriptionEnd:      barbershops.subscriptionEnd,
        stripeCustomerId:     barbershops.stripeCustomerId,
        stripeSubscriptionId: barbershops.stripeSubscriptionId,
      })
      .from(barbershops)
      .where(eq(barbershops.ownerId, user.id))
      .limit(1)

    if (!barbershop) {
      return { success: false, error: 'Barbearia não encontrada.' }
    }

    return {
      success: true,
      data: {
        status: (barbershop.subscriptionStatus as SubscriptionStatus) ?? null,
        trialEnd: barbershop.trialEnd ?? null,
        subscriptionEnd: barbershop.subscriptionEnd ?? null,
        stripeCustomerId: barbershop.stripeCustomerId ?? null,
        stripeSubscriptionId: barbershop.stripeSubscriptionId ?? null,
      },
    }
  } catch (err) {
    console.error('[getSubscriptionInfo]', err)
    return { success: false, error: 'Erro ao buscar informações da assinatura.' }
  }
}
