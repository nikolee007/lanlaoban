'use client'

import Link from 'next/link'
import { FiArrowLeft, FiPackage } from 'react-icons/fi'

export default function EmptySection() {
  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <header className="border-b border-gray-100 bg-white/80">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/global-supply/suppliers" className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400">
            <FiArrowLeft className="h-5 w-5" />返回
          </Link>
        </div>
      </header>
      <div className="mx-auto mt-20 max-w-md px-4 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <FiPackage className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="mb-2 text-lg font-bold text-gray-800">供应商不存在</h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-500">该供应商未找到或已下线</p>
        <Link href="/global-supply/suppliers" className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500">
          返回供应商列表
        </Link>
      </div>
    </main>
  )
}
