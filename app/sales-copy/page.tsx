'use client'

import { useState } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import Breadcrumb from '../components/Breadcrumb'
import { FiSend, FiMessageCircle, FiUserPlus, FiFilm, FiLoader, FiZap } from 'react-icons/fi'

interface SalesResult {
  ending: string
  autoReply: string
  wechatCopy: string
}

export default function SalesCopyPage() {
  const [industry, setIndustry] = useState('')
  const [product, setProduct] = useState('')
  const [persona, setPersona] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SalesResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!industry.trim() || !product.trim() || !persona.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/generate/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: industry.trim(),
          product: product.trim(),
          persona: {
            nickname: persona.trim(),
            bio: persona.trim(),
            intro: persona.trim(),
            slogan: '',
          },
        }),
      })

      if (!res.ok) {
        throw new Error('生成失败，请稍后重试')
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
        <Breadcrumb items={[{ label: '懒老板', href: '/' }, { label: 'AI 成交话术' }]} />
      </div>
      <section className="px-4 pt-6 pb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          私信成交话术生成器
        </h1>
        <p className="mt-3 text-gray-500 max-w-lg mx-auto">
          输入你的行业和产品信息，AI自动生成3段高转化话术
        </p>
      </section>

      <section className="px-4 pb-24 max-w-3xl mx-auto">
        <div className="card">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="industry" className="input-label">
                行业
              </label>
              <input
                id="industry"
                type="text"
                className="input"
                placeholder="例如：餐饮、美业、健身"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="product" className="input-label">
                产品
              </label>
              <input
                id="product"
                type="text"
                className="input"
                placeholder="例如：火锅套餐、美容年卡"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="persona" className="input-label">
                人设关键词
              </label>
              <input
                id="persona"
                type="text"
                className="input"
                placeholder="例如：真诚、专业、接地气"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FiLoader className="h-5 w-5 animate-spin" />
                  生成中...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiSend className="h-5 w-5" />
                  生成话术
                </span>
              )}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mt-10 space-y-6">
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  生成结果
                </h3>
              </div>

              {/* Module 1 */}
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-full bg-brand-50 p-1.5">
                    <FiFilm className="h-4 w-4 text-brand-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    视频结尾固定引流句
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {result.ending}
                </p>
              </div>

              {/* Module 2 */}
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-full bg-brand-50 p-1.5">
                    <FiMessageCircle className="h-4 w-4 text-brand-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    私信自动回复模板
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {result.autoReply}
                </p>
              </div>

              {/* Module 3 */}
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-full bg-brand-50 p-1.5">
                    <FiUserPlus className="h-4 w-4 text-brand-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    微信添加话术
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {result.wechatCopy}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
