import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/openai'
import { getPainPointsForIndustry, getOralPhrases, getTitleFormulas } from '@/lib/knowledge'
import { checkForbidden } from '@/lib/compliance'

const COACH_PROMPTS: Record<string, string> = {
  libazi: `你是"纪实派·真诚人设"体系的实体老板IP短视频脚本生成器。

风格：22-26秒 | 全品类通用 | 行业真话+真诚纪实
镜头：近景口播60% + 纪实行走25% + 产品特写15%

25秒爆款四段式：
【0-3s】强钩子（反问/痛点/行业真相）
【3-12s】行业问题拆解
【12-19s】自我人设立场
【19-25s】收口引流

万能结尾句式："想要靠谱、想要透明、不想踩坑，关注我，私信我，一对一给你方案。"`,

  boge: `你是"烟火派·同城共情"体系的实体老板IP短视频脚本生成器。

风格：25-30秒 | 餐饮同城 | 共情+三点避坑
镜头：后厨烟火手持晃动60% + 坐下聊天20% + 菜品特写20%

30秒五段式：
【0-3s】同城痛点反问
【3-8s】创业共情故事
【8-15s】三个避坑点（第一/第二/第三）
【15-22s】我们不一样
【22-30s】私信收口

结尾句式："私信我，免费发你方案。我是波哥，只讲真话。"`,

  zhuge: `你是"认知派·高客单逻辑"体系的实体老板IP短视频脚本生成器。

风格：28-35秒 | 家装建材 | 认知干货+选材逻辑
镜头：展厅稳重口播50% + 材料特写30% + 工地巡检20%

35秒五段式：
【0-3s】痛点焦虑钩子
【3-10s】行业现状剖析
【10-22s】三点干货方法论
【22-30s】品牌差异化
【30-35s】私信引流

结尾句式："需要选材清单、避坑手册的朋友，私信我免费领取。"`,

  geng: `你是"工业派·B端采购"体系的实体老板IP短视频脚本生成器。

风格：20-25秒 | 工厂制造 | 成本拆解+采购干货
镜头：车间纪实行走60% + 机床前口播25% + 卡尺特写15%

25秒五段式：
【0-3s】采购痛点钩子
【3-9s】行业乱象拆解
【9-16s】三点采购干货
【16-21s】本厂优势
【21-25s】私信收口

结尾句式："需要样品和出厂报价，私信我。"`,
}

const MODULE_NAMES: Record<string, string> = {
  A: '人设信任篇', B: '行业真话篇', C: '客户避坑篇', D: '实力展示篇', E: '情绪成交篇',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { industry, product, targetCustomer, years, style, persona } = body
    const coach = style || 'libazi'

    if (!industry) return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })

    const coachPrompt = COACH_PROMPTS[coach] || COACH_PROMPTS.libazi
    const painPoints = getPainPointsForIndustry(industry, 8)
    const oralPhrases = getOralPhrases(coach, 5)
    const formulas = getTitleFormulas(industry, 2)

    const painSection = painPoints.length ? `\n## 参考用户真实痛点（每条脚本至少使用1个）：\n${painPoints.map(p => `- ${p}`).join('\n')}` : ''
    const oralSection = oralPhrases.length ? `\n## 参考口语风格（随机嵌入，增强真实性）：\n${oralPhrases.map(p => `- "${p}"`).join('\n')}` : ''

    const systemPrompt = `${coachPrompt}

## 五模块分配（共30条）
模块A（6条）${MODULE_NAMES.A}：自我介绍、创业故事、底线、初心、承诺
模块B（6条）${MODULE_NAMES.B}：没人敢说的真话、内卷乱象、行业规则
模块C（6条）${MODULE_NAMES.C}：新手坑、隐形套路、选靠谱商家
模块D（6条）${MODULE_NAMES.D}：工厂全景、库存底气、产品细节
模块E（6条）${MODULE_NAMES.E}：真诚必杀技、长期主义、私信引流${painSection}${oralSection}

## 禁止内容
不创新不创作不写文艺词。每条约260-360字，不得少于260字，要有细节和场景描写、具体的观众能听懂的通俗表达。必须是真人老板会说的口语。
每段末尾附加情绪钩子——用户看了这段为什么不会划走。格式：【🎣 情绪钩子】😯 被吸引→"内心OS"（每段只用箭头递进中对应的一个情绪）。
非${coach}风格的内容不要生成。

请以 JSON 格式返回：
{ "scripts": [{ "id": "a1", "module": "A", "title": "标题", "content": "260-360字的具体内容", "emotion": "😯 此刻观众情绪：好奇被吸引→想知道后面说什么" }] }
ID：a1-a6, b1-b6, c1-c6, d1-d6, e1-e6`

    const personaInfo = persona ? `\n人设：${persona.nickname} ${persona.bio || ''}` : ''
    const userPrompt = `行业：${industry}\n产品：${product}\n目标客户：${targetCustomer}\n年限：${years}\n教练：${coach}${personaInfo}\n请严格按${coach}风格生成30条脚本。`

    const response = await getClient().chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.7,
      max_tokens: 16384,
    })

    const content = response.choices[0]?.message?.content
    if (!content) return NextResponse.json({ error: 'AI 返回为空' }, { status: 500 })

    const data = JSON.parse(content)
    if (!data.scripts || !Array.isArray(data.scripts)) {
      return NextResponse.json({ error: '格式异常' }, { status: 500 })
    }

    // 违禁词检测
    const checkedScripts = data.scripts.map((s: any) => {
      const violations = checkForbidden(s.content || s.title || '', industry || '通用')
      return { ...s, violations, safe: violations.length === 0 }
    })
    const violationCount = checkedScripts.filter((s: any) => !s.safe).length

    return NextResponse.json({ scripts: checkedScripts, coach, meta: { painCount: painPoints.length, oralCount: oralPhrases.length, violationCount } })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '生成失败'
    if (msg.includes('API')) return NextResponse.json({ error: 'AI 服务配置异常' }, { status: 500 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
