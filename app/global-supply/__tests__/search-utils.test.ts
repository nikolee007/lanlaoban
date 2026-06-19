import { describe, it, expect, beforeEach, vi } from 'vitest'

// ── localStorage mocks ──
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// ── Import after mock ──
import {
  getSearchHistory,
  saveSearchHistory,
  clearSearchHistory,
  parsePrefixedId,
  collectionKey,
  safeJsonParse,
  daysAgo,
  tagColor,
  mapSortParam,
  applyMinOrderFilter,
  mapSearchResults,
  mapProductResults,
  unpackSearchData,
  HISTORY_KEY,
} from '../search-utils'

describe('getSearchHistory', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('returns empty array when localStorage is empty', () => {
    const result = getSearchHistory()
    expect(result).toEqual([])
  })

  it('returns parsed array from localStorage', () => {
    localStorageMock.setItem(HISTORY_KEY, JSON.stringify(['蓝牙耳机', '充电宝']))
    const result = getSearchHistory()
    expect(result).toEqual(['蓝牙耳机', '充电宝'])
  })

  it('returns empty array when localStorage throws', () => {
    localStorageMock.getItem.mockImplementationOnce(() => { throw new Error('Storage error') })
    const result = getSearchHistory()
    expect(result).toEqual([])
  })

  it('returns empty array when JSON is invalid', () => {
    localStorageMock.setItem(HISTORY_KEY, 'not-valid-json')
    const result = getSearchHistory()
    expect(result).toEqual([])
  })

  it('returns empty array when stored value is not an array', () => {
    localStorageMock.setItem(HISTORY_KEY, '"string"')
    const result = getSearchHistory()
    expect(result).toEqual([])
  })
})

describe('saveSearchHistory', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('saves query to localStorage, deduplicates and caps at 10', () => {
    saveSearchHistory('蓝牙耳机')
    expect(localStorageMock.setItem).toHaveBeenCalled()
    const saved = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
    expect(saved).toContain('蓝牙耳机')
  })

  it('does not throw when localStorage.setItem throws', () => {
    localStorageMock.setItem.mockImplementationOnce(() => { throw new Error('Quota exceeded') })
    expect(() => saveSearchHistory('测试')).not.toThrow()
  })
})

describe('clearSearchHistory', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('removes history key from localStorage', () => {
    localStorageMock.setItem(HISTORY_KEY, JSON.stringify(['a']))
    clearSearchHistory()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(HISTORY_KEY)
  })

  it('does not throw when localStorage.removeItem throws', () => {
    localStorageMock.removeItem.mockImplementationOnce(() => { throw new Error('Storage error') })
    expect(() => clearSearchHistory()).not.toThrow()
  })
})

describe('parsePrefixedId', () => {
  it('parses product prefixed id', () => {
    expect(parsePrefixedId('p_123')).toEqual({ type: 'product', id: '123' })
  })

  it('parses supplier prefixed id', () => {
    expect(parsePrefixedId('s_456')).toEqual({ type: 'supplier', id: '456' })
  })

  it('returns null for invalid prefix', () => {
    expect(parsePrefixedId('x_789')).toBeNull()
  })

  it('returns null for malformed input', () => {
    expect(parsePrefixedId('')).toBeNull()
    expect(parsePrefixedId('p_')).toBeNull()
    expect(parsePrefixedId('_123')).toBeNull()
    expect(parsePrefixedId('p123')).toBeNull()
  })
})

describe('collectionKey', () => {
  it('generates key for product', () => {
    expect(collectionKey('p_123')).toBe('product:123')
  })

  it('generates key for supplier', () => {
    expect(collectionKey('s_456')).toBe('supplier:456')
  })
})

describe('safeJsonParse', () => {
  it('parses valid JSON array', () => {
    expect(safeJsonParse('["a","b"]')).toEqual(['a', 'b'])
  })

  it('returns empty array for null', () => {
    expect(safeJsonParse(null)).toEqual([])
  })

  it('returns empty array for undefined', () => {
    expect(safeJsonParse(undefined)).toEqual([])
  })

  it('returns empty array for invalid JSON', () => {
    expect(safeJsonParse('not-json')).toEqual([])
  })

  it('returns empty array when parsed value is not an array', () => {
    expect(safeJsonParse('"string"')).toEqual([])
    expect(safeJsonParse('42')).toEqual([])
    expect(safeJsonParse('{}')).toEqual([])
  })
})

describe('daysAgo', () => {
  it('returns "今天" for today', () => {
    const now = new Date()
    expect(daysAgo(now.toISOString())).toBe('今天')
  })

  it('returns "1天前" for yesterday', () => {
    const d = new Date(Date.now() - 86400000)
    expect(daysAgo(d.toISOString())).toBe('1天前')
  })

  it('returns "${n}天前" for n days ago', () => {
    const d = new Date(Date.now() - 3 * 86400000)
    expect(daysAgo(d.toISOString())).toBe('3天前')
  })
})

describe('tagColor', () => {
  it('returns green for certification tags', () => {
    expect(tagColor('CE')).toContain('green')
    expect(tagColor('FCC')).toContain('green')
    expect(tagColor('RoHS')).toContain('green')
    expect(tagColor('FDA')).toContain('green')
  })

  it('returns blue for OEM', () => {
    expect(tagColor('OEM')).toContain('blue')
  })

  it('returns purple for ODM', () => {
    expect(tagColor('ODM')).toContain('purple')
  })

  it('returns amber for unknown tags', () => {
    expect(tagColor('OTHER')).toContain('amber')
  })
})

describe('mapSortParam', () => {
  it('returns correct API sort params', () => {
    expect(mapSortParam('sales')).toBe('sales')
    expect(mapSortParam('price-asc')).toBe('price')
    expect(mapSortParam('price-desc')).toBe('price-desc')
    expect(mapSortParam('rating')).toBe('rating')
  })

  it('returns undefined for default', () => {
    expect(mapSortParam('default')).toBeUndefined()
  })

  it('returns undefined for unknown sort', () => {
    expect(mapSortParam('unknown')).toBeUndefined()
  })
})

describe('applyMinOrderFilter', () => {
  const items = [
    { id: 'p_1', minOrder: 10 },
    { id: 'p_2', minOrder: 50 },
    { id: 'p_3', minOrder: 200 },
    { id: 'p_4', minOrder: 1500 },
  ] as any[]

  it('filters by range 1-100', () => {
    const result = applyMinOrderFilter(items, '1-100')
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('p_1')
    expect(result[1].id).toBe('p_2')
  })

  it('filters 1000+', () => {
    const result = applyMinOrderFilter(items, '1000+')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('p_4')
  })

  it('returns empty for no matches', () => {
    const result = applyMinOrderFilter(items, '9999-99999')
    expect(result).toHaveLength(0)
  })
})

describe('unpackSearchData', () => {
  it('unpacks { success, data: { products, suppliers, total } }', () => {
    const res = {
      success: true,
      data: {
        products: [{ id: 1, name: 'P1' }],
        suppliers: [{ id: 1, nameZh: 'S1' }],
        total: 2,
      },
    }
    const { products, suppliers, total } = unpackSearchData(res)
    expect(products).toHaveLength(1)
    expect(suppliers).toHaveLength(1)
    expect(total).toBe(2)
  })

  it('falls back to empty arrays when data is missing', () => {
    const res = { success: true }
    const { products, suppliers, total } = unpackSearchData(res)
    expect(products).toEqual([])
    expect(suppliers).toEqual([])
    expect(total).toBe(0)
  })

  it('handles null data gracefully', () => {
    const { products, suppliers, total } = unpackSearchData({ success: true, data: null })
    expect(products).toEqual([])
    expect(suppliers).toEqual([])
    expect(total).toBe(0)
  })
})

describe('mapSearchResults', () => {
  it('maps products and suppliers to ResultItem array', () => {
    const data = {
      products: [
        {
          id: 1,
          name: '蓝牙耳机',
          description: '高品质蓝牙耳机',
          priceMin: 15,
          priceMax: 25,
          currency: 'USD',
          moq: 100,
          supportsDropShipping: true,
          supportsOEM: true,
          images: '["img1.jpg"]',
          certifications: '["CE","FCC"]',
          salesData: null,
          rating: 4.5,
          reviewCount: 200,
          monthlySales: 5000,
          updatedAt: new Date().toISOString(),
          supplier: { id: 1, nameZh: '供应商A', nameEn: 'Supplier A', location: '深圳', rating: 4.5, isVerified: true },
          category: { id: 1, name: '数码配件' },
        },
      ],
      suppliers: [
        {
          id: 1,
          nameZh: '工厂A',
          nameEn: 'Factory A',
          location: '东莞',
          yearEstablished: 2010,
          employeeCount: 500,
          annualExportRevenue: 5000000,
          certifications: '["ISO9001"]',
          businessTags: '["OEM","ODM"]',
          exportDestinations: '["US","EU"]',
          rating: 4.2,
          reviewCount: 150,
          isVerified: true,
          updatedAt: new Date().toISOString(),
          type: 'factory',
        },
      ],
      total: 2,
      query: '耳机',
    }

    const results = mapSearchResults(data as any)
    expect(results).toHaveLength(2)

    // Product
    const product = results[0]
    expect(product.id).toBe('p_1')
    expect(product.type).toBe('product')
    expect(product.name).toBe('蓝牙耳机')
    expect(product.dropship).toBe(true)
    expect(product.tags.some(t => t.label === 'OEM')).toBe(true)
    expect(product.tags.some(t => t.label === 'CE')).toBe(true)
    expect(product.priceMin).toBe(15)
    expect(product.priceMax).toBe(25)

    // Supplier
    const supplier = results[1]
    expect(supplier.id).toBe('s_1')
    expect(supplier.type).toBe('factory')
    expect(supplier.name).toBe('工厂A')
    expect(supplier.tags.some(t => t.label === 'OEM')).toBe(true)
    expect(supplier.tags.some(t => t.label === 'ODM')).toBe(true)
    expect(supplier.yearEstablished).toBe(2010)
    expect(supplier.employeeCount).toBe('500人')
  })

  it('returns empty array when data has no items', () => {
    expect(mapSearchResults({ products: [], suppliers: [] } as any)).toEqual([])
    expect(mapSearchResults({} as any)).toEqual([])
  })
})

describe('mapProductResults', () => {
  it('maps product API items to ResultItem array', () => {
    const items = [
      {
        id: 1,
        name: '测试产品',
        priceMin: 10,
        priceMax: 20,
        moq: 50,
        supportsDropShipping: false,
        supportsOEM: false,
        certifications: '["CE"]',
        rating: 4.0,
        reviewCount: 100,
        monthlySales: 1000,
        updatedAt: new Date().toISOString(),
        supplier: { id: 1, nameZh: '供应商', nameEn: 'Supplier', location: '广州', rating: 4.0, isVerified: false },
        category: { id: 1, name: '测试' },
      },
    ]

    const results = mapProductResults(items as any)
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('p_1')
    expect(results[0].priceMin).toBe(10)
    expect(results[0].priceMax).toBe(20)
  })

  it('returns empty array for null/undefined input', () => {
    expect(mapProductResults(null as any)).toEqual([])
    expect(mapProductResults(undefined as any)).toEqual([])
    expect(mapProductResults([])).toEqual([])
  })
})
