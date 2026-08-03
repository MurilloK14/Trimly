import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import type {
  barbershops,
  barbers,
  services,
  barberServices,
  workingHours,
  availabilityExceptions,
  blockedSlots,
  appointments,
} from './index'

// -----------------------------------------------------------
// Select types — usados em queries de leitura
// -----------------------------------------------------------
export type Barbershop           = InferSelectModel<typeof barbershops>
export type Barber               = InferSelectModel<typeof barbers>
export type Service              = InferSelectModel<typeof services>
export type BarberService        = InferSelectModel<typeof barberServices>
export type WorkingHours         = InferSelectModel<typeof workingHours>
export type AvailabilityException = InferSelectModel<typeof availabilityExceptions>
export type BlockedSlot          = InferSelectModel<typeof blockedSlots>
export type Appointment          = InferSelectModel<typeof appointments>

// -----------------------------------------------------------
// Insert types — usados em mutations (Server Actions)
// -----------------------------------------------------------
export type NewBarbershop           = InferInsertModel<typeof barbershops>
export type NewBarber               = InferInsertModel<typeof barbers>
export type NewService              = InferInsertModel<typeof services>
export type NewBarberService        = InferInsertModel<typeof barberServices>
export type NewWorkingHours         = InferInsertModel<typeof workingHours>
export type NewAvailabilityException = InferInsertModel<typeof availabilityExceptions>
export type NewBlockedSlot          = InferInsertModel<typeof blockedSlots>
export type NewAppointment          = InferInsertModel<typeof appointments>

// -----------------------------------------------------------
// Enums — re-exportados como tipos para uso em componentes
// -----------------------------------------------------------
export type AppointmentStatus = Appointment['status']
export type ExceptionType     = AvailabilityException['exceptionType']

// -----------------------------------------------------------
// Tipos compostos — resultados de queries com joins frequentes
// -----------------------------------------------------------
export type BarberWithServices = Barber & {
  barberServices: (BarberService & { service: Service })[]
}

export type AppointmentWithRelations = Appointment & {
  barber:  Barber
  service: Service
}

export type DaySchedule = WorkingHours & {
  exception?: AvailabilityException | null
  blockedSlots: BlockedSlot[]
  appointments: Appointment[]
}
