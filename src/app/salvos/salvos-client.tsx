'use client'

import { useState, useEffect, useMemo } from 'react'
import { MainLayout } from '@/components/main-layout'
import { ArticleCard } from '@/components/article-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bookmark, Trash2, ArrowRight } from 'lucide-react'
import { useReaderInteractions } from '@/hooks/use-reader-interactions'
import Link from 'next/link'

interface SavedArticle {
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
}

interface SalvosClientProps {
  articles: SavedArticle[]
}

export function SalvosClient({ articles }: SalvosClientProps) {
  const { interactions, isLoaded, loadFromStorage } = useReaderInteractions()
  const [mounted, setMounted] = useState(false)

  // Carregar do localStorage no mount
  useEffect(() => {
    setMounted(true)
    loadFromStorage()
  }, [loadFromStorage])

  // Filtrar artigos salvos
  const savedArticles = useMemo(() => {
    if (!isLoaded || !mounted) return []
    return articles.filter(article => 
      interactions.savedArticles.includes(article.id)
    )
  }, [articles, interactions.savedArticles, isLoaded, mounted])

  // Loading state
  if (!mounted || !isLoaded) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
            <div className="mt-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-lg" />
                  <div className="mt-3 h-4 w-3/4 bg-muted rounded" />
                  <div className="mt-2 h-3 w-1/2 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-3">
                <Bookmark className="h-6 w-6 text-accent" />
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground heading-title">
                  Artigos Salvos
                </h1>
              </div>
              <p className="mt-2 text-muted-foreground">
                {savedArticles.length === 0 
                  ? 'Nenhum artigo salvo ainda'
                  : `${savedArticles.length} artigo${savedArticles.length !== 1 ? 's' : ''} salvo${savedArticles.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            
            {savedArticles.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  if (confirm('Remover todos os artigos salvos?')) {
                    localStorage.setItem('vortek_reader_interactions', JSON.stringify({
                      likedArticles: interactions.likedArticles,
                      savedArticles: [],
                    }))
                    window.location.reload()
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar todos
              </Button>
            )}
          </div>

          {/* Content */}
          {savedArticles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Bookmark className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Nenhum artigo salvo
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Quando você salvar artigos, eles aparecerão aqui para você ler depois.
              </p>
              <Link href="/">
                <Button className="gap-2">
                  Explorar artigos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              {savedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={{
                    ...article,
                    tags: [],
                    saveCount: 0,
                    author: { name: 'Admin' },
                    publishedAt: article.publishedAt || null,
                  }}
                />
              ))}
            </div>
          )}

          {/* Back to home */}
          <div className="mt-12 pt-8 border-t border-border text-center">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="h-4 w-4 rotate-180" />
                Voltar para a home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
