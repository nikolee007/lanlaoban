'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Breadcrumb from '../../components/Breadcrumb'
import EmptyState from '../../components/EmptyState'
import {
  FiTrendingUp, FiArrowRight, FiShoppingBag, FiRefreshCw,
  FiGrid, FiChevronDown, FiAlertCircle,
} from 'react-icons/fi'
import { setProductImageMap, loadProductImageMap } from '@/lib/product-placeholder'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import ProductCard from '../components/ProductCard'
import type { HotProductData } from '../components/ProductCard'
import RegionSelector from '../components/RegionSelector'
import {
  INSIGHT_CARDS, GROWTH_RATES, REGIONS_POOL, FALLBACK, ITEMS_PER_PAGE,
} from './hot-data'
import type { InsightCardData } from './hot-data'

/* ─── Sub-components ─── */

function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white overflow-hidden">
      <div className="bg-gray-100" style={{ aspectRatio: '1/1' }} />
      <div className="p-3 space-y-2.5">
        <div className="h-3 bg-gray-100 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-3/5" />
        <div className="flex justify-between">
          <div className="h-2.5 bg-gray-100 rounded w-1/4" />
          <div className="h-2.5 bg-gray-100 rounded w-1/5" />
        </div>
      </div>
    </div>
  )
}

function InsightProductCard({ insight }: { insight: InsightCardData }) {
  const { locale } = useLocale()
  const InsightIcon = insight.icon
  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-100/80 bg-gradient-to-br from-brand-50 via-orange-50/30 to-purple-50/30 p-4 shadow-apple transition-all duration-300 hover:shadow-apple-md">
      <div className="absolute right-2 top-2 rounded-full bg-brand-400/10 p-1.5">
        <InsightIcon className="h-4 w-4 text-brand-400" />
      </div>
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: '#FF6034' }}>
              <FiTrendingUp className="mr-0.5 h-2.5 w-2.5" />
              {t('hot.insight.title', locale)}
            </span>
            <span className="text-[10px] text-gray-400">{insight.region}</span>
          </div>
          <h3 className="mb-1 text-sm font-bold leading-snug text-gray-900">{insight.title}</h3>
          <p className="text-[11px] leading-relaxed text-gray-500">{insight.description}</p>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-brand-400">
          {t('hot.insight.viewProducts', locale)}
          <FiArrowRight className="h-2.5 w-2.5" />
        </div>
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  const { locale } = useLocale()
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <FiAlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-gray-900">{t('common.loadFailed', locale)}</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-gray-500">{error}</p>
      <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90" style={{ backgroundColor: '#FF6034' }}>
        <FiRefreshCw className="h-4 w-4" />
        {t('common.reload', locale)}
      </button>
    </div>
  )
}

function FullLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}

function DataDisclaimer() {
  const { locale } = useLocale()
  const [dateStr, setDateStr] = useState('')
  useEffect(() => {
    const d = new Date()
    setDateStr(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }, [])
  return <div className="mt-4 text-center text-xs text-gray-400">{t('supply.dataSource', locale)} {dateStr}</div>
}

/* ═══════════════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════════════ */

export default function HotProductsPage() {
  const { locale } = useLocale()
  const [allProducts, setAllProducts] = useState<HotProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeRegion, setActiveRegion] = useState('全部')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const imgMap = await loadProductImageMap()
      setProductImageMap(imgMap)
      const res = await fetch('/api/global-supply/home')
      const json = await res.json()
      const data = json?.data || json || {}
      const items = Array.isArray(data.hotProducts) ? data.hotProducts : []

      const mapped: HotProductData[] = items.length > 0
        ? items.map((p: Record<string, unknown>, i: number) => ({
          id: p.id as number || i,
          name: (p.name as string) || '',
          region: (p.supplierLocation as string)
            ? (/广东|深圳|广州/.test(p.supplierLocation as string) ? '华南'
              : /浙江|义乌|江苏|福建/.test(p.supplierLocation as string) ? '华东' : '国内')
            : REGIONS_POOL[i % REGIONS_POOL.length],
          growthRate: GROWTH_RATES[i % GROWTH_RATES.length],
          hotTag: (p.hotTag as string) || null,
          sales: `月销${(Math.floor(Math.random() * 80) + 5) * 100}+`,
        }))
        : FALLBACK
      setAllProducts(mapped)
    } catch { setAllProducts(FALLBACK) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredProducts = useMemo(() =>
    activeRegion === '全部' ? allProducts : allProducts.filter(p => p.region === activeRegion),
  [allProducts, activeRegion])

  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount])
  const hasMore = visibleCount < filteredProducts.length

  const loadMore = useCallback(() => setVisibleCount(prev => prev + ITEMS_PER_PAGE), [])
  useEffect(() => { setVisibleCount(ITEMS_PER_PAGE) }, [activeRegion])

  const relevantInsights = useMemo(() => {
    if (activeRegion === '全部') return INSIGHT_CARDS
    const filtered = INSIGHT_CARDS.filter(ins => ins.region === activeRegion)
    return filtered.length > 0 ? filtered : INSIGHT_CARDS.slice(0, 1)
  }, [activeRegion])

  const gridItems = useMemo(() => {
    const items: Array<{ type: 'product'; data: HotProductData; index: number } | { type: 'insight'; data: InsightCardData }> = []
    visibleProducts.forEach((product, idx) => {
      if ([4, 12].includes(idx) && relevantInsights.length > 0) {
        const insightIdx = [4, 12].indexOf(idx)
        if (insightIdx < relevantInsights.length) items.push({ type: 'insight', data: relevantInsights[insightIdx] })
      }
      items.push({ type: 'product', data: product, index: idx })
    })
    return items
  }, [visibleProducts, relevantInsights])

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mx-auto max-w-6xl px-6 py-3">
        <Breadcrumb items={[
          { label: '懒老板', href: '/' },
          { label: '全球供应链', href: '/global-supply' },
          { label: t('hot.page.title', locale) },
        ]} />
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-12">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('hot.page.title', locale)}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('hot.page.subtitle', locale)}</p>
          </div>
          <Link href="/global-supply" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90" style={{ backgroundColor: '#FF6034' }}>
            <FiShoppingBag className="h-4 w-4" />
            {t('hot.goSupply', locale)}
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <RegionSelector activeRegion={activeRegion} onRegionChange={setActiveRegion} locale={locale} />

        {loading ? <FullLoadingSkeleton />
        : error ? <ErrorState error={error} onRetry={fetchData} />
        : filteredProducts.length === 0 ? (
          <EmptyState icon={FiGrid} title={t('hot.noProducts', locale)} description={t('hot.noProductsDesc', locale)} action={{ label: t('hot.viewAll', locale), href: '/global-supply' }} />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
              <span>{t('hot.productCount', locale).replace('{count}', String(filteredProducts.length))}</span>
              <span className="flex items-center gap-1"><FiRefreshCw className="h-3 w-3" />{t('hot.dailyUpdate', locale)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {gridItems.map((item, idx) => {
                if (item.type === 'insight') {
                  return <div key={item.data.id} className="animate-stagger" style={{ animationDelay: `${idx * 40}ms` }}><InsightProductCard insight={item.data} /></div>
                }
                return <div key={item.data.id} className="animate-stagger" style={{ animationDelay: `${idx * 40}ms` }}><ProductCard product={item.data} index={item.index} /></div>
              })}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button onClick={loadMore} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-brand-200 hover:text-brand-400 hover:shadow-md">
                  <FiChevronDown className="h-4 w-4" />
                  {t('hot.loadMore', locale).replace('{count}', String(filteredProducts.length - visibleCount))}
                </button>
              </div>
            )}

            {!hasMore && filteredProducts.length > 0 && (
              <div className="mt-8 text-center text-xs text-gray-400">
                {t('hot.showAll', locale).replace('{count}', String(filteredProducts.length))}
              </div>
            )}
          </>
        )}

        {!loading && <DataDisclaimer />}
      </div>
    </div>
  )
}
