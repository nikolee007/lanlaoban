import { NextRequest, NextResponse } from 'next/server'
import { verifyXunhupayNotify } from '@/lib/xunhupay'
import { tursoDb } from '@/lib/turso'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
const TURSO = !!process.env.TURSO_DATABASE_URL

// 进程内简单去重（Vercel 单实例够用；多实例时后期换 DB 订单表）
const processedOrders = new Set<string>()

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
  if (processedOrders.has(orderId)) return new Response('success')
  processedOrders.add(orderId)

  const [kind, userIdStr, amountStr] = String(params.attach || '').split('|')
  const userId = Number(userIdStr)
  const amount = Number(amountStr)
  if (kind !== 'recharge' || !userId || !amount || amount <= 0) {
    console.error('[clone/recharge/notify] attach 无效:', params.attach)
    return new Response('fail')
  }

  try {
    if (TURSO) {
      await tursoDb.addBalance(userId, amount)
    } else {
      await db.user.update({ where: { id: userId }, data: { balanceYuan: { increment: amount } } })
    }
    console.log(`[clone/recharge/notify] 充值入账: user=${userId} amount=${amount} order=${orderId}`)
    return new Response('success')
  } catch (e) {
    console.error('[clone/recharge/notify] 入账失败:', e)
    return new Response('fail')
  }
}
