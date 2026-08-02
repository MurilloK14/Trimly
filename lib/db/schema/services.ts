import {
  pgTable,
  uuid,
  varchar,
  text,
  smallint,
  integer,
  boolean,
  timestamp,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { barbershops } from './barbershops'

export const services = pgTable(
  'services',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    barbershopId: uuid('barbershop_id')
      .notNull()
      .references(() => barbershops.id, { onDelete: 'cascade' }),

    name:        varchar('name', { length: 100 }).notNull(),
    description: text('description'),

    // Duração em minutos — base para cálculo de slots disponíveis.
    durationMinutes: smallint('duration_minutes').notNull(),

    // Preço em centavos — evita imprecisão de float.
    // Ex: R$ 45,00 → 4500
    price: integer('price').notNull(),

    active: boolean('active').notNull().default(true),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    check('services_duration_positive', sql`${t.durationMinutes} > 0`),
    check('services_price_non_negative', sql`${t.price} >= 0`),
  ],
)
