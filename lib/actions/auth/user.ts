'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/booking/types'

export interface SidebarUser {
  email: string
  barbershopName: string
}

export async function getSidebarUser(): Promise<ActionResult<SidebarUser>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    // Busca nome da barbearia direto via supabase para ser leve
    const { data: shop } = await supabase
      .from('barbershops')
      .select('name')
      .eq('owner_id', user.id)
      .eq('active', true)
      .single()

    return {
      success: true,
      data: {
        email: user.email ?? '',
        barbershopName: shop?.name ?? 'Minha Barbearia',
      },
    }
  } catch {
    return { success: false, error: 'Erro' }
  }
}
