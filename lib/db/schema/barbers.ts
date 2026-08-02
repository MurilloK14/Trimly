import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { barbershops } from './barbershops'

export const barbers = pgTable('barbers', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  barbershopId: uuid('barbershop_id')
    .notNull()
    .references(() => barbershops.id, { onDelete: 'cascade' }),

  // Nullable: barbeiro pode existir sem conta de login.
  // UNIQUE: quando preenchido, cada auth.users só é 1 barbeiro.
  userId: uuid('user_id').unique(),

  name:      varchar('name', { length: 100 }).notNull(),
  avatarUrl: text('avatar_url'),
  bio:       text('bio'),

  // Array de texto — especialidades descritivas para exibição ao cliente.
  // Não normalizado intencionalmente: MVP não requer filtragem por especialidade.
  // Migrar para tabela própria quando surgir esse requisito.
  specialties: text('specialties').array(),

  active: boolean('active').notNull().default(true),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})
