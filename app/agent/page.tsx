'use client'
import { useState, useEffect } from 'react'
import NavHeader from '../components/NavHeader'
import { FiZap, FiArrowRight, FiRefreshCw, FiCopy, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi'

type SkillType = 'standard' | 'coldstart' | 'convert' | 'matrix' | 'optimize'

const SKILLS: { id: SkillType; name: string; desc: string }[] = [
  { id: 'standard', name: '标准短视频方案', desc: '通用变现，出 5 条脚本' },
  { id: 'coldstart', name: '冷启动破播放', desc: '新号没流量，重完播率' },
  { id: 'convert', name: '转化获客招商', desc: '引流 / 招商成交' },
  { id: 'matrix', name: '矩阵批量脚本', desc: '同主题 3 套差异化版本' },
  { id: 'optimize', name: '优化我已有脚本', desc: '改钩子、切长句、理顺转化' },
]

const GOALS = ['涨粉', '引流到店', '招商成交', '促复购']
const DURATIONS = [30, 60, 90]

interface ScriptLine { time: string; line: string; pause?: string; shot_hint?: string }
interface ScriptResult {
  video_profile?: { track?: string; account_stage?: string; goal?: string; audience?: string; duration_sec?: number; hook_3s?: string }
  scripts?: ScriptLine[]
  versions?: { variant: string; hook_3s: string; scripts: ScriptLine[]; title: string; cover: string; comment_seed: string }[]
  optimized_scripts?: ScriptLine[]
  change_notes?: string[]
  ops_materials?: { titles?: string[]; cover_copy?: string[]; comment_seeds?: string[] }
  render_params?: { persona_style?: string; speech_rate?: string; voice?: string; background?: string; subtitle_style?: string }
  ops_advice?: { distribution?: string; notes?: string[] }
}

export default function AgentPage() {
  const [skillType, setSkillType] = useState<SkillType>('standard')
  const [industry, setIndustry] = useState('')
  const [product, setProduct] = useState('')
  const [goal, setGoal] = useState('涨粉')
  const [durationSec, setDurationSec] = useState(60)
  const [note, setNote] = useState('')
  const [originalScript, setOriginalScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ScriptResult | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null)

  // 数据飞轮：记录商家对生成方案的反馈（采纳/爆款/未用）
  const sendFeedback = async (fb: 'adopt' | 'bomb' | 'unused') => {
    try {
      await fetch('/api/agent/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'agent',
          industry: industry || undefined,
          contentSummary: result?.video_profile?.hook_3s || result?.video_profile?.track || 'agent-script',
          feedback: fb,
        }),
      })
      setFeedbackSent(fb)
    } catch {}
  }

  // 预填商家画像（不用重填）
  useEffect(() => {
    fetch('/api/ip-profile')
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && d.data) {
          if (d.data.industry) setIndustry(d.data.industry)
          if (d.data.product) setProduct(d.data.product)
          setProfileLoaded(true)
        }
      })
      .catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (skillType === 'optimize' && !originalScript.trim()) {
      setError('请粘贴要优化的脚本')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    setFeedbackSent(null)
    try {
      const res = await fetch('/api/agent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillType, industry, product, goal, durationSec, note, originalScript }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || '生成失败')
      setResult(data.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败')
    } finally {
      setLoading(false)
    }
  }

  const copyAll = () => {
    if (!result) return
    const lines = result.scripts || result.optimized_scripts || []
    const text = lines.map((s) => `[${s.time}] ${s.line}${s.pause ? ` (${s.pause})` : ''}`).join('\n')
    navigator.clipboard.writeText(text)
    alert('已复制脚本到剪贴板')
  }

  const renderScripts = (scripts: ScriptLine[]) => (
    <div className="space-y-2">
      {scripts.map((s, i) => (
        <div key={i} className="bg-gray-50 rounded-xl border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">{s.time}</span>
            {s.shot_hint && <span className="text-xs text-gray-500">{s.shot_hint}</span>}
            {s.pause && <span className="text-xs text-gray-400 font-mono">{s.pause === '/' ? '短停顿' : '长停顿'}</span>}
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">{s.line}</p>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FiZap className="text-brand-400" /> AI 短视频工作台
          </h1>
          <p className="text-gray-500 text-sm mt-1">专属运营编导 · 越用越懂你。选场景，填最少信息，一键出稿。</p>
        </div>

        {/* Step 1 · 场景直选 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <p className="text-sm font-semibold mb-3">① 选场景</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SKILLS.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSkillType(s.id); setResult(null) }}
                className={`text-left rounded-xl border p-3 transition-all ${skillType === s.id
                  ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-400'
                  : 'border-gray-100 hover:border-gray-200'}`}
              >
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 · 极简表单 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <p className="text-sm font-semibold mb-3">② 填最少信息 {profileLoaded && <span className="text-xs text-green-600 font-normal">· 已自动带入你的画像</span>}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-gray-500">行业</span>
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="如：餐饮 / 美业 / 工厂" className="input mt-1" />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500">主营 / 产品</span>
              <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="如：湘菜馆，招牌剁椒鱼头" className="input mt-1" />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500">视频目标</span>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} className="input mt-1">
                {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-gray-500">时长</span>
              <select value={durationSec} onChange={(e) => setDurationSec(Number(e.target.value))} className="input mt-1">
                {DURATIONS.map((d) => <option key={d} value={d}>{d} 秒</option>)}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs text-gray-500">一句话补充（选填）</span>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="如：主打家庭聚餐，想突出食材新鲜" className="input mt-1" />
            </label>
            {skillType === 'optimize' && (
              <label className="block sm:col-span-2">
                <span className="text-xs text-gray-500">待优化脚本</span>
                <textarea value={originalScript} onChange={(e) => setOriginalScript(e.target.value)} rows={4} placeholder="粘贴你现有的脚本，AI 会重构钩子、切长句、理顺转化" className="input mt-1" />
              </label>
            )}
          </div>
          <button onClick={handleGenerate} disabled={loading}
            className="mt-4 w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><FiRefreshCw className="w-4 h-4 animate-spin" /> 生成中…</> : <><FiZap className="w-4 h-4" /> 一键生成<FiArrowRight className="w-4 h-4" /></>}
          </button>
          {error && <p className="mt-3 text-sm text-red-500 flex items-center gap-1"><FiAlertCircle /> {error}</p>}
        </div>

        {/* Step 3 · 结果 */}
        {result && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold flex items-center gap-2"><FiCheckCircle className="text-green-500" /> 生成结果</p>
              <button onClick={copyAll} className="btn-outline text-xs"><FiCopy className="w-3 h-3 mr-1" />复制脚本</button>
            </div>

            {result.video_profile && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700">
                  {[result.video_profile.track, result.video_profile.account_stage, result.video_profile.goal, result.video_profile.audience].filter(Boolean).join(' · ')}
                  {result.video_profile.duration_sec ? ` · ${result.video_profile.duration_sec}s` : ''}
                </p>
                <p className="text-sm mt-2"><span className="font-medium">3秒钩子：</span>{result.video_profile.hook_3s}</p>
              </div>
            )}

            {result.scripts && (
              <>
                <p className="text-sm font-medium mb-2 flex items-center gap-1"><FiClock className="text-brand-400" /> 数字人口播脚本</p>
                {renderScripts(result.scripts)}
              </>
            )}

            {result.optimized_scripts && (
              <>
                <p className="text-sm font-medium mb-2">优化后脚本</p>
                {renderScripts(result.optimized_scripts)}
                {result.change_notes && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="text-xs font-medium text-amber-700 mb-1">关键修改思路</p>
                    {result.change_notes.map((n, i) => <p key={i} className="text-xs text-amber-700/80">{n}</p>)}
                  </div>
                )}
              </>
            )}

            {result.versions && (
              <>
                <p className="text-sm font-medium mb-2">矩阵 3 版本</p>
                <div className="space-y-4">
                  {result.versions.map((v, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4">
                      <p className="text-sm font-semibold mb-1">{v.variant}</p>
                      <p className="text-xs text-gray-400 mb-2">钩子：{v.hook_3s} · 标题：{v.title}</p>
                      {renderScripts(v.scripts)}
                    </div>
                  ))}
                </div>
              </>
            )}

            {result.ops_materials && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-medium text-gray-500 mb-1">运营配套</p>
                {!!result.ops_materials.titles?.length && <p className="text-xs text-gray-600">标题：{result.ops_materials.titles.join(' / ')}</p>}
                {!!result.ops_materials.cover_copy?.length && <p className="text-xs text-gray-600 mt-1">封面：{result.ops_materials.cover_copy.join(' / ')}</p>}
                {!!result.ops_materials.comment_seeds?.length && <p className="text-xs text-gray-600 mt-1">评论预埋：{result.ops_materials.comment_seeds.join(' / ')}</p>}
              </div>
            )}

            {result.render_params && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-medium text-gray-500 mb-1">数字人渲染建议</p>
                <p className="text-xs text-gray-600">
                  {[result.render_params.persona_style, result.render_params.speech_rate && `语速${result.render_params.speech_rate}`, result.render_params.voice && `音色:${result.render_params.voice}`].filter(Boolean).join(' · ')}
                </p>
                {result.render_params.background && <p className="text-xs text-gray-600 mt-0.5">背景：{result.render_params.background}</p>}
              </div>
            )}

            {result.ops_advice && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-medium text-gray-500 mb-1">操盘建议</p>
                {result.ops_advice.distribution && <p className="text-xs text-gray-600">投放：{result.ops_advice.distribution}</p>}
                {result.ops_advice.notes?.map((n, i) => <p key={i} className="text-xs text-gray-600 mt-0.5">· {n}</p>)}
              </div>
            )}

            {/* 数据飞轮：反馈 */}
            {!feedbackSent ? (
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-400 mr-1">这份方案你觉得？</span>
                <button onClick={() => sendFeedback('adopt')} className="px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100 transition-colors">采纳用</button>
                <button onClick={() => sendFeedback('bomb')} className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-medium hover:bg-orange-100 transition-colors">爆款潜力</button>
                <button onClick={() => sendFeedback('unused')} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium hover:bg-gray-200 transition-colors">不用</button>
              </div>
            ) : (
              <p className="mt-4 pt-4 border-t border-gray-100 text-xs text-green-600">已记录你的反馈，懒老板会越用越懂你 ✦</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
