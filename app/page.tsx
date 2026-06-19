'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiArrowRight, FiSearch, FiZap, FiPackage, FiStar, FiCamera, FiGlobe, FiUser, FiTrendingUp, FiTruck, FiMessageCircle } from 'react-icons/fi'
import NavHeader from './components/NavHeader'

type Role = 'local' | 'crossborder'
interface ProductItem { id: number; name: string; priceMin: number | null; priceMax: number | null; rating: number | null }

const ROLE_INFO = {
  local: {
    title: '做内容，线上获客',
    desc: 'AI帮你做短视频，打造同城影响力',
    accent: '#FF6034',
    features: [
      { icon: 'FiMessageCircle', label: 'AI编导采访', desc: '像聊天一样说你的故事', href: '/interview' },
      { icon: 'FiZap', label: '一键生成脚本', desc: '30条爆款脚本，拿来就用', href: '/ai-video' },
      { icon: 'FiCamera', label: '拍摄指导', desc: '分镜头脚本+机位教程', href: '/ai-video' },
      { icon: 'FiUser', label: '账号诊断', desc: '抖/红书账号AI分析优化', href: '/diagnose' },
    ]
  },
  crossborder: {
    title: '找货源，对接工厂',
    desc: '全球供应链直连，一站式采购出海',
    accent: '#2563EB',
    features: [
      { icon: 'FiSearch', label: '搜商品找工厂', desc: '80+品类，工厂/品牌/分销', href: '/global-supply/search' },
      { icon: 'FiPackage', label: '热销榜单', desc: 'TikTok热门趋势实时更新', href: '/global-supply/hot' },
      { icon: 'FiTruck', label: '联系供应商', desc: '询盘直发，极速响应', href: '/global-supply' },
      { icon: 'FiGlobe', label: 'AI建站工具', desc: '聊出品牌故事，AI生成独立站', href: '/global-supply/ai-assistant' },
    ]
  }
}

export default function HomePage() {
  const [role, setRole] = useState<Role>('local')
  const [products, setProducts] = useState<ProductItem[]>([])
  const [stats, setStats] = useState({ suppliers: 0, products: 0, categories: 0 })

  useEffect(() => {
    fetch('/api/global-supply/home')
      .then(r => r.json())
      .then((data: any) => {
        if (data.success && data.data) {
          const d = data.data
          setStats({
            suppliers: d.stats?.suppliers || 0,
            products: d.stats?.products || 0,
            categories: d.stats?.categories || 0,
          })
          if (d.hotProducts?.length) setProducts(d.hotProducts.slice(0, 6))
        }
      })
      .catch(() => {})
  }, [])

  const info = ROLE_INFO[role]

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f5f5f7]">
        <div className="mx-auto max-w-6xl px-6 pt-24 sm:pt-32 pb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              onClick={() => setRole('local')}
              className={`relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${role === 'local' ? 'bg-white text-gray-900 shadow-lg border border-orange-200 scale-105' : 'bg-gray-100/60 text-gray-500 hover:bg-gray-100 border border-transparent'}`}
            >
              <span className="flex items-center gap-2"><FiCamera className="w-4 h-4" /> 我是实体老板</span>
            </button>
            <button
              onClick={() => setRole('crossborder')}
              className={`relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${role === 'crossborder' ? 'bg-white text-gray-900 shadow-lg border border-blue-200 scale-105' : 'bg-gray-100/60 text-gray-500 hover:bg-gray-100 border border-transparent'}`}
            >
              <span className="flex items-center gap-2"><FiGlobe className="w-4 h-4" /> 我是跨境卖家</span>
            </button>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/70 backdrop-blur-sm px-4 py-1.5 text-sm font-medium shadow-sm mb-6"
              style={{ color: info.accent }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: info.accent }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: info.accent }} />
              </span>
              {role === 'local' ? 'AI短视频 - 新功能上线' : '全球供应链 - 数据已更新'}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1d1d1f] leading-[1.05] mb-5">
              懒老板<br />
              <span className="block mt-1" style={{ background: `linear-gradient(135deg, ${info.accent}, ${role === 'local' ? '#8B5CF6' : '#0EA5E9'})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {info.title}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-[#86868b] max-w-xl mx-auto leading-relaxed mb-8">{info.desc}</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href={role === 'local' ? '/interview' : '/global-supply/search'}
                className="inline-flex items-center gap-2 rounded-[14px] px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg, ${info.accent}, ${role === 'local' ? '#8B5CF6' : '#0EA5E9'})` }}>
                {role === 'local' ? '开始采访 - 免费生成脚本' : '搜索全球货源'}
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link href={role === 'local' ? '/ai-video' : '/global-supply'}
                className="inline-flex items-center gap-2 rounded-[14px] border border-gray-200/80 bg-white/70 backdrop-blur-sm px-7 py-3.5 text-[15px] font-semibold text-[#1d1d1f] shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white">
                {role === 'local' ? '直接看模板' : '浏览所有品类'}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {info.features.map((f, i) => {
            let Icon;
            switch (f.icon) {
              case 'FiMessageCircle': Icon = FiMessageCircle; break;
              case 'FiZap': Icon = FiZap; break;
              case 'FiCamera': Icon = FiCamera; break;
              case 'FiUser': Icon = FiUser; break;
              case 'FiSearch': Icon = FiSearch; break;
              case 'FiPackage': Icon = FiPackage; break;
              case 'FiTruck': Icon = FiTruck; break;
              case 'FiGlobe': Icon = FiGlobe; break;
              default: Icon = FiZap;
            }
            return (
              <Link key={i} href={f.href}
                className="group rounded-2xl border border-gray-200/60 bg-white p-5 shadow-apple transition-all duration-300 hover:shadow-apple-md hover:-translate-y-0.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3"
                  style={{ background: `${info.accent}15`, color: info.accent }}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-[#1d1d1f] mb-0.5">{f.label}</h3>
                <p className="text-xs text-[#86868b]">{f.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-3xl bg-white border border-gray-200/60 p-8 sm:p-10 shadow-apple">
          <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">
            {role === 'local' ? '三步搞定短视频' : '三步找到好货源'}
          </h2>
          <p className="text-sm text-[#86868b] mb-8">
            {role === 'local' ? '从了解你的生意到发布一条爆款短视频，全程AI辅助' : '从搜索到联系供应商，懒老板帮你对接一手工厂'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {role === 'local' ? (
              <>
                <StepCard num="01" title="AI编导采访你" desc="像聊天一样回答问题，AI自动提取行业/产品/人设" icon={FiMessageCircle} href="/interview" color="#FF6034" />
                <StepCard num="02" title="AI生成30条脚本" desc="选个教练风格，一键生成30条爆款脚本+分镜头指导" icon={FiZap} href="/ai-video" color="#8B5CF6" />
                <StepCard num="03" title="牧着拍，发布获客" desc="手机架好，按分镜头脚本拍，剪映剪一下就能发抖音" icon={FiCamera} href="/ai-video" color="#2563EB" />
              </>
            ) : (
              <>
                <StepCard num="01" title="搜索商品/工厂" desc="按品类/关键词/地区搜索，找到你想要的货源" icon={FiSearch} href="/global-supply/search" color="#2563EB" />
                <StepCard num="02" title="对比筛选" desc="看评分、价格、起订量，对比认证供应商" icon={FiStar} href="/global-supply/suppliers" color="#0EA5E9" />
                <StepCard num="03" title="联系·采购" desc="一键询盘，直达工厂，支持一件代发和OEM定制" icon={FiTruck} href="/global-supply" color="#059669" />
              </>
            )}
          </div>
        </div>
      </section>
      {products.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#1d1d1f]">
                {role === 'local' ? '热销好物 · 拍什么火什么' : '全球热销趋势品'}
              </h2>
              <p className="text-sm text-[#86868b] mt-1">当前精选 {products.length} 款商品，数据来自认证供应商</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {products.map((p, i) => {
              const emojis = ['\ud83d\udcf1','\u26a1','\ud83c\udfe0','\ud83d\udc57','\ud83d\udc84','\ud83c\udfc3','\ud83c\udf73','\ud83d\udcbb','\ud83d\udc3e','\ud83c\udf81','\ud83d\udd27','\ud83c\udf7d'];
              return (
                <Link key={i} href={`/global-supply/search?q=${encodeURIComponent(p.name)}`}
                  className="group rounded-2xl border border-gray-200/60 bg-white p-3 shadow-apple transition-all duration-300 hover:shadow-apple-md hover:-translate-y-0.5">
                  <div className="w-full aspect-square rounded-xl bg-[#f5f5f7] overflow-hidden mb-2 flex items-center justify-center">
                    <div className="text-3xl opacity-30">{emojis[i % 12]}</div>
                  </div>
                  <h3 className="text-xs font-semibold text-[#1d1d1f] line-clamp-1 leading-tight">{p.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    {p.priceMin != null && (
                      <span className="text-xs font-bold" style={{ color: '#FF6034' }}>
                        ¥{p.priceMin}{p.priceMax !== p.priceMin ? `-${p.priceMax}` : ''}
                      </span>
                    )}
                    {p.rating != null && (
                      <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                        <FiStar className="w-3 h-3 text-amber-400" /> {p.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
      <section className="border-t border-gray-200/60 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: `${stats.products}+`, label: '精选商品', color: '#FF6034' },
              { value: `${stats.categories}+`, label: '覆盖品类', color: '#2563EB' },
              { value: `${stats.suppliers}+`, label: '认证供应商', color: '#8B5CF6' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-sm text-[#86868b] mt-1.5">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[#86868b] mt-4 opacity-60">数据来源：懒老板供应链数据库 · 每日更新</p>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="rounded-3xl bg-gradient-to-b from-[#FFF5F0] to-white border border-[#FF6034]/10 p-10 sm:p-14 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
              {role === 'local' ? '也在做跨境？来看看全球货源' : '也在做短视频？来看看AI脚本'}
            </h2>
            <p className="mt-2 text-[#86868b] text-sm max-w-md mx-auto">
              {role === 'local' ? '找到好货，拍出来更吸粉。一键生成短视频脚本，商品+内容一起搞定' : '找到货源后，用AI一键生成带货脚本，TikTok/抖音同步发'}
            </p>
            <button onClick={() => setRole(role === 'local' ? 'crossborder' : 'local')}
              className="mt-6 inline-flex items-center gap-2 rounded-[14px] px-7 py-3.5 text-[15px] font-semibold shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              style={{ backgroundColor: role === 'local' ? '#2563EB' : '#FF6034', color: 'white' }}>
              {role === 'local' ? <FiGlobe className="w-4 h-4" /> : <FiCamera className="w-4 h-4" />}
              {role === 'local' ? '去看看全球货源' : '去看看AI短视频'}
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
      <footer className="border-t border-gray-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-3 flex-wrap text-sm">
            <Link href="/global-supply" className="text-[#86868b] hover:text-brand-400 transition-colors">找货源</Link>
            <Link href="/ai-video" className="text-[#86868b] hover:text-brand-400 transition-colors">AI短视频</Link>
            <Link href="/interview" className="text-[#86868b] hover:text-brand-400 transition-colors">编导采访</Link>
            <Link href="/digital-human" className="text-[#86868b] hover:text-brand-400 transition-colors">数字人口播</Link>
            <Link href="/cross-border" className="text-[#86868b] hover:text-brand-400 transition-colors">跨境AI工具</Link>
            <Link href="/diagnose" className="text-[#86868b] hover:text-brand-400 transition-colors">账号诊断</Link>
            <Link href="/about" className="text-[#86868b] hover:text-brand-400 transition-colors">关于</Link>
            <Link href="/faq" className="text-[#86868b] hover:text-brand-400 transition-colors">常见问题</Link>
          </div>
          <p className="text-sm text-[#86868b]">懒老板 — AI内容获客 + 全球货源直连 · 一站式生意平台</p>
        </div>
      </footer>
    </div>
  )
}

function StepCard(props: {
  num: string; title: string; desc: string; icon: React.ComponentType<{className?:string; style?:React.CSSProperties}>; href: string; color: string
}) {
  const { num, title, desc, icon: Icon, href, color } = props
  return (
    <Link href={href} className="group block">
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5"
        style={{ borderColor: `${color}20`, backgroundColor: `${color}08` }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold" style={{ backgroundColor: color }}>
            {num}
          </div>
          <Icon className="w-5 h-5 opacity-40" style={{ color }} />
        </div>
        <h3 className="text-base font-bold text-[#1d1d1f] mb-1">{title}</h3>
        <p className="text-xs text-[#86868b] leading-relaxed">{desc}</p>
      </div>
    </Link>
  )
}
