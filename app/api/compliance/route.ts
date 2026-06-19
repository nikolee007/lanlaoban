import { NextRequest, NextResponse } from 'next/server'
import { checkForbidden, cleanForbidden } from '@/lib/compliance'

export async function POST(request: NextRequest) {
  try {
    const { text, industry, autoClean } = await request.json()
    if (!text) return NextResponse.json({ error: '请提供要检测的内容' }, { status: 400 })

    const violations = checkForbidden(text, industry || '通用')
    const cleaned = autoClean ? cleanForbidden(text, industry || '通用') : text

    return NextResponse.json({
      safe: violations.length === 0,
      violations,
      count: violations.length,
      cleaned,
      suggestion: violations.length > 0
        ? '检测到违禁词，建议替换为："高品质"、"正规产品"、"显著改善"、"专业方案"、"经临床验证"'
        : '内容合规',
    })
  } catch {
    return NextResponse.json({ error: '检测失败' }, { status: 500 })
  }
}
