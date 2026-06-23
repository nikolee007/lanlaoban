let idCounter = 0
export function genId(): string { idCounter += 1; return `msg_${Date.now()}_${idCounter}` }
export function genConvId(): string { return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }

export function formatTime(ts: number): string {
  const d = new Date(ts); const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function saveToLS<T>(key: string, data: T) { try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* ignore */ } }
export function loadFromLS<T>(key: string, fallback: T): T { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) as T : fallback } catch { return fallback } }
