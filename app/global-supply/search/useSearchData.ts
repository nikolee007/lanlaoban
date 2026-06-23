'use client'

import { useState, useEffect } from 'react'
import {
  mapSortParam,
  applyMinOrderFilter,
  mapSearchResults,
  mapProductResults,
  unpackSearchData,
  ITEMS_PER_PAGE,
  CATEGORY_KEYWORDS,
} from '../search-utils'
import type { SearchResultItem } from '../search-utils'
import type { FiltersState } from './SearchFilters'

interface SearchResponse {
  success: boolean
  data: {
    products: unknown[]
    suppliers: unknown[]
    total: number
    query: string
    page?: number
    pageSize?: number
  }
  error?: string
}

interface ProductsResponse {
  success: boolean
  data: {
    items: unknown[]
    total: number
    page: number
    pageSize: number
  }
  error?: string
}

export function useSearchData(
  query: string,
  filters: FiltersState,
  sort: string,
  currentPage: number,
) {
  const isSearchMode = !!query
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allResults, setAllResults] = useState<SearchResultItem[]>([])
  const [totalResults, setTotalResults] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.set('page', String(currentPage))
        params.set('pageSize', String(ITEMS_PER_PAGE))

        if (filters.region) params.set('region', filters.region)
        if (filters.cert) params.set('certification', filters.cert)
        if (filters.rating) params.set('minRating', filters.rating)
        if (filters.priceMin) params.set('minPrice', filters.priceMin)
        if (filters.priceMax) params.set('maxPrice', filters.priceMax)
        if (filters.dropship) params.set('dropship', 'true')
        if (filters.category && CATEGORY_KEYWORDS[filters.category]) {
          params.set('keyword', CATEGORY_KEYWORDS[filters.category].join(','))
        }

        const apiSort = mapSortParam(sort)
        if (apiSort) params.set('sortBy', apiSort)

        if (isSearchMode) {
          params.set('q', query)
          const res = await fetch(`/api/global-supply/search?${params.toString()}`)
          const json: SearchResponse = await res.json()
          if (cancelled) return
          if (!json.success) throw new Error(json.error || '搜索失败')

          const data = unpackSearchData(json)
          let mapped = mapSearchResults(data)
          if (filters.minOrder) mapped = applyMinOrderFilter(mapped, filters.minOrder)
          setAllResults(mapped)
          setTotalResults(data.total)
        } else {
          if (filters.category && CATEGORY_KEYWORDS[filters.category]) {
            params.set('search', CATEGORY_KEYWORDS[filters.category].join(' '))
          }
          params.delete('q')
          params.delete('keyword')

          const res = await fetch(`/api/global-supply/products?${params.toString()}`)
          const json: ProductsResponse = await res.json()
          if (cancelled) return
          if (!json.success) throw new Error(json.error || '获取数据失败')

          const responseData = json?.data || {}
          const items = Array.isArray(responseData.items) ? responseData.items : []
          let mapped = mapProductResults(items)
          if (filters.minOrder) mapped = applyMinOrderFilter(mapped, filters.minOrder)
          setAllResults(mapped)
          setTotalResults(responseData.total || 0)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '请求失败，请稍后重试')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [query, filters, sort, currentPage, isSearchMode])

  return { loading, error, allResults, totalResults, setAllResults, setTotalResults }
}

export function useCollections() {
  const [collections, setCollections] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    const fetchCollections = async () => {
      try {
        const t = localStorage.getItem('lanlaoban_token')
        const res = await fetch('/api/global-supply/collections', {
          headers: t ? { 'Authorization': `Bearer ${t}` } : {},
        })
        const json = await res.json()
        if (cancelled) return
        const data = json?.data || json || {}
        const items = Array.isArray(data) ? data : Array.isArray(json?.data) ? json.data : []
        if (json.success && Array.isArray(items)) {
          const ids = new Set<string>(
            items.map((c: { targetType: string; targetId: string }) => `${c.targetType}:${c.targetId}`),
          )
          setCollections(ids)
        }
      } catch {
        // Silently fail
      }
    }
    fetchCollections()
    return () => { cancelled = true }
  }, [])

  return { collections, setCollections }
}
