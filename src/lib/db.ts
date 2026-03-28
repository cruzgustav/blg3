// ========================================
// VORTEK BLOG - PRISMA CLIENT (TURSO)
// ========================================
// Prisma 7 + Turso/LibSQL

import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuração do Turso
const TURSO_URL = process.env.DATABASE_URL || process.env.TURSO_URL || ''
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || ''

function createPrismaClient(): PrismaClient {
  // Criar adapter com configuração do Turso
  const adapter = new PrismaLibSql({
    url: TURSO_URL,
    authToken: TURSO_TOKEN || undefined,
  })

  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
