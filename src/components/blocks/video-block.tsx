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

  // Extrair ID do YouTube de várias formas de URL
  const getYouTubeId = (videoUrl: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    ]
    for (const pattern of patterns) {
      const match = videoUrl.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  // Extrair ID do Vimeo
  const getVimeoId = (videoUrl: string) => {
    const match = videoUrl.match(/vimeo\.com\/(\d+)/)
    return match ? match[1] : null
  }

  const youtubeId = getYouTubeId(url)
  const vimeoId = getVimeoId(url)
  
  // Gerar URL de embed
  const getEmbedUrl = () => {
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}`
    }
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}`
    }
    // URL direta de vídeo (mp4, webm, etc)
    return url
  }

  // Thumbnail
  const thumbnailUrl = youtubeId 
    ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
    : vimeoId 
      ? `https://vumbnail.com/${vimeoId}.jpg`
      : null

  // Se é um vídeo direto (mp4, webm), não precisa de clique
  const isDirectVideo = !youtubeId && !vimeoId && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)

  // Se já clicou para play, mostra o iframe
  if (hasClicked && isVisible && !isDirectVideo) {
    return (
      <figure className="my-8 sm:my-10" ref={ref}>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-muted shadow-sm">
          {!hasLoaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          <iframe
            src={getEmbedUrl()}
            title={title || 'Vídeo'}
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

  // Vídeo direto (mp4, webm)
  if (isDirectVideo) {
    return (
      <figure className="my-8 sm:my-10" ref={ref}>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-muted shadow-sm">
          {isVisible && (
            <video
              src={url}
              title={title || 'Vídeo'}
              controls
              className="h-full w-full"
              preload="metadata"
            >
              Seu navegador não suporta vídeos HTML5.
            </video>
          )}
        </div>
        {title && (
          <figcaption className="mt-3 text-center text-sm text-muted-foreground italic">
            {title} {duration && `• ${duration}`}
          </figcaption>
        )}
      </figure>
    )
  }

  // Mostra thumbnail com botão de play (YouTube/Vimeo)
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
            alt={title || 'Vídeo'}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-muted-foreground/10" />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-accent flex items-center justify-center shadow-md">
            <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Duration Badge */}
        {duration && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-md">
            {duration}
          </div>
        )}

        {/* Platform Badge */}
        {youtubeId && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded">
            YouTube
          </div>
        )}
        {vimeoId && (
          <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded">
            Vimeo
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
