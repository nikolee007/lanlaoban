import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI一键短视频 - 懒老板',
  description: '选类型→填信息→AI自动生成7段短视频脚本+拍摄指导',
}

export default function AiVideoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
