'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

/* ── 内存缓存 ────────────────────────────────────────────── */
interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cacheMap = new Map<string, CacheEntry<unknown>>()
const CACHE_TTL = 5000 // 5 秒

function getCached<T>(key: string): T | null {
  const entry = cacheMap.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cacheMap.delete(key)
    return null
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T): void {
  cacheMap.set(key, { data, timestamp: Date.now() })
}

/* ── 选项类型 ─────────────────────────────────────────────── */
export interface UseDataOptions {
  /** 是否启用请求（默认 true，设为 false 可阻止自动请求） */
  enabled?: boolean
  /** 依赖项数组，变化时重新请求 */
  deps?: unknown[]
  /** 自定义请求配置（透传 fetch） */
  fetchInit?: RequestInit
}

/* ── Hook ─────────────────────────────────────────────────── */
export function useData<T = unknown>(
  url: string,
  options?: UseDataOptions,
) {
  const { enabled = true, deps, fetchInit } = options ?? {}

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 追踪请求顺序，防止竞态
  const latestRef = useRef(0)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    // 1. 缓存命中
    const cached = getCached<T>(url)
    if (cached !== null) {
      setData(cached)
      setLoading(false)
      return
    }

    const tick = ++latestRef.current

    try {
      let res: Response
      try {
        res = await fetch(url, fetchInit)
      } catch {
        // 网络错误（断网、DNS、CORS 等）
        if (tick !== latestRef.current) return // 已过期
        setError('网络连接失败，请检查网络后重试')
        setLoading(false)
        return
      }

      if (tick !== latestRef.current) return

      if (!res.ok) {
        setError(`请求失败 (${res.status}${res.statusText ? ` ${res.statusText}` : ''})`)
        setLoading(false)
        return
      }

      let json: T
      try {
        json = (await res.json()) as T
      } catch {
        if (tick !== latestRef.current) return
        setError('数据解析失败，请稍后重试')
        setLoading(false)
        return
      }

      setCache(url, json)
      setData(json)
    } finally {
      if (tick === latestRef.current) {
        setLoading(false)
      }
    }
  }, [url, fetchInit])

  useEffect(() => {
    if (enabled) {
      refetch()
    } else {
      setLoading(false)
    }
  }, enabled && deps ? [refetch, enabled, ...deps] : [refetch, enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch }
}
