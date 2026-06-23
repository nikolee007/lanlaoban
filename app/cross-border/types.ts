export type Step = 'upload' | 'config' | 'generate' | 'result'

export interface UploadedPhoto {
  id: string
  file: File
  preview: string
}

export interface SellPointResult {
  title: string
  sellPoints: string[]
  description: string
  keywords: string
}

export interface DetailImage {
  type: string
  label: string
  url: string
}
