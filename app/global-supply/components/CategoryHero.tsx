'use client'

import { FiPackage, FiTrendingUp } from 'react-icons/fi'

// ── Visual palette (cycled by category ID for consistent color per category) ──
export const BANNER_PALETTE = [
  { gradient: 'from-blue-500 to-blue-700', icon: 'FiGlobe' as const },
  { gradient: 'from-purple-500 to-violet-600', icon: 'FiMonitor' as const },
  { gradient: 'from-pink-500 to-rose-600', icon: 'FiShoppingBag' as const },
  { gradient: 'from-green-500 to-emerald-600', icon: 'FiHome' as const },
  { gradient: 'from-rose-500 to-pink-600', icon: 'FiHeart' as const },
  { gradient: 'from-amber-500 to-yellow-600', icon: 'FiPackage' as const },
  { gradient: 'from-teal-500 to-cyan-600', icon: 'FiAward' as const },
  { gradient: 'from-lime-500 to-green-600', icon: 'FiRefreshCw' as const },
  { gradient: 'from-cyan-500 to-blue-600', icon: 'FiTrendingUp' as const },
  { gradient: 'from-violet-500 to-purple-600', icon: 'FiGrid' as const },
  { gradient: 'from-gray-500 to-slate-600', icon: 'FiTool' as const },
  { gradient: 'from-indigo-500 to-blue-600', icon: 'FiClipboard' as const },
  { gradient: 'from-sky-500 to-blue-600', icon: 'FiBook' as const },
  { gradient: 'from-yellow-500 to-amber-600', icon: 'FiWatch' as const },
  { gradient: 'from-stone-500 to-amber-700', icon: 'FiCamera' as const },
  { gradient: 'from-red-500 to-rose-600', icon: 'FiVolume2' as const },
  { gradient: 'from-emerald-500 to-teal-600', icon: 'FiHeart' as const },
]

export const DEFAULT_BANNER = { gradient: 'from-gray-500 to-gray-700', icon: 'FiGrid' as const }

interface CategoryHeroProps {
  categoryName: string
  loading: boolean
  resultCount: number
  icon: React.ComponentType<{ className?: string }>
  gradient: string
}

export default function CategoryHero({
  categoryName,
  loading,
  resultCount,
  icon: BannerIcon,
  gradient,
}: CategoryHeroProps) {
  return (
    <div className={`bg-gradient-to-r ${gradient} text-white`}>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
            <BannerIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">{categoryName || '分类加载中...'}</h1>
            <p className="text-sm text-white/80 max-w-xl">该分类下的产品和服务</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-white/60">
              {!loading && (
                <span className="inline-flex items-center gap-1">
                  <FiPackage className="w-3.5 h-3.5" />
                  共 {resultCount} 个搜索结果
                </span>
              )}
              {loading && (
                <span className="inline-flex items-center gap-1">
                  <FiPackage className="w-3.5 h-3.5" />
                  加载中...
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <FiTrendingUp className="w-3.5 h-3.5" />
                数据来自全球供应链网络
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
