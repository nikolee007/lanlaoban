'use client'

import { useState } from 'react'
import {
  FiStar, FiMapPin, FiHeart, FiMessageSquare, FiVideo,
  FiClock, FiPackage,
} from 'react-icons/fi'

// ── Types ──

export interface CertTag {
  label: string
  color: string
}

export interface ResultItem {
  id: number
  name: string
  location: string
  rating: number
  reviewCount: number
  tags: CertTag[]
  minOrder: number
  dropship: boolean
  updatedAt: string
  priceMin?: number
  priceMax?: number
  monthlySales?: number
  description?: string
}

// ── Helpers ──

export function daysAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '今天'
  if (diff === 1) return '1天前'
  return `${diff}天前`
}

export function renderStars(rating: number) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <FiStar
          key={i}
          className={`w-3.5 h-3.5 ${
            i < full
              ? 'fill-amber-400 text-amber-400'
              : i === full && half
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-gray-200'
          }`}
        />
      ))}
    </span>
  )
}

export function parseCertifications(raw: string | null): CertTag[] {
  if (!raw) return []
  try {
    const list: string[] = JSON.parse(raw)
    const colors = [
      'bg-green-50 text-green-700',
      'bg-blue-50 text-blue-700',
      'bg-purple-50 text-purple-700',
      'bg-amber-50 text-amber-700',
      'bg-cyan-50 text-cyan-700',
      'bg-rose-50 text-rose-700',
    ]
    return list.map((label, i) => ({
      label,
      color: colors[i % colors.length],
    }))
  } catch {
    return []
  }
}

export function parseSalesData(raw: string | null): number | undefined {
  if (!raw) return undefined
  try {
    const data = JSON.parse(raw)
    return data.monthlySales ?? data.sales ?? undefined
  } catch {
    return undefined
  }
}

// ── Component ──

export default function ResultCard({ item }: { item: ResultItem }) {
  const [saved, setSaved] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 hover:border-brand-200 hover:shadow-sm transition-all group">
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-lg p-2.5 flex-shrink-0 bg-brand-50 text-brand-400">
          <FiPackage className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
            <span className="text-[11px] px-1.5 py-0.5 rounded font-medium bg-brand-50 text-brand-600">
              产品
            </span>
          </div>
          {item.priceMin !== undefined && (
            <p className="text-sm text-gray-500 mt-0.5">
              出厂价 <span className="text-brand-500 font-semibold">¥{item.priceMin}{item.priceMax ? `-${item.priceMax}` : ''}</span>
            </p>
          )}
        </div>
        {item.monthlySales && (
          <div className="hidden sm:flex flex-col items-end flex-shrink-0">
            <span className="text-lg font-bold text-brand-400">{item.monthlySales.toLocaleString()}</span>
            <span className="text-[11px] text-gray-400">月销量</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 flex-wrap">
        <span className="inline-flex items-center gap-1">
          {renderStars(item.rating)}
          <span className="text-gray-400 ml-0.5">{item.rating.toFixed(1)}</span>
        </span>
        <span className="text-gray-300">|</span>
        <span className="inline-flex items-center gap-1">
          <FiMapPin className="w-3 h-3" />
          {item.location}
        </span>
        <span className="text-gray-300">|</span>
        <span className="inline-flex items-center gap-1">
          <FiMessageSquare className="w-3 h-3" />
          {item.reviewCount}评价
        </span>
      </div>

      {item.tags.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          {item.tags.map(t => (
            <span key={t.label} className={`text-[11px] px-2 py-0.5 rounded font-medium ${t.color}`}>
              {t.label}
            </span>
          ))}
          {item.dropship && (
            <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-cyan-50 text-cyan-700">
              一件代发
            </span>
          )}
        </div>
      )}

      {item.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-3 border-b border-gray-50">
        <span className="inline-flex items-center gap-1">
          最小起订: <span className="text-gray-700 font-medium">{item.minOrder}件</span>
        </span>
        <span className="text-gray-200">|</span>
        <span className="inline-flex items-center gap-1">
          一件代发: <span className={item.dropship ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {item.dropship ? '支持' : '不支持'}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setSaved(!saved)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            saved
              ? 'border-brand-200 bg-brand-50 text-brand-600'
              : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          <FiHeart className={`w-3.5 h-3.5 ${saved ? 'fill-brand-400 text-brand-400' : ''}`} />
          {saved ? '已收藏' : '收藏'}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50 transition-all">
          <FiMessageSquare className="w-3.5 h-3.5" />
          联系
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-400 text-white hover:bg-brand-500 transition-all">
          <FiVideo className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">生成视频素材</span>
          <span className="sm:hidden">视频</span>
        </button>
        <span className="hidden sm:flex items-center gap-1 ml-auto text-[11px] text-gray-400">
          <FiClock className="w-3 h-3" />
          {daysAgo(item.updatedAt)}
        </span>
      </div>

      <div className="flex sm:hidden items-center gap-1 mt-2 text-[11px] text-gray-400">
        <FiClock className="w-3 h-3" />
        数据更新: {daysAgo(item.updatedAt)}
      </div>
    </div>
  )
}
