export const REGION_OPTIONS = [
  { label: '全部地区', value: '' },
  { label: '深圳', value: '深圳' },
  { label: '广州', value: '广州' },
  { label: '东莞', value: '东莞' },
  { label: '义乌', value: '义乌' },
  { label: '汕头', value: '汕头' },
  { label: '佛山', value: '佛山' },
]

export const CERTIFICATION_OPTIONS = [
  { label: '不限', value: '' },
  { label: 'CE', value: 'CE' },
  { label: 'FCC', value: 'FCC' },
  { label: 'RoHS', value: 'RoHS' },
  { label: 'FDA', value: 'FDA' },
]

export const RATING_OPTIONS = [
  { label: '不限', value: '' },
  { label: '4.5星+', value: '4.5' },
  { label: '4.0星+', value: '4.0' },
  { label: '3.5星+', value: '3.5' },
]

export const SORT_OPTIONS = [
  { label: '综合推荐', value: 'default' },
  { label: '评分最高', value: 'rating' },
  { label: '最多商品', value: 'products' },
  { label: '最新入驻', value: 'newest' },
]

export const ITEMS_PER_PAGE = 12

export function safeJsonParse(input: string | null | undefined): string[] {
  if (!input) return []
  try {
    const parsed = JSON.parse(input)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
