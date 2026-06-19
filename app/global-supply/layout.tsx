'use client'
import dynamic from 'next/dynamic'

// 动态导入 NavHeader，减少首屏 bundle 体积
const NavHeader = dynamic(() => import('../components/NavHeader'), {
  ssr: false,
})

export default function GlobalSupplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavHeader />
      {children}
    </>
  )
}
