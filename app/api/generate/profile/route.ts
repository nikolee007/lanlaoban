import { NextRequest, NextResponse } from 'next/server'

const NICKNAME_FORMULAS: Record<string, string[]> = {
  dining: [ '{name}的{shop}', '{city}{name}丨{food}', '{name}餐饮说', '{food}找{name}' ],
  decoration: [ '{name}说装修', '{city}装修{name}', '{name}丨整装定制', '装修找{name}' ],
  factory: [ '{name}的工厂', '{product}厂{name}', '{city}丨{product}加工', '源头工厂{name}' ],
  retail: [ '{name}的{shop}', '{city}{name}｜{industry}', '{name}说经营', '{industry}找{name}' ],
}

const INDUSTRY_SHORT: Record<string, string> = {
  dining: '餐饮', decoration: '装修', factory: '制造', retail: '门店',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { industry, product, targetCustomer, years, name, coach } = body
    const cat = /餐饮|火锅|烧烤|奶茶/.test(industry||'') ? 'dining'
      : /装修|建材|家具|全屋定制/.test(industry||'') ? 'decoration'
      : /工厂|加工|制造|五金/.test(industry||'') ? 'factory'
      : 'retail'
    const shortName = name || '老王'
    const city = targetCustomer?.includes('本地') ? '' : ''

    // 昵称生成
    const nickFormulas = NICKNAME_FORMULAS[cat]
    const nickname = nickFormulas[0]
      .replace('{name}', shortName)
      .replace('{shop}', product?.slice(0, 4) || '门店')
      .replace('{city}', city)
      .replace('{food}', product?.slice(0, 3) || '美食')
      .replace('{product}', product?.slice(0, 4) || '产品')
      .replace('{industry}', INDUSTRY_SHORT[cat])
      .slice(0, 12)

    // Slogan
    const slogans: Record<string, string[]> = {
      dining: [`${product||'本店'}做的是回头客，不是一次性生意`, `食材新鲜、价格实在、不玩套路`, `${years||''}年餐饮老店，只做良心美食`],
      decoration: [`装修不踩坑，${shortName}帮你撑`, `透明报价、不增项、不缩水`, `${years||''}年装修经验，口碑胜过一切`],
      factory: [`源头工厂直供，去掉中间商差价`, `国标用料、严格品控、准时交付`, `${years||''}年专注${product||'加工'}，靠谱就是最好的名片`],
      retail: [`实体经营${years||''}年，老客户都是朋友`, `不搞套路、不卖假货、只做回头客`, `${shortName}出品，必属精品`],
    }
    const sloganList = slogans[cat] || slogans.retail

    // Bio
    const bios: Record<string, string[]> = {
      dining: [`做了${years||''}年${product||'餐饮'}的实在人，不玩虚的只做口碑`, `${product||'餐饮'}老板${years||''}年，诚信经营、真材实料`, `专注${product||'餐饮'}${years||''}年，用味道说话`],
      decoration: [`${product||'装修'}从业${years||''}年，透明报价、不增项`, `${years||''}年${product||'装修'}经验，懂工艺更懂你`, `本地${product||'装修'}${years||''}年，口碑是最好的广告`],
      factory: [`${product||'加工'}行业${years||''}年，源头工厂、国标用料`, `${years||''}年专注${product||'精密加工'}，品质就是生命线`, `${product||'制造'}从业${years||''}年，靠谱比低价更重要`],
      retail: [`${product||'实体店'}经营${years||''}年，诚信为本、客户至上`, `深耕${product||'行业'}${years||''}年，只做正品、只做服务`, `本地${product||'门店'}${years||''}年老店，值得信赖`],
    }
    const bioList = bios[cat] || bios.retail

    // 3 pinned video titles
    const pinTitles = [
      `${shortName}的真心话：做了${years||''}年${product||'行业'}，我悟到了什么`,
      `带你看真实的${product||'工厂/门店'}，没有摆拍全是日常`,
      `想${product?.includes('加盟')?'加盟':'合作'}？先看完这条视频，我再给你方案`,
    ]

    return NextResponse.json({
      profile: {
        nickname,
        bio: bioList[0],
        slogan: sloganList[0],
        altBios: bioList,
        altSlogans: sloganList,
        pinTitles,
      },
      coach,
      industry: cat,
    })
  } catch {
    return NextResponse.json({ error: '生成失败' }, { status: 500 })
  }
}
