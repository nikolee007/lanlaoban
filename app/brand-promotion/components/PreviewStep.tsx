'use client'

import { FiZap, FiLoader, FiCheckCircle, FiXCircle, FiGlobe, FiRefreshCw, FiDownload, FiChevronLeft } from 'react-icons/fi'
import RemotionPreview from '@/components/RemotionPreview'
import type { UploadedFile, GenerationResult, Style, DigitalHumanMode } from './types'
import { STYLES } from './ConfigStep'

/* ─────────────────── Constants ─────────────────── */

export const PROGRESS_STEPS = [
  '正在生成文案…',
  '正在翻译多语言版本…',
  '正在生成配音…',
  '正在合成视频…',
  '正在生成数字人…',
]

/* ─────────────────── Props ─────────────────── */

interface PreviewStepProps {
  files: UploadedFile[]
  photos: UploadedFile[]
  logos: UploadedFile[]
  productName: string
  sellingPoints: string
  style: Style
  selectedLanguages: string[]
  digitalHumanMode: DigitalHumanMode
  duration: number
  isGenerating: boolean
  progressStep: number
  results: GenerationResult[]
  activeLangIdx: number
  error: string
  isDownloading: boolean
  onGenerate: () => Promise<void>
  onSetActiveLangIdx: (idx: number) => void
  onDownload: () => Promise<void>
  onRetry: () => Promise<void>
  onModifyConfig: () => void
  onBackToStep2: () => void
}

/* ─────────────────── Component ─────────────────── */

export default function PreviewStep({
  files, photos, logos, productName, sellingPoints,
  style, selectedLanguages, digitalHumanMode, duration,
  isGenerating, progressStep, results, activeLangIdx, error, isDownloading,
  onGenerate, onSetActiveLangIdx, onDownload, onRetry,
  onModifyConfig, onBackToStep2,
}: PreviewStepProps) {
  const activeResult = results[activeLangIdx]

  return (
    <div className="space-y-6">
      {/* Config Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">生成配置确认</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-400">素材数量</span>
            <p className="font-medium text-gray-800">{files.length} 个文件</p>
          </div>
          <div>
            <span className="text-gray-400">宣传风格</span>
            <p className="font-medium text-gray-800">{STYLES.find(s => s.key === style)?.label}</p>
          </div>
          <div>
            <span className="text-gray-400">目标语言</span>
            <p className="font-medium text-gray-800">{selectedLanguages.length} 种</p>
          </div>
          <div>
            <span className="text-gray-400">视频时长</span>
            <p className="font-medium text-gray-800">{duration}秒</p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      {!isGenerating && results.length === 0 && !error && (
        <div className="text-center py-8">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-3 px-12 py-4 bg-[#FF6034] text-white rounded-2xl font-bold text-lg hover:bg-[#E8552E] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF6034]/25 transition-all hover:shadow-xl hover:shadow-[#FF6034]/30 active:scale-[0.98]"
          >
            <FiZap size={22} />
            开始生成
          </button>
          <p className="mt-3 text-sm text-gray-400">AI将自动完成文案、翻译、配音、合成全流程</p>
        </div>
      )}

      {/* Generating Progress */}
      {isGenerating && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <FiLoader size={36} className="mx-auto mb-4 text-[#FF6034] animate-spin" />
          <h3 className="text-lg font-semibold text-gray-800 mb-4">正在生成中…</h3>
          <div className="max-w-md mx-auto space-y-2">
            {PROGRESS_STEPS.map((label, idx) => {
              const state: 'done' | 'active' | 'pending' =
                idx < progressStep ? 'done' : idx === progressStep ? 'active' : 'pending'
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    state === 'active'
                      ? 'bg-orange-50 text-[#FF6034]'
                      : state === 'done'
                        ? 'text-gray-400'
                        : 'text-gray-300'
                  }`}
                >
                  {state === 'done' ? (
                    <FiCheckCircle size={16} className="text-green-500 shrink-0" />
                  ) : state === 'active' ? (
                    <FiLoader size={16} className="animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                  )}
                  {label}
                </div>
              )
            })}
          </div>
          {/* Progress bar */}
          <div className="max-w-md mx-auto mt-6">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF6034] rounded-full transition-all duration-500"
                style={{ width: `${((progressStep + 1) / PROGRESS_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200 text-center">
          <FiXCircle size={28} className="mx-auto mb-2 text-red-500" />
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all"
          >
            <FiRefreshCw size={16} /> 重新生成
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Language Tabs */}
          <div className="flex flex-wrap gap-2">
            {results.map((r, idx) => (
              <button
                key={r.language}
                onClick={() => onSetActiveLangIdx(idx)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${activeLangIdx === idx
                    ? 'bg-[#FF6034] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <FiGlobe size={14} />
                {r.languageLabel}
                {r.status === 'done' && <FiCheckCircle size={14} />}
                {r.status === 'error' && <FiXCircle size={14} />}
              </button>
            ))}
          </div>

          {/* Remotion Preview */}
          {photos.length > 0 && (
            <RemotionPreview
              photos={photos.map(f => f.preview)}
              productName={productName || 'Product'}
              slogans={
                (() => {
                  const mainLang = selectedLanguages[0]
                  const mainResult = results.find(r => r.language === mainLang)
                  if (mainResult && activeResult) {
                    const lines = (window as Window & { __lastSlogans?: string[] }).__lastSlogans
                    if (lines && lines.length > 0) return lines
                  }
                  return sellingPoints
                    ? sellingPoints.split(/[,，]/).map(s => s.trim()).filter(Boolean)
                    : [productName || 'Your Brand Story']
                })()
              }
              audioUrl={
                activeResult?.status === 'done' && activeResult.videoUrl && !activeResult.videoUrl.startsWith('blob:')
                  ? activeResult.videoUrl
                  : activeResult?.videoUrl || undefined
              }
              logoUrl={logos[0]?.preview}
              language={activeResult?.language || selectedLanguages[0]}
              duration={duration}
            />
          )}

          {activeResult && activeResult.status === 'error' && (
            <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200 text-center">
              <p className="text-yellow-700 font-medium">
                {activeResult.languageLabel} 版本生成失败，请重试
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              disabled={isDownloading || results.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-[#FF6034] text-white rounded-xl font-semibold hover:bg-[#E8552E] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              onClick={onDownload}
            >
              {isDownloading ? (
                <><FiLoader size={18} className="animate-spin" /> 渲染中…</>
              ) : (
                <><FiDownload size={18} /> 下载视频 (MP4)</>
              )}
            </button>
            <button
              onClick={onRetry}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FiRefreshCw size={18} /> 重新生成
            </button>
          </div>

          {/* Back to Step 2 */}
          <div className="text-center">
            <button
              onClick={onModifyConfig}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              修改配置
            </button>
          </div>
        </>
      )}

      {/* Back button when no results yet */}
      {!isGenerating && results.length === 0 && !error && (
        <div className="flex justify-center">
          <button
            onClick={onBackToStep2}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            <FiChevronLeft size={18} /> 返回修改配置
          </button>
        </div>
      )}
    </div>
  )
}
