export interface SupplierProduct {
  id: number
  name: string
  description: string | null
  priceMin: number | null
  priceMax: number | null
  images: string | null
  rating: number | null
  reviewCount: number | null
  supportsDropShipping: boolean
  supportsOEM: boolean
  moq: number | null
}

export interface AggregatedReview {
  id: number
  platform: string
  rating: number
  reviewCount: number
  returnRate: number | null
  repurchaseRate: number | null
  keywords: string | null
  collectedAt: string
}

export interface SupplierDetail {
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
  contactName: string | null
  contactPhone: string | null
  companyIntro: string | null
  productCount: number
  inquiryCount: number
  products: SupplierProduct[]
  reviews: AggregatedReview[]
}

export interface SupplierDetailResponse {
  success: boolean
  data: SupplierDetail
}

export interface CollectionItem {
  id: number
  userId: string
  targetId: string
  targetType: string
  createdAt: string
}
