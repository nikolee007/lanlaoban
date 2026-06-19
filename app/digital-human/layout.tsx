import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI数字人口播 - 懒老板',
  description: '上传照片或视频，AI自动生成数字人口播视频，支持10秒声音克隆',
}

export default function DigitalHumanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
