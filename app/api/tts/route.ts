import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const TTS_SERVER = process.env.TTS_SERVER_URL
  if (!TTS_SERVER) {
    return NextResponse.json({ error: 'TTS_SERVER_URL not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { text, voice, speed } = body

    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const res = await fetch(`${TTS_SERVER}/v1/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: voice || 'zh-CN-XiaoxiaoNeural', speed: speed || 1.0 }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `TTS error: ${err}` }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'TTS failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  const TTS_SERVER = process.env.TTS_SERVER_URL
  if (!TTS_SERVER) {
    return NextResponse.json({ error: 'TTS_SERVER_URL not configured' }, { status: 503 })
  }

  try {
    const res = await fetch(`${TTS_SERVER}/health`)
    if (!res.ok) return NextResponse.json({ success: false, error: 'TTS unavailable' })
    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'TTS unavailable' })
  }
}
