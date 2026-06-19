'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { productPlaceholderSVG } from '@/lib/product-placeholder'
import { useToast } from '../../../contexts/ToastContext'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import {
  FiArrowLeft,
  FiAlertCircle,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
  FiTruck,
  FiClock,
  FiCheck,
  FiPhone,
  FiFileText,
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

interface OrderDetail {
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

/* ------------------------------------------------------------------ */
/*  Status Helpers                                                     */
/* ------------------------------------------------------------------ */

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: '待确认', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: <FiClock className="h-5 w-5" /> },
  confirmed: { label: '已确认', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: <FiCheckCircle className="h-5 w-5" /> },
  shipped: { label: '已发货', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', icon: <FiTruck className="h-5 w-5" /> },
  completed: { label: '已完成', color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: <FiCheckCircle className="h-5 w-5" /> },
  cancelled: { label: '已取消', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', icon: <FiXCircle className="h-5 w-5" /> },
}

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'completed'] as const

function getStatusStep(status: string): number {
  const idx = STATUS_FLOW.indexOf(status as typeof STATUS_FLOW[number])
  return idx >= 0 ? idx : -1
}

function getStatusAction(status: string): { label: string; targetStatus: string; color: string } | null {
  if (status === 'pending') {
    return { label: '取消订单', targetStatus: 'cancelled', color: 'border-red-200 text-red-600 hover:bg-red-50' }
  }
  if (status === 'shipped') {
    return { label: '确认收货', targetStatus: 'completed', color: 'bg-brand-400 text-white hover:bg-brand-500' }
  }
  return null
}

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
}

function DetailSkeleton() {
  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-20">
        <header className="border-b border-gray-100 bg-white/80">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <SkeletonBlock className="h-5 w-20" />
            <SkeletonBlock className="h-5 w-24" />
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-32 w-full" />
          <SkeletonBlock className="h-20 w-full" />
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
              href="/global-supply/orders"
              className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400"
            >
              <FiArrowLeft className="h-5 w-5" />
              返回订单列表
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

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { locale } = useLocale()
  const router = useRouter()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchOrder = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('lanlaoban_token')
      if (!token) {
        setError('请先登录')
        setLoading(false)
        return
      }

      const res = await fetch(`/api/global-supply/orders/${resolvedParams.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        if (res.status === 401) throw new Error('请先登录')
        if (res.status === 404) throw new Error('订单不存在')
        throw new Error(`请求失败 (${res.status})`)
      }
      const json = await res.json()
      if (!json.success) throw new Error(json.error || '获取订单详情失败')
      setOrder(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const handleStatusUpdate = async (targetStatus: string) => {
    if (actionLoading || !order) return
    setActionLoading(true)
    try {
      const token = localStorage.getItem('lanlaoban_token')
      const res = await fetch(`/api/global-supply/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: targetStatus }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || '操作失败')
      showToast?.('操作成功', 'success')
      fetchOrder()
    } catch (err) {
      showToast?.(err instanceof Error ? err.message : '操作失败', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const y = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${month}-${day} ${hour}:${min}`
  }

  const safeJsonParse = <T,>(raw: string | null | undefined, fallback: T): T => {
    if (!raw) return fallback
    try { return JSON.parse(raw) as T } catch { return fallback }
  }

  if (loading) return <DetailSkeleton />
  if (error) return <ErrorSection message={error} onRetry={fetchOrder} />
  if (!order) return <ErrorSection message="订单不存在" onRetry={fetchOrder} />

  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending
  const action = getStatusAction(order.status)
  const currentStep = getStatusStep(order.status)
  const isCancelled = order.status === 'cancelled'
  const isCompleted = order.status === 'completed'

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
        {/* Header */}
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <Link
              href="/global-supply/orders"
              className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400"
            >
              <FiArrowLeft className="h-5 w-5" />
              返回
            </Link>
            <span className="truncate text-sm font-semibold text-gray-900">订单详情</span>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
          {/* Status Banner */}
          <div className={`flex items-center gap-3 rounded-xl border p-4 ${statusInfo.bg}`}>
            <div className={`${statusInfo.color}`}>
              {statusInfo.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-base font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
              <p className="mt-0.5 text-sm text-gray-500">
                {order.orderNo}
              </p>
            </div>
            {action && (
              <button
                onClick={() => handleStatusUpdate(action.targetStatus)}
                disabled={actionLoading}
                className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${action.color} disabled:opacity-50`}
              >
                {actionLoading ? '处理中...' : action.label}
              </button>
            )}
          </div>

          {/* Status Timeline */}
          {!isCancelled && (
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">订单状态</h3>
              <div className="flex items-center justify-between">
                {STATUS_FLOW.map((s, idx) => {
                  const flowStatus = STATUS_MAP[s]
                  const isActive = idx <= currentStep
                  const isCurrent = idx === currentStep
                  const isPast = idx < currentStep
                  return (
                    <div key={s} className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                          isActive
                            ? isPast
                              ? 'border-green-400 bg-green-50 text-green-500'
                              : 'border-brand-400 bg-brand-50 text-brand-500'
                            : 'border-gray-200 bg-white text-gray-300'
                        }`}
                      >
                        {isPast ? (
                          <FiCheck className="h-4 w-4" />
                        ) : (
                          <span className={`text-xs font-bold ${isCurrent ? 'text-brand-500' : 'text-gray-300'}`}>
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <span className={`mt-1.5 text-xs whitespace-nowrap ${isCurrent ? 'font-semibold text-brand-600' : isPast ? 'text-green-500' : 'text-gray-400'}`}>
                        {flowStatus.label}
                      </span>
                    </div>
                  )
                })}
              </div>
              {/* Connecting lines */}
              <div className="relative mx-2 -mt-6 flex justify-between">
                {STATUS_FLOW.slice(0, -1).map((_, idx) => {
                  const isActive = idx < currentStep
                  return (
                    <div
                      key={idx}
                      className="h-0.5"
                      style={{
                        width: `${100 / (STATUS_FLOW.length - 1)}%`,
                        backgroundColor: isActive ? '#22C55E' : '#E5E7EB',
                      }}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Time Info */}
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">创建时间</span>
                <p className="mt-0.5 font-medium text-gray-800">{formatTime(order.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-400">更新时间</span>
                <p className="mt-0.5 font-medium text-gray-800">{formatTime(order.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">供应商信息</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                <FiPackage className="h-5 w-5 text-brand-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800">{order.supplierName}</p>
                {order.supplierPhone && (
                  <a
                    href={`tel:${order.supplierPhone}`}
                    className="mt-0.5 inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-600"
                  >
                    <FiPhone className="h-3.5 w-3.5" />
                    {order.supplierPhone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-50 px-4 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                商品清单 ({order.itemCount} 种)
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item) => {
                const imageSrc = productPlaceholderSVG(item.productName, 200, 200, item.productId)
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc}
                      alt={item.productName}
                      className="h-14 w-14 shrink-0 rounded-lg bg-gray-100 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">{item.productName}</p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        ¥{item.price} x {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-gray-800">
                      ¥{item.subtotal.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="border-t border-gray-50 px-4 py-3">
                <div className="flex gap-2">
                  <FiFileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <p className="text-sm text-gray-500">{order.notes}</p>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">合计</span>
              <span className="text-lg font-bold text-brand-600">¥{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
