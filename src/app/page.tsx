import { db, getArticles, getFeaturedArticle, getCategories } from '@/lib/db'
import { HomeClient } from './home-client'

// Edge Runtime para Cloudflare Pages
export const runtime = 'edge'

// Forçar renderização dinâmica (não prerenderizar durante build)
export const dynamic = 'force-dynamic'

// SSR - Buscar artigos no servidor
export default async function HomePage() {
  try {
    console.log('[PAGE] Iniciando busca de dados...')
    
    // Buscar artigo em destaque
    const featuredArticle = await getFeaturedArticle()
    console.log('[PAGE] Featured article:', featuredArticle ? 'encontrado' : 'não encontrado')

    // Buscar outros artigos
    const articles = await getArticles({ published: true })
    console.log('[PAGE] Artigos encontrados:', articles.length)

    // Buscar categorias únicas
    const categoriesResult = await getCategories()
    const categories = ['Todos', ...categoriesResult]
    console.log('[PAGE] Categorias:', categories.length)

    // Buscar autor para cada artigo
    const authorMap = new Map<string, string>()
    if (articles.length > 0) {
      const authorIds = [...new Set(articles.map(a => a.authorId))]
      const placeholders = authorIds.map(() => '?').join(',')
      const authorsResult = await db.execute(
        `SELECT id, name FROM Admin WHERE id IN (${placeholders})`,
        authorIds
      )
      authorsResult.forEach((row: any) => {
        authorMap.set(row.id, row.name)
      })
    }

    // Formatar dados
    const formattedFeatured = featuredArticle ? {
      ...featuredArticle,
      author: { name: authorMap.get(featuredArticle.authorId) || 'Admin' },
      publishedAt: featuredArticle.publishedAt || null,
    } : null

    const formattedArticles = articles.map(article => ({
      ...article,
      author: { name: authorMap.get(article.authorId) || 'Admin' },
      saveCount: 0,
      publishedAt: article.publishedAt || null,
    }))

    console.log('[PAGE] Renderizando página com', formattedArticles.length, 'artigos')

    return (
      <HomeClient
        featuredArticle={formattedFeatured}
        articles={formattedArticles}
        categories={categories}
      />
    )
  } catch (error) {
    console.error('[PAGE] Erro ao carregar página:', error)
    // Retornar página vazia em caso de erro
    return (
      <HomeClient
        featuredArticle={null}
        articles={[]}
        categories={['Todos']}
      />
    )
  }
}
