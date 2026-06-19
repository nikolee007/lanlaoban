import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'lib/generated-product-images.json')
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: true, data: {} })
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: true, data: {} })
  }
}
