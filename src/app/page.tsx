import { db } from '@/lib/db'
import { HomeClient } from './home-client'

// Edge Runtime para Cloudflare Pages
export const runtime = 'edge'

// Forçar renderização dinâmica (não prerenderizar durante build)
export const dynamic = 'force-dynamic'

// SSR - Buscar artigos no servidor
export default async function HomePage() {
  // Buscar artigo em destaque
  const featuredArticle = await db.article.findFirst({
    where: { published: true, featured: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      category: true,
      readTime: true,
      viewCount: true,
      likeCount: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  })

  // Buscar outros artigos
  const articles = await db.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
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
      author: { select: { name: true } },
    },
  })

  // Buscar categorias únicas
  const categoriesResult = await db.article.findMany({
    where: { published: true },
    select: { category: true },
    distinct: ['category'],
  })
  const categories = ['Todos', ...categoriesResult.map(c => c.category)]

  // Formatar dados
  const formattedFeatured = featuredArticle ? {
    ...featuredArticle,
    publishedAt: featuredArticle.publishedAt?.toISOString() || null,
  } : null

  const formattedArticles = articles.map(article => ({
    ...article,
    tags: article.tags ? JSON.parse(article.tags) : [],
    publishedAt: article.publishedAt?.toISOString() || null,
  }))

  return (
    <HomeClient
      featuredArticle={formattedFeatured}
      articles={formattedArticles}
      categories={categories}
    />
  )
}
