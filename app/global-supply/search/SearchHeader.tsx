'use client'

import { FiSearch, FiX } from 'react-icons/fi'
import SearchSuggest from '../../components/SearchSuggest'

interface HotTag {
  label: string
  heatScore: number
}

export default function SearchHeader({
  localQuery,
  setLocalQuery,
  showHeaderSuggestions,
  setShowHeaderSuggestions,
  searchHistory,
  handleHeaderSearch,
  handleClearHistory,
  trendingHotTags,
  trendingSuggestionList,
}: {
  localQuery: string
  setLocalQuery: (v: string) => void
  showHeaderSuggestions: boolean
  setShowHeaderSuggestions: (v: boolean) => void
  searchHistory: string[]
  handleHeaderSearch: (q: string) => void
  handleClearHistory: () => void
  trendingHotTags: HotTag[]
  trendingSuggestionList: string[]
}) {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-400 text-sm font-bold text-white">
            懒
          </div>
          <div className="relative flex-1 max-w-xl">
            <FiSearch className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onFocus={() => setShowHeaderSuggestions(true)}
              onBlur={() => setTimeout(() => setShowHeaderSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleHeaderSearch(localQuery)
              }}
              placeholder="搜索全球供应链产品/工厂..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-brand-200 focus:bg-white focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,96,52,0.12)]"
            />
            {/* Clear button */}
            {localQuery && (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery('')
                  setShowHeaderSuggestions(true)
                }}
                className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
            {/* Dropdown: history + hot tags when focused & empty */}
            {showHeaderSuggestions && !localQuery && (
              <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
                {searchHistory.length > 0 && (
                  <div className="p-3 pb-1">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400">最近搜索</span>
                      <button
                        type="button"
                        onClick={handleClearHistory}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        清除
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(searchHistory || []).slice(0, 5).map((h) => (
                        <button
                          key={h}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleHeaderSearch(h)}
                          className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-500"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Hot tags */}
                <div className={searchHistory.length > 0 ? 'border-t border-gray-50 p-3' : 'p-3'}>
                  <div className="mb-2 text-xs font-medium text-gray-400">热门搜索</div>
                  <div className="flex flex-wrap gap-2">
                    {(trendingHotTags || []).slice(0, 12).map((tag) => (
                      <button
                        key={tag.label}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleHeaderSearch(tag.label)}
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
            )}
            {/* Suggestions dropdown when typing */}
            {localQuery && (
              <SearchSuggest
                query={localQuery}
                suggestions={trendingSuggestionList}
                onSelect={handleHeaderSearch}
                onSearch={handleHeaderSearch}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
