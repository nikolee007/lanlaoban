'use client'

import { FiCamera, FiVideo, FiEdit3, FiVolume2, FiZap, FiClock } from 'react-icons/fi'
import type { Step } from './types'
import type { RenderTask } from '@/app/components/BackgroundTaskMonitor'

interface StepNavigationProps {
  step: Step
  loading: boolean
  onSetStep: (s: Step) => void
  recentTasks: RenderTask[]
  history: boolean
  onToggleHistory: () => void
}

export default function StepNavigation({ step, loading, onSetStep, recentTasks, history, onToggleHistory }: StepNavigationProps) {
  const stepNav = [
    { k:'scene' as Step, stepNo:'第一步', l:'选场景', desc:'选择拍摄类型', icon:FiCamera },
    { k:'photo' as Step, stepNo:'第二步', l:'传照片/视频', desc:'自拍或上传', icon:FiVideo },
    { k:'script' as Step, stepNo:'第三步', l:'写脚本', desc:'AI生成或手写', icon:FiEdit3 },
    { k:'voice' as Step, stepNo:'第四步', l:'选声音/克隆', desc:'选配音或克隆', icon:FiVolume2 },
    { k:'generate' as Step, stepNo:'第五步', l:'生成', desc:'等待AI合成', icon:FiZap },
  ]

  const pendingCount = recentTasks.filter(t => t.status === 'rendering' || t.status === 'queued').length

  return (
    <div className="mb-8">
      <div className="grid gap-2 sm:grid-cols-5">
        {stepNav.filter(s => s.k !== 'generate' || step === 'generate').map(item => (
          <button key={item.k} onClick={() => { if (!loading) onSetStep(item.k) }}
            className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 border-2 ${
              step === item.k ? 'border-transparent shadow-lg scale-[1.02]' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
            }`}
            style={step === item.k ? { background: 'linear-gradient(135deg, #FF603415, #8B5CF608)', borderColor: '#FF6034' } : {}}>
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                step === item.k ? 'text-white shadow-md' : 'bg-gray-100 text-gray-400'
              }`} style={step === item.k ? { backgroundColor: '#FF6034' } : {}}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">{item.stepNo}</span>
                <p className={`text-base font-bold ${step === item.k ? 'text-gray-900' : 'text-gray-700'}`}>{item.l}</p>
                <p className="text-[11px] text-gray-400">{item.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-400">
        {[1,2,3,4,5].map(n => (
          <span key={n} className="flex items-center gap-2">
            {n > 1 && <span className="text-gray-300">—</span>}
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold text-[10px]">{n}</span>
          </span>
        ))}
      </div>
      {pendingCount > 0 && step !== 'generate' && (
        <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <FiClock className="h-4 w-4 animate-pulse" />
            <span>{pendingCount} 个任务后台渲染中</span>
          </div>
          <button onClick={onToggleHistory} className="text-xs text-blue-600 underline">查看</button>
        </div>
      )}
    </div>
  )
}
