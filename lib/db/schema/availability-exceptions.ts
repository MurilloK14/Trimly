import {
  pgTable,
  uuid,
  date,
  boolean,
  time,
  text,
  timestamp,
  unique,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { barbers } from './barbers'
import { exceptionTypeEnum } from './enums'

// Sobrescreve a agenda semanal padrão para datas específicas.
// NÃO substitui working_hours — apenas tem precedência sobre ela.
//
// Exemplos de uso:
//   - Feriado:               is_available=false, type='holiday'
//   - Férias:                is_available=false, type='vacation'
//   - Horário reduzido:      is_available=true,  opens_at/closes_at diferentes do padrão
//   - Funcionamento extra:   is_available=true,  type='extended'
export const availabilityExceptions = pgTable(
  'availability_exceptions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    barberId: uuid('barber_id')
      .notNull()
      .references(() => barbers.id, { onDelete: 'cascade' }),

    // Data exata da exceção (sem timezone — dia do calendário local)
    date: date('date').notNull(),

    // false = barbeiro indisponível neste dia (férias, feriado, etc.)
    isAvailable: boolean('is_available').notNull(),

    // Horários alternativos — obrigatórios apenas quando is_available = true
    opensAt:  time('opens_at'),
    closesAt: time('closes_at'),

    // Pausa alternativa para este dia específico
    breakStart: time('break_start'),
    breakEnd:   time('break_end'),

    exceptionType: exceptionTypeEnum('exception_type').notNull(),
    reason:        text('reason'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    // Apenas uma exceção por barbeiro por data
    unique('availability_exceptions_barber_date_unique').on(t.barberId, t.date),

    // Se disponível, horários são obrigatórios e coerentes
    check(
      'availability_exceptions_available_requires_times',
      sql`
        (${t.isAvailable} = false AND ${t.opensAt} IS NULL AND ${t.closesAt} IS NULL)
        OR (
          ${t.isAvailable} = true  AND
          ${t.opensAt}     IS NOT NULL AND
          ${t.closesAt}    IS NOT NULL AND
          ${t.closesAt}    > ${t.opensAt}
        )
      `,
    ),

    // Break coerente (mesma regra de working_hours)
    check(
      'availability_exceptions_break_consistency',
      sql`
        (${t.breakStart} IS NULL AND ${t.breakEnd} IS NULL)
        OR (
          ${t.breakStart} IS NOT NULL AND
          ${t.breakEnd}   IS NOT NULL AND
          ${t.breakEnd}   > ${t.breakStart}
        )
      `,
    ),
  ],
)
