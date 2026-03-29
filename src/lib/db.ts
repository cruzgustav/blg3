// ========================================
// VORTEK BLOG - DATABASE CLIENT (TURSO)
// ========================================
// Implementação própria usando fetch nativo
// 100% compatível com Cloudflare Workers / Edge Runtime

// Configuração do Turso - suporta múltiplas variações de nomes
function getTursoConfig() {
  // Tenta várias variações de nomes de variáveis de ambiente
  const url = 
    process.env.TURSO_DATABASE_URL || 
    process.env.TURSO_DB_URL ||
    process.env.DATABASE_URL ||
    process.env.DB_URL ||
    process.env.TURSO_URL ||
    ''
  
  const token = 
    process.env.TURSO_AUTH_TOKEN ||
    process.env.TURSO_TOKEN ||
    process.env.TURSO_AUTH ||
    process.env.AUTH_TOKEN ||
    process.env.DATABASE_AUTH_TOKEN ||
    ''
  
  // Log para debug (sem expor o token completo)
  console.log('[DB] Config - URL encontrada:', url ? 'SIM' : 'NÃO')
  console.log('[DB] Config - Token encontrado:', token ? 'SIM' : 'NÃO')
  console.log('[DB] Config - URL (primeiros 30 chars):', url?.substring(0, 30) || 'VAZIO')
  
  // Converter libsql:// para https://
  let httpUrl = url
  if (httpUrl.startsWith('libsql://')) {
    httpUrl = httpUrl.replace('libsql://', 'https://')
  }
  
  // Se não tiver URL, usar um placeholder que vai falhar graciosamente
  if (!httpUrl) {
    console.error('[DB] ERRO: Nenhuma URL de banco de dados configurada!')
    console.error('[DB] Variáveis disponíveis:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('TURSO') || k.includes('DB') || k.includes('AUTH')))
  }
  
  return { url: httpUrl, token }
}

// Cliente Turso usando API REST simples
class TursoClient {
  private url: string
  private token: string
  private initialized: boolean = false

  constructor(url: string, token: string) {
    this.url = url
    this.token = token
    console.log('[DB] TursoClient criado')
  }

  async execute(sql: string, params: any[] = []): Promise<any[]> {
    // Verificar se tem configuração válida
    if (!this.url) {
      console.error('[DB] URL não configurada - retornando array vazio')
      return []
    }

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

    if (!this.initialized) {
      console.log('[DB] Primeira execução - URL:', this.url.substring(0, 50) + '...')
      this.initialized = true
    }

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const text = await response.text()
        console.error('[DB] Erro HTTP:', response.status, text.substring(0, 200))
        throw new Error(`Turso error: ${response.status} - ${text}`)
      }

      const results = await response.json()
      
      // Extrair rows do resultado
      const result = results.results?.[0]
      if (result?.error) {
        console.error('[DB] Erro SQL:', result.error)
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
    } catch (error) {
      console.error('[DB] Erro na execução:', error)
      throw error
    }
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
