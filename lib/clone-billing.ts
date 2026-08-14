import { tursoDb } from './turso'
import { db } from './db'

const TURSO = !!process.env.TURSO_DATABASE_URL
const FREE_LIMIT = 3

export interface BeginResult {
  ok: boolean
  mode: 'free' | 'paid'
  error?: 'insufficient_balance' | 'db_error'
  recordId: number
}

/** 开始一次生成：免费额度判断 + 余额扣费（扣费后记录 pending，失败时退款） */
export async function beginGeneration(
  userId: number,
  opts: { type: string; engine: string; template?: string; price: number },
): Promise<BeginResult> {
  if (TURSO) return tursoDb.beginCloneGeneration(userId, opts)
  try {
    const freeUsed = await db.cloneGeneration.count({ where: { userId } })
    const isFree = freeUsed < FREE_LIMIT
    let charged = 0
    if (!isFree) {
      const user = await db.user.findUnique({ where: { id: userId }, select: { balanceYuan: true } })
      if ((user?.balanceYuan ?? 0) < opts.price) return { ok: false, mode: 'paid', error: 'insufficient_balance', recordId: 0 }
      charged = opts.price
      await db.user.update({ where: { id: userId }, data: { balanceYuan: { decrement: charged } } })
    }
    const record = await db.cloneGeneration.create({
      data: { userId, type: opts.type, engine: opts.engine, template: opts.template, chargedYuan: charged, status: 'pending' },
    })
    return { ok: true, mode: isFree ? 'free' : 'paid', recordId: record.id }
  } catch (e) {
    console.error('[clone-billing] beginGeneration:', e)
    return { ok: false, mode: 'paid', error: 'db_error', recordId: 0 }
  }
}

/** 结束一次生成：成功 done / 失败退款 refunded */
export async function finishGeneration(recordId: number, ok: boolean) {
  if (!recordId) return
  if (TURSO) return tursoDb.finishCloneGeneration(recordId, ok)
  try {
    if (ok) {
      await db.cloneGeneration.update({ where: { id: recordId }, data: { status: 'done' } })
      return
    }
    const rec = await db.cloneGeneration.findUnique({ where: { id: recordId } })
    if (!rec) return
    await db.cloneGeneration.update({ where: { id: recordId }, data: { status: 'refunded' } })
    if (rec.chargedYuan > 0) {
      await db.user.update({ where: { id: rec.userId }, data: { balanceYuan: { increment: rec.chargedYuan } } })
    }
  } catch (e) {
    console.error('[clone-billing] finishGeneration:', e)
  }
}

/** 用户算力状态（工作台顶部展示） */
export async function getUserBilling(userId: number): Promise<{ freeUsed: number; balance: number }> {
  if (TURSO) return tursoDb.getUserBilling(userId)
  try {
    const [freeUsed, user] = await Promise.all([
      db.cloneGeneration.count({ where: { userId } }),
      db.user.findUnique({ where: { id: userId }, select: { balanceYuan: true } }),
    ])
    return { freeUsed, balance: user?.balanceYuan ?? 0 }
  } catch (e) {
    console.error('[clone-billing] getUserBilling:', e)
    return { freeUsed: 0, balance: 0 }
  }
}
