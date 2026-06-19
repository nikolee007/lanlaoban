/**
 * beautify-product-images.mjs
 *
 * 批量美化 AI 商品图脚本
 * - 读取 lib/generated-product-images.json 中的 AI 生成图片
 * - 调用 Agnes Image API 重新生成统一风格的商品图
 * - 统一风格：白色渐变背景 + 棚拍灯光
 * - 输出到 public/product-images/beautified/
 * - 更新映射文件
 *
 * 用法: AGNES_API_KEY=sk-xxx node scripts/beautify-product-images.mjs
 * 环境变量: AGNES_API_KEY (必填)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ─── Config ────────────────────────────────────────

const AGNES_API_KEY = process.env.AGNES_API_KEY || ''
const AGNES_API_URL = 'https://apihub.agnes-ai.com/v1'

const IMAGE_MAP_PATH = resolve(ROOT, 'lib/generated-product-images.json')
const OUTPUT_DIR = resolve(ROOT, 'public/product-images/beautified')
const BEAUTIFY_MAP_PATH = resolve(ROOT, 'lib/beautified-product-images.json')

const BEAUTIFY_PROMPT =
  'white gradient background, studio lighting, professional product photography, clean and minimalist, same style, high resolution, 8K'

// ─── Helpers ───────────────────────────────────────

/** 从 JSON 文件读取图片映射 */
function readImageMap(filePath) {
  if (!existsSync(filePath)) {
    console.warn(`[WARN] 文件不存在: ${filePath}`)
    return {}
  }
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch (err) {
    console.error(`[ERROR] 读取 ${filePath} 失败:`, err)
    return {}
  }
}

/** 写入 JSON 文件 */
function writeJson(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`[OK] 写入 ${filePath}`)
}

/** 延迟工具 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ─── API 调用 ─────────────────────────────────────

/**
 * 调用 Agnes Image API 重新生成商品图
 * 注意: 如果 Agnes API 不支持直接 edit，可 fallback 到重新生成
 */
async function beautifyImage(productId, originalPath) {
  if (!AGNES_API_KEY) {
    console.error(`[ERROR] AGNES_API_KEY 未设置，跳过 ${productId}`)
    return null
  }

  const fileName = `beautified-${productId}.webp`
  const outputPath = `/product-images/beautified/${fileName}`

  // 如果已生成则跳过
  if (existsSync(resolve(OUTPUT_DIR, fileName))) {
    console.log(`[SKIP] ${productId} 已存在，跳过`)
    return outputPath
  }

  console.log(`[PROCESS] ${productId}: 正在生成...`)

  try {
    // 第一步：尝试 image edit API (如果支持)
    const formData = new FormData()
    // 如果原图存在，可以读入作为参考
    const fullPath = resolve(ROOT, 'public', originalPath.replace(/^\//, ''))
    if (existsSync(fullPath)) {
      const imageBuffer = readFileSync(fullPath)
      const blob = new Blob([imageBuffer], { type: 'image/webp' })
      formData.append('image', blob, fileName)
    }
    formData.append('prompt', BEAUTIFY_PROMPT)

    const res = await fetch(`${AGNES_API_URL}/images/edit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AGNES_API_KEY}`,
        // 注意: Content-Type 由 FormData 自动设置
      },
      body: formData,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown error')
      console.warn(
        `[WARN] ${productId}: image/edit 返回 ${res.status}, fallback 到 generate: ${errText}`,
      )

      // fallback: 使用 generate API
      const genRes = await fetch(`${AGNES_API_URL}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AGNES_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: `Product photography for e-commerce, ${BEAUTIFY_PROMPT}`,
          n: 1,
          size: '1024x1024',
          response_format: 'url',
        }),
      })

      if (!genRes.ok) {
        const genErr = await genRes.text().catch(() => 'unknown error')
        console.error(`[ERROR] ${productId}: generations 也失败了: ${genErr}`)
        return null
      }

      const genData = await genRes.json()
      const imageUrl = genData.data?.[0]?.url
      if (!imageUrl) {
        console.error(`[ERROR] ${productId}: 未获取到图片 URL`)
        return null
      }

      // 下载图片
      const imgRes = await fetch(imageUrl)
      if (!imgRes.ok) {
        console.error(`[ERROR] ${productId}: 下载图片失败 ${imgRes.status}`)
        return null
      }

      const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
      mkdirSync(OUTPUT_DIR, { recursive: true })
      writeFileSync(resolve(OUTPUT_DIR, fileName), imgBuffer)
      console.log(`[OK] ${productId}: 已保存到 ${outputPath}`)
      return outputPath
    }

    // image/edit 成功
    const data = await res.json()
    // 根据实际 API 响应调整
    const imageUrl = data.url || data.data?.url || data.output?.url
    if (imageUrl) {
      const imgRes = await fetch(imageUrl)
      if (imgRes.ok) {
        const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
        mkdirSync(OUTPUT_DIR, { recursive: true })
        writeFileSync(resolve(OUTPUT_DIR, fileName), imgBuffer)
        console.log(`[OK] ${productId}: 已保存到 ${outputPath}`)
        return outputPath
      }
    }

    console.warn(`[WARN] ${productId}: image/edit 返回格式异常，保存原始数据`)
    // 保存 API 返回的元数据作为调试参考
    writeFileSync(
      resolve(OUTPUT_DIR, `${productId}-response.json`),
      JSON.stringify(data, null, 2),
      'utf-8',
    )
    return null
  } catch (err) {
    console.error(`[ERROR] ${productId}: 处理异常`, err)
    return null
  }
}

// ─── 主流程 ───────────────────────────────────────

async function main() {
  console.log('=== AI 商品图批量美化 ===\n')

  // 读取原始映射
  const imageMap = readImageMap(IMAGE_MAP_PATH)
  const entries = Object.entries(imageMap)

  if (entries.length === 0) {
    console.log('[DONE] 没有找到商品图片')
    return
  }

  console.log(`共发现 ${entries.length} 个商品图片\n`)

  // 筛选 AI 生成的图片
  const aiEntries = entries.filter(([, path]) =>
    path.includes('/ai-generated/'),
  )
  console.log(
    `其中 AI 生成图片 ${aiEntries.length} 张, 普通图片 ${entries.length - aiEntries.length} 张\n`,
  )

  if (aiEntries.length === 0) {
    console.log('[DONE] 没有需要美化的 AI 图片')
    return
  }

  // 读取已有的美化映射（用于断点续传）
  const beautifyMap = readImageMap(BEAUTIFY_MAP_PATH)
  /** @type {number} */
  let processed = 0
  /** @type {number} */
  let skipped = 0
  /** @type {number} */
  let failed = 0

  for (const [productId, originalPath] of aiEntries) {
    // 如果已有映射且文件存在，跳过
    if (beautifyMap[productId]) {
      const existingPath = resolve(
        ROOT,
        'public',
        beautifyMap[productId].replace(/^\//, ''),
      )
      if (existsSync(existingPath)) {
        console.log(`[SKIP] ${productId}: 已美化，跳过`)
        skipped++
        continue
      }
    }

    const result = await beautifyImage(productId, originalPath)
    if (result) {
      beautifyMap[productId] = result
      processed++
    } else {
      failed++
    }

    // API 限速保护
    await sleep(1000)
  }

  // 写入美化映射文件
  // 合并 AI 映射 + 美化的路径（beautified 优先）
  const finalMap = {}
  for (const [id, path] of entries) {
    finalMap[id] = beautifyMap[id] || path
  }

  mkdirSync(dirname(BEAUTIFY_MAP_PATH), { recursive: true })
  writeJson(BEAUTIFY_MAP_PATH, beautifyMap)

  // 同时生成一份完整的引用映射（升级版）
  const fullMapPath = resolve(ROOT, 'lib/optimized-product-images.json')
  writeJson(fullMapPath, finalMap)

  console.log(`\n=== 处理完成 ==`)
  console.log(`成功: ${processed}, 跳过: ${skipped}, 失败: ${failed}`)
  console.log(`美化映射: ${BEAUTIFY_MAP_PATH}`)
  console.log(`完整映射: ${fullMapPath}`)
}

main().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
