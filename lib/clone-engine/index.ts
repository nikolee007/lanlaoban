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
  return target || ENGINES.find(e => e.id === DEFAULT_ENGINE_ID) || agnesEngine
}
