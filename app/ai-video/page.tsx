'use client'

import { useState, useEffect } from 'react'
import NavHeader from '../components/NavHeader'
import Breadcrumb from '../components/Breadcrumb'
import { useToast } from '../contexts/ToastContext'
import { FiCopy } from 'react-icons/fi'
import { INFO, SCRIPTS, aiToBlocks } from './data'
import type { VideoType, Step, ScriptBlock } from './data'
import SceneSelector from './SceneSelector'
import ScriptForm from './ScriptForm'
import VideoResult from './VideoResult'

export default function AiVideoPage() {
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>('select')
  const [vt, setVt] = useState<VideoType>('restaurant')
  const [prod, setProd] = useState('')
  const [brand, setBrand] = useState('')
  const [sell, setSell] = useState('')
  const [aiScripts, setAiScripts] = useState<ScriptBlock[] | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [industry, setIndustry] = useState('')
  const [customer, setCustomer] = useState('')
  const [years, setYears] = useState('')

  // Load IP profile from API or localStorage
  useEffect(() => {
    async function loadProfile() {
      let data: Record<string, string> | null = null
      try {
        const token = localStorage.getItem('lanlaoban_token')
        if (token) {
          const res = await fetch('/api/ip-profile', { headers: { Authorization: `Bearer ${token}` } })
          const json = await res.json()
          if (json.success && json.data) data = json.data
        }
      } catch { /* ignore */ }
      if (!data) {
        try {
          const saved = localStorage.getItem('lanlaoban_interview')
          if (saved) data = JSON.parse(saved)
        } catch { /* ignore */ }
      }
      if (data) {
        if (data.industry) setIndustry(data.industry)
        if (data.product) setProd(data.product)
        if (data.name) setBrand(data.name)
        if (data.customer) setCustomer(data.customer)
        if (data.experience || data.startYear) setYears(data.experience || data.startYear)
        if (data.sell || data.advantage) setSell(data.sell || data.advantage || '')
        const kw = (data.industry || '').toLowerCase()
        if (/餐饮|饭店|火锅|烧烤|奶茶|咖啡|小吃/.test(kw)) setVt('restaurant')
        else if (/装修|建材|家具|定制|门窗|工程|设计/.test(kw)) setVt('brand')
        else if (/工厂|加工|制造|五金|机械|工业/.test(kw)) setVt('trust')
        else if (/跨境|外贸|出口|电商/.test(kw)) setVt('crossborder')
        else if (/教育|培训|知识|咨询/.test(kw)) setVt('knowledge')
      }
    }
    loadProfile()
  }, [])

  const info = INFO[vt]
  const rawScripts = aiScripts || SCRIPTS[vt]
  const blocks: ScriptBlock[] = Array.isArray(rawScripts) && rawScripts.length > 0 && 'content' in (rawScripts[0] || {})
    ? aiToBlocks(rawScripts as unknown as { title?: string; content?: string; emotion?: string }[])
    : (SCRIPTS[vt] as ScriptBlock[])

  const pick = (t: VideoType) => {
    setVt(t); const i = INFO[t]
    setProd(i.demo); setBrand(i.brand); setSell(i.sell)
    setStep('form')
  }

  const showDemo = (t: VideoType) => {
    setVt(t); const i = INFO[t]
    setProd(i.demo); setBrand(i.brand); setSell(i.sell)
    setStep('result')
  }

  const handleAIGenerate = async () => {
    const coachMap: Record<string, string> = {
      restaurant: 'boge', trust: 'libazi', review: 'libazi',
      brand: 'zhuge', knowledge: 'libazi', crossborder: 'libazi',
    }
    setAiLoading(true); setAiError('')
    try {
      const res = await fetch('/api/generate/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: industry || info.title.replace(/[·]/g, '').split('·')[0].trim() || '餐饮',
          product: prod,
          targetCustomer: customer || '本地消费者',
          years: years || '3',
          style: coachMap[vt] || 'libazi',
        }),
      })
      const data = await res.json()
      if (data.scripts && data.scripts.length > 0) {
        setAiScripts(data.scripts)
        setStep('result')
      } else {
        setAiError(data.error || 'AI生成失败，试试默认模板')
      }
    } catch { setAiError('网络错误，请重试') }
    setAiLoading(false)
  }

  const copyAll = () => {
    const t = blocks.map(b =>
      `【${b.t0}-${b.t1}】${b.title}\n${b.line}\n ${b.shotType} | ${b.shotDesc}`
    ).join('\n\n')
    navigator.clipboard.writeText(t)
    showToast('脚本已复制，去拍摄吧！', 'success')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
        <Breadcrumb items={[{ label: '懒老板', href: '/' }, { label: 'AI 一键短视频' }]} />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
        {step === 'select' && <SceneSelector onPick={pick} onShowDemo={showDemo} />}

        {step === 'form' && (
          <ScriptForm
            vt={vt} brand={brand} setBrand={setBrand}
            industry={industry} setIndustry={setIndustry}
            prod={prod} setProd={setProd}
            customer={customer} setCustomer={setCustomer}
            years={years} setYears={setYears}
            sell={sell} setSell={setSell}
            blocks={blocks} aiLoading={aiLoading} aiError={aiError}
            onGenerate={handleAIGenerate}
            onBack={() => setStep('select')}
            onSkipToResult={() => setStep('result')}
          />
        )}

        {step === 'result' && (
          <VideoResult
            vt={vt} brand={brand} prod={prod} blocks={blocks}
            onBack={() => setStep('select')} onCopyAll={copyAll}
          />
        )}
      </div>
    </div>
  )
}
