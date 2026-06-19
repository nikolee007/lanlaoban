'use client'
import { useState } from 'react'
import NavHeader from '../components/NavHeader'
import { FiZap, FiCopy, FiCheck, FiTag, FiUser, FiCalendar, FiChevronDown, FiChevronUp, FiRefreshCw, FiDownload } from 'react-icons/fi'

const COACH_NAMES: Record<string, string> = { libazi: '纪实派', boge: '烟火派', zhuge: '认知派', geng: '工业派' }

export default function IndustryPage() {
  const [industry, setIndustry] = useState('')
  const [product, setProduct] = useState('')
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [expandedTitles, setExpandedTitles] = useState<Record<string, boolean>>({})

  const handleGenerate = async () => {
    if (!industry.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/industry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: industry.trim(), product: product.trim(), targetCustomer: target.trim() }),
      })
      const data = await res.json()
      if (res.ok) setResult(data)
      else setError(data.error || '生成失败')
    } catch { setError('网络错误') }
    finally { setLoading(false) }
  }

  const copyAll = () => {
    if (!result) return
    let text = `行业：${result.industry}\n风格：${COACH_NAMES[result.coach] || '纪实派'}\n`
    if (result.titles) Object.entries(result.titles).forEach(([k, v]) => { text += `\n【${k}】\n${(v as string[]).join('\n')}\n` })
    if (result.tags) text += `\n标签：${result.tags.join(' ')}`
    navigator.clipboard.writeText(text)
    alert('已复制')
  }

  const categoryLabels: Record<string, string> = {
    '反问痛点': '反问痛点型', '内幕揭秘': '行业内幕揭秘型', '避坑干货': '三点干货避坑型', '案例成果': '案例成果型'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">新行业内容生成器</h1>
          <p className="text-gray-500 text-sm">输入任何行业名称，AI自动推断生成完整内容方案</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div><label className="text-sm font-medium mb-1 block">行业名称 *</label>
              <input value={industry} onChange={e => setIndustry(e.target.value)} className="input" placeholder="银发经济、宠物、家政..." /></div>
            <div><label className="text-sm font-medium mb-1 block">产品/服务</label>
              <input value={product} onChange={e => setProduct(e.target.value)} className="input" placeholder="老年智能设备" /></div>
            <div><label className="text-sm font-medium mb-1 block">目标客户</label>
              <input value={target} onChange={e => setTarget(e.target.value)} className="input" placeholder="60岁以上居家老人" /></div>
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button onClick={handleGenerate} disabled={loading || !industry.trim()}
            className="btn-primary flex items-center gap-2">
            {loading ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> AI生成中...</> : <><FiZap className="w-4 h-4" /> 生成行业内容包</>}
          </button>
        </div>

        {result && (
          <div className="space-y-6">
            {/* 头部信息 */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                  <FiTag className="w-6 h-6 text-brand-400" />
                </div>
                <div>
                  <p className="text-xl font-bold">{result.industry}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded font-medium">{COACH_NAMES[result.coach] || '纪实派'}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{result.archetype || '通用'}</span>
                  </div>
                </div>
              </div>
              <button onClick={copyAll} className="btn-outline text-sm flex items-center gap-1"><FiCopy className="w-3 h-3" />复制全部</button>
            </div>

            {/* 标题 */}
            {result.titles && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="font-semibold mb-4">爆款标题（20条）</h2>
                <div className="space-y-4">
                  {Object.entries(result.titles).map(([cat, titles]) => (
                    <div key={cat}>
                      <p className="text-sm font-medium text-brand-400 mb-2">{categoryLabels[cat] || cat}</p>
                      <div className="space-y-1.5">
                        {(titles as string[]).map((t, i) => (
                          <p key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{t}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 痛点 */}
            {result.painPoints && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="font-semibold mb-4">用户痛点（50条）</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {result.painPoints.provider && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">从业者痛点</p>
                      <div className="space-y-1">
                        {(result.painPoints.provider as string[]).slice(0, 8).map((p: string, i: number) => (
                          <p key={i} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">{p}</p>
                        ))}
                        <p className="text-xs text-gray-400">...共{(result.painPoints.provider as string[]).length}条</p>
                      </div>
                    </div>
                  )}
                  {result.painPoints.consumer && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">消费者痛点</p>
                      <div className="space-y-1">
                        {(result.painPoints.consumer as string[]).slice(0, 8).map((p: string, i: number) => (
                          <p key={i} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">{p}</p>
                        ))}
                        <p className="text-xs text-gray-400">...共{(result.painPoints.consumer as string[]).length}条</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 标签 */}
            {result.tags && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="font-semibold mb-3">推荐标签</h2>
                <div className="flex flex-wrap gap-2">
                  {(result.tags as string[]).map((t, i) => (
                    <span key={i} className="text-xs bg-brand-50 text-brand-600 px-2.5 py-1 rounded">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 置顶脚本 */}
            {result.pinned && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="font-semibold mb-4">置顶账号方案</h2>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <p className="text-xs text-gray-400 mb-1">人设简介</p>
                    <p className="text-sm">{result.pinned.bio}</p>
                  </div>
                  {result.pinned.intro && (
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <p className="text-xs text-gray-400 mb-1">自我介绍</p>
                      <p className="text-sm">{result.pinned.intro}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <p className="text-xs text-gray-400 mb-1">实力展示</p>
                    <p className="text-sm">{result.pinned.strength}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <p className="text-xs text-gray-400 mb-1">引流福利</p>
                    <p className="text-sm">{result.pinned.lead}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 时令选题 */}
            {result.seasonal && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="font-semibold mb-3"><FiCalendar className="w-4 h-4 inline mr-1 text-brand-400" />时令选题</h2>
                <div className="space-y-1.5">
                  {(result.seasonal as string[]).map((s, i) => (
                    <p key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{s}</p>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center">AI自动推断 · 基于已有行业模式匹配</p>
          </div>
        )}
      </main>
    </div>
  )
}
