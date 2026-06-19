'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '../../contexts/ToastContext'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import {
  FiArrowLeft,
  FiAlertCircle,
  FiChevronRight,
  FiRefreshCw,
  FiPackage,
  FiShoppingBag,
} from 'react-icons/fi'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OrderItem {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
  subtotal: number
}

interface Order {
  id: number
  orderNo: string
  status: string
  supplierId: number
  supplierName: string
  supplierPhone: string | null
  totalAmount: number
  itemCount: number
  notes: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

interface OrdersResponse {
  success: boolean
  data: Order[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/* ------------------------------------------------------------------ */
/*  Status Helpers                                                     */
/* ------------------------------------------------------------------ */

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待确认', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  confirmed: { label: '已确认', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  shipped: { label: '已发货', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  completed: { label: '已完成', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  cancelled: { label: '已取消', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
}

const STATUS_TABS = [
  { key: '', label: '全部' },
  { key: 'pending', label: '待确认' },
  { key: 'confirmed', label: '已确认' },
  { key: 'shipped', label: '已发货' },
  { key: 'completed', label: '已完成' },
]

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
}

function OrdersSkeleton() {
  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-20">
        <header className="border-b border-gray-100 bg-white/80">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <SkeletonBlock className="h-5 w-20" />
            <SkeletonBlock className="h-5 w-24" />
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-4">
              <SkeletonBlock className="mb-2 h-4 w-1/2" />
              <SkeletonBlock className="mb-2 h-3 w-1/3" />
              <SkeletonBlock className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      </main>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyOrders({ statusFilter }: { statusFilter: string }) {
  const { locale } = useLocale()
  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-20">
        <header className="border-b border-gray-100 bg-white/80">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <Link
              href="/global-supply"
              className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400"
            >
              <FiArrowLeft className="h-5 w-5" />
              {t('cart.return', locale)}
            </Link>
            <span className="truncate text-sm font-semibold text-gray-900">我的订单</span>
          </div>
        </header>
        <div className="mx-auto mt-28 max-w-md px-4 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <FiShoppingBag className="h-10 w-10 text-gray-300" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-800">
            {statusFilter ? `暂无${STATUS_MAP[statusFilter]?.label || ''}订单` : '暂无订单'}
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-gray-500">
            去全球资源选购商品，加入采购清单后生成采购单
          </p>
          <Link
            href="/global-supply"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500"
          >
            <FiPackage className="h-4 w-4" />
            去选购商品
          </Link>
        </div>
      </main>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Error State                                                        */
/* ------------------------------------------------------------------ */

function ErrorSection({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { locale } = useLocale()
  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-20">
        <header className="border-b border-gray-100 bg-white/80">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <Link
              href="/global-supply"
              className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400"
            >
              <FiArrowLeft className="h-5 w-5" />
              {t('cart.return', locale)}
            </Link>
          </div>
        </header>
        <div className="mx-auto mt-20 max-w-md px-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <FiAlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-800">{t('common.loadFailed', locale)}</h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">{message}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500"
          >
            <FiRefreshCw className="h-4 w-4" />
            {t('common.reload', locale)}
          </button>
        </div>
      </main>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function OrdersPage() {
  const { locale } = useLocale()
  const router = useRouter()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
  const [statusFilter, setStatusFilter] = useState('')

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('lanlaoban_token')
      if (!token) {
        setError('请先登录')
        setLoading(false)
        return
      }

      let url = `/api/global-supply/orders/my?page=${page}&pageSize=20`
      if (statusFilter) {
        url += `&status=${statusFilter}`
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        if (res.status === 401) throw new Error('请先登录')
        throw new Error(`请求失败 (${res.status})`)
      }
      const json: OrdersResponse = await res.json()
      if (!json.success) throw new Error('获取订单列表失败')

      setOrders(json.data)
      setPagination(json.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchOrders(1)
  }, [fetchOrders])

  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hour}:${min}`
  }

  if (error && orders.length === 0) {
    return <ErrorSection message={error} onRetry={() => fetchOrders(1)} />
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
        {/* Header */}
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <Link
              href="/global-supply"
              className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400"
            >
              <FiArrowLeft className="h-5 w-5" />
              {t('cart.return', locale)}
            </Link>
            <span className="truncate text-sm font-semibold text-gray-900">我的订单</span>
            {!loading && (
              <span className="text-xs text-gray-400">({pagination.total})</span>
            )}
          </div>
        </header>

        {/* Status Tabs */}
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-3xl px-4">
            <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleStatusChange(tab.key)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === tab.key
                      ? 'bg-brand-400 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && orders.length === 0 && <OrdersSkeleton />}

        {/* Empty State */}
        {!loading && orders.length === 0 && <EmptyOrders statusFilter={statusFilter} />}

        {/* Order List */}
        {orders.length > 0 && (
          <div className="mx-auto max-w-3xl px-4 py-4 space-y-3">
            {orders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending
              return (
                <Link
                  key={order.id}
                  href={`/global-supply/orders/${order.id}`}
                  className="block rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-brand-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{order.orderNo}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{order.supplierName}</p>
                    </div>
                    <span className={`shrink-0 ml-2 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{order.itemCount} 种商品</span>
                    <span>{formatTime(order.createdAt)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-base font-bold text-brand-600">¥{order.totalAmount.toLocaleString()}</span>
                    <FiChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </Link>
              )
            })}

            {/* Load More */}
            {pagination.page < pagination.totalPages && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => fetchOrders(pagination.page + 1)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="h-4 w-4 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    '加载更多'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  )
}
