import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const photos = formData.getAll('photos') as File[]
    const videos = formData.getAll('videos') as File[]
    const logo = formData.get('logo') as File | null
    const productName = formData.get('productName') as string | null
    const sellingPoints = formData.get('sellingPoints') as string | null

    // Create upload directory
    const timestamp = Date.now().toString()
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'brand-promotion', timestamp)
    await mkdir(uploadDir, { recursive: true })

    const savedFiles: { type: string; path: string; name: string }[] = []

    // Save photos
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i]
      if (!file || typeof file === 'string') continue
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `photo_${i + 1}.${ext}`
      const filePath = path.join(uploadDir, filename)
      await writeFile(filePath, buffer)
      savedFiles.push({
        type: 'photo',
        path: `/uploads/brand-promotion/${timestamp}/${filename}`,
        name: file.name,
      })
    }

    // Save videos
    for (let i = 0; i < videos.length; i++) {
      const file = videos[i]
      if (!file || typeof file === 'string') continue
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = file.name.split('.').pop() || 'mp4'
      const filename = `video_${i + 1}.${ext}`
      const filePath = path.join(uploadDir, filename)
      await writeFile(filePath, buffer)
      savedFiles.push({
        type: 'video',
        path: `/uploads/brand-promotion/${timestamp}/${filename}`,
        name: file.name,
      })
    }

    // Save logo
    if (logo && typeof logo !== 'string' && logo.size > 0) {
      const buffer = Buffer.from(await logo.arrayBuffer())
      const ext = logo.name.split('.').pop() || 'png'
      const filename = `logo.${ext}`
      const filePath = path.join(uploadDir, filename)
      await writeFile(filePath, buffer)
      savedFiles.push({
        type: 'logo',
        path: `/uploads/brand-promotion/${timestamp}/${filename}`,
        name: logo.name,
      })
    }

    return NextResponse.json({
      success: true,
      timestamp,
      files: savedFiles,
      productName: productName || '',
      sellingPoints: sellingPoints || '',
    })
  } catch (error: unknown) {
    console.error('[brand-promotion] upload:', error)
    const message = error instanceof Error ? error.message : '上传失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
