import nodemailer from 'nodemailer'

interface MailOptions {
  to: string
  subject: string
  html?: string
  [key: string]: unknown
}

interface DeliveryOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content?: Buffer | string
    path?: string
  }>
}

let _transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (_transporter) return _transporter

  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  // 没有配置 SMTP 时，使用一个 no-op 发送
  if (!user || !pass) {
    console.warn('[mail] SMTP 未配置，邮件将打印到控制台')
    _transporter = {
      sendMail: async (opts: MailOptions) => {
        console.log('[mail] 📧 模拟发送:', opts.to, opts.subject)
        return { messageId: 'mock-' + Date.now(), envelope: { to: [opts.to] } }
      },
    } as unknown as nodemailer.Transporter
    return _transporter
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
  return _transporter
}

export async function sendDeliveryEmail(options: DeliveryOptions): Promise<boolean> {
  try {
    const from = process.env.DELIVERY_FROM || '懒老板 <delivery@lenboss.win>'
    const info = await getTransporter().sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    })
    console.log('[mail] ✅ 发送成功:', info.messageId)
    return true
  } catch (err) {
    console.error('[mail] ❌ 发送失败:', err)
    return false
  }
}

/** 脚本交付邮件 HTML 模板 */
export function buildScriptDeliveryHtml(opts: {
  bossName: string
  scriptCount: number
  scriptsHtml: string
  tipsHtml: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
      <tr><td style="padding:32px 32px 16px;text-align:center;background:linear-gradient(135deg,#FF6034,#8B5CF6)">
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">懒老板 · 内容交付</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px;">${opts.bossName}，你的内容已经准备好了</p>
      </td></tr>
      <tr><td style="padding:24px 32px">
        <p style="margin:0 0 16px;color:#1d1d1f;font-size:15px;line-height:1.5;">
          本次为你生成了 <strong style="color:#FF6034;">${opts.scriptCount} 条短视频脚本</strong>，每条都包含完整的台词、拍摄指导和情绪钩子设计。
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
        ${opts.scriptsHtml}
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
        <div style="margin:16px 0;">
          <h3 style="margin:0 0 12px;font-size:14px;color:#1d1d1f;">📸 拍摄小贴士</h3>
          ${opts.tipsHtml}
        </div>
      </td></tr>
      <tr><td style="padding:16px 32px 32px;text-align:center;color:#86868b;font-size:12px;">
        <p style="margin:0 0 4px;">懒老板 — AI内容获客 + 全球货源直连</p>
        <p style="margin:0;">如有问题，回复此邮件即可联系你的专属编导</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`
}

/** 构建单条脚本的 HTML */
export function buildScriptItemHtml(script: { title: string; content: string; emotion?: string }, index: number): string {
  const emotionHtml = script.emotion
    ? `<div style="margin:8px 0 0;padding:8px 12px;background:#f5f3ff;border-radius:8px;border:1px solid #e9d5ff;font-size:12px;color:#6b21a8;">🎣 ${script.emotion}</div>`
    : ''
  return `
    <div style="margin:12px 0;padding:16px;background:#fafafa;border-radius:12px;border:1px solid #eee;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="background:#FF6034;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;">第${index + 1}条</span>
        <span style="font-size:13px;font-weight:600;color:#1d1d1f;">${script.title}</span>
      </div>
      <p style="margin:0;font-size:13px;color:#333;line-height:1.6;white-space:pre-wrap;">${script.content}</p>
      ${emotionHtml}
    </div>`
}
