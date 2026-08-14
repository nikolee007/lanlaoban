import { generateImage } from '@/lib/agnes-api'
import type { CloneEngine, CreateAvatarInput, CreatePreviewInput } from './types'

export const agnesEngine: CloneEngine = {
  id: 'agnes',
  name: 'Agnes 免费引擎',
  pricePerImage: 0.5,
  costPerImage: 0.05,
  status: 'active',
  async createAvatar(input: CreateAvatarInput) {
    const reference = input.photos[0]
    const result = await generateImage(input.prompt, input.size || '1024x1024', reference)
    if (!result.url) throw new Error('分身生成失败')
    return { url: result.url }
  },
  async createPreview(input: CreatePreviewInput) {
    const reference = input.productImage || input.avatarUrl
    const result = await generateImage(input.prompt, input.size || '1024x1024', reference)
    if (!result.url) throw new Error('预览图生成失败')
    return { url: result.url }
  },
}
