import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { industry, product, targetCustomer, years, coach } = body

    if (!industry) return NextResponse.json({ error: '请提供行业名称' }, { status: 400 })

    const systemPrompt = `你是一个实体老板IP全案策划师。你的任务是为客户生成一份完整的"IP起盘规划报告"。

报告必须包含以下7个板块，每个板块都要具体可执行：

## 1. 行业分析
- 当前行业做短视频的现状（3个关键点）
- 用户最痛的3个问题
- 同行内容的普遍误区

## 2. 人设定位
- 建议的昵称格式
- 人设标签（3个固定标签）
- 一句话人设描述

## 3. 内容策略
- 内容四象限：人设/干货/产品/成交
- 每条内容的方向说明
- 前10条内容的选题建议

## 4. 变现路径
- 短期变现方式（1个月内）
- 中期变现方式（1-3个月）
- 长期变现方式（3-6个月）

## 5. 起号节奏
- 冷启动期（1-2周）：做什么、发什么
- 爬坡期（3-4周）：做什么、发什么
- 稳定期（第2个月起）：做什么、发什么

## 6. 拍摄方案
- 设备建议：手机型号、收音麦、灯光（3-4套方案，从低配到高配）
- 场景建议：3-5个必拍场景
- 镜头风格建议

## 7. 30天行动计划
- 逐周安排
- 每周关键产出
- 每周核心指标

用第一人称写给老板看，语气笃定、专业、不废话。

以 JSON 格式返回：
{
  "industry": "",
  "persona": { "nickname": "", "tags": [], "description": "" },
  "analysis": { "status": "", "userPain": [], "peerMistakes": [] },
  "contentStrategy": { "quadrants": [{ "type": "", "direction": "", "ratio": 0 }], "first10": [] },
  "monetization": { "shortTerm": "", "midTerm": "", "longTerm": "" },
  "growthPhases": { "coldStart": "", "climb": "", "stable": "" },
  "equipment": [{ "tier": "基础|标准|专业|顶配", "phone": "", "mic": "", "light": "", "budget": "" }],
  "scenes": [{ "name": "", "note": "" }],
  "actionPlan": [{ "week": 1, "focus": "", "output": "", "kpi": "" }]
}`

    const userPrompt = `行业：${industry}
产品/服务：${product || '未提供'}
目标客户：${targetCustomer || '未提供'}
从业年限：${years || '未提供'}
风格偏好：${coach || '纪实派'}

请为这位实体老板生成完整的IP起盘规划报告。`

    const response = await getClient().chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.7,
      max_tokens: 16384,
    })

    const content = response.choices[0]?.message?.content
    if (!content) return NextResponse.json({ error: 'AI 返回为空' }, { status: 500 })

    try {
      const data = JSON.parse(content)
      return NextResponse.json(data)
    } catch {
      return NextResponse.json({ error: '格式异常' }, { status: 500 })
    }
  } catch {
    return NextResponse.json({ error: '生成失败' }, { status: 500 })
  }
}
