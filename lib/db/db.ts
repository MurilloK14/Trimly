// Data Access Layer (DAL) for MK Barber SaaS
// Prepared for direct integration with PostgreSQL/Supabase

export interface Barbershop {
  id: string // UUID
  name: string
  slug: string
  logo_type: 'preset' | 'custom'
  logo_preset: string
  logo_custom: string // base64 or url
  created_at: string
}

export interface User {
  id: string // UUID
  name: string
  email: string
  role: 'admin' | 'barber' | 'customer'
  created_at: string
}

export interface Barber {
  id: string // UUID
  barbershop_id: string // UUID
  name: string
  avatar: string // preset seed name or custom base64
  rating: number
  specialties: string[]
  created_at: string
}

export interface Service {
  id: string // UUID
  barbershop_id: string // UUID
  name: string
  duration: number // in minutes
  price: number // in BRL
  description: string
  created_at: string
}

export interface Appointment {
  id: string // UUID
  barbershop_id: string // UUID
  barber_id: string // UUID
  service_id: string // UUID
  client_name: string
  client_phone: string
  client_email: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

// Database Service Contract
export interface DatabaseService {
  getBarbershop(slug: string): Promise<Barbershop | null>
  getBarbershopById(id: string): Promise<Barbershop | null>
  saveBarbershop(barbershop: Barbershop): Promise<void>
  
  getBarbers(barbershopId: string): Promise<Barber[]>
  saveBarber(barber: Barber): Promise<void>
  deleteBarber(barberId: string): Promise<void>
  
  getServices(barbershopId: string): Promise<Service[]>
  saveService(service: Service): Promise<void>
  deleteService(serviceId: string): Promise<void>
  
  getAppointments(barbershopId: string): Promise<Appointment[]>
  createAppointment(appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<Appointment>
}

// Helper to generate UUID-like strings
function generateUUID(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Default Seed Data
const DEFAULT_BARBERS = (barbershopId: string): Barber[] => [
  { id: "b1", barbershop_id: barbershopId, name: "João Silva", avatar: "joao", rating: 4.9, specialties: ["Degradê", "Barba"], created_at: new Date().toISOString() },
  { id: "b2", barbershop_id: barbershopId, name: "Pedro Santos", avatar: "pedro", rating: 4.8, specialties: ["Platinado", "Corte Social"], created_at: new Date().toISOString() },
  { id: "b3", barbershop_id: barbershopId, name: "Lucas Oliveira", avatar: "lucas", rating: 4.7, specialties: ["Pigmentação", "Corte"], created_at: new Date().toISOString() }
]

const DEFAULT_SERVICES = (barbershopId: string): Service[] => [
  { id: "s1", barbershop_id: barbershopId, name: "Corte Social", duration: 30, price: 40, description: "Corte tradicional com tesoura e máquina", created_at: new Date().toISOString() },
  { id: "s2", barbershop_id: barbershopId, name: "Corte Degradê", duration: 45, price: 50, description: "Degradê com navalhado e finalização", created_at: new Date().toISOString() },
  { id: "s3", barbershop_id: barbershopId, name: "Corte + Barba", duration: 60, price: 65, description: "Combo completo corte e barba", created_at: new Date().toISOString() },
  { id: "s4", barbershop_id: barbershopId, name: "Barba", duration: 30, price: 35, description: "Barba com toalha quente e hidratação", created_at: new Date().toISOString() },
  { id: "s5", barbershop_id: barbershopId, name: "Platinado", duration: 120, price: 150, description: "Descoloração completa", created_at: new Date().toISOString() },
  { id: "s6", barbershop_id: barbershopId, name: "Pigmentação", duration: 90, price: 120, description: "Pigmentação capilar", created_at: new Date().toISOString() }
]

class LocalStorageDatabase implements DatabaseService {
  private isClient(): boolean {
    return typeof window !== 'undefined'
  }

  // Load complete state from LocalStorage or seed defaults
  private getStorageState() {
    if (!this.isClient()) return { barbershops: {}, barbers: {}, services: {}, appointments: {} }

    const raw = localStorage.getItem('mk_barber_db')
    if (raw) {
      try {
        return JSON.parse(raw)
      } catch (e) {
        console.error("Failed parsing database state, resetting", e)
      }
    }

    // Default Seed State
    const defaultShopId = "default-shop-id"
    const initialState = {
      barbershops: {
        "mk-barber": {
          id: defaultShopId,
          name: "MK Barber",
          slug: "mk-barber",
          logo_type: "preset",
          logo_preset: "vintage-gold",
          logo_custom: "",
          created_at: new Date().toISOString()
        }
      },
      barbers: {
        [defaultShopId]: DEFAULT_BARBERS(defaultShopId)
      },
      services: {
        [defaultShopId]: DEFAULT_SERVICES(defaultShopId)
      },
      appointments: {
        [defaultShopId]: []
      }
    }
    this.saveStorageState(initialState)
    return initialState
  }

  private saveStorageState(state: any) {
    if (!this.isClient()) return
    localStorage.setItem('mk_barber_db', JSON.stringify(state))
  }

  async getBarbershop(slug: string): Promise<Barbershop | null> {
    const state = this.getStorageState()
    const shop = Object.values(state.barbershops).find((b: any) => b.slug === slug) as Barbershop
    return shop || null
  }

  async getBarbershopById(id: string): Promise<Barbershop | null> {
    const state = this.getStorageState()
    return (state.barbershops[id] as Barbershop) || null
  }

  async saveBarbershop(barbershop: Barbershop): Promise<void> {
    const state = this.getStorageState()
    state.barbershops[barbershop.id] = barbershop
    
    // Seed default barbers and services if they don't exist yet for this new shop
    if (!state.barbers[barbershop.id]) {
      state.barbers[barbershop.id] = DEFAULT_BARBERS(barbershop.id)
    }
    if (!state.services[barbershop.id]) {
      state.services[barbershop.id] = DEFAULT_SERVICES(barbershop.id)
    }
    if (!state.appointments[barbershop.id]) {
      state.appointments[barbershop.id] = []
    }
    
    this.saveStorageState(state)
  }

  async getBarbers(barbershopId: string): Promise<Barber[]> {
    const state = this.getStorageState()
    return state.barbers[barbershopId] || []
  }

  async saveBarber(barber: Barber): Promise<void> {
    const state = this.getStorageState()
    const shopBarbers = state.barbers[barber.barbershop_id] || []
    const index = shopBarbers.findIndex((b: Barber) => b.id === barber.id)
    
    if (index >= 0) {
      shopBarbers[index] = barber
    } else {
      shopBarbers.push(barber)
    }
    
    state.barbers[barber.barbershop_id] = shopBarbers
    this.saveStorageState(state)
  }

  async deleteBarber(barberId: string): Promise<void> {
    const state = this.getStorageState()
    for (const shopId in state.barbers) {
      state.barbers[shopId] = state.barbers[shopId].filter((b: Barber) => b.id !== barberId)
    }
    this.saveStorageState(state)
  }

  async getServices(barbershopId: string): Promise<Service[]> {
    const state = this.getStorageState()
    return state.services[barbershopId] || []
  }

  async saveService(service: Service): Promise<void> {
    const state = this.getStorageState()
    const shopServices = state.services[service.barbershop_id] || []
    const index = shopServices.findIndex((s: Service) => s.id === service.id)
    
    if (index >= 0) {
      shopServices[index] = service
    } else {
      shopServices.push(service)
    }
    
    state.services[service.barbershop_id] = shopServices
    this.saveStorageState(state)
  }

  async deleteService(serviceId: string): Promise<void> {
    const state = this.getStorageState()
    for (const shopId in state.services) {
      state.services[shopId] = state.services[shopId].filter((s: Service) => s.id !== serviceId)
    }
    this.saveStorageState(state)
  }

  async getAppointments(barbershopId: string): Promise<Appointment[]> {
    const state = this.getStorageState()
    return state.appointments[barbershopId] || []
  }

  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<Appointment> {
    const state = this.getStorageState()
    const shopAppointments = state.appointments[appointment.barbershop_id] || []
    
    const newAppointment: Appointment = {
      ...appointment,
      id: generateUUID(),
      created_at: new Date().toISOString()
    }
    
    shopAppointments.push(newAppointment)
    state.appointments[appointment.barbershop_id] = shopAppointments
    this.saveStorageState(state)
    return newAppointment
  }
}

// Global Singleton Database Instance
// When migrating to Supabase, swap this initialization to:
// export const db: DatabaseService = new SupabaseDatabase();
export const db: DatabaseService = new LocalStorageDatabase();
