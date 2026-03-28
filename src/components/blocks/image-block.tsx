'use client'

import { ImageBlock } from '@/lib/types'
import { useState, useRef, useEffect, memo } from 'react'

interface Props {
  block: ImageBlock
}

// Componente de skeleton memoizado
const ImageSkeleton = memo(() => (
  <div className="absolute inset-0 animate-pulse bg-muted flex items-center justify-center">
    <div className="w-12 h-12 rounded-full bg-muted-foreground/10" />
  </div>
))

ImageSkeleton.displayName = 'ImageSkeleton'

export const ImageBlockRenderer = memo(function ImageBlockRenderer({ block }: Props) {
  const { url, alt, caption } = block.content
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
      { 
        threshold: 0.1,
        rootMargin: '100px'
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <figure className="my-8 sm:my-10" ref={ref}>
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-muted shadow-sm">
        {!hasLoaded && <ImageSkeleton />}
        {isVisible && (
          <img
            src={url}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setHasLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              hasLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
})
