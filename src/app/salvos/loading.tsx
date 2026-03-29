import { MainLayout } from '@/components/main-layout'
import { ArticlesGridSkeleton } from '@/components/skeletons'
import { Bookmark } from 'lucide-react'

export default function SalvosLoading() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <Bookmark className="h-6 w-6 text-accent animate-pulse" />
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          </div>
          <ArticlesGridSkeleton count={4} />
        </div>
      </div>
    </MainLayout>
  )
}
