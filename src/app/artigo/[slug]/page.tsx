import { db } from '@/lib/db'
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
    notFound()
  }

  // Incrementar contador de visualizações (não aguardar)
  db.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {})

  // Parse e ordenar blocos no servidor
  const parsedBlocks = JSON.parse(article.blocks)
  const sortedBlocks = parsedBlocks.sort((a: { order: number }, b: { order: number }) => a.order - b.order)

  // Formatar dados para o cliente
  const formattedArticle = {
    ...article,
    tags: article.tags ? JSON.parse(article.tags) : [],
    blocks: sortedBlocks,
    publishedAt: article.publishedAt?.toISOString() || null,
  }

  // Buscar artigos relacionados
  const relatedArticles = await db.article.findMany({
    where: {
      published: true,
      category: article.category,
      NOT: { id: article.id },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      category: true,
      readTime: true,
      publishedAt: true,
    },
  })

  const formattedRelated = relatedArticles.map(a => ({
    ...a,
    publishedAt: a.publishedAt?.toISOString() || null,
  }))

  return (
    <ArticlePageClient
      article={formattedArticle}
      relatedArticles={formattedRelated}
    />
  )
}
