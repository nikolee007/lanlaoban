'use client'

export interface EngineInfo {
  id: string
  name: string
  pricePerImage: number
  status: 'active' | 'coming'
}
export interface AvatarInfo {
  id: number
  name: string
  avatarUrl: string
  engine: string
  status: string
}
export interface BillingInfo {
  freeUsed: number
  balance: number
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = localStorage.getItem('lanlaoban_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchEngines(): Promise<EngineInfo[]> {
  try {
    const res = await fetch('/api/clone/engines')
    const data = await res.json()
    return data.data || []
  } catch { return [] }
}

export async function fetchBilling(): Promise<BillingInfo> {
  try {
    const res = await fetch('/api/clone/billing', { headers: await getAuthHeaders() })
    const data = await res.json()
    return data.data || { freeUsed: 0, balance: 0 }
  } catch { return { freeUsed: 0, balance: 0 } }
}

export async function fetchAvatars(): Promise<AvatarInfo[]> {
  try {
    const res = await fetch('/api/clone/avatars', { headers: await getAuthHeaders() })
    const data = await res.json()
    return data.data || []
  } catch { return [] }
}
