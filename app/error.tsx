'use client'
import Link from 'next/link'
import { FiAlertTriangle, FiHome, FiRefreshCw } from 'react-icons/fi'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <FiAlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">出了点问题</h1>
        <p className="text-gray-500 mb-2">{error?.message || '页面加载异常，请稍后重试'}</p>
        {error?.digest && <p className="text-xs text-gray-400 mb-6">错误代码：{error.digest}</p>}
        <div className="flex items-center justify-center gap-4">
          <button onClick={reset} className="btn-primary flex items-center gap-2">
            <FiRefreshCw className="w-4 h-4" />重试
          </button>
          <Link href="/" className="btn-outline flex items-center gap-2">
            <FiHome className="w-4 h-4" />返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
