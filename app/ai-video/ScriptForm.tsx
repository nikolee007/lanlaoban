'use client'

import { FiZap, FiChevronLeft } from 'react-icons/fi'
import { INFO, getTpl } from './data'
import type { VideoType, ScriptBlock } from './data'

export default function ScriptForm({
  vt,
  brand,
  setBrand,
  industry,
  setIndustry,
  prod,
  setProd,
  customer,
  setCustomer,
  years,
  setYears,
  sell,
  setSell,
  blocks,
  aiLoading,
  aiError,
  onGenerate,
  onBack,
  onSkipToResult,
}: {
  vt: VideoType
  brand: string; setBrand: (v: string) => void
  industry: string; setIndustry: (v: string) => void
  prod: string; setProd: (v: string) => void
  customer: string; setCustomer: (v: string) => void
  years: string; setYears: (v: string) => void
  sell: string; setSell: (v: string) => void
  blocks: ScriptBlock[]
  aiLoading: boolean
  aiError: string
  onGenerate: () => void
  onBack: () => void
  onSkipToResult: () => void
}) {
  const info = INFO[vt]
  const tpls = getTpl(vt)

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
        <FiChevronLeft className="h-4 w-4" /> 重选类型
      </button>
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: info.bg }}>
            <info.icon className="h-5 w-5" style={{ color: info.color }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{info.title}</h2>
            <p className="text-xs text-gray-400">填写后AI自动生成7段脚本+拍摄指导</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { label: '品牌/店铺名称', hint: '如：老李牛肉面馆', value: brand, setter: setBrand, placeholder: '例：老李牛肉面馆' },
            { label: '行业', hint: '如：餐饮、服装、家装', value: industry, setter: setIndustry, placeholder: '例：餐饮美食' },
            { label: '产品/服务', hint: '如：招牌红烧牛肉面', value: prod, setter: setProd, placeholder: '例：招牌红烧牛肉面' },
            { label: '目标客户', hint: '如：同城年轻人、宝妈、老板', value: customer, setter: setCustomer, placeholder: '例：本地食客、25-45岁' },
            { label: '从业年限', hint: '如：5年、10年、15年', value: years, setter: setYears, placeholder: '例：5年' },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {f.label} <span className="text-gray-400 font-normal">{f.hint}</span>
              </label>
              <input value={f.value} onChange={e => f.setter(e.target.value)}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400" />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              核心卖点 <span className="text-gray-400 font-normal">逗号隔开，如：三代秘方,现熬8小时,牛肉大块</span>
            </label>
            <textarea value={sell} onChange={e => setSell(e.target.value)}
              placeholder="例：三代祖传秘方,每天现熬8小时,牛肉大块" rows={2}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 resize-none" />
          </div>
        </div>
        <button onClick={onGenerate} disabled={aiLoading} className="btn-ai w-full mt-6">
          <FiZap className="h-4 w-4" /> {aiLoading ? 'AI生成中...' : 'AI生成专属脚本'}
        </button>
        {aiError && <p className="text-red-500 text-sm mt-2">{aiError}</p>}
        <button onClick={onSkipToResult} className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          或直接看示例模板
        </button>
      </div>

      {/* Script structure preview */}
      <div className="mt-4 card !p-4">
        <p className="text-xs font-semibold text-gray-700 mb-2">脚本结构预览</p>
        <div className="flex gap-1">
          {blocks.map((b, i) => (
            <div key={i} className="h-2 rounded-full flex-1 bg-gradient-to-r from-brand-400 via-purple-500 to-brand-400 animate-gradient-x"
              style={{ opacity: 0.6 }} title={b.title} />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>开场钩子</span><span>中间内容</span><span>号召行动</span>
        </div>
      </div>

      {/* Camera positions preview */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700 mb-2">需要用到的 {tpls.length} 种拍摄机位</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tpls.map(t => (
            <div key={t.id} className="shrink-0 rounded-lg border border-gray-100 bg-white px-3 py-2 text-center">
              <t.icon className="h-4 w-4 mx-auto mb-1" style={{ color: info.color }} />
              <p className="text-[10px] text-gray-600 whitespace-nowrap">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
