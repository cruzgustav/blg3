'use client'

import { memo } from 'react'
import { Block, CalloutBlock } from '@/lib/types'
import { Info, Lightbulb, AlertTriangle, AlertCircle } from 'lucide-react'

interface CalloutBlockProps {
  block: Block
}

const calloutStyles = {
  info: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    border: 'border-blue-500/30',
    icon: Info,
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-700 dark:text-blue-300',
  },
  tip: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    border: 'border-emerald-500/30',
    icon: Lightbulb,
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    border: 'border-amber-500/30',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-700 dark:text-amber-300',
  },
  danger: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    border: 'border-red-500/30',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    titleColor: 'text-red-700 dark:text-red-300',
  },
}

export const CalloutBlockRenderer = memo(function CalloutBlockRenderer({ block }: CalloutBlockProps) {
  if (block.type !== 'callout') return null

  const content = block.content as CalloutBlock['content']
  const calloutType = content.calloutType || 'info'
  const style = calloutStyles[calloutType]
  const Icon = style.icon

  return (
    <div className={`my-6 rounded-lg border ${style.bg} ${style.border} p-4`}>
      <div className="flex gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
        <div className="flex-1 min-w-0">
          {content.title && (
            <h4 className={`font-semibold mb-1 ${style.titleColor}`}>
              {content.title}
            </h4>
          )}
          <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
            {content.text}
          </p>
        </div>
      </div>
    </div>
  )
})
