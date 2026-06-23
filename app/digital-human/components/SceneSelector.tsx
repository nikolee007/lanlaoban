'use client'

import Image from 'next/image'
import { FiList } from 'react-icons/fi'
import type { SceneId, SceneTpl } from './types'

interface SceneSelectorProps {
  scenes: SceneTpl[]
  selectedScene: SceneId
  recentCompletedCount: number
  onSelectScene: (id: SceneId) => void
  onViewHistory: () => void
}

export default function SceneSelector({
  scenes,
  selectedScene,
  recentCompletedCount,
  onSelectScene,
  onViewHistory,
}: SceneSelectorProps) {
  return (
    <div>
      {recentCompletedCount > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiList className="h-4 w-4" />
            <span>最近 {recentCompletedCount} 个已完成</span>
          </div>
          <button onClick={onViewHistory} className="text-xs text-brand-400 hover:text-brand-500">查看全部</button>
        </div>
      )}
      <div className="mb-6 text-center">
        <h1 className="section-title">AI 数字人口播</h1>
        <p className="section-subtitle mt-2">上传照片或视频 → AI 生成数字人形象 + 配音</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenes.map(s => (
          <div key={s.id} onClick={() => onSelectScene(s.id)}
            className={`card cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-apple-md ${selectedScene === s.id ? 'ring-2 ring-brand-400' : ''}`}>
            <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-3">
              <Image src={s.refImage} alt={s.title} width={400} height={300} className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="h-4 w-4 text-brand-400" />
              <h3 className="font-semibold text-sm text-gray-900">{s.title}</h3>
            </div>
            <p className="text-xs text-gray-400 mb-1">{s.desc}</p>
            <p className="text-[10px] text-gray-400">{s.industry}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
