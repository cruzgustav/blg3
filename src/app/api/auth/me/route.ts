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

    const sessionResult = await db.execute('SELECT * FROM Session WHERE token = ?', [token])
    const session = sessionResult[0]

    if (!session || new Date(session.expiresAt as string) < new Date()) {
      await db.execute('DELETE FROM Session WHERE token = ?', [token])
      cookieStore.delete('admin_token')
      return NextResponse.json({ admin: null })
    }

    const adminResult = await db.execute(
      'SELECT id, email, name, avatar FROM Admin WHERE id = ?',
      [session.adminId]
    )

    const admin = adminResult[0]

    if (!admin) {
      return NextResponse.json({ admin: null })
    }

    return NextResponse.json({ 
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        avatar: admin.avatar,
      }
    })
  } catch (error) {
    console.error('Erro ao verificar sessão:', error)
    return NextResponse.json({ admin: null })
  }
}
