'use client'

import { FiCamera, FiGlobe, FiZap, FiDownload } from 'react-icons/fi'
import type { Step } from '../types'

const STEP_NAV = [
  { k:'upload' as Step, stepNo:'第一步', l:'上传商品照片', desc:'多维度拍摄上传', icon:FiCamera },
  { k:'config' as Step, stepNo:'第二步', l:'选择平台/国家', desc:'配置目标市场', icon:FiGlobe },
  { k:'generate' as Step, stepNo:'第三步', l:'AI生成内容', desc:'卖点+图片+视频', icon:FiZap },
  { k:'result' as Step, stepNo:'第四步', l:'预览/下载', desc:'查看效果并下载', icon:FiDownload },
]

interface StepNavigatorProps {
  step: Step
  loading: boolean
  onStepChange: (s: Step) => void
}

export default function StepNavigator({ step, loading, onStepChange }: StepNavigatorProps) {
  return (
    <div className="mb-8">
      <div className="grid gap-2 sm:grid-cols-4">
        {STEP_NAV.filter(s => s.k !== 'generate' || step === 'generate').map(item => (
          <button key={item.k} onClick={() => { if (!loading) onStepChange(item.k) }}
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
        {[1, 2, 3, 4].map(n => (
          <span key={n} className="flex items-center gap-2">
            {n > 1 && <span className="text-gray-300">—</span>}
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold text-[10px]">{n}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
