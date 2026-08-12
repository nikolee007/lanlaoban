'use client'
import Link from 'next/link'
import { FiCheck, FiArrowRight, FiUser, FiCamera, FiZap, FiStar, FiShield, FiHelpCircle } from 'react-icons/fi'
import NavHeader from '../components/NavHeader'

const ipPlans = [
  { name: '尝鲜版', price: '¥199', period: '/月', yearly1: '¥1,910/年', desc: '先试试', target: '想低成本体验AI编导效果的新手老板', features: ['月脚本 10 条', 'AI 图文成片 10 条', '可一键数字人口播', '邮箱交付'], popular: false, highlight: false },
  { name: '标准版', price: '¥1,999', period: '/月', yearly1: '¥19,190/年', desc: '主力推荐', target: '需要持续产出内容的成长型商家', features: ['月脚本 30 条 + 成片 30 条', '专属运营编导 Agent（越用越懂你）', '数字人一键口播', '邮箱交付'], popular: true, highlight: false },
  { name: '专业版', price: '¥2,999', period: '/月', yearly1: '¥28,790/年', desc: '全链路操盘', target: '需要全链路IP运营的成熟品牌', features: ['月脚本 60 条 + 成片 60 条', '专属 Agent 全链路操盘', '账号策略 + 数据追踪', '优先客服'], popular: false, highlight: true },
]

const productPackages = [
  { name: '单条零售', price: '¥4,299', desc: '试水成片品质', target: '想先看一条成片效果再决定批量制作的老板', features: ['40-60s精品母片×1', '配套AI广告图', '1轮免费微调', '商用版权'] },
  { name: 'A包·轻量精品', price: '¥8,999', desc: '均价¥3,000/条', target: '季度新品上市，3条视频覆盖多渠道', features: ['40-60s精品母片×3', '配套AI广告图', '1轮免费微调', '12个月有效'] },
  { name: 'B包·进阶精品', price: '¥12,999', desc: '3-5条', target: '多产品线同步推广，丰富品牌素材库', features: ['40-60s精品母片×3-5', '配套AI广告图', '1轮免费微调', '12个月有效'] },
  { name: 'C包·批量精品', price: '¥23,999', desc: '10条', target: '年度品牌视觉体系搭建，一次性储备全年素材', features: ['40-60s精品母片×10', '配套AI广告图', '1轮免费微调', '12个月有效'] },
]

const productMemberships = [
  { name: '轻享会员', price: '¥699', period: '/月', yearly: '¥6,480/年', desc: '月赠300算力', features: ['项目包9折', '算力消费95折', '普通渲染队列'] },
  { name: '进阶会员', price: '¥1,699', period: '/月', yearly: '¥14,880/年', desc: '月赠800算力', features: ['项目包85折', '算力消费9折', '任务优先队列'] },
  { name: '企业会员', price: '¥3,699', period: '/月', yearly: '¥32,880/年', desc: '月赠2000算力', features: ['项目包8折', '算力消费85折', '最高渲染优先级+专属通道'] },
]

const computePacks = [
  { name: '小额充值包', price: '¥380', credits: '500', unit: '0.76元/点' },
  { name: '标准充值包', price: '¥1,280', credits: '2,000', unit: '0.64元/点' },
  { name: '大额充值包', price: '¥4,980', credits: '8,500', unit: '0.59元/点' },
]

const faqs = [
  { q: '尝鲜版 ¥199 包含什么？之后怎么续？', a: '尝鲜版月脚本10条 + AI图文成片10条，可一键数字人口播，邮箱交付。满意后可升级标准版/专业版，1年续费8折、2年续费7折。' },
  { q: 'IP操盘手一个月能出多少条内容？质量怎么样？', a: '尝鲜版月10条，标准版月30条脚本+成片，专业版月60条。内容由专属编导Agent基于你的品类与风格定制，AI生成+人工审核，确保不脱离你的真实风格。' },
  { q: '产品导演一条40-60s母片包含横竖屏、中英文版本吗？', a: '母片标准交付：1种画幅+1门基础语种。制作母片自动生成成套配套AI广告图片。多语种、多画幅衍生版本需消耗算力渲染。' },
  { q: '成片交付后想持续微调画面怎么收费？', a: '小幅画面优化、素材替换重渲染消耗算力点。如需重构叙事、全新脚本，需新增精品母片。' },
  { q: '项目包内多条母片必须一次性制作吗？', a: '无需一次性排期，项目包有效期12个月，可根据上新节奏分批提交。' },
  { q: '不开会员可以买母片项目包、充值算力吗？', a: '可以。会员仅提供折扣与月赠算力，不限制基础功能。' },
  { q: '连续包月可以随时暂停吗？', a: '支持随时关闭自动续费。暂停后续费保留原有权益和数据。' },
  { q: '我没有视频制作经验，能直接用产品导演吗？', a: '完全不需要。你只需上传产品图和基本素材，AI自动生成脚本、画面和配音。三步完成：上传→设置→生成。' },
  { q: 'IP操盘手和产品导演能一起用吗？', a: '可以。两个产品独立订阅，互不冲突。同时订阅有组合优惠，详询客服。' },
  { q: '什么情况可以退款？', a: '尝鲜版/月付订阅首次使用后7天内不满意可取消并退款。包年和项目包一经开通不退款。' },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0B]">
      <NavHeader />

      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-[#FF6034]/5 to-transparent blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-semibold text-[#FF6034] uppercase tracking-[3px] mb-3">PRICING</p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">透明定价，无隐藏费用</h1>
          <p className="text-[#6B7280] text-lg max-w-lg mx-auto">连续包月 / 包年，随时可停。先体验，满意再续。</p>
        </div>
      </section>

      {/* ── IP 操盘手 ── */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6034]/10 to-[#FF6034]/5 flex items-center justify-center border border-[#FF6034]/10">
            <FiUser className="w-6 h-6 text-[#FF6034]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">IP 操盘手</h2>
            <p className="text-sm text-[#6B7280]">专属运营编导 · 越用越懂你</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ipPlans.map(p => (
            <div key={p.name} className={`relative rounded-2xl border p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 ${
              p.popular ? 'border-[#FF6034]/30 bg-gradient-to-b from-[#FF6034]/[0.03] to-white shadow-lg shadow-[#FF6034]/5' :
              p.highlight ? 'border-[#FF6034]/20 bg-gradient-to-b from-[#FF6034]/[0.02] to-white' :
              'border-[#E5E7EB] bg-white'
            }`}>
              {p.popular && (
                <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF6034] to-[#FF8A66] text-white text-xs font-semibold">
                  推荐
                </div>
              )}
              <h3 className="text-lg font-bold mb-1">{p.name}</h3>
              <p className="text-sm text-[#6B7280] mb-1.5">{p.desc}</p>
              <p className="text-xs text-[#FF6034]/80 bg-[#FF6034]/5 rounded-lg px-2.5 py-1.5 mb-3 leading-relaxed">
                🎯 {p.target}
              </p>
              <div className="mb-4">
                <span className="text-3xl sm:text-4xl font-bold">{p.price}</span>
                <span className="text-sm text-[#6B7280]">{p.period}</span>
                {p.yearly1 && <p className="text-xs text-[#FF6034] mt-1 font-medium">{p.yearly1}（1年续费·8折）</p>}
                {p.yearly1 && <p className="text-xs text-[#FF6034]/70 mt-0.5">2年续费·7折</p>}
              </div>
              <ul className="space-y-2.5 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#6B7280]">
                    <FiCheck className="w-4 h-4 text-[#FF6034] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={p.name === '尝鲜版' ? '/interview' : '/login'} className={`block text-center rounded-full py-3 text-sm font-semibold transition-all ${
                p.popular ? 'bg-[#FF6034] text-white hover:shadow-lg hover:shadow-[#FF6034]/20' :
                'border border-[#E5E7EB] text-[#0A0A0B] hover:border-[#FF6034]/30 hover:text-[#FF6034]'
              }`}>
                {p.name === '尝鲜版' ? '立即体验' : '订阅'}
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-[#FF6034]/10 bg-[#FFF8F5] p-5">
          <p className="text-sm font-bold mb-1">每个老板，都有一个专属的运营编导 Agent</p>
          <p className="text-xs text-[#6B7280] leading-relaxed">账号越用越懂你的品类、话术与风格，AI 持续为你产出脚本与成片。数字人由老板本人照片生成，非虚拟网红，使用前签肖像授权说明。</p>
        </div>
        <p className="text-xs text-[#6B7280] mt-4 text-center">追加脚本 ¥15/条 · 追加数字人口播 ¥69/条</p>
      </section>

      {/* 场景选择指南 */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-2xl border border-[#FF6034]/10 bg-gradient-to-br from-[#FFF8F5] to-white p-8">
          <h2 className="text-xl font-bold mb-1">不知道怎么选？</h2>
          <p className="text-sm text-[#6B7280] mb-6">根据你的情况对照选择</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-3 pr-4 font-semibold text-[#0A0A0B]">你的情况</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#0A0A0B]">推荐方案</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#0A0A0B] hidden sm:table-cell">理由</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { who: "刚起步，想先试试AI编导", plan: "尝鲜版 ¥199/月", why: "低成本验证，觉得好再续" },
                  { who: "需要持续产出内容", plan: "标准版 ¥1,999/月", why: "30条脚本+成片，专属Agent越用越懂你" },
                  { who: "要全链路IP运营", plan: "专业版 ¥2,999/月", why: "60条+全链路操盘，优先客服" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[#E5E7EB]/60 last:border-0">
                    <td className="py-3 pr-4 text-[#0A0A0B] font-medium">{row.who}</td>
                    <td className="py-3 px-4 text-[#FF6034] font-semibold">{row.plan}</td>
                    <td className="py-3 px-4 text-[#6B7280] hidden sm:table-cell">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 产品导演 ── */}
      <section className="bg-[#FAFAFA] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563EB]/10 to-[#2563EB]/5 flex items-center justify-center border border-[#2563EB]/10">
              <FiCamera className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">产品导演</h2>
              <p className="text-sm text-[#6B7280]">精品可视化三层体系</p>
            </div>
          </div>

          {/* 项目包 */}
          <h3 className="text-lg font-bold mb-4">精品母片项目包</h3>
          <p className="text-sm text-[#6B7280] mb-6">40-60s精品短片，同步生成配套AI广告配图</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {productPackages.map(p => (
              <div key={p.name} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <h4 className="text-lg font-bold mb-1">{p.name}</h4>
                <p className="text-sm text-[#6B7280] mb-1.5">{p.desc}</p>
                <p className="text-xs text-[#2563EB]/80 bg-[#2563EB]/5 rounded-lg px-2.5 py-1.5 mb-3 leading-relaxed">🎯 {p.target}</p>
                <p className="text-3xl sm:text-4xl font-bold mb-4">{p.price}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#6B7280]">
                      <FiCheck className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block text-center rounded-full border border-[#E5E7EB] py-3 text-sm font-semibold hover:border-[#2563EB]/30 hover:text-[#2563EB] transition-all">
                  注册购买
                </Link>
              </div>
            ))}
          </div>

          {/* 会员 */}
          <h3 className="text-lg font-bold mb-4">月度会员</h3>
          <p className="text-sm text-[#6B7280] mb-6">连续包月 / 包年，享折扣+月赠算力</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-16">
            {productMemberships.map(m => (
              <div key={m.name} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <h4 className="text-lg font-bold mb-1">{m.name}</h4>
                <p className="text-sm text-[#6B7280] mb-4">{m.desc}</p>
                <div className="mb-4">
                  <span className="text-3xl sm:text-4xl font-bold">{m.price}</span>
                  <span className="text-sm text-[#6B7280]">{m.period}</span>
                  <p className="text-xs text-[#2563EB] mt-1 font-medium">{m.yearly}（年付）</p>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {m.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#6B7280]">
                      <FiCheck className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block text-center rounded-full border border-[#E5E7EB] py-3 text-sm font-semibold hover:border-[#2563EB]/30 hover:text-[#2563EB] transition-all">
                  登录订阅
                </Link>
              </div>
            ))}
          </div>

          {/* 算力充值包 */}
          <h3 className="text-lg font-bold mb-4">算力充值包</h3>
          <p className="text-sm text-[#6B7280] mb-6">基于已完成母片，衍生多语言、多画幅、迭代微调</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {computePacks.map(c => (
              <div key={c.name} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center">
                <h4 className="text-lg font-bold mb-1">{c.name}</h4>
                <p className="text-3xl sm:text-4xl font-bold mb-1">{c.price}</p>
                <p className="text-sm text-[#FF6034] font-semibold mb-2">{c.credits} 算力点</p>
                <p className="text-xs text-[#6B7280]">{c.unit}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-[#FFF8F5] border border-[#FF6034]/10 p-6">
            <h4 className="font-bold mb-2">算力消耗标准</h4>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-[#6B7280]"><FiZap className="w-4 h-4 text-[#FF6034]" /> 新增1门语种：100算力点</div>
              <div className="flex items-center gap-2 text-[#6B7280]"><FiZap className="w-4 h-4 text-[#FF6034]" /> 新增1种画幅：100算力点</div>
              <div className="flex items-center gap-2 text-[#6B7280]"><FiZap className="w-4 h-4 text-[#FF6034]" /> 基础微调重渲染：80算力点</div>
            </div>
            <p className="text-xs text-[#6B7280] mt-3">赠送算力当月清零 · 充值算力永久有效</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6034] to-[#E04A1E]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">先试试，再决定</h2>
          <p className="text-white/80 max-w-md mx-auto mb-8">¥199 尝鲜版 · ¥1,299 体验产品小样</p>
          <Link href="/interview" className="inline-flex items-center gap-2 rounded-full bg-white text-[#0A0A0B] px-8 py-4 text-base font-semibold hover:shadow-xl transition-all">
            <FiZap className="w-4 h-4" /> 立即体验
          </Link>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><FiCheck className="w-4 h-4" /> 无需信用卡</span>
            <span className="flex items-center gap-1.5"><FiShield className="w-4 h-4" /> 随时取消</span>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">常见问题</h2>
        <div className="space-y-4">
          {faqs.map(f => (
            <details key={f.q} className="group rounded-2xl border border-[#E5E7EB] p-5 transition-all open:border-[#FF6034]/20 open:bg-[#FFF8F5]/50">
              <summary className="flex items-center justify-between cursor-pointer font-medium text-sm">
                {f.q}
                <FiHelpCircle className="w-5 h-5 text-[#6B7280] group-open:text-[#FF6034] shrink-0 ml-2" />
              </summary>
              <p className="mt-3 text-sm text-[#6B7280] leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0B] text-white/50 py-12 px-6 text-sm text-center">
        <div className="flex items-center justify-center gap-6 mb-4 flex-wrap">
          <Link href="/about" className="hover:text-white transition-colors">关于我们</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">定价</Link>
          <Link href="/faq" className="hover:text-white transition-colors">帮助中心</Link>
          <Link href="/terms" className="hover:text-white transition-colors">服务条款</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">隐私政策</Link>
        </div>
        <p>© 2026 懒老板 — AI IP操盘手 & AI 产品导演</p>
      </footer>
    </div>
  )
}
