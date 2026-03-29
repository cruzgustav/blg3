'use client'

import { Block, ImageSize, ImageAlign } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X } from 'lucide-react'

interface BlockEditorProps {
  block: Block
  onUpdate: (content: unknown) => void
}

export function BlockEditor({ block, onUpdate }: BlockEditorProps) {
  switch (block.type) {
    case 'text':
      return <TextBlockEditor block={block} onUpdate={onUpdate} />
    case 'heading':
      return <HeadingBlockEditor block={block} onUpdate={onUpdate} />
    case 'image':
      return <ImageBlockEditor block={block} onUpdate={onUpdate} />
    case 'video':
      return <VideoBlockEditor block={block} onUpdate={onUpdate} />
    case 'code':
      return <CodeBlockEditor block={block} onUpdate={onUpdate} />
    case 'quiz':
      return <QuizBlockEditor block={block} onUpdate={onUpdate} />
    case 'cta':
      return <CtaBlockEditor block={block} onUpdate={onUpdate} />
    case 'audio':
      return <AudioBlockEditor block={block} onUpdate={onUpdate} />
    case 'quote':
      return <QuoteBlockEditor block={block} onUpdate={onUpdate} />
    case 'callout':
      return <CalloutBlockEditor block={block} onUpdate={onUpdate} />
    case 'checklist':
      return <ChecklistBlockEditor block={block} onUpdate={onUpdate} />
    case 'carousel':
      return <CarouselBlockEditor block={block} onUpdate={onUpdate} />
    case 'poll':
      return <PollBlockEditor block={block} onUpdate={onUpdate} />
    case 'tabs':
      return <TabsBlockEditor block={block} onUpdate={onUpdate} />
    default:
      return <div>Tipo de bloco desconhecido</div>
  }
}

// Text Block Editor
function TextBlockEditor({ block, onUpdate }: BlockEditorProps) {
  const content = block.content as { text: string }

  return (
    <textarea
      value={content.text}
      onChange={(e) => onUpdate({ text: e.target.value })}
      placeholder="Digite o texto..."
      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    />
  )
}

// Heading Block Editor
function HeadingBlockEditor({ block, onUpdate }: BlockEditorProps) {
  const content = block.content as { level: number; text: string }

  return (
    <div className="space-y-2">
      <Select
        value={content.level.toString()}
        onValueChange={(value) => onUpdate({ ...content, level: parseInt(value) })}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2">H2</SelectItem>
          <SelectItem value="3">H3</SelectItem>
          <SelectItem value="4">H4</SelectItem>
        </SelectContent>
      </Select>
      <Input
        value={content.text}
        onChange={(e) => onUpdate({ ...content, text: e.target.value })}
        placeholder="Digite o título..."
      />
    </div>
  )
}

// Image Block Editor - ATUALIZADO com size e align
function ImageBlockEditor({ block, onUpdate }: BlockEditorProps) {
  const content = block.content as { 
    url: string
    alt: string
    caption: string
    size?: ImageSize
    align?: ImageAlign
  }

  // Defaults para retrocompatibilidade
  const size = content.size || 'full'
  const align = content.align || 'center'

  return (
    <div className="space-y-3">
      {/* URL e Alt */}
      <Input
        value={content.url}
        onChange={(e) => onUpdate({ ...content, url: e.target.value })}
        placeholder="URL da imagem"
      />
      <Input
        value={content.alt}
        onChange={(e) => onUpdate({ ...content, alt: e.target.value })}
        placeholder="Texto alternativo"
      />
      
      {/* Tamanho e Alinhamento */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Tamanho</label>
          <Select
            value={size}
            onValueChange={(value) => onUpdate({ ...content, size: value as ImageSize })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeno (25%)</SelectItem>
              <SelectItem value="medium">Médio (50%)</SelectItem>
              <SelectItem value="large">Grande (75%)</SelectItem>
              <SelectItem value="full">Largura total</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Alinhamento</label>
          <Select
            value={align}
            onValueChange={(value) => onUpdate({ ...content, align: value as ImageAlign })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Esquerda</SelectItem>
              <SelectItem value="center">Centro</SelectItem>
              <SelectItem value="right">Direita</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dica sobre mesclagem */}
      {(size === 'small' || size === 'medium') && align !== 'center' && (
        <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          💡 Imagem será mesclada com o texto (float {align === 'left' ? 'à esquerda' : 'à direita'})
        </p>
      )}
      
      {/* Legenda */}
      <Input
        value={content.caption}
        onChange={(e) => onUpdate({ ...content, caption: e.target.value })}
        placeholder="Legenda (opcional)"
      />
    </div>
  )
}

// Video Block Editor - NOVO
function VideoBlockEditor({ block, onUpdate }: BlockEditorProps) {
  const content = block.content as { url: string; title: string; duration: string }

  return (
    <div className="space-y-2">
      <Input
        value={content.url}
        onChange={(e) => onUpdate({ ...content, url: e.target.value })}
        placeholder="URL do vídeo (YouTube, Vimeo ou URL direta)"
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={content.title}
          onChange={(e) => onUpdate({ ...content, title: e.target.value })}
          placeholder="Título do vídeo"
        />
        <Input
          value={content.duration}
          onChange={(e) => onUpdate({ ...content, duration: e.target.value })}
          placeholder="Duração (ex: 12:45)"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Suporta: YouTube, Vimeo ou URLs diretas de vídeo (mp4, webm)
      </p>
    </div>
  )
}

// Quote Block Editor - NOVO
function QuoteBlockEditor({ block, onUpdate }: BlockEditorProps) {
  const content = block.content as { text: string; author: string; source: string }

  return (
    <div className="space-y-2">
      <textarea
        value={content.text}
        onChange={(e) => onUpdate({ ...content, text: e.target.value })}
        placeholder="Texto da citação..."
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={content.author}
          onChange={(e) => onUpdate({ ...content, author: e.target.value })}
          placeholder="Autor (opcional)"
        />
        <Input
          value={content.source}
          onChange={(e) => onUpdate({ ...content, source: e.target.value })}
          placeholder="Fonte (opcional)"
        />
      </div>
    </div>
  )
}

// Code Block Editor
function CodeBlockEditor({ block, onUpdate }: BlockEditorProps) {
  const content = block.content as { language: string; code: string }

  return (
    <div className="space-y-2">
      <Select
        value={content.language}
        onValueChange={(value) => onUpdate({ ...content, language: value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="typescript">TypeScript</SelectItem>
          <SelectItem value="javascript">JavaScript</SelectItem>
          <SelectItem value="python">Python</SelectItem>
          <SelectItem value="rust">Rust</SelectItem>
          <SelectItem value="go">Go</SelectItem>
          <SelectItem value="yaml">YAML</SelectItem>
          <SelectItem value="json">JSON</SelectItem>
          <SelectItem value="css">CSS</SelectItem>
          <SelectItem value="html">HTML</SelectItem>
          <SelectItem value="bash">Bash</SelectItem>
        </SelectContent>
      </Select>
      <textarea
        value={content.code}
        onChange={(e) => onUpdate({ ...content, code: e.target.value })}
        placeholder="Digite o código..."
        className="flex min-h-[150px] w-full rounded-md border border-input bg-zinc-900 text-zinc-100 px-3 py-2 text-sm font-mono placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </div>
  )
}

// Quiz Block Editor
function QuizBlockEditor({ block, onUpdate }: BlockEditorProps) {
  const content = block.content as { question: string; options: string[]; correctIndex: number }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...content.options]
    newOptions[index] = value
    onUpdate({ ...content, options: newOptions })
  }

  const addOption = () => {
    onUpdate({ ...content, options: [...content.options, ''] })
  }

  const removeOption = (index: number) => {
    const newOptions = content.options.filter((_, i) => i !== index)
    onUpdate({
      ...content,
      options: newOptions,
      correctIndex: content.correctIndex >= newOptions.length ? newOptions.length - 1 : content.correctIndex,
    })
  }

  return (
    <div className="space-y-3">
      <Input
        value={content.question}
        onChange={(e) => onUpdate({ ...content, question: e.target.value })}
        placeholder="Pergunta"
      />
      <div className="space-y-2">
        {content.options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              name={`correct-${block.id}`}
              checked={content.correctIndex === index}
              onChange={() => onUpdate({ ...content, correctIndex: index })}
              className="accent-accent"
            />
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Opção ${String.fromCharCode(65 + index)}`}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => removeOption(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addOption} className="gap-1">
        <Plus className="h-4 w-4" />
        Adicionar Opção
      </Button>
      <p className="text-xs text-muted-foreground">
        Selecione o radio button ao lado da resposta correta
      </p>
    </div>
  )
}

// CTA Block Editor
function CtaBlockEditor({ block, onUpdate }: BlockEditorProps) {
  const content = block.content as { title: string; description: string; buttonText: string; buttonLink: string }

  return (
    <div className="space-y-2">
      <Input
        value={content.title}
        onChange={(e) => onUpdate({ ...content, title: e.target.value })}
        placeholder="Título do CTA"
      />
      <Input
        value={content.description}
        onChange={(e) => onUpdate({ ...content, description: e.target.value })}
        placeholder="Descrição (opcional)"
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={content.buttonText}
          onChange={(e) => onUpdate({ ...content, buttonText: e.target.value })}
          placeholder="Texto do botão"
        />
        <Input
          value={content.buttonLink}
          onChange={(e) => onUpdate({ ...content, buttonLink: e.target.value })}
          placeholder="Link do botão"
        />
      </div>
    </div>
  )
}

// Audio Block Editor
function AudioBlockEditor({ block, onUpdate }: BlockEditorProps) {
  const content = block.content as { url: string; title: string; duration: string }

  return (
    <div className="space-y-2">
      <Input
        value={content.url}
        onChange={(e) => onUpdate({ ...content, url: e.target.value })}
        placeholder="URL do áudio"
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={content.title}
          onChange={(e) => onUpdate({ ...content, title: e.target.value })}
          placeholder="Título do áudio"
        />
        <Input
          value={content.duration}
          onChange={(e) => onUpdate({ ...content, duration: e.target.value })}
          placeholder="Duração (ex: 12:45)"
        />
      </div>
    </div>
  )
}

// Callout Block Editor
function CalloutBlockEditor({ block, onUpdate }: BlockEditorProps) {
  const content = block.content as { calloutType: string; title: string; text: string }
  const calloutType = content.calloutType || 'info'

  return (
    <div className="space-y-2">
      <Select
        value={calloutType}
        onValueChange={(value) => onUpdate({ ...content, calloutType: value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="info">ℹ️ Informação</SelectItem>
          <SelectItem value="tip">💡 Dica</SelectItem>
          <SelectItem value="warning">⚠️ Aviso</SelectItem>
          <SelectItem value="danger">🚫 Perigo</SelectItem>
        </SelectContent>
      </Select>
      <Input
        value={content.title}
        onChange={(e) => onUpdate({ ...content, title: e.target.value })}
        placeholder="Título (opcional)"
      />
      <textarea
        value={content.text}
        onChange={(e) => onUpdate({ ...content, text: e.target.value })}
        placeholder="Texto do callout..."
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </div>
  )
}

// Checklist Block Editor
function ChecklistBlockEditor({ block, onUpdate }: BlockEditorProps) {
  const content = block.content as { items: { id: string; text: string; checked: boolean }[] }
  const items = content.items || []

  const updateItem = (index: number, text: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], text }
    onUpdate({ items: newItems })
  }

  const toggleItem = (index: number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], checked: !newItems[index].checked }
    onUpdate({ items: newItems })
  }

  const addItem = () => {
    const newItem = { id: `item-${Date.now()}`, text: '', checked: false }
    onUpdate({ items: [...items, newItem] })
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onUpdate({ items: newItems })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(index)}
              className="accent-accent h-4 w-4"
            />
            <Input
              value={item.text}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`Item ${index + 1}`}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => removeItem(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
        <Plus className="h-4 w-4" />
        Adicionar Item
      </Button>
      <p className="text-xs text-muted-foreground">
        Marque os itens que já devem aparecer como concluídos
      </p>
    </div>
  )
}

// Carousel Block Editor
function CarouselBlockEditor({ block, onUpdate }: BlockEditorProps) {
  const content = block.content as { 
    images: { id: string; url: string; alt: string; caption: string }[] 
  }
  const images = content.images || []

  const updateImage = (index: number, field: string, value: string) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], [field]: value }
    onUpdate({ images: newImages })
  }

  const addImage = () => {
    const newImage = { 
      id: `img-${Date.now()}`, 
      url: '', 
      alt: '', 
      caption: '' 
    }
    onUpdate({ images: [...images, newImage] })
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onUpdate({ images: newImages })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-4">
        {images.map((image, index) => (
          <div key={image.id} className="p-3 border border-border rounded-lg space-y-2 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Imagem {index + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              value={image.url}
              onChange={(e) => updateImage(index, 'url', e.target.value)}
              placeholder="URL da imagem"
            />
            <Input
              value={image.alt}
              onChange={(e) => updateImage(index, 'alt', e.target.value)}
              placeholder="Texto alternativo"
            />
            <Input
              value={image.caption}
              onChange={(e) => updateImage(index, 'caption', e.target.value)}
              placeholder="Legenda (opcional)"
            />
            {image.url && (
              <div className="aspect-video rounded overflow-hidden border border-border">
                <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addImage} className="gap-1">
        <Plus className="h-4 w-4" />
        Adicionar Imagem
      </Button>
      {images.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Adicione pelo menos 2 imagens para criar um carrossel
        </p>
      )}
    </div>
  )
}

// Poll Block Editor
function PollBlockEditor({ block, onUpdate }: BlockEditorProps) {
  const content = block.content as { 
    question: string
    options: { id: string; text: string; votes: number }[] 
  }
  const options = content.options || []

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], text }
    onUpdate({ ...content, options: newOptions })
  }

  const addOption = () => {
    const newOption = { 
      id: `opt-${Date.now()}`, 
      text: '', 
      votes: 0 
    }
    onUpdate({ ...content, options: [...options, newOption] })
  }

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index)
    onUpdate({ ...content, options: newOptions })
  }

  return (
    <div className="space-y-3">
      <Input
        value={content.question}
        onChange={(e) => onUpdate({ ...content, question: e.target.value })}
        placeholder="Pergunta da enquete"
      />
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2">
            <Input
              value={option.text}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Opção ${index + 1}`}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => removeOption(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addOption} className="gap-1">
        <Plus className="h-4 w-4" />
        Adicionar Opção
      </Button>
      <p className="text-xs text-muted-foreground">
        Os votos serão armazenados localmente no navegador do leitor
      </p>
    </div>
  )
}

// Tabs Block Editor
function TabsBlockEditor({ block, onUpdate }: BlockEditorProps) {
  const content = block.content as { 
    tabs: { id: string; title: string; content: string }[] 
  }
  const tabs = content.tabs || []

  const updateTab = (index: number, field: string, value: string) => {
    const newTabs = [...tabs]
    newTabs[index] = { ...newTabs[index], [field]: value }
    onUpdate({ tabs: newTabs })
  }

  const addTab = () => {
    const newTab = { 
      id: `tab-${Date.now()}`, 
      title: '', 
      content: '' 
    }
    onUpdate({ tabs: [...tabs, newTab] })
  }

  const removeTab = (index: number) => {
    const newTabs = tabs.filter((_, i) => i !== index)
    onUpdate({ tabs: newTabs })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-4">
        {tabs.map((tab, index) => (
          <div key={tab.id} className="p-3 border border-border rounded-lg space-y-2 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Aba {index + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => removeTab(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              value={tab.title}
              onChange={(e) => updateTab(index, 'title', e.target.value)}
              placeholder="Título da aba"
            />
            <textarea
              value={tab.content}
              onChange={(e) => updateTab(index, 'content', e.target.value)}
              placeholder="Conteúdo da aba..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addTab} className="gap-1">
        <Plus className="h-4 w-4" />
        Adicionar Aba
      </Button>
      {tabs.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Adicione pelo menos 2 abas para organizar o conteúdo
        </p>
      )}
    </div>
  )
}
