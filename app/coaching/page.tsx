'use client'
import { useState } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import { FiAlertTriangle, FiCamera, FiEye, FiMic, FiVolume2, FiUser, FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi'

const allFixes = [
  { problem: '眼神飘忽', fix: '镜头边缘贴小标记点，老板说话时看标记点不要看镜头', shot: '近景固定机位，减少移动', icon: 'eye' },
  { problem: '语速过快', fix: '编导用手势下压示意放慢，拆分三点话术逐条停顿', shot: '切换行走纪实镜头，边走边放缓语速', icon: 'volume' },
  { problem: '紧张卡壳', fix: '暂停，换场景（车间移步、摸产品）再重新开口', shot: '切换到产品特写镜头，手持产品再说话', icon: 'alert' },
  { problem: '表情僵硬', fix: '开拍前闲聊行业日常，先放松情绪再正式录', shot: '先拍行走纪实片段热身，最后补口播', icon: 'user' },
  { problem: '说话生硬像背稿', fix: '改用聊天提问式输出，编导提问老板回答，放弃背文案', shot: '改为边走边讲纪实模式', icon: 'mic' },
  { problem: '废话太多跑题', fix: '中途打断，拉回关键词，重新提问引导', shot: '切换场景重置话题', icon: 'alert' },
  { problem: '眼神看地板', fix: '镜头高度调低至与视线平齐，老板前方地面贴标记', shot: '固定机位，降低镜头高度', icon: 'eye' },
  { problem: '无手势太僵硬', fix: '给老板手里拿产品/工具，自然就有手势了', shot: '手持产品口播特写', icon: 'user' },
  { problem: '频繁眨眼', fix: '开拍前闭眼休息30秒，减少紧张性眨眼', shot: '切换行走镜头，减少长时间盯镜头', icon: 'eye' },
  { problem: '声音太小没底气', fix: '让老板站直，深呼吸两次再开口', shot: '拉近镜头距离，增强压迫感', icon: 'volume' },
  { problem: '记不住话', fix: '不要给完整稿，只给3个关键词提示', shot: '用提问式引导，一句一问', icon: 'mic' },
  { problem: '容易忘词中断', fix: '改为分段录制，一句话录一条，剪辑拼接', shot: '固定位口播缩短为单句拍', icon: 'mic' },
  { problem: '总是看提词器', fix: '拆除提词器，改用关键词手卡', shot: '改为行走纪实模式，不用盯镜头', icon: 'eye' },
  { problem: '表情严肃像生气', fix: '开拍前讲个笑话，让面部肌肉放松', shot: '拍一段与员工/顾客互动的纪实素材', icon: 'user' },
  { problem: '紧张时声音发抖', fix: '先录2条废片热身，正式录第3条', shot: '先拍不需要说话的场景素材热身', icon: 'volume' },
  { problem: '不习惯看镜头', fix: '让老板对着镜头旁边的手机屏幕看自己', shot: '固定机位，镜头旁放手机投屏', icon: 'eye' },
  { problem: '灯光刺眼睁不开', fix: '调整补光灯角度45°侧打，不要直射眼睛', shot: '移到窗边用自然光代替补光', icon: 'camera' },
  { problem: '面部油光反光', fix: '用纸巾按压吸油，不上妆不用散粉', shot: '调整光源角度减少正面直射', icon: 'camera' },
]

const iconMap: Record<string, any> = {
  eye: FiEye, volume: FiVolume2, alert: FiAlertTriangle, user: FiUser, mic: FiMic, camera: FiCamera,
}

export default function CoachingPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = allFixes.filter(f => f.problem.includes(search) || f.fix.includes(search))

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">出镜纠错手册</h1>
        <p className="text-gray-500 text-sm mb-6">22类老板常见出镜问题，现场编导即时调整方案</p>

        <div className="relative mb-6">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="搜索问题..." />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map(f => {
            const Icon = iconMap[f.icon] || FiAlertTriangle
            const isExpanded = expanded === f.problem
            return (
              <div key={f.problem} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-brand-200 transition-all">
                <button className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50"
                  onClick={() => setExpanded(isExpanded ? null : f.problem)}>
                  <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-brand-400" />
                  </div>
                  <span className="font-medium text-sm flex-1">{f.problem}</span>
                  {isExpanded ? <FiChevronUp className="text-gray-400 shrink-0" /> : <FiChevronDown className="text-gray-400 shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-green-700 mb-1">编导调整话术</p>
                      <p className="text-sm text-green-800">{f.fix}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-700 mb-1">镜头调整方案</p>
                      <p className="text-sm text-blue-800">{f.shot}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t">
          <Link href="/guide" className="btn-primary flex-1 text-center"><FiCamera className="w-4 h-4 mr-1 inline" />拍摄指导</Link>
          <Link href="/scenes" className="btn-outline flex-1 text-center"><FiCamera className="w-4 h-4 mr-1 inline" />场景方案</Link>
        </div>
      </main>
    </div>
  )
}
