import { NextRequest, NextResponse } from 'next/server'
import { generateImage, generateVideo } from '@/lib/agnes-api'

// 场景模板 → 生成提示词
const SCENE_PROMPTS: Record<string, string> = {
  standing: 'A Chinese business owner standing in front of their store/shop, wearing professional attire, looking at camera, photorealistic portrait, well-lit, 4K quality',
  sitting: 'A Chinese business owner sitting at a desk/table in a professional setting, looking at camera and speaking, photorealistic, well-lit office interior, 4K',
  walking: 'A Chinese business owner walking confidently through their workplace/workshop, candid professional shot, photorealistic, natural lighting, 4K',
  product: 'A Chinese business owner holding a product, showing it to camera, half body shot, photorealistic, well-lit studio setting, 4K',
  kitchen: 'A Chinese restaurant owner in white chef uniform standing in professional kitchen, looking at camera, photorealistic, steam and cooking ambiance, 4K',
  storefront: 'A Chinese business owner standing at their store entrance with store sign visible, smiling at camera, photorealistic, daytime natural light, 4K',
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const scene = (formData.get('scene') as string) || 'standing'
    const script = (formData.get('script') as string) || ''
    const photoFile = formData.get('photo') as File | null

    // 1. 生成数字人形象
    let imageUrl = ''
    const scenePrompt = SCENE_PROMPTS[scene] || SCENE_PROMPTS.standing

    if (photoFile && photoFile.size > 0) {
      // 用户上传了照片 → 描述为"基于此人照片"
      const imagePrompt = `Based on this person's photo, create a professional portrait: ${scenePrompt}`
      const imgResult = await generateImage(imagePrompt)
      imageUrl = imgResult.url
    } else {
      // 无照片 → 纯 AI 生成数字人
      const imgResult = await generateImage(scenePrompt)
      imageUrl = imgResult.url
    }

    // 2. 生成视频描述（结合脚本内容）
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
  } catch (error: any) {
    console.error('数字人生成失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '生成失败' },
      { status: 500 },
    )
  }
}
