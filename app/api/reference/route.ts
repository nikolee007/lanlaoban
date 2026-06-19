import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CACHE: Record<string, any> = {}

function loadJSON(name: string): any {
  if (CACHE[name]) return CACHE[name]
  try {
    const filePath = path.join(process.cwd(), 'lib', `${name}.json`)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    CACHE[name] = data
    return data
  } catch {
    return null
  }
}

function matchIndustry(industry: string): string {
  const kw = decodeURIComponent(industry)
  if (/餐饮|饭店|火锅|烧烤|奶茶|咖啡|小吃/.test(kw)) return 'dining'
  if (/装修|建材|家具|全屋定制|门窗|橱柜|工程|设计/.test(kw)) return 'decoration'
  if (/工厂|加工|制造|五金|机械|钢材|塑料|橡胶|设备|工业|生产/.test(kw)) return 'factory'
  return 'retail'
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') || ''
  const industry = request.nextUrl.searchParams.get('industry') || ''
  const coach = request.nextUrl.searchParams.get('coach') || 'libazi'
  const cat = matchIndustry(industry)

  switch (type) {
    case 'pain-points': {
      const data = loadJSON('pain-points')
      const points = data?.[cat] || data?.retail
      return NextResponse.json({ industry: cat, painPoints: points })
    }

    case 'oral-phrases': {
      const data = loadJSON('oral-phrases')
      const phrases = data?.[coach]?.phrases?.slice(0, 10) || []
      return NextResponse.json({ coach, style: data?.[coach]?.style || '', phrases })
    }

    case 'title-formulas': {
      const data = loadJSON('title-formulas')
      const categories = data?.categories || {}
      const result: Record<string, any> = {}
      Object.entries(categories).forEach(([key, val]: [string, any]) => {
        result[key] = { pattern: val.pattern, examples: val.industries?.[cat]?.slice(0, 3) || val.industries?.retail?.slice(0, 3) || [] }
      })
      return NextResponse.json({ industry: cat, formulas: result })
    }

    case 'all': {
      const [painData, oralData, titleData] = await Promise.all([
        fetch(`${request.nextUrl.origin}/api/reference?type=pain-points&industry=${industry}`),
        fetch(`${request.nextUrl.origin}/api/reference?type=oral-phrases&coach=${coach}`),
        fetch(`${request.nextUrl.origin}/api/reference?type=title-formulas&industry=${industry}`),
      ]).catch(() => [null, null, null])

      return NextResponse.json({
        industry: cat,
        painPoints: painData ? (await painData.json()).painPoints : null,
        oralPhrases: oralData ? (await oralData.json()).phrases : null,
        titleFormulas: titleData ? (await titleData.json()).formulas : null,
      })
    }

    default:
      return NextResponse.json({
        availableTypes: ['pain-points', 'oral-phrases', 'title-formulas', 'all'],
        industries: Object.keys(loadJSON('pain-points') || {}),
      })
  }
}
