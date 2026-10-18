'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiX } from 'react-icons/fi'
import { fetchChangelog } from '@/lib/changelog'

const SEEN_KEY = 'lanlaoban_changelog_seen'

/**
 * 新版本首次进入的轻提示（规范三条可见性的第二条）。
 * 同一版本只提示一次；可关闭；拉不到更新说明时**整条不渲染**（不挡页面）。
 */
export default function UpdateNoticeBar() {
  const [version, setVersion] = useState('')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    void fetchChangelog().then((res) => {
      const current = res?.current || ''
      if (!current) return
      try {
        if (localStorage.getItem(SEEN_KEY) === current) return
      } catch {
        /* 隐私模式下 localStorage 不可用：照常提示，用户可手动关 */
      }
      setVersion(current)
    })
  }, [])

  if (!version || dismissed) return null

  return (
    <div
      data-testid="changelog-first-run-bar"
      className="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center gap-3 rounded-full border border-[#FF6034]/20 bg-white px-4 py-2.5 shadow-lg"
    >
      <span className="min-w-0 flex-1 truncate text-sm text-[#374151]">
        已更新到 v{version}
      </span>
      <Link
        href="/changelog"
        className="shrink-0 text-sm font-semibold text-[#FF6034] hover:underline"
        onClick={() => {
          try { localStorage.setItem(SEEN_KEY, version) } catch {}
        }}
      >
        查看更新说明
      </Link>
      <button
        type="button"
        aria-label="关闭"
        className="shrink-0 rounded-full p-1 text-[#9CA3AF] hover:bg-gray-100"
        onClick={() => {
          try { localStorage.setItem(SEEN_KEY, version) } catch {}
          setDismissed(true)
        }}
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  )
}
