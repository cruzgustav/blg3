'use client'

import { CodeBlock } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Copy, Check, Code2 } from 'lucide-react'
import { useState, useCallback, memo } from 'react'

interface Props {
  block: CodeBlock
}

export const CodeBlockRenderer = memo(function CodeBlockRenderer({ block }: Props) {
  const { language, code } = block.content
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className="my-8 sm:my-10 rounded-xl overflow-hidden border border-border bg-zinc-900 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-800/60 px-4 py-2.5 border-b border-zinc-700/50">
        <div className="flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
            {language}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/50"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs text-green-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-xs">Copiar</span>
            </>
          )}
        </Button>
      </div>
      
      {/* Code */}
      <pre className="overflow-x-auto p-4 sm:p-5 text-sm text-zinc-100 leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
})
