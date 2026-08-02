import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const barbershops = pgTable('barbershops', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  // Vinculado ao auth.users do Supabase.
  // UNIQUE garante 1 barbearia por dono.
  ownerId: uuid('owner_id').notNull().unique(),

  name: varchar('name', { length: 100 }).notNull(),

  // URL pública de agendamento: /book/:slug
  slug: varchar('slug', { length: 100 }).notNull().unique(),

  logoUrl: text('logo_url'),
  phone:   varchar('phone', { length: 20 }),
  address: text('address'),

  active: boolean('active').notNull().default(true),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})
