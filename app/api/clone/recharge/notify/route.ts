import { NextRequest } from 'next/server'
import { verifyXunhupayNotify } from '@/lib/xunhupay'
import { tursoDb } from '@/lib/turso'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
const TURSO = !!process.env.TURSO_DATABASE_URL

/**
 * 虎皮椒充值回调：
 * 1. 验签
 * 2. RechargeOrder 表 tradeOrderId 唯一约束做幂等（多实例安全，重复回调不会重复入账）
 * 3. 入账 balanceYuan
 */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null)
  if (!form) return new Response('fail')
  const params: Record<string, string> = {}
  for (const [k, v] of form.entries()) params[k] = String(v)

  if (!verifyXunhupayNotify(params)) {
    console.error('[clone/recharge/notify] 签名失败')
    return new Response('fail')
  }

  const orderId = params.trade_order_id || ''
  const [kind, userIdStr, amountStr] = String(params.attach || '').split('|')
  const userId = Number(userIdStr)
  const amount = Number(amountStr)
  if (!orderId || kind !== 'recharge' || !userId || !amount || amount <= 0) {
    console.error('[clone/recharge/notify] attach 无效:', params.attach)
    return new Response('fail')
  }

  try {
    let inserted: boolean
    if (TURSO) {
      inserted = await tursoDb.tryInsertRecharge(orderId, userId, amount)
      if (!inserted) return new Response('success') // 已处理过，幂等返回
      await tursoDb.addBalance(userId, amount)
    } else {
      try {
        await db.rechargeOrder.create({
          data: { tradeOrderId: orderId, userId, amount, status: 'processed' },
        })
        inserted = true
      } catch {
        return new Response('success') // 订单已存在 → 幂等
      }
      await db.user.update({ where: { id: userId }, data: { balanceYuan: { increment: amount } } })
    }
    console.log(`[clone/recharge/notify] 充值入账: user=${userId} amount=${amount} order=${orderId}`)
    return new Response('success')
  } catch (e) {
    console.error('[clone/recharge/notify] 入账失败:', e)
    return new Response('fail')
  }
}
