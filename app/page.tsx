'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FiArrowRight, FiUser, FiCamera, FiTrendingUp, FiPackage, FiAward, FiPlay, FiCheck, FiStar, FiShield, FiZap, FiSmile } from 'react-icons/fi'
import NavHeader from './components/NavHeader'
import VideoPlayer from './components/VideoPlayer'
import LightboxVideo from './components/LightboxVideo'
import { digitalIpCases, productCases } from './data/case-studies'

export default function HomePage() {
  const [lightbox, setLightbox] = useState<{ src: string; poster: string; title: string } | null>(null)

  return (
    <div className="min-h-screen bg-white text-[#0A0A0B] overflow-hidden">
      <NavHeader />

      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0A0A0B]">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-[#0F0B14] to-[#141018]" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-[#FF6034]/15 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-radial from-[#8B5CF6]/12 to-transparent blur-3xl" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="relative mx-auto max-w-7xl px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧主文案 */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6034]/30 bg-[#FF6034]/10 px-4 py-1.5 text-sm font-medium text-[#FF8A66] mb-8">
                <span className="w-2 h-2 rounded-full bg-[#FF6034] animate-pulse" />
                操盘 200+ IP · 全网流量 10亿+
              </div>

              {/* Hero text */}
              <h1 className="text-[56px] sm:text-[72px] lg:text-[88px] font-bold tracking-tight leading-[0.95] mb-6 text-white">
                你的 AI
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#FF6034] via-[#FF8A66] to-[#FF6034]">
                  操盘手
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/60 max-w-xl leading-relaxed mb-10">
                从IP定位到视频出片，AI帮你搞定。做IP还是拍产品，<br className="hidden sm:block" />
                懒老板一条龙交付。
              </p>

              {/* CTA */}
              <div className="flex items-center gap-4 flex-wrap">
                <Link href="#products" className="group inline-flex items-center gap-3 rounded-full bg-[#FF6034] text-white px-8 py-4 text-base font-semibold shadow-lg shadow-[#FF6034]/30 hover:shadow-xl hover:shadow-[#FF6034]/40 hover:-translate-y-0.5 transition-all duration-300">
                  选择你的方向
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#pricing" className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300">
                  查看定价
                </Link>
                <Link href="/demo" className="group inline-flex items-center gap-2 rounded-full border border-[#FF6034]/40 bg-[#FF6034]/10 backdrop-blur-sm px-8 py-4 text-base font-semibold text-[#FF8A66] hover:bg-[#FF6034]/20 hover:-translate-y-0.5 transition-all duration-300">
                  看效果 Demo
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 mt-12 pt-8 border-t border-white/10">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0A0B] bg-gradient-to-br from-[#FF6034]/30 to-[#FF6034]/50 flex items-center justify-center text-xs font-bold text-white">
                      {['王','张','李','陈'][i-1]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[1,2,3,4,5].map(i => <FiStar key={i} className="w-3.5 h-3.5 fill-[#FF6034] text-[#FF6034]" />)}
                  </div>
                  <p className="text-sm text-white/60">已操盘 <span className="font-semibold text-white">200+</span> IP · 全网 <span className="font-semibold text-white">10亿+</span> 流量</p>
                </div>
              </div>
            </div>

            {/* 右侧竖屏手机窗口 · 循环播放真实数字人 */}
            <div className="hidden lg:flex justify-center items-center relative">
              <div className="absolute w-[360px] h-[640px] rounded-[2.5rem] bg-gradient-to-br from-[#FF6034]/30 via-transparent to-[#8B5CF6]/30 blur-2xl" />
              <div className="relative w-[320px] rounded-[2rem] border border-white/15 bg-black overflow-hidden shadow-2xl shadow-[#FF6034]/20">
                <div className="relative">
                  <video
                    src="/videos/digital-服装主理人.mp4"
                    poster="/videos/posters/digital-服装主理人.jpg"
                    className="w-full aspect-[3/4] object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">@服装主理人</p>
                      <p className="text-white/60 text-xs">真实操盘 IP · 口播视频</p>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-[#FF6034] flex items-center justify-center">
                      <FiPlay className="w-4 h-4 text-white ml-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <section className="relative py-28 overflow-hidden" id="products">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-radial from-[#FF6034]/5 to-transparent blur-2xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[3px] mb-3">TWO PRODUCTS</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">你想做什么？</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* IP 操盘手 */}
            <div className="group relative rounded-3xl border border-[#E5E7EB] bg-white p-10 transition-all duration-500 hover:shadow-[0_20px_60px_-12px_rgba(255,96,52,0.2)] hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#FF6034]/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6034]/10 to-[#FF6034]/5 flex items-center justify-center mb-6 border border-[#FF6034]/10">
                  <FiUser className="w-8 h-8 text-[#FF6034]" />
                </div>
                <h3 className="text-2xl font-bold mb-2">AI IP 操盘手</h3>
                <p className="text-[#6B7280] mb-2">做IP，持续获客</p>
                <p className="text-[#6B7280] leading-relaxed mb-8 max-w-md">
                  AI采访挖掘你的故事 → 出人设策略 → 每周自动生成30-60条脚本和口播视频，持续更新你的账号。
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {['AI采访','人设定位','内容策略','月30-60条','邮箱交付'].map(t => (
                    <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] text-[#6B7280]">{t}</span>
                  ))}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280]">起</p>
                    <p className="text-4xl font-bold tracking-tight">¥199<span className="text-base font-normal text-[#6B7280]">/月</span></p>
                  </div>
                  <Link href="/interview" className="group/btn inline-flex items-center gap-2 rounded-full bg-[#FF6034] text-white px-6 py-3 text-sm font-semibold hover:shadow-lg hover:shadow-[#FF6034]/20 transition-all">
                    了解详情
                    <FiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 产品导演 */}
            <div className="group relative rounded-3xl border border-[#E5E7EB] bg-white p-10 transition-all duration-500 hover:shadow-[0_20px_60px_-12px_rgba(37,99,235,0.2)] hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#2563EB]/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB]/10 to-[#2563EB]/5 flex items-center justify-center mb-6 border border-[#2563EB]/10">
                  <FiCamera className="w-8 h-8 text-[#2563EB]" />
                </div>
                <h3 className="text-2xl font-bold mb-2">AI 产品导演</h3>
                <p className="text-[#6B7280] mb-2">拍产品，全球投放</p>
                <p className="text-[#6B7280] leading-relaxed mb-8 max-w-md">
                  上传产品图 → 选风格 → AI 生成30s+精品宣传短片，同步输出广告配图。支持多语言多画幅衍生。
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {['产品可视化','多语言','多画幅','广告配图','算力衍生'].map(t => (
                    <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] text-[#6B7280]">{t}</span>
                  ))}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280]">起</p>
                    <p className="text-4xl font-bold tracking-tight">¥4,299<span className="text-base font-normal text-[#6B7280]">/条</span></p>
                  </div>
                  <Link href="/brand-promotion" className="group/btn inline-flex items-center gap-2 rounded-full bg-[#2563EB] text-white px-6 py-3 text-sm font-semibold hover:shadow-lg hover:shadow-[#2563EB]/20 transition-all">
                    了解详情
                    <FiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 老板克隆分身 */}
            <div className="group relative rounded-3xl border border-[#E5E7EB] bg-white p-10 transition-all duration-500 hover:shadow-[0_20px_60px_-12px_rgba(139,92,246,0.25)] hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#8B5CF6]/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/10 to-[#8B5CF6]/5 flex items-center justify-center mb-6 border border-[#8B5CF6]/10">
                  <FiSmile className="w-8 h-8 text-[#8B5CF6]" />
                </div>
                <h3 className="text-2xl font-bold mb-2">老板克隆分身</h3>
                <p className="text-[#6B7280] mb-2">不出镜，也有专属出镜形象</p>
                <p className="text-[#6B7280] leading-relaxed mb-8 max-w-md">
                  上传本人照片 → AI 生成专属克隆分身 → 和产品同框出宣传图。老板不用露脸，也能持续产出内容。
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {['人脸克隆','产品可视化','不出镜出片','算力即用'].map(tag => (
                    <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] text-[#6B7280]">{tag}</span>
                  ))}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280]">算力</p>
                    <p className="text-4xl font-bold tracking-tight">¥0.5<span className="text-base font-normal text-[#6B7280]">/张</span></p>
                  </div>
                  <Link href="/clone" className="group/btn inline-flex items-center gap-2 rounded-full bg-[#8B5CF6] text-white px-6 py-3 text-sm font-semibold hover:shadow-lg hover:shadow-[#8B5CF6]/20 transition-all">
                    立即体验
                    <FiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* ── Showcase ── */}
      <section className="relative py-28 overflow-hidden bg-[#FAFAFA]" id="showcase">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[3px] mb-3 text-center">SHOWCASE</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-4">看看懒老板能做什么</h2>
          <p className="text-[#6B7280] text-center max-w-lg mx-auto mb-4">真实操盘 <span className="font-semibold text-[#FF6034]">200+ IP</span> · 全网流量 <span className="font-semibold text-[#FF6034]">10亿+</span> · 以下为精选案例</p>
          <p className="text-center mb-12"><Link href="/cases" className="inline-flex items-center gap-1 text-sm font-medium text-[#FF6034] hover:underline">查看全部真实案例 <FiArrowRight className="w-3 h-3" /></Link></p>

          {/* 数字人 IP 竖屏墙 */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 rounded-full bg-[#FF6034]" />
              <h3 className="text-lg font-bold text-[#0A0A0B]">真实数字人 IP</h3>
              <span className="text-xs text-[#6B7280]">{digitalIpCases.length} 个 · AI 采访 → 人设 → 口播视频</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {digitalIpCases.map(c => (
                <div key={c.name} className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
                  <button
                    onClick={() => setLightbox({ src: c.video, poster: c.poster, title: `${c.name} · ${c.industry}` })}
                    className="block w-full text-left cursor-pointer group"
                  >
                    <div className="relative overflow-hidden">
                      <img src={c.poster} alt={c.name} className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                          <FiPlay className="w-6 h-6 text-[#FF6034] ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 text-[10px] font-semibold text-white bg-[#FF6034] rounded-full px-2.5 py-1">{c.industry}</span>
                      {c.stats && (
                        <span className="absolute top-3 right-3 text-[10px] font-semibold text-[#FF6034] bg-white/95 rounded-full px-2.5 py-1">{c.stats}</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold mb-1 truncate">{c.name}</h4>
                      <p className="text-xs text-[#6B7280] mb-2 line-clamp-1">{c.desc}</p>
                      <span className="text-xs text-[#FF6034] font-semibold">点击全屏播放 →</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 产品宣传横屏墙 */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 rounded-full bg-[#2563EB]" />
              <h3 className="text-lg font-bold text-[#0A0A0B]">AI 产品宣传片</h3>
              <span className="text-xs text-[#6B7280]">{productCases.length} 个 · 上传产品图 → AI 自动生成精品短片</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {productCases.map(c => (
                <div key={c.name} className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
                  <button
                    onClick={() => setLightbox({ src: c.video, poster: c.poster, title: `${c.name} · 产品宣传片` })}
                    className="block w-full text-left cursor-pointer group"
                  >
                    <div className="relative overflow-hidden">
                      <img src={c.poster} alt={c.name} className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                          <FiPlay className="w-6 h-6 text-[#2563EB] ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 text-[10px] font-semibold text-white bg-[#2563EB] rounded-full px-2.5 py-1">{c.industry}</span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold mb-1 truncate">{c.name}</h4>
                      <p className="text-xs text-[#6B7280] mb-2 line-clamp-1">{c.desc}</p>
                      <span className="text-xs text-[#2563EB] font-semibold">点击全屏播放 →</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

{/* ── How it Works ── */}
      <section className="relative py-28 bg-[#0A0A0B] text-white overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-[#FF6034]/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[3px] mb-3 text-center">HOW IT WORKS</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-16">从想法到成片，四步搞定</h2>

          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { num: '01', title: '采集', desc: 'AI采访或上传素材，像聊天一样简单', gradient: 'from-[#FF6034] to-[#FF8A66]' },
              { num: '02', title: '创作', desc: 'AI自动生成脚本、画面、配音', gradient: 'from-[#8B5CF6] to-[#A78BFA]' },
              { num: '03', title: '交付', desc: '在线预览 + 下载 + 邮箱自动发送', gradient: 'from-[#2563EB] to-[#60A5FA]' },
              { num: '04', title: '迭代', desc: '换语言、换画幅、微调，算力即用', gradient: 'from-[#10B981] to-[#34D399]' },
            ].map(s => (
              <div key={s.num} className="group rounded-2xl bg-white/[0.04] border border-white/[0.08] p-8 hover:bg-white/[0.07] transition-all duration-500">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white font-bold text-sm mb-5`}>
                  {s.num}
                </div>
                <h4 className="text-lg font-bold mb-2">{s.title}</h4>
                <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="relative py-20 bg-gradient-to-r from-[#FF6034] to-[#E04A1E] overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-3 gap-8 text-center text-white">
            {[
              { val: '200+', label: '操盘 IP' },
              { val: '10亿+', label: '全网流量' },
              { val: '24个', label: '行业覆盖' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-5xl sm:text-6xl font-bold tracking-tight mb-1">{s.val}</div>
                <div className="text-sm text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cases ── */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[3px] mb-3 text-center">SUCCESS STORIES</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-16">他们已经在用了</h2>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: FiTrendingUp, title: '餐饮老板 IP', desc: '30条脚本+10条口播，月播放突破50万', color: '#FF6034', gradient: 'from-[#FF6034]/10 to-[#FF8A66]/5' },
              { icon: FiPackage, title: '智能家居产品视频', desc: '15秒宣传片，多语言覆盖5国市场', color: '#2563EB', gradient: 'from-[#2563EB]/10 to-[#60A5FA]/5' },
              { icon: FiAward, title: '工厂老板 IP+产品', desc: '双管齐下，询盘量翻3倍', color: '#8B5CF6', gradient: 'from-[#8B5CF6]/10 to-[#A78BFA]/5' },
            ].map(c => {
              const Icon = c.icon
              return (
                <div key={c.title} className="group rounded-3xl border border-[#E5E7EB] overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                  <div className={`aspect-[4/3] bg-gradient-to-br ${c.gradient} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                    <Icon className="w-20 h-20 relative" style={{color: c.color}} />
                  </div>
                  <div className="p-6 sm:p-8">
                    <h4 className="text-lg font-bold mb-2">{c.title}</h4>
                    <p className="text-sm text-[#6B7280] leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="relative py-28 bg-[#0A0A0B] text-white overflow-hidden" id="pricing">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-[#FF6034]/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[3px] mb-3 text-center">PRICING</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-4">透明定价，无隐藏费用</h2>
          <p className="text-white/50 text-center max-w-md mx-auto mb-16">连续包月 / 包年，随时可停</p>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* IP Pricing */}
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-10 hover:bg-white/[0.05] transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6034]/20 to-[#FF6034]/5 flex items-center justify-center border border-[#FF6034]/10">
                  <FiUser className="w-7 h-7 text-[#FF6034]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">IP 操盘手</h3>
                  <p className="text-sm text-white/50">专属运营编导 · 越用越懂你</p>
                </div>
              </div>
              <div className="space-y-1 mb-8">
                {[
                  { name: '尝鲜版', price: '¥199', unit: '/月', note: '脚本10 + 成片10' },
                  { name: '标准版', price: '¥1,999', unit: '/月', note: '脚本30 + 成片30 · 专属Agent（推荐）' },
                  { name: '专业版', price: '¥2,999', unit: '/月', note: '脚本60 + 成片60 · 全链路Agent' },
                  { name: '续费优惠', price: '8折/7折', unit: '', note: '1年续费8折 · 2年续费7折' },
                ].map(p => (
                  <div key={p.name} className="flex items-center justify-between py-4 border-b border-white/[0.06] last:border-0">
                    <div>
                      <span className="text-sm font-medium">{p.name}</span>
                      {p.note && <p className="text-xs text-white/40">{p.note}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-[#FF6034]">{p.price}</span>
                      <span className="text-sm text-white/50">{p.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/pricing" className="group flex items-center justify-center gap-2 rounded-full bg-white/10 text-white px-6 py-3.5 text-sm font-semibold hover:bg-white/20 transition-all w-full">
                查看完整权益 <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Product Pricing */}
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-10 hover:bg-white/[0.05] transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB]/20 to-[#2563EB]/5 flex items-center justify-center border border-[#2563EB]/10">
                  <FiCamera className="w-7 h-7 text-[#2563EB]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">产品导演</h3>
                  <p className="text-sm text-white/50">项目包 + 会员 + 算力</p>
                </div>
              </div>
              <div className="space-y-1 mb-8">
                {[
                  { name: '单条零售', price: '¥4,299', note: '' },
                  { name: 'A包·3条', price: '¥8,999', note: '均价¥3,000/条' },
                  { name: 'B包·3-5条', price: '¥12,999', note: '' },
                  { name: 'C包·10条', price: '¥23,999', note: '' },
                  { name: '会员起', price: '¥699/月', note: '享折扣+月赠算力' },
                ].map(p => (
                  <div key={p.name} className="flex items-center justify-between py-4 border-b border-white/[0.06] last:border-0">
                    <div>
                      <span className="text-sm font-medium">{p.name}</span>
                      {p.note && <p className="text-xs text-white/40">{p.note}</p>}
                    </div>
                    <div>
                      <span className="text-lg font-bold text-[#FF6034]">{p.price}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/pricing" className="group flex items-center justify-center gap-2 rounded-full bg-white/10 text-white px-6 py-3.5 text-sm font-semibold hover:bg-white/20 transition-all w-full">
                查看完整体系 <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6034] to-[#E04A1E]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        <div className="relative mx-auto max-w-3xl px-6 text-center text-white">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">试试看，0风险</h2>
          <p className="text-lg text-white/80 max-w-lg mx-auto mb-10">
            ¥199 尝鲜版 | ¥1,299 体验产品小样。觉得好再续，不满意随时停。
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/persona" className="inline-flex items-center gap-2 rounded-full bg-white text-[#0A0A0B] px-8 py-4 text-base font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              <FiZap className="w-4 h-4" />
              立即体验
            </Link>
            <Link href="/faq" className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-8 py-4 text-base font-semibold hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm">
              了解更多
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><FiCheck className="w-4 h-4" /> 无需信用卡</span>
            <span className="flex items-center gap-1.5"><FiShield className="w-4 h-4" /> 随时取消</span>
            <span className="flex items-center gap-1.5"><FiPlay className="w-4 h-4" /> 即开即用</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0A0A0B] text-white/50 py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <Link href="/about" className="text-sm hover:text-white transition-colors">关于我们</Link>
            <Link href="/pricing" className="text-sm hover:text-white transition-colors">定价</Link>
            <Link href="/faq" className="text-sm hover:text-white transition-colors">帮助中心</Link>
            <Link href="/terms" className="text-sm hover:text-white transition-colors">服务条款</Link>
            <Link href="/privacy" className="text-sm hover:text-white transition-colors">隐私政策</Link>
          </div>
          <p className="text-center text-sm">© 2026 懒老板 — AI IP操盘手 & AI 产品导演</p>
        </div>
      </footer>

      {/* 全屏沉浸播放 */}
      {lightbox && (
        <LightboxVideo
          src={lightbox.src}
          poster={lightbox.poster}
          title={lightbox.title}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}
