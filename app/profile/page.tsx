'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiUser, FiZap, FiCopy, FiCheck, FiRefreshCw, FiCamera, FiCalendar, FiEdit3, FiImage } from 'react-icons/fi'

interface ProfileData {
  nickname: string
  bio: string
  slogan: string
  altBios: string[]
  altSlogans: string[]
  pinTitles: string[]
}

const COACH_LABELS: Record<string, string> = { libazi: '纪实派', boge: '烟火派', zhuge: '认知派', geng: '工业派' }

export default function ProfilePage() {
  const [persona, setPersona] = useState<any>(null)
  const [coach, setCoach] = useState('libazi')
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const p = localStorage.getItem('lanlaoban_persona')
    if (p) { try { setPersona(JSON.parse(p)) } catch {} }
    const c = localStorage.getItem('lanlaoban_coach')
    if (c) setCoach(c)
    const src = localStorage.getItem('lanlaoban_persona_source')
    if (src) { generateProfile(JSON.parse(src)) }
  }, [])

  const generateProfile = async (source?: any) => {
    setLoading(true)
    try {
      const src = source || JSON.parse(localStorage.getItem('lanlaoban_persona_source') || '{}')
      const res = await fetch('/api/generate/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: src.industry || '',
          product: src.product || '',
          targetCustomer: src.targetCustomer || '',
          years: src.years || 0,
          name: persona?.nickname?.replace(/[的店馆厂].*$/, '') || '老王',
          coach,
        }),
      })
      const data = await res.json()
      if (data.profile) setProfile(data.profile)
    } catch {}
    setLoading(false)
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAll = () => {
    if (!profile) return
    const text = `昵称：${profile.nickname}\n简介：${profile.bio}\nSlogan：${profile.slogan}\n\n置顶视频标题：\n1. ${profile.pinTitles[0]}\n2. ${profile.pinTitles[1]}\n3. ${profile.pinTitles[2]}`
    handleCopy(text, 'all')
  }

  if (!persona) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavHeader />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">还没有生成人设</h2>
          <p className="text-gray-500 mb-6">先去创建人设方案，再来查看账主页方案</p>
          <Link href="/persona" className="btn-primary">生成人设方案</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">账主页方案</h1>
            <p className="text-sm text-gray-400">昵称 · 简介 · Slogan · 置顶3条</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => generateProfile()} disabled={loading} className="btn-outline text-sm">
              <FiRefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />重新生成
            </button>
            {profile && (
              <button onClick={copyAll} className="btn-primary text-sm">
                <FiCopy className="w-3 h-3 mr-1" />复制全部
              </button>
            )}
          </div>
        </div>

        {loading && !profile && (
          <div className="card py-16 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">AI 正在生成账主页方案...</p>
          </div>
        )}

        {profile && (
          <div className="space-y-8">
            {/* 手机预览 */}
            <div className="flex justify-center">
              <div className="w-72 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                {/* 模拟抖音主页头部 */}
                <div className="bg-gradient-to-r from-brand-400 to-brand-500 h-20 relative">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#FF6034' }}>
                    {profile.nickname.charAt(0)}
                  </div>
                </div>
                <div className="pt-12 pb-6 px-4 text-center">
                  <p className="font-bold text-gray-900 text-lg">{profile.nickname}</p>
                  <p className="text-xs text-gray-500 mt-1">{profile.bio}</p>
                  <p className="text-sm text-brand-400 font-medium mt-2">{profile.slogan}</p>
                  <div className="mt-4 space-y-2 text-left">
                    <p className="text-xs text-gray-400 font-medium">置顶视频</p>
                    {profile.pinTitles.map((t, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 line-clamp-1">{i + 1}. {t}</div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 px-4 py-3 flex justify-center gap-6 text-xs text-gray-400">
                  <span><span className="text-brand-400 font-bold">{COACH_LABELS[coach]}</span></span>
                  <span>{profile.altBios.length} 备选</span>
                </div>
              </div>
            </div>

            {/* 昵称 */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">抖音昵称</h3>
                <button onClick={() => handleCopy(profile.nickname, 'nickname')} className="text-xs text-brand-400 hover:text-brand-500">
                  {copied === 'nickname' ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xl font-bold text-brand-400">{profile.nickname}</p>
            </div>

            {/* 简介 */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">简介（4行模板）</h3>
                <button onClick={() => handleCopy(profile.bio, 'bio')} className="text-xs text-brand-400">
                  {copied === 'bio' ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border">{profile.bio}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.altBios.map((b, i) => (
                  <button key={i} onClick={() => { setProfile({ ...profile, bio: b }); handleCopy(b, `b${i}`) }}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors">
                    备选{i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Slogan */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Slogan</h3>
                <button onClick={() => handleCopy(profile.slogan, 'slogan')} className="text-xs text-brand-400">
                  {copied === 'slogan' ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border">{profile.slogan}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.altSlogans.map((s, i) => (
                  <button key={i} onClick={() => { setProfile({ ...profile, slogan: s }); handleCopy(s, `s${i}`) }}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors">
                    备选{i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* 置顶3条 */}
            <div className="card">
              <h3 className="font-semibold mb-3">置顶视频标题（3条）</h3>
              <div className="space-y-2">
                {profile.pinTitles.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border">
                    <span className="w-6 h-6 rounded-full bg-brand-400 text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <p className="text-sm text-gray-700 flex-1">{t}</p>
                    <button onClick={() => handleCopy(t, `pin${i}`)} className="text-xs text-brand-400 shrink-0">
                      {copied === `pin${i}` ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 导航 */}
            <div className="flex gap-3 pt-4">
              <Link href="/scripts" className="btn-primary flex-1 text-center"><FiEdit3 className="w-4 h-4 mr-1 inline" />去生成脚本</Link>
              <Link href="/generate" className="btn-outline flex-1 text-center"><FiZap className="w-4 h-4 mr-1 inline" />重新生成</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
