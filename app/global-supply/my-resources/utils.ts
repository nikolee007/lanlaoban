function pad(n: number) { return String(n).padStart(2, '0') }

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return formatDate(iso)
}

export function parseBusinessTags(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, 3) : []
  } catch {
    return []
  }
}

export function renderStars(rating: number | null | undefined): string {
  if (rating == null) return '—'
  const full = Math.round(rating)
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full))
}

export function safePriceDisplay(min: number | null, max: number | null): string {
  if (min != null && max != null) {
    if (min === max) return `¥${min}`
    return `¥${min} — ¥${max}`
  }
  if (min != null) return `¥${min}起`
  if (max != null) return `¥${max}以内`
  return '询价'
}
