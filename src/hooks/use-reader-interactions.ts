'use client'

import { useState, useCallback } from 'react'
import { ReaderInteractions } from '@/lib/types'

const STORAGE_KEY = 'vortek_reader_interactions'

const defaultInteractions: ReaderInteractions = {
  likedArticles: [],
  savedArticles: [],
}

// Função para carregar do localStorage (lazy initialization)
function loadInteractions(): ReaderInteractions {
  if (typeof window === 'undefined') return defaultInteractions
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Erro ao carregar interações:', error)
  }
  return defaultInteractions
}

export function useReaderInteractions() {
  const [interactions, setInteractions] = useState<ReaderInteractions>(defaultInteractions)
  const [isLoaded, setIsLoaded] = useState(false)

  // Carregar do localStorage no primeiro acesso
  const loadFromStorage = useCallback(() => {
    if (isLoaded) return
    const data = loadInteractions()
    setInteractions(data)
    setIsLoaded(true)
  }, [isLoaded])

  // Salvar no localStorage quando mudar
  const saveToStorage = useCallback((data: ReaderInteractions) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Erro ao salvar interações:', error)
    }
  }, [])

  // Toggle like
  const toggleLike = useCallback((articleId: string) => {
    // Garantir que carregou do storage
    if (!isLoaded) {
      const current = loadInteractions()
      const isCurrentlyLiked = current.likedArticles.includes(articleId)
      const newData = {
        ...current,
        likedArticles: isCurrentlyLiked
          ? current.likedArticles.filter(id => id !== articleId)
          : [...current.likedArticles, articleId],
      }
      saveToStorage(newData)
      setInteractions(newData)
      setIsLoaded(true)
      return
    }

    setInteractions(prev => {
      const isLiked = prev.likedArticles.includes(articleId)
      const newData = {
        ...prev,
        likedArticles: isLiked
          ? prev.likedArticles.filter(id => id !== articleId)
          : [...prev.likedArticles, articleId],
      }
      saveToStorage(newData)
      return newData
    })
  }, [isLoaded, saveToStorage])

  // Toggle save
  const toggleSave = useCallback((articleId: string) => {
    // Garantir que carregou do storage
    if (!isLoaded) {
      const current = loadInteractions()
      const isCurrentlySaved = current.savedArticles.includes(articleId)
      const newData = {
        ...current,
        savedArticles: isCurrentlySaved
          ? current.savedArticles.filter(id => id !== articleId)
          : [...current.savedArticles, articleId],
      }
      saveToStorage(newData)
      setInteractions(newData)
      setIsLoaded(true)
      return
    }

    setInteractions(prev => {
      const isSaved = prev.savedArticles.includes(articleId)
      const newData = {
        ...prev,
        savedArticles: isSaved
          ? prev.savedArticles.filter(id => id !== articleId)
          : [...prev.savedArticles, articleId],
      }
      saveToStorage(newData)
      return newData
    })
  }, [isLoaded, saveToStorage])

  // Verificar se está curtido
  const isLiked = useCallback((articleId: string) => {
    if (!isLoaded) {
      const current = loadInteractions()
      return current.likedArticles.includes(articleId)
    }
    return interactions.likedArticles.includes(articleId)
  }, [interactions.likedArticles, isLoaded])

  // Verificar se está salvo
  const isSaved = useCallback((articleId: string) => {
    if (!isLoaded) {
      const current = loadInteractions()
      return current.savedArticles.includes(articleId)
    }
    return interactions.savedArticles.includes(articleId)
  }, [interactions.savedArticles, isLoaded])

  // Contar artigos salvos
  const savedCount = interactions.savedArticles.length

  return {
    interactions,
    isLoaded,
    loadFromStorage,
    toggleLike,
    toggleSave,
    isLiked,
    isSaved,
    savedCount,
  }
}
