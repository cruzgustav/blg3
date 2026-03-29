import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

export const runtime = 'edge'

async function checkAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (!token) return null

  const sessionResult = await db.execute({
    sql: 'SELECT * FROM Session WHERE token = ?',
    args: [token]
  })

  const session = sessionResult.rows[0]
  if (!session || new Date(session.expiresAt as string) < new Date()) {
    return null
  }

  return session
}

export async function GET() {
  try {
    const session = await checkAuth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const result = await db.execute({
      sql: 'SELECT * FROM Article ORDER BY createdAt DESC',
      args: []
    })

    // Buscar autores
    const authorMap = new Map<string, { name: string }>()
    if (result.rows.length > 0) {
      const authorIds = [...new Set(result.rows.map(r => r.authorId as string))]
      const authorsResult = await db.execute({
        sql: `SELECT id, name FROM Admin WHERE id IN (${authorIds.map(() => '?').join(',')})`,
        args: authorIds
      })
      authorsResult.rows.forEach(row => {
        authorMap.set(row.id as string, { name: row.name as string })
      })
    }

    const articles = result.rows.map(row => ({
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
      saveCount: row.saveCount as number,
      blocks: row.blocks ? JSON.parse(row.blocks as string) : [],
      authorId: row.authorId as string,
      author: authorMap.get(row.authorId as string) || { name: 'Admin' },
      publishedAt: row.publishedAt as string | null,
      createdAt: row.createdAt as string,
    }))

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Erro ao buscar artigos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar artigos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await checkAuth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, excerpt, category, tags, blocks, published, featured, readTime, coverImage } = body

    // Verificar se slug já existe
    const existing = await db.execute({
      sql: 'SELECT id FROM Article WHERE slug = ?',
      args: [slug]
    })

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Já existe um artigo com este slug' },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const publishedAt = published ? now : null

    await db.execute({
      sql: `INSERT INTO Article (id, slug, title, excerpt, category, tags, blocks, published, featured, readTime, coverImage, authorId, publishedAt, createdAt, updatedAt, viewCount, likeCount, saveCount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)`,
      args: [
        id,
        slug,
        title,
        excerpt || null,
        category,
        JSON.stringify(tags || []),
        JSON.stringify(blocks || []),
        published ? 1 : 0,
        featured ? 1 : 0,
        readTime || 5,
        coverImage || null,
        session.adminId,
        publishedAt,
        now,
        now
      ]
    })

    const result = await db.execute({
      sql: 'SELECT * FROM Article WHERE id = ?',
      args: [id]
    })

    const article = result.rows[0]

    return NextResponse.json({ 
      article: {
        id: article.id as string,
        slug: article.slug as string,
        title: article.title as string,
        excerpt: article.excerpt as string | null,
        category: article.category as string,
        tags: article.tags ? JSON.parse(article.tags as string) : [],
        published: !!article.published,
        featured: !!article.featured,
        readTime: article.readTime as number,
      }
    })
  } catch (error) {
    console.error('Erro ao criar artigo:', error)
    return NextResponse.json(
      { error: 'Erro ao criar artigo' },
      { status: 500 }
    )
  }
}
