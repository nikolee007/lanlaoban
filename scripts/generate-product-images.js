#!/usr/bin/env node
/**
 * 懒老板全球供应链 — 产品图片数据映射生成脚本
 *
 * 为每个种子数据的商品分配 picsum 图片 seed，生成 product-images.json
 *
 * 规则:
 * 1. 使用 https://picsum.photos/seed/{unique-seed}/400/400 格式
 * 2. 每个商品3-5张图（详情页轮播用），另加一张缩略图
 * 3. 每个供应商1张 logo + 1张 cover
 * 4. 图片 seed 按品类分配不同的关键词前缀
 */

const fs = require('fs')
const path = require('path')

// ─── 品类定义 ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'electronics',    name: '电子产品', prefix: 'elec',  seedPrefix: 'cat-elec' },
  { id: 'fashion',        name: '服装',     prefix: 'cloth', seedPrefix: 'cat-cloth' },
  { id: 'household',      name: '家居',     prefix: 'home',  seedPrefix: 'cat-home' },
  { id: 'food',           name: '食品',     prefix: 'food',  seedPrefix: 'cat-food' },
  { id: 'toys',           name: '玩具',     prefix: 'toy',   seedPrefix: 'cat-toy' },
  { id: 'beauty',         name: '美妆',     prefix: 'beauty',seedPrefix: 'cat-beauty' },
  { id: 'pet',            name: '宠物',     prefix: 'pet',   seedPrefix: 'cat-pet' },
  { id: 'sports',         name: '运动',     prefix: 'sport', seedPrefix: 'cat-sport' },
]

// ─── 品类 ID 范围分配 ──────────────────────────────────────────────────
// 每个品类分配连续的商品ID范围，方便查找
const CATEGORY_PRODUCT_RANGES = {
  '电子产品': [1, 20],      // 1-20
  '服装':     [21, 40],     // 21-40
  '家居':     [41, 60],     // 41-60
  '食品':     [61, 75],     // 61-75
  '玩具':     [76, 90],     // 76-90
  '美妆':     [91, 100],    // 91-100
  '宠物':     [101, 110],   // 101-110
  '运动':     [111, 120],   // 111-120
}

const CATEGORY_SUPPLIER_RANGES = {
  '电子产品': [1, 18],
  '服装':     [19, 36],
  '家居':     [37, 52],
  '食品':     [53, 65],
  '玩具':     [66, 78],
  '美妆':     [79, 88],
  '宠物':     [89, 96],
  '运动':     [97, 106],
}

const TOTAL_PRODUCTS = 120
const TOTAL_SUPPLIERS = 106

// ─── 生成函数 ──────────────────────────────────────────────────────────

function getCategoryNameByProductId(id) {
  for (const [catName, [start, end]] of Object.entries(CATEGORY_PRODUCT_RANGES)) {
    if (id >= start && id <= end) return catName
  }
  return '电子产品'
}

function getCategoryPrefix(categoryName) {
  const cat = CATEGORIES.find(c => c.name === categoryName)
  return cat ? cat.prefix : 'elec'
}

function getCategoryNameBySupplierId(id) {
  for (const [catName, [start, end]] of Object.entries(CATEGORY_SUPPLIER_RANGES)) {
    if (id >= start && id <= end) return catName
  }
  return '电子产品'
}

function pickImageCount() {
  // 3-5 张图
  return 3 + Math.floor(Math.random() * 3)
}

function generateProductImages(productId) {
  const catName = getCategoryNameByProductId(productId)
  const prefix = getCategoryPrefix(catName)
  const count = pickImageCount()
  const images = []

  // 商品主图使用的比例 4:3 (640x480)，详情大图 800x600，缩略图 400x400
  // 实际生产应使用 400x400 作为基本尺寸
  for (let i = 0; i < count; i++) {
    images.push(`https://picsum.photos/seed/${prefix}-${productId}-${i + 1}/400/400`)
  }

  const thumbnail = `https://picsum.photos/seed/${prefix}-${productId}-thumb/200/200`

  return { images, thumbnail, categoryId: catName }
}

function generateSupplierImages(supplierId) {
  const catName = getCategoryNameBySupplierId(supplierId)
  const prefix = getCategoryPrefix(catName)
  const logo = `https://picsum.photos/seed/factory-${supplierId}-logo/200/200`
  const cover = `https://picsum.photos/seed/factory-${supplierId}-cover/800/400`
  return { logo, cover, categoryId: catName }
}

// ─── 构建数据 ──────────────────────────────────────────────────────────

const products = {}
for (let id = 1; id <= TOTAL_PRODUCTS; id++) {
  products[String(id)] = generateProductImages(id)
}

const suppliers = {}
for (let id = 1; id <= TOTAL_SUPPLIERS; id++) {
  suppliers[String(id)] = generateSupplierImages(id)
}

const categories = {}
for (const cat of CATEGORIES) {
  categories[cat.name] = {
    icon: `https://picsum.photos/seed/${cat.seedPrefix}/100/100`,
    productRange: CATEGORY_PRODUCT_RANGES[cat.name],
    supplierRange: CATEGORY_SUPPLIER_RANGES[cat.name],
  }
}

const output = { products, suppliers, categories }

// ─── 写入文件 ──────────────────────────────────────────────────────────

const outputPath = path.join(__dirname, '..', 'lib', 'global-supply', 'product-images.json')
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8')

console.log(`✅ product-images.json 已生成`)
console.log(`   📦 商品: ${Object.keys(products).length} 个`)
console.log(`   🏭 供应商: ${Object.keys(suppliers).length} 家`)
console.log(`   📂 品类: ${Object.keys(categories).length} 个`)
console.log(`   📍 ${outputPath}`)

// ─── 验证 ──────────────────────────────────────────────────────────────

const parsed = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
let errors = []

// 验证 product 数量
if (Object.keys(parsed.products).length < 100) {
  errors.push(`❌ 商品数量不足: ${Object.keys(parsed.products).length} (< 100)`)
}

// 验证 supplier 数量
if (Object.keys(parsed.suppliers).length < 100) {
  errors.push(`❌ 供应商数量不足: ${Object.keys(parsed.suppliers).length} (< 100)`)
}

// 验证每个商品有 3-5 张图 + thumbnail
for (const [id, p] of Object.entries(parsed.products)) {
  if (!p.images || p.images.length < 3 || p.images.length > 5) {
    errors.push(`❌ 商品 ${id}: 图片数量 ${p.images?.length} (应在3-5之间)`)
  }
  if (!p.thumbnail) {
    errors.push(`❌ 商品 ${id}: 缺少缩略图`)
  }
  if (!p.categoryId) {
    errors.push(`❌ 商品 ${id}: 缺少分类ID`)
  }
}

// 验证每个供应商有 logo + cover
for (const [id, s] of Object.entries(parsed.suppliers)) {
  if (!s.logo || !s.cover) {
    errors.push(`❌ 供应商 ${id}: 缺少 logo 或 cover`)
  }
}

// 验证每个品类有 icon
for (const [name, cat] of Object.entries(parsed.categories)) {
  if (!cat.icon) {
    errors.push(`❌ 品类 ${name}: 缺少 icon`)
  }
  if (!cat.productRange || !cat.supplierRange) {
    errors.push(`❌ 品类 ${name}: 缺少 ID 范围`)
  }
}

// 验证 URL 格式
const urlPattern = /^https:\/\/picsum\.photos\/seed\/[a-zA-Z0-9_-]+\/\d+\/\d+$/
for (const [id, p] of Object.entries(parsed.products)) {
  for (const img of p.images) {
    if (!urlPattern.test(img)) {
      errors.push(`❌ 商品 ${id}: URL格式不正确: ${img}`)
    }
  }
  if (!urlPattern.test(p.thumbnail)) {
    errors.push(`❌ 商品 ${id}: thumbnail URL格式不正确: ${p.thumbnail}`)
  }
}

if (errors.length > 0) {
  console.error(`\n❌ 验证失败，发现 ${errors.length} 个问题:`)
  errors.forEach(e => console.error(`   ${e}`))
  process.exit(1)
}

console.log(`\n✅ 全部验证通过 — 零错误`)
