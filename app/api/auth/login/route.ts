import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSimpleToken } from '@/lib/auth'
import { tursoDb } from '@/lib/turso'
import { db } from '@/lib/db'

const TURSO_ENABLED = !!process.env.TURSO_DATABASE_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 })
    }
    if (!email.includes('@')) {
      return NextResponse.json({ error: '请输入有效的邮箱地址' }, { status: 400 })
    }

    let user: any = null

    if (TURSO_ENABLED) {
      user = await tursoDb.findUserByEmail(email.trim())
    } else {
      try {
        user = await db.user.findUnique({ where: { email: email.trim() } })
      } catch {
        return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
      }
    }

    if (!user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    const token = createSimpleToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
    })

    return NextResponse.json({ token })
  } catch {
    return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
  }
}
