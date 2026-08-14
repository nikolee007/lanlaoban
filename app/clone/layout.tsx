import type { Metadata } from 'next'
export const metadata: Metadata = { title: '老板克隆分身 · 懒老板' }
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
