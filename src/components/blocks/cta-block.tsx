'use client'

import { CtaBlock } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'

interface Props {
  block: CtaBlock
}

export const CtaBlockRenderer = memo(function CtaBlockRenderer({ block }: Props) {
  const { title, description, buttonText, buttonLink } = block.content

  return (
    <div className="my-10 sm:my-12 overflow-hidden rounded-xl bg-gradient-to-br from-accent via-accent to-accent/90 shadow-lg shadow-accent/10">
      <div className="p-6 sm:p-8 md:p-10">
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Icon */}
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-white/15 shrink-0">
            <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-white heading-title">
              {title}
            </h3>
            {description && (
              <p className="mt-2 sm:mt-3 text-white/80 leading-relaxed">
                {description}
              </p>
            )}
            <Link href={buttonLink} className="inline-block mt-5 sm:mt-6">
              <Button 
                size="lg"
                className="bg-white text-accent hover:bg-white/95 gap-2 shadow-sm font-semibold"
              >
                {buttonText}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
})
