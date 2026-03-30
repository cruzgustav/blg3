import { db, getArticleBySlug } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ArticlePageClient } from './article-client'
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld'
import { Metadata } from 'next'

// Edge Runtime para Cloudflare Pages
export const runtime = 'edge'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

// Gerar metadata para SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article || !article.published) {
    return {
      title: 'Artigo não encontrado',
    }
  }

  const title = article.metaTitle || article.title
  const description = article.metaDescription || article.excerpt || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.publishedAt || undefined,
      authors: ['Vortek'],
      images: article.coverImage ? [
        {
          url: article.coverImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.coverImage ? [article.coverImage] : [],
    },
    alternates: {
      canonical: `/artigo/${slug}`,
    },
  }
}

// SSR - Buscar artigo no servidor
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const article = await getArticleBySlug(slug)

  if (!article || !article.published) {
    notFound()
  }

  // Incrementar contador de visualizações (não aguardar)
  db.execute('UPDATE Article SET viewCount = viewCount + 1 WHERE id = ?', [article.id]).catch(() => {})

  // Buscar autor
  const authorResult = await db.execute('SELECT name, email, avatar FROM Admin WHERE id = ?', [article.authorId])
  const author = authorResult[0] || { name: 'Admin', email: '', avatar: null }

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
  const relatedResult = await db.execute(
    `SELECT id, slug, title, excerpt, coverImage, category, readTime, publishedAt 
     FROM Article 
     WHERE published = 1 AND category = ? AND id != ? 
     ORDER BY publishedAt DESC LIMIT 3`,
    [article.category, article.id]
  )
  
  const formattedRelated = relatedResult.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.coverImage,
    category: row.category,
    readTime: row.readTime,
    publishedAt: row.publishedAt || null,
  }))

  // URL completa para Schema.org
  const articleUrl = `https://vortek.blog/artigo/${slug}`

  return (
    <>
      {/* Schema.org JSON-LD */}
      <ArticleJsonLd article={formattedArticle} url={articleUrl} />
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://vortek.blog' },
        { name: formattedArticle.category, url: `https://vortek.blog/?category=${formattedArticle.category}` },
        { name: formattedArticle.title, url: articleUrl },
      ]} />
      
      <ArticlePageClient
        article={formattedArticle}
        relatedArticles={formattedRelated}
      />
    </>
  )
}
