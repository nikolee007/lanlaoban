'use client'
import Link from 'next/link'
import { FiArrowRight, FiCheck, FiUser, FiMessageCircle, FiFileText, FiVideo, FiMail, FiStar, FiZap, FiTrendingUp, FiAward } from 'react-icons/fi'
import NavHeader from '../components/NavHeader'

export default function IpManagerPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0B]">
      <NavHeader />

      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-[#FF6034]/8 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gradient-radial from-[#FF6034]/5 to-transparent blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6034]/20 bg-[#FF6034]/5 px-4 py-1.5 text-sm font-medium text-[#FF6034] mb-6">
              <FiUser className="w-4 h-4" /> AI IP 操盘手
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
              让 AI 帮你<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6034] to-[#FF8A66]">做出个人IP</span>
            </h1>
            <p className="text-lg text-[#6B7280] max-w-xl leading-relaxed mb-10">
              不用请操盘手，不用学剪辑。AI采访挖掘你的故事，自动出人设策略，每周生成30-60条脚本和口播视频，持续更新你的账号。
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/interview" className="group inline-flex items-center gap-3 rounded-full bg-[#FF6034] text-white px-8 py-4 text-base font-semibold shadow-lg shadow-[#FF6034]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                开始AI采访 <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/pricing" className="group inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-8 py-4 text-base font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all">
                查看定价
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-[#FAFAFA] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[3px] mb-3 text-center">HOW IT WORKS</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-16">AI操盘手四步走</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { icon: FiMessageCircle, step: '01', title: 'AI采访', desc: '像跟记者聊天一样，AI自动发掘你的故事、经历和价值观', color: '#FF6034' },
              { icon: FiUser, step: '02', title: '人设定位', desc: 'AI出人设方案：昵称、bio、口号、对标分析、受众画像', color: '#8B5CF6' },
              { icon: FiFileText, step: '03', title: '内容生产', desc: '每周自动生成30-60条脚本 + 数字人口播视频 + 封面图', color: '#2563EB' },
              { icon: FiMail, step: '04', title: '邮箱交付', desc: '素材包自动发到邮箱，支持在线预览和下载MP4', color: '#10B981' },
            ].map(s => (
              <div key={s.step} className="relative rounded-2xl border border-[#E5E7EB] bg-white p-8 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{background: `${s.color}10`, color: s.color}}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold mb-1" style={{color: s.color}}>{s.step}</div>
                <h4 className="text-lg font-bold mb-2">{s.title}</h4>
                <p className="text-sm text-[#6B7280] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[3px] mb-3">WHAT YOU GET</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">每月产出</h2>
              <div className="space-y-5">
                {[
                  { icon: FiFileText, title: '30-60条短视频脚本', desc: '含情绪钩子+分镜描述+字幕建议，5个内容模块覆盖' },
                  { icon: FiVideo, title: '10-30条数字人口播', desc: 'AI数字人出镜口播，选择场景和风格（即将上线）' },
                  { icon: FiTrendingUp, title: '完整IP增长策略', desc: '竞品分析+选题矩阵+热词预埋+数据复盘' },
                  { icon: FiStar, title: '人设+定位方案', desc: 'AI深度采访后提炼的人设公式、对标分析和受众画像' },
                ].map(f => (
                  <div key={f.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FF6034]/10 flex items-center justify-center shrink-0">
                      <f.icon className="w-5 h-5 text-[#FF6034]" />
                    </div>
                    <div>
                      <h4 className="font-bold">{f.title}</h4>
                      <p className="text-sm text-[#6B7280]">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-[#FF6034]/5 to-[#FF8A66]/5 border border-[#FF6034]/10 p-10">
              <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[2px] mb-4">PRICING</p>
              <div className="space-y-4">
                {[
                  { name: '尝鲜版', price: '¥199/月', desc: '脚本10 + 成片10' },
                  { name: '标准版', price: '¥1,999/月', desc: '脚本30 + 成片30 · 专属Agent' },
                  { name: '专业版', price: '¥2,999/月', desc: '脚本60 + 成片60 · 全链路操盘' },
                  { name: '续费优惠', price: '8折/7折', desc: '1年8折 · 2年7折' },
                ].map(p => (
                  <div key={p.name} className="flex items-center justify-between py-3 border-b border-[#FF6034]/10 last:border-0">
                    <div>
                      <span className="font-medium">{p.name}</span>
                      <p className="text-xs text-[#6B7280]">{p.desc}</p>
                    </div>
                    <span className="text-lg font-bold text-[#FF6034]">{p.price}</span>
                  </div>
                ))}
              </div>
              <Link href="/pricing" className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#FF6034] text-white py-3 text-sm font-semibold hover:shadow-lg transition-all">
                查看完整定价 <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Case */}
      <section className="bg-[#0A0A0B] text-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[3px] mb-3">SUCCESS STORIES</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">真实案例</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: FiTrendingUp, title: '餐饮老板', result: '月播放50万+', desc: '30条脚本+10条口播，3个月粉丝从0到5万' },
              { icon: FiAward, title: '工厂老板', result: '询盘翻3倍', desc: 'IP操盘+产品视频，B端客户主动找上门' },
              { icon: FiStar, title: '设计师IP', result: '月接单30+', desc: '人设定位后精准吸引高端客户，客单价翻倍' },
            ].map(c => (
              <div key={c.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 hover:bg-white/[0.06] transition-all">
                <c.icon className="w-10 h-10 text-[#FF6034] mb-4" />
                <h4 className="text-xl font-bold mb-1">{c.title}</h4>
                <p className="text-[#FF6034] font-semibold text-sm mb-3">{c.result}</p>
                <p className="text-sm text-white/50">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6034] to-[#E04A1E]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center text-white">
          <FiZap className="w-10 h-10 mx-auto mb-6" />
          <h2 className="text-4xl font-bold tracking-tight mb-4">¥199 开始你的IP</h2>
          <p className="text-white/80 max-w-md mx-auto mb-8">AI采访+3条脚本+2条口播，不满意随时停</p>
          <Link href="#" className="inline-flex items-center gap-2 rounded-full bg-white text-[#0A0A0B] px-8 py-4 text-base font-semibold hover:shadow-xl transition-all">
            立即体验 <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="bg-[#0A0A0B] text-white/50 py-12 px-6 text-sm text-center">
        <p>© 2026 懒老板 — AI IP操盘手</p>
      </footer>
    </div>
  )
}
