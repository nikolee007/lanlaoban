'use client'

import Image from 'next/image'
import type { UploadedFile } from './types'
import { FiUpload, FiTrash2, FiCamera, FiVideo, FiImage, FiPlus, FiChevronRight } from 'react-icons/fi'

/* ─────────────────── Props ─────────────────── */

interface UploadStepProps {
  files: UploadedFile[]
  dragOver: boolean
  productName: string
  sellingPoints: string
  photoInputRef: React.RefObject<HTMLInputElement>
  videoInputRef: React.RefObject<HTMLInputElement>
  logoInputRef: React.RefObject<HTMLInputElement>
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onAddFiles: (incoming: FileList | null, type: UploadedFile['type']) => void
  onRemoveFile: (id: string) => void
  onProductNameChange: (v: string) => void
  onSellingPointsChange: (v: string) => void
  onNext: () => void
  canGoNext: boolean
}

/* ─────────────────── Component ─────────────────── */

export default function UploadStep({
  files, dragOver, productName, sellingPoints,
  photoInputRef, videoInputRef, logoInputRef,
  onDragOver, onDragLeave, onDrop,
  onAddFiles, onRemoveFile,
  onProductNameChange, onSellingPointsChange,
  onNext, canGoNext,
}: UploadStepProps) {
  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
          ${dragOver
            ? 'border-[#FF6034] bg-[#FFF0EB]'
            : 'border-gray-300 bg-white hover:border-[#FF6034]/50 hover:bg-orange-50/30'
          }
        `}
        onClick={() => photoInputRef.current?.click()}
      >
        <FiUpload size={40} className="mx-auto mb-3 text-gray-400" />
        <p className="text-lg font-medium text-gray-700">拖拽文件到此处，或点击上传</p>
        <p className="text-sm text-gray-400 mt-1">支持 JPG/PNG/MP4/MOV，单文件最大 100MB</p>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={e => onAddFiles(e.target.files, 'photo')}
        />
      </div>

      {/* Quick Upload Buttons */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => photoInputRef.current?.click()}
          className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#FF6034]/40 hover:bg-orange-50/30 transition-all"
        >
          <FiCamera size={20} className="text-[#FF6034]" />
          <span className="text-sm font-medium text-gray-700">上传产品照片</span>
        </button>
        <button
          onClick={() => videoInputRef.current?.click()}
          className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#FF6034]/40 hover:bg-orange-50/30 transition-all"
        >
          <FiVideo size={20} className="text-[#FF6034]" />
          <span className="text-sm font-medium text-gray-700">上传产品视频</span>
        </button>
        <button
          onClick={() => logoInputRef.current?.click()}
          className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#FF6034]/40 hover:bg-orange-50/30 transition-all"
        >
          <FiImage size={20} className="text-[#FF6034]" />
          <span className="text-sm font-medium text-gray-700">上传企业Logo</span>
        </button>
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => onAddFiles(e.target.files, 'video')} />
        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => onAddFiles(e.target.files, 'logo')} />
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            已上传素材 ({files.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {files.map(f => (
              <div key={f.id} className="relative group aspect-square">
                {f.type === 'video' ? (
                  <video
                    src={f.preview}
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                    muted
                  />
                ) : (
                  <Image
                    src={f.preview}
                    alt="preview"
                    fill
                    unoptimized
                    className="object-cover rounded-lg border border-gray-200"
                  />
                )}
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/50 text-white">
                  {f.type === 'photo' ? '照片' : f.type === 'video' ? '视频' : 'Logo'}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveFile(f.id) }}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={() => photoInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#FF6034]/50 hover:bg-orange-50/30 transition-all"
            >
              <FiPlus size={24} className="text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Product Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">产品信息（选填，不填则AI自动生成）</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">产品名称</label>
            <input
              type="text"
              value={productName}
              onChange={e => onProductNameChange(e.target.value)}
              placeholder="例如：FreshBlend Pro 便携榨汁机"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6034] focus:ring-2 focus:ring-[#FF6034]/15 outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">卖点描述</label>
            <input
              type="text"
              value={sellingPoints}
              onChange={e => onSellingPointsChange(e.target.value)}
              placeholder="例如：USB-C充电、30秒鲜榨、304不锈钢刀片"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#FF6034] focus:ring-2 focus:ring-[#FF6034]/15 outline-none transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center gap-2 px-8 py-3 bg-[#FF6034] text-white rounded-xl font-semibold hover:bg-[#E8552E] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          下一步 <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
