'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'
import { FiClock, FiRefreshCw } from 'react-icons/fi'
import {
  checkForUpdate,
  groupItems,
  fetchChangelog,
  type ChangelogEntry,
} from '@/lib/changelog'

const TYPE_STYLE: Record<string, string> = {
  新增: 'bg-emerald-50 text-emerald-600',
  优化: 'bg-sky-50 text-sky-600',
  修复: 'bg-amber-50 text-amber-600',
}

/** 更新说明页：每条都有【时间】与【更新内容】，按类型分组 */
export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [current, setCurrent] = useState('')
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    void fetchChangelog()
      .then((res) => {
        if (!res) return
        setEntries(res.entries)
        setCurrent(res.current)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleCheck() {
    setChecking(true)
    setNotice('')
    try {
      const result = await checkForUpdate()
      if (result === 'latest') setNotice('已是最新版本')
      else if (result === 'stale') {
        setNotice('发现新版本，正在刷新…')
        window.setTimeout(() => window.location.reload(), 600)
      } else setNotice('检查更新失败，请稍后再试')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#0A0A0B]">
      <NavHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[3px] text-[#FF6034]">CHANGELOG</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">更新说明</h1>
            <p className="mt-2 text-[#6B7280]">
              当前版本{current ? ` v${current}` : ''} · 每次更新都记在这里，改了什么一眼看得见
            </p>
          </div>
          <button
            type="button"
            data-testid="changelog-check-update"
            onClick={handleCheck}
            disabled={checking}
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-semibold transition-colors hover:border-[#FF6034]/40 hover:text-[#FF6034] disabled:opacity-50"
          >
            <FiRefreshCw className={checking ? 'animate-spin' : ''} />
            检查更新
          </button>
        </div>

        {notice && (
          <p data-testid="changelog-check-notice" className="mt-4 rounded-xl bg-[#FFF8F5] px-4 py-3 text-sm text-[#FF6034]">
            {notice}
          </p>
        )}

        {loading && <p className="mt-10 text-sm text-[#9CA3AF]">正在加载更新记录…</p>}

        {!loading && entries.length === 0 && (
          <p className="mt-10 text-sm text-[#9CA3AF]">暂时拿不到更新记录，请稍后再看</p>
        )}

        <div className="mt-10 space-y-5">
          {entries.map((entry, idx) => (
            <section
              key={entry.version}
              data-testid="changelog-entry"
              className="rounded-3xl border border-[#E5E7EB] p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold">v{entry.version}</h2>
                {idx === 0 && (
                  <span className="rounded-full bg-[#FF6034] px-2 py-0.5 text-xs font-bold text-white">最新</span>
                )}
                <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-[#9CA3AF]">
                  <FiClock className="h-3.5 w-3.5" />
                  {entry.time}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {groupItems(entry.items).map((group) => (
                  <div key={group.type} className="flex gap-3">
                    <span className={`mt-0.5 h-fit shrink-0 rounded px-2 py-0.5 text-xs font-bold ${TYPE_STYLE[group.type] || 'bg-gray-100 text-gray-500'}`}>
                      {group.type}
                    </span>
                    <ul className="list-disc space-y-1 pl-1 leading-relaxed text-[#374151]">
                      {group.list.map((it, k) => (
                        <li key={`${entry.version}-${k}`}>{it.text}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 text-sm text-[#9CA3AF]">
          想了解产品？<Link href="/about" className="text-[#FF6034] hover:underline">关于懒老板</Link>
        </p>
      </main>
    </div>
  )
}
