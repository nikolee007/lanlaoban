import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const CLONES_DIR = join(process.cwd(), 'data/voice-clones')
export async function POST(request: NextRequest) {
  const NAS_CLONE_API = process.env.NAS_CLONE_API
  if (!NAS_CLONE_API) {
    return NextResponse.json({ error: 'NAS_CLONE_API not configured' }, { status: 503 })
  }

  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null
    const name = (formData.get('name') as string) || '未命名'

    if (!audioFile) {
      return NextResponse.json({ success: false, error: '请上传音频文件' }, { status: 400 })
    }

    const voiceId = `vc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
    const buffer = Buffer.from(await audioFile.arrayBuffer())

    // 1. 存本地
    if (!existsSync(CLONES_DIR)) await mkdir(CLONES_DIR, { recursive: true })
    await writeFile(join(CLONES_DIR, `${voiceId}.wav`), buffer)
    await writeFile(join(CLONES_DIR, `${voiceId}.json`), JSON.stringify({
      voiceId, name, size: buffer.length, createdAt: new Date().toISOString(),
    }, null, 2))

    // 2. 转发到 NAS 声音克隆服务
    let nasVoiceId = voiceId
    try {
      const nasForm = new FormData()
      nasForm.append('audio', new File([buffer], 'voice.wav', { type: 'audio/wav' }))
      nasForm.append('name', name)
      const nasRes = await fetch(`${NAS_CLONE_API}/v1/clone`, { method: 'POST', body: nasForm })
      const nasData = await nasRes.json()
      if (nasData.success) nasVoiceId = nasData.data.voiceId
    } catch {}

    return NextResponse.json({
      success: true,
      data: { voiceId: nasVoiceId, name, message: '声音克隆完成！' },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || '处理失败' }, { status: 500 })
  }
}

// 获取已克隆的声音列表
export async function GET() {
  const allClones: any[] = []
  const NAS_CLONE_API = process.env.NAS_CLONE_API
  try {
    const { readdirSync, readFileSync } = await import('fs')
    if (existsSync(CLONES_DIR)) {
      for (const f of readdirSync(CLONES_DIR).filter(f => f.endsWith('.json'))) {
        try { allClones.push(JSON.parse(readFileSync(join(CLONES_DIR, f), 'utf-8'))) } catch {}
      }
    }
  } catch {}
  try {
    const nasRes = await fetch(`${NAS_CLONE_API}/v1/cloned-voices`)
    const nasData = await nasRes.json()
    if (nasData.success) {
      for (const c of nasData.data) {
        if (!allClones.find(x => x.voiceId === c.voiceId)) allClones.push(c)
      }
    }
  } catch {}
  return NextResponse.json({ success: true, data: allClones })
}
