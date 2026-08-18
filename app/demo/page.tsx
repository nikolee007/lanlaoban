'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'
import Breadcrumb from '@/app/components/Breadcrumb'
import { FiUser, FiImage, FiFileText, FiVideo, FiArrowRight, FiCopy, FiLoader, FiPlay, FiX } from 'react-icons/fi'
import { useToast } from '@/app/contexts/ToastContext'
import { DEMO_GROUPS } from './data'

export default function DemoPage() {
  const { showToast } = useToast()
  const [activeGroup, setActiveGroup] = useState(0)
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [copiedKey, setCopiedKey] = useState('')
  const [lightbox, setLightbox] = useState<{ video: string; poster: string; title: string } | null>(null)

  const group = DEMO_GROUPS[activeGroup]

  // 加载当前组的转写文案
  useEffect(() => {
    group.videos.forEach(v => {
      if (texts[v.key]) return
      fetch(v.textUrl)
        .then(r => r.text())
        .then(t => { if (t) setTexts(prev => ({ ...prev, [v.key]: t })) })
        .catch(() => {})
    })
  }, [activeGroup, group, texts])

  const copyText = (key: string, text: string) => {
    if (!navigator.clipboard) { showToast('当前浏览器不支持复制', 'error'); return }
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      showToast('文案已复制', 'success')
      setTimeout(() => setCopiedKey(''), 2000)
    }).catch(() => showToast('复制失败', 'error'))
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
        <Breadcrumb items={[{ label: '懒老板', href: '/' }, { label: '效果体验 Demo' }]} />
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-16">
        {/* Hero */}
        <div className="text-center py-8">
          <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[3px] mb-3">HOW LAO LAOBAN WORKS</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">懒老板怎么把老板做成短视频 IP</h1>
          <p className="text-gray-500 max-w-lg mx-auto">五步真实制作过程：了解老板背景 → 生成脚本 → 生成关键帧 → 生成短视频，成片发你邮箱。</p>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          {DEMO_GROUPS.map((g, i) => (
            <button key={g.id} onClick={() => setActiveGroup(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeGroup === i ? 'bg-[#FF6034] text-white shadow-lg shadow-[#FF6034]/25' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#FF6034]/40'}`}>
              {g.label}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mb-6">{group.label} · {group.desc}</p>

        {/* 当前组：3 条视频 */}
        <div className="grid lg:grid-cols-3 gap-5 mb-10">
          {group.videos.map((v) => {
            const text = texts[v.key]
            const isProduct = group.id === 'product'
            return (
              <div key={v.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                {/* ① 老板 IP 形象 */}
                <div className="p-4 pb-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-4 h-4 rounded-full bg-[#FF6034] text-white text-[9px] font-bold flex items-center justify-center shrink-0">1</span>
                    <p className="text-xs font-medium text-gray-500">老板 IP 形象</p>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.poster} alt={v.title} className={`w-full object-cover ${isProduct ? 'aspect-video' : 'aspect-[3/4]'}`} />
                    <span className="absolute top-2 left-2 text-[10px] font-semibold text-white bg-[#FF6034] rounded-full px-2 py-1">{v.title}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">{isProduct ? '产品主视觉 · 克隆分身' : '克隆分身 · 可换服装/场景'}</p>
                </div>

                {/* ② 了解老板背景 */}
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-4 h-4 rounded-full bg-[#FF6034] text-white text-[9px] font-bold flex items-center justify-center shrink-0">2</span>
                    <p className="text-xs font-medium text-gray-500">了解老板背景</p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{group.background}</p>
                </div>

                {/* ③ 生成今日脚本 */}
                <div className="px-4 pb-2 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#FF6034] text-white text-[9px] font-bold flex items-center justify-center shrink-0">3</span>
                      <p className="text-xs font-medium text-gray-500">生成今日脚本</p>
                    </div>
                    {text && !isProduct && (
                      <button onClick={() => copyText(v.key, text)} className="text-xs text-[#FF6034] hover:underline inline-flex items-center gap-1">
                        <FiCopy className="w-3 h-3" />{copiedKey === v.key ? '已复制' : '复制'}
                      </button>
                    )}
                  </div>
                  {isProduct ? (
                    <p className="text-sm text-gray-700 leading-relaxed">产品可视化宣传脚本，突出产品卖点与画面质感。</p>
                  ) : text ? (
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-5">{text}</p>
                  ) : (
                    <p className="text-sm text-gray-300 flex items-center gap-2"><FiLoader className="w-3 h-3 animate-spin" /> 正在读取脚本...</p>
                  )}
                </div>

                {/* ④ 生成关键帧 */}
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-4 h-4 rounded-full bg-[#FF6034] text-white text-[9px] font-bold flex items-center justify-center shrink-0">4</span>
                    <p className="text-xs font-medium text-gray-500">生成关键帧</p>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {v.frames.map((f, fi) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={fi} src={f} alt={`帧${fi + 1}`} className={`${isProduct ? 'aspect-video' : 'aspect-[9/16]'} object-cover rounded border border-gray-100`} />
                    ))}
                  </div>
                </div>

                {/* ⑤ 生成短视频 · 点击沉浸播放 */}
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-4 h-4 rounded-full bg-[#FF6034] text-white text-[9px] font-bold flex items-center justify-center shrink-0">5</span>
                    <p className="text-xs font-medium text-gray-500">生成短视频 · 点击沉浸播放</p>
                  </div>
                  <button onClick={() => setLightbox({ video: v.video, poster: v.poster, title: v.title })}
                    className="block w-full relative rounded-xl overflow-hidden border border-gray-100 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.poster} alt={v.title} className={`w-full ${isProduct ? 'aspect-video' : 'aspect-[3/4]'} object-cover`} />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <FiPlay className="w-6 h-6 text-[#FF6034] ml-0.5" />
                      </div>
                    </div>
                  </button>
                  <p className="text-xs text-gray-400 mt-1.5">{isProduct ? '产品宣传视频' : '老板口播视频'}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#FF6034] to-[#E04A1E] rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">你的店，也能做出这样的老板视频</h2>
          <p className="text-white/80 mb-6">上传照片，懒老板从文案到成片一条龙，发你邮箱</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-white text-[#0A0A0B] px-8 py-3 font-semibold hover:shadow-xl transition-all">
            开始体验 <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* 沉浸式播放 */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white z-10" onClick={() => setLightbox(null)} aria-label="关闭">
            <FiX className="w-8 h-8" />
          </button>
          <div className="max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <video src={lightbox.video} poster={lightbox.poster} controls autoPlay playsInline
              className="w-full rounded-2xl shadow-2xl max-h-[80vh] bg-black" />
            <p className="text-center text-white/80 text-sm mt-4">{lightbox.title}</p>
          </div>
        </div>
      )}
    </div>
  )
}
