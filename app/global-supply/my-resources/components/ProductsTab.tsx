'use client'

import { FiPackage } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import SearchEmptyState from './SearchEmptyState'
import TabEmptyState from './TabEmptyState'
import ProductListItem from './ProductListItem'
import ProductGridItem from './ProductGridItem'
import type { ProductRecord } from '../types'
import type { ViewMode } from '../types'

interface ProductsTabProps {
  filteredProducts: ProductRecord[]
  productCount: number
  searchQuery: string
  viewMode: ViewMode
  unfavoriting: Set<string>
  onUnfavorite: (item: ProductRecord) => void
  onClearSearch: () => void
}

export default function ProductsTab({
  filteredProducts, productCount, searchQuery, viewMode,
  unfavoriting, onUnfavorite, onClearSearch,
}: ProductsTabProps) {
  const { locale } = useLocale()

  return (
    <>
      {filteredProducts.length === 0 && searchQuery && productCount > 0 && (
        <SearchEmptyState
          searchQuery={searchQuery}
          onClearSearch={onClearSearch}
          emptyTitle={t('search.result.empty', locale)}
          emptyDesc={t('search.result.emptyDesc', locale)}
          clearLabel={t('search.clear', locale)}
        />
      )}
      {filteredProducts.length === 0 && !searchQuery && (
        <TabEmptyState icon={FiPackage} title={t('resources.tab.products', locale)}
          description={t('resources.tab.products', locale)} actionLabel={t('cart.browseProducts', locale)} />
      )}
      {filteredProducts.length > 0 && viewMode === 'list' && (
        <div className="space-y-3">
          {filteredProducts.map(item => (
            <ProductListItem key={item.id} item={item}
              isUnfavoriting={unfavoriting.has(item.id)} onUnfavorite={onUnfavorite} />
          ))}
        </div>
      )}
      {filteredProducts.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(item => (
            <ProductGridItem key={item.id} item={item}
              isUnfavoriting={unfavoriting.has(item.id)} onUnfavorite={onUnfavorite} />
          ))}
        </div>
      )}
    </>
  )
}
