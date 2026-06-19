'use client'
import { useState } from 'react'
import NavHeader from '../components/NavHeader'
import { FiZap, FiDownload, FiTarget, FiTrendingUp, FiCamera, FiCalendar, FiDollarSign, FiChevronDown, FiChevronUp } from 'react-icons/fi'

export default function PlanPage() {
  const [industry, setIndustry] = useState('')
  const [product, setProduct] = useState('')
  const [target, setTarget] = useState('')
  const [years, setYears] = useState('')
  const [coach, setCoach] = useState('libazi')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<any>(null)
  const [error, setError] = useState('')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const handleGenerate = async () => {
    if (!industry.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: industry.trim(), product: product.trim(), targetCustomer: target, years, coach }),
      })
      const data = await res.json()
      if (res.ok) setPlan(data)
      else setError(data.error || '生成失败')
    } catch { setError('网络错误') }
    finally { setLoading(false) }
  }

  const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">IP起盘规划</h1>
          <p className="text-gray-500 text-sm">输入行业信息，AI自动生成完整起盘方案</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div><label className="text-sm font-medium mb-1 block">行业 *</label>
              <input value={industry} onChange={e => setIndustry(e.target.value)} className="input" placeholder="装修、餐饮、工厂..." /></div>
            <div><label className="text-sm font-medium mb-1 block">产品/服务</label>
              <input value={product} onChange={e => setProduct(e.target.value)} className="input" placeholder="全屋定制" /></div>
            <div><label className="text-sm font-medium mb-1 block">目标客户</label>
              <input value={target} onChange={e => setTarget(e.target.value)} className="input" placeholder="本地中高端业主" /></div>
            <div className="flex gap-3">
              <div className="flex-1"><label className="text-sm font-medium mb-1 block">年限</label>
                <input value={years} onChange={e => setYears(e.target.value)} className="input" placeholder="8年" /></div>
              <div className="flex-1"><label className="text-sm font-medium mb-1 block">风格</label>
                <select value={coach} onChange={e => setCoach(e.target.value)} className="input">
                  <option value="libazi">纪实派·全品类</option>
                  <option value="boge">烟火派·餐饮</option>
                  <option value="zhuge">认知派·高客单</option>
                  <option value="geng">工业派·B端</option>
                </select>
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button onClick={handleGenerate} disabled={loading}
            className="btn-primary flex items-center gap-2">
            {loading ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> 生成规划中...</> : <><FiZap className="w-4 h-4" /> 生成完整起盘规划</>}
          </button>
        </div>

        {plan && (
          <div className="space-y-4">
            {/* 人设 */}
            {plan.persona && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button onClick={() => toggleSection('persona')} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3"><FiTarget className="text-brand-400" /><span className="font-semibold">人设定位</span></div>
                  <FiChevronDown className={`text-gray-400 transition-transform ${expandedSections.persona ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.persona && (
                  <div className="px-6 pb-5 border-t pt-4 space-y-3">
                    <p className="text-lg font-bold text-brand-400">{plan.persona.nickname}</p>
                    <p className="text-sm text-gray-700">{plan.persona.description}</p>
                    <div className="flex flex-wrap gap-2">{plan.persona.tags?.map((t: string, i: number) => (
                      <span key={i} className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded">{t}</span>
                    ))}</div>
                  </div>
                )}
              </div>
            )}

            {/* 行业分析 */}
            {plan.analysis && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button onClick={() => toggleSection('analysis')} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3"><FiTrendingUp className="text-brand-400" /><span className="font-semibold">行业分析</span></div>
                  <FiChevronDown className={`text-gray-400 transition-transform ${expandedSections.analysis ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.analysis && (
                  <div className="px-6 pb-5 border-t pt-4 space-y-4">
                    <p className="text-sm text-gray-700">{plan.analysis.status}</p>
                    {plan.analysis.userPain?.length > 0 && (
                      <div><p className="text-sm font-medium text-gray-500 mb-2">用户痛点</p>
                        {plan.analysis.userPain.map((p: string, i: number) => (
                          <p key={i} className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-1.5 mb-1">{p}</p>
                        ))}
                      </div>
                    )}
                    {plan.analysis.peerMistakes?.length > 0 && (
                      <div><p className="text-sm font-medium text-gray-500 mb-2">同行常见误区</p>
                        {plan.analysis.peerMistakes.map((m: string, i: number) => (
                          <p key={i} className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-1.5 mb-1">{m}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 内容策略 */}
            {plan.contentStrategy && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button onClick={() => toggleSection('content')} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3"><FiZap className="text-brand-400" /><span className="font-semibold">内容策略</span></div>
                  <FiChevronDown className={`text-gray-400 transition-transform ${expandedSections.content ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.content && (
                  <div className="px-6 pb-5 border-t pt-4 space-y-4">
                    {plan.contentStrategy.quadrants?.map((q: any, i: number) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-16 text-sm font-medium text-brand-400">{q.type}</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{q.direction}</p>
                          <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                            <div className="h-1.5 bg-brand-400 rounded-full" style={{ width: `${q.ratio}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {plan.contentStrategy.first10?.length > 0 && (
                      <div><p className="text-sm font-medium text-gray-500 mb-2 mt-4">前10条选题</p>
                        <div className="space-y-1">{plan.contentStrategy.first10.map((t: string, i: number) => (
                          <p key={i} className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-1.5">{i + 1}. {t}</p>
                        ))}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 变现路径 */}
            {plan.monetization && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button onClick={() => toggleSection('money')} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3"><FiDollarSign className="text-brand-400" /><span className="font-semibold">变现路径</span></div>
                  <FiChevronDown className={`text-gray-400 transition-transform ${expandedSections.money ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.money && (
                  <div className="px-6 pb-5 border-t pt-4 space-y-3">
                    {[
                      { label: '短期（1个月内）', value: plan.monetization.shortTerm },
                      { label: '中期（1-3个月）', value: plan.monetization.midTerm },
                      { label: '长期（3-6个月）', value: plan.monetization.longTerm },
                    ].map((m, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">{m.label}</p><p className="text-sm">{m.value}</p></div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 拍摄方案 */}
            {plan.equipment && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button onClick={() => toggleSection('equip')} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3"><FiCamera className="text-brand-400" /><span className="font-semibold">拍摄方案</span></div>
                  <FiChevronDown className={`text-gray-400 transition-transform ${expandedSections.equip ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.equip && (
                  <div className="px-6 pb-5 border-t pt-4 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {plan.equipment.map((e: any, i: number) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-3">
                          <p className="text-xs font-medium text-brand-400 mb-1">{e.tier} · 预算¥{e.budget}</p>
                          <p className="text-sm">手机：{e.phone}</p>
                          <p className="text-sm">收音：{e.mic}</p>
                          {e.light && <p className="text-sm">灯光：{e.light}</p>}
                        </div>
                      ))}
                    </div>
                    {plan.scenes?.length > 0 && (
                      <div><p className="text-sm font-medium text-gray-500 mb-2">必拍场景</p>
                        <div className="flex flex-wrap gap-2">{plan.scenes.map((s: any, i: number) => (
                          <span key={i} className="text-xs bg-amber-50 text-amber-600 px-2.5 py-1 rounded">{s.name}：{s.note}</span>
                        ))}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 起号节奏 */}
            {plan.growthPhases && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button onClick={() => toggleSection('growth')} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3"><FiTrendingUp className="text-brand-400" /><span className="font-semibold">起号节奏</span></div>
                  <FiChevronDown className={`text-gray-400 transition-transform ${expandedSections.growth ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.growth && (
                  <div className="px-6 pb-5 border-t pt-4 space-y-3">
                    {[
                      { label: '冷启动期（1-2周）', value: plan.growthPhases.coldStart },
                      { label: '爬坡期（3-4周）', value: plan.growthPhases.climb },
                      { label: '稳定期（第2个月起）', value: plan.growthPhases.stable },
                    ].map((p, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">{p.label}</p><p className="text-sm">{p.value}</p></div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 行动计划 */}
            {plan.actionPlan?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button onClick={() => toggleSection('action')} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3"><FiCalendar className="text-brand-400" /><span className="font-semibold">30天行动计划</span></div>
                  <FiChevronDown className={`text-gray-400 transition-transform ${expandedSections.action ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.action && (
                  <div className="px-6 pb-5 border-t pt-4 space-y-2">
                    {plan.actionPlan.map((w: any, i: number) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-brand-400">第{w.week}周</p>
                          <p className="text-xs text-gray-400">KPI: {w.kpi}</p>
                        </div>
                        <p className="text-sm text-gray-700 mb-0.5">重点：{w.focus}</p>
                        <p className="text-sm text-gray-500">产出：{w.output}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-gray-400 text-center pt-4">AI生成 · 可根据实际情况调整</p>
          </div>
        )}
      </main>
    </div>
  )
}
