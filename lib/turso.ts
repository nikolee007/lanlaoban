/**
 * Turso 数据库适配器
 * 在 Vercel 生产环境下替代 Prisma 进行数据库操作
 * 使用 libsql 客户端直接执行 SQL（绕过 Prisma 5 的 adapter 兼容问题）
 */

import { createClient } from '@libsql/client'

interface TursoUser {
  id: number
  email: string
  password: string
  name: string
  createdAt: string
  updatedAt: string
}

interface TursoProfile {
  id: number
  userId: number
  [key: string]: unknown
  createdAt: string
  updatedAt: string
}

interface TursoChat {
  id: number
  userId: number
  role: string
  content: string
  metadata: string | null
  createdAt: string
}

interface SqliteMasterRow {
  cnt: number
}

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
  if (_ready === null) {
    _ready = (async () => {
      // 双重检查：防止并发调用同时进入 if (_ready === null) 分支
      if (_readyFlag) return
      try {
        const r = await client.execute("SELECT count(*) as cnt FROM sqlite_master WHERE type='table' AND name='User'")
        const row = r.rows?.[0] as unknown as SqliteMasterRow | undefined
        if (row && Number(row.cnt) === 0) {
          const fs = await import('fs')
          const path = await import('path')
          const sqlPath = path.join(process.cwd(), 'prisma', 'setup.sql')
          const sql = fs.readFileSync(sqlPath, 'utf-8')
          for (const stmt of sql.split(';').filter(s => s.trim())) {
            await client.execute(stmt.trim() + ';')
          }
        } else {
          // 已有 User 表（生产 Turso 已初始化过）→ 补建洋葱激活新表（缺失时）
          const r2 = await client.execute("SELECT count(*) as cnt FROM sqlite_master WHERE type='table' AND name='ActivationCode'")
          const row2 = r2.rows?.[0] as unknown as SqliteMasterRow | undefined
          if (row2 && Number(row2.cnt) === 0) {
            await client.execute(`CREATE TABLE IF NOT EXISTS "ActivationCode" (
              "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
              "code" TEXT NOT NULL, "cid" TEXT NOT NULL, "expiresAt" DATETIME NOT NULL,
              "maxDevices" INTEGER NOT NULL DEFAULT 1, "status" TEXT NOT NULL DEFAULT 'unused',
              "createdBy" INTEGER, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "activatedAt" DATETIME,
              CONSTRAINT "ActivationCode_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
            )`)
            await client.execute(`CREATE TABLE IF NOT EXISTS "Activation" (
              "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
              "codeId" INTEGER NOT NULL, "deviceFingerprint" TEXT NOT NULL, "token" TEXT,
              "validUntil" DATETIME, "lastHeartbeatAt" DATETIME, "status" TEXT NOT NULL DEFAULT 'active',
              "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT "Activation_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "ActivationCode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
            )`)
            await client.execute('CREATE UNIQUE INDEX IF NOT EXISTS "ActivationCode_code_key" ON "ActivationCode"("code")')
            await client.execute('CREATE UNIQUE INDEX IF NOT EXISTS "ActivationCode_cid_key" ON "ActivationCode"("cid")')
            await client.execute('CREATE UNIQUE INDEX IF NOT EXISTS "Activation_codeId_deviceFingerprint_key" ON "Activation"("codeId", "deviceFingerprint")')
          }
          // 幂等迁移：IpProfile 每日投递字段（老库补列）
          try {
            const cols = await client.execute('PRAGMA table_info("IpProfile")')
            const has = cols.rows.some((r: any) => r.name === 'dailyDeliveryEnabled')
            if (!has) {
              await client.execute(`ALTER TABLE "IpProfile" ADD COLUMN "persona" TEXT`)
              await client.execute(`ALTER TABLE "IpProfile" ADD COLUMN "dailyDeliveryEnabled" BOOLEAN NOT NULL DEFAULT false`)
              await client.execute(`ALTER TABLE "IpProfile" ADD COLUMN "deliveryDayCount" INTEGER NOT NULL DEFAULT 0`)
              await client.execute(`ALTER TABLE "IpProfile" ADD COLUMN "lastDeliveryAt" DATETIME`)
              await client.execute(`ALTER TABLE "IpProfile" ADD COLUMN "latestVideoUrl" TEXT`)
            }
          } catch (e) { console.error('[turso] IpProfile migration:', e) }
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

  async findUserByEmail(email: string): Promise<TursoUser | null> {
    const c = getClient()
    if (!c) return null
    await ensureSchema()
    try {
      const r = await c.execute({ sql: 'SELECT * FROM "User" WHERE "email" = ?', args: [email] })
      return (r.rows[0] as unknown as TursoUser) || null
    } catch (e) { console.error('[turso] findUserByEmail:', e); return null }
  },

  async findUserById(id: number): Promise<TursoUser | null> {
    const c = getClient()
    if (!c) return null
    await ensureSchema()
    try {
      const r = await c.execute({ sql: 'SELECT * FROM "User" WHERE "id" = ?', args: [id] })
      return (r.rows[0] as unknown as TursoUser) || null
    } catch (e) { console.error('[turso] findUserById:', e); return null }
  },

  async createUser(email: string, password: string, name?: string): Promise<TursoUser | null> {
    const c = getClient()
    if (!c) return null
    await ensureSchema()
    try {
      const now = new Date().toISOString()
      const displayName = name || email.split('@')[0]
      await c.execute({
        sql: 'INSERT INTO "User" ("email","password","name","createdAt","updatedAt") VALUES (?,?,?,?,?)',
        args: [email, password, displayName, now, now],
      })
      // 回查获取完整数据（包含自动生成的 id）
      const r2 = await c.execute({ sql: 'SELECT * FROM "User" WHERE "email" = ?', args: [email] })
      return (r2.rows[0] as unknown as TursoUser) || { id: 0, email, password, name: displayName, createdAt: now, updatedAt: now }
    } catch (e) { console.error('[turso] createUser error:', e); return null }
  },

  async getProfile(userId: number): Promise<TursoProfile | null> {
    const c = getClient()
    if (!c) return null
    await ensureSchema()
    try {
      const r = await c.execute({ sql: 'SELECT * FROM "IpProfile" WHERE "userId" = ?', args: [userId] })
      return (r.rows[0] as unknown as TursoProfile) || null
    } catch (e) { console.error('[turso] getProfile:', e); return null }
  },

  /** 获取已开启每日投递的 IP 档案（用于每日邮件 cron） */
  async listDailyDeliveryProfiles(limit = 50): Promise<TursoProfile[]> {
    const c = getClient()
    if (!c) return []
    await ensureSchema()
    try {
      const r = await c.execute({
        sql: 'SELECT * FROM "IpProfile" WHERE "dailyDeliveryEnabled" = 1 ORDER BY "id" ASC LIMIT ?',
        args: [limit],
      })
      return r.rows as unknown as TursoProfile[]
    } catch (e) { console.error('[turso] listDailyDeliveryProfiles:', e); return [] }
  },

  /** 每日投递后更新状态（天数自增 + 记录时间） */
  async markDelivery(userId: number, dayCount: number) {
    const c = getClient()
    if (!c) return
    await ensureSchema()
    try {
      await c.execute({
        sql: 'UPDATE "IpProfile" SET "deliveryDayCount" = ?, "lastDeliveryAt" = ?, "updatedAt" = ? WHERE "userId" = ?',
        args: [dayCount, new Date().toISOString(), new Date().toISOString(), userId],
      })
    } catch (e) { console.error('[turso] markDelivery:', e) }
  },

  async saveProfile(userId: number, data: Record<string, unknown>) {
    const c = getClient()
    if (!c) return
    await ensureSchema()
    try {
      const existing = await c.execute({ sql: 'SELECT id FROM "IpProfile" WHERE "userId" = ?', args: [userId] })
      const fields = Object.keys(data).filter(k => data[k] !== undefined && data[k] !== '')
      const now = new Date().toISOString()
      const toDb = (v: unknown) => (typeof v === 'boolean' ? (v ? 1 : 0) : String(v))
      if (existing.rows.length > 0) {
        const setClause = fields.map(k => `"${k}" = ?`).join(', ')
        await c.execute({ sql: `UPDATE "IpProfile" SET ${setClause}, "updatedAt" = ? WHERE "userId" = ?`, args: [...fields.map(k => toDb(data[k])), now, userId] })
      } else {
        const cols = ['userId', ...fields, 'createdAt', 'updatedAt']
        const vals = [userId, ...fields.map(k => toDb(data[k])), now, now]
        await c.execute({ sql: `INSERT INTO "IpProfile" (${cols.map(c => `"${c}"`).join(',')}) VALUES (${cols.map(() => '?').join(',')})`, args: vals })
      }
    } catch (e) { console.error('[turso] saveProfile:', e); }
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
    } catch (e) { console.error('[turso] saveChat:', e); }
  },

  async getChats(userId: number, limit = 50): Promise<TursoChat[]> {
    const c = getClient()
    if (!c) return []
    await ensureSchema()
    try {
      const r = await c.execute({ sql: 'SELECT * FROM "IpChat" WHERE "userId" = ? ORDER BY "createdAt" ASC LIMIT ?', args: [userId, limit] })
      return r.rows as unknown as TursoChat[]
    } catch (e) { console.error('[turso] getChats:', e); return [] }
  },
}

/** 洋葱一键出海 · 激活码存储（Turso 生产环境） */
export const tursoActivation = {
  async getCodeByCode(code: string) {
    const c = getClient()
    if (!c) return null
    await ensureSchema()
    try {
      const r = await c.execute({ sql: 'SELECT * FROM "ActivationCode" WHERE "code" = ?', args: [code] })
      return (r.rows[0] as Record<string, unknown>) || null
    } catch (e) { console.error('[turso] getCodeByCode:', e); return null }
  },

  async getCodeByCid(cid: string) {
    const c = getClient()
    if (!c) return null
    await ensureSchema()
    try {
      const r = await c.execute({ sql: 'SELECT * FROM "ActivationCode" WHERE "cid" = ?', args: [cid] })
      return (r.rows[0] as Record<string, unknown>) || null
    } catch (e) { console.error('[turso] getCodeByCid:', e); return null }
  },

  async insertCode(code: string, cid: string, expiresAt: string, maxDevices: number, createdBy: number | null) {
    const c = getClient()
    if (!c) return null
    await ensureSchema()
    try {
      await c.execute({
        sql: 'INSERT INTO "ActivationCode" ("code","cid","expiresAt","maxDevices","createdBy","createdAt") VALUES (?,?,?,?,?,?)',
        args: [code, cid, expiresAt, maxDevices, createdBy, new Date().toISOString()],
      })
      return this.getCodeByCode(code)
    } catch (e) { console.error('[turso] insertCode:', e); return null }
  },

  async updateCodeStatus(cid: string, status: string, activatedAt: string | null) {
    const c = getClient()
    if (!c) return
    await ensureSchema()
    try {
      await c.execute({
        sql: 'UPDATE "ActivationCode" SET "status" = ?, "activatedAt" = ? WHERE "cid" = ?',
        args: [status, activatedAt, cid],
      })
    } catch (e) { console.error('[turso] updateCodeStatus:', e) }
  },

  async getActivation(codeId: number, fp: string) {
    const c = getClient()
    if (!c) return null
    await ensureSchema()
    try {
      const r = await c.execute({
        sql: 'SELECT * FROM "Activation" WHERE "codeId" = ? AND "deviceFingerprint" = ?',
        args: [codeId, fp],
      })
      return (r.rows[0] as Record<string, unknown>) || null
    } catch (e) { console.error('[turso] getActivation:', e); return null }
  },

  async insertActivation(codeId: number, fp: string, token: string, validUntil: string) {
    const c = getClient()
    if (!c) return null
    await ensureSchema()
    try {
      await c.execute({
        sql: 'INSERT INTO "Activation" ("codeId","deviceFingerprint","token","validUntil","createdAt") VALUES (?,?,?,?,?)',
        args: [codeId, fp, token, validUntil, new Date().toISOString()],
      })
      return this.getActivation(codeId, fp)
    } catch (e) { console.error('[turso] insertActivation:', e); return null }
  },

  async touchHeartbeat(id: number, time: string) {
    const c = getClient()
    if (!c) return
    await ensureSchema()
    try {
      await c.execute({ sql: 'UPDATE "Activation" SET "lastHeartbeatAt" = ? WHERE "id" = ?', args: [time, id] })
    } catch (e) { console.error('[turso] touchHeartbeat:', e) }
  },

  async countAct(codeId: number): Promise<number> {
    const c = getClient()
    if (!c) return 0
    await ensureSchema()
    try {
      const r = await c.execute({ sql: 'SELECT COUNT(*) as cnt FROM "Activation" WHERE "codeId" = ?', args: [codeId] })
      return Number((r.rows[0] as Record<string, unknown>)?.cnt || 0)
    } catch (e) { console.error('[turso] countAct:', e); return 0 }
  },

  async listCodes(limit = 100) {
    const c = getClient()
    if (!c) return []
    await ensureSchema()
    try {
      const r = await c.execute({ sql: 'SELECT * FROM "ActivationCode" ORDER BY "id" DESC LIMIT ?', args: [limit] })
      return r.rows as unknown as Record<string, unknown>[]
    } catch (e) { console.error('[turso] listCodes:', e); return [] }
  },
}
