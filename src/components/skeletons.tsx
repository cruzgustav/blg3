'use client'

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'

// Skeleton base com animação
const SkeletonBase = memo(function SkeletonBase({ 
  className = '' 
}: { 
  className?: string 
}) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`} />
  )
})

// Skeleton para ArticleCard
export const ArticleCardSkeleton = memo(function ArticleCardSkeleton() {
  return (
    <Card className="flex flex-col border-border bg-card overflow-hidden">
      {/* Cover Image Skeleton */}
      <div className="aspect-[16/10] sm:aspect-video bg-muted animate-pulse flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-muted-foreground/10" />
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        {/* Category Badge Skeleton */}
        <SkeletonBase className="h-5 w-20 mb-2" />

        {/* Title Skeleton */}
        <SkeletonBase className="h-6 w-full mb-2" />
        <SkeletonBase className="h-6 w-3/4 mb-2" />

        {/* Excerpt Skeleton */}
        <div className="hidden sm:block">
          <SkeletonBase className="h-4 w-full mt-2" />
          <SkeletonBase className="h-4 w-2/3 mt-1" />
        </div>

        {/* Footer Skeleton */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border">
          <div className="flex items-center gap-2">
            <SkeletonBase className="h-4 w-12" />
            <span className="text-muted-foreground/40">·</span>
            <SkeletonBase className="h-4 w-10" />
          </div>
          <SkeletonBase className="h-8 w-14 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
})

// Skeleton para FeaturedArticle
export const FeaturedArticleSkeleton = memo(function FeaturedArticleSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <div className="grid gap-0 md:grid-cols-2">
        {/* Cover Image Skeleton */}
        <div className="aspect-[16/10] sm:aspect-video md:aspect-auto md:h-full bg-muted animate-pulse flex items-center justify-center rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
          <div className="w-16 h-16 rounded-full bg-muted-foreground/10" />
        </div>

        {/* Content Skeleton */}
        <div className="flex flex-col justify-center p-4 sm:p-6 md:p-8">
          <SkeletonBase className="h-5 w-24 mb-4" />
          
          <SkeletonBase className="h-8 w-full mb-2" />
          <SkeletonBase className="h-8 w-3/4 mb-4" />
          
          <SkeletonBase className="h-4 w-full mt-2" />
          <SkeletonBase className="h-4 w-2/3 mt-1" />

          <SkeletonBase className="h-4 w-32 mt-4" />

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <SkeletonBase className="h-5 w-16" />
              <SkeletonBase className="h-5 w-12" />
            </div>
            <SkeletonBase className="h-9 w-28 rounded-md" />
          </div>
        </div>
      </div>
    </Card>
  )
})

// Skeleton para Article Page - Header
export const ArticleHeaderSkeleton = memo(function ArticleHeaderSkeleton() {
  return (
    <header className="mb-6 sm:mb-8">
      {/* Category */}
      <SkeletonBase className="h-6 w-24 mb-3" />
      
      {/* Title */}
      <SkeletonBase className="h-10 w-full mb-2" />
      <SkeletonBase className="h-10 w-3/4 mb-3" />
      
      {/* Excerpt */}
      <SkeletonBase className="h-5 w-full mt-3" />
      <SkeletonBase className="h-5 w-2/3 mt-1" />

      {/* Meta Info */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SkeletonBase className="h-4 w-28" />
        <SkeletonBase className="h-4 w-16" />
        <SkeletonBase className="h-4 w-20" />
        <SkeletonBase className="h-4 w-16" />
      </div>

      {/* Author */}
      <div className="mt-4 flex items-center gap-2">
        <SkeletonBase className="h-8 w-8 rounded-full" />
        <SkeletonBase className="h-4 w-32" />
      </div>
    </header>
  )
})

// Skeleton para Cover Image
export const CoverImageSkeleton = memo(function CoverImageSkeleton() {
  return (
    <div className="mb-6 sm:mb-8 aspect-video rounded-xl border border-border bg-muted animate-pulse flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-muted-foreground/10" />
    </div>
  )
})

// Skeleton para TOC Mobile
export const TOCMobileSkeleton = memo(function TOCMobileSkeleton() {
  return (
    <div className="mb-6 sm:mb-8 rounded-lg border border-border bg-card/50 lg:hidden p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SkeletonBase className="h-4 w-4" />
          <SkeletonBase className="h-4 w-24" />
        </div>
        <SkeletonBase className="h-4 w-4" />
      </div>
    </div>
  )
})

// Skeleton para bloco de texto
export const TextBlockSkeleton = memo(function TextBlockSkeleton() {
  return (
    <div className="my-4 space-y-2">
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-4 w-5/6" />
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-4 w-3/4" />
    </div>
  )
})

// Skeleton para bloco de heading
export const HeadingBlockSkeleton = memo(function HeadingBlockSkeleton() {
  return (
    <div className="my-6">
      <SkeletonBase className="h-8 w-2/3" />
    </div>
  )
})

// Skeleton para Article Content completo
export const ArticleContentSkeleton = memo(function ArticleContentSkeleton() {
  return (
    <div className="space-y-4">
      <HeadingBlockSkeleton />
      <TextBlockSkeleton />
      <TextBlockSkeleton />
      <HeadingBlockSkeleton />
      <TextBlockSkeleton />
      <div className="my-8 aspect-video rounded-xl border border-border bg-muted animate-pulse" />
      <TextBlockSkeleton />
      <HeadingBlockSkeleton />
      <TextBlockSkeleton />
    </div>
  )
})

// Grid de skeletons para lista de artigos
export const ArticlesGridSkeleton = memo(function ArticlesGridSkeleton({ 
  count = 6 
}: { 
  count?: number 
}) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  )
})

// Skeleton completo da Home
export const HomeSkeleton = memo(function HomeSkeleton() {
  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-10 sm:py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <SkeletonBase className="h-6 w-40 mx-auto mb-4 rounded-full" />
            <SkeletonBase className="h-12 w-full mx-auto mb-2" />
            <SkeletonBase className="h-12 w-3/4 mx-auto mb-6" />
            <SkeletonBase className="h-5 w-2/3 mx-auto" />
            
            {/* Search Skeleton */}
            <div className="mt-8 max-w-xl mx-auto">
              <SkeletonBase className="h-12 w-full rounded-md" />
            </div>

            {/* Stats Skeleton */}
            <div className="mt-8 flex items-center justify-center gap-8">
              <SkeletonBase className="h-5 w-24" />
              <SkeletonBase className="h-5 w-28" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Skeleton */}
      <div className="container mx-auto px-4 pt-4">
        <SkeletonBase className="h-8 w-32" />
      </div>

      {/* Featured Skeleton */}
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center gap-2 mb-6">
          <SkeletonBase className="h-4 w-4" />
          <SkeletonBase className="h-4 w-32" />
        </div>
        <FeaturedArticleSkeleton />
      </section>

      {/* Articles Grid Skeleton */}
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <SkeletonBase className="h-8 w-48 mb-6 sm:mb-8" />
        <ArticlesGridSkeleton count={6} />
      </section>

      {/* Newsletter Skeleton */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <SkeletonBase className="h-8 w-64 mx-auto" />
            <SkeletonBase className="h-5 w-96 mx-auto mt-4" />
            <div className="mt-8 flex flex-col gap-3 max-w-md mx-auto">
              <SkeletonBase className="h-12 w-full" />
              <SkeletonBase className="h-12 w-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
})

// Skeleton completo da Article Page
export const ArticlePageSkeleton = memo(function ArticlePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95">
        <div className="mx-auto flex h-16 sm:h-18 items-center justify-between px-4 max-w-5xl">
          <SkeletonBase className="h-10 w-20" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBase key={i} className="h-9 w-9 rounded-md" />
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <ArticleHeaderSkeleton />
        <CoverImageSkeleton />
        <TOCMobileSkeleton />
        
        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          <aside className="sticky top-24 self-start">
            <SkeletonBase className="h-12 w-full rounded-lg" />
          </aside>
          <ArticleContentSkeleton />
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          <ArticleContentSkeleton />
        </div>
      </main>
    </div>
  )
})
