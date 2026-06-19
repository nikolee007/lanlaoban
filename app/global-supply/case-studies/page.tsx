'use client'
import Link from 'next/link'
import Breadcrumb from '@/app/components/Breadcrumb'
import { FiTrendingUp, FiStar, FiArrowRight } from 'react-icons/fi'
import { productPlaceholderSVG } from '@/lib/product-placeholder'

/* ─── Types ─────────────────────────────────────── */

interface CaseStudy {
  id: number
  name: string
  industry: string
  result: string
  description: string
  productName: string
}

/* ─── Mock Data ──────────────────────────────────── */

const caseStudies: CaseStudy[] = [
  {
    id: 1,
    name: '深圳张老板',
    industry: '数码电子',
    result: '首批500副 · 月销3000+',
    description:
      '通过懒老板找到蓝牙耳机工厂，首批订单500副试水。产品上架后1周售罄，紧急追加订单。3个月后稳定月销3000+，月利润突破15万。',
    productName: '蓝牙耳机',
  },
  {
    id: 2,
    name: '义乌李女士',
    industry: '家居用品',
    result: '首单$5000 · 出口东南亚',
    description:
      '通过懒老板对接陶瓷餐具供应商，定制品牌LOGO出口菲律宾和马来西亚。从询盘到首单仅用12天，客户反馈品质优于当地同类产品。',
    productName: '陶瓷餐具',
  },
  {
    id: 3,
    name: '广州陈总',
    industry: '服装鞋帽',
    result: '代工合作 · 年订单200万',
    description:
      '运动服装品牌创始人，在懒老板找到福建运动服工厂。经过3轮样品确认，达成长期OEM合作，年订单额超200万元。',
    productName: '运动服',
  },
  {
    id: 4,
    name: '杭州王哥',
    industry: '宠物用品',
    result: '32款SKU · 月销5000+',
    description:
      '宠物用品品牌主理人，通过懒老板对接5家宠物玩具和用品工厂，开发32个SKU。抖音直播间月销5000+单，复购率35%。',
    productName: '宠物玩具',
  },
  {
    id: 5,
    name: '成都刘姐',
    industry: '食品饮料',
    result: '定制包装 · 超市上架',
    description:
      '想做自有品牌坚果零食，通过懒老板找到山东坚果代工厂。从包装设计到成品出货仅用25天，已成功进入成都3家连锁超市。',
    productName: '每日坚果',
  },
  {
    id: 6,
    name: '东莞周老板',
    industry: '美妆个护',
    result: '开款48个 · 月销50万',
    description:
      '化妆品贸易商，在懒老板找到4家护肤品代工厂。半年内开发48个SKU，覆盖面膜、精华、面霜等品类，月销售额突破50万元。',
    productName: '护肤品套装',
  },
  {
    id: 7,
    name: '厦门林先生',
    industry: '跨境贸易',
    result: '月柜3个 · 海外仓备货',
    description:
      'Amazon美国站卖家，通过懒老板对接充电宝和手机配件工厂。产品上架Amazon首月即获Best Seller标签，月出3个40尺柜。',
    productName: '充电宝',
  },
]

/* ─── Page Component ────────────────────────────── */

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <Breadcrumb
          className="mb-6"
          items={[
            { label: '全球资源', href: '/global-supply' },
            { label: '成功案例' },
          ]}
        />

        {/* Header */}
        <section className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            老板们的真实采购故事
          </h1>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            看看其他老板如何通过懒老板找到好货源、打开新市场
          </p>
        </section>

        {/* Case Studies Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((cs) => (
            <CaseCard key={cs.id} study={cs} />
          ))}
        </div>

        {/* CTA */}
        <section className="mt-16 rounded-2xl px-8 py-14 text-center"
          style={{ background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE4D6 100%)' }}
        >
          <h2 className="text-2xl font-bold text-gray-900">开始你的采购之旅</h2>
          <p className="mt-2 text-gray-500">免费使用，连接全球好货源</p>
          <div className="mt-6">
            <Link
              href="/global-supply"
              className="inline-flex items-center gap-2 rounded-lg px-8 py-3 text-base font-semibold text-white shadow-sm transition-all hover:brightness-110"
              style={{ backgroundColor: '#FF6034' }}
            >
              开始找货源
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-center text-sm text-gray-400">
          懒老板 — 实体老板一站式生意平台
        </div>
      </footer>
    </div>
  )
}

/* ─── Case Card Component ───────────────────────── */

function CaseCard({ study }: { study: CaseStudy }) {
  return (
    <div className="group rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden">
      {/* Product Image */}
      <div className="aspect-[16/9] w-full overflow-hidden bg-gray-50">
        <img
          src={productPlaceholderSVG(study.productName, 400, 225, study.id)}
          alt={study.productName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Customer + Industry */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: '#FF6034' }}
          >
            {study.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 truncate">{study.name}</h3>
            <p className="text-xs text-gray-400">{study.industry}</p>
          </div>
        </div>

        {/* Result Badge */}
        <div className="mb-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: '#FFF5F0', color: '#FF6034' }}
        >
          <FiTrendingUp className="w-3 h-3" />
          {study.result}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed">
          {study.description}
        </p>

        {/* Product Tag */}
        <div className="mt-3 flex items-center gap-1.5">
          <FiStar className="w-3.5 h-3.5" style={{ color: '#FF6034' }} />
          <span className="text-xs font-medium" style={{ color: '#FF6034' }}>
            {study.productName}
          </span>
        </div>
      </div>
    </div>
  )
}
