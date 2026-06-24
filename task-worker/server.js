import express from 'express'
import { createTask, getTask, getRecentTasks } from './db.js'
import { startProcessor, stopProcessor } from './processor.js'

const PORT = parseInt(process.env.PORT || '8892', 10)
const app = express()

// Middleware
app.use(express.json({ limit: '10mb' }))

// CORS — allow Vercel frontend to call this service
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() })
})

// Create a new task
app.post('/api/task', (req, res) => {
  try {
    const { type, input } = req.body

    if (!type) {
      return res.status(400).json({ success: false, error: '缺少 type 字段' })
    }

    const validTypes = ['brand_promotion', 'persona']
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `无效的任务类型，支持: ${validTypes.join(', ')}`,
      })
    }

    const task = createTask({ type, input: input || {} })

    res.status(201).json({
      success: true,
      taskId: task.id,
      message: `任务已创建 (${task.id})`,
    })
  } catch (err) {
    console.error('[server] POST /api/task error:', err)
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : '创建任务失败',
    })
  }
})

// Get a task by id
app.get('/api/task/:id', (req, res) => {
  try {
    const task = getTask(req.params.id)

    if (!task) {
      return res.status(404).json({ success: false, error: '任务不存在' })
    }

    res.json({ success: true, data: task })
  } catch (err) {
    console.error('[server] GET /api/task/:id error:', err)
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : '查询任务失败',
    })
  }
})

// Get recent tasks (optional: for task list UI)
app.get('/api/tasks', (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '10', 10)
    const tasks = getRecentTasks(Math.min(limit, 50))
    res.json({ success: true, data: tasks })
  } catch (err) {
    console.error('[server] GET /api/tasks error:', err)
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : '查询任务列表失败',
    })
  }
})

// Start the background processor
startProcessor()

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[server] SIGTERM received, shutting down...')
  stopProcessor()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('[server] SIGINT received, shutting down...')
  stopProcessor()
  process.exit(0)
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] Task worker listening on http://0.0.0.0:${PORT}`)
  console.log(`[server] Health: http://localhost:${PORT}/health`)
  console.log(`[server] API base: ${process.env.API_BASE || 'https://lenboss.win'}`)
})
