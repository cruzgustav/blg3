'use client'

import { QuoteBlock } from '@/lib/types'
import { memo } from 'react'

interface Props {
  block: QuoteBlock
}

export const QuoteBlockRenderer = memo(function QuoteBlockRenderer({ block }: Props) {
  const { text, author, source } = block.content

  return (
    <blockquote className="my-6 sm:my-10 relative">
      <div className="relative pl-4 sm:pl-6 py-2 border-l-2 border-accent/60">
        {/* Ícone decorativo */}
        <span className="absolute -left-1 top-0 text-3xl sm:text-4xl text-accent/20 font-serif select-none">"</span>
        
        {/* Texto em itálico */}
        <p className="text-foreground/80 italic leading-relaxed text-base sm:text-lg whitespace-pre-wrap">
          {text}
        </p>
        
        {/* Rodapé com autor */}
        {(author || source) && (
          <footer className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
            {author && (
              <span className="font-medium text-accent">
                — {author}
              </span>
            )}
            {source && (
              <span className="text-muted-foreground">
                {author && '• '}{source}
              </span>
            )}
          </footer>
        )}
      </div>
    </blockquote>
  )
})
