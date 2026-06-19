import forbidden from './forbidden.json'

export type Violation = {
  type: string
  word: string
  category: string
}

export function checkForbidden(text: string, industry: string): Violation[] {
  const violations: Violation[] = []
  const seen = new Set<string>()

  // 取行业特定 + 通用
  const industryKey = Object.keys(forbidden).find(k =>
    industry.includes(k) || k === industry
  ) || '通用'

  const rules: Record<string, string[]> = {}
  ;['通用', industryKey].forEach(key => {
    const cat = (forbidden as any)[key]
    if (!cat) return
    Object.entries(cat).forEach(([type, words]) => {
      if (!rules[type]) rules[type] = []
      rules[type].push(...(words as string[]))
    })
  })

  Object.entries(rules).forEach(([type, words]) => {
    words.forEach(word => {
      if (text.includes(word) && !seen.has(word)) {
        seen.add(word)
        violations.push({ type: '文字', word, category: type })
      }
    })
  })

  return violations
}

export function cleanForbidden(text: string, industry: string): string {
  const industryKey = Object.keys(forbidden).find(k =>
    industry.includes(k) || k === industry
  ) || '通用'

  let cleaned = text
  const rules: Record<string, string[]> = {}
  ;['通用', industryKey].forEach(key => {
    const cat = (forbidden as any)[key]
    if (!cat) return
    Object.entries(cat).forEach(([type, words]) => {
      if (!rules[type]) rules[type] = []
      rules[type].push(...(words as string[]))
    })
  })

  Object.values(rules).forEach(words => {
    words.forEach(word => {
      const regex = new RegExp(word, 'g')
      cleaned = cleaned.replace(regex, '***')
    })
  })

  return cleaned
}
