// ========================================
// VORTEK BLOG - DATABASE CLIENT (TURSO)
// ========================================
// Usando @libsql/client/http diretamente (usa fetch API)
// Compatível com Cloudflare Workers / Edge Runtime

import { createClient, type Client } from '@libsql/client/http'

const globalForDb = globalThis as unknown as {
  db: Client | undefined
}

// Configuração do Turso
const TURSO_URL = process.env.TURSO_DATABASE_URL || 
  (process.env.DATABASE_URL?.startsWith('libsql://') ? process.env.DATABASE_URL : '') ||
  'libsql://vortek-blog-cruzgustav.aws-us-east-1.turso.io'
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || ''

function createDbClient(): Client {
  // Converter URL libsql:// para https://
  let url = TURSO_URL
  if (url.startsWith('libsql://')) {
    url = url.replace('libsql://', 'https://')
  }

  // Verificar se a URL é válida
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    throw new Error(`Invalid DATABASE_URL: ${TURSO_URL}. Must start with libsql://, https://, or http://`)
  }

  // Criar cliente HTTP (usa fetch nativo - compatível com Edge Runtime)
  return createClient({
    url: url,
    authToken: TURSO_TOKEN || undefined,
  })
}

// Cliente libsql para queries diretas
export const db = globalForDb.db ?? createDbClient()

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db
}

// Helper para queries comuns
export const queries = {
  // Artigos
  async getArticles(options?: { category?: string; published?: boolean }) {
    let sql = 'SELECT * FROM Article'
    const conditions: string[] = []
    const params: any[] = []
    
    if (options?.published !== undefined) {
      conditions.push('published = ?')
      params.push(options.published ? 1 : 0)
    }
    if (options?.category) {
      conditions.push('category = ?')
      params.push(options.category)
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }
    sql += ' ORDER BY createdAt DESC'
    
    const result = await db.execute({ sql, args: params })
    return result.rows.map(row => ({
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      excerpt: row.excerpt as string | null,
      coverImage: row.coverImage as string | null,
      category: row.category as string,
      tags: row.tags ? JSON.parse(row.tags as string) : [],
      published: !!row.published,
      featured: !!row.featured,
      readTime: row.readTime as number,
      viewCount: row.viewCount as number,
      likeCount: row.likeCount as number,
      blocks: row.blocks ? JSON.parse(row.blocks as string) : [],
      authorId: row.authorId as string,
      publishedAt: row.publishedAt as string | null,
      createdAt: row.createdAt as string,
    }))
  },

  async getArticleBySlug(slug: string) {
    const result = await db.execute({
      sql: 'SELECT * FROM Article WHERE slug = ?',
      args: [slug]
    })
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      excerpt: row.excerpt as string | null,
      coverImage: row.coverImage as string | null,
      category: row.category as string,
      tags: row.tags ? JSON.parse(row.tags as string) : [],
      published: !!row.published,
      featured: !!row.featured,
      readTime: row.readTime as number,
      viewCount: row.viewCount as number,
      likeCount: row.likeCount as number,
      blocks: row.blocks ? JSON.parse(row.blocks as string) : [],
      authorId: row.authorId as string,
      publishedAt: row.publishedAt as string | null,
      createdAt: row.createdAt as string,
    }
  },

  async getFeaturedArticle() {
    const result = await db.execute({
      sql: 'SELECT * FROM Article WHERE published = 1 AND featured = 1 ORDER BY publishedAt DESC LIMIT 1',
      args: []
    })
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      excerpt: row.excerpt as string | null,
      coverImage: row.coverImage as string | null,
      category: row.category as string,
      tags: row.tags ? JSON.parse(row.tags as string) : [],
      published: !!row.published,
      featured: !!row.featured,
      readTime: row.readTime as number,
      viewCount: row.viewCount as number,
      likeCount: row.likeCount as number,
      blocks: row.blocks ? JSON.parse(row.blocks as string) : [],
      authorId: row.authorId as string,
      publishedAt: row.publishedAt as string | null,
      createdAt: row.createdAt as string,
    }
  },

  // Admin
  async getAdminByEmail(email: string) {
    const result = await db.execute({
      sql: 'SELECT * FROM Admin WHERE email = ?',
      args: [email]
    })
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      id: row.id as string,
      email: row.email as string,
      password: row.password as string,
      name: row.name as string,
      avatar: row.avatar as string | null,
    }
  },

  // Categorias
  async getCategories() {
    const result = await db.execute({
      sql: 'SELECT DISTINCT category FROM Article WHERE published = 1',
      args: []
    })
    return result.rows.map(row => row.category as string)
  },
}
