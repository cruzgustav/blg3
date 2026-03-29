'use client'

import { memo, useMemo } from 'react'
import { Block, ImageBlock, TextBlock } from '@/lib/types'
import { BlockRenderer } from './block-renderer'

interface BlockProcessorProps {
  blocks: Block[]
}

// Verificar se a imagem usa float
function isFloatingImage(block: Block): boolean {
  if (block.type !== 'image') return false
  const content = block.content as ImageBlock['content']
  const size = content.size || 'full'
  const align = content.align || 'center'
  return (size === 'small' || size === 'medium') && align !== 'center'
}

// Verificar se é um bloco de texto
function isTextBlock(block: Block): boolean {
  return block.type === 'text'
}

// Agrupar blocos: imagem com float + próximo texto
function groupBlocks(blocks: Block[]): Array<{ type: 'single' | 'float-group'; blocks: Block[] }> {
  const groups: Array<{ type: 'single' | 'float-group'; blocks: Block[] }> = []
  let i = 0

  while (i < blocks.length) {
    const currentBlock = blocks[i]

    // Se é uma imagem com float, agrupar com o próximo texto
    if (isFloatingImage(currentBlock) && i + 1 < blocks.length && isTextBlock(blocks[i + 1])) {
      groups.push({
        type: 'float-group',
        blocks: [currentBlock, blocks[i + 1]]
      })
      i += 2
    } else {
      groups.push({
        type: 'single',
        blocks: [currentBlock]
      })
      i += 1
    }
  }

  return groups
}

// Componente para imagem com float + texto
const FloatImageGroup = memo(function FloatImageGroup({ 
  imageBlock, 
  textBlock 
}: { 
  imageBlock: Block
  textBlock: Block
}) {
  const content = imageBlock.content as ImageBlock['content']
  const align = content.align || 'left'
  const size = content.size || 'medium'

  return (
    <div className="my-6 sm:my-8">
      {/* Imagem com float */}
      <div className={`${size === 'small' ? 'w-[30%]' : 'w-[45%]'} ${align === 'left' ? 'float-left mr-4' : 'float-right ml-4'}`}>
        <BlockRenderer block={imageBlock} />
      </div>
      
      {/* Texto ao lado */}
      <div className="text-foreground/85 leading-relaxed text-base sm:text-lg">
        <BlockRenderer block={textBlock} />
      </div>
      
      {/* Clear após o grupo */}
      <div className="clear-both" />
    </div>
  )
})

export const BlockProcessor = memo(function BlockProcessor({ blocks }: BlockProcessorProps) {
  const groups = useMemo(() => groupBlocks(blocks), [blocks])

  return (
    <>
      {groups.map((group, groupIndex) => {
        if (group.type === 'float-group' && group.blocks.length === 2) {
          return (
            <FloatImageGroup
              key={`float-group-${groupIndex}`}
              imageBlock={group.blocks[0]}
              textBlock={group.blocks[1]}
            />
          )
        }

        return group.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))
      })}
    </>
  )
})
