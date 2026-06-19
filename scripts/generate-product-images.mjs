/**
 * 用 DALL-E 3 生成产品图片
 * 按品类分批生成，存到 public/product-images/
 */

const { PrismaClient } = require('@prisma/client')
const OpenAI = require('openai')
const fs = require('fs')
const path = require('path')
const https = require('https')

const prisma = new PrismaClient()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || require('../../.env.local')?.OPENAI_API_KEY })

const OUTPUT_DIR = path.join(__dirname, '../public/product-images')
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

// 品类 prompt 模板
const CATEGORY_PROMPTS = {
  '蓝牙耳机': 'A pair of modern wireless Bluetooth earbuds in charging case, product photography, white background, studio lighting, e-commerce style, 8K',
  '充电宝': 'A sleek portable power bank with digital display, product photography, white background, studio lighting, e-commerce style, 8K',
  '数据线': 'A braided USB-C charging cable coiled neatly, product photography, white background, studio lighting, e-commerce style, 8K',
  '智能手表': 'A modern smart watch with square screen and silicone strap, product photography, white background, studio lighting, e-commerce style, 8K',
  '手机壳': 'A sleek phone case with camera cutout, product photography, white background, studio lighting, e-commerce style, 8K',
  'T恤': 'A plain cotton t-shirt folded neatly, product photography, white background, studio lighting, e-commerce style, 8K',
  '连衣裙': 'An elegant summer dress on a mannequin, product photography, white background, studio lighting, e-commerce style, 8K',
  '运动服': 'Athletic sportswear set, yoga outfit, product photography, white background, studio lighting, e-commerce style, 8K',
  '运动鞋': 'A pair of stylish running shoes, product photography, white background, studio lighting, e-commerce style, 8K',
  '陶瓷餐具': 'A set of elegant ceramic dinner plates, product photography, white background, studio lighting, e-commerce style, 8K',
  '沙发': 'A modern fabric sofa with cushions, product photography, white background, studio lighting, e-commerce style, 8K',
  '收纳盒': 'Stackable plastic storage boxes, product photography, white background, studio lighting, e-commerce style, 8K',
  '口红': 'A lipstick tube with cap off showing color, product photography, white background, studio lighting, beauty e-commerce style, 8K',
  '面膜': 'A foil face mask package, product photography, white background, studio lighting, beauty e-commerce style, 8K',
  '啤酒': 'A cold beer bottle with condensation, product photography, white background, studio lighting, e-commerce style, 8K',
  '白酒': 'A premium Chinese liquor bottle with gift box, product photography, white background, studio lighting, e-commerce style, 8K',
  '宠物玩具': 'A durable dog chew toy ball, product photography, white background, studio lighting, e-commerce style, 8K',
  '健身器材': 'A compact home gym equipment, product photography, white background, studio lighting, e-commerce style, 8K',
  '儿童玩具': 'A colorful educational toy for kids, product photography, white background, studio lighting, e-commerce style, 8K',
  'LED灯': 'A modern LED desk lamp, product photography, white background, studio lighting, e-commerce style, 8K',
}

// 识别品类关键词
function guessPrompt(name) {
  for (const [keyword, prompt] of Object.entries(CATEGORY_PROMPTS)) {
    if (name.includes(keyword)) return prompt
  }
  // 通用
  const catMatch = name.match(/蓝牙|耳机|充电|数据线|智能|电子|数码|手机|电脑|手表|音箱|电器|LED|灯|电池/)
  const clothMatch = name.match(/服装|服饰|衣服|T恤|连衣裙|裤子|衬衫|外套|内衣|童装|女装|男装|瑜伽|泳装|睡衣/)
  const homeMatch = name.match(/沙发|床垫|家具|茶几|椅子|桌子|收纳|厨房|餐具|陶瓷|花瓶|窗帘|地毯|毛巾/)
  const beautyMatch = name.match(/口红|面膜|护肤|美妆|化妆品|粉底|眼影|香水/)
  const foodMatch = name.match(/食品|零食|饮料|茶|咖啡|啤酒|白酒|红酒|保健品|营养/)
  const petMatch = name.match(/宠物|狗|猫/)
  const sportMatch = name.match(/运动|健身|瑜伽|跑步|泳衣/)
  const toyMatch = name.match(/玩具|玩偶|积木|模型|儿童/)

  if (catMatch) return `A modern electronic product, product photography, white background, studio lighting, e-commerce style, 8K`
  if (clothMatch) return `Clothing item neatly presented, product photography, white background, studio lighting, e-commerce style, 8K`
  if (homeMatch) return `Home decor item, product photography, white background, studio lighting, e-commerce style, 8K`
  if (beautyMatch) return `Beauty product, product photography, white background, studio lighting, e-commerce style, 8K`
  if (foodMatch) return `Food or beverage product, product photography, white background, studio lighting, e-commerce style, 8K`
  if (petMatch) return `Pet product, product photography, white background, studio lighting, e-commerce style, 8K`
  if (sportMatch) return `Sporting goods, product photography, white background, studio lighting, e-commerce style, 8K`
  if (toyMatch) return `Toy product, product photography, white background, studio lighting, e-commerce style, 8K`

  return `Product photography of ${name}, white background, studio lighting, e-commerce style, 8K`
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`下载失败 ${res.statusCode}`))
        return
      }
      const file = fs.createWriteStream(filepath)
      res.pipe(file)
      file.on('finish', () => file.close(resolve(true)))
      file.on('error', reject)
    }).on('error', reject)
  })
}

async function generateImages() {
  const products = await prisma.product.findMany({ orderBy: { rating: 'desc' } })
  console.log(`共 ${products.length} 个商品`)

  // 生成映射 JSON
  const imageMap = {}
  let generated = 0

  for (const product of products) {
    const filename = `product-${product.id}.webp`
    const filepath = path.join(OUTPUT_DIR, filename)
    const urlPath = `/product-images/${filename}`

    // 跳过已存在的
    if (fs.existsSync(filepath)) {
      console.log(`  ⏭️ #${product.id} ${product.name} — 已存在`)
      imageMap[product.id] = urlPath
      continue
    }

    // 每批最多5张，控制成本
    if (generated >= 20) {
      imageMap[product.id] = null
      continue
    }

    const prompt = guessPrompt(product.name)
    console.log(`  🎨 #${product.id} ${product.name}`)
    console.log(`    prompt: ${prompt}`)

    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      })

      const imageUrl = response.data[0]?.url
      if (imageUrl) {
        await downloadImage(imageUrl, filepath)
        console.log(`    ✅ 已保存: ${filename}`)
        imageMap[product.id] = urlPath
        generated++
        // DALL-E 限速
        await new Promise(r => setTimeout(r, 2000))
      }
    } catch (err) {
      console.error(`    ❌ 失败: ${err.message}`)
      imageMap[product.id] = null
    }
  }

  // 写入映射文件
  fs.writeFileSync(
    path.join(__dirname, '../lib/generated-product-images.json'),
    JSON.stringify(imageMap, null, 2)
  )
  console.log(`\n✅ 完成: 生成 ${generated} 张图片`)
  console.log(`📄 映射文件: lib/generated-product-images.json`)

  await prisma.$disconnect()
}

generateImages().catch(console.error)
