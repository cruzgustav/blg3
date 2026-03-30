'use client'

import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Block, CarouselBlock } from '@/lib/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselBlockProps {
  block: Block
}

// Skeleton para carregamento
const ImageSkeleton = () => (
  <div className="absolute inset-0 animate-pulse bg-muted flex items-center justify-center">
    <div className="w-12 h-12 rounded-full bg-muted-foreground/10" />
  </div>
)

export const CarouselBlockRenderer = memo(function CarouselBlockRenderer({ block }: CarouselBlockProps) {
  if (block.type !== 'carousel') return null

  const content = block.content as CarouselBlock['content']
  const images = content.images || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  // Intersection Observer para lazy loading
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
      { threshold: 0.1, rootMargin: '100px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set(prev).add(index))
  }, [])

  if (images.length === 0) return null

  const currentImage = images[currentIndex]
  const isCurrentImageLoaded = loadedImages.has(currentIndex)

  return (
    <div className="my-6 sm:my-8" ref={ref}>
      <div className="relative rounded-xl overflow-hidden border border-border bg-muted">
        {/* Image Container */}
        <div className="relative aspect-video">
          {/* Skeleton */}
          {isVisible && !isCurrentImageLoaded && <ImageSkeleton />}
          
          {/* Image */}
          {isVisible && (
            <img
              src={currentImage.url}
              alt={currentImage.alt || `Imagem ${currentIndex + 1}`}
              loading="lazy"
              decoding="async"
              onLoad={() => handleImageLoad(currentIndex)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isCurrentImageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Caption */}
        {currentImage.caption && (
          <div className="px-4 py-3 text-center text-sm text-muted-foreground border-t border-border bg-card">
            {currentImage.caption}
          </div>
        )}

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 py-3 bg-card border-t border-border">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-accent w-4'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
