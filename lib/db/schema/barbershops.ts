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

  // ─── Stripe ─────────────────────────────────────────────────────────────────
  // Identificadores do Stripe. Anuláveis: preenchidos apenas após assinatura.
  // O Stripe é a fonte de verdade sobre o estado do pagamento.
  // Estes campos existem para evitar chamadas desnecessárias à API do Stripe
  // a cada request e para exibir informações na interface.

  stripeCustomerId:     varchar('stripe_customer_id',     { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripePriceId:        varchar('stripe_price_id',        { length: 255 }),

  // Status da assinatura — espelha o status do Stripe, atualizado via webhook.
  // Valores possíveis: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
  subscriptionStatus: varchar('subscription_status', { length: 50 }),

  // Datas da assinatura — para exibição na UI (ex: "sua assinatura renova em X").
  // NÃO usar para controlar acesso; usar subscriptionStatus para isso.
  subscriptionStart: timestamp('subscription_start', { withTimezone: true }),
  subscriptionEnd:   timestamp('subscription_end',   { withTimezone: true }),

  // Datas do trial — para exibição na UI (ex: "X dias restantes de teste").
  trialStart: timestamp('trial_start', { withTimezone: true }),
  trialEnd:   timestamp('trial_end',   { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})
