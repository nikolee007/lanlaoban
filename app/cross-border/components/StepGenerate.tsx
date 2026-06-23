'use client'

import { FiChevronLeft, FiZap, FiImage, FiVideo, FiTag, FiCopy, FiArrowRight, FiRefreshCw } from 'react-icons/fi'
import { PLATFORMS, COUNTRY_NAMES, IMAGE_TYPES } from '../constants'
import type { SellPointResult, DetailImage } from '../types'

interface StepGenerateProps {
  platform: string
  country: string
  loading: boolean
  statusMessage: string
  error: string
  sellPoints: SellPointResult | null
  editedSellPoints: string[]
  detailImages: DetailImage[]
  videoUrl: string
  selectedImageTypes: string[]
  onSellPointEdit: (i: number, v: string) => void
  onToggleImageType: (id: string) => void
  onGenerateSellPoints: () => void
  onGenerateImages: () => void
  onGenerateVideo: () => void
  onCopySellPoints: () => void
  onBack: () => void
  onNext: () => void
}

export default function StepGenerate({
  platform, country, loading, statusMessage, error,
  sellPoints, editedSellPoints, detailImages, videoUrl, selectedImageTypes,
  onSellPointEdit, onToggleImageType,
  onGenerateSellPoints, onGenerateImages, onGenerateVideo,
  onCopySellPoints, onBack, onNext,
}: StepGenerateProps) {
  const hasResults = !!(sellPoints || detailImages.length > 0 || videoUrl)

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
        <FiChevronLeft className="h-4 w-4" /> 返回配置
      </button>

      {/* 1. Sell Points */}
      <div className="card p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">1. 生成卖点文案</h2>
          <button onClick={onGenerateSellPoints} disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all" style={{ backgroundColor: '#8B5CF6' }}>
            <FiZap className="h-3 w-3" /> {sellPoints ? '重新生成' : 'AI 生成卖点'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">语言自动适配 {COUNTRY_NAMES[country] || country} 市场</p>

        {sellPoints ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-brand-50 p-3"><p className="text-xs font-semibold text-brand-700 mb-1">标题</p><p className="text-sm text-gray-800">{sellPoints.title}</p></div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">卖点（点击编辑）</p>
              <div className="space-y-2">
                {editedSellPoints.map((sp, i) => (
                  <input key={i} value={sp} onChange={e => onSellPointEdit(i, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs font-semibold text-gray-500 mb-1">描述</p><p className="text-sm text-gray-700">{sellPoints.description}</p></div>
            <div className="flex gap-2">
              <button onClick={onCopySellPoints} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"><FiCopy className="h-3 w-3" /> 复制全部</button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-gray-400">
            <FiTag className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>点击按钮生成适配 {PLATFORMS.find(p => p.id === platform)?.name} {COUNTRY_NAMES[country]} 市场的卖点文案</p>
          </div>
        )}
      </div>

      {/* 2. Images */}
      <div className="card p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">2. 生成详情页图片</h2>
          <button onClick={onGenerateImages} disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all" style={{ backgroundColor: '#FF6034' }}>
            <FiImage className="h-3 w-3" /> {loading && statusMessage.includes('图片') ? '生成中...' : 'AI 生成图片'}
          </button>
        </div>
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">选择需要的图片类型：</p>
          <div className="flex flex-wrap gap-2">
            {IMAGE_TYPES.map(t => (
              <button key={t.id} onClick={() => onToggleImageType(t.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all border-2 ${selectedImageTypes.includes(t.id) ? 'border-brand-400 bg-brand-50 text-brand-400' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {detailImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {detailImages.map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                <img src={img.url} alt={img.label} className="w-full aspect-square object-cover" loading="lazy" />
                <p className="text-[10px] text-gray-400 text-center py-1">{img.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Video */}
      <div className="card p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">3. 生成带货视频</h2>
          <button onClick={onGenerateVideo} disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all" style={{ backgroundColor: '#059669' }}>
            <FiVideo className="h-3 w-3" /> {loading && statusMessage.includes('视频') ? '生成中...' : 'AI 生成视频'}
          </button>
        </div>
        {videoUrl ? (
          <div className="rounded-xl overflow-hidden border border-gray-100 bg-black max-w-sm">
            <video src={videoUrl} controls className="w-full aspect-[9/16] object-contain" />
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-gray-400"><FiVideo className="h-8 w-8 mx-auto mb-2 opacity-30" /><p>基于文案 + 商品信息，一键生成带货视频</p></div>
        )}
      </div>

      {hasResults && (
        <div className="text-center">
          <button onClick={onNext} className="btn-ai"><FiArrowRight className="h-4 w-4" /> 查看完整效果</button>
        </div>
      )}

      {loading && (
        <div className="card p-4 text-center text-sm text-gray-500">
          <FiRefreshCw className="h-5 w-5 mx-auto mb-2 animate-spin" />{statusMessage}
        </div>
      )}

      {error && <div className="card p-4 text-center text-sm text-red-500 border-red-100 mt-4">{error}</div>}
    </div>
  )
}
