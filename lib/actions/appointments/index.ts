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
import { toTimezoneDate } from '@/lib/booking/availability'
import type { ActionResult } from '@/lib/booking/types'

export interface AdminAppointment {
  id: string
  clientName: string
  clientPhone: string
  clientEmail: string | null
  serviceName: string
  barberName: string
  startsAt: string
  endsAt: string
  time: string
  duration: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  avatar: string
  value: number
}

// Retorna os agendamentos de uma data específica para a barbearia do administrador logado
export async function getAdminAppointments(dateStr: string): Promise<ActionResult<AdminAppointment[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
    })
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    const startOfDay = new Date(`${dateStr}T00:00:00-03:00`)
    const endOfDay = new Date(`${dateStr}T23:59:59-03:00`)

    const rows = await db.query.appointments.findMany({
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

    const data: AdminAppointment[] = rows.map(r => ({
      id: r.id,
      clientName: r.clientName,
      clientPhone: r.clientPhone,
      clientEmail: r.clientEmail,
      serviceName: r.service?.name || 'Serviço',
      barberName: r.barber?.name || 'Barbeiro',
      startsAt: r.startsAt.toISOString(),
      endsAt: r.endsAt.toISOString(),
      time: format(r.startsAt, 'HH:mm'),
      duration: r.service?.durationMinutes || 30,
      status: r.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
      avatar: r.barber?.name || 'default',
      value: r.priceCharged / 100,
    }))

    return { success: true, data }
  } catch (err) {
    console.error('[getAdminAppointments]', err)
    return { success: false, error: 'Erro ao carregar agendamentos' }
  }
}

// Atualiza o status de um agendamento
export async function updateAppointmentStatus(
  id: string,
  status: 'confirmed' | 'cancelled' | 'completed'
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    const updateFields: any = { status }

    if (status === 'cancelled') {
      updateFields.cancelledBy = user.id
      updateFields.cancelledAt = new Date()
    }

    await db
      .update(appointments)
      .set(updateFields)
      .where(eq(appointments.id, id))

    return { success: true, data: undefined }
  } catch (err) {
    console.error('[updateAppointmentStatus]', err)
    return { success: false, error: 'Erro ao atualizar agendamento' }
  }
}

export interface BookingResources {
  barbers: { id: string; name: string }[]
  services: { id: string; name: string; price: number; durationMinutes: number }[]
}

// Busca barbeiros e serviços para preencher o formulário de agendamento manual do admin
export async function getAdminBookingResources(): Promise<ActionResult<BookingResources>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
    })
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    const activeBarbers = await db.query.barbers.findMany({
      where: and(eq(barbers.barbershopId, shop.id), eq(barbers.active, true)),
      columns: { id: true, name: true },
    })

    const activeServices = await db.query.services.findMany({
      where: and(eq(services.barbershopId, shop.id), eq(services.active, true)),
      columns: { id: true, name: true, price: true, durationMinutes: true },
    })

    return {
      success: true,
      data: {
        barbers: activeBarbers,
        services: activeServices.map(s => ({
          id: s.id,
          name: s.name,
          price: s.price / 100,
          durationMinutes: s.durationMinutes,
        })),
      },
    }
  } catch (err) {
    console.error('[getAdminBookingResources]', err)
    return { success: false, error: 'Erro ao carregar recursos de agendamento' }
  }
}

// Cria um agendamento direto pelo painel administrativo
export async function createAdminAppointment(input: {
  barberId: string
  serviceId: string
  clientName: string
  clientPhone: string
  date: string
  time: string
}): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
    })
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    const service = await db.query.services.findFirst({
      where: and(eq(services.id, input.serviceId), eq(services.barbershopId, shop.id)),
    })
    if (!service) return { success: false, error: 'Serviço não encontrado' }

    const startsAt = toTimezoneDate(input.date, input.time)
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000)

    await db.insert(appointments).values({
      barbershopId: shop.id,
      barberId: input.barberId,
      serviceId: input.serviceId,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      startsAt,
      endsAt,
      status: 'confirmed',
      priceCharged: service.price,
    })

    return { success: true, data: undefined }
  } catch (err) {
    console.error('[createAdminAppointment]', err)
    return { success: false, error: 'Erro ao criar agendamento' }
  }
}

// Retorna as datas que contêm pelo menos um agendamento ativo no intervalo
export async function getAppointmentsDatesWithActivity(
  startDateStr: string,
  endDateStr: string
): Promise<ActionResult<string[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
    })
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    const start = new Date(`${startDateStr}T00:00:00-03:00`)
    const end = new Date(`${endDateStr}T23:59:59-03:00`)

    const rows = await db.query.appointments.findMany({
      where: and(
        eq(appointments.barbershopId, shop.id),
        gte(appointments.startsAt, start),
        lte(appointments.startsAt, end),
        ne(appointments.status, 'cancelled')
      ),
      columns: {
        startsAt: true,
      },
    })

    // Retorna as datas formatadas YYYY-MM-DD
    const dates = Array.from(new Set(rows.map(r => format(r.startsAt, 'yyyy-MM-dd'))))

    return { success: true, data: dates }
  } catch (err) {
    console.error('[getAppointmentsDatesWithActivity]', err)
    return { success: false, error: 'Erro ao verificar atividade de calendário' }
  }
}

export interface DetailedAdminAppointment extends AdminAppointment {
  dateFormatted: string
}

// Retorna TODOS os agendamentos da barbearia ordenados cronologicamente por data e horário
export async function getAllAdminAppointments(
  order: 'asc' | 'desc' = 'asc'
): Promise<ActionResult<DetailedAdminAppointment[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
    })
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    const rows = await db.query.appointments.findMany({
      where: eq(appointments.barbershopId, shop.id),
      with: {
        barber: true,
        service: true,
      },
      orderBy: (a, { asc, desc }) => [order === 'asc' ? asc(a.startsAt) : desc(a.startsAt)],
    })

    const data: DetailedAdminAppointment[] = rows.map(r => ({
      id: r.id,
      clientName: r.clientName,
      clientPhone: r.clientPhone,
      clientEmail: r.clientEmail,
      serviceName: r.service?.name || 'Serviço',
      barberName: r.barber?.name || 'Barbeiro',
      startsAt: r.startsAt.toISOString(),
      endsAt: r.endsAt.toISOString(),
      dateFormatted: format(r.startsAt, 'dd/MM/yyyy'),
      time: format(r.startsAt, 'HH:mm'),
      duration: r.service?.durationMinutes || 30,
      status: r.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
      avatar: r.barber?.name || 'default',
      value: r.priceCharged / 100,
    }))

    return { success: true, data }
  } catch (err) {
    console.error('[getAllAdminAppointments]', err)
    return { success: false, error: 'Erro ao carregar lista completa de agendamentos' }
  }
}

export interface NotificationItem {
  id: string
  clientName: string
  serviceName: string
  barberName: string
  dateFormatted: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAtFormatted: string
}

// Retorna os últimos 5 agendamentos realizados para exibir no sino de notificações
export async function getRecentNotifications(): Promise<ActionResult<NotificationItem[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
    })
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    const rows = await db.query.appointments.findMany({
      where: eq(appointments.barbershopId, shop.id),
      with: {
        barber: true,
        service: true,
      },
      orderBy: (a, { desc }) => [desc(a.createdAt)],
      limit: 6,
    })

    const data: NotificationItem[] = rows.map(r => ({
      id: r.id,
      clientName: r.clientName,
      serviceName: r.service?.name || 'Serviço',
      barberName: r.barber?.name || 'Barbeiro',
      dateFormatted: format(r.startsAt, 'dd/MM'),
      time: format(r.startsAt, 'HH:mm'),
      status: r.status as any,
      createdAtFormatted: format(r.createdAt, 'dd/MM - HH:mm'),
    }))

    return { success: true, data }
  } catch (err) {
    console.error('[getRecentNotifications]', err)
    return { success: false, error: 'Erro ao carregar notificações' }
  }
}


