import type React from 'react'

export interface HomeStats {
  suppliers: number
  products: number
  categories: number
}

export interface ProductCategory {
  id: number
  name: string
  icon: string | null
  productCount: number
}

export interface VerifiedSupplier {
  id: number
  nameZh: string | null
  location: string | null
  businessTags: string | null
  rating: number | null
  reviewCount: number | null
  isVerified: boolean
}

export interface ProductItem {
  id: number
  name: string
  priceMin: number | null
  priceMax: number | null
  location: string | null
  rating: number | null
  reviewCount: number | null
}

export type SceneCardData = {
  icon: React.ComponentType<{ className?: string }>
  titleKey: string
  descKey: string
  href: string
}
