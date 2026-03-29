import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export const runtime = 'edge'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ admin: null })
    }

    const sessionResult = await db.execute({
      sql: 'SELECT * FROM Session WHERE token = ?',
      args: [token]
    })

    const session = sessionResult.rows[0]

    if (!session || new Date(session.expiresAt as string) < new Date()) {
      await db.execute({
        sql: 'DELETE FROM Session WHERE token = ?',
        args: [token]
      })
      cookieStore.delete('admin_token')
      return NextResponse.json({ admin: null })
    }

    const adminResult = await db.execute({
      sql: 'SELECT id, email, name, avatar FROM Admin WHERE id = ?',
      args: [session.adminId]
    })

    const admin = adminResult.rows[0]

    if (!admin) {
      return NextResponse.json({ admin: null })
    }

    return NextResponse.json({ 
      admin: {
        id: admin.id as string,
        email: admin.email as string,
        name: admin.name as string,
        avatar: admin.avatar as string | null,
      }
    })
  } catch (error) {
    console.error('Erro ao verificar sessão:', error)
    return NextResponse.json({ admin: null })
  }
}
