import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Brand Promotion Render API
 *
 * Coordinates video rendering. The actual rendering can be done either:
 * - Client-side: RemotionPreview provides real-time preview; Canvas renderer handles download
 * - Server-side (future): @remotion/renderer with Chrome infrastructure
 *
 * Current implementation: validates inputs and returns ready-to-render configuration.
 * Client uses this to drive the Canvas-based renderPromotionVideo for MP4 export,
 * while RemotionPreview handles the interactive preview experience.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      photos = [],
      productName = 'Product',
      slogans = [],
      audioUrl,
      logoUrl,
      language = 'zh',
      duration = 60,
    } = body

    // Validate inputs
    if (photos.length === 0) {
      return NextResponse.json({ error: '至少需要一张照片' }, { status: 400 })
    }
    if (!slogans.length) {
      return NextResponse.json({ error: '至少需要一句文案' }, { status: 400 })
    }

    // Return render configuration for client-side rendering
    // The client uses Canvas-based renderPromotionVideo to produce the final download,
    // while RemotionPreview provides the interactive WYSIWYG preview experience.
    return NextResponse.json({
      success: true,
      config: {
        photos,
        productName,
        slogans,
        audioUrl: audioUrl || null,
        logoUrl: logoUrl || null,
        language,
        duration,
        fps: 30,
        width: 1080,
        height: 1920,
      },
      message: 'Ready for client-side render with RemotionPreview + Canvas exporter',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '请求处理失败'
    console.error('[brand-promotion] render:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
