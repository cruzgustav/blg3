import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const article = await db.article.findUnique({
      where: { slug, published: true },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      )
    }

    await db.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    })

    const formattedArticle = {
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : [],
      blocks: JSON.parse(article.blocks),
      publishedAt: article.publishedAt?.toISOString() || null,
    }

    return NextResponse.json({ article: formattedArticle })
  } catch (error) {
    console.error('Erro ao buscar artigo:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar artigo' },
      { status: 500 }
    )
  }
}
