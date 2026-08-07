import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/admin-auth'
import { listCodes } from '@/lib/activation-store'

export const dynamic = 'force-dynamic'

/** 管理员查看激活码列表 */
export async function GET(request: NextRequest) {
  if (!requireAuth(request.headers)) return unauthorized()

  try {
    const codes = await listCodes(200)
    return NextResponse.json({ success: true, data: codes })
  } catch (error) {
    const message = error instanceof Error ? error.message : '操作失败'
    console.error('[admin/activation/list]', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
