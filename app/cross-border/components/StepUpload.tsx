'use client'

import { useRef } from 'react'
import { FiUpload, FiTrash2, FiArrowRight } from 'react-icons/fi'
import type { UploadedPhoto } from '../types'

interface StepUploadProps {
  photos: UploadedPhoto[]
  onPhotosAdd: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPhotoRemove: (id: string) => void
  onNext: () => void
}

export default function StepUpload({ photos, onPhotosAdd, onPhotoRemove, onNext }: StepUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="section-title">跨境电商 AI 工具</h1>
        <p className="section-subtitle mt-2">上传商品照片 → 选平台 → AI 生成多语言卖点+详情图+带货视频</p>
      </div>

      <div className="card p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">上传商品照片</h2>
        <p className="text-sm text-gray-400 mb-4">多维度拍摄效果更好，建议 3-6 张</p>

        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-all mb-4">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center"><FiUpload className="h-6 w-6 text-gray-400" /></div>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">点击上传照片</p>
          <p className="text-xs text-gray-400">支持 JPG/PNG，建议用美图秀秀 / 豆包处理好再上传</p>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={onPhotosAdd} className="hidden" />
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {photos.map(p => (
              <div key={p.id} className="relative group">
                <img src={p.preview} alt="" className="w-full aspect-square rounded-xl object-cover border border-gray-100" />
                <button onClick={() => onPhotoRemove(p.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiTrash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">拍摄建议</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-700 mb-1">多角度拍摄</p>
            <ul className="space-y-1 text-[11px] text-gray-500"><li>正面、侧面、背面各一张</li><li>45 度角展示立体感</li><li>细节特写（材质、LOGO、接口）</li></ul>
          </div>
          <div className="rounded-lg bg-brand-50 p-3">
            <p className="text-xs font-semibold text-brand-700 mb-1">场景与光线</p>
            <ul className="space-y-1 text-[11px] text-gray-500"><li>自然光拍摄色彩最真实</li><li>纯色背景方便后期抠图</li><li>美图秀秀 / 豆包可优化画质</li></ul>
          </div>
        </div>
      </div>

      <button onClick={onNext} disabled={photos.length === 0}
        className="btn-ai w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
        <FiArrowRight className="h-4 w-4" /> 下一步：选择平台和国家
      </button>
    </div>
  )
}
