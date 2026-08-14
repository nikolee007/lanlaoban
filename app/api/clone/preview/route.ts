import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { getEngine } from '@/lib/clone-engine'
import { getTemplate } from '@/lib/clone-engine/templates'
import { beginGeneration, finishGeneration } from '@/lib/clone-billing'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const userId = getAuthUserId(request.headers)
  if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })

  const form = await request.formData()
  const avatarUrl = (form.get('avatarUrl') as string)?.trim() || ''
  const productImage = (form.get('productImage') as string) || ''
  const productDesc = (form.get('productDesc') as string)?.trim() || ''
  const templateId = (form.get('template') as string) || ''
  const engineId = (form.get('engine') as string) || undefined
  const avatarDesc = (form.get('avatarDesc') as string)?.trim() || 'Chinese business owner'

  if (!avatarUrl) return NextResponse.json({ success: false, error: '缺少克隆分身' }, { status: 400 })
  const template = getTemplate(templateId)
  if (!template) return NextResponse.json({ success: false, error: '未知模板' }, { status: 400 })
  if (template.requiresProduct && !productImage) {
    return NextResponse.json({ success: false, error: '该模板需要产品图' }, { status: 400 })
  }

  const engine = getEngine(engineId)
  if (engine.status !== 'active') return NextResponse.json({ success: false, error: '该引擎尚未开通，即将上线' }, { status: 400 })

  const billing = await beginGeneration(userId, { type: 'preview', engine: engine.id, template: templateId, price: engine.pricePerImage })
  if (!billing.ok) {
    return NextResponse.json({ success: false, error: billing.error === 'insufficient_balance' ? '余额不足，请先充值' : '系统繁忙，请稍后再试' }, { status: 402 })
  }

  try {
    const prompt = template.buildPrompt(avatarDesc, productDesc)
    const { url } = await engine.createPreview({ avatarUrl, productImage, template: templateId, prompt })
    await finishGeneration(billing.recordId, true)
    return NextResponse.json({ success: true, data: { url, mode: billing.mode } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '生成失败'
    await finishGeneration(billing.recordId, false)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
