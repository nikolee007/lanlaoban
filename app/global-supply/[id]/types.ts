export interface ApiAggregatedReview {
  id: number
  platform: string
  rating: number
  reviewCount: number
  returnRate: number | null
  repurchaseRate: number | null
  keywords: string | null
  collectedAt: string
}

export interface ApiProductResponse {
  success: boolean
  data: {
    id: number
    name: string
    description: string | null
    supplierId: number
    priceMin: number | null
    priceMax: number | null
    moq: number | null
    supportsDropShipping: boolean
    supportsOEM: boolean
    images: string | null
    certifications: string | null
    rating: number | null
    reviewCount: number | null
    updatedAt: string
    categoryId: number | null
    supplier: {
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
      type: string
    } | null
    aggregatedReviews: ApiAggregatedReview[]
    relatedProducts: Array<{
      id: number
      name: string
      priceMin: number | null
      priceMax: number | null
      images: string | null
      rating: number | null
      reviewCount: number | null
      supplier: { nameZh: string; nameEn: string; location: string } | null
    }>
  }
}

export interface CollectionItem {
  id: number
  userId: string
  targetId: string
  targetType: string
  createdAt: string
}

export interface CollectionsResponse {
  success: boolean
  data: CollectionItem[]
}

export interface RelatedListItem {
  id: number
  name: string
  priceMin: number | null
  priceMax: number | null
  images: string | null
  rating: number | null
  reviewCount: number | null
  supplier: { nameZh: string; nameEn: string; location: string } | null
}

export interface RelatedProductsResponse {
  success: boolean
  data: {
    items: RelatedListItem[]
    total: number
    page: number
    pageSize: number
  }
}

export interface UIEnterprise {
  name: string
  location: string
  established: number
  employeeCount: number
  annualExport: string
  certifications: string[]
  mainBusiness: string
  exportDestinations: string[]
  partnerBrands: string[]
  monthlyCapacity: string
  deliveryCycle: string
  paymentMethods: string[]
}

export interface UIProduct {
  priceRange: string
  moq: string
  dropshipping: boolean
  oem: boolean
  specs: Record<string, string>
}

export interface UIPlatformRating {
  rating: number
  reviewCount: number
  collectedAt: string
}

export interface UIReview {
  id: string
  username: string
  avatar: string
  rating: number
  content: string
  time: string
  platform: string
}

export interface UIRelatedProduct {
  id: string
  name: string
  image: string
  price: string
  rating: number
  reviews: number
  supplier: string
}

export interface UIProductData {
  id: string
  name: string
  badges: string[]
  rating: number
  reviewCount: number
  dataUpdatedAt: string
  images: string[]
  categoryId: number | null
  enterprise: UIEnterprise
  product: UIProduct
  platforms: Record<string, UIPlatformRating>
  reviews: UIReview[]
  relatedProducts: UIRelatedProduct[]
}

export interface RecentViewItem {
  id: string
  name: string
  image: string
  price: string
}
