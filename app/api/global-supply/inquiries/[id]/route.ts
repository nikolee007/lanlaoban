import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'

// GET /api/global-supply/inquiries/[id] — 获取单个询盘详情（含完整对话）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 },
      )
    }

    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '参数错误' },
        { status: 400 },
      )
    }

    const inquiry = await db.contactInquiry.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            priceMin: true,
            priceMax: true,
            currency: true,
            description: true,
            supplier: {
              select: {
                id: true,
                nameZh: true,
                nameEn: true,
                location: true,
                rating: true,
                reviewCount: true,
              },
            },
          },
        },
        supplier: {
          select: {
            id: true,
            nameZh: true,
            nameEn: true,
            location: true,
            type: true,
            rating: true,
          },
        },
      },
    })

    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: '询盘不存在' },
        { status: 404 },
      )
    }

    // 只能查看自己的询盘
    if (inquiry.userId !== userId) {
      return NextResponse.json(
        { success: false, error: '无权查看该询盘' },
        { status: 403 },
      )
    }

    // 构建完整对话
    const conversation = [
      {
        role: 'user',
        content: inquiry.message,
        createdAt: inquiry.createdAt.toISOString(),
      },
    ]
    if (inquiry.reply) {
      conversation.push({
        role: 'supplier',
        content: inquiry.reply,
        createdAt: inquiry.createdAt.toISOString(), // 模拟回复时间
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: inquiry.id,
        userId: inquiry.userId,
        name: inquiry.name,
        phone: inquiry.phone,
        company: inquiry.company,
        message: inquiry.message,
        status: inquiry.status,
        reply: inquiry.reply,
        createdAt: inquiry.createdAt.toISOString(),
        conversation,
        product: inquiry.product
          ? {
              id: inquiry.product.id,
              name: inquiry.product.name,
              images: inquiry.product.images,
              priceMin: inquiry.product.priceMin,
              priceMax: inquiry.product.priceMax,
              currency: inquiry.product.currency,
              description: inquiry.product.description,
              supplier: inquiry.product.supplier
                ? {
                    id: inquiry.product.supplier.id,
                    nameZh: inquiry.product.supplier.nameZh,
                    nameEn: inquiry.product.supplier.nameEn,
                    location: inquiry.product.supplier.location,
                    rating: inquiry.product.supplier.rating,
                    reviewCount: inquiry.product.supplier.reviewCount,
                  }
                : null,
            }
          : null,
        supplier: inquiry.supplier
          ? {
              id: inquiry.supplier.id,
              nameZh: inquiry.supplier.nameZh,
              nameEn: inquiry.supplier.nameEn,
              location: inquiry.supplier.location,
              type: inquiry.supplier.type,
              rating: inquiry.supplier.rating,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('获取询盘详情失败:', error)
    return NextResponse.json(
      { success: false, error: '获取询盘详情失败' },
      { status: 500 },
    )
  }
}

// PUT /api/global-supply/inquiries/[id] — 用户可标记为"已关闭"
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = getAuthUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 },
      )
    }

    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '参数错误' },
        { status: 400 },
      )
    }

    // 查找询盘并验证所有权
    const inquiry = await db.contactInquiry.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    })

    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: '询盘不存在' },
        { status: 404 },
      )
    }

    if (inquiry.userId !== userId) {
      return NextResponse.json(
        { success: false, error: '无权操作该询盘' },
        { status: 403 },
      )
    }

    if (inquiry.status === 'closed') {
      return NextResponse.json({
        success: true,
        data: { message: '该询盘已关闭' },
      })
    }

    await db.contactInquiry.update({
      where: { id },
      data: { status: 'closed' },
    })

    return NextResponse.json({
      success: true,
      data: { message: '询盘已关闭' },
    })
  } catch (error) {
    console.error('关闭询盘失败:', error)
    return NextResponse.json(
      { success: false, error: '关闭询盘失败' },
      { status: 500 },
    )
  }
}
