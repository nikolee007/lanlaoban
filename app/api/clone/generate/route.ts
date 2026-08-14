import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Agent 统一生成入口（预留）：
 * body: { action: 'avatar'|'preview', engine?, avatarUrl?, productImage?, template?, photos?, prompt? }
 * 当前转发到 avatar/preview 相同逻辑；Agent 接入后统一走此入口。
 */
export async function POST(request: NextRequest) {
  const userId = getAuthUserId(request.headers)
  if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.action) return NextResponse.json({ success: false, error: '缺少 action' }, { status: 400 })

  if (body.action === 'avatar' || body.action === 'preview') {
    const form = new FormData()
    if (body.action === 'avatar') {
      ;(body.photos || []).forEach((p: string) => form.append('photos', p))
      if (body.name) form.append('name', body.name)
      if (body.engine) form.append('engine', body.engine)
      if (body.prompt) form.append('desc', body.prompt)
    } else {
      if (body.avatarUrl) form.append('avatarUrl', body.avatarUrl)
      if (body.productImage) form.append('productImage', body.productImage)
      if (body.template) form.append('template', body.template)
      if (body.engine) form.append('engine', body.engine)
      if (body.productDesc) form.append('productDesc', body.productDesc)
    }
    const target = body.action === 'avatar' ? '/api/clone/avatar' : '/api/clone/preview'
    const res = await fetch(new URL(target, request.url), {
      method: 'POST',
      body: form,
      headers: { Authorization: request.headers.get('authorization') || '' },
    })
    return new NextResponse(res.body, { status: res.status, headers: { 'Content-Type': 'application/json' } })
  }

  return NextResponse.json({ success: false, error: '未知 action' }, { status: 400 })
}
