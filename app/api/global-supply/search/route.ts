import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

function sanitizeSearch(input: string): string {
  return input.trim().replace(/\s+/g, ' ').replace(/[%_]/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const rawQuery = (searchParams.get('q') || '').trim()
    const q = sanitizeSearch(rawQuery)
    const type = searchParams.get('type') || 'all'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20),
    )

    // Filter params
    const region = searchParams.get('region')
    const certification = searchParams.get('certification')
    const minRating = searchParams.get('minRating')
    const sortBy = searchParams.get('sortBy')
    const keyword = searchParams.get('keyword')

    // Return empty when no query and no filters are provided
    if (!q && !region && !certification && !minRating && !keyword) {
      return NextResponse.json({
        success: true,
        data: {
          products: [],
          suppliers: [],
          total: 0,
          query: '',
          page: 1,
          pageSize,
        },
      })
    }

    const skip = (page - 1) * pageSize
    let products: Awaited<ReturnType<typeof db.product.findMany>> = []
    let suppliers: Awaited<ReturnType<typeof db.supplier.findMany>> = []
    let total = 0

    // -- Build product where clause --------------------------------------------
    if (type === 'product' || type === 'all') {
      const productOrConditions: Prisma.ProductWhereInput[] = []

      // Search term conditions
      if (q) {
        productOrConditions.push(
          { name: { contains: q } },
          { description: { contains: q } },
        )
      }

      // Category keyword conditions
      if (keyword) {
        const keywords = keyword.split(',').filter(Boolean)
        keywords.forEach(k => {
          productOrConditions.push({ name: { contains: k } })
        })
      }

      const productAndConditions: Prisma.ProductWhereInput[] = []
      if (productOrConditions.length > 0) {
        productAndConditions.push({ OR: productOrConditions })
      }

      // Region filter
      if (region) {
        productAndConditions.push({
          supplier: { location: { contains: region } },
        })
      }

      // Certification filter
      if (certification) {
        productAndConditions.push({ certifications: { contains: certification } })
      }

      // Minimum rating filter
      if (minRating) {
        const rating = parseFloat(minRating)
        if (!isNaN(rating)) {
          productAndConditions.push({ rating: { gte: rating } })
        }
      }

      const productWhere: Prisma.ProductWhereInput =
        productAndConditions.length > 0 ? { AND: productAndConditions } : {}

      // Sort
      let productOrderBy: Prisma.ProductOrderByWithRelationInput = { rating: 'desc' }
      if (sortBy === 'sales') {
        productOrderBy = { reviewCount: 'desc' }
      } else if (sortBy === 'price-asc') {
        productOrderBy = { priceMin: 'asc' }
      } else if (sortBy === 'price-desc') {
        productOrderBy = { priceMin: 'desc' }
      }

      const [items, count] = await Promise.all([
        db.product.findMany({
          where: productWhere,
          include: {
            supplier: {
              select: {
                id: true,
                nameZh: true,
                nameEn: true,
                location: true,
                rating: true,
              },
            },
            category: {
              select: { id: true, name: true },
            },
          },
          orderBy: productOrderBy,
          skip,
          take: pageSize,
        }),
        db.product.count({ where: productWhere }),
      ])
      products = items
      total += count
    }

    // -- Build supplier where clause -------------------------------------------
    if (type === 'supplier' || type === 'all') {
      const supplierOrConditions: Prisma.SupplierWhereInput[] = []

      if (q) {
        supplierOrConditions.push(
          { nameZh: { contains: q } },
          { nameEn: { contains: q } },
          { businessTags: { contains: q } },
        )
      }

      if (keyword) {
        const keywords = keyword.split(',').filter(Boolean)
        keywords.forEach(k => {
          supplierOrConditions.push({ businessTags: { contains: k } })
        })
      }

      const supplierAndConditions: Prisma.SupplierWhereInput[] = []
      if (supplierOrConditions.length > 0) {
        supplierAndConditions.push({ OR: supplierOrConditions })
      }

      if (region) {
        supplierAndConditions.push({ location: { contains: region } })
      }

      if (certification) {
        supplierAndConditions.push({ certifications: { contains: certification } })
      }

      if (minRating) {
        const rating = parseFloat(minRating)
        if (!isNaN(rating)) {
          supplierAndConditions.push({ rating: { gte: rating } })
        }
      }

      const supplierWhere: Prisma.SupplierWhereInput =
        supplierAndConditions.length > 0 ? { AND: supplierAndConditions } : {}

      const [items, count] = await Promise.all([
        db.supplier.findMany({
          where: supplierWhere,
          orderBy: { rating: 'desc' },
          skip,
          take: pageSize,
        }),
        db.supplier.count({ where: supplierWhere }),
      ])
      suppliers = items
      total += count
    }

    return NextResponse.json({
      success: true,
      data: {
        products,
        suppliers,
        total,
        query: q,
        page,
        pageSize,
      },
    })
  } catch (error) {
    console.error('全局搜索失败:', error)
    return NextResponse.json(
      { success: false, error: '搜索失败' },
      { status: 500 },
    )
  }
}
