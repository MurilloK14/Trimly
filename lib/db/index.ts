import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Singleton: reutiliza a conexão entre invocações no mesmo processo.
// Em desenvolvimento com hot reload, evita criar conexões excessivas.
const globalForDb = globalThis as unknown as { _pgClient?: postgres.Sql }

const client =
  globalForDb._pgClient ??
  postgres(process.env.DATABASE_URL!, {
    // Supabase suporta até 15 conexões no plano free com pgBouncer.
    // Ajuste conforme o plano/camada de conexão utilizada.
    max: 10,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb._pgClient = client
}

export const db = drizzle(client, { schema })

// Re-exporta o schema para conveniência
export * from './schema'
