import crypto from 'crypto'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is not set')
  return secret
}

function base64url(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64urlDecode(str: string): string {
  return Buffer.from(
    str.replace(/-/g, '+').replace(/_/g, '/'),
    'base64',
  ).toString()
}

export function createSimpleToken(payload: Record<string, unknown>): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const headerStr = base64url(JSON.stringify(header))
  const payloadStr = base64url(JSON.stringify(payload))
  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(`${headerStr}.${payloadStr}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `${headerStr}.${payloadStr}.${signature}`
}

interface JwtPayload {
  userId?: number
  email?: string
  name?: string
  iat?: number
  exp?: number
  [key: string]: unknown
}

export function verifySimpleToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerStr, payloadStr, signatureStr] = parts

    const expectedSignature = crypto
      .createHmac('sha256', getJwtSecret())
      .update(`${headerStr}.${payloadStr}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    if (signatureStr !== expectedSignature) return null

    const payload = JSON.parse(base64urlDecode(payloadStr)) as JwtPayload

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null

    return payload
  } catch {
    return null
  }
}

/**
 * Extract userId from the Authorization: Bearer <token> header.
 * Returns null if token is missing or invalid.
 */
export function getAuthUserId(headers: Headers): number | null {
  const auth = headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return null

  const token = auth.slice(7)
  const payload = verifySimpleToken(token)
  if (!payload || typeof payload.userId !== 'number') return null
  return payload.userId
}

/**
 * Extract and verify full payload from Authorization header.
 */
export function getAuthPayload(headers: Headers): JwtPayload | null {
  const auth = headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return null

  const token = auth.slice(7)
  return verifySimpleToken(token)
}
