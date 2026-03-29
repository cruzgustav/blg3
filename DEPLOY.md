# 🚀 VORTEK BLOG - Deploy no Cloudflare Pages

## Configuração do Banco Turso

O projeto está configurado para usar **Turso** como banco de dados.

---

## 🚀 Deploy no Cloudflare Pages

### 1. Conectar Repositório

1. Acesse: https://dash.cloudflare.com → Pages
2. Clique em **"Create a project"** → **"Connect to Git"**
3. Selecione seu repositório

### 2. Configurar Build

- **Build command**: `bun run pages:build`
- **Build output**: `.vercel/output/static`

### 3. Variáveis de Ambiente

No Cloudflare Pages Dashboard, configure:

| Variável | Valor |
|----------|-------|
| `TURSO_DATABASE_URL` | `libsql://vortek-blog-cruzgustav.aws-us-east-1.turso.io` |
| `TURSO_AUTH_TOKEN` | (seu token do Turso) |
| `NODE_ENV` | `production` |

### 4. ⚠️ IMPORTANTE: Configurar Compatibility Flags

**OBRIGATÓRIO** para que o site funcione:

1. No Cloudflare Pages Dashboard, vá em seu projeto
2. Acesse **Settings** → **Tempo de execução** (Runtime)
3. Encontre **"Sinalizadores de compatibilidade"** (Compatibility flags)
4. Adicione `nodejs_compat`
5. Salve as alterações
6. Faça um novo deploy

### 5. Deploy

Clique em **"Save and Deploy"**

---

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
bun install

# Gerar Prisma Client
bun run db:generate

# Iniciar servidor
bun run dev
```

---

## 📦 Scripts

| Comando | Descrição |
|---------|-----------|
| `bun run dev` | Servidor de desenvolvimento |
| `bun run build` | Build padrão (Next.js) |
| `bun run pages:build` | Build para Cloudflare Pages |
| `bun run db:generate` | Gerar Prisma Client |

---

## 🔐 Login Admin

- **URL**: `/admin/login`
- **Email**: `admin@vortek.com`
- **Senha**: `vortek123`

⚠️ **Altere a senha após o primeiro login!**

---

## 🐛 Solução de Problemas

### Erro: "nodejs_compat compatibility flag not set"

1. Acesse o Cloudflare Dashboard
2. Vá em **Workers & Pages** → Seu Projeto
3. **Settings** → **Tempo de execução** → **Sinalizadores de compatibilidade**
4. Adicione `nodejs_compat`
5. Faça um novo deploy

### Erro: "No Pages Function"

Isso significa que o site foi deployado como estático. Certifique-se de:
- Usar `bun run pages:build` como build command
- Ter `export const runtime = 'edge'` nas rotas dinâmicas

### Erro: "XMLHttpRequest is not defined"

Este erro foi corrigido usando `@prisma/adapter-libsql/web` que é compatível com Edge Runtime.

---

## 📞 Links Úteis

- [Turso Dashboard](https://turso.tech)
- [Cloudflare Pages](https://dash.cloudflare.com)
