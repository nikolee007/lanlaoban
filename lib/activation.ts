/**
 * 洋葱一键出海 · 激活码核心逻辑
 * Ed25519 签名激活码（ONION-XXX base32）+ license token
 * 与 onion-overseas 的 tools/activation-cli 格式完全兼容
 */
import crypto from 'crypto'

// base32 字母表（去掉易混淆 ILO0，含 '1'，恰好 32 字符）
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ234567891'

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const b of bytes) {
    value = (value << 8) | b
    bits += 8
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31]
  return out
}

export function base32Decode(str: string): Uint8Array {
  const clean = str.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  const bytes: number[] = []
  let bits = 0
  let value = 0
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch)
    if (idx === -1) throw new Error('invalid base32 char')
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return new Uint8Array(bytes)
}

function pack(payload: Buffer, signature: Buffer): Buffer {
  return Buffer.concat([Buffer.from([payload.length]), payload, signature])
}

function unpack(blob: Buffer): { payload: Buffer; signature: Buffer } {
  if (blob.length < 66) throw new Error('blob too short')
  const len = blob[0]
  if (1 + len + 64 !== blob.length) throw new Error('blob length mismatch')
  return { payload: blob.subarray(1, 1 + len), signature: blob.subarray(1 + len) }
}

export interface CodePayload {
  v: number
  cid: string
  exp: number
  dev: number
}

/** 生成一个激活码（用私钥 Ed25519 签名） */
export function createActivationCode(
  privateKeyPem: string,
  opts: { days: number; maxDevices?: number; now?: number },
): { code: string; payload: CodePayload } {
  const now = opts.now ?? Date.now()
  const payload: CodePayload = {
    v: 1,
    cid: crypto.randomBytes(6).toString('hex'),
    exp: now + opts.days * 86400000,
    dev: opts.maxDevices ?? 1,
  }
  const payloadBytes = Buffer.from(JSON.stringify(payload))
  const signature = crypto.sign(null, payloadBytes, privateKeyPem)
  const encoded = base32Encode(pack(payloadBytes, signature))
  const groups = encoded.match(/.{1,6}/g) ?? []
  return { code: 'ONION-' + groups.join('-'), payload }
}

/** 验签激活码。返回 {valid:true, payload} 或 {valid:false, reason}；格式/签名错误抛 Error */
export function verifyActivationCode(
  code: string,
  publicKeyPem: string,
  now = Date.now(),
): { valid: boolean; payload?: CodePayload; reason?: string } {
  const clean = code.replace(/^ONION-/i, '').replace(/-/g, '')
  let blob: Buffer
  try {
    blob = Buffer.from(base32Decode(clean))
  } catch {
    throw new Error('INVALID_FORMAT')
  }
  const { payload, signature } = unpack(blob)
  const ok = crypto.verify(null, payload, publicKeyPem, signature)
  if (!ok) throw new Error('INVALID_SIGNATURE')
  let data: CodePayload
  try {
    data = JSON.parse(payload.toString())
  } catch {
    throw new Error('INVALID_FORMAT')
  }
  if (typeof data !== 'object' || data === null) throw new Error('INVALID_FORMAT')
  if (data.v !== 1) return { valid: false, reason: 'UNSUPPORTED_VERSION' }
  if (typeof data.exp !== 'number' || !Number.isFinite(data.exp)) return { valid: false, reason: 'EXPIRED' }
  if (data.exp < now) return { valid: false, reason: 'EXPIRED' }
  return { valid: true, payload: data }
}

/** 签发 license token（base64url(payload + 0x1a + ed25519sig)） */
export function issueToken(
  data: { cid: string; fp: string; exp: number },
  privateKeyPem: string,
): string {
  const payload = { ...data, iat: Date.now() }
  const bytes = Buffer.from(JSON.stringify(payload))
  const sig = crypto.sign(null, bytes, privateKeyPem)
  return Buffer.concat([bytes, Buffer.from([0x1a]), sig]).toString('base64url')
}

/** 验签 license token */
export function verifyToken(
  token: string,
  publicKeyPem: string,
): { cid: string; fp: string; exp: number; iat: number } {
  const raw = Buffer.from(token, 'base64url')
  const sep = raw.indexOf(0x1a)
  if (sep === -1) throw new Error('BAD_TOKEN')
  const bytes = raw.subarray(0, sep)
  const sig = raw.subarray(sep + 1)
  const ok = crypto.verify(null, bytes, publicKeyPem, sig)
  if (!ok) throw new Error('BAD_TOKEN')
  const parsed = JSON.parse(bytes.toString())
  if (typeof parsed !== 'object' || parsed === null) throw new Error('BAD_TOKEN')
  return parsed
}

/** 从环境变量取密钥（PEM，多行用 \n 转义） */
export function getPrivateKey(): string {
  const key = process.env.ONION_PRIVATE_KEY
  if (!key) throw new Error('ONION_PRIVATE_KEY 未配置')
  return key.replace(/\\n/g, '\n')
}

export function getPublicKey(): string {
  const key = process.env.ONION_PUBLIC_KEY
  if (!key) throw new Error('ONION_PUBLIC_KEY 未配置')
  return key.replace(/\\n/g, '\n')
}
