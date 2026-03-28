'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface MainLayoutProps {
  children: React.ReactNode
  isImmersive?: boolean
}

export function MainLayout({ children, isImmersive = false }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header isImmersive={isImmersive} />
      <main className="flex-1">{children}</main>
      <Footer isImmersive={isImmersive} />
    </div>
  )
}
