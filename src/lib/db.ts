// ========================================
// VORTEK BLOG - PRISMA CLIENT (TURSO)
// ========================================
// Prisma 7 + Turso/LibSQL para Cloudflare Workers

import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql/web'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuração do Turso
// Usar TURSO_DATABASE_URL para evitar conflito com DATABASE_URL do sistema
// Fallback para DATABASE_URL se for uma URL libsql válida
const TURSO_URL = process.env.TURSO_DATABASE_URL || 
  (process.env.DATABASE_URL?.startsWith('libsql://') ? process.env.DATABASE_URL : '') ||
  'libsql://vortek-blog-cruzgustav.aws-us-east-1.turso.io'
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || ''

function createPrismaClient(): PrismaClient {
  // Verificar se a URL é válida
  if (!TURSO_URL.startsWith('libsql://') && !TURSO_URL.startsWith('https://') && !TURSO_URL.startsWith('http://')) {
    throw new Error(`Invalid DATABASE_URL: ${TURSO_URL}. Must start with libsql://, https://, or http://`)
  }

  // Criar adapter PrismaLibSql diretamente com config
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
