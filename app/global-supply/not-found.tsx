'use client'
import Link from 'next/link'
import { FiSearch, FiHome, FiGlobe, FiCompass } from 'react-icons/fi'

export default function GlobalSupplyNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          {/* Illustration */}
          <div className="relative mb-8 flex justify-center">
            <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
              {/* Magnifying glass */}
              <circle cx="95" cy="75" r="40" stroke="#D1D5DB" strokeWidth="3" fill="#F9FAFB" />
              <path d="M125 105L155 135" stroke="#D1D5DB" strokeWidth="4" strokeLinecap="round" />
              {/* Broken map pin */}
              <path d="M70 50L75 55M75 55L80 50M75 55V65" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
              {/* Globe lines */}
              <ellipse cx="95" cy="75" rx="20" ry="8" stroke="#E5E7EB" strokeWidth="1.5" fill="none" />
              <ellipse cx="95" cy="75" rx="8" ry="20" stroke="#E5E7EB" strokeWidth="1.5" fill="none" />
              {/* Question marks */}
              <text x="130" y="50" fontSize="24" fill="#D1D5DB" fontWeight="bold">?</text>
              <text x="55" y="115" fontSize="16" fill="#E5E7EB" fontWeight="bold">?</text>
              {/* Dashed path */}
              <path d="M30 130C30 130 50 100 70 110C90 120 100 90 130 100" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            </svg>
          </div>

          {/* Text */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            没找到你要的资源
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            试试搜索其他关键词，或按分类浏览
          </p>

          {/* Search input */}
          <div className="relative mb-6">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索产品、工厂、物流..."
              className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-400/10 transition-all shadow-sm"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/global-supply"
              className="inline-flex items-center gap-2 bg-brand-400 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-500 transition-all hover:shadow-lg hover:shadow-brand-400/20 active:scale-[0.98] w-full sm:w-auto justify-center"
            >
              <FiHome className="w-4 h-4" />
              回到首页
            </Link>
            <Link
              href="/global-supply/categories"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-medium hover:border-gray-300 hover:text-gray-800 transition-all w-full sm:w-auto justify-center"
            >
              <FiCompass className="w-4 h-4" />
              按分类浏览
            </Link>
            <Link
              href="/global-supply/my-resources"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-medium hover:border-gray-300 hover:text-gray-800 transition-all w-full sm:w-auto justify-center"
            >
              <FiGlobe className="w-4 h-4" />
              我的资源库
            </Link>
          </div>

          {/* Help text */}
          <p className="mt-8 text-xs text-gray-400">
            如果问题持续存在，请联系 <Link href="/" className="text-brand-400 hover:text-brand-500">懒老板客服</Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-gray-400 sm:flex-row sm:px-6">
          <p>&copy; 2026 懒老板 · 全球供应链模块</p>
          <Link href="/" className="transition-colors hover:text-gray-600">返回懒老板首页</Link>
        </div>
      </footer>
    </div>
  )
}
