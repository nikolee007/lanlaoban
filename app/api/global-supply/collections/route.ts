import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/global-supply/collections?type=product&sort=createdAt_desc
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
    const targetType = searchParams.get('type') || undefined
    const sort = searchParams.get('sort') || 'createdAt_desc'

    const where: Prisma.UserCollectionWhereInput = { userId }
    if (targetType) {
      where.targetType = targetType
    }

    const orderBy: Prisma.UserCollectionOrderByWithRelationInput =
      sort === 'createdAt_asc'
        ? { createdAt: 'asc' }
        : { createdAt: 'desc' }

    const collections = await db.userCollection.findMany({
      where,
      orderBy,
    })

    // 关联商品/供应商信息
    const items = await Promise.all(
      collections.map(async (col) => {
        let target: Record<string, unknown> | null = null
        if (col.targetType === 'product') {
          target = await db.product.findUnique({
            where: { id: Number(col.targetId) },
            select: { id: true, name: true, priceMin: true, priceMax: true, currency: true, images: true, rating: true },
          })
        } else if (col.targetType === 'supplier') {
          target = await db.supplier.findUnique({
            where: { id: Number(col.targetId) },
            select: { id: true, nameZh: true, nameEn: true, location: true, rating: true, isVerified: true, businessTags: true },
          })
        }

        return {
          id: col.id,
          userId: col.userId,
          targetId: col.targetId,
          targetType: col.targetType,
          userNote: col.userNote,
          createdAt: col.createdAt.toISOString(),
          target,
        }
      }),
    )

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取收藏列表失败' },
      { status: 500 },
    )
  }
}

// POST /api/global-supply/collections — 添加收藏
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
    const { targetId, targetType } = body

    if (!targetId || !targetType) {
      return NextResponse.json(
        { success: false, error: 'targetId 和 targetType 不能为空' },
        { status: 400 },
      )
    }

    if (!['product', 'supplier'].includes(targetType)) {
      return NextResponse.json(
        { success: false, error: 'targetType 必须为 product 或 supplier' },
        { status: 400 },
      )
    }

    // 检查是否已收藏
    const existing = await db.userCollection.findFirst({
      where: {
        userId,
        targetId: String(targetId),
        targetType,
      },
    })

    if (existing) {
      return NextResponse.json({ success: true, data: { id: existing.id } })
    }

    const collection = await db.userCollection.create({
      data: {
        userId,
        targetId: String(targetId),
        targetType,
      },
    })

    return NextResponse.json(
      { success: true, data: { id: collection.id } },
      { status: 201 },
    )
  } catch (error) {
    console.error('添加收藏失败:', error)
    return NextResponse.json(
      { success: false, error: '添加收藏失败' },
      { status: 500 },
    )
  }
}

// DELETE /api/global-supply/collections — 取消收藏
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
    const { targetId, targetType } = body

    if (!targetId || !targetType) {
      return NextResponse.json(
        { success: false, error: 'targetId 和 targetType 不能为空' },
        { status: 400 },
      )
    }

    const result = await db.userCollection.deleteMany({
      where: {
        userId,
        targetId: String(targetId),
        targetType,
      },
    })

    return NextResponse.json({
      success: true,
      data: { removed: result.count > 0 },
    })
  } catch (error) {
    console.error('取消收藏失败:', error)
    return NextResponse.json(
      { success: false, error: '取消收藏失败' },
      { status: 500 },
    )
  }
}
