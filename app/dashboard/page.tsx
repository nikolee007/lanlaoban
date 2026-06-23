'use client'

import { useState, useEffect } from 'react'
import {
  FiInbox, FiHeart, FiShoppingCart, FiCalendar,
  FiPackage, FiMessageSquare,
} from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import NavHeader from '@/app/components/NavHeader'
import StatsGrid from './components/StatsGrid'
import ActivityFeed from './components/ActivityFeed'
import QuickActionsPanel from './components/QuickActionsPanel'
import DashboardSkeleton from './components/DashboardSkeleton'
import UnauthenticatedState from './components/UnauthenticatedState'

/* ─── Types ──────────────────────────────────────── */

interface UserProfile {
  id: number
  email: string
  name: string
  avatar: string
  company: string
  phone: string
  createdAt?: string
}

interface DashboardData {
  inquiryCount: number
  collectionCount: number
  orderCount: number
  activeDays: number
  recentCollections: Array<{ id: number; name: string; time: string }>
  recentInquiries: Array<{ id: number; title: string; time: string }>
  recentOrders: Array<{ id: number; title: string; time: string; status: string }>
}

/* ─── Helpers ────────────────────────────────────── */

function calculateActiveDays(createdAt: string): number {
  try {
    const created = new Date(createdAt)
    const now = new Date()
    const diff = now.getTime() - created.getTime()
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)))
  } catch {
    return 1
  }
}

function safeArray(raw: unknown): unknown[] {
  return Array.isArray(raw) ? raw : []
}

function safeString(val: unknown, fallback = ''): string {
  return typeof val === 'string' ? val : fallback
}

function safeNumber(val: unknown, fallback = 0): number {
  return typeof val === 'number' ? val : fallback
}

function formatTime(timeStr: string, locale: string): string {
  if (!timeStr) return ''
  try {
    const date = new Date(timeStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return locale === 'en' ? 'Just now' : '刚刚'
    if (diffMins < 60)
      return locale === 'en' ? `${diffMins} min ago` : `${diffMins} 分钟前`
    if (diffHours < 24)
      return locale === 'en' ? `${diffHours} h ago` : `${diffHours} 小时前`
    if (diffDays < 30)
      return locale === 'en' ? `${diffDays} d ago` : `${diffDays} 天前`
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')
  } catch {
    return timeStr
  }
}


/* ═══════════════════════════════════════════════════
   Dashboard Page
   ═══════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { locale } = useLocale()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [data, setData] = useState<DashboardData>({
    inquiryCount: 0,
    collectionCount: 0,
    orderCount: 0,
    activeDays: 0,
    recentCollections: [],
    recentInquiries: [],
    recentOrders: [],
  })

  useEffect(() => {
    const token = localStorage.getItem('lanlaoban_token')
    if (!token) {
      setAuthenticated(false)
      setLoading(false)
      return
    }

    fetch('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((profileRes) => {
        if (!profileRes.success || !profileRes.data) {
          setAuthenticated(false)
          setLoading(false)
          return
        }

        const profile = profileRes.data as UserProfile
        setUser(profile)
        setAuthenticated(true)

        const activeDays = profile.createdAt
          ? calculateActiveDays(profile.createdAt)
          : 1

        const headers = { Authorization: `Bearer ${token}` }

        Promise.all([
          fetch('/api/global-supply/inquiries', { headers }).then((r) =>
            r.json().catch(() => ({ success: false, data: [] })),
          ),
          fetch('/api/global-supply/collections', { headers }).then((r) =>
            r.json().catch(() => ({ success: false, data: [] })),
          ),
          fetch('/api/global-supply/orders/my', { headers }).then((r) =>
            r.json().catch(() => ({ success: false, data: [] })),
          ),
        ])
          .then(
            ([inquiriesRes, collectionsRes, ordersRes]: Record<string, unknown>[]) => {
              const inquiriesItems = safeArray(
                ((inquiriesRes?.data as Record<string, unknown>)?.items as unknown[]) ??
                  (inquiriesRes?.data as unknown[]) ??
                  [],
              )
              const collectionsItems = safeArray(
                ((collectionsRes?.data as Record<string, unknown>)?.items as unknown[]) ??
                  (collectionsRes?.data as unknown[]) ??
                  [],
              )
              const ordersItems = safeArray(
                ((ordersRes?.data as Record<string, unknown>)?.items as unknown[]) ??
                  (ordersRes?.data as unknown[]) ??
                  [],
              )

              const recentCollections = collectionsItems.slice(0, 3).map((item: unknown) => {
                const c = item as Record<string, unknown>
                return { id: safeNumber(c.id), name: safeString(c.name || c.productName), time: safeString(c.createdAt || c.updatedAt || '') }
              })
              const recentInquiries = inquiriesItems.slice(0, 3).map((item: unknown) => {
                const c = item as Record<string, unknown>
                return { id: safeNumber(c.id), title: safeString(c.title || c.productName || c.name), time: safeString(c.createdAt || c.updatedAt || '') }
              })
              const recentOrders = ordersItems.slice(0, 3).map((item: unknown) => {
                const c = item as Record<string, unknown>
                return { id: safeNumber(c.id), title: safeString(c.title || c.productName || c.name), time: safeString(c.createdAt || c.updatedAt || ''), status: safeString(c.status || '') }
              })

              setData({
                inquiryCount: inquiriesItems.length,
                collectionCount: collectionsItems.length,
                orderCount: ordersItems.length,
                activeDays,
                recentCollections,
                recentInquiries,
                recentOrders,
              })
              setLoading(false)
            },
          )
          .catch(() => { setLoading(false) })
      })
      .catch(() => {
        setAuthenticated(false)
        setLoading(false)
      })
  }, [])

  if (loading) return <DashboardSkeleton />
  if (!authenticated) return <UnauthenticatedState />

  const isEn = locale === 'en'

  const statCards = [
    { icon: FiInbox, label: isEn ? 'My Inquiries' : '我的询盘', value: data.inquiryCount, color: 'bg-blue-50 text-blue-600', href: '/global-supply/inquiries' },
    { icon: FiHeart, label: isEn ? 'My Collections' : '我的收藏', value: data.collectionCount, color: 'bg-pink-50 text-pink-600' },
    { icon: FiShoppingCart, label: isEn ? 'My Orders' : '我的采购单', value: data.orderCount, color: 'bg-green-50 text-green-600', href: '/global-supply/cart' },
    { icon: FiCalendar, label: isEn ? 'Active Days' : '活跃天数', value: data.activeDays, color: 'bg-amber-50 text-amber-600' },
  ]

  const quickLinks = [
    { icon: FiPackage, label: isEn ? 'Browse Products' : '去选品', desc: isEn ? 'Explore global supply chain' : '探索全球供应链商品', href: '/global-supply' },
    { icon: FiShoppingCart, label: isEn ? 'My Cart' : '我的采购清单', desc: isEn ? 'View your purchase list' : '查看已加入的商品清单', href: '/global-supply/cart' },
    { icon: FiMessageSquare, label: isEn ? 'My Inquiries' : '我的询盘', desc: isEn ? 'Check inquiry responses' : '查看供应商回复情况', href: '/global-supply/inquiries' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {isEn ? 'My Dashboard' : '我的数据看板'}
          </h1>
          {user && (
            <p className="mt-1 text-sm text-gray-500">
              {isEn
                ? `Welcome back, ${user.name || user.email}`
                : `${user.name || user.email}，欢迎回来`}
            </p>
          )}
        </div>

        {/* Stat cards */}
        <StatsGrid cards={statCards} />

        {/* Recent Activity + Quick Links */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ActivityFeed
            collections={data.recentCollections}
            inquiries={data.recentInquiries}
            orders={data.recentOrders}
            formatTime={(t) => formatTime(t, locale)}
            locale={locale}
          />
          <QuickActionsPanel links={quickLinks} locale={locale} />
        </div>
      </div>
    </div>
  )
}
