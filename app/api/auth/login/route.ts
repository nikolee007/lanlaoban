import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createSimpleToken } from '@/lib/auth'

interface LoginBody {
  email?: string
  password?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginBody = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: '请输入邮箱和密码' },
        { status: 400 },
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 },
      )
    }

    // Look up user by email
    const user = await db.user.findUnique({ where: { email: email.trim() } })
    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 },
      )
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 },
      )
    }

    // Create JWT with userId
    const token = createSimpleToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
    })

    return NextResponse.json({ token })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : '登录失败'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
