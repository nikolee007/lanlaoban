export interface UploadedFile {
  id: string
  file: File
  preview: string
  type: 'photo' | 'video' | 'logo'
}

export interface GenerationResult {
  language: string
  languageLabel: string
  videoUrl: string
  status: 'pending' | 'processing' | 'done' | 'error'
}

export type Style = 'professional' | 'social' | 'tech' | 'sincere'
export type DigitalHumanMode = 'none' | 'pip' | 'handhold'
export type DigitalHumanGender = 'male' | 'female'
