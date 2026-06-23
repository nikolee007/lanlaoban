'use client'

import { FiCopy, FiStar, FiDownload, FiRefreshCw, FiArrowRight } from 'react-icons/fi'
import { PLATFORMS, COUNTRY_NAMES } from '../constants'
import type { SellPointResult, DetailImage } from '../types'

interface StepResultProps {
  platform: string
  country: string
  sellPoints: SellPointResult | null
  editedSellPoints: string[]
  detailImages: DetailImage[]
  videoUrl: string
  onCopy: () => void
  onReset: () => void
  onBackToGenerate: () => void
}

export default function StepResult({
  platform, country, sellPoints, editedSellPoints, detailImages, videoUrl,
  onCopy, onReset, onBackToGenerate,
}: StepResultProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="section-title">生成结果</h1>
        <p className="section-subtitle mt-2">{PLATFORMS.find(p => p.id === platform)?.name} · {COUNTRY_NAMES[country] || country}</p>
      </div>

      {sellPoints && (
        <div className="card p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">卖点文案</h2>
            <button onClick={onCopy} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
              <FiCopy className="h-3 w-3" /> 复制
            </button>
          </div>
          <div className="rounded-lg bg-brand-50 p-3 mb-3"><p className="text-xs font-semibold text-brand-700 mb-1">标题</p><p className="text-sm text-gray-800">{sellPoints.title}</p></div>
          <div className="space-y-1 mb-3">
            {editedSellPoints.map((sp, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700"><FiStar className="h-3 w-3 mt-1 text-brand-400 shrink-0" /><span>{sp}</span></div>
            ))}
          </div>
          <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">关键词：{sellPoints.keywords}</div>
        </div>
      )}

      {detailImages.length > 0 && (
        <div className="card p-6 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">详情页图片</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {detailImages.map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                <img src={img.url} alt={img.label} className="w-full aspect-square object-cover" loading="lazy" />
                <p className="text-[10px] text-gray-400 text-center py-1">{img.label}</p>
                <a href={img.url} download={`${img.type}.jpg`} className="block text-center text-[10px] text-brand-400 pb-1 hover:underline">下载</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {videoUrl && (
        <div className="card p-6 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">带货视频</h2>
          <div className="rounded-xl overflow-hidden border border-gray-100 bg-black max-w-sm mx-auto">
            <video src={videoUrl} controls className="w-full aspect-[9/16] object-contain" />
          </div>
          <div className="text-center mt-3">
            <a href={videoUrl} download="带货视频.mp4" className="inline-flex items-center gap-2 rounded-xl bg-brand-400 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500">
              <FiDownload className="h-4 w-4" /> 下载视频
            </a>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <button onClick={onReset} className="btn-outline"><FiRefreshCw className="h-4 w-4" /> 重新开始</button>
        <button onClick={onBackToGenerate} className="btn-primary"><FiArrowRight className="h-4 w-4" /> 继续生成</button>
      </div>
    </div>
  )
}
