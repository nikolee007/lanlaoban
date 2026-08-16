import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { requireServiceActive, serviceRequiredResponse } from '@/lib/service-gate'
import { tursoDb } from '@/lib/turso'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
const TURSO = !!process.env.TURSO_DATABASE_URL

const ALLOWED_FEEDBACK = ['adopt', 'bomb', 'unused'] // 采纳 / 爆款 / 未用

/**
 * 数据飞轮反馈写入：记录商家对生成内容的反馈，供后续 Agent 训练。
 * body: { sourceType, industry?, contentSummary?, feedback, rating? }
 */
export async function POST(request: NextRequest) {
  const userId = getAuthUserId(request.headers)
  if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
  const gate = await requireServiceActive(userId)
  if (!gate.ok) return NextResponse.json(serviceRequiredResponse(), { status: 402 })

  const body = await request.json().catch(() => null)
  const { sourceType, industry, contentSummary, feedback, rating } = body || {}
  if (!sourceType || !ALLOWED_FEEDBACK.includes(feedback)) {
    return NextResponse.json({ success: false, error: '参数不合法' }, { status: 400 })
  }

  try {
    if (TURSO) {
      await tursoDb.saveFeedback({ userId, sourceType, industry, contentSummary, feedback, rating })
    } else {
      await db.agentFeedback.create({
        data: { userId, sourceType, industry, contentSummary, feedback, rating },
      })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[agent/feedback]', e)
    return NextResponse.json({ success: false, error: '写入失败' }, { status: 500 })
  }
}
