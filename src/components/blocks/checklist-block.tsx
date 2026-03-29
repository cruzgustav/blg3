'use client'

import { memo, useState } from 'react'
import { Block, ChecklistBlock, ChecklistItem } from '@/lib/types'
import { Check } from 'lucide-react'

interface ChecklistBlockProps {
  block: Block
}

export const ChecklistBlockRenderer = memo(function ChecklistBlockRenderer({ block }: ChecklistBlockProps) {
  if (block.type !== 'checklist') return null

  const content = block.content as ChecklistBlock['content']
  const items = content.items || []

  // Estado local para interatividade (opcional - o leitor pode marcar)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(items.filter(item => item.checked).map(item => item.id))
  )

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  if (items.length === 0) return null

  return (
    <div className="my-6 space-y-2">
      {items.map((item) => {
        const isChecked = checkedItems.has(item.id)
        return (
          <div
            key={item.id}
            className="flex items-start gap-3 group cursor-pointer"
            onClick={() => toggleItem(item.id)}
          >
            {/* Checkbox */}
            <div
              className={`
                flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 transition-all duration-200
                flex items-center justify-center
                ${isChecked
                  ? 'bg-accent border-accent'
                  : 'border-muted-foreground/30 group-hover:border-accent/50'
                }
              `}
            >
              {isChecked && (
                <Check className="h-3 w-3 text-accent-foreground" />
              )}
            </div>
            
            {/* Text */}
            <span
              className={`
                text-sm leading-relaxed transition-all duration-200
                ${isChecked
                  ? 'text-muted-foreground line-through'
                  : 'text-foreground'
                }
              `}
            >
              {item.text}
            </span>
          </div>
        )
      })}
    </div>
  )
})
