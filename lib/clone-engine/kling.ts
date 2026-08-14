import type { CloneEngine, CreateAvatarInput, CreatePreviewInput } from './types'

function notReady(): never {
  throw new Error('该引擎尚未开通，即将上线')
}

export const klingEngine: CloneEngine = {
  id: 'kling',
  name: '可灵 AI（参考生图）',
  pricePerImage: 1,
  costPerImage: 0.2,
  status: 'coming',
  async createAvatar(_input: CreateAvatarInput) { notReady() },
  async createPreview(_input: CreatePreviewInput) { notReady() },
}
