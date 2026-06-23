import fs from 'fs'
import path from 'path'

const CACHE: Record<string, unknown> = {}

function load<T>(name: string): T | null {
  if (CACHE[name]) return CACHE[name] as T
  try {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'lib', `${name}.json`), 'utf-8'))
    CACHE[name] = data
    return data
  } catch { return null }
}

export function matchIndustry(input: string): string {
  const kw = input.toLowerCase()
  if (/餐饮|饭店|火锅|烧烤|奶茶|咖啡|小吃/.test(kw)) return 'dining'
  if (/装修|建材|家具|全屋定制|门窗|橱柜|工程|设计/.test(kw)) return 'decoration'
  if (/工厂|加工|制造|五金|机械|钢材|塑料|橡胶|设备|工业/.test(kw)) return 'factory'
  if (/中非|非洲|外贸|出口|跨境|欧洲|欧盟/.test(kw)) return 'trade'
  return 'retail'
}

export function getPainPointsForIndustry(industry: string, count = 5): string[] {
  const data = load<Record<string, Record<string, string[]>>>('pain-points')
  if (!data) return []
  const cat = matchIndustry(industry)
  const points = data[cat]
  if (!points) return []
  const all: string[] = []
  Object.values(points).forEach((v) => { if (Array.isArray(v)) all.push(...v) })
  return shuffle(all).slice(0, count)
}

export function getOralPhrases(coach: string, count = 5): string[] {
  const data = load<Record<string, { phrases: string[] }>>('oral-phrases')
  if (!data?.[coach]?.phrases) return []
  return shuffle(data[coach].phrases).slice(0, count)
}

export function getTitleFormulas(industry: string, count = 3): { type: string; pattern: string; examples: string[] }[] {
  const data = load<Record<string, Record<string, { pattern: string; industries: Record<string, string[]> }>>>('title-formulas')
  if (!data?.categories) return []
  const cat = matchIndustry(industry)
  const result: { type: string; pattern: string; examples: string[] }[] = []
  Object.entries(data.categories).forEach(([type, val]) => {
    const v = val as { pattern: string; industries: Record<string, string[]> }
    const examples = v.industries?.[cat] || v.industries?.retail || []
    result.push({ type, pattern: v.pattern, examples: examples.slice(0, count) })
  })
  return result
}

interface SceneItem {
  name: string
  note: string
  shotType: string
}

export function getRelevantScenes(coach: string, industry: string): { character: SceneItem[]; business: SceneItem[] } {
  const data = load<Record<string, unknown>>('pain-points')
  const cat = matchIndustry(industry)
  return {
    character: [{ name: `${industry}现场口播`, note: '近景固定机位', shotType: '近景' }],
    business: [{ name: `${industry}实景展示`, note: '真实纪实', shotType: '纪实' }],
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
