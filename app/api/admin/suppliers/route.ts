import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, unauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!requireAuth(request.headers)) return unauthorized()

  try {
    const suppliers = await db.supplier.findMany({
      orderBy: { id: 'desc' },
      take: 50,
      include: { _count: { select: { products: true } } },
    })
    const data = suppliers.map(s => ({
      id: s.id, nameZh: s.nameZh, nameEn: s.nameEn,
      location: s.location, rating: s.rating, reviewCount: s.reviewCount,
      isVerified: s.isVerified, productCount: s._count.products,
      type: s.type, yearEstablished: s.yearEstablished,
    }))
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取供应商列表失败'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
