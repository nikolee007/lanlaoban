import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 },
      )
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, error: '获取用户信息失败' },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { name, avatar, company, phone } = body

    const user = await db.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(avatar !== undefined && { avatar }),
        ...(company !== undefined && { company }),
        ...(phone !== undefined && { phone }),
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, error: '更新用户信息失败' },
      { status: 500 },
    )
  }
}
