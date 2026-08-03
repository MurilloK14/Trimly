'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { barbershops, appointments } from '@/lib/db/schema'
import { and, eq, gte, lte, ne } from 'drizzle-orm'
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ActionResult } from '@/lib/booking/types'

export interface ReportsData {
  kpis: {
    totalRevenue: number
    totalAppointments: number
    uniqueClients: number
    avgTicket: number
  }
  monthlyRevenue: { month: string; value: number }[]
  weeklyAppointments: { day: string; value: number }[]
  serviceDistribution: { name: string; value: number; color: string }[]
  topServices: { name: string; count: number; revenue: number }[]
}

const COLORS = [
  "oklch(0.78 0.14 75)",
  "oklch(0.65 0.18 160)",
  "oklch(0.60 0.20 280)",
  "oklch(0.65 0.18 30)",
  "oklch(0.55 0 0)",
]

export async function getReportsData(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ActionResult<ReportsData>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
    })
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    const now = new Date()
    let periodStart: Date

    if (period === 'week') {
      periodStart = new Date(now)
      periodStart.setDate(now.getDate() - 6)
    } else if (period === 'month') {
      periodStart = startOfMonth(now)
    } else if (period === 'quarter') {
      periodStart = startOfMonth(subMonths(now, 2))
    } else {
      periodStart = startOfYear(now)
    }

    // Todos os agendamentos do período
    const rows = await db.query.appointments.findMany({
      where: and(
        eq(appointments.barbershopId, shop.id),
        ne(appointments.status, 'cancelled'),
        gte(appointments.startsAt, periodStart),
        lte(appointments.startsAt, now)
      ),
      with: {
        service: true,
      },
    })

    // KPIs
    const totalRevenue = rows.reduce((s, r) => s + r.priceCharged / 100, 0)
    const totalAppointments = rows.length
    const uniqueClients = new Set(rows.map(r => r.clientPhone)).size
    const avgTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0

    // Faturamento mensal (últimos 12 meses para year, senão últimos meses do período)
    const monthsCount = period === 'year' ? 12 : period === 'quarter' ? 3 : 1
    const monthlyRevenue: { month: string; value: number }[] = []

    for (let i = monthsCount - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      const monthLabel = format(monthDate, 'MMM', { locale: ptBR })
      const value = rows
        .filter(r => r.startsAt >= monthStart && r.startsAt <= monthEnd)
        .reduce((s, r) => s + r.priceCharged / 100, 0)
      monthlyRevenue.push({ month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1), value })
    }

    // Agendamentos por dia da semana
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const weeklyMap = new Map<string, number>()
    weekDays.forEach(d => weeklyMap.set(d, 0))
    rows.forEach(r => {
      const day = weekDays[r.startsAt.getDay()]
      weeklyMap.set(day, (weeklyMap.get(day) || 0) + 1)
    })
    const weeklyAppointments = weekDays.map(day => ({ day, value: weeklyMap.get(day) || 0 }))

    // Distribuição de serviços (%)
    const serviceCounts = new Map<string, { count: number; revenue: number }>()
    rows.forEach(r => {
      const name = r.service?.name || 'Outro'
      const current = serviceCounts.get(name) || { count: 0, revenue: 0 }
      serviceCounts.set(name, {
        count: current.count + 1,
        revenue: current.revenue + r.priceCharged / 100,
      })
    })

    const sortedServices = Array.from(serviceCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)

    const total = rows.length || 1
    const serviceDistribution = sortedServices.slice(0, 5).map(([name, data], i) => ({
      name,
      value: Math.round((data.count / total) * 100),
      color: COLORS[i % COLORS.length],
    }))

    const topServices = sortedServices.slice(0, 5).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
    }))

    return {
      success: true,
      data: {
        kpis: { totalRevenue, totalAppointments, uniqueClients, avgTicket },
        monthlyRevenue,
        weeklyAppointments,
        serviceDistribution,
        topServices,
      },
    }
  } catch (err) {
    console.error('[getReportsData]', err)
    return { success: false, error: 'Erro ao carregar relatórios' }
  }
}
