import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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

// GET - Buscar admin por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const admins = await db.execute(
      'SELECT id, email, name, avatar, createdAt FROM Admin WHERE id = ?',
      [id]
    )

    if (admins.length === 0) {
      return NextResponse.json({ error: 'Admin não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ admin: admins[0] })
  } catch (error) {
    console.error('Erro ao buscar admin:', error)
    return NextResponse.json({ error: 'Erro ao buscar administrador' }, { status: 500 })
  }
}

// PUT - Atualizar admin
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, password, avatar } = body

    // Verificar se o admin existe
    const existing = await db.execute(
      'SELECT id FROM Admin WHERE id = ?',
      [id]
    )

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Admin não encontrado' }, { status: 404 })
    }

    // Construir query de atualização
    const updates: string[] = []
    const values: any[] = []

    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }

    if (password !== undefined && password.trim() !== '') {
      updates.push('password = ?')
      values.push(await hashPassword(password))
    }

    if (avatar !== undefined) {
      updates.push('avatar = ?')
      values.push(avatar || null)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
    }

    updates.push('updatedAt = ?')
    values.push(new Date().toISOString())

    values.push(id)

    await db.execute(
      `UPDATE Admin SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    // Buscar admin atualizado
    const updated = await db.execute(
      'SELECT id, email, name, avatar, createdAt FROM Admin WHERE id = ?',
      [id]
    )

    return NextResponse.json({ 
      success: true,
      admin: updated[0]
    })
  } catch (error) {
    console.error('Erro ao atualizar admin:', error)
    return NextResponse.json({ error: 'Erro ao atualizar administrador' }, { status: 500 })
  }
}

// DELETE - Excluir admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se o admin existe
    const existing = await db.execute(
      'SELECT id FROM Admin WHERE id = ?',
      [id]
    )

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Admin não encontrado' }, { status: 404 })
    }

    // Verificar se há artigos associados
    const articles = await db.execute(
      'SELECT id FROM Article WHERE authorId = ? LIMIT 1',
      [id]
    )

    if (articles.length > 0) {
      return NextResponse.json({ 
        error: 'Este autor possui artigos associados. Transfira os artigos antes de excluir.' 
      }, { status: 400 })
    }

    // Excluir sessões do admin
    await db.execute('DELETE FROM Session WHERE adminId = ?', [id])

    // Excluir admin
    await db.execute('DELETE FROM Admin WHERE id = ?', [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir admin:', error)
    return NextResponse.json({ error: 'Erro ao excluir administrador' }, { status: 500 })
  }
}
