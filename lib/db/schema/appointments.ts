import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { barbershops } from './barbershops'
import { barbers }     from './barbers'
import { services }    from './services'
import { appointmentStatusEnum } from './enums'

export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Desnormalização intencional: evita join extra na query mais
    // frequente do sistema (agenda do dia por barbearia).
    // Consistência garantida: barbershop_id deve ser igual a
    // barbers.barbershop_id — verificado na Server Action.
    barbershopId: uuid('barbershop_id')
      .notNull()
      .references(() => barbershops.id),

    barberId: uuid('barber_id')
      .notNull()
      .references(() => barbers.id),

    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id),

    // Dados do cliente — sem tabela própria no MVP.
    // Identificação pelo telefone (não unique: mesmo cliente pode agendar várias vezes).
    clientName:  varchar('client_name',  { length: 100 }).notNull(),
    clientPhone: varchar('client_phone', { length: 20  }).notNull(),
    clientEmail: varchar('client_email', { length: 254 }),

    // Intervalo completo armazenado — necessário para a query de conflito
    // (overlap check: starts_at < novo_ends_at AND ends_at > novo_starts_at).
    // ends_at = starts_at + service.duration_minutes (calculado na Server Action).
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt:   timestamp('ends_at',   { withTimezone: true }).notNull(),

    status: appointmentStatusEnum('status').notNull().default('confirmed'),

    // Preço praticado no momento do agendamento.
    // Imutabilidade histórica: alterações futuras no preço do serviço
    // não afetam agendamentos já realizados.
    priceCharged: integer('price_charged').notNull(),

    notes: text('notes'),

    // Campos de cancelamento — nulos quando não cancelado.
    // Referencia auth.users (owner ou barber com login).
    cancelledBy:         uuid('cancelled_by'),
    cancelledAt:         timestamp('cancelled_at', { withTimezone: true }),
    cancellationReason:  text('cancellation_reason'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    // Integridade temporal básica
    check('appointments_end_after_start', sql`${t.endsAt} > ${t.startsAt}`),

    // Preço não pode ser negativo
    check('appointments_price_non_negative', sql`${t.priceCharged} >= 0`),

    // Cancelamento: campos devem ser preenchidos juntos ou nenhum
    check(
      'appointments_cancellation_consistency',
      sql`
        (${t.cancelledBy} IS NULL AND ${t.cancelledAt} IS NULL)
        OR
        (${t.cancelledBy} IS NOT NULL AND ${t.cancelledAt} IS NOT NULL)
      `,
    ),
  ],
)
