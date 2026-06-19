/**
 * 用精准prompt重新生成所有商品的AI产品图
 * 覆盖全部142个商品，每个商品类型都有专属prompt
 *
 * 运行: node scripts/regenerate-ai-images-precise.mjs
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const API_KEY = 'sk-wpsLt5JiISV9fjtN5h3bALz3oj0AtqbyAy0fcgpBhUN6UHCw'
const API_URL = 'https://apihub.agnes-ai.com/v1/images/generations'
const OUT_DIR = path.join(__dirname, '../public/product-images/ai-generated')
fs.mkdirSync(OUT_DIR, { recursive: true })

// ============================================================
// 精准prompt映射 — 覆盖全部142个商品的品类
// 按关键词匹配，越精确的关键词越靠前
// ============================================================
const PRECISE_PROMPTS = {
  // ===== 电子产品（28个） =====
  'PCB电路板': 'professional product photo of green PCB circuit board with gold traces and electronic components mounted, detailed macro shot, studio lighting, pure white background, electronics component catalog style',
  '蓝牙模组': 'close-up product photo of small Bluetooth BLE module chip on anti-static foam, gold pins visible, studio lighting, pure white background, electronics component photography',
  '无人机': '4K drone quadcopter with camera gimbal, unfolded ready for flight, product photography, white background, studio lighting, tech gadget e-commerce style',
  'VR一体机': 'VR headset with 4K lenses and controllers placed in front, product photography, white background, studio lighting, futuristic tech product style',
  '行车记录仪': 'car dashboard camera with suction mount, lens visible, product photography, white background, studio lighting, automotive electronics catalog',
  '空气开关': 'miniature circuit breaker MCB, white and blue housing, product photography, pure white background, electrical component catalog style, studio lighting',
  '充电器': 'white GaN USB-C fast charger cube with foldable plug, product photography, white background, studio lighting, tech accessories e-commerce style',
  '充电支架': '3-in-1 magnetic wireless charging stand for phone watch earbuds, product photography, white background, studio lighting, desk accessory style',
  'WiFi智能插座': 'white smart WiFi plug socket with energy monitoring display, product photography, white background, studio lighting, smart home product catalog',
  '智能门锁': '3D facial recognition smart door lock with keypad and handle, brushed metal finish, product photography, white background, studio lighting, smart home style',
  '电源适配器': 'black 12V 2A power adapter with UL certification mark, product photography, white background, studio lighting, electronics catalog style',
  '钢化膜': 'tempered glass screen protector on transparent stand, 2.5D curved edge detail, product photography, white background, studio lighting, phone accessory style',
  '降噪耳机': 'premium noise cancelling over-ear headphones, matte black, folded for storage, soft studio lighting, pure white background, product photography, high-end audio e-commerce style, 8K detail',
  'TWS耳机': 'compact white TWS wireless earbuds in charging case, LED indicator glowing, lid open showing earbuds, product photography, white background, commercial studio lighting, tech gadget style',
  '充电宝': 'slim portable power bank with digital battery percentage display, brushed aluminum finish, product photography, white background, commercial lighting, premium e-commerce style',
  '数据线': 'colorful braided USB-C fast charging cable coiled neatly, connector tips visible, product photography, white background, studio lighting, detailed texture on braided surface, tech accessory style',
  '智能手表': 'modern AMOLED smartwatch with silicone strap, fitness tracking display, product photography, white background, studio lighting, premium wearable tech style',
  '蓝牙音箱': 'compact portable Bluetooth speaker with fabric grille, IPX7 waterproof rating visible, product photography, white background, studio lighting, audio product catalog style',
  '手机壳': 'slim transparent shockproof phone case with reinforced corners and camera cutout, product photography, white background, commercial studio lighting, phone accessory style',
  '平板电脑': 'tablet computer with aluminum body on minimalist stand, clean white background, studio lighting, tech product photography, e-commerce catalog style',
  '跑步T恤': 'performance moisture-wicking running t-shirt, athletic fit, product photography, white background, studio lighting, sportswear catalog style',
  '太阳镜': 'aviator style polarized sunglasses with UV400 lens, tortoise shell frame, product photography, white background, studio lighting, eyewear catalog style',
  '智能音频眼镜': 'smart audio glasses with Bluetooth 5.3, sleek frame design, product photography, white background, studio lighting, wearable tech style',

  // ===== 服装 / 配饰（22个） =====
  'T恤': 'plain cotton printed t-shirt folded neatly flat lay, product photography, pure white background, studio lighting, e-commerce catalog style, wrinkle-free presentation',
  '连衣裙': 'elegant floral print summer dress on invisible mannequin, flowing fabric, product photography, white background, studio lighting, fashion catalog style',
  '衬衫': 'crisp oxford dress shirt buttoned up, business formal, product photography, white background, commercial studio lighting, folded presentation, mens fashion style',
  '婴儿连体衣': 'soft cotton baby onesie romper set, newborn clothing, product photography, white background, gentle studio lighting, baby product catalog style',
  '运动服': 'high performance yoga sportswear set, moisture-wicking fabric, product photography, white background, studio lighting, athletic wear catalog style',
  '睡衣': 'luxury silk pajama set, soft fabric texture visible, product photography, white background, soft studio lighting, sleepwear catalog style',
  '双肩背包': 'business laptop backpack with USB charging port, 15.6 inch compartment, product photography, white background, studio lighting, travel gear style',
  '钱包': 'genuine leather mens bifold wallet, handstitched detail, product photography, white background, studio lighting, luxury accessories style',
  '女包': 'women fashion PU crossbody bag, elegant design, product photography, white background, studio lighting, handbag catalog style',
  '休闲裤': 'men casual straight leg chinos, flat lay folded, product photography, white background, studio lighting, clothing catalog style',
  '文胸': 'seamless lace push-up bra, delicate embroidery detail, product photography, white background, studio lighting, lingerie catalog style',
  '夹克': 'men business casual spring jacket, lightweight fabric, product photography, white background, studio lighting, outerwear catalog style',
  '卫衣': 'Korean style oversized hoodie pullover, casual streetwear, product photography, white background, studio lighting, fashion catalog style',
  '大衣': 'French style wool blend long coat, elegant draped silhouette, product photography, white background, studio lighting, luxury fashion catalog style',
  '羊绒衫': '100% pure cashmere crew neck sweater, soft texture detail, product photography, white background, studio lighting, premium knitwear catalog style',
  '丝巾': '100% mulberry silk scarf square 90x90cm, printed pattern, product photography, white background, soft studio lighting, fashion accessory style',
  '宠物衣服': 'warm dog vest for winter, cute pet apparel, product photography, white background, studio lighting, pet supplies catalog style',
  '鞋子': 'performance athletic running shoe, dynamic side angle, product photography, white background, studio lighting, sport shoe catalog style',
  '运动鞋': 'lightweight casual sneakers, lifestyle shoe design, product photography, white background, studio lighting, footwear catalog style',
  '拖鞋': 'comfortable EVA anti-slip bathroom slippers, lightweight foam, product photography, white background, studio lighting, home footwear style',
  '跑鞋': 'breathable knit running shoes, thick cushioned sole, product photography, white background, studio lighting, athletic footwear catalog style',

  // ===== 珠宝 / 饰品（9个） =====
  '锁骨链': 'minimalist Korean style titanium steel锁骨链 with small pendant, delicate chain, product photography, white background, studio lighting, jewelry catalog macro shot',
  '金手串': '999 pure gold Pixiu bracelet, shiny gold surface, product photography, white background, studio lighting, luxury jewelry catalog style',
  '发夹': 'large acetate hair claw clip, tortoiseshell pattern, product photography, white background, studio lighting, hair accessory catalog style',
  '耳环': '925 silver needle geometric earrings minimalist design, product photography, white background, studio lighting, jewelry catalog style',
  '发圈': 'Korean style oversized scrunchie hair tie, velvet fabric, product photography, white background, studio lighting, hair accessory style',
  '唇釉': 'velvet matte liquid lipstick set of 6 colors, rose gold caps, product photography, white background, studio lighting, beauty makeup catalog style',
  '香水': 'elegant perfume bottle with faceted glass, luxury fragrance packaging, product photography, white background, studio lighting, beauty catalog style',
  '护肤品': 'minimalist glass skincare serum bottle with pipette dropper, product photography, white background, studio lighting, cosmeceutical style',
  '精华液': 'hyaluronic acid serum 30ml in translucent bottle with dropper, product photography, white background, studio lighting, skincare beauty style',

  // ===== 美妆 / 个护（5个） =====
  '面膜': 'foil sheet mask package with skincare product branding, flat lay, product photography, white background, studio lighting, beauty skincare style',
  '洗面奶': 'amino acid facial cleanser tube 120g, gentle skincare, product photography, white background, studio lighting, personal care style',
  '打火机': 'metal windproof lighter with chrome finish, sleek design, product photography, white background, studio lighting, accessories style',
  '电子打火机': 'USB rechargeable arc lighter, electric coil visible, futuristic design, product photography, white background, studio lighting, tech accessory style',

  // ===== 家电 / 厨房（15个） =====
  '空气炸锅': 'smart air fryer 5.5L with digital touch panel and viewing window, stainless steel finish, product photography, white background, studio lighting, kitchen appliance catalog',
  '榨汁机': 'portable USB-C rechargeable juice blender 400ml, separated components display, product photography, white background, studio lighting, kitchen appliance style',
  '电煮锅': 'multifunctional electric cooking pot 2L with steaming basket, non-stick coating visible, product photography, white background, studio lighting, kitchen appliance catalog',
  '电饭煲': 'mini rice cooker 1.2L for one person, white body, inner pot visible, product photography, white background, studio lighting, small appliance style',
  '蒸烤箱': 'built-in steam oven combo 36L, stainless steel front, digital control panel, product photography, white background, studio lighting, kitchen appliance catalog',
  '除湿机': 'home dehumidifier 25L/day with compressor, white body, water tank visible, product photography, white background, studio lighting, home appliance style',
  '落地扇': 'DC inverter tower fan 14 inch, slim modern design, product photography, white background, studio lighting, home appliance catalog',
  '迷你冰箱': 'mini fridge 20L portable for car and home, retro design, product photography, white background, studio lighting, small appliance style',
  '洗衣机': 'fully automatic front load washing machine 8kg inverter, white body, porthole door, product photography, white background, studio lighting, home appliance catalog',
  '移动空调': 'portable air conditioner 9000BTU cooling and heating, exhaust hose visible, product photography, white background, studio lighting, home appliance style',

  // ===== 家具 / 家居（14个） =====
  '沙发': 'modern fabric 3-seater sofa with clean lines, soft cushions, product photography, white background, studio lighting, furniture catalog style',
  '茶几': 'luxury sintered stone coffee table 1.3m, marble texture top, product photography, white background, studio lighting, modern furniture style',
  '床垫': 'natural latex pocket spring mattress 22cm thickness, layered cross-section detail, product photography, white background, studio lighting, bedding catalog style',
  '办公椅': 'ergonomic mesh office chair with lumbar support and adjustable armrests, product photography, white background, studio lighting, furniture catalog style',
  '四件套': 'premium 60s long-staple cotton 4-piece bed sheet set, sateen weave, flat lay folded, product photography, white background, studio lighting, bedding catalog style',
  '蚕丝被': '100% mulberry silk duvet insert 1kg, white fluffy, product photography, white background, studio lighting, luxury bedding style',
  '毛巾': 'thick cotton bath towel set 6-pack, hotel quality, fluffy texture visible, product photography, white background, studio lighting, home textile style',
  '枕头': 'memory foam cervical pillow ergonomic design, product photography, white background, studio lighting, pillow bedding catalog style',
  '收纳盒': 'collapsible silicone storage box multi-purpose, organized, product photography, white background, studio lighting, home organization style',
  '保温饭盒': 'stainless steel thermal lunch box 3-layer 1.5L, vacuum insulation, product photography, white background, studio lighting, kitchenware catalog',
  '拉杆箱': 'PC hardside luggage 20 inch carry-on, spinner wheels, product photography, white background, studio lighting, travel luggage catalog',
  '仿真花束': 'artificial flower bouquet mixed floral arrangement, home decoration, product photography, white background, studio lighting, decor catalog style',
  '灯串': 'LED copper wire fairy lights 5 meters, glowing warm white, product photography, white background, studio lighting, holiday decor style',
  '厨房剪刀': 'multifunctional stainless steel kitchen shears, detachable, product photography, white background, studio lighting, kitchen tool style',

  // ===== 卫浴 / 五金（7个） =====
  '马桶': 'smart integrated toilet with bidet and drying function, modern design, product photography, white background, studio lighting, bathroom fixture catalog',
  '花洒': 'solid brass shower head set with handheld spray, chrome finish, product photography, white background, studio lighting, bathroom catalog',
  '水槽': 'stainless steel kitchen sink single basin undermount, product photography, white background, studio lighting, kitchen fixture catalog',
  '瓷砖': 'porcelain tile 800x800mm, marble pattern surface, product photography, white background, studio lighting, building material catalog',
  '沙发脚': 'stainless steel sofa legs furniture feet 8cm height, product photography, white background, studio lighting, hardware catalog style',
  '水管': 'PPR hot and cold water pipe 25mm with fittings, plumbing material, product photography, white background, studio lighting, building material catalog',
  '门锁': '3D face recognition smart door lock full automatic, fingerprint pad visible, brushed metal, product photography, white background, studio lighting, smart lock catalog',

  // ===== 餐具（4个） =====
  '骨瓷餐具': 'elegant bone china dinner set 56-piece, white with gold trim, product photography, white background, studio lighting, fine dining tableware catalog',
  '陶瓷餐具': 'colored glaze ceramic dinner set 16-piece Nordic style, product photography, white background, studio lighting, tableware catalog style',

  // ===== 补充覆盖——特殊商品名称 =====
  '运动手表': 'rugged AMOLED sports smartwatch with compass and heart rate display, silicone strap, product photography, white background, studio lighting, wearable tech catalog style',
  '模组': 'BLE bluetooth module chip on anti-static foam, small electronic component, product photography, white background, macro studio lighting, electronics catalog style',
  '运动套装': 'high waist yoga workout set 2-piece, moisture wicking fabric, product photography, white background, studio lighting, activewear catalog style',
  '爬服': 'soft cotton baby onesie romper 3-piece set, newborn infant clothing, product photography, white background, gentle studio lighting, baby product catalog style',
  '直筒裤': 'men casual straight leg chino pants, flat lay folded, product photography, white background, studio lighting, clothing catalog style',
  '加湿器': 'ultrasonic aromatherapy humidifier 500ml with LED light, modern design, product photography, white background, studio lighting, home appliance catalog style',
  '公仔': 'cute plush stuffed dog toy 40cm, soft fur, product photography, white background, studio lighting, toy catalog style',
  '跑步鞋': 'lightweight cushioned running shoes for women, breathable knit, product photography, white background, studio lighting, athletic footwear catalog style',
  '墙壁插座': 'USB-C fast charging wall outlet with dual USB ports, white panel, product photography, white background, studio lighting, electrical accessory style',
  '玻璃门夹': 'stainless steel glass door clamp for frameless shower door, hardware fitting, product photography, white background, studio lighting, building hardware catalog',
  '蒸烤一体机': 'built-in steam and oven combo 36L with digital control, stainless steel, product photography, white background, studio lighting, kitchen appliance catalog',
  '赛车': 'high-speed remote control RC racing car toy, rechargeable, product photography, white background, studio lighting, toy vehicle catalog style',
  '护颈枕': 'memory foam cervical pillow ergonomic design with contour, product photography, white background, studio lighting, bedding catalog style',
  '宠物狗': 'warm fleece dog vest for small medium dogs, pet apparel, product photography, white background, studio lighting, pet supplies catalog style',
  '发声玩具': 'durable dog squeaky toy 6-piece set, pet enrichment, product photography, white background, studio lighting, pet supplies catalog style',
  '牛肉面': 'instant beef noodle soup cup with packaging, quick meal, product photography, white background, studio lighting, food product catalog style',
  '果仁': 'macadamia nuts buttery flavor 500g bag, snack, product photography, white background, studio lighting, food packaging style',
  '手串': '999 pure gold Pixiu bracelet with red cord, 3g, product photography, white background, studio lighting, luxury jewelry macro style',
  '茶饼': 'ripe pu-erh tea cake 357g in traditional bamboo wrapping, product photography, white background, studio lighting, tea product catalog style',
  '涤纶': 'polyester FDY filament yarn 75D/36F on spool, textile raw material, product photography, white background, studio lighting, industrial material style',

  // ===== 灯具（7个） =====
  '吸顶灯': 'full spectrum LED ceiling light 48W, modern ultra-thin design, product photography, white background, studio lighting, lighting catalog style',
  'LED灯带': 'RGB smart LED strip lights 5 meters, colorful glow effect, product photography, white background, studio lighting, smart lighting catalog',
  'LED筒灯': 'LED downlight 4 inch 12W, cutout 120mm, aluminum body, product photography, white background, studio lighting, lighting catalog',
  '庭院灯': 'solar powered outdoor garden light 100W, motion sensor, product photography, white background, studio lighting, outdoor lighting catalog',
  '水晶吊灯': 'modern crystal chandelier for living room 80cm diameter, sparkling, product photography, white background, studio lighting, luxury lighting catalog',
  '水晶吊灯': 'clear glass door clamp for frameless glass door, stainless steel, product photography, white background, studio lighting, hardware catalog',
  'LED球泡': 'LED daylight bulb 9W E27 screw base, energy-saving, product photography, white background, studio lighting, lighting product style',

  // ===== 办公 / 文具（4个） =====
  '笔记本': 'A5 PU leather soft cover notebook with lined pages, pen loop, product photography, white background, studio lighting, stationery catalog style',
  '水彩笔': 'washable watercolor pen set 48 colors in display box, product photography, white background, studio lighting, art supplies catalog style',
  '钢笔': 'executive fountain pen set in gift box, gold nib, product photography, white background, studio lighting, luxury stationery catalog style',
  '笔芯': 'gel pen refills 0.5mm black ink 100 pack, product photography, white background, studio lighting, office supply catalog style',

  // ===== 食品 / 饮品（12个） =====
  '啤酒': 'cold amber beer bottle with condensation droplets, classic lager label, product photography, white background, studio lighting, beverage catalog style',
  '普洱茶饼': 'ripe pu-erh tea cake 357g in bamboo wrapper, 2018 vintage, product photography, white background, studio lighting, tea product catalog style',
  '绿茶': 'jasmine green tea loose leaf in tin, premium grade, product photography, white background, studio lighting, tea catalog style',
  '月饼': 'double yolk white lotus seed mooncake 4 pieces in gift box, Mid-Autumn Festival, product photography, white background, studio lighting, festive food catalog',
  '坚果': 'mix nuts and dried fruit snack pack 750g, assorted kernels, product photography, white background, studio lighting, food packaging style',
  '方便面': 'instant noodle cup and package, red packaging, product photography, white background, studio lighting, food product catalog',
  '挂面': 'dried fine noodles 1kg package, pasta product, product photography, white background, studio lighting, food packaging style',
  '花生油': '5S pressed peanut oil 5L bottle, cooking oil, product photography, white background, studio lighting, pantry food catalog',
  '虾仁': 'frozen peeled raw shrimp 31/40 count 1kg bag, seafood product, product photography, white background, studio lighting, frozen food catalog',
  '辣酱': 'Korean spicy sauce gochujang 500g in container, condiment, product photography, white background, studio lighting, sauce bottle style',
  '海苔': 'crispy seaweed snack original flavor 30g pack, product photography, white background, studio lighting, snack food style',
  '抽纸': 'premium facial tissue 3-ply 100 sheets multi-pack, product photography, white background, studio lighting, household paper product style',

  // ===== 玩具 / 宠物（9个） =====
  '积木': 'STEM educational building blocks set 400 pieces, colorful bricks, product photography, white background, studio lighting, toy catalog style',
  '毛绒玩具': 'soft plush stuffed dog toy 40cm, cute sleeping face, product photography, white background, studio lighting, children toy catalog',
  '盲盒': 'Chinese trendy blind box figures 12 styles series, collectible toys, product photography, white background, studio lighting, toy catalog style',
  '遥控车': 'high speed RC racing car 1:16 scale, rechargeable, product photography, white background, studio lighting, toy catalog style',
  '工程车': 'pull-back inertia construction vehicle 4-piece set, toy truck, product photography, white background, studio lighting, children toy catalog',
  '布书': 'baby early education soft cloth book set 6-piece, crinkle pages, product photography, white background, studio lighting, baby product catalog',
  '猫窝': 'removable washable pet cat bed, cozy round donut shape, product photography, white background, studio lighting, pet supplies catalog',
  '猫粮': 'premium freeze-dried cat food chicken recipe 1.5kg bag, product photography, white background, studio lighting, pet food catalog',
  '宠物玩具': 'durable dog squeaky toy bone shape 6-piece set, pet supplies, product photography, white background, studio lighting, pet accessories style',
  '泡泡机': 'electric bubble machine with auto function and 8 bottles of bubble solution, toy, product photography, white background, studio lighting, children toy style',

  // ===== 户外 / 运动（4个） =====
  '帐篷': 'automatic pop-up tent 3-4 person waterproof, outdoor camping gear, product photography, white background, studio lighting, outdoor equipment catalog',
  '哑铃': 'adjustable rubber coated dumbbell set 20kg with tray, fitness, product photography, white background, studio lighting, gym equipment catalog',
  '瑜伽垫': 'rolled TPE yoga mat with strap 6mm thick, fitness equipment, product photography, white background, studio lighting, exercise gear style',
  '帐篷': 'quick set instant tent for camping, rainfly visible, product photography, white background, studio lighting, outdoor gear style',

  // ===== 礼品 / 其他（4个） =====
  '礼品包装纸': 'creative gift wrapping paper 10-sheet set, colorful patterns, product photography, white background, studio lighting, party supply style',
  '样品包': 'beauty personal care sample selection 20-piece set for live streaming, product photography, white background, studio lighting, variety bundle style',
  '洗衣凝珠': 'laundry detergent pods 15g x 100, concentrated, product photography, white background, studio lighting, household cleaning style',
  '皮革保养油': 'leather care conditioning cream 100ml tube, shoe and bag care, product photography, white background, studio lighting, shoe care product style',

  // ===== 建材 / 原材料（5个） =====
  '花岗岩': 'natural sesame grey granite slab G654, stone texture, product photography, white background, studio lighting, building material catalog style',
  '生态板': 'E0 grade melamine faced plywood 18mm, wood grain surface, product photography, white background, studio lighting, building material catalog style',
  '涤纶长丝': 'polyester FDY fully drawn yarn 75D/36F, textile industrial raw material, product photography, white background, studio lighting, textile material catalog style',

  // ===== 五金件（5个） =====
  '螺丝': 'stainless steel 304 hex bolts M3-M12 assortment, precision fasteners, product photography, white background, studio lighting, hardware catalog style',
  '合页': 'heavy duty stainless steel hinge 4 inch, industrial hardware, product photography, white background, studio lighting, hardware component style',
  '球阀': 'flanged ball valve Q41F-16C DN50, industrial pipeline component, product photography, white background, studio lighting, industrial hardware style',
  '牛仔扣': 'vintage metal jean button set with rivets, antique bronze finish, product photography, white background, studio lighting, garment accessory style',
  '冲压件': 'precision metal stamping parts custom fabrication, silver steel surface, product photography, white background, studio lighting, industrial parts style',

  // ===== 喇叭 =====
  '喇叭': '3 inch full range speaker driver 20W 4 ohm, paper cone visible, product photography, white background, studio lighting, audio component catalog style',
}

/**
 * 获取精准prompt — 按关键词从长到短匹配
 */
function getPrecisePrompt(name) {
  // 按关键词长度降序排列（长关键词优先匹配）
  const sortedKeywords = Object.keys(PRECISE_PROMPTS).sort((a, b) => b.length - a.length)

  for (const keyword of sortedKeywords) {
    if (name.includes(keyword)) {
      return PRECISE_PROMPTS[keyword]
    }
  }

  // 兜底：用商品名生成通用prompt
  return `professional product photography of ${name}, commercial e-commerce style, pure white background, studio lighting, 8K detail, centered composition`
}

/**
 * 调用 Agnes API 生成图片
 */
function generateImage(productName, productId) {
  return new Promise((resolve, reject) => {
    const prompt = getPrecisePrompt(productName)
    const fullPrompt = `${prompt}, high quality commercial product photography, 8K`

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
          else reject(new Error(`No URL in response: ${body.slice(0, 200)}`))
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

/**
 * 下载图片
 */
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

/**
 * 主流程
 */
async function main() {
  console.log('='.repeat(60))
  console.log('  懒老板 — 精准AI商品图重新生成')
  console.log('='.repeat(60))

  // 读取当前映射
  const mappingPath = path.join(__dirname, '../lib/generated-product-images.json')
  let mapping = {}
  try {
    mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'))
  } catch {
    console.log('  ⚠️  未找到现有映射文件，将创建新的')
  }

  // 读取所有商品
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()
  const products = await prisma.product.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, name: true }
  })

  // 只处理AI图商品（排除百度图 /product-images/product-*.webp）
  const aiProducts = products.filter(p => {
    const key = String(p.id)
    return !mapping[key] || mapping[key].includes('/product-images/ai-generated/')
  })

  // 如果没有过滤出AI商品，就全部处理（可能是全新情况）
  const targetProducts = aiProducts.length > 0 ? aiProducts : products

  console.log(`\n  📊 总商品: ${products.length}`)
  console.log(`  🎯 待生成AI图: ${targetProducts.length}`)
  console.log(`  📝 精准prompt数: ${Object.keys(PRECISE_PROMPTS).length}`)

  // 统计prompt匹配情况
  let matchedCount = 0
  let fallbackCount = 0
  const sortedKeywords = Object.keys(PRECISE_PROMPTS).sort((a, b) => b.length - a.length)
  for (const p of targetProducts) {
    let matched = false
    for (const keyword of sortedKeywords) {
      if (p.name.includes(keyword)) {
        matched = true
        break
      }
    }
    if (matched) matchedCount++
    else fallbackCount++
  }
  console.log(`  ✅ 精准匹配: ${matchedCount}, 兜底fallback: ${fallbackCount}\n`)

  let success = 0
  let fail = 0

  for (let i = 0; i < targetProducts.length; i++) {
    const product = targetProducts[i]
    const key = String(product.id)
    const fname = `ai-product-${product.id}.jpg`
    const filepath = path.join(OUT_DIR, fname)
    const promptUsed = getPrecisePrompt(product.name)

    process.stdout.write(`  [${i + 1}/${targetProducts.length}] #${product.id} ${product.name.padEnd(28)} `)

    try {
      const url = await generateImage(product.name, product.id)
      const size = await downloadImage(url, filepath)
      mapping[key] = `/product-images/ai-generated/${fname}`
      success++
      console.log(`✅ ${(size / 1024).toFixed(0)}KB`)
    } catch (err) {
      fail++
      console.log(`❌ ${err.message.slice(0, 50)}`)
    }

    // 每1.5秒一张防止限速
    await new Promise(r => setTimeout(r, 1500))

    // 每20张保存进度
    if ((i + 1) % 20 === 0) {
      fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2))
      console.log(`  ─── 📍 已处理 ${i + 1}/${targetProducts.length}，已保存进度 ───`)
    }
  }

  // 最终保存
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2))

  console.log(`\n  ${'='.repeat(50)}`)
  console.log(`  ✅ 完成! 成功: ${success} 张, 失败: ${fail} 张`)
  console.log(`  📍 映射已保存到 lib/generated-product-images.json`)
  console.log(`  ${'='.repeat(50)}`)

  await prisma.$disconnect()
}

main().catch(e => {
  console.error('\n  ❌ 主流程错误:', e.message)
  process.exit(1)
})
