import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export const runtime = 'edge'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value

    if (token) {
      await db.execute({
        sql: 'DELETE FROM Session WHERE token = ?',
        args: [token]
      })
    }

    cookieStore.delete('admin_token')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no logout:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer logout' },
      { status: 500 }
    )
  }
}
