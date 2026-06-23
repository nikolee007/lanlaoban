import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, unauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!requireAuth(request.headers)) return unauthorized()

  try {
    const products = await db.product.findMany({
      orderBy: { id: 'desc' },
      take: 50,
      include: {
        supplier: { select: { nameZh: true } },
        category: { select: { name: true } },
      },
    })
    const data = products.map(p => ({
      id: p.id, name: p.name, priceMin: p.priceMin, priceMax: p.priceMax,
      supplier: p.supplier?.nameZh || '', category: p.category?.name || '',
      rating: p.rating, reviewCount: p.reviewCount, moq: p.moq,
      dropship: p.supportsDropShipping,
    }))
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取商品列表失败'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
