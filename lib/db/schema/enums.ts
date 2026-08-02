import { pgEnum } from 'drizzle-orm/pg-core'

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
])

export const exceptionTypeEnum = pgEnum('exception_type', [
  'holiday',
  'vacation',
  'course',
  'event',
  'reduced',
  'extended',
  'closure',
  'other',
])
