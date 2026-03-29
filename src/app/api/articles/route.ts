import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')

    let sql = 'SELECT * FROM Article WHERE published = 1'
    const args: any[] = []

    if (category && category !== 'Todos') {
      sql += ' AND category = ?'
      args.push(category)
    }
    if (featured === 'true') {
      sql += ' AND featured = 1'
    }

    sql += ' ORDER BY publishedAt DESC'

    if (limit) {
      sql += ' LIMIT ?'
      args.push(parseInt(limit))
    }

    const result = await db.execute({ sql, args })

    // Buscar autores
    const authorMap = new Map<string, string>()
    if (result.rows.length > 0) {
      const authorIds = [...new Set(result.rows.map(r => r.authorId as string))]
      const authorsResult = await db.execute({
        sql: `SELECT id, name FROM Admin WHERE id IN (${authorIds.map(() => '?').join(',')})`,
        args: authorIds
      })
      authorsResult.rows.forEach(row => {
        authorMap.set(row.id as string, row.name as string)
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
      featured: !!row.featured,
      readTime: row.readTime as number,
      viewCount: row.viewCount as number,
      likeCount: row.likeCount as number,
      saveCount: row.saveCount as number,
      publishedAt: row.publishedAt as string | null,
      author: { name: authorMap.get(row.authorId as string) || 'Admin' },
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
