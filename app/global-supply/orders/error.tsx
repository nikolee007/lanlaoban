'use client'
import Link from 'next/link'
import { FiAlertTriangle, FiHome, FiRefreshCw } from 'react-icons/fi'

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <FiAlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">订单页面出错了</h1>
        <p className="mb-2 text-gray-500">
          {error?.message || '订单数据加载异常，请稍后重试'}
        </p>
        {error?.digest && (
          <p className="mb-6 text-xs text-gray-400">错误代码：{error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="btn-primary inline-flex items-center gap-2"
          >
            <FiRefreshCw className="h-4 w-4" />
            重试
          </button>
          <Link
            href="/"
            className="btn-outline inline-flex items-center gap-2"
          >
            <FiHome className="h-4 w-4" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
