import { NextRequest, NextResponse } from 'next/server'

const VOICE_MAP: Record<string, string> = {
  zh: 'zh-CN-XiaoxiaoNeural',
  'zh-tw': 'zh-TW-HsiaoChenNeural',
  en: 'en-US-AriaNeural',
  ja: 'ja-JP-NanamiNeural',
  ko: 'ko-KR-SunHiNeural',
  fr: 'fr-FR-DeniseNeural',
  de: 'de-DE-KatjaNeural',
  es: 'es-ES-AlvaroNeural',
  pt: 'pt-BR-FranciscaNeural',
  ru: 'ru-RU-SvetlanaNeural',
  it: 'it-IT-ElsaNeural',
  ar: 'ar-SA-ZariyahNeural',
  th: 'th-TH-PremwadeeNeural',
  vi: 'vi-VN-HoaiMyNeural',
  id: 'id-ID-GadisNeural',
}

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, language = 'zh' } = body

    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const voice = VOICE_MAP[language] || VOICE_MAP['en']

    // Use msedge-tts (free, no API key needed, works on Vercel)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MsEdgeTTS } = require('msedge-tts')
    const tts = new MsEdgeTTS()
    tts.setMetadata(voice, 1.0, { pitch: 0, volume: 0 })

    // Get the audio stream
    const { audioStream } = await tts.rawToStream(text.slice(0, 3000))

    // Collect audio chunks
    const chunks: Buffer[] = []
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk))
    }
    const audioBuffer = Buffer.concat(chunks)

    // Return audio as base64 in JSON
    return NextResponse.json({
      success: true,
      audioData: audioBuffer.toString('base64'),
      contentType: 'audio/mp3',
      source: 'edge-tts',
    })
  } catch (error: unknown) {
    console.error('[brand-promotion] tts:', error)
    const message = error instanceof Error ? error.message : 'TTS 生成失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
