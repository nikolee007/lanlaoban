import { FiTrendingUp, FiAlertCircle } from 'react-icons/fi'
import type { FiltersState } from './SearchFilters'

interface TrendingTerm {
  keyword: string
  heatScore: number
  category: string
}

export function EmptyTrending({
  handleHeaderSearch,
  trendingTerms,
}: {
  handleHeaderSearch: (q: string) => void
  trendingTerms: TrendingTerm[]
}) {
  return (
    <div className="py-12">
      <div className="mb-8 text-center">
        <FiTrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900">全球供应链热门搜索</h2>
        <p className="mt-1 text-sm text-gray-500">选一个热门词开始查找优质货源</p>
      </div>
      <div className="mx-auto max-w-2xl">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {(trendingTerms || []).slice(0, 16).map((term) => (
            <button
              key={term.keyword}
              type="button"
              onClick={() => handleHeaderSearch(term.keyword)}
              className="group flex flex-col items-center gap-1.5 rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
            >
              <span className="text-sm font-medium text-gray-800 group-hover:text-brand-500">
                {term.keyword}
              </span>
              <span className="text-xs text-gray-400">
                热度 {term.heatScore}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function NoResults({
  activeFilterCount,
  setFilters,
  handleHeaderSearch,
  trendingTerms,
}: {
  activeFilterCount: number
  setFilters: (f: FiltersState) => void
  handleHeaderSearch: (q: string) => void
  trendingTerms: TrendingTerm[]
}) {
  return (
    <div className="text-center py-20">
      <FiAlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-gray-900 mb-2">没有找到相关商品</h2>
      <p className="text-sm text-gray-500 mb-6">试试其他关键词</p>
      {activeFilterCount > 0 && (
        <button
          onClick={() => setFilters({ category: '', region: '', minOrder: '', cert: '', rating: '', priceMin: '', priceMax: '', dropship: '' })}
          className="text-sm text-brand-500 hover:text-brand-600 font-medium"
        >
          清除所有筛选
        </button>
      )}
      {/* 推荐热门搜索 */}
      <div className="mt-8">
        <p className="text-xs text-gray-400 mb-3">推荐热门搜索</p>
        <div className="flex flex-wrap justify-center gap-2">
          {trendingTerms.slice(0, 8).map((term) => (
            <button
              key={term.keyword}
              onClick={() => handleHeaderSearch(term.keyword)}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-brand-200 hover:text-brand-500 transition-colors"
            >
              {term.keyword}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ErrorState({ error }: { error: string }) {
  return (
    <div className="text-center py-16">
      <FiAlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-gray-900 mb-2">加载失败</h2>
      <p className="text-sm text-gray-500 mb-4">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-brand-400 text-white hover:bg-brand-500 transition-colors"
      >
        重新加载
      </button>
    </div>
  )
}
