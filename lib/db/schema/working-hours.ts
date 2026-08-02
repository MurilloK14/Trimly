import {
  pgTable,
  uuid,
  smallint,
  boolean,
  time,
  unique,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { barbers } from './barbers'

// Agenda semanal padrão de cada barbeiro.
// Ao criar um barbeiro, gerar automaticamente 7 registros (dom=0 a sab=6)
// com active=false. O admin ativa e configura os dias que o barbeiro trabalha.
export const workingHours = pgTable(
  'working_hours',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    barberId: uuid('barber_id')
      .notNull()
      .references(() => barbers.id, { onDelete: 'cascade' }),

    // 0 = domingo ... 6 = sábado
    dayOfWeek: smallint('day_of_week').notNull(),

    // false = folga/fechado naquele dia da semana
    active: boolean('active').notNull().default(false),

    // Nullable: só obrigatórios quando active = true (validado via check)
    opensAt:  time('opens_at'),
    closesAt: time('closes_at'),

    // Intervalo (almoço, pausa). Ambos nulos = sem pausa.
    breakStart: time('break_start'),
    breakEnd:   time('break_end'),
  },
  (t) => [
    // Um registro por dia por barbeiro
    unique('working_hours_barber_day_unique').on(t.barberId, t.dayOfWeek),

    // day_of_week válido
    check('working_hours_day_range', sql`${t.dayOfWeek} BETWEEN 0 AND 6`),

    // Se ativo, horários de abertura e fechamento são obrigatórios e coerentes
    check(
      'working_hours_active_requires_times',
      sql`
        (${t.active} = false)
        OR (
          ${t.opensAt}  IS NOT NULL AND
          ${t.closesAt} IS NOT NULL AND
          ${t.closesAt} > ${t.opensAt}
        )
      `,
    ),

    // Break: ou ambos nulos (sem pausa) ou ambos preenchidos e coerentes
    check(
      'working_hours_break_consistency',
      sql`
        (${t.breakStart} IS NULL AND ${t.breakEnd} IS NULL)
        OR (
          ${t.breakStart} IS NOT NULL AND
          ${t.breakEnd}   IS NOT NULL AND
          ${t.breakEnd}   > ${t.breakStart} AND
          ${t.breakStart} >= ${t.opensAt}   AND
          ${t.breakEnd}   <= ${t.closesAt}
        )
      `,
    ),
  ],
)
