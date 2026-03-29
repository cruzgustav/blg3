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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkAuth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const result = await db.execute({
      sql: 'SELECT * FROM Article WHERE id = ?',
      args: [id]
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 })
    }

    const row = result.rows[0]

    // Buscar autor
    const authorResult = await db.execute({
      sql: 'SELECT name, email FROM Admin WHERE id = ?',
      args: [row.authorId]
    })
    const author = authorResult.rows[0]

    return NextResponse.json({
      article: {
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
        blocks: row.blocks ? JSON.parse(row.blocks as string) : [],
        authorId: row.authorId as string,
        author: author ? { name: author.name, email: author.email } : null,
        publishedAt: row.publishedAt as string | null,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar artigo:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar artigo' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkAuth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, slug, excerpt, category, tags, blocks, published, featured, readTime, coverImage } = body

    // Verificar se slug já existe em outro artigo
    if (slug) {
      const existing = await db.execute({
        sql: 'SELECT id FROM Article WHERE slug = ? AND id != ?',
        args: [slug, id]
      })

      if (existing.rows.length > 0) {
        return NextResponse.json(
          { error: 'Já existe outro artigo com este slug' },
          { status: 400 }
        )
      }
    }

    // Construir UPDATE dinâmico
    const updates: string[] = []
    const values: any[] = []

    if (title !== undefined) { updates.push('title = ?'); values.push(title) }
    if (slug !== undefined) { updates.push('slug = ?'); values.push(slug) }
    if (excerpt !== undefined) { updates.push('excerpt = ?'); values.push(excerpt) }
    if (category !== undefined) { updates.push('category = ?'); values.push(category) }
    if (tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(tags)) }
    if (blocks !== undefined) { updates.push('blocks = ?'); values.push(JSON.stringify(blocks)) }
    if (published !== undefined) {
      updates.push('published = ?')
      values.push(published ? 1 : 0)
      if (published) {
        updates.push('publishedAt = ?')
        values.push(new Date().toISOString())
      }
    }
    if (featured !== undefined) { updates.push('featured = ?'); values.push(featured ? 1 : 0) }
    if (readTime !== undefined) { updates.push('readTime = ?'); values.push(readTime) }
    if (coverImage !== undefined) { updates.push('coverImage = ?'); values.push(coverImage) }

    updates.push('updatedAt = ?')
    values.push(new Date().toISOString())

    values.push(id)

    await db.execute({
      sql: `UPDATE Article SET ${updates.join(', ')} WHERE id = ?`,
      args: values
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
      }
    })
  } catch (error) {
    console.error('Erro ao atualizar artigo:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar artigo' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await checkAuth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    await db.execute({
      sql: 'DELETE FROM Article WHERE id = ?',
      args: [id]
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir artigo:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir artigo' },
      { status: 500 }
    )
  }
}
