import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: '无效的商品 ID' },
        { status: 400 },
      )
    }

    const product = await db.product.findUnique({
      where: { id },
      include: {
        supplier: true,
        category: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: '商品不存在' },
        { status: 404 },
      )
    }

    // -- Aggregated reviews (multi-platform) ----------------------------------
    const aggregatedReviews = await db.aggregatedReview.findMany({
      where: {
        targetId: String(id),
        targetType: 'product',
      },
    })

    // -- Reviews formatted with reviewContent field ---------------------------
    const reviews = aggregatedReviews.map((r) => ({
      platform: r.platform,
      rating: r.rating,
      reviewCount: r.reviewCount,
      reviewContent: r.keywords ? safeJsonParse<string[]>(r.keywords, []) : [],
      returnRate: r.returnRate,
      repurchaseRate: r.repurchaseRate,
    }))

    // -- Related products (same category, exclude self, limit 4) --------------
    const relatedProducts = product.categoryId
      ? await db.product.findMany({
          where: {
            categoryId: product.categoryId,
            id: { not: id },
          },
          include: {
            supplier: { select: { nameZh: true, nameEn: true, location: true } },
          },
          orderBy: { rating: 'desc' },
          take: 4,
        })
      : []

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        aggregatedReviews,
        reviews,
        relatedProducts,
      },
    })
  } catch (error) {
    console.error('获取商品详情失败:', error)
    return NextResponse.json(
      { success: false, error: '获取商品详情失败' },
      { status: 500 },
    )
  }
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}
