import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scriptId, scriptContent, industry } = body

    if (!scriptId || !scriptContent) {
      return NextResponse.json(
        { error: '缺少必填字段：scriptId（脚本ID）、scriptContent（脚本内容）' },
        { status: 400 }
      )
    }

    const systemPrompt = `你是"号神"级别的短视频导演，擅长用导演式提问法引导实体老板拍出自然真实的短视频。

## 核心方法
模仿号神的"导演式提问"——不给稿子，不给剧本，而是通过提问引导老板用自己的话说出内容。

## 拍摄标准化要求（李八字体系）
三条固定镜头必须体现在指导中：
1. 近景口播（60%）：胸上取景、固定机位、自然光
2. 纪实行走（25%）：手持微晃、车间/门店边走边讲
3. 产品特写（15%）：材质/工艺/库存/手部动作

## 25秒四段式结构（每条脚本对应）
- 0-3s：近景口播，强钩子
- 3-12s：近景口播，行业问题拆解
- 12-19s：纪实行走或近景，自我人设立场
- 19-25s：近景收口，引流

## 剪辑标准
时长22-26秒，开头3s大字幕，无特效无花字无滤镜，BGM轻音乐≤人声20%

每个问题要：
1. 具体、场景化，让老板有画面感
2. 引导真情实感，避免背书式回答
3. 符合口语表达习惯
4. 围绕脚本核心主题

请以 JSON 格式返回，包含：
{
  "guide": {
    "question1": "第一个引导问题（20-40字），从个人经历或具体场景切入",
    "question2": "第二个引导问题（20-40字），深入挖掘细节或专业观点",
    "question3": "第三个引导问题（20-40字），引导总结或升华观点",
    "tips": [
      "拍摄建议1 - 关于表情、语气、肢体动作等",
      "拍摄建议2 - 关于场景、光线、着装等",
      "拍摄建议3 - 关于语气节奏、停顿、情感表达等"
    ]
  }
}`

    const userPrompt = `脚本ID：${scriptId}
行业：${industry || '未提供'}
脚本内容：
${scriptContent}

请根据以上脚本，生成3个导演式引导问题和拍摄建议，帮助老板自然地表达出脚本内容。`

    const response = await getClient().chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: 'AI 返回内容为空，请重试' },
        { status: 500 }
      )
    }

    const data = JSON.parse(content)
    return NextResponse.json(data)
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : '生成拍摄指导失败'
    if (errorMessage.includes('API') || errorMessage.includes('OPENAI')) {
      return NextResponse.json(
        { error: 'AI 服务配置异常，请检查 OPENAI_API_KEY 是否有效' },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
