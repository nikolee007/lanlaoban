'use client'
import { PREVIEW_TEMPLATES } from '@/lib/clone-engine/templates'

interface Props {
  templateId: string
  hasProduct: boolean
  onSelect: (id: string) => void
  onBack: () => void
  onGenerate: () => void
  loading: boolean
  balanceUsed: boolean
  enginePrice: number
}

export default function TemplatePicker({ templateId, hasProduct, onSelect, onBack, onGenerate, loading, balanceUsed, enginePrice }: Props) {
  const selected = PREVIEW_TEMPLATES.find(t => t.id === templateId)
  const blocked = selected?.requiresProduct && !hasProduct
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">选择展示形态</h2>
      <p className="text-sm text-gray-500 mb-5">克隆分身 + 产品，生成宣传预览图</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {PREVIEW_TEMPLATES.map(t => (
          <button key={t.id} onClick={() => onSelect(t.id)}
            className={`rounded-xl border-2 p-4 text-left transition ${templateId === t.id ? 'border-[#FF6034] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <p className="font-medium text-gray-900 mb-1">{t.name}</p>
            <p className="text-xs text-gray-500">{t.desc}</p>
            {t.requiresProduct && !hasProduct && <p className="mt-2 text-xs text-red-400">需要产品图</p>}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">上一步</button>
        <button onClick={onGenerate} disabled={loading || blocked}
          className="px-6 py-2.5 rounded-xl bg-[#FF6034] text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90">
          {loading ? '生成中...' : `生成预览图${balanceUsed ? `（消耗 50 算力）` : '（本次免费）'}`}
        </button>
      </div>
    </div>
  )
}
