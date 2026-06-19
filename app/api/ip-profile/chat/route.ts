import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'

// POST /api/ip-profile/chat — 保存一次采访聊天记录
export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { role, content, metadata } = body

    if (!role || !content) {
      return NextResponse.json({ success: false, error: '缺少消息内容' }, { status: 400 })
    }

    if (!['user', 'assistant', 'system'].includes(role)) {
      return NextResponse.json({ success: false, error: '无效的角色' }, { status: 400 })
    }

    const chat = await db.ipChat.create({
      data: {
        userId,
        role,
        content,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    // 更新 IpProfile 的最后聊天时间
    await db.ipProfile.upsert({
      where: { userId },
      create: { userId, lastChatAt: new Date() },
      update: { lastChatAt: new Date() },
    })

    return NextResponse.json({ success: true, data: chat })
  } catch (err) {
    console.error('[ip-profile chat POST]', err)
    return NextResponse.json({ success: false, error: '保存聊天记录失败' }, { status: 500 })
  }
}

// GET /api/ip-profile/chat — 获取聊天历史
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)

    const chats = await db.ipChat.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    })

    return NextResponse.json({ success: true, data: chats })
  } catch (err) {
    console.error('[ip-profile chat GET]', err)
    return NextResponse.json({ success: false, error: '获取聊天记录失败' }, { status: 500 })
  }
}
