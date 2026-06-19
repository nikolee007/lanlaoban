import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateContent } from '@/lib/openai'

// 跟进角度（与 follow-up route 保持一致）
const ANGLES = [
  `最近有没有发生什么让你印象深刻的客户故事？好的坏的都行，有时候一个客户故事比十条广告都有用。`,
  `最近生意怎么样？有没有遇到什么新挑战或者新机会？`,
  `做这行这些年，最让你自豪的一个决定是什么？细节越具体越好。`,
  `如果让你给同行提一个建议，你会说什么？这种过来人的真话，每条都是爆款素材。`,
  `最近有没有学到什么新东西？有什么新产品/服务想推？`,
]

// 生成跟进消息
async function genMessage(profile: {
  name?: string | null
  industry?: string | null
  originStory?: string | null
  followUpCount: number
}): Promise<string> {
  const name = profile.name || '老板'
  const industry = profile.industry || '你的行业'
  const round = (profile.followUpCount || 0) + 1
  const angle = ANGLES[(round - 1) % ANGLES.length]

  let context = ''
  if (profile.originStory) context += `\n之前聊过他的创业起源：${profile.originStory}`

  try {
    const reply = await generateContent(
      `老板信息：${name} / ${industry} / 第${round}次跟进${context}\n\n以编导身份发一条自然的消息，用"你"称呼，像微信聊天一样。不超过80字。问题：${angle}`,
      '你是一个实体老板IP编导，用朋友聊天的方式跟老板沟通，自然不做作。'
    )
    return reply || angle
  } catch {
    return angle
  }
}

// GET /api/cron/follow-up — 由定时任务调用（Vercel Cron / crontab）
// 检查所有 nextFollowUpAt <= now 的用户，生成跟进通知
export async function GET(request: NextRequest) {
  // 简单鉴权：cron secret
  const auth = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET || 'lanlaoban-cron-dev'
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const now = new Date()

    // 找出到期的跟进
    const dueProfiles = await db.ipProfile.findMany({
      where: {
        nextFollowUpAt: { lte: now },
        NOT: { nextFollowUpAt: null },
      },
      include: { user: { select: { id: true } } },
    })

    if (dueProfiles.length === 0) {
      return NextResponse.json({ success: true, data: { processed: 0 } })
    }

    let processed = 0
    for (const profile of dueProfiles) {
      try {
        const title = ['来聊聊最近的生意', '又有新素材可以拍了', '想听听你的新故事', '有个内容灵感', '最近怎么样？'][(profile.followUpCount || 0) % 5]
        const message = await genMessage(profile)

        // 通知
        await db.notification.create({
          data: {
            userId: profile.userId,
            type: 'follow_up',
            title,
            message,
            link: '/interview',
          },
        })

        // 聊天记录
        await db.ipChat.create({
          data: {
            userId: profile.userId,
            role: 'system',
            content: message,
            metadata: JSON.stringify({ type: 'follow_up', round: (profile.followUpCount || 0) + 1 }),
          },
        })

        // 更新跟进时间和计数
        const nextDays = 3 + Math.floor(Math.random() * 5)
        await db.ipProfile.update({
          where: { userId: profile.userId },
          data: {
            followUpCount: { increment: 1 },
            lastChatAt: new Date(),
            nextFollowUpAt: new Date(Date.now() + nextDays * 86400000),
          },
        })

        processed++
      } catch (err) {
        console.error(`[cron] 用户 ${profile.userId} 跟进失败:`, err)
      }
    }

    return NextResponse.json({ success: true, data: { processed, total: dueProfiles.length } })
  } catch (err) {
    console.error('[cron follow-up]', err)
    return NextResponse.json({ success: false, error: '定时任务失败' }, { status: 500 })
  }
}
