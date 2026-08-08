import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { createXunhupayOrder } from '@/lib/xunhupay'

export const dynamic = 'force-dynamic'

// 定价（元）：1个月 / 1年，可通过环境变量覆盖
const PRICE_MONTH = Number(process.env.ONION_PRICE_MONTH || 1)
const PRICE_YEAR = Number(process.env.ONION_PRICE_YEAR || 9.9)

/** 创建支付订单：登录用户选时长/设备 → 虎皮椒下单 → 返回二维码 */
export async function POST(request: NextRequest) {
  const userId = getAuthUserId(request.headers)
  if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const days = Number(body.days || 365)
  const devices = Number(body.devices || 1)
  if (!Number.isInteger(days) || days <= 0 || days > 36500) {
    return NextResponse.json({ success: false, error: '时长不合法' }, { status: 400 })
  }
  if (!Number.isInteger(devices) || devices <= 0 || devices > 100) {
    return NextResponse.json({ success: false, error: '设备数不合法' }, { status: 400 })
  }

  const price = days >= 365 ? PRICE_YEAR : PRICE_MONTH
  const tradeOrderId = `onion${Date.now()}${Math.floor(Math.random() * 1000)}`
  const attach = `${userId}|${days}|${devices}`
  const notifyUrl = 'https://lenboss.win/api/payment/xunhupay-notify'

  try {
    const order = await createXunhupayOrder({
      totalFee: price.toFixed(2),
      tradeOrderId,
      title: `洋葱一键出海激活码（${days}天）`,
      attach,
      notifyUrl,
    })
    return NextResponse.json({
      success: true,
      data: { qrcode: order.url_qrcode || '', order_id: tradeOrderId, price: price.toFixed(2), days, devices },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '下单失败'
    console.error('[activation/order]', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
