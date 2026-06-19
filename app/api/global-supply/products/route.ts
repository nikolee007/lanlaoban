import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

function sanitizeSearch(input: string): string {
  return input.trim().replace(/\s+/g, ' ').replace(/[%_]/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20),
    )
    const categoryId = searchParams.get('categoryId')
    const sortBy = searchParams.get('sortBy') || 'rating'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const region = searchParams.get('region')
    const dropship = searchParams.get('dropship')
    const search = searchParams.get('search')

    // -- Build where clause ---------------------------------------------------
    const where: Prisma.ProductWhereInput = {}

    if (categoryId) {
      const parsed = parseInt(categoryId, 10)
      if (!isNaN(parsed)) {
        where.categoryId = parsed
      }
    }

    if (minPrice || maxPrice) {
      where.priceMin = {}
      if (minPrice) {
        const v = parseFloat(minPrice)
        if (!isNaN(v)) (where.priceMin as Prisma.FloatFilter).gte = v
      }
      if (maxPrice) {
        const v = parseFloat(maxPrice)
        if (!isNaN(v)) (where.priceMin as Prisma.FloatFilter).lte = v
      }
    }

    if (region) {
      where.supplier = {
        location: { contains: region },
      }
    }

    if (dropship === 'true') {
      where.supportsDropShipping = true
    }

    if (search) {
      const q = sanitizeSearch(search)
      if (q) {
        where.OR = [
          { name: { contains: q } },
          { description: { contains: q } },
          { supplier: { nameZh: { contains: q } } },
          { supplier: { nameEn: { contains: q } } },
        ]
      }
    }

    // -- Build orderBy --------------------------------------------------------
    let orderBy: Prisma.ProductOrderByWithRelationInput = { rating: 'desc' }
    if (sortBy === 'price') {
      orderBy = { priceMin: 'asc' }
    } else if (sortBy === 'price-desc') {
      orderBy = { priceMin: 'desc' }
    } else if (sortBy === 'sales') {
      orderBy = { reviewCount: 'desc' }
    }

    const skip = (page - 1) * pageSize

    // -- Fetch products + total count -----------------------------------------
    const [items, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          supplier: true,
          category: true,
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      db.product.count({ where }),
    ])

    // -- Batch-fetch aggregated reviews for all products ----------------------
    const productIds = items.map((p) => String(p.id))
    const allReviews =
      productIds.length > 0
        ? await db.aggregatedReview.findMany({
            where: {
              targetId: { in: productIds },
              targetType: 'product',
            },
          })
        : []

    const reviewsByProductId = new Map<string, typeof allReviews>()
    for (const r of allReviews) {
      const list = reviewsByProductId.get(r.targetId) ?? []
      list.push(r)
      reviewsByProductId.set(r.targetId, list)
    }

    const itemsWithReviews = items.map((item) => ({
      ...item,
      aggregatedReviews: reviewsByProductId.get(String(item.id)) ?? [],
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: itemsWithReviews,
        total,
        page,
        pageSize,
      },
    })
  } catch (error) {
    console.error('获取商品列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取商品列表失败' },
      { status: 500 },
    )
  }
}
