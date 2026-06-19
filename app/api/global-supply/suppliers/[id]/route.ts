import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的供应商 ID' },
        { status: 400 },
      )
    }

    const supplier = await db.supplier.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: { rating: 'desc' },
        },
        _count: {
          select: { products: true, contactInquiries: true },
        },
      },
    })

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: '供应商不存在' },
        { status: 404 },
      )
    }

    const reviews = await db.aggregatedReview.findMany({
      where: {
        targetId: String(id),
        targetType: 'supplier',
      },
      orderBy: { collectedAt: 'desc' },
    })

    const { _count, ...supplierData } = supplier

    return NextResponse.json({
      success: true,
      data: {
        ...supplierData,
        productCount: _count.products,
        inquiryCount: _count.contactInquiries,
        products: supplierData.products,
        reviews,
      },
    })
  } catch (error) {
    console.error('获取供应商详情失败:', error)
    return NextResponse.json(
      { success: false, error: '获取供应商详情失败' },
      { status: 500 },
    )
  }
}
