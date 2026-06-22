import type { Metadata } from 'next'
import './globals.css'
import Providers from './components/Providers'
import FeedbackButton from './components/FeedbackButton'
import ErrorBoundary from './components/ErrorBoundary'
import JsonLd from './components/JsonLd'
import NewUserGuide from './components/NewUserGuide'
import BackgroundTaskMonitor from './components/BackgroundTaskMonitor'

export const metadata: Metadata = {
  metadataBase: new URL('https://lanlaoban.com'),
  title: '懒老板 — 老板一站式服务平台 | IP内容 · 门店盘点 · 全球供应链',
  description: 'AI帮你生成IP内容、盘点门店经营、对接全球资源',
  keywords: [
    '懒老板','全球供应链','工厂对接','货源采购','跨境物流',
    'OEM代工','一件代发','供应链管理','跨境电商',
    '找工厂','找货源','找渠道','AI内容生成','门店经营',
  ],
  authors: [{ name: '懒老板团队' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: '懒老板 — 老板一站式服务平台 | IP内容 · 门店盘点 · 全球供应链',
    description: 'AI帮你生成IP内容、盘点门店经营、对接全球资源',
    type: 'website',
    locale: 'zh_CN',
    siteName: '懒老板',
  },
  twitter: {
    card: 'summary_large_image',
    title: '懒老板 — 老板一站式服务平台',
    description: 'AI帮你生成IP内容、盘点门店经营、对接全球资源',
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
            description: 'AI帮你生成IP内容、盘点门店经营、对接全球资源',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://lanlaoban.com/global-supply/search?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }}
        />
        <script dangerouslySetInnerHTML={{
          __html: `
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
          <Providers>
            {children}
            <BackgroundTaskMonitor />
            <FeedbackButton />
            <NewUserGuide />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
