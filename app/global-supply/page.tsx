'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { loadProductImageMap, setProductImageMap } from '@/lib/product-placeholder'
import { unsafeCastArray, safeString, safeNumber } from './components/helpers'
import type { HomeStats, ProductCategory, VerifiedSupplier, ProductItem } from './components/types'
import Skeleton from './components/Skeleton'
import ErrorState from './components/ErrorState'
import HeroSearchSection from './components/HeroSearchSection'
import StatsBar from './components/StatsBar'
import IndustryGrid from './components/IndustryGrid'
import SceneCards from './components/SceneCards'
import VerifiedSupplierSection from './components/VerifiedSupplierSection'
import HotRecommendation from './components/HotRecommendation'
import DataSourceSection from './components/DataSourceSection'
import FooterSection from './components/FooterSection'

/* ═══════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════ */

export default function GlobalSupplyPage() {
  const { locale } = useLocale()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<HomeStats>({
    suppliers: 0,
    products: 0,
    categories: 0,
  })
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [suppliers, setSuppliers] = useState<VerifiedSupplier[]>([])
  const [hotProducts, setHotProducts] = useState<ProductItem[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/global-supply/home')
      if (!res.ok) {
        throw new Error('服务器响应异常，请稍后重试')
      }

      const json: unknown = await res.json()

      // Unwrap: json?.data || json || {}
      const raw = (json as Record<string, unknown>) ?? {}
      const data = ((raw?.data as Record<string, unknown>) ?? raw) as Record<string, unknown>

      // Stats
      const rawStats = data.stats as Record<string, unknown> | undefined
      setStats({
        suppliers: safeNumber(rawStats?.suppliers, 0),
        products: safeNumber(rawStats?.products, 0),
        categories: safeNumber(rawStats?.categories, 0),
      })

      // Product categories (from home API's productCategories field)
      const rawCategories = unsafeCastArray(data.productCategories)
      setCategories(
        rawCategories.map((item: unknown) => {
          const c = item as Record<string, unknown>
          return {
            id: safeNumber(c.id, 0),
            name: safeString(c.name, ''),
            icon: safeString(c.icon, null) ?? null,
            productCount: safeNumber(c.productCount, 0),
          }
        }),
      )

      // Verified suppliers
      const rawSuppliers = unsafeCastArray(data.verifiedSuppliers)
      setSuppliers(
        rawSuppliers.map((item: unknown) => {
          const s = item as Record<string, unknown>
          return {
            id: safeNumber(s.id, 0),
            nameZh: safeString(s.nameZh, null) ?? null,
            location: safeString(s.location, null) ?? null,
            businessTags: safeString(s.businessTags, null) ?? null,
            rating: safeNumber(s.rating, null) ?? null,
            reviewCount: safeNumber(s.reviewCount, null) ?? null,
            isVerified: s.isVerified === true,
          }
        }),
      )

      // Hot products (silently degrade on failure)
      try {
        const prodRes = await fetch('/api/global-supply/products?pageSize=8&sortBy=rating')
        if (prodRes.ok) {
          const prodJson: unknown = await prodRes.json()
          const raw = prodJson as Record<string, unknown>
          const d = raw?.data as Record<string, unknown> | undefined
          const items = unsafeCastArray(
            (d?.items as unknown[]) ?? (raw?.data as unknown[]) ?? [],
          )
          setHotProducts(
            items.map((item: unknown) => {
              const p = item as Record<string, unknown>
              return {
                id: safeNumber(p.id, 0),
                name: safeString(p.name, ''),
                priceMin: safeNumber(p.priceMin, null) ?? null,
                priceMax: safeNumber(p.priceMax, null) ?? null,
                location: safeString(p.location, null) ?? null,
                rating: safeNumber(p.rating, null) ?? null,
                reviewCount: safeNumber(p.reviewCount, null) ?? null,
              }
            }),
          )
        }
      } catch {
        // silently degrade
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加载失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 加载产品图片映射
  useEffect(() => {
    loadProductImageMap().then(setProductImageMap)
  }, [])

  const handleSearch = (): void => {
    const q = searchQuery.trim()
    if (q) {
      window.location.href = `/global-supply/search?q=${encodeURIComponent(q)}`
    }
  }

  /* ── Loading ────────────────────────────────── */
  if (loading) return <Skeleton />

  /* ── Error ──────────────────────────────────── */
  if (error) return <ErrorState error={error} onRetry={fetchData} />

  /* ── Main Content ───────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2 sm:py-3 text-xs text-gray-400">
        懒老板 <FiChevronRight className="mx-1 inline h-3 w-3" /> {t('supply.breadcrumb', locale)}
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
        {/* 1. Hero Search */}
        <HeroSearchSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
        />

        {/* 2. Data Confidence Bar */}
        <StatsBar stats={stats} />

        {/* 3. Browse by Industry */}
        <IndustryGrid categories={categories} />

        {/* 4. Find Resources by Scenario */}
        <SceneCards />

        {/* 5. Curated Suppliers */}
        <VerifiedSupplierSection suppliers={suppliers} />

        {/* 6. Hot Recommendations */}
        <HotRecommendation products={hotProducts} />

        {/* Footer note */}
        <DataSourceSection />
      </div>

      <FooterSection />
    </div>
  )
}
