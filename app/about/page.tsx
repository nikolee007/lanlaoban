'use client'
import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'
import { FiArrowRight, FiCheck } from 'react-icons/fi'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0B]">
      <NavHeader />

      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-[#FF6034]/8 to-transparent blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[3px] mb-3">ABOUT</p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">关于懒老板</h1>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            10年操盘经验 + AI能力，帮老板们做好IP，拍好产品。
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-[#FFF8F5] to-white border border-[#FF6034]/10 p-12 sm:p-16 text-center">
          <p className="text-2xl sm:text-3xl font-bold leading-relaxed text-[#FF6034] mb-6">
            让每个老板都能拥有自己的AI操盘手
          </p>
          <p className="text-[#6B7280] leading-relaxed max-w-2xl mx-auto">
            懒老板不是又一个AI视频工具。我们的核心是一套经过10年验证的IP操盘方法论，把它蒸馏成AI，让每个老板都能用操盘手级别的策略做IP、拍产品。
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0A0A0B] text-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { val: '10年+', label: '操盘经验' },
              { val: '500+', label: '成功案例' },
              { val: '99%', label: '客户满意度' },
              { val: '∞', label: 'AI迭代进化' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-4xl sm:text-5xl font-bold tracking-tight text-[#FF6034] mb-1">{s.val}</div>
                <div className="text-sm text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core values */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[3px] mb-3">PHILOSOPHY</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">我们相信</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { title: '操盘手思维', desc: '不是教你怎么用工具，是把10年操盘手的策略方法变成AI，直接帮你做决策、出内容。' },
            { title: '结果导向', desc: '不卖功能，卖结果。每月的产出直接体现在播放量、询盘量、转化率上。' },
            { title: 'AI驱动人力', desc: '重复的创作工作交给AI，你只做你最擅长的事——做好你的生意。' },
          ].map(v => (
            <div key={v.title} className="rounded-2xl border border-[#E5E7EB] p-8 sm:p-10 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-[#FF6034]/10 flex items-center justify-center mb-5">
                <FiCheck className="w-5 h-5 text-[#FF6034]" />
              </div>
              <h3 className="text-xl font-bold mb-3">{v.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products summary */}
      <section className="bg-[#FAFAFA] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-10 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6034]/10 to-[#FF6034]/5 flex items-center justify-center mb-5 border border-[#FF6034]/10">
                <span className="text-2xl font-bold text-[#FF6034]">IP</span>
              </div>
              <h3 className="text-xl font-bold mb-2">AI IP 操盘手</h3>
              <p className="text-sm text-[#6B7280] mb-6">做IP，持续获客。AI采访+人设策略+内容生产，月30-60条脚本持续更新你的账号。</p>
              <Link href="/ip-manager" className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF6034] hover:underline">
                了解更多 <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-10 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB]/10 to-[#2563EB]/5 flex items-center justify-center mb-5 border border-[#2563EB]/10">
                <span className="text-2xl font-bold text-[#2563EB]">PD</span>
              </div>
              <h3 className="text-xl font-bold mb-2">AI 产品导演</h3>
              <p className="text-sm text-[#6B7280] mb-6">拍产品，全球投放。上传产品图→选风格→30s+精品短片+广告配图，多语言多画幅衍生。</p>
              <Link href="/product-director" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:underline">
                了解更多 <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0B] text-white/50 py-12 px-6 text-sm text-center">
        <p>© 2026 懒老板 — AI IP操盘手 & AI 产品导演</p>
      </footer>
    </div>
  )
}
