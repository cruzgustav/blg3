'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { MainLayout } from '@/components/main-layout'
import { ArticleCard } from '@/components/article-card'
import { FeaturedArticle } from '@/components/featured-article'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowRight, BookOpen, Search, X, TrendingUp, BarChart3, Zap, ChevronDown, Filter } from 'lucide-react'
import { useReaderInteractions } from '@/hooks/use-reader-interactions'
import { ArticleWithStats } from '@/lib/types'

interface HomeClientProps {
  featuredArticle: {
    id: string
    slug: string
    title: string
    excerpt: string | null
    coverImage: string | null
    category: string
    readTime: number
    viewCount: number
    likeCount: number
    publishedAt: string | null
    author: { name: string }
  } | null
  articles: ArticleWithStats[]
  categories: string[]
}

export function HomeClient({ featuredArticle, articles, categories }: HomeClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const { interactions } = useReaderInteractions()

  // Fechar categorias ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setShowCategories(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtrar artigos por categoria E busca
  const filteredArticles = useMemo(() => {
    let result = articles
    
    // Filtrar por categoria
    if (selectedCategory !== 'Todos') {
      result = result.filter(a => a.category === selectedCategory)
    }
    
    // Filtrar por busca (título, excerpt, tags)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.excerpt?.toLowerCase().includes(query) ||
        a.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        a.category.toLowerCase().includes(query)
      )
    }
    
    // Remover o artigo em destaque da lista se existir e não houver busca
    if (!searchQuery.trim() && selectedCategory === 'Todos') {
      result = result.filter(a => a.id !== featuredArticle?.id)
    }
    
    return result
  }, [articles, selectedCategory, featuredArticle, searchQuery])

  // Artigos salvos
  const savedArticles = useMemo(() => {
    return articles.filter(a => interactions.savedArticles.includes(a.id))
  }, [articles, interactions.savedArticles])

  // Limpar busca
  const clearSearch = () => {
    setSearchQuery('')
    setShowSearch(false)
  }

  return (
    <MainLayout>
      {/* Hero Section - Clean & Light */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-10 sm:py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-3 sm:mb-4 subtitle-uppercase text-xs bg-accent/10 text-accent border-accent/20">
              Insights para Negócios
            </Badge>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl heading-display leading-tight">
              Marketing, Dados{' '}
              <span className="text-accent">&</span>{' '}
              Tecnologia
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Estratégias de crescimento, análise de dados e inovação tecnológica 
              para escalar seu negócio com inteligência.
            </p>
            
            {/* Search Bar - Mobile First */}
            <div className="mt-6 sm:mt-8 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar artigos, temas, categorias..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearch(true)
                  }}
                  className="pl-10 pr-10 h-12 text-base bg-background border-border focus:border-accent"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats - Mobile friendly */}
            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span>{articles.length} artigos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-accent" />
                <span>{categories.length - 1} categorias</span>
              </div>
              {savedArticles.length > 0 && (
                <Button variant="ghost" size="sm" className="gap-1.5 h-auto py-1 px-2">
                  <BookOpen className="h-4 w-4" />
                  {savedArticles.length} salvos
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories - Discrete dropdown */}
      <div className="container mx-auto px-4 pt-4" ref={categoriesRef}>
        <div className="relative inline-block">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowCategories(!showCategories)}
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="text-xs">{selectedCategory === 'Todos' ? 'Categorias' : selectedCategory}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
          </Button>
          
          {showCategories && (
            <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg p-1.5 z-50 min-w-[120px]">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category)
                    setSearchQuery('')
                    setShowCategories(false)
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors
                    ${selectedCategory === category 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-muted text-foreground'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Results Indicator */}
      {searchQuery && (
        <section className="container mx-auto px-4 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredArticles.length} resultado{filteredArticles.length !== 1 ? 's' : ''} para "{searchQuery}"
            </p>
            <Button variant="ghost" size="sm" onClick={clearSearch}>
              Limpar
            </Button>
          </div>
        </section>
      )}

      {/* Featured Article - Only when no search */}
      {featuredArticle && selectedCategory === 'Todos' && !searchQuery && (
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Zap className="h-4 w-4 text-accent" />
            <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Em Destaque
            </h2>
          </div>
          <FeaturedArticle article={featuredArticle} />
        </section>
      )}

      {/* Articles Grid - Mobile optimized */}
      <section id="articles" className="container mx-auto px-4 py-8 sm:py-12">
        {!searchQuery && (
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-6 sm:mb-8 heading-title">
            {selectedCategory === 'Todos' ? 'Últimos Artigos' : selectedCategory}
          </h2>
        )}
        
        {filteredArticles.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? 'Nenhum artigo encontrado para essa busca.' : 'Nenhum artigo encontrado nesta categoria.'}
            </p>
          </div>
        )}
      </section>

      {/* Newsletter CTA - Clean */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground heading-title">
              Insights toda semana
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">
              Estratégias de marketing, análise de dados e tech para alavancar seu negócio. 
              Direto no seu email, sem spam.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="seu@email.com"
                className="h-12 text-base"
              />
              <Button size="lg" className="gap-2">
                Receber Insights
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Junte-se a +2.000 profissionais que já recebem nossos insights
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
