import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)),
    )
    const search = searchParams.get('search')
    const region = searchParams.get('region')
    const minRating = searchParams.get('minRating')
    const certification = searchParams.get('certification')

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { nameZh: { contains: search } },
        { nameEn: { contains: search } },
        { businessTags: { contains: search } },
      ]
    }
    if (region) {
      where.location = { contains: region }
    }
    if (minRating) {
      const rating = parseFloat(minRating)
      if (!isNaN(rating)) {
        where.rating = { gte: rating }
      }
    }
    if (certification) {
      where.certifications = { contains: certification }
    }

    const [items, total] = await Promise.all([
      db.supplier.findMany({
        where: where as any,
        orderBy: { rating: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { products: true } },
        },
      }),
      db.supplier.count({ where: where as any }),
    ])

    const data = items.map(({ _count, ...supplier }) => ({
      ...supplier,
      productCount: _count.products,
    }))

    return NextResponse.json({
      success: true,
      data: { items: data, total },
    })
  } catch (error) {
    console.error('获取供应商列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取供应商列表失败' },
      { status: 500 },
    )
  }
}
