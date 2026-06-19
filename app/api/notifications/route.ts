import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/notifications — 获取用户通知列表(分页)
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20),
    )

    const skip = (page - 1) * pageSize

    const [items, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      db.notification.count({ where: { userId } }),
      db.notification.count({ where: { userId, isRead: false } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items: items.map((n) => ({
          id: n.id,
          userId: n.userId,
          type: n.type,
          title: n.title,
          message: n.message,
          isRead: n.isRead,
          link: n.link,
          createdAt: n.createdAt.toISOString(),
        })),
        total,
        unreadCount,
        page,
        pageSize,
      },
    })
  } catch (error) {
    console.error('获取通知列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取通知列表失败' },
      { status: 500 },
    )
  }
}

// PUT /api/notifications — 标记通知为已读
export async function PUT(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { id, all } = body

    if (all === true) {
      // 全部标记为已读
      await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      })
      return NextResponse.json({
        success: true,
        data: { message: '已全部标记为已读' },
      })
    }

    if (typeof id !== 'number') {
      return NextResponse.json(
        { success: false, error: '参数错误' },
        { status: 400 },
      )
    }

    // 标记单条为已读，验证所有权
    const notification = await db.notification.findUnique({
      where: { id },
      select: { id: true, userId: true },
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: '通知不存在' },
        { status: 404 },
      )
    }

    if (notification.userId !== userId) {
      return NextResponse.json(
        { success: false, error: '无权操作该通知' },
        { status: 403 },
      )
    }

    await db.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json({
      success: true,
      data: { message: '已标记为已读' },
    })
  } catch (error) {
    console.error('标记通知失败:', error)
    return NextResponse.json(
      { success: false, error: '标记通知失败' },
      { status: 500 },
    )
  }
}
