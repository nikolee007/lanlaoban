import Database from 'better-sqlite3'
import { v4 as uuid } from 'uuid'
import { mkdirSync } from 'fs'

const DB_PATH = process.env.DB_PATH || '/app/task-worker/data/tasks.db'

let _db = null

function getDb() {
  if (!_db) {
    const dir = DB_PATH.substring(0, DB_PATH.lastIndexOf('/'))
    mkdirSync(dir, { recursive: true })

    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
    initSchema(_db)
  }
  return _db
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      progress INTEGER NOT NULL DEFAULT 0,
      step TEXT DEFAULT '',
      input_data TEXT DEFAULT '{}',
      output_data TEXT DEFAULT '{}',
      error_message TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
}

/**
 * Create a new task
 * @param {{ type: string, input: object }} input
 * @returns {object}
 */
export function createTask({ type, input = {} } = {}) {
  const db = getDb()
  const id = uuid()
  const now = new Date().toISOString()
  const inputJson = JSON.stringify(input)

  const stmt = db.prepare(`
    INSERT INTO tasks (id, type, status, progress, step, input_data, output_data, created_at, updated_at)
    VALUES (?, ?, 'pending', 0, '等待处理', ?, '{}', ?, ?)
  `)
  stmt.run(id, type, inputJson, now, now)

  return getTask(id)
}

/**
 * Get a task by id
 * @param {string} id
 * @returns {object|null}
 */
export function getTask(id) {
  const db = getDb()
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  if (!row) return null

  return formatTask(row)
}

/**
 * Update a task's fields
 * @param {string} id
 * @param {{ status?: string, progress?: number, step?: string, output_data?: object, error_message?: string }} updates
 */
export function updateTask(id, updates) {
  const db = getDb()
  const now = new Date().toISOString()
  const fields = []
  const values = []

  if (updates.status !== undefined) {
    fields.push('status = ?')
    values.push(updates.status)
  }
  if (updates.progress !== undefined) {
    fields.push('progress = ?')
    values.push(updates.progress)
  }
  if (updates.step !== undefined) {
    fields.push('step = ?')
    values.push(updates.step)
  }
  if (updates.output_data !== undefined) {
    fields.push('output_data = ?')
    values.push(typeof updates.output_data === 'string' ? updates.output_data : JSON.stringify(updates.output_data))
  }
  if (updates.error_message !== undefined) {
    fields.push('error_message = ?')
    values.push(updates.error_message)
  }

  fields.push('updated_at = ?')
  values.push(now)
  values.push(id)

  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values)
}

/**
 * Get all pending tasks (oldest first)
 * @returns {object[]}
 */
export function getPendingTasks() {
  const db = getDb()
  const rows = db.prepare(
    "SELECT * FROM tasks WHERE status = 'pending' ORDER BY created_at ASC"
  ).all()
  return rows.map(formatTask)
}

/**
 * Get recent tasks (last N, any status)
 * @param {number} limit
 * @returns {object[]}
 */
export function getRecentTasks(limit = 10) {
  const db = getDb()
  const rows = db.prepare(
    'SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?'
  ).all(limit)
  return rows.map(formatTask)
}

/**
 * Format a raw DB row into a clean task object
 */
function formatTask(row) {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    progress: row.progress,
    step: row.step,
    input_data: safeJsonParse(row.input_data),
    output_data: safeJsonParse(row.output_data),
    error_message: row.error_message || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function safeJsonParse(str) {
  try {
    return JSON.parse(str)
  } catch {
    return typeof str === 'string' ? {} : str
  }
}
