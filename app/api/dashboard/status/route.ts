import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { tursoDb } from '@/lib/turso'
import { db } from '@/lib/db'
import { isDemoAccount } from '@/lib/clone-billing'

export const dynamic = 'force-dynamic'
const TURSO = !!process.env.TURSO_DATABASE_URL

/** 7 步流程状态：付费判定 + 各步骤完成度 */
export async function GET(request: NextRequest) {
  const userId = getAuthUserId(request.headers)
  if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })

  try {
    // 演示账号默认已开通服务（拉投资演示用）
    const isDemo = await isDemoAccount(userId)

    if (TURSO) {
      const status = await tursoDb.getUserServiceStatus(userId)
      status.serviceActive = status.serviceActive || isDemo
      return NextResponse.json({ success: true, data: status })
    }
    const [user, profile, avatarCount] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { serviceActive: true } }),
      db.ipProfile.findUnique({ where: { userId }, select: { id: true } }),
      db.cloneAvatar.count({ where: { userId } }),
    ])
    return NextResponse.json({
      success: true,
      data: {
        serviceActive: (user?.serviceActive ?? false) || isDemo,
        interviewed: !!profile,
        hasAvatar: avatarCount > 0,
      },
    })
  } catch (e) {
    console.error('[dashboard/status]', e)
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}
