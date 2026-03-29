'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, Eye } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useEffect, memo } from 'react'

interface FeaturedArticleProps {
  article: {
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
    author: { name: string; avatar: string | null }
  }
}

export const FeaturedArticle = memo(function FeaturedArticle({ article }: FeaturedArticleProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <Card className="group overflow-hidden border-border bg-card hover:border-accent/50 transition-colors">
      <div className="grid gap-0 md:grid-cols-2">
        {/* Cover Image - com cantos arredondados */}
        <Link href={`/artigo/${article.slug}`} className="block">
          <div 
            className="aspect-[16/10] sm:aspect-video bg-gradient-to-br from-accent/20 to-accent/5 md:aspect-auto md:h-full overflow-hidden rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
            ref={ref}
          >
            {article.coverImage ? (
              <>
                {!hasLoaded && (
                  <div className="h-full w-full animate-pulse bg-muted flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-muted-foreground/10" />
                  </div>
                )}
                {isVisible && (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    loading="eager"
                    decoding="async"
                    onLoad={() => setHasLoaded(true)}
                    className={`h-full w-full object-cover transition-opacity duration-300 ${
                      hasLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}
              </>
            ) : (
              <div className="flex h-full min-h-[200px] sm:min-h-[280px] items-center justify-center">
                <span className="text-4xl sm:text-5xl font-black text-accent/30">VORTEK</span>
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex flex-col justify-center p-4 sm:p-6 md:p-8">
          <Link href={`/?category=${article.category}`}>
            <Badge className="subtitle-uppercase text-[10px] sm:text-xs hover:bg-accent hover:text-accent-foreground transition-colors mb-2 sm:mb-4" variant="secondary">
              {article.category}
            </Badge>
          </Link>
          
          <Link href={`/artigo/${article.slug}`}>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground heading-title group-hover:text-accent transition-colors leading-snug">
              {article.title}
            </h2>
          </Link>
          
          <p className="mt-2 sm:mt-4 text-sm sm:text-base text-muted-foreground line-clamp-2 sm:line-clamp-3">
            {article.excerpt}
          </p>

          {/* Author */}
          <div className="mt-2 sm:mt-4 flex items-center gap-2">
            {article.author.avatar ? (
              <img 
                src={article.author.avatar} 
                alt={article.author.name}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xs">
                {article.author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs sm:text-sm text-muted-foreground">
              Por <span className="font-medium text-foreground">{article.author.name}</span>
            </span>
          </div>

          {/* Meta Info + Button em linha */}
          <div className="mt-4 sm:mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {article.readTime} min
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {article.viewCount}
              </span>
            </div>
            
            <Link href={`/artigo/${article.slug}`}>
              <Button size="sm" className="gap-1.5">
                Ler Agora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
})
