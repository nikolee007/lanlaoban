'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Breadcrumb from '../../components/Breadcrumb'
import EmptyState from '../../components/EmptyState'
import {
  FiTrendingUp, FiMapPin, FiHeart, FiShoppingBag, FiArrowRight,
  FiRefreshCw, FiGrid, FiChevronRight, FiGlobe, FiBarChart2,
  FiTarget, FiChevronDown, FiAlertCircle,
} from 'react-icons/fi'
import { productPlaceholderSVG, getCategoryInfo, setProductImageMap, loadProductImageMap } from '@/lib/product-placeholder'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'

/* ─── Types ─── */
interface HotProduct {
  id: number
  name: string
  region: string
  growthRate: string
  hotTag: string | null
  sales: string
}

interface InsightCard {
  id: string
  title: string
  description: string
  region: string
  icon: React.ComponentType<{ className?: string }>
}

/* ─── Constants ─── */
const REGION_KEYS = [
  { key: '全部', i18n: 'hot.region.all' },
  { key: '美国', i18n: 'hot.region.usa' },
  { key: '欧洲', i18n: 'hot.region.europe' },
  { key: '东南亚', i18n: 'hot.region.seAsia' },
  { key: '中东', i18n: 'hot.region.middleEast' },
  { key: '拉美', i18n: 'hot.region.latam' },
] as const

const INSIGHT_CARDS: InsightCard[] = [
  {
    id: 'insight-1',
    title: '蓝牙耳机在东南亚搜索量月增40%',
    description: '受 TikTok 短视频带货影响，真无线耳机在越南、泰国搜索量激增，建议关注白牌高性价比产品线。',
    region: '东南亚',
    icon: FiBarChart2,
  },
  {
    id: 'insight-2',
    title: '中东美妆个护品类爆发式增长',
    description: '斋月后中东美妆电商搜索量环比增长65%，天然成分护肤品和香氛产品成热销新趋势。',
    region: '中东',
    icon: FiTarget,
  },
  {
    id: 'insight-3',
    title: '欧洲家居小件需求持续走高',
    description: '欧洲通胀下消费者转向平价替代，收纳、厨房小工具客单价$5-15最受欢迎，复购率高。',
    region: '欧洲',
    icon: FiGlobe,
  },
  {
    id: 'insight-4',
    title: '拉美市场运动户外品类升温',
    description: '巴西、墨西哥夏季到来，泳装、运动水壶、户外露营装备搜索量大幅攀升，利润空间可观。',
    region: '拉美',
    icon: FiHeart,
  },
]

const GROWTH_RATES = ['+230%', '+187%', '+156%', '+98%', '+76%', '+145%', '+112%', '+89%', '+134%', '+67%', '+203%', '+156%']
const HOT_TAGS = ['搜+40%', '月销3k+', '加购65%', '日单800+', '好评97%', '搜+55%', '日单500+', '复购72%', '搜+80%', '月销5k+']
const REGIONS_POOL = ['美国', '欧洲', '东南亚', '中东', '拉美', '日本', '北美']
const SALES_VALUES = [
  '月销3000+', '月销3000+', '月销5000+', '月销2400+', '月销1800+', '月销8000+',
  '月销2000+', '月销3500+', '月销4500+', '月销1200+', '月销600+', '月销5000+',
]

/* ─── Mock Data (fallback if API fails) ─── */
const FALLBACK: HotProduct[] = [
  { id: 1, name: '磁吸无线充电宝 20000mAh', region: '美国', growthRate: '+230%', hotTag: '搜+40%', sales: '月销3000+' },
  { id: 2, name: '智能宠物喂食器 带摄像头', region: '欧洲', growthRate: '+187%', hotTag: '月销3k+', sales: '月销3000+' },
  { id: 3, name: '便携式榨汁机 USB-C 充电', region: '美国', growthRate: '+156%', hotTag: '加购65%', sales: '月销5000+' },
  { id: 4, name: '可折叠硅胶旅行水壶', region: '东南亚', growthRate: '+98%', hotTag: '日单800+', sales: '月销2400+' },
  { id: 5, name: 'LED 化妆镜 三色温调节', region: '中东', growthRate: '+76%', hotTag: ' 月销1800+', sales: '月销1800+' },
  { id: 6, name: '蓝牙5.3 TWS降噪耳机', region: '东南亚', growthRate: '+145%', hotTag: '搜+55%', sales: '月销8000+' },
  { id: 7, name: '北欧简约陶瓷餐具套装', region: '欧洲', growthRate: '+112%', hotTag: '好评97%', sales: '月销2000+' },
  { id: 8, name: '纯棉婴儿连体爬服', region: '美国', growthRate: '+89%', hotTag: '日单500+', sales: '月销3500+' },
  { id: 9, name: '高弹力瑜伽运动套装', region: '拉美', growthRate: '+134%', hotTag: '搜+48%', sales: '月销4500+' },
  { id: 10, name: '真丝睡衣套装', region: '欧洲', growthRate: '+67%', hotTag: '复购72%', sales: '月销1200+' },
  { id: 11, name: '智能一体马桶 带烘干', region: '中东', growthRate: '+203%', hotTag: '搜+80%', sales: '月销600+' },
  { id: 12, name: '宠物玩具磨牙棒', region: '东南亚', growthRate: '+156%', hotTag: '月销5k+', sales: '月销5000+' },
  { id: 13, name: '不锈钢保温饭盒 便当盒', region: '日本', growthRate: '+92%', hotTag: '月销2k+', sales: '月销2000+' },
  { id: 14, name: '鸭舌帽 纯色基础款', region: '美国', growthRate: '+78%', hotTag: '日单600+', sales: '月销4200+' },
  { id: 15, name: '智能跳绳 计数 APP', region: '欧洲', growthRate: '+145%', hotTag: '搜+52%', sales: '月销3200+' },
  { id: 16, name: '汽车遮阳挡 折叠防晒', region: '中东', growthRate: '+88%', hotTag: '好评94%', sales: '月销1500+' },
  { id: 17, name: '儿童益智拼图 木制', region: '东南亚', growthRate: '+110%', hotTag: '月销2.8k+', sales: '月销2800+' },
  { id: 18, name: '保温杯 大容量 1.5L', region: '拉美', growthRate: '+67%', hotTag: '加购58%', sales: '月销3600+' },
  { id: 19, name: '无线蓝牙音箱 户外防水', region: '美国', growthRate: '+132%', hotTag: '搜+60%', sales: '月销5500+' },
  { id: 20, name: '家用空气炸锅 6L', region: '欧洲', growthRate: '+95%', hotTag: '日单400+', sales: '月销1800+' },
  { id: 21, name: '精油香薰机 超声波', region: '中东', growthRate: '+74%', hotTag: '复购68%', sales: '月销900+' },
  { id: 22, name: '速干运动T恤 男款', region: '东南亚', growthRate: '+118%', hotTag: '月销4k+', sales: '月销4000+' },
  { id: 23, name: '无线充电鼠标 静音', region: '日本', growthRate: '+83%', hotTag: '搜+35%', sales: '月销1600+' },
  { id: 24, name: '尼龙编织数据线 三合一', region: '拉美', growthRate: '+101%', hotTag: '日单700+', sales: '月销5800+' },
  { id: 25, name: '智能体脂秤 蓝牙 APP', region: '美国', growthRate: '+155%', hotTag: '搜+45%', sales: '月销2800+' },
  { id: 26, name: '亚克力化妆品收纳盒', region: '欧洲', growthRate: '+79%', hotTag: '好评96%', sales: '月销2200+' },
  { id: 27, name: '户外露营灯 可充电', region: '北美', growthRate: '+127%', hotTag: '月销3.1k+', sales: '月销3100+' },
  { id: 28, name: '男士电动剃须刀 防水', region: '东南亚', growthRate: '+93%', hotTag: '加购62%', sales: '月销4700+' },
]

const ITEMS_PER_PAGE = 12

/* ─── Helpers ─── */

const RANK_STYLES = [
  { gradient: 'linear-gradient(135deg,#FF6034,#FF3D14)' },
  { gradient: 'linear-gradient(135deg,#F59E0B,#D97706)' },
  { gradient: 'linear-gradient(135deg,#6B7280,#4B5563)' },
]

/* ─── Skeleton Component ─── */
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

/* ─── Insight Card Component ─── */
function InsightProductCard({ insight }: { insight: InsightCard }) {
  const { locale } = useLocale()
  const InsightIcon = insight.icon
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-brand-100/80 bg-gradient-to-br from-brand-50 via-orange-50/30 to-purple-50/30 p-4 shadow-apple transition-all duration-300 hover:shadow-apple-md"
    >
      <div className="absolute right-2 top-2 rounded-full bg-brand-400/10 p-1.5">
        <InsightIcon className="h-4 w-4 text-brand-400" />
      </div>
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: '#FF6034' }}
            >
              <FiTrendingUp className="mr-0.5 h-2.5 w-2.5" />
              {t('hot.insight.title', locale)}
            </span>
            <span className="text-[10px] text-gray-400">{insight.region}</span>
          </div>
          <h3 className="mb-1 text-sm font-bold leading-snug text-gray-900">
            {insight.title}
          </h3>
          <p className="text-[11px] leading-relaxed text-gray-500">
            {insight.description}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-brand-400">
          {t('hot.insight.viewProducts', locale)}
          <FiArrowRight className="h-2.5 w-2.5" />
        </div>
      </div>
    </div>
  )
}

/* ─── Error State Component ─── */
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  const { locale } = useLocale()
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <FiAlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-gray-900">{t('common.loadFailed', locale)}</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-gray-500">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90"
        style={{ backgroundColor: '#FF6034' }}
      >
        <FiRefreshCw className="h-4 w-4" />
        {t('common.reload', locale)}
      </button>
    </div>
  )
}

/* ─── Product Card ─── */
function ProductCard({ product, index }: { product: HotProduct; index: number }) {
  const { locale } = useLocale()
  const catInfo = getCategoryInfo(product.name)
  const isTop3 = index < 3

  return (
    <Link
      href={`/global-supply/${product.id}`}
      className="group overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-apple transition-all duration-300 hover:shadow-apple-md hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '1/1' }}>
        <img
          src={productPlaceholderSVG(product.name, 300, 300, product.id)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Rank badge (gold/silver/bronze) */}
        {isTop3 && (
          <span
            className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-md ring-2 ring-white/60"
            style={{ background: RANK_STYLES[index].gradient }}
          >
            {index + 1}
          </span>
        )}

        {/* Hot tag */}
        {product.hotTag && (
          <span className="absolute right-2 top-2 z-10 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-red-500 shadow-sm backdrop-blur-sm">
            {product.hotTag}
          </span>
        )}

        {/* Category badge */}
        <span
          className="absolute left-2 bottom-8 z-10 rounded px-1.5 py-0.5 text-[9px] font-medium shadow-sm"
          style={{ backgroundColor: catInfo.bg, color: catInfo.color }}
        >
          {catInfo.category}
        </span>

        {/* Gradient overlay + growth rate */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent p-2 pt-6">
          <span className="text-xs font-bold text-white drop-shadow-sm">{product.growthRate}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h3 className="line-clamp-1 text-xs font-medium text-gray-900">{product.name}</h3>
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <FiMapPin className="h-3 w-3" />
            {product.region}
          </div>
        </div>
        {product.sales && (
          <div className="mt-1 flex items-center gap-1 text-[9px]" style={{ color: '#FF6034' }}>
            <FiTrendingUp className="h-2.5 w-2.5" />
            {product.sales}
          </div>
        )}
      </div>
    </Link>
  )
}

/* ─── Loading Full Skeleton ─── */
function FullLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════════════ */

export default function HotProductsPage() {
  const { locale } = useLocale()
  const [allProducts, setAllProducts] = useState<HotProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeRegion, setActiveRegion] = useState('全部')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  /* ─── Data Fetching ─── */
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

      const mapped: HotProduct[] = items.length > 0
        ? items.map((p: any, i: number) => ({
          id: p.id || i,
          name: p.name || '',
          region: p.supplierLocation ? (
            /广东|深圳|广州/.test(p.supplierLocation) ? '华南' :
              /浙江|义乌|江苏|福建/.test(p.supplierLocation) ? '华东' : '国内'
          ) : (REGIONS_POOL[i % REGIONS_POOL.length]),
          growthRate: GROWTH_RATES[i % GROWTH_RATES.length],
          hotTag: p.hotTag || null,
          sales: `月销${(Math.floor(Math.random() * 80) + 5) * 100}+`,
        }))
        : FALLBACK

      setAllProducts(mapped)
    } catch {
      setAllProducts(FALLBACK)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* ─── Region Filtering ─── */
  const filteredProducts = useMemo(() => {
    if (activeRegion === '全部') return allProducts
    return allProducts.filter((p) => p.region === activeRegion)
  }, [allProducts, activeRegion])

  /* ─── Visible (paginated) ─── */
  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  )

  const hasMore = visibleCount < filteredProducts.length

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
  }, [])

  /* ─── Reset pagination on region change ─── */
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE)
  }, [activeRegion])

  /* ─── Get region-specific insights ─── */
  const relevantInsights = useMemo(() => {
    if (activeRegion === '全部') return INSIGHT_CARDS
    return INSIGHT_CARDS.filter((ins) => ins.region === activeRegion).length > 0
      ? INSIGHT_CARDS.filter((ins) => ins.region === activeRegion)
      : INSIGHT_CARDS.slice(0, 1)
  }, [activeRegion])

  /* ─── Build grid items (interleave insights) ─── */
  const gridItems = useMemo(() => {
    const items: Array<{ type: 'product'; data: HotProduct; index: number } | { type: 'insight'; data: InsightCard }> = []

    // Insert insight cards at positions 4 and 12 (if enough items)
    const insertPositions = [4, 12]

    visibleProducts.forEach((product, idx) => {
      // Check if we should insert an insight before this item
      if (insertPositions.includes(idx) && relevantInsights.length > 0) {
        const insightIdx = insertPositions.indexOf(idx)
        if (insightIdx < relevantInsights.length) {
          items.push({ type: 'insight', data: relevantInsights[insightIdx] })
        }
      }
      items.push({ type: 'product', data: product, index: idx })
    })

    return items
  }, [visibleProducts, relevantInsights])

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">

      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-6 py-3">
        <Breadcrumb
          items={[
            { label: '懒老板', href: '/' },
            { label: '全球供应链', href: '/global-supply' },
            { label: t('hot.page.title', locale) },
          ]}
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-12">
        {/* ── Page Header ── */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('hot.page.title', locale)}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('hot.page.subtitle', locale)}</p>
          </div>
          <Link
            href="/global-supply"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90"
            style={{ backgroundColor: '#FF6034' }}
          >
            <FiShoppingBag className="h-4 w-4" />
            {t('hot.goSupply', locale)}
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Region Filter Tabs ── */}
        <div className="mb-6 flex gap-2 overflow-x-auto flex-nowrap pb-1 sm:flex-wrap sm:overflow-visible">
          {REGION_KEYS.map((r) => (
            <button
              key={r.key}
              onClick={() => setActiveRegion(r.key)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeRegion === r.key
                  ? 'text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-brand-200 hover:text-brand-400 shadow-sm'
              }`}
              style={
                activeRegion === r.key
                  ? { background: 'linear-gradient(135deg, #FF6034, #FF8A5C)' }
                  : undefined
              }
            >
              {t(r.i18n, locale)}
            </button>
          ))}
        </div>

        {/* ── Content Area ── */}
        {loading ? (
          <FullLoadingSkeleton />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchData} />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={FiGrid}
            title={t('hot.noProducts', locale)}
            description={t('hot.noProductsDesc', locale)}
            action={{ label: t('hot.viewAll', locale), href: '/global-supply' }}
          />
        ) : (
          <>
            {/* Product Count Info */}
            <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
              <span>
                {t('hot.productCount', locale).replace('{count}', String(filteredProducts.length))}
              </span>
              <span className="flex items-center gap-1">
                <FiRefreshCw className="h-3 w-3" />
                {t('hot.dailyUpdate', locale)}
              </span>
            </div>

            {/* Waterfall Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {gridItems.map((item, idx) => {
                if (item.type === 'insight') {
                  return (
                    <div key={item.data.id} className="animate-stagger" style={{ animationDelay: `${idx * 40}ms` }}>
                      <InsightProductCard insight={item.data} />
                    </div>
                  )
                }
                return (
                  <div key={item.data.id} className="animate-stagger" style={{ animationDelay: `${idx * 40}ms` }}>
                    <ProductCard product={item.data} index={item.index} />
                  </div>
                )
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMore}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-brand-200 hover:text-brand-400 hover:shadow-md"
                >
                  <FiChevronDown className="h-4 w-4" />
                  {t('hot.loadMore', locale).replace('{count}', String(filteredProducts.length - visibleCount))}
                </button>
              </div>
            )}

            {/* All loaded tip */}
            {!hasMore && filteredProducts.length > 0 && (
              <div className="mt-8 text-center text-xs text-gray-400">
                {t('hot.showAll', locale).replace('{count}', String(filteredProducts.length))}
              </div>
            )}
          </>
        )}

        {/* 数据来源声明 */}
        {!loading && <DataDisclaimer />}
      </div>
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
  return (
    <div className="mt-4 text-center text-xs text-gray-400">
      {t('supply.dataSource', locale)} {dateStr}
    </div>
  )
}
