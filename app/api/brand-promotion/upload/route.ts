import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

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

    // Save & optimize photos with Sharp
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i]
      if (!file || typeof file === 'string') continue
      const buffer = Buffer.from(await file.arrayBuffer())
      // Optimize: resize to max 1920px, convert to WebP, compress
      const optimized = await sharp(buffer)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()
      const filename = `photo_${i + 1}.webp`
      const filePath = path.join(uploadDir, filename)
      await writeFile(filePath, optimized)
      savedFiles.push({
        type: 'photo',
        path: `/uploads/brand-promotion/${timestamp}/${filename}`,
        name: file.name,
      })
    }

    // Save videos (no optimization needed)
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

    // Save & optimize logo with Sharp
    if (logo && typeof logo !== 'string' && logo.size > 0) {
      const buffer = Buffer.from(await logo.arrayBuffer())
      const optimized = await sharp(buffer)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90 })
        .toBuffer()
      const filename = `logo.webp`
      const filePath = path.join(uploadDir, filename)
      await writeFile(filePath, optimized)
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
