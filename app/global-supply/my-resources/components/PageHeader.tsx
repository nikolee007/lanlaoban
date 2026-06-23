import Link from 'next/link'

export default function PageHeader() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-400 rounded-xl flex items-center justify-center text-white font-bold">懒</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">全球供应链</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">我的资源</span>
            </div>
          </div>
        </div>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">首页</Link>
      </div>
    </header>
  )
}
