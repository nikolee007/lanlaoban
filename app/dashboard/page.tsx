'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FiInbox,
  FiStar,
  FiShoppingCart,
  FiCalendar,
  FiArrowRight,
  FiRefreshCw,
  FiPackage,
  FiMessageSquare,
  FiHeart,
  FiClock,
  FiLogIn,
  FiUser,
} from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import NavHeader from '@/app/components/NavHeader'

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

/* ─── Skeleton ───────────────────────────────────── */

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Title skeleton */}
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-200" />

        {/* Stat cards skeleton */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-100 bg-white p-5"
            >
              <div className="mb-3 h-8 w-8 rounded-lg bg-gray-200" />
              <div className="mb-1 h-7 w-16 rounded bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Activity skeleton */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="mb-4 h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Unauthenticated State ──────────────────────── */

function UnauthenticatedState() {
  const { locale } = useLocale()
  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
          <FiUser className="h-8 w-8 text-brand-400" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          {locale === 'en' ? 'Please Log In' : '请先登录'}
        </h2>
        <p className="mb-8 text-sm text-gray-500">
          {locale === 'en'
            ? 'Log in to view your data dashboard'
            : '登录后可查看您的数据看板'}
        </p>
        <Link
          href="/login"
          className="btn-primary inline-flex items-center gap-2 px-8 py-3"
        >
          <FiLogIn className="h-4 w-4" />
          {locale === 'en' ? 'Log In' : '立即登录'}
        </Link>
      </div>
    </div>
  )
}

/* ─── Stat Card ──────────────────────────────────── */

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  color: string
  href?: string
}

function StatCard({ icon: Icon, label, value, color, href }: StatCardProps) {
  const CardContent = () => (
    <div
      className={`card transition-all hover:shadow-apple-md ${href ? 'cursor-pointer' : ''}`}
    >
      <div className={`mb-3 inline-flex rounded-lg p-2.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-extrabold bg-gradient-to-r from-brand-400 to-purple-500 bg-clip-text text-transparent">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="mt-0.5 text-sm text-gray-500">{label}</div>
    </div>
  )

  if (href) {
    return (
      <Link href={href}>
        <CardContent />
      </Link>
    )
  }
  return <CardContent />
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

        // Calculate active days from registration
        const activeDays = profile.createdAt
          ? calculateActiveDays(profile.createdAt)
          : 1

        // Fetch all dashboards data in parallel
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
            ([
              inquiriesRes,
              collectionsRes,
              ordersRes,
            ]: Record<string, unknown>[]) => {
              // Process inquiries
              const inquiriesData = inquiriesRes?.data as
                | Record<string, unknown>
                | undefined
              const inquiriesItems = safeArray(
                (inquiriesData?.items as unknown[]) ??
                  (inquiriesRes?.data as unknown[]) ??
                  [],
              )
              const inquiryCount = inquiriesItems.length

              // Process collections
              const collectionsData = collectionsRes?.data as
                | Record<string, unknown>
                | undefined
              const collectionsItems = safeArray(
                (collectionsData?.items as unknown[]) ??
                  (collectionsRes?.data as unknown[]) ??
                  [],
              )
              const collectionCount = collectionsItems.length

              // Process orders
              const ordersData = ordersRes?.data as
                | Record<string, unknown>
                | undefined
              const ordersItems = safeArray(
                (ordersData?.items as unknown[]) ??
                  (ordersRes?.data as unknown[]) ??
                  [],
              )
              const orderCount = ordersItems.length

              // Recent collections (last 3)
              const recentCollections = collectionsItems
                .slice(0, 3)
                .map((item: unknown) => {
                  const c = item as Record<string, unknown>
                  return {
                    id: safeNumber(c.id),
                    name: safeString(c.name || c.productName),
                    time: safeString(c.createdAt || c.updatedAt || ''),
                  }
                })

              // Recent inquiries (last 3)
              const recentInquiries = inquiriesItems
                .slice(0, 3)
                .map((item: unknown) => {
                  const c = item as Record<string, unknown>
                  return {
                    id: safeNumber(c.id),
                    title: safeString(c.title || c.productName || c.name),
                    time: safeString(c.createdAt || c.updatedAt || ''),
                  }
                })

              // Recent orders (last 3)
              const recentOrders = ordersItems.slice(0, 3).map((item: unknown) => {
                const c = item as Record<string, unknown>
                return {
                  id: safeNumber(c.id),
                  title: safeString(c.title || c.productName || c.name),
                  time: safeString(c.createdAt || c.updatedAt || ''),
                  status: safeString(c.status || ''),
                }
              })

              setData({
                inquiryCount,
                collectionCount,
                orderCount,
                activeDays,
                recentCollections,
                recentInquiries,
                recentOrders,
              })
              setLoading(false)
            },
          )
          .catch(() => {
            setLoading(false)
          })
      })
      .catch(() => {
        setAuthenticated(false)
        setLoading(false)
      })
  }, [])

  /* ── Loading ────────────────────────────────── */
  if (loading) return <DashboardSkeleton />

  /* ── Unauthenticated ────────────────────────── */
  if (!authenticated) return <UnauthenticatedState />

  /* ── Main Content ───────────────────────────── */

  const statCards: StatCardProps[] = [
    {
      icon: FiInbox,
      label: locale === 'en' ? 'My Inquiries' : '我的询盘',
      value: data.inquiryCount,
      color: 'bg-blue-50 text-blue-600',
      href: '/global-supply/inquiries',
    },
    {
      icon: FiHeart,
      label: locale === 'en' ? 'My Collections' : '我的收藏',
      value: data.collectionCount,
      color: 'bg-pink-50 text-pink-600',
    },
    {
      icon: FiShoppingCart,
      label: locale === 'en' ? 'My Orders' : '我的采购单',
      value: data.orderCount,
      color: 'bg-green-50 text-green-600',
      href: '/global-supply/cart',
    },
    {
      icon: FiCalendar,
      label: locale === 'en' ? 'Active Days' : '活跃天数',
      value: data.activeDays,
      color: 'bg-amber-50 text-amber-600',
    },
  ]

  const quickLinks = [
    {
      icon: FiPackage,
      label: locale === 'en' ? 'Browse Products' : '去选品',
      desc:
        locale === 'en'
          ? 'Explore global supply chain'
          : '探索全球供应链商品',
      href: '/global-supply',
    },
    {
      icon: FiShoppingCart,
      label: locale === 'en' ? 'My Cart' : '我的采购清单',
      desc:
        locale === 'en'
          ? 'View your purchase list'
          : '查看已加入的商品清单',
      href: '/global-supply/cart',
    },
    {
      icon: FiMessageSquare,
      label: locale === 'en' ? 'My Inquiries' : '我的询盘',
      desc:
        locale === 'en'
          ? 'Check inquiry responses'
          : '查看供应商回复情况',
      href: '/global-supply/inquiries',
    },
  ]

  const formatTime = (timeStr: string): string => {
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
      return date.toLocaleDateString(
        locale === 'zh' ? 'zh-CN' : 'en-US',
      )
    } catch {
      return timeStr
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {locale === 'en' ? 'My Dashboard' : '我的数据看板'}
          </h1>
          {user && (
            <p className="mt-1 text-sm text-gray-500">
              {locale === 'en'
                ? `Welcome back, ${user.name || user.email}`
                : `${user.name || user.email}，欢迎回来`}
            </p>
          )}
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Recent Activity + Quick Links */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="card lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
              <FiClock className="h-4 w-4 text-brand-400" />
              {locale === 'en' ? 'Recent Activity' : '最近活动'}
            </h2>

            <div className="space-y-4">
              {/* Recent collections */}
              {data.recentCollections.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <FiHeart className="h-3 w-3" />
                    {locale === 'en' ? 'Collections' : '收藏的商品'}
                  </h3>
                  {data.recentCollections.map((item) => (
                    <div
                      key={`col-${item.id}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700">
                        {item.name}
                      </span>
                      <span className="shrink-0 text-xs text-gray-400">
                        {formatTime(item.time)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent inquiries */}
              {data.recentInquiries.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <FiMessageSquare className="h-3 w-3" />
                    {locale === 'en' ? 'Inquiries' : '最近的询盘'}
                  </h3>
                  {data.recentInquiries.map((item) => (
                    <div
                      key={`inq-${item.id}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700">
                        {item.title}
                      </span>
                      <span className="shrink-0 text-xs text-gray-400">
                        {formatTime(item.time)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent orders */}
              {data.recentOrders.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <FiShoppingCart className="h-3 w-3" />
                    {locale === 'en' ? 'Orders' : '最近的订单'}
                  </h3>
                  {data.recentOrders.map((item) => (
                    <div
                      key={`ord-${item.id}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                          {item.title}
                        </span>
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
              {data.recentCollections.length === 0 &&
                data.recentInquiries.length === 0 &&
                data.recentOrders.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-400">
                    {locale === 'en'
                      ? 'No recent activity yet'
                      : '暂无最近活动'}
                  </div>
                )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
              <FiStar className="h-4 w-4 text-brand-400" />
              {locale === 'en' ? 'Quick Access' : '快速入口'}
            </h2>
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="card group flex items-center gap-4 transition-all hover:shadow-apple-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 transition-colors group-hover:bg-brand-100">
                    <Icon className="h-5 w-5 text-brand-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      {link.label}
                    </div>
                    <div className="text-xs text-gray-400">{link.desc}</div>
                  </div>
                  <FiArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-brand-400" />
                </Link>
              )
            })}

            {/* Extra: refresh */}
            <button
              onClick={() => window.location.reload()}
              className="card flex w-full items-center justify-center gap-2 p-4 text-sm text-gray-500 transition-all hover:text-brand-400 hover:shadow-apple-md"
            >
              <FiRefreshCw className="h-4 w-4" />
              {locale === 'en' ? 'Refresh Data' : '刷新数据'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
