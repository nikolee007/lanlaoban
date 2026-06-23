export const PLATFORMS = [
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

export const IMAGE_TYPES = [
  { id: 'main', label: '主图', desc: '白底商品主图' },
  { id: 'angle', label: '多角度图', desc: '不同角度展示' },
  { id: 'detail', label: '细节图', desc: '材质/工艺/LOGO放大' },
  { id: 'scene', label: '场景使用图', desc: '真实使用效果' },
  { id: 'comparison', label: '对比图', desc: '与竞品对比' },
  { id: 'accessories', label: '配件/包装图', desc: '赠品/包装展示' },
]
