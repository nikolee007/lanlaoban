'use client'
import { useState } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiUser, FiCheck, FiArrowRight, FiZap } from 'react-icons/fi'

const COACHES = [
  { value: 'libazi', label: '纪实派·真诚人设', desc: '22-26s · 全品类通用', emoji: '纪实' },
  { value: 'boge', label: '烟火派·同城共情', desc: '25-30s · 餐饮同城', emoji: '烟火' },
  { value: 'zhuge', label: '认知派·高客单逻辑', desc: '28-35s · 家装建材', emoji: '认知' },
  { value: 'geng', label: '工业派·B端采购', desc: '20-25s · 工厂制造', emoji: '工业' },
]

export default function PersonaPage() {
  const [industry, setIndustry] = useState('')
  const [product, setProduct] = useState('')
  const [targetCustomer, setTargetCustomer] = useState('')
  const [years, setYears] = useState('')
  const [coach, setCoach] = useState('libazi')
  const [pain1, setPain1] = useState('')
  const [pain2, setPain2] = useState('')
  const [pain3, setPain3] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry, product, targetCustomer, years: parseInt(years), style: coach, pains: [pain1, pain2, pain3] }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('lanlaoban_persona', JSON.stringify(data.persona))
        localStorage.setItem('lanlaoban_coach', coach)
        localStorage.setItem('lanlaoban_persona_source', JSON.stringify({ industry, product, targetCustomer, years, pain1, pain2, pain3 }))
        setResult(data.persona)
      } else setError(data.error || '生成失败')
    } catch { setError('网络错误') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">懒</div>
            <span className="text-xl font-bold">懒老板</span>
          </Link>
          <span className="text-sm text-gray-400">| 人设生成</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">AI 人设方案生成</h1>
        <p className="text-gray-500 mb-8">填写你的行业信息，AI 自动生成完整的人设方案</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">行业名称</label><input value={industry} onChange={e => setIndustry(e.target.value)} className="input" placeholder="如：服装批发" required /></div>
            <div><label className="block text-sm font-medium mb-1">主营产品</label><input value={product} onChange={e => setProduct(e.target.value)} className="input" placeholder="如：男士T恤" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">从业年限</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className="input" placeholder="如：18" required /></div>
            <div><label className="block text-sm font-medium mb-1">核心客群</label>
              <select value={targetCustomer} onChange={e => setTargetCustomer(e.target.value)} className="input">
                {['B端经销商', '本地C端客户', '加盟商', '工程单'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">IP风格（按行业智能推荐）</label>
            <div className="grid grid-cols-2 gap-2">
              {COACHES.map(c => (
                <button key={c.value} type="button" onClick={() => setCoach(c.value)}
                  className={`rounded-lg border-2 p-3 text-left transition-all text-sm ${coach === c.value ? 'bg-brand-50 border-brand-400' : 'border-gray-100 hover:border-gray-200'}`}>
                  <span className="font-semibold">{c.label}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div><label className="block text-sm font-medium mb-1">行业痛点（客户最怕的3个坑）</label>
            <input value={pain1} onChange={e => setPain1(e.target.value)} className="input mb-2" placeholder="坑1" />
            <input value={pain2} onChange={e => setPain2(e.target.value)} className="input mb-2" placeholder="坑2" />
            <input value={pain3} onChange={e => setPain3(e.target.value)} className="input" placeholder="坑3" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">{loading ? '生成中...' : <><FiZap className="w-4 h-4" /> AI生成人设方案</>}</button>
        </form>

        {result && (
          <div className="mt-8 space-y-6">
            <div className="card"><h3 className="font-semibold mb-3">推荐昵称</h3><p className="text-brand-400 text-lg font-bold">{result.nickname}</p></div>
            <div className="card"><h3 className="font-semibold mb-3">Slogan</h3><p>{result.slogan}</p></div>
            <div className="card"><h3 className="font-semibold mb-3">人设简介（4行模板）</h3><pre className="whitespace-pre-wrap text-sm text-gray-600">{result.bio}</pre></div>
            <div className="card"><h3 className="font-semibold mb-3">自我介绍脚本</h3><p className="text-sm text-gray-700 leading-relaxed">{result.intro}</p></div>
            <Link href="/generate" className="btn-primary flex items-center justify-center gap-2">
              <FiZap className="w-4 h-4" /> 基于此方案生成完整脚本 <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
