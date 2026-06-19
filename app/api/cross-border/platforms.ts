export interface PlatformInfo {
  id: string
  name: string
  countries: string[]
}

export const PLATFORMS: PlatformInfo[] = [
  { id: 'shopee', name: 'Shopee', countries: ['SG', 'MY', 'TH', 'VN', 'PH', 'ID', 'TW', 'BR', 'MX', 'CO', 'CL'] },
  { id: 'amazon', name: 'Amazon', countries: ['US', 'UK', 'DE', 'FR', 'IT', 'ES', 'JP', 'CA', 'AU', 'MX', 'BR'] },
  { id: 'ozon', name: 'OZON', countries: ['RU', 'BY', 'KZ'] },
  { id: 'tiktok', name: 'TikTok Shop', countries: ['US', 'UK', 'ID', 'TH', 'VN', 'PH', 'MY', 'SG'] },
  { id: 'shopify', name: 'Shopify（独立站）', countries: ['US', 'UK', 'CA', 'AU', 'DE', 'FR'] },
  { id: 'temu', name: 'TEMU', countries: ['US', 'UK', 'DE', 'FR', 'IT', 'ES', 'JP', 'KR'] },
  { id: 'lazada', name: 'Lazada', countries: ['SG', 'MY', 'TH', 'VN', 'PH', 'ID'] },
  { id: 'aliexpress', name: 'AliExpress', countries: ['US', 'UK', 'RU', 'BR', 'ES', 'FR'] },
]

export const COUNTRY_NAMES: Record<string, string> = {
  US: '美国', UK: '英国', DE: '德国', FR: '法国', IT: '意大利', ES: '西班牙',
  JP: '日本', CA: '加拿大', AU: '澳大利亚', SG: '新加坡', MY: '马来西亚',
  TH: '泰国', VN: '越南', PH: '菲律宾', ID: '印度尼西亚', TW: '台湾',
  BR: '巴西', MX: '墨西哥', CO: '哥伦比亚', CL: '智利', RU: '俄罗斯',
  BY: '白俄罗斯', KZ: '哈萨克斯坦', KR: '韩国',
}

export const COUNTRY_LANGUAGES: Record<string, string> = {
  'US': 'en-US', 'UK': 'en-GB', 'SG': 'en-SG', 'MY': 'ms-MY', 'TH': 'th-TH',
  'VN': 'vi-VN', 'PH': 'tl-PH', 'ID': 'id-ID', 'TW': 'zh-TW', 'BR': 'pt-BR',
  'MX': 'es-MX', 'CO': 'es-CO', 'CL': 'es-CL', 'RU': 'ru-RU', 'BY': 'ru-BY',
  'KZ': 'ru-KZ', 'DE': 'de-DE', 'FR': 'fr-FR', 'IT': 'it-IT', 'ES': 'es-ES',
  'JP': 'ja-JP', 'CA': 'en-CA', 'AU': 'en-AU', 'KR': 'ko-KR',
}

export const IMAGE_TYPES = [
  { id: 'main', label: '主图', desc: '白底商品主图，适用于平台首图' },
  { id: 'angle', label: '多角度图', desc: '展示商品不同角度的照片' },
  { id: 'detail', label: '细节图', desc: '商品材质、工艺、LOGO等细节放大' },
  { id: 'scene', label: '场景使用图', desc: '商品在实际场景中的使用效果' },
  { id: 'comparison', label: '对比图', desc: '与竞品的对比展示，突出优势' },
  { id: 'accessories', label: '配件/包装图', desc: '商品配件、赠品、包装展示' },
]

export const STYLE_OPTIONS = [
  { id: 'clean', label: '简洁商务风', desc: '白底+干净排版，适合3C/家电' },
  { id: 'lifestyle', label: '生活场景风', desc: '融入真实场景，适合家居/服饰' },
  { id: 'vibrant', label: '活力潮流风', desc: '色彩鲜明，适合时尚/运动' },
  { id: 'premium', label: '高端质感风', desc: '暗调+光影效果，适合奢侈品' },
]
