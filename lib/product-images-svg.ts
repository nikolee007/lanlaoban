/**
 * 产品 SVG 图片生成器 — 按品类生成精细产品轮廓图
 * 每个品类有独特的产品形状，看起来像真实产品剪影
 */

const CATEGORY_ART: Record<string, { bg: string; accent: string; dark: string; label: string }> = {
  '电子产品': { bg: '#EFF6FF', accent: '#3B82F6', dark: '#1E40AF', label: '📱' },
  '服装': { bg: '#FFF1F2', accent: '#FF6034', dark: '#BE123C', label: '👗' },
  '家居': { bg: '#F0FDF4', accent: '#22C55E', dark: '#166534', label: '🏠' },
  '美妆': { bg: '#FDF2F8', accent: '#EC4899', dark: '#9D174D', label: '💄' },
  '食品': { bg: '#FFFBEB', accent: '#F59E0B', dark: '#92400E', label: '🍜' },
  '宠物': { bg: '#F5F3FF', accent: '#8B5CF6', dark: '#5B21B6', label: '🐾' },
  '运动': { bg: '#F0F9FF', accent: '#0EA5E9', dark: '#075985', label: '🏃' },
  '玩具': { bg: '#FFF0F0', accent: '#F43F5E', dark: '#9F1239', label: '🧸' },
  '鞋类': { bg: '#F8FAFC', accent: '#64748B', dark: '#334155', label: '👟' },
  '其他': { bg: '#F3F4F6', accent: '#9CA3AF', dark: '#4B5563', label: '📦' },
}

const CATEGORY_KEYWORDS: [RegExp, string][] = [
  [/蓝牙|耳机|充电宝|数据线|智能|数码|电子|手机|电脑|手表|音箱|电器|LED|灯|充电|电池/, '电子产品'],
  [/服装|服饰|衣服|T恤|连衣裙|裤子|衬衫|外套|内衣|童装|女装|男装|运动服|瑜伽|泳装|睡衣/, '服装'],
  [/沙发|床垫|家具|茶几|椅子|桌子|收纳|厨房|餐具|陶瓷|花瓶|窗帘|地毯|毛巾|浴巾/, '家居'],
  [/口红|面膜|护肤品|美妆|化妆品|粉底|眼影|香水|精华|面霜|护手霜/, '美妆'],
  [/食品|零食|饮料|茶|咖啡|啤酒|白酒|红酒|保健品|营养|调料/, '食品'],
  [/宠物|狗|猫|宠物粮|宠物玩具|宠物窝/, '宠物'],
  [/运动|健身|瑜伽|跑步|球类|泳衣|运动鞋|跑鞋/, '运动'],
  [/玩具|玩偶|积木|模型|儿童|早教/, '玩具'],
  [/鞋|运动鞋|跑鞋|皮鞋|拖鞋/, '鞋类'],
]

function guessCategory(name: string): string {
  for (const [regex, cat] of CATEGORY_KEYWORDS) {
    if (regex.test(name)) return cat
  }
  return '其他'
}

/**
 * 品类 SVG 图标生成 — 每个品类有独特的产品剪影
 * 看起来像真实产品的简约扁平化图标
 */
export function categoryProductSVG(category: string, size = 200): string {
  const c = CATEGORY_ART[category] || CATEGORY_ART['其他']
  const s = size
  const cx = s/2, cy = s/2

  // 各品类的SVG路径
  const shapes: Record<string, string> = {
    '电子产品': `<rect x="${s*0.2}" y="${s*0.22}" width="${s*0.6}" height="${s*0.36}" rx="12" fill="white" stroke="${c.accent}" stroke-width="2.5"/>
<rect x="${s*0.25}" y="${s*0.28}" width="${s*0.5}" height="${s*0.2}" rx="4" fill="${c.accent}" opacity="0.12"/>
<circle cx="${cx}" cy="${s*0.64}" r="3" fill="${c.dark}" opacity="0.4"/>
<rect x="${s*0.42}" y="${s*0.62}" width="${s*0.16}" height="${s*0.08}" rx="2" fill="${c.dark}" opacity="0.15"/>`,

    '服装': `<path d="M${s*0.25} ${s*0.35} L${s*0.25} ${s*0.7} L${s*0.35} ${s*0.7} L${s*0.35} ${s*0.45} L${s*0.5} ${s*0.5} L${s*0.65} ${s*0.45} L${s*0.65} ${s*0.7} L${s*0.75} ${s*0.7} L${s*0.75} ${s*0.35} L${s*0.5} ${s*0.25} Z" fill="white" stroke="${c.accent}" stroke-width="2.5" stroke-linejoin="round"/>
<circle cx="${s*0.38}" cy="${s*0.35}" r="1.5" fill="${c.accent}"/>
<circle cx="${s*0.62}" cy="${s*0.35}" r="1.5" fill="${c.accent}"/>`,

    '家居': `<rect x="${s*0.2}" y="${s*0.4}" width="${s*0.6}" height="${s*0.35}" rx="6" fill="white" stroke="${c.accent}" stroke-width="2.5"/>
<rect x="${s*0.28}" y="${s*0.45}" width="${s*0.44}" height="${s*0.12}" rx="2" fill="${c.accent}" opacity="0.15"/>
<path d="M${s*0.15} ${s*0.4} L${cx} ${s*0.15} L${s*0.85} ${s*0.4}" fill="none" stroke="${c.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="${s*0.38}" y="${s*0.6}" width="${s*0.24}" height="${s*0.15}" rx="2" fill="${c.dark}" opacity="0.08"/>`,

    '美妆': `<rect x="${s*0.35}" y="${s*0.25}" width="${s*0.3}" height="${s*0.2}" rx="6" fill="white" stroke="${c.accent}" stroke-width="2.5"/>
<rect x="${s*0.38}" y="${s*0.38}" width="${s*0.24}" height="${s*0.35}" rx="4" fill="white" stroke="${c.accent}" stroke-width="2.5"/>
<circle cx="${cx}" cy="${s*0.33}" r="3" fill="${c.accent}" opacity="0.3"/>`,

    '食品': `<path d="M${s*0.3} ${s*0.3} Q${cx} ${s*0.15} ${s*0.7} ${s*0.3} L${s*0.65} ${s*0.65} Q${cx} ${s*0.75} ${s*0.35} ${s*0.65} Z" fill="white" stroke="${c.accent}" stroke-width="2.5"/>
<path d="M${s*0.42} ${s*0.35} L${s*0.5} ${s*0.55} L${s*0.58} ${s*0.35}" fill="none" stroke="${c.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,

    '宠物': `<path d="M${s*0.25} ${s*0.45} Q${cx} ${s*0.3} ${s*0.75} ${s*0.45} L${s*0.7} ${s*0.7} Q${cx} ${s*0.75} ${s*0.3} ${s*0.7} Z" fill="white" stroke="${c.accent}" stroke-width="2.5"/>
<ellipse cx="${cx-10}" cy="${s*0.55}" rx="3" ry="2" fill="${c.dark}" opacity="0.15"/>
<ellipse cx="${cx+10}" cy="${s*0.55}" rx="3" ry="2" fill="${c.dark}" opacity="0.15"/>
<ellipse cx="${cx-6}" cy="${s*0.42}" rx="2" ry="1.5" fill="${c.dark}" opacity="0.12"/>
<ellipse cx="${cx+6}" cy="${s*0.42}" rx="2" ry="1.5" fill="${c.dark}" opacity="0.12"/>`,

    '运动': `<circle cx="${cx}" cy="${s*0.42}" r="${s*0.18}" fill="white" stroke="${c.accent}" stroke-width="2.5"/>
<path d="M${s*0.28} ${s*0.55} Q${cx} ${s*0.45} ${s*0.72} ${s*0.55}" fill="none" stroke="${c.accent}" stroke-width="2.5" stroke-linecap="round"/>
<line x1="${s*0.35}" y1="${s*0.7}" x2="${s*0.4}" y2="${s*0.6}" stroke="${c.accent}" stroke-width="2" stroke-linecap="round"/>
<line x1="${s*0.65}" y1="${s*0.7}" x2="${s*0.6}" y2="${s*0.6}" stroke="${c.accent}" stroke-width="2" stroke-linecap="round"/>`,

    '玩具': `<rect x="${s*0.25}" y="${s*0.3}" width="${s*0.5}" height="${s*0.4}" rx="8" fill="white" stroke="${c.accent}" stroke-width="2.5"/>
<circle cx="${cx-10}" cy="${s*0.45}" r="4" fill="${c.accent}" opacity="0.2"/>
<circle cx="${cx+10}" cy="${s*0.45}" r="4" fill="${c.accent}" opacity="0.2"/>
<path d="M${cx-15} ${s*0.55} Q${cx} ${s*0.65} ${cx+15} ${s*0.55}" fill="none" stroke="${c.accent}" stroke-width="1.5" stroke-linecap="round"/>`,

    '鞋类': `<path d="M${s*0.2} ${s*0.5} L${s*0.2} ${s*0.65} Q${s*0.3} ${s*0.7} ${s*0.5} ${s*0.65} L${s*0.75} ${s*0.5} Q${s*0.8} ${s*0.4} ${s*0.7} ${s*0.38} L${s*0.5} ${s*0.42} L${s*0.3} ${s*0.42} Z" fill="white" stroke="${c.accent}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M${s*0.35} ${s*0.42} L${s*0.35} ${s*0.58}" stroke="${c.dark}" stroke-width="1.5" opacity="0.15"/>`,

    '其他': `<rect x="${s*0.22}" y="${s*0.28}" width="${s*0.56}" height="${s*0.44}" rx="6" fill="white" stroke="${c.accent}" stroke-width="2.5"/>
<line x1="${s*0.22}" y1="${s*0.4}" x2="${s*0.78}" y2="${s*0.4}" stroke="${c.accent}" stroke-width="1.5" opacity="0.3"/>
<circle cx="${cx}" cy="${cy+5}" r="${s*0.06}" fill="${c.accent}" opacity="0.12"/>`,
  }

  const svgShape = shapes[category] || shapes['其他']

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="bg_${category}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c.bg}"/>
      <stop offset="100%" style="stop-color:white"/>
    </linearGradient>
  </defs>
  <rect width="${s}" height="${s}" fill="url(#bg_${category})" rx="${s*0.06}"/>
  <!-- Decorative dots -->
  <g opacity="0.04">
    ${Array.from({length: 20}, (_, i) => {
      const x = 15 + (i % 5) * (s-30)/4
      const y = s-15 - Math.floor(i/5) * (s-30)/4
      return `<circle cx="${x}" cy="${y}" r="2" fill="${c.accent}"/>`
    }).join('')}
  </g>
  <!-- Product silhouette -->
  <g transform="translate(0, ${s*0.02})">
    ${svgShape}
  </g>
  <!-- Watermark category -->
  <text x="${s*0.9}" y="${s*0.08}" text-anchor="end" font-family="system-ui,sans-serif" font-size="${s*0.06}" font-weight="700" fill="${c.accent}" opacity="0.15">${category}</text>
</svg>`
}

export function productImageSVG(name: string, width = 200, height = 200, productId?: number | string): string {
  const category = guessCategory(name)
  const svg = categoryProductSVG(category, Math.min(width, height))
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function getCategoryInfo(name: string): { category: string; color: string; bg: string } {
  const category = guessCategory(name)
  const c = CATEGORY_ART[category] || CATEGORY_ART['其他']
  return { category, color: c.accent, bg: c.bg }
}
