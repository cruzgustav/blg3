'use client'

import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { List, ChevronRight } from 'lucide-react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  items: TocItem[]
  activeId: string | null
  onItemClick: (id: string) => void
}

// Versão Desktop - Sidebar fixa
export const TableOfContentsDesktop = memo(function TableOfContentsDesktop({ 
  items, 
  activeId, 
  onItemClick 
}: TableOfContentsProps) {
  if (items.length === 0) return null

  return (
    <aside className="hidden lg:block sticky top-24 w-64 shrink-0">
      <nav className="p-4 rounded-lg border border-border bg-card/50">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <List className="h-4 w-4" />
          Neste artigo
        </h3>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onItemClick(item.id)}
                className={`w-full text-left text-sm py-1.5 px-2 rounded transition-colors flex items-center gap-2
                  ${item.level === 3 ? 'pl-6' : ''}
                  ${activeId === item.id 
                    ? 'text-accent bg-accent/10 font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
              >
                {activeId === item.id && (
                  <ChevronRight className="h-3 w-3 shrink-0" />
                )}
                <span className="line-clamp-2">{item.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
})

// Versão Mobile - Drawer/Sheet
export const TableOfContentsMobile = memo(function TableOfContentsMobile({ 
  items, 
  activeId, 
  onItemClick 
}: TableOfContentsProps) {
  const [open, setOpen] = useState(false)

  const handleItemClick = useCallback((id: string) => {
    onItemClick(id)
    setOpen(false)
  }, [onItemClick])

  if (items.length === 0) return null

  return (
    <div className="lg:hidden fixed bottom-6 right-6 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <List className="h-5 w-5" />
            <span className="sr-only">Índice do artigo</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh] overflow-y-auto">
          <div className="py-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <List className="h-5 w-5" />
              Neste artigo
            </h3>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full text-left py-3 px-3 rounded-lg transition-colors flex items-center gap-2
                      ${item.level === 3 ? 'pl-8' : ''}
                      ${activeId === item.id 
                        ? 'text-accent bg-accent/10 font-medium' 
                        : 'text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <span className="line-clamp-2">{item.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
})

// Hook para extrair headings e rastrear posição com IntersectionObserver (mais performático)
export function useTableOfContents(blocks: Array<{ id: string; type: string; content: unknown; order: number }>) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Extrair headings dos blocos com useMemo - blocks já devem vir ordenados
  const items = useMemo<TocItem[]>(() => {
    const headings: TocItem[] = []

    blocks.forEach((block) => {
      if (block.type === 'heading') {
        const content = block.content as { level: number; text: string }
        if (content.level === 2 || content.level === 3) {
          headings.push({
            id: `heading-${block.id}`,
            text: content.text,
            level: content.level,
          })
        }
      }
    })

    return headings
  }, [blocks])

  // Usar IntersectionObserver para detectar headings visíveis (mais performático que scroll listener)
  useEffect(() => {
    if (items.length === 0) return

    // Cleanup observer anterior se existir
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Criar observer com threshold e rootMargin para detectar quando heading está perto do topo
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Encontrar o heading mais próximo do topo que está visível
        let closestEntry: IntersectionObserverEntry | null = null
        let minTop = Infinity

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const top = entry.boundingClientRect.top
            if (top >= 0 && top < minTop) {
              minTop = top
              closestEntry = entry
            }
          }
        })

        if (closestEntry) {
          setActiveId(closestEntry.target.id)
        }
      },
      {
        rootMargin: '-10% 0px -70% 0px', // Detecta quando heading entra nos 10-30% superior da viewport
        threshold: 0,
      }
    )

    // Observar todos os headings
    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element && observerRef.current) {
        observerRef.current.observe(element)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [items])

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }, [])

  return { items, activeId, scrollToHeading }
}
