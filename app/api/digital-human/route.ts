import { NextRequest, NextResponse } from 'next/server'
import { generateImage, generateVideo } from '@/lib/agnes-api'
import { getClient, getDefaultModel } from '@/lib/openai'
import { getAuthUserId } from '@/lib/auth'
import { requireServiceActive, serviceRequiredResponse } from '@/lib/service-gate'

// 场景模板 → 生成提示词
const SCENE_PROMPTS: Record<string, string> = {
  standing: 'A Chinese business owner standing in front of their store/shop, wearing professional attire, looking at camera, photorealistic portrait, well-lit, 4K quality',
  sitting: 'A Chinese business owner sitting at a desk/table in a professional setting, looking at camera and speaking, photorealistic, well-lit office interior, 4K',
  walking: 'A Chinese business owner walking confidently through their workplace/workshop, candid professional shot, photorealistic, natural lighting, 4K',
  product: 'A Chinese business owner holding a product, showing it to camera, half body shot, photorealistic, well-lit studio setting, 4K',
  kitchen: 'A Chinese restaurant owner in white chef uniform standing in professional kitchen, looking at camera, photorealistic, steam and cooking ambiance, 4K',
  storefront: 'A Chinese business owner standing at their store entrance with store sign visible, smiling at camera, photorealistic, daytime natural light, 4K',
}

/**
 * POST /api/digital-human
 *
 * 两种模式（按 Content-Type 自动检测）:
 *
 * 1. FormData — 数字人视频生成（原有流程）
 *    字段: scene, script, photo (可选)
 *    返回: { success, data: { taskId, imageUrl, status } }
 *
 * 2. JSON — 故事板生成
 *    body: { scripts: [...], industry: string, photos?: string[] }
 *    返回: { success, data: storyboard: [...] }
 *
 * JSON 模式还支持 action 字段:
 *    { action: 'storyboard', scripts, industry, photos } — 故事板
 *    { action: 'video', scene, script, photo } — 直接视频（同 FormData 逻辑）
 */
export async function POST(request: NextRequest) {
  // 付费服务门控：数字人视频生成需开通服务
  const userId = getAuthUserId(request.headers)
  if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
  const gate = await requireServiceActive(userId)
  if (!gate.ok) return NextResponse.json(serviceRequiredResponse(), { status: 402 })

  const ct = request.headers.get('content-type') || ''

  // ─── JSON 模式 ───────────────────────────────────────
  if (ct.includes('application/json')) {
    return handleJsonRequest(request)
  }

  // ─── FormData 模式（原数字人视频生成）────────────────────
  return handleFormDataRequest(request)
}

/* ========== JSON 请求处理（故事板等） ========== */

async function handleJsonRequest(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, scripts, industry, photos, scene, script } = body

    // 故事板模式
    if (action === 'storyboard' || (scripts && Array.isArray(scripts))) {
      return await generateStoryboard(scripts || [], industry || '通用', photos || [])
    }

    // 视频模式（JSON 版，省略 FormData 包装）
    if (action === 'video') {
      return await generateVideoDirect(scene || 'standing', script || '', null)
    }

    return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '处理失败'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

/** 生成故事板 — 调用 AI 逐镜拆解每个脚本 */
async function generateStoryboard(scripts: any[], industry: string, photos: string[]) {
  try {
    const client = getClient()
    const prompts = scripts.map((s: any, idx: number) => {
      const title = s.title || s.name || `脚本${idx + 1}`
      const content = s.content || s.text || ''
      return `第${idx + 1}条：「${title}」${content.slice(0, 100)}`
    }).join('\n')

    const photoInfo = photos.length > 0 ? `用户已上传 ${photos.length} 张照片，优先参考照片特征匹配镜头。` : '无用户照片，使用模板占位。'

    const systemPrompt = `你是一个专业的短视频导演，擅长将脚本拆解为逐镜拍摄方案。

为以下脚本生成故事板（storyboard），每个脚本拆为 3-5 个镜头。

返回格式为 JSON 数组（不要 markdown 标记），每项：
{
  "id": "a/b/c/d/e/f",  // 脚本标识（按顺序 a-f）
  "title": "脚本标题",
  "duration": "总时长",
  "shots": [
    {
      "time": "0:00-0:08",
      "duration": "8秒",
      "shotType": "近景口播|纪实行走|产品特写|固定机位",
      "bg": { "name": "拍摄背景", "desc": "背景描述" },
      "camera": "镜头语言如'正面近景，眼神看镜头'",
      "subtitle": "画外音/台词",
      "pose": { "type": "user_photo"|"stock", "label": "姿势说明" }
    }
  ]
}

${photoInfo}
行业：${industry}
保持中文输出。`

    const completion = await client.chat.completions.create({
      model: getDefaultModel(),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请为以下 ${scripts.length} 条脚本生成故事板：\n\n${prompts}` },
      ],
      temperature: 0.7,
      max_tokens: 8192,
    })

    const rawContent = completion.choices?.[0]?.message?.content || '[]'
    // 提取 JSON
    let storyboard: any[] = []
    const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/)
    try {
      storyboard = JSON.parse(jsonMatch ? jsonMatch[1].trim() : rawContent.trim())
    } catch {
      storyboard = []
    }

    // 确保 id 按字母顺序 a-f
    const idMap = 'abcdef'
    storyboard.forEach((item: any, i: number) => { item.id = idMap[i] || `s${i}` })

    return NextResponse.json({ success: true, data: { storyboard } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '故事板生成失败'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

/* ========== FormData 请求处理（原数字人视频） ========== */

async function handleFormDataRequest(request: NextRequest) {
  try {
    const formData = await request.formData()
    const scene = (formData.get('scene') as string) || 'standing'
    const script = (formData.get('script') as string) || ''
    const photoFile = formData.get('photo') as File | null

    return await generateVideoDirect(scene, script, photoFile)
  } catch (error: unknown) {
    console.error('数字人生成失败:', error)
    const message = error instanceof Error ? error.message : '生成失败'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

/** 视频生成核心逻辑（FormData 和 JSON 共用） */
async function generateVideoDirect(scene: string, script: string, photoFile: File | null) {
  // 1. 生成数字人形象
  let imageUrl = ''
  const scenePrompt = SCENE_PROMPTS[scene] || SCENE_PROMPTS.standing

  if (photoFile && photoFile.size > 0) {
    // 用户上传了照片 → 作为参考图传给 Agnes
    // 将照片转为 base64 作为 image_url 参数
    const buffer = Buffer.from(await photoFile.arrayBuffer())
    const base64 = buffer.toString('base64')
    const mimeType = photoFile.type || 'image/jpeg'
    const dataUri = `data:${mimeType};base64,${base64}`

    const imgResult = await generateImage(
      `Professional portrait of this person in a business setting: ${scenePrompt}`,
      '1024x1024',
      dataUri,  // 传入照片作为参考
    )
    imageUrl = imgResult.url
  } else {
    // 无照片 → 纯 AI 生成数字人
    const imgResult = await generateImage(scenePrompt)
    imageUrl = imgResult.url
  }

  // 2. 生成视频描述
  const videoPrompt = script
    ? `A Chinese business owner talking naturally to camera, saying: "${script.slice(0, 200)}". Professional setting, photorealistic, 4K quality, smooth motion.`
    : `${scenePrompt.replace('photorealistic portrait', 'a person talking naturally to camera')}, smooth motion, 4K`

  // 3. 提交视频生成任务
  const videoResult = await generateVideo(videoPrompt, imageUrl, 10)

  return NextResponse.json({
    success: true,
    data: {
      taskId: videoResult.taskId,
      imageUrl,
      status: videoResult.status,
      message: '视频生成任务已提交',
    },
  })
}
