import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'
import VideoPlayer from '@/app/components/VideoPlayer'
import { FiZap, FiCamera, FiGlobe, FiPlay, FiChevronRight } from 'react-icons/fi'

const steps = [
  {
    number: '01',
    title: '搜索资源',
    desc: '在"全球供应链"板块输入关键词或按分类浏览，快速找到您感兴趣的商品或供应商。支持按产地、品类、价格等条件筛选，精准定位目标货源。',
    tips: ['使用热门搜索词快速发现爆款', '结合多关键词交叉搜索', '关注商品趋势标签了解市场热度'],
  },
  {
    number: '02',
    title: '筛选对比',
    desc: '对多个供应商或商品进行横向对比，查看价格、起订量、发货地、评分等关键信息。帮助您做出更明智的采购决策。',
    tips: ['关注供应商评分和评价数量', '对比同品类的不同供应商报价', '利用收藏功能暂存备选商品'],
  },
  {
    number: '03',
    title: '收藏联系',
    desc: '将心仪的商品或供应商加入您的资源库，后续可快速查看。确定意向后，通过平台内向供应商发送询盘信息，沟通合作细节。',
    tips: ['及时整理资源库分类', '询盘时提供尽量详细的采购需求', '保持与多家供应商的沟通'],
  },
  {
    number: '04',
    title: 'AI生成视频',
    desc: '使用懒老板的AI内容生成工具，快速创建适合您业务的短视频脚本、口播文案和拍摄方案。选择适合的教练风格，一键生成专业内容。',
    tips: ['根据行业选择合适的教练风格', 'AI生成的脚本需要结合实际情况调整', '利用排期功能规划内容发布节奏'],
  },
]

const quickLinks = [
  { label: 'IP操盘人设', href: '/persona', desc: 'AI采访·人设定位·内容策略' },
  { label: '品牌宣传视频', href: '/brand-promotion', desc: '产品图→30s精品短片' },
  { label: '供应链资源', href: '/global-supply', desc: '找工厂·找商品·找渠道' },
  { label: 'AI聊天助手', href: '/global-supply/ai-assistant', desc: '生意顾问·IP策划' },
  { label: '定价方案', href: '/pricing', desc: '体验包·标准版·专业版' },
  { label: '常见问题', href: '/faq', desc: '使用疑问·计费说明' },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-14 text-center">
        <h1 className="section-title">
          使用指南
        </h1>
        <p className="section-subtitle mt-4">
          从入门到精通，快速上手懒老板的全部功能
        </p>
      </section>

      {/* ── Product Overview ── */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">懒老板两大核心产品</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* IP操盘手 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6034]/10 to-[#FF6034]/5 flex items-center justify-center mb-4 border border-[#FF6034]/10">
              <FiZap className="w-6 h-6 text-[#FF6034]" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI IP 操盘手</h3>
            <p className="text-sm text-gray-500 mb-4">帮老板做IP，持续获客</p>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-[#FF6034]/10 text-[#FF6034] text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">1</span>AI采访挖掘你的创业故事和个人特点</li>
              <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-[#FF6034]/10 text-[#FF6034] text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">2</span>AI生成你的专属人设定位和内容策略</li>
              <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-[#FF6034]/10 text-[#FF6034] text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">3</span>每月30-60条脚本+口播视频自动生成</li>
              <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-[#FF6034]/10 text-[#FF6034] text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">4</span>内容邮箱自动交付，持续更新账号</li>
            </ol>
            <Link href="/persona" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#FF6034] hover:underline">
              了解详情 <FiChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 产品导演 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563EB]/10 to-[#2563EB]/5 flex items-center justify-center mb-4 border border-[#2563EB]/10">
              <FiCamera className="w-6 h-6 text-[#2563EB]" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI 产品导演</h3>
            <p className="text-sm text-gray-500 mb-4">拍产品，全球投放</p>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">1</span>上传产品图和基本素材</li>
              <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">2</span>选择风格模板或AI生成脚本</li>
              <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">3</span>AI自动生成30s+精品宣传短片</li>
              <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">4</span>可衍生多语言、多画幅版本和广告配图</li>
            </ol>
            <Link href="/brand-promotion" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline">
              了解详情 <FiChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section>
        <div className="mx-auto max-w-4xl px-6 pb-16">
          <div className="space-y-16">
            {steps.map((step, i) => (
              <div key={step.number} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-center`}>
                {/* Video/Screenshot placeholder */}
                <div className="w-full md:w-1/2">
                  <VideoPlayer
                    title={step.title}
                    description={step.desc.slice(0, 60) + '...'}
                    placeholder
                  />
                </div>

                {/* Text */}
                <div className="w-full md:w-1/2">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-white mb-4"
                    style={{ backgroundColor: '#FF6034' }}
                  >
                    {step.number}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {step.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FF6034' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="section-title text-center mb-10">快速入口</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="card !p-5 hover:shadow-apple-md transition-all group"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-400 transition-colors">
                  {link.label}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Need more help */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">需要更多帮助？</h2>
        <p className="text-gray-500 text-sm">查看常见问题或联系我们</p>
        <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/faq"
            className="inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
            style={{ backgroundColor: '#FF6034' }}
          >
            常见问题
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-lg border-2 px-6 py-2.5 text-sm font-semibold transition-all hover:bg-gray-50"
            style={{ borderColor: '#FF6034', color: '#FF6034' }}
          >
            关于我们
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-gray-400">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Link href="/about" className="hover:text-gray-600 transition-colors">关于我们</Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">服务条款</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">隐私政策</Link>
          </div>
          懒老板 — 实体老板一站式生意平台
        </div>
      </footer>
    </div>
  )
}
