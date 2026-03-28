# 🚀 VORTEK BLOG - Deploy no Cloudflare Pages

## Configuração do Banco Turso

O projeto está configurado para usar **Turso** como banco de dados.

### Credenciais já configuradas:
- **URL**: `libsql://vortek-blog-cruzgustav.aws-us-east-1.turso.io`
- **Token**: Configure no Cloudflare Pages Dashboard

---

## 🚀 Deploy no Cloudflare Pages

### 1. Conectar Repositório

1. Acesse: https://dash.cloudflare.com → Pages
2. Clique em **"Create a project"** → **"Connect to Git"**
3. Selecione seu repositório

### 2. Configurar Build

- **Build command**: `bun run build`
- **Build output**: `.next`

### 3. Variáveis de Ambiente

No Cloudflare Pages Dashboard, configure:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | `libsql://vortek-blog-cruzgustav.aws-us-east-1.turso.io` |
| `TURSO_AUTH_TOKEN` | (seu token do Turso) |
| `NODE_ENV` | `production` |

### 4. Deploy

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
| `bun run build` | Build para produção |
| `bun run db:generate` | Gerar Prisma Client |

---

## 🔐 Login Admin

- **URL**: `/admin/login`
- **Email**: `admin@vortek.com`
- **Senha**: `vortek123`

⚠️ **Altere a senha após o primeiro login!**

---

## 📞 Links Úteis

- [Turso Dashboard](https://turso.tech)
- [Cloudflare Pages](https://dash.cloudflare.com)
