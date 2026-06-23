import { FiBarChart2, FiTrendingUp } from 'react-icons/fi'
import type { InsightCard as InsightCardType } from '../search-utils'

export default function InsightCard({ insight }: { insight: InsightCardType }) {
  const maxVal = Math.max(...insight.trendData.map((d) => d.value))

  return (
    <div className="bg-gradient-to-br from-brand-50 via-orange-50/30 to-purple-50/30 rounded-2xl border border-brand-100/80 p-4 sm:p-5 shadow-apple">
      <div className="flex items-start gap-3 mb-4">
        <div className="rounded-lg bg-brand-100 p-2 flex-shrink-0">
          <FiBarChart2 className="w-5 h-5 text-brand-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-brand-600">{insight.title}</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{insight.content}</p>
        </div>
      </div>

      {/* CSS Bar Chart */}
      <div className="bg-white/80 rounded-lg border border-brand-100 p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <FiTrendingUp className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-semibold text-gray-600">热门品类搜索增长趋势 (近30天)</span>
        </div>
        <div className="space-y-2.5">
          {(insight.trendData || []).map((d) => (
            <div key={d.label} className="flex items-center gap-2 sm:gap-3">
              <span className="w-16 sm:w-20 text-xs text-gray-500 text-right flex-shrink-0 truncate">
                {d.label}
              </span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(d.value / maxVal) * 100}%`,
                    background:
                      d.direction === 'up'
                        ? 'linear-gradient(90deg, #FF6034, #FF8A5C)'
                        : d.direction === 'down'
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #9ca3af, #d1d5db)',
                  }}
                />
              </div>
              <span
                className={`w-10 sm:w-12 text-xs font-semibold text-right flex-shrink-0 ${
                  d.direction === 'up'
                    ? 'text-green-600'
                    : d.direction === 'down'
                      ? 'text-red-500'
                      : 'text-gray-400'
                }`}
              >
                {d.change}
              </span>
              <span className="w-4 flex-shrink-0">
                {d.direction === 'up' ? (
                  <FiTrendingUp className="w-3.5 h-3.5 text-green-500" />
                ) : d.direction === 'down' ? (
                  <FiTrendingUp className="w-3.5 h-3.5 text-red-500 rotate-180" />
                ) : (
                  <span className="block w-3.5 h-0.5 bg-gray-400 rounded-full" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
