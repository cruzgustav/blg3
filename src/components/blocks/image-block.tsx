'use client'

import { ImageBlock, ImageSize, ImageAlign } from '@/lib/types'
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

// Classes CSS para cada tamanho
const sizeClasses: Record<ImageSize, string> = {
  small: 'max-w-[25%]',
  medium: 'max-w-[50%]',
  large: 'max-w-[75%]',
  full: 'max-w-full',
}

// Classes CSS para alinhamento
const alignClasses: Record<ImageAlign, string> = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
}

// Aspect ratio baseado no tamanho
const aspectClasses: Record<ImageSize, string> = {
  small: 'aspect-square',
  medium: 'aspect-video',
  large: 'aspect-video',
  full: 'aspect-video',
}

export const ImageBlockRenderer = memo(function ImageBlockRenderer({ block }: Props) {
  const { url, alt, caption, size = 'full', align = 'center' } = block.content
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

  // Se for tamanho pequeno/médio e alinhado à esquerda/direita, usar float
  const useFloat = (size === 'small' || size === 'medium') && align !== 'center'

  if (useFloat) {
    // Layout com float - imagem mesclada com texto
    return (
      <figure 
        ref={ref}
        className={`my-4 ${size === 'small' ? 'w-[30%]' : 'w-[45%]'} ${align === 'left' ? 'float-left mr-4' : 'float-right ml-4'} clear-both`}
      >
        <div className="relative overflow-hidden rounded-lg border border-border/50 bg-muted shadow-sm">
          {!hasLoaded && <ImageSkeleton />}
          {isVisible && (
            <img
              src={url}
              alt={alt}
              loading="lazy"
              decoding="async"
              onLoad={() => setHasLoaded(true)}
              className={`w-full object-cover transition-opacity duration-300 ${
                hasLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </div>
        {caption && (
          <figcaption className="mt-2 text-xs text-muted-foreground italic text-center">
            {caption}
          </figcaption>
        )}
      </figure>
    )
  }

  // Layout normal - imagem em bloco separado
  return (
    <figure className="my-8 sm:my-10" ref={ref}>
      <div className={`relative ${sizeClasses[size]} ${alignClasses[align]} overflow-hidden rounded-xl border border-border/50 bg-muted shadow-sm`}>
        <div className={aspectClasses[size]}>
          {!hasLoaded && <ImageSkeleton />}
          {isVisible && (
            <img
              src={url}
              alt={alt}
              loading="lazy"
              decoding="async"
              onLoad={() => setHasLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                hasLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </div>
      </div>
      {caption && (
        <figcaption className={`mt-3 text-sm text-muted-foreground italic ${alignClasses[align]}`} style={{ maxWidth: sizeClasses[size] === 'max-w-full' ? '100%' : undefined }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
})
