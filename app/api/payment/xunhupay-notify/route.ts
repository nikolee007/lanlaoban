import { NextRequest, NextResponse } from 'next/server'
import { verifyXunhupayNotify } from '@/lib/xunhupay'
import { createActivationCode, getPrivateKey } from '@/lib/activation'
import { insertCode } from '@/lib/activation-store'

export const dynamic = 'force-dynamic'

/** 虎皮椒支付成功回调：验签 → 生成激活码关联用户 → 自动发码 */
export async function POST(request: NextRequest) {
  // 虎皮椒回调是表单 POST
  const form = await request.formData().catch(() => null)
  if (!form) return new Response('fail')
  const params: Record<string, string> = {}
  for (const [k, v] of form.entries()) params[k] = String(v)

  // 1. 验签
  if (!verifyXunhupayNotify(params)) {
    console.error('[xunhupay-notify] 签名校验失败', Object.keys(params))
    return new Response('fail')
  }

  // 2. 解析 attach = userId|days|devices
  const [userIdStr, daysStr, devicesStr] = String(params.attach || '').split('|')
  const userId = Number(userIdStr)
  const days = Number(daysStr) || 365
  const devices = Number(devicesStr) || 1
  if (!userId) {
    console.error('[xunhupay-notify] attach 无效:', params.attach)
    return new Response('fail')
  }

  // 3. 自动发码（同一订单回调可能重复，幂等可后续用订单号查重）
  try {
    const { code, payload } = createActivationCode(getPrivateKey(), { days, maxDevices: devices })
    await insertCode(code, payload.cid, new Date(payload.exp), payload.dev, userId)
    console.log(`[xunhupay-notify] 支付成功发码: user=${userId} days=${days} devices=${devices}`)
    return new Response('success')
  } catch (error) {
    console.error('[xunhupay-notify] 发码失败:', error)
    return new Response('fail')
  }
}
