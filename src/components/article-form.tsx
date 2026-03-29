'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { BlockEditor } from '@/components/block-editor'
import { BlockRenderer } from '@/components/blocks/block-renderer'
import { Block, BlockType } from '@/lib/types'
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Plus,
  GripVertical,
  Trash2,
  Type,
  Heading2,
  ImageIcon,
  Video,
  Code,
  HelpCircle,
  Megaphone,
  Music,
  Quote,
  Copy,
  ChevronDown,
  ChevronUp,
  Monitor,
  Tablet,
  Smartphone,
  PanelRight,
  Settings,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

const blockTypes: { type: BlockType; icon: React.ElementType; label: string; color: string }[] = [
  { type: 'text', icon: Type, label: 'Texto', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { type: 'heading', icon: Heading2, label: 'Título', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { type: 'image', icon: ImageIcon, label: 'Imagem', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { type: 'video', icon: Video, label: 'Vídeo', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { type: 'code', icon: Code, label: 'Código', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  { type: 'quote', icon: Quote, label: 'Citação', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
  { type: 'quiz', icon: HelpCircle, label: 'Quiz', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { type: 'cta', icon: Megaphone, label: 'CTA', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  { type: 'audio', icon: Music, label: 'Áudio', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
]

type ViewportSize = 'desktop' | 'tablet' | 'mobile'
type ActiveTab = 'editor' | 'settings' | 'preview'

// Componente Sortable Block
interface SortableBlockProps {
  block: Block
  index: number
  totalBlocks: number
  onUpdate: (content: unknown) => void
  onRemove: () => void
  onDuplicate: () => void
  onMove: (direction: 'up' | 'down') => void
}

function SortableBlock({ block, index, totalBlocks, onUpdate, onRemove, onDuplicate, onMove }: SortableBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const blockInfo = blockTypes.find(b => b.type === block.type)
  const Icon = blockInfo?.icon || Type

  // Preview do conteúdo
  const getPreview = () => {
    const content = block.content as Record<string, unknown>
    switch (block.type) {
      case 'text':
        return (content.text as string)?.slice(0, 50) || 'Texto vazio'
      case 'heading':
        return (content.text as string)?.slice(0, 50) || 'Título vazio'
      case 'image':
        return (content.url as string) ? 'Imagem configurada' : 'URL da imagem'
      case 'video':
        return (content.url as string) ? 'Vídeo configurado' : 'URL do vídeo'
      case 'code':
        return (content.code as string)?.slice(0, 30) || 'Código vazio'
      case 'quote':
        return (content.text as string)?.slice(0, 50) || 'Citação vazia'
      case 'quiz':
        return (content.question as string)?.slice(0, 50) || 'Pergunta vazia'
      case 'cta':
        return (content.title as string)?.slice(0, 50) || 'CTA vazio'
      case 'audio':
        return (content.url as string) ? 'Áudio configurado' : 'URL do áudio'
      default:
        return 'Bloco vazio'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-border rounded-lg bg-card group transition-all duration-200 ${
        isDragging ? 'shadow-lg ring-2 ring-accent/50' : ''
      }`}
    >
      {/* Header com controles */}
      <div className={`flex items-center gap-2 px-3 py-2 border-b border-border rounded-t-lg ${blockInfo?.color || 'bg-muted'}`}>
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Block Type Badge */}
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${blockInfo?.color}`}>
          <Icon className="h-3.5 w-3.5" />
          <span>{blockInfo?.label}</span>
        </div>

        {/* Número do bloco */}
        <span className="text-xs text-muted-foreground font-mono">#{index + 1}</span>

        {/* Preview when collapsed */}
        {!isExpanded && (
          <span className="text-xs text-muted-foreground truncate flex-1 ml-2">
            {getPreview()}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onMove('up')}
            disabled={index === 0}
            title="Mover para cima"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onMove('down')}
            disabled={index === totalBlocks - 1}
            title="Mover para baixo"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onDuplicate}
            title="Duplicar bloco"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onRemove}
            title="Remover bloco"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Expand/Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
        >
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
        </button>
      </div>

      {/* Content */}
      <div className={`transition-all duration-200 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4">
          <BlockEditor
            block={block}
            onUpdate={onUpdate}
          />
        </div>
      </div>
    </div>
  )
}

// Componente de Preview
function ArticlePreview({ 
  title, 
  excerpt, 
  coverImage, 
  category, 
  author,
  publishedAt,
  readTime,
  blocks,
  viewport 
}: { 
  title: string
  excerpt: string
  coverImage: string
  category: string
  author: string
  publishedAt: string
  readTime: number
  blocks: Block[]
  viewport: ViewportSize
}) {
  const viewportClasses = {
    desktop: 'w-full',
    tablet: 'w-[768px] max-w-full',
    mobile: 'w-[375px] max-w-full',
  }

  const sortedBlocks = useMemo(() => {
    return [...blocks].sort((a, b) => a.order - b.order)
  }, [blocks])

  return (
    <div className={`mx-auto transition-all duration-300 ${viewportClasses[viewport]}`}>
      {/* Article Header Preview */}
      <div className="mb-6">
        <Badge variant="secondary" className="mb-3">
          {category || 'Categoria'}
        </Badge>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground heading-display leading-tight">
          {title || 'Título do Artigo'}
        </h1>
        
        {excerpt && (
          <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {excerpt}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {readTime} min de leitura
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xs">
            {author?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="text-sm font-medium text-foreground">{author || 'Autor'}</span>
        </div>
      </div>

      {/* Cover Image Preview */}
      {coverImage && (
        <div className="mb-6 aspect-video overflow-hidden rounded-xl border border-border bg-muted">
          <img
            src={coverImage}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Blocks Preview */}
      <div className="prose-vortek max-w-none">
        {sortedBlocks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <p>Adicione blocos para visualizar o artigo</p>
          </div>
        ) : (
          sortedBlocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))
        )}
      </div>
    </div>
  )
}

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
  
  // Preview state
  const [showPreview, setShowPreview] = useState(false)
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor')

  // Auto-save state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const initialDataRef = useRef(initialData)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = 
      title !== (initialDataRef.current?.title || '') ||
      slug !== (initialDataRef.current?.slug || '') ||
      excerpt !== (initialDataRef.current?.excerpt || '') ||
      category !== (initialDataRef.current?.category || 'Frontend') ||
      JSON.stringify(tags) !== JSON.stringify(initialDataRef.current?.tags || []) ||
      JSON.stringify(blocks) !== JSON.stringify(initialDataRef.current?.blocks || []) ||
      published !== (initialDataRef.current?.published || false) ||
      featured !== (initialDataRef.current?.featured || false) ||
      readTime !== (initialDataRef.current?.readTime || 5) ||
      coverImage !== (initialDataRef.current?.coverImage || '')
    
    setHasUnsavedChanges(hasChanges)
  }, [title, slug, excerpt, category, tags, blocks, published, featured, readTime, coverImage])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges || mode === 'create') return

    autoSaveTimerRef.current = setInterval(() => {
      if (hasUnsavedChanges && !saving && !isAutoSaving) {
        handleAutoSave()
      }
    }, 30000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
  }, [hasUnsavedChanges, saving, isAutoSaving, mode])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (!saving) {
          handleSave(false)
        }
      }
      // Ctrl/Cmd + Shift + P to toggle preview
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setShowPreview(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saving, title, slug, excerpt, category, tags, blocks, published, featured, readTime, coverImage])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

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
        return { url: '', alt: '', caption: '', size: 'full', align: 'center' }
      case 'video':
        return { url: '', title: '', duration: '' }
      case 'code':
        return { language: 'typescript', code: '' }
      case 'quote':
        return { text: '', author: '', source: '' }
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
    if (confirm('Tem certeza que deseja remover este bloco?')) {
      setBlocks(blocks.filter((b) => b.id !== blockId))
    }
  }

  // Duplicar bloco
  const handleDuplicateBlock = (blockId: string) => {
    const blockToDuplicate = blocks.find((b) => b.id === blockId)
    if (blockToDuplicate) {
      const newBlock: Block = {
        ...blockToDuplicate,
        id: `block-${Date.now()}`,
        content: JSON.parse(JSON.stringify(blockToDuplicate.content)),
      }
      const index = blocks.findIndex((b) => b.id === blockId)
      const newBlocks = [...blocks]
      newBlocks.splice(index + 1, 0, newBlock)
      setBlocks(newBlocks.map((b, i) => ({ ...b, order: i })))
    }
  }

  // Mover bloco (botões)
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

  // Drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id)
        const newIndex = prev.findIndex((b) => b.id === over.id)
        const newBlocks = arrayMove(prev, oldIndex, newIndex)
        return newBlocks.map((b, i) => ({ ...b, order: i }))
      })
    }
  }

  // Auto-save (silencioso)
  const handleAutoSave = async () => {
    if (!title.trim() || !slug.trim() || mode === 'create') return

    setIsAutoSaving(true)
    try {
      const body = {
        title,
        slug,
        excerpt,
        category,
        tags,
        blocks,
        published,
        featured,
        readTime,
        coverImage: coverImage || null,
      }

      const res = await fetch(`/api/admin/articles/${initialData?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        // Update ref to prevent false positives
        initialDataRef.current = { ...initialDataRef.current!, title, slug, excerpt, category, tags, blocks, published, featured, readTime, coverImage: coverImage || null }
        toast.success('Salvo automaticamente', { duration: 2000 })
      }
    } catch (error) {
      console.error('Auto-save error:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }

  // Salvar artigo
  const handleSave = async (publishNow = false) => {
    if (!title.trim() || !slug.trim()) {
      toast.error('Título e slug são obrigatórios')
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
        toast.success(publishNow ? 'Artigo publicado!' : 'Artigo salvo!')
        setHasUnsavedChanges(false)
        setLastSaved(new Date())
        router.push('/admin')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao salvar artigo')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar artigo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold heading-title">
                  {mode === 'create' ? 'Novo Artigo' : 'Editar Artigo'}
                </h1>
                {/* Unsaved changes indicator */}
                {hasUnsavedChanges && (
                  <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    <AlertCircle className="h-3 w-3" />
                    Não salvo
                  </span>
                )}
                {/* Auto-saving indicator */}
                {isAutoSaving && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Salvando...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {blocks.length} bloco{blocks.length !== 1 ? 's' : ''}
                </p>
                {lastSaved && (
                  <span className="text-xs text-muted-foreground/60">
                    • Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile Tabs */}
            <div className="flex lg:hidden border border-border rounded-lg p-0.5">
              <Button
                variant={activeTab === 'editor' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8"
                onClick={() => setActiveTab('editor')}
              >
                Editor
              </Button>
              <Button
                variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8"
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTab === 'preview' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8"
                onClick={() => setActiveTab('preview')}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            {/* Desktop Preview Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:flex gap-2"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? 'Ocultar' : 'Preview'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button size="sm" onClick={() => handleSave(true)} disabled={saving}>
              {published ? 'Atualizar' : 'Publicar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left: Settings (Desktop) */}
        <div className={`${showPreview ? 'hidden xl:block' : ''} hidden lg:block w-72 shrink-0 border-r border-border bg-muted/30 h-[calc(100vh-73px)] overflow-y-auto`}>
          <div className="p-4 space-y-4">
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
                className="text-xs font-mono"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo</Label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Breve descrição"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={category === cat ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
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
              {coverImage && (
                <div className="aspect-video rounded-lg overflow-hidden border border-border">
                  <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
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
                className="w-24"
              />
            </div>

            {/* Switches */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <Label htmlFor="published" className="text-sm">Publicado</Label>
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured" className="text-sm">Destaque</Label>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Nova tag"
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleAddTag}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer text-xs"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Settings */}
        {activeTab === 'settings' && (
          <div className="lg:hidden fixed inset-0 top-[73px] bg-background z-40 overflow-y-auto p-4 space-y-4">
            {/* Same settings content but for mobile */}
            <div className="space-y-2">
              <Label htmlFor="title-mobile">Título *</Label>
              <Input
                id="title-mobile"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Título do artigo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug-mobile">Slug *</Label>
              <Input
                id="slug-mobile"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-do-artigo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt-mobile">Resumo</Label>
              <textarea
                id="excerpt-mobile"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Breve descrição"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="coverImage-mobile">URL da Capa</Label>
              <Input
                id="coverImage-mobile"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Publicado</Label>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Destaque</Label>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </div>
          </div>
        )}

        {/* Mobile Preview */}
        {activeTab === 'preview' && (
          <div className="lg:hidden fixed inset-0 top-[73px] bg-background z-40 overflow-y-auto p-4">
            <ArticlePreview
              title={title}
              excerpt={excerpt}
              coverImage={coverImage}
              category={category}
              author="Admin"
              publishedAt=""
              readTime={readTime}
              blocks={blocks}
              viewport="mobile"
            />
          </div>
        )}

        {/* Center: Block Editor */}
        <div className={`flex-1 min-w-0 ${activeTab !== 'editor' ? 'hidden lg:block' : ''}`}>
          <div className="p-4 lg:p-6">
            {/* Add Block Buttons */}
            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-border">
              {blockTypes.map(({ type, icon: Icon, label, color }) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="gap-2 h-auto py-1.5"
                  onClick={() => handleAddBlock(type)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </div>

            {/* Blocks with DnD */}
            {blocks.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                <p className="font-medium text-lg">Nenhum bloco adicionado</p>
                <p className="text-sm mt-2">Use os botões acima para adicionar conteúdo</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {blocks.map((block, index) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        index={index}
                        totalBlocks={blocks.length}
                        onUpdate={(content) => handleUpdateBlock(block.id, content)}
                        onRemove={() => handleRemoveBlock(block.id)}
                        onDuplicate={() => handleDuplicateBlock(block.id)}
                        onMove={(direction) => handleMoveBlock(block.id, direction)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* Quick Add at Bottom */}
            {blocks.length > 0 && (
              <div className="pt-4 mt-6 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Adicionar mais:</p>
                <div className="flex flex-wrap gap-1.5">
                  {blockTypes.slice(0, 5).map(({ type, icon: Icon, label }) => (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={() => handleAddBlock(type)}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview (Desktop) */}
        {showPreview && (
          <div className="hidden lg:block w-[500px] xl:w-[600px] shrink-0 border-l border-border bg-muted/30 h-[calc(100vh-73px)] overflow-hidden">
            {/* Viewport Selector */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-background/95">
              <span className="text-xs font-medium text-muted-foreground">Preview</span>
              <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
                <Button
                  variant={viewport === 'desktop' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewport('desktop')}
                  title="Desktop"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={viewport === 'tablet' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewport('tablet')}
                  title="Tablet"
                >
                  <Tablet className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={viewport === 'mobile' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewport('mobile')}
                  title="Mobile"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            {/* Preview Content */}
            <div className="h-[calc(100%-49px)] overflow-y-auto p-4 bg-background">
              <ArticlePreview
                title={title}
                excerpt={excerpt}
                coverImage={coverImage}
                category={category}
                author="Admin"
                publishedAt=""
                readTime={readTime}
                blocks={blocks}
                viewport={viewport}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
