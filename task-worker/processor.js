import { getPendingTasks, updateTask, getTask } from './db.js'

const API_BASE = process.env.API_BASE || 'https://lenboss.win'

// Polling interval in milliseconds
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || '3000', 10)

// Maximum concurrent tasks
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT || '2', 10)

let running = false
let activeCount = 0

/**
 * Start the background task processor
 */
export function startProcessor() {
  if (running) return
  running = true
  console.log('[processor] Task processor started (poll interval:', POLL_INTERVAL, 'ms)')
  poll()
}

/**
 * Stop the background task processor
 */
export function stopProcessor() {
  running = false
  console.log('[processor] Task processor stopped')
}

async function poll() {
  while (running) {
    try {
      while (activeCount < MAX_CONCURRENT) {
        const tasks = getPendingTasks()
        if (tasks.length === 0) break

        const task = tasks[0]
        activeCount++
        // Fire and forget — processTask handles its own errors
        processTask(task).finally(() => {
          activeCount--
        })
      }
    } catch (err) {
      console.error('[processor] poll error:', err)
    }

    await sleep(POLL_INTERVAL)
  }
}

/**
 * Process a single task through its pipeline
 */
async function processTask(task) {
  console.log(`[processor] Starting task ${task.id} (type: ${task.type})`)

  try {
    updateTask(task.id, { status: 'processing', progress: 0, step: '开始处理' })

    const input = typeof task.input_data === 'string'
      ? JSON.parse(task.input_data)
      : task.input_data

    let result

    switch (task.type) {
      case 'brand_promotion':
        result = await processBrandPromotion(task.id, input)
        break
      case 'persona':
        result = await processPersona(task.id, input)
        break
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }

    updateTask(task.id, {
      status: 'done',
      progress: 100,
      step: '处理完成',
      output_data: result,
    })
    console.log(`[processor] Task ${task.id} completed`)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error(`[processor] Task ${task.id} failed:`, errorMessage)
    updateTask(task.id, {
      status: 'error',
      progress: 0,
      step: '处理失败',
      error_message: errorMessage,
    })
  }
}

/**
 * Brand Promotion pipeline:
 * 1. 生成文案 (15%) → 2. 翻译 (10%) → 3. 配音 (25%) → 4. 视频合成 (30%) → 5. 数字人 (20%)
 */
async function processBrandPromotion(taskId, input) {
  const { productName, sellingPoints, style, languages, duration, photos, customPhoto } = input

  // Step 1: Generate scripts (25% combined: script + translation)
  updateTask(taskId, { progress: 5, step: 'AI 生成多语言文案...' })
  const scriptRes = await apiPost('/api/brand-promotion/script', {
    productName: productName || 'Product',
    sellingPoints: sellingPoints || '',
    style: style || 'professional',
    languages: languages || ['zh', 'en'],
    duration: duration || 60,
  })

  if (!scriptRes.success && scriptRes.error) {
    throw new Error(`文案生成失败: ${scriptRes.error}`)
  }

  const scripts = scriptRes.scripts || {}
  updateTask(taskId, {
    progress: 25,
    step: '文案生成完成',
    output_data: { scripts },
  })

  // Step 2: Generate TTS for each language (25%)
  updateTask(taskId, { progress: 30, step: '生成配音...' })
  const audioResults = {}
  const langKeys = Object.keys(scripts)

  for (let i = 0; i < langKeys.length; i++) {
    const lang = langKeys[i]
    const text = scripts[lang]

    if (!text) continue

    try {
      const ttsRes = await apiPost('/api/brand-promotion/tts', {
        text,
        language: lang,
      })

      if (ttsRes.success) {
        audioResults[lang] = {
          audioData: ttsRes.audioData,
          contentType: ttsRes.contentType,
          source: ttsRes.source,
        }
      } else {
        console.warn(`[processor] TTS failed for ${lang}:`, ttsRes.error)
      }
    } catch (ttsErr) {
      console.warn(`[processor] TTS error for ${lang}:`, ttsErr.message)
    }

    // Update progress within TTS step (30% → 55%)
    const stepProgress = 30 + Math.round(((i + 1) / langKeys.length) * 25)
    updateTask(taskId, {
      progress: stepProgress,
      step: `配音生成中 (${i + 1}/${langKeys.length}: ${lang})...`,
    })
  }

  updateTask(taskId, {
    progress: 55,
    step: '配音生成完成',
    output_data: { scripts, audioResults },
  })

  // Step 3: Render configuration (30%)
  updateTask(taskId, { progress: 60, step: '生成视频合成配置...' })

  const photoList = extractPhotos(input)
  const primaryScript = scripts['zh'] || scripts['en'] || Object.values(scripts)[0] || ''

  const renderRes = await apiPost('/api/brand-promotion/render', {
    photos: photoList,
    productName: productName || 'Product',
    slogans: [primaryScript],
    language: langKeys[0] || 'zh',
    duration: duration || 60,
  })

  updateTask(taskId, {
    progress: 80,
    step: '视频合成配置完成',
    output_data: {
      scripts,
      audioResults,
      renderConfig: renderRes.config || null,
    },
  })

  // Step 4: Digital human (20%)
  updateTask(taskId, { progress: 85, step: '生成数字人...' })

  try {
    const dhRes = await apiPost('/api/digital-human', {
      scene: 'standing',
      script: primaryScript,
    })

    updateTask(taskId, {
      progress: 100,
      step: '全部完成',
      output_data: {
        scripts,
        audioResults,
        renderConfig: renderRes.config || null,
        digitalHuman: dhRes.data || null,
      },
    })
  } catch (dhErr) {
    console.warn(`[processor] Digital human skipped:`, dhErr.message)
    updateTask(taskId, {
      progress: 100,
      step: '完成（数字人已跳过）',
      output_data: {
        scripts,
        audioResults,
        renderConfig: renderRes.config || null,
        digitalHuman: null,
      },
    })
  }

  return { scripts, audioResults, renderConfig: renderRes.config }
}

/**
 * Persona pipeline:
 * 1. 生成人设 (20%) → 2. 生成脚本 (20%) → 3. 配音 (30%) → 4. 数字人 (30%)
 */
async function processPersona(taskId, input) {
  const { industry, product, targetCustomer, years, style } = input

  // Step 1: Generate persona (20%)
  updateTask(taskId, { progress: 5, step: 'AI 生成人设方案...' })

  const personaRes = await apiPost('/api/generate/persona', {
    industry: industry || '餐饮',
    product: product || '',
    targetCustomer: targetCustomer || '',
    years: years || '',
    style: style || 'boge',
  })

  if (personaRes.error && !personaRes.persona) {
    throw new Error(`人设生成失败: ${personaRes.error}`)
  }

  const persona = personaRes.persona || {}
  updateTask(taskId, {
    progress: 25,
    step: '人设方案生成完成',
    output_data: { persona },
  })

  // Step 2: Generate scripts (20%)
  updateTask(taskId, { progress: 30, step: 'AI 生成口播脚本...' })

  let personaScripts = {}
  let allScripts = []
  try {
    const scriptsRes = await apiPost('/api/generate/scripts', {
      persona: { nickname: persona.nickname || '', bio: persona.bio || '' },
      industry: industry || '',
      product: product || '',
      targetCustomer: targetCustomer || '',
      years: years || '',
      style: style || 'boge',
    })

    // The scripts API returns { scripts: [...], coach, meta } — array of { id, title, content }
    allScripts = scriptsRes.scripts || []
    if (Array.isArray(allScripts) && allScripts.length > 0) {
      // Use the first script's content as the zh script for TTS
      personaScripts = { zh: allScripts[0]?.content || persona.intro || '' }
    } else {
      personaScripts = { zh: persona.intro || '' }
    }
  } catch (scriptErr) {
    console.warn(`[processor] Script generation skipped:`, scriptErr.message)
    personaScripts = { zh: persona.intro || '' }
  }

  updateTask(taskId, {
    progress: 45,
    step: '脚本生成完成',
    output_data: { persona, scripts: personaScripts, allScripts },
  })

  // Step 3: Generate TTS (30%)
  updateTask(taskId, { progress: 50, step: '生成配音...' })

  const audioResults = {}
  const scriptLangKeys = Object.keys(personaScripts)

  for (let i = 0; i < scriptLangKeys.length; i++) {
    const lang = scriptLangKeys[i]
    const text = personaScripts[lang]

    if (!text) continue

    try {
      const ttsRes = await apiPost('/api/brand-promotion/tts', {
        text,
        language: lang,
      })

      if (ttsRes.success) {
        audioResults[lang] = {
          audioData: ttsRes.audioData,
          contentType: ttsRes.contentType,
          source: ttsRes.source,
        }
      }
    } catch (ttsErr) {
      console.warn(`[processor] TTS error for ${lang}:`, ttsErr.message)
    }

    const stepProgress = 50 + Math.round(((i + 1) / scriptLangKeys.length) * 25)
    updateTask(taskId, {
      progress: stepProgress,
      step: `配音生成中 (${i + 1}/${scriptLangKeys.length})...`,
    })
  }

  updateTask(taskId, {
    progress: 75,
    step: '配音生成完成',
    output_data: { persona, scripts: personaScripts, audioResults },
  })

  // Step 4: Digital human (25%)
  updateTask(taskId, { progress: 80, step: '生成数字人...' })

  const mainScript = personaScripts['zh'] || Object.values(personaScripts)[0] || persona.intro || ''

  try {
    const dhRes = await apiPost('/api/digital-human', {
      scene: 'standing',
      script: mainScript,
    })

    updateTask(taskId, {
      progress: 100,
      step: '全部完成',
      output_data: {
        persona,
        scripts: personaScripts,
        audioResults,
        digitalHuman: dhRes.data || null,
      },
    })
  } catch (dhErr) {
    console.warn(`[processor] Digital human skipped:`, dhErr.message)
    updateTask(taskId, {
      progress: 100,
      step: '完成（数字人已跳过）',
      output_data: {
        persona,
        scripts: personaScripts,
        audioResults,
        digitalHuman: null,
      },
    })
  }

  return { persona, scripts: personaScripts, audioResults }
}

// --- Helpers ---

/**
 * POST to the Vercel API
 */
async function apiPost(path, body) {
  const url = `${API_BASE}${path}`
  console.log(`[processor] POST ${url}`)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120000)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    const data = await res.json()
    return data
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Extract photo URLs from input data
 */
function extractPhotos(input) {
  const photos = input.photos || []
  if (input.customPhoto && !photos.includes(input.customPhoto)) {
    photos.unshift(input.customPhoto)
  }
  return photos
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
