'use client'
import Link from 'next/link'
import { FiCheck, FiArrowRight, FiUser, FiCamera, FiZap, FiStar, FiShield, FiHelpCircle } from 'react-icons/fi'
import NavHeader from '../components/NavHeader'

const ipPlans = [
  { name: '体验包', price: '¥99', period: '一次性', desc: '试试水', features: ['AI采访1次', '脚本3条', '口播视频2条（即将上线）', '素材邮箱交付'], popular: false, highlight: false },
  { name: '标准版', price: '¥599', period: '/月', yearly: '¥4,680/年', desc: '稳定更新', features: ['AI深度采访+人设策略', '月30条短视频脚本', '数字人口播×10（即将上线）', '邮箱自动交付'], popular: true, highlight: false },
  { name: '专业版', price: '¥1,499', period: '/月', yearly: '¥11,680/年', desc: '全面增长', features: ['完整IP增长策略+竞品分析', '月45条脚本+口播×20', '内容数据追踪', '任务优先处理'], popular: false, highlight: false },
  { name: '至尊版', price: '¥3,999', period: '/月', yearly: '¥26,800/年', desc: '全链路操盘', features: ['全链路IP操盘方案', '月60条脚本+口播×30', '账号评论管理+月度数据复盘', '7×12h优先客服'], popular: false, highlight: true },
]

const productPackages = [
  { name: '单条零售', price: '¥4,299', desc: '试水成片品质', features: ['40-60s精品母片×1', '配套AI广告图', '1轮免费微调', '商用版权'] },
  { name: 'A包·轻量精品', price: '¥8,999', desc: '均价¥3,000/条', features: ['40-60s精品母片×3', '配套AI广告图', '1轮免费微调', '12个月有效'] },
  { name: 'B包·进阶精品', price: '¥12,999', desc: '3-5条', features: ['40-60s精品母片×3-5', '配套AI广告图', '1轮免费微调', '12个月有效'] },
  { name: 'C包·批量精品', price: '¥23,999', desc: '10条', features: ['40-60s精品母片×10', '配套AI广告图', '1轮免费微调', '12个月有效'] },
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
  { q: '一条40-60s母片包含横竖屏、中英文版本吗？配套广告图有多少？', a: '母片标准交付：1种画幅+1门基础语种。制作母片自动生成成套配套AI广告图片。多语种、多画幅衍生版本需消耗算力渲染。' },
  { q: '成片交付后想持续微调画面怎么收费？', a: '小幅画面优化、素材替换重渲染消耗算力点。如需重构叙事、全新脚本，需新增精品母片。' },
  { q: '项目包内多条母片必须一次性制作吗？', a: '无需一次性排期，项目包有效期12个月，可根据上新节奏分批提交。' },
  { q: '不开会员可以买母片项目包、充值算力吗？', a: '可以。会员仅提供折扣与月赠算力，不限制基础功能。' },
  { q: '连续包月可以随时暂停吗？', a: '支持随时关闭自动续费。' },
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
            <p className="text-sm text-[#6B7280]">按月订阅，稳定产出30-60条/月</p>
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
              <p className="text-sm text-[#6B7280] mb-4">{p.desc}</p>
              <div className="mb-4">
                <span className="text-3xl sm:text-4xl font-bold">{p.price}</span>
                <span className="text-sm text-[#6B7280]">{p.period}</span>
                {p.yearly && <p className="text-xs text-[#FF6034] mt-1 font-medium">{p.yearly}（年付）</p>}
              </div>
              <ul className="space-y-2.5 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#6B7280]">
                    <FiCheck className="w-4 h-4 text-[#FF6034] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={p.name === '体验包' ? '#' : '/interview'} className={`block text-center rounded-full py-3 text-sm font-semibold transition-all ${
                p.popular ? 'bg-[#FF6034] text-white hover:shadow-lg hover:shadow-[#FF6034]/20' :
                'border border-[#E5E7EB] text-[#0A0A0B] hover:border-[#FF6034]/30 hover:text-[#FF6034]'
              }`}>
                {p.name === '体验包' ? '立即体验' : '订阅'}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#6B7280] mt-4 text-center">追加脚本 ¥15/条 · 追人口播 ¥69/条（即将上线）</p>
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
                <p className="text-sm text-[#6B7280] mb-4">{p.desc}</p>
                <p className="text-3xl sm:text-4xl font-bold mb-4">{p.price}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#6B7280]">
                      <FiCheck className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/brand-promotion" className="block text-center rounded-full border border-[#E5E7EB] py-3 text-sm font-semibold hover:border-[#2563EB]/30 hover:text-[#2563EB] transition-all">
                  了解详情
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
                <Link href="#" className="block text-center rounded-full border border-[#E5E7EB] py-3 text-sm font-semibold hover:border-[#2563EB]/30 hover:text-[#2563EB] transition-all">
                  订阅
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
          <p className="text-white/80 max-w-md mx-auto mb-8">¥99体验IP操盘手 · ¥1,299体验产品小样</p>
          <Link href="#" className="inline-flex items-center gap-2 rounded-full bg-white text-[#0A0A0B] px-8 py-4 text-base font-semibold hover:shadow-xl transition-all">
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
