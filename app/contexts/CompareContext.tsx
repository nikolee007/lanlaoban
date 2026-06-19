'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface CompareItem {
  id: string
  name: string
  image: string
  price: string
  moq: string
  dropship: boolean
  oem: boolean
  rating: number
  location: string
}

interface CompareContextType {
  items: CompareItem[]
  addItem: (item: CompareItem) => void
  removeItem: (id: string) => void
  toggleItem: (item: CompareItem) => void
  isInCompare: (id: string) => boolean
  clearAll: () => void
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([])

  const addItem = useCallback((item: CompareItem) => {
    setItems(prev => {
      if (prev.length >= 4) return prev
      if (prev.find(i => i.id === item.id)) return prev
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const toggleItem = useCallback((item: CompareItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id)
      if (exists) return prev.filter(i => i.id !== item.id)
      if (prev.length >= 4) return prev
      return [...prev, item]
    })
  }, [])

  const isInCompare = useCallback((id: string) => {
    return items.some(i => i.id === id)
  }, [items])

  const clearAll = useCallback(() => {
    setItems([])
  }, [])

  return (
    <CompareContext.Provider value={{ items, addItem, removeItem, toggleItem, isInCompare, clearAll }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
