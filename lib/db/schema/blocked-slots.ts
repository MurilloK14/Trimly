import {
  pgTable,
  uuid,
  text,
  timestamp,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { barbers } from './barbers'

// Bloqueios manuais e pontuais dentro de um dia de trabalho.
// Diferente de availability_exceptions (que fecha o dia inteiro),
// blocked_slots bloqueia intervalos específicos: reunião, atendimento
// particular, equipamento em manutenção, etc.
export const blockedSlots = pgTable(
  'blocked_slots',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    barberId: uuid('barber_id')
      .notNull()
      .references(() => barbers.id, { onDelete: 'cascade' }),

    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt:   timestamp('ends_at',   { withTimezone: true }).notNull(),

    reason: text('reason'),

    // Quem criou o bloqueio (owner_id ou user_id do barbeiro)
    // Referencia auth.users do Supabase — não FK explícita pois
    // auth.users é gerenciado pelo Supabase fora do schema público.
    createdBy: uuid('created_by').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    check('blocked_slots_end_after_start', sql`${t.endsAt} > ${t.startsAt}`),
  ],
)
