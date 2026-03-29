import { HomeSkeleton } from '@/components/skeletons'
import { MainLayout } from '@/components/main-layout'

export default function Loading() {
  return (
    <MainLayout>
      <HomeSkeleton />
    </MainLayout>
  )
}
