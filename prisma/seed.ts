import { db } from '@/lib/db'
import { hash } from 'crypto'

// Função para criar hash simples de senha
function hashPassword(password: string): string {
  return hash('sha256', password)
}

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar admin
  const admin = await db.admin.upsert({
    where: { email: 'admin@vortek.com' },
    update: {},
    create: {
      email: 'admin@vortek.com',
      password: hashPassword('vortek123'),
      name: 'Admin Vortek',
      avatar: null,
    },
  })

  console.log('✅ Admin criado:', admin.email)

  // Criar artigos de exemplo
  const articles = [
    {
      slug: 'introducao-ao-ssr',
      title: 'Server-Side Rendering: O Guia Definitivo',
      excerpt: 'Descubra como o SSR pode transformar a performance e SEO da sua aplicação web moderna.',
      category: 'Frontend',
      tags: JSON.stringify(['SSR', 'React', 'Performance', 'SEO']),
      published: true,
      featured: true,
      readTime: 8,
      blocks: JSON.stringify([
        { id: '1', type: 'heading', content: { level: 2, text: 'O que é Server-Side Rendering?' }, order: 0 },
        { id: '2', type: 'text', content: { text: 'Server-Side Rendering (SSR) é uma técnica onde o HTML é gerado no servidor para cada requisição, ao contrário do Client-Side Rendering onde o JavaScript renderiza a página no navegador.' }, order: 1 },
        { id: '3', type: 'heading', content: { level: 2, text: 'Benefícios do SSR' }, order: 2 },
        { id: '4', type: 'text', content: { text: 'O SSR oferece diversos benefícios como melhor SEO, First Contentful Paint mais rápido, e melhor experiência em dispositivos com menos recursos.' }, order: 3 },
        { id: '5', type: 'code', content: { language: 'typescript', code: '// Exemplo de SSR em Next.js\nexport async function getServerSideProps() {\n  const data = await fetchData();\n  return { props: { data } };\n}' }, order: 4 },
        { id: '6', type: 'cta', content: { title: 'Precisa de ajuda com SSR?', description: 'A Vortek oferece consultoria especializada em arquitetura web.', buttonText: 'Fale Conosco', buttonLink: '#contato' }, order: 5 },
      ]),
      metaTitle: 'SSR: Guia Definitivo | Vortek Blog',
      metaDescription: 'Aprenda tudo sobre Server-Side Rendering e como implementar em suas aplicações.',
      publishedAt: new Date('2025-01-15'),
      authorId: admin.id,
    },
    {
      slug: 'design-systems-escalaveis',
      title: 'Construindo Design Systems Escaláveis',
      excerpt: 'Aprenda a criar e manter design systems que crescem com seu produto.',
      category: 'Design',
      tags: JSON.stringify(['Design System', 'UI', 'UX', 'Componentes']),
      published: true,
      featured: false,
      readTime: 12,
      blocks: JSON.stringify([
        { id: '1', type: 'heading', content: { level: 2, text: 'Fundamentos de um Design System' }, order: 0 },
        { id: '2', type: 'text', content: { text: 'Um Design System é muito mais do que uma biblioteca de componentes. É uma coleção completa de elementos de design, padrões de código e diretrizes de uso que garantem consistência em toda a aplicação.' }, order: 1 },
        { id: '3', type: 'image', content: { url: '/placeholder-design-system.png', alt: 'Design System Components', caption: 'Exemplo de componentes de um Design System' }, order: 2 },
        { id: '4', type: 'heading', content: { level: 2, text: 'Princípios-Chave' }, order: 3 },
        { id: '5', type: 'text', content: { text: 'Os princípios fundamentais incluem: consistência visual, documentação clara, componentização inteligente e governança adequada.' }, order: 4 },
      ]),
      metaTitle: 'Design Systems Escaláveis | Vortek Blog',
      metaDescription: 'Guia completo para criar design systems que escalam com seu produto.',
      publishedAt: new Date('2025-01-12'),
      authorId: admin.id,
    },
    {
      slug: 'arquitetura-microservicos',
      title: 'Arquitetura de Microserviços na Prática',
      excerpt: 'Um guia prático sobre como implementar microserviços de forma eficiente.',
      category: 'Backend',
      tags: JSON.stringify(['Microserviços', 'Arquitetura', 'Backend', 'DevOps']),
      published: true,
      featured: false,
      readTime: 15,
      blocks: JSON.stringify([
        { id: '1', type: 'heading', content: { level: 2, text: 'Introdução aos Microserviços' }, order: 0 },
        { id: '2', type: 'text', content: { text: 'A arquitetura de microserviços é uma abordagem onde uma aplicação é estruturada como uma coleção de serviços fracamente acoplados, cada um implementando uma capacidade de negócio específica.' }, order: 1 },
        { id: '3', type: 'quiz', content: { question: 'Qual é a principal vantagem dos microserviços?', options: ['Código mais simples', 'Escalabilidade independente', 'Menos servidores', 'Sem necessidade de testes'], correctIndex: 1 }, order: 2 },
        { id: '4', type: 'code', content: { language: 'yaml', code: '# Exemplo de docker-compose\nservices:\n  api:\n    build: ./api\n    ports:\n      - "3000:3000"\n  auth:\n    build: ./auth\n    ports:\n      - "3001:3001"' }, order: 3 },
      ]),
      metaTitle: 'Microserviços na Prática | Vortek Blog',
      metaDescription: 'Aprenda a implementar arquitetura de microserviços de forma eficiente.',
      publishedAt: new Date('2025-01-10'),
      authorId: admin.id,
    },
    {
      slug: 'inteligencia-artificial-2025',
      title: 'IA em 2025: Tendências e Aplicações',
      excerpt: 'As principais tendências de inteligência artificial para 2025 e como aplicá-las em seus projetos.',
      category: 'IA',
      tags: JSON.stringify(['IA', 'Machine Learning', 'LLM', 'Inovação']),
      published: true,
      featured: false,
      readTime: 10,
      blocks: JSON.stringify([
        { id: '1', type: 'heading', content: { level: 2, text: 'O Futuro da IA' }, order: 0 },
        { id: '2', type: 'text', content: { text: '2025 promete ser um ano revolucionário para a inteligência artificial, com avanços significativos em modelos de linguagem, visão computacional e automação inteligente.' }, order: 1 },
        { id: '3', type: 'heading', content: { level: 3, text: 'Principais Tendências' }, order: 2 },
        { id: '4', type: 'text', content: { text: '1. Agentes Autônomos\n2. Multimodalidade Avançada\n3. IA no Edge\n4. RAG (Retrieval-Augmented Generation)\n5. Ética e Governança de IA' }, order: 3 },
      ]),
      metaTitle: 'IA em 2025 | Vortek Blog',
      metaDescription: 'Tendências de inteligência artificial para 2025.',
      publishedAt: new Date('2025-01-08'),
      authorId: admin.id,
    },
    {
      slug: 'devops-essencial',
      title: 'DevOps Essencial: CI/CD e Automação',
      excerpt: 'Domine os conceitos fundamentais de DevOps e implemente pipelines CI/CD eficientes.',
      category: 'DevOps',
      tags: JSON.stringify(['DevOps', 'CI/CD', 'Automação', 'GitHub Actions']),
      published: true,
      featured: false,
      readTime: 11,
      blocks: JSON.stringify([
        { id: '1', type: 'heading', content: { level: 2, text: 'O que é DevOps?' }, order: 0 },
        { id: '2', type: 'text', content: { text: 'DevOps é a união de pessoas, processos e ferramentas para permitir a entrega contínua de valor aos usuários finais.' }, order: 1 },
        { id: '3', type: 'code', content: { language: 'yaml', code: '# Exemplo de GitHub Actions\nname: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm ci\n      - run: npm test' }, order: 2 },
        { id: '4', type: 'audio', content: { url: '/audio-devops.mp3', title: 'Podcast: DevOps na Prática', duration: '12:45' }, order: 3 },
      ]),
      metaTitle: 'DevOps Essencial | Vortek Blog',
      metaDescription: 'Aprenda CI/CD e automação com DevOps.',
      publishedAt: new Date('2025-01-05'),
      authorId: admin.id,
    },
  ]

  for (const article of articles) {
    const existing = await db.article.findUnique({ where: { slug: article.slug } })
    if (!existing) {
      await db.article.create({ data: article })
      console.log('✅ Artigo criado:', article.title)
    } else {
      console.log('⏭️  Artigo já existe:', article.title)
    }
  }

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n📝 Credenciais do Admin:')
  console.log('   Email: admin@vortek.com')
  console.log('   Senha: vortek123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
