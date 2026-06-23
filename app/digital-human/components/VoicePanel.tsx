'use client'

import type { RefObject } from 'react'
import { FiChevronLeft, FiUser, FiMic, FiMusic, FiUpload, FiZap } from 'react-icons/fi'
import type { VoiceClone } from './types'

interface VoicePanelProps {
  voices: Record<string, string>
  voice: string
  clonedVoices: VoiceClone[]
  cloneName: string
  cloneAudio: File | null
  cloneAudioPreview: string
  cloning: boolean
  cloneProgress: string
  cloneAudioRef: React.RefObject<HTMLInputElement | null>
  onVoiceChange: (id: string) => void
  onCloneNameChange: (v: string) => void
  onCloneAudioChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmitClone: () => Promise<void>
  onUseClonedVoice: (id: string) => void
  onBack: () => void
  onGenerate: () => void
  canGenerate: boolean
  loading: boolean
}

export default function VoicePanel({
  voices,
  voice,
  clonedVoices,
  cloneName,
  cloneAudio,
  cloneAudioPreview,
  cloning,
  cloneProgress,
  cloneAudioRef,
  onVoiceChange,
  onCloneNameChange,
  onCloneAudioChange,
  onSubmitClone,
  onUseClonedVoice,
  onBack,
  onGenerate,
  canGenerate,
  loading,
}: VoicePanelProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
        <FiChevronLeft className="h-4 w-4" /> 返回写脚本
      </button>

      {/* 内置音色 */}
      <div className="card p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">内置配音音色</h2>
        <p className="text-sm text-gray-400 mb-4">直接选用，无需上传</p>
        {Object.keys(voices).length === 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700 mb-4">TTS 服务加载中...</div>
        )}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {Object.entries(voices).map(([id, label]) => (
            <div key={id} className={`rounded-xl border-2 p-3 transition-all ${voice === id ? 'border-brand-400 bg-brand-50/30' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${voice === id ? 'bg-brand-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <FiUser className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                </div>
                <button onClick={() => onVoiceChange(id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${voice === id ? 'bg-brand-400 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {voice === id ? '已选' : '选用'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 声音克隆 — 上传 10 秒语音 */}
      <div className="card p-6 mb-4 border-2 border-purple-300 bg-purple-50/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <FiMic className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">克隆你的声音</h3>
            <p className="text-[11px] text-gray-500">上传 10 秒语音，AI 学习你的声线。支持音频或视频文件。</p>
          </div>
        </div>

        {/* 克隆列表 */}
        {clonedVoices.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">已克隆的声音：</p>
            <div className="space-y-2">
              {clonedVoices.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-white border border-purple-100 p-3">
                  <div className="flex items-center gap-2">
                    <FiMusic className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">{c.name}</span>
                  </div>
                  <button onClick={() => onUseClonedVoice(c.id)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold ${voice === c.id ? 'bg-purple-600 text-white' : 'border border-purple-200 text-purple-600 hover:bg-purple-50'}`}>
                    {voice === c.id ? '已选' : '使用'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 上传新语音 */}
        <div className="rounded-xl border-2 border-dashed border-purple-200 p-4">
          <div onClick={() => cloneAudioRef.current?.click()}
            className="text-center cursor-pointer">
            {cloneAudioPreview ? (
              <div>
                <audio src={cloneAudioPreview} controls className="w-full h-10 mb-2" />
                <p className="text-xs font-medium text-gray-600">{cloneAudio?.name}</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FiUpload className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-700 mb-1">上传语音 / 视频文件</p>
                <p className="text-[10px] text-gray-400">支持 MP3/WAV/MP4，10 秒以上效果最佳</p>
              </div>
            )}
            <input ref={cloneAudioRef as RefObject<HTMLInputElement>} type="file" accept="audio/*,video/*" onChange={onCloneAudioChange} className="hidden" />
          </div>

          {cloneAudio && (
            <div className="mt-3 space-y-2">
              <input value={cloneName} onChange={e => onCloneNameChange(e.target.value)}
                placeholder="给这个声音取个名字..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
              <button onClick={onSubmitClone} disabled={cloning || !cloneName.trim()}
                className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: '#8B5CF6' }}>
                {cloning ? cloneProgress || '克隆中...' : `克隆声音（仅需 10 秒语音）`}
              </button>
            </div>
          )}
        </div>
      </div>

      <button onClick={onGenerate} disabled={!canGenerate || loading}
        className="btn-ai w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
        <FiZap className="h-4 w-4" /> {loading ? '提交中...' : '一键生成数字人 + 配音'}
      </button>
    </div>
  )
}
