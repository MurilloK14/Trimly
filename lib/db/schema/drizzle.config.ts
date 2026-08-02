import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  // Ponto de entrada do schema — drizzle-kit lê todas as exportações
  schema: './src/lib/db/schema/index.ts',

  // Diretório onde as migrations serão geradas
  out: './src/lib/db/migrations',

  dialect: 'postgresql',

  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // Habilita logs das queries em desenvolvimento
  verbose: true,

  // Exige confirmação antes de executar operações destrutivas
  strict: true,
})
