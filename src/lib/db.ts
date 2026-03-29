// ========================================
// VORTEK BLOG - DATABASE CLIENT (TURSO)
// ========================================
// Implementação própria usando fetch nativo
// 100% compatível com Cloudflare Workers / Edge Runtime
// Usa a API HTTP v2 do Turso (Hrana 2)

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
  
  // Log para debug
  console.log('[DB] Config - URL encontrada:', url ? 'SIM' : 'NÃO')
  console.log('[DB] Config - Token encontrado:', token ? 'SIM' : 'NÃO')
  
  // Converter libsql:// para https:// e adicionar endpoint da API v2
  let httpUrl = url
  if (httpUrl.startsWith('libsql://')) {
    httpUrl = httpUrl.replace('libsql://', 'https://')
  }
  
  // Adicionar endpoint /v2/pipeline
  if (!httpUrl.includes('/v2/pipeline')) {
    httpUrl = httpUrl.replace(/\/$/, '') + '/v2/pipeline'
  }
  
  console.log('[DB] URL final:', httpUrl)
  
  if (!url) {
    console.error('[DB] ERRO: Nenhuma URL de banco de dados configurada!')
  }
  
  return { url: httpUrl, token }
}

// Cliente Turso usando API HTTP v2 (Hrana 2)
class TursoClient {
  private url: string
  private token: string

  constructor(url: string, token: string) {
    this.url = url
    this.token = token
    console.log('[DB] TursoClient criado')
  }

  async execute(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.url) {
      console.error('[DB] URL não configurada')
      return []
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    // Formato da API v2 do Turso (Hrana 2)
    const body = {
      requests: [
        {
          type: 'execute',
          stmt: {
            sql: sql,
            args: params.map(p => this.convertArg(p))
          }
        },
        { type: 'close' }
      ]
    }

    console.log('[DB] Executando SQL:', sql.substring(0, 50) + '...')

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      console.log('[DB] Status:', response.status)

      if (!response.ok) {
        const text = await response.text()
        console.error('[DB] Erro HTTP:', response.status, text)
        throw new Error(`Turso error: ${response.status} - ${text}`)
      }

      const data = await response.json()
      
      // Processar resposta da API v2
      const result = data.results?.[0]
      
      if (result?.type === 'error') {
        console.error('[DB] Erro SQL:', result.error)
        throw new Error(`SQL error: ${result.error?.message || result.error}`)
      }
      
      if (result?.response?.type === 'execute') {
        const cols = result.response.result?.cols || []
        const rows = result.response.result?.rows || []
        
        console.log('[DB] Rows:', rows.length, 'Cols:', cols.length)
        
        // Converter rows para objetos
        return rows.map((row: any[]) => {
          const obj: Record<string, any> = {}
          row.forEach((cell, i) => {
            if (cols[i]) {
              // Extrair valor da célula (formato {type: "xxx", value: ...})
              const value = cell?.value
              obj[cols[i].name] = value
            }
          })
          return obj
        })
      }
      
      return []
    } catch (error) {
      console.error('[DB] Erro:', error)
      throw error
    }
  }

  // Converter argumento para o formato da API v2
  private convertArg(value: any): any {
    if (value === null || value === undefined) {
      return { type: 'null' }
    }
    if (typeof value === 'string') {
      return { type: 'text', value }
    }
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return { type: 'integer', value: String(value) }
      }
      return { type: 'float', value: String(value) }
    }
    if (typeof value === 'boolean') {
      return { type: 'integer', value: value ? '1' : '0' }
    }
    // Default: text
    return { type: 'text', value: String(value) }
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
