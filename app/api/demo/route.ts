import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const INDUSTRIES = ['dining', 'clothing', 'decoration', 'auto', 'baby'] as const
type Industry = typeof INDUSTRIES[number]

const INDUSTRY_NAMES: Record<Industry, string> = {
  dining: '餐饮',
  clothing: '服装工厂',
  decoration: '装修',
  auto: '二手车',
  baby: '母婴',
}

export async function GET(request: NextRequest) {
  try {
    const industry = (request.nextUrl.searchParams.get('industry') || 'dining') as Industry
    const filePath = path.join(process.cwd(), 'public', `demo-${industry}.json`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `行业「${INDUSTRY_NAMES[industry] || industry}」演示数据不存在` }, { status: 404 })
    }

    const data = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(data)

    return NextResponse.json({
      ...parsed,
      industry: { id: industry, name: INDUSTRY_NAMES[industry] || industry },
    })
  } catch {
    return NextResponse.json({ error: '演示数据加载失败' }, { status: 500 })
  }
}
