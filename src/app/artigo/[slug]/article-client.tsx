'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  Bookmark, 
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Link2,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  List,
  Check
} from 'lucide-react'
import { BlockRenderer } from '@/components/blocks/block-renderer'
import { BlockProcessor } from '@/components/blocks/block-processor'
import { useReaderInteractions } from '@/hooks/use-reader-interactions'
import { ReadingProgress } from '@/components/reading-progress'
import { useTableOfContents } from '@/components/table-of-contents'
import { useTheme } from 'next-themes'
import { ArticleFull, Block } from '@/lib/types'

interface ArticlePageClientProps {
  article: {
    id: string
    slug: string
    title: string
    excerpt: string | null
    coverImage: string | null
    category: string
    tags: string[]
    blocks: Block[]
    readTime: number
    viewCount: number
    likeCount: number
    saveCount: number
    metaTitle: string | null
    metaDescription: string | null
    publishedAt: string | null
    author: {
      name: string
      email: string
      avatar: string | null
    }
  }
  relatedArticles: Array<{
    id: string
    slug: string
    title: string
    excerpt: string | null
    coverImage: string | null
    category: string
    readTime: number
    publishedAt: string | null
  }>
}

// Componente de Índice para Mobile (no início do artigo) - Collapsible
const MobileTableOfContents = memo(function MobileTableOfContents({
  items,
  onItemClick
}: {
  items: Array<{ id: string; text: string; level: number }>
  onItemClick: (id: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Função separada para o clique no item
  const handleItemClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Fechar o collapse primeiro
    setIsOpen(false)
    
    // Executar o scroll imediatamente (não esperar animação)
    // O scroll é mais importante que a animação
    onItemClick(id)
  }, [onItemClick])

  // Função para toggle do collapse (não afeta os itens)
  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsOpen(prev => !prev)
  }, [])

  if (items.length === 0) return null

  return (
    <div className="mb-6 sm:mb-8 rounded-lg border border-border bg-card/50 lg:hidden overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <List className="h-4 w-4" />
          Neste artigo
          <span className="text-xs text-muted-foreground font-normal">({items.length})</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      <div className={`overflow-hidden transition-all duration-200 ${
        isOpen ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <nav className="px-3 pb-3 pt-1 space-y-0.5 border-t border-border max-h-[calc(60vh-48px)] overflow-y-auto scrollbar-thin">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={(e) => handleItemClick(e, item.id)}
              className={`w-full text-left text-sm py-1.5 px-2 rounded transition-colors flex items-center gap-1.5
                ${item.level === 3 ? 'pl-6 text-muted-foreground text-xs' : 'text-foreground'}
                hover:bg-muted hover:text-accent
              `}
            >
              {item.level === 2 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />}
              <span className="line-clamp-1">{item.text}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
})

// Componente de Índice para Desktop (coluna esquerda) - Collapsible
const DesktopTableOfContents = memo(function DesktopTableOfContents({
  items,
  activeId,
  onItemClick
}: {
  items: Array<{ id: string; text: string; level: number }>
  activeId: string | null
  onItemClick: (id: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleItemClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onItemClick(id)
  }, [onItemClick])

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])

  if (items.length === 0) return null

  return (
    <nav className="rounded-lg border border-border bg-card/50 overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <List className="h-4 w-4" />
          Índice
          <span className="text-xs text-muted-foreground/60">({items.length})</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      <div className={`overflow-hidden transition-all duration-200 ${
        isOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <ul className="px-2.5 pb-2.5 space-y-0.5 max-h-[calc(80vh-48px)] overflow-y-auto scrollbar-thin">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={(e) => handleItemClick(e, item.id)}
                className={`w-full text-left text-sm py-2 px-2.5 rounded transition-colors flex items-center gap-2
                  ${item.level === 3 ? 'pl-6 text-muted-foreground/70' : ''}
                  ${activeId === item.id
                    ? 'text-accent bg-accent/10 font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
              >
                {item.level === 2 && (
                  <ChevronRight className={`h-3 w-3 shrink-0 transition-opacity ${
                    activeId === item.id ? 'opacity-100' : 'opacity-0'
                  }`} />
                )}
                <span className="line-clamp-2">{item.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
})

export function ArticlePageClient({ article, relatedArticles }: ArticlePageClientProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [coverLoaded, setCoverLoaded] = useState(false)
  const { toggleLike, toggleSave, isLiked, isSaved, isLoaded } = useReaderInteractions()
  const { theme, setTheme } = useTheme()
  
  const blocks = article.blocks
  const { items: tocItems, activeId: tocActiveId, scrollToHeading } = useTableOfContents(blocks)

  const formattedDate = useMemo(() => {
    if (!article.publishedAt) return ''
    const date = new Date(article.publishedAt)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
  }, [article.publishedAt])

  const handleShare = useCallback(async (platform: string) => {
    const url = window.location.href
    const title = article.title

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        break
    }
  }, [article.title])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const articleLiked = isLoaded && isLiked(article.id)
  const articleSaved = isLoaded && isSaved(article.id)

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <ReadingProgress />
      
      {/* Header - Maior com ações */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95">
        <div className="mx-auto flex h-16 sm:h-18 items-center justify-between px-4 max-w-5xl">
          {/* Left: Voltar */}
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 h-10 px-3">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          </Link>

          {/* Right: Ações */}
          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={toggleTheme}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            {/* Like */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 ${articleLiked ? 'text-red-500' : ''}`}
              onClick={() => toggleLike(article.id)}
              aria-label="Curtir"
            >
              <Heart className={`h-4 w-4 ${articleLiked ? 'fill-current' : ''}`} />
            </Button>
            
            {/* Save */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 ${articleSaved ? 'text-accent' : ''}`}
              onClick={() => toggleSave(article.id)}
              aria-label="Salvar"
            >
              <Bookmark className={`h-4 w-4 ${articleSaved ? 'fill-current' : ''}`} />
            </Button>
            
            {/* Share Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setShowShareMenu(!showShareMenu)}
                aria-label="Compartilhar"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg p-1.5 flex gap-1 z-50">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShare('twitter')}>
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShare('linkedin')}>
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShare('facebook')}>
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShare('copy')}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        {/* Article Header */}
        <header className="mb-6 sm:mb-8">
          <Link href={`/?category=${article.category}`}>
            <Badge className="mb-3 subtitle-uppercase hover:bg-accent hover:text-accent-foreground transition-colors" variant="secondary">
              {article.category}
            </Badge>
          </Link>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground heading-display leading-tight">
            {article.title}
          </h1>
          
          {article.excerpt && (
            <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readTime} min
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.viewCount} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {article.likeCount + (articleLiked ? 1 : 0)}
            </span>
          </div>

          {/* Author */}
          <div className="mt-4 flex items-center gap-2">
            {article.author.avatar ? (
              <img 
                src={article.author.avatar} 
                alt={article.author.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xs">
                {article.author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-foreground">{article.author.name}</span>
          </div>
        </header>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="mb-6 sm:mb-8 aspect-video overflow-hidden rounded-xl border border-border bg-muted">
            {!coverLoaded && (
              <div className="h-full w-full animate-pulse bg-muted flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-muted-foreground/10" />
              </div>
            )}
            <img
              src={article.coverImage}
              alt={article.title}
              loading="eager"
              decoding="async"
              onLoad={() => setCoverLoaded(true)}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                coverLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        )}

        {/* Mobile TOC */}
        <MobileTableOfContents
          items={tocItems}
          onItemClick={scrollToHeading}
        />

        {/* Desktop: Grid com Índice + Artigo */}
        <div className="hidden lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          {/* Coluna Esquerda: Índice (sticky) */}
          <aside className="sticky top-24 self-start">
            <DesktopTableOfContents
              items={tocItems}
              activeId={tocActiveId}
              onItemClick={scrollToHeading}
            />
          </aside>

          {/* Coluna Direita: Artigo */}
          <article className="prose-vortek">
            <BlockProcessor blocks={blocks} />
          </article>
        </div>

        {/* Mobile: Artigo */}
        <article className="prose-vortek max-w-3xl mx-auto lg:hidden">
          <BlockProcessor blocks={blocks} />
        </article>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mt-8 sm:mt-10 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12 sm:mt-16 border-t border-border pt-8 sm:pt-10">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-4 sm:mb-6 heading-title">
              Relacionados
            </h2>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link key={related.id} href={`/artigo/${related.slug}`}>
                  <Card className="h-full border-border bg-card hover:border-accent/50 transition-colors overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-accent/20 to-accent/5">
                      {related.coverImage ? (
                        <img
                          src={related.coverImage}
                          alt={related.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-xl font-black text-accent/30">VORTEK</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <Badge className="mb-2 subtitle-uppercase text-[10px]" variant="secondary">
                        {related.category}
                      </Badge>
                      <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-2 hover:text-accent transition-colors">
                        {related.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-background">
        <div className="mx-auto px-4 py-6 max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tighter text-foreground heading-display">
                VORTEK<span className="text-accent">.</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Vortek. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
