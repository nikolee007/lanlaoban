import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'

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
    const { name, phone, company, productId, supplierId, message } = body

    // 验证必填字段
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '姓名不能为空' },
        { status: 400 },
      )
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '联系电话不能为空' },
        { status: 400 },
      )
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '询盘内容不能为空' },
        { status: 400 },
      )
    }

    // 检查 Product 是否存在
    if (productId != null) {
      const product = await db.product.findUnique({ where: { id: Number(productId) } })
      if (!product) {
        return NextResponse.json(
          { success: false, error: '商品不存在' },
          { status: 404 },
        )
      }
    }

    // 检查 Supplier 是否存在
    if (supplierId != null) {
      const supplier = await db.supplier.findUnique({ where: { id: Number(supplierId) } })
      if (!supplier) {
        return NextResponse.json(
          { success: false, error: '供应商不存在' },
          { status: 404 },
        )
      }
    }

    const inquiry = await db.contactInquiry.create({
      data: {
        userId,
        name: name.trim(),
        phone: phone.trim(),
        company: company ? company.trim() : null,
        productId: productId != null ? Number(productId) : null,
        supplierId: supplierId != null ? Number(supplierId) : null,
        message: message.trim(),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: inquiry.id,
        createdAt: inquiry.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('创建联系询盘失败:', error)
    return NextResponse.json(
      { success: false, error: '创建联系询盘失败' },
      { status: 500 },
    )
  }
}
