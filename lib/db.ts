import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import * as fs from 'fs'
import * as path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  _migrated?: boolean
}

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (tursoUrl) {
    const libsql = createClient({ url: tursoUrl, authToken: tursoToken })
    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter })
  }

  return new PrismaClient()
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// 异步初始化：建表 + 种子（后台运行，不影响首次请求的降级）
if (!globalForPrisma._migrated && process.env.TURSO_DATABASE_URL) {
  globalForPrisma._migrated = true
  ;(async () => {
    try {
      const libsql = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      })
      // 建表
      const result = await libsql.execute("SELECT count(*) as cnt FROM sqlite_master WHERE type='table' AND name='Supplier'")
      const row = result.rows?.[0] as any
      if (!row || row.cnt === 0) {
        const sqlPath = path.join(process.cwd(), 'prisma', 'setup.sql')
        const sql = fs.readFileSync(sqlPath, 'utf-8')
        for (const stmt of sql.split(';').filter(s => s.trim())) {
          await libsql.execute(stmt.trim() + ';')
        }
      }
      // 种子（分类）
      const catCount = await db.category.count()
      if (catCount === 0) {
        await db.category.upsert({ where:{id:1}, create:{id:1,name:'手机配件',type:'both',icon:'📱',sortOrder:1}, update:{name:'手机配件'} })
        await db.category.upsert({ where:{id:2}, create:{id:2,name:'小家电',type:'both',icon:'⚡',sortOrder:2}, update:{name:'小家电'} })
        await db.category.upsert({ where:{id:3}, create:{id:3,name:'家居日用',type:'both',icon:'🏠',sortOrder:3}, update:{name:'家居日用'} })
      }
    } catch (err) {
      console.error('[db] async init error:', err)
    }
  })()
}
