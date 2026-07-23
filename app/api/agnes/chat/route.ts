import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/openai'

const AGNES_API_URL = 'https://apihub.agnes-ai.com/v1/chat/completions'
const AGNES_API_KEY = process.env.AGNES_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    // 方案一：优先用 Agnes 原生 API（agnes-2.0-flash）
    let agnesOk = false
    if (AGNES_API_KEY) {
      try {
        const res = await fetch(AGNES_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AGNES_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'agnes-2.0-flash',
            messages: [{ role: 'user', content: prompt }],
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const content =
            data.choices?.[0]?.message?.content ||
            data.reply ||
            data.content ||
            data.text ||
            JSON.stringify(data)
          return NextResponse.json({ success: true, content, engine: 'agnes' })
        }
        // Agnes 失败，记录但不抛出
        agnesOk = true // 标记已尝试
      } catch {
        // 静默降级
      }
    }

    // 方案二：降级到 getClient() 自动降级链（DeepSeek → Agnes → Zhipu）
    const client = getClient()
    const openaiResponse = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
    })

    const content = openaiResponse.choices?.[0]?.message?.content || ''
    if (!content) {
      return NextResponse.json({ error: 'AI 返回内容为空' }, { status: 500 })
    }

    return NextResponse.json({ success: true, content, engine: 'deepseek' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'AI chat failed'
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
