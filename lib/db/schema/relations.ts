import { relations } from 'drizzle-orm'
import { barbershops }             from './barbershops'
import { barbers }                 from './barbers'
import { services }                from './services'
import { barberServices }          from './barber-services'
import { workingHours }            from './working-hours'
import { availabilityExceptions }  from './availability-exceptions'
import { blockedSlots }            from './blocked-slots'
import { appointments }            from './appointments'

export const barbershopsRelations = relations(barbershops, ({ many }) => ({
  barbers:      many(barbers),
  services:     many(services),
  appointments: many(appointments),
}))

export const barbersRelations = relations(barbers, ({ one, many }) => ({
  barbershop:             one(barbershops, {
    fields:     [barbers.barbershopId],
    references: [barbershops.id],
  }),
  barberServices:         many(barberServices),
  workingHours:           many(workingHours),
  availabilityExceptions: many(availabilityExceptions),
  blockedSlots:           many(blockedSlots),
  appointments:           many(appointments),
}))

export const servicesRelations = relations(services, ({ one, many }) => ({
  barbershop:    one(barbershops, {
    fields:     [services.barbershopId],
    references: [barbershops.id],
  }),
  barberServices: many(barberServices),
  appointments:   many(appointments),
}))

export const barberServicesRelations = relations(barberServices, ({ one }) => ({
  barber:  one(barbers, {
    fields:     [barberServices.barberId],
    references: [barbers.id],
  }),
  service: one(services, {
    fields:     [barberServices.serviceId],
    references: [services.id],
  }),
}))

export const workingHoursRelations = relations(workingHours, ({ one }) => ({
  barber: one(barbers, {
    fields:     [workingHours.barberId],
    references: [barbers.id],
  }),
}))

export const availabilityExceptionsRelations = relations(availabilityExceptions, ({ one }) => ({
  barber: one(barbers, {
    fields:     [availabilityExceptions.barberId],
    references: [barbers.id],
  }),
}))

export const blockedSlotsRelations = relations(blockedSlots, ({ one }) => ({
  barber: one(barbers, {
    fields:     [blockedSlots.barberId],
    references: [barbers.id],
  }),
}))

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  barbershop: one(barbershops, {
    fields:     [appointments.barbershopId],
    references: [barbershops.id],
  }),
  barber:  one(barbers, {
    fields:     [appointments.barberId],
    references: [barbers.id],
  }),
  service: one(services, {
    fields:     [appointments.serviceId],
    references: [services.id],
  }),
}))
