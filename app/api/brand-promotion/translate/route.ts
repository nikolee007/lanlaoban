import { NextRequest, NextResponse } from 'next/server'
import { getClient, getDefaultModel } from '@/lib/openai'

const LANG_MAP: Record<string, string> = {
  zh: '简体中文', 'zh-tw': '繁体中文', en: 'English',
  ja: '日本語', ko: '한국어', fr: 'Français',
  de: 'Deutsch', es: 'Español', pt: 'Português',
  ru: 'Русский', it: 'Italiano', ar: 'العربية',
  th: 'ไทย', vi: 'Tiếng Việt', id: 'Bahasa Indonesia',
}

/**
 * POST /api/brand-promotion/translate
 *
 * 将文案翻译为指定语言。
 * 品牌推广文案原本用一次性请求生成多语言版本（见 script 路由），
 * 此路由用于追加翻译其他语言，或修正/优化特定语言版本。
 *
 * Body: { text, sourceLang, targetLangs }
 *  - text: 源语言文本
 *  - sourceLang: 源语言代码 (默认 'zh')
 *  - targetLangs: 目标语言代码数组
 *
 * Returns: { success, translations: { [lang]: string } }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, sourceLang = 'zh', targetLangs = [] } = body

    if (!text?.trim()) {
      return NextResponse.json({ error: '请提供待翻译文本' }, { status: 400 })
    }
    if (!targetLangs.length) {
      return NextResponse.json({ error: '请指定目标语言' }, { status: 400 })
    }

    const sourceName = LANG_MAP[sourceLang] || sourceLang
    const targets = targetLangs.map((l: string) => `${LANG_MAP[l] || l} (${l})`).join('、')

    const systemPrompt = `你是一个专业的品牌营销翻译专家。
源语言：${sourceName}
目标语言：${targets}

翻译要求：
1. 保持营销文案的语气和号召力
2. 进行本地化适配，不是逐字翻译
3. 保留品牌调性

以 JSON 返回（不要 markdown 标记）：
{ "translations": { "zh": "...", "en": "...", ... } }`

    const client = getClient()
    const completion = await client.chat.completions.create({
      model: getDefaultModel(),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请将以下文案翻译为指定语言：\n\n${text}` },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    })

    const raw = completion.choices?.[0]?.message?.content || '{}'
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    let translations: Record<string, string> = {}
    try {
      translations = JSON.parse(jsonMatch ? jsonMatch[1].trim() : raw.trim()).translations || {}
    } catch {
      translations = {}
    }

    // 确保所有目标语言都有值，缺失的 fallback 到原文
    for (const lang of targetLangs) {
      if (!translations[lang]) translations[lang] = text
    }

    return NextResponse.json({ success: true, translations })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '翻译失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
