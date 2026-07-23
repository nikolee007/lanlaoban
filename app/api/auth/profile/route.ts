import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tursoDb } from '@/lib/turso'
import { getAuthUserId } from '@/lib/auth'

const TURSO_ENABLED = !!process.env.TURSO_DATABASE_URL

export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 },
      )
    }

    let user = null
    if (TURSO_ENABLED) {
      // Vercel 生产环境 — 用户数据在 Turso
      const tursoUser = await tursoDb.findUserById(userId)
      if (tursoUser) {
        user = {
          id: tursoUser.id,
          email: tursoUser.email,
          name: tursoUser.name,
          avatar: null,
          company: null,
          phone: null,
          createdAt: tursoUser.createdAt,
          updatedAt: tursoUser.updatedAt,
        }
      }
    } else {
      // 本地开发 — 使用 Prisma SQLite
      user = await db.user.findUnique({
        where: { id: userId },
      })
    }

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
