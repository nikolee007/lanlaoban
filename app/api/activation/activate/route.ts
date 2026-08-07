import { NextRequest, NextResponse } from 'next/server'
import { verifyActivationCode, issueToken, getPublicKey, getPrivateKey } from '@/lib/activation'
import {
  getCodeByCode, insertCode, updateCodeStatus, getActivation, insertActivation, countAct,
} from '@/lib/activation-store'

export const dynamic = 'force-dynamic'

/** 客户端激活：验签激活码 + 绑定设备 + 签发 token（不强制登录） */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { code, device_fingerprint } = body
    if (!code || !device_fingerprint) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
    }
    if (
      typeof device_fingerprint !== 'string' ||
      device_fingerprint.length === 0 ||
      device_fingerprint.length > 128
    ) {
      return NextResponse.json({ error: 'INVALID_FINGERPRINT' }, { status: 400 })
    }

    let result
    try {
      result = verifyActivationCode(code, getPublicKey())
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message || 'INVALID_CODE' }, { status: 400 })
    }
    if (!result.valid || !result.payload) {
      return NextResponse.json({ error: result.reason }, { status: 400 })
    }
    const payload = result.payload

    let row = await getCodeByCode(code)
    if (!row) {
      // 合法但未入库的激活码（外部签发），补建记录
      await insertCode(code, payload.cid, new Date(payload.exp), payload.dev, null)
      row = await getCodeByCode(code)
    }
    if (!row) return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
    if (row.status === 'revoked') return NextResponse.json({ error: 'REVOKED' }, { status: 403 })
    if (new Date(row.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: 'EXPIRED' }, { status: 400 })
    }

    // 设备幂等
    const existing = await getActivation(row.id, device_fingerprint)
    if (existing) {
      if (existing.token) return NextResponse.json({ ok: true, token: existing.token, expires_at: row.expiresAt })
      return NextResponse.json({ ok: true, expires_at: row.expiresAt })
    }

    const actCount = await countAct(row.id)
    if (actCount >= row.maxDevices) return NextResponse.json({ error: 'DEVICE_LIMIT' }, { status: 403 })

    const token = issueToken({ cid: payload.cid, fp: device_fingerprint, exp: payload.exp }, getPrivateKey())
    await insertActivation(row.id, device_fingerprint, token, new Date(payload.exp))
    if (row.status === 'unused') await updateCodeStatus(payload.cid, 'activated', new Date())

    return NextResponse.json({ ok: true, token, expires_at: payload.exp })
  } catch (error) {
    const message = error instanceof Error ? error.message : '操作失败'
    console.error('[activation/activate]', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
