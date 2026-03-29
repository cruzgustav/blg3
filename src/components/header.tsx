'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Bookmark, Menu, X } from 'lucide-react'
import { memo, useState, useEffect } from 'react'
import { useReaderInteractions } from '@/hooks/use-reader-interactions'

interface HeaderProps {
  isImmersive?: boolean
}

export const Header = memo(function Header({ isImmersive = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { savedCount, isLoaded } = useReaderInteractions()

  if (isImmersive) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-black tracking-tighter text-foreground heading-display">
            VORTEK<span className="text-accent">.</span>
          </span>
        </Link>

        {/* Right side - Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <ThemeToggle />
          <Link href="/salvos">
            <Button variant="ghost" size="sm" className="gap-2 relative">
              <Bookmark className="h-4 w-4" />
              <span>Salvos</span>
              {isLoaded && savedCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                  {savedCount > 9 ? '9+' : savedCount}
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* Right side - Mobile */}
        <div className="flex sm:hidden items-center gap-1">
          <ThemeToggle />
          <Link href="/salvos">
            <Button variant="ghost" size="icon" className="relative">
              <Bookmark className="h-5 w-5" />
              {isLoaded && savedCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                  {savedCount > 9 ? '9+' : savedCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
})
