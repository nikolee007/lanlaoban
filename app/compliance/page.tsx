'use client'
import { useState } from 'react'
import NavHeader from '../components/NavHeader'
import { FiAlertTriangle, FiCheck, FiSearch, FiX } from 'react-icons/fi'

const INDUSTRIES = ['通用', '生发', '装修', '餐饮', '工厂', '教育', '美业', '跨境']

export default function CompliancePage() {
  const [industry, setIndustry] = useState('通用')
  const [text, setText] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), industry, autoClean: true }),
      })
      setResult(await res.json())
    } catch {}
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">内容合规检测</h1>
          <p className="text-gray-500 text-sm">检测文案中的违禁词、极限词、导流暗语</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex gap-3 mb-4">
            <select value={industry} onChange={e => setIndustry(e.target.value)} className="input w-36">
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            className="input min-h-[160px] mb-4" placeholder="粘贴要检测的文案或脚本..." />
          <button onClick={handleCheck} disabled={loading || !text.trim()}
            className="btn-primary flex items-center gap-2">
            <FiSearch className="w-4 h-4" />{loading ? '检测中...' : '开始检测'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              {result.safe ? (
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center"><FiCheck className="w-5 h-5 text-green-500" /></div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><FiAlertTriangle className="w-5 h-5 text-red-500" /></div>
              )}
              <div>
                <p className={`font-semibold ${result.safe ? 'text-green-700' : 'text-red-700'}`}>
                  {result.safe ? '内容合规' : `发现 ${result.count} 个问题`}
                </p>
                {!result.safe && <p className="text-sm text-gray-500">{result.suggestion}</p>}
              </div>
            </div>
            {result.violations.length > 0 && (
              <div className="space-y-2 mb-4">
                {result.violations.map((v: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-red-50 rounded-lg px-4 py-2.5">
                    <FiX className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-sm text-red-700 font-medium">「{v.word}」</span>
                    <span className="text-xs text-red-500">[{v.category}]</span>
                  </div>
                ))}
              </div>
            )}
            {!result.safe && result.cleaned !== text && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">替换建议：</p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{result.cleaned}</div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
