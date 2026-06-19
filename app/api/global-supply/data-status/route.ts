import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [supplierCount, productCount, latestSupplier, latestProduct] = await Promise.all([
      db.supplier.count(),
      db.product.count(),
      db.supplier.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      db.product.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
    ])

    const supplierUpdatedAt = latestSupplier?.updatedAt ?? null
    const productUpdatedAt = latestProduct?.updatedAt ?? null

    // 取较新的更新时间
    const lastUpdated =
      supplierUpdatedAt && productUpdatedAt
        ? new Date(Math.max(supplierUpdatedAt.getTime(), productUpdatedAt.getTime()))
        : (supplierUpdatedAt ?? productUpdatedAt ?? new Date())

    return NextResponse.json({
      success: true,
      data: {
        supplierCount,
        productCount,
        lastUpdated: lastUpdated.toISOString(),
      },
    })
  } catch (error) {
    console.error('获取数据状态失败:', error)
    return NextResponse.json(
      { success: false, error: '获取数据状态失败' },
      { status: 500 },
    )
  }
}
