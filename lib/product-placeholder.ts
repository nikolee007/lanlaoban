/**
 * 产品图片系统 v3 — 按商品名匹配具体产品形状
 * 蓝牙耳机 → 耳机svg / 充电宝 → 充电宝svg / T恤 → T恤svg
 */

let _imageMap: Record<string, string> = {}

export function setProductImageMap(map: Record<string, string>) {
  _imageMap = map
}

/* ─── 商品关键词 → 特定产品SVG ───────────────── */

// 每个产品关键词匹配一个SVG产品图形
interface ProductShape {
  name: string        // 显示名称
  svg: string         // SVG路径
  bg: string          // 背景色
  accent: string      // 强调色
}

// 针对特定商品匹配SVG形状
const PRODUCT_SVG_SHAPES: [RegExp, ProductShape][] = [
  // === 电子产品 ===
  [/蓝牙|耳机|耳塞|earbud|headphone/, {
    name: '耳机',
    bg: '#EFF6FF', accent: '#3B82F6',
    svg: `<g transform="translate(0,-25)">
      <path d="M100 170 L100 130 Q100 100 130 100 L170 100 Q200 100 200 130 L200 170" fill="white" stroke="#3B82F6" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="100" cy="170" rx="30" ry="40" fill="white" stroke="#3B82F6" stroke-width="4"/>
      <ellipse cx="200" cy="170" rx="30" ry="40" fill="white" stroke="#3B82F6" stroke-width="4"/>
      <ellipse cx="100" cy="170" rx="15" ry="20" fill="#DBEAFE"/>
      <ellipse cx="200" cy="170" rx="15" ry="20" fill="#DBEAFE"/>
      <circle cx="100" cy="120" r="8" fill="#3B82F6" opacity="0.3"/>
      <circle cx="200" cy="120" r="8" fill="#3B82F6" opacity="0.3"/>
    </g>`
  }],
  [/充电宝|移动电源|powerbank/, {
    name: '充电宝',
    bg: '#EFF6FF', accent: '#3B82F6',
    svg: `<rect x="65" y="80" width="170" height="140" rx="20" fill="white" stroke="#3B82F6" stroke-width="4"/>
    <rect x="85" y="100" width="130" height="60" rx="6" fill="#DBEAFE"/>
    <ellipse cx="150" cy="130" rx="40" ry="20" fill="#3B82F6" opacity="0.1"/>
    <rect x="175" y="170" width="30" height="15" rx="4" fill="#3B82F6" opacity="0.3"/>
    <rect x="100" y="170" width="30" height="15" rx="4" fill="#3B82F6" opacity="0.3"/>
    <rect x="137" y="80" width="26" height="10" rx="3" fill="#3B82F6" opacity="0.2"/>`
  }],
  [/手表|watch|手环/, {
    name: '手表',
    bg: '#EFF6FF', accent: '#3B82F6',
    svg: `<rect x="90" y="60" width="120" height="180" rx="30" fill="white" stroke="#3B82F6" stroke-width="4"/>
    <rect x="100" y="90" width="100" height="100" rx="12" fill="#DBEAFE"/>
    <circle cx="150" cy="140" r="30" fill="white"/>
    <line x1="150" y1="140" x2="150" y2="125" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"/>
    <line x1="150" y1="140" x2="162" y2="145" stroke="#3B82F6" stroke-width="2" stroke-linecap="round"/>
    <rect x="75" y="140" width="15" height="20" rx="4" fill="#3B82F6" opacity="0.2"/>
    <path d="M110 200 Q150 215 190 200" fill="none" stroke="#3B82F6" stroke-width="3" opacity="0.3"/>`
  }],
  [/手机|phone|iphone|三星/, {
    name: '手机',
    bg: '#EFF6FF', accent: '#3B82F6',
    svg: `<rect x="110" y="50" width="80" height="200" rx="14" fill="white" stroke="#3B82F6" stroke-width="4"/>
    <rect x="118" y="70" width="64" height="140" rx="4" fill="#DBEAFE"/>
    <circle cx="150" cy="225" r="5" fill="#3B82F6" opacity="0.3"/>
    <rect x="143" y="60" width="14" height="8" rx="4" fill="#3B82F6" opacity="0.4"/>
    <rect x="103" y="105" width="7" height="25" rx="2" fill="#3B82F6" opacity="0.2"/>
    <rect x="103" y="140" width="7" height="25" rx="2" fill="#3B82F6" opacity="0.2"/>`
  }],
  [/音箱|speaker|音响/, {
    name: '音箱',
    bg: '#EFF6FF', accent: '#3B82F6',
    svg: `<rect x="80" y="70" width="140" height="160" rx="30" fill="white" stroke="#3B82F6" stroke-width="4"/>
    <circle cx="150" cy="130" r="35" fill="#DBEAFE"/>
    <circle cx="150" cy="130" r="15" fill="#3B82F6" opacity="0.15"/>
    <rect x="100" y="190" width="100" height="12" rx="4" fill="#3B82F6" opacity="0.15"/>
    <circle cx="150" cy="60" r="8" fill="#3B82F6" opacity="0.2"/>
    <circle cx="150" cy="60" r="4" fill="#3B82F6" opacity="0.3"/>`
  }],
  [/电脑|笔记本|laptop/, {
    name: '电脑',
    bg: '#EFF6FF', accent: '#3B82F6',
    svg: `<rect x="60" y="55" width="180" height="120" rx="8" fill="white" stroke="#3B82F6" stroke-width="4"/>
    <rect x="70" y="65" width="160" height="90" rx="4" fill="#DBEAFE"/>
    <rect x="50" y="175" width="200" height="10" rx="4" fill="white" stroke="#3B82F6" stroke-width="3"/>
    <rect x="135" y="180" width="30" height="6" rx="2" fill="#3B82F6" opacity="0.3"/>`
  }],
  [/LED|灯|台灯|lamp/, {
    name: '台灯',
    bg: '#EFF6FF', accent: '#F59E0B',
    svg: `<rect x="135" y="180" width="30" height="50" rx="4" fill="white" stroke="#F59E0B" stroke-width="3"/>
    <path d="M145 180 Q150 140 150 130 Q150 100 100 90" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
    <path d="M100 90 Q70 80 60 95 Q70 110 100 100 Z" fill="#FEF3C7" stroke="#F59E0B" stroke-width="3"/>
    <ellipse cx="80" cy="95" rx="20" ry="8" fill="#FEF3C7" opacity="0.5"/>
    <rect x="130" y="180" width="40" height="10" rx="3" fill="#F59E0B" opacity="0.2"/>`
  }],
  [/相机|camera/, {
    name: '相机',
    bg: '#EFF6FF', accent: '#3B82F6',
    svg: `<rect x="65" y="95" width="170" height="110" rx="16" fill="white" stroke="#3B82F6" stroke-width="4"/>
    <rect x="110" y="80" width="80" height="20" rx="6" fill="white" stroke="#3B82F6" stroke-width="3"/>
    <circle cx="150" cy="150" r="30" fill="#DBEAFE"/>
    <circle cx="150" cy="150" r="18" fill="white"/>
    <circle cx="150" cy="150" r="8" fill="#3B82F6" opacity="0.2"/>
    <circle cx="195" cy="125" r="6" fill="#3B82F6" opacity="0.3"/>`
  }],

  // === 服装 ===
  [/T恤|t恤|tee/, {
    name: 'T恤',
    bg: '#FFF1F2', accent: '#FF6034',
    svg: `<path d="M80 100 L80 200 L110 200 L110 150 L150 160 L190 150 L190 200 L220 200 L220 100 L150 70 Z" fill="white" stroke="#FF6034" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="110" cy="100" r="5" fill="#FF6034" opacity="0.2"/>
    <circle cx="190" cy="100" r="5" fill="#FF6034" opacity="0.2"/>`
  }],
  [/连衣裙|裙子|dress/, {
    name: '连衣裙',
    bg: '#FFF1F2', accent: '#FF6034',
    svg: `<path d="M110 70 Q150 60 190 70 L200 100 L185 220 Q150 230 115 220 L100 100 Z" fill="white" stroke="#FF6034" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="130" cy="80" r="4" fill="#FF6034" opacity="0.2"/>
    <circle cx="170" cy="80" r="4" fill="#FF6034" opacity="0.2"/>
    <path d="M130 100 Q150 140 170 100" fill="none" stroke="#FF6034" stroke-width="2" opacity="0.3"/>`
  }],
  [/牛仔|jeans|裤子|裤/, {
    name: '裤子',
    bg: '#FFF1F2', accent: '#FF6034',
    svg: `<rect x="95" y="70" width="110" height="40" rx="6" fill="white" stroke="#FF6034" stroke-width="4"/>
    <path d="M95 110 L110 220 L140 220 L150 160 L160 220 L190 220 L205 110" fill="white" stroke="#FF6034" stroke-width="4" stroke-linejoin="round"/>`
  }],
  [/衬衫|shirt/, {
    name: '衬衫',
    bg: '#FFF1F2', accent: '#FF6034',
    svg: `<path d="M85 95 L85 200 L115 200 L115 155 L150 165 L185 155 L185 200 L215 200 L215 95 L150 65 Z" fill="white" stroke="#FF6034" stroke-width="4" stroke-linejoin="round"/>
    <line x1="150" y1="65" x2="150" y2="155" stroke="#FF6034" stroke-width="2" opacity="0.3"/>
    <circle cx="120" cy="95" r="4" fill="#FF6034" opacity="0.2"/>
    <circle cx="180" cy="95" r="4" fill="#FF6034" opacity="0.2"/>`
  }],
  [/运动服|瑜伽|泳装|sportswear/, {
    name: '运动服',
    bg: '#F0F9FF', accent: '#0EA5E9',
    svg: `<path d="M100 70 Q150 55 200 70 L210 100 L195 210 Q150 220 105 210 L90 100 Z" fill="white" stroke="#0EA5E9" stroke-width="4" stroke-linejoin="round"/>
    <path d="M120 90 Q150 130 180 90" fill="none" stroke="#0EA5E9" stroke-width="2" opacity="0.3"/>
    <line x1="150" y1="75" x2="150" y2="200" stroke="#0EA5E9" stroke-width="2" opacity="0.2"/>`
  }],

  // === 家居 ===
  [/沙发|sofa/, {
    name: '沙发',
    bg: '#F0FDF4', accent: '#22C55E',
    svg: `<rect x="40" y="120" width="220" height="80" rx="12" fill="white" stroke="#22C55E" stroke-width="4"/>
    <rect x="40" y="80" width="55" height="55" rx="10" fill="white" stroke="#22C55E" stroke-width="4"/>
    <rect x="205" y="80" width="55" height="55" rx="10" fill="white" stroke="#22C55E" stroke-width="4"/>
    <rect x="60" y="130" width="180" height="55" rx="8" fill="#DCFCE7"/>
    <rect x="40" y="195" width="220" height="12" rx="4" fill="#22C55E" opacity="0.15"/>`
  }],
  [/餐具|碗碟|plate|陶瓷/, {
    name: '餐具',
    bg: '#F0FDF4', accent: '#22C55E',
    svg: `<ellipse cx="150" cy="130" rx="65" ry="50" fill="white" stroke="#22C55E" stroke-width="3"/>
    <ellipse cx="150" cy="130" rx="40" ry="30" fill="#DCFCE7"/>
    <circle cx="150" cy="130" r="12" fill="white"/>
    <ellipse cx="100" cy="170" rx="35" ry="25" fill="white" stroke="#22C55E" stroke-width="3"/>
    <ellipse cx="100" cy="170" rx="20" ry="14" fill="#DCFCE7"/>
    <ellipse cx="195" cy="165" rx="28" ry="20" fill="white" stroke="#22C55E" stroke-width="3"/>`
  }],

  // === 美妆 ===
  [/口红|lipstick/, {
    name: '口红',
    bg: '#FDF2F8', accent: '#EC4899',
    svg: `<rect x="130" y="60" width="40" height="120" rx="8" fill="white" stroke="#EC4899" stroke-width="4"/>
    <path d="M120 180 Q150 190 180 180 L175 170 Q150 178 125 170 Z" fill="white" stroke="#EC4899" stroke-width="3"/>
    <path d="M125 60 Q150 45 175 60" fill="#FCE7F3" stroke="#EC4899" stroke-width="3"/>
    <rect x="135" y="75" width="30" height="40" rx="4" fill="#FCE7F3"/>`
  }],
  [/面膜|skincare|护肤/, {
    name: '护肤品',
    bg: '#FDF2F8', accent: '#EC4899',
    svg: `<rect x="110" y="65" width="80" height="170" rx="20" fill="white" stroke="#EC4899" stroke-width="4"/>
    <rect x="120" y="90" width="60" height="60" rx="8" fill="#FCE7F3"/>
    <rect x="125" y="165" width="50" height="40" rx="6" fill="#FCE7F3" opacity="0.5"/>
    <rect x="135" y="60" width="30" height="10" rx="3" fill="#EC4899" opacity="0.2"/>`
  }],
  [/香水|perfume/, {
    name: '香水',
    bg: '#FDF2F8', accent: '#EC4899',
    svg: `<rect x="132" y="90" width="36" height="60" rx="6" fill="white" stroke="#EC4899" stroke-width="3"/>
    <rect x="138" y="70" width="24" height="25" rx="4" fill="white" stroke="#EC4899" stroke-width="3"/>
    <circle cx="150" cy="65" r="6" fill="#FCE7F3"/>
    <rect x="115" y="150" width="70" height="55" rx="12" fill="white" stroke="#EC4899" stroke-width="4"/>
    <rect x="125" y="160" width="50" height="35" rx="6" fill="#FCE7F3"/>`
  }],

  // === 食品 ===
  [/啤酒|beer/, {
    name: '啤酒',
    bg: '#FFFBEB', accent: '#F59E0B',
    svg: `<rect x="130" y="50" width="40" height="180" rx="8" fill="white" stroke="#F59E0B" stroke-width="4"/>
    <rect x="125" y="170" width="50" height="60" rx="6" fill="white" stroke="#F59E0B" stroke-width="3"/>
    <rect x="120" y="60" width="60" height="55" rx="6" fill="white" stroke="#F59E0B" stroke-width="3"/>
    <rect x="132" y="100" width="36" height="55" rx="4" fill="#FEF3C7"/>
    <rect x="120" y="85" width="60" height="8" rx="3" fill="#F59E0B" opacity="0.15"/>`
  }],
  [/白酒|wine|红酒/, {
    name: '酒瓶',
    bg: '#FFFBEB', accent: '#F59E0B',
    svg: `<rect x="138" y="40" width="24" height="40" rx="4" fill="white" stroke="#F59E0B" stroke-width="3"/>
    <rect x="130" y="80" width="40" height="130" rx="16" fill="white" stroke="#F59E0B" stroke-width="4"/>
    <rect x="140" y="100" width="20" height="50" rx="4" fill="#FEF3C7"/>
    <rect x="135" y="85" width="30" height="6" rx="2" fill="#F59E0B" opacity="0.2"/>`
  }],
  [/咖啡|coffee/, {
    name: '咖啡',
    bg: '#FFFBEB', accent: '#F59E0B',
    svg: `<rect x="120" y="65" width="60" height="130" rx="8" fill="white" stroke="#F59E0B" stroke-width="4"/>
    <path d="M180 80 Q210 95 190 140" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
    <rect x="130" y="85" width="40" height="70" rx="4" fill="#FEF3C7"/>
    <path d="M130 78 Q150 55 170 78" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>`
  }],

  // === 宠物 ===
  [/宠物|狗|dog|cat|猫/, {
    name: '宠物用品',
    bg: '#F5F3FF', accent: '#8B5CF6',
    svg: `<ellipse cx="120" cy="130" rx="35" ry="25" fill="white" stroke="#8B5CF6" stroke-width="3"/>
    <ellipse cx="180" cy="130" rx="35" ry="25" fill="white" stroke="#8B5CF6" stroke-width="3"/>
    <rect x="120" y="110" width="60" height="40" fill="white" stroke="#8B5CF6" stroke-width="3"/>
    <ellipse cx="95" cy="90" rx="20" ry="16" fill="white" stroke="#8B5CF6" stroke-width="3"/>
    <ellipse cx="205" cy="90" rx="20" ry="16" fill="white" stroke="#8B5CF6" stroke-width="3"/>
    <circle cx="150" cy="120" r="6" fill="#EDE9FE"/>`
  }],

  // === 运动 ===
  [/跑鞋|运动鞋|sneakers/, {
    name: '运动鞋',
    bg: '#F0F9FF', accent: '#0EA5E9',
    svg: `<path d="M70 160 L70 190 Q110 210 160 190 L210 160 Q230 145 215 130 L180 130 L130 140 L85 140 Z" fill="white" stroke="#0EA5E9" stroke-width="4" stroke-linejoin="round"/>
    <path d="M95 145 L95 170" stroke="#0EA5E9" stroke-width="3" opacity="0.3"/>
    <path d="M130 140 L130 175" stroke="#0EA5E9" stroke-width="3" opacity="0.3"/>
    <path d="M160 135 L160 180" stroke="#0EA5E9" stroke-width="3" opacity="0.3"/>
    <path d="M70 180 Q110 195 210 180" fill="none" stroke="#0EA5E9" stroke-width="3" opacity="0.2"/>`
  }],

  // === 鞋类 ===
  [/皮鞋|靴子|boots/, {
    name: '鞋子',
    bg: '#F8FAFC', accent: '#64748B',
    svg: `<path d="M80 170 L80 195 Q120 210 170 195 L220 170 Q235 160 225 150 L195 150 L150 155 L100 155 Z" fill="white" stroke="#64748B" stroke-width="4" stroke-linejoin="round"/>
    <path d="M100 158 L100 185" stroke="#64748B" stroke-width="3" opacity="0.2"/>
    <path d="M150 155 L150 185" stroke="#64748B" stroke-width="3" opacity="0.2"/>`
  }],

  // === 玩具 ===
  [/积木|lego|blocks/, {
    name: '积木',
    bg: '#FFF0F0', accent: '#F43F5E',
    svg: `<rect x="80" y="130" width="50" height="60" rx="6" fill="white" stroke="#F43F5E" stroke-width="3"/>
    <rect x="150" y="100" width="60" height="70" rx="6" fill="white" stroke="#F43F5E" stroke-width="3"/>
    <rect x="110" y="60" width="40" height="40" rx="6" fill="white" stroke="#F43F5E" stroke-width="3"/>
    <circle cx="130" cy="150" r="5" fill="#FFE4F0"/>
    <circle cx="170" cy="130" r="5" fill="#FFE4F0"/>
    <circle cx="150" cy="80" r="4" fill="#FFE4F0"/>`
  }],
  [/玩偶|teddy|毛绒/, {
    name: '玩偶',
    bg: '#FFF0F0', accent: '#F43F5E',
    svg: `<circle cx="120" cy="90" r="25" fill="white" stroke="#F43F5E" stroke-width="3"/>
    <circle cx="180" cy="90" r="25" fill="white" stroke="#F43F5E" stroke-width="3"/>
    <ellipse cx="150" cy="150" rx="45" ry="50" fill="white" stroke="#F43F5E" stroke-width="3"/>
    <circle cx="135" cy="80" r="5" fill="#F43F5E" opacity="0.2"/>
    <circle cx="165" cy="80" r="5" fill="#F43F5E" opacity="0.2"/>
    <circle cx="150" cy="100" r="4" fill="#F43F5E" opacity="0.2"/>
    <path d="M130 160 Q150 170 170 160" fill="none" stroke="#F43F5E" stroke-width="2" stroke-linecap="round"/>`
  }],
]

// 品类回退

/* ─── 品类真实照片映射（前3优先级） ──────────────── */
// 有真实照片的品类优先用真实照片

const CATEGORY_REAL_PHOTOS: Record<string, string[]> = {
  '电子产品': [
    '/product-images/baidu/电子产品_智能手表运动_0.jpg',
    '/product-images/baidu/电子产品_蓝牙音箱便携_2.jpg',
    '/product-images/baidu/电子产品_无线充电器快充_4.jpg',
    '/product-images/baidu/电子产品_智能手环运动_3.jpg',
    '/product-images/baidu/电子产品_头戴式耳机头戴_3.jpg',
    '/product-images/baidu/电子产品_头戴式耳机头戴_2.jpg',
    '/product-images/baidu/电子产品_智能手环运动_2.jpg',
    '/product-images/baidu/电子产品_蓝牙音箱便携_3.jpg',
    '/product-images/baidu/电子产品_智能手表运动_1.jpg',
    '/product-images/baidu/电子产品_蓝牙音箱便携_1.jpg',
    '/product-images/baidu/电子产品_智能手表运动_3.jpg',
    '/product-images/baidu/电子产品_智能手环运动_0.jpg',
    '/product-images/baidu/电子产品_头戴式耳机头戴_0.jpg',
    '/product-images/baidu/电子产品_智能台灯LED_4.jpg',
    '/product-images/baidu/电子产品_头戴式耳机头戴_1.jpg',
    '/product-images/baidu/电子产品_智能手环运动_1.jpg',
    '/product-images/baidu/电子产品_智能手表运动_2.jpg',
    '/product-images/baidu/电子产品_蓝牙音箱便携_0.jpg',
    '/product-images/baidu/电子产品_蓝牙音箱便携_4.jpg',
    '/product-images/baidu/电子产品_无线充电器快充_2.jpg',
  ],
  '服装': [
    '/product-images/baidu/服装_瑜伽裤女_2.jpg',
    '/product-images/baidu/服装_运动套装女_4.jpg',
    '/product-images/baidu/服装_瑜伽裤女_3.jpg',
    '/product-images/baidu/服装_瑜伽裤女_1.jpg',
    '/product-images/baidu/服装_瑜伽裤女_0.jpg',
    '/product-images/baidu/服装_瑜伽裤女_4.jpg',
    '/product-images/baidu/服装_运动套装女_3.jpg',
    '/product-images/baidu/服装_运动套装女_2.jpg',
    '/product-images/baidu/服装_运动套装女_0.jpg',
    '/product-images/baidu/服装_运动套装女_1.jpg',
    '/product-images/baidu/服装_POLO衫男_0.jpg',
    '/product-images/baidu/服装_打底裤女_4.jpg',
    '/product-images/baidu/服装_睡衣家居服_4.jpg',
    '/product-images/baidu/服装_运动服健身_4.jpg',
    '/product-images/baidu/服装_婴儿连体衣爬服_1.jpg',
    '/product-images/baidu/服装_牛仔裤男款_3.jpg',
    '/product-images/baidu/服装_卫衣连帽衫_4.jpg',
    '/product-images/baidu/服装_牛仔裤男款_2.jpg',
    '/product-images/baidu/服装_婴儿连体衣爬服_0.jpg',
    '/product-images/baidu/服装_POLO衫男_1.jpg',
  ],
  '家居': [
    '/product-images/baidu/家居_LED台灯护眼_3.jpg',
    '/product-images/baidu/家居_保温杯不锈钢_3.jpg',
    '/product-images/baidu/家居_空气炸锅智能_2.jpg',
    '/product-images/baidu/家居_陶瓷餐具套装_3.jpg',
    '/product-images/baidu/家居_收纳箱有盖_2.jpg',
    '/product-images/baidu/家居_毛巾纯棉_0.jpg',
    '/product-images/baidu/家居_窗帘遮光_4.jpg',
    '/product-images/baidu/家居_毛巾纯棉_1.jpg',
    '/product-images/baidu/家居_收纳箱有盖_3.jpg',
    '/product-images/baidu/家居_陶瓷餐具套装_2.jpg',
    '/product-images/baidu/家居_空气炸锅智能_3.jpg',
    '/product-images/baidu/家居_保温杯不锈钢_2.jpg',
    '/product-images/baidu/家居_LED台灯护眼_2.jpg',
    '/product-images/baidu/家居_保温杯不锈钢_0.jpg',
    '/product-images/baidu/家居_空气炸锅智能_1.jpg',
    '/product-images/baidu/家居_陶瓷餐具套装_0.jpg',
    '/product-images/baidu/家居_收纳箱有盖_1.jpg',
    '/product-images/baidu/家居_毛巾纯棉_3.jpg',
    '/product-images/baidu/家居_毛巾纯棉_2.jpg',
    '/product-images/baidu/家居_收纳箱有盖_0.jpg',
  ],
  '美妆': [
    '/product-images/baidu/美妆_眼影盘_3.jpg',
    '/product-images/baidu/美妆_洗面奶氨基酸_4.jpg',
    '/product-images/baidu/美妆_护肤品套装礼盒_2.jpg',
    '/product-images/baidu/美妆_护肤品套装礼盒_3.jpg',
    '/product-images/baidu/美妆_眼影盘_2.jpg',
    '/product-images/baidu/美妆_面膜补水_4.jpg',
    '/product-images/baidu/美妆_眼影盘_0.jpg',
    '/product-images/baidu/美妆_护肤品套装礼盒_1.jpg',
    '/product-images/baidu/美妆_护肤品套装礼盒_0.jpg',
    '/product-images/baidu/美妆_唇釉哑光_4.jpg',
    '/product-images/baidu/美妆_眼影盘_1.jpg',
    '/product-images/baidu/美妆_面膜补水_3.jpg',
    '/product-images/baidu/美妆_洗面奶氨基酸_2.jpg',
    '/product-images/baidu/美妆_护肤品套装礼盒_4.jpg',
    '/product-images/baidu/美妆_唇釉哑光_1.jpg',
    '/product-images/baidu/美妆_洗面奶氨基酸_3.jpg',
    '/product-images/baidu/美妆_面膜补水_2.jpg',
    '/product-images/baidu/美妆_眼影盘_4.jpg',
    '/product-images/baidu/美妆_面膜补水_0.jpg',
    '/product-images/baidu/美妆_洗面奶氨基酸_1.jpg',
  ],
  '食品': [
    '/product-images/baidu/食品_坚果零食_1.jpg',
    '/product-images/baidu/食品_矿泉水瓶装_4.jpg',
    '/product-images/baidu/食品_坚果零食_0.jpg',
    '/product-images/baidu/食品_坚果零食_2.jpg',
    '/product-images/baidu/食品_坚果零食_3.jpg',
    '/product-images/baidu/食品_矿泉水瓶装_2.jpg',
    '/product-images/baidu/食品_矿泉水瓶装_3.jpg',
    '/product-images/baidu/食品_矿泉水瓶装_1.jpg',
    '/product-images/baidu/食品_坚果零食_4.jpg',
    '/product-images/baidu/食品_矿泉水瓶装_0.jpg',
    '/product-images/baidu/食品_海苔零食_3.jpg',
    '/product-images/baidu/食品_白酒礼盒_4.jpg',
    '/product-images/baidu/食品_精酿啤酒原浆_4.jpg',
    '/product-images/baidu/食品_海苔零食_2.jpg',
    '/product-images/baidu/食品_海苔零食_0.jpg',
    '/product-images/baidu/食品_咖啡豆包装_4.jpg',
    '/product-images/baidu/食品_海苔零食_1.jpg',
    '/product-images/baidu/食品_五粮液浓香_4.jpg',
    '/product-images/baidu/食品_五粮液浓香_0.jpg',
    '/product-images/baidu/食品_白酒礼盒_2.jpg',
  ],
  '宠物': [
    '/product-images/baidu/宠物_宠物衣服狗_2.jpg',
    '/product-images/baidu/宠物_狗窝宠物床_0.jpg',
    '/product-images/baidu/宠物_猫爬架_4.jpg',
    '/product-images/baidu/宠物_狗窝宠物床_1.jpg',
    '/product-images/baidu/宠物_宠物衣服狗_3.jpg',
    '/product-images/baidu/宠物_宠物衣服狗_1.jpg',
    '/product-images/baidu/宠物_狗窝宠物床_3.jpg',
    '/product-images/baidu/宠物_狗窝宠物床_2.jpg',
    '/product-images/baidu/宠物_宠物衣服狗_0.jpg',
    '/product-images/baidu/宠物_宠物衣服狗_4.jpg',
    '/product-images/baidu/宠物_猫爬架_3.jpg',
    '/product-images/baidu/宠物_猫爬架_2.jpg',
    '/product-images/baidu/宠物_猫爬架_0.jpg',
    '/product-images/baidu/宠物_猫爬架_1.jpg',
    '/product-images/baidu/宠物_狗窝宠物床_4.jpg',
    '/product-images/baidu/宠物_猫粮猫食品_4.jpg',
    '/product-images/baidu/宠物_猫窝宠物_2.jpg',
    '/product-images/baidu/宠物_猫窝宠物_3.jpg',
    '/product-images/baidu/宠物_宠物玩具狗_1.jpg',
    '/product-images/baidu/宠物_宠物磨牙棒狗_4.jpg',
  ],
  '运动': [
    '/product-images/baidu/运动_运动水壶_4.jpg',
    '/product-images/baidu/运动_运动水壶_3.jpg',
    '/product-images/baidu/运动_运动水壶_2.jpg',
    '/product-images/baidu/运动_运动水壶_0.jpg',
    '/product-images/baidu/运动_运动水壶_1.jpg',
    '/product-images/baidu/运动_跑步机家用_4.jpg',
    '/product-images/baidu/运动_跑步机家用_3.jpg',
    '/product-images/baidu/运动_跑步机家用_2.jpg',
    '/product-images/baidu/运动_跑步机家用_0.jpg',
    '/product-images/baidu/运动_跑步机家用_1.jpg',
    '/product-images/baidu/运动_运动鞋跑鞋_4.jpg',
    '/product-images/baidu/运动_哑铃健身器材_4.jpg',
    '/product-images/baidu/运动_哑铃健身器材_3.jpg',
    '/product-images/baidu/运动_运动鞋跑鞋_3.jpg',
    '/product-images/baidu/运动_运动鞋跑鞋_2.jpg',
    '/product-images/baidu/运动_哑铃健身器材_2.jpg',
    '/product-images/baidu/运动_哑铃健身器材_0.jpg',
    '/product-images/baidu/运动_运动鞋跑鞋_0.jpg',
    '/product-images/baidu/运动_运动鞋跑鞋_1.jpg',
    '/product-images/baidu/运动_跑鞋男透气_0.jpg',
  ],
  '鞋类': [
    '/product-images/baidu/鞋类_运动鞋女_1.jpg',
    '/product-images/baidu/鞋类_皮鞋男商务_1.jpg',
    '/product-images/baidu/鞋类_皮鞋男商务_0.jpg',
    '/product-images/baidu/鞋类_运动鞋女_0.jpg',
    '/product-images/baidu/鞋类_运动鞋女_2.jpg',
    '/product-images/baidu/鞋类_皮鞋男商务_2.jpg',
    '/product-images/baidu/鞋类_皮鞋男商务_3.jpg',
    '/product-images/baidu/鞋类_运动鞋女_3.jpg',
    '/product-images/baidu/鞋类_运动鞋女_4.jpg',
    '/product-images/baidu/鞋类_皮鞋男商务_4.jpg',
    '/product-images/baidu/鞋类_拖鞋居家_4.jpg',
    '/product-images/baidu/鞋类_真皮男鞋商务_4.jpg',
    '/product-images/baidu/鞋类_拖鞋居家_3.jpg',
    '/product-images/baidu/鞋类_真皮男鞋商务_1.jpg',
    '/product-images/baidu/鞋类_真皮男鞋商务_0.jpg',
    '/product-images/baidu/鞋类_拖鞋居家_2.jpg',
    '/product-images/baidu/鞋类_拖鞋居家_0.jpg',
    '/product-images/baidu/鞋类_真皮男鞋商务_2.jpg',
    '/product-images/baidu/鞋类_真皮男鞋商务_3.jpg',
    '/product-images/baidu/鞋类_拖鞋居家_1.jpg',
  ],
  '玩具': [
    '/product-images/baidu/玩具_儿童积木玩具_3.jpg',
    '/product-images/baidu/玩具_儿童积木玩具_2.jpg',
    '/product-images/baidu/玩具_儿童积木玩具_0.jpg',
    '/product-images/baidu/玩具_儿童积木玩具_1.jpg',
    '/product-images/baidu/玩具_儿童积木玩具_4.jpg',
    '/product-images/baidu/玩具_早教玩具婴儿_3.jpg',
    '/product-images/baidu/玩具_遥控车玩具_1.jpg',
    '/product-images/baidu/玩具_遥控车玩具_0.jpg',
    '/product-images/baidu/玩具_早教玩具婴儿_2.jpg',
    '/product-images/baidu/玩具_早教玩具婴儿_0.jpg',
    '/product-images/baidu/玩具_遥控车玩具_2.jpg',
    '/product-images/baidu/玩具_遥控车玩具_3.jpg',
    '/product-images/baidu/玩具_早教玩具婴儿_1.jpg',
    '/product-images/baidu/玩具_早教玩具婴儿_4.jpg',
    '/product-images/baidu/玩具_遥控车玩具_4.jpg',
    '/product-images/baidu/玩具_婴儿玩具早教_4.jpg',
    '/product-images/baidu/玩具_婴儿玩具早教_1.jpg',
    '/product-images/baidu/玩具_婴儿玩具早教_0.jpg',
    '/product-images/baidu/玩具_婴儿玩具早教_2.jpg',
    '/product-images/baidu/玩具_婴儿玩具早教_3.jpg',
  ],
  '箱包': [
    '/product-images/baidu/箱包_真皮斜挎包女_3.jpg',
    '/product-images/baidu/箱包_真皮斜挎包女_2.jpg',
    '/product-images/baidu/箱包_真皮斜挎包女_0.jpg',
    '/product-images/baidu/箱包_背包双肩包_4.jpg',
    '/product-images/baidu/箱包_真皮斜挎包女_1.jpg',
    '/product-images/baidu/箱包_背包双肩包_1.jpg',
    '/product-images/baidu/箱包_背包双肩包_0.jpg',
    '/product-images/baidu/箱包_真皮斜挎包女_4.jpg',
    '/product-images/baidu/箱包_背包双肩包_2.jpg',
    '/product-images/baidu/箱包_背包双肩包_3.jpg',
    '/product-images/baidu/箱包_钱包男士_4.jpg',
    '/product-images/baidu/箱包_拉杆箱登机箱_4.jpg',
    '/product-images/baidu/箱包_钱包男士_2.jpg',
    '/product-images/baidu/箱包_拉杆箱登机箱_3.jpg',
    '/product-images/baidu/箱包_拉杆箱登机箱_2.jpg',
    '/product-images/baidu/箱包_钱包男士_3.jpg',
    '/product-images/baidu/箱包_钱包男士_1.jpg',
    '/product-images/baidu/箱包_拉杆箱登机箱_0.jpg',
    '/product-images/baidu/箱包_拉杆箱登机箱_1.jpg',
    '/product-images/baidu/箱包_钱包男士_0.jpg',
  ],
}




const CATEGORY_FALLBACK: Record<string, ProductShape> = {
  '电子产品': { name: '电子产品', bg: '#EFF6FF', accent: '#3B82F6', svg: `<rect x="80" y="90" width="140" height="120" rx="16" fill="white" stroke="#3B82F6" stroke-width="4"/><rect x="95" y="105" width="110" height="70" rx="6" fill="#DBEAFE"/>` },
  '服装':     { name: '服装', bg: '#FFF1F2', accent: '#FF6034', svg: `<path d="M85 95 L85 200 L115 200 L115 155 L150 165 L185 155 L185 200 L215 200 L215 95 L150 65 Z" fill="white" stroke="#FF6034" stroke-width="4" stroke-linejoin="round"/>` },
  '家居':     { name: '家居', bg: '#F0FDF4', accent: '#22C55E', svg: `<rect x="40" y="120" width="220" height="80" rx="12" fill="white" stroke="#22C55E" stroke-width="4"/><rect x="40" y="80" width="55" height="55" rx="10" fill="white" stroke="#22C55E" stroke-width="4"/><rect x="205" y="80" width="55" height="55" rx="10" fill="white" stroke="#22C55E" stroke-width="4"/>` },
  '美妆':     { name: '美妆', bg: '#FDF2F8', accent: '#EC4899', svg: `<rect x="110" y="65" width="80" height="170" rx="20" fill="white" stroke="#EC4899" stroke-width="4"/><rect x="120" y="90" width="60" height="60" rx="8" fill="#FCE7F3"/>` },
  '食品':     { name: '食品', bg: '#FFFBEB', accent: '#F59E0B', svg: `<rect x="130" y="50" width="40" height="180" rx="8" fill="white" stroke="#F59E0B" stroke-width="4"/><rect x="125" y="170" width="50" height="60" rx="6" fill="white" stroke="#F59E0B" stroke-width="3"/>` },
  '宠物':     { name: '宠物', bg: '#F5F3FF', accent: '#8B5CF6', svg: `<ellipse cx="120" cy="130" rx="35" ry="25" fill="white" stroke="#8B5CF6" stroke-width="3"/><ellipse cx="180" cy="130" rx="35" ry="25" fill="white" stroke="#8B5CF6" stroke-width="3"/><rect x="120" y="110" width="60" height="40" fill="white" stroke="#8B5CF6" stroke-width="3"/>` },
  '运动':     { name: '运动', bg: '#F0F9FF', accent: '#0EA5E9', svg: `<circle cx="150" cy="120" r="45" fill="white" stroke="#0EA5E9" stroke-width="4"/><path d="M115 90 Q150 100 185 90" fill="none" stroke="#0EA5E9" stroke-width="3" opacity="0.3"/><path d="M115 150 Q150 160 185 150" fill="none" stroke="#0EA5E9" stroke-width="3" opacity="0.3"/>` },
  '鞋类':     { name: '鞋', bg: '#F8FAFC', accent: '#64748B', svg: `<path d="M80 170 L80 195 Q120 210 170 195 L220 170 Q235 160 225 150 L195 150 L150 155 L100 155 Z" fill="white" stroke="#64748B" stroke-width="4" stroke-linejoin="round"/>` },
  '玩具':     { name: '玩具', bg: '#FFF0F0', accent: '#F43F5E', svg: `<rect x="90" y="110" width="60" height="70" rx="8" fill="white" stroke="#F43F5E" stroke-width="3"/><rect x="160" y="90" width="50" height="60" rx="8" fill="white" stroke="#F43F5E" stroke-width="3"/>` },
  '箱包':     { name: '箱包', bg: '#FFF7ED', accent: '#F97316', svg: `<rect x="60" y="100" width="180" height="100" rx="20" fill="white" stroke="#F97316" stroke-width="4"/><path d="M60 140 Q60 80 150 80 Q240 80 240 140" fill="none" stroke="#F97316" stroke-width="4" stroke-linecap="round"/><line x1="150" y1="80" x2="150" y2="100" stroke="#F97316" stroke-width="3"/><rect x="130" y="195" width="40" height="10" rx="3" fill="#F97316" opacity="0.2"/>` },
  '其他':     { name: '商品', bg: '#F3F4F6', accent: '#9CA3AF', svg: `<rect x="75" y="85" width="150" height="130" rx="12" fill="white" stroke="#9CA3AF" stroke-width="4"/><line x1="75" y1="120" x2="225" y2="120" stroke="#9CA3AF" stroke-width="2" opacity="0.3"/><circle cx="150" cy="175" r="12" fill="#9CA3AF" opacity="0.08"/>` },
}

/* ─── 关键词匹配 ──────────────────────────────── */
const CAT_KW: [RegExp, string][] = [
  [/蓝牙|耳机|充电宝|数据线|智能|数码|电子|手机|电脑|手表|音箱|电器|LED|灯|充电|电池/, '电子产品'],
  [/服装|服饰|衣服|T恤|连衣裙|裤子|衬衫|外套|内衣|童装|女装|男装|运动服|瑜伽|泳装|睡衣|真丝/, '服装'],
  [/沙发|床垫|家具|茶几|椅子|桌子|收纳|厨房|餐具|陶瓷|花瓶|窗帘|地毯|毛巾|浴巾|家电|洗衣机|扫地/, '家居'],
  [/口红|面膜|护肤品|美妆|化妆品|粉底|眼影|香水|精华|面霜|护手霜/, '美妆'],
  [/食品|零食|饮料|茶|咖啡|啤酒|白酒|红酒|保健品|营养|调料/, '食品'],
  [/宠物|狗|猫|宠物粮|宠物玩具|宠物窝/, '宠物'],
  [/运动|健身|瑜伽|跑步|球类|泳衣|运动鞋|跑鞋/, '运动'],
  [/玩具|玩偶|积木|模型|儿童|早教/, '玩具'],
  [/鞋|运动鞋|跑鞋|皮鞋|拖鞋/, '鞋类'],
  [/箱包|背包|挎包|双肩包|拉杆箱|旅行箱|登机箱|钱包/, '箱包'],
]

function guessCategory(name: string): string {
  for (const [regex, cat] of CAT_KW) {
    if (regex.test(name)) return cat
  }
  return '其他'
}

function matchProductShape(name: string): ProductShape | null {
  for (const [regex, shape] of PRODUCT_SVG_SHAPES) {
    if (regex.test(name)) return shape
  }
  return null
}

/* ─── 关键词精确图片匹配（运行时加载） ───────── */
let _keywordImageMap: Record<string, string[]> | null = null

async function loadKeywordImageMap(): Promise<void> {
  if (_keywordImageMap) return
  try {
    const res = await fetch('/api/baidu-product-images')
    const json = await res.json()
    _keywordImageMap = json?.data || json || {}
  } catch {
    _keywordImageMap = {}
  }
}



/* ─── 内联关键词产品图映射（同步可用） ──────────── */
// 106 个关键词，557 张图片


/* ─── AI生成产品图映射（内联，同步可用） ──── */
// 142 个商品有AI高清图
const AI_IMAGE_MAP: Record<string, string> = {
  '1714': '/product-images/ai-generated/ai-product-1714.png',
  '1715': '/product-images/ai-generated/ai-product-1715.png',
  '1716': '/product-images/ai-generated/ai-product-1716.png',
  '1717': '/product-images/ai-generated/ai-product-1717.png',
  '1718': '/product-images/ai-generated/ai-product-1718.png',
  '1719': '/product-images/ai-generated/ai-product-1719.png',
  '1720': '/product-images/ai-generated/ai-product-1720.png',
  '1721': '/product-images/ai-generated/ai-product-1721.png',
  '1722': '/product-images/ai-generated/ai-product-1722.png',
  '1723': '/product-images/ai-generated/ai-product-1723.png',
  '1724': '/product-images/ai-generated/ai-product-1724.png',
  '1725': '/product-images/ai-generated/ai-product-1725.png',
  '1726': '/product-images/ai-generated/ai-product-1726.png',
  '1727': '/product-images/ai-generated/ai-product-1727.png',
  '1728': '/product-images/ai-generated/ai-product-1728.png',
  '1729': '/product-images/ai-generated/ai-product-1729.png',
  '1730': '/product-images/ai-generated/ai-product-1730.png',
  '1731': '/product-images/ai-generated/ai-product-1731.png',
  '1732': '/product-images/ai-generated/ai-product-1732.png',
  '1733': '/product-images/ai-generated/ai-product-1733.png',
  '1734': '/product-images/ai-generated/ai-product-1734.png',
  '1735': '/product-images/ai-generated/ai-product-1735.png',
  '1736': '/product-images/ai-generated/ai-product-1736.png',
  '1737': '/product-images/ai-generated/ai-product-1737.png',
  '1738': '/product-images/ai-generated/ai-product-1738.png',
  '1739': '/product-images/ai-generated/ai-product-1739.png',
  '1740': '/product-images/ai-generated/ai-product-1740.png',
  '1741': '/product-images/ai-generated/ai-product-1741.png',
  '1742': '/product-images/ai-generated/ai-product-1742.png',
  '1743': '/product-images/ai-generated/ai-product-1743.png',
  '1744': '/product-images/ai-generated/ai-product-1744.png',
  '1745': '/product-images/ai-generated/ai-product-1745.png',
  '1746': '/product-images/ai-generated/ai-product-1746.png',
  '1747': '/product-images/ai-generated/ai-product-1747.png',
  '1748': '/product-images/ai-generated/ai-product-1748.png',
  '1749': '/product-images/ai-generated/ai-product-1749.png',
  '1750': '/product-images/ai-generated/ai-product-1750.png',
  '1751': '/product-images/ai-generated/ai-product-1751.png',
  '1752': '/product-images/ai-generated/ai-product-1752.png',
  '1753': '/product-images/ai-generated/ai-product-1753.png',
  '1754': '/product-images/ai-generated/ai-product-1754.png',
  '1755': '/product-images/ai-generated/ai-product-1755.png',
  '1756': '/product-images/ai-generated/ai-product-1756.png',
  '1757': '/product-images/ai-generated/ai-product-1757.png',
  '1758': '/product-images/ai-generated/ai-product-1758.png',
  '1759': '/product-images/ai-generated/ai-product-1759.png',
  '1760': '/product-images/ai-generated/ai-product-1760.png',
  '1761': '/product-images/ai-generated/ai-product-1761.png',
  '1762': '/product-images/ai-generated/ai-product-1762.png',
  '1763': '/product-images/ai-generated/ai-product-1763.png',
  '1764': '/product-images/ai-generated/ai-product-1764.png',
  '1765': '/product-images/ai-generated/ai-product-1765.png',
  '1766': '/product-images/ai-generated/ai-product-1766.png',
  '1767': '/product-images/ai-generated/ai-product-1767.png',
  '1768': '/product-images/ai-generated/ai-product-1768.png',
  '1769': '/product-images/ai-generated/ai-product-1769.png',
  '1770': '/product-images/ai-generated/ai-product-1770.png',
  '1771': '/product-images/ai-generated/ai-product-1771.png',
  '1772': '/product-images/ai-generated/ai-product-1772.png',
  '1773': '/product-images/ai-generated/ai-product-1773.png',
  '1774': '/product-images/ai-generated/ai-product-1774.png',
  '1775': '/product-images/ai-generated/ai-product-1775.png',
  '1776': '/product-images/ai-generated/ai-product-1776.png',
  '1777': '/product-images/ai-generated/ai-product-1777.png',
  '1778': '/product-images/ai-generated/ai-product-1778.png',
  '1779': '/product-images/ai-generated/ai-product-1779.png',
  '1780': '/product-images/ai-generated/ai-product-1780.png',
  '1781': '/product-images/ai-generated/ai-product-1781.png',
  '1782': '/product-images/ai-generated/ai-product-1782.png',
  '1783': '/product-images/ai-generated/ai-product-1783.png',
  '1784': '/product-images/ai-generated/ai-product-1784.png',
  '1785': '/product-images/ai-generated/ai-product-1785.png',
  '1786': '/product-images/ai-generated/ai-product-1786.png',
  '1787': '/product-images/ai-generated/ai-product-1787.png',
  '1788': '/product-images/ai-generated/ai-product-1788.png',
  '1789': '/product-images/ai-generated/ai-product-1789.png',
  '1790': '/product-images/ai-generated/ai-product-1790.png',
  '1791': '/product-images/ai-generated/ai-product-1791.png',
  '1792': '/product-images/ai-generated/ai-product-1792.png',
  '1793': '/product-images/ai-generated/ai-product-1793.png',
  '1794': '/product-images/ai-generated/ai-product-1794.png',
  '1795': '/product-images/ai-generated/ai-product-1795.png',
  '1796': '/product-images/ai-generated/ai-product-1796.png',
  '1797': '/product-images/ai-generated/ai-product-1797.png',
  '1798': '/product-images/ai-generated/ai-product-1798.png',
  '1799': '/product-images/ai-generated/ai-product-1799.png',
  '1800': '/product-images/ai-generated/ai-product-1800.png',
  '1801': '/product-images/ai-generated/ai-product-1801.png',
  '1802': '/product-images/ai-generated/ai-product-1802.png',
  '1803': '/product-images/ai-generated/ai-product-1803.png',
  '1804': '/product-images/ai-generated/ai-product-1804.png',
  '1805': '/product-images/ai-generated/ai-product-1805.png',
  '1806': '/product-images/ai-generated/ai-product-1806.png',
  '1807': '/product-images/ai-generated/ai-product-1807.png',
  '1808': '/product-images/ai-generated/ai-product-1808.png',
  '1809': '/product-images/ai-generated/ai-product-1809.png',
  '1810': '/product-images/ai-generated/ai-product-1810.png',
  '1811': '/product-images/ai-generated/ai-product-1811.png',
  '1812': '/product-images/ai-generated/ai-product-1812.png',
  '1813': '/product-images/ai-generated/ai-product-1813.png',
  '1814': '/product-images/ai-generated/ai-product-1814.png',
  '1815': '/product-images/ai-generated/ai-product-1815.png',
  '1816': '/product-images/ai-generated/ai-product-1816.png',
  '1817': '/product-images/ai-generated/ai-product-1817.png',
  '1818': '/product-images/ai-generated/ai-product-1818.png',
  '1819': '/product-images/ai-generated/ai-product-1819.png',
  '1820': '/product-images/ai-generated/ai-product-1820.png',
  '1821': '/product-images/ai-generated/ai-product-1821.png',
  '1822': '/product-images/ai-generated/ai-product-1822.png',
  '1823': '/product-images/ai-generated/ai-product-1823.png',
  '1824': '/product-images/ai-generated/ai-product-1824.png',
  '1825': '/product-images/ai-generated/ai-product-1825.png',
  '1826': '/product-images/ai-generated/ai-product-1826.png',
  '1827': '/product-images/ai-generated/ai-product-1827.png',
  '1828': '/product-images/ai-generated/ai-product-1828.png',
  '1829': '/product-images/ai-generated/ai-product-1829.png',
  '1830': '/product-images/ai-generated/ai-product-1830.png',
  '1831': '/product-images/ai-generated/ai-product-1831.png',
  '1832': '/product-images/ai-generated/ai-product-1832.png',
  '1833': '/product-images/ai-generated/ai-product-1833.png',
  '1834': '/product-images/ai-generated/ai-product-1834.png',
  '1835': '/product-images/ai-generated/ai-product-1835.png',
  '1836': '/product-images/ai-generated/ai-product-1836.png',
  '1837': '/product-images/ai-generated/ai-product-1837.png',
  '1838': '/product-images/ai-generated/ai-product-1838.png',
  '1839': '/product-images/ai-generated/ai-product-1839.png',
  '1840': '/product-images/ai-generated/ai-product-1840.png',
  '1841': '/product-images/ai-generated/ai-product-1841.png',
  '1842': '/product-images/ai-generated/ai-product-1842.png',
  '1843': '/product-images/ai-generated/ai-product-1843.png',
  '1844': '/product-images/ai-generated/ai-product-1844.png',
  '1845': '/product-images/ai-generated/ai-product-1845.png',
  '1846': '/product-images/ai-generated/ai-product-1846.png',
  '1847': '/product-images/ai-generated/ai-product-1847.png',
  '1848': '/product-images/ai-generated/ai-product-1848.png',
  '1849': '/product-images/ai-generated/ai-product-1849.png',
  '1850': '/product-images/ai-generated/ai-product-1850.png',
  '1851': '/product-images/ai-generated/ai-product-1851.png',
  '1852': '/product-images/ai-generated/ai-product-1852.png',
  '1853': '/product-images/ai-generated/ai-product-1853.png',
  '1854': '/product-images/ai-generated/ai-product-1854.png',
  '1855': '/product-images/ai-generated/ai-product-1855.png',
}


const INLINE_KEYWORD_MAP: Record<string, string[]> = {
}

function matchKeywordImage(name: string): string | null {
  // 优先使用已加载的异步映射（更新鲜）
  const source = _keywordImageMap || INLINE_KEYWORD_MAP
  if (!source) return null
  // 按关键词长度降序匹配（长词优先）
  const keys = Object.keys(source).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    if (name.includes(key)) {
      const imgs = source[key]
      if (imgs && imgs.length > 0) {
        let hash = 0
        for (let i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash) + name.charCodeAt(i)
          hash |= 0
        }
        return imgs[Math.abs(hash) % imgs.length]
      }
    }
  }
  return null
}

/**
 * 获取产品图片
 * 优先级: 关键词精确图片 → 品类真实照片 → 生成图映射 → SVG产品轮廓
 * 始终返回有效值，不会返回 undefined 或空字符串
 */
export function productPlaceholderSVG(name: string, width = 200, height = 200, productId?: number | string): string {
  try {
    const category = guessCategory(name)

    // 1. AI生成图（内联，最高优先级！）
    if (productId && AI_IMAGE_MAP[String(productId)]) {
      return AI_IMAGE_MAP[String(productId)]
    }
    if (productId && _imageMap[String(productId)]) {
      return _imageMap[String(productId)]
    }

    // 2. 关键词级精确匹配（百度实拍图）
    const kwMatch = matchKeywordImage(name)
    if (kwMatch) return kwMatch

    // 3. 品类级真实照片
    const photos = CATEGORY_REAL_PHOTOS[category]
    if (photos && photos.length > 0) {
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i)
        hash |= 0
      }
      return photos[Math.abs(hash) % photos.length]
    }

    // 4. 按商品名匹配具体产品SVG
    const shape = matchProductShape(name)
    if (shape) return shapeToSVG(shape, width, height)

    // 5. 按品类回退SVG
    const fallback = CATEGORY_FALLBACK[category] || CATEGORY_FALLBACK['其他']
    return shapeToSVG(fallback, width, height)
  } catch {
    // 终极兜底 — 确保任何情况下都返回有效值
    const safeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#F3F4F6" rx="${Math.min(width, height) * 0.04}"/>
      <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-size="${Math.min(width, height) * 0.05}" fill="#9CA3AF">${name || '商品'}</text>
    </svg>`
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(safeSvg)}`
  }
}

function shapeToSVG(shape: ProductShape, w: number, h: number): string {
  const s = Math.min(w, h)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="g" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${shape.bg}"/>
      <stop offset="100%" stop-color="white"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" rx="${s*0.04}"/>
  <g opacity="0.04">
    ${[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
      const x = 12 + (i % 4) * (w-24)/3
      const y = h-12 - Math.floor(i/4) * (h-24)/3
      return `<circle cx="${x}" cy="${y}" r="2" fill="${shape.accent}"/>`
    }).join('')}
  </g>
  <g transform="translate(${w/2-150}, ${h/2-150}) scale(${s/300})">
    ${shape.svg}
  </g>
  <text x="${w/2}" y="${h*0.93}" text-anchor="middle" font-size="${s*0.035}" fill="${shape.accent}" opacity="0.15">${shape.name}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function getCategoryInfo(name: string): { category: string; color: string; bg: string } {
  const category = guessCategory(name)
  const c = CATEGORY_FALLBACK[category] || CATEGORY_FALLBACK['其他']
  return { category, color: c.accent, bg: c.bg }
}

export async function loadProductImageMap(): Promise<Record<string, string>> {
  try {
    const [imgRes, kwRes] = await Promise.all([
      fetch('/api/global-supply/product-images'),
      fetch('/api/baidu-product-images'),
    ])
    const imgJson = await imgRes.json()
    const kwJson = await kwRes.json()
    _keywordImageMap = kwJson?.data || kwJson || {}
    return imgJson?.data || imgJson || {}
  } catch {
    _keywordImageMap = {}
    return {}
  }
}
