'use client'
import { useState } from 'react'
import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'

const faqs = [
  {
    q: '懒老板是什么？',
    a: '懒老板是专为实体老板打造的一站式生意平台。我们提供AI内容生成（短视频脚本、口播、拍摄方案）、全球供应链资源对接、门店经营智能盘点等服务，帮老板从繁琐事务中解放出来，把精力放在真正重要的事情上。',
  },
  {
    q: '全球供应链怎么用？',
    a: '您可以在"全球供应链"板块搜索商品或供应商，按品类、产地、价格等条件筛选对比，找到合适的货源后可以直接收藏或联系供应商。平台收录了数千家经过认证的全球供应商，覆盖多个热门品类。',
  },
  {
    q: '货源靠谱吗？',
    a: '我们对入驻供应商进行资质审核，包括企业营业执照、生产资质、历史交易记录等。同时，平台提供用户评价和评分系统，帮助您判断供应商的可靠性。但建议您在与供应商合作前，自行进行必要的尽职调查。',
  },
  {
    q: '怎么联系供应商？',
    a: '在商品详情页点击"联系供应商"按钮，填写您的需求和联系方式，系统会将您的询盘信息发送给供应商。您也可以在"我的资源库"中管理已收藏或联系过的供应商，方便后续跟进。',
  },
  {
    q: '可以免费使用吗？',
    a: '懒老板提供免费的基础服务，包括浏览商品、搜索供应商、AI内容生成体验等功能。部分高级功能（如深度AI内容生成、供应链高级筛选、门店经营深度分析等）可能需要付费订阅。具体定价请参考"定价"页面。',
  },
  {
    q: '一件代发是什么？',
    a: '一件代发（Dropshipping）是一种电商模式：您接单后，由供应商直接发货给您的客户，您无需囤货。懒老板平台上标注"支持一件代发"的供应商均支持此模式，适合想要低风险启动电商业务的用户。',
  },
  {
    q: '怎么收藏商品？',
    a: '在商品或供应商卡片上点击爱心图标即可收藏。所有收藏的内容会保存在"我的资源库"中，方便您随时查看和对比。您也可以在资源库中对收藏项进行备注和分类管理。',
  },
  {
    q: '商品信息多久更新？',
    a: '供应商的商品信息会定期同步更新，通常每24小时刷新一次。部分热门品类的价格和库存可能会有实时变动，建议您与供应商直接沟通确认最新信息。',
  },
  {
    q: '我能在手机上用吗？',
    a: '可以。懒老板是响应式设计，在手机浏览器上即可正常使用所有功能。您也可以将懒老板添加到手机主屏幕，获得类似App的使用体验。iOS用户通过Safari分享菜单选择"添加到主屏幕"，Android用户通过Chrome菜单选择"添加到主屏幕"。',
  },
  {
    q: '怎么反馈意见？',
    a: '您可以通过平台内的反馈入口提交意见和建议。您的每条反馈我们都会认真对待，帮助我们不断改进产品。如果您遇到问题或需要帮助，也可以通过帮助中心查找常见问题解答。',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />

      {/* Header */}
      <section className="mx-auto max-w-3xl px-6 pt-24 pb-10 text-center">
        <h1 className="section-title">
          常见问题
        </h1>
        <p className="section-subtitle mt-4">
          关于懒老板的常见疑问，这里都有答案
        </p>
      </section>

      {/* FAQ List */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className="card overflow-hidden !p-0 transition-all hover:shadow-apple-md"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-gray-900 font-medium transition-colors hover:bg-gray-50"
                >
                  <span className="pr-4">Q: {faq.q}</span>
                  <svg
                    className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-0 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                    <div className="pt-3">
                      {faq.a}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Still have questions */}
      <section className="border-t border-gray-100 bg-gray-50/50">
        <div className="mx-auto max-w-xl px-6 py-14 text-center">
          <h2 className="text-lg font-bold text-gray-900">还有问题？</h2>
          <p className="mt-2 text-sm text-gray-500">
            没找到想要的答案？去帮助中心查看更多指南
          </p>
          <div className="mt-6">
            <Link
              href="/help"
              className="inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
              style={{ backgroundColor: '#FF6034' }}
            >
              查看使用指南
            </Link>
          </div>
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
