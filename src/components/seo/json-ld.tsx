interface ArticleJsonLdProps {
  article: {
    title: string
    excerpt: string | null
    coverImage: string | null
    category: string
    tags: string[]
    readTime: number
    publishedAt: string | null
    author: {
      name: string
      email: string
      avatar: string | null
    }
  }
  url: string
}

export function ArticleJsonLd({ article, url }: ArticleJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || '',
    image: article.coverImage ? [article.coverImage] : [],
    datePublished: article.publishedAt || undefined,
    dateModified: article.publishedAt || undefined,
    author: {
      '@type': 'Person',
      name: article.author.name,
      email: article.author.email,
      image: article.author.avatar || undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vortek Blog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://vortek.blog/logo.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: article.category,
    keywords: article.tags.join(', '),
    wordCount: article.readTime * 200,
    timeRequired: `PT${article.readTime}M`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// BreadcrumbList Schema
export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// Organization Schema para o site
export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Vortek Blog',
    url: 'https://vortek.blog',
    logo: 'https://vortek.blog/logo.svg',
    description: 'Marketing, Dados e Tecnologia para escalar seu negócio com inteligência.',
    sameAs: [
      'https://twitter.com/vortek',
      'https://linkedin.com/company/vortek',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// WebSite Schema para SearchAction
export function WebSiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Vortek Blog',
    url: 'https://vortek.blog',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://vortek.blog/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
