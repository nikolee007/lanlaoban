import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'

// GET /api/ip-profile — 获取当前用户的 IP 档案
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    let profile = await db.ipProfile.findUnique({
      where: { userId },
    })

    // 没有档案说明是新用户，返回空
    if (!profile) {
      return NextResponse.json({ success: true, data: null })
    }

    return NextResponse.json({ success: true, data: profile })
  } catch (err) {
    console.error('[ip-profile GET]', err)
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}

// PUT /api/ip-profile — 创建或更新 IP 档案
export async function PUT(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const body = await request.json()

    // 只允许更新指定字段，防止覆盖
    const allowedFields = [
      'name', 'industry', 'product', 'experience', 'targetAudience',
      'originStory', 'keyEvents', 'achievements',
      'videoScripts', 'contentIdeas',
      'personality', 'advantage', 'pains', 'goal', 'commitment', 'catchphrase',
    ]

    // 提取出有值的字段
    const data: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined && body[field] !== '') {
        data[field] = body[field]
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: '没有可更新的字段' }, { status: 400 })
    }

    const profile = await db.ipProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    })

    return NextResponse.json({ success: true, data: profile })
  } catch (err) {
    console.error('[ip-profile PUT]', err)
    return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 })
  }
}
