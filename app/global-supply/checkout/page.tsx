'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { productPlaceholderSVG } from '@/lib/product-placeholder'
import { useToast } from '../../contexts/ToastContext'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import {
  FiArrowLeft,
  FiAlertCircle,
  FiRefreshCw,
  FiCheckCircle,
  FiShoppingCart,
  FiPackage,
  FiSend,
  FiFileText,
} from 'react-icons/fi'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CheckoutProduct {
  id: number
  name: string
  priceMin: number | null
  priceMax: number | null
  images: string | null
  supplierId: number
  supplierName: string
}

interface CheckoutItem {
  cartId: number
  productId: number
  productName: string
  price: number
  quantity: number
  images: string | null
  supplierId: number
  supplierName: string
}

interface SupplierGroup {
  supplierId: number
  supplierName: string
  items: CheckoutItem[]
  subtotal: number
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
}

function CheckoutSkeleton() {
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
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-4">
              <SkeletonBlock className="mb-3 h-4 w-1/3" />
              <div className="flex gap-4">
                <SkeletonBlock className="h-16 w-16 shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-3/4" />
                  <SkeletonBlock className="h-3 w-1/2" />
                </div>
              </div>
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

function EmptyCheckout() {
  const { locale } = useLocale()
  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-20">
        <header className="border-b border-gray-100 bg-white/80">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <Link
              href="/global-supply/cart"
              className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400"
            >
              <FiArrowLeft className="h-5 w-5" />
              {t('cart.return', locale)}
            </Link>
            <span className="truncate text-sm font-semibold text-gray-900">生成采购单</span>
          </div>
        </header>
        <div className="mx-auto mt-28 max-w-md px-4 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <FiShoppingCart className="h-10 w-10 text-gray-300" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-800">未选择商品</h2>
          <p className="mb-8 text-sm leading-relaxed text-gray-500">请先在采购清单中选择要下单的商品</p>
          <Link
            href="/global-supply/cart"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500"
          >
            <FiPackage className="h-4 w-4" />
            返回采购清单
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
              href="/global-supply/cart"
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
          <h2 className="mb-2 text-lg font-bold text-gray-800">加载失败</h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">{message}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500"
          >
            <FiRefreshCw className="h-4 w-4" />
            重新加载
          </button>
        </div>
      </main>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function CheckoutPage() {
  const { locale } = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [groups, setGroups] = useState<SupplierGroup[]>([])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('lanlaoban_token')
      if (!token) {
        setError('请先登录')
        setLoading(false)
        return
      }

      // 获取采购清单
      const res = await fetch('/api/global-supply/cart', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        if (res.status === 401) throw new Error('请先登录')
        throw new Error(`请求失败 (${res.status})`)
      }
      const json = await res.json()
      if (!json.success) throw new Error('获取采购清单失败')

      const cartItems: Array<{
        id: number
        productId: number
        quantity: number
        product: {
          id: number
          name: string
          priceMin: number | null
          priceMax: number | null
          images: string | null
          supplier: { id: number; nameZh: string; nameEn: string } | null
        }
      }> = json.data

      // 获取 URL 参数中的选中项 / 全部选中
      const selectedIds = searchParams.get('selected')
        ? searchParams.get('selected')!.split(',').map(Number)
        : cartItems.map((i) => i.id)

      const selectedItems = cartItems.filter((item) => selectedIds.includes(item.id))

      if (selectedItems.length === 0) {
        setGroups([])
        setLoading(false)
        return
      }

      // 按供应商分组
      const groupMap = new Map<number, SupplierGroup>()
      for (const item of selectedItems) {
        const supplier = item.product.supplier
        if (!supplier) continue
        const supplierId = supplier.id
        const supplierName = supplier.nameZh || supplier.nameEn
        if (!groupMap.has(supplierId)) {
          groupMap.set(supplierId, { supplierId, supplierName, items: [], subtotal: 0 })
        }
        const checkoutItem: CheckoutItem = {
          cartId: item.id,
          productId: item.productId,
          productName: item.product.name,
          price: item.product.priceMin ?? 0,
          quantity: item.quantity,
          images: item.product.images,
          supplierId,
          supplierName,
        }
        groupMap.get(supplierId)!.items.push(checkoutItem)
        groupMap.get(supplierId)!.subtotal += checkoutItem.price * checkoutItem.quantity
      }

      setGroups(Array.from(groupMap.values()))
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const totalAmount = groups.reduce((sum, g) => sum + g.subtotal, 0)
  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0)

  const handleSubmit = async () => {
    if (submitting || groups.length === 0) return
    setSubmitting(true)
    try {
      const token = localStorage.getItem('lanlaoban_token')
      if (!token) throw new Error('请先登录')

      // 组装所有商品项
      const items = groups.flatMap((g) =>
        g.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          supplierId: g.supplierId,
        })),
      )

      const res = await fetch('/api/global-supply/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items, notes: notes || undefined }),
      })

      const json = await res.json()
      if (!json.success) throw new Error(json.error || '创建采购单失败')

      const orderId = Array.isArray(json.data) ? json.data[0].id : json.data.id
      showToast?.('采购单已成功创建', 'success')
      router.push(`/global-supply/orders/${orderId}`)
    } catch (err) {
      showToast?.(err instanceof Error ? err.message : '创建采购单失败', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <CheckoutSkeleton />
  if (error) return <ErrorSection message={error} onRetry={fetchItems} />
  if (groups.length === 0) return <EmptyCheckout />

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-28 animate-fade-in">
        {/* Header */}
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <Link
              href="/global-supply/cart"
              className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400"
            >
              <FiArrowLeft className="h-5 w-5" />
              返回清单
            </Link>
            <span className="truncate text-sm font-semibold text-gray-900">确认采购单</span>
            <span className="text-xs text-gray-400">({totalItems} 种商品)</span>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
          {/* Supplier Groups */}
          {groups.map((group) => (
            <div key={group.supplierId} className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <FiPackage className="h-4 w-4 text-brand-400" />
                  <span className="text-sm font-semibold text-gray-800">{group.supplierName}</span>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {group.items.map((item) => {
                  const images = safeJsonParse<string[]>(item.images, [])
                  const imageSrc = images.length > 0
                    ? images[0]
                    : productPlaceholderSVG(item.productName, 200, 200, item.productId)

                  return (
                    <div key={item.cartId} className="flex items-center gap-3 px-4 py-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageSrc}
                        alt={item.productName}
                        className="h-14 w-14 shrink-0 rounded-lg bg-gray-100 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">{item.productName}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-gray-400">x{item.quantity}</span>
                          <span className="text-sm font-semibold text-gray-800">¥{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-50 px-4 py-2.5 text-right">
                <span className="text-xs text-gray-400">小计: </span>
                <span className="text-sm font-bold text-brand-600">¥{group.subtotal.toLocaleString()}</span>
              </div>
            </div>
          ))}

          {/* Notes */}
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <label htmlFor="order-notes" className="mb-2 block text-sm font-medium text-gray-700">
              备注
            </label>
            <textarea
              id="order-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="如有特殊要求请在此备注..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 transition-colors focus:border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-300"
            />
          </div>
        </div>

        {/* Bottom Action Bar */}
        <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div>
              <span className="text-sm text-gray-500">共 {totalItems} 种商品 / </span>
              <span className="text-base font-bold text-brand-600">¥{totalAmount.toLocaleString()}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-brand-400 px-8 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <FiFileText className="h-4 w-4" />
                  提交采购单
                </>
              )}
            </button>
          </div>
        </footer>
      </main>
    </>
  )
}
