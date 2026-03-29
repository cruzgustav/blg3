// ========================================
// VORTEK BLOG - DATABASE CLIENT (TURSO)
// ========================================
// Implementação própria usando fetch nativo
// 100% compatível com Cloudflare Workers / Edge Runtime

// Configuração do Turso
function getTursoConfig() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'libsql://vortek-blog-cruzgustav.aws-us-east-1.turso.io'
  const token = process.env.TURSO_AUTH_TOKEN || ''
  
  // Converter libsql:// para https://
  let httpUrl = url
  if (httpUrl.startsWith('libsql://')) {
    httpUrl = httpUrl.replace('libsql://', 'https://')
  }
  
  return { url: httpUrl, token }
}

// Cliente Turso usando API REST simples
class TursoClient {
  private url: string
  private token: string

  constructor(url: string, token: string) {
    this.url = url
    this.token = token
  }

  async execute(sql: string, params: any[] = []): Promise<any[]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    // API REST do Turso - formato correto
    const body = {
      statements: [
        {
          q: sql,
          params: params,
        },
      ],
    }

    const response = await fetch(this.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Turso error: ${response.status} - ${text}`)
    }

    const results = await response.json()
    
    // Extrair rows do resultado
    const result = results.results?.[0]
    if (result?.error) {
      throw new Error(`SQL error: ${result.error.message || result.error}`)
    }
    
    const rows = result?.rows || []
    const columns = result?.columns || []
    
    return rows.map((row: any[]) => {
      const obj: Record<string, any> = {}
      row.forEach((val, i) => {
        if (columns[i]) {
          obj[columns[i]] = val
        }
      })
      return obj
    })
  }
}

// Criar cliente singleton
const config = getTursoConfig()
const client = new TursoClient(config.url, config.token)

// Exportar cliente
export const db = client

// Helper para parsear JSON com segurança
function safeJsonParse(val: any): any {
  if (val === null || val === undefined) return []
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    try {
      return JSON.parse(val)
    } catch {
      return []
    }
  }
  return []
}

// Funções helper
export async function getArticles(options?: { category?: string; published?: boolean }) {
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
  
  const rows = await client.execute(sql, params)
  return rows.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.coverImage,
    category: row.category,
    tags: safeJsonParse(row.tags),
    published: !!row.published,
    featured: !!row.featured,
    readTime: row.readTime,
    viewCount: row.viewCount,
    likeCount: row.likeCount,
    blocks: safeJsonParse(row.blocks),
    authorId: row.authorId,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
  }))
}

export async function getArticleBySlug(slug: string) {
  const rows = await client.execute('SELECT * FROM Article WHERE slug = ?', [slug])
  if (rows.length === 0) return null
  const row = rows[0]
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.coverImage,
    category: row.category,
    tags: safeJsonParse(row.tags),
    published: !!row.published,
    featured: !!row.featured,
    readTime: row.readTime,
    viewCount: row.viewCount,
    likeCount: row.likeCount,
    blocks: safeJsonParse(row.blocks),
    authorId: row.authorId,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
  }
}

export async function getFeaturedArticle() {
  const rows = await client.execute(
    'SELECT * FROM Article WHERE published = 1 AND featured = 1 ORDER BY publishedAt DESC LIMIT 1',
    []
  )
  if (rows.length === 0) return null
  const row = rows[0]
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.coverImage,
    category: row.category,
    tags: safeJsonParse(row.tags),
    published: !!row.published,
    featured: !!row.featured,
    readTime: row.readTime,
    viewCount: row.viewCount,
    likeCount: row.likeCount,
    blocks: safeJsonParse(row.blocks),
    authorId: row.authorId,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
  }
}

export async function getAdminByEmail(email: string) {
  const rows = await client.execute('SELECT * FROM Admin WHERE email = ?', [email])
  if (rows.length === 0) return null
  const row = rows[0]
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    avatar: row.avatar,
  }
}

export async function getCategories() {
  const rows = await client.execute('SELECT DISTINCT category FROM Article WHERE published = 1', [])
  return rows.map((row: any) => row.category)
}
