import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'edge'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const result = await db.execute({
      sql: 'SELECT * FROM Article WHERE slug = ? AND published = 1',
      args: [slug]
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      )
    }

    const row = result.rows[0]

    // Incrementar visualizações
    await db.execute({
      sql: 'UPDATE Article SET viewCount = viewCount + 1 WHERE id = ?',
      args: [row.id]
    })

    // Buscar autor
    const authorResult = await db.execute({
      sql: 'SELECT name, email, avatar FROM Admin WHERE id = ?',
      args: [row.authorId]
    })
    const author = authorResult.rows[0] || { name: 'Admin', email: '', avatar: null }

    const article = {
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
      author: {
        name: author.name as string,
        email: author.email as string,
        avatar: author.avatar as string | null,
      },
      publishedAt: row.publishedAt as string | null,
      createdAt: row.createdAt as string,
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Erro ao buscar artigo:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar artigo' },
      { status: 500 }
    )
  }
}
