'use client'

import { QuizBlock } from '@/lib/types'
import { useState, useCallback, memo } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, HelpCircle, RotateCcw } from 'lucide-react'

interface Props {
  block: QuizBlock
}

export const QuizBlockRenderer = memo(function QuizBlockRenderer({ block }: Props) {
  const { question, options, correctIndex } = block.content
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleSelect = useCallback((index: number) => {
    if (showResult) return
    setSelectedIndex(index)
  }, [showResult])

  const handleCheck = useCallback(() => {
    setShowResult(true)
  }, [])

  const handleReset = useCallback(() => {
    setSelectedIndex(null)
    setShowResult(false)
  }, [])

  const getOptionClass = useCallback((index: number) => {
    const isSelected = selectedIndex === index
    const isCorrectOption = index === correctIndex
    
    if (showResult) {
      if (isCorrectOption) return 'border-green-500/60 bg-green-500/10 text-green-700 dark:text-green-400'
      if (isSelected && !isCorrectOption) return 'border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-400'
      return 'border-border/50 opacity-50'
    }
    if (isSelected) return 'border-accent bg-accent/10 text-accent'
    return 'border-border hover:border-accent/50 cursor-pointer hover:bg-muted/50'
  }, [selectedIndex, correctIndex, showResult])

  const isCorrect = selectedIndex === correctIndex

  return (
    <div className="my-8 sm:my-10 p-5 sm:p-6 rounded-xl border border-accent/20 bg-accent/5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <HelpCircle className="h-4 w-4 text-accent" />
        </div>
        <span className="font-semibold text-foreground">Quiz Interativo</span>
      </div>

      {/* Question */}
      <p className="font-medium text-foreground text-base sm:text-lg mb-4 leading-relaxed">
        {question}
      </p>
      
      {/* Options */}
      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={showResult}
            className={`w-full text-left p-3 sm:p-3.5 rounded-lg border transition-all duration-200 ${getOptionClass(index)}`}
          >
            <span className="flex items-center gap-3">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-sm font-semibold shrink-0 ${
                showResult && index === correctIndex 
                  ? 'border-green-500/60 bg-green-500/20 text-green-600 dark:text-green-400'
                  : showResult && selectedIndex === index && index !== correctIndex
                  ? 'border-red-500/60 bg-red-500/20 text-red-600 dark:text-red-400'
                  : selectedIndex === index
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border'
              }`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1">{option}</span>
              {showResult && index === correctIndex && (
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              )}
              {showResult && selectedIndex === index && index !== correctIndex && (
                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center gap-3">
        {!showResult ? (
          <Button onClick={handleCheck} disabled={selectedIndex === null} className="gap-2">
            Verificar Resposta
          </Button>
        ) : (
          <>
            <div className={`text-sm font-medium ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isCorrect ? '✓ Correto!' : '✗ Incorreto'}
            </div>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 ml-auto">
              <RotateCcw className="h-3.5 w-3.5" />
              Tentar Novamente
            </Button>
          </>
        )}
      </div>
    </div>
  )
})
