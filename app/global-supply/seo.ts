import { Metadata } from 'next'

export function generateProductMetadata(product: { id: number; name: string; description?: string; priceMin?: number; priceMax?: number }): Metadata {
  return {
    title: `${product.name} - 全球货源 | 懒老板`,
    description: product.description?.slice(0, 160) || `找到${product.name}供应商、价格、批发信息`,
    openGraph: {
      title: `${product.name} - 懒老板全球货源`,
      description: product.description?.slice(0, 160) || `找到${product.name}供应商`,
      type: 'product' as any,
    },
  }
}

export function generateCategoryMetadata(category: { name: string }): Metadata {
  return {
    title: `${category.name} - 全球货源 | 懒老板`,
    description: `找${category.name}供应商、工厂、批发价`,
  }
}
