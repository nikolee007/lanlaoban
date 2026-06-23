import { productPlaceholderSVG } from '@/lib/product-placeholder'
import type { ApiProductResponse, UIProductData, UIRelatedProduct, UIReview, UIPlatformRating } from './types'
import type { RelatedListItem } from './types'

export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return ''
  }
}

export function transformProductData(apiData: ApiProductResponse['data']): UIProductData {
  const supplier = apiData.supplier

  const images = safeJsonParse<string[]>(apiData.images, [])
  if (images.length === 0) {
    images.push(productPlaceholderSVG(apiData.name || "商品", 800, 600, apiData.id))
  }

  const certifications = safeJsonParse<string[]>(apiData.certifications, [])
  const businessTags = safeJsonParse<string[]>(supplier?.businessTags ?? null, [])
  const exportDests = safeJsonParse<string[]>(supplier?.exportDestinations ?? null, [])

  const annualExportVal = supplier?.annualExportRevenue ?? 0
  const annualExportDisplay = annualExportVal > 0
    ? `约 $${(annualExportVal / 100).toFixed(0)}M / 年`
    : ''

  const priceMin = apiData.priceMin ?? 0
  const priceMax = apiData.priceMax ?? 0
  const priceRange = `¥${priceMin} - ¥${priceMax}`
  const moqDisplay = apiData.moq ? `${apiData.moq} 件` : '--'

  const platforms: Record<string, UIPlatformRating> = {}
  for (const ar of apiData.aggregatedReviews || []) {
    platforms[ar.platform] = {
      rating: ar.rating,
      reviewCount: ar.reviewCount,
      collectedAt: formatDate(ar.collectedAt),
    }
  }

  const reviews: UIReview[] = (apiData.aggregatedReviews || []).map((ar) => {
    const keywords = safeJsonParse<string[]>(ar.keywords, [])
    const content = keywords.length > 0
      ? `平台评分 ${ar.rating}/5，共 ${ar.reviewCount} 条评价。买家常提关键词：${keywords.slice(0, 4).join('、')}。`
      : `平台评分 ${ar.rating}/5，共 ${ar.reviewCount} 条评价。`
    return {
      id: `agg-${ar.id}`,
      username: `${ar.platform} 平台`,
      avatar: ar.platform.charAt(0),
      rating: ar.rating,
      content,
      time: formatDate(ar.collectedAt),
      platform: ar.platform,
    }
  })

  const relatedProducts: UIRelatedProduct[] = (apiData.relatedProducts || []).map((rp) => {
    const rpImages = safeJsonParse<string[]>(rp.images, [])
    return {
      id: String(rp.id),
      name: rp.name,
      image: rpImages[0] || productPlaceholderSVG(rp.name || "相关商品", 400, 300, rp.id),
      price: `¥${rp.priceMin ?? '?'} - ¥${rp.priceMax ?? '?'}`,
      rating: rp.rating ?? 0,
      reviews: rp.reviewCount ?? 0,
      supplier: rp.supplier?.nameZh ?? '',
    }
  })

  const specs: Record<string, string> = {}
  if (apiData.description) {
    specs['产品描述'] = apiData.description
  }
  if (apiData.supportsOEM) {
    specs['OEM 定制'] = '支持'
  }

  return {
    id: String(apiData.id),
    name: apiData.name,
    badges: supplier?.isVerified ? ['懒老板认证', '实地验厂'] : [],
    rating: apiData.rating ?? supplier?.rating ?? 0,
    reviewCount: apiData.reviewCount ?? supplier?.reviewCount ?? 0,
    dataUpdatedAt: formatDate(apiData.updatedAt),
    images,
    categoryId: apiData.categoryId,
    enterprise: {
      name: supplier?.nameZh ?? '',
      location: supplier?.location ?? '',
      established: supplier?.yearEstablished ?? 0,
      employeeCount: supplier?.employeeCount ?? 0,
      annualExport: annualExportDisplay,
      certifications,
      mainBusiness: businessTags.join('、'),
      exportDestinations: exportDests,
      partnerBrands: [],
      monthlyCapacity: '',
      deliveryCycle: '',
      paymentMethods: [],
    },
    product: {
      priceRange,
      moq: moqDisplay,
      dropshipping: apiData.supportsDropShipping,
      oem: apiData.supportsOEM,
      specs,
    },
    platforms,
    reviews,
    relatedProducts,
  }
}

export function transformRelatedItem(item: RelatedListItem, currentId: number): UIRelatedProduct | null {
  if (item.id === currentId) return null
  const rpImages = safeJsonParse<string[]>(item.images, [])
  return {
    id: String(item.id),
    name: item.name,
    image: rpImages[0] || productPlaceholderSVG(item.name || "相关商品", 400, 300, item.id),
    price: `¥${item.priceMin ?? '?'} - ¥${item.priceMax ?? '?'}`,
    rating: item.rating ?? 0,
    reviews: item.reviewCount ?? 0,
    supplier: item.supplier?.nameZh ?? '',
  }
}
