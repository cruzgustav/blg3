'use client'

import { AudioBlock } from '@/lib/types'
import { Play, Pause, Headphones } from 'lucide-react'
import { useState, useRef, useEffect, memo, useCallback } from 'react'

interface Props {
  block: AudioBlock
}

export const AudioBlockRenderer = memo(function AudioBlockRenderer({ block }: Props) {
  const { url, title, duration } = block.content
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const rafRef = useRef<number | null>(null)

  // Setup audio events sempre (audio elemento sempre presente)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        setCurrentTime(audio.currentTime)
        rafRef.current = null
      })
    }

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration)
      setIsLoading(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('waiting', handleWaiting)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('waiting', handleWaiting)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        setIsLoading(true)
        await audio.play()
        setIsPlaying(true)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Audio playback error:', error)
      setIsLoading(false)
      setIsPlaying(false)
    }
  }, [isPlaying])

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }, [])

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0

  return (
    <figure className="my-8 sm:my-10">
      {/* Audio element sempre presente */}
      <audio ref={audioRef} src={url} preload="metadata" />

      <div className="flex items-center gap-4 p-4 sm:p-5 rounded-xl border border-border/50 bg-muted/30 shadow-sm">
        {/* Play Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-70"
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" />
          ) : (
            <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-0.5" fill="currentColor" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Headphones className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Áudio</span>
          </div>
          <p className="font-semibold text-foreground text-sm sm:text-base truncate mt-1">{title}</p>

          {/* Progress Bar */}
          <div className="mt-2.5 flex items-center gap-2.5">
            <span className="text-xs text-muted-foreground w-9 tabular-nums font-medium">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 h-1.5 bg-muted-foreground/10 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-accent rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
              <input
                type="range"
                min="0"
                max={audioDuration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                aria-label="Progresso do áudio"
              />
            </div>
            <span className="text-xs text-muted-foreground w-9 text-right tabular-nums font-medium">
              {audioDuration > 0 ? formatTime(audioDuration) : duration || '0:00'}
            </span>
          </div>
        </div>
      </div>
    </figure>
  )
})
