'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArticleForm } from '@/components/article-form'
import { Block } from '@/lib/types'

interface ArticleData {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  tags: string[]
  blocks: Block[]
  published: boolean
  featured: boolean
  readTime: number
  coverImage: string | null
}

export default function EditarArtigoPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/admin/articles/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setArticle(data.article)
        } else {
          router.push('/admin')
        }
      } catch (error) {
        console.error('Erro ao buscar artigo:', error)
        router.push('/admin')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchArticle()
    }
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!article) {
    return null
  }

  return <ArticleForm mode="edit" initialData={article} />
}
