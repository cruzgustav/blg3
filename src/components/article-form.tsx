'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BlockEditor } from '@/components/block-editor'
import { Block, BlockType } from '@/lib/types'
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  GripVertical,
  Trash2,
  Type,
  Heading2,
  ImageIcon,
  Code,
  HelpCircle,
  Megaphone,
  Music,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ArticleFormProps {
  mode: 'create' | 'edit'
  initialData?: {
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
}

const categories = ['Frontend', 'Backend', 'Design', 'DevOps', 'IA', 'Mobile', 'Outros']

const blockTypes: { type: BlockType; icon: React.ElementType; label: string }[] = [
  { type: 'text', icon: Type, label: 'Texto' },
  { type: 'heading', icon: Heading2, label: 'Título' },
  { type: 'image', icon: ImageIcon, label: 'Imagem' },
  { type: 'code', icon: Code, label: 'Código' },
  { type: 'quiz', icon: HelpCircle, label: 'Quiz' },
  { type: 'cta', icon: Megaphone, label: 'CTA' },
  { type: 'audio', icon: Music, label: 'Áudio' },
]

export function ArticleForm({ mode, initialData }: ArticleFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [category, setCategory] = useState(initialData?.category || 'Frontend')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [blocks, setBlocks] = useState<Block[]>(initialData?.blocks || [])
  const [published, setPublished] = useState(initialData?.published || false)
  const [featured, setFeatured] = useState(initialData?.featured || false)
  const [readTime, setReadTime] = useState(initialData?.readTime || 5)
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '')

  // Gerar slug automático
  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (mode === 'create') {
      const generatedSlug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setSlug(generatedSlug)
    }
  }

  // Adicionar tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  // Remover tag
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  // Adicionar bloco
  const handleAddBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      order: blocks.length,
      content: getDefaultBlockContent(type),
    }
    setBlocks([...blocks, newBlock])
  }

  // Conteúdo padrão para cada tipo de bloco
  const getDefaultBlockContent = (type: BlockType) => {
    switch (type) {
      case 'text':
        return { text: '' }
      case 'heading':
        return { level: 2, text: '' }
      case 'image':
        return { url: '', alt: '', caption: '' }
      case 'code':
        return { language: 'typescript', code: '' }
      case 'quiz':
        return { question: '', options: ['', '', '', ''], correctIndex: 0 }
      case 'cta':
        return { title: '', description: '', buttonText: '', buttonLink: '' }
      case 'audio':
        return { url: '', title: '', duration: '' }
      default:
        return {}
    }
  }

  // Atualizar bloco
  const handleUpdateBlock = useCallback((blockId: string, content: unknown) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, content: content as Block['content'] } : b
      )
    )
  }, [])

  // Remover bloco
  const handleRemoveBlock = (blockId: string) => {
    setBlocks(blocks.filter((b) => b.id !== blockId))
  }

  // Mover bloco
  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex((b) => b.id === blockId)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    ) {
      return
    }
    const newBlocks = [...blocks]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]]
    setBlocks(newBlocks.map((b, i) => ({ ...b, order: i })))
  }

  // Salvar artigo
  const handleSave = async (publishNow = false) => {
    if (!title.trim() || !slug.trim()) {
      alert('Título e slug são obrigatórios')
      return
    }

    setSaving(true)
    try {
      const url =
        mode === 'create'
          ? '/api/admin/articles'
          : `/api/admin/articles/${initialData?.id}`

      const body = {
        title,
        slug,
        excerpt,
        category,
        tags,
        blocks,
        published: publishNow || published,
        featured,
        readTime,
        coverImage: coverImage || null,
      }

      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        router.push('/admin')
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao salvar artigo')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar artigo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold heading-title">
              {mode === 'create' ? 'Novo Artigo' : 'Editar Artigo'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'create' ? 'Crie um novo artigo' : 'Edite o artigo existente'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            <Eye className="h-4 w-4 mr-2" />
            {published ? 'Atualizar' : 'Publicar'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Article Settings */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Título do artigo"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-do-artigo"
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Resumo</Label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Breve descrição do artigo"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant={category === cat ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Nova tag"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button variant="outline" size="icon" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="coverImage">URL da Capa</Label>
                <Input
                  id="coverImage"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              {/* Read Time */}
              <div className="space-y-2">
                <Label htmlFor="readTime">Tempo de Leitura (min)</Label>
                <Input
                  id="readTime"
                  type="number"
                  min="1"
                  value={readTime}
                  onChange={(e) => setReadTime(parseInt(e.target.value) || 5)}
                />
              </div>

              {/* Switches */}
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Publicado</Label>
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Destaque</Label>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Block Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Block Buttons */}
              <div className="flex flex-wrap gap-2 pb-4 border-b border-border">
                {blockTypes.map(({ type, icon: Icon, label }) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleAddBlock(type)}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>

              {/* Blocks */}
              {blocks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <p>Adicione blocos para começar a escrever</p>
                  <p className="text-sm mt-1">Use os botões acima para adicionar conteúdo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className="border border-border rounded-lg p-4 bg-card group relative"
                    >
                      {/* Block Controls */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-muted-foreground mr-2">
                          {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleMoveBlock(block.id, 'up')}
                          disabled={index === 0}
                        >
                          <GripVertical className="h-3 w-3 rotate-180" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleMoveBlock(block.id, 'down')}
                          disabled={index === blocks.length - 1}
                        >
                          <GripVertical className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleRemoveBlock(block.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Block Type Badge */}
                      <Badge variant="secondary" className="mb-3 subtitle-uppercase">
                        {block.type}
                      </Badge>

                      {/* Block Editor */}
                      <BlockEditor
                        block={block}
                        onUpdate={(content) => handleUpdateBlock(block.id, content)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
