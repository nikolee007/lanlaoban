'use client'

import { useState } from 'react'
import { FiCamera, FiPlay } from 'react-icons/fi'
import { INFO, SCRIPTS, recommendType } from './data'
import type { VideoType } from './data'

export default function SceneSelector({
  onPick,
  onShowDemo,
}: {
  onPick: (vt: VideoType) => void
  onShowDemo: (vt: VideoType) => void
}) {
  const [showQuiz, setShowQuiz] = useState(false)
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')

  const doQuiz = () => {
    const t = recommendType(q1, q2)
    const i = INFO[t]
    onPick(t)
    setShowQuiz(false)
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ backgroundColor: '#FFF0EB' }}>
          <FiCamera className="h-7 w-7" style={{ color: '#FF6034' }} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">AI 一键短视频</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto">
          选一个类型 → 填信息 → 拿到完整脚本+拍摄指导<br />不会拍的小白也能做出2分钟短视频
        </p>

        {/* Demo preview */}
        <div className="mt-6 mx-auto max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <FiPlay className="h-4 w-4 text-brand-400" />
            <span className="text-xs font-bold text-gray-500 tracking-wider">生成的脚本长这样</span>
            <span className="text-[9px] text-gray-400">选类型→填信息→即可获得同样的完整脚本</span>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-50 shadow-sm">
            {SCRIPTS.restaurant.slice(0, 4).map((b, i) => (
              <div key={i} className="p-3 flex gap-3">
                <div className="w-12 shrink-0 text-center">
                  <div className="text-[10px] font-mono font-bold text-brand-400">{b.t0}</div>
                  <div className="text-[8px] text-gray-300">→{b.t1}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold text-gray-700">{b.title}</span>
                    <span className="text-[8px] text-gray-400 ml-auto">{b.shotType}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{b.line}</p>
                </div>
              </div>
            ))}
            <div className="p-3 text-center">
              <span className="text-[10px] text-gray-400">+ 3段 · 完整脚本共7段，含每段机位说明+拍摄技巧</span>
            </div>
          </div>
        </div>

        <button onClick={() => setShowQuiz(!showQuiz)}
          className="mt-4 inline-flex items-center gap-2 rounded-full border-2 px-5 py-2 text-sm font-semibold transition-all hover:shadow-sm"
          style={{ borderColor: '#FF6034', color: '#FF6034' }}>
          不确定选哪个？回答2个问题帮你推荐
        </button>
        {showQuiz && (
          <div className="mt-4 mx-auto max-w-md rounded-xl border border-gray-100 bg-white p-5 shadow-sm text-left">
            <p className="text-sm font-semibold text-gray-900 mb-3">你拍视频主要想做什么？</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {(['physical', 'digital', 'expert', 'service'] as const).map(o => (
                <button key={o} onClick={() => setQ1(o)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${q1 === o ? 'text-white' : 'text-gray-600 border-gray-200 hover:border-brand-200'}`}
                  style={q1 === o ? { backgroundColor: '#FF6034', borderColor: '#FF6034' } : {}}>
                  {{ physical: '卖实体产品', digital: '推荐好物', expert: '分享知识', service: '提供服务' }[o]}
                </button>
              ))}
            </div>
            {q1 && <>
              <p className="text-sm font-semibold text-gray-900 mb-3">具体哪个领域？</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(['food', 'fashion', 'tech', 'home', 'edu', 'other'] as const).map(o => (
                  <button key={o} onClick={() => setQ2(o)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${q2 === o ? 'text-white' : 'text-gray-600 border-gray-200 hover:border-brand-200'}`}
                    style={q2 === o ? { backgroundColor: '#FF6034', borderColor: '#FF6034' } : {}}>
                    {{ food: '餐饮美食', fashion: '服装/设计', tech: '数码科技', home: '家居生活', edu: '教育培训', other: '其他' }[o]}
                  </button>
                ))}
              </div>
              {q2 && <button onClick={doQuiz} className="w-full rounded-lg py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: '#FF6034' }}>查看推荐</button>}
            </>}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.entries(INFO) as [VideoType, typeof INFO[VideoType]][]).map(([k, v]) => {
          const Icon = v.icon
          return (
            <div key={k} className="card relative overflow-hidden group p-5 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl p-px bg-gradient-to-r from-brand-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="w-full h-full rounded-2xl bg-white" />
              </div>
              <div className="relative z-10 cursor-pointer" onClick={() => onPick(k)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: v.bg }}>
                    <Icon className="h-5 w-5" style={{ color: v.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{v.title}</p>
                    <p className="text-[11px] text-gray-400">{v.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px]" style={{ color: v.color }}>
                  <FiPlay className="h-3 w-3" /> 7段精编·2:00·含拍摄指导
                </div>
              </div>
              <div className="relative z-10 mt-4 flex gap-2">
                <button onClick={() => onShowDemo(k)}
                  className="flex-1 rounded-lg py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #FF6034, #8B5CF6)' }}>
                  看演示
                </button>
                <button onClick={() => onPick(k)}
                  className="flex-1 rounded-lg py-2 text-xs font-semibold text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: v.color }}>
                  立即使用
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
