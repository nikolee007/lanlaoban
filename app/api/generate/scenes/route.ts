import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/openai'

const COACH_SCENES: Record<string, { character: string[], business: string[] }> = {
  libazi: {
    character: ['门店前台正面近景', '车间/仓库工作台前站立', '产品货架前侧身站立', '门店门口自然站立'],
    business: ['车间流水线全景', '仓库堆货实拍', '产品细节特写', '发货装车纪实', '客户接待实拍', '质检过程拍摄', '库存盘点全景', '日常办公场景', '门店招牌门头', '产品陈列展示'],
  },
  boge: {
    character: ['后厨灶台前口播', '前厅餐桌旁站立', '门店招牌前正面', '食材操作台前'],
    business: ['后厨炒菜实拍', '食材备料过程', '出餐流程纪实', '门店客流实拍', '店内环境全景', '特色菜品特写', '员工忙碌场景', '外卖打包实录', '顾客就餐抓拍', '门店外景门头'],
  },
  zhuge: {
    character: ['展厅样品前站立', '办公室落地窗前', '材料展示区正面', '洽谈区端坐'],
    business: ['展厅全景扫视', '样品细节特写', '材料对比实拍', '施工工地纪实', '工厂设备全景', '工艺细节微距', '仓库材料堆放', '设计图纸展示', '客户签约抓拍', '团队会议场景'],
  },
  geng: {
    character: ['机床旁正面站立', '原料堆前侧面', '成品区卡尺实测', '车间通道行走'],
    business: ['流水线运行全景', '机床加工特写', '原料入库存放', '成品打包过程', '质检卡尺测量', '产品截面微距', '设备操作纪实', '车间全景扫视', '发货装车实录', '库存盘点全景'],
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { industry, product, coach } = body
    const coachKey = (coach || 'libazi') as string
    const scenes = COACH_SCENES[coachKey] || COACH_SCENES.libazi

    // 用 AI 润色场景描述使其更贴合具体行业
    const systemPrompt = `你是实体老板IP拍摄的场景策划师。根据行业和教练风格，为短视频拍摄提供场景方案。

当前教练风格：${coachKey}
固定场景框架：
人物场景（5个）：${scenes.character.join('、')}
业务场景（10个）：${scenes.business.join('、')}

请根据具体行业，微调每个场景描述，使其贴合 ${industry} 行业特点。
每个场景给出：场景名称 + 拍摄要点（一句话）。
以 JSON 格式返回。

{
  "characterScenes": [
    { "id": "c1", "name": "场景名", "note": "拍摄要点", "shotType": "近景口播" }
  ],
  "businessScenes": [
    { "id": "b1", "name": "场景名", "note": "拍摄要点", "shotType": "纪实/特写" }
  ]
}`

    const response = await getClient().chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `行业：${industry}，产品：${product}，教练风格：${coachKey}。请适配场景方案。` },
      ],
      temperature: 0.5,
      max_tokens: 4096,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      // fallback: 使用固定模板
      const shotTypes = ['近景口播', '纪实行走', '产品特写']
      return NextResponse.json({
        characterScenes: scenes.character.map((name, i) => ({
          id: `c${i + 1}`, name, note: `${industry}实景拍摄，自然光为主`,
          shotType: shotTypes[i % 3],
        })),
        businessScenes: scenes.business.map((name, i) => ({
          id: `b${i + 1}`, name, note: `${industry}现场真实记录`,
          shotType: i < 3 ? '全景' : i < 6 ? '纪实' : '特写',
        })),
      })
    }

    try {
      return NextResponse.json(JSON.parse(content))
    } catch {
      return NextResponse.json({
        characterScenes: scenes.character.map((name, i) => ({
          id: `c${i + 1}`, name, note: `${industry}现场拍摄`,
          shotType: '近景口播',
        })),
        businessScenes: scenes.business.map((name, i) => ({
          id: `b${i + 1}`, name, note: `${industry}真实记录`,
          shotType: '纪实',
        })),
      })
    }
  } catch {
    return NextResponse.json({ error: '场景生成失败' }, { status: 500 })
  }
}
