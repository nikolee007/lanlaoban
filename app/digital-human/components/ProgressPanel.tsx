'use client'

import Link from 'next/link'
import { FiZap, FiRefreshCw, FiExternalLink } from 'react-icons/fi'

interface ProgressPanelProps {
  progress: number
  statusMessage: string
  error: string
  submittedAt: number
  onRetry: () => void
  onReset: () => void
}

export default function ProgressPanel({
  progress,
  statusMessage,
  error,
  submittedAt,
  onRetry,
  onReset,
}: ProgressPanelProps) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="card p-8 mb-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
          {error ? <FiRefreshCw className="h-8 w-8 text-white" /> : <FiZap className="h-8 w-8 text-white animate-pulse" />}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{error ? '生成失败' : '后台渲染中'}</h2>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${error ? 'bg-red-400' : 'bg-gradient-to-r from-brand-400 to-purple-500'}`}
            style={{ width: `${error ? 100 : progress}%` }} />
        </div>
        {!error && <p className="text-sm text-gray-500 mb-1">{statusMessage}</p>}
        <p className="text-xs text-gray-400">{Math.round(progress)}%{submittedAt > 0 && ` · 已 ${Math.floor((Date.now() - submittedAt) / 1000)} 秒`}</p>
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-sm text-red-700">
            {error}
            <div className="mt-3 flex gap-2 justify-center">
              <button onClick={onReset} className="text-xs text-red-600 underline">重新开始</button>
              <button onClick={onRetry} className="text-xs text-brand-400 underline">重试</button>
            </div>
          </div>
        )}
      </div>

      {!error && (
        <div className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <FiExternalLink className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">后台持续渲染中</h3>
              <p className="text-xs text-gray-500 mb-3">完成后系统会通知你，任何页面都能收到。</p>
              <div className="flex gap-2 flex-wrap">
                <Link href="/" className="rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">回首页</Link>
                <Link href="/ai-video" className="rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">去一键短视频</Link>
                <Link href="/global-supply" className="rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">去全球资源</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
