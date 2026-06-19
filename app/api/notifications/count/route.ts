import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/notifications/count — 返回未读通知数量
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 },
      )
    }

    const count = await db.notification.count({
      where: { userId, isRead: false },
    })

    return NextResponse.json({
      success: true,
      data: { count },
    })
  } catch (error) {
    console.error('获取未读通知数失败:', error)
    return NextResponse.json(
      { success: false, error: '获取未读通知数失败' },
      { status: 500 },
    )
  }
}
