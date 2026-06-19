import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// 模拟供应商回复列表
const SIMULATED_REPLIES: Record<string, string[]> = {
  '蓝牙耳机': [
    '感谢您的询盘！我司专注蓝牙耳机生产12年，支持OEM/ODM。样品可免费提供，运费到付。详情请加微信 138****6789。',
    '您好，报价已发您邮箱。MOQ 1000pcs，单价含FOB深圳。交期35天。',
  ],
  '家居用品': [
    '尊敬的用户您好，我司主要生产北欧风家居用品，支持一件代发。已为您开通VIP查看通道，请查看商品详情页。',
  ],
  '电子产品': [
    '收到您的询盘！我司为三星/华为供应商，产品通过FCC/CE认证。建议您先查看我们热销款，库存充足可48小时发货。',
  ],
  'default': [
    '您好！已收到您的询盘。我们的销售经理将在24小时内联系您。您也可以直接拨打客服热线 400-888-**** 咨询。',
    '感谢您对懒老板平台的信任！供应商已收到您的需求，正在准备报价方案，请耐心等待。',
  ],
}

function getSimulatedReply(message: string): string {
  const replies = Object.entries(SIMULATED_REPLIES).find(([key]) =>
    message.includes(key),
  )?.[1]
  if (replies) {
    return replies[Math.floor(Math.random() * replies.length)]
  }
  return SIMULATED_REPLIES.default[
    Math.floor(Math.random() * SIMULATED_REPLIES.default.length)
  ]
}

// GET /api/global-supply/inquiries — 获取用户的询盘记录
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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20),
    )
    const status = searchParams.get('status') // 按状态筛选

    const where: Record<string, unknown> = { userId }
    if (status && ['pending', 'replied', 'closed'].includes(status)) {
      where.status = status
    }

    const skip = (page - 1) * pageSize

    // 自动流转: 超过24小时的 pending 询盘，自动变为 replied 并添加模拟回复
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const stalePendingItems = await db.contactInquiry.findMany({
      where: {
        userId,
        status: 'pending',
        createdAt: { lte: twentyFourHoursAgo },
      },
      select: { id: true, message: true },
    })
    for (const item of stalePendingItems) {
      await db.contactInquiry.update({
        where: { id: item.id },
        data: {
          status: 'replied',
          reply: getSimulatedReply(item.message || ''),
        },
      })
    }

    const [items, total] = await Promise.all([
      db.contactInquiry.findMany({
        where: where as any,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              priceMin: true,
              priceMax: true,
              currency: true,
              supplier: {
                select: {
                  id: true,
                  nameZh: true,
                  nameEn: true,
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      db.contactInquiry.count({ where: where as any }),
    ])

    const data = items.map((item) => ({
      id: item.id,
      userId: item.userId,
      name: item.name,
      phone: item.phone,
      company: item.company,
      message: item.message,
      status: item.status,
      reply: item.reply,
      createdAt: item.createdAt.toISOString(),
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            images: item.product.images,
            priceMin: item.product.priceMin,
            priceMax: item.product.priceMax,
          }
        : null,
      supplier: item.supplier
        ? {
            id: item.supplier.id,
            nameZh: item.supplier.nameZh,
            nameEn: item.supplier.nameEn,
            location: item.supplier.location,
          }
        : null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: data,
        total,
        page,
        pageSize,
      },
    })
  } catch (error) {
    console.error('获取询盘记录失败:', error)
    return NextResponse.json(
      { success: false, error: '获取询盘记录失败' },
      { status: 500 },
    )
  }
}
