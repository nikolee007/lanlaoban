import { NextRequest, NextResponse } from 'next/server'
import { getEngineClient } from '@/lib/openai'
import type { OpenAIChatBody } from '@/lib/openai'

const STYLE_PROFILES: Record<string, string> = {
  professional: '正式专业的商务风格，用词严谨、数据说话、体现行业权威感。适合B2B企业宣传片。',
  social: '活泼吸睛的社交风格，节奏快、有网感、带emoji、适合TikTok/抖音/Instagram等短视频平台带货。',
  tech: '科技感未来风格，极简有力、突出参数与创新、用光效/数据可视化描述。适合科技产品。',
  sincere: '朴实真诚的风格，口语化、接地气、像老朋友推荐、温暖真实。适合工厂/手艺人/老字号。',
}

const LANGUAGE_NAMES: Record<string, string> = {
  zh: '简体中文',
  'zh-tw': '繁体中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  pt: 'Português',
  ru: 'Русский',
  it: 'Italiano',
  ar: 'العربية',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
}

const LANG_NATIVE: Record<string, string> = {
  zh: '简体中文',
  'zh-tw': '繁體中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  pt: 'Português',
  ru: 'Русский',
  it: 'Italiano',
  ar: 'العربية',
  th: 'ภาษาไทย',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      productName = '',
      sellingPoints = '',
      style = 'professional',
      languages = ['zh', 'en'],
      duration = 60,
    } = body

    if (!productName && !sellingPoints) {
      return NextResponse.json(
        { error: '请提供产品名称或卖点描述' },
        { status: 400 }
      )
    }

    const styleDesc = STYLE_PROFILES[style] || STYLE_PROFILES.professional
    const targetLangs = languages.length > 0 ? languages : ['zh', 'en']

    // Build a single prompt that generates scripts for all requested languages
    const langInstructions = targetLangs
      .map((l: string) => `${LANG_NATIVE[l] || l} (key: "${l}")`)
      .join('、')

    const systemPrompt = `你是一个专业的品牌宣传片文案策划师，擅长为各种产品撰写多语言宣传视频脚本。

## 风格要求
${styleDesc}

## 脚本结构
为每种语言生成一段宣传视频旁白脚本，包含：
1. 开头钩子（3-5秒抓住注意力）
2. 产品亮点展示（核心卖点，自然不硬广）
3. 用户利益/场景（让人产生代入感）
4. 结尾行动号召（引导下单/关注/评论）

## 多语言要求
- 同时为以下语言生成脚本：${langInstructions}
- 每种语言的脚本必须语义一致，但根据该语言文化习惯进行本地化适配（不是逐字翻译）
- 中文版 ${duration} 秒对应约 ${Math.round(duration * 3.5)} 字，其他语言按各自语速调整

## 输出格式
请以 JSON 格式返回，key 为语言代码，value 为该语言的完整旁白文本：
{
  "scripts": {
    "zh": "简体中文脚本...",
    "en": "English script...",
    ...
  }
}`

    const userPrompt = `产品名称：${productName || '（从素材中自动识别）'}
产品卖点：${sellingPoints || '（请根据产品名称和行业常识合理推断）'}
视频时长：${duration}秒
需要翻译的语言：${targetLangs.map((l: string) => LANG_NATIVE[l] || l).join('、')}

请根据以上信息，生成多语言宣传视频旁白脚本。`

    const client = getEngineClient('zhipu')
    const requestBody: OpenAIChatBody = {
      model: 'glm-5.2',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 8192,
      thinking: { type: 'enabled' },
    }
    const response = await client.chat.completions.create(requestBody)

    const content = response.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: 'AI 返回内容为空，请重试' },
        { status: 500 }
      )
    }

    // Parse JSON from response — handle markdown code blocks
    let jsonStr = content
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    const data = JSON.parse(jsonStr)

    return NextResponse.json({
      success: true,
      scripts: data.scripts || {},
      style,
      languages: targetLangs,
    })
  } catch (error: unknown) {
    console.error('[brand-promotion] script:', error)
    const message = error instanceof Error ? error.message : '文案生成失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
