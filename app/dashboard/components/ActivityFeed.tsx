'use client'

import { FiClock, FiHeart, FiMessageSquare, FiShoppingCart } from 'react-icons/fi'

interface ActivityItem {
  id: number
  name?: string
  title?: string
  time: string
  status?: string
}

interface ActivityFeedProps {
  collections: ActivityItem[]
  inquiries: ActivityItem[]
  orders: ActivityItem[]
  formatTime: (timeStr: string) => string
  locale: string
}

export default function ActivityFeed({
  collections,
  inquiries,
  orders,
  formatTime,
  locale,
}: ActivityFeedProps) {
  const isEn = locale === 'en'

  return (
    <div className="card lg:col-span-2">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
        <FiClock className="h-4 w-4 text-brand-400" />
        {isEn ? 'Recent Activity' : '最近活动'}
      </h2>

      <div className="space-y-4">
        {/* Recent collections */}
        {collections.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <FiHeart className="h-3 w-3" />
              {isEn ? 'Collections' : '收藏的商品'}
            </h3>
            {collections.map((item) => (
              <div
                key={`col-${item.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatTime(item.time)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Recent inquiries */}
        {inquiries.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <FiMessageSquare className="h-3 w-3" />
              {isEn ? 'Inquiries' : '最近的询盘'}
            </h3>
            {inquiries.map((item) => (
              <div
                key={`inq-${item.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">{item.title}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatTime(item.time)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Recent orders */}
        {orders.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <FiShoppingCart className="h-3 w-3" />
              {isEn ? 'Orders' : '最近的订单'}
            </h3>
            {orders.map((item) => (
              <div
                key={`ord-${item.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{item.title}</span>
                  {item.status && (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-400">
                      {item.status}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatTime(item.time)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {collections.length === 0 &&
          inquiries.length === 0 &&
          orders.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">
              {isEn ? 'No recent activity yet' : '暂无最近活动'}
            </div>
          )}
      </div>
    </div>
  )
}
