import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { createXunhupayOrder } from '@/lib/xunhupay'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  const userId = getAuthUserId(request.headers)
  if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const amount = Number(body?.amount)
  if (!amount || amount <= 0 || amount > 100000) {
    return NextResponse.json({ success: false, error: '充值金额不合法' }, { status: 400 })
  }

  try {
    const tradeOrderId = `RCH-${userId}-${Date.now()}`
    const order = await createXunhupayOrder({
      totalFee: amount.toFixed(2),
      tradeOrderId,
      title: `懒老板算力充值 ¥${amount}`,
      attach: `recharge|${userId}|${amount}`,
      notifyUrl: `${BASE_URL}/api/clone/recharge/notify`,
    })
    return NextResponse.json({ success: true, data: { tradeOrderId, qrcode: order.url_qrcode || order.url || '' } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '下单失败'
    console.error('[clone/recharge]', e)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
