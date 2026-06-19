import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/global-supply/orders/my — 获取当前用户的采购单列表
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)))
    const status = searchParams.get('status') // optional filter

    const where: { userId: number; status?: string } = { userId }
    if (status && ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'].includes(status)) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      db.purchaseOrder.findMany({
        where,
        include: {
          items: {
            select: {
              id: true,
              productId: true,
              productName: true,
              price: true,
              quantity: true,
              subtotal: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.purchaseOrder.count({ where }),
    ])

    const data = orders.map((order) => ({
      id: order.id,
      orderNo: order.orderNo,
      status: order.status,
      supplierId: order.supplierId,
      supplierName: order.supplierName,
      supplierPhone: order.supplierPhone,
      totalAmount: order.totalAmount,
      itemCount: order.itemCount,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items,
    }))

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('获取采购单列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取采购单列表失败' },
      { status: 500 },
    )
  }
}
