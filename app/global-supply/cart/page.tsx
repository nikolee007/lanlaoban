'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { productPlaceholderSVG } from '@/lib/product-placeholder'
import { useToast } from '../../contexts/ToastContext'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowLeft,
  FiAlertCircle,
  FiRefreshCw,
  FiSend,
  FiPackage,
  FiCheckCircle,
} from 'react-icons/fi'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CartProduct {
  id: number
  name: string
  priceMin: number | null
  priceMax: number | null
  currency: string
  images: string | null
  rating: number | null
  reviewCount: number | null
  supplier: {
    id: number
    nameZh: string
    nameEn: string
    location: string
    isVerified: boolean
  } | null
}

interface CartItem {
  id: number
  userId: number
  productId: number
  quantity: number
  notes: string | null
  createdAt: string
  updatedAt: string
  product: CartProduct
}

interface CartResponse {
  success: boolean
  data: CartItem[]
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function formatPrice(priceMin: number | null, priceMax: number | null): string {
  if (priceMin == null && priceMax == null) return '--'
  const min = priceMin ?? 0
  const max = priceMax ?? 0
  return `¥${min} - ¥${max}`
}

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
}

function CartSkeleton() {
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4">
              <SkeletonBlock className="h-20 w-20 shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-3/4" />
                <SkeletonBlock className="h-3 w-1/2" />
                <SkeletonBlock className="h-8 w-28" />
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

function EmptyCart() {
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
            <span className="truncate text-sm font-semibold text-gray-900">{t('cart.title', locale)}</span>
          </div>
        </header>
        <div className="mx-auto mt-28 max-w-md px-4 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #FFF5F0, #F0EBFF)' }}>
            <FiShoppingCart className="h-10 w-10" style={{ color: '#FF6034' }} />
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-800">{t('cart.empty', locale)}</h2>
          <p className="mb-8 text-sm leading-relaxed text-gray-500">
            {t('cart.emptyDesc', locale)}
          </p>
          <Link
            href="/global-supply"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500"
          >
            <FiPackage className="h-4 w-4" />
            {t('cart.browseProducts', locale)}
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

export default function CartPage() {
  const { locale } = useLocale()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [updatingQuantities, setUpdatingQuantities] = useState<Set<number>>(new Set())
  const { showToast } = useToast()

  /* ---- Fetch Cart ---- */
  const fetchCart = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('lanlaoban_token')
      if (!token) {
        setError('请先登录')
        setLoading(false)
        return
      }
      const res = await fetch('/api/global-supply/cart', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        if (res.status === 401) throw new Error('请先登录')
        throw new Error(`请求失败 (${res.status})`)
      }
      const json: CartResponse = await res.json()
      if (!json.success) throw new Error('获取采购清单失败')
      setItems(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  /* ---- Toggle Select ---- */
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)))
    }
  }

  /* ---- Update Quantity ---- */
  const updateQuantity = async (id: number, newQty: number) => {
    if (newQty < 1) return
    setUpdatingQuantities((prev) => new Set(prev).add(id))
    try {
      const token = localStorage.getItem('lanlaoban_token')
      const res = await fetch('/api/global-supply/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, quantity: newQty }),
      })
      if (!res.ok) throw new Error('更新失败')
      const json = await res.json()
      if (json.success) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, quantity: json.data.quantity } : item,
          ),
        )
      }
    } catch {
      // silently fail
    } finally {
      setUpdatingQuantities((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  /* ---- Delete Items ---- */
  const deleteSelected = async () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    try {
      const token = localStorage.getItem('lanlaoban_token')
      const res = await fetch('/api/global-supply/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ids }),
      })
      if (!res.ok) throw new Error('删除失败')
      const json = await res.json()
      if (json.success) {
        setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)))
        setSelectedIds(new Set())
      }
    } catch {
      // silently fail
    }
  }

  const deleteItem = async (id: number) => {
    setSelectedIds(new Set([id]))
    try {
      const token = localStorage.getItem('lanlaoban_token')
      const res = await fetch('/api/global-supply/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ids: [id] }),
      })
      if (!res.ok) throw new Error('删除失败')
      const json = await res.json()
      if (json.success) {
        setItems((prev) => prev.filter((item) => item.id !== id))
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    } catch {
      // silently fail
    }
  }

  /* ---- Compute Totals ---- */
  const subtotal = items
    .filter((item) => selectedIds.has(item.id))
    .reduce((sum, item) => sum + (item.product.priceMin ?? 0) * item.quantity, 0)

  if (loading) return <CartSkeleton />
  if (error) return <ErrorSection message={error} onRetry={fetchCart} />
  if (items.length === 0) return <EmptyCart />

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
        {/* ---- Header ---- */}
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <Link
                href="/global-supply"
                className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400"
              >
                <FiArrowLeft className="h-5 w-5" />
                {t('cart.return', locale)}
              </Link>
              <span className="truncate text-sm font-semibold text-gray-900">
                {t('cart.title', locale)}
              </span>
              <span className="text-xs text-gray-400">({t('cart.items', locale).replace('{count}', String(items.length))})</span>
            </div>
            {selectedIds.size > 0 && (
              <button
                onClick={deleteSelected}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <FiTrash2 className="h-4 w-4" />
                {t('cart.deleteSelected', locale).replace('{count}', String(selectedIds.size))}
              </button>
            )}
          </div>
        </header>

        {/* ---- Select All ---- */}
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-2">
          <label className="flex cursor-pointer items-center gap-3 card py-3 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={selectedIds.size === items.length && items.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-brand-400 focus:ring-brand-400"
            />
            {t('cart.selectAll', locale)}
            <span className="text-xs text-gray-400">
              {t('cart.selected', locale).replace('{count}', String(selectedIds.size))}
            </span>
          </label>
        </div>

        {/* ---- Cart Items ---- */}
        <div className="mx-auto max-w-3xl px-4 pb-4 space-y-3">
          {items.map((item) => {
            const images = safeJsonParse<string[]>(item.product.images, [])
            const imageSrc = images.length > 0
              ? images[0]
              : productPlaceholderSVG(item.product.name, 200, 200, item.product.id)
            const isSelected = selectedIds.has(item.id)
            const isUpdating = updatingQuantities.has(item.id)

            return (
              <div
                key={item.id}
                className={`card relative p-4 transition-all ${
                  isSelected ? 'ring-2 ring-brand-400' : ''
                }`}
              >
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <div className="flex items-start pt-5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-400 focus:ring-brand-400"
                    />
                  </div>

                  {/* Image */}
                  <Link
                    href={`/global-supply/${item.productId}`}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="min-w-0">
                      <Link
                        href={`/global-supply/${item.productId}`}
                        className="line-clamp-1 text-sm font-semibold text-gray-800 transition-colors hover:text-brand-500"
                      >
                        {item.product.name}
                      </Link>
                      {item.product.supplier && (
                        <p className="mt-0.5 truncate text-xs text-gray-400">
                          {item.product.supplier.nameZh || item.product.supplier.nameEn}
                          {item.product.supplier.isVerified && (
                            <FiCheckCircle className="ml-1 inline h-3 w-3 text-green-500" />
                          )}
                        </p>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Price */}
                      <span className="text-sm font-bold text-brand-600">
                        {formatPrice(item.product.priceMin, item.product.priceMax)}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="减少数量"
                        >
                          <FiMinus className="h-3 w-3" />
                        </button>
                        <span className="flex h-8 min-w-[2.5rem] items-center justify-center rounded-lg bg-gray-50 text-sm font-semibold text-gray-700">
                          {isUpdating ? (
                            <FiRefreshCw className="h-3 w-3 animate-spin text-gray-400" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="增加数量"
                        >
                          <FiPlus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {item.notes ? t('cart.note', locale).replace('{note}', item.notes) : ''}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {t('cart.subtotal', locale).replace('{amount}', ((item.product.priceMin ?? 0) * item.quantity).toLocaleString())}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label={t('cart.delete', locale)}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ---- Bottom Action Bar ---- */}
        <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              {t('cart.selected', locale).replace('{count}', String(selectedIds.size))}
              {selectedIds.size > 0 && (
                <span className="ml-2 text-xs text-gray-400">
                  {t('cart.estimatedSubtotal', locale).replace('{amount}', subtotal.toLocaleString())}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={selectedIds.size === 0}
                onClick={() => {
                  if (selectedIds.size > 0) {
                    const ids = Array.from(selectedIds)
                    window.location.href = `/global-supply/checkout?selected=${ids.join(',')}`
                  }
                }}
                className="flex items-center gap-2 rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="生成采购单"
              >
                <FiSend className="h-4 w-4" />
                生成采购单
              </button>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
