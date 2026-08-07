import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/admin-auth'
import { updateCodeStatus, getCodeByCode } from '@/lib/activation-store'

export const dynamic = 'force-dynamic'

/** 管理员吊销激活码 */
export async function POST(request: NextRequest) {
  if (!requireAuth(request.headers)) return unauthorized()

  const body = await request.json().catch(() => ({}))
  const { code } = body
  if (!code) return NextResponse.json({ success: false, error: '缺少激活码' }, { status: 400 })

  try {
    const row = await getCodeByCode(code)
    if (!row) return NextResponse.json({ success: false, error: '激活码不存在' }, { status: 404 })
    await updateCodeStatus(row.cid, 'revoked', null)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : '操作失败'
    console.error('[admin/activation/revoke]', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
