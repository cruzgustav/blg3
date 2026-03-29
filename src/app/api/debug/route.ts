import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  // Listar variáveis relacionadas ao banco
  const dbRelatedVars = Object.keys(process.env)
    .filter(key => 
      key.toLowerCase().includes('database') || 
      key.toLowerCase().includes('turso') || 
      key.toLowerCase().includes('db') || 
      key.toLowerCase().includes('auth') ||
      key.toLowerCase().includes('url')
    )
    .map(key => ({
      key,
      hasValue: !!process.env[key],
      length: process.env[key]?.length || 0,
    }))
  
  // Testar conexão com o banco usando API v2
  let dbTest = 'not_tested'
  let dbError = null
  let dbUrlUsed = null
  
  try {
    const rawUrl = 
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
    
    // Converter para API v2
    let httpUrl = rawUrl
    if (httpUrl.startsWith('libsql://')) {
      httpUrl = httpUrl.replace('libsql://', 'https://')
    }
    if (!httpUrl.includes('/v2/pipeline')) {
      httpUrl = httpUrl.replace(/\/$/, '') + '/v2/pipeline'
    }
    
    dbUrlUsed = httpUrl
    
    if (!rawUrl) {
      dbTest = 'no_url'
      dbError = 'URL não configurada'
    } else if (!token) {
      dbTest = 'no_token'
      dbError = 'Token não configurado'
    } else {
      // Formato API v2
      const response = await fetch(httpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          requests: [
            { type: 'execute', stmt: { sql: 'SELECT 1 as test', args: [] } },
            { type: 'close' }
          ]
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.results?.[0]?.type === 'error') {
          dbTest = 'sql_error'
          dbError = data.results[0].error
        } else {
          dbTest = 'connected'
        }
      } else {
        dbTest = 'http_error'
        dbError = `HTTP ${response.status}`
      }
    }
  } catch (e) {
    dbTest = 'exception'
    dbError = e instanceof Error ? e.message : 'Unknown error'
  }
  
  return NextResponse.json({
    status: 'ok',
    dbRelatedVars,
    dbTest,
    dbError,
    dbUrlUsed,
  })
}
