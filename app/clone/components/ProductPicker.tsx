'use client'
import { useRef } from 'react'
import { FiUpload } from 'react-icons/fi'

interface Props {
  productImage: string
  productDesc: string
  hasAvatar: boolean
  onImageChange: (dataUrl: string) => void
  onDescChange: (v: string) => void
  onBack: () => void
  onNext: () => void
}

export default function ProductPicker({ productImage, productDesc, hasAvatar, onImageChange, onDescChange, onBack, onNext }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">上传产品图</h2>
      <p className="text-sm text-gray-500 mb-5">让克隆分身和你的产品同框展示</p>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase mb-2">产品图</p>
          {productImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={productImage} alt="产品" className="w-full aspect-square object-cover rounded-xl border border-gray-200" />
          ) : (
            <button onClick={() => ref.current?.click()} className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#FF6034] hover:text-[#FF6034] transition">
              <FiUpload className="w-8 h-8 mb-2" />
              <span className="text-sm">上传产品图</span>
            </button>
          )}
          <input ref={ref} type="file" accept="image/*" hidden onChange={e => {
            const f = e.target.files?.[0]
            if (f) { const reader = new FileReader(); reader.onload = () => onImageChange(reader.result as string); reader.readAsDataURL(f) }
            e.target.value = ''
          }} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase mb-2">产品说明（选填）</p>
          <textarea value={productDesc} onChange={e => onDescChange(e.target.value)} placeholder="例如：招牌剁椒鱼头、主打家庭聚餐"
            className="w-full h-36 rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6034]/30" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">上一步</button>
        <button onClick={onNext} disabled={!hasAvatar || !productImage}
          className="px-6 py-2.5 rounded-xl bg-[#FF6034] text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90">
          {hasAvatar && productImage ? '下一步' : hasAvatar ? '请上传产品图' : '请先完成克隆分身'}
        </button>
      </div>
    </div>
  )
}
