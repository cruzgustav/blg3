import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  // Listar todas as variáveis de ambiente relacionadas ao banco (sem mostrar valores completos)
  const envVars = Object.keys(process.env)
    .filter(key => 
      key.includes('DATABASE') || 
      key.includes('TURSO') || 
      key.includes('DB') || 
      key.includes('AUTH') ||
      key.includes('URL')
    )
    .map(key => ({
      key,
      hasValue: !!process.env[key],
      length: process.env[key]?.length || 0,
      preview: process.env[key]?.substring(0, 30) + '...' || null,
    }))
  
  // Testar conexão com o banco
  let dbTest = 'not_tested'
  let dbError = null
  
  try {
    const url = 
      process.env.TURSO_DATABASE_URL || 
      process.env.TURSO_DB_URL ||
      process.env.DATABASE_URL ||
      process.env.DB_URL ||
      process.env.TURSO_URL ||
      ''
    
    const token = 
      process.env.TURSO_AUTH_TOKEN ||
      process.env.TURSO_TOKEN ||
      process.env.TURSO_AUTH ||
      process.env.AUTH_TOKEN ||
      process.env.DATABASE_AUTH_TOKEN ||
      ''
    
    if (!url) {
      dbTest = 'no_url'
      dbError = 'URL do banco não configurada'
    } else {
      let httpUrl = url
      if (httpUrl.startsWith('libsql://')) {
        httpUrl = httpUrl.replace('libsql://', 'https://')
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(httpUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          statements: [{ q: 'SELECT 1 as test', params: [] }],
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        dbTest = 'connected'
        if (result.results?.[0]?.error) {
          dbTest = 'error'
          dbError = result.results[0].error
        }
      } else {
        dbTest = 'failed'
        dbError = `HTTP ${response.status}: ${await response.text()}`
      }
    }
  } catch (e) {
    dbTest = 'exception'
    dbError = e instanceof Error ? e.message : 'Unknown error'
  }
  
  return NextResponse.json({
    envVars,
    dbTest,
    dbError,
    nodeEnv: process.env.NODE_ENV,
  })
}
