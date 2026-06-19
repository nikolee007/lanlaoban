'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Collection = {
  id: number
  targetId: string
  targetType: 'product' | 'supplier'
  userNote: string | null
  createdAt: string
  target: {
    id: number
    name?: string
    nameZh?: string
    nameEn?: string
    [key: string]: unknown
  } | null
}

export default function AdminInquiriesPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'product' | 'supplier'>('all')

  useEffect(() => {
    async function fetchData() {
      try {
        const params = filter === 'all' ? '' : `?type=${filter}`
        const t = localStorage.getItem('lanlaoban_token')
        const h_: Record<string, string> = {}
	        if (t) h_['Authorization'] = 'Bearer ' + t
        const res = await fetch(`/api/global-supply/collections${params}`, {
          headers: h_,
        })
        const json = await res.json()
        if (json.success) {
          setCollections(json.data)
        }
      } catch (err) {
        console.error('获取收藏列表失败:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filter])

  const targetLabel = (item: Collection) => {
    if (item.targetType === 'product') return item.target?.name ?? `商品 #${item.targetId}`
    return item.target?.nameZh ?? item.target?.nameEn ?? `供应商 #${item.targetId}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">用户收藏</h1>
        <div className="flex gap-2">
          {(['all', 'product', 'supplier'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === f
                  ? 'bg-brand-400 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? '全部' : f === 'product' ? '商品' : '供应商'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
          暂无收藏数据
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">类型</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">名称</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">用户备注</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">收藏时间</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-500">{item.id}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      item.targetType === 'product'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-green-50 text-green-600'
                    }`}>
                      {item.targetType === 'product' ? '商品' : '供应商'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900">{targetLabel(item)}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate">
                    {item.userNote || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/admin"
          className="text-sm text-brand-400 hover:text-brand-500 transition-colors"
        >
          &larr; 返回数据概览
        </Link>
      </div>
    </div>
  )
}
