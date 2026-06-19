import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSimpleToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码必填' },
        { status: 400 },
      )
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: '邮箱已注册' },
        { status: 409 },
      )
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: {
        email,
        password: hashed,
        name: name || email.split('@')[0],
      },
    })

    // Create JWT so user is automatically logged in after registration
    const token = createSimpleToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
    })

    return NextResponse.json({ token })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: '注册失败' },
      { status: 500 },
    )
  }
}
