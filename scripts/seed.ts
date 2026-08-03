import 'dotenv/config';
import { db } from '../lib/db/index';
import { barbershops, barbers, services } from '../lib/db/schema';

async function seed() {
  console.log('🌱 Inciando Seed...');
  
  try {
    // 1. Inserir Barbearia
    const [barbershop] = await db.insert(barbershops).values({
      name: 'MK Barber',
      slug: 'mk-barber',
      phone: '11999999999',
      address: 'Rua das Barbearias, 123 - Centro',
      active: true,
    }).returning();
    
    console.log('✅ Barbearia criada:', barbershop.name);

    // 2. Inserir Barbeiros
    const insertedBarbers = await db.insert(barbers).values([
      {
        barbershopId: barbershop.id,
        name: 'João Silva',
        avatarUrl: 'joao',
        rating: '4.9',
        specialties: ['Degradê', 'Barba'],
        active: true,
      },
      {
        barbershopId: barbershop.id,
        name: 'Pedro Santos',
        avatarUrl: 'pedro',
        rating: '4.8',
        specialties: ['Platinado', 'Corte Social'],
        active: true,
      }
    ]).returning();
    
    console.log('✅ Barbeiros criados:', insertedBarbers.length);

    // 3. Inserir Serviços
    const insertedServices = await db.insert(services).values([
      {
        barbershopId: barbershop.id,
        name: 'Corte Social',
        durationMinutes: 30,
        price: 4000, // em centavos (R$ 40,00)
        description: 'Corte tradicional com tesoura e máquina',
        active: true,
      },
      {
        barbershopId: barbershop.id,
        name: 'Corte Degradê',
        durationMinutes: 45,
        price: 5000,
        description: 'Degradê com navalhado e finalização',
        active: true,
      },
      {
        barbershopId: barbershop.id,
        name: 'Barba',
        durationMinutes: 30,
        price: 3500,
        description: 'Barba com toalha quente e hidratação',
        active: true,
      }
    ]).returning();
    
    console.log('✅ Serviços criados:', insertedServices.length);

    console.log('🎉 Seed concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  }
}

seed();
