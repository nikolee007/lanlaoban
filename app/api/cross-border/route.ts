import { NextResponse } from 'next/server'
import { generateImage, generateVideo } from '@/lib/agnes-api'

interface CrossBorderProduct {
  name?: string
  description?: string
  category?: string
}

interface CrossBorderRequestBody {
  action: string
  platform?: string
  country?: string
  product?: CrossBorderProduct
  imageTypes?: string[]
  style?: string
  script?: string
}

interface AgnesRequestBody {
  model?: string
  messages: Array<{ role: string; content: string }>
  temperature?: number
}

const AGNES_API_BASE = process.env.AGNES_API_BASE || 'https://apihub.agnes-ai.com/v1'
const AGNES_KEY = process.env.AGNES_API_KEY || ''

const PLATFORM_STYLES: Record<string, string> = {
  shopee: 'clean, bright, Southeast Asian e-commerce style',
  amazon: 'white background, professional, US e-commerce standard',
  ozon: 'clean, Russian e-commerce style, realistic',
  tiktok: 'vibrant, trendy, social media style',
  shopify: 'modern, minimalist, premium DTC brand style',
  temu: 'value-oriented, bright, clear product focus',
  lazada: 'clean, Southeast Asian e-commerce style',
  aliexpress: 'clean, global cross-border e-commerce style',
}

async function agnesFetch(endpoint: string, body: AgnesRequestBody) {
  const res = await fetch(`${AGNES_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AGNES_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Agnes API error (${res.status})`)
  return res.json()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, platform, country, product, imageTypes, style, script } = body

    const platformStyle = PLATFORM_STYLES[platform] || 'clean e-commerce style'

    // ─── 卖点文案生成 ───
    if (action === 'sell-points') {
      const lang = country === 'TH' ? 'Thai' :
                   country === 'ID' ? 'Indonesian' :
                   country === 'VN' ? 'Vietnamese' :
                   country === 'PH' ? 'Filipino' :
                   country === 'MY' ? 'Malay' :
                   country === 'TW' ? 'Traditional Chinese' :
                   country === 'BR' || country === 'MX' || country === 'CO' || country === 'CL' ? 'Portuguese (Brazil)' :
                   ['RU', 'BY', 'KZ'].includes(country) ? 'Russian' :
                   ['DE', 'FR', 'IT', 'ES'].includes(country) ? getEuropeanLang(country) :
                   country === 'JP' ? 'Japanese' :
                   country === 'KR' ? 'Korean' :
                   'English'

      const prompt = `You are a professional cross-border e-commerce copywriter.
Platform: ${platform} (${platformStyle})
Target market: ${country}
Language: ${lang}
Product name: ${product?.name || ''}
Product description: ${product?.description || ''}
Category: ${product?.category || ''}

Generate the following in ${lang}:
1. A compelling product title (max 120 chars, SEO optimized)
2. 5 bullet-point selling features
3. A short product description (max 200 chars)
4. 10 relevant keywords (comma separated)

Output format - JSON only:
{ "title": "...", "sellPoints": ["...", "..."], "description": "...", "keywords": "..." }`

      const chatRes = await agnesFetch('/chat/completions', {
        model: 'agnes-1.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      })
      const reply = chatRes.choices?.[0]?.message?.content || ''

      let parsed
      try { parsed = JSON.parse(reply.replace(/```json|```/g, '').trim()) }
      catch { parsed = { title: product?.name || '', sellPoints: [], description: product?.description || '', keywords: '' } }

      return NextResponse.json({ success: true, data: parsed })
    }

    // ─── 详情页图片生成 ───
    if (action === 'detail-images') {
      const types = imageTypes || ['main']
      const chosenStyle = style || 'clean'
      const results: Array<{ type: string; label: string; url: string }> = []

      for (const typeId of types) {
        const typeName = typeId === 'main' ? 'main product photo' :
                         typeId === 'angle' ? 'multi-angle view' :
                         typeId === 'detail' ? 'close-up detail' :
                         typeId === 'scene' ? 'lifestyle scene usage' :
                         typeId === 'comparison' ? 'comparison with competitors' :
                         'accessories and packaging'

        const imagePrompt = `E-commerce product photo for ${platform}, ${platformStyle}, style: ${chosenStyle}.
Product: ${product?.name || ''}
Description: ${product?.description || ''}
Type: ${typeName}
High quality, photorealistic, 4K, well-lit, professional product photography. White or clean background suitable for ${platform} listing.`

        const imgResult = await generateImage(imagePrompt, '1024x1024')
        if (imgResult.url) {
          results.push({ type: typeId, label: typeName, url: imgResult.url })
        }

        // 稍微延迟避免 API 限流
        if (types.length > 1) await new Promise(r => setTimeout(r, 500))
      }

      return NextResponse.json({ success: true, data: { images: results } })
    }

    // ─── 带货视频生成 ───
    if (action === 'video') {
      const videoPrompt = script || `Product showcase video for ${platform} in ${country} market. Product: ${product?.name || ''}. ${product?.description || ''}. Professional product presentation, smooth motion, 4K.`
      const result = await generateVideo(videoPrompt, undefined, 10)

      return NextResponse.json({
        success: true,
        data: {
          taskId: result.taskId,
          status: result.status,
          message: '视频生成任务已提交',
        },
      })
    }

    return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 })
  } catch (error: unknown) {
    console.error('跨境AI工具报错:', error)
    const message = error instanceof Error ? error.message : '处理失败'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

function getEuropeanLang(country: string): string {
  const map: Record<string, string> = { DE: 'German', FR: 'French', IT: 'Italian', ES: 'Spanish' }
  return map[country] || 'English'
}
