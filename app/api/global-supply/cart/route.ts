import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/global-supply/cart — 获取用户的采购清单
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 },
      )
    }

    const items = await db.purchaseCart.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            supplier: {
              select: {
                id: true,
                nameZh: true,
                nameEn: true,
                location: true,
                isVerified: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = items.map((item) => ({
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      quantity: item.quantity,
      notes: item.notes,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      product: {
        id: item.product.id,
        name: item.product.name,
        priceMin: item.product.priceMin,
        priceMax: item.product.priceMax,
        currency: item.product.currency,
        images: item.product.images,
        rating: item.product.rating,
        reviewCount: item.product.reviewCount,
        supplier: item.product.supplier
          ? {
              id: item.product.supplier.id,
              nameZh: item.product.supplier.nameZh,
              nameEn: item.product.supplier.nameEn,
              location: item.product.supplier.location,
              isVerified: item.product.supplier.isVerified,
            }
          : null,
      },
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('获取采购清单失败:', error)
    return NextResponse.json(
      { success: false, error: '获取采购清单失败' },
      { status: 500 },
    )
  }
}

// POST /api/global-supply/cart — 添加商品到采购清单
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
    const { productId, quantity, notes } = body

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'productId 不能为空' },
        { status: 400 },
      )
    }

    // 检查商品是否存在
    const product = await db.product.findUnique({
      where: { id: Number(productId) },
    })
    if (!product) {
      return NextResponse.json(
        { success: false, error: '商品不存在' },
        { status: 404 },
      )
    }

    const qty = Math.max(1, Number(quantity) || 1)

    // 使用 upsert: 如果已有则更新数量，否则创建
    const existing = await db.purchaseCart.findUnique({
      where: { userId_productId: { userId, productId: Number(productId) } },
    })

    if (existing) {
      const updated = await db.purchaseCart.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + qty, notes: notes ?? undefined },
      })
      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          quantity: updated.quantity,
          notes: updated.notes,
        },
      })
    }

    const cartItem = await db.purchaseCart.create({
      data: {
        userId,
        productId: Number(productId),
        quantity: qty,
        notes: notes ?? null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: cartItem.id,
          quantity: cartItem.quantity,
          notes: cartItem.notes,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('添加采购清单失败:', error)
    return NextResponse.json(
      { success: false, error: '添加采购清单失败' },
      { status: 500 },
    )
  }
}

// PUT /api/global-supply/cart — 修改数量/备注
export async function PUT(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { id, quantity, notes } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id 不能为空' },
        { status: 400 },
      )
    }

    // 验证属于当前用户
    const existing = await db.purchaseCart.findFirst({
      where: { id: Number(id), userId },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '采购项不存在' },
        { status: 404 },
      )
    }

    const data: Record<string, unknown> = {}
    if (quantity !== undefined) {
      data.quantity = Math.max(1, Number(quantity))
    }
    if (notes !== undefined) {
      data.notes = notes
    }

    const updated = await db.purchaseCart.update({
      where: { id: Number(id) },
      data,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        quantity: updated.quantity,
        notes: updated.notes,
      },
    })
  } catch (error) {
    console.error('修改采购清单失败:', error)
    return NextResponse.json(
      { success: false, error: '修改采购清单失败' },
      { status: 500 },
    )
  }
}

// DELETE /api/global-supply/cart — 移除商品
export async function DELETE(request: NextRequest) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { ids } = body

    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'ids 不能为空' },
        { status: 400 },
      )
    }

    const idList = Array.isArray(ids) ? ids.map(Number) : [Number(ids)]

    // 只删除属于当前用户的
    const result = await db.purchaseCart.deleteMany({
      where: {
        id: { in: idList },
        userId,
      },
    })

    return NextResponse.json({
      success: true,
      data: { removed: result.count },
    })
  } catch (error) {
    console.error('删除采购清单项失败:', error)
    return NextResponse.json(
      { success: false, error: '删除采购清单项失败' },
      { status: 500 },
    )
  }
}
