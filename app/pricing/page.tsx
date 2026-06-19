import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiCheck, FiStar, FiZap, FiArrowRight } from 'react-icons/fi'

const tiers = [
  {
    name: '免费版',
    price: '¥0',
    period: '',
    desc: '体验懒老板的基础能力',
    features: [
      { ok: true, text: '1条脚本生成体验' },
      { ok: true, text: '基础人设方案' },
      { ok: false, text: 'AI拍摄指导' },
      { ok: false, text: '自动剪辑支持' },
      { ok: false, text: '发布排期' },
    ],
    cta: '免费体验', href: '/persona', featured: false,
  },
  {
    name: '专业版',
    price: '¥4,980',
    period: '/年',
    desc: '个人IP打造的完整解决方案',
    features: [
      { ok: true, text: '30条专属脚本（完整4模块）' },
      { ok: true, text: '每条脚本3个AI拍摄引导' },
      { ok: true, text: '30天发布排期表' },
      { ok: true, text: '成交话术生成' },
      { ok: true, text: '导出全部内容' },
    ],
    cta: '立即订阅', href: '/generate', featured: true,
  },
  {
    name: '尊享版',
    price: '¥9,800',
    period: '/年',
    desc: '专业团队级IP运营服务',
    features: [
      { ok: true, text: '专业版全部功能' },
      { ok: true, text: '每周线上答疑' },
      { ok: true, text: '专属行业人设策划' },
      { ok: true, text: '内容迭代优化建议' },
      { ok: true, text: '优先体验新功能' },
    ],
    cta: '咨询订阅', href: '/login', featured: false,
  },
]

const compareData = [
  { item: '年费', free: '¥0', pro: '¥4,980', ultra: '¥9,800' },
  { item: '脚本数量', free: '1条', pro: '30条', ultra: '30条+' },
  { item: 'AI拍摄指导', free: '—', pro: '✓', ultra: '✓' },
  { item: '发布排期', free: '—', pro: '✓', ultra: '✓' },
  { item: '导出功能', free: '—', pro: '✓', ultra: '✓' },
  { item: '线上答疑', free: '—', pro: '—', ultra: '每周' },
  { item: '内容策略', free: '—', pro: '—', ultra: '1对1' },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />

      <section className="max-w-6xl mx-auto px-4 pt-20 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-1.5 text-sm text-brand-700 mb-6">
          <FiZap className="w-4 h-4" /> 比传统编导团队便宜 90%
        </div>
        <h1 className="text-4xl font-bold text-gray-900">选择适合你的方案</h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">从免费体验到专业级IP打造，助你轻松建立实体老板IP</p>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {tiers.map(t => (
            <div key={t.name} className={`relative bg-white rounded-2xl border p-8 flex flex-col ${t.featured ? 'ring-2 ring-brand-400 shadow-lg scale-105' : 'border-gray-100'}`}>
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-brand-400 px-4 py-1 text-sm font-semibold text-white shadow-sm">
                  <FiStar className="h-4 w-4" />最受欢迎
                </div>
              )}
              <div className={t.featured ? 'mt-4' : ''}>
                <h2 className="text-xl font-semibold text-gray-900">{t.name}</h2>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{t.price}</span>
                  <span className="text-sm text-gray-500">{t.period}</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">{t.desc}</p>
              </div>
              <ul className="mt-8 space-y-3 flex-1">
                {t.features.map(f => (
                  <li key={f.text} className="flex items-center gap-3 text-sm">
                    <span className={`rounded-full p-0.5 ${f.ok ? 'bg-brand-50 text-brand-400' : 'bg-gray-100 text-gray-300'}`}>
                      <FiCheck className="h-4 w-4" />
                    </span>
                    <span className={f.ok ? 'text-gray-700' : 'text-gray-400'}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href={t.href} className={t.featured ? 'btn-primary w-full text-center block' : 'btn-outline w-full text-center block'}>{t.cta}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 对比表 */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">完整功能对比</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-900">
            <div>功能</div>
            <div className="text-center">免费版</div>
            <div className="text-center text-brand-400">专业版</div>
            <div className="text-center">尊享版</div>
          </div>
          {compareData.map(row => (
            <div key={row.item} className="grid grid-cols-4 gap-4 px-6 py-3.5 border-b border-gray-50 text-sm text-gray-600 hover:bg-gray-50/50 transition-colors">
              <div className="font-medium text-gray-900">{row.item}</div>
              <div className="text-center">{row.free}</div>
              <div className="text-center">{row.pro}</div>
              <div className="text-center">{row.ultra}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">还不确定？先免费体验</h2>
        <p className="text-gray-500 mb-8">无需付费，先看看AI能为你生成什么样的内容</p>
        <Link href="/persona" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
          免费生成人设方案 <FiArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  )
}
