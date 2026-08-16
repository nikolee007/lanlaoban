import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/auth'
import { requireServiceActive, serviceRequiredResponse } from '@/lib/service-gate'
import { db } from '@/lib/db'
import { getClient, getDefaultModel, extractJsonFromResponse } from '@/lib/openai'
import { getPainPointsForIndustry, getOralPhrases, getTitleFormulas, getComplianceGuidance } from '@/lib/knowledge'
import { checkForbidden } from '@/lib/compliance'
import { SKILLS, SkillType, buildProfileInjection, parseSkillOutput } from '@/lib/agent-skills'

// 提取数据里所有台词文本用于违禁词检测（兼容 standard/coldstart/convert/matrix/optimize 五种结构）
function collectLines(data: Record<string, unknown>): string[] {
  const lines: string[] = []
  const walk = (obj: unknown) => {
    if (Array.isArray(obj)) { obj.forEach(walk); return }
    if (obj && typeof obj === 'object') {
      const rec = obj as Record<string, unknown>
      if (typeof rec.line === 'string') lines.push(rec.line)
      if (typeof rec.title === 'string') lines.push(rec.title)
      Object.values(rec).forEach(walk)
    }
  }
  walk(data)
  return lines
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skillType, industry, product, targetCustomer, goal, durationSec, note, originalScript } = body

    // 付费服务门控：Agent 分析/方案需开通服务
    const userId = getAuthUserId(request.headers)
    if (!userId) return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    const gate = await requireServiceActive(userId)
    if (!gate.ok) return NextResponse.json(serviceRequiredResponse(), { status: 402 })

    const skill = SKILLS[skillType as SkillType]
    if (!skill) return NextResponse.json({ error: '未知场景' }, { status: 400 })

    // 1. 读取商家画像（登录用户自动注入 → 不用重填）
    let profile: { industry?: string | null; product?: string | null; targetAudience?: string | null; goal?: string | null } | null = null
    try {
      if (userId) {
        const found = await db.ipProfile.findUnique({ where: { userId } })
        if (found) profile = found
      }
    } catch { /* 未登录或读取失败，跳过画像，不影响生成 */ }

    // 2. 知识库注入（痛点 / 口语句式 / 标题公式）
    const ind = industry || profile?.industry || '通用'
    const painPoints = getPainPointsForIndustry(ind, 6)
    const oralPhrases = getOralPhrases('libazi', 4)
    const formulas = getTitleFormulas(ind, 2)

    const painSection = painPoints.length ? `\n参考用户真实痛点（脚本至少使用1个）：\n${painPoints.map((p) => `- ${p}`).join('\n')}` : ''
    const oralSection = oralPhrases.length ? `\n参考口语风格（随机嵌入）：\n${oralPhrases.map((p) => `- "${p}"`).join('\n')}` : ''
    const formulaSection = formulas.length ? `\n参考标题公式：\n${formulas.map((f) => `- [${f.type}] ${f.pattern}`).join('\n')}` : ''
    const complianceSection = getComplianceGuidance(ind)

    // 3. 画像注入段
    const profileSection = buildProfileInjection(profile ?? undefined)

    // 4. 组装 user prompt
    let userPrompt =
      `行业：${ind}\n` +
      `产品：${product || profile?.product || ''}\n` +
      `目标客户：${targetCustomer || profile?.targetAudience || ''}\n` +
      `视频目标：${goal || profile?.goal || ''}\n` +
      `视频时长：${durationSec || 60} 秒` +
      profileSection + painSection + oralSection + formulaSection + complianceSection
    if (note) userPrompt += `\n补充要求：${note}`
    if (skillType === 'optimize') {
      if (!originalScript) return NextResponse.json({ error: '优化场景需要提供原始脚本' }, { status: 400 })
      userPrompt += `\n\n待优化脚本：\n${originalScript}`
    }

    // 5. 调 OpenAI，JSON 解析 + 校验，失败自动重试一次
    let data: unknown = null
    let lastError = ''
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await getClient().chat.completions.create({
          model: getDefaultModel(),
          messages: [
            { role: 'system', content: skill.systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 8192,
        })
        const content = response.choices[0]?.message?.content
        if (!content) throw new Error('AI 返回为空')
        data = parseSkillOutput(skillType as SkillType, extractJsonFromResponse(content))
        break
      } catch (e) {
        lastError = e instanceof Error ? e.message : '解析失败'
        if (attempt === 0) continue
      }
    }
    if (!data) return NextResponse.json({ error: `生成格式异常：${lastError}` }, { status: 500 })

    // 6. 违禁词检测（对台词/标题字段）
    const violationLines = collectLines(data as Record<string, unknown>)
    const violations = violationLines.flatMap((t) => checkForbidden(t, ind))

    return NextResponse.json({
      success: true,
      skill: { id: skillType, name: skill.name },
      data,
      meta: {
        industry: ind,
        painCount: painPoints.length,
        violationCount: violations.length,
        fromProfile: !!profile,
      },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '生成失败'
    if (msg.includes('API')) return NextResponse.json({ error: 'AI 服务配置异常' }, { status: 500 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
