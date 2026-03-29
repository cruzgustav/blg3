'use client'

import dynamic from 'next/dynamic'
import { memo, useMemo } from 'react'
import { Block, ImageBlock } from '@/lib/types'

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

// Verificar se a imagem usa float
function isFloatingImage(block: Block): boolean {
  if (block.type !== 'image') return false
  const content = block.content as ImageBlock['content']
  const size = content.size || 'full'
  const align = content.align || 'center'
  return (size === 'small' || size === 'medium') && align !== 'center'
}

export const BlockRenderer = memo(function BlockRenderer({ block }: BlockRendererProps) {
  // Verificar se é uma imagem com float
  const useFloat = useMemo(() => isFloatingImage(block), [block])
  
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

  // Para imagens com float, não usar contain para permitir que o texto flua ao lado
  if (useFloat) {
    return <>{renderBlock()}</>
  }

  // Para outros blocos, manter contain para performance
  return (
    <div style={{ contain: 'content' }}>
      {renderBlock()}
    </div>
  )
})
