/**
 * Turso 数据库适配器
 * 在 Vercel 生产环境下替代 Prisma 进行数据库操作
 * 使用 libsql 客户端直接执行 SQL（绕过 Prisma 5 的 adapter 兼容问题）
 */

import { createClient } from '@libsql/client'

let _client: ReturnType<typeof createClient> | null = null
let _ready: Promise<void> | null = null
let _readyFlag = false

function getClient() {
  if (_client) return _client
  const url = process.env.TURSO_DATABASE_URL
  if (!url) return null
  _client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
  return _client
}

/** 确保数据库 schema 已创建 */
async function ensureSchema() {
  const client = getClient()
  if (!client || _readyFlag) return
  if (!_ready) {
    _ready = (async () => {
      try {
        const r = await client.execute("SELECT count(*) as cnt FROM sqlite_master WHERE type='table' AND name='User'")
        const row = r.rows?.[0] as any
        if (row?.cnt === 0) {
          const fs = await import('fs')
          const path = await import('path')
          const sqlPath = path.join(process.cwd(), 'prisma', 'setup.sql')
          const sql = fs.readFileSync(sqlPath, 'utf-8')
          for (const stmt of sql.split(';').filter(s => s.trim())) {
            await client.execute(stmt.trim() + ';')
          }
        }
        _readyFlag = true
      } catch (err) {
        console.error('[turso] schema init:', err)
        _readyFlag = true // 即使出错也标记为已尝试
      }
    })()
  }
  await _ready
}

/** 后端数据库操作，可用于 Turso 模式 */
export const tursoDb = {
  ready: ensureSchema,

  async findUserByEmail(email: string): Promise<any | null> {
    const c = getClient()
    if (!c) return null
    await ensureSchema()
    try {
      const r = await c.execute({ sql: 'SELECT * FROM "User" WHERE "email" = ?', args: [email] })
      return r.rows[0] || null
    } catch { return null }
  },

  async createUser(email: string, password: string, name?: string): Promise<any | null> {
    const c = getClient()
    if (!c) return null
    await ensureSchema()
    try {
      const now = new Date().toISOString()
      const r = await c.execute({
        sql: 'INSERT INTO "User" ("email","password","name","createdAt","updatedAt") VALUES (?,?,?,?,?) RETURNING *',
        args: [email, password, name || email.split('@')[0], now, now],
      })
      return r.rows[0] || null
    } catch { return null }
  },

  async getProfile(userId: number): Promise<any | null> {
    const c = getClient()
    if (!c) return null
    await ensureSchema()
    try {
      const r = await c.execute({ sql: 'SELECT * FROM "IpProfile" WHERE "userId" = ?', args: [userId] })
      return r.rows[0] || null
    } catch { return null }
  },

  async saveProfile(userId: number, data: any) {
    const c = getClient()
    if (!c) return
    await ensureSchema()
    try {
      const existing = await c.execute({ sql: 'SELECT id FROM "IpProfile" WHERE "userId" = ?', args: [userId] })
      const fields = Object.keys(data).filter(k => data[k] !== undefined && data[k] !== '')
      const now = new Date().toISOString()
      if (existing.rows.length > 0) {
        const setClause = fields.map(k => `"${k}" = ?`).join(', ')
        await c.execute({ sql: `UPDATE "IpProfile" SET ${setClause}, "updatedAt" = ? WHERE "userId" = ?`, args: [...fields.map(k => String(data[k])), now, userId] })
      } else {
        const cols = ['userId', ...fields, 'createdAt', 'updatedAt']
        const vals = [userId, ...fields.map(k => String(data[k])), now, now]
        await c.execute({ sql: `INSERT INTO "IpProfile" (${cols.map(c => `"${c}"`).join(',')}) VALUES (${cols.map(() => '?').join(',')})`, args: vals })
      }
    } catch {}
  },

  async saveChat(userId: number, role: string, content: string, metadata?: string) {
    const c = getClient()
    if (!c) return
    await ensureSchema()
    try {
      const now = new Date().toISOString()
      await c.execute({
        sql: 'INSERT INTO "IpChat" ("userId","role","content","metadata","createdAt") VALUES (?,?,?,?,?)',
        args: [userId, role, content, metadata || null, now],
      })
    } catch {}
  },

  async getChats(userId: number, limit = 50): Promise<any[]> {
    const c = getClient()
    if (!c) return []
    await ensureSchema()
    try {
      const r = await c.execute({ sql: 'SELECT * FROM "IpChat" WHERE "userId" = ? ORDER BY "createdAt" ASC LIMIT ?', args: [userId, limit] })
      return r.rows as any[]
    } catch { return [] }
  },
}
