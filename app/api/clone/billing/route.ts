import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { getUserBilling } from '@/lib/clone-billing'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const userId = getAuthUserId(request.headers)
  if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
  const billing = await getUserBilling(userId)
  return NextResponse.json({ success: true, data: billing })
}
