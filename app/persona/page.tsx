'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import NavHeader from '../components/NavHeader'
import Breadcrumb from '../components/Breadcrumb'
import { FiCheck, FiArrowRight, FiZap, FiChevronRight } from 'react-icons/fi'

/* ─────────────────── Constants ─────────────────── */

const COACHES = [
  {
    value: 'libazi',
    label: '纪实派·真诚人设',
    desc: '22-26s · 全品类通用',
    industry: '餐饮·工厂·门店',
    image: '/images/coaches/libazi.jpg',
  },
  {
    value: 'boge',
    label: '烟火派·同城共情',
    desc: '25-30s · 餐饮同城',
    industry: '餐饮·本地生活',
    image: '/images/coaches/boge.jpg',
  },
  {
    value: 'zhuge',
    label: '认知派·高客单逻辑',
    desc: '28-35s · 家装建材',
    industry: '家装·建材·高客单',
    image: '/images/coaches/zhuge.jpg',
  },
  {
    value: 'geng',
    label: '工业派·B端采购',
    desc: '20-25s · 工厂制造',
    industry: '工厂·制造·B2B',
    image: '/images/coaches/geng.jpg',
  },
] as const

const CUSTOMER_OPTIONS = ['B端经销商', '本地C端客户', '加盟商', '工程单']

const STEPS = [
  { num: 1, label: '选择IP风格' },
  { num: 2, label: '填写信息' },
  { num: 3, label: '生成结果' },
]

/* ─────────────────── Types ─────────────────── */

interface PersonaResult {
  nickname: string
  slogan: string
  bio: string
  intro: string
}

/* ─────────────────── Component ─────────────────── */

export default function PersonaPage() {
  const [step, setStep] = useState(1)

  // Step 1
  const [coach, setCoach] = useState<string>('libazi')

  // Step 2
  const [industry, setIndustry] = useState('')
  const [product, setProduct] = useState('')
  const [years, setYears] = useState('')
  const [targetCustomer, setTargetCustomer] = useState(CUSTOMER_OPTIONS[0])
  const [pain1, setPain1] = useState('')
  const [pain2, setPain2] = useState('')
  const [pain3, setPain3] = useState('')

  // Step 3
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PersonaResult | null>(null)
  const [error, setError] = useState('')

  /* ─── Derived ─── */

  const canGoStep2 = industry.trim() !== '' && product.trim() !== ''

  /* ─── Handlers ─── */

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry,
          product,
          targetCustomer,
          years: parseInt(years) || undefined,
          style: coach,
          pains: [pain1, pain2, pain3].filter(Boolean),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('lanlaoban_persona', JSON.stringify(data.persona))
        localStorage.setItem('lanlaoban_coach', coach)
        setResult(data.persona)
        setStep(3)
      } else {
        setError(data.error || '生成失败')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  /* ─────────────────── Render ─────────────────── */

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Breadcrumb
          items={[
            { label: '首页', href: '/' },
            { label: '一键做IP', href: '/persona' },
          ]}
        />

        {/* Page Title */}
        <div className="mt-4 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-[#FF6034]">一键做IP</span> · AI智能生成实体老板人设方案
          </h1>
          <p className="mt-2 text-gray-500">
            选择IP风格，填写行业信息，AI全自动生成完整的人设方案
          </p>
        </div>

        {/* ─── Step Indicators ─── */}
        <div className="flex items-center justify-center mb-10 gap-2">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (s.num < step) setStep(s.num)
                }}
                disabled={s.num > step}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                  ${
                    s.num < step
                      ? 'bg-[#FF6034] text-white cursor-pointer'
                      : s.num === step
                        ? 'bg-[#FF6034] text-white ring-4 ring-[#FF6034]/20'
                        : 'bg-gray-200 text-gray-400'
                  }
                `}
              >
                {s.num < step ? <FiCheck size={18} /> : s.num}
              </button>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  s.num <= step ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
              {i < 2 && (
                <div
                  className={`w-12 sm:w-20 h-0.5 mx-1 ${
                    s.num < step ? 'bg-[#FF6034]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ─── Step 1: 选择IP风格 ─── */}
        {step === 1 && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">选择你的IP风格</h2>
              <p className="mt-1 text-sm text-gray-500">
                4种实战验证的IP风格，覆盖不同行业和客户群体
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {COACHES.map((c) => {
                const selected = coach === c.value
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCoach(c.value)}
                    className={`
                      group relative rounded-2xl overflow-hidden bg-white border-2 transition-all duration-200 text-left
                      ${
                        selected
                          ? 'border-[#FF6034] shadow-lg shadow-[#FF6034]/10 ring-2 ring-[#FF6034]/20'
                          : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                      }
                    `}
                  >
                    {/* Photo */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={c.image}
                        alt={c.label}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                      {/* Selected badge */}
                      {selected && (
                        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#FF6034] flex items-center justify-center shadow-md">
                          <FiCheck className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="p-4">
                      <h3
                        className={`font-bold text-sm transition-colors ${
                          selected ? 'text-[#FF6034]' : 'text-gray-900'
                        }`}
                      >
                        {c.label}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-400">{c.desc}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-[11px] text-gray-500 font-medium">
                          {c.industry}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Next button */}
            <div className="mt-10 text-center">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#FF6034] text-white font-semibold rounded-xl hover:bg-[#E8552E] transition-colors shadow-lg shadow-[#FF6034]/20"
              >
                下一步：填写信息
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 2: 填写信息 ─── */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">填写行业信息</h2>
              <p className="mt-1 text-sm text-gray-500">
                信息越详细，AI生成的人设方案越精准
              </p>
            </div>

            {/* 基本信息卡片 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#FF6034]" />
                基本信息
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    行业名称 <span className="text-[#FF6034]">*</span>
                  </label>
                  <input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF6034] focus:ring-2 focus:ring-[#FF6034]/10 transition-colors"
                    placeholder="如：服装批发"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    主营产品 <span className="text-[#FF6034]">*</span>
                  </label>
                  <input
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF6034] focus:ring-2 focus:ring-[#FF6034]/10 transition-colors"
                    placeholder="如：男士T恤"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    从业年限
                  </label>
                  <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF6034] focus:ring-2 focus:ring-[#FF6034]/10 transition-colors"
                    placeholder="如：18"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    核心客群
                  </label>
                  <select
                    value={targetCustomer}
                    onChange={(e) => setTargetCustomer(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#FF6034] focus:ring-2 focus:ring-[#FF6034]/10 transition-colors"
                  >
                    {CUSTOMER_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 痛点卡片 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#FF6034]" />
                行业痛点（客户最怕的3个坑）
              </h3>
              <p className="text-xs text-gray-400 -mt-3">
                填写客户最担心的行业问题，AI将在人设中帮你一一回应
              </p>

              <div className="space-y-3">
                {[
                  { value: pain1, setter: setPain1, label: '痛点 1', placeholder: '如：以次充好、虚标材质' },
                  { value: pain2, setter: setPain2, label: '痛点 2', placeholder: '如：售后找不到人' },
                  { value: pain3, setter: setPain3, label: '痛点 3', placeholder: '如：价格不透明' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                      {i + 1}
                    </span>
                    <input
                      value={item.value}
                      onChange={(e) => item.setter(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF6034] focus:ring-2 focus:ring-[#FF6034]/10 transition-colors"
                      placeholder={item.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 选中的风格提示 */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FF6034]/5 border border-[#FF6034]/10">
              <div className="w-8 h-8 rounded-lg bg-[#FF6034]/10 flex items-center justify-center">
                <FiZap className="w-4 h-4 text-[#FF6034]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">已选风格</p>
                <p className="text-sm font-semibold text-[#FF6034]">
                  {COACHES.find((c) => c.value === coach)?.label}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="ml-auto text-xs text-gray-400 hover:text-[#FF6034] transition-colors flex items-center gap-0.5"
              >
                修改 <FiChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                上一步
              </button>
              <button
                onClick={handleGenerate}
                disabled={!canGoStep2 || loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#FF6034] text-white font-semibold rounded-xl hover:bg-[#E8552E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#FF6034]/20"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    AI生成中...
                  </>
                ) : (
                  <>
                    <FiZap className="w-4 h-4" />
                    AI生成人设方案
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 3: 生成结果 ─── */}
        {step === 3 && result && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">你的人设方案已生成</h2>
              <p className="mt-1 text-sm text-gray-500">
                基于你的行业信息和{COACHES.find((c) => c.value === coach)?.label}
                风格定制
              </p>
            </div>

            {/* Nickname card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-xs text-gray-400 mb-2">推荐昵称</p>
              <h3 className="text-3xl font-bold text-[#FF6034]">{result.nickname}</h3>
            </div>

            {/* Slogan card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs text-gray-400 mb-2">Slogan</p>
              <p className="text-lg font-semibold text-gray-900">{result.slogan}</p>
            </div>

            {/* Bio card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs text-gray-400 mb-2">人设简介</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {result.bio}
              </p>
            </div>

            {/* Intro card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs text-gray-400 mb-2">自我介绍脚本</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {result.intro}
              </p>
            </div>

            {/* CTA buttons */}
            <div className="space-y-3 pt-2">
              <Link
                href="/generate"
                className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-[#FF6034] text-white font-semibold rounded-xl hover:bg-[#E8552E] transition-colors shadow-lg shadow-[#FF6034]/20"
              >
                <FiZap className="w-5 h-5" />
                生成口播脚本
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/brand-promotion"
                className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-white text-[#FF6034] font-semibold rounded-xl border-2 border-[#FF6034]/20 hover:border-[#FF6034]/40 hover:bg-[#FF6034]/5 transition-colors"
              >
                生成宣传视频
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Bottom actions */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setStep(2)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← 修改信息重新生成
              </button>
              <button
                onClick={() => {
                  setStep(1)
                  setResult(null)
                  setError('')
                }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                重新选择风格
              </button>
            </div>
          </div>
        )}

        {/* Loading state for Step 3 without result */}
        {step === 3 && loading && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FF6034]/10 mb-6">
                <svg className="animate-spin w-8 h-8 text-[#FF6034]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI正在深度思考...</h3>
              <p className="text-sm text-gray-400">正在分析你的行业特点，生成专属人设方案</p>
            </div>
          </div>
        )}

        {/* Error state for Step 3 */}
        {step === 3 && error && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-6">
                <span className="text-2xl">😞</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">生成失败</h3>
              <p className="text-sm text-gray-400 mb-6">{error}</p>
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6034] text-white font-semibold rounded-xl hover:bg-[#E8552E] transition-colors"
              >
                <FiZap className="w-4 h-4" />
                重新生成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
