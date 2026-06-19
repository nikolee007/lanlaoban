import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'

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
  { label: 'AI内容生成', href: '/launch', desc: '短视频脚本·口播·拍摄方案' },
  { label: '全球供应链', href: '/global-supply', desc: '找工厂·找商品·找渠道' },
  { label: '我的资源库', href: '/global-supply/my-resources', desc: '收藏商品·管理供应商' },
  { label: '定价方案', href: '/pricing', desc: '免费版·专业版·企业版' },
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

      {/* Steps */}
      <section>
        <div className="mx-auto max-w-4xl px-6 pb-16">
          <div className="space-y-16">
            {steps.map((step, i) => (
              <div key={step.number} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-center`}>
                {/* Image placeholder */}
                <div className="w-full md:w-1/2">
                  <div
                    className="aspect-video rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: '#FFF0ED' }}
                  >
                    <div className="text-center">
                      <span className="text-5xl font-bold" style={{ color: '#FF6034' }}>
                        {step.number}
                      </span>
                    </div>
                  </div>
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
