import { NextResponse } from 'next/server'
import { db, getArticleBySlug } from '@/lib/db'

export const runtime = 'edge'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const article = await getArticleBySlug(slug)

    if (!article || !article.published) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      )
    }

    // Incrementar visualizações
    await db.execute('UPDATE Article SET viewCount = viewCount + 1 WHERE id = ?', [article.id])

    // Buscar autor
    const authorResult = await db.execute('SELECT name, email, avatar FROM Admin WHERE id = ?', [article.authorId])
    const author = authorResult[0] || { name: 'Admin', email: '', avatar: null }

    return NextResponse.json({ 
      article: {
        ...article,
        author: {
          name: author.name as string,
          email: author.email as string,
          avatar: author.avatar as string | null,
        },
      }
    })
  } catch (error) {
    console.error('Erro ao buscar artigo:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar artigo' },
      { status: 500 }
    )
  }
}
