'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiCamera, FiImage, FiUpload, FiDownload, FiUser, FiGrid, FiZap, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi'

interface ShotItem {
  time: string; duration: string; script: string; shotType: string
  bg: { name: string; desc: string }
  pose: { type: string; url: string; label: string }
  camera: string; subtitle: string
}

interface StoryboardItem {
  title: string; id: string; duration: string; shots: ShotItem[]
}

export default function StoryboardPage() {
  const [scripts, setScripts] = useState<any[]>([])
  const [coach, setCoach] = useState('libazi')
  const [industry, setIndustry] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [storyboard, setStoryboard] = useState<StoryboardItem[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const s = localStorage.getItem('lanlaoban_scripts') || localStorage.getItem('lanlaoban_scripts_long')
    if (s) { try { setScripts(JSON.parse(s).slice(0, 6)) } catch {} }
    const c = localStorage.getItem('lanlaoban_coach')
    if (c) setCoach(c)
    const src = localStorage.getItem('lanlaoban_persona_source')
    if (src) { try { setIndustry(JSON.parse(src).industry || '') } catch {} }
  }, [])

  const generate = async () => {
    if (scripts.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/digital-human', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scripts: scripts.slice(0, 6),
          industry: industry || '通用',
          photos,
        }),
      })
      const data = await res.json()
      if (data.storyboard) setStoryboard(data.storyboard)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { if (scripts.length > 0) generate() }, [scripts.length])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => setPhotos(prev => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
  }

  const shotColors: Record<string, string> = { '近景口播': 'bg-blue-50 border-blue-200', '纪实行走': 'bg-amber-50 border-amber-200', '产品特写': 'bg-green-50 border-green-200', '固定机位': 'bg-purple-50 border-purple-200' }

  if (scripts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavHeader />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <FiCamera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">还没有生成脚本</h2>
          <p className="text-gray-500 mb-6">先去生成内容，再来制作数字人故事板</p>
          <Link href="/generate" className="btn-primary">去生成脚本</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">故事板 · 照片驱动</h1>
            <p className="text-gray-500 text-sm">上传照片或使用模板，AI自动匹配生成逐镜拍摄方案</p>
          </div>
          <button onClick={generate} disabled={loading} className="btn-outline text-sm flex items-center gap-1">
            <FiRefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />重新生成
          </button>
        </div>

        {/* 照片上传 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><FiImage className="text-brand-400" /> 你的照片（选传）</h3>
          <div className="flex gap-3 items-center">
            <button onClick={() => fileRef.current?.click()} className="btn-outline text-sm flex items-center gap-1.5">
              <FiUpload className="w-4 h-4" />上传照片
            </button>
            <p className="text-xs text-gray-400">建议3-5张真人正面照，背景干净自然光</p>
          </div>
          {photos.length > 0 && (
            <div className="flex gap-2 mt-3">
              {photos.map((p, i) => (
                <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                  <img src={p} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
        </div>

        {/* 故事板网格 */}
        {storyboard.length > 0 && (
          <div className="space-y-6">
            {storyboard.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{item.id.toUpperCase()}</span>
                    <span className="font-medium text-sm">{item.title}</span>
                    <span className="text-xs text-gray-400">{item.duration} · {item.shots.length}个镜头</span>
                  </div>
                  {expanded === item.id ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                </button>

                {expanded === item.id && (
                  <div className="px-5 pb-5 border-t pt-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {item.shots.map((shot, i) => {
                        const colorClass = shotColors[shot.shotType] || 'bg-gray-50 border-gray-200'
                        return (
                          <div key={i} className={`rounded-xl border-2 p-4 ${colorClass}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono bg-white px-1.5 py-0.5 rounded font-bold">{shot.time}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                shot.shotType === '近景口播' ? 'bg-blue-100 text-blue-700' :
                                shot.shotType === '纪实行走' ? 'bg-amber-100 text-amber-700' :
                                'bg-green-100 text-green-700'
                              }`}>{shot.shotType}</span>
                            </div>

                            {/* 模拟画面框 */}
                            <div className="aspect-video bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden border border-gray-200">
                              {shot.pose.type === 'user_photo' ? (
                                <img src={shot.pose.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <div className="text-center p-4">
                                  <FiUser className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                                  <p className="text-xs text-gray-400">{shot.pose.label}</p>
                                  <p className="text-[10px] text-gray-300 mt-0.5">{shot.bg.desc}</p>
                                </div>
                              )}
                            </div>

                            <p className="text-xs text-gray-500 mb-1">{shot.bg.name} | {shot.camera}</p>
                            <p className="text-xs text-gray-700 bg-white/80 rounded px-2 py-1 line-clamp-2">{shot.subtitle}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 导出区 */}
            <div className="bg-gradient-to-r from-brand-50 to-orange-50 rounded-xl border border-brand-100 p-5 text-center">
              <p className="text-sm text-gray-600 mb-3">总 {storyboard.reduce((s, v) => s + v.shots.length, 0)} 个镜头 · 约 {storyboard.length * 25} 秒成片</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => {
                  const text = storyboard.map(item =>
                    `【${item.id.toUpperCase()}】${item.title}\n${item.shots.map(s =>
                      `  ${s.time} | ${s.shotType} | ${s.bg.name} | ${s.camera}\n     "${s.subtitle}"`
                    ).join('\n')}`
                  ).join('\n\n---\n\n')
                  navigator.clipboard.writeText(text)
                  alert('已复制到剪贴板')
                }} className="btn-primary text-sm flex items-center gap-1"><FiDownload className="w-3 h-3" />复制全部</button>
                <Link href="/guide" className="btn-outline text-sm flex items-center gap-1"><FiCamera className="w-3 h-3" />拍摄指导</Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
