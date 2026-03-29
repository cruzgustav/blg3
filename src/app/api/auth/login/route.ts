import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

export const runtime = 'edge'

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await db.execute({
      sql: 'SELECT * FROM Admin WHERE email = ?',
      args: [email]
    })

    const admin = result.rows[0]
    const hashedPassword = await hashPassword(password)
    
    if (!admin || admin.password !== hashedPassword) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    await db.execute({
      sql: 'INSERT INTO Session (id, adminId, token, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?)',
      args: [
        crypto.randomUUID(),
        admin.id,
        token,
        expiresAt,
        new Date().toISOString()
      ]
    })

    const cookieStore = await cookies()
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(expiresAt),
    })

    return NextResponse.json({
      admin: {
        id: admin.id as string,
        email: admin.email as string,
        name: admin.name as string,
        avatar: admin.avatar as string | null,
      },
    })
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
