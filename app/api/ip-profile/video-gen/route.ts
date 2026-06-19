import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'
import { generateContent } from '@/lib/openai'
import {
  buildVideoPackage,
  describeDeliveryModes,
  type VideoSegment,
  type VideoGenMode,
} from '@/lib/video-gen'

// POST /api/ip-profile/video-gen — 生成视频素材包（ABC三模式）
export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const modes: VideoGenMode[] = body.modes || ['C']

    const profile = await db.ipProfile.findUnique({ where: { userId } })
    if (!profile) {
      return NextResponse.json({ success: false, error: '还没有IP档案' }, { status: 400 })
    }

    const bossName = profile.name || '老板'
    const industry = profile.industry || '实体生意'

    // 1. 用 AI 生成脚本内容（如果是空）
    let segments: VideoSegment[] = []
    let existingScripts: any[] = []
    if (profile.videoScripts) {
      try { existingScripts = JSON.parse(profile.videoScripts) } catch {}
    }

    if (existingScripts.length >= 3) {
      segments = existingScripts.map((s: any, i: number) => ({
        index: i,
        title: s.title || `第${i + 1}条`,
        content: s.content || s.line || '',
        emotion: s.emotion || '😯 被吸引',
        shotType: s.shotType || getDefaultShotType(i),
        shotDesc: s.shotDesc || '胸口以上近景口播，眼神看镜头',
        duration: 30,
      }))
    } else {
      // AI 生成 5 条完整脚本
      const prompt = `行业：${industry}\n产品：${profile.product || ''}\n目标客户：${profile.targetAudience || '本地消费者'}\n昵称：${bossName}\n特色：${profile.advantage || ''}\n\n生成5条实体老板IP短视频脚本，每条包含：title(标题)、content(260-360字)、emotion(情绪钩子)、shotType(自拍/行走/特写)、shotDesc(拍摄描述)、duration(时长秒数30-60)。\n\n以JSON返回：{ "scripts": [...] }`

      const result = await generateContent(prompt,
        '你是实体老板IP策划师。生成5条短视频脚本，每条260-360字，带情绪钩子。')
      try {
        const parsed = JSON.parse(result)
        existingScripts = parsed.scripts || []
      } catch {}

      if (existingScripts.length === 0) {
        // 兜底模板
        existingScripts = [
          { title: '自我介绍', content: `大家好，我是${bossName}，做${industry}的。`, emotion: '😯', shotType: '自拍', shotDesc: '正面近景', duration: 30 },
          { title: '客户故事', content: '上个月一个客户让我特别感动。', emotion: '😌', shotType: '自拍', shotDesc: '正面口播', duration: 30 },
          { title: '行业真话', content: '这个行业有个秘密，没人告诉你。', emotion: '🤔', shotType: '行走', shotDesc: '边走边讲', duration: 35 },
          { title: '产品展示', content: '给你看看我们的产品细节。', emotion: '😲', shotType: '特写', shotDesc: '产品特写', duration: 30 },
          { title: '行动号召', content: '想了解更多？评论区打想了解。', emotion: '🤝', shotType: '自拍', shotDesc: '微笑收尾', duration: 25 },
        ]
      }

      segments = existingScripts.map((s: any, i: number) => ({
        index: i,
        title: s.title || `第${i + 1}条`,
        content: s.content || '',
        emotion: s.emotion || getDefaultEmotion(i),
        shotType: s.shotType || getDefaultShotType(i),
        shotDesc: s.shotDesc || getDefaultShotDesc(i),
        duration: s.duration || getDefaultDuration(i),
      }))

      // 保存到 profile
      await db.ipProfile.update({
        where: { userId },
        data: { videoScripts: JSON.stringify(existingScripts) },
      })
    }

    // 2. 生成 ABC 三模式交付包
    const pkg = buildVideoPackage(bossName, industry, segments, modes)

    // 3. 同时触发邮件交付（如果 modes 包含 C）
    if (modes.includes('C')) {
      await fetch(`${request.nextUrl.origin}/api/ip-profile/deliver`, {
        method: 'POST',
        headers: { Authorization: request.headers.get('authorization') || '' },
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      data: {
        package: pkg,
        deliveryInfo: describeDeliveryModes(),
        deliveryModes: modes,
      },
    })
  } catch (err) {
    console.error('[video-gen POST]', err)
    return NextResponse.json({ success: false, error: '生成视频包失败' }, { status: 500 })
  }
}

// GET /api/ip-profile/video-gen — 获取可用的交付模式说明
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      modes: describeDeliveryModes(),
      availableModes: ['A', 'B', 'C'],
      cReady: true,  // 剪辑脚本包立即可用
      bReady: false, // 需配置 TTS API Key
      aReady: false, // 需接入数字人 API
    },
  })
}

function getDefaultEmotion(i: number): string {
  return ['😯 被吸引', '😌 产生共鸣', '🤔 觉得有用', '😲 被说服', '🤝 想行动'][i % 5]
}

function getDefaultShotType(i: number): string {
  return ['自拍', '行走', '特写', '自拍', '行走'][i % 5]
}

function getDefaultShotDesc(i: number): string {
  return [
    '胸口以上近景口播，眼神看镜头',
    '手持轻微晃动，边走边展示环境',
    '特写镜头展示产品细节',
    '回到正面近景口播，手势比划',
    '微笑对着镜头，引导行动',
  ][i % 5]
}

function getDefaultDuration(i: number): number {
  return [30, 30, 35, 30, 25][i % 5]
}
