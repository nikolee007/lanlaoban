import Link from 'next/link'
import { FiCamera, FiGlobe } from 'react-icons/fi'

export default function BottomBanner() {
  return (
    <div className="mt-8 rounded-2xl bg-gradient-to-b from-brand-50 to-white border border-brand-100/50 p-6 text-center">
      <p className="text-sm font-semibold text-gray-900">借势，不是造轮子</p>
      <p className="text-xs text-gray-400 mt-1">
        照片用美图秀秀 / 豆包 | 视频由 Agnes AI 生成 | 配音由 NAS edge-tts 提供 | 声音克隆即将接入
      </p>
      <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
        <Link href="/ai-video" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          <FiCamera className="h-3 w-3" /> 一键短视频
        </Link>
        <Link href="/cross-border" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          <FiGlobe className="h-3 w-3" /> 跨境AI工具
        </Link>
      </div>
    </div>
  )
}
