import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { createActivationCode, getPrivateKey } from '@/lib/activation'
import { insertCode } from '@/lib/activation-store'

export const dynamic = 'force-dynamic'

/** 登录用户购买激活码（生成并关联到该用户；支付二期接入） */
export async function POST(request: NextRequest) {
  const userId = getAuthUserId(request.headers)
  if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const days = Number(body.days || 365)
  const devices = Number(body.devices || 1)
  if (!Number.isInteger(days) || days <= 0 || days > 36500) {
    return NextResponse.json({ success: false, error: '天数不合法' }, { status: 400 })
  }
  if (!Number.isInteger(devices) || devices <= 0 || devices > 100) {
    return NextResponse.json({ success: false, error: '设备数不合法' }, { status: 400 })
  }

  try {
    const { code, payload } = createActivationCode(getPrivateKey(), { days, maxDevices: devices })
    await insertCode(code, payload.cid, new Date(payload.exp), payload.dev, userId)
    return NextResponse.json({ success: true, data: { code, expires_at: payload.exp, days, devices } })
  } catch (error) {
    const message = error instanceof Error ? error.message : '操作失败'
    console.error('[activation/buy]', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
