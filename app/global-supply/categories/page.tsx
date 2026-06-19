'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumb from '../../components/Breadcrumb'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import {
  FiGlobe,
  FiTruck,
  FiShoppingBag,
  FiHome,
  FiMonitor,
  FiHeart,
  FiPackage,
  FiAward,
  FiRefreshCw,
  FiGrid,
  FiTool,
  FiClipboard,
  FiBook,
  FiWatch,
  FiCamera,
  FiVolume2,
  FiChevronRight,
  FiStar,
  FiTrendingUp,
  FiAlertCircle,
} from 'react-icons/fi'

// ── Visual palette (cycled by index) ──
const VISUAL_PALETTE = [
  { icon: FiGlobe, color: 'bg-blue-50 text-blue-600', gradient: 'from-blue-50 to-blue-100/40' },
  { icon: FiMonitor, color: 'bg-purple-50 text-purple-600', gradient: 'from-purple-50 to-purple-100/40' },
  { icon: FiShoppingBag, color: 'bg-pink-50 text-pink-600', gradient: 'from-pink-50 to-pink-100/40' },
  { icon: FiHome, color: 'bg-green-50 text-green-600', gradient: 'from-green-50 to-green-100/40' },
  { icon: FiHeart, color: 'bg-rose-50 text-rose-600', gradient: 'from-rose-50 to-rose-100/40' },
  { icon: FiPackage, color: 'bg-amber-50 text-amber-600', gradient: 'from-amber-50 to-amber-100/40' },
  { icon: FiAward, color: 'bg-teal-50 text-teal-600', gradient: 'from-teal-50 to-teal-100/40' },
  { icon: FiRefreshCw, color: 'bg-lime-50 text-lime-600', gradient: 'from-lime-50 to-lime-100/40' },
  { icon: FiTrendingUp, color: 'bg-cyan-50 text-cyan-600', gradient: 'from-cyan-50 to-cyan-100/40' },
  { icon: FiGrid, color: 'bg-violet-50 text-violet-600', gradient: 'from-violet-50 to-violet-100/40' },
  { icon: FiTool, color: 'bg-gray-50 text-gray-600', gradient: 'from-gray-50 to-gray-100/40' },
  { icon: FiClipboard, color: 'bg-indigo-50 text-indigo-600', gradient: 'from-indigo-50 to-indigo-100/40' },
  { icon: FiBook, color: 'bg-sky-50 text-sky-600', gradient: 'from-sky-50 to-sky-100/40' },
  { icon: FiWatch, color: 'bg-yellow-50 text-yellow-600', gradient: 'from-yellow-50 to-yellow-100/40' },
  { icon: FiCamera, color: 'bg-stone-50 text-stone-600', gradient: 'from-stone-50 to-stone-100/40' },
  { icon: FiVolume2, color: 'bg-red-50 text-red-600', gradient: 'from-red-50 to-red-100/40' },
]

const DEFAULT_VISUAL = { icon: FiGrid, color: 'bg-gray-50 text-gray-600', gradient: 'from-gray-50 to-gray-100/40' }

// ── API type ──
interface ApiCategory {
  id: number
  name: string
  icon: string | null
  productCount: number
  supplierCount: number
}

// ── Display type ──
interface CategoryCard {
  id: number
  name: string
  icon: React.ComponentType<{ className?: string }>
  productCount: number
  supplierCount: number
  color: string
  gradient: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toLocaleString()
}

// ── Loading Skeleton ──
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse">
          <div className="h-14 w-14 rounded-xl bg-gray-100" />
          <div className="mt-4 h-5 w-24 rounded bg-gray-100" />
          <div className="mt-4 flex gap-4 border-t border-gray-50 pt-3">
            <div className="h-4 w-20 rounded bg-gray-100" />
            <div className="h-4 w-20 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Page ──

export default function CategoriesPage() {
  const { locale } = useLocale()
  const [categories, setCategories] = useState<CategoryCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCategories = () => {
    setLoading(true)
    setError('')
    fetch('/api/global-supply/categories')
      .then(res => {
        if (!res.ok) throw new Error(t('common.loadFailed', locale))
        return res.json()
      })
      .then((response: ApiResponse<ApiCategory[]>) => {
        if (!response.success) throw new Error(response.error || t('common.loadFailed', locale))
        const items = Array.isArray(response.data) ? response.data : []
        const merged: CategoryCard[] = items.map((item, index) => {
          const visual = VISUAL_PALETTE[index % VISUAL_PALETTE.length] || DEFAULT_VISUAL
          return {
            id: item.id,
            name: item.name,
            icon: visual.icon,
            productCount: item.productCount,
            supplierCount: item.supplierCount,
            color: visual.color,
            gradient: visual.gradient,
          }
        })
        setCategories(merged)
      })
      .catch(err => {
        setError(err.message || t('common.error', locale))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const totalCategories = categories.length
  const totalSuppliers = categories.reduce((s, c) => s + c.supplierCount, 0)
  const totalProducts = categories.reduce((s, c) => s + c.productCount, 0)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Sub-nav */}
      <div className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6">
          <nav className="flex items-center gap-4">
            <Link href="/global-supply/hot-products" className="text-xs font-medium text-gray-500 transition-colors hover:text-brand-400">
              {t('content.trending', locale)}
            </Link>
            <Link href="/global-supply/verified-suppliers" className="text-xs font-medium text-gray-500 transition-colors hover:text-brand-400">
              {t('supply.stats.suppliers', locale)}
            </Link>
            <Link href="/global-supply/categories" className="text-xs font-medium text-brand-400">
              {t('supply.stats.categories', locale)}
            </Link>
            <Link href="/global-supply/my-resources" className="text-xs font-medium text-gray-500 transition-colors hover:text-brand-400">
              {t('content.resources', locale)}
            </Link>
          </nav>
          <button
            type="button"
            className="rounded-lg bg-brand-400 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-500"
          >
            {locale === 'en' ? 'Post Requirement' : '发布需求'}
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: t('home.footer', locale), href: '/' },
            { label: t('nav.supply', locale), href: '/global-supply' },
            { label: t('supply.industry.title', locale) },
          ]}
          className="mb-4"
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('supply.industry.title', locale)}</h1>
          {!loading && !error && (
            <p className="mt-1 text-sm text-gray-500">
              {locale === 'en' ? 'Covering' : '覆盖'} <strong className="text-gray-700">{totalCategories}</strong> {locale === 'en' ? 'major categories' : '个行业大类'}，{' '}
              <strong className="text-gray-700">{formatCount(totalSuppliers)}</strong> {locale === 'en' ? 'certified suppliers' : '认证供应商'}，{' '}
              <strong className="text-gray-700">{formatCount(totalProducts)}</strong> {locale === 'en' ? 'online products' : '在线商品'}
            </p>
          )}

          {/* Quick stats */}
          {!loading && !error && (
            <div className="mt-4 flex items-center gap-6 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <FiStar className="w-3.5 h-3.5 text-amber-400" />
                {locale === 'en' ? 'Daily update' : '数据每日更新'}
              </span>
              <span className="inline-flex items-center gap-1">
                <FiTrendingUp className="w-3.5 h-3.5 text-green-500" />
                {locale === 'en' ? 'Data from global supply network' : '数据来自全球供应链网络'}
              </span>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <FiAlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('common.loadFailed', locale)}</h2>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchCategories}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-brand-400 hover:bg-brand-500 px-5 py-2.5 rounded-xl transition-all"
            >
              <FiRefreshCw className="w-4 h-4" />
              {t('common.reload', locale)}
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <FiGrid className="w-12 h-12 text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('supply.industry.empty', locale)}</h2>
            <p className="text-sm text-gray-500">{locale === 'en' ? 'Category data is being prepared, please check back later' : '分类数据正在准备中，请稍后再来'}</p>
          </div>
        )}

        {/* Category Grid */}
        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.id}
                  href={`/global-supply/categories/${cat.id}`}
                  className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                  {/* Hover accent bar */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-brand-400 scale-x-0 transition-transform group-hover:scale-x-100" />

                  <div className="relative z-10 p-5">
                    <div className="flex items-start justify-between">
                      {/* Icon */}
                      <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${cat.color} transition-all group-hover:scale-110 group-hover:shadow-sm`}>
                        <Icon className="h-7 w-7" />
                      </div>

                      {/* Arrow hint */}
                      <FiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
                    </div>

                    {/* Name */}
                    <h3 className="mt-4 text-base font-bold text-gray-900 group-hover:text-brand-400 transition-colors">
                      {cat.name}
                    </h3>

                    {/* Stats */}
                    <div className="mt-4 flex items-center gap-4 border-t border-gray-50 pt-3 text-xs text-gray-400">
                      <span>
                        <strong className="text-gray-700">{formatCount(cat.supplierCount)}</strong> {t('supply.stats.suppliers', locale)}
                      </span>
                      <span className="text-gray-200">|</span>
                      <span>
                        <strong className="text-gray-700">{formatCount(cat.productCount)}</strong> {t('supply.stats.products', locale)}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Bottom note */}
        {!loading && !error && categories.length > 0 && (
          <p className="mt-8 text-center text-xs text-gray-400">
            {locale === 'en' ? 'Category data is continuously updated. Contact Lanlaoban support if any category is missing.' : '品类数据持续更新中，如有未覆盖的品类请联系懒老板客服添加'}
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-gray-400 sm:flex-row sm:px-6">
          <p>&copy; 2026 {t('home.footer', locale)}</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="transition-colors hover:text-gray-600">{t('home.footer', locale)}</Link>
            <span>|</span>
            <span>{locale === 'en' ? 'Data for reference only. Actual transaction prevails.' : '数据仅供参考，以实际交易为准'}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
