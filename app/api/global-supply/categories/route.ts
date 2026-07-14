import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { MOCK_CATEGORIES } from '@/lib/mock-supply-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    })

    const allProducts = await db.product.findMany({
      select: { categoryId: true, supplierId: true },
      where: { categoryId: { not: null } },
    })

    const supplierCountMap = new Map<number, Set<number>>()
    for (const p of allProducts) {
      if (p.categoryId === null) continue
      if (!supplierCountMap.has(p.categoryId)) {
        supplierCountMap.set(p.categoryId, new Set())
      }
      supplierCountMap.get(p.categoryId)!.add(p.supplierId)
    }

    const data = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      productCount: cat._count.products,
      supplierCount: supplierCountMap.get(cat.id)?.size ?? 0,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('获取分类列表失败，使用降级数据:', error)
    return NextResponse.json({ success: true, data: MOCK_CATEGORIES })
  }
}
