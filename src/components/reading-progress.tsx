'use client'

import { useState, useEffect, useRef, memo } from 'react'

export const ReadingProgress = memo(function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)
  const tickingRef = useRef(false)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      
      if (docHeight > 0) {
        const scrollPercent = (scrollTop / docHeight) * 100
        setProgress(Math.min(100, Math.max(0, scrollPercent)))
      }
      tickingRef.current = false
    }

    const onScroll = () => {
      if (!tickingRef.current) {
        rafRef.current = requestAnimationFrame(updateProgress)
        tickingRef.current = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    updateProgress()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-accent to-accent/70 will-change-transform"
        style={{ 
          transform: `translateX(${progress - 100}%)`,
          width: '100%'
        }}
      />
    </div>
  )
})
