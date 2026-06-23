'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { FiTrash2, FiArrowLeft } from 'react-icons/fi'
import { useToast } from '../../contexts/ToastContext'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import CartItemCard from '../components/CartItemCard'
import type { CartItemData } from '../components/CartItemCard'
import CartTotals from '../components/CartTotals'
import CartSkeleton from '../components/CartSkeleton'
import EmptyCartView from '../components/EmptyCartView'
import CartErrorSection from '../components/CartErrorSection'


/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function CartPage() {
  const { locale } = useLocale()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<CartItemData[]>([])
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
      const json = await res.json()
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
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
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
  if (error) return <CartErrorSection message={error} onRetry={fetchCart} />
  if (items.length === 0) return <EmptyCartView />

  return (
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
        {items.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            isSelected={selectedIds.has(item.id)}
            isUpdating={updatingQuantities.has(item.id)}
            onToggleSelect={toggleSelect}
            onUpdateQuantity={updateQuantity}
            onDelete={deleteItem}
            locale={locale}
          />
        ))}
      </div>

      {/* ---- Bottom Action Bar ---- */}
      <CartTotals
        selectedCount={selectedIds.size}
        selectedIds={Array.from(selectedIds)}
        subtotal={subtotal}
        locale={locale}
      />
    </main>
  )
}
