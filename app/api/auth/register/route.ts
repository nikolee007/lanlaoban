import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSimpleToken } from '@/lib/auth'
import { tursoDb } from '@/lib/turso'
import { db } from '@/lib/db'

const TURSO_ENABLED = !!process.env.TURSO_DATABASE_URL

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码必填' }, { status: 400 })
    }

    let existing: any = null
    let user: any = null
    const hashed = await bcrypt.hash(password, 10)

    if (TURSO_ENABLED) {
      existing = await tursoDb.findUserByEmail(email)
      if (existing) {
        return NextResponse.json({ error: '邮箱已注册' }, { status: 409 })
      }
      user = await tursoDb.createUser(email, hashed, name)
      if (!user) {
        // Turso 失败时回退到 Prisma（本地 SQLite）
        try {
          user = await db.user.create({
            data: { email, password: hashed, name: name || email.split('@')[0] },
          })
        } catch {
          return NextResponse.json({ error: '注册失败' }, { status: 500 })
        }
      }
    } else {
      try {
        existing = await db.user.findUnique({ where: { email } })
        if (existing) {
          return NextResponse.json({ error: '邮箱已注册' }, { status: 409 })
        }
        user = await db.user.create({
          data: { email, password: hashed, name: name || email.split('@')[0] },
        })
      } catch {
        return NextResponse.json({ error: '注册失败' }, { status: 500 })
      }
    }

    const token = createSimpleToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7,
    })

    return NextResponse.json({ token })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '注册失败' }, { status: 500 })
  }
}
