'use client'

import { TextBlock } from '@/lib/types'
import { memo, useMemo } from 'react'

interface Props {
  block: TextBlock
}

// Componente simples para texto processado
const ProcessedText = memo(function ProcessedText({ text }: { text: string }) {
  // Processa **negrito** para <strong> - simples e rápido
  const parts = useMemo(() => {
    const result: Array<string | { bold: string }> = []
    let lastIndex = 0
    let key = 0
    
    // Regex simples para **texto**
    const regex = /\*\*([^*]+)\*\*/g
    let match
    
    while ((match = regex.exec(text)) !== null) {
      // Texto antes do match
      if (match.index > lastIndex) {
        result.push(text.slice(lastIndex, match.index))
      }
      // Texto em negrito
      result.push({ bold: match[1] })
      lastIndex = match.index + match[0].length
    }
    
    // Texto restante
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex))
    }
    
    // Se não encontrou nada, retorna o texto original
    if (result.length === 0) {
      result.push(text)
    }
    
    return result
  }, [text])

  return (
    <>
      {parts.map((part, i) => {
        if (typeof part === 'string') return part
        return <strong key={i} className="font-semibold text-foreground">{part.bold}</strong>
      })}
    </>
  )
})

export const TextBlockRenderer = memo(function TextBlockRenderer({ block }: Props) {
  const { text } = block.content

  // Memoize paragraphs parsing
  const paragraphs = useMemo(() => {
    return text.split('\n').filter(p => p.trim())
  }, [text])

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p 
          key={`${block.id}-${index}`} 
          className="text-foreground/85 leading-relaxed mb-4 text-base sm:text-lg"
        >
          <ProcessedText text={paragraph} />
        </p>
      ))}
    </>
  )
})
