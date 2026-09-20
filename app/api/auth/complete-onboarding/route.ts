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
 * POST /api/auth/complete-onboarding
 *
 * Finaliza o processo de onboarding após a conclusão do Stripe Checkout.
 * Cria o usuário no Supabase Auth, insere a barbearia, o barbeiro, os serviços
 * e horários padrão e inicia a sessão autenticada.
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

    // 1. Validações básicas dos dados de entrada
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Sessão de pagamento inválida.' }, { status: 400 })
    }
    if (!senha || typeof senha !== 'string' || senha.length < 6) {
      return NextResponse.json({ error: 'A senha deve conter no mínimo 6 caracteres.' }, { status: 400 })
    }
    if (!nomeBarbeiro || typeof nomeBarbeiro !== 'string' || !nomeBarbeiro.trim()) {
      return NextResponse.json({ error: 'Informe seu nome.' }, { status: 400 })
    }
    if (!nomeBarbearia || typeof nomeBarbearia !== 'string' || !nomeBarbearia.trim()) {
      return NextResponse.json({ error: 'Informe o nome da sua barbearia.' }, { status: 400 })
    }

    // 2. Validar sessão com o Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    })

    if (!session || session.status !== 'complete') {
      return NextResponse.json(
        { error: 'A assinatura no Stripe ainda não foi concluída. Tente novamente.' },
        { status: 400 }
      )
    }

    const email = (
      session.customer_details?.email ||
      (typeof session.customer === 'object' && session.customer ? (session.customer as any).email : null)
    )?.toLowerCase().trim()

    if (!email) {
      return NextResponse.json(
        { error: 'Não foi possível identificar o e-mail cadastrado no Stripe.' },
        { status: 400 }
      )
    }

    // 3. Criar ou autenticar usuário no Supabase Auth
    const supabase = await createClient()

    // Tenta registrar o usuário
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
    })

    // Se já estiver registrado ou falhar, tentamos logar com a senha fornecida
    if (signUpError) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

      if (signInError) {
        return NextResponse.json(
          { error: 'Erro na criação da conta. Verifique seus dados e tente novamente.' },
          { status: 400 }
        )
      }
    }

    // NOTA DE SEGURANÇA: UPDATE direto em auth.users para confirmar e-mail imediatamente.
    // Isso contorna triggers do GoTrue. Idealmente, usar supabase.auth.admin.updateUserById()
    // com a SERVICE_ROLE_KEY em vez do pgClient direto. Manter apenas se confirmação
    // instantânea for requisito de negócio e SERVICE_ROLE_KEY não estiver disponível.
    if (email && typeof email === 'string') {
      await pgClient`UPDATE auth.users SET email_confirmed_at = COALESCE(email_confirmed_at, now()) WHERE email = ${email}`
    }

    // Garante sessão ativa no cliente Supabase
    await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não foi possível autenticar o usuário após o cadastro.' },
        { status: 500 }
      )
    }

    // 4. Verificar se a barbearia deste usuário já foi criada
    const [existingShop] = await db
      .select()
      .from(barbershops)
      .where(eq(barbershops.ownerId, user.id))
      .limit(1)

    if (existingShop) {
      return NextResponse.json({ success: true, redirect: '/dashboard' })
    }

    // 5. Extrair dados da assinatura Stripe
    const subscription = typeof session.subscription === 'object' && session.subscription !== null
      ? session.subscription
      : null
    const subscriptionId = subscription?.id ?? (typeof session.subscription === 'string' ? session.subscription : null)
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
    const priceId = subscription?.items?.data?.[0]?.price?.id ?? (process.env.STRIPE_PRICE_ID || '').trim()

    const subAny = subscription as any
    const firstItem = subscription?.items?.data?.[0] as any
    const startTimestamp = subscription?.start_date ?? subAny?.start_date
    const currentPeriodEnd = firstItem?.current_period_end ?? subAny?.current_period_end
    const trialStart = subscription?.trial_start ?? subAny?.trial_start
    const trialEnd = subscription?.trial_end ?? subAny?.trial_end

    // 6. Gerar slug único
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

    // 7. Criar barbearia
    const [newShop] = await db
      .insert(barbershops)
      .values({
        ownerId: user.id,
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

    // 8. Criar primeiro barbeiro (o proprietário)
    const [newBarber] = await db
      .insert(barbers)
      .values({
        barbershopId: newShop.id,
        userId: user.id,
        name: nomeBarbeiro.trim(),
        avatarUrl: fotoBarbeiro || null,
        specialties: ['Corte de Cabelo', 'Barba'],
        active: true,
      })
      .returning()

    // 9. Criar serviços padrão para começar imediatamente
    const starterServices = await db
      .insert(services)
      .values([
        {
          barbershopId: newShop.id,
          name: 'Corte Social / Degradê',
          description: 'Corte moderno com acabamento completo',
          durationMinutes: 30,
          price: 3500, // R$ 35,00
          active: true,
        },
        {
          barbershopId: newShop.id,
          name: 'Barba Completa',
          description: 'Modelagem de barba com toalha quente e navalha',
          durationMinutes: 30,
          price: 3000, // R$ 30,00
          active: true,
        },
        {
          barbershopId: newShop.id,
          name: 'Combo Cabelo + Barba',
          description: 'Corte completo e alinhamento de barba',
          durationMinutes: 50,
          price: 6000, // R$ 60,00
          active: true,
        },
      ])
      .returning()

    // 10. Vincular serviços ao barbeiro
    if (starterServices.length > 0 && newBarber) {
      await db.insert(barberServices).values(
        starterServices.map((s) => ({
          barberId: newBarber.id,
          serviceId: s.id,
        }))
      )
    }

    // 11. Criar horários de funcionamento padrão (Seg a Sex: 09h às 19h, Sáb: 09h às 16h)
    if (newBarber) {
      const defaultSchedule = [
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

    // 12. Atualizar metadados do Stripe de forma assíncrona
    if (customerId) {
      stripe.customers.update(customerId, {
        name: nomeBarbearia.trim(),
        metadata: { barbershop_id: newShop.id, owner_id: user.id },
      }).catch((e) => console.error('[complete-onboarding] Stripe customer update:', e))
    }
    if (subscriptionId) {
      stripe.subscriptions.update(subscriptionId, {
        metadata: { barbershop_id: newShop.id, owner_id: user.id },
      }).catch((e) => console.error('[complete-onboarding] Stripe sub update:', e))
    }

    return NextResponse.json({ success: true, redirect: '/dashboard' })
  } catch (err: any) {
    console.error('[POST /api/auth/complete-onboarding] Erro fatal:', err)
    return NextResponse.json(
      { error: 'Erro ao concluir o onboarding da barbearia.' },
      { status: 500 }
    )
  }
}
