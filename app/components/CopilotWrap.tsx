'use client'
import { usePathname } from 'next/navigation'
import { CopilotKit } from '@copilotkit/react-core'
import { CopilotSidebar } from '@copilotkit/react-ui'

/** AI 助手包装：Demo 展示页不加载（避免未登录 /api/copilotkit 401 触发 script error） */
export default function CopilotWrap({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/demo')) return <>{children}</>

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      {children}
      <CopilotSidebar
        defaultOpen={false}
        labels={{
          title: '懒老板 AI 助手',
          initial: '你好！我是懒老板 AI 助手，可以帮你：\n\n- 生成老板IP人设方案\n- 制作产品宣传视频\n- 回答懒老板平台使用问题\n\n有什么可以帮你的？',
        }}
      />
    </CopilotKit>
  )
}
