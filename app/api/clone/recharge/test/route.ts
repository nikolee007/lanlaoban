import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { tursoDb } from '@/lib/turso'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
const TURSO = !!process.env.TURSO_DATABASE_URL
// 仅测试环境开启（.env.local 配 TEST_RECHARGE=1）；生产不配则拒绝
const ENABLED = process.env.TEST_RECHARGE === '1'

/**
 * 测试入账：支付接入前用于跑通算力扣费闭环。
 * 环境开关 TEST_RECHARGE=1 时可用；生产未配置时返回 403。
 */
export async function POST(request: NextRequest) {
  const userId = getAuthUserId(request.headers)
  if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
  if (!ENABLED) return NextResponse.json({ success: false, error: '测试入账未开启' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const amount = Number(body?.amount) || 10
  if (!amount || amount <= 0 || amount > 1000) {
    return NextResponse.json({ success: false, error: '金额不合法' }, { status: 400 })
  }

  try {
    if (TURSO) {
      await tursoDb.addBalance(userId, amount)
    } else {
      await db.user.update({ where: { id: userId }, data: { balanceYuan: { increment: amount } } })
    }
    return NextResponse.json({ success: true, data: { added: amount } })
  } catch (e) {
    console.error('[clone/recharge/test]', e)
    return NextResponse.json({ success: false, error: '入账失败' }, { status: 500 })
  }
}
