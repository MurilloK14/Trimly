'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import {
  barbershops,
  barbers,
  services,
  barberServices,
  workingHours,
  availabilityExceptions,
  blockedSlots,
  appointments,
} from '@/lib/db/schema'
import { and, eq, gte, lt, inArray, ne } from 'drizzle-orm'
import { format } from 'date-fns'
import {
  DEFAULT_DAY_SCHEDULE,
  filterAvailableSlots,
  generateCandidateSlots,
  toTimezoneDate,
  type DaySchedule,
  type TimeRange,
} from '@/lib/booking/availability'
import type {
  ActionResult,
  BookingBarber,
  BookingData,
  BookingService,
  CreatedAppointment,
} from '@/lib/booking/types'
import {
  createAppointmentSchema,
  getAvailableSlotsSchema,
  getBarbersSchema,
  slugSchema,
} from './schemas'

function centsToReais(cents: number): number {
  return cents / 100
}

function mapService(row: typeof services.$inferSelect): BookingService {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    durationMinutes: row.durationMinutes,
    price: centsToReais(row.price),
  }
}

function mapBarber(row: typeof barbers.$inferSelect): BookingBarber {
  return {
    id: row.id,
    name: row.name,
    avatarUrl: row.avatarUrl,
    specialties: row.specialties,
  }
}

/** Carrega barbearia + serviços ativos pelo slug público. */
export async function getBookingData(
  rawSlug: string,
): Promise<ActionResult<BookingData>> {
  try {
    const slug = slugSchema.parse(rawSlug)

    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.slug, slug), eq(barbershops.active, true)),
    })

    if (!shop) {
      return { success: false, error: 'Barbearia não encontrada' }
    }

    const shopServices = await db.query.services.findMany({
      where: and(eq(services.barbershopId, shop.id), eq(services.active, true)),
      orderBy: (s, { asc }) => [asc(s.name)],
    })

    return {
      success: true,
      data: {
        barbershop: {
          id: shop.id,
          name: shop.name,
          slug: shop.slug,
          logoUrl: shop.logoUrl,
          phone: shop.phone,
          address: shop.address,
        },
        services: shopServices.map(mapService),
      },
    }
  } catch {
    return { success: false, error: 'Erro ao carregar dados da barbearia' }
  }
}

/** Barbeiros ativos que realizam o serviço selecionado. */
export async function getBarbersForService(
  input: z.infer<typeof getBarbersSchema>,
): Promise<ActionResult<BookingBarber[]>> {
  try {
    const { barbershopId, serviceId } = getBarbersSchema.parse(input)

    const service = await db.query.services.findFirst({
      where: and(
        eq(services.id, serviceId),
        eq(services.barbershopId, barbershopId),
        eq(services.active, true),
      ),
    })

    if (!service) {
      return { success: false, error: 'Serviço não encontrado' }
    }

    const links = await db.query.barberServices.findMany({
      where: eq(barberServices.serviceId, serviceId),
    })

    const barberIds = links.map((l) => l.barberId)

    // Fallback: se não houver vínculos N:M, retorna todos os barbeiros ativos
    const rows =
      barberIds.length > 0
        ? await db.query.barbers.findMany({
            where: and(
              eq(barbers.barbershopId, barbershopId),
              eq(barbers.active, true),
              inArray(barbers.id, barberIds),
            ),
            orderBy: (b, { asc }) => [asc(b.name)],
          })
        : await db.query.barbers.findMany({
            where: and(
              eq(barbers.barbershopId, barbershopId),
              eq(barbers.active, true),
            ),
            orderBy: (b, { asc }) => [asc(b.name)],
          })

    return { success: true, data: rows.map(mapBarber) }
  } catch {
    return { success: false, error: 'Erro ao carregar profissionais' }
  }
}

async function resolveDaySchedule(
  barberId: string,
  dateStr: string,
): Promise<DaySchedule | null> {
  const date = new Date(`${dateStr}T12:00:00-03:00`)
  const dayOfWeek = date.getDay()

  const exception = await db.query.availabilityExceptions.findFirst({
    where: and(
      eq(availabilityExceptions.barberId, barberId),
      eq(availabilityExceptions.date, dateStr),
    ),
  })

  if (exception) {
    if (!exception.isAvailable) return null
    return {
      active: true,
      opensAt: exception.opensAt,
      closesAt: exception.closesAt,
      breakStart: exception.breakStart,
      breakEnd: exception.breakEnd,
    }
  }

  const weekly = await db.query.workingHours.findFirst({
    where: and(
      eq(workingHours.barberId, barberId),
      eq(workingHours.dayOfWeek, dayOfWeek),
    ),
  })

  if (weekly) {
    return {
      active: weekly.active,
      opensAt: weekly.opensAt,
      closesAt: weekly.closesAt,
      breakStart: weekly.breakStart,
      breakEnd: weekly.breakEnd,
    }
  }

  // Domingo fechado por padrão; demais dias usam horário default
  if (dayOfWeek === 0) return null
  return DEFAULT_DAY_SCHEDULE
}

/** Horários livres para barbeiro + serviço + data. */
export async function getAvailableSlots(
  input: z.infer<typeof getAvailableSlotsSchema>,
): Promise<ActionResult<string[]>> {
  try {
    const { barberId, serviceId, date } = getAvailableSlotsSchema.parse(input)

    const service = await db.query.services.findFirst({
      where: and(eq(services.id, serviceId), eq(services.active, true)),
    })

    if (!service) {
      return { success: false, error: 'Serviço não encontrado' }
    }

    const barber = await db.query.barbers.findFirst({
      where: and(eq(barbers.id, barberId), eq(barbers.active, true)),
    })

    if (!barber) {
      return { success: false, error: 'Profissional não encontrado' }
    }

    const schedule = await resolveDaySchedule(barberId, date)
    if (!schedule) {
      return { success: true, data: [] }
    }

    const dayStart = toTimezoneDate(date, '00:00')
    const dayEnd = toTimezoneDate(date, '23:59')

    const [dayBlocked, dayAppointments] = await Promise.all([
      db.query.blockedSlots.findMany({
        where: and(
          eq(blockedSlots.barberId, barberId),
          lt(blockedSlots.startsAt, dayEnd),
          gte(blockedSlots.endsAt, dayStart),
        ),
      }),
      db.query.appointments.findMany({
        where: and(
          eq(appointments.barberId, barberId),
          lt(appointments.startsAt, dayEnd),
          gte(appointments.endsAt, dayStart),
          ne(appointments.status, 'cancelled'),
        ),
      }),
    ])

    const blockedRanges: TimeRange[] = dayBlocked.map((b) => ({
      start: b.startsAt,
      end: b.endsAt,
    }))

    const appointmentRanges: TimeRange[] = dayAppointments.map((a) => ({
      start: a.startsAt,
      end: a.endsAt,
    }))

    const candidates = generateCandidateSlots(schedule, service.durationMinutes)

    const now = new Date()
    const isToday = format(now, 'yyyy-MM-dd') === date

    let available = filterAvailableSlots(
      candidates,
      date,
      service.durationMinutes,
      blockedRanges,
      appointmentRanges,
    )

    // Remove horários passados se for hoje
    if (isToday) {
      available = available.filter((time) => {
        const slotStart = toTimezoneDate(date, time)
        return slotStart > now
      })
    }

    return { success: true, data: available }
  } catch {
    return { success: false, error: 'Erro ao calcular horários disponíveis' }
  }
}

/** Cria agendamento com validação de conflito e integridade referencial. */
export async function createAppointment(
  input: z.infer<typeof createAppointmentSchema>,
): Promise<ActionResult<CreatedAppointment>> {
  try {
    const data = createAppointmentSchema.parse(input)

    const [barber, service] = await Promise.all([
      db.query.barbers.findFirst({
        where: and(
          eq(barbers.id, data.barberId),
          eq(barbers.barbershopId, data.barbershopId),
          eq(barbers.active, true),
        ),
      }),
      db.query.services.findFirst({
        where: and(
          eq(services.id, data.serviceId),
          eq(services.barbershopId, data.barbershopId),
          eq(services.active, true),
        ),
      }),
    ])

    if (!barber) {
      return { success: false, error: 'Profissional inválido para esta barbearia' }
    }

    if (!service) {
      return { success: false, error: 'Serviço inválido para esta barbearia' }
    }

    const startsAt = toTimezoneDate(data.date, data.time)
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000)

    if (startsAt <= new Date()) {
      return { success: false, error: 'Não é possível agendar horários no passado' }
    }

    const schedule = await resolveDaySchedule(data.barberId, data.date)
    if (!schedule) {
      return { success: false, error: 'Profissional indisponível nesta data' }
    }

    const timeStr = data.time
    const allowedSlots = await getAvailableSlots({
      barberId: data.barberId,
      serviceId: data.serviceId,
      date: data.date,
    })

    if (!allowedSlots.success) {
      return { success: false, error: allowedSlots.error }
    }

    if (!allowedSlots.data.includes(timeStr)) {
      return { success: false, error: 'Horário não está mais disponível' }
    }

    const [created] = await db
      .insert(appointments)
      .values({
        barbershopId: data.barbershopId,
        barberId: data.barberId,
        serviceId: data.serviceId,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        clientEmail: data.clientEmail || null,
        startsAt,
        endsAt,
        status: 'confirmed',
        priceCharged: service.price,
      })
      .returning()

    return {
      success: true,
      data: {
        id: created.id,
        startsAt: created.startsAt.toISOString(),
        endsAt: created.endsAt.toISOString(),
        serviceName: service.name,
        barberName: barber.name,
        price: centsToReais(service.price),
      },
    }
  } catch (err) {
    console.error('[createAppointment]', err)
    return { success: false, error: 'Erro ao criar agendamento' }
  }
}
