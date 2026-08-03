'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { barbershops, appointments, services } from '@/lib/db/schema'
import { and, eq, ne } from 'drizzle-orm'
import { format } from 'date-fns'
import type { ActionResult } from '@/lib/booking/types'

export interface ClientRecord {
  phone: string
  name: string
  email: string | null
  visits: number
  totalSpent: number
  lastVisit: string
  lastVisitDate: string
  isVip: boolean // 5+ visitas
}

export interface ClientsData {
  clients: ClientRecord[]
  totalClients: number
  vipClients: number
  totalRevenue: number
}

// Retorna a lista de clientes únicos com base no histórico de agendamentos
export async function getClientsData(): Promise<ActionResult<ClientsData>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Não autorizado' }

    const shop = await db.query.barbershops.findFirst({
      where: and(eq(barbershops.ownerId, user.id), eq(barbershops.active, true)),
    })
    if (!shop) return { success: false, error: 'Barbearia não encontrada' }

    // Busca todos os agendamentos não cancelados
    const rows = await db.query.appointments.findMany({
      where: and(
        eq(appointments.barbershopId, shop.id),
        ne(appointments.status, 'cancelled')
      ),
      columns: {
        clientName: true,
        clientPhone: true,
        clientEmail: true,
        priceCharged: true,
        startsAt: true,
      },
      orderBy: (a, { asc }) => [asc(a.startsAt)],
    })

    // Agrupa por telefone (identificador único do cliente)
    const clientMap = new Map<string, ClientRecord>()

    rows.forEach(r => {
      const phone = r.clientPhone
      const existing = clientMap.get(phone)

      if (existing) {
        existing.visits += 1
        existing.totalSpent += r.priceCharged / 100
        // Guarda a visita mais recente
        if (r.startsAt > new Date(existing.lastVisitDate)) {
          existing.lastVisitDate = r.startsAt.toISOString()
          existing.lastVisit = format(r.startsAt, 'dd/MM/yyyy')
          // Atualiza e-mail se tiver
          if (r.clientEmail) existing.email = r.clientEmail
        }
      } else {
        clientMap.set(phone, {
          phone,
          name: r.clientName,
          email: r.clientEmail,
          visits: 1,
          totalSpent: r.priceCharged / 100,
          lastVisit: format(r.startsAt, 'dd/MM/yyyy'),
          lastVisitDate: r.startsAt.toISOString(),
          isVip: false,
        })
      }
    })

    // Marca como VIP quem tem 5+ visitas
    const clients = Array.from(clientMap.values()).map(c => ({
      ...c,
      isVip: c.visits >= 5,
    }))

    // Ordena por total gasto descendente
    clients.sort((a, b) => b.totalSpent - a.totalSpent)

    return {
      success: true,
      data: {
        clients,
        totalClients: clients.length,
        vipClients: clients.filter(c => c.isVip).length,
        totalRevenue: clients.reduce((sum, c) => sum + c.totalSpent, 0),
      },
    }
  } catch (err) {
    console.error('[getClientsData]', err)
    return { success: false, error: 'Erro ao carregar clientes' }
  }
}
