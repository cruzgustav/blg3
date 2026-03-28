import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')

    const where = {
      published: true,
      ...(category && category !== 'Todos' && { category }),
      ...(featured === 'true' && { featured: true }),
    }

    const articles = await db.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        category: true,
        tags: true,
        featured: true,
        readTime: true,
        viewCount: true,
        likeCount: true,
        saveCount: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    })

    const formattedArticles = articles.map(article => ({
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : [],
      publishedAt: article.publishedAt?.toISOString() || null,
    }))

    return NextResponse.json({ articles: formattedArticles })
  } catch (error) {
    console.error('Erro ao buscar artigos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar artigos' },
      { status: 500 }
    )
  }
}
