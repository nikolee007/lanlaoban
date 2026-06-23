import type { RecentViewItem } from './types'

export const PLATFORM_COLORS: Record<string, string> = {
  '1688': 'bg-orange-500',
  Amazon: 'bg-amber-600',
  TikTokShop: 'bg-pink-500',
}

const RECENT_VIEWS_KEY = 'lanlaoban_recent_views'

export function addToRecentViews(item: RecentViewItem) {
  try {
    const raw = localStorage.getItem(RECENT_VIEWS_KEY)
    let views: RecentViewItem[] = raw ? JSON.parse(raw) : []
    views = views.filter((v) => v.id !== item.id)
    views.unshift(item)
    views = views.slice(0, 5)
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(views))
  } catch {
    // Silently ignore
  }
}

export function getRecentViews(): RecentViewItem[] {
  try {
    const raw = localStorage.getItem(RECENT_VIEWS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
