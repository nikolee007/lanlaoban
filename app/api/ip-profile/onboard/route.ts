import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'
import { generateContent, extractJsonFromResponse } from '@/lib/openai'
import { tursoDb } from '@/lib/turso'

const TURSO = !!process.env.TURSO_DATABASE_URL

interface ScriptEntry {
  title: string
  content: string
  emotion?: string
  shotType?: string
  shotDesc?: string
  duration?: number
}

interface Persona {
  nickname: string
  slogan: string
  bio: string
}

/**本路由用到的 IpProfile字段子集 */
interface ProfileLike {
  name?: string | null
  industry?: string | null
  product?: string | null
  experience?: string | null
  targetAudience?: string | null
  targetCustomer?: string | null
  personality?: string | null
  catchphrase?: string | null
  advantage?: string | null
  persona?: string | null
  videoScripts?: string | null
  [k: string]: unknown
}

/**
 * POST /api/ip-profile/onboard —采访完成后的自动串联
 *
 *老板聊完 10-15分钟采访后调用：
 *   1.若还没有人设 → AI生成 { nickname, slogan, bio }
 *   2.若还没有脚本 → AI生成 5条短视频脚本并落库
 *   3.开启「每日一条邮件短视频」投递
 *
 *幂等：已有内容不重复生成。可手动重试补全缺失部分。
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const profile = await getProfile(userId)
    if (!profile) {
      return NextResponse.json({ success: false, error: '还没有 IP档案，先完成采访' }, { status: 400 })
    }

    const result: { persona?: Persona; scripts?: ScriptEntry[] } = {}

    // 1.人设生成（幂等）
    const persona = parsePersona(profile.persona) || (await genPersona(profile))
    if (!parsePersona(profile.persona)) result.persona = persona

    // 2.脚本生成（幂等）
    const scripts = parseScripts(profile.videoScripts)
    if (scripts.length === 0) {
      const generated = await genScripts(profile)
      result.scripts = generated
    }

    // 3.落库：人设 +脚本 +开启每日投递
    const data = {
      dailyDeliveryEnabled: true,
      ...(result.persona ? { persona: JSON.stringify(result.persona) } : {}),
      ...(result.scripts ? { videoScripts: JSON.stringify(result.scripts) } : {}),
    }

    if (TURSO) {
      await tursoDb.saveProfile(userId, data)
    } else {
      await db.ipProfile.update({ where: { userId }, data })
    }

    return NextResponse.json({
      success: true,
      data: {
        persona,
        scripts,
        dailyDeliveryEnabled: true,
        bossName: profile.name || '老板',
        industry: profile.industry || '实体生意',
      },
    })
  } catch (err) {
    console.error('[onboard POST]', err)
    return NextResponse.json({ success: false, error: '自动串联失败' }, { status: 500 })
  }
}

/**生成人设方案 */
async function genPersona(profile: ProfileLike): Promise<Persona> {
  const prompt = `行业：${profile.industry || '实体生意'}\n产品：${profile.product || ''}\n从业经历：${profile.experience || ''}\n目标客户：${profile.targetAudience || profile.targetCustomer || '本地消费者'}\n性格：${profile.personality || ''}\n口头禅：${profile.catchphrase || ''}\n\n为这位老板打造一个短视频 IP人设，返回 JSON（不要 markdown）：{ "nickname": "账号昵称", "slogan": "一句话定位/slogan", "bio": "30-50字个人简介" }`
  const raw = await generateContent(
    prompt,
    '你是实体老板 IP操盘手，擅长把普通老板包装成有辨识度的短视频 IP。'
  )
  try {
    const parsed = JSON.parse(extractJsonFromResponse(raw))
    if (parsed.nickname && parsed.slogan && parsed.bio) return parsed as Persona
  } catch {}
  //兜底
  return {
    nickname: profile.name || '老板',
    slogan: `${profile.industry || '做好实体'}，说点真话`,
    bio: `做${profile.industry || '实体'}多年的老板，每天分享真实生意经。`,
  }
}

/**生成 5条短视频脚本 */
async function genScripts(profile: ProfileLike): Promise<ScriptEntry[]> {
  const prompt = `行业：${profile.industry || '实体生意'}\n产品：${profile.product || ''}\n目标客户：${profile.targetAudience || profile.targetCustomer || '本地消费者'}\n昵称：${profile.name || '老板'}\n优势：${profile.advantage || ''}\n\n生成5条实体老板IP口播短视频脚本，每条包含：title(标题)、content(260-360字)、emotion(情绪钩子)、shotType(自拍/行走/特写)、shotDesc(拍摄描述)。\n\n以JSON返回（不要 markdown）：{ "scripts": [...] }`
  const raw = await generateContent(
    prompt,
    '你是实体老板IP脚本生成器。生成5条短视频脚本，每条260-360字，带情绪钩子。'
  )
  try {
    const parsed = JSON.parse(extractJsonFromResponse(raw))
    if (Array.isArray(parsed.scripts) && parsed.scripts.length > 0) return parsed.scripts as ScriptEntry[]
  } catch {}

  //兜底模板
  const name = profile.name || '老板'
  const industry = profile.industry || '实体生意'
  const product = profile.product || ''
  return [
    { title: '自我介绍·让客户认识你', content: `大家好，我是${name}，做${industry}这行已经好多年了。今天开始在这个号上跟大家分享一些真实的内容，不吹不黑，都是干货。`, emotion: '被吸引→想认识这个人', shotType: '自拍', shotDesc: '正面近景口播，眼神看镜头' },
    { title: '行业真话·建立信任', content: `很多人问我${industry}行业的水有多深？今天跟你说点真话。做这一行，我见过太多坑，也踩过太多坑。你愿意听，我就慢慢讲。`, emotion: '觉得有用→想继续听', shotType: '自拍', shotDesc: '正面口播，手势比划' },
    { title: '客户故事·共情引流', content: `上个月一个客户找到我，说了一句话让我特别触动。他说，不是不想信你们，是这年头骗子太多了。这句话我一直记到现在。`, emotion: '产生共鸣→被感动到了', shotType: '行走', shotDesc: '边走边讲，展示门店环境' },
    { title: '产品展示·实力证明', content: `给你看看我们的${product}，注意看三个细节。第一是材质，第二是做工，第三是售后。这些细节，决定了一个生意能走多远。`, emotion: '被说服→确实不一样', shotType: '特写', shotDesc: '产品特写镜头' },
    { title: '私信引流·行动号召', content: `想了解更多？评论区打"想了解"，我免费给你出方案。注意，是免费的。这一行，值得信任的老板不多了。`, emotion: '想行动→评论也不亏', shotType: '自拍', shotDesc: '微笑收尾，引导行动' },
  ]
}

function parsePersona(raw?: string | null): Persona | null {
  if (!raw) return null
  try {
    const p = JSON.parse(raw)
    if (p.nickname && p.slogan && p.bio) return p as Persona
  } catch {}
  return null
}

function parseScripts(raw?: string | null): ScriptEntry[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) return arr as ScriptEntry[]
  } catch {}
  return []
}

async function getProfile(userId: number): Promise<ProfileLike | null> {
  if (TURSO) {
    const p = await tursoDb.getProfile(userId)
    return (p as unknown as ProfileLike) || null
  }
  const p = await db.ipProfile.findUnique({ where: { userId } })
  return (p as unknown as ProfileLike) || null
}
