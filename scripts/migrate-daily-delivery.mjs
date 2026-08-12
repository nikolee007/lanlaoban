// 一次性迁移：为 IpProfile 补每日投递字段（本地 dev.db）
// 与 prisma/setup.sql + lib/turso.ts 中的幂等迁移保持一致
import { createClient } from '@libsql/client'

const db = createClient({ url: 'file:./prisma/dev.db' })

async function main() {
  const cols = await db.execute('PRAGMA table_info("IpProfile")')
  const names = cols.rows.map(r => r.name)
  const missing = []

  const additions = [
    ['persona', 'TEXT'],
    ['dailyDeliveryEnabled', 'BOOLEAN NOT NULL DEFAULT false'],
    ['deliveryDayCount', 'INTEGER NOT NULL DEFAULT 0'],
    ['lastDeliveryAt', 'DATETIME'],
    ['latestVideoUrl', 'TEXT'],
  ]

  for (const [col, def] of additions) {
    if (!names.includes(col)) missing.push([col, def])
  }

  if (missing.length === 0) {
    console.log('✅ IpProfile 已包含全部每日投递字段，无需迁移')
    return
  }

  for (const [col, def] of missing) {
    await db.execute(`ALTER TABLE "IpProfile" ADD COLUMN "${col}" ${def}`)
    console.log(`+ 已添加列 ${col} (${def})`)
  }
  console.log(`迁移完成，共添加 ${missing.length} 列`)
}

main().catch(e => {
  console.error('[migrate-daily-delivery] 失败:', e)
  process.exit(1)
})
