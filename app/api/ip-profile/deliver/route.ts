import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'
import { generateContent } from '@/lib/openai'
import { sendDeliveryEmail, buildScriptDeliveryHtml, buildScriptItemHtml } from '@/lib/mail'

interface DeliverScriptEntry {
  title: string
  content: string
  emotion?: string
}

// POST /api/ip-profile/deliver — 打包最近生成的30条脚本，发送到老板邮箱
export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })
    if (!user || !user.email) {
      return NextResponse.json({ success: false, error: '请先设置邮箱' }, { status: 400 })
    }

    const profile = await db.ipProfile.findUnique({
      where: { userId },
      select: { videoScripts: true, followUpCount: true, name: true },
    })

    // 如果没有现有脚本，先生成一批
    let scripts: DeliverScriptEntry[] = []
    if (profile?.videoScripts) {
      try { scripts = JSON.parse(profile.videoScripts) } catch {}
    }

    if (scripts.length === 0) {
      // 用 AI 生成一批默认脚本
      const profileData = await db.ipProfile.findUnique({
        where: { userId },
      })
      const industry = profileData?.industry || '实体生意'
      const name = profileData?.name || '老板'
      const product = profileData?.product || ''
      const customer = profileData?.targetAudience || '本地消费者'

      const result = await generateContent(
        `行业：${industry}\n产品：${product}\n目标客户：${customer}\n昵称：${name}\n请按实体老板IP口播风格，生成5条短视频脚本（每条约260-360字，带情绪钩子）。`,
        '你是一个实体老板IP脚本生成器。生成5条短视频脚本，每条包含title、content、emotion字段。以JSON格式返回：{ "scripts": [{ "title": "", "content": "", "emotion": "" }] }'
      )

      try {
        const parsed = JSON.parse(result)
        scripts = parsed.scripts || []
      } catch {
        // 解析失败时用模板内容
        scripts = [
          { title: '自我介绍·让客户认识你', content: `大家好，我是${name}，做${industry}这行已经好多年了。今天开始在这个号上跟大家分享一些真实的内容……`, emotion: '😯 被吸引→想认识这个人' },
          { title: '行业真话·建立信任', content: `很多人问我${industry}行业的水有多深？今天跟你说点真话……`, emotion: '🤔 觉得有用→想继续听' },
          { title: '客户故事·共情引流', content: `上个月一个客户找到我，说了一句话让我特别触动……`, emotion: '😌 产生共鸣→被感动到了' },
          { title: '产品展示·实力证明', content: `给你看看我们的${product}，注意看三个细节……`, emotion: '😲 被说服→确实不一样' },
          { title: '私信引流·行动号召', content: `想了解更多？评论区打"想了解"，我免费给你出方案。`, emotion: '🤝 想行动→评论也不亏' },
        ]
      }
    }

    // 构建邮件内容
    const bossName = user.name || profile?.name || '老板'
    const scriptsHtml = scripts.map((s, i) => buildScriptItemHtml(s, i)).join('')
    const tipsHtml = [
      '🎬 每条脚本约30-60秒，手机竖屏拍摄即可',
      '☀️ 拍摄时脸朝向窗户或光源，画面更清晰',
      '🎙️ 安静环境下用手机自带麦克风即可',
      '✂️ 剪映免费版就能完成剪辑，自动字幕',
      '📅 建议每天发1条，连续发30天养成账号',
    ].map(t => `<p style="margin:4px 0;font-size:13px;color:#555;">• ${t}</p>`).join('')

    const html = buildScriptDeliveryHtml({
      bossName,
      scriptCount: scripts.length,
      scriptsHtml,
      tipsHtml,
    })

    // 发送邮件
    const sent = await sendDeliveryEmail({
      to: user.email,
      subject: `懒老板 · ${bossName}，你的 ${scripts.length} 条短视频脚本已就绪`,
      html,
    })

    // 记录发送通知
    await db.notification.create({
      data: {
        userId,
        type: 'delivery',
        title: `📬 ${scripts.length} 条脚本已发送到你的邮箱`,
        message: `已发送至 ${user.email}，快去查收吧！`,
        link: '/ai-video',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        sent,
        email: user.email,
        scriptCount: scripts.length,
      },
    })
  } catch (err) {
    console.error('[deliver POST]', err)
    return NextResponse.json({ success: false, error: '交付失败' }, { status: 500 })
  }
}
