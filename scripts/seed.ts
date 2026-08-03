import 'dotenv/config'
import { db } from '../lib/db/index'
import {
  barbershops,
  barbers,
  services,
  barberServices,
  workingHours,
} from '../lib/db/schema'

/** UUID fixo para desenvolvimento — substituir pelo auth.users.id no onboarding real. */
const DEV_OWNER_ID = '00000000-0000-4000-8000-000000000001'

const DEFAULT_SCHEDULE = [
  { dayOfWeek: 0, active: false, opensAt: null, closesAt: null, breakStart: null, breakEnd: null },
  { dayOfWeek: 1, active: true, opensAt: '09:00:00', closesAt: '18:00:00', breakStart: '12:00:00', breakEnd: '13:00:00' },
  { dayOfWeek: 2, active: true, opensAt: '09:00:00', closesAt: '18:00:00', breakStart: '12:00:00', breakEnd: '13:00:00' },
  { dayOfWeek: 3, active: true, opensAt: '09:00:00', closesAt: '18:00:00', breakStart: '12:00:00', breakEnd: '13:00:00' },
  { dayOfWeek: 4, active: true, opensAt: '09:00:00', closesAt: '18:00:00', breakStart: '12:00:00', breakEnd: '13:00:00' },
  { dayOfWeek: 5, active: true, opensAt: '09:00:00', closesAt: '18:00:00', breakStart: '12:00:00', breakEnd: '13:00:00' },
  { dayOfWeek: 6, active: true, opensAt: '09:00:00', closesAt: '14:00:00', breakStart: null, breakEnd: null },
]

async function seed() {
  console.log('🌱 Iniciando seed...')

  try {
    const [barbershop] = await db
      .insert(barbershops)
      .values({
        ownerId: DEV_OWNER_ID,
        name: 'MK Barber',
        slug: 'mk-barber',
        phone: '(11) 99999-9999',
        address: 'Rua das Barbearias, 123 - Centro',
        active: true,
      })
      .onConflictDoNothing({ target: barbershops.slug })
      .returning()

    const shop =
      barbershop ??
      (await db.query.barbershops.findFirst({
        where: (b, { eq }) => eq(b.slug, 'mk-barber'),
      }))

    if (!shop) throw new Error('Falha ao criar ou encontrar barbearia')

    console.log('✅ Barbearia:', shop.name)

    const existingBarbers = await db.query.barbers.findMany({
      where: (b, { eq }) => eq(b.barbershopId, shop.id),
    })

    const shopBarbers =
      existingBarbers.length > 0
        ? existingBarbers
        : await db
            .insert(barbers)
            .values([
              {
                barbershopId: shop.id,
                name: 'João Silva',
                avatarUrl: 'joao',
                specialties: ['Degradê', 'Barba'],
                active: true,
              },
              {
                barbershopId: shop.id,
                name: 'Pedro Santos',
                avatarUrl: 'pedro',
                specialties: ['Platinado', 'Corte Social'],
                active: true,
              },
              {
                barbershopId: shop.id,
                name: 'Lucas Oliveira',
                avatarUrl: 'lucas',
                specialties: ['Pigmentação', 'Corte'],
                active: true,
              },
            ])
            .returning()

    console.log('✅ Barbeiros:', shopBarbers.length)

    const existingServices = await db.query.services.findMany({
      where: (s, { eq }) => eq(s.barbershopId, shop.id),
    })

    const shopServices =
      existingServices.length > 0
        ? existingServices
        : await db
            .insert(services)
            .values([
              {
                barbershopId: shop.id,
                name: 'Corte Social',
                durationMinutes: 30,
                price: 4000,
                description: 'Corte tradicional com tesoura e máquina',
                active: true,
              },
              {
                barbershopId: shop.id,
                name: 'Corte Degradê',
                durationMinutes: 45,
                price: 5000,
                description: 'Degradê com navalhado e finalização',
                active: true,
              },
              {
                barbershopId: shop.id,
                name: 'Corte + Barba',
                durationMinutes: 60,
                price: 6500,
                description: 'Combo completo corte e barba',
                active: true,
              },
              {
                barbershopId: shop.id,
                name: 'Barba',
                durationMinutes: 30,
                price: 3500,
                description: 'Barba com toalha quente e hidratação',
                active: true,
              },
            ])
            .returning()

    console.log('✅ Serviços:', shopServices.length)

    // Vincula todos os barbeiros a todos os serviços
    for (const barber of shopBarbers) {
      for (const service of shopServices) {
        await db
          .insert(barberServices)
          .values({ barberId: barber.id, serviceId: service.id })
          .onConflictDoNothing()
      }

      // Horários semanais por barbeiro
      for (const day of DEFAULT_SCHEDULE) {
        await db
          .insert(workingHours)
          .values({ barberId: barber.id, ...day })
          .onConflictDoNothing({ target: [workingHours.barberId, workingHours.dayOfWeek] })
      }
    }

    console.log('✅ Vínculos barbeiro-serviço e horários configurados')
    console.log('🎉 Seed concluído! Acesse /agendar/mk-barber')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
    process.exit(1)
  }
}

seed()
