import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core'
import { barbers }  from './barbers'
import { services } from './services'

// Relacionamento N:M entre barbeiros e serviços.
// Permite que cada barbeiro ofereça apenas um subconjunto dos serviços da barbearia.
// Ao escolher um barbeiro, o sistema exibe somente os serviços que ele realiza.
export const barberServices = pgTable(
  'barber_services',
  {
    barberId:  uuid('barber_id')
      .notNull()
      .references(() => barbers.id, { onDelete: 'cascade' }),

    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.barberId, t.serviceId] }),
  ],
)
