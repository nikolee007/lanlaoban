/**
 * 虎皮椒（XunhuPay）聚合支付封装
 * 下单 / 验签（官方算法：参数按 ASCII 字典序排序拼接 + APPSECRET，MD5）
 */
import crypto from 'crypto'

export function getXunhupayConfig() {
  const appid = process.env.XUNHUPAY_APP_ID
  const secret = process.env.XUNHUPAY_SECRET
  if (!appid || !secret) throw new Error('XUNHUPAY_APP_ID / XUNHUPAY_SECRET 未配置')
  return { appid, secret }
}

/** 虎皮椒签名：排除 hash/sign，参数 ASCII 排序，key=value&... 拼接 + secret，MD5 */
export function xunhupaySign(params: Record<string, string>, secret: string): string {
  const filtered = Object.entries(params)
    .filter(([k, v]) => k !== 'hash' && k !== 'sign' && v !== '' && v !== null && v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
  const query = filtered.map(([k, v]) => `${k}=${v}`).join('&')
  return crypto.createHash('md5').update(query + secret).digest('hex')
}

/** 创建支付订单，返回虎皮椒响应（含 url_qrcode 二维码） */
export async function createXunhupayOrder(opts: {
  totalFee: string
  tradeOrderId: string
  title: string
  attach?: string
  notifyUrl: string
}) {
  const { appid, secret } = getXunhupayConfig()
  const time = Math.floor(Date.now() / 1000).toString()
  const nonceStr = crypto.randomBytes(16).toString('hex')

  const params: Record<string, string> = {
    appid,
    total_fee: opts.totalFee,
    trade_order_id: opts.tradeOrderId,
    title: opts.title,
    time,
    nonce_str: nonceStr,
    notify_url: opts.notifyUrl,
  }
  if (opts.attach) params.attach = opts.attach
  params.hash = xunhupaySign(params, secret)

  const res = await fetch('https://api.xunhupay.com/payment/do.html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  })
  const data = await res.json()
  if (data.errcode && data.errcode !== 0) throw new Error(data.errmsg || '下单失败')
  return data
}

/** 校验回调签名（排除 sign/hash） */
export function verifyXunhupayNotify(params: Record<string, string>): boolean {
  try {
    const { secret } = getXunhupayConfig()
    const sign = params.sign || params.hash || ''
    if (!sign) return false
    const expected = xunhupaySign(params, secret)
    return expected === sign
  } catch {
    return false
  }
}
