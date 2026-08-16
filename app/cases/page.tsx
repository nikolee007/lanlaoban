'use client'
import { useState } from 'react'
import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'
import LightboxVideo from '@/app/components/LightboxVideo'
import { FiPlay, FiMail, FiCpu, FiImage } from 'react-icons/fi'
import { digitalIpCases, productCases } from '@/app/data/case-studies'

export default function CasesPage() {
  const [lightbox, setLightbox] = useState<{ src: string; poster: string; title: string } | null>(null)

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-brand-400 uppercase tracking-[3px] mb-3">REAL RESULTS</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">懒老板帮他们做到了什么</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            真实操盘 <span className="font-semibold text-brand-400">200+ IP</span> · 全网流量 <span className="font-semibold text-brand-400">10 亿+</span> · 以下是精选案例
          </p>
        </div>

        {/* 流程说明 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-10">
          <p className="text-sm font-semibold mb-4">懒老板怎么帮你（一条龙）</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <FiImage className="w-6 h-6 text-brand-400 mb-2" />
              <p className="font-medium text-sm mb-1">你给素材</p>
              <p className="text-xs text-gray-500">拍几张照片、一段口播、传产品图，聊天式采访你的店</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <FiCpu className="w-6 h-6 text-brand-400 mb-2" />
              <p className="font-medium text-sm mb-1">AI 帮你做</p>
              <p className="text-xs text-gray-500">克隆分身 → 脚本方案 → 数字人口播 → 产品可视化，批量生产</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <FiMail className="w-6 h-6 text-brand-400 mb-2" />
              <p className="font-medium text-sm mb-1">成片发你邮箱</p>
              <p className="text-xs text-gray-500">定制化短视频做好直接发邮箱，你只管发出去</p>
            </div>
          </div>
        </div>

        {/* 数字人 IP 案例墙 */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-brand-400" />
            <h2 className="text-lg font-bold">真实数字人 IP</h2>
            <span className="text-xs text-gray-400">{digitalIpCases.length} 个 · 人设口播</span>
          </div>
          <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {digitalIpCases.slice(0, 12).map(c => (
              <button key={c.name} onClick={() => setLightbox({ src: c.video, poster: c.poster, title: `${c.name} · ${c.industry}` })}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden text-left hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.poster} alt={c.name} className="w-full aspect-[3/4] object-cover" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <FiPlay className="w-5 h-5 text-brand-400 ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute top-2 left-2 text-[10px] font-semibold text-white bg-brand-400 rounded-full px-2 py-1">{c.industry}</span>
                  {c.stats && <span className="absolute top-2 right-2 text-[10px] font-semibold text-brand-400 bg-white/95 rounded-full px-2 py-1">{c.stats}</span>}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{c.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 产品案例墙 */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-blue-500" />
            <h2 className="text-lg font-bold">AI 产品宣传片</h2>
            <span className="text-xs text-gray-400">{productCases.length} 个 · 产品可视化</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productCases.map(c => (
              <button key={c.name} onClick={() => setLightbox({ src: c.video, poster: c.poster, title: `${c.name} · 产品宣传片` })}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden text-left hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.poster} alt={c.name} className="w-full aspect-video object-cover" />
                  <span className="absolute top-2 left-2 text-[10px] font-semibold text-white bg-blue-500 rounded-full px-2 py-1">{c.industry}</span>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{c.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-brand-400 to-[#E04A1E] rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">你的店，也能这样做</h2>
          <p className="text-white/80 mb-6">把拍视频的事交给懒老板，你只管做生意</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-white text-[#0A0A0B] px-8 py-3 font-semibold hover:shadow-xl transition-all">
            开始你的专属服务
          </Link>
        </div>
      </main>

      {lightbox && <LightboxVideo src={lightbox.src} poster={lightbox.poster} title={lightbox.title} onClose={() => setLightbox(null)} />}
    </div>
  )
}
