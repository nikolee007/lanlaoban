export function unsafeCastArray(raw: unknown): unknown[] {
  return Array.isArray(raw) ? raw : []
}

export function safeString(val: unknown, fallback: string): string
export function safeString(val: unknown, fallback: string | null): string | null
export function safeString(val: unknown, fallback: string | null): string | null {
  return typeof val === 'string' ? val : fallback
}

export function safeNumber(val: unknown, fallback: number): number
export function safeNumber(val: unknown, fallback: number | null): number | null
export function safeNumber(val: unknown, fallback: number | null): number | null {
  return typeof val === 'number' ? val : fallback
}
