import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { tursoDb } from '@/lib/turso'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
const TURSO = !!process.env.TURSO_DATABASE_URL

/** 数据专家：反馈采纳率 / 行业分布 / 最近反馈统计 */
export async function GET(request: NextRequest) {
  const userId = getAuthUserId(request.headers)
  if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })

  try {
    if (TURSO) {
      const stats = await tursoDb.getAgentStats()
      return NextResponse.json({ success: true, data: stats })
    }

    const [totalGen, fbTotal, byFb, byInd, recent] = await Promise.all([
      db.cloneGeneration.count(),
      db.agentFeedback.count(),
      db.agentFeedback.groupBy({ by: ['feedback'], _count: true }),
      db.agentFeedback.groupBy({
        by: ['industry'],
        where: { industry: { not: null } },
        _count: { industry: true },
        orderBy: { _count: { industry: 'desc' } },
        take: 8,
      }),
      db.agentFeedback.findMany({
        select: { sourceType: true, industry: true, feedback: true, contentSummary: true, createdAt: true },
        orderBy: { id: 'desc' },
        take: 10,
      }),
    ])

    const byFeedback: Record<string, number> = {}
    byFb.forEach((r) => { byFeedback[r.feedback] = r._count })

    return NextResponse.json({
      success: true,
      data: {
        totalGen,
        fbTotal,
        byFeedback,
        byIndustry: byInd.map((r) => ({ industry: r.industry, cnt: r._count.industry })),
        recent,
      },
    })
  } catch (e) {
    console.error('[agent/stats]', e)
    return NextResponse.json({ success: false, error: '统计失败' }, { status: 500 })
  }
}
