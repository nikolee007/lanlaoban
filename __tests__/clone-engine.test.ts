import { describe, it, expect } from 'vitest'
import { getEngine, getEngines } from '@/lib/clone-engine'
import { getTemplate, PREVIEW_TEMPLATES } from '@/lib/clone-engine/templates'

describe('clone-engine', () => {
  it('默认引擎为 agnes（active）', () => {
    const e = getEngine()
    expect(e.id).toBe('agnes')
    expect(e.status).toBe('active')
  })
  it('未知引擎回退默认', () => {
    const e = getEngine('unknown')
    expect(e.id).toBe('agnes')
  })
  it('coming 引擎不可用但可列出', () => {
    const engines = getEngines()
    expect(engines.length).toBe(3)
    expect(engines.filter(e => e.status === 'coming').length).toBe(2)
  })
  it('模板 buildPrompt 组装 avatar+product', () => {
    const t = getTemplate('owner_product')!
    const p = t.buildPrompt('Chinese business owner in suit', 'spicy fish head dish')
    expect(p).toContain('Chinese business owner in suit')
    expect(p).toContain('spicy fish head dish')
  })
  it('模板需要产品的校验', () => {
    expect(PREVIEW_TEMPLATES.find(t => t.id === 'owner_holding')!.requiresProduct).toBe(true)
    expect(PREVIEW_TEMPLATES.find(t => t.id === 'storefront_scene')!.requiresProduct).toBe(false)
  })
})
