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
