import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

export const runtime = 'edge'

export async function GET() {
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

    const articles = await db.article.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true },
        },
      },
    })

    return NextResponse.json({
      articles: articles.map(a => ({
        ...a,
        tags: a.tags ? JSON.parse(a.tags) : [],
        blocks: JSON.parse(a.blocks),
        publishedAt: a.publishedAt?.toISOString() || null,
      })),
    })
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

    const body = await request.json()
    const { title, slug, excerpt, category, tags, blocks, published, featured, readTime, coverImage } = body

    const existing = await db.article.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um artigo com este slug' },
        { status: 400 }
      )
    }

    const article = await db.article.create({
      data: {
        title,
        slug,
        excerpt,
        category,
        tags: JSON.stringify(tags || []),
        blocks: JSON.stringify(blocks || []),
        published: published || false,
        featured: featured || false,
        readTime: readTime || 5,
        coverImage,
        authorId: session.adminId,
        publishedAt: published ? new Date() : null,
      },
    })

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Erro ao criar artigo:', error)
    return NextResponse.json(
      { error: 'Erro ao criar artigo' },
      { status: 500 }
    )
  }
}
