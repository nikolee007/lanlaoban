'use client'
import { FiUser, FiRefreshCw, FiArrowRight } from 'react-icons/fi'
import type { AvatarInfo } from '../lib'

interface Props {
  photos: string[]
  avatar: AvatarInfo | null
  loading: boolean
  balanceUsed: boolean
  enginePrice: number
  onGenerate: () => void
  onBack: () => void
  onNext: () => void
}

export default function AvatarGenerate({ photos, avatar, loading, balanceUsed, enginePrice, onGenerate, onBack, onNext }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">生成老板克隆分身</h2>
      <p className="text-sm text-gray-500 mb-5">AI 基于你的照片生成专属分身，一次生成永久复用</p>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase mb-2">本人照片</p>
          {photos.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photos[0]} alt="本人" className="w-full aspect-square object-cover rounded-xl border border-gray-200" />
          ) : (
            <div className="w-full aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">
              <FiUser className="w-10 h-10" />
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase mb-2">克隆分身</p>
          {avatar?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar.avatarUrl} alt="克隆分身" className="w-full aspect-square object-cover rounded-xl border border-gray-200" />
          ) : (
            <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center text-gray-300">
              <FiUser className="w-10 h-10" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">上一步</button>
        {avatar?.avatarUrl ? (
          <div className="flex items-center gap-3">
            <button onClick={onGenerate} disabled={loading} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-50">
              <FiRefreshCw className="inline mr-1" />重新生成
            </button>
            <button onClick={onNext} className="px-6 py-2.5 rounded-xl bg-[#FF6034] text-white font-medium hover:opacity-90">
              下一步 <FiArrowRight className="inline" />
            </button>
          </div>
        ) : (
          <button onClick={onGenerate} disabled={loading || photos.length === 0}
            className="px-6 py-2.5 rounded-xl bg-[#FF6034] text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90">
            {loading ? '生成中...' : `生成克隆分身${balanceUsed ? `（消耗 50 算力）` : '（本次免费）'}`}
          </button>
        )}
      </div>
    </div>
  )
}
