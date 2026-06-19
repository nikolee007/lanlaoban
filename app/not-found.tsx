import Link from 'next/link'
import { FiHome } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-brand-400 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">页面不存在</h1>
        <p className="text-gray-500 mb-8">你访问的页面不存在或已被移除</p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <FiHome className="w-4 h-4" />返回首页
        </Link>
      </div>
    </div>
  )
}
