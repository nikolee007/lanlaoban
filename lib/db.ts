import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import * as fs from 'fs'
import * as path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/** Turso 模式下自动执行建表 SQL */
async function autoMigrate(libsql: ReturnType<typeof createClient>): Promise<void> {
  try {
    // 检查是否已有表
    const result = await libsql.execute("SELECT count(*) as cnt FROM sqlite_master WHERE type='table' AND name='Supplier'")
    const row = result.rows?.[0] as any
    if (row && row.cnt > 0) return // 已有表，跳过
  } catch { /* 忽略 */ }

  try {
    const sqlPath = path.join(process.cwd(), 'prisma', 'setup.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')
    // 分句执行
    const statements = sql.split(';').filter(s => s.trim().length > 0)
    for (const stmt of statements) {
      await libsql.execute(stmt.trim() + ';')
    }
    console.log('[db] ✅ Turso schema 已创建')
  } catch (err) {
    console.error('[db] ⚠️ autoMigrate 失败:', err)
  }
}

/** Turso 模式下自动 seed 演示数据 */
async function autoSeed(client: PrismaClient): Promise<void> {
  try {
    const count = await client.supplier.count()
    if (count > 0) return
  } catch {
    return
  }

  // 简版 seed：只创建分类和少量演示数据
  try {
    // 创建分类
    const cats = [
      { id:1, name:'手机配件', type:'both', icon:'📱', sortOrder:1 },
      { id:2, name:'小家电', type:'both', icon:'⚡', sortOrder:2 },
      { id:3, name:'家居日用', type:'both', icon:'🏠', sortOrder:3 },
    ]
    for (const c of cats) {
      await client.category.upsert({
        where: { id: c.id },
        create: c,
        update: c,
      })
    }
    console.log('[db] ✅ Turso seed 完成')
  } catch (err) {
    console.error('[db] ⚠️ autoSeed 失败:', err)
  }
}

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  // Turso 模式
  if (tursoUrl) {
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })
    const adapter = new PrismaLibSQL(libsql)

    // 异步初始化：建表 + 种子数据
    autoMigrate(libsql).then(() => {
      const p = new PrismaClient({ adapter })
      autoSeed(p)
    })

    return new PrismaClient({ adapter })
  }

  // 本地开发模式
  return new PrismaClient()
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
