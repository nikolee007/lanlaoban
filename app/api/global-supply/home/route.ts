import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [
      hotProducts,
      verifiedSuppliers,
      newSuppliers,
      categories,
      supplierCount,
      productCount,
      categoryCount,
    ] = await Promise.all([
      // hotProducts: top 12 products by rating
      db.product.findMany({
        orderBy: { rating: 'desc' },
        take: 12,
        include: { supplier: { select: { nameZh: true, location: true } } },
      }),
      // verifiedSuppliers: 4 verified suppliers
      db.supplier.findMany({
        where: { isVerified: true },
        orderBy: { rating: 'desc' },
        take: 4,
      }),
      // newSuppliers: 4 newest suppliers
      db.supplier.findMany({
        orderBy: { id: 'desc' },
        take: 4,
      }),
      // productCategories: top 8 categories with product count
      db.category.findMany({
        where: { parentId: null },
        orderBy: { sortOrder: 'asc' },
        take: 8,
        include: {
          _count: { select: { products: true } },
        },
      }),
      db.supplier.count(),
      db.product.count(),
      db.category.count(),
    ])

    // 模拟热度标签
    const hotTags = ['热卖爆款', '跨境推荐', '工厂直供', '48h发货', '搜索量+40%', '月销3000+', '加购率65%', '日单800+', '好评率97%', '搜索量+55%', '日单500+', '复购率72%']
    const productsWithTags = hotProducts.map((product, index) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      priceMin: product.priceMin,
      priceMax: product.priceMax,
      currency: product.currency,
      moq: product.moq,
      rating: product.rating,
      reviewCount: product.reviewCount,
      images: product.images,
      supplierName: product.supplier.nameZh,
      supplierLocation: product.supplier.location,
      hotTag: hotTags[index % hotTags.length],
    }))

    return NextResponse.json({
      success: true,
      data: {
        hotProducts: productsWithTags,
        verifiedSuppliers: verifiedSuppliers.map((s) => ({
          id: s.id,
          nameZh: s.nameZh,
          nameEn: s.nameEn,
          location: s.location,
          yearEstablished: s.yearEstablished,
          employeeCount: s.employeeCount,
          businessTags: s.businessTags,
          rating: s.rating,
          reviewCount: s.reviewCount,
          isVerified: s.isVerified,
          type: s.type,
        })),
        newSuppliers: newSuppliers.map((s) => ({
          id: s.id,
          nameZh: s.nameZh,
          nameEn: s.nameEn,
          location: s.location,
          businessTags: s.businessTags,
          rating: s.rating,
          isVerified: s.isVerified,
          type: s.type,
        })),
        productCategories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          productCount: c._count.products,
        })),
        stats: {
          suppliers: supplierCount,
          products: productCount,
          categories: categoryCount,
        },
      },
    })
  } catch (error) {
    console.error('获取首页聚合数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取首页聚合数据失败' },
      { status: 500 },
    )
  }
}
