'use client'

import { memo, useState, useCallback } from 'react'
import { Block, TabsBlock } from '@/lib/types'

interface TabsBlockProps {
  block: Block
}

export const TabsBlockRenderer = memo(function TabsBlockRenderer({ block }: TabsBlockProps) {
  if (block.type !== 'tabs') return null

  const content = block.content as TabsBlock['content']
  const tabs = content.tabs || []
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [])

  if (tabs.length === 0) return null

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0]

  return (
    <div className="my-6 rounded-xl border border-border bg-card overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-border bg-muted/30 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative
              ${activeTab === tab.id 
                ? 'text-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            {tab.title}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {currentTab?.content}
        </div>
      </div>
    </div>
  )
})
