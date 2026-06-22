import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const OPENAI_TTS_VOICES: Record<string, Record<string, string>> = {
  zh: { male: 'echo', female: 'shimmer' },
  'zh-tw': { male: 'echo', female: 'shimmer' },
  en: { male: 'echo', female: 'shimmer' },
  ja: { male: 'echo', female: 'shimmer' },
  ko: { male: 'echo', female: 'shimmer' },
  fr: { male: 'echo', female: 'shimmer' },
  de: { male: 'echo', female: 'shimmer' },
  es: { male: 'echo', female: 'shimmer' },
  pt: { male: 'echo', female: 'shimmer' },
  ru: { male: 'echo', female: 'shimmer' },
  it: { male: 'echo', female: 'shimmer' },
  ar: { male: 'echo', female: 'shimmer' },
  th: { male: 'echo', female: 'shimmer' },
  vi: { male: 'echo', female: 'shimmer' },
  id: { male: 'echo', female: 'shimmer' },
}

const OPENAI_TTS_MODEL = 'tts-1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, language = 'zh', voiceStyle = 'professional' } = body

    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    // Try self-hosted TTS server first
    const TTS_SERVER = process.env.TTS_SERVER_URL
    if (TTS_SERVER) {
      try {
        const ttsRes = await fetch(`${TTS_SERVER}/v1/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.slice(0, 2000),
            voice: language === 'zh' ? 'zh-CN-XiaoxiaoNeural' : 'en-US-JennyNeural',
            speed: 1.0,
          }),
        })

        if (ttsRes.ok) {
          const ttsData = await ttsRes.json()
          return NextResponse.json({ success: true, audioUrl: ttsData.url || ttsData.audioUrl, source: 'tts-server' })
        }
      } catch {
        // Fall through to OpenAI TTS
      }
    }

    // Fallback: OpenAI TTS
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'TTS_SERVER_URL or OPENAI_API_KEY not configured' }, { status: 503 })
    }

    const voices = OPENAI_TTS_VOICES[language] || OPENAI_TTS_VOICES['en']
    const voice = voices.female // default to female voice

    const openaiRes = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_TTS_MODEL,
        input: text.slice(0, 4096),
        voice,
        response_format: 'mp3',
        speed: 1.0,
      }),
    })

    if (!openaiRes.ok) {
      const errText = await openaiRes.text()
      console.error('[brand-promotion] TTS OpenAI error:', errText)
      return NextResponse.json({ error: `TTS generation failed: ${openaiRes.status}` }, { status: 502 })
    }

    // Save audio to public/uploads
    const timestamp = Date.now().toString()
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'brand-promotion', timestamp)
    await mkdir(uploadDir, { recursive: true })

    const audioBuffer = Buffer.from(await openaiRes.arrayBuffer())
    const filename = `tts_${language}_${Date.now()}.mp3`
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, audioBuffer)

    const audioUrl = `/uploads/brand-promotion/${timestamp}/${filename}`

    return NextResponse.json({ success: true, audioUrl, source: 'openai-tts' })
  } catch (error: unknown) {
    console.error('[brand-promotion] tts:', error)
    const message = error instanceof Error ? error.message : 'TTS 生成失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
