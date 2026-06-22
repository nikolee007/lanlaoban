import { NextRequest, NextResponse } from 'next/server'

const AGNES_API_KEY = process.env.AGNES_API_KEY
const AGNES_API_URL = 'https://apihub.agnes-ai.com/v1/chat/completions'

export async function POST(request: NextRequest) {
  try {
    if (!AGNES_API_KEY) {
      return NextResponse.json(
        { error: 'AGNES_API_KEY not configured on server' },
        { status: 503 },
      )
    }

    const body = await request.json()
    const { prompt } = body

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const res = await fetch(AGNES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AGNES_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'agnes-1.5-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json(
        { error: `Agnes API error: ${res.status} ${errText}` },
        { status: 502 },
      )
    }

    const data = await res.json()
    const content =
      data.choices?.[0]?.message?.content ||
      data.reply ||
      data.content ||
      data.script ||
      data.text ||
      JSON.stringify(data)

    return NextResponse.json({ success: true, content })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Agnes chat failed' },
      { status: 500 },
    )
  }
}
