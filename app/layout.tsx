import type { Metadata } from 'next'
import './globals.css'
import Providers from './components/Providers'
import FeedbackButton from './components/FeedbackButton'
import ErrorBoundary from './components/ErrorBoundary'
import JsonLd from './components/JsonLd'
import NewUserGuide from './components/NewUserGuide'
import BackgroundTaskMonitor from './components/BackgroundTaskMonitor'
import { CopilotKit } from '@copilotkit/react-core'
import { CopilotSidebar } from '@copilotkit/react-ui'
import '@copilotkit/react-ui/styles.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://lanlaoban.com'),
  title: '懒老板 — AI IP操盘手 · 产品可视化',
  description: 'AI帮你从IP定位到视频出片，一条龙交付。做IP还是拍产品，懒老板全搞定。',
  keywords: [
    '懒老板','AI操盘手','IP打造','短视频','数字人','产品可视化',
    'AI视频','品牌推广','内容创作','实体老板IP',
  ],
  authors: [{ name: '懒老板团队' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: '懒老板 — AI IP操盘手 · 产品可视化',
    description: 'AI帮你从IP定位到视频出片，一条龙交付。',
    type: 'website',
    locale: 'zh_CN',
    siteName: '懒老板',
  },
  twitter: {
    card: 'summary_large_image',
    title: '懒老板 — AI IP操盘手 · 产品可视化',
    description: 'AI帮你从IP定位到视频出片，一条龙交付。',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <JsonLd
          type="WebSite"
          data={{
            name: '懒老板',
            url: 'https://lanlaoban.com',
            description: 'AI帮你从IP定位到视频出片，一条龙交付。',
          }}
        />
        <script dangerouslySetInnerHTML={{
          __html: `
          // 同步 localStorage token 到 cookie（用于 middleware 路由守卫）
          try {
            var t = localStorage.getItem('lanlaoban_token');
            if (t && !document.cookie.includes('lanlaoban_token=')) {
              document.cookie = 'lanlaoban_token=' + encodeURIComponent(t) + ';path=/;max-age=' + (86400*7);
            }
          } catch(e) {}
          window.addEventListener('error', function(e) {
            var d = document.getElementById('__crash');
            if(!d) { d = document.createElement('div'); d.id='__crash'; d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:rgba(220,38,38,0.95);color:white;padding:16px 24px;font-size:14px;font-family:monospace;white-space:pre-wrap;line-height:1.5'; document.body.prepend(d); }
            d.textContent = '\\u26a0\\ufe0f ' + (e.error ? e.error.stack || e.error.message : e.message || 'unknown');
            e.preventDefault();
          });
          window.addEventListener('unhandledrejection', function(e) {
            var ev = new ErrorEvent('error', { error: e.reason, message: e.reason ? (e.reason.message || String(e.reason)) : 'unhandled rejection' });
            window.dispatchEvent(ev);
          });
          `
        }} />
        <ErrorBoundary fullPage>
          <CopilotKit runtimeUrl="/api/copilotkit">
          <Providers>
            {children}
            <BackgroundTaskMonitor />
            <FeedbackButton />
            <NewUserGuide />
          </Providers>
          <CopilotSidebar
            defaultOpen={false}
            labels={{
              title: '懒老板 AI 助手',
              initial: '你好！我是懒老板 AI 助手，可以帮你：\n\n- 生成老板IP人设方案\n- 制作产品宣传视频\n- 回答懒老板平台使用问题\n\n有什么可以帮你的？',
            }}
          />
          </CopilotKit>
        </ErrorBoundary>
      </body>
    </html>
  )
}
