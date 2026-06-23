import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json()
    if (!email || !newPassword) {
      return NextResponse.json({ success: false, error: '缺少邮箱或新密码' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: '密码至少6位' }, { status: 400 })
    }
    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 })
    }
    const hashed = await bcrypt.hash(newPassword, 10)
    await db.user.update({ where: { id: user.id }, data: { password: hashed } })
    return NextResponse.json({ success: true, message: '密码已重置' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '重置失败'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
