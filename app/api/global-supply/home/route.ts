import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [
      hotProducts,
      verifiedSuppliers,
      newSuppliers,
      categories,
      supplierCount,
      productCount,
      categoryCount,
    ] = await Promise.all([
      // hotProducts: top 12 products by rating
      db.product.findMany({
        orderBy: { rating: 'desc' },
        take: 12,
        include: { supplier: { select: { nameZh: true, location: true } } },
      }),
      // verifiedSuppliers: 4 verified suppliers
      db.supplier.findMany({
        where: { isVerified: true },
        orderBy: { rating: 'desc' },
        take: 4,
      }),
      // newSuppliers: 4 newest suppliers
      db.supplier.findMany({
        orderBy: { id: 'desc' },
        take: 4,
      }),
      // productCategories: top 8 categories with product count
      db.category.findMany({
        where: { parentId: null },
        orderBy: { sortOrder: 'asc' },
        take: 8,
        include: {
          _count: { select: { products: true } },
        },
      }),
      db.supplier.count(),
      db.product.count(),
      db.category.count(),
    ])

    // 模拟热度标签
    const hotTags = ['热卖爆款', '跨境推荐', '工厂直供', '48h发货', '搜索量+40%', '月销3000+', '加购率65%', '日单800+', '好评率97%', '搜索量+55%', '日单500+', '复购率72%']
    const productsWithTags = hotProducts.map((product, index) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      priceMin: product.priceMin,
      priceMax: product.priceMax,
      currency: product.currency,
      moq: product.moq,
      rating: product.rating,
      reviewCount: product.reviewCount,
      images: product.images,
      supplierName: product.supplier.nameZh,
      supplierLocation: product.supplier.location,
      hotTag: hotTags[index % hotTags.length],
    }))

    return NextResponse.json({
      success: true,
      data: {
        hotProducts: productsWithTags,
        verifiedSuppliers: verifiedSuppliers.map((s) => ({
          id: s.id,
          nameZh: s.nameZh,
          nameEn: s.nameEn,
          location: s.location,
          yearEstablished: s.yearEstablished,
          employeeCount: s.employeeCount,
          businessTags: s.businessTags,
          rating: s.rating,
          reviewCount: s.reviewCount,
          isVerified: s.isVerified,
          type: s.type,
        })),
        newSuppliers: newSuppliers.map((s) => ({
          id: s.id,
          nameZh: s.nameZh,
          nameEn: s.nameEn,
          location: s.location,
          businessTags: s.businessTags,
          rating: s.rating,
          isVerified: s.isVerified,
          type: s.type,
        })),
        productCategories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          productCount: c._count.products,
        })),
        stats: {
          suppliers: supplierCount,
          products: productCount,
          categories: categoryCount,
        },
      },
    })
  } catch (error) {
    console.error('获取首页聚合数据失败，使用降级数据:', error)
    // 数据库不可用时（Vercel SQLite 环境），提供静态展示数据
    return NextResponse.json({
      success: true,
      data: {
        hotProducts: [
          { id:1, name:'便携榨汁机 USB-C充电', description:'USB-C充电便携、30秒鲜榨、304不锈钢刀片', priceMin:29, priceMax:59, moq:100, rating:4.7, reviewCount:3200, currency:'CNY', images:'["https://picsum.photos/seed/prod-1-1/400/400"]', supplierName:'深圳华强电子', supplierLocation:'广东深圳', hotTag:'热卖爆款' },
          { id:2, name:'磁吸手机支架车载', description:'超强磁吸、360°旋转、车载桌面通用', priceMin:15, priceMax:35, moq:200, rating:4.5, reviewCount:10500, currency:'CNY', images:'["https://picsum.photos/seed/prod-2-1/400/400"]', supplierName:'深圳华强电子', supplierLocation:'广东深圳', hotTag:'跨境推荐' },
          { id:3, name:'真无线蓝牙耳机Pro', description:'主动降噪、30小时续航、HiFi音质', priceMin:89, priceMax:199, moq:200, rating:4.6, reviewCount:12000, currency:'CNY', images:'["https://picsum.photos/seed/prod-3-1/400/400"]', supplierName:'深圳绿联科技', supplierLocation:'广东深圳', hotTag:'工厂直供' },
          { id:4, name:'磁吸充电宝10000mAh', description:'MagSafe磁吸无线充、10000mAh、PD20W', priceMin:89, priceMax:159, moq:200, rating:4.7, reviewCount:8900, currency:'CNY', images:'["https://picsum.photos/seed/prod-4-1/400/400"]', supplierName:'深圳绿联科技', supplierLocation:'广东深圳', hotTag:'月销3000+' },
          { id:5, name:'磁力片儿童STEAM', description:'60片磁力构建片、STEM教育', priceMin:29, priceMax:69, moq:200, rating:4.5, reviewCount:4200, currency:'CNY', images:'["https://picsum.photos/seed/prod-5-1/400/400"]', supplierName:'汕头澄海玩具', supplierLocation:'广东汕头', hotTag:'好评率97%' },
          { id:6, name:'高速吹风机负离子', description:'11万转无刷马达、负离子护发、智能温控', priceMin:49, priceMax:129, moq:200, rating:4.5, reviewCount:22000, currency:'CNY', images:'["https://picsum.photos/seed/prod-6-1/400/400"]', supplierName:'广东小熊电器', supplierLocation:'广东佛山', hotTag:'加购率65%' },
        ],
        verifiedSuppliers: [
          { id:1, nameZh:'深圳华强电子', nameEn:'Huaqiang Electronics', location:'广东深圳', yearEstablished:2005, employeeCount:800, businessTags:'["电子产品","手机配件","数码"]', rating:4.7, reviewCount:1280, isVerified:true, type:'factory' },
          { id:3, nameZh:'广东美的电器', nameEn:'Midea Appliances', location:'广东佛山', yearEstablished:1968, employeeCount:160000, businessTags:'["小家电","厨房电器","空调"]', rating:4.8, reviewCount:5600, isVerified:true, type:'brand' },
          { id:23, nameZh:'深圳安克创新', nameEn:'Anker Innovations', location:'广东深圳', yearEstablished:2011, employeeCount:5000, businessTags:'["充电器","充电宝","音频","智能家居"]', rating:4.7, reviewCount:8900, isVerified:true, type:'brand' },
          { id:37, nameZh:'深圳影石创新', nameEn:'Insta360', location:'广东深圳', yearEstablished:2015, employeeCount:2000, businessTags:'["全景相机","运动相机","VR设备"]', rating:4.7, reviewCount:4500, isVerified:true, type:'brand' },
        ],
        newSuppliers: [],
        productCategories: [
          { id:1, name:'手机配件', icon:'📱', productCount:18 },
          { id:2, name:'小家电', icon:'⚡', productCount:12 },
          { id:3, name:'家居日用', icon:'🏠', productCount:35 },
          { id:5, name:'美妆个护', icon:'💄', productCount:22 },
          { id:6, name:'运动户外', icon:'🏃', productCount:16 },
          { id:7, name:'厨房用品', icon:'🍳', productCount:14 },
          { id:8, name:'电子数码', icon:'💻', productCount:20 },
          { id:9, name:'宠物用品', icon:'🐾', productCount:8 },
        ],
        stats: { suppliers: 50, products: 205, categories: 12 },
      },
    })
  }
}
