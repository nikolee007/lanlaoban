import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { tursoDb } from '@/lib/turso'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
const TURSO = !!process.env.TURSO_DATABASE_URL

export async function GET(request: NextRequest) {
  const userId = getAuthUserId(request.headers)
  if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })

  try {
    const avatars = TURSO
      ? await tursoDb.getCloneAvatars(userId)
      : await db.cloneAvatar.findMany({ where: { userId }, orderBy: { id: 'desc' } })
    return NextResponse.json({ success: true, data: avatars })
  } catch {
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}
