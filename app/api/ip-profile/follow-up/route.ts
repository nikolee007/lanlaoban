import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'
import { generateContent } from '@/lib/openai'

// 根据已有信息，生成一条个性化的跟进采访消息
async function generateFollowUp(profile: {
  name?: string | null
  industry?: string | null
  originStory?: string | null
  keyEvents?: string | null
  achievements?: string | null
  followUpCount: number
}): Promise<{ message: string; title: string }> {
  const name = profile.name || '老板'
  const industry = profile.industry || '你的行业'
  const round = (profile.followUpCount || 0) + 1

  // 跟进角度轮换，避免每次问一样的问题
  const angles = [
    `上次聊到${name}的创业经历，这周想问问：最近有没有发生什么让你印象深刻的客户故事？好的坏的都行，有时候一个客户故事比十条广告都有用。`,
    `${name}最近生意怎么样？有没有遇到什么新挑战或者新机会？这些都可以做成内容，你的粉丝其实最想看你真实面对问题的样子。`,
    `回头看你做${industry}这些年，你觉得最让你自豪的一个决定是什么？哪怕很小的决定也行，细节越具体越好。`,
    `如果让你给你的同行提一个建议，你会说什么？这种过来人的真话，每条都是爆款素材。`,
    `${name}最近有没有学到什么新东西？或者有什么新的产品/服务想推？咱们可以提前策划一批内容。`,
  ]

  const angle = angles[(round - 1) % angles.length]

  // 如果有之前的故事素材，做个性化引用
  let context = ''
  if (profile.originStory) context += `\n之前聊过他的创业起源：${profile.originStory}`
  if (profile.keyEvents && profile.keyEvents !== '[]') context += `\n关键经历：${profile.keyEvents}`
  if (profile.achievements && profile.achievements !== '[]') context += `\n成就：${profile.achievements}`

  const prompt = `你是一个实体老板IP编导，正在跟进一位老板的内容素材收集。
老板信息：${name} / ${industry} / 第${round}次跟进${context}

你的任务：以编导的身份，用自然聊天的语气发一条微信风格的消息。不要太长，像真人编导一样自然。
要求：自然、口语化、有针对性（利用已有信息）、不要AI味。

直接输出消息内容，不要加前缀。`

  const reply = await generateContent(prompt, '你是一个实体老板IP编导，擅长用朋友聊天的方式跟老板沟通，自然不做作，每条消息不超过100字。')

  // 根据跟进次数决定标题
  const titles = ['来聊聊最近的生意', '又有新素材可以拍了', '想听听你的新故事', '有个内容灵感想跟你聊聊', '最近怎么样？']
  const title = titles[(round - 1) % titles.length]

  return { message: reply || angle, title }
}

// POST /api/ip-profile/follow-up — 手动触发一次跟进（由用户主动触发或登录时触发）
export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const profile = await db.ipProfile.findUnique({ where: { userId } })
    if (!profile) {
      return NextResponse.json({ success: false, error: '还没有IP档案，请先完成采访' }, { status: 400 })
    }

    const { message, title } = await generateFollowUp(profile)

    // 保存为站内通知
    await db.notification.create({
      data: {
        userId,
        type: 'follow_up',
        title,
        message,
        link: '/interview',
      },
    })

    // 保存为 AI 聊天记录（system 角色，表示跟进）
    await db.ipChat.create({
      data: {
        userId,
        role: 'system',
        content: message,
        metadata: JSON.stringify({ type: 'follow_up', round: profile.followUpCount + 1 }),
      },
    })

    // 更新跟进计数和下次跟进时间（3-7天后，随机偏移防止全挤一起）
    const nextDays = 3 + Math.floor(Math.random() * 5)
    const nextDate = new Date(Date.now() + nextDays * 86400000)
    await db.ipProfile.update({
      where: { userId },
      data: {
        followUpCount: { increment: 1 },
        lastChatAt: new Date(),
        nextFollowUpAt: nextDate,
      },
    })

    return NextResponse.json({
      success: true,
      data: { message, title, nextFollowUpAt: nextDate.toISOString() },
    })
  } catch (err) {
    console.error('[follow-up POST]', err)
    return NextResponse.json({ success: false, error: '生成跟进失败' }, { status: 500 })
  }
}

// GET /api/ip-profile/follow-up — 检查是否有待处理的跟进
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const profile = await db.ipProfile.findUnique({
      where: { userId },
      select: { nextFollowUpAt: true, followUpCount: true },
    })

    const due = profile?.nextFollowUpAt
      ? new Date(profile.nextFollowUpAt) <= new Date()
      : false

    return NextResponse.json({
      success: true,
      data: {
        due,
        nextFollowUpAt: profile?.nextFollowUpAt || null,
        followUpCount: profile?.followUpCount || 0,
      },
    })
  } catch (err) {
    console.error('[follow-up GET]', err)
    return NextResponse.json({ success: false, error: '查询失败' }, { status: 500 })
  }
}
