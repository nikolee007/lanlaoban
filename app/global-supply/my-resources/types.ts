export type TabKey = 'products' | 'suppliers' | 'inquiries' | 'inquiry-products' | 'cart' | 'compare'

export type SortKey = 'date-desc' | 'date-asc' | 'price-asc' | 'price-desc'

export type ViewMode = 'list' | 'grid'

/** Collection target — shape returned by the API */
export interface ApiProductTarget {
  id: number
  name: string
  priceMin: number | null
  priceMax: number | null
  currency: string
  images: string | null
  rating: number | null
}

export interface ApiSupplierTarget {
  id: number
  nameZh: string | null
  nameEn: string | null
  location: string | null
  rating: number | null
  isVerified: boolean
  businessTags: string | null
}

export interface ApiCollectionItem {
  id: number
  userId: number
  targetId: string
  targetType: 'product' | 'supplier'
  userNote: string | null
  createdAt: string
  target: ApiProductTarget | ApiSupplierTarget | null
}

export interface ApiResponse {
  success: boolean
  data: ApiCollectionItem[]
  error?: string
}

/** Display types after mapping */
export interface ProductRecord {
  id: string
  collectionId: number
  targetId: string
  name: string
  priceMin: number | null
  priceMax: number | null
  savedAt: string
  rating: number | null
}

export interface SupplierRecord {
  id: string
  collectionId: number
  targetId: string
  name: string
  nameZh: string | null
  nameEn: string | null
  location: string | null
  rating: number | null
  isVerified: boolean
  businessTags: string[]
  savedAt: string
}

export interface InquiryRecord {
  id: string
  supplierName: string
  contactName: string
  message: string
  createdAt: string
  status: 'pending' | 'replied' | 'closed'
}

export interface InquiryProductRecord {
  id: string
  productName: string
  priceMin: number | null
  priceMax: number | null
  inquiryDate: string
  status: 'pending' | 'replied' | 'closed'
  supplierName: string
}

export interface CartItemRecord {
  id: string
  productName: string
  priceMin: number | null
  priceMax: number | null
  quantity: number
  addedAt: string
}
