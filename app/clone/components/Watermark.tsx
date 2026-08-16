'use client'

/** 免费生成图片水印：半透明「懒老板」文字，随机位置/角度（防去除 + 广告效应） */

/** 水印叠加层（显示用）：在图片容器内绝对定位，pointer-events 穿透 */
export function WatermarkLayer({ show, seed }: { show: boolean; seed: number }) {
  if (!show) return null
  // 基于 seed 生成 3 个随机位置的水印（每次生成随机，防固定位置被裁剪）
  const marks = [0, 1, 2].map(i => ({
    top: ((seed * (i + 1) * 13) % 76) + 5,
    left: ((seed * (i + 1) * 29) % 76) + 5,
    rotate: ((seed * (i + 1) * 7) % 40) - 20,
    size: 24 + ((seed * (i + 1)) % 16),
  }))
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {marks.map((m, i) => (
        <span
          key={i}
          className="absolute text-white/30 font-bold select-none whitespace-nowrap"
          style={{ top: `${m.top}%`, left: `${m.left}%`, fontSize: `${m.size}px`, transform: `rotate(${m.rotate}deg)` }}
        >
          懒老板
        </span>
      ))}
    </div>
  )
}

/** Canvas 合成带水印图（下载用）：加载原图 → 叠水印 → 返回 dataURL */
export async function addWatermarkToImage(src: string, seed: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.font = `bold ${Math.max(30, Math.floor(canvas.width / 14))}px sans-serif`
        ctx.textAlign = 'center'
        for (let i = 0; i < 3; i++) {
          ctx.save()
          ctx.translate(
            canvas.width * (((seed * (i + 1) * 29) % 76) + 12) / 100,
            canvas.height * (((seed * (i + 1) * 13) % 76) + 12) / 100,
          )
          ctx.rotate(((seed * (i + 1) * 7) % 40 - 20) * Math.PI / 180)
          ctx.fillText('懒老板', 0, 0)
          ctx.restore()
        }
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = src
  })
}
