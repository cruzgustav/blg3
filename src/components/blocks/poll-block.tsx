'use client'

import { memo, useState, useEffect, useCallback } from 'react'
import { Block, PollBlock } from '@/lib/types'
import { BarChart3 } from 'lucide-react'

interface PollBlockProps {
  block: Block
}

// Chave para localStorage
const getPollStorageKey = (blockId: string, articleSlug: string) => 
  `vortek-poll-${articleSlug}-${blockId}`

export const PollBlockRenderer = memo(function PollBlockRenderer({ block }: PollBlockProps) {
  if (block.type !== 'poll') return null

  const content = block.content as PollBlock['content']
  const question = content.question || ''
  const options = content.options || []
  
  // Estado local
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [localVotes, setLocalVotes] = useState<Record<string, number>>({})
  const [totalVotes, setTotalVotes] = useState(0)

  // Usar o ID do bloco como identificador (simplificado)
  const pollId = block.id

  // Carregar voto do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`poll-${pollId}`)
      if (stored) {
        const data = JSON.parse(stored)
        setSelectedOption(data.votedFor)
        setHasVoted(true)
        setLocalVotes(data.votes || {})
        const total = Object.values(data.votes || {}).reduce((a: number, b: unknown) => a + (b as number), 0)
        setTotalVotes(total)
      } else {
        // Inicializar com votos do conteúdo
        const initialVotes: Record<string, number> = {}
        options.forEach(opt => {
          initialVotes[opt.id] = opt.votes || 0
        })
        setLocalVotes(initialVotes)
        const total = options.reduce((a, b) => a + (b.votes || 0), 0)
        setTotalVotes(total)
      }
    } catch {
      // Inicializar com votos do conteúdo
      const initialVotes: Record<string, number> = {}
      options.forEach(opt => {
        initialVotes[opt.id] = opt.votes || 0
      })
      setLocalVotes(initialVotes)
      const total = options.reduce((a, b) => a + (b.votes || 0), 0)
      setTotalVotes(total)
    }
  }, [pollId, options])

  const handleVote = useCallback((optionId: string) => {
    if (hasVoted) return

    const newVotes = { ...localVotes }
    newVotes[optionId] = (newVotes[optionId] || 0) + 1
    const newTotal = totalVotes + 1

    setLocalVotes(newVotes)
    setTotalVotes(newTotal)
    setSelectedOption(optionId)
    setHasVoted(true)

    // Salvar no localStorage
    try {
      localStorage.setItem(`poll-${pollId}`, JSON.stringify({
        votedFor: optionId,
        votes: newVotes
      }))
    } catch {
      console.error('Erro ao salvar voto')
    }
  }, [hasVoted, localVotes, totalVotes, pollId])

  const getPercentage = (optionId: string) => {
    if (totalVotes === 0) return 0
    const votes = localVotes[optionId] || 0
    return Math.round((votes / totalVotes) * 100)
  }

  if (!question || options.length === 0) return null

  return (
    <div className="my-6 p-5 rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-accent" />
        <h4 className="font-semibold text-foreground">{question}</h4>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option) => {
          const percentage = getPercentage(option.id)
          const isSelected = selectedOption === option.id

          return (
            <div key={option.id} className="relative">
              <button
                onClick={() => handleVote(option.id)}
                disabled={hasVoted}
                className={`
                  w-full text-left relative overflow-hidden rounded-lg border transition-all
                  ${hasVoted 
                    ? 'cursor-default' 
                    : 'cursor-pointer hover:border-accent/50 hover:bg-muted/50'
                  }
                  ${isSelected 
                    ? 'border-accent bg-accent/5' 
                    : 'border-border'
                  }
                `}
              >
                {/* Progress bar */}
                {hasVoted && (
                  <div 
                    className="absolute inset-0 bg-accent/10 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                )}
                
                <div className="relative flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    {option.text}
                  </span>
                  
                  {hasVoted && (
                    <span className="text-sm font-semibold text-accent">
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      {hasVoted && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {totalVotes} voto{totalVotes !== 1 ? 's' : ''} total
          </p>
        </div>
      )}
    </div>
  )
})
