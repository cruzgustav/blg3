'use client'

import { ArticleWithStats } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Eye, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useEffect, memo } from 'react'

interface ArticleCardProps {
  article: ArticleWithStats
  onLike?: (id: string) => void
  onSave?: (id: string) => void
  isLiked?: boolean
  isSaved?: boolean
}

export const ArticleCard = memo(function ArticleCard({ 
  article
}: ArticleCardProps) {
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
    <Card className="group flex flex-col border-border bg-card hover:border-accent/50 transition-colors duration-200 hover:shadow-lg hover:shadow-accent/5 overflow-hidden contain-layout">
      <Link href={`/artigo/${article.slug}`} className="block" prefetch={true}>
        {/* Cover Image - Lazy Loading */}
        <div 
          className="aspect-[16/10] sm:aspect-video bg-gradient-to-br from-accent/20 to-accent/5 overflow-hidden"
          ref={ref}
        >
          {article.coverImage ? (
            <>
              {/* Skeleton */}
              {!hasLoaded && (
                <div className="h-full w-full animate-pulse bg-muted flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-muted-foreground/10" />
                </div>
              )}
              {/* Imagem */}
              {isVisible && (
                <img
                  src={article.coverImage}
                  alt={article.title}
                  loading="lazy"
                  decoding="async"
                  onLoad={() => setHasLoaded(true)}
                  className={`h-full w-full object-cover transition-opacity duration-200 ${
                    hasLoaded 
                      ? 'opacity-100' 
                      : 'opacity-0'
                  }`}
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-xl sm:text-2xl font-black text-accent/30">VORTEK</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Category */}
        <Link href={`/?category=${article.category}`}>
          <Badge className="subtitle-uppercase text-[10px] sm:text-xs hover:bg-accent hover:text-accent-foreground transition-colors mb-2" variant="secondary">
            {article.category}
          </Badge>
        </Link>

        {/* Title */}
        <Link href={`/artigo/${article.slug}`} className="block" prefetch={true}>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground heading-title group-hover:text-accent transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>
        </Link>

        {/* Excerpt - Hidden on very small screens */}
        {article.excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 hidden sm:block">
            {article.excerpt}
          </p>
        )}

        {/* Footer - Reorganizado */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border">
          {/* Stats: tempo + views */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readTime} min
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.viewCount}
            </span>
          </div>

          {/* Ler button */}
          <Link href={`/artigo/${article.slug}`} prefetch={true}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent group-hover:text-accent"
            >
              Ler
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
})
