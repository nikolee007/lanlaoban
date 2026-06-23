'use client'

import { useRef } from 'react'
import type { RefObject } from 'react'
import Image from 'next/image'
import { FiChevronLeft, FiCamera, FiVideo, FiUpload, FiCheck, FiArrowRight } from 'react-icons/fi'

interface PhotoUploadProps {
  videoMode: boolean
  photoPreview: string
  videoPreview: string
  photo: File | null
  videoFile: File | null
  fileRef: React.RefObject<HTMLInputElement | null>
  videoRef: React.RefObject<HTMLVideoElement | null>
  onSetVideoMode: (v: boolean) => void
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCaptureFrame: () => void
  onBack: () => void
  onNext: () => void
  canNext: boolean
}

export default function PhotoUpload({
  videoMode,
  photoPreview,
  videoPreview,
  photo,
  videoFile,
  fileRef,
  videoRef,
  onSetVideoMode,
  onPhotoChange,
  onVideoChange,
  onCaptureFrame,
  onBack,
  onNext,
  canNext,
}: PhotoUploadProps) {
  const videoFileRef = useRef<HTMLInputElement | null>(null)

  const handleVideoClick = () => {
    if (!videoFileRef.current) {
      const inp = document.createElement('input')
      inp.type = 'file'
      inp.accept = 'video/*'
      inp.onchange = (e: Event) => {
        const t = e.target as HTMLInputElement | null
        if (t?.files?.[0]) {
          onVideoChange({ target: { files: t.files } } as React.ChangeEvent<HTMLInputElement>)
        }
      }
      videoFileRef.current = inp
    }
    videoFileRef.current.click()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
        <FiChevronLeft className="h-4 w-4" /> 重选场景
      </button>

      {/* 切换 tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => onSetVideoMode(false)}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
            !videoMode ? 'bg-brand-400 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}>
          <FiCamera className="inline h-4 w-4 mr-1" /> 上传照片
        </button>
        <button onClick={() => onSetVideoMode(true)}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
            videoMode ? 'bg-brand-400 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}>
          <FiVideo className="inline h-4 w-4 mr-1" /> 上传视频
        </button>
      </div>

      {/* 照片上传 */}
      {!videoMode && (
        <div className="card p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">上传你的照片</h2>
          <p className="text-sm text-gray-400 mb-4">一张正面照，AI 会帮你合成数字人形象。</p>
          <div onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-all">
            {photoPreview ? (
              <div className="relative mx-auto w-40 h-40">
                <Image src={photoPreview} alt="preview" width={160} height={160} className="w-full h-full object-cover rounded-xl" />
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-md"><FiCheck className="h-4 w-4" /></div>
              </div>
            ) : (
              <div>
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center"><FiUpload className="h-6 w-6 text-gray-400" /></div>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">点击上传照片</p>
                <p className="text-xs text-gray-400">建议用美图秀秀 / 豆包处理好再上传</p>
              </div>
            )}
            <input ref={fileRef as RefObject<HTMLInputElement>} type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
          </div>
        </div>
      )}

      {/* 视频上传 */}
      {videoMode && (
        <div className="card p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">上传你的视频</h2>
          <p className="text-sm text-gray-400 mb-2">拍一段 10 秒左右的视频，AI 提取首帧作为数字人形象。</p>
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 mb-4">
            提示：对着镜头自然说话，背景干净、光线好。视频长度 5-15 秒最佳。
          </p>

          <div onClick={handleVideoClick}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-all">
            {videoPreview ? (
              <div>
                <video ref={videoRef as RefObject<HTMLVideoElement>} src={videoPreview} className="max-h-48 mx-auto rounded-xl mb-3" controls
                  onLoadedData={onCaptureFrame} onPlay={() => setTimeout(onCaptureFrame, 100)} />
                <div className="flex items-center justify-center gap-2">
                  {photoPreview && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <FiCheck className="h-3 w-3" /> 已提取首帧
                      <Image src={photoPreview} width={40} height={40} className="w-10 h-10 rounded object-cover" alt="" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center"><FiVideo className="h-6 w-6 text-gray-400" /></div>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">点击上传视频</p>
                <p className="text-xs text-gray-400">支持 MP4/MOV，5-15 秒</p>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-brand-50 text-xs text-brand-700">
            <strong>小技巧：</strong>这段视频同时可以用来克隆你的声音！到第四步选声音时上传即可。
          </div>
        </div>
      )}

      <button onClick={onNext} disabled={!canNext}
        className="btn-ai w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
        <FiArrowRight className="h-4 w-4" /> 下一步：写脚本
      </button>
    </div>
  )
}
