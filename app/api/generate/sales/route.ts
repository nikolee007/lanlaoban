import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { industry, product, persona } = body

    if (!industry || !product) {
      return NextResponse.json(
        { error: '缺少必填字段：industry（行业）、product（产品）' },
        { status: 400 }
      )
    }

    if (!persona?.nickname) {
      return NextResponse.json(
        { error: '缺少人设信息（persona），请先调用人设生成接口' },
        { status: 400 }
      )
    }

    const systemPrompt = `你是一个专门为实体老板打造成交系统的文案策划师。根据老板的人设和行业信息，生成三部分内容：

## 1. 视频结尾固定引流句（ending）
每条视频结尾的固定话术，引导观众私信或到店。符合李八字"真实纪实"风格，自然不套路。
80-120字。

## 2. 私信自动回复模板（autoReply）
用户私信后的自动回复文案。要有温度，引导进一步沟通或到店。
100-150字。

## 3. 微信添加话术（wechatCopy）
用户添加微信好友时的验证消息和打招呼文案。
60-100字。

要求：
- 口语化，第一人称
- 拒绝销售腔，像朋友推荐
- 结合行业特点和痛点
- 包含具体的行动指令（如"评论区扣1"、"私信"）
- 有紧迫感但不过度

请以 JSON 格式返回，格式如下：
{
  "ending": "视频结尾引流话术",
  "autoReply": "私信自动回复模板",
  "wechatCopy": "微信添加话术"
}`

    const userPrompt = `行业：${industry}
产品/服务：${product}
老板昵称：${persona.nickname || '未设置'}
老板简介：${persona.bio || '未设置'}
老板详情：${persona.intro || '未设置'}
口号：${persona.slogan || '未设置'}

请根据以上信息，生成成交话术系统。`

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
      error instanceof Error ? error.message : '生成成交话术失败'
    if (errorMessage.includes('API') || errorMessage.includes('OPENAI')) {
      return NextResponse.json(
        { error: 'AI 服务配置异常，请检查 OPENAI_API_KEY 是否有效' },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
