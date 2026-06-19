import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function generateOrderNo(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `PO${y}${m}${d}${rand}`
}

// POST /api/global-supply/orders — 从采购清单生成采购单
export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { items, notes } = body as {
      items: { productId: number; quantity: number; price: number; supplierId: number }[]
      notes?: string
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: '请选择至少一个商品' },
        { status: 400 },
      )
    }

    // 验证所有商品存在并获取详情
    const productIds = items.map((i) => i.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      include: {
        supplier: {
          select: {
            id: true,
            nameZh: true,
            nameEn: true,
            contactPhone: true,
          },
        },
      },
    })

    const productMap = new Map(products.map((p) => [p.id, p]))

    // 校验所有商品存在
    for (const item of items) {
      if (!productMap.has(item.productId)) {
        return NextResponse.json(
          { success: false, error: `商品 ID ${item.productId} 不存在` },
          { status: 400 },
        )
      }
    }

    // 按 supplier 分组
    type GroupedItem = {
      productId: number
      productName: string
      price: number
      quantity: number
      subtotal: number
      supplierId: number
    }

    const supplierGroups = new Map<number, { supplierId: number; supplierName: string; supplierPhone: string | null; items: GroupedItem[] }>()

    for (const item of items) {
      const product = productMap.get(item.productId)!
      const supplier = product.supplier
      if (!supplier) {
        return NextResponse.json(
          { success: false, error: `商品 ${product.name} 无关联供应商` },
          { status: 400 },
        )
      }

      if (!supplierGroups.has(supplier.id)) {
        supplierGroups.set(supplier.id, {
          supplierId: supplier.id,
          supplierName: supplier.nameZh || supplier.nameEn,
          supplierPhone: supplier.contactPhone || null,
          items: [],
        })
      }

      const price = item.price ?? product.priceMin ?? 0
      const quantity = Math.max(1, item.quantity)
      supplierGroups.get(supplier.id)!.items.push({
        productId: product.id,
        productName: product.name,
        price,
        quantity,
        subtotal: price * quantity,
        supplierId: supplier.id,
      })
    }

    // 为每个供应商创建一个采购单
    const orders: Array<{
      id: number
      orderNo: string
      status: string
      totalAmount: number
      createdAt: Date
    }> = []

    for (const [, group] of supplierGroups) {
      const orderNo = generateOrderNo()
      const totalAmount = group.items.reduce((sum, i) => sum + i.subtotal, 0)
      const itemCount = group.items.length

      // 使用事务创建订单和订单项
      const order = await db.$transaction(async (tx) => {
        const po = await tx.purchaseOrder.create({
          data: {
            userId,
            orderNo,
            status: 'pending',
            supplierId: group.supplierId,
            supplierName: group.supplierName,
            supplierPhone: group.supplierPhone,
            totalAmount,
            itemCount,
            notes: notes || null,
          },
        })

        // 批量创建订单项
        await tx.purchaseOrderItem.createMany({
          data: group.items.map((i) => ({
            orderId: po.id,
            productId: i.productId,
            productName: i.productName,
            price: i.price,
            quantity: i.quantity,
            subtotal: i.subtotal,
          })),
        })

        // 从采购清单中移除已下单的商品
        await tx.purchaseCart.deleteMany({
          where: {
            userId,
            productId: { in: group.items.map((i) => i.productId) },
          },
        })

        return po
      })

      orders.push({
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      })
    }

    return NextResponse.json({
      success: true,
      data: orders.length === 1 ? orders[0] : orders,
    })
  } catch (error) {
    console.error('创建采购单失败:', error)
    return NextResponse.json(
      { success: false, error: '创建采购单失败' },
      { status: 500 },
    )
  }
}
