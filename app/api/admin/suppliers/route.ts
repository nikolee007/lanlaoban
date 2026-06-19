import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
