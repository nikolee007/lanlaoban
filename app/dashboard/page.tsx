'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'
import { FiMessageSquare, FiCamera, FiCpu, FiFileText, FiCheckSquare, FiVideo, FiMail, FiCheck, FiLock, FiZap, FiArrowRight } from 'react-icons/fi'

interface ServiceStatus {
  serviceActive: boolean
  interviewed: boolean
  hasAvatar: boolean
}

interface Step {
  n: number
  title: string
  desc: string
  href: string
  icon: typeof FiMail
  free?: boolean
  key?: keyof ServiceStatus
}

const STEPS: Step[] = [
  { n: 1, title: '了解用户', desc: 'AI 采访：门店 / 卖点 / 客群', href: '/interview', icon: FiMessageSquare, free: true, key: 'interviewed' },
  { n: 2, title: '收集素材', desc: '本人照片 / 口播采样 / 产品图', href: '/clone', icon: FiCamera, free: true, key: 'hasAvatar' },
  { n: 3, title: 'AI 分析', desc: '操盘手诊断账号阶段', href: '/agent', icon: FiCpu },
  { n: 4, title: '运营方案', desc: '内容策略 + 脚本方案', href: '/agent', icon: FiFileText },
  { n: 5, title: '用户拍板', desc: '确认方案，开始制作', href: '/agent', icon: FiCheckSquare },
  { n: 6, title: '开始制作', desc: '克隆分身 + 数字人 + 产品可视化', href: '/clone', icon: FiVideo },
  { n: 7, title: '邮箱交付', desc: '定制化短视频发到邮箱', href: '/profile', icon: FiMail },
]

export default function DashboardPage() {
  const [status, setStatus] = useState<ServiceStatus>({ serviceActive: false, interviewed: false, hasAvatar: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/status')
      .then((r) => r.json())
      .then((d) => { if (d?.success) setStatus(d.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const doneCount = (status.interviewed ? 1 : 0) + (status.hasAvatar ? 1 : 0)

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 头部：服务状态 */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FiZap className="text-brand-400" /> 我的短视频服务
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              懒老板按流程帮你生产定制化短视频，最后发到你的邮箱。
            </p>
          </div>
          <div className="flex items-center gap-3">
            {status.serviceActive ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 border border-green-100 rounded-full px-4 py-2">
                <FiCheck className="w-4 h-4" /> 服务已开通
              </span>
            ) : (
              <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-brand-400 rounded-full px-5 py-2.5 hover:opacity-90">
                开通服务 <FiArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* 免费阶段进度 */}
        {!status.serviceActive && (
          <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">免费阶段 · 先了解你，再收集素材</p>
              <span className="text-xs text-gray-400">{doneCount}/2 已完成</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-400 rounded-full transition-all" style={{ width: `${(doneCount / 2) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-3">完成前两步后，开通服务即可开始制作专属短视频。</p>
          </div>
        )}

        {/* 7 步流程 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STEPS.map((s) => {
            const Icon = s.icon
            const isFree = s.free
            const done = s.key ? status[s.key] : false
            const locked = !isFree && !status.serviceActive

            return (
              <div key={s.n}>
                {isFree ? (
                  <Link href={s.href}
                    className={`block bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${done ? 'border-green-200' : 'border-gray-100'}`}>
                    <StepCard step={s} icon={<Icon className={`w-6 h-6 ${done ? 'text-green-500' : 'text-brand-400'}`} />} done={done} locked={false} />
                  </Link>
                ) : (
                  <div className={`bg-white rounded-2xl p-5 border transition-all ${locked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md border-gray-100'}`}>
                    {locked ? (
                      <StepCard step={s} icon={<Icon className="w-6 h-6 text-gray-300" />} done={false} locked />
                    ) : (
                      <Link href={s.href} className="block">
                        <StepCard step={s} icon={<Icon className="w-6 h-6 text-brand-400" />} done={false} locked={false} />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* 付费墙占位卡 */}
          {!status.serviceActive && (
            <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-5 border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <FiLock className="w-5 h-5 text-brand-400" />
                <p className="font-semibold text-sm">第 3 步起：付费后自动运作</p>
              </div>
              <p className="text-xs text-gray-500 mb-3">开通服务后，AI 分析 → 运营方案 → 制作 → 邮箱交付，懒老板替你全程跑。</p>
              <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-medium text-brand-400 hover:underline">
                查看套餐 <FiArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* 已开通提示 */}
        {status.serviceActive && (
          <div className="mt-6 bg-green-50 border border-green-100 rounded-2xl p-5">
            <p className="text-sm font-semibold text-green-700 mb-2">服务已开通，懒老板开始为你运作</p>
            <p className="text-xs text-green-600">从「AI 分析」开始，一步步完成方案和制作，成品会发到你的邮箱。</p>
          </div>
        )}
      </main>
    </div>
  )
}

function StepCard({ step, icon, done, locked }: { step: Step; icon: React.ReactNode; done: boolean; locked: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center">{icon}</div>
        {done ? (
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-green-600 bg-green-50 rounded-full px-2 py-1">
            <FiCheck className="w-3 h-3" /> 完成
          </span>
        ) : locked ? (
          <FiLock className="w-4 h-4 text-gray-300" />
        ) : (
          <span className="text-xs text-gray-300">第 {step.n} 步</span>
        )}
      </div>
      <p className="font-semibold text-sm">{step.title}</p>
      <p className="text-xs text-gray-400 mt-1">{step.desc}</p>
    </div>
  )
}
