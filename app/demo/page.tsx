'use client'
import { useState } from 'react'
import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'
import Breadcrumb from '@/app/components/Breadcrumb'
import { FiUser, FiImage, FiFileText, FiVideo, FiArrowRight, FiCopy } from 'react-icons/fi'
import { useToast } from '@/app/contexts/ToastContext'

// 真实示例：服装主理人口播视频的真实转写文案（从成片提取的音频转文字）
const DEMO_SCRIPT = {
  hook: '这件复古珍珠衫，真的是通勤党必备',
  title: '珍珠衫 · 通勤穿搭讲解（成片真实口播）',
  lines: [
    '这件复古珍珠衫，真的是通勤党必备。',
    '经典 V 领的版型设计，让我们的颈部线条更加流畅。',
    '而且上手非常柔软轻盈，咱们穿 T 恤也不会觉得勒。',
    '尤其是大码的姐妹，都可以放心穿。',
  ],
}

// 关键帧（从成片提取）
const FRAMES = ['frame-00', 'frame-01', 'frame-02', 'frame-03', 'frame-04']

export default function DemoPage() {
  const { showToast } = useToast()
  const [copied, setCopied] = useState(false)

  const copyScript = () => {
    const text = DEMO_SCRIPT.hook + '\n' + DEMO_SCRIPT.lines.map(l => l.replace(/\/\//g, '，')).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      showToast('文案已复制', 'success')
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => showToast('复制失败', 'error'))
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
        <Breadcrumb items={[{ label: '懒老板', href: '/' }, { label: '效果体验 Demo' }]} />
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        {/* Hero */}
        <div className="text-center py-10">
          <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[3px] mb-3">REAL DEMO</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">看看你的老板视频是怎么做出来的</h1>
          <p className="text-gray-500 max-w-lg mx-auto">一张照片，懒老板帮你生成克隆分身 → 关键帧 → 文案 → 口播视频。下面是真实产出的示例。</p>
        </div>

        {/* 四步流程展示 */}
        <div className="space-y-8">
          {/* ① 老板 IP 人物 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF6034]/10 flex items-center justify-center"><FiUser className="w-4 h-4 text-[#FF6034]" /></div>
              <h2 className="font-semibold">① 老板 IP 人物</h2>
              <span className="text-xs text-gray-400 ml-auto">一张照片 → 老板克隆分身</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 items-center">
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/videos/posters/digital-服装主理人.jpg" alt="老板形象" className="w-40 h-52 object-cover rounded-xl border border-gray-200 mx-auto" />
                <p className="text-xs text-gray-400 mt-2">老板本人生成 · 可换服装/场景</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-2">上传 1-3 张本人照片，AI 生成你的克隆分身：</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li>· 脸像本人（非第三方数字人）</li>
                  <li>· 可多形象进「克隆人库」</li>
                  <li>· 产品可视化宣传图</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ② 关键帧 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF6034]/10 flex items-center justify-center"><FiImage className="w-4 h-4 text-[#FF6034]" /></div>
              <h2 className="font-semibold">② 关键帧</h2>
              <span className="text-xs text-gray-400 ml-auto">从成片提取 3-6 帧</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {FRAMES.map((f, i) => (
                <div key={f} className="relative aspect-[9/16] rounded-xl overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/demo/frames/${f}.jpg`} alt={`关键帧${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">成片中的关键时刻，一屏看清视频内容。</p>
          </section>

          {/* ③ 生成文案 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF6034]/10 flex items-center justify-center"><FiFileText className="w-4 h-4 text-[#FF6034]" /></div>
              <h2 className="font-semibold">③ 生成文案</h2>
              <button onClick={copyScript} className="ml-auto text-xs text-[#FF6034] hover:underline inline-flex items-center gap-1"><FiCopy className="w-3 h-3" />{copied ? '已复制' : '复制文案'}</button>
            </div>
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-[#FF6034] font-semibold text-sm mb-2">{DEMO_SCRIPT.hook}</p>
              <p className="text-xs text-gray-400 mb-3">标题：{DEMO_SCRIPT.title}</p>
              <div className="space-y-2">
                {DEMO_SCRIPT.lines.map((line, i) => (
                  <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          </section>

          {/* ④ 生成视频 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF6034]/10 flex items-center justify-center"><FiVideo className="w-4 h-4 text-[#FF6034]" /></div>
              <h2 className="font-semibold">④ 生成视频</h2>
              <span className="text-xs text-gray-400 ml-auto">老板口播 · 会说话有姿态</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 items-center">
              <video src="/videos/digital-服装主理人.mp4" poster="/videos/posters/digital-服装主理人.jpg"
                controls className="w-full aspect-[3/4] object-cover rounded-xl border border-gray-200 bg-black" />
              <div>
                <p className="text-sm text-gray-700 mb-3">懒老板 AI 生成的老板口播视频：</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li>· 克隆分身 + 口播配音</li>
                  <li>· 支持多行业、5 类内容类型</li>
                  <li>· 视频发你邮箱，批量持续产出</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-[#FF6034] to-[#E04A1E] rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">你的店，也能做出这样的老板视频</h2>
          <p className="text-white/80 mb-6">上传照片，懒老板从文案到成片一条龙，发你邮箱</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-white text-[#0A0A0B] px-8 py-3 font-semibold hover:shadow-xl transition-all">
              开始体验 <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
