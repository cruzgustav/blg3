'use client'

import { HeadingBlock } from '@/lib/types'
import { memo, useMemo } from 'react'

interface Props {
  block: HeadingBlock
}

const headingClasses = {
  2: 'text-2xl sm:text-3xl font-bold tracking-tight mt-10 sm:mt-12 mb-4 sm:mb-5 heading-title scroll-mt-24 text-foreground',
  3: 'text-xl sm:text-2xl font-bold tracking-tight mt-8 sm:mt-10 mb-3 sm:mb-4 heading-title scroll-mt-24 text-foreground/95',
  4: 'text-lg sm:text-xl font-semibold tracking-tight mt-6 sm:mt-8 mb-2 sm:mb-3 scroll-mt-24 text-foreground/90',
} as const

export const HeadingBlockRenderer = memo(function HeadingBlockRenderer({ block }: Props) {
  const { level, text } = block.content
  
  const headingId = useMemo(() => `heading-${block.id}`, [block.id])

  // Dynamic heading tag based on level
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
  
  // H2 com decoração sutil
  if (level === 2) {
    return (
      <HeadingTag id={headingId} className={headingClasses[2]}>
        <span className="inline-flex items-center gap-2">
          <span className="w-1.5 h-6 sm:h-7 bg-accent rounded-full shrink-0" />
          {text}
        </span>
      </HeadingTag>
    )
  }
  
  return (
    <HeadingTag id={headingId} className={headingClasses[level]}>
      {text}
    </HeadingTag>
  )
})
