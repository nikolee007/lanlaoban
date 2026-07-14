import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * TTS 语音合成
 * 引擎链：MOSS-TTS-Nano (Tencent Cloud) → msedge-tts (微软免费)
 */
const MOSS_TTS_URL = process.env.MOSS_TTS_URL || 'http://124.222.200.151/moss-tts'

const EDGE_VOICE_MAP: Record<string, string> = {
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

/** 引擎1：MOSS-TTS-Nano（高音质 48kHz 立体声） */
async function tryMossTTS(text: string, language: string): Promise<Buffer | null> {
  try {
    const res = await fetch(`${MOSS_TTS_URL}/v1/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 3000), language }),
      signal: AbortSignal.timeout(30000),
    })
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer())
      if (buffer.length > 1000) return buffer
    }
    console.warn('[tts] MOSS-TTS returned', res.status)
  } catch (err) {
    console.warn('[tts] MOSS-TTS unavailable:', err instanceof Error ? err.message : err)
  }
  return null
}

/** 引擎2：msedge-tts（微软免费 TTS，零依赖部署） */
async function tryMsEdgeTTS(text: string, language: string): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MsEdgeTTS } = require('msedge-tts')
  const tts = new MsEdgeTTS()
  const voice = EDGE_VOICE_MAP[language] || EDGE_VOICE_MAP['zh']
  await tts.setMetadata(voice, 1.0, { pitch: 0, volume: 0 })
  const { audioStream } = await tts.toStream(text.slice(0, 3000))
  const chunks: Buffer[] = []
  for await (const chunk of audioStream) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, language = 'zh' } = body

    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    // 引擎1: MOSS-TTS
    const mossAudio = await tryMossTTS(text, language)
    if (mossAudio) {
      return NextResponse.json({
        success: true,
        audioData: mossAudio.toString('base64'),
        contentType: 'audio/wav',
        source: 'moss-tts',
      })
    }

    // 引擎2: msedge-tts fallback
    const edgeAudio = await tryMsEdgeTTS(text, language)
    return NextResponse.json({
      success: true,
      audioData: edgeAudio.toString('base64'),
      contentType: 'audio/mp3',
      source: 'edge-tts',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'TTS 生成失败'
    console.error('[tts] both engines failed:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  // MOSS-TTS health
  try {
    const res = await fetch(`${MOSS_TTS_URL}/health`, { signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({ status: 'ok', engines: { moss: true, edge: true }, voices: EDGE_VOICE_MAP })
    }
  } catch {}
  return NextResponse.json({ status: 'degraded', engines: { moss: false, edge: true }, voices: EDGE_VOICE_MAP })
}
