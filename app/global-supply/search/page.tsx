'use client'

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Breadcrumb from '../../components/Breadcrumb'
import CompareDrawer from '../../components/CompareDrawer'
import VideoGenerateModal from '../../components/VideoGenerateModal'
import ContactModal from '../../components/ContactModal'
import { useCompare } from '../../contexts/CompareContext'
import { useToast } from '../../contexts/ToastContext'
import trendingData from '../../../lib/global-supply/trending-data.json'
import { FiClock, FiThumbsUp, FiBarChart2 } from 'react-icons/fi'
import { loadProductImageMap, setProductImageMap } from '@/lib/product-placeholder'
import {
  getSearchHistory, saveSearchHistory, clearSearchHistory,
  parsePrefixedId, collectionKey, daysAgo,
  INSIGHT, ITEMS_PER_PAGE,
} from '../search-utils'
import type { SearchResultItem } from '../search-utils'

import SearchHeader from './SearchHeader'
import SearchFilters, { ActiveFilterChips, EMPTY_FILTERS } from './SearchFilters'
import type { FiltersState } from './SearchFilters'
import ResultCard, { SkeletonCard } from './ResultCard'
import InsightCard from './InsightCard'
import Pagination from './Pagination'
import { EmptyTrending, NoResults, ErrorState } from './TrendingSection'
import { useSearchData, useCollections } from './useSearchData'

// ── Trending data constants ──
interface TrendingTerm { keyword: string; heatScore: number; category: string }
const trendingTerms: TrendingTerm[] =
  (trendingData as { trendingSearchTerms?: TrendingTerm[] }).trendingSearchTerms || []
const trendingSuggestionList: string[] = trendingTerms.map((t) => t.keyword)
const trendingHotTags: { label: string; heatScore: number }[] = trendingTerms
  .slice(0, 12).map((t) => ({ label: t.keyword, heatScore: t.heatScore }))

// ── Data Disclaimer ──
function DataDisclaimer() {
  const [dateStr, setDateStr] = useState('')
  useEffect(() => {
    const d = new Date()
    setDateStr(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }, [])
  return (
    <div className="mb-6 text-center text-xs text-gray-400">
      数据来源: 百度企业信用 / 1688 / 企查查等多平台公开信息 | 更新于: {dateStr}
    </div>
  )
}

// ── Page Inner ──
function GlobalSupplySearchPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const isSearchMode = !!query

  const [localQuery, setLocalQuery] = useState(query)
  const [showHeaderSuggestions, setShowHeaderSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  useEffect(() => { setSearchHistory(getSearchHistory()) }, [])
  useEffect(() => { loadProductImageMap().then(setProductImageMap) }, [])
  useEffect(() => { setLocalQuery(query) }, [query])

  const handleHeaderSearch = useCallback((q: string) => {
    if (!q.trim()) return
    saveSearchHistory(q.trim())
    setSearchHistory(getSearchHistory())
    router.push(`/global-supply/search?q=${encodeURIComponent(q.trim())}`)
  }, [router])

  const handleClearHistory = useCallback(() => {
    clearSearchHistory(); setSearchHistory([])
  }, [])

  const [filters, setFilters] = useState<FiltersState>(EMPTY_FILTERS)
  const [sort, setSort] = useState('default')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const { loading, error, allResults, totalResults } = useSearchData(query, filters, sort, currentPage)
  const { collections, setCollections } = useCollections()

  const [compareDrawerOpen, setCompareDrawerOpen] = useState(false)
  const [videoModalName, setVideoModalName] = useState<string | null>(null)
  const [contactModalName, setContactModalName] = useState<string | null>(null)
  const { items: compareItems } = useCompare()
  const { showToast } = useToast()

  const displayPageSize = isSearchMode ? ITEMS_PER_PAGE * 2 : ITEMS_PER_PAGE
  const totalPages = Math.max(1, Math.ceil(totalResults / displayPageSize))
  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1))
  const displayCount = totalResults > 0 ? totalResults : allResults.length

  const updateFilter = (key: string, val: string) =>
    setFilters((prev) => ({ ...prev, [key]: val }))
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const handleToggleSave = useCallback(async (item: SearchResultItem) => {
    const token = localStorage.getItem('lanlaoban_token')
    if (!token) { showToast('请先登录，才能使用此功能', 'warning'); return }
    const parsed = parsePrefixedId(item.id)
    if (!parsed) return
    const key = collectionKey(item.id)
    const isSaved = collections.has(key)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const authToken = localStorage.getItem('lanlaoban_token')
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`
      if (isSaved) {
        const res = await fetch('/api/global-supply/collections', {
          method: 'DELETE', headers,
          body: JSON.stringify({ targetId: parsed.id, targetType: parsed.type }),
        })
        const json = await res.json()
        if (json.success) {
          setCollections((prev) => { const n = new Set(prev); n.delete(key); return n })
          showToast('已取消收藏', 'info')
        }
      } else {
        const res = await fetch('/api/global-supply/collections', {
          method: 'POST', headers,
          body: JSON.stringify({ targetId: parsed.id, targetType: parsed.type }),
        })
        const json = await res.json()
        if (json.success) {
          setCollections((prev) => { const n = new Set(prev); n.add(key); return n })
          showToast('已收藏到资源库', 'success')
        }
      }
    } catch { /* Silently fail */ }
  }, [collections, showToast])

  const mostRecentUpdate = useMemo(() => {
    if (allResults.length === 0) return '-'
    const sorted = [...allResults].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return daysAgo(sorted[0].updatedAt)
  }, [allResults])

  const displayQuery = query || '全球供应链'

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <SearchHeader
        localQuery={localQuery} setLocalQuery={setLocalQuery}
        showHeaderSuggestions={showHeaderSuggestions}
        setShowHeaderSuggestions={setShowHeaderSuggestions}
        searchHistory={searchHistory}
        handleHeaderSearch={handleHeaderSearch}
        handleClearHistory={handleClearHistory}
        trendingHotTags={trendingHotTags}
        trendingSuggestionList={trendingSuggestionList}
      />

      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        <Breadcrumb items={[
          { label: '懒老板', href: '/' },
          { label: '全球供应链', href: '/global-supply' },
          { label: '搜索结果' },
        ]} className="mb-3" />

        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              {isSearchMode ? `搜索 "${displayQuery}"` : '全球供应链'}
            </h1>
            {!loading && <span className="text-sm text-gray-400">找到 {displayCount} 个结果</span>}
          </div>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <FiClock className="w-3 h-3" />最近更新: {mostRecentUpdate}
          </span>
        </div>

        <SearchFilters
          filters={filters} sort={sort} activeFilterCount={activeFilterCount}
          showMobileFilters={showMobileFilters} updateFilter={updateFilter}
          setSort={setSort} setFilters={setFilters}
          setShowMobileFilters={setShowMobileFilters}
        />
        <ActiveFilterChips
          filters={filters} updateFilter={updateFilter}
          setFilters={setFilters} activeFilterCount={activeFilterCount}
        />

        {error && <ErrorState error={error} />}

        {!error && loading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !error && !query && allResults.length === 0 && (
          <EmptyTrending handleHeaderSearch={handleHeaderSearch} trendingTerms={trendingTerms} />
        )}

        {!loading && !error && query && allResults.length === 0 && (
          <NoResults
            activeFilterCount={activeFilterCount} setFilters={setFilters}
            handleHeaderSearch={handleHeaderSearch} trendingTerms={trendingTerms}
          />
        )}

        {!loading && !error && allResults.length > 0 && (
          <div className="space-y-4" role="list">
            {allResults.map((item, index) => (
              <div key={item.id} role="listitem" className="animate-stagger"
                style={{ animationDelay: `${index * 40}ms` }}>
                <ResultCard
                  item={item}
                  saved={collections.has(collectionKey(item.id))}
                  onToggleSave={handleToggleSave}
                  onOpenVideo={setVideoModalName}
                  onOpenContact={setContactModalName}
                />
                {index === 3 && safeCurrentPage === 1 && (
                  <div className="my-4"><InsightCard insight={INSIGHT} /></div>
                )}
              </div>
            ))}
            <Pagination currentPage={safeCurrentPage} totalPages={totalPages}
              onPageChange={setCurrentPage} />
          </div>
        )}

        {!loading && !error && allResults.length > 0 && (
          <div className="mt-8 mb-12 flex items-center justify-center gap-2 text-sm text-gray-400">
            <FiThumbsUp className="w-4 h-4" />
            <span>懒老板 AI 持续监测全球供应链数据，为您推荐最优货源</span>
          </div>
        )}

        {!loading && !error && <DataDisclaimer />}
      </main>

      {compareItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <span className="text-sm text-gray-600">
              已选 <strong className="text-brand-500">{compareItems.length}</strong> 件
            </span>
            <button onClick={() => setCompareDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500">
              <FiBarChart2 className="h-4 w-4" />对比
            </button>
          </div>
        </div>
      )}

      <CompareDrawer open={compareDrawerOpen} onClose={() => setCompareDrawerOpen(false)} />
      <VideoGenerateModal open={videoModalName !== null} onClose={() => setVideoModalName(null)}
        productName={videoModalName ?? undefined} />
      <ContactModal open={contactModalName !== null} onClose={() => setContactModalName(null)}
        supplierName={contactModalName ?? undefined} />
    </div>
  )
}

export default function GlobalSupplySearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <GlobalSupplySearchPageInner />
    </Suspense>
  )
}
