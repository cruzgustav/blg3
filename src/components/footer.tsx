'use client'

import Link from 'next/link'

interface FooterProps {
  isImmersive?: boolean
}

export function Footer({ isImmersive = false }: FooterProps) {
  if (isImmersive) return null

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tighter text-foreground heading-display">
              VORTEK<span className="text-accent">.</span>
            </span>
          </Link>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Vortek. Todos os direitos reservados.
          </p>

          {/* Links */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Sobre
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Contato
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
