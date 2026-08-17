'use client'
import { useRef } from 'react'
import { FiUpload, FiImage, FiX } from 'react-icons/fi'

interface Props {
  photos: string[]
  onPhotosChange: (dataUrls: string[]) => void
  onNext: () => void
  hasAvatar: boolean
  onUseExisting: () => void
}

export default function PhotoUpload({ photos, onPhotosChange, onNext, hasAvatar, onUseExisting }: Props) {
  const ref = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const list = Array.from(files).slice(0, 3)
    const readers = list.map(f => new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(f)
    }))
    Promise.all(readers).then(dataUrls => {
      onPhotosChange([...photos, ...dataUrls].slice(0, 3))
    })
  }

  const removePhoto = (idx: number) => {
    onPhotosChange(photos.filter((_, i) => i !== idx))
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">采集你的形象</h2>
      <p className="text-sm text-gray-500 mb-2">两种方式：<span className="text-gray-700">传照片</span>（简单·生成分身） · <span className="text-gray-700">录视频</span>（更真实会说话·MiniMax 接入后开放）</p>
      <p className="text-sm text-gray-400 mb-5">先传照片，生成你的老板分身，收进克隆形象库。</p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {photos.map((p, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt={`本人照片${i + 1}`} className="w-full h-full object-cover" />
            <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center" aria-label="移除照片"><FiX className="w-4 h-4" /></button>
          </div>
        ))}
        {photos.length < 3 && (
          <button onClick={() => ref.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#FF6034] hover:text-[#FF6034] transition">
            <FiUpload className="w-6 h-6 mb-1" />
            <span className="text-xs">上传照片</span>
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={e => { handleFiles(e.target.files); e.target.value = '' }} />

      <div className="flex items-center justify-between">
        {hasAvatar && (
          <button onClick={onUseExisting} className="text-sm text-[#FF6034] hover:underline">已有分身，直接做产品图 →</button>
        )}
        <button onClick={onNext} disabled={photos.length === 0}
          className="ml-auto px-6 py-2.5 rounded-xl bg-[#FF6034] text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90">
          下一步
        </button>
      </div>
      <div className="mt-4 flex items-start gap-2 text-xs text-gray-400">
        <FiImage className="w-4 h-4 mt-0.5 shrink-0" />
        <span>建议：正脸、光线充足、背景简洁。照片只用于生成你的克隆分身。</span>
      </div>
    </div>
  )
}
