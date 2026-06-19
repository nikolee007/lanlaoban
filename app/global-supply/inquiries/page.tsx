'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import {
  FiMessageSquare,
  FiClock,
  FiArrowLeft,
  FiAlertCircle,
  FiRefreshCw,
  FiInbox,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiPhone,
  FiUser,
  FiBriefcase,
} from 'react-icons/fi'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InquiryProduct {
  id: number
  name: string
  images: string | null
  priceMin: number | null
  priceMax: number | null
}

interface InquirySupplier {
  id: number
  nameZh: string
  nameEn: string
  location: string
}

interface InquiryItem {
  id: number
  userId: number
  name: string
  phone: string
  company: string | null
  message: string
  status: string
  reply: string | null
  createdAt: string
  product: InquiryProduct | null
  supplier: InquirySupplier | null
}

interface InquiriesResponse {
  success: boolean
  data: {
    items: InquiryItem[]
    total: number
    page: number
    pageSize: number
  }
}

/* ------------------------------------------------------------------ */
/*  Status Config                                                      */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待回复', color: 'text-amber-600', bg: 'bg-amber-50' },
  replied: { label: '已回复', color: 'text-green-600', bg: 'bg-green-50' },
  closed: { label: '已关闭', color: 'text-gray-500', bg: 'bg-gray-50' },
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return iso
  }
}

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
}

function InquiriesSkeleton() {
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
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-2 flex-1">
                  <SkeletonBlock className="h-4 w-1/3" />
                  <SkeletonBlock className="h-3 w-1/2" />
                </div>
                <SkeletonBlock className="h-6 w-16 rounded-full" />
              </div>
              <SkeletonBlock className="h-3 w-full mb-2" />
              <SkeletonBlock className="h-3 w-3/4" />
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

function EmptyInquiries() {
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
              {t('common.back', locale)}
            </Link>
            <span className="truncate text-sm font-semibold text-gray-900">{t('inquiry.title', locale)}</span>
          </div>
        </header>
        <div className="mx-auto mt-28 max-w-md px-4 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <FiInbox className="h-10 w-10 text-gray-300" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-800">{t('inquiry.empty', locale)}</h2>
          <p className="mb-8 text-sm leading-relaxed text-gray-500">
            {t('inquiry.emptyDesc', locale)}
          </p>
          <Link
            href="/global-supply"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500"
          >
            <FiMessageSquare className="h-4 w-4" />
            {t('inquiry.contactSupplier', locale)}
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
              {t('common.back', locale)}
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
/*  Inquiry Detail Card                                                */
/* ------------------------------------------------------------------ */

function InquiryCard({ item }: { item: InquiryItem }) {
  const { locale } = useLocale()
  const [expanded, setExpanded] = useState(false)
  const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending

  return (
    <div className="card transition-all hover:shadow-apple-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">
              {item.product?.name || item.supplier?.nameZh || '询盘'}
            </span>
            {item.product && item.supplier && (
              <span className="hidden sm:inline text-xs text-gray-400">
                — {item.supplier.nameZh || item.supplier.nameEn}
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              <FiClock className="h-3 w-3" />
              {formatDateTime(item.createdAt)}
            </span>
            {item.supplier && (
              <span className="sm:hidden inline-flex items-center gap-1">
                {item.supplier.nameZh || item.supplier.nameEn}
              </span>
            )}
          </div>
          {/* Message preview */}
          {!expanded && (
            <p className="mt-2 line-clamp-1 text-xs text-gray-500">{item.message}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${config.color} ${config.bg}`}>
            {config.label}
          </span>
          {expanded ? (
            <FiChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <FiChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-3 animate-fade-in">
          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FiUser className="h-3.5 w-3.5 text-gray-400" />
              <span>{item.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FiPhone className="h-3.5 w-3.5 text-gray-400" />
              <span>{item.phone}</span>
            </div>
            {item.company && (
              <div className="flex items-center gap-2 text-xs text-gray-500 sm:col-span-2">
                <FiBriefcase className="h-3.5 w-3.5 text-gray-400" />
                <span>{item.company}</span>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="rounded-lg bg-gray-50 px-3 py-2.5">
            <p className="text-xs text-gray-700 leading-relaxed">{item.message}</p>
          </div>

          {/* Reply */}
          {item.reply && (
            <div className="rounded-lg bg-green-50 px-3 py-2.5">
              <p className="text-xs font-medium text-green-700 mb-1">{t('inquiry.supplierReply', locale)}</p>
              <p className="text-xs text-green-600 leading-relaxed">{item.reply}</p>
            </div>
          )}

          {/* Product link */}
          {item.product && (
            <Link
              href={`/global-supply/${item.product.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 transition-colors hover:text-brand-600"
            >
              <FiMail className="h-3 w-3" />
              {t('inquiry.viewProduct', locale)}
              <FiChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function InquiriesPage() {
  const { locale } = useLocale()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inquiries, setInquiries] = useState<InquiryItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const pageSize = 20

  /* ---- Fetch Inquiries ---- */
  const fetchInquiries = useCallback(async (p: number, status: string) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('lanlaoban_token')
      if (!token) {
        setError('请先登录')
        setLoading(false)
        return
      }
      const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize) })
      if (status) params.set('status', status)
      const res = await fetch(`/api/global-supply/inquiries?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        if (res.status === 401) throw new Error('请先登录')
        throw new Error(`请求失败 (${res.status})`)
      }
      const json: InquiriesResponse = await res.json()
      if (!json.success) throw new Error('获取询盘记录失败')
      setInquiries(json.data.items)
      setTotal(json.data.total)
      setPage(json.data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInquiries(1, statusFilter)
  }, [fetchInquiries, statusFilter])

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setPage(1)
  }

  const totalPages = Math.ceil(total / pageSize)

  if (loading) return <InquiriesSkeleton />
  if (error) return <ErrorSection message={error} onRetry={() => fetchInquiries(1, statusFilter)} />
  if (inquiries.length === 0) return <EmptyInquiries />

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
        {/* ---- Header ---- */}
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <Link
              href="/global-supply"
              className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400"
            >
              <FiArrowLeft className="h-5 w-5" />
              {t('common.back', locale)}
            </Link>
            <span className="truncate text-sm font-semibold text-gray-900">
              {t('inquiry.title', locale)}
            </span>
            <span className="text-xs text-gray-400">({total})</span>
          </div>
        </header>

        {/* ---- Status Filters ---- */}
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-3">
          <div className="flex flex-wrap gap-2">
            {[
              { value: '', labelKey: 'inquiry.all' },
              { value: 'pending', labelKey: 'inquiry.status.pending' },
              { value: 'replied', labelKey: 'inquiry.status.replied' },
              { value: 'closed', labelKey: 'inquiry.status.closed' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => handleStatusFilter(f.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  statusFilter === f.value
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
                style={statusFilter === f.value ? { background: 'linear-gradient(135deg, #FF6034, #8B5CF6)' } : {}}
              >
                {t(f.labelKey, locale)}
              </button>
            ))}
          </div>
        </div>

        {/* ---- Inquiry List ---- */}
        <div className="mx-auto max-w-3xl px-4 space-y-3">
          {inquiries.map((item) => (
            <InquiryCard key={item.id} item={item} />
          ))}
        </div>

        {/* ---- Pagination ---- */}
        {totalPages > 1 && (
          <div className="mx-auto mt-6 flex max-w-3xl items-center justify-center gap-2 px-4">
            <button
              disabled={page <= 1}
              onClick={() => fetchInquiries(page - 1, statusFilter)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('inquiry.pagination.prev', locale)}
            </button>
            <span className="text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => fetchInquiries(page + 1, statusFilter)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('inquiry.pagination.next', locale)}
            </button>
          </div>
        )}
      </main>
    </>
  )
}
