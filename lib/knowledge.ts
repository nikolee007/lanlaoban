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
  if (/餐饮|饭店|火锅|烧烤|奶茶|咖啡|小吃|面馆/.test(kw)) return 'dining'
  if (/装修|建材|家具|全屋定制|门窗|橱柜|工程|设计|装饰/.test(kw)) return 'decoration'
  if (/工厂|加工|制造|五金|机械|钢材|塑料|橡胶|设备|工业|注塑/.test(kw)) return 'factory'
  if (/美容|美发|美甲|纹绣|皮肤|医美|养生|美业|祛痘/.test(kw)) return 'beauty'
  if (/教育|培训|教培|琴行|早教|辅导|艺考|少儿/.test(kw)) return 'education'
  if (/健身|瑜伽|舞蹈|私教|搏击|普拉提/.test(kw)) return 'fitness'
  if (/汽修|洗车|保养|轮胎|4s|修车|汽车/.test(kw)) return 'auto'
  if (/宠物|狗|猫|萌宠|宠物医院/.test(kw)) return 'pet'
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

/** 行业中文名映射（forbidden.json 用中文 key） */
const FORBIDDEN_KEY: Record<string, string> = {
  dining: '餐饮', decoration: '装修', factory: '工厂', education: '教育', beauty: '美业', trade: '跨境',
}

/** 合规红线提示（Agent 生成时注入，规避广告法极限词/功效违禁） */
export function getComplianceGuidance(industry: string): string {
  const data = load<Record<string, Record<string, string[]>>>('forbidden')
  if (!data) return ''
  const key = FORBIDDEN_KEY[matchIndustry(industry)] || '通用'
  const cat = data[key] || data['通用']
  if (!cat) return ''
  const parts: string[] = []
  Object.entries(cat).forEach(([type, words]) => {
    if (Array.isArray(words) && words.length) parts.push(`${type}：${words.join('、')}`)
  })
  if (parts.length === 0) return ''
  return `\n合规红线（文案严禁出现以下词汇，规避广告法与虚假宣传）：\n${parts.map((p) => `- 禁${p}`).join('\n')}\n同时严禁承诺涨粉/客流/营业额/收益等具体效果，只交付内容与工具价值。`
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
