import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/global-supply/orders/[id] — 获取单个采购单详情
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const orderId = parseInt(resolvedParams.id, 10)
    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: '无效的订单 ID' },
        { status: 400 },
      )
    }

    const userId = getAuthUserId(_request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 },
      )
    }

    const order = await db.purchaseOrder.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: '采购单不存在' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
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
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      },
    })
  } catch (error) {
    console.error('获取采购单详情失败:', error)
    return NextResponse.json(
      { success: false, error: '获取采购单详情失败' },
      { status: 500 },
    )
  }
}

// PUT /api/global-supply/orders/[id] — 更新采购单状态
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const orderId = parseInt(resolvedParams.id, 10)
    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: '无效的订单 ID' },
        { status: 400 },
      )
    }

    const userId = getAuthUserId(_request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 },
      )
    }

    const body = await _request.json()
    const { status } = body as { status: string }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: '无效的状态值' },
        { status: 400 },
      )
    }

    // 获取当前订单
    const order = await db.purchaseOrder.findFirst({
      where: { id: orderId, userId },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: '采购单不存在' },
        { status: 404 },
      )
    }

    // 权限校验：用户只能取消自己未确认的订单
    if (status === 'cancelled') {
      if (order.status !== 'pending') {
        return NextResponse.json(
          { success: false, error: '只能取消待确认的采购单' },
          { status: 400 },
        )
      }
    }

    // 确认收货：只能从 shipped → completed
    if (status === 'completed') {
      if (order.status !== 'shipped') {
        return NextResponse.json(
          { success: false, error: '只能确认已发货的采购单' },
          { status: 400 },
        )
      }
    }

    // 对已取消/已完成的订单不能做任何操作
    if (['cancelled', 'completed'].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: '订单已终态，无法修改' },
        { status: 400 },
      )
    }

    const updated = await db.purchaseOrder.update({
      where: { id: orderId },
      data: { status },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        orderNo: updated.orderNo,
        status: updated.status,
        updatedAt: updated.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('更新采购单状态失败:', error)
    return NextResponse.json(
      { success: false, error: '更新采购单状态失败' },
      { status: 500 },
    )
  }
}
