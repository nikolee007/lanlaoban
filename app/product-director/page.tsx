'use client'
import Link from 'next/link'
import { FiArrowRight, FiCheck, FiCamera, FiGlobe, FiGrid, FiImage, FiFilm, FiZap, FiStar, FiPackage, FiAward } from 'react-icons/fi'
import NavHeader from '../components/NavHeader'

export default function ProductDirectorPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0B]">
      <NavHeader />

      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-[#2563EB]/8 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gradient-radial from-[#2563EB]/5 to-transparent blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2563EB]/20 bg-[#2563EB]/5 px-4 py-1.5 text-sm font-medium text-[#2563EB] mb-6">
              <FiCamera className="w-4 h-4" /> AI 产品导演
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
              让 AI 帮你<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#60A5FA]">拍出产品大片</span>
            </h1>
            <p className="text-lg text-[#6B7280] max-w-xl leading-relaxed mb-10">
              上传产品图，选个风格，AI 自动生成30s+精品宣传短片。同步输出广告配图，支持多语言多画幅衍生，一套素材打全球。
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/brand-promotion" className="group inline-flex items-center gap-3 rounded-full bg-[#2563EB] text-white px-8 py-4 text-base font-semibold shadow-lg shadow-[#2563EB]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                开始制作 <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/pricing" className="group inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-8 py-4 text-base font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all">
                查看定价
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Three ways */}
      <section className="bg-[#FAFAFA] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-[3px] mb-3 text-center">THREE WAYS</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-4">三种方式，总有一种适合你</h2>
          <p className="text-[#6B7280] text-center max-w-lg mx-auto mb-14">不懂片子也没关系，选一个你熟悉的路径就行</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: FiFilm, title: '我有参考视频', desc: '上传参考视频或截图，AI自动分析风格，生成同类效果', color: '#2563EB' },
              { icon: FiImage, title: '我见过这样的', desc: '看图选风格模板，不用描述，选"这个感觉"就行', color: '#8B5CF6' },
              { icon: FiStar, title: '你来推荐吧', desc: '上传产品图+行业，AI推荐最佳风格，预览3个样片再选', color: '#10B981' },
            ].map(w => (
              <div key={w.title} className="rounded-2xl border border-[#E5E7EB] bg-white p-8 sm:p-10 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{background: `${w.color}10`}}>
                  <w.icon className="w-7 h-7" style={{color: w.color}} />
                </div>
                <h4 className="text-lg font-bold mb-2">{w.title}</h4>
                <p className="text-sm text-[#6B7280] leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-[3px] mb-3 text-center">DELIVERABLES</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-16">一份母片，一套全家桶</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: FiFilm, title: '40-60s精品短片', desc: '电影级画质，多种运镜风格可选', color: '#2563EB' },
              { icon: FiImage, title: '配套AI广告图', desc: '制作母片时同步生成成套广告图片', color: '#8B5CF6' },
              { icon: FiGlobe, title: '多语言衍生', desc: '基于母片渲染中/英/日/韩等多语种版本', color: '#10B981' },
              { icon: FiGrid, title: '多画幅输出', desc: '9:16竖屏 / 1:1方屏 / 16:9横屏', color: '#FF6034' },
            ].map(d => (
              <div key={d.title} className="rounded-2xl border border-[#E5E7EB] p-8 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{background: `${d.color}10`}}>
                  <d.icon className="w-6 h-6" style={{color: d.color}} />
                </div>
                <h4 className="font-bold mb-1">{d.title}</h4>
                <p className="text-sm text-[#6B7280]">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing summary */}
      <section className="bg-[#FAFAFA] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-[3px] mb-3 text-center">PRICING</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-4">三层体系</h2>
          <p className="text-[#6B7280] text-center max-w-lg mx-auto mb-14">项目包 + 会员 + 算力，按需选择</p>

          <div className="grid sm:grid-cols-3 gap-5 mb-16">
            {[
              { name: '单条零售', price: '¥4,299', features: ['40-60s母片×1', '配套AI广告图', '1轮免费微调', '商用版权'], highlight: false },
              { name: 'A包·轻量精品', price: '¥8,999', features: ['40-60s母片×3', '配套AI广告图', '1轮免费微调', '12个月有效'], highlight: true },
              { name: 'C包·批量精品', price: '¥23,999', features: ['40-60s母片×10', '配套AI广告图', '1轮免费微调', '12个月有效'], highlight: false },
            ].map(p => (
              <div key={p.name} className={`rounded-2xl border p-8 transition-all hover:-translate-y-1 ${p.highlight ? 'border-[#2563EB]/30 shadow-lg bg-white' : 'border-[#E5E7EB] bg-white'}`}>
                <h4 className="text-lg font-bold mb-1">{p.name}</h4>
                <p className="text-3xl sm:text-4xl font-bold mb-6">{p.price}</p>
                <ul className="space-y-3 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#6B7280]">
                      <FiCheck className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="block text-center rounded-full border border-[#E5E7EB] py-3 text-sm font-semibold hover:border-[#2563EB]/30 hover:text-[#2563EB] transition-all">
                  了解详情
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-[#6B7280] mb-2">会员享折扣+月赠算力 · 算力充值包用于衍生渲染</p>
            <Link href="/pricing" className="inline-flex items-center gap-2 text-[#2563EB] font-semibold text-sm hover:underline">
              查看完整定价体系 <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center text-white">
          <FiZap className="w-10 h-10 mx-auto mb-6" />
          <h2 className="text-4xl font-bold tracking-tight mb-4">¥1,299 体验产品小样</h2>
          <p className="text-white/80 max-w-md mx-auto mb-8">精简预览样片+效果图，满意再上正式项目</p>
          <Link href="#" className="inline-flex items-center gap-2 rounded-full bg-white text-[#0A0A0B] px-8 py-4 text-base font-semibold hover:shadow-xl transition-all">
            立即体验 <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="bg-[#0A0A0B] text-white/50 py-12 px-6 text-sm text-center">
        <p>© 2026 懒老板 — AI 产品导演</p>
      </footer>
    </div>
  )
}
