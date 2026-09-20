'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { barbershops, barbers, services } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import type { ActionResult } from '@/lib/booking/types'

export interface SettingsBarber {
  id: string
  name: string
  active: boolean
}

export interface SettingsService {
  id: string
  name: string
  price: number
  durationMinutes: number
  description: string | null
  active: boolean
}

export interface SettingsData {
  barbershop: { id: string; name: string; slug: string }
  barbers: SettingsBarber[]
  services: SettingsService[]
}

async function getAuthAndShop() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, shop: null }

  const shop = await db.query.barbershops.findFirst({
    where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
  })
  return { user, shop }
}

// Busca todos os dados da barbearia, barbeiros e serviços
export async function getBarbershopSettings(): Promise<ActionResult<SettingsData>> {
  try {
    const { user, shop } = await getAuthAndShop()
    if (!user) return { success: false, error: 'Não autorizado' }
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    const allBarbers = await db.query.barbers.findMany({
      where: eq(barbers.barbershopId, shop.id),
      columns: { id: true, name: true, active: true },
    })

    const allServices = await db.query.services.findMany({
      where: eq(services.barbershopId, shop.id),
      columns: { id: true, name: true, price: true, durationMinutes: true, description: true, active: true },
    })

    return {
      success: true,
      data: {
        barbershop: { id: shop.id, name: shop.name, slug: shop.slug },
        barbers: allBarbers,
        services: allServices.map(s => ({ ...s, price: s.price / 100 })),
      },
    }
  } catch (err) {
    console.error('[getBarbershopSettings]', err)
    return { success: false, error: 'Erro ao carregar configurações' }
  }
}

// Atualiza o nome da barbearia
export async function updateBarbershopName(name: string): Promise<ActionResult<void>> {
  try {
    const { user, shop } = await getAuthAndShop()
    if (!user) return { success: false, error: 'Não autorizado' }
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    await db.update(barbershops).set({ name }).where(eq(barbershops.id, shop.id))
    return { success: true, data: undefined }
  } catch (err) {
    console.error('[updateBarbershopName]', err)
    return { success: false, error: 'Erro ao atualizar nome' }
  }
}

// Adiciona um novo barbeiro
export async function addBarber(name: string): Promise<ActionResult<void>> {
  try {
    const { user, shop } = await getAuthAndShop()
    if (!user) return { success: false, error: 'Não autorizado' }
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    await db.insert(barbers).values({
      barbershopId: shop.id,
      name,
      active: true,
    })
    return { success: true, data: undefined }
  } catch (err) {
    console.error('[addBarber]', err)
    return { success: false, error: 'Erro ao adicionar barbeiro' }
  }
}

// Soft delete de barbeiro
export async function deleteBarber(id: string): Promise<ActionResult<void>> {
  try {
    const { user, shop } = await getAuthAndShop()
    if (!user) return { success: false, error: 'Não autorizado' }
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    await db.update(barbers)
      .set({ active: false })
      .where(and(eq(barbers.id, id), eq(barbers.barbershopId, shop.id)))
    return { success: true, data: undefined }
  } catch (err) {
    console.error('[deleteBarber]', err)
    return { success: false, error: 'Erro ao remover barbeiro' }
  }
}

// Adiciona um novo serviço
export async function addService(data: {
  name: string
  price: number
  durationMinutes: number
  description?: string
}): Promise<ActionResult<void>> {
  try {
    const { user, shop } = await getAuthAndShop()
    if (!user) return { success: false, error: 'Não autorizado' }
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    await db.insert(services).values({
      barbershopId: shop.id,
      name: data.name,
      price: Math.round(data.price * 100), // centavos
      durationMinutes: data.durationMinutes,
      description: data.description || null,
      active: true,
    })
    return { success: true, data: undefined }
  } catch (err) {
    console.error('[addService]', err)
    return { success: false, error: 'Erro ao adicionar serviço' }
  }
}

// Soft delete de serviço
export async function deleteService(id: string): Promise<ActionResult<void>> {
  try {
    const { user, shop } = await getAuthAndShop()
    if (!user) return { success: false, error: 'Não autorizado' }
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    await db.update(services)
      .set({ active: false })
      .where(and(eq(services.id, id), eq(services.barbershopId, shop.id)))
    return { success: true, data: undefined }
  } catch (err) {
    console.error('[deleteService]', err)
    return { success: false, error: 'Erro ao remover serviço' }
  }
}
