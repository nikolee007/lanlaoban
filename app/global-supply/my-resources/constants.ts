import type React from 'react'
import { FiHeart, FiUsers, FiMessageSquare, FiShoppingBag, FiList, FiBarChart2 } from 'react-icons/fi'
import type { TabKey, SortKey, InquiryRecord, InquiryProductRecord, CartItemRecord } from './types'

export const TABS: { key: TabKey; labelKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'products',        labelKey: 'resources.tab.products',   icon: FiHeart },
  { key: 'suppliers',       labelKey: 'resources.tab.suppliers', icon: FiUsers },
  { key: 'inquiry-products', labelKey: 'resources.tab.inquiries', icon: FiMessageSquare },
  { key: 'cart',            labelKey: 'resources.tab.cart',     icon: FiShoppingBag },
  { key: 'inquiries',       labelKey: 'resources.tab.inquiries', icon: FiList },
  { key: 'compare',         labelKey: 'resources.tab.compare',     icon: FiBarChart2 },
]

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'date-desc',  label: '收藏时间 latest' },
  { key: 'date-asc',   label: '收藏时间 earliest' },
  { key: 'price-asc',  label: '价格 low to high' },
  { key: 'price-desc', label: '价格 high to low' },
]

export const MOCK_INQUIRIES: InquiryRecord[] = [
  {
    id: 'inq_1',
    supplierName: '东莞华强电子科技有限公司',
    contactName: '张三',
    message: '请问这款蓝牙耳机的 MOQ 是多少？支持 OEM 定制吗？',
    createdAt: '2026-05-28T10:30:00Z',
    status: 'replied',
  },
  {
    id: 'inq_2',
    supplierName: '义乌小商品国际贸易有限公司',
    contactName: '李四',
    message: '我们想批量采购家居用品，有现货吗？',
    createdAt: '2026-05-25T14:20:00Z',
    status: 'pending',
  },
  {
    id: 'inq_3',
    supplierName: '广州白云皮具厂',
    contactName: '王五',
    message: '定制一批手提包，你们的起订量是多少？',
    createdAt: '2026-05-20T09:15:00Z',
    status: 'closed',
  },
  {
    id: 'inq_4',
    supplierName: '深圳华强北科技有限公司',
    contactName: '赵六',
    message: '你们的电子产品有没有 FCC/CE 认证？',
    createdAt: '2026-05-15T16:00:00Z',
    status: 'replied',
  },
  {
    id: 'inq_5',
    supplierName: '福建泉州鞋业有限公司',
    contactName: '孙七',
    message: '运动鞋可以定制品牌 Logo 吗？最小起订量多少双？',
    createdAt: '2026-05-10T09:30:00Z',
    status: 'closed',
  },
]

export const MOCK_INQUIRY_PRODUCTS: InquiryProductRecord[] = [
  {
    id: 'ip_1',
    productName: 'TWS蓝牙耳机 ANC主动降噪 蓝牙5.3',
    priceMin: 35,
    priceMax: 68,
    inquiryDate: '2026-05-28T10:30:00Z',
    status: 'replied',
    supplierName: '东莞华强电子科技有限公司',
  },
  {
    id: 'ip_2',
    productName: '智能手表 心率血氧监测 运动手环',
    priceMin: 88,
    priceMax: 158,
    inquiryDate: '2026-05-25T14:20:00Z',
    status: 'pending',
    supplierName: '深圳华强北科技有限公司',
  },
  {
    id: 'ip_3',
    productName: '便携式蓝牙音箱 IPX7防水 低音炮',
    priceMin: 55,
    priceMax: 120,
    inquiryDate: '2026-05-20T09:15:00Z',
    status: 'replied',
    supplierName: '广州白云电子厂',
  },
  {
    id: 'ip_4',
    productName: '无线充电器 15W快充 三合一折叠',
    priceMin: 28,
    priceMax: 52,
    inquiryDate: '2026-05-15T16:00:00Z',
    status: 'closed',
    supplierName: '东莞华强电子科技有限公司',
  },
  {
    id: 'ip_5',
    productName: '运动蓝牙耳机 挂耳式 跑步专用',
    priceMin: 42,
    priceMax: 78,
    inquiryDate: '2026-05-10T09:30:00Z',
    status: 'replied',
    supplierName: '福建泉州电子有限公司',
  },
]

export const MOCK_CART_ITEMS: CartItemRecord[] = [
  {
    id: 'ci_1',
    productName: '便携式蓝牙音箱 IPX7防水 低音炮',
    priceMin: 55,
    priceMax: 120,
    quantity: 500,
    addedAt: '2026-05-30T14:00:00Z',
  },
  {
    id: 'ci_2',
    productName: 'TWS蓝牙耳机 ANC主动降噪 蓝牙5.3',
    priceMin: 35,
    priceMax: 68,
    quantity: 1000,
    addedAt: '2026-05-28T10:30:00Z',
  },
  {
    id: 'ci_3',
    productName: '智能手表 心率血氧监测 运动手环',
    priceMin: 88,
    priceMax: 158,
    quantity: 200,
    addedAt: '2026-05-25T14:20:00Z',
  },
  {
    id: 'ci_4',
    productName: 'USB-C 数据线 快充 编织线 1.2m',
    priceMin: 5,
    priceMax: 12,
    quantity: 5000,
    addedAt: '2026-05-22T09:00:00Z',
  },
]

export const INQUIRY_STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: '待回复', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  replied: { label: '已回复', color: 'bg-green-50 text-green-700 border-green-200' },
  closed:  { label: '已关闭', color: 'bg-gray-50 text-gray-500 border-gray-200' },
}
