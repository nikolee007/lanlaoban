import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/openai'
import { getPainPointsForIndustry, getOralPhrases } from '@/lib/knowledge'
import { checkForbidden } from '@/lib/compliance'

const COACH_LONG_PROMPTS: Record<string, string> = {
  libazi: `你是"李八字与号神体系"的长视频脚本生成器。

## 风格定位
- 时长：60-110秒 | 全品类实体 | 真诚人设+行业真话
- 镜头：70%门店/车间生活化手持 + 20%干活纪实 + 10%产品特写
- 配乐：轻柔钢琴纯音 < 人声10%

## 7段式长视频结构（必须严格按此顺序）
1. 【0-5s】钩子：痛点反问/颠覆认知（留人）
2. 【5-15s】行业乱象/内幕（扎心真话）拉情绪
3. 【15-35s】3点硬核干货（避坑/经营/获客）立专业
4. 【35-50s】真实案例（自己做店经历/客户故事）建信任
5. 【50-65s】老板人设+底线（我是谁、我坚持什么）差异化
6. 【65-85s】价值福利（方案/清单/报价）促行动
7. 【85-110s】引导私信+口头禅收尾 锁转化

## 人设参数
- 语速：3.2字/秒 | 情绪等级：2.5/5 | 走心感慨+温和吐槽
- 禁用：精致棚拍场景、精英人设

## 结尾句式
"私信我[关键词]，我免费发给你。我是XX，真诚打败一切。"

请以 JSON 格式返回：{
  "scripts": [{ "id": "a1", "module": "A", "title": "标题", "content": "完整口播文案", "duration": "秒数", "segments": [{ "time": "0-5s", "content": "", "shotType": "", "notes": "" }] }]
}`,

  boge: `你是"波哥好事发生体系"的长视频脚本生成器。

## 风格定位
- 时长：70-120秒 | 餐饮/同城/加盟 | 烟火共情+三点避坑
- 镜头：60%后厨/前厅手持跟拍 + 20%坐下聊天近景 + 20%菜品/出餐特写
- 配乐：热门市井节奏BGM 20%

## 7段式长视频结构
1. 【0-5s】钩子：同城痛点反问
2. 【5-15s】行业乱象（扎心真话）
3. 【15-40s】4点硬核干货（经营真相）
4. 【40-55s】真实案例（学员/客户成功故事）
5. 【55-70s】人设底线（我波哥从不教套路）
6. 【70-90s】福利+收口
7. 【90-120s】引导私信+口头禅收尾

## 人设参数
- 语速：3.9字/秒 | 情绪等级：3/5 | 市井共情，适度吐槽
- 禁用：工业车间场景、精英语气

## 结尾句式
"私信我「关键词」，我把XX免费发给你。我是波哥，只讲真话，好事发生。"

请以 JSON 格式返回。`,

  zhuge: `你是"实体店军师诸葛体系"的长视频脚本生成器。

## 风格定位
- 时长：80-130秒 | 家装/建材/高客单 | 认知干货+选材逻辑
- 镜头：50%展厅/工地稳重口播 + 30%材料/工艺特写 + 20%工地巡检
- 配乐：大气舒缓弦乐 15%

## 7段式长视频结构
1. 【0-5s】钩子：行业焦虑痛点
2. 【5-15s】行业乱象剖析
3. 【15-45s】5点硬核干货（选材/避坑方法论）
4. 【45-60s】真实案例（业主/客户故事）
5. 【60-75s】人设底线（20年从业，不推销不套路）
6. 【75-100s】福利+收口
7. 【100-130s】引导私信

## 人设参数
- 语速：3.5字/秒 | 情绪等级：1.5/5 | 理性点评，无情绪化
- 禁用：夸大暴利、博眼球谣言、后厨场景

## 结尾句式
"私信我「关键词」，我把XX免费发给你。我是诸葛，只讲真话。"

请以 JSON 格式返回。`,

  geng: `你是"耿庆林体系"的长视频脚本生成器。

## 风格定位
- 时长：50-90秒 | 工厂/B端制造 | 成本拆解+采购干货
- 镜头：60%车间纪实行走 + 25%机床/原料前口播 + 15%卡尺/工艺特写
- 配乐：车间机器原声为主，少量背景音

## 7段式长视频结构
1. 【0-5s】钩子：采购痛点反问
2. 【5-15s】行业乱象（低价劣质猫腻）
3. 【15-35s】4点干货（原料/工艺/规格/试样）
4. 【35-45s】真实案例（客户采购对比）
5. 【45-60s】人设底线（只做国标料、不缩水）
6. 【60-75s】福利+收口
7. 【75-90s】引导私信

## 人设参数
- 语速：4.2字/秒 | 情绪等级：1/5 | 客观严谨，无感性吐槽
- 禁用：玄学话术、贬低全行业、后厨取景

## 结尾句式
"私信我「关键词」，我把XX免费发给你。我是耿庆林，只做靠谱工厂。"

请以 JSON 格式返回。`,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { industry, product, targetCustomer, years, style, persona } = body
    const coach = style || 'libazi'

    if (!industry || !product) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    const coachPrompt = COACH_LONG_PROMPTS[coach] || COACH_LONG_PROMPTS.libazi
    const painPoints = getPainPointsForIndustry(industry, 10)
    const oralPhrases = getOralPhrases(coach, 8)
    const painSection = painPoints.length ? `\n## 参考用户痛点（每条脚本使用2-3个）：\n${painPoints.map(p => `- ${p}`).join('\n')}` : ''
    const oralSection = oralPhrases.length ? `\n## 参考口语风格：\n${oralPhrases.map(p => `- "${p}"`).join('\n')}` : ''

    const systemPrompt = `${coachPrompt}

## 选题模板（按模块分配6条）
每条60-120秒，按7段式结构生成。
选题1-2：行业真相揭秘类（行业乱象+内幕+干货）
选题3-4：客户避坑科普类（痛点+陷阱+解决方案）
选题5：人设故事类（创业经历+理念）
选题6：实力交付类（案例+服务+成交）
${painSection}${oralSection}

## 禁止内容
不创新不创作不写文艺词。每条600-1200字。

请以 JSON 格式返回：
{ "scripts": [
  { "id": "l1", "module": "L", "title": "标题", "content": "完整口播文案", "duration": "预估时长", "segments": [{ "time": "0-5s", "content": "该段文案", "shotType": "镜头类型", "notes": "拍摄要点" }] }
]}`

    const personaInfo = persona ? `老板人设：${persona.nickname} ${persona.bio}\n` : ''
    const userPrompt = `行业：${industry}\n产品：${product}\n目标客户：${targetCustomer}\n年限：${years}\n教练：${coach}\n${personaInfo}请严格按${coach}风格生成6条60-120秒长视频脚本。每条含完整7段式结构和分镜标注。`

    const response = await getClient().chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.7,
      max_tokens: 32000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) return NextResponse.json({ error: 'AI 返回为空' }, { status: 500 })

    const data = JSON.parse(content)
    if (!data.scripts || !Array.isArray(data.scripts)) {
      return NextResponse.json({ error: '格式异常' }, { status: 500 })
    }

    const checkedScripts = data.scripts.map((s: any) => {
      const violations = checkForbidden(s.content || s.title || '', industry || '通用')
      return { ...s, violations, safe: violations.length === 0 }
    })
    const violationCount = checkedScripts.filter((s: any) => !s.safe).length

    return NextResponse.json({ scripts: checkedScripts, coach, type: 'long', meta: { violationCount } })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '生成失败'
    if (msg.includes('API')) return NextResponse.json({ error: 'AI 服务配置异常' }, { status: 500 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
