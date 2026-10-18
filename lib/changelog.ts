/**
 * 「更新说明」数据源 —— `public/changelog.json`（站根 `/changelog.json`）。
 *
 * 规范：中枢 `specs/CHANGELOG-CONVENTION.md`（老大 2026-10-11 定）。
 * 两条分寸与 H5/后台一致：
 *   ① **静默降级**：拉不到一律 null，绝不抛 —— 更新说明拉不到是小事，不能挡任何页面；
 *   ② **一次一拉**：模块级缓存 promise。
 *
 * 「检查更新」的判据是**线上首页的构建标识**与当前页面加载的是不是同一个，
 * 不是手写版本号 —— 改 JSON 不等于发了新产物。
 */

export type ChangelogItemType = '新增' | '优化' | '修复'

export interface ChangelogItem {
  type: ChangelogItemType
  text: string
}

export interface ChangelogEntry {
  version: string
  date: string
  time: string
  items: ChangelogItem[]
}

export interface Changelog {
  current: string
  entries: ChangelogEntry[]
}

export const ITEM_TYPES: ChangelogItemType[] = ['新增', '优化', '修复']

let cache: Promise<Changelog | null> | null = null

export function fetchChangelog(): Promise<Changelog | null> {
  if (!cache) {
    cache = fetch(`/changelog.json?_=${Date.now()}`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return null
        // 老部署没有这个文件时可能回 HTML（SPA/404 页），只判 ok 会把 HTML 当 JSON 解析
        if (!(res.headers.get('content-type') || '').includes('json')) return null
        const data = (await res.json()) as Changelog | null
        if (!data || !Array.isArray(data.entries)) return null
        return data
      })
      .catch(() => null)
  }
  return cache
}

/** 按类型分组；写错的类型不吞，原样排在后面 */
export function groupItems(items: ChangelogItem[]): { type: string; list: ChangelogItem[] }[] {
  const seen = [...new Set(items.map((i) => i.type))]
  const ordered = [
    ...ITEM_TYPES.filter((t) => seen.includes(t)),
    ...seen.filter((t) => !ITEM_TYPES.includes(t as ChangelogItemType)),
  ]
  return ordered.map((type) => ({ type, list: items.filter((i) => i.type === type) }))
}

/** 从 HTML 里取构建标识（Next.js 的 buildId；取不到退到 main-app chunk 哈希） */
export function buildIdOf(html: string): string {
  const byBuild = /buildId\\?"\s*:\s*\\?"([A-Za-z0-9_-]+)/.exec(html)?.[1]
  if (byBuild) return byBuild
  const byChunk = /main-app-([0-9a-f]{8,})\.js/.exec(html)?.[1]
  return byChunk || ''
}

/**
 * 检查更新：线上首页的构建标识 vs 当前页面加载时的。
 * 拿不到任何一边时返回 unknown —— 如实说「检查失败」，不谎报「已是最新」。
 */
export async function checkForUpdate(): Promise<'latest' | 'stale' | 'unknown'> {
  try {
    const loaded = buildIdOf(document.documentElement.innerHTML)
    const html = await fetch(`/?_=${Date.now()}`, { cache: 'no-store' }).then((r) => r.text())
    const latest = buildIdOf(html)
    if (!loaded || !latest) return 'unknown'
    return loaded === latest ? 'latest' : 'stale'
  } catch {
    return 'unknown'
  }
}
