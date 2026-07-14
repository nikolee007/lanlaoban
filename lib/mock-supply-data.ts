/**
 * 全球供应链 Mock 数据（数据库不可用时的降级方案）
 */

export const MOCK_CATEGORIES = [
  { id: 1, name: '手机配件', icon: '📱', productCount: 18, supplierCount: 5 },
  { id: 2, name: '小家电', icon: '⚡', productCount: 12, supplierCount: 4 },
  { id: 3, name: '家居日用', icon: '🏠', productCount: 35, supplierCount: 8 },
  { id: 4, name: '服饰鞋包', icon: '👗', productCount: 22, supplierCount: 6 },
  { id: 5, name: '美妆个护', icon: '💄', productCount: 22, supplierCount: 5 },
  { id: 6, name: '运动户外', icon: '🏃', productCount: 16, supplierCount: 4 },
  { id: 7, name: '厨房用品', icon: '🍳', productCount: 14, supplierCount: 3 },
  { id: 8, name: '电子数码', icon: '💻', productCount: 20, supplierCount: 6 },
  { id: 9, name: '宠物用品', icon: '🐾', productCount: 8, supplierCount: 2 },
  { id: 10, name: '玩具礼品', icon: '🎁', productCount: 10, supplierCount: 3 },
  { id: 11, name: '建材五金', icon: '🔧', productCount: 15, supplierCount: 4 },
  { id: 12, name: '餐饮设备', icon: '🍽️', productCount: 5, supplierCount: 2 },
]

export const MOCK_PRODUCTS = [
  { id: 1, name: '便携榨汁机 USB-C充电', description: 'USB-C充电便携、30秒鲜榨、304不锈钢刀片', priceMin: 29, priceMax: 59, moq: 100, rating: 4.7, reviewCount: 3200, currency: 'CNY', images: '["https://picsum.photos/seed/prod-1-1/400/400"]', supplierName: '深圳华强电子', supplierLocation: '广东深圳', categoryId: 2, categoryName: '小家电', supportsDropShipping: true, supportsOEM: true },
  { id: 2, name: '磁吸手机支架车载', description: '超强磁吸、360°旋转、车载桌面通用', priceMin: 15, priceMax: 35, moq: 200, rating: 4.5, reviewCount: 10500, currency: 'CNY', images: '["https://picsum.photos/seed/prod-2-1/400/400"]', supplierName: '深圳华强电子', supplierLocation: '广东深圳', categoryId: 1, categoryName: '手机配件', supportsDropShipping: true, supportsOEM: false },
  { id: 3, name: '真无线蓝牙耳机Pro', description: '主动降噪、30小时续航、HiFi音质', priceMin: 89, priceMax: 199, moq: 200, rating: 4.6, reviewCount: 12000, currency: 'CNY', images: '["https://picsum.photos/seed/prod-3-1/400/400"]', supplierName: '深圳绿联科技', supplierLocation: '广东深圳', categoryId: 1, categoryName: '手机配件', supportsDropShipping: false, supportsOEM: true },
  { id: 4, name: '磁吸充电宝10000mAh', description: 'MagSafe磁吸无线充、10000mAh、PD20W', priceMin: 89, priceMax: 159, moq: 200, rating: 4.7, reviewCount: 8900, currency: 'CNY', images: '["https://picsum.photos/seed/prod-4-1/400/400"]', supplierName: '深圳绿联科技', supplierLocation: '广东深圳', categoryId: 1, categoryName: '手机配件', supportsDropShipping: true, supportsOEM: false },
  { id: 5, name: '磁力片儿童STEAM', description: '60片磁力构建片、STEM教育', priceMin: 29, priceMax: 69, moq: 200, rating: 4.5, reviewCount: 4200, currency: 'CNY', images: '["https://picsum.photos/seed/prod-5-1/400/400"]', supplierName: '汕头澄海玩具', supplierLocation: '广东汕头', categoryId: 10, categoryName: '玩具礼品', supportsDropShipping: true, supportsOEM: true },
  { id: 6, name: '高速吹风机负离子', description: '11万转无刷马达、负离子护发、智能温控', priceMin: 49, priceMax: 129, moq: 200, rating: 4.5, reviewCount: 22000, currency: 'CNY', images: '["https://picsum.photos/seed/prod-6-1/400/400"]', supplierName: '广东小熊电器', supplierLocation: '广东佛山', categoryId: 2, categoryName: '小家电', supportsDropShipping: true, supportsOEM: true },
  { id: 7, name: '智能扫地机器人', description: 'LDS激光导航、5000Pa吸力、自动集尘', priceMin: 799, priceMax: 1999, moq: 100, rating: 4.6, reviewCount: 15000, currency: 'CNY', images: '["https://picsum.photos/seed/prod-7-1/400/400"]', supplierName: '广东美的电器', supplierLocation: '广东佛山', categoryId: 2, categoryName: '小家电', supportsDropShipping: false, supportsOEM: false },
  { id: 8, name: '运动蓝牙耳机', description: 'IPX7防水、20小时续航、耳挂式设计', priceMin: 59, priceMax: 129, moq: 200, rating: 4.4, reviewCount: 8200, currency: 'CNY', images: '["https://picsum.photos/seed/prod-8-1/400/400"]', supplierName: '深圳安克创新', supplierLocation: '广东深圳', categoryId: 6, categoryName: '运动户外', supportsDropShipping: true, supportsOEM: true },
]

export const MOCK_SUPPLIERS = [
  { id: 1, nameZh: '深圳华强电子', nameEn: 'Huaqiang Electronics', location: '广东深圳', yearEstablished: 2005, employeeCount: 800, businessTags: '["电子产品","手机配件","数码"]', rating: 4.7, reviewCount: 1280, isVerified: true, type: 'factory', certifications: '["ISO9001","CE","FCC"]', productCount: 28 },
  { id: 2, nameZh: '浙江义乌小商品', nameEn: 'Yiwu Commodities', location: '浙江义乌', yearEstablished: 2008, employeeCount: 350, businessTags: '["日用百货","家居","礼品"]', rating: 4.3, reviewCount: 560, isVerified: true, type: 'distributor', certifications: '["ISO9001"]', productCount: 45 },
  { id: 3, nameZh: '广东美的电器', nameEn: 'Midea Appliances', location: '广东佛山', yearEstablished: 1968, employeeCount: 160000, businessTags: '["小家电","厨房电器","空调"]', rating: 4.8, reviewCount: 5600, isVerified: true, type: 'brand', certifications: '["ISO9001","ISO14001","UL","CE"]', productCount: 32 },
  { id: 4, nameZh: '汕头澄海玩具', nameEn: 'Chenghai Toys', location: '广东汕头', yearEstablished: 2010, employeeCount: 200, businessTags: '["玩具","儿童用品","益智"]', rating: 4.2, reviewCount: 380, isVerified: false, type: 'factory', certifications: '["CCC","EN71"]', productCount: 18 },
  { id: 5, nameZh: '泉州鞋业集团', nameEn: 'Quanzhou Shoes', location: '福建泉州', yearEstablished: 2000, employeeCount: 1200, businessTags: '["运动鞋","休闲鞋","鞋材"]', rating: 4.4, reviewCount: 890, isVerified: true, type: 'factory', certifications: '["ISO9001","ISO14001"]', productCount: 24 },
  { id: 6, nameZh: '广东小熊电器', nameEn: 'Bear Appliances', location: '广东佛山', yearEstablished: 2006, employeeCount: 5000, businessTags: '["小家电","创意电器","厨房"]', rating: 4.5, reviewCount: 2200, isVerified: true, type: 'brand', certifications: '["ISO9001","CCC","CE"]', productCount: 15 },
  { id: 7, nameZh: '深圳安克创新', nameEn: 'Anker Innovations', location: '广东深圳', yearEstablished: 2011, employeeCount: 5000, businessTags: '["充电器","充电宝","音频","智能家居"]', rating: 4.7, reviewCount: 8900, isVerified: true, type: 'brand', certifications: '["ISO9001","CE","FCC","UL"]', productCount: 20 },
  { id: 8, nameZh: '深圳影石创新', nameEn: 'Insta360', location: '广东深圳', yearEstablished: 2015, employeeCount: 2000, businessTags: '["全景相机","运动相机","VR设备"]', rating: 4.7, reviewCount: 4500, isVerified: true, type: 'brand', certifications: '["CE","FCC","RoHS"]', productCount: 10 },
]

export function getPaginatedMockProducts(page: number, pageSize: number, categoryId?: number | null) {
  const filtered = categoryId
    ? MOCK_PRODUCTS.filter(p => p.categoryId === categoryId)
    : MOCK_PRODUCTS
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)
  return {
    items: items.map(p => ({
      ...p,
      aggregatedReviews: [],
      supplier: MOCK_SUPPLIERS.find(s => s.nameZh === p.supplierName) ?? MOCK_SUPPLIERS[0],
      category: { id: p.categoryId, name: p.categoryName },
    })),
    total: filtered.length,
    page,
    pageSize,
  }
}

export function getPaginatedMockSuppliers(page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return {
    items: MOCK_SUPPLIERS.slice(start, start + pageSize),
    total: MOCK_SUPPLIERS.length,
    page,
    pageSize,
  }
}
