import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

// Edge Runtime para Cloudflare Pages
export const runtime = 'edge'

// Função de hash compatível com o login (SHA-256)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// GET - Listar todos os admins
export async function GET() {
  try {
    const admins = await db.execute(
      'SELECT id, email, name, avatar, createdAt FROM Admin ORDER BY createdAt DESC',
      []
    )
    
    return NextResponse.json({ admins })
  } catch (error) {
    console.error('Erro ao listar admins:', error)
    return NextResponse.json({ error: 'Erro ao listar administradores' }, { status: 500 })
  }
}

// POST - Criar novo admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, avatar } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, senha e nome são obrigatórios' }, { status: 400 })
    }

    // Verificar se email já existe
    const existing = await db.execute(
      'SELECT id FROM Admin WHERE email = ?',
      [email]
    )

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Este email já está cadastrado' }, { status: 400 })
    }

    // Hash SHA-256 (mesmo método usado no login)
    const hashedPassword = await hashPassword(password)

    // Criar admin
    const id = nanoid()
    await db.execute(
      'INSERT INTO Admin (id, email, password, name, avatar) VALUES (?, ?, ?, ?, ?)',
      [id, email, hashedPassword, name, avatar || null]
    )

    return NextResponse.json({ 
      success: true,
      admin: { id, email, name, avatar: avatar || null }
    })
  } catch (error) {
    console.error('Erro ao criar admin:', error)
    return NextResponse.json({ error: 'Erro ao criar administrador' }, { status: 500 })
  }
}
