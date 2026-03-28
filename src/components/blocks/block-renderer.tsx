'use client'

import dynamic from 'next/dynamic'
import { memo } from 'react'
import { Block } from '@/lib/types'

// Lazy loading dos blocos pesados (imagem, vídeo, áudio, quiz)
// Esses blocos só são carregados quando necessários
const ImageBlockRenderer = dynamic(
  () => import('./image-block').then(mod => ({ default: mod.ImageBlockRenderer })),
  { 
    loading: () => (
      <div className="my-6 sm:my-8">
        <div className="aspect-video rounded-lg border border-border bg-muted animate-pulse" />
      </div>
    ),
    ssr: false 
  }
)

const VideoBlockRenderer = dynamic(
  () => import('./video-block').then(mod => ({ default: mod.VideoBlockRenderer })),
  { 
    loading: () => (
      <div className="my-6 sm:my-8">
        <div className="aspect-video rounded-lg border border-border bg-muted animate-pulse" />
      </div>
    ),
    ssr: false 
  }
)

const AudioBlockRenderer = dynamic(
  () => import('./audio-block').then(mod => ({ default: mod.AudioBlockRenderer })),
  { 
    loading: () => (
      <div className="my-6 sm:my-8">
        <div className="h-20 rounded-lg border border-border bg-muted animate-pulse" />
      </div>
    ),
    ssr: false 
  }
)

const QuizBlockRenderer = dynamic(
  () => import('./quiz-block').then(mod => ({ default: mod.QuizBlockRenderer })),
  { 
    loading: () => (
      <div className="my-6 sm:my-8">
        <div className="h-48 rounded-lg border border-border bg-muted animate-pulse" />
      </div>
    ),
    ssr: false 
  }
)

// Blocos leves são importados diretamente (já memoizados)
import { HeadingBlockRenderer } from './heading-block'
import { TextBlockRenderer } from './text-block'
import { CodeBlockRenderer } from './code-block'
import { CtaBlockRenderer } from './cta-block'
import { QuoteBlockRenderer } from './quote-block'

interface BlockRendererProps {
  block: Block
}

export const BlockRenderer = memo(function BlockRenderer({ block }: BlockRendererProps) {
  // Wrapper com CSS containment para isolar cada bloco e melhorar performance
  // 'contain: content' isola layout e style, evitando reflow em cascata
  const renderBlock = () => {
    switch (block.type) {
      case 'heading':
        return <HeadingBlockRenderer block={block} />
      case 'text':
        return <TextBlockRenderer block={block} />
      case 'image':
        return <ImageBlockRenderer block={block} />
      case 'video':
        return <VideoBlockRenderer block={block} />
      case 'code':
        return <CodeBlockRenderer block={block} />
      case 'quiz':
        return <QuizBlockRenderer block={block} />
      case 'cta':
        return <CtaBlockRenderer block={block} />
      case 'audio':
        return <AudioBlockRenderer block={block} />
      case 'quote':
        return <QuoteBlockRenderer block={block} />
      default:
        return null
    }
  }

  return (
    <div style={{ contain: 'content' }}>
      {renderBlock()}
    </div>
  )
})
