'use client'
import { useEffect, useRef, useState, useMemo } from 'react'

export interface HotTag {
  label: string
  heatScore?: number
}

type SearchSuggestProps = {
  query: string
  suggestions: string[]
  onSelect: (q: string) => void
  onSearch: (q: string) => void
  hotTags?: HotTag[]
  /** Show hot tag cloud when query is empty */
  active?: boolean
  className?: string
}

const MAX_VISIBLE = 10
const MAX_TAGS = 16

export default function SearchSuggest({
  query,
  suggestions,
  onSelect,
  onSearch,
  hotTags = [],
  active = false,
  className = '',
}: SearchSuggestProps) {
  const [visible, setVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return suggestions
      .filter((item) => item.toLowerCase().includes(q))
      .slice(0, MAX_VISIBLE)
  }, [query, suggestions])

  // Visibility logic: query non-empty → show suggestions; active + empty → show hot tags
  useEffect(() => {
    if (query.trim().length > 0) {
      setVisible(true)
    } else if (active && hotTags.length > 0) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [query, active, hotTags])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setVisible(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClose = () => setVisible(false)

  if (!visible) return null

  // ── Hot tag cloud mode (empty query, active) ──
  if (!query.trim() && hotTags.length > 0) {
    return (
      <div
        ref={containerRef}
        className={`absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg ${className}`}
      >
        <div className="p-4">
          <div className="mb-2.5 text-xs font-medium text-gray-400">热门搜索</div>
          <div className="flex flex-wrap gap-2">
            {hotTags.slice(0, MAX_TAGS).map((tag) => (
              <button
                key={tag.label}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSearch(tag.label)
                  handleClose()
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-500"
              >
                {tag.label}
                {tag.heatScore != null && (
                  <span className="text-[10px] text-gray-400">{tag.heatScore}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Filtered suggestions mode ──
  if (query.trim()) {
    if (filtered.length === 0) {
      return (
        <div
          ref={containerRef}
          className={`absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-400 shadow-lg ${className}`}
        >
          没有匹配的建议
        </div>
      )
    }

    return (
      <div
        ref={containerRef}
        className={`absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg ${className}`}
      >
        {/* Count indicator */}
        <div className="border-b border-gray-50 px-4 py-2 text-[11px] text-gray-400">
          建议 {filtered.length} 条
        </div>
        <ul className="max-h-64 overflow-y-auto py-1">
          {filtered.map((item) => (
            <li
              key={item}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(item)
                handleClose()
              }}
              className="cursor-pointer px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-500"
            >
              {highlightMatch(item, query)}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return null
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-medium text-[#FF6034]">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  )
}
