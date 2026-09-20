'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { db } from '@/lib/db'
import { barbershops } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { ActionResult } from '@/lib/booking/types'

/**
 * Cria uma Stripe Billing Portal Session.
 *
 * Permite que o usuário gerencie sua assinatura diretamente no portal do Stripe:
 *   - Cancelar assinatura
 *   - Atualizar método de pagamento
 *   - Ver histórico de faturas
 *
 * O portal é hospedado pelo Stripe — o Trimly não precisa implementar
 * nenhuma dessas funcionalidades manualmente.
 */
export async function createBillingPortalSession(): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Não autorizado.' }
    }

    const [barbershop] = await db
      .select({ stripeCustomerId: barbershops.stripeCustomerId })
      .from(barbershops)
      .where(eq(barbershops.ownerId, user.id))
      .limit(1)

    if (!barbershop?.stripeCustomerId) {
      return {
        success: false,
        error: 'Nenhuma assinatura encontrada para sua conta.',
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    const session = await stripe.billingPortal.sessions.create({
      customer: barbershop.stripeCustomerId,
      return_url: `${baseUrl}/dashboard/assinatura`,
    })

    return { success: true, data: session.url }
  } catch (err) {
    console.error('[createBillingPortalSession]', err)
    return { success: false, error: 'Erro ao abrir o portal de assinatura.' }
  }
}
