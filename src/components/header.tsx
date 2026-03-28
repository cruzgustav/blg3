'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { memo } from 'react'

interface HeaderProps {
  isImmersive?: boolean
}

export const Header = memo(function Header({ isImmersive = false }: HeaderProps) {
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

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Link href="/admin">
            <Button variant="default" size="sm" className="gap-1.5 sm:gap-2 h-8 sm:h-9">
              <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Acesso Admin</span>
              <span className="sm:hidden text-xs">Admin</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
})
