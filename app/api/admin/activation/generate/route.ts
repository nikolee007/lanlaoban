import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/admin-auth'
import { getAuthUserId } from '@/lib/auth'
import { createActivationCode, getPrivateKey } from '@/lib/activation'
import { insertCode } from '@/lib/activation-store'

export const dynamic = 'force-dynamic'

/** 管理员批量生成激活码 */
export async function POST(request: NextRequest) {
  if (!requireAuth(request.headers)) return unauthorized()
  const userId = getAuthUserId(request.headers)

  const body = await request.json().catch(() => ({}))
  const count = Number(body.count || 1)
  const days = Number(body.days || 365)
  const devices = Number(body.devices || 1)
  if (!Number.isInteger(count) || count <= 0 || count > 100) {
    return NextResponse.json({ success: false, error: '数量不合法（1~100）' }, { status: 400 })
  }
  if (!Number.isInteger(days) || days <= 0 || days > 36500) {
    return NextResponse.json({ success: false, error: '天数不合法' }, { status: 400 })
  }
  if (!Number.isInteger(devices) || devices <= 0 || devices > 100) {
    return NextResponse.json({ success: false, error: '设备数不合法' }, { status: 400 })
  }

  try {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      const { code, payload } = createActivationCode(getPrivateKey(), { days, maxDevices: devices })
      await insertCode(code, payload.cid, new Date(payload.exp), payload.dev, userId)
      codes.push(code)
    }
    return NextResponse.json({ success: true, data: { count: codes.length, codes } })
  } catch (error) {
    const message = error instanceof Error ? error.message : '操作失败'
    console.error('[admin/activation/generate]', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
