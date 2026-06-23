import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MOSS_TTS_URL = process.env.MOSS_TTS_URL || 'http://124.222.200.151/moss-tts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, language = 'zh' } = body

    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    // Step 1: Try MOSS-TTS-Nano (high quality, 48kHz stereo, voice cloning capable)
    try {
      const mossRes = await fetch(`${MOSS_TTS_URL}/v1/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 3000), language }),
        signal: AbortSignal.timeout(30000),
      })

      if (mossRes.ok) {
        const audioBuffer = Buffer.from(await mossRes.arrayBuffer())
        return NextResponse.json({
          success: true,
          audioData: audioBuffer.toString('base64'),
          contentType: 'audio/wav',
          source: 'moss-tts',
        })
      }
      console.warn('[tts] MOSS-TTS returned', mossRes.status, '- falling back')
    } catch (mossErr) {
      console.warn('[tts] MOSS-TTS unavailable:', mossErr instanceof Error ? mossErr.message : mossErr)
    }

    // Step 2: Fallback to msedge-tts
    const EDGE_VOICE_MAP: Record<string, string> = {
      zh: 'zh-CN-XiaoxiaoNeural', 'zh-tw': 'zh-TW-HsiaoChenNeural',
      en: 'en-US-AriaNeural', ja: 'ja-JP-NanamiNeural', ko: 'ko-KR-SunHiNeural',
      fr: 'fr-FR-DeniseNeural', de: 'de-DE-KatjaNeural', es: 'es-ES-AlvaroNeural',
      pt: 'pt-BR-FranciscaNeural', ru: 'ru-RU-SvetlanaNeural', it: 'it-IT-ElsaNeural',
      ar: 'ar-SA-ZariyahNeural', th: 'th-TH-PremwadeeNeural',
      vi: 'vi-VN-HoaiMyNeural', id: 'id-ID-GadisNeural',
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MsEdgeTTS } = require('msedge-tts')
    const tts = new MsEdgeTTS()
    tts.setMetadata(EDGE_VOICE_MAP[language] || EDGE_VOICE_MAP['en'], 1.0, { pitch: 0, volume: 0 })
    const { audioStream } = await tts.rawToStream(text.slice(0, 3000))
    const chunks: Buffer[] = []
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk))
    }
    const audioBuffer = Buffer.concat(chunks)

    return NextResponse.json({
      success: true,
      audioData: audioBuffer.toString('base64'),
      contentType: 'audio/mp3',
      source: 'edge-tts',
    })
  } catch (error: unknown) {
    console.error('[tts] both engines failed:', error)
    return NextResponse.json({ error: 'TTS 生成失败，请稍后重试' }, { status: 500 })
  }
}
