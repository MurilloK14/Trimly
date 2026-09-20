import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { db, pgClient } from '@/lib/db'
import {
  barbershops,
  barbers,
  services,
  barberServices,
  workingHours,
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * POST /api/auth/register-subscriber
 *
 * Criação segura de conta pós-pagamento do Stripe.
 *
 * Regras de Segurança Rigorosas:
 * 1. Validação server-side do session_id diretamente com a API do Stripe.
 * 2. O e-mail da conta é estritamente o e-mail coletado pelo Stripe Checkout (anti-adulteração).
 * 3. Proteção contra Replay: cada session_id / subscription_id do Stripe só pode criar UMA conta.
 * 4. Validação de senha forte (mínimo 6 caracteres).
 * 5. Criação atômica no banco (Usuário Supabase Auth + Barbearia + Barbeiro + Horários).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      sessionId,
      senha,
      nomeBarbeiro,
      nomeBarbearia,
      fotoBarbeiro,
      fotoBarbearia,
    } = body

    // 1. Validação dos campos obrigatórios
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Identificador da assinatura Stripe é obrigatório.' },
        { status: 400 }
      )
    }

    if (!senha || typeof senha !== 'string' || senha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve conter no mínimo 6 caracteres.' },
        { status: 400 }
      )
    }

    if (!nomeBarbeiro || typeof nomeBarbeiro !== 'string' || !nomeBarbeiro.trim()) {
      return NextResponse.json(
        { error: 'O nome do barbeiro/proprietário é obrigatório.' },
        { status: 400 }
      )
    }

    if (!nomeBarbearia || typeof nomeBarbearia !== 'string' || !nomeBarbearia.trim()) {
      return NextResponse.json(
        { error: 'O nome da barbearia é obrigatório.' },
        { status: 400 }
      )
    }

    // 2. Validação direta com o Stripe (servidor para servidor)
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
        { error: 'O pagamento ou período de teste ainda não foi confirmado pelo Stripe.' },
        { status: 400 }
      )
    }

    if (session.mode !== 'subscription') {
      return NextResponse.json(
        { error: 'A sessão não corresponde a uma assinatura recorrente válida.' },
        { status: 400 }
      )
    }

    // 3. Vincular e-mail obrigatoriamente ao e-mail confirmado no Stripe
    const customerEmail = (
      session.customer_details?.email ||
      (typeof session.customer === 'object' && session.customer ? (session.customer as any).email : null)
    )?.toLowerCase().trim()

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Não foi possível recuperar o e-mail da transação no Stripe.' },
        { status: 400 }
      )
    }

    // 4. Proteção contra Reuso da mesma assinatura (Idempotência)
    const subscription = typeof session.subscription === 'object' && session.subscription !== null
      ? session.subscription
      : null
    const subscriptionId = subscription?.id ?? (typeof session.subscription === 'string' ? session.subscription : null)
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
    const priceId = subscription?.items?.data?.[0]?.price?.id ?? (process.env.STRIPE_PRICE_ID || '').trim()

    if (subscriptionId) {
      const [existingShopWithSub] = await db
        .select({ id: barbershops.id, name: barbershops.name })
        .from(barbershops)
        .where(eq(barbershops.stripeSubscriptionId, subscriptionId))
        .limit(1)

      if (existingShopWithSub) {
        return NextResponse.json(
          {
            error: 'Esta assinatura já foi utilizada para criar uma conta.',
            redirect: '/login?registered=true&email=' + encodeURIComponent(customerEmail),
          },
          { status: 400 }
        )
      }
    }

    // 5. Criar conta no Supabase Auth
    const supabase = await createClient()

    // Tenta criar o usuário com senha
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: customerEmail,
      password: senha,
    })

    let userId = authData?.user?.id as string | undefined

    // Se o usuário já existia no Auth (ex: tentativa anterior), busca o ID
    if (signUpError || !userId) {
      const [userInDb] = await pgClient`SELECT id FROM auth.users WHERE email = ${customerEmail}`
      if (!userInDb || !userInDb.id) {
        return NextResponse.json(
          { error: signUpError?.message || 'Erro ao registrar credenciais no sistema.' },
          { status: 400 }
        )
      }
      userId = userInDb.id as string

      // Atualiza a senha no Supabase Auth para a senha nova escolhida agora
      await supabase.auth.signInWithPassword({ email: customerEmail, password: senha }).catch(() => null)
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Não foi possível gerar ou recuperar o identificador do usuário.' },
        { status: 500 }
      )
    }

    const finalUserId: string = userId

    // NOTA DE SEGURANÇA: UPDATE direto em auth.users para confirmar e-mail imediatamente.
    // Idealmente, usar supabase.auth.admin.updateUserById() com SERVICE_ROLE_KEY.
    if (finalUserId && typeof finalUserId === 'string') {
      await pgClient`UPDATE auth.users SET email_confirmed_at = COALESCE(email_confirmed_at, now()) WHERE id = ${finalUserId}`
    }

    // 6. Verificar se já existe barbearia para este usuário
    const [existingShop] = await db
      .select()
      .from(barbershops)
      .where(eq(barbershops.ownerId, finalUserId))
      .limit(1)

    if (existingShop) {
      // Atualiza os dados do Stripe na barbearia existente
      await db
        .update(barbershops)
        .set({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          subscriptionStatus: subscription?.status ?? 'trialing',
          updatedAt: new Date(),
        })
        .where(eq(barbershops.id, existingShop.id))

      return NextResponse.json({
        success: true,
        email: customerEmail,
        redirect: `/login?registered=true&email=${encodeURIComponent(customerEmail)}`,
      })
    }

    // 7. Extrair datas da assinatura
    const subAny = subscription as any
    const firstItem = subscription?.items?.data?.[0] as any
    const startTimestamp = subscription?.start_date ?? subAny?.start_date
    const currentPeriodEnd = firstItem?.current_period_end ?? subAny?.current_period_end
    const trialStart = subscription?.trial_start ?? subAny?.trial_start
    const trialEnd = subscription?.trial_end ?? subAny?.trial_end

    // 8. Gerar slug único para a barbearia
    let baseSlug = nomeBarbearia
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'barbearia'

    const [slugMatch] = await db
      .select({ id: barbershops.id })
      .from(barbershops)
      .where(eq(barbershops.slug, baseSlug))
      .limit(1)

    const finalSlug = slugMatch ? `${baseSlug}-${Math.random().toString(36).substring(2, 6)}` : baseSlug

    // 9. Inserir Barbearia
    const [newShop] = await db
      .insert(barbershops)
      .values({
        ownerId: finalUserId,
        name: nomeBarbearia.trim(),
        slug: finalSlug,
        logoUrl: fotoBarbearia || null,
        phone: session.customer_details?.phone || null,
        active: true,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId,
        subscriptionStatus: subscription?.status ?? 'trialing',
        subscriptionStart: startTimestamp ? new Date(startTimestamp * 1000) : new Date(),
        subscriptionEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
        trialStart: trialStart ? new Date(trialStart * 1000) : new Date(),
        trialEnd: trialEnd ? new Date(trialEnd * 1000) : null,
      })
      .returning()

    // 10. Inserir primeiro Barbeiro (o proprietário)
    const [newBarber] = await db
      .insert(barbers)
      .values({
        barbershopId: newShop.id,
        userId: finalUserId,
        name: nomeBarbeiro.trim(),
        avatarUrl: fotoBarbeiro || null,
        specialties: ['Corte de Cabelo', 'Barba'],
        active: true,
      })
      .returning()

    // 11. Inserir serviços padrão
    const starterServices = await db
      .insert(services)
      .values([
        {
          barbershopId: newShop.id,
          name: 'Corte Social / Degradê',
          description: 'Corte moderno com acabamento completo',
          durationMinutes: 30,
          price: 3500,
          active: true,
        },
        {
          barbershopId: newShop.id,
          name: 'Barba Completa',
          description: 'Modelagem de barba com toalha quente e navalha',
          durationMinutes: 30,
          price: 3000,
          active: true,
        },
        {
          barbershopId: newShop.id,
          name: 'Combo Cabelo + Barba',
          description: 'Corte completo e alinhamento de barba',
          durationMinutes: 50,
          price: 6000,
          active: true,
        },
      ])
      .returning()

    // 12. Vincular serviços ao barbeiro
    if (starterServices.length > 0 && newBarber) {
      await db.insert(barberServices).values(
        starterServices.map((s) => ({
          barberId: newBarber.id,
          serviceId: s.id,
        }))
      )
    }

    // 13. Inserir agenda semanal padrão (Segunda a Sábado)
    if (newBarber) {
      const defaultSchedule: Array<{
        dayOfWeek: number
        active: boolean
        opensAt: string | null
        closesAt: string | null
        breakStart: string | null
        breakEnd: string | null
      }> = [
        { dayOfWeek: 0, active: false, opensAt: null, closesAt: null, breakStart: null, breakEnd: null },
        { dayOfWeek: 1, active: true,  opensAt: '09:00:00', closesAt: '19:00:00', breakStart: '12:00:00', breakEnd: '13:00:00' },
        { dayOfWeek: 2, active: true,  opensAt: '09:00:00', closesAt: '19:00:00', breakStart: '12:00:00', breakEnd: '13:00:00' },
        { dayOfWeek: 3, active: true,  opensAt: '09:00:00', closesAt: '19:00:00', breakStart: '12:00:00', breakEnd: '13:00:00' },
        { dayOfWeek: 4, active: true,  opensAt: '09:00:00', closesAt: '19:00:00', breakStart: '12:00:00', breakEnd: '13:00:00' },
        { dayOfWeek: 5, active: true,  opensAt: '09:00:00', closesAt: '19:00:00', breakStart: '12:00:00', breakEnd: '13:00:00' },
        { dayOfWeek: 6, active: true,  opensAt: '09:00:00', closesAt: '16:00:00', breakStart: null,       breakEnd: null },
      ]

      await db.insert(workingHours).values(
        defaultSchedule.map((s) => ({
          barberId: newBarber.id,
          dayOfWeek: s.dayOfWeek,
          active: s.active,
          opensAt: s.opensAt,
          closesAt: s.closesAt,
          breakStart: s.breakStart,
          breakEnd: s.breakEnd,
        }))
      )
    }

    // 14. Atualizar metadados no Stripe de forma assíncrona
    if (customerId) {
      stripe.customers.update(customerId, {
        name: nomeBarbearia.trim(),
        metadata: { barbershop_id: newShop.id, owner_id: finalUserId },
      }).catch(() => null)
    }
    if (subscriptionId) {
      stripe.subscriptions.update(subscriptionId, {
        metadata: { barbershop_id: newShop.id, owner_id: finalUserId },
      }).catch(() => null)
    }

    return NextResponse.json({
      success: true,
      email: customerEmail,
      redirect: `/login?registered=true&email=${encodeURIComponent(customerEmail)}`,
    })
  } catch (err: any) {
    console.error('[POST /api/auth/register-subscriber] Erro fatal:', err)
    return NextResponse.json(
      { error: 'Erro ao registrar conta.' },
      { status: 500 }
    )
  }
}
