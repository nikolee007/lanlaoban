import type { CloneEngine, CreateAvatarInput, CreatePreviewInput } from './types'

function notReady(): never {
  throw new Error('该引擎尚未开通，即将上线')
}

export const jimengEngine: CloneEngine = {
  id: 'jimeng',
  name: '即梦 AI（人脸克隆）',
  pricePerImage: 2,
  costPerImage: 0.5,
  status: 'coming',
  async createAvatar(_input: CreateAvatarInput) { notReady() },
  async createPreview(_input: CreatePreviewInput) { notReady() },
}
