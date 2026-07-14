import { NextRequest, NextResponse } from 'next/server'

/**
 * 声音服务
 * — 上传音频 → 有 NAS_CLONE_API 时转发克隆
 * — 无克隆后端时返回可用 TTS 音色列表供用户选择
 */

const EDGE_VOICES = [
  { id: 'zh-CN-XiaoxiaoNeural', name: '晓晓（女声·推荐）', gender: '女' },
  { id: 'zh-CN-XiaoyiNeural', name: '晓伊（女声·可爱）', gender: '女' },
  { id: 'zh-CN-YunxiNeural', name: '云希（男声·阳光）', gender: '男' },
  { id: 'zh-CN-YunjianNeural', name: '云健（男声·沉稳）', gender: '男' },
  { id: 'zh-CN-YunyangNeural', name: '云扬（男声·新闻）', gender: '男' },
  { id: 'zh-CN-liaoning-XiaobeiNeural', name: '晓北（女声·东北话）', gender: '女', dialect: '东北' },
  { id: 'zh-CN-shaanxi-XiaoniNeural', name: '晓妮（女声·陕西话）', gender: '女', dialect: '陕西' },
  { id: 'zh-CN-Shandong-YunxiangNeural', name: '云翔（男声·山东话）', gender: '男', dialect: '山东' },
  { id: 'en-US-AriaNeural', name: 'Aria (English Female)', gender: '女', lang: 'en' },
  { id: 'en-US-GuyNeural', name: 'Guy (English Male)', gender: '男', lang: 'en' },
  { id: 'ja-JP-NanamiNeural', name: 'Nanami（日本語女性）', gender: '女', lang: 'ja' },
  { id: 'ko-KR-SunHiNeural', name: 'Sun-Hi（한국어 여성）', gender: '女', lang: 'ko' },
]

export async function POST(request: NextRequest) {
  const NAS_CLONE_API = process.env.NAS_CLONE_API

  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null
    const name = (formData.get('name') as string) || '未命名'

    // 没传音频 → 返回可用音色列表
    if (!audioFile) {
      return NextResponse.json({
        success: true,
        data: { voices: EDGE_VOICES, cloneAvailable: !!NAS_CLONE_API },
        message: '请上传音频进行克隆，或从以下音色中选择',
      })
    }

    // 有 NAS 克隆服务时转发
    if (NAS_CLONE_API) {
      try {
        const buffer = Buffer.from(await audioFile.arrayBuffer())
        const nasForm = new FormData()
        nasForm.append('audio', new File([buffer], 'voice.wav', { type: 'audio/wav' }))
        nasForm.append('name', name)
        const nasRes = await fetch(`${NAS_CLONE_API}/v1/clone`, { method: 'POST', body: nasForm })
        const nasData = await nasRes.json()
        if (nasData.success) {
          return NextResponse.json({
            success: true,
            data: { voiceId: nasData.data.voiceId, name, source: 'nas-clone' },
            message: '声音克隆完成！',
          })
        }
      } catch (err) {
        console.warn('[voice-clone] NAS clone unavailable:', err)
      }
    }

    // 无克隆服务：返回音色选择方案（音频暂存待后续克隆）
    return NextResponse.json({
      success: true,
      data: {
        voiceId: null,
        name,
        source: 'voice-selection',
        voices: EDGE_VOICES,
        message: '目前使用 TTS 音色选择。配置 NAS 克隆服务后可启用真实声音克隆。',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '处理失败'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

/** 获取可用声音列表 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: { voices: EDGE_VOICES, cloneAvailable: !!process.env.NAS_CLONE_API },
  })
}
