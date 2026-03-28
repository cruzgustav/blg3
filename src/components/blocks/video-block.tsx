'use client'

import { VideoBlock } from '@/lib/types'
import { useState, useRef, useEffect, memo } from 'react'
import { Play } from 'lucide-react'

interface Props {
  block: VideoBlock
}

export const VideoBlockRenderer = memo(function VideoBlockRenderer({ block }: Props) {
  const { url, title, duration } = block.content
  const [isVisible, setIsVisible] = useState(false)
  const [hasClicked, setHasClicked] = useState(false)
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
      { threshold: 0.1, rootMargin: '100px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Extrair ID do YouTube se for URL do YouTube
  const getYouTubeId = (videoUrl: string) => {
    const match = videoUrl.match(/(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? match[1] : null
  }

  const youtubeId = getYouTubeId(url)
  const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null

  // Se já clicou para play, mostra o iframe
  if (hasClicked && isVisible) {
    return (
      <figure className="my-8 sm:my-10" ref={ref}>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-muted shadow-sm">
          {!hasLoaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          <iframe
            src={url}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setHasLoaded(true)}
            className={`h-full w-full transition-opacity duration-300 ${
              hasLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
        {title && (
          <figcaption className="mt-3 text-center text-sm text-muted-foreground italic">
            {title} {duration && `• ${duration}`}
          </figcaption>
        )}
      </figure>
    )
  }

  // Mostra thumbnail com botão de play - SEM scale e SEM backdrop-blur
  return (
    <figure className="my-8 sm:my-10" ref={ref}>
      <div 
        className="relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-muted shadow-sm cursor-pointer group"
        onClick={() => setHasClicked(true)}
      >
        {/* Thumbnail */}
        {thumbnailUrl && isVisible ? (
          <img
            src={thumbnailUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-muted-foreground/10" />
          </div>
        )}
        
        {/* Play Button Overlay - sem scale */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-accent flex items-center justify-center shadow-md">
            <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Duration Badge - SEM backdrop-blur */}
        {duration && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-md">
            {duration}
          </div>
        )}
      </div>
      {title && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground italic">
          {title}
        </figcaption>
      )}
    </figure>
  )
})
