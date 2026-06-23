import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface ProductWithSupplier {
  id: number
  name: string
  priceMin: number | null
  priceMax: number | null
  description: string | null
  rating: number | null
  supplier: { nameZh: string; location: string } | null
}

interface ShopProduct {
  id: number
  name: string
  price: string
  image: string
  description: string
  supplier: string
  rating: number
}

interface ShopData {
  id: string
  brand: string
  industry: string
  slogan: string
  story: string
  sellPoints: string
  products: ShopProduct[]
  createdAt: string
}

export const dynamic = 'force-dynamic'

// 精确品类ID映射（叶节点ID，非父节点——因为商品关联的是叶节点）
const CAT_MAP: Record<string, number[]> = {
  '餐饮美食': [417, 431],         // 食品加工, 厨房用品
  '餐饮': [417, 431],             // 同上（用户可能填"餐饮"或"餐饮美食"）
  '服装时尚': [423, 424, 427],    // 女装, 男装, 运动鞋
  '数码科技': [420, 421, 422],    // 手机配件, 智能穿戴, 小家电
  '家居生活': [409, 429, 430, 416], // 家纺布艺, 客厅家具, 卧室家具, 灯具照明
  '美妆个护': [410],              // 日用百货（含美妆个护商品）
  '宠物': [414],                  // 宠物用品
  '运动户外': [425, 427, 418],    // 运动服装, 运动鞋, 箱包皮具
  '母婴亲子': [426, 413],         // 童装, 玩具潮玩
  '教育培训': [412],              // 文具办公
}

// 加载商品图片映射：product ID → 实际图片路径
function loadImageMap(): Record<string, string> {
  try {
    const filePath = join(process.cwd(), 'lib/generated-product-images.json')
    if (!existsSync(filePath)) return {}
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    return {}
  }
}

// CDN格式化为URL
function formatImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return url
  return '/' + url
}

export async function POST(req: Request) {
  try {
    const { industry, brandName, productName, sellPoints, story, name } = await req.json()

    const shopId = `shop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const imageMap = loadImageMap()

    // 根据行业选品类ID
    const categoryIds = CAT_MAP[industry] || [417, 410] // 默认用食品+日用

    let products: ProductWithSupplier[] = []

    // 1) 从匹配品类取评分最高的6个商品
    try {
      products = await db.product.findMany({
        where: { categoryId: { in: categoryIds } },
        take: 6,
        orderBy: { rating: 'desc' },
        include: { supplier: { select: { nameZh: true, location: true } } },
      })
    } catch {}

    // 2) 如果不足6个，从全站补充（排除已选的）
    if (products.length < 6) {
      const existingIds = products.map(p => p.id)
      try {
        const topProducts = await db.product.findMany({
          where: existingIds.length > 0 ? { id: { notIn: existingIds } } : undefined,
          take: 6 - products.length,
          orderBy: { rating: 'desc' },
          include: { supplier: { select: { nameZh: true, location: true } } },
        })
        products = [...products, ...topProducts]
      } catch {}
    }

    // 3) 终极兜底
    if (products.length === 0) {
      const all = await db.product.findMany({ take: 6, orderBy: { rating: 'desc' }, include: { supplier: { select: { nameZh: true, location: true } } } })
      products = all as unknown as ProductWithSupplier[]
    }

    // 构建商品列表：使用正确的图片路径
    const shopProducts = products.map(p => {
      const imgKey = String(p.id)
      const mappedImage = imageMap[imgKey]
      return {
        id: p.id,
        name: p.name,
        price: p.priceMin ? (p.priceMin === p.priceMax ? `¥${p.priceMin}` : `¥${p.priceMin}-${p.priceMax}`) : '询价',
        image: mappedImage ? formatImageUrl(mappedImage) : `/product-images/ai-generated/ai-product-${p.id}.png`,
        description: p.description || '',
        supplier: p.supplier?.nameZh || '',
        rating: p.rating || 0,
      }
    })

    const shopData = {
      id: shopId,
      brand: brandName || name || '我的小店',
      industry: industry || '综合',
      slogan: `${industry ? industry + '·' : ''}用心做好每一件事`,
      story: story || `${name || '我'}在${industry || '这个行业'}深耕多年，始终坚持用品质说话。`,
      sellPoints: sellPoints || '品质保证,诚信经营,售后无忧',
      products: shopProducts,
      createdAt: new Date().toISOString(),
    }


    // Save to persistent store
    try {
      const { writeFileSync, mkdirSync } = await import('fs')
      const { join } = await import('path')
      const dir = join(process.cwd(), 'data')
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      const storePath = join(dir, 'shops.json')
      let shops: Record<string, ShopData> = {}
      try { shops = JSON.parse(readFileSync(storePath, 'utf-8')) } catch {}
      shops[shopId] = shopData
      writeFileSync(storePath, JSON.stringify(shops, null, 2))
    } catch {}

    return NextResponse.json({ success: true, data: shopData })
  } catch (error) {
    console.error('生成店铺失败:', error)
    return NextResponse.json({ success: false, error: '生成失败' }, { status: 500 })
  }
}


export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 })
  }

  try {
    const { readFileSync, existsSync } = await import('fs')
    const { join } = await import('path')
    const storePath = join(process.cwd(), 'data/shops.json')

    if (!existsSync(storePath)) {
      return NextResponse.json({ success: false, error: '店铺不存在' }, { status: 404 })
    }

    const shops = JSON.parse(readFileSync(storePath, 'utf-8'))
    const shop = shops[id]

    if (!shop) {
      return NextResponse.json({ success: false, error: '店铺不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: shop })
  } catch {
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}
