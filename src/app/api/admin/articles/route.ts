import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

export const runtime = 'edge'

async function checkAuth(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (!token) return null

  const sessionResult = await db.execute('SELECT * FROM Session WHERE token = ?', [token])
  const session = sessionResult[0]
  if (!session || new Date(session.expiresAt as string) < new Date()) {
    return null
  }

  return session.adminId as string
}

export async function GET() {
  try {
    const adminId = await checkAuth()
    if (!adminId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const result = await db.execute('SELECT * FROM Article ORDER BY createdAt DESC', [])

    // Buscar autores
    const authorMap = new Map<string, { name: string }>()
    if (result.length > 0) {
      const authorIds = [...new Set(result.map((r: any) => r.authorId))]
      const placeholders = authorIds.map(() => '?').join(',')
      const authorsResult = await db.execute(
        `SELECT id, name FROM Admin WHERE id IN (${placeholders})`,
        authorIds
      )
      authorsResult.forEach((row: any) => {
        authorMap.set(row.id, { name: row.name })
      })
    }

    const articles = result.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      coverImage: row.coverImage,
      category: row.category,
      tags: row.tags ? JSON.parse(row.tags) : [],
      published: !!row.published,
      featured: !!row.featured,
      readTime: row.readTime,
      viewCount: row.viewCount,
      likeCount: row.likeCount,
      saveCount: row.saveCount,
      blocks: row.blocks ? JSON.parse(row.blocks) : [],
      authorId: row.authorId,
      author: authorMap.get(row.authorId) || { name: 'Admin' },
      publishedAt: row.publishedAt || null,
      createdAt: row.createdAt,
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
    const adminId = await checkAuth()
    if (!adminId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, excerpt, category, tags, blocks, published, featured, readTime, coverImage } = body

    // Verificar se slug já existe
    const existing = await db.execute('SELECT id FROM Article WHERE slug = ?', [slug])

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Já existe um artigo com este slug' },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const publishedAt = published ? now : null

    await db.execute(
      `INSERT INTO Article (id, slug, title, excerpt, category, tags, blocks, published, featured, readTime, coverImage, authorId, publishedAt, createdAt, updatedAt, viewCount, likeCount, saveCount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)`,
      [
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
        adminId,
        publishedAt,
        now,
        now
      ]
    )

    return NextResponse.json({ 
      article: {
        id,
        slug,
        title,
        excerpt,
        category,
        published,
        featured,
        readTime,
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
