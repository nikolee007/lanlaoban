import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, unauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!requireAuth(request.headers)) return unauthorized()

  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, company: true, phone: true, createdAt: true },
    })
    return NextResponse.json({ success: true, data: users })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '操作失败'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!requireAuth(request.headers)) return unauthorized()

  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: '缺少用户ID' }, { status: 400 })
    await db.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '操作失败'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
