import { z } from 'zod'

export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .transform((s) => s.toLowerCase().replace(/\s+/g, '-'))

export const getBarbersSchema = z.object({
  barbershopId: z.string().uuid(),
  serviceId: z.string().uuid(),
})

export const getAvailableSlotsSchema = z.object({
  barberId: z.string().uuid(),
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
})

export const createAppointmentSchema = z.object({
  barbershopId: z.string().uuid(),
  barberId: z.string().uuid(),
  serviceId: z.string().uuid(),
  clientName: z.string().min(2).max(100),
  clientPhone: z.string().min(10).max(20),
  clientEmail: z.string().email().max(254).optional().or(z.literal('')),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
})
