import { NextResponse } from 'next/server'
import { db, getArticles } from '@/lib/db'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')

    const articles = await getArticles({ 
      category: category && category !== 'Todos' ? category : undefined,
      published: true,
    })

    // Filtrar featured se necessário
    let filtered = featured === 'true' ? articles.filter(a => a.featured) : articles

    // Limitar se necessário
    if (limit) {
      filtered = filtered.slice(0, parseInt(limit))
    }

    // Buscar autores
    const authorMap = new Map<string, string>()
    if (filtered.length > 0) {
      const authorIds = [...new Set(filtered.map(a => a.authorId))]
      const placeholders = authorIds.map(() => '?').join(',')
      const authorsResult = await db.execute(
        `SELECT id, name FROM Admin WHERE id IN (${placeholders})`,
        authorIds
      )
      authorsResult.forEach((row: any) => {
        authorMap.set(row.id, row.name)
      })
    }

    const formattedArticles = filtered.map(article => ({
      ...article,
      author: { name: authorMap.get(article.authorId) || 'Admin' },
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
