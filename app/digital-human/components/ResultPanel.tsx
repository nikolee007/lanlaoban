'use client'

import { FiCamera, FiUser, FiDownload, FiRefreshCw } from 'react-icons/fi'
import type { SceneTpl } from './types'

interface ResultPanelProps {
  videoUrl: string
  audioUrl: string
  script: string
  voice: string
  voices: Record<string, string>
  scene: SceneTpl
  onReset: () => void
}

export default function ResultPanel({
  videoUrl,
  audioUrl,
  script,
  voice,
  voices,
  scene,
  onReset,
}: ResultPanelProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl overflow-hidden border border-gray-100 bg-black mb-6 aspect-[9/16] max-h-[500px]">
        {videoUrl ? (
          <video src={videoUrl} controls className="w-full h-full object-contain" autoPlay />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900"><FiCamera className="h-12 w-12 text-gray-600" /></div>
        )}
      </div>
      <div className="card p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">视频信息</h3>
          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold">生成完成</span>
        </div>
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex justify-between"><span>场景</span><span className="text-gray-700">{scene.title}</span></div>
          <div className="flex justify-between"><span>文案</span><span className="text-gray-700 line-clamp-1">{script?.slice(0, 60)}{script?.length > 60 ? '...' : ''}</span></div>
          <div className="flex justify-between"><span>配音</span><span className="text-gray-700">{voices[voice] || voice || '克隆声音'}</span></div>
        </div>
      </div>
      {audioUrl && (
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50"><FiUser className="h-4 w-4 text-brand-400" /></div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-700">AI 配音</p>
                <p className="text-[10px] text-gray-400">{voices[voice] || voice || '克隆声音'}</p>
              </div>
            </div>
            <audio src={audioUrl} controls className="h-10 w-48" />
          </div>
        </div>
      )}
      <div className="mt-6 flex gap-3 flex-wrap justify-center">
        {videoUrl && (
          <a href={videoUrl} download="数字人视频.mp4"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-400 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-500">
            <FiDownload className="h-4 w-4" /> 下载视频
          </a>
        )}
        <button onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border-2 px-6 py-3 text-sm font-semibold transition-all"
          style={{ borderColor: '#FF6034', color: '#FF6034' }}>
          <FiRefreshCw className="h-4 w-4" /> 重新生成
        </button>
      </div>
    </div>
  )
}
