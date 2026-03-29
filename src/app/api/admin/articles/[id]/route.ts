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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await checkAuth()
    if (!adminId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const result = await db.execute('SELECT * FROM Article WHERE id = ?', [id])

    if (result.length === 0) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 })
    }

    const row = result[0]

    // Buscar autor
    const authorResult = await db.execute('SELECT name, email FROM Admin WHERE id = ?', [row.authorId])
    const author = authorResult[0]

    return NextResponse.json({
      article: {
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        coverImage: row.coverImage,
        category: row.category,
        tags: row.tags ? JSON.parse(row.tags as string) : [],
        published: !!row.published,
        featured: !!row.featured,
        readTime: row.readTime,
        blocks: row.blocks ? JSON.parse(row.blocks as string) : [],
        authorId: row.authorId,
        author: author ? { name: author.name, email: author.email } : null,
        publishedAt: row.publishedAt || null,
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
    const adminId = await checkAuth()
    if (!adminId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, slug, excerpt, category, tags, blocks, published, featured, readTime, coverImage } = body

    // Verificar se slug já existe em outro artigo
    if (slug) {
      const existing = await db.execute('SELECT id FROM Article WHERE slug = ? AND id != ?', [slug, id])

      if (existing.length > 0) {
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

    await db.execute(`UPDATE Article SET ${updates.join(', ')} WHERE id = ?`, values)

    return NextResponse.json({ success: true })
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
    const adminId = await checkAuth()
    if (!adminId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    await db.execute('DELETE FROM Article WHERE id = ?', [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir artigo:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir artigo' },
      { status: 500 }
    )
  }
}
