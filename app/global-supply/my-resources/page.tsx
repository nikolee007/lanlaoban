'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import Breadcrumb from '../../components/Breadcrumb'
import { FiHeart, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { loadProductImageMap, setProductImageMap } from '@/lib/product-placeholder'
import { useToast } from '../../contexts/ToastContext'
import { useCompare } from '../../contexts/CompareContext'
import type { CompareItem } from '../../contexts/CompareContext'
import { parseBusinessTags } from './utils'
import type {
  TabKey, SortKey, ViewMode,
  ApiCollectionItem, ApiProductTarget, ApiSupplierTarget, ApiResponse,
  ProductRecord, SupplierRecord,
} from './types'
import TabBar from './components/TabBar'
import SearchToolbar from './components/SearchToolbar'
import LoadingSkeleton from './components/LoadingSkeleton'
import PageHeader from './components/PageHeader'
import ProductsTab from './components/ProductsTab'
import SuppliersTab from './components/SuppliersTab'
import { InquiredProductsTab, CartTab, InquiriesTab, CompareTab } from './components/MockTabs'

export default function MyResourcesPage() {
  const { locale } = useLocale()
  const compareCtx = useCompare()

  const [collections, setCollections] = useState<ApiCollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [unfavoriting, setUnfavoriting] = useState<Set<string>>(new Set())

  const [activeTab, setActiveTab] = useState<TabKey>('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date-desc')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const { showToast } = useToast()

  const compareItems = compareCtx.items

  const fetchCollections = useCallback(() => {
    setLoading(true)
    setError('')
    const t = localStorage.getItem("lanlaoban_token");
    fetch("/api/global-supply/collections", {
      headers: t ? { "Authorization": `Bearer ${t}` } : {},
    })
      .then(res => res.json())
      .then((response: ApiResponse) => {
        if (!response.success) throw new Error('获取收藏数据失败')
        setCollections(Array.isArray(response.data) ? response.data : [])
      })
      .catch(err => {
        setError(err.message || '网络错误，请稍后重试')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadProductImageMap().then(setProductImageMap)
  }, [])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  const { productRecords, supplierRecords } = useMemo(() => {
    const products: ProductRecord[] = []
    const suppliers: SupplierRecord[] = []

    for (const col of collections) {
      if (col.targetType === 'product' && col.target) {
        const t = col.target as ApiProductTarget
        products.push({
          id: `p_${col.targetId}`, collectionId: col.id, targetId: col.targetId,
          name: t.name || '', priceMin: t.priceMin, priceMax: t.priceMax,
          savedAt: col.createdAt, rating: t.rating,
        })
      } else if (col.targetType === 'supplier' && col.target) {
        const t = col.target as ApiSupplierTarget
        suppliers.push({
          id: `s_${col.targetId}`, collectionId: col.id, targetId: col.targetId,
          name: t.nameZh || t.nameEn || '', nameZh: t.nameZh, nameEn: t.nameEn,
          location: t.location, rating: t.rating, isVerified: t.isVerified,
          businessTags: parseBusinessTags(t.businessTags), savedAt: col.createdAt,
        })
      }
    }

    return { productRecords: products, supplierRecords: suppliers }
  }, [collections])

  const productCount = productRecords.length
  const supplierCount = supplierRecords.length
  const totalCount = productCount + supplierCount

  const filteredProducts = useMemo(() => {
    let items = [...productRecords]
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      items = items.filter(r => r.name.toLowerCase().includes(q))
    }
    switch (sortKey) {
      case 'date-desc':
        items.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
        break
      case 'date-asc':
        items.sort((a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime())
        break
      case 'price-asc':
        items.sort((a, b) => (a.priceMin ?? Infinity) - (b.priceMin ?? Infinity))
        break
      case 'price-desc':
        items.sort((a, b) => (b.priceMin ?? 0) - (a.priceMin ?? 0))
        break
    }
    return items
  }, [productRecords, searchQuery, sortKey])

  const filteredSuppliers = useMemo(() => {
    let items = [...supplierRecords]
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      items = items.filter(r => r.name.toLowerCase().includes(q))
    }
    return items
  }, [supplierRecords, searchQuery])

  const handleUnfavorite = useCallback(async (item: ProductRecord | SupplierRecord) => {
    const targetType = item.id.startsWith('p_') ? 'product' : 'supplier'
    setUnfavoriting(prev => new Set(prev).add(item.id))
    try {
      const t = localStorage.getItem('lanlaoban_token')
      const res = await fetch('/api/global-supply/collections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(t ? { 'Authorization': `Bearer ${t}` } : {}) },
        body: JSON.stringify({ targetId: item.targetId, targetType }),
      })
      if (!res.ok) throw new Error('取消失败')
      setCollections(prev => prev.filter(c => String(c.targetId) !== item.targetId))
    } catch {
      showToast('取消失败，请重试', 'error')
    } finally {
      setUnfavoriting(prev => { const next = new Set(prev); next.delete(item.id); return next })
    }
  }, [showToast])

  const handleRemoveCompare = useCallback((item: CompareItem) => {
    compareCtx.removeItem(item.id)
    showToast('已从对比清单移除', 'success')
  }, [compareCtx, showToast])

  const handleClearCompare = useCallback(() => {
    compareCtx.clearAll()
    showToast('已清空对比清单', 'success')
  }, [compareCtx, showToast])

  const handleClearSearch = useCallback(() => setSearchQuery(''), [])

  const tabBadge = useCallback((key: TabKey): number | null => {
    switch (key) {
      case 'products': return productCount
      case 'suppliers': return supplierCount
      case 'inquiries': return 5
      case 'inquiry-products': return 5
      case 'cart': return 4
      case 'compare': return compareItems.length
    }
  }, [productCount, supplierCount, compareItems.length])

  const handleTabChange = useCallback((key: TabKey) => {
    setActiveTab(key)
    setSearchQuery('')
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader />
        <main className="max-w-5xl mx-auto px-4 py-6"><LoadingSkeleton /></main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center py-20">
            <FiAlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">加载失败</h2>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button onClick={fetchCollections}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-brand-400 hover:bg-brand-500 px-5 py-2.5 rounded-xl transition-all">
              <FiRefreshCw className="w-4 h-4" />重新加载
            </button>
          </div>
        </main>
      </div>
    )
  }

  const showSearchBar = activeTab === 'products' || activeTab === 'suppliers'

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumb
          items={[
            { label: '懒老板', href: '/' },
            { label: t('nav.supply', locale), href: '/global-supply' },
            { label: t('nav.resources', locale) },
          ]}
          className="mb-4"
        />

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
            <FiHeart className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('nav.resources', locale)}</h1>
            <p className="text-xs text-gray-400">
              {totalCount > 0 ? `共收藏 ${totalCount} 件资源` : '收藏你感兴趣的商品和供应商'}
            </p>
          </div>
        </div>

        <TabBar activeTab={activeTab} onTabChange={handleTabChange} tabBadge={tabBadge} />

        {showSearchBar && (
          <SearchToolbar
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            activeTab={activeTab} sortKey={sortKey} setSortKey={setSortKey}
            viewMode={viewMode} setViewMode={setViewMode} onClearSearch={handleClearSearch}
          />
        )}

        {searchQuery && (
          <p className="text-xs text-gray-400 mb-3">
            {t('search.result', locale)} {activeTab === 'products' ? filteredProducts.length : filteredSuppliers.length} {t('search.results', locale)}
          </p>
        )}

        {activeTab === 'products' && (
          <ProductsTab
            filteredProducts={filteredProducts} productCount={productCount}
            searchQuery={searchQuery} viewMode={viewMode}
            unfavoriting={unfavoriting} onUnfavorite={handleUnfavorite}
            onClearSearch={handleClearSearch}
          />
        )}

        {activeTab === 'suppliers' && (
          <SuppliersTab
            filteredSuppliers={filteredSuppliers} supplierCount={supplierCount}
            searchQuery={searchQuery} unfavoriting={unfavoriting}
            onUnfavorite={handleUnfavorite} onClearSearch={handleClearSearch}
          />
        )}

        {activeTab === 'inquiry-products' && <InquiredProductsTab />}
        {activeTab === 'cart' && <CartTab />}
        {activeTab === 'inquiries' && <InquiriesTab />}
        {activeTab === 'compare' && (
          <CompareTab
            compareItems={compareItems}
            onRemoveCompare={handleRemoveCompare}
            onClearCompare={handleClearCompare}
          />
        )}
      </main>
    </div>
  )
}
