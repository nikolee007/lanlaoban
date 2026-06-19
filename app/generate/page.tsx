'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiChevronDown, FiChevronUp, FiPlay, FiCalendar, FiFileText, FiCheck, FiDownload, FiRefreshCw, FiZap, FiCamera, FiUser, FiImage } from 'react-icons/fi'

type Step = 1 | 2 | 3
type CoachType = 'libazi' | 'boge' | 'zhuge' | 'geng'
type FormatType = 'short' | 'long'

interface FormData {
  industry: string
  product: string
  targetCustomer: string
  years: string
  coach: CoachType | ''
  format: FormatType
  pain1: string
  pain2: string
  pain3: string
}

interface Persona {
  nickname: string
  bio: string
  intro: string
  slogan: string
}

interface Segment {
  time: string
  content: string
  shotType: string
  notes?: string
}

interface ScriptItem {
  id: string
  module: string
  title: string
  content: string
  duration?: string
  segments?: Segment[]
}

const coachOptions = [
  { value: 'libazi', label: '纪实派 · 真诚人设', result: '500+ 实体账号已验证', desc: '22-26s · 全品类通用 · 行业真话+真诚纪实', detail: '车行/母婴/服装/门窗/全品类', recommend: true },
  { value: 'boge', label: '烟火派 · 同城共情', result: '300+ 餐饮同城账号已验证', desc: '25-30s · 餐饮同城 · 烟火共情+三点避坑', detail: '餐饮门店/加盟招商/美业/本地生活', recommend: false },
  { value: 'zhuge', label: '认知派 · 高客单逻辑', result: '200+ 高客单账号已验证', desc: '28-35s · 家装建材 · 认知干货+选材逻辑', detail: '装修/全屋定制/门窗/工程建材', recommend: false },
  { value: 'geng', label: '工业派 · B端采购', result: '150+ 工厂账号已验证', desc: '20-25s · 工厂制造 · 成本拆解+B端采购', detail: '五金加工/橡塑/钢材/零部件', recommend: false },
]

const modules = [
  { id: 'A', name: '人设信任篇', desc: '讲老板个人故事，建立信任', color: 'bg-blue-100 text-blue-700' },
  { id: 'B', name: '行业干货篇', desc: '分享专业知识，建立权威', color: 'bg-green-100 text-green-700' },
  { id: 'C', name: '实力展示篇', desc: '展示产品/服务优势', color: 'bg-amber-100 text-amber-700' },
  { id: 'D', name: '情绪共鸣+引流篇', desc: '促成交、引私信', color: 'bg-purple-100 text-purple-700' },
]

const initialForm: FormData = {
  industry: '', product: '', targetCustomer: '', years: '',
  coach: '', format: 'short', pain1: '', pain2: '', pain3: '',
}

export default function GeneratePage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [persona, setPersona] = useState<Persona | null>(null)
  const [scripts, setScripts] = useState<ScriptItem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState('')

  // 从 localStorage 恢复人设数据并预填表单
  useEffect(() => {
    const p = localStorage.getItem('lanlaoban_persona')
    if (p) {
      try {
        const pd = JSON.parse(p)
        setPersona(pd)
        // 尝试从人设数据推断行业/产品
        if (pd.nickname) {
          const inferred = pd.nickname.replace(/[的].*$/, '').trim()
          if (inferred && !form.industry) {
            updateField('industry', inferred.length > 5 ? '' : inferred)
          }
        }
      } catch {}
    }
    // 检查是否有人设头图源数据（从 persona 页存储的额外信息）
    const src = localStorage.getItem('lanlaoban_persona_source')
    if (src) {
      try {
        const s = JSON.parse(src)
        if (s.industry) updateField('industry', s.industry)
        if (s.product) updateField('product', s.product)
        if (s.targetCustomer) updateField('targetCustomer', s.targetCustomer)
        if (s.years) updateField('years', String(s.years))
        if (s.pain1) updateField('pain1', s.pain1)
        if (s.pain2) updateField('pain2', s.pain2)
        if (s.pain3) updateField('pain3', s.pain3)
      } catch {}
    }
    // 从 localStorage 恢复教练选择
    const savedCoach = localStorage.getItem('lanlaoban_coach')
    if (savedCoach) {
      updateField('coach', savedCoach)
    }
  }, [])

  const updateField = (field: keyof FormData, value: string) => setForm(p => ({ ...p, [field]: value }))
  const canStep1 = form.industry.trim() && form.product.trim() && form.targetCustomer.trim()

  // 根据行业智能推荐教练风格
  const getRecommendedCoach = (industry: string): string => {
    const kw = industry.toLowerCase()
    if (/餐饮|饭店|火锅|烧烤|奶茶|咖啡|小吃|加盟|连锁|美业|美容|美发/.test(kw)) return 'boge'
    if (/装修|建材|家具|全屋定制|门窗|橱柜|工程|设计/.test(kw)) return 'zhuge'
    if (/工厂|加工|制造|五金|机械|钢材|塑料|橡胶|设备|工业|生产/.test(kw)) return 'geng'
    return 'libazi' // 默认
  }

  const recommendedCoach = getRecommendedCoach(form.industry)

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      // Step 1: 生成人设
      setLoadingText('AI 正在分析行业信息...')
      const personaRes = await fetch('/api/generate/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: form.industry,
          product: form.product,
          targetCustomer: form.targetCustomer,
          years: parseInt(form.years) || 0,
          style: form.coach,
          pains: [form.pain1, form.pain2, form.pain3].filter(Boolean),
        }),
      })
      if (!personaRes.ok) throw new Error(await personaRes.json().then(d => d.error))
      const personaData = await personaRes.json()
      setPersona(personaData.persona)

      // Step 2: 生成脚本（短30条 or 长6条）
      const isLong = form.format === 'long'
      setLoadingText(isLong ? 'AI 正在创作6条深度长视频脚本...' : 'AI 正在创作30条专属脚本...')
      const apiEndpoint = isLong ? '/api/generate/scripts-long' : '/api/generate/scripts'
      const scriptsRes = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: form.industry,
          product: form.product,
          targetCustomer: form.targetCustomer,
          years: parseInt(form.years) || 0,
          style: form.coach,
          persona: personaData.persona,
        }),
      })
      if (!scriptsRes.ok) throw new Error(await scriptsRes.json().then(d => d.error))
      const scriptsData = await scriptsRes.json()
      const scriptList = scriptsData.scripts || []
      // 保存到 localStorage 供其他页面使用
      localStorage.setItem('lanlaoban_scripts', JSON.stringify(scriptList))
      localStorage.setItem('lanlaoban_coach', form.coach)
      setScripts(scriptList)
      setStep(3)
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败')
    } finally {
      setLoading(false)
      setLoadingText('')
    }
  }

  const countByModule = (m: string) => scripts.filter(s => s.module === m).length

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <main className="mx-auto max-w-4xl px-6 py-12">
        {step !== 3 && (
          <>
            <h1 className="text-3xl font-bold mb-2">AI 生成你的专属IP内容</h1>
            <p className="text-gray-500 mb-10">3步搞定：填写信息 → 选择风格 → 一键生成30条完整脚本</p>
          </>
        )}

        {/* 步骤指示器 */}
        {step !== 3 && (
          <div className="mb-10 flex items-center gap-2 text-sm">
            {([1, 2, 3] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${step >= s ? 'text-white' : 'border-2 border-gray-200 text-gray-400'}`}
                  style={step >= s ? { backgroundColor: '#FF6034' } : undefined}>
                  {step > s ? <FiCheck className="h-4 w-4" /> : s}
                </span>
                <span className={`${step >= s ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                  {s === 1 ? '填写信息' : s === 2 ? '选择风格' : '生成结果'}
                </span>
                {i < 2 && <span className="mx-2 h-px w-8 bg-gray-200" />}
              </div>
            ))}
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="card py-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-brand-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-700 font-medium">{loadingText}</p>
            <p className="text-sm text-gray-400 mt-2">AI 正在生成内容，大约需要 15-30 秒</p>
          </div>
        )}

        {/* Step 1: 填写信息 */}
        {step === 1 && !loading && (
          <div className="card">
            <h2 className="text-xl font-bold mb-1">填写行业信息</h2>
            <p className="text-sm text-gray-500 mb-8">AI 会根据这些信息生成针对性内容</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="text-sm font-medium mb-1 block">行业名称</label>
                <input value={form.industry} onChange={e => updateField('industry', e.target.value)} className="input" placeholder="服装批发、餐饮、美业..." /></div>
              <div className="col-span-2"><label className="text-sm font-medium mb-1 block">主营产品/服务</label>
                <input value={form.product} onChange={e => updateField('product', e.target.value)} className="input" placeholder="男士T恤、川菜馆、皮肤管理..." /></div>
              <div><label className="text-sm font-medium mb-1 block">目标客群</label>
                <input value={form.targetCustomer} onChange={e => updateField('targetCustomer', e.target.value)} className="input" placeholder="B端经销商、本地宝妈..." /></div>
              <div><label className="text-sm font-medium mb-1 block">从业年限</label>
                <input value={form.years} onChange={e => updateField('years', e.target.value)} className="input" placeholder="18" /></div>
              <div className="col-span-2"><label className="text-sm font-medium mb-1 block">行业痛点（选填，客户最怕遇到什么问题）</label>
                <input value={form.pain1} onChange={e => updateField('pain1', e.target.value)} className="input mb-2" placeholder="如：质量参差不齐" />
                <input value={form.pain2} onChange={e => updateField('pain2', e.target.value)} className="input mb-2" placeholder="如：中间商加价" />
                <input value={form.pain3} onChange={e => updateField('pain3', e.target.value)} className="input" placeholder="如：售后没保障" /></div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="btn-primary" disabled={!canStep1} onClick={() => setStep(2)}>下一步：选择风格</button>
            </div>
          </div>
        )}

        {/* Step 2: 选择风格 */}
        {step === 2 && !loading && (
          <div className="card">
            <h2 className="text-xl font-bold mb-1">选择IP风格</h2>
            <p className="text-sm text-gray-500 mb-6">已根据你的行业推荐最适合的风格</p>

            {form.industry && recommendedCoach && (
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 mb-6 flex items-center gap-2">
                <FiZap className="w-4 h-4 text-brand-400" />
                <p className="text-sm text-brand-700">
                  基于「<strong>{form.industry}</strong>」行业，推荐使用 <strong>{coachOptions.find(o => o.value === recommendedCoach)?.label}</strong>
                </p>
              </div>
            )}

            <div className="space-y-3">
              {coachOptions.map(opt => {
                const isRecommended = form.industry && opt.value === recommendedCoach
                const isSelected = form.coach === opt.value
                return (
                  <button key={opt.value} onClick={() => updateField('coach', opt.value)}
                    className={`w-full rounded-xl border-2 p-5 text-left transition-all relative ${
                      isSelected ? 'bg-brand-50' : 'border-gray-100 hover:border-gray-200'
                    }`} style={isSelected ? { borderColor: '#FF6034' } : isRecommended ? { borderColor: '#FF6034', borderStyle: 'dashed' } : {}}>
                    {isRecommended && !isSelected && (
                      <span className="absolute -top-2.5 right-3 text-xs text-brand-400 bg-white px-2 font-medium">推荐</span>
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{opt.label}</span>
                          <span className="text-xs text-gray-400">{opt.result}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{opt.desc}</p>
                        <p className="text-xs text-gray-400 mt-0.5">适合：{opt.detail}</p>
                      </div>
                      {isSelected && <FiCheck className="w-5 h-5 mt-1 shrink-0" style={{ color: '#FF6034' }} />}
                    </div>
                  </button>
                )
              })}
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            {/* 格式选择 */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">视频时长偏好</p>
              <div className="flex gap-3">
                {[
                  { value: 'short', label: '引流款 · 20-30秒', desc: '冲流量、涨粉、日更' },
                  { value: 'long', label: '成交款 · 60-120秒', desc: '深度信任、高转化、高客单' },
                ].map(f => (
                  <button key={f.value} onClick={() => updateField('format', f.value as FormatType)}
                    className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${form.format === f.value ? 'bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}
                    style={form.format === f.value ? { borderColor: '#FF6034' } : {}}>
                    <p className="font-semibold text-sm">{f.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button className="btn-outline" onClick={() => setStep(1)}>上一步</button>
              <button className="btn-primary flex items-center gap-2" disabled={!form.coach} onClick={handleGenerate}>
                <FiZap className="w-4 h-4" /> AI生成 {form.format === 'long' ? '6条长视频' : '30条短视频'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 结果展示 */}
        {step === 3 && !loading && (
          <div>
            {/* 人设卡片 */}
            {persona && (
              <div className="card border-brand-200 bg-brand-50/30 mb-6">
                <div className="flex items-center gap-2 mb-3"><FiUser className="text-brand-400" /><span className="font-semibold">你的AI人设方案</span></div>
                <p className="text-xl font-bold text-brand-400">{persona.nickname}</p>
                <p className="text-sm text-gray-600 mt-1">{persona.bio}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs bg-white px-3 py-1.5 rounded-full border">{persona.slogan}</span>
                </div>
              </div>
            )}

            {/* 模块统计 */}
            {scripts[0]?.module !== 'L' && (
              <div className="grid grid-cols-4 gap-3 mb-6">
                {modules.map(m => (
                  <div key={m.id} className="card text-center py-4">
                    <p className="text-2xl font-bold">{countByModule(m.id)}</p>
                    <p className="text-xs text-gray-500">模块{m.id}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">共 {scripts.length} 条专属脚本</h2>
              <div className="flex gap-2">
                <button className="btn-outline text-sm" onClick={() => { setStep(1); setScripts([]); setPersona(null); }}><FiRefreshCw className="w-3 h-3 mr-1" />重新生成</button>
              </div>
            </div>

            {/* 按模块展示 */}
            {modules.map(mod => {
              const items = scripts.filter(s => s.module === mod.id)
              if (!items.length) return null
              return (
                <div key={mod.id} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand-400 text-white flex items-center justify-center font-bold text-sm">{mod.id}</div>
                    <div>
                      <h3 className="font-semibold">{mod.name}</h3>
                      <p className="text-sm text-gray-400">{mod.desc} · {items.length}条</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {items.map(s => (
                      <div key={s.id} className="card cursor-pointer" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 font-mono">{s.id.toUpperCase()}</span>
                            <span className="font-medium">{s.title}</span>
                          </div>
                          {expandedId === s.id ? <FiChevronUp className="text-gray-400 shrink-0" /> : <FiChevronDown className="text-gray-400 shrink-0" />}
                        </div>
                        {expandedId === s.id && (
                          <div className="mt-4 pt-4 border-t">
                            {s.segments && s.segments.length > 0 ? (
                              <div className="space-y-2">
                                {s.segments.map((seg: any, i: number) => (
                                  <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-mono bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">{seg.time}</span>
                                      <span className="text-xs text-gray-500">{seg.shotType}</span>
                                      {seg.notes && <span className="text-xs text-gray-400 ml-auto">{seg.notes}</span>}
                                    </div>
                                    <p className="text-sm text-gray-700">{seg.content}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{s.content}</p>
                            )}
                            {s.duration && <p className="text-xs text-gray-400 mt-2">预估时长：{s.duration}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t">
              <Link href="/scenes" className="btn-primary flex-1 flex items-center justify-center gap-2">
                <FiImage className="w-4 h-4" /> 查看场景方案
              </Link>
              <Link href="/guide" className="btn-outline flex-1 flex items-center justify-center gap-2">
                <FiCamera className="w-4 h-4" /> 拍摄指导
              </Link>
              <Link href="/schedule" className="btn-outline flex-1 flex items-center justify-center gap-2">
                <FiCalendar className="w-4 h-4" /> 排期表
              </Link>
              <button className="btn-outline flex items-center justify-center gap-2" onClick={() => {
                const text = scripts.map(s => `${s.id.toUpperCase()} ${s.title}\n${s.content}`).join('\n\n---\n\n')
                navigator.clipboard.writeText(text)
                alert('已复制到剪贴板')
              }}>
                <FiDownload className="w-4 h-4" /> 复制全部
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
