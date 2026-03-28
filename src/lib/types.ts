// Tipos para o Blog Vortek

// Artigo com estatísticas (listagem)
export interface ArticleWithStats {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  category: string
  tags: string[]
  featured: boolean
  readTime: number
  viewCount: number
  likeCount: number
  saveCount: number
  publishedAt: string | null
  author: {
    name: string
  }
}

// Bloco de conteúdo
export type BlockType = 'text' | 'heading' | 'image' | 'video' | 'code' | 'quiz' | 'cta' | 'audio' | 'quote'

export interface BlockBase {
  id: string
  type: BlockType
  order: number
}

export interface TextBlock extends BlockBase {
  type: 'text'
  content: {
    text: string
  }
}

export interface HeadingBlock extends BlockBase {
  type: 'heading'
  content: {
    level: 2 | 3 | 4
    text: string
  }
}

export interface ImageBlock extends BlockBase {
  type: 'image'
  content: {
    url: string
    alt: string
    caption?: string
  }
}

export interface VideoBlock extends BlockBase {
  type: 'video'
  content: {
    url: string
    title: string
    duration?: string
  }
}

export interface CodeBlock extends BlockBase {
  type: 'code'
  content: {
    language: string
    code: string
  }
}

export interface QuizBlock extends BlockBase {
  type: 'quiz'
  content: {
    question: string
    options: string[]
    correctIndex: number
  }
}

export interface CtaBlock extends BlockBase {
  type: 'cta'
  content: {
    title: string
    description?: string
    buttonText: string
    buttonLink: string
  }
}

export interface AudioBlock extends BlockBase {
  type: 'audio'
  content: {
    url: string
    title: string
    duration?: string
  }
}

export interface QuoteBlock extends BlockBase {
  type: 'quote'
  content: {
    text: string
    author?: string
    source?: string
  }
}

export type Block = TextBlock | HeadingBlock | ImageBlock | VideoBlock | CodeBlock | QuizBlock | CtaBlock | AudioBlock | QuoteBlock

// Artigo completo com blocos
export interface ArticleFull extends Omit<ArticleWithStats, 'tags'> {
  tags: string[]
  blocks: Block[]
  metaTitle: string | null
  metaDescription: string | null
  author: {
    name: string
    email: string
    avatar: string | null
  }
}

// Admin
export interface Admin {
  id: string
  email: string
  name: string
  avatar: string | null
}

// Estado de interações do leitor (localStorage)
export interface ReaderInteractions {
  likedArticles: string[]
  savedArticles: string[]
}
