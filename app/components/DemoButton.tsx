'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiDownload, FiCheck } from 'react-icons/fi'

const INDUSTRIES = [
  { id: 'dining', label: '餐饮' },
  { id: 'clothing', label: '服装工厂' },
  { id: 'decoration', label: '装修' },
  { id: 'auto', label: '二手车' },
  { id: 'baby', label: '母婴' },
]

export default function DemoButton() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const router = useRouter()

  const loadDemo = async (industry: string) => {
    setLoading(true)
    setShowPicker(false)
    try {
      const res = await fetch(`/api/demo?industry=${industry}`)
      const data = await res.json()
      if (data.scripts) {
        localStorage.setItem('lanlaoban_scripts', JSON.stringify(data.scripts))
        localStorage.setItem('lanlaoban_persona', JSON.stringify(data.persona || {}))
        setDone(true)
        setTimeout(() => router.push('/scripts'), 800)
      }
    } catch {}
    setLoading(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setShowPicker(!showPicker)} disabled={loading || done}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all text-gray-500">
        {done ? <FiCheck className="w-3.5 h-3.5 text-green-500" /> : <FiDownload className="w-3.5 h-3.5" />}
        {done ? '已加载' : loading ? '加载中' : '演示'}
      </button>
      {showPicker && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-50 min-w-[140px]">
          <p className="text-xs text-gray-400 px-2 py-1">选择行业加载演示数据</p>
          {INDUSTRIES.map(ind => (
            <button key={ind.id} onClick={() => loadDemo(ind.id)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-colors">
              {ind.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
