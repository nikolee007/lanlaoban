export interface SupplierListItem {
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
  productCount: number
}

export interface SupplierListResponse {
  success: boolean
  data: {
    items: SupplierListItem[]
    total: number
  }
}
