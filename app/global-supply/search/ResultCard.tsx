'use client'

import Link from 'next/link'
import {
  FiStar, FiMapPin, FiHeart, FiMessageSquare, FiVideo,
  FiClock, FiTrendingUp, FiPackage, FiShoppingCart,
  FiUsers, FiShield,
} from 'react-icons/fi'
import OptimizedImage from '../../components/OptimizedImage'
import { useCompare } from '../../contexts/CompareContext'
import type { CompareItem } from '../../contexts/CompareContext'
import { productPlaceholderSVG } from '@/lib/product-placeholder'
import type { SearchResultItem } from '../search-utils'
import { collectionKey, daysAgo } from '../search-utils'

// ── Star Renderer ──
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

// ── Skeleton Card ──
export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-14" />
          <div className="h-6 bg-gray-200 rounded w-14" />
          <div className="h-6 bg-gray-200 rounded w-14" />
        </div>
        <div className="flex gap-2 pt-1">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-24 ml-auto" />
        </div>
      </div>
    </div>
  )
}

// ── Result Card ──
export default function ResultCard({
  item,
  saved,
  onToggleSave,
  onOpenVideo,
  onOpenContact,
}: {
  item: SearchResultItem
  saved: boolean
  onToggleSave: (item: SearchResultItem) => void
  onOpenVideo?: (name: string) => void
  onOpenContact?: (name: string) => void
}) {
  const isProduct = item.type === 'product'
  const { isInCompare, toggleItem } = useCompare()

  const detailHref = isProduct
    ? `/global-supply/${item.id.replace('p_', '')}`
    : `/global-supply/suppliers/${item.id.replace('s_', '')}`

  const selected = isInCompare(item.id)
  const ci: CompareItem = {
    id: item.id,
    name: item.name,
    image: productPlaceholderSVG(item.name, 200, 200, item.id),
    price: item.priceMin ? `¥${item.priceMin}-${item.priceMax}` : '询价',
    moq: `${item.minOrder}件`,
    dropship: item.dropship,
    oem: item.tags.some((t) => t.label === 'OEM'),
    rating: item.rating,
    location: item.location,
  }

  return (
    <div
      className={`group rounded-2xl border border-gray-100/80 bg-white overflow-hidden shadow-apple transition-all duration-300 ${
        selected
          ? '!border-brand-300 ring-1 ring-brand-200 shadow-apple-md'
          : 'hover:border-brand-200 hover:shadow-apple-md'
      }`}
    >
      {/* ── Image Section ── */}
      <Link href={detailHref} className="relative block aspect-video bg-gray-100 overflow-hidden">
        <OptimizedImage
          src={productPlaceholderSVG(item.name, 600, 338, item.id)}
          alt={item.name}
          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Compare checkbox */}
        <label
          className="absolute top-3 left-3 z-10 flex items-center gap-1 cursor-pointer bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm hover:bg-white transition-colors"
          aria-label="添加到对比"
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => toggleItem(ci)}
            className="sr-only peer"
          />
          <div
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
              selected
                ? 'border-brand-400 bg-brand-400'
                : 'border-gray-300 peer-checked:border-brand-400 peer-checked:bg-brand-400'
            }`}
          >
            {selected && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className={`text-[11px] font-medium ${selected ? 'text-brand-500' : 'text-gray-500'}`}>
            对比
          </span>
        </label>

        {/* Badge: certified */}
        {item.certified && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
            <FiShield className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-[11px] font-semibold text-gray-700">企业认证</span>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isProduct ? 'bg-brand-500/90 text-white' : 'bg-indigo-500/90 text-white'
            }`}
          >
            {isProduct ? '产品' : '工厂'}
          </span>
        </div>

        {/* 最近更新标签 */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
          <FiClock className="w-3 h-3 text-gray-500" />
          <span className="text-[11px] font-medium text-gray-600">最近更新: {daysAgo(item.updatedAt)}</span>
        </div>
      </Link>

      {/* ── Content Section ── */}
      <div className="p-4 sm:p-5">
        {/* Name + monthly sales */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link href={detailHref} className="font-semibold text-gray-900 text-sm sm:text-base leading-tight hover:text-brand-500 transition-colors">{item.name}</Link>
          {isProduct && item.monthlySales && item.monthlySales > 0 && (
            <div className="hidden sm:flex flex-col items-end flex-shrink-0">
              <span className="text-lg font-bold text-brand-400">{item.monthlySales.toLocaleString()}</span>
              <span className="text-[11px] text-gray-400">月销量</span>
            </div>
          )}
        </div>

        {/* Price display */}
        {isProduct && item.priceMin !== undefined && (
          <div className="mt-1.5 mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-brand-500">¥{item.priceMin}</span>
              <span className="text-gray-400">-</span>
              <span className="text-lg font-bold text-brand-500">¥{item.priceMax}</span>
              <span className="text-xs text-gray-400 ml-1">出厂价</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
              <span>小批量: ¥{item.priceSmallBatch}/件</span>
              <span className="text-gray-300">|</span>
              <span>大批量 ({item.priceBulkThreshold}+): ¥{item.priceMin}/件</span>
            </div>
          </div>
        )}

        {/* Factory categories */}
        {!isProduct && item.categories && item.categories.length > 0 && (
          <p className="text-sm text-gray-500 mt-1 mb-2">{item.categories.join(' · ')}</p>
        )}

        {/* Rating + Location + Reviews */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 flex-wrap">
          <span className="inline-flex items-center gap-1">
            {renderStars(item.rating)}
            <span className="text-gray-400 ml-0.5">{item.rating}</span>
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

        {/* Tags */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {(item.tags || []).map((t) => (
            <span key={t.label} className={`text-[11px] px-2 py-0.5 rounded font-medium ${t.color}`}>
              {t.label}
            </span>
          ))}
          {item.dropship && (
            <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-cyan-50 text-cyan-700 inline-flex items-center gap-1">
              <FiPackage className="w-3 h-3" />
              一件代发
            </span>
          )}
        </div>

        {/* Channel info */}
        {item.channelCount > 0 && (
          <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
            <FiUsers className="w-3.5 h-3.5 text-gray-400" />
            <span>
              已对接 <strong className="text-gray-700">{item.channelCount}</strong> 家渠道
            </span>
            {(item.channelNames || []).length > 0 && <span className="text-gray-300 mx-0.5">·</span>}
            {(item.channelNames || []).length > 0 && (
              <span className="text-gray-400 truncate max-w-[180px] sm:max-w-[280px]">
                {(item.channelNames || []).slice(0, 3).join(' · ')}
                {(item.channelNames || []).length > 3 && ' 等'}
              </span>
            )}
          </div>
        )}

        {/* Trend tag */}
        {item.trendTag && (
          <div className="mb-2">
            <span
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                item.trendTag.hot
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-orange-50 text-orange-600 border border-orange-100'
              }`}
            >
              {item.trendTag.hot && <FiTrendingUp className="w-3.5 h-3.5" />}
              {item.trendTag.text}
            </span>
          </div>
        )}

        {/* Factory-specific info */}
        {!isProduct && (
          <div className="mb-2 flex items-center gap-4 text-xs text-gray-500">
            {item.yearEstablished && <span>成立: {item.yearEstablished}</span>}
            {item.employeeCount && <span>规模: {item.employeeCount}</span>}
          </div>
        )}

        {/* Order info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-50">
          <span className="inline-flex items-center gap-1">
            <FiShoppingCart className="w-3 h-3 text-gray-400" />
            最小起订: <span className="text-gray-700 font-medium">{item.minOrder}件</span>
          </span>
          <span className="text-gray-200">|</span>
          <span className="inline-flex items-center gap-1">
            一件代发:
            <span className={item.dropship ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {item.dropship ? '支持' : '不支持'}
            </span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleSave(item)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              saved
                ? 'border-brand-200 bg-brand-50 text-brand-600'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <FiHeart className={`w-3.5 h-3.5 ${saved ? 'fill-brand-400 text-brand-400' : ''}`} />
            {saved ? '已收藏' : '收藏'}
          </button>
          <button
            onClick={() => onOpenContact?.(item.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50 transition-all"
          >
            <FiMessageSquare className="w-3.5 h-3.5" />
            联系
          </button>
          <button
            onClick={() => onOpenVideo?.(item.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-400 text-white hover:bg-brand-500 transition-all"
          >
            <FiVideo className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">生成视频素材</span>
            <span className="sm:hidden">视频</span>
          </button>
          <span className="hidden sm:flex items-center gap-1 ml-auto text-[11px] text-gray-400">
            <FiClock className="w-3 h-3" />
            {daysAgo(item.updatedAt)}
          </span>
        </div>

        {/* Mobile updated time */}
        <div className="flex sm:hidden items-center gap-1 mt-2 text-[11px] text-gray-400">
          <FiClock className="w-3 h-3" />
          数据更新: {daysAgo(item.updatedAt)}
        </div>
      </div>
    </div>
  )
}
