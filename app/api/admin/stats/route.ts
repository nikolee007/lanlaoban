import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, unauthorized } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!requireAuth(request.headers)) return unauthorized()

  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [suppliers, products, inquiries, users, todayInquiries] = await Promise.all([
      db.supplier.count(),
      db.product.count(),
      db.contactInquiry.count(),
      db.userCollection.groupBy({ by: ['userId'] }).then((r) => r.length),
      db.contactInquiry.count({ where: { createdAt: { gte: todayStart } } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        suppliers,
        products,
        inquiries,
        users,
        todayInquiries,
        pendingContacts: inquiries,
      },
    })
  } catch (error) {
    console.error('获取管理后台统计失败:', error)
    return NextResponse.json(
      { success: false, error: '获取管理后台统计失败' },
      { status: 500 },
    )
  }
}
