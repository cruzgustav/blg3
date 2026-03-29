import { db, queries } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ArticlePageClient } from './article-client'

// Edge Runtime para Cloudflare Pages
export const runtime = 'edge'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

// SSR - Buscar artigo no servidor
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const article = await queries.getArticleBySlug(slug)

  if (!article || !article.published) {
    notFound()
  }

  // Incrementar contador de visualizações (não aguardar)
  db.execute({
    sql: 'UPDATE Article SET viewCount = viewCount + 1 WHERE id = ?',
    args: [article.id]
  }).catch(() => {})

  // Buscar autor
  const authorResult = await db.execute({
    sql: 'SELECT name, email, avatar FROM Admin WHERE id = ?',
    args: [article.authorId]
  })
  const author = authorResult.rows[0] || { name: 'Admin', email: '', avatar: null }

  // Parse e ordenar blocos no servidor
  const parsedBlocks = article.blocks
  const sortedBlocks = parsedBlocks.sort((a: { order: number }, b: { order: number }) => a.order - b.order)

  // Formatar dados para o cliente
  const formattedArticle = {
    ...article,
    author: {
      name: author.name as string,
      email: author.email as string,
      avatar: author.avatar as string | null,
    },
    blocks: sortedBlocks,
    publishedAt: article.publishedAt || null,
  }

  // Buscar artigos relacionados
  const relatedResult = await db.execute({
    sql: `SELECT id, slug, title, excerpt, coverImage, category, readTime, publishedAt 
          FROM Article 
          WHERE published = 1 AND category = ? AND id != ? 
          ORDER BY publishedAt DESC LIMIT 3`,
    args: [article.category, article.id]
  })
  
  const formattedRelated = relatedResult.rows.map(row => ({
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: row.excerpt as string | null,
    coverImage: row.coverImage as string | null,
    category: row.category as string,
    readTime: row.readTime as number,
    publishedAt: row.publishedAt as string | null,
  }))

  return (
    <ArticlePageClient
      article={formattedArticle}
      relatedArticles={formattedRelated}
    />
  )
}
