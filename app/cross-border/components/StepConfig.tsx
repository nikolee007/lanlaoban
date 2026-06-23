'use client'

import { FiChevronLeft, FiArrowRight, FiShoppingCart } from 'react-icons/fi'
import { PLATFORMS, COUNTRY_NAMES } from '../constants'

interface StepConfigProps {
  platform: string
  country: string
  productName: string
  productDesc: string
  onPlatformChange: (p: string, c: string) => void
  onCountryChange: (c: string) => void
  onProductNameChange: (n: string) => void
  onProductDescChange: (d: string) => void
  onBack: () => void
  onNext: () => void
}

export default function StepConfig({
  platform, country, productName, productDesc,
  onPlatformChange, onCountryChange, onProductNameChange, onProductDescChange,
  onBack, onNext,
}: StepConfigProps) {
  const currentPlatform = PLATFORMS.find(p => p.id === platform)!

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700">
        <FiChevronLeft className="h-4 w-4" /> 返回上传照片
      </button>

      <div className="card p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">选择目标平台</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => onPlatformChange(p.id, p.countries[0])}
              className={`rounded-xl border-2 p-4 text-center transition-all ${platform === p.id ? 'border-brand-400 bg-brand-50/30 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl mx-auto mb-2 ${platform === p.id ? 'bg-brand-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <FiShoppingCart className="h-5 w-5" />
              </div>
              <p className={`text-xs font-semibold ${platform === p.id ? 'text-brand-400' : 'text-gray-600'}`}>{p.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">选择目标国家</h2>
        <div className="flex flex-wrap gap-2">
          {currentPlatform.countries.map(c => (
            <button key={c} onClick={() => onCountryChange(c)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all border-2 ${country === c ? 'border-brand-400 bg-brand-400 text-white shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {COUNTRY_NAMES[c] || c}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">商品信息</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">商品名称</label>
            <input value={productName} onChange={e => onProductNameChange(e.target.value)}
              placeholder="例：Wireless Bluetooth Earphones 5.3"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">商品描述</label>
            <textarea value={productDesc} onChange={e => onProductDescChange(e.target.value)}
              placeholder="例：Bluetooth 5.3, 40h battery, noise cancelling, IPX5 waterproof..."
              rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-400 resize-none" />
          </div>
        </div>
      </div>

      <button onClick={onNext} disabled={!productName.trim()}
        className="btn-ai w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
        <FiArrowRight className="h-4 w-4" /> 下一步：AI 生成内容
      </button>
    </div>
  )
}
