import { NextRequest, NextResponse } from 'next/server'
import { getEngineClient } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { industry, product, targetCustomer, years, style } = body

    if (!industry || !product) {
      return NextResponse.json(
        { error: '缺少必填字段：industry（行业）、product（产品）' },
        { status: 400 }
      )
    }

    const systemPrompt = `你是"李八字体系"的人设策划师。必须用以下万能人设公式来生成方案。

## 万能人设公式（100%通用）
从业年限 + 实体深耕 + 吃苦耐劳 + 实在不套路 + 售后兜底

## 人设固定四标签
1. 老实体人：干了很多年、吃过苦、白手起家
2. 不玩套路：拒绝低价内卷、拒绝行业乱象
3. 亲自下场：不做甩手掌柜、天天盯现场
4. 真诚靠谱：宁愿不接单，不做砸口碑的生意

## 禁止人设
不精英、不网红、不营销、不吹牛、不炫富

## 输出要求
- nickname: 昵称，格式"名字+行业+身份"（如"老王的餐馆"、"峰哥的工厂"），2-8字
- bio: 一句话简介，15-30字，突出行业身份和个性
- intro: 详细自我介绍，100-150字，第一人称口语化，包含从业经历和个人理念
- slogan: 一句口号，8-20字

请以 JSON 格式返回：{ "persona": { "nickname": "", "bio": "", "intro": "", "slogan": "" } }`

    const coachName = style === 'boge' ? '波哥烟火气' : style === 'zhuge' ? '诸葛高客单' : style === 'geng' ? '耿庆林工业B端' : '李八字纪实'
    const coachNote = style === 'boge' ? '侧重烟火气和共情感' : style === 'zhuge' ? '侧重专业认知和理性' : style === 'geng' ? '侧重工厂实感和工艺细节' : '侧重真诚实在和行业真话'

    const userPrompt = `行业：${industry}
产品/服务：${product || '未提供'}
目标客户：${targetCustomer || '未提供'}
从业年限：${years || '未提供'}
风格偏好：${coachName} ${coachNote}

请根据以上信息，生成符合${coachName}风格的实体老板人设方案。`

    const client = getEngineClient('zhipu')

    const response = await client.chat.completions.create({
      model: 'glm-5.2',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8192,
      // @ts-expect-error thinking is a Zhipu-specific parameter not in OpenAI types
      thinking: { type: 'enabled' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: 'AI 返回内容为空，请重试' },
        { status: 500 }
      )
    }

    // Strip markdown code blocks if present
    let jsonStr = content
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }
    const data = JSON.parse(jsonStr)
    return NextResponse.json(data)
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : '生成人设失败'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
