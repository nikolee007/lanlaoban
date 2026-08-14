import { NextResponse } from 'next/server'
import { getEngines } from '@/lib/clone-engine'

export const dynamic = 'force-dynamic'

export async function GET() {
  const engines = getEngines().map(e => ({
    id: e.id, name: e.name, pricePerImage: e.pricePerImage, status: e.status,
  }))
  return NextResponse.json({ success: true, data: engines })
}
