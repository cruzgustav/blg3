import { getArticles } from '@/lib/db'
import { SalvosClient } from './salvos-client'

// Edge Runtime para Cloudflare Pages
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// SSR - Buscar todos os artigos publicados
export default async function SalvosPage() {
  // Buscar todos os artigos publicados
  const articles = await getArticles({ published: true })

  // Passar apenas dados necessários para o cliente
  const articlesData = articles.map(article => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    category: article.category,
    readTime: article.readTime,
    viewCount: article.viewCount,
    likeCount: article.likeCount,
    publishedAt: article.publishedAt,
  }))

  return <SalvosClient articles={articlesData} />
}
