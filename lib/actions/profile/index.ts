'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { barbershops, barbers, barberServices } from '@/lib/db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import type { ActionResult } from '@/lib/booking/types'

export interface ProfileData {
  user: {
    email: string
  }
  barbershop: {
    id: string
    name: string
    slug: string
    phone: string | null
    address: string | null
  }
}

// Busca dados do perfil: email do auth + dados da barbearia
export async function getProfileData(): Promise<ActionResult<ProfileData>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
      columns: { id: true, name: true, slug: true, phone: true, address: true },
    })
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    return {
      success: true,
      data: {
        user: { email: user.email ?? '' },
        barbershop: shop,
      },
    }
  } catch (err) {
    console.error('[getProfileData]', err)
    return { success: false, error: 'Erro ao carregar perfil' }
  }
}

// Atualiza nome, telefone e endereço da barbearia
export async function updateBarbershopProfile(data: {
  name: string
  phone: string
  address: string
}): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
    })
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    await db.update(barbershops).set({
      name: data.name,
      phone: data.phone || null,
      address: data.address || null,
    }).where(eq(barbershops.id, shop.id))

    return { success: true, data: undefined }
  } catch (err) {
    console.error('[updateBarbershopProfile]', err)
    return { success: false, error: 'Erro ao salvar perfil' }
  }
}

// Atualiza a senha do usuário no Supabase Auth
export async function updatePassword(newPassword: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { success: false, error: error.message }
    return { success: true, data: undefined }
  } catch (err) {
    console.error('[updatePassword]', err)
    return { success: false, error: 'Erro ao atualizar senha' }
  }
}

// ──────────────────────────────────────────────────────────────
// barber_services: vincular barbeiros a serviços
// ──────────────────────────────────────────────────────────────

export interface BarberServiceLink {
  barberId: string
  serviceId: string
}

// Busca todos os vínculos barbeiro↔serviço para a barbearia do usuário logado
export async function getBarberServiceLinks(): Promise<ActionResult<BarberServiceLink[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
    })
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    // Busca barbeiros da barbearia para filtrar
    const shopBarbers = await db.query.barbers.findMany({
      where: eq(barbers.barbershopId, shop.id),
      columns: { id: true },
    })
    const barberIds = shopBarbers.map(b => b.id)

    if (barberIds.length === 0) {
      return { success: true, data: [] }
    }

    const rows = await db.query.barberServices.findMany({
      where: inArray(barberServices.barberId, barberIds),
    })

    const links = rows.map(r => ({ barberId: r.barberId, serviceId: r.serviceId }))

    return { success: true, data: links }
  } catch (err) {
    console.error('[getBarberServiceLinks]', err)
    return { success: false, error: 'Erro ao buscar vínculos' }
  }
}

// Adiciona vínculo barbeiro↔serviço (ignora duplicado)
export async function linkBarberService(barberId: string, serviceId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
    })
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    // Verificar que o barbeiro pertence à barbearia do usuário
    const barber = await db.query.barbers.findFirst({
      where: and(eq(barbers.id, barberId), eq(barbers.barbershopId, shop.id)),
    })
    if (!barber) return { success: false, error: 'Barbeiro não encontrado' }

    await db.insert(barberServices)
      .values({ barberId, serviceId })
      .onConflictDoNothing()
    return { success: true, data: undefined }
  } catch (err) {
    console.error('[linkBarberService]', err)
    return { success: false, error: 'Erro ao vincular' }
  }
}

// Remove vínculo barbeiro↔serviço
export async function unlinkBarberService(barberId: string, serviceId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
    })
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    // Verificar que o barbeiro pertence à barbearia do usuário
    const barber = await db.query.barbers.findFirst({
      where: and(eq(barbers.id, barberId), eq(barbers.barbershopId, shop.id)),
    })
    if (!barber) return { success: false, error: 'Barbeiro não encontrado' }

    await db.delete(barberServices)
      .where(and(eq(barberServices.barberId, barberId), eq(barberServices.serviceId, serviceId)))
    return { success: true, data: undefined }
  } catch (err) {
    console.error('[unlinkBarberService]', err)
    return { success: false, error: 'Erro ao desvincular' }
  }
}
