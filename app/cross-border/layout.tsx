import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '跨境电商AI工具 - 懒老板',
  description: '上传商品照片，一键生成多语言卖点文案、详情页图片和带货视频',
}

export default function CrossBorderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
