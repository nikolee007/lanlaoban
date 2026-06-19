// ── Types ──
export interface CertTag {
  label: string
  color: string
}

export interface SearchResultItem {
  id: string
  type: 'product' | 'factory'
  name: string
  location: string
  rating: number
  reviewCount: number
  tags: CertTag[]
  trendTag?: { text: string; hot?: boolean }
  minOrder: number
  dropship: boolean
  updatedAt: string
  // Product-specific
  priceMin?: number
  priceMax?: number
  monthlySales?: number
  priceSmallBatch?: number
  priceBulkThreshold?: number
  // Factory-specific
  categories?: string[]
  yearEstablished?: number
  employeeCount?: string
  // Enhanced fields
  certified: boolean
  channelCount: number
  channelNames?: string[]
}

export interface InsightCard {
  title: string
  content: string
  trendData: { label: string; value: number; change: string; direction: 'up' | 'down' | 'flat' }[]
}

export interface FilterOption {
  label: string
  value: string
}

export interface FilterGroup {
  key: string
  label: string
  options: FilterOption[]
}

export interface ApiProduct {
  id: number
  name: string
  description: string | null
  priceMin: number | null
  priceMax: number | null
  currency: string
  moq: number | null
  supportsDropShipping: boolean
  supportsOEM: boolean
  images: string | null
  certifications: string | null
  salesData: string | null
  rating: number | null
  reviewCount: number | null
  monthlySales?: number | null
  updatedAt: string
  supplier: {
    id: number
    nameZh: string
    nameEn: string
    location: string
    rating: number
    isVerified?: boolean
  } | null
  category: { id: number; name: string } | null
}

export interface ApiSupplier {
  id: number
  nameZh: string
  nameEn: string
  location: string
  yearEstablished: number
  employeeCount: number
  annualExportRevenue: number | null
  certifications: string
  businessTags: string
  exportDestinations: string
  rating: number
  reviewCount: number
  isVerified: boolean
  updatedAt: string
  type: string
}

export interface UnpackedSearchData {
  products: ApiProduct[]
  suppliers: ApiSupplier[]
  total: number
}

export const HISTORY_KEY = 'gs-search-history'

export const ITEMS_PER_PAGE = 10

// ── Category keyword map (for server-side filtering) ──
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  electronics: ['蓝牙耳机', '智能手表', '蓝牙音箱', '数据线', '体脂秤', '充电宝', '移动电源', '自拍杆'],
  home: ['手机支架', '收纳', '家居', '保温杯', '猫抓板'],
  toys: ['玩具'],
  fashion: ['服饰', '箱包'],
  beauty: ['美妆', '个护', '护肤'],
  pet: ['猫抓板', '宠物'],
  sports: ['瑜伽垫', '运动'],
}

// ── UI Config ──
export const FILTER_GROUPS: FilterGroup[] = [
  {
    key: 'category',
    label: '品类',
    options: [
      { label: '全部品类', value: '' },
      { label: '消费电子', value: 'electronics' },
      { label: '家居百货', value: 'home' },
      { label: '玩具', value: 'toys' },
      { label: '服饰箱包', value: 'fashion' },
      { label: '美妆个护', value: 'beauty' },
      { label: '宠物用品', value: 'pet' },
      { label: '运动户外', value: 'sports' },
    ],
  },
  {
    key: 'region',
    label: '地区',
    options: [
      { label: '全部地区', value: '' },
      { label: '深圳', value: '深圳' },
      { label: '广州', value: '广州' },
      { label: '东莞', value: '东莞' },
      { label: '义乌', value: '义乌' },
      { label: '汕头', value: '汕头' },
      { label: '佛山', value: '佛山' },
    ],
  },
  {
    key: 'minOrder',
    label: '起订量',
    options: [
      { label: '不限', value: '' },
      { label: '1-100件', value: '1-100' },
      { label: '100-1000件', value: '100-1000' },
      { label: '1000+件', value: '1000+' },
    ],
  },
  {
    key: 'cert',
    label: '出口资质',
    options: [
      { label: '不限', value: '' },
      { label: 'CE', value: 'CE' },
      { label: 'FCC', value: 'FCC' },
      { label: 'RoHS', value: 'RoHS' },
      { label: 'FDA', value: 'FDA' },
    ],
  },
  {
    key: 'rating',
    label: '口碑',
    options: [
      { label: '不限', value: '' },
      { label: '4.5星+', value: '4.5' },
      { label: '4.0星+', value: '4.0' },
      { label: '3.5星+', value: '3.5' },
    ],
  },
]

export const SORT_OPTIONS: FilterOption[] = [
  { label: '综合推荐', value: 'default' },
  { label: '月销量', value: 'sales' },
  { label: '价格低到高', value: 'price-asc' },
  { label: '价格高到低', value: 'price-desc' },
  { label: '评分最高', value: 'rating' },
]

export const INSIGHT: InsightCard = {
  title: '懒老板选品洞察',
  content: '蓝牙耳机在东南亚 TikTok 搜索量月度增长 40%，印尼、菲律宾、泰国为主要市场。建议关注主动降噪（ANC）功能款，客单价 $15-25 区间转化率最高。',
  trendData: [
    { label: '蓝牙耳机', value: 40, change: '+40%', direction: 'up' },
    { label: '智能手表', value: 28, change: '+28%', direction: 'up' },
    { label: '蓝牙音箱', value: 18, change: '+18%', direction: 'up' },
    { label: '数据线', value: 12, change: '+12%', direction: 'flat' },
    { label: '手机支架', value: 8, change: '+8%', direction: 'flat' },
  ],
}

// ── Colored certification tags ──
const CERT_GREEN = ['CE', 'FCC', 'RoHS', 'FDA', 'EN71', 'GMP', 'ISO22716', 'BSCI']

// ── localStorage helpers (all try-catch) ──

export function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveSearchHistory(query: string): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getSearchHistory()
    const updated = [query.trim(), ...existing.filter((h) => h !== query.trim())].slice(0, 10)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  } catch {
    // Silently fail — history is non-critical
  }
}

export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {
    // Silently fail — history is non-critical
  }
}

// ── API response unwrapper ──
// API responses are always { success, data: { items: [...] } } or { success, data: [...] }
// Must unwrap layer by layer, cannot treat apiResponse as array directly
export function unpackApiResponse<T>(json: any): T {
  if (!json) return {} as T
  const data = json?.data || json || {}
  return data as T
}

// ── Search API response unwrapper ──
export function unpackSearchData(json: any): UnpackedSearchData {
  const data = unpackApiResponse<any>(json)
  return {
    products: Array.isArray(data.products) ? data.products : [],
    suppliers: Array.isArray(data.suppliers) ? data.suppliers : [],
    total: typeof data.total === 'number' ? data.total : 0,
  }
}

// ── Helpers ──

export function daysAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '今天'
  if (diff === 1) return '1天前'
  return `${diff}天前`
}

export function parsePrefixedId(prefixed: string): { type: 'product' | 'supplier'; id: string } | null {
  const match = prefixed.match(/^(p|s)_(\d+)$/)
  if (!match) return null
  return {
    type: match[1] === 'p' ? 'product' : 'supplier',
    id: match[2],
  }
}

export function collectionKey(prefixed: string): string {
  const parsed = parsePrefixedId(prefixed)
  return parsed ? `${parsed.type}:${parsed.id}` : prefixed
}

export function safeJsonParse(input: string | null | undefined): string[] {
  if (!input) return []
  try {
    const parsed = JSON.parse(input)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function tagColor(label: string): string {
  if (label === 'OEM') return 'bg-blue-50 text-blue-700'
  if (label === 'ODM') return 'bg-purple-50 text-purple-700'
  if (CERT_GREEN.includes(label)) return 'bg-green-50 text-green-700'
  return 'bg-amber-50 text-amber-700'
}

export function mapSortParam(sort: string): string | undefined {
  switch (sort) {
    case 'sales': return 'sales'
    case 'price-asc': return 'price'
    case 'price-desc': return 'price-desc'
    case 'rating': return 'rating'
    default: return undefined
  }
}

export function applyMinOrderFilter(items: SearchResultItem[], minOrder: string): SearchResultItem[] {
  const [min, max] = minOrder.split('-').map(Number)
  if (max) {
    return items.filter((i) => i.minOrder >= min && i.minOrder <= max)
  }
  return items.filter((i) => i.minOrder >= 1000)
}

export function mapSearchResults(data: UnpackedSearchData): SearchResultItem[] {
  const products: SearchResultItem[] = (data.products || []).map((p) => {
    const certifications = safeJsonParse(p.certifications)
    const tags: CertTag[] = []
    if (p.supportsOEM) {
      tags.push({ label: 'OEM', color: tagColor('OEM') })
    }
    certifications.forEach((cert) => {
      if (!tags.some((t) => t.label === cert)) {
        tags.push({ label: cert, color: tagColor(cert) })
      }
    })

    return {
      id: `p_${p.id}`,
      type: 'product',
      name: p.name,
      location: p.supplier?.location || '',
      rating: p.rating || 0,
      reviewCount: p.reviewCount || 0,
      tags,
      minOrder: p.moq || 0,
      dropship: p.supportsDropShipping,
      monthlySales: p.monthlySales ?? 0,
      updatedAt: p.updatedAt,
      priceMin: p.priceMin || undefined,
      priceMax: p.priceMax || undefined,
      priceSmallBatch: p.priceMax || p.priceMin || undefined,
      priceBulkThreshold: p.moq || undefined,
      certified: p.supplier?.isVerified || false,
      channelCount: 0,
      channelNames: [],
    }
  })

  const suppliers: SearchResultItem[] = (data.suppliers || []).map((s) => {
    const businessTags = safeJsonParse(s.businessTags)
    const certifications = safeJsonParse(s.certifications)
    const tags: CertTag[] = []

    businessTags.forEach((tag) => {
      tags.push({ label: tag, color: tagColor(tag) })
    })
    certifications.forEach((cert) => {
      if (!tags.some((t) => t.label === cert)) {
        tags.push({ label: cert, color: tagColor(cert) })
      }
    })

    return {
      id: `s_${s.id}`,
      type: 'factory',
      name: s.nameZh,
      location: s.location,
      rating: s.rating,
      reviewCount: s.reviewCount,
      tags,
      minOrder: 0,
      dropship: false,
      updatedAt: s.updatedAt,
      certified: s.isVerified,
      channelCount: 0,
      channelNames: [],
      yearEstablished: s.yearEstablished,
      employeeCount: `${s.employeeCount}人`,
      categories: businessTags.length > 0 ? businessTags : undefined,
    }
  })

  return [...products, ...suppliers]
}

export function mapProductResults(items: any[]): SearchResultItem[] {
  return (items || []).map((p) => {
    const certifications = safeJsonParse(p.certifications)
    const tags: CertTag[] = []
    if (p.supportsOEM) {
      tags.push({ label: 'OEM', color: tagColor('OEM') })
    }
    certifications.forEach((cert) => {
      if (!tags.some((t) => t.label === cert)) {
        tags.push({ label: cert, color: tagColor(cert) })
      }
    })

    return {
      id: `p_${p.id}`,
      type: 'product',
      name: p.name,
      location: p.supplier?.location || '',
      rating: p.rating || 0,
      reviewCount: p.reviewCount || 0,
      tags,
      minOrder: p.moq || 0,
      dropship: p.supportsDropShipping,
      monthlySales: p.monthlySales ?? 0,
      updatedAt: p.updatedAt,
      priceMin: p.priceMin || undefined,
      priceMax: p.priceMax || undefined,
      priceSmallBatch: p.priceMax || p.priceMin || undefined,
      priceBulkThreshold: p.moq || undefined,
      certified: p.supplier?.isVerified || false,
      channelCount: 0,
      channelNames: [],
    }
  })
}
