export interface PreviewTemplate {
  id: string
  name: string
  desc: string
  requiresProduct: boolean
  buildPrompt(avatarDesc: string, productDesc: string): string
}

export const PREVIEW_TEMPLATES: PreviewTemplate[] = [
  {
    id: 'owner_product',
    name: '老板+产品同框',
    desc: '老板站门店/场景前，产品放身前展台',
    requiresProduct: true,
    buildPrompt: (avatarDesc, productDesc) =>
      `A ${avatarDesc}, standing confidently in front of their shop, the product displayed on a counter in front of them, ${productDesc || 'the product prominently displayed'}, promotional scene, photorealistic, well-lit, 4K`,
  },
  {
    id: 'owner_holding',
    name: '老板手持产品',
    desc: '老板双手持产品对镜头展示',
    requiresProduct: true,
    buildPrompt: (avatarDesc, productDesc) =>
      `A ${avatarDesc}, holding the product in both hands showing it to camera, ${productDesc || 'the product clearly visible'}, half body shot, photorealistic, studio lighting, 4K`,
  },
  {
    id: 'storefront_scene',
    name: '门店场景+产品',
    desc: '老板站门店招牌下，产品在门口',
    requiresProduct: false,
    buildPrompt: (avatarDesc, productDesc) =>
      `A ${avatarDesc}, standing at the store entrance with the store sign visible, ${productDesc ? productDesc + ' displayed at the entrance, ' : ''}smiling at camera, daytime natural light, photorealistic, 4K`,
  },
]

export function getTemplate(id: string): PreviewTemplate | null {
  return PREVIEW_TEMPLATES.find(t => t.id === id) || null
}
