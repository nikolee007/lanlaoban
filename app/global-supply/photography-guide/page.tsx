'use client'

import { useState } from 'react'
import { FiCamera, FiLoader, FiCopy, FiRefreshCw, FiSmartphone, FiMonitor, FiCoffee, FiHeart } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import Breadcrumb from '@/app/components/Breadcrumb'

const HOT_CATEGORIES = [
  { key: 'electronics', label: '电子产品', icon: FiMonitor },
  { key: 'clothing', label: '服装', icon: FiSmartphone },
  { key: 'food', label: '食品', icon: FiCoffee },
  { key: 'beauty', label: '美妆', icon: FiHeart },
]

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  zh: { electronics: '电子产品', clothing: '服装', food: '食品', beauty: '美妆' },
  en: { electronics: 'Electronics', clothing: 'Clothing', food: 'Food', beauty: 'Beauty' },
}

export default function PhotographyGuidePage() {
  const { locale } = useLocale()
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCategoryClick = (cat: string) => {
    setCategory(cat)
  }

  const handleSubmit = async () => {
    if (!productName.trim()) return

    setLoading(true)
    setError('')
    setResult('')

    try {
      const catLabel = CATEGORY_LABELS[locale]?.[category] || category || '通用'
      const prompt = `为[${productName}]（品类：[${catLabel}]）提供产品拍摄建议，包括：1. 拍摄角度 2. 灯光设置 3. 背景选择 4. 道具搭配 5. 后期调色方向。用中文，分点回答。`

      const res = await fetch('/api/agnes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) throw new Error(`请求失败: ${res.status}`)

      const data = await res.json()
      const content = data.content || data.error || JSON.stringify(data)
      setResult(content)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : locale === 'en' ? 'Request failed' : '请求失败',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result)
    } catch {
      // fallback
    }
  }

  const renderResult = () => {
    if (!result) return null
    // Split by numbered items (1. 2. etc.)
    const lines = result.split(/\n/).filter(Boolean)
    return (
      <div className="space-y-3">
        {lines.map((line, i) => {
          const match = line.match(/^(\d+\.\s*\*{0,2}[^：:]*[：:]?)(.*)/)
          if (match) {
            return (
              <div key={i} className="rounded-lg border border-brand-100 bg-brand-50/30 p-3">
                <span className="text-sm font-bold text-brand-400">
                  {match[1]}
                </span>
                <span className="text-sm text-gray-700">{match[2]}</span>
              </div>
            )
          }
          // Check for bold markers **text**
          if (line.includes('**')) {
            const parts = line.split(/(\*\*[^*]+\*\*)/)
            return (
              <p key={i} className="text-sm text-gray-700">
                {parts.map((part, j) =>
                  part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={j} className="font-bold text-brand-400">
                      {part.slice(2, -2)}
                    </strong>
                  ) : (
                    <span key={j}>{part}</span>
                  ),
                )}
              </p>
            )
          }
          return (
            <p key={i} className="text-sm text-gray-700">
              {line}
            </p>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4 sm:py-6">
        <Breadcrumb
          items={[
            { label: t('supply.breadcrumb', locale), href: '/global-supply' },
            { label: locale === 'en' ? 'Photography Guide' : 'AI拍摄指导' },
          ]}
          className="mb-4"
        />

        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
              <FiCamera className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {locale === 'en' ? 'AI Photography Guide' : 'AI拍摄指导 — 拍出爆款产品图'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {locale === 'en'
                  ? 'Get professional product photography tips powered by AI'
                  : '输入商品信息，AI为你提供专业的拍摄方案'}
              </p>
            </div>
          </div>
        </div>

        {/* Input form */}
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {locale === 'en' ? 'Product Name' : '商品名称'}
            </label>
            <input
              type="text"
              className="input"
              placeholder={
                locale === 'en'
                  ? 'e.g. Wireless Bluetooth Headphones'
                  : '例如：无线蓝牙耳机'
              }
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
              }}
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {locale === 'en' ? 'Category' : '品类'}
            </label>
            <div className="flex flex-wrap gap-2">
              {HOT_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isActive = category === cat.key
                const label = CATEGORY_LABELS[locale]?.[cat.key] || cat.label
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleCategoryClick(cat.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'border-brand-400 bg-brand-50 text-brand-400'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-brand-200 hover:text-brand-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                )
              })}
              {category && (
                <button
                  onClick={() => setCategory('')}
                  className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400 transition-colors hover:text-gray-600"
                >
                  {locale === 'en' ? 'Clear' : '清除'}
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!productName.trim() || loading}
            className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" />
                {locale === 'en' ? 'Generating...' : '正在生成...'}
              </>
            ) : (
              <>
                <FiCamera className="h-4 w-4" />
                {locale === 'en' ? 'Get Suggestions' : '获取拍摄建议'}
              </>
            )}
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-3 w-4/5 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">{error}</span>
              <button
                onClick={handleSubmit}
                className="ml-auto flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
              >
                <FiRefreshCw className="h-3.5 w-3.5" />
                {locale === 'en' ? 'Retry' : '重试'}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <FiCamera className="h-4 w-4 text-brand-400" />
                {locale === 'en' ? 'Photography Suggestions' : '拍摄建议'}
              </h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-brand-200 hover:text-brand-400"
              >
                <FiCopy className="h-3.5 w-3.5" />
                {locale === 'en' ? 'Copy' : '复制'}
              </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto">{renderResult()}</div>
          </div>
        )}
      </div>
    </div>
  )
}
