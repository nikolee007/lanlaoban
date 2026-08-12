import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tursoDb } from '@/lib/turso'
import { sendDeliveryEmail, buildDailyVideoHtml } from '@/lib/mail'

const TURSO = !!process.env.TURSO_DATABASE_URL

interface ScriptEntry {
  title: string
  content: string
  emotion?: string
}

interface DailyProfile {
  id: number
  userId: number
  name?: string | null
  industry?: string | null
  videoScripts?: string | null
  latestVideoUrl?: string | null
  deliveryDayCount?: number
}

/**
 * GET /api/cron/daily-deliver — 每日一条邮件短视频获客
 *
 * 由 Vercel Cron（每天固定时间）调用：
 *   1. 找出所有开启「每日投递」的 IP 档案
 *   2. 按 deliveryDayCount 轮换脚本，每天发 1 条
 *   3. 邮件含今日脚本 + 数字人视频入口（latestVideoUrl）
 *   4. 更新投递计数 + 站内通知
 *
 * 鉴权：Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET || 'lanlaoban-cron-dev'
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const profiles = await getDeliveryQueue()
    if (profiles.length === 0) {
      return NextResponse.json({ success: true, data: { processed: 0, total: 0 } })
    }

    let processed = 0
    for (const profile of profiles) {
      try {
        const user = await getUserEmail(profile.userId)
        if (!user?.email) continue

        const scripts = parseScripts(profile.videoScripts)
        if (scripts.length === 0) continue // 没有脚本不发空邮件，等待 onboard 补齐

        const day = (profile.deliveryDayCount || 0)
        const script = scripts[day % scripts.length]
        const bossName = profile.name || '老板'

        const videoUrl = profile.latestVideoUrl || undefined
        const campaignLink = videoUrl
          ? `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}utm_source=email&utm_medium=daily_delivery&utm_campaign=script_day_${day + 1}`
          : undefined

        const html = buildDailyVideoHtml({
          bossName,
          dayNumber: day + 1,
          title: script.title || `第 ${day + 1} 条`,
          content: script.content || '',
          emotion: script.emotion,
          videoUrl,
          campaignLink,
        })

        const sent = await sendDeliveryEmail({
          to: user.email,
          subject: `懒老板 · ${bossName}，今日短视频脚本已就绪（第 ${day + 1} 天）`,
          html,
        })

        if (sent) {
          await createNotification(profile.userId, user.email, day + 1, !!videoUrl)
          await markDelivery(profile.userId, day + 1)
          processed++
        }
      } catch (err) {
        console.error(`[cron daily-deliver] 用户 ${profile.userId} 投递失败:`, err)
      }
    }

    return NextResponse.json({ success: true, data: { processed, total: profiles.length } })
  } catch (err) {
    console.error('[cron daily-deliver]', err)
    return NextResponse.json({ success: false, error: '每日投递失败' }, { status: 500 })
  }
}

async function getDeliveryQueue(): Promise<DailyProfile[]> {
  if (TURSO) {
    const rows = await tursoDb.listDailyDeliveryProfiles()
    return rows as unknown as DailyProfile[]
  }
  const rows = await db.ipProfile.findMany({
    where: { dailyDeliveryEnabled: true },
    select: {
      id: true,
      userId: true,
      name: true,
      industry: true,
      videoScripts: true,
      latestVideoUrl: true,
      deliveryDayCount: true,
    },
  })
  return rows as unknown as DailyProfile[]
}

async function getUserEmail(userId: number): Promise<{ email: string } | null> {
  if (TURSO) return tursoDb.findUserById(userId)
  const u = await db.user.findUnique({ where: { id: userId }, select: { email: true } })
  return u
}

/** 站内通知（Prisma；Turso 模式下失败不阻断投递，仅记日志） */
async function createNotification(userId: number, email: string, day: number, hasVideo: boolean) {
  try {
    await db.notification.create({
      data: {
        userId,
        type: 'delivery',
        title: `📬 今日短视频已送达（第 ${day} 天）`,
        message: `已发送至 ${email}，含今日脚本${hasVideo ? '和视频入口' : ''}。`,
        link: '/digital-human',
      },
    })
  } catch (e) {
    console.error('[cron daily-deliver] 通知创建失败(不影响投递):', e)
  }
}

async function markDelivery(userId: number, dayCount: number) {
  if (TURSO) {
    await tursoDb.markDelivery(userId, dayCount)
  } else {
    await db.ipProfile.update({
      where: { userId },
      data: { deliveryDayCount: dayCount, lastDeliveryAt: new Date() },
    })
  }
}

function parseScripts(raw?: string | null): ScriptEntry[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) return arr
  } catch {}
  return []
}
