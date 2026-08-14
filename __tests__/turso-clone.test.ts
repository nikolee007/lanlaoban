import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { rmSync, existsSync } from 'fs'

// 用 libsql file: 本地库真实执行 Turso 生产分支的 SQL 路径
const TEST_DB = '/tmp/clone-turso-test.db'

describe('turso clone/算力 分支（libsql 本地库）', () => {
  beforeAll(async () => {
    if (existsSync(TEST_DB)) rmSync(TEST_DB)
    process.env.TURSO_DATABASE_URL = `file:${TEST_DB}`
    process.env.TURSO_AUTH_TOKEN = ''
  })
  afterAll(() => {
    delete process.env.TURSO_DATABASE_URL
    if (existsSync(TEST_DB)) rmSync(TEST_DB)
  })

  it('建表 + 克隆分身 + 免费额度 + 付费扣费 + 退款全链路', async () => {
    const { tursoDb } = await import('@/lib/turso')

    // 1) 全新库 ensureSchema → setup.sql 初始化（含 CloneAvatar/CloneGeneration/User.balanceYuan）
    await tursoDb.ready()

    // 2) 建用户
    const user = await tursoDb.createUser('turso-clone@test.com', 'x', '测试')
    expect(user).not.toBeNull()
    const uid = user!.id

    // 3) 保存克隆分身
    const avatar = await tursoDb.saveCloneAvatar(uid, { name: '分身', avatarUrl: 'http://x/a.png', engine: 'agnes' })
    expect(avatar).not.toBeNull()
    expect(avatar!.avatarUrl).toBe('http://x/a.png')

    const avatars = await tursoDb.getCloneAvatars(uid)
    expect(avatars.length).toBe(1)

    // 4) 免费额度：前 3 次免费
    const r1 = await tursoDb.beginCloneGeneration(uid, { type: 'avatar', engine: 'agnes', price: 0.5 })
    expect(r1.ok).toBe(true); expect(r1.mode).toBe('free')
    const r2 = await tursoDb.beginCloneGeneration(uid, { type: 'avatar', engine: 'agnes', price: 0.5 })
    expect(r2.mode).toBe('free')
    const r3 = await tursoDb.beginCloneGeneration(uid, { type: 'avatar', engine: 'agnes', price: 0.5 })
    expect(r3.mode).toBe('free')

    // 5) 第 4 次：余额 0 → insufficient_balance
    const r4 = await tursoDb.beginCloneGeneration(uid, { type: 'avatar', engine: 'agnes', price: 0.5 })
    expect(r4.ok).toBe(false); expect(r4.error).toBe('insufficient_balance')

    // 6) 充值入账 +5
    await tursoDb.addBalance(uid, 5)
    let billing = await tursoDb.getUserBilling(uid)
    expect(billing.balance).toBeCloseTo(5)
    expect(billing.freeUsed).toBe(3)

    // 7) 第 5 次：付费成功，扣 0.5
    const r5 = await tursoDb.beginCloneGeneration(uid, { type: 'avatar', engine: 'agnes', price: 0.5 })
    expect(r5.ok).toBe(true); expect(r5.mode).toBe('paid')
    await tursoDb.finishCloneGeneration(r5.recordId, true)
    billing = await tursoDb.getUserBilling(uid)
    expect(billing.balance).toBeCloseTo(4.5)

    // 8) 失败退款：付费后生成失败 → 余额退回（4.5-0.5+0.5=4.5）
    const r6 = await tursoDb.beginCloneGeneration(uid, { type: 'avatar', engine: 'agnes', price: 0.5 })
    expect(r6.mode).toBe('paid')
    await tursoDb.finishCloneGeneration(r6.recordId, false)
    billing = await tursoDb.getUserBilling(uid)
    expect(billing.balance).toBeCloseTo(4.5)
  })
})
