export type CloneEngineId = 'agnes' | 'jimeng' | 'kling'

export interface CreateAvatarInput {
  photos: string[]       // 用户上传照片（dataURL）
  prompt: string         // 分身形象描述
  size?: string
}

export interface CreatePreviewInput {
  avatarUrl: string      // 已生成分身图 URL
  productImage?: string  // 产品图 dataURL
  template: string       // 模板 id
  prompt: string         // 模板 buildPrompt 结果
  size?: string
}

export interface CloneEngine {
  id: CloneEngineId
  name: string           // 展示名
  pricePerImage: number  // 定价（元/张），算力扣费
  costPerImage: number   // 估算成本（元/张），算差价参考
  status: 'active' | 'coming'
  createAvatar(input: CreateAvatarInput): Promise<{ url: string }>
  createPreview(input: CreatePreviewInput): Promise<{ url: string }>
}
