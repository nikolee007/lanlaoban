'use client'

import { FiShoppingBag, FiMessageSquare, FiBarChart2, FiTrash2, FiChevronRight, FiPackage } from 'react-icons/fi'
import Link from 'next/link'
import TabEmptyState from './TabEmptyState'
import InquiryProductListItem from './InquiryProductListItem'
import CartItemRow from './CartItemRow'
import InquiryListItem from './InquiryListItem'
import CompareItemCard from './CompareItemCard'
import { MOCK_INQUIRY_PRODUCTS, MOCK_CART_ITEMS, MOCK_INQUIRIES } from '../constants'
import type { CompareItem } from '@/app/contexts/CompareContext'

interface MockTabsProps {
  compareItems: CompareItem[]
  onRemoveCompare: (item: CompareItem) => void
  onClearCompare: () => void
}

export function InquiredProductsTab() {
  return (
    <>
      {MOCK_INQUIRY_PRODUCTS.length === 0 && (
        <TabEmptyState icon={FiPackage} title="还没有询价的商品"
          description="联系供应商询价后，已询价的商品会显示在这里" actionLabel="去发现好货" />
      )}
      {MOCK_INQUIRY_PRODUCTS.length > 0 && (
        <div className="space-y-3">
          {MOCK_INQUIRY_PRODUCTS.map(item => <InquiryProductListItem key={item.id} item={item} />)}
          <p className="text-center text-xs text-gray-400 pt-2 pb-4">
            已询价商品列表从 /api/global-supply/inquiries 获取，API 就绪后自动对接
          </p>
        </div>
      )}
    </>
  )
}

export function CartTab() {
  return (
    <>
      {MOCK_CART_ITEMS.length === 0 && (
        <TabEmptyState icon={FiShoppingBag} title="采购清单还是空的"
          description="添加商品到采购清单，方便统一管理和跟进采购进度" actionLabel="去发现好货" />
      )}
      {MOCK_CART_ITEMS.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">共 {MOCK_CART_ITEMS.length} 件商品</p>
          </div>
          <div className="space-y-3">
            {MOCK_CART_ITEMS.map(item => <CartItemRow key={item.id} item={item} />)}
          </div>
          <p className="text-center text-xs text-gray-400 pt-4 pb-4">
            采购清单从 /api/global-supply/cart 获取，API 就绪后自动对接
          </p>
        </>
      )}
    </>
  )
}

export function InquiriesTab() {
  return (
    <>
      {MOCK_INQUIRIES.length === 0 && (
        <TabEmptyState icon={FiMessageSquare} title="还没有询盘记录"
          description="联系供应商后，询盘记录会显示在这里，方便你追踪沟通进度" actionLabel="去发现好货" />
      )}
      {MOCK_INQUIRIES.length > 0 && (
        <div className="space-y-3">
          {MOCK_INQUIRIES.map(inquiry => <InquiryListItem key={inquiry.id} inquiry={inquiry} />)}
          <p className="text-center text-xs text-gray-400 pt-2 pb-4">
            询盘记录 API 即将上线，届时将同步所有联系历史
          </p>
        </div>
      )}
    </>
  )
}

export function CompareTab({ compareItems, onRemoveCompare, onClearCompare }: MockTabsProps) {
  return (
    <>
      {compareItems.length === 0 && (
        <TabEmptyState icon={FiBarChart2} title="还没有对比商品"
          description="在商品列表中勾选添加到对比，最多同时对比 4 件商品" actionLabel="去发现好货" />
      )}
      {compareItems.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">
              已对比 {compareItems.length} 件商品
              {compareItems.length < 4 && <span> （还可添加 {4 - compareItems.length} 件）</span>}
            </p>
            <button onClick={onClearCompare}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <FiTrash2 className="w-3.5 h-3.5" />
              清空全部
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {compareItems.map(item => (
              <CompareItemCard key={item.id} item={item} onRemove={onRemoveCompare} />
            ))}
          </div>
          {compareItems.length >= 2 && (
            <div className="mt-6 flex justify-center">
              <Link href="/global-supply/search"
                className="inline-flex items-center gap-2 bg-brand-400 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-500 transition-all hover:shadow-lg hover:shadow-brand-400/20 active:scale-[0.98]">
                <FiShoppingBag className="w-4 h-4" />
                继续发现好货
                <FiChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </>
      )}
    </>
  )
}
