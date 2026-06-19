import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/openai'

// 行业特征提取引擎 — 根据已有行业模式推断新行业特征
const INDUSTRY_ARCHETYPES: Record<string, { coach: string; scene: string; template: string }> = {
  实体门店: { coach: 'libazi', scene: '门店实景', template: '门店服务' },
  餐饮: { coach: 'boge', scene: '后厨/前厅', template: '餐饮同城' },
  家装: { coach: 'zhuge', scene: '展厅/工地', template: '高客单' },
  工厂: { coach: 'geng', scene: '车间/产线', template: 'B端采购' },
  教育: { coach: 'libazi', scene: '教室/线上', template: '知识付费' },
  外贸: { coach: 'geng', scene: '工厂/展会', template: '跨境B端' },
  科技: { coach: 'libazi', scene: '办公室/展厅', template: '科技服务' },
  医疗: { coach: 'zhuge', scene: '诊所/社区', template: '专业服务' },
  消费: { coach: 'boge', scene: '门店/卖场', template: '同城引流' },
  服务: { coach: 'libazi', scene: '服务现场', template: '本地服务' },
  建材: { coach: 'zhuge', scene: '展厅/工地', template: '高客单' },
}

// 模式推断：从行业名匹配特征
function inferArchetype(industry: string): { coach: string; scene: string; template: string } {
  const kw = industry.toLowerCase()
  if (/餐饮|饭店|火锅|烧烤|奶茶|咖啡|小吃|美业|美容|美发/.test(kw)) return INDUSTRY_ARCHETYPES.餐饮
  if (/装修|建材|家具|全屋定制|门窗|橱柜|工程|设计|瓷砖|卫浴|软装/.test(kw)) return INDUSTRY_ARCHETYPES.家装
  if (/工厂|加工|制造|五金|机械|钢材|塑料|橡胶|设备|工业/.test(kw)) return INDUSTRY_ARCHETYPES.工厂
  if (/外贸|跨境|出口|非洲|欧洲|国际/.test(kw)) return INDUSTRY_ARCHETYPES.外贸
  if (/教育|培训|课程|职场|技能|育儿|亲子|艺术|美育|音乐|美术|钢琴/.test(kw)) return INDUSTRY_ARCHETYPES.教育
  if (/AI|数字人|科技|软件/.test(kw)) return INDUSTRY_ARCHETYPES.科技
  if (/健康|医疗|养老|康复|慢病|中医/.test(kw)) return INDUSTRY_ARCHETYPES.医疗
  if (/宠物|狗|猫/.test(kw)) return INDUSTRY_ARCHETYPES.消费
  if (/家政|团购|到家|社区|本地/.test(kw)) return INDUSTRY_ARCHETYPES.服务
  if (/门窗|定制|板材/.test(kw)) return INDUSTRY_ARCHETYPES.建材
  return INDUSTRY_ARCHETYPES.实体门店
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { industry, product, targetCustomer } = body
    if (!industry) return NextResponse.json({ error: '请提供行业名称' }, { status: 400 })

    const archetype = inferArchetype(industry)
    const coachName = archetype.coach === 'boge' ? '烟火派' : archetype.coach === 'zhuge' ? '认知派' : archetype.coach === 'geng' ? '工业派' : '纪实派'

    const systemPrompt = `你是一个行业IP内容策划师。给定一个新行业，自动生成完整的短视频内容数据包。

## 生成规则
需要产出4类内容，每类5条，共20条：

### 类型1：反问痛点型（5条）
句式："做XX，为什么YY？"
每个标题必须是该行业真实痛点、真实反问。

### 类型2：行业内幕揭秘型（5条）
句式："XX行业没人敢说的实话，低价产品基本都在这地方缩水"或"XX潜规则…"
揭露行业不为人知的内幕。

### 类型3：三点干货避坑型（5条）
句式："做XX牢记3个关键点，避开行业80%的坑"
必须包含"第一、第二、第三"或"1. 2. 3."的结构。

### 类型4：案例成果型（5条）
句式："从X到Y，我只用了这套方法"或展示成功案例。
每个标题需要有具体的数字/结果。

## 行业当前特征
行业：${industry}
产品：${product || '未指定'}
目标客户：${targetCustomer || '未指定'}
推断风格：${coachName}（${archetype.scene}）
推断模板：${archetype.template}

## 输出格式
以 JSON 返回：
{ "industry": "${industry}", "archetype": "${archetype.template}", "coach": "${archetype.coach}", "titles": { "反问痛点": ["..."], "内幕揭秘": ["..."], "避坑干货": ["..."], "案例成果": ["..."] }, "painPoints": { "provider": ["...", ...25条], "consumer": ["...", ...25条] }, "tags": ["#...", "#...", "#...", "#...", "#..."], "pinned": { "bio": "一句话人设", "intro": "完整自我介绍", "strength": "实力展示文案", "lead": "引流福利文案" }, "seasonal": ["选题1", "选题2", "选题3", "选题4", "选题5"] }`

    const response = await getClient().chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `为新行业"${industry}"生成完整内容数据包。产品：${product || '未指定'}，目标客户：${targetCustomer || '未指定'}。` },
      ],
      temperature: 0.7,
      max_tokens: 16384,
    })

    const content = response.choices[0]?.message?.content
    if (!content) return NextResponse.json({ error: 'AI 返回为空' }, { status: 500 })

    // 尝试解析，如果失败则用结构化的默认返回
    try {
      const data = JSON.parse(content)
      return NextResponse.json({ ...data, inferred: true, archetype: archetype.template })
    } catch {
      return NextResponse.json({
        industry,
        archetype: archetype.template,
        coach: archetype.coach,
        inferred: true,
        warning: 'AI返回格式异常，使用模式推断结果',
        titles: {
          "反问痛点": [`做${industry}，为什么越来越难做？`, `${industry}行业，明明产品不错为什么没客户？`],
          "内幕揭秘": [`${industry}行业没人敢说的实话，低价产品基本都在这地方缩水`, `${industry}潜规则：大部分客户都被中间商赚了差价`],
          "避坑干货": [`做${industry}牢记3个关键点，避开行业80%的坑`, `${industry}新手最容易踩的3个坑，看完少花冤枉钱`],
          "案例成果": [`从0到月入5万，这家${industry}只用了3个月`, `传统${industry}转型线上，获客成本降低60%`],
        },
        tags: [`#${industry}`, `#${industry}创业`, `#行业避坑`, `#实体经营`, `#老板IP`],
      })
    }
  } catch (error) {
    return NextResponse.json({ error: '生成失败' }, { status: 500 })
  }
}
