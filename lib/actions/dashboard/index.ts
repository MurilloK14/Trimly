'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import {
  barbershops,
  barbers,
  services,
  appointments,
} from '@/lib/db/schema'
import { and, eq, gte, lte, ne } from 'drizzle-orm'
import { format } from 'date-fns'

export interface DashboardData {
  barbershop: {
    id: string
    name: string
    slug: string
  }
  stats: {
    faturamentoHoje: number
    agendamentosHoje: number
    novosClientes: number
    taxaOcupacao: number
  }
  revenueData: { name: string; value: number }[]
  servicesData: { name: string; value: number }[]
  upcomingAppointments: {
    id: string
    client: string
    service: string
    time: string
    avatar: string
  }[]
  recentAppointments: {
    id: string
    client: string
    service: string
    time: string
    status: 'pending' | 'confirmed' | 'cancelled'
    value: number
  }[]
}

export async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    // Busca a barbearia pelo ownerId
    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
    })

    if (!shop) {
      return null
    }

    const now = new Date()
    const todayStr = format(now, 'yyyy-MM-dd')
    const startOfDay = new Date(`${todayStr}T00:00:00-03:00`)
    const endOfDay = new Date(`${todayStr}T23:59:59-03:00`)

    // Buscar agendamentos de hoje
    const todayAppointments = await db.query.appointments.findMany({
      where: and(
        eq(appointments.barbershopId, shop.id),
        gte(appointments.startsAt, startOfDay),
        lte(appointments.startsAt, endOfDay)
      ),
      with: {
        barber: true,
        service: true,
      },
      orderBy: (a, { asc }) => [asc(a.startsAt)],
    })

    // 1. Faturamento de hoje (apenas confirmados)
    const confirmedToday = todayAppointments.filter(a => a.status === 'confirmed')
    const faturamentoHoje = confirmedToday.reduce((sum, a) => sum + a.priceCharged, 0) / 100

    // 2. Total de agendamentos de hoje (confirmados)
    const agendamentosHoje = confirmedToday.length

    // 3. Novos/Total de clientes (clientes únicos históricos)
    const allAppointments = await db.query.appointments.findMany({
      where: eq(appointments.barbershopId, shop.id),
      columns: {
        clientPhone: true,
      },
    })
    const uniquePhones = new Set(allAppointments.map(a => a.clientPhone))
    const novosClientes = uniquePhones.size

    // 4. Taxa de ocupação hoje
    const activeBarbers = await db.query.barbers.findMany({
      where: and(eq(barbers.barbershopId, shop.id), eq(barbers.active, true)),
    })
    const totalDurationMinutes = confirmedToday.reduce((sum, a) => sum + (a.service?.durationMinutes || 30), 0)
    const totalAvailableMinutes = activeBarbers.length * 8 * 60 // 8 horas por barbeiro ativo
    const taxaOcupacao = totalAvailableMinutes > 0 ? Math.round((totalDurationMinutes / totalAvailableMinutes) * 100) : 0

    // 5. Faturamento semanal (últimos 7 dias)
    const sevenDaysAgo = new Date(startOfDay.getTime() - 6 * 24 * 60 * 60 * 1000)
    const weekAppointments = await db.query.appointments.findMany({
      where: and(
        eq(appointments.barbershopId, shop.id),
        gte(appointments.startsAt, sevenDaysAgo),
        lte(appointments.startsAt, endOfDay),
        ne(appointments.status, 'cancelled')
      ),
      with: {
        service: true,
      },
    })

    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const revenueMap = new Map<string, number>()

    // Preenche os últimos 7 dias com 0 para garantir que todos apareçam no gráfico
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
      revenueMap.set(daysOfWeek[d.getDay()], 0)
    }

    weekAppointments.forEach(a => {
      const dayName = daysOfWeek[a.startsAt.getDay()]
      if (revenueMap.has(dayName)) {
        revenueMap.set(dayName, revenueMap.get(dayName)! + (a.priceCharged / 100))
      }
    })

    const revenueData = Array.from(revenueMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))

    // 6. Serviços populares
    const serviceCounts = new Map<string, number>()
    weekAppointments.forEach(a => {
      const name = a.service?.name || 'Outro'
      serviceCounts.set(name, (serviceCounts.get(name) || 0) + 1)
    })

    const servicesData = Array.from(serviceCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // 7. Próximos agendamentos (hoje a partir de agora)
    const upcomingAppointments = todayAppointments
      .filter(a => a.startsAt >= now && a.status === 'confirmed')
      .map(a => ({
        id: a.id,
        client: a.clientName,
        service: a.service?.name || 'Corte',
        time: format(a.startsAt, 'HH:mm'),
        avatar: a.barber?.name || 'barber',
      }))

    // 8. Atividades recentes (últimos 5 agendamentos gerais)
    const recentAppointmentsQuery = await db.query.appointments.findMany({
      where: eq(appointments.barbershopId, shop.id),
      with: {
        service: true,
      },
      orderBy: (a, { desc }) => [desc(a.startsAt)],
      limit: 5,
    })

    const recentAppointments = recentAppointmentsQuery.map(a => ({
      id: a.id,
      client: a.clientName,
      service: a.service?.name || 'Serviço',
      time: format(a.startsAt, 'dd/MM HH:mm'),
      status: a.status as 'pending' | 'confirmed' | 'cancelled',
      value: a.priceCharged / 100,
    }))

    return {
      barbershop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
      },
      stats: {
        faturamentoHoje,
        agendamentosHoje,
        novosClientes,
        taxaOcupacao,
      },
      revenueData,
      servicesData,
      upcomingAppointments,
      recentAppointments,
    }
  } catch (err) {
    console.error('[getDashboardData]', err)
    return null
  }
}
