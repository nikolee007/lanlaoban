import type { CloneEngine, CloneEngineId } from './types'
import { agnesEngine } from './agnes'
import { jimengEngine } from './jimeng'
import { klingEngine } from './kling'

const ENGINES: CloneEngine[] = [agnesEngine, jimengEngine, klingEngine]
const DEFAULT_ENGINE_ID = (process.env.CLONE_ENGINE as CloneEngineId) || 'agnes'

export function getEngines(): CloneEngine[] {
  return ENGINES
}

export function getEngine(id?: string | null): CloneEngine {
  const target = id ? ENGINES.find(e => e.id === id) : undefined
  if (target) return target
  // 默认引擎必须是 active；若 CLONE_ENGINE 配了 coming 引擎则回退到首个可用引擎
  const configured = ENGINES.find(e => e.id === DEFAULT_ENGINE_ID && e.status === 'active')
  return configured || ENGINES.find(e => e.status === 'active') || agnesEngine
}
