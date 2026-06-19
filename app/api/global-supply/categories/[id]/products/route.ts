import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的分类 ID' },
        { status: 400 },
      )
    }

    const category = await db.category.findUnique({
      where: { id },
      select: { name: true },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: '分类不存在' },
        { status: 404 },
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)),
    )
    const sortBy = searchParams.get('sortBy')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const where: Record<string, unknown> = { categoryId: id }
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {}
      if (minPrice) priceFilter.gte = parseFloat(minPrice)
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice)
      where.priceMin = priceFilter
    }

    const validSortFields = ['updatedAt', 'priceMin', 'priceMax', 'rating', 'name']
    const actualSortBy =
      sortBy && validSortFields.includes(sortBy) ? sortBy : 'updatedAt'
    const orderBy = { [actualSortBy]: 'desc' as const }

    const [items, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          supplier: {
            select: {
              id: true,
              nameZh: true,
              nameEn: true,
              rating: true,
            },
          },
        },
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        categoryName: category.name,
      },
    })
  } catch (error) {
    console.error('获取分类商品失败:', error)
    return NextResponse.json(
      { success: false, error: '获取分类商品失败' },
      { status: 500 },
    )
  }
}
