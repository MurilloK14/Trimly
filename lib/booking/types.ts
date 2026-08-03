/** DTOs expostos ao cliente de agendamento (camelCase, valores em reais/minutos). */

export type BookingBarbershop = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  phone: string | null
  address: string | null
}

export type BookingService = {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  /** Preço em reais (ex: 45.00) */
  price: number
}

export type BookingBarber = {
  id: string
  name: string
  avatarUrl: string | null
  specialties: string[] | null
}

export type BookingData = {
  barbershop: BookingBarbershop
  services: BookingService[]
}

export type CreatedAppointment = {
  id: string
  startsAt: string
  endsAt: string
  serviceName: string
  barberName: string
  price: number
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
