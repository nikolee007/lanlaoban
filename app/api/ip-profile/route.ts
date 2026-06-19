import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { tursoDb } from '@/lib/turso'
import { db } from '@/lib/db'

const TURSO = !!process.env.TURSO_DATABASE_URL

export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })

    if (TURSO) {
      const profile = await tursoDb.getProfile(userId)
      return NextResponse.json({ success: true, data: profile })
    }

    const profile = await db.ipProfile.findUnique({ where: { userId } })
    return NextResponse.json({ success: true, data: profile })
  } catch {
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })

    const body = await request.json()
    const allowedFields = ['name', 'industry', 'product', 'experience', 'startYear', 'targetAudience', 'targetCustomer', 'originStory', 'keyEvents', 'achievements', 'hardest', 'personality', 'advantage', 'pains', 'goal', 'commitment', 'catchphrase', 'videoScripts', 'contentIdeas']

    const data: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined && body[field] !== '') data[field] = body[field]
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: '没有可更新的字段' }, { status: 400 })
    }

    if (TURSO) {
      await tursoDb.saveProfile(userId, data)
    } else {
      await db.ipProfile.upsert({ where: { userId }, create: { userId, ...data }, update: data })
    }

    return NextResponse.json({ success: true, data: { id: userId, ...data } })
  } catch {
    return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 })
  }
}
