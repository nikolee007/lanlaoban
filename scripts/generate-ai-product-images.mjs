/**
 * 用 Agnes API 批量生成真实产品图
 * 运行: node scripts/generate-ai-product-images.mjs
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const API_KEY = 'sk-wpsLt5JiISV9fjtN5h3bALz3oj0AtqbyAy0fcgpBhUN6UHCw'
const API_URL = 'https://apihub.agnes-ai.com/v1/images/generations'
const OUT_DIR = path.join(__dirname, '../public/product-images/ai-generated')
fs.mkdirSync(OUT_DIR, { recursive: true })

// 品类→英文Prompt映射
const CATEGORY_PROMPTS = {
  '电子产品': {
    '蓝牙耳机': 'wireless Bluetooth earbuds in charging case, product photography, white background, studio lighting',
    '充电宝': 'portable power bank with digital display, product photography, white background, studio lighting',
    '数据线': 'braided USB-C charging cable coiled, product photography, white background, studio lighting',
    '智能手表': 'modern smart watch with silicone strap, product photography, white background, studio lighting',
    '手机壳': 'sleek phone case with camera cutout, product photography, white background, studio lighting',
    '蓝牙音箱': 'portable Bluetooth speaker, product photography, white background, studio lighting',
    '平板电脑': 'tablet computer on stand, product photography, white background, studio lighting',
    'default': 'electronic device, product photography, white background, studio lighting',
  },
  '服装': {
    'T恤': 'cotton t-shirt folded neatly, product photography, white background, studio lighting',
    '连衣裙': 'elegant summer dress on mannequin, product photography, white background, studio lighting',
    '衬衫': 'casual dress shirt, product photography, white background, studio lighting',
    '牛仔裤': 'blue jeans folded, product photography, white background, studio lighting',
    '运动服': 'athletic sportswear set, product photography, white background, studio lighting',
    '睡衣': 'silk pajamas set, product photography, white background, studio lighting',
    'default': 'clothing item, product photography, white background, studio lighting',
  },
  '家居': {
    '沙发': 'modern fabric sofa, product photography, white background, studio lighting',
    '陶瓷餐具': 'ceramic dinner plate set, product photography, white background, studio lighting',
    '台灯': 'modern LED desk lamp, product photography, white background, studio lighting',
    '保温杯': 'stainless steel thermos bottle, product photography, white background, studio lighting',
    'default': 'home decor item, product photography, white background, studio lighting',
  },
  '美妆': {
    '口红': 'lipstick tube, product photography, white background, studio lighting',
    '面膜': 'foil face mask package, product photography, white background, studio lighting',
    '护肤品': 'skincare bottle, product photography, white background, studio lighting',
    '香水': 'perfume bottle elegant, product photography, white background, studio lighting',
    'default': 'beauty product, product photography, white background, studio lighting',
  },
  '食品': {
    '啤酒': 'cold beer bottle with condensation, product photography, white background',
    '白酒': 'premium liquor bottle with gift box, product photography, white background',
    '咖啡': 'coffee beans and cup, product photography, white background',
    'default': 'food and beverage product, product photography, white background',
  },
  '宠物': {
    '宠物玩具': 'dog chew toy ball, product photography, white background, studio lighting',
    'default': 'pet supplies, product photography, white background, studio lighting',
  },
  '运动': {
    '运动鞋': 'running shoes side view, product photography, white background, studio lighting',
    '瑜伽垫': 'yoga mat rolled, product photography, white background, studio lighting',
    'default': 'sporting goods, product photography, white background, studio lighting',
  },
  '鞋类': {
    '皮鞋': 'leather dress shoes, product photography, white background, studio lighting',
    '运动鞋': 'sneakers stylish, product photography, white background, studio lighting',
    'default': 'shoe product, product photography, white background, studio lighting',
  },
  '玩具': {
    '积木': 'colorful building blocks toy, product photography, white background',
    '毛绒玩具': 'plush teddy bear toy, product photography, white background',
    'default': 'toy product, product photography, white background',
  },
}

function guessPrompt(name) {
  // Try category keywords
  for (const [cat, items] of Object.entries(CATEGORY_PROMPTS)) {
    for (const [keyword, prompt] of Object.entries(items)) {
      if (keyword !== 'default' && name.includes(keyword)) {
        return prompt
      }
    }
    // Check if the name matches the category broadly
  }
  return 'product photography, white background, studio lighting, e-commerce style, 8K'
}

function generateImage(productName, productId) {
  return new Promise((resolve, reject) => {
    const prompt = guessPrompt(productName)
    const fullPrompt = `${prompt}, e-commerce style, high quality, 8K, detailed`

    const data = JSON.stringify({
      model: 'agnes-image-2.1-flash',
      prompt: fullPrompt,
      n: 1,
      size: '1024x1024',
    })

    const req = https.request(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
      timeout: 120000,
    }, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(body)
          const url = json.data?.[0]?.url
          if (url) resolve(url)
          else reject(new Error('No URL in response'))
        } catch (e) {
          reject(new Error(`Parse error: ${body.slice(0, 200)}`))
        }
      })
    })

    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
    req.write(data)
    req.end()
  })
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`))
        return
      }
      res.pipe(file)
      file.on('finish', () => {
        file.close()
        const size = fs.statSync(filepath).size
        resolve(size)
      })
    }).on('error', reject)
  })
}

async function main() {
  // Read existing mapping
  let mapping = {}
  try {
    mapping = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/generated-product-images.json'), 'utf-8'))
  } catch {}

  // Get products from DB via Prisma
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()
  const products = await prisma.product.findMany({
    take: 50,
    orderBy: { rating: 'desc' },
    select: { id: true, name: true }
  })

  console.log(`📦 共 ${products.length} 个商品待生成`)
  let success = 0
  let fail = 0

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const key = String(product.id)

    // Skip if already has AI image
    if (mapping[key] && mapping[key].includes('/product-images/ai-generated/')) {
      console.log(`  ⏭️ [${i+1}/${products.length}] #${product.id} 已有AI图`)
      continue
    }

    const fname = `ai-product-${product.id}.jpg`
    const filepath = path.join(OUT_DIR, fname)

    process.stdout.write(`  🎨 [${i+1}/${products.length}] #${product.id} ${product.name.slice(0,20)}... `)

    try {
      const url = await generateImage(product.name, product.id)
      const size = await downloadImage(url, filepath)
      mapping[key] = `/product-images/ai-generated/${fname}`
      success++
      console.log(`✅ ${(size/1024).toFixed(0)}KB`)
    } catch (err) {
      fail++
      console.log(`❌ ${err.message.slice(0,40)}`)
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 1500))
  }

  // Save mapping
  fs.writeFileSync(
    path.join(__dirname, '../lib/generated-product-images.json'),
    JSON.stringify(mapping, null, 2)
  )

  console.log(`\n✅ 完成: 成功${success}张, 失败${fail}张`)
  await prisma.$disconnect()
}

main().catch(console.error)
