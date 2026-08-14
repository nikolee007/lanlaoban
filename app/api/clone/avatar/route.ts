import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { getEngine } from '@/lib/clone-engine'
import { beginGeneration, finishGeneration } from '@/lib/clone-billing'
import { tursoDb } from '@/lib/turso'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
const TURSO = !!process.env.TURSO_DATABASE_URL

const AVATAR_PROMPT = (desc: string) =>
  `A professional portrait of this Chinese business owner, ${desc}, looking at camera, photorealistic, well-lit, 4K quality`

export async function POST(request: NextRequest) {
  const userId = getAuthUserId(request.headers)
  if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })

  const form = await request.formData()
  const photos = form.getAll('photos').map(String).filter(Boolean)
  const name = (form.get('name') as string)?.trim() || '我的分身'
  const engineId = (form.get('engine') as string) || undefined
  const desc = (form.get('desc') as string)?.trim() || 'wearing professional attire'

  if (photos.length === 0) return NextResponse.json({ success: false, error: '请至少上传一张本人照片' }, { status: 400 })

  const engine = getEngine(engineId)
  if (engine.status !== 'active') return NextResponse.json({ success: false, error: '该引擎尚未开通，即将上线' }, { status: 400 })

  const billing = await beginGeneration(userId, { type: 'avatar', engine: engine.id, price: engine.pricePerImage })
  if (!billing.ok) {
    return NextResponse.json({ success: false, error: billing.error === 'insufficient_balance' ? '余额不足，请先充值' : '系统繁忙，请稍后再试' }, { status: 402 })
  }

  try {
    const { url } = await engine.createAvatar({ photos, prompt: AVATAR_PROMPT(desc) })
    let avatar
    if (TURSO) {
      avatar = await tursoDb.saveCloneAvatar(userId, { name, avatarUrl: url, sourcePhoto: photos[0], engine: engine.id })
    } else {
      avatar = await db.cloneAvatar.create({ data: { userId, name, avatarUrl: url, sourcePhoto: photos[0], engine: engine.id } })
    }
    await finishGeneration(billing.recordId, true)
    return NextResponse.json({ success: true, data: { id: avatar?.id, url, name, mode: billing.mode } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '生成失败'
    await finishGeneration(billing.recordId, false)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
