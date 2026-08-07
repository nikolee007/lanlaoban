import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { listCodesByUser } from '@/lib/activation-store'

export const dynamic = 'force-dynamic'

/** 当前登录用户的激活码列表 */
export async function GET(request: NextRequest) {
  const userId = getAuthUserId(request.headers)
  if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })

  try {
    const codes = await listCodesByUser(userId)
    return NextResponse.json({ success: true, data: codes })
  } catch (error) {
    const message = error instanceof Error ? error.message : '操作失败'
    console.error('[activation/my]', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
