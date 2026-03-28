import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

export const runtime = 'edge'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const article = await db.article.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    })

    if (!article) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      article: {
        ...article,
        tags: article.tags ? JSON.parse(article.tags) : [],
        blocks: JSON.parse(article.blocks),
        publishedAt: article.publishedAt?.toISOString() || null,
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
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const session = await db.session.findUnique({
      where: { token },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, slug, excerpt, category, tags, blocks, published, featured, readTime, coverImage } = body

    if (slug) {
      const existing = await db.article.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Já existe outro artigo com este slug' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (slug !== undefined) updateData.slug = slug
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = JSON.stringify(tags)
    if (blocks !== undefined) updateData.blocks = JSON.stringify(blocks)
    if (published !== undefined) {
      updateData.published = published
      if (published) updateData.publishedAt = new Date()
    }
    if (featured !== undefined) updateData.featured = featured
    if (readTime !== undefined) updateData.readTime = readTime
    if (coverImage !== undefined) updateData.coverImage = coverImage

    const article = await db.article.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ article })
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
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const session = await db.session.findUnique({
      where: { token },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 })
    }

    const { id } = await params

    await db.article.delete({
      where: { id },
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
