import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getPublicKey } from '@/lib/activation'
import { getCodeByCid, getActivation, touchHeartbeat } from '@/lib/activation-store'

export const dynamic = 'force-dynamic'

/** 客户端心跳：验签 token + 校验吊销/过期 + 更新心跳时间 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { token } = body
    if (!token) return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })

    let payload
    try {
      payload = verifyToken(token, getPublicKey())
    } catch {
      return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 401 })
    }

    const row = await getCodeByCid(payload.cid)
    if (!row) return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 401 })
    if (row.status === 'revoked') return NextResponse.json({ error: 'REVOKED', valid: false }, { status: 403 })
    if (!Number.isFinite(payload.exp) || payload.exp < Date.now()) {
      return NextResponse.json({ error: 'EXPIRED', valid: false }, { status: 403 })
    }

    try {
      const act = await getActivation(row.id, payload.fp)
      if (act) await touchHeartbeat(act.id)
    } catch {
      // 心跳时间更新失败不影响授权判断
    }

    return NextResponse.json({ valid: true, expires_at: payload.exp })
  } catch (error) {
    const message = error instanceof Error ? error.message : '操作失败'
    console.error('[activation/heartbeat]', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
