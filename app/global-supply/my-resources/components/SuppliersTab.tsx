'use client'

import { FiUsers } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import SearchEmptyState from './SearchEmptyState'
import TabEmptyState from './TabEmptyState'
import SupplierListItem from './SupplierListItem'
import type { SupplierRecord } from '../types'

interface SuppliersTabProps {
  filteredSuppliers: SupplierRecord[]
  supplierCount: number
  searchQuery: string
  unfavoriting: Set<string>
  onUnfavorite: (item: SupplierRecord) => void
  onClearSearch: () => void
}

export default function SuppliersTab({
  filteredSuppliers, supplierCount, searchQuery,
  unfavoriting, onUnfavorite, onClearSearch,
}: SuppliersTabProps) {
  const { locale } = useLocale()

  return (
    <>
      {filteredSuppliers.length === 0 && searchQuery && supplierCount > 0 && (
        <SearchEmptyState
          searchQuery={searchQuery}
          onClearSearch={onClearSearch}
          emptyTitle={`没有找到 "${searchQuery}"`}
          emptyDesc="试试换个关键词搜索"
          clearLabel="清除搜索"
        />
      )}
      {filteredSuppliers.length === 0 && !searchQuery && (
        <TabEmptyState icon={FiUsers} title={t('resources.tab.suppliers', locale)}
          description={t('resources.tab.suppliers', locale)} actionLabel={t('cart.browseProducts', locale)} />
      )}
      {filteredSuppliers.length > 0 && (
        <div className="space-y-3">
          {filteredSuppliers.map(item => (
            <SupplierListItem key={item.id} item={item}
              isUnfavoriting={unfavoriting.has(item.id)} onUnfavorite={onUnfavorite} />
          ))}
        </div>
      )}
    </>
  )
}
