'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '../../components/Breadcrumb'
import {
  FiArrowLeft, FiStar, FiClock, FiShield, FiCheckCircle,
  FiZap, FiArrowRight, FiTruck, FiPackage,
} from 'react-icons/fi'
import { productPlaceholderSVG, loadProductImageMap, setProductImageMap } from '@/lib/product-placeholder'
import CompareDrawer from '../../components/CompareDrawer'
import VideoGenerateModal from '../../components/VideoGenerateModal'
import ContactModal from '../../components/ContactModal'
import { useCompare } from '../../contexts/CompareContext'
import type { CompareItem } from '../../contexts/CompareContext'
import { useToast } from '../../contexts/ToastContext'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { transformProductData, transformRelatedItem, formatDate } from './helpers'
import { addToRecentViews, getRecentViews } from './constants'
import type {
  ApiProductResponse, CollectionsResponse, RelatedProductsResponse,
  UIProductData, UIRelatedProduct, RecentViewItem,
} from './types'
import StarRating from './components/StarRating'
import ImageCarousel from './components/ImageCarousel'
import DetailSkeleton from './components/DetailSkeleton'
import ErrorSection from './components/ErrorSection'
import EmptySection from './components/EmptySection'
import CompanyInfoSection from './components/CompanyInfoSection'
import ProductInfoSection from './components/ProductInfoSection'
import PlatformReputationSection from './components/PlatformReputationSection'
import BuyerReviewsSection from './components/BuyerReviewsSection'
import CTASection from './components/CTASection'
import BottomActionBar from './components/BottomActionBar'
import RelatedProductsGrid from './components/RelatedProductsGrid'
import RecentViewsGrid from './components/RecentViewsGrid'

export default function GlobalSupplyDetailPage() {
  const params = useParams()
  const id = String(params.id ?? '')
  const { locale } = useLocale()

  useEffect(() => {
    loadProductImageMap().then(setProductImageMap)
  }, [])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<UIProductData | null>(null)
  const [supplierLinkId, setSupplierLinkId] = useState<number | null>(null)
  const [favorited, setFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [compareDrawerOpen, setCompareDrawerOpen] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<UIRelatedProduct[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [recentViews, setRecentViews] = useState<RecentViewItem[]>([])
  const { isInCompare, toggleItem } = useCompare()
  const { showToast } = useToast()

  const fetchProduct = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/global-supply/products/${id}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error(t('detail.productNotFound', locale) + ' · ' + t('detail.productNotFoundDesc', locale))
        throw new Error(t('common.loadFailed', locale) + ` (${res.status})`)
      }
      const json: ApiProductResponse = await res.json()
      if (!json.success || !json.data) throw new Error(t('common.loadFailed', locale))
      setProduct(transformProductData(json.data))
      setSupplierLinkId(json.data.supplier?.id ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.loadFailed', locale) + '，' + t('common.retry', locale))
    } finally {
      setLoading(false)
    }
  }, [id, locale])

  useEffect(() => { fetchProduct() }, [fetchProduct])

  const fetchRelatedProducts = useCallback(async (categoryId: number) => {
    setRelatedLoading(true)
    try {
      const res = await fetch(`/api/global-supply/products?categoryId=${categoryId}&pageSize=8`)
      if (!res.ok) return
      const json: RelatedProductsResponse = await res.json()
      if (json.success && json.data?.items) {
        const currentId = Number(id)
        const mapped = (json.data.items || [])
          .map((item) => transformRelatedItem(item, currentId))
          .filter((item): item is UIRelatedProduct => item !== null)
        if (mapped.length > 0) setRelatedProducts(mapped)
      }
    } catch { /* non-critical */ } finally {
      setRelatedLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (product && product.categoryId !== null) {
      fetchRelatedProducts(product.categoryId)
    }
  }, [product, fetchRelatedProducts])

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const t_ = localStorage.getItem('lanlaoban_token')
        const res = await fetch('/api/global-supply/collections', {
          headers: t_ ? { 'Authorization': `Bearer ${t_}` } : {},
        })
        if (!res.ok) return
        const json: CollectionsResponse = await res.json()
        if (json.success) {
          setFavorited(json.data.some((c) => c.targetType === 'product' && c.targetId === id))
        }
      } catch { /* non-critical */ }
    })()
  }, [id])

  useEffect(() => {
    if (!product || !id) return
    const imgUrl = product.images[0] || productPlaceholderSVG(product.name, 400, 300, product.id)
    const price = product.product?.priceRange || '询价'
    addToRecentViews({ id, name: product.name, image: imgUrl, price })
    const views = getRecentViews().filter((v) => v.id !== id)
    setRecentViews(views)
  }, [id, product])

  const toggleFavorite = async () => {
    if (favoriteLoading) return
    const t_ = localStorage.getItem('lanlaoban_token')
    if (!t_) { showToast?.('请先登录，才能使用此功能', 'warning'); return }
    setFavoriteLoading(true)
    try {
      const headers_: Record<string, string> = { 'Content-Type': 'application/json' }
      if (t_) headers_['Authorization'] = `Bearer ${t_}`
      if (favorited) {
        const res = await fetch('/api/global-supply/collections', {
          method: 'DELETE', headers: headers_,
          body: JSON.stringify({ targetId: id, targetType: 'product' }),
        })
        if (res.ok) { setFavorited(false); showToast('已取消收藏', 'info') }
      } else {
        const res = await fetch('/api/global-supply/collections', {
          method: 'POST', headers: headers_,
          body: JSON.stringify({ targetId: id, targetType: 'product' }),
        })
        if (res.ok) { setFavorited(true); showToast('已收藏到资源库', 'success') }
      }
    } catch { /* silently ignore */ } finally { setFavoriteLoading(false) }
  }

  const addToCart = async () => {
    if (cartLoading) return
    const t_ = localStorage.getItem('lanlaoban_token')
    if (!t_) { showToast?.('请先登录，才能使用此功能', 'warning'); return }
    setCartLoading(true)
    try {
      const res = await fetch('/api/global-supply/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t_}` },
        body: JSON.stringify({ productId: id, quantity: 1 }),
      })
      if (res.ok) { showToast('已加入采购清单', 'success') }
      else { const json = await res.json(); showToast(json.error || '添加到采购清单失败，请稍后重试', 'warning') }
    } catch { showToast('操作失败，请稍后重试', 'error') } finally { setCartLoading(false) }
  }

  if (loading) return <DetailSkeleton />
  if (error) return <ErrorSection message={error} onRetry={fetchProduct} />
  if (!product) return <EmptySection />

  const relatedItemsForDisplay = relatedProducts.length > 0 ? relatedProducts : product.relatedProducts

  const compareItem: CompareItem = {
    id: product.id, name: product.name,
    image: productPlaceholderSVG(product.name, 200, 200, product.id),
    price: product.product?.priceRange, moq: product.product?.moq,
    dropship: product.product?.dropshipping, oem: product.product?.oem,
    rating: product.rating, location: product.enterprise?.location || '--',
  }
  const inCompare = isInCompare(product.id)

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-28 animate-fade-in">
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <Link href="/global-supply" className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400">
              <FiArrowLeft className="h-5 w-5" />{t('common.back', locale)}
            </Link>
            <span className="truncate text-sm font-semibold text-gray-900">{product.name}</span>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-6">
          <Breadcrumb items={[
            { label: t('home.footer', locale), href: '/' },
            { label: t('nav.supply', locale), href: '/global-supply' },
            { label: product.name },
          ]} className="mb-4" />

          <ImageCarousel images={product.images} />

          {/* Title & Badges */}
          <section className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {(product.badges || []).map((b) => (
                <span key={b} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                  {b === '懒老板认证' ? <FiShield className="h-3.5 w-3.5" /> : <FiCheckCircle className="h-3.5 w-3.5" />}
                  {b === '懒老板认证' ? t('detail.badge.verified', locale) : t('detail.badge.inspected', locale)}
                </span>
              ))}
            </div>
            {product.badges.includes('懒老板认证') && (
              <p className="mt-1.5 text-xs text-gray-500">{t('detail.verified', locale)}</p>
            )}
          </section>

          {/* Rating & Timestamp */}
          <section className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <StarRating value={product.rating} />
              <span className="ml-1 font-medium text-gray-700">{product.rating}</span>
              <span>({t('detail.platformReviews', locale).replace('{count}', product.reviewCount.toLocaleString())})</span>
            </span>
            {product.dataUpdatedAt && (
              <span className="inline-flex items-center gap-1">
                <FiClock className="h-3.5 w-3.5" />{t('detail.dataUpdatedAt', locale)} {product.dataUpdatedAt}
              </span>
            )}
          </section>

          {/* Content Cards */}
          {product.enterprise?.name && (
            <CompanyInfoSection enterprise={product.enterprise} supplierLinkId={supplierLinkId} />
          )}

          <ProductInfoSection product={product.product} />

          {Object.keys(product.platforms).length > 0 && (
            <PlatformReputationSection platforms={product.platforms} />
          )}

          {(product.reviews?.length || 0) > 0 && (
            <BuyerReviewsSection reviews={product.reviews} />
          )}

          {/* Connectable Resources (placeholder) */}
          {product.enterprise?.name && (
            <section className="card mb-4">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
                <FiTruck className="h-5 w-5 text-brand-500" />{t('detail.resources', locale)}
              </h2>
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-8 text-center">
                <FiPackage className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-400">{t('detail.noResources', locale)}</p>
              </div>
            </section>
          )}

          <CTASection
            favorited={favorited} favoriteLoading={favoriteLoading} cartLoading={cartLoading}
            onContact={() => setContactModalOpen(true)}
            onAddToCart={addToCart} onToggleFavorite={toggleFavorite}
          />

          {relatedItemsForDisplay.length > 0 && (
            <RelatedProductsGrid items={relatedItemsForDisplay} loading={relatedLoading} />
          )}

          {recentViews.length > 0 && <RecentViewsGrid items={recentViews} />}

          {/* AI Video CTA */}
          <section className="mt-6">
            <button onClick={() => setVideoModalOpen(true)}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 px-6 py-5 text-base font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.98]">
              <FiZap className="h-6 w-6" />{t('detail.aiVideo', locale)}
            </button>
          </section>

          <div className="mt-6 text-center">
            <Link href="/global-supply" className="inline-flex items-center gap-1 text-sm font-medium text-brand-400 transition-colors hover:text-brand-500">
              <FiArrowLeft className="h-4 w-4" />{t('detail.backToSupply', locale)}
            </Link>
          </div>

          <div className="mt-6 mb-4 text-center text-xs text-gray-400">
            {t('detail.dataSource', locale)} {formatDate(new Date().toISOString())}
          </div>
        </div>

        <BottomActionBar
          favorited={favorited} favoriteLoading={favoriteLoading} cartLoading={cartLoading}
          inCompare={inCompare}
          onToggleFavorite={toggleFavorite} onAddToCart={addToCart}
          onToggleCompare={() => { toggleItem(compareItem); setCompareDrawerOpen(true) }}
          onContact={() => setContactModalOpen(true)}
        />
      </main>

      <ContactModal open={contactModalOpen} onClose={() => setContactModalOpen(false)}
        supplierName={product.enterprise?.name} productId={Number(product.id)} />
      <VideoGenerateModal open={videoModalOpen} onClose={() => setVideoModalOpen(false)}
        productName={product.name} />
      <CompareDrawer open={compareDrawerOpen} onClose={() => setCompareDrawerOpen(false)} />
    </>
  )
}
