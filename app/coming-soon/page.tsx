'use client'

import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiZap, FiClock, FiCheckCircle, FiArrowRight } from 'react-icons/fi'

const UPCOMING = [
  {
    name: '数字人口播',
    desc: 'AI数字人出镜口播，自动生成短视频，适合打造老板个人IP',
    eta: '2026年7月',
    status: '开发中',
    progress: 60,
    highlights: ['支持6种场景', '语音克隆', '批量生成'],
  },
  {
    name: '全球供应链',
    desc: '162家认证供应商、202个商品、TikTok热销榜、一键询盘',
    eta: '2026年7月',
    status: '内测中',
    progress: 85,
    highlights: ['语义搜索', '智能推荐', '供应商认证'],
  },
  {
    name: '一键建站',
    desc: 'AI一键生成独立站，自动适配多语言，适合跨境电商卖家',
    eta: '2026年8月',
    status: '规划中',
    progress: 30,
    highlights: ['多语言站点', 'SEO优化', '支付集成'],
  },
  {
    name: '跨境电商工具',
    desc: '商品图生成、详情页优化、多平台一键发布',
    eta: '2026年8月',
    status: '规划中',
    progress: 25,
    highlights: ['AI商品图', '多平台对接', '智能定价'],
  },
  {
    name: '定价',
    desc: '灵活的定价方案，满足不同规模企业的需求',
    eta: '2026年8月',
    status: '规划中',
    progress: 15,
    highlights: ['免费试用', '按需付费', '企业定制'],
  },
]

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  '开发中': { bg: 'bg-blue-50', text: 'text-blue-600', icon: FiZap },
  '内测中': { bg: 'bg-purple-50', text: 'text-purple-600', icon: FiCheckCircle },
  '规划中': { bg: 'bg-gray-50', text: 'text-gray-500', icon: FiClock },
}

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            更多功能<span className="text-[#FF6034]">即将上线</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            我们正在全力打造这些功能，敬请期待
          </p>
        </div>

        {/* 已开放功能 */}
        <div className="mb-16">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiCheckCircle className="text-green-500" size={20} />
            已开放
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/persona" className="group relative bg-white rounded-2xl p-5 border border-green-100 hover:border-green-300 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#FF6034] transition-colors">一键做IP 🤖</h3>
                  <p className="text-sm text-gray-500 mt-1">AI人设方案生成 + 脚本生成</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <FiCheckCircle size={12} /> 已开放
                </span>
              </div>
            </Link>
            <Link href="/brand-promotion" className="group relative bg-white rounded-2xl p-5 border border-green-100 hover:border-green-300 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#FF6034] transition-colors">产品可视化 🤖</h3>
                  <p className="text-sm text-gray-500 mt-1">AI生成多语言宣传视频，同步/异步生成</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <FiCheckCircle size={12} /> 已开放
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* 即将上线功能 */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiClock className="text-[#FF6034]" size={20} />
          即将上线
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {UPCOMING.map((f) => {
            const style = STATUS_STYLES[f.status] || STATUS_STYLES['规划中']
            const Icon = style.icon
            return (
              <div key={f.name} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${style.bg} ${style.text}`}>
                    <Icon size={12} />
                    {f.status}
                  </span>
                  <span className="text-xs text-gray-400">{f.eta}</span>
                </div>

                {/* Name & Desc */}
                <h3 className="font-semibold text-gray-900 mb-1">{f.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{f.desc}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>开发进度</span>
                    <span>{f.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF6034] to-purple-500 transition-all"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5">
                  {f.highlights.map((h) => (
                    <span key={h} className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{h}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 text-sm mb-4">想在第一时间了解功能上线进度？</p>
          <Link
            href="/persona"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6034] text-white rounded-xl font-semibold hover:bg-[#E8552E] transition-all shadow-lg shadow-[#FF6034]/25"
          >
            立即体验已开放功能 <FiArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
