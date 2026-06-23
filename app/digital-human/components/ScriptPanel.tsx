'use client'

import { FiChevronLeft, FiZap, FiArrowRight } from 'react-icons/fi'

interface ScriptPanelProps {
  script: string
  aiGenerating: boolean
  onScriptChange: (v: string) => void
  onAiGenerate: () => Promise<void>
  onBack: () => void
  onNext: () => void
  canNext: boolean
}

export default function ScriptPanel({
  script,
  aiGenerating,
  onScriptChange,
  onAiGenerate,
  onBack,
  onNext,
  canNext,
}: ScriptPanelProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
        <FiChevronLeft className="h-4 w-4" /> 返回上传
      </button>
      <div className="card p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">口播文案</h2>
          <button onClick={onAiGenerate} disabled={aiGenerating}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all"
            style={{ backgroundColor: '#8B5CF6' }}>
            <FiZap className="h-3 w-3" /> {aiGenerating ? '生成中...' : 'AI 帮我写'}
          </button>
        </div>
        <textarea value={script} onChange={e => onScriptChange(e.target.value)}
          placeholder="点击「AI 帮我写」自动生成，或直接粘贴..."
          rows={5}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 resize-none" />
        <p className="text-xs text-gray-400 mt-1">{script.length} 字，建议 80-150 字</p>
      </div>
      <button onClick={onNext} disabled={!canNext}
        className="btn-ai w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
        <FiArrowRight className="h-4 w-4" /> 下一步：选声音 / 克隆
      </button>
    </div>
  )
}
