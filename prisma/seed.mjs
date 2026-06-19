import { PrismaClient } from '@prisma/client'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const bcrypt = require('bcryptjs')

const db = new PrismaClient()

async function hashPassword(pwd) {
  return await bcrypt.hash(pwd, 10)
}

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Clean existing data ──────────────────────────
  await db.aggregatedReview.deleteMany()
  await db.purchaseOrderItem.deleteMany()
  await db.purchaseOrder.deleteMany()
  await db.purchaseCart.deleteMany()
  await db.contactInquiry.deleteMany()
  await db.userCollection.deleteMany()
  await db.product.deleteMany()
  await db.supplier.deleteMany()
  await db.category.deleteMany()
  await db.logisticsProvider.deleteMany()
  await db.channel.deleteMany()
  await db.notification.deleteMany()
  await db.ipChat.deleteMany()
  await db.ipProfile.deleteMany()
  await db.user.deleteMany()

  // ─── Categories ────────────────────────────────────
  const categories = await Promise.all([
    db.category.create({ data: { id:1, name:'手机配件', type:'both', icon:'📱', sortOrder:1 } }),
    db.category.create({ data: { id:2, name:'小家电', type:'both', icon:'⚡', sortOrder:2 } }),
    db.category.create({ data: { id:3, name:'家居日用', type:'both', icon:'🏠', sortOrder:3 } }),
    db.category.create({ data: { id:4, name:'服饰鞋包', type:'crossborder', icon:'👗', sortOrder:4 } }),
    db.category.create({ data: { id:5, name:'美妆个护', type:'crossborder', icon:'💄', sortOrder:5 } }),
    db.category.create({ data: { id:6, name:'运动户外', type:'crossborder', icon:'🏃', sortOrder:6 } }),
    db.category.create({ data: { id:7, name:'厨房用品', type:'both', icon:'🍳', sortOrder:7 } }),
    db.category.create({ data: { id:8, name:'电子数码', type:'crossborder', icon:'💻', sortOrder:8 } }),
    db.category.create({ data: { id:9, name:'宠物用品', type:'both', icon:'🐾', sortOrder:9 } }),
    db.category.create({ data: { id:10, name:'玩具礼品', type:'crossborder', icon:'🎁', sortOrder:10 } }),
    db.category.create({ data: { id:11, name:'建材五金', type:'domestic', icon:'🔧', sortOrder:11 } }),
    db.category.create({ data: { id:12, name:'餐饮设备', type:'domestic', icon:'🍽️', sortOrder:12 } }),
  ])
  console.log(`  ✅ ${categories.length} categories`)

  // ─── Suppliers ─────────────────────────────────────
  const supplierData = [
    { nameZh:'深圳华强电子', nameEn:'Huaqiang Electronics', location:'广东深圳', year:2005, employees:800, revenue:5000, certs:'ISO9001,CE,FCC', tags:'电子产品,手机配件,数码', destinations:'北美,欧洲,东南亚', rating:4.7, reviews:1280, verified:true, type:'factory', intro:'专注手机配件研发生产20年', capacity:'500万件/月', leadTime:'15-25天', payment:'T/T 30%定金'},
    { nameZh:'义乌小商品贸易', nameEn:'Yiwu Trading Co.', location:'浙江义乌', year:2010, employees:200, revenue:800, certs:'BSCI', tags:'日用百货,家居,小商品', destinations:'中东,非洲,东南亚', rating:4.5, reviews:890, verified:true, type:'distributor', intro:'义乌一手货源直供', capacity:'200万件/月', leadTime:'7-15天', payment:'支付宝/微信'},
    { nameZh:'广东美的电器', nameEn:'Midea Appliances', location:'广东佛山', year:1968, employees:160000, revenue:25000, certs:'ISO9001,UL,GS,CCC', tags:'小家电,厨房电器,空调', destinations:'全球', rating:4.8, reviews:5600, verified:true, type:'brand', intro:'全球领先的消费电器制造商', capacity:'千万级', leadTime:'20-35天', payment:'L/C,T/T'},
    { nameZh:'浙江苏泊尔', nameEn:'Supor Cookware', location:'浙江杭州', year:1994, employees:12000, revenue:6000, certs:'ISO9001,NSF,LFGB', tags:'厨具,压力锅,不粘锅', destinations:'北美,欧洲,东南亚', rating:4.7, reviews:2300, verified:true, type:'brand', intro:'中国厨房用品龙头企业', capacity:'500万件/月', leadTime:'20-30天', payment:'T/T'},
    { nameZh:'福建安踏体育', nameEn:'Anta Sports', location:'福建晋江', year:1994, employees:30000, revenue:15000, certs:'ISO9001,ISO14001', tags:'运动鞋,运动服饰', destinations:'东南亚,中东,南美', rating:4.6, reviews:1800, verified:true, type:'brand', intro:'中国领先的体育运动品牌', capacity:'300万双/月', leadTime:'25-40天', payment:'T/T, L/C'},
    { nameZh:'广州完美日记', nameEn:'Perfect Diary', location:'广东广州', year:2016, employees:5000, revenue:3000, certs:'ISO22716,MSDS', tags:'彩妆,美妆,护肤品', destinations:'东南亚,日本', rating:4.5, reviews:3200, verified:true, type:'brand', intro:'新锐国货美妆品牌', capacity:'100万件/月', leadTime:'15-25天', payment:'T/T'},
    { nameZh:'青岛啤酒国际', nameEn:'Tsingtao Brewery Intl', location:'山东青岛', year:1903, employees:40000, revenue:12000, certs:'ISO22000,HACCP,BRC', tags:'啤酒,饮品,食品', destinations:'全球100+国家', rating:4.8, reviews:4500, verified:true, type:'brand', intro:'百年民族品牌', capacity:'千万箱/年', leadTime:'30-45天', payment:'L/C,T/T'},
    { nameZh:'浙江正泰电器', nameEn:'CHINT Electric', location:'浙江温州', year:1984, employees:30000, revenue:8000, certs:'ISO9001,CCC,CE,UL', tags:'低压电器,开关,插座', destinations:'全球140+国家', rating:4.6, reviews:2100, verified:true, type:'factory', intro:'中国低压电器领军企业', capacity:'千万级', leadTime:'20-35天', payment:'T/T'},
    { nameZh:'深圳传音控股', nameEn:'Transsion Holdings', location:'广东深圳', year:2006, employees:14000, revenue:5000, certs:'ISO9001', tags:'手机,智能设备,非洲市场', destinations:'非洲,南亚', rating:4.4, reviews:980, verified:true, type:'brand', intro:'非洲手机之王', capacity:'500万台/月', leadTime:'25-40天', payment:'T/T'},
    { nameZh:'广东格兰仕', nameEn:'Galanz Group', location:'广东中山', year:1978, employees:30000, revenue:5000, certs:'ISO9001,CE,GS,CCC', tags:'微波炉,烤箱,冰箱', destinations:'全球200+国家', rating:4.6, reviews:1600, verified:true, type:'factory', intro:'全球最大的微波炉制造商', capacity:'600万台/年', leadTime:'25-40天', payment:'T/T,L/C'},
    { nameZh:'浙江义乌小商品城', nameEn:'Yiwu Market Supply', location:'浙江义乌', year:2008, employees:150, revenue:3000, tags:'日用百货,家居收纳,礼品', destinations:'中东,非洲,拉美', rating:4.3, reviews:2100, verified:true, type:'distributor', intro:'义乌国际商贸城直供渠道', capacity:'现货', leadTime:'3-7天', payment:'支付宝'},
    { nameZh:'汕头澄海玩具', nameEn:'Chenghai Toys', location:'广东汕头', year:2000, employees:2000, revenue:2000, certs:'ISO9001,EN71,ASTM', tags:'玩具,遥控车,积木', destinations:'全球', rating:4.5, reviews:1500, verified:true, type:'factory', intro:'中国玩具之都', capacity:'300万件/月', leadTime:'20-35天', payment:'T/T'},
    { nameZh:'山东九阳股份', nameEn:'Joyoung', location:'山东济南', year:1994, employees:8000, revenue:4000, certs:'ISO9001,CCC,CE', tags:'豆浆机,破壁机,厨房小电', destinations:'东南亚,北美', rating:4.6, reviews:2800, verified:true, type:'brand', intro:'中国厨房小家电领导品牌', capacity:'200万台/月', leadTime:'20-35天', payment:'T/T'},
    { nameZh:'福建恒安集团', nameEn:'Hengan Group', location:'福建晋江', year:1985, employees:30000, revenue:5000, certs:'ISO9001,ISO14001', tags:'卫生巾,纸尿裤,生活用纸', destinations:'东南亚,非洲', rating:4.4, reviews:1200, verified:true, type:'brand', intro:'中国生活用纸龙头', capacity:'千万件/月', leadTime:'15-25天', payment:'T/T'},
    { nameZh:'广州立白集团', nameEn:'Liby Group', location:'广东广州', year:1994, employees:10000, revenue:3000, certs:'ISO9001,ISO14001', tags:'洗衣液,洗洁精,家居清洁', destinations:'东南亚', rating:4.3, reviews:900, verified:true, type:'brand', intro:'中国日化领导品牌', capacity:'500万箱/月', leadTime:'15-20天', payment:'T/T'},
    { nameZh:'深圳倍思科技', nameEn:'Baseus', location:'广东深圳', year:2011, employees:3000, revenue:2000, certs:'CE,FCC,RoHS', tags:'充电器,数据线,手机配件', destinations:'全球100+国家', rating:4.5, reviews:3800, verified:true, type:'brand', intro:'中国3C配件新锐品牌', capacity:'300万件/月', leadTime:'15-25天', payment:'T/T'},
    { nameZh:'芜湖三只松鼠', nameEn:'Three Squirrels', location:'安徽芜湖', year:2012, employees:4000, revenue:2000, certs:'ISO22000,HACCP', tags:'坚果,零食,食品', destinations:'东南亚', rating:4.4, reviews:5600, verified:true, type:'brand', intro:'中国互联网零食第一品牌', capacity:'500万袋/月', leadTime:'7-15天', payment:'支付宝'},
    { nameZh:'上海晨光文具', nameEn:'M&G Stationery', location:'上海', year:1989, employees:8000, revenue:2000, certs:'ISO9001', tags:'文具,办公用品,礼品', destinations:'全球50+国家', rating:4.3, reviews:1500, verified:true, type:'brand', intro:'中国文具行业龙头', capacity:'千万件/月', leadTime:'15-25天', payment:'T/T'},
    { nameZh:'广东小熊电器', nameEn:'Bear Electric', location:'广东佛山', year:2006, employees:4000, revenue:1500, certs:'CCC,CE', tags:'创意小家电,酸奶机,煮蛋器', destinations:'东南亚,南美', rating:4.5, reviews:2200, verified:true, type:'brand', intro:'创意小家电第一品牌', capacity:'150万台/月', leadTime:'15-25天', payment:'T/T'},
    { nameZh:'浙江哈尔斯', nameEn:'Haers Vacuum', location:'浙江永康', year:1985, employees:6000, revenue:1500, certs:'ISO9001,LFGB,FDA', tags:'保温杯,真空杯,户外水壶', destinations:'全球80+国家', rating:4.4, reviews:1800, verified:true, type:'factory', intro:'中国杯壶行业领军企业', capacity:'500万个/月', leadTime:'20-30天', payment:'T/T'},
    { nameZh:'宁波得力集团', nameEn:'Deli Group', location:'浙江宁波', year:1988, employees:10000, revenue:3000, certs:'ISO9001', tags:'文具,办公,学生用品', destinations:'全球', rating:4.3, reviews:2500, verified:true, type:'factory', intro:'中国办公文具行业领导者', capacity:'千万级', leadTime:'15-25天', payment:'T/T'},
    { nameZh:'广州白云山制药', nameEn:'Baiyunshan Pharma', location:'广东广州', year:1888, employees:20000, revenue:5000, certs:'GMP,ISO9001', tags:'药品,大健康,护肤品', destinations:'东南亚,非洲', rating:4.5, reviews:800, verified:true, type:'brand', intro:'百年老字号药企', capacity:'500万件/月', leadTime:'20-30天', payment:'T/T'},
    { nameZh:'深圳安克创新', nameEn:'Anker Innovations', location:'广东深圳', year:2011, employees:5000, revenue:5000, certs:'CE,FCC,UL,PSE', tags:'充电器,充电宝,音频,智能家居', destinations:'全球100+国家', rating:4.7, reviews:8900, verified:true, type:'brand', intro:'全球领先的充电品牌', capacity:'500万件/月', leadTime:'20-30天', payment:'T/T'},
    { nameZh:'浙江洁柔纸业', nameEn:'C&S Paper', location:'广东中山', year:1999, employees:6000, revenue:2000, certs:'ISO9001,ISO14001', tags:'纸巾,生活用纸,湿巾', destinations:'东南亚', rating:4.2, reviews:1200, verified:true, type:'brand', intro:'中国生活用纸知名品牌', capacity:'千万卷/月', leadTime:'10-20天', payment:'T/T'},
    { nameZh:'湖北良品铺子', nameEn:'Bestore', location:'湖北武汉', year:2006, employees:10000, revenue:3000, certs:'ISO22000,HACCP', tags:'零食,坚果,卤味,糕点', destinations:'东南亚', rating:4.4, reviews:4500, verified:true, type:'brand', intro:'中国高端零食品牌', capacity:'800万袋/月', leadTime:'7-15天', payment:'支付宝/微信'},
    { nameZh:'江苏鱼跃医疗', nameEn:'Yuwell Medical', location:'江苏丹阳', year:1998, employees:5000, revenue:2000, certs:'ISO13485,CE,FDA', tags:'血压计,体温计,呼吸机', destinations:'全球100+国家', rating:4.5, reviews:600, verified:true, type:'factory', intro:'中国医疗器械领军品牌', capacity:'200万台/月', leadTime:'20-35天', payment:'T/T'},
    { nameZh:'浙江森马服饰', nameEn:'Semir Apparel', location:'浙江温州', year:1996, employees:20000, revenue:4000, certs:'ISO9001,Oeko-Tex', tags:'休闲服装,童装,鞋类', destinations:'东南亚,中东', rating:4.2, reviews:1500, verified:true, type:'brand', intro:'中国休闲服饰龙头', capacity:'500万件/月', leadTime:'25-40天', payment:'T/T'},
    { nameZh:'广东万和新电气', nameEn:'Vanward Electric', location:'广东佛山', year:1993, employees:5000, revenue:2000, certs:'ISO9001,CCC,CE', tags:'热水器,燃气灶,抽油烟机', destinations:'东南亚,中东', rating:4.4, reviews:900, verified:true, type:'factory', intro:'中国燃气具领导品牌', capacity:'100万台/月', leadTime:'25-40天', payment:'T/T'},
    { nameZh:'苏州科沃斯', nameEn:'Ecovacs Robotics', location:'江苏苏州', year:1998, employees:6000, revenue:3000, certs:'ISO9001,CE,FCC', tags:'扫地机器人,擦窗机器人', destinations:'全球', rating:4.6, reviews:3600, verified:true, type:'brand', intro:'全球服务机器人行业领导者', capacity:'200万台/月', leadTime:'20-35天', payment:'T/T'},
    { nameZh:'深圳绿联科技', nameEn:'UGREEN Group', location:'广东深圳', year:2011, employees:2000, revenue:1500, certs:'CE,FCC,RoHS', tags:'数据线,充电器,扩展坞,网卡', destinations:'全球100+国家', rating:4.5, reviews:4200, verified:true, type:'brand', intro:'中国数码配件知名品牌', capacity:'500万件/月', leadTime:'15-25天', payment:'T/T'},
    { nameZh:"深圳韶音科技", nameEn:"Shokz", location:"广东深圳", year:2011, employees:2000, revenue:800, certs:"CE,FCC,IP67", tags:"骨传导耳机,运动耳机,户外音频", destinations:"全球80+国家", rating:4.6, reviews:2800, verified:true, type:"brand", intro:"骨传导耳机全球领导品牌", capacity:"50万台/月", leadTime:"20-30天", payment:"T/T"},
    { nameZh:"杭州遍知科技", nameEn:"Bianzhi Tech", location:"浙江杭州", year:2015, employees:300, revenue:300, certs:"CE,FCC", tags:"AI翻译耳机,智能穿戴,跨境电商", destinations:"全球60+国家", rating:4.3, reviews:1200, verified:true, type:"brand", intro:"AI智能硬件出海新锐", capacity:"10万台/月", leadTime:"15-25天", payment:"T/T"},
    { nameZh:"广州斯凯奇中国", nameEn:"Skechers China", location:"广东广州", year:2018, employees:500, revenue:2000, certs:"ISO9001,ISO14001", tags:"运动鞋,休闲鞋,健步鞋", destinations:"东南亚,日韩", rating:4.5, reviews:5600, verified:true, type:"brand", intro:"美国休闲运动品牌中国区供应链", capacity:"200万双/月", leadTime:"30-45天", payment:"L/C,T/T"},
    { nameZh:"深圳云鲸智能", nameEn:"Narwal Robotics", location:"广东深圳", year:2016, employees:1500, revenue:1000, certs:"ISO9001,CE,FCC", tags:"扫拖机器人,自清洁,智能家居", destinations:"全球50+国家", rating:4.6, reviews:3200, verified:true, type:"brand", intro:"自清洁扫拖机器人开创者", capacity:"30万台/月", leadTime:"20-35天", payment:"T/T"},
    { nameZh:"浙江大华股份", nameEn:"Dahua Technology", location:"浙江杭州", year:2001, employees:20000, revenue:5000, certs:"ISO9001,CE,FCC,UL", tags:"安防摄像头,智能门铃,监控设备", destinations:"全球180+国家", rating:4.5, reviews:1800, verified:true, type:"factory", intro:"全球安防行业领军企业", capacity:"500万台/月", leadTime:"20-35天", payment:"T/T,L/C"},
    { nameZh:"深圳影石创新", nameEn:"Insta360", location:"广东深圳", year:2015, employees:2000, revenue:1500, certs:"CE,FCC,RoHS", tags:"全景相机,运动相机,VR设备", destinations:"全球200+国家", rating:4.7, reviews:4500, verified:true, type:"brand", intro:"全球全景相机行业领导者", capacity:"20万台/月", leadTime:"15-25天", payment:"T/T"},
    { nameZh:"深圳基克纳科技", nameEn:"GEEKVAPE", location:"广东深圳", year:2015, employees:3000, revenue:2000, certs:"CE,FCC,TPD", tags:"电子烟,雾化器,出海品牌", destinations:"欧美,东南亚", rating:4.3, reviews:1500, verified:true, type:"brand", intro:"电子雾化行业出海头部品牌", capacity:"500万件/月", leadTime:"15-25天", payment:"T/T"},
    { nameZh:"广州蓝深科技", nameEn:"Lanshen Tech", location:"广东广州", year:2015, employees:800, revenue:500, certs:"CE,FCC,RoHS", tags:"乐器,吉他,电钢琴,音乐配件", destinations:"全球100+国家", rating:4.4, reviews:900, verified:true, type:"brand", intro:"中国乐器出海头部品牌", capacity:"30万件/月", leadTime:"20-30天", payment:"T/T"},
    { nameZh:"深圳赛维时代", nameEn:"Sailvan Times", location:"广东深圳", year:2012, employees:5000, revenue:3000, certs:"ISO9001,BSCI", tags:"服饰,家居,宠物,个护", destinations:"欧美", rating:4.2, reviews:600, verified:true, type:"distributor", intro:"跨境电商大卖·多品类分销", capacity:"现货", leadTime:"3-7天", payment:"TT/支付宝"},
    { nameZh:"深圳易佰网络", nameEn:"Yibainetwork", location:"广东深圳", year:2015, employees:3000, revenue:2000, certs:"ISO9001", tags:"家居,工具,户外,宠物", destinations:"欧美,日本", rating:4.1, reviews:400, verified:true, type:"distributor", intro:"跨境电商泛品类分销商", capacity:"现货", leadTime:"3-7天", payment:"支付宝"},
    { nameZh:"浙江华睿科技", nameEn:"Huarui Tech", location:"浙江杭州", year:2016, employees:1000, revenue:500, certs:"ISO9001,CE", tags:"智能物流,AGV机器人,仓储自动化", destinations:"全球40+国家", rating:4.4, reviews:300, verified:true, type:"factory", intro:"智能仓储物流解决方案提供商", capacity:"1000台/月", leadTime:"30-60天", payment:"T/T,L/C"},
    { nameZh:"广州希音供应链", nameEn:"SHEIN Supply Chain", location:"广东广州", year:2014, employees:5000, revenue:20000, certs:"ISO9001,BSCI,OEKO-TEX", tags:"快时尚,服饰,配饰,鞋包", destinations:"全球150+国家", rating:4.5, reviews:12000, verified:true, type:"brand", intro:"全球快时尚电商领先品牌", capacity:"千万件/月", leadTime:"7-15天", payment:"TT"},
    { nameZh:"深圳罗马仕科技", nameEn:"ROMOSS", location:"广东深圳", year:2012, employees:3000, revenue:1500, certs:"CE,FCC,RoHS,UN38.3", tags:"充电宝,充电器,数据线,储能", destinations:"全球120+国家", rating:4.5, reviews:18000, verified:true, type:"brand", intro:"中国移动电源领导品牌", capacity:"800万件/月", leadTime:"15-25天", payment:"T/T"},
    { nameZh:"深圳品胜电子", nameEn:"PISEN", location:"广东深圳", year:2004, employees:2000, revenue:800, certs:"CE,FCC,RoHS", tags:"充电宝,电池,手机配件,3C数码", destinations:"全球80+国家", rating:4.3, reviews:5600, verified:true, type:"brand", intro:"中国3C配件知名品牌", capacity:"300万件/月", leadTime:"15-25天", payment:"T/T"},
    { nameZh:"东莞漫步者科技", nameEn:"Edifier", location:"广东东莞", year:1996, employees:5000, revenue:2000, certs:"ISO9001,CE,FCC", tags:"音箱,耳机,音频设备", destinations:"全球80+国家", rating:4.5, reviews:8900, verified:true, type:"brand", intro:"中国音频行业领导品牌", capacity:"200万台/月", leadTime:"20-30天", payment:"T/T"},
    { nameZh:"深圳橙子自动化", nameEn:"Orange Automation", location:"广东深圳", year:2017, employees:500, revenue:300, certs:"ISO9001,CE", tags:"自动化设备,智能产线,工业机器人", destinations:"东南亚,印度", rating:4.3, reviews:200, verified:true, type:"factory", intro:"智能制造解决方案提供商", capacity:"100套/月", leadTime:"30-60天", payment:"T/T"},
    { nameZh:"福建九牧集团", nameEn:"JOMOO Group", location:"福建泉州", year:1990, employees:15000, revenue:5000, certs:"ISO9001,ISO14001,CE", tags:"卫浴,马桶,花洒,五金龙头", destinations:"全球80+国家", rating:4.4, reviews:3200, verified:true, type:"brand", intro:"中国卫浴行业龙头品牌", capacity:"500万件/月", leadTime:"20-35天", payment:"T/T,L/C"},
    { nameZh:"深圳汉阳科技", nameEn:"Yarbo", location:"广东深圳", year:2017, employees:400, revenue:200, certs:"CE,FCC", tags:"庭院机器人,扫雪机,割草机器人", destinations:"北美,欧洲", rating:4.4, reviews:600, verified:true, type:"brand", intro:"庭院智能机器人出海品牌", capacity:"1万台/月", leadTime:"30-45天", payment:"T/T"},
    { nameZh:"广东林氏家居", nameEn:"LINSY", location:"广东佛山", year:2010, employees:5000, revenue:3000, certs:"ISO9001,ISO14001", tags:"家具,沙发,床垫,餐桌,全屋定制", destinations:"东南亚,北美", rating:4.3, reviews:12000, verified:true, type:"brand", intro:"中国家居电商头部品牌", capacity:"500万件/月", leadTime:"15-30天", payment:"TT"},
    { nameZh:"深圳和而泰智能", nameEn:"HITE Tech", location:"广东深圳", year:1999, employees:6000, revenue:2000, certs:"ISO9001,CE,UL", tags:"智能控制器,家电控制,物联网", destinations:"全球50+国家", rating:4.3, reviews:500, verified:true, type:"factory", intro:"全球智能控制器行业领军企业", capacity:"1000万件/月", leadTime:"25-40天", payment:"T/T,L/C"}
  ]

  const suppliers = await Promise.all(
    supplierData.map((s, i) => db.supplier.create({
      data: {
        id: i + 1,
        nameZh: s.nameZh,
        nameEn: s.nameEn,
        location: s.location,
        yearEstablished: s.year,
        employeeCount: s.employees,
        annualExportRevenue: s.revenue,
        certifications: JSON.stringify(s.certs?.split(',') || []),
        businessTags: JSON.stringify(s.tags?.split(',') || []),
        exportDestinations: JSON.stringify(s.destinations?.split(',') || []),
        rating: s.rating,
        reviewCount: s.reviews,
        isVerified: s.verified,
        type: s.type,
        companyIntro: s.intro,
        monthlyCapacity: s.capacity,
        deliveryLeadTime: s.leadTime,
        paymentTerms: s.payment,
      }
    }))
  )
  console.log(`  ✅ ${suppliers.length} suppliers`)

  // ─── Products ──────────────────────────────────────
  const imageMap = JSON.parse(
    require('fs').readFileSync(
      require('path').join(process.cwd(), 'lib/global-supply/product-images.json'), 'utf-8'
    )
  ).products || {}

  const productData = [
    { name:'便携榨汁机 USB-C充电', cat:2, supplier:29, desc:'USB-C充电便携、30秒鲜榨、304不锈钢刀片', priceMin:29, priceMax:59, moq:100, dropship:true, oem:true, rating:4.7, reviews:3200, region:'小家电' },
    { name:'空气炸锅专用纸垫', cat:7, supplier:2, desc:'防油纸垫，免洗，耐高温230°C，一次性免清洗', priceMin:8, priceMax:15, moq:500, dropship:true, rating:4.6, reviews:5800, region:'厨房配件' },
    { name:'高腰瑜伽裤运动紧身裤', cat:6, supplier:5, desc:'高弹力面料，吸湿排汗，高腰塑形', priceMin:68, priceMax:128, moq:200, dropship:true, oem:true, rating:4.5, reviews:4500, region:'运动服饰' },
    { name:'智能饮水提醒杯', cat:2, supplier:19, desc:'智能饮水提醒、温度显示、APP同步', priceMin:89, priceMax:159, moq:200, dropship:true, rating:4.6, reviews:2700, region:'智能硬件' },
    { name:'美白防晒霜SPF50+', cat:5, supplier:6, desc:'清爽不油腻、SPF50+ PA+++、淡斑美白', priceMin:39, priceMax:89, moq:300, dropship:true, rating:4.4, reviews:8900, region:'护肤品' },
    { name:'磁吸手机支架车载', cat:1, supplier:1, desc:'超强磁吸、360°旋转、车载/桌面通用', priceMin:15, priceMax:35, moq:200, dropship:true, rating:4.5, reviews:10500, region:'手机配件' },
    { name:'平价唇釉套装6色', cat:5, supplier:6, desc:'哑光丝绒、6色套装、持久显色', priceMin:29, priceMax:59, moq:200, dropship:true, rating:4.3, reviews:7600, region:'彩妆' },
    { name:'可降解竹纤维餐具套装', cat:3, supplier:2, desc:'环保可降解竹纤维、微波炉可用', priceMin:45, priceMax:89, moq:300, dropship:true, oem:true, rating:4.5, reviews:2200, region:'环保家居' },
    { name:'自行车手机导航支架', cat:1, supplier:16, desc:'防震设计、快拆安装、兼容5.5-7寸', priceMin:25, priceMax:55, moq:200, dropship:true, rating:4.4, reviews:1800, region:'运动配件' },
    { name:'磁吸充电宝10000mAh', cat:8, supplier:23, desc:'MagSafe磁吸无线充、10000mAh、PD20W快充', priceMin:89, priceMax:159, moq:200, dropship:true, oem:true, rating:4.7, reviews:8900, region:'电子数码' },
    { name:'萌宠自动喂食器', cat:9, supplier:19, desc:'智能定时、APP远程控制、高清摄像头', priceMin:129, priceMax:259, moq:100, dropship:true, rating:4.5, reviews:1800, region:'宠物智能' },
    { name:'硅胶折叠水壶便携', cat:2, supplier:13, desc:'食品级硅胶、折叠设计、全球电压适配', priceMin:79, priceMax:139, moq:200, dropship:true, oem:true, rating:4.4, reviews:3400, region:'小家电' },
    { name:'多功能料理锅', cat:7, supplier:4, desc:'煎烤涮焖炖一锅搞定、不粘涂层、1200W', priceMin:159, priceMax:299, moq:100, dropship:true, oem:true, rating:4.6, reviews:5600, region:'厨房电器' },
    { name:'真无线蓝牙耳机Pro', cat:8, supplier:23, desc:'主动降噪、30小时续航、HiFi音质', priceMin:89, priceMax:199, moq:200, dropship:true, rating:4.6, reviews:12000, region:'电子数码' },
    { name:'蒸汽拖把家用', cat:3, supplier:4, desc:'15秒快速出蒸汽、高温杀菌99.9%', priceMin:129, priceMax:229, moq:100, dropship:true, rating:4.4, reviews:2800, region:'家居清洁' },
    { name:'充电式LED化妆镜', cat:5, supplier:6, desc:'三色温调节、环形导光、USB充电', priceMin:59, priceMax:119, moq:200, dropship:true, oem:true, rating:4.5, reviews:4200, region:'美妆工具' },
    { name:'儿童智能电话手表', cat:8, supplier:1, desc:'4G视频通话、GPS定位、SOS求救', priceMin:129, priceMax:259, moq:100, dropship:true, rating:4.3, reviews:3800, region:'智能穿戴' },
    { name:'不锈钢保温饭盒', cat:3, supplier:20, desc:'316不锈钢、真空保温12小时、三层分格', priceMin:59, priceMax:129, moq:200, dropship:true, oem:true, rating:4.4, reviews:2100, region:'家居日用' },
    { name:'无线蓝牙音箱', cat:8, supplier:23, desc:'360°环绕声、IPX7防水、20小时续航', priceMin:69, priceMax:149, moq:200, dropship:true, rating:4.5, reviews:6700, region:'电子数码' },
    { name:'猫抓板猫窝一体', cat:9, supplier:2, desc:'环保瓦楞纸、抓板+窝一体设计', priceMin:39, priceMax:79, moq:300, dropship:true, rating:4.4, reviews:1500, region:'宠物用品' },
    { name:'瑜伽垫加厚防滑', cat:6, supplier:5, desc:'6mm加厚TPE环保、防滑纹理', priceMin:49, priceMax:99, moq:200, dropship:true, oem:true, rating:4.5, reviews:3600, region:'运动健身' },
    { name:'桌面收纳盒抽屉式', cat:3, supplier:11, desc:'多功能桌面收纳、抽屉式可叠加', priceMin:19, priceMax:49, moq:500, dropship:true, rating:4.3, reviews:4800, region:'家居收纳' },
    { name:'猫咪饮水机静音', cat:9, supplier:19, desc:'四层循环过滤活水、超静音水泵', priceMin:69, priceMax:129, moq:200, dropship:true, rating:4.5, reviews:2800, region:'宠物智能' },
    { name:'车载吸尘器无线', cat:1, supplier:1, desc:'8000Pa大吸力、Type-C快充、HEPA过滤', priceMin:89, priceMax:169, moq:200, dropship:true, oem:true, rating:4.4, reviews:1900, region:'车品' },
    { name:'随身WiFi6移动热点', cat:8, supplier:23, desc:'5G双模WiFi6、64设备连接、6000mAh', priceMin:129, priceMax:269, moq:100, dropship:true, rating:4.3, reviews:2200, region:'电子数码' },
    { name:'自动洗手机泡沫', cat:3, supplier:15, desc:'红外感应0.25秒出泡、USB充电、壁挂', priceMin:39, priceMax:69, moq:300, dropship:true, rating:4.4, reviews:5600, region:'家居清洁' },
    { name:'男士商务双肩包', cat:4, supplier:27, desc:'防泼水面料、多功能分区、USB充电口', priceMin:89, priceMax:199, moq:200, dropship:true, oem:true, rating:4.3, reviews:2800, region:'箱包' },
    { name:'迷你投影仪家用', cat:8, supplier:1, desc:'1080P自动对焦、安卓智能系统、内置音箱', priceMin:299, priceMax:599, moq:50, dropship:true, rating:4.4, reviews:1500, region:'电子数码' },
    { name:'儿童早教点读笔', cat:10, supplier:12, desc:'WIFI下载、AI语音互动、中英双语', priceMin:99, priceMax:199, moq:200, dropship:true, oem:true, rating:4.5, reviews:6800, region:'早教' },
    { name:'电动牙刷声波', cat:5, supplier:19, desc:'声波40000次/分钟、无线充电、5种模式', priceMin:49, priceMax:139, moq:200, dropship:true, rating:4.6, reviews:9200, region:'个护' },
    { name:'LED美甲灯干燥机', cat:5, supplier:6, desc:'168W大功率、智能感应、LCD显示屏', priceMin:39, priceMax:89, moq:200, dropship:true, oem:true, rating:4.4, reviews:4500, region:'美妆工具'},
    { name:'三合一无线充电底座', cat:8, supplier:23, desc:'iPhone+AirPods+Watch三合一快充', priceMin:129, priceMax:219, moq:200, dropship:true, rating:4.6, reviews:7800, region:'电子配件' },
    { name:'智能体脂秤蓝牙', cat:8, supplier:13, desc:'BIA技术、15项数据、APP同步', priceMin:29, priceMax:79, moq:300, dropship:true, rating:4.4, reviews:4500, region:'智能健康' },
    { name:'便携果汁杯榨汁机', cat:2, supplier:19, desc:'USB-C充电、40秒鲜榨、一键清洗', priceMin:49, priceMax:99, moq:200, dropship:true, oem:true, rating:4.5, reviews:5600, region:'小家电' },
    { name:'防水运动腰包', cat:6, supplier:27, desc:'高弹力透气、防水拉链、大屏可放', priceMin:19, priceMax:39, moq:500, dropship:true, rating:4.3, reviews:3200, region:'运动配件' },
    { name:'多功能早餐机', cat:7, supplier:13, desc:'烤面包+煎蛋+煮咖啡三合一', priceMin:129, priceMax:229, moq:100, dropship:true, oem:true, rating:4.5, reviews:2400, region:'厨房电器' },
    { name:'大容量保温壶2L', cat:3, supplier:20, desc:'316不锈钢、保温24小时、按压出水', priceMin:59, priceMax:109, moq:200, dropship:true, rating:4.4, reviews:1800, region:'家居日用' },
    { name:'儿童编程教育机器人', cat:10, supplier:12, desc:'图形化编程入门、AI语音交互、STEAM', priceMin:199, priceMax:399, moq:100, dropship:true, oem:true, rating:4.5, reviews:1200, region:'教育玩具' },
    { name:'感应垃圾桶智能', cat:3, supplier:15, desc:'红外感应开盖、智能打包、自动换袋', priceMin:79, priceMax:169, moq:100, dropship:true, rating:4.4, reviews:3800, region:'智能家居' },
    { name:'USB-C多功能扩展坞', cat:8, supplier:1, desc:'HDMI+USB3.0+PD100W+SD/TF卡槽', priceMin:59, priceMax:129, moq:200, dropship:true, rating:4.6, reviews:5600, region:'数码配件' },
    { name:'健身阻力带套装', cat:6, supplier:5, desc:'天然乳胶、5条阻力、防滑设计', priceMin:19, priceMax:49, moq:500, dropship:true, rating:4.3, reviews:2900, region:'运动健身' },
    { name:'藤编猫窝夏凉', cat:9, supplier:2, desc:'天然藤编、透气凉爽、可拆洗', priceMin:39, priceMax:79, moq:200, dropship:true, oem:true, rating:4.3, reviews:800, region:'宠物用品' },
    { name:'迷你筋膜枪', cat:6, supplier:19, desc:'6档力度、超静音、4个按摩头', priceMin:69, priceMax:139, moq:200, dropship:true, rating:4.5, reviews:6200, region:'运动康复' },
    { name:'自动出米桶米箱', cat:3, supplier:11, desc:'按压定量出米、透明视窗、密封防潮', priceMin:29, priceMax:69, moq:300, dropship:true, rating:4.3, reviews:3600, region:'厨房收纳' },
    { name:'宠物除毛器便携', cat:9, supplier:1, desc:'可充电无线除毛、不锈钢刀头', priceMin:25, priceMax:55, moq:300, dropship:true, oem:true, rating:4.2, reviews:1200, region:'宠物用品' },
    { name:'太阳能充电板18W', cat:8, supplier:16, desc:'单晶硅18W输出、双USB口、防水', priceMin:89, priceMax:199, moq:100, dropship:true, rating:4.4, reviews:1500, region:'户外电源' },
    { name:'保温杯500ml轻量', cat:3, supplier:20, desc:'316不锈钢、真空超轻、12小时保温', priceMin:29, priceMax:79, moq:500, dropship:true, rating:4.5, reviews:7800, region:'杯壶' },
    { name:'电动拖把无线手持', cat:3, supplier:4, desc:'无线电动拖地、2500mAh、自动喷水', priceMin:149, priceMax:259, moq:100, dropship:true, oem:true, rating:4.3, reviews:2100, region:'家居清洁' },
    { name:'创意纸巾盒自动', cat:3, supplier:11, desc:'红外感应自动出纸、静音电机', priceMin:29, priceMax:59, moq:300, dropship:true, rating:4.2, reviews:2800, region:'家居创意' },
    { name:'极简风手机壳防摔', cat:1, supplier:1, desc:'军工防摔、气囊缓冲、液态硅胶', priceMin:9.9, priceMax:39, moq:500, dropship:true, oem:true, rating:4.4, reviews:15000, region:'手机配件' },
    { name:'智能手表表带替换', cat:1, supplier:16, desc:'真皮/硅胶/不锈钢三材质可选', priceMin:19, priceMax:89, moq:200, dropship:true, rating:4.3, reviews:4800, region:'穿戴配件' },
    { name:'防蓝光眼镜老花', cat:5, supplier:21, desc:'TR90超轻镜架、防蓝光防紫外线', priceMin:19, priceMax:69, moq:300, dropship:true, oem:true, rating:4.2, reviews:3200, region:'护眼' },
    { name:'日式餐具套装8件', cat:7, supplier:2, desc:'釉下彩工艺、微波炉洗碗机可用', priceMin:39, priceMax:89, moq:200, dropship:true, rating:4.4, reviews:2800, region:'餐具' },
    { name:'便携式手持挂烫机', cat:3, supplier:19, desc:'1000W快速预热20秒、干湿两用', priceMin:39, priceMax:89, moq:200, dropship:true, oem:true, rating:4.4, reviews:4200, region:'小家电' },
    { name:'Type-C快充数据线', cat:1, supplier:16, desc:'100W PD快充、编织尼龙、锌合金', priceMin:9.9, priceMax:29, moq:1000, dropship:true, rating:4.6, reviews:28000, region:'数码配件' },
    { name:'儿童磁力积木100片', cat:10, supplier:12, desc:'强磁积木、STEM教育、100片装', priceMin:29, priceMax:79, moq:200, dropship:true, oem:true, rating:4.5, reviews:6200, region:'玩具' },
    { name:'多肉植物盆栽套装', cat:3, supplier:2, desc:'8颗多肉、陶瓷盆+营养土、懒人种植', priceMin:39, priceMax:79, moq:200, dropship:true, rating:4.3, reviews:3500, region:'家居绿植' },
    { name:'便携蓝牙键盘折叠', cat:8, supplier:1, desc:'折叠设计、蓝牙5.1、续航90天', priceMin:59, priceMax:129, moq:200, dropship:true, oem:true, rating:4.4, reviews:2800, region:'数码配件' },
    { name:'鸡翅木菜板家用', cat:7, supplier:11, desc:'整木无拼接、防霉抗菌、加厚2.5cm', priceMin:49, priceMax:129, moq:200, dropship:true, rating:4.5, reviews:3800, region:'厨房用具' },
    { name:'宠物益生菌调理', cat:9, supplier:21, desc:'5种活性益生菌、改善软便口臭', priceMin:19, priceMax:49, moq:300, dropship:true, oem:true, rating:4.3, reviews:2200, region:'宠物健康' },
    { name:'运动蓝牙耳机挂脖', cat:8, supplier:16, desc:'磁吸挂脖、15小时续航、IPX5', priceMin:39, priceMax:89, moq:200, dropship:true, rating:4.4, reviews:4500, region:'运动耳机' },
    { name:'自动伞反向折叠', cat:3, supplier:11, desc:'C形反向折叠不湿身、UPF50+防晒', priceMin:29, priceMax:59, moq:300, dropship:true, oem:true, rating:4.3, reviews:5600, region:'雨具' },
    { name:'儿童水彩笔24色', cat:10, supplier:18, desc:'可水洗、24色鲜艳、三角笔杆', priceMin:9.9, priceMax:29, moq:500, dropship:true, rating:4.4, reviews:8900, region:'文具' },
    { name:'测温枪红外额温', cat:8, supplier:26, desc:'非接触红外测温、0.5秒快速', priceMin:19, priceMax:59, moq:300, dropship:true, oem:true, rating:4.3, reviews:2200, region:'医疗健康' },
    { name:'LED护眼台灯充电', cat:3, supplier:1, desc:'三档色温调光、无蓝光危害、3000mAh', priceMin:39, priceMax:89, moq:200, dropship:true, rating:4.5, reviews:6800, region:'照明' },
    { name:'蛋白粉摇摇杯运动', cat:6, supplier:5, desc:'500ml大容量、304不锈钢搅拌球', priceMin:15, priceMax:35, moq:500, dropship:true, rating:4.3, reviews:4200, region:'运动配件' },
    { name:'不锈钢吸管套装', cat:3, supplier:20, desc:'304不锈钢6根+清洁刷2根', priceMin:9.9, priceMax:25, moq:500, dropship:true, oem:true, rating:4.2, reviews:3400, region:'环保' },
    { name:'大白鹅抱枕公仔', cat:10, supplier:12, desc:'超柔短毛绒、可拆洗外套', priceMin:19, priceMax:49, moq:300, dropship:true, rating:4.4, reviews:15000, region:'玩具' },
    { name:'迷你加湿器USB', cat:3, supplier:1, desc:'超音波雾化、300ml、静音、LED灯', priceMin:9.9, priceMax:29, moq:500, dropship:true, oem:true, rating:4.3, reviews:7800, region:'小家电' },
    { name:'袜子收纳盒抽屉', cat:3, supplier:11, desc:'PP透明抽屉、可叠放组合、24格', priceMin:15, priceMax:39, moq:500, dropship:true, rating:4.2, reviews:3200, region:'收纳' },
    { name:'儿童滑板车折叠', cat:10, supplier:12, desc:'三轮防侧翻、重力转向、可折叠', priceMin:49, priceMax:129, moq:200, dropship:true, oem:true, rating:4.4, reviews:3800, region:'户外玩具' },
    { name:'USB风扇迷你便携', cat:3, supplier:1, desc:'4000mAh、三档风力、可手持/桌面', priceMin:15, priceMax:35, moq:500, dropship:true, rating:4.3, reviews:12000, region:'小家电' },
    { name:'宠物牵引绳防爆冲', cat:9, supplier:2, desc:'加厚尼龙、防滑手柄、反光安全', priceMin:9.9, priceMax:29, moq:500, dropship:true, oem:true, rating:4.3, reviews:2800, region:'宠物用品' },
    { name:'充电宝自带线20000mAh', cat:1, supplier:16, desc:'20000mAh自带双线、22.5W快充', priceMin:59, priceMax:129, moq:200, dropship:true, rating:4.5, reviews:9200, region:'数码配件' },
    { name:'创意冰箱贴磁性', cat:3, supplier:11, desc:'磁吸免打孔、收纳保鲜膜/调料', priceMin:9.9, priceMax:29, moq:500, dropship:true, rating:4.2, reviews:4500, region:'厨房收纳' },
    { name:'DIY数字油画套装', cat:10, supplier:12, desc:'40x50cm画布、24色环保丙烯颜料', priceMin:15, priceMax:39, moq:300, dropship:true, oem:true, rating:4.3, reviews:5600, region:'DIY' },
    { name:'手机直播支架补光', cat:1, supplier:1, desc:'2.1m加高、环形补光灯三色温', priceMin:29, priceMax:79, moq:200, dropship:true, rating:4.4, reviews:6800, region:'直播配件' },
    { name:'宿舍小功率电煮锅', cat:2, supplier:19, desc:'500W小功率、不粘内胆、1.2L', priceMin:29, priceMax:59, moq:300, dropship:true, oem:true, rating:4.4, reviews:8500, region:'小家电' },
    { name:'磁力片儿童STEAM', cat:10, supplier:12, desc:'60片磁力构建片、STEM教育', priceMin:29, priceMax:69, moq:200, dropship:true, rating:4.5, reviews:4200, region:'益智玩具' },
    { name:'无线蓝牙耳机盒', cat:1, supplier:23, desc:'兼容AirPods Pro/3代、硅胶保护', priceMin:9.9, priceMax:29, moq:500, dropship:true, oem:true, rating:4.3, reviews:6800, region:'耳机配件' },
    { name:"AI智能翻译耳机", cat:8, supplier:31, desc:"双向实时翻译、AI降噪、40种语言、蓝牙5.3", priceMin:199, priceMax:399, moq:100, dropship:true, oem:true, rating:4.5, reviews:3200, region:"AI智能硬件" },
    { name:"骨传导运动耳机", cat:8, supplier:31, desc:"开放式听音、IP67防水防汗、8小时续航、钛合金骨架", priceMin:299, priceMax:599, moq:100, dropship:true, rating:4.6, reviews:5800, region:"运动音频" },
    { name:"扫拖一体机器人", cat:2, supplier:34, desc:"自清洁拖布、自动集尘、激光导航、5000Pa吸力", priceMin:1299, priceMax:2499, moq:50, dropship:true, rating:4.6, reviews:4200, region:"智能家居" },
    { name:"全景运动相机X4", cat:8, supplier:37, desc:"8K全景拍摄、FlowState防抖、防水10米", priceMin:1999, priceMax:2999, moq:50, dropship:true, oem:true, rating:4.7, reviews:6500, region:"运动相机" },
    { name:"智能门铃可视猫眼", cat:8, supplier:36, desc:"2K超清、红外夜视、AI人形检测、远程通话", priceMin:129, priceMax:299, moq:100, dropship:true, rating:4.4, reviews:3800, region:"智能安防" },
    { name:"运动鞋网面透气", cat:4, supplier:33, desc:"记忆鞋垫、EVA中底缓震、透气飞织面料", priceMin:89, priceMax:199, moq:200, dropship:true, rating:4.4, reviews:8900, region:"运动鞋" },
    { name:"健步鞋轻量软底", cat:4, supplier:33, desc:"一脚蹬设计、3E加宽鞋楦、耐磨橡胶外底", priceMin:129, priceMax:249, moq:200, dropship:true, oem:true, rating:4.5, reviews:6500, region:"休闲鞋" },
    { name:"便携式储能电源500W", cat:8, supplier:44, desc:"500W纯正弦波、518Wh容量、支持太阳能充电", priceMin:999, priceMax:1799, moq:50, dropship:true, rating:4.5, reviews:2800, region:"户外电源" },
    { name:"磁吸无线充电宝10000mAh", cat:1, supplier:44, desc:"磁吸无线充、10000mAh、PD20W快充、LED数显", priceMin:69, priceMax:149, moq:200, dropship:true, oem:true, rating:4.5, reviews:12000, region:"充电配件" },
    { name:"户外防水蓝牙音箱", cat:8, supplier:46, desc:"IPX7级防水、40W大功率、20小时续航、TWS串联", priceMin:149, priceMax:299, moq:100, dropship:true, rating:4.5, reviews:5600, region:"户外音频" },
    { name:"智能马桶一体式", cat:3, supplier:48, desc:"即热式冲洗、座圈加热、暖风烘干、智能遥控", priceMin:1299, priceMax:2999, moq:50, dropship:true, oem:true, rating:4.4, reviews:3200, region:"卫浴" },
    { name:"恒温花洒套装", cat:3, supplier:48, desc:"精铜主体、恒温阀芯、增压喷枪、出水切换", priceMin:299, priceMax:599, moq:100, dropship:true, rating:4.4, reviews:4500, region:"卫浴" },
    { name:"布艺沙发三人位", cat:3, supplier:50, desc:"科技布面料、高弹海绵填充、可拆洗、七色可选", priceMin:1299, priceMax:2499, moq:50, dropship:true, oem:true, rating:4.3, reviews:6800, region:"家具" },
    { name:"乳胶床垫可折叠", cat:3, supplier:50, desc:"天然乳胶、90%天然含量、抑菌防螨、三折便携", priceMin:499, priceMax:1299, moq:50, dropship:true, rating:4.4, reviews:9200, region:"家居床品" },
    { name:"实木餐桌一桌四椅", cat:3, supplier:50, desc:"北美白橡木、环保清漆、大板直拼、圆角设计", priceMin:1499, priceMax:3299, moq:20, dropship:true, oem:true, rating:4.4, reviews:3600, region:"家具" },
    { name:"电子钢琴88键重锤", cat:10, supplier:39, desc:"88键逐级配重重锤、蓝牙MIDI、双人演奏模式", priceMin:899, priceMax:1999, moq:50, dropship:true, rating:4.5, reviews:2800, region:"乐器" },
    { name:"尤克里里23寸", cat:10, supplier:39, desc:"桃花心木单板、碳素琴弦、原装琴包全配件", priceMin:99, priceMax:229, moq:200, dropship:true, oem:true, rating:4.4, reviews:5600, region:"乐器" },
    { name:"无线领夹麦克风", cat:8, supplier:1, desc:"一拖二无线、续航20小时、AI降噪、即插即用", priceMin:89, priceMax:199, moq:200, dropship:true, rating:4.5, reviews:7800, region:"音频设备" },
    { name:"直播补光灯环形灯", cat:1, supplier:1, desc:"三色温可调、60颗LED灯珠、支架一体、遥控控制", priceMin:39, priceMax:99, moq:300, dropship:true, rating:4.3, reviews:8900, region:"直播设备" },
    { name:"桌面电竞音箱RGB", cat:8, supplier:46, desc:"蓝牙5.3、RGB氛围灯、2.0声道、USB供电", priceMin:59, priceMax:139, moq:200, dropship:true, oem:true, rating:4.4, reviews:3800, region:"电竞设备" },
    { name:"Type-C八合一拓展坞", cat:8, supplier:30, desc:"HDMI4K+USB3.0*3+PD100W+TF/SD+网口", priceMin:59, priceMax:149, moq:200, dropship:true, rating:4.5, reviews:6200, region:"数码配件" },
    { name:"笔记本立式支架铝合金", cat:1, supplier:30, desc:"铝合金材质、散热设计、多高度可调、兼容12-17寸", priceMin:29, priceMax:79, moq:300, dropship:true, oem:true, rating:4.3, reviews:4500, region:"数码配件" },
    { name:"儿童编程机器人教育", cat:10, supplier:38, desc:"AI图形化编程、STEAM教育、语音交互、APP控制", priceMin:199, priceMax:399, moq:100, dropship:true, rating:4.5, reviews:1800, region:"教育玩具" },
    { name:"电动滑板车可折叠", cat:6, supplier:12, desc:"350W电机、25km/h、30km续航、LED仪表盘", priceMin:899, priceMax:1799, moq:50, dropship:true, oem:true, rating:4.3, reviews:3200, region:"出行工具" },
    { name:"筋膜枪肌肉放松", cat:6, supplier:19, desc:"6档力度调节、超静音无刷电机、4个按摩头", priceMin:59, priceMax:129, moq:200, dropship:true, rating:4.5, reviews:8900, region:"运动健身" },
    { name:"瑜伽弹力带阻力带套装", cat:6, supplier:5, desc:"乳胶材质、5条不同阻力、防滑纹路、配收纳袋", priceMin:19, priceMax:49, moq:500, dropship:true, oem:true, rating:4.3, reviews:5600, region:"运动健身" },
    { name:"跑步机折叠家用", cat:6, supplier:5, desc:"1.5HP静音电机、15km/h速度、折叠收纳", priceMin:1299, priceMax:2599, moq:50, dropship:true, rating:4.4, reviews:2800, region:"运动健身" },
    { name:"智能手环健康监测", cat:8, supplier:44, desc:"心率血氧监测、睡眠分析、IP68防水、14天续航", priceMin:39, priceMax:99, moq:300, dropship:true, oem:true, rating:4.4, reviews:15000, region:"智能穿戴" },
    { name:"智能手表AMOLED屏", cat:8, supplier:44, desc:"1.43寸AMOLED、GPS运动记录、蓝牙通话", priceMin:129, priceMax:299, moq:100, dropship:true, rating:4.5, reviews:8900, region:"智能穿戴" },
    { name:"电动车头盔3C认证", cat:3, supplier:2, desc:"3C安全认证、ABS外壳、高密度EPS内衬", priceMin:39, priceMax:99, moq:200, dropship:true, oem:true, rating:4.3, reviews:12000, region:"出行安全" },
    { name:"行李收纳套装6件", cat:3, supplier:11, desc:"防水尼龙面料、6件套不同尺寸、可视网格", priceMin:29, priceMax:69, moq:300, dropship:true, rating:4.2, reviews:4500, region:"旅行收纳" },
    { name:"儿童智能水杯温度显示", cat:2, supplier:19, desc:"LED温度显示、316不锈钢、500ml、弹盖式", priceMin:29, priceMax:69, moq:300, dropship:true, oem:true, rating:4.3, reviews:3800, region:"儿童用品" },
    { name:"智能醒酒器红酒", cat:7, supplier:13, desc:"快速醒酒15分钟、304不锈钢、LED温度指示", priceMin:49, priceMax:129, moq:200, dropship:true, rating:4.2, reviews:1500, region:"厨房用具" },
    { name:"户外折叠桌便携", cat:6, supplier:2, desc:"铝合金桌面、折叠收纳至手提箱、承重50kg", priceMin:99, priceMax:199, moq:100, dropship:true, oem:true, rating:4.4, reviews:2800, region:"户外露营" },
    { name:"户外折叠椅月亮椅", cat:6, supplier:2, desc:"加厚钢管支架、600D牛津布、承重120kg", priceMin:39, priceMax:89, moq:200, dropship:true, rating:4.4, reviews:5600, region:"户外露营" },
    { name:"冰丝凉席三件套", cat:3, supplier:50, desc:"冰丝面料、可机洗、抗菌防螨、1.8m床适用", priceMin:49, priceMax:129, moq:200, dropship:true, oem:true, rating:4.3, reviews:6800, region:"夏季床品" },
    { name:"蒸汽眼罩热敷可充电", cat:5, supplier:6, desc:"40度恒温热敷、定时功能、亲肤面料、USB充电", priceMin:29, priceMax:69, moq:300, dropship:true, rating:4.4, reviews:12000, region:"个护" },
    { name:"颈椎按摩仪脉冲", cat:5, supplier:6, desc:"TENS+EMS双脉冲、恒温热敷、16档力度", priceMin:39, priceMax:99, moq:200, dropship:true, oem:true, rating:4.4, reviews:18000, region:"健康" },
    { name:"美容仪射频紧致", cat:5, supplier:6, desc:"RF多极射频、LED红光嫩肤、振动导入", priceMin:199, priceMax:499, moq:100, dropship:true, rating:4.4, reviews:6800, region:"个护美容" },
    { name:"脱毛仪IPL冰点", cat:5, supplier:6, desc:"IPL强脉冲光、冰点无痛、30万次闪光", priceMin:129, priceMax:299, moq:100, dropship:true, oem:true, rating:4.3, reviews:4200, region:"个护美容" },
    { name:"高速吹风机负离子", cat:5, supplier:19, desc:"11万转无刷马达、负离子护发、智能温控", priceMin:49, priceMax:129, moq:200, dropship:true, rating:4.5, reviews:22000, region:"个护" },
    { name:"卷发棒自动旋转", cat:5, supplier:19, desc:"陶瓷涂层、自动旋转卷发、5档温度、防烫", priceMin:29, priceMax:79, moq:200, dropship:true, oem:true, rating:4.3, reviews:8900, region:"个护美发" },
    { name:"电动牙刷声波充电", cat:5, supplier:19, desc:"声波40000次/分、无线快充、5种洁齿模式", priceMin:39, priceMax:99, moq:200, dropship:true, rating:4.5, reviews:15000, region:"个护口腔" },
    { name:"冲牙器便携式", cat:5, supplier:19, desc:"脉冲水流1400次/分、三档水压、IPX7防水", priceMin:29, priceMax:69, moq:300, dropship:true, oem:true, rating:4.4, reviews:8900, region:"个护口腔" },
    { name:"太阳能充电板100W", cat:8, supplier:44, desc:"单晶硅100W、ETFE层压、便携折叠、USB+DC输出", priceMin:499, priceMax:899, moq:50, dropship:true, rating:4.5, reviews:1800, region:"户外电源" },
    { name:"行车记录仪4K超清", cat:8, supplier:36, desc:"4K超清夜视、前后双录、语音控制、停车监控", priceMin:99, priceMax:229, moq:100, dropship:true, oem:true, rating:4.4, reviews:7800, region:"车载电子" },
    { name:"车载手机支架磁吸", cat:1, supplier:30, desc:"超强磁吸、单手取放、360度旋转、防滑硅胶垫", priceMin:15, priceMax:39, moq:500, dropship:true, rating:4.4, reviews:18000, region:"车载配件" },
    { name:"车载净化器负离子", cat:8, supplier:30, desc:"负离子净化、三档风力、太阳能充电、活性炭过滤", priceMin:29, priceMax:69, moq:300, dropship:true, oem:true, rating:4.2, reviews:3200, region:"车载净化" },
    { name:"宠物双碗慢食盆", cat:9, supplier:2, desc:"304不锈钢盆、慢食凸纹、防滑底座、双碗设计", priceMin:19, priceMax:45, moq:300, dropship:true, rating:4.3, reviews:4500, region:"宠物用品" },
    { name:"狗厕所训练托盘", cat:9, supplier:2, desc:"加厚PP材质、防漏边缘、网格+尿垫双模式", priceMin:19, priceMax:49, moq:300, dropship:true, oem:true, rating:4.2, reviews:3200, region:"宠物训练" },
    { name:"猫爬架多层大型", cat:9, supplier:2, desc:"剑麻柱耐磨、跳板加厚、吊床+猫窝+麻绳柱一体", priceMin:129, priceMax:329, moq:50, dropship:true, rating:4.4, reviews:5600, region:"宠物家具" },
    { name:"宠物推车外出便携", cat:9, supplier:2, desc:"铝合金车架、可坐可躺、减震轮、一键折叠", priceMin:199, priceMax:399, moq:50, dropship:true, oem:true, rating:4.3, reviews:1500, region:"宠物出行" },
    { name:"智能猫砂盆自动清洁", cat:9, supplier:34, desc:"自动铲屎、APP远程控制、异味过滤、安全感应", priceMin:699, priceMax:1499, moq:50, dropship:true, rating:4.4, reviews:2800, region:"宠物智能" },
    { name:"儿童餐椅多功能可折叠", cat:3, supplier:50, desc:"PP环保材质、可折叠收纳、可拆洗坐垫、三点安全带", priceMin:89, priceMax:199, moq:100, dropship:true, oem:true, rating:4.4, reviews:4500, region:"母婴" },
    { name:"婴儿背带腰凳", cat:4, supplier:27, desc:"加宽腰带、透气网眼、四季通用、前背后背两用", priceMin:49, priceMax:129, moq:200, dropship:true, rating:4.4, reviews:6800, region:"母婴" },
    { name:"儿童学习桌椅套装", cat:3, supplier:50, desc:"可升降桌面0-60度倾斜、收纳书架、护眼阅读灯", priceMin:399, priceMax:999, moq:50, dropship:true, oem:true, rating:4.5, reviews:3800, region:"学习用品" },
    { name:"儿童平衡车无脚踏", cat:10, supplier:12, desc:"镁合金一体车身、充气轮胎、座椅调节、轻量3.5kg", priceMin:89, priceMax:199, moq:100, dropship:true, rating:4.5, reviews:5600, region:"儿童户外" },
    { name:"无人机4K航拍入门", cat:8, supplier:37, desc:"4K高清航拍、光流定位、抗风5级、一键起飞", priceMin:199, priceMax:499, moq:100, dropship:true, oem:true, rating:4.3, reviews:3200, region:"无人机" },
    { name:"VR眼镜一体机", cat:8, supplier:1, desc:"4K分辨率、6DoF定位、120Hz刷新率、独立运行", priceMin:199, priceMax:399, moq:100, dropship:true, rating:4.4, reviews:2800, region:"VR设备" },
    { name:"蓝牙防丢器追踪器", cat:8, supplier:30, desc:"蓝牙5.4定位、APP查找、80dB响铃、一年续航", priceMin:9.9, priceMax:29, moq:500, dropship:true, oem:true, rating:4.2, reviews:15000, region:"智能配件" },
    { name:"智能插座WIFI版", cat:8, supplier:30, desc:"WiFi远程控制、电量统计、定时开关、语音控制", priceMin:15, priceMax:35, moq:500, dropship:true, rating:4.3, reviews:12000, region:"智能家居" },
    { name:"智能灯泡RGB彩光", cat:8, supplier:30, desc:"1600万色、WiFi+蓝牙双模、语音控制、定时开关", priceMin:9.9, priceMax:29, moq:500, dropship:true, oem:true, rating:4.2, reviews:8900, region:"智能家居" },
    { name:"人体感应夜灯LED", cat:3, supplier:1, desc:"人体红外感应、光控自动亮灭、磁吸安装、USB充电", priceMin:9.9, priceMax:29, moq:500, dropship:true, rating:4.3, reviews:18000, region:"智能照明" },
    { name:"无线门铃免电池", cat:3, supplier:1, desc:"自发电技术免电池、防水室外机、36首铃声", priceMin:19, priceMax:49, moq:300, dropship:true, oem:true, rating:4.2, reviews:5600, region:"智能安防" },
    { name:"摄像头AI智能追踪", cat:8, supplier:36, desc:"360度全景巡航、AI人形追踪、双向对讲、云储存", priceMin:59, priceMax:149, moq:200, dropship:true, rating:4.3, reviews:6800, region:"智能安防" },
    { name:"充电式电蚊拍灭蚊灯", cat:3, supplier:19, desc:"双网灭蚊、LED诱蚊紫光、Type-C充电、可壁挂", priceMin:15, priceMax:35, moq:500, dropship:true, oem:true, rating:4.2, reviews:22000, region:"家居用品" },
    { name:"超声波清洗机珠宝", cat:3, supplier:19, desc:"60W大功率、45000Hz超声波、不锈钢内胆定时", priceMin:29, priceMax:69, moq:300, dropship:true, rating:4.3, reviews:3800, region:"个护清洁" },
    { name:"真空封口机家用", cat:7, supplier:19, desc:"干湿两用、双封口设计、一键真空、附带5卷封口袋", priceMin:29, priceMax:69, moq:200, dropship:true, oem:true, rating:4.3, reviews:4200, region:"厨房用具" },
    { name:"智能电子秤厨房", cat:7, supplier:13, desc:"高精度传感器、0.1g精度、去皮归零、USB充电", priceMin:9.9, priceMax:29, moq:500, dropship:true, rating:4.3, reviews:12000, region:"厨房用品" },
    { name:"不锈钢保温便当盒", cat:7, supplier:20, desc:"316不锈钢内胆、真空保温6小时、分隔层不串味", priceMin:39, priceMax:89, moq:200, dropship:true, oem:true, rating:4.4, reviews:5600, region:"便当用品" },
    { name:"咖啡手冲壶套装", cat:7, supplier:4, desc:"304不锈钢壶+滤杯+分享壶+滤纸50张、带温度计", priceMin:59, priceMax:129, moq:200, dropship:true, rating:4.4, reviews:3200, region:"咖啡用具" },
    { name:"双层玻璃杯泡茶杯", cat:3, supplier:20, desc:"高硼硅玻璃、双层隔热、304不锈钢茶漏、350ml", priceMin:15, priceMax:35, moq:500, dropship:true, oem:true, rating:4.2, reviews:8900, region:"杯壶" },
    { name:"Tritan运动水杯大容量", cat:3, supplier:20, desc:"Eastman Tritan材质、BPA-free、1L大容量、弹盖吸管", priceMin:19, priceMax:49, moq:500, dropship:true, rating:4.3, reviews:12000, region:"运动水杯" },
    { name:"露营帐篷3人自动速开", cat:6, supplier:2, desc:"弹压速开3秒搭建、野营防雨防晒、透气双门设计", priceMin:129, priceMax:329, moq:50, dropship:true, oem:true, rating:4.4, reviews:4500, region:"户外露营" },
    { name:"户外充气床垫", cat:6, supplier:2, desc:"植绒面料、内置气泵一键充放、承重200kg", priceMin:69, priceMax:169, moq:50, dropship:true, rating:4.3, reviews:3200, region:"户外露营" },
    { name:"头灯LED充电式", cat:6, supplier:2, desc:"LED灯芯、5档亮度调节、Type-C充电、90度调节", priceMin:9.9, priceMax:29, moq:500, dropship:true, oem:true, rating:4.2, reviews:7800, region:"户外照明" },
    { name:"充电式打火机等离子", cat:3, supplier:1, desc:"双电弧点火、Type-C充电、防风防爆、侧边LED照明", priceMin:9.9, priceMax:25, moq:500, dropship:true, rating:4.1, reviews:5600, region:"户外用品" },
    { name:"太阳能户外灯花园", cat:3, supplier:1, desc:"超亮LED、太阳能充电8小时续航12小时、防水IP65", priceMin:15, priceMax:39, moq:300, dropship:true, oem:true, rating:4.3, reviews:8900, region:"户外照明" },
    { name:"男士电动剃须刀", cat:5, supplier:19, desc:"旋转式三刀头、干湿双剃、IPX7防水、Type-C快充", priceMin:29, priceMax:79, moq:200, dropship:true, rating:4.4, reviews:25000, region:"男士个护" },
    { name:"男士洁面仪硅胶", cat:5, supplier:19, desc:"医用硅胶刷头、声波脉动清洁、充电式防水", priceMin:15, priceMax:39, moq:500, dropship:true, oem:true, rating:4.2, reviews:5600, region:"男士个护" },
    { name:"化妆刷套装12支", cat:5, supplier:6, desc:"纤维刷毛、铝合金刷杆、渐变配色、送收纳包", priceMin:9.9, priceMax:29, moq:500, dropship:true, rating:4.3, reviews:15000, region:"美妆工具" },
    { name:"眼影盘大地色", cat:5, supplier:6, desc:"12色大地色系、哑光+珠光组合、飞粉少、显色高", priceMin:9.9, priceMax:29, moq:500, dropship:true, oem:true, rating:4.3, reviews:28000, region:"彩妆" },
    { name:"口红套装哑光6支", cat:5, supplier:6, desc:"丝绒哑光质地、显白不拔干、6色热门色号套装", priceMin:19, priceMax:49, moq:300, dropship:true, rating:4.4, reviews:18000, region:"彩妆" },
    { name:"定妆散粉控油", cat:5, supplier:6, desc:"微米级粉质、控油持久、透明无色、适合全肤色", priceMin:9.9, priceMax:29, moq:500, dropship:true, oem:true, rating:4.3, reviews:22000, region:"彩妆" },
    { name:"睫毛增长液滋养", cat:5, supplier:6, desc:"植物精华配方、温和不刺激、早晚使用、15ml", priceMin:19, priceMax:49, moq:300, dropship:true, rating:4.2, reviews:15000, region:"美妆护理" },
    { name:"洗面奶氨基酸温和", cat:5, supplier:6, desc:"氨基酸表活、温和不紧绷、弱酸性、适合敏感肌", priceMin:9.9, priceMax:29, moq:500, dropship:true, oem:true, rating:4.4, reviews:32000, region:"护肤品" },
    { name:"面霜玻尿酸保湿", cat:5, supplier:6, desc:"玻尿酸三重分子、锁水保湿48小时、清爽不油腻", priceMin:19, priceMax:49, moq:300, dropship:true, rating:4.4, reviews:18000, region:"护肤品" },
    { name:"防晒霜SPF50+清爽", cat:5, supplier:6, desc:"SPF50+ PA+++、清爽不闷痘、物理+化学双重防晒", priceMin:15, priceMax:39, moq:300, dropship:true, oem:true, rating:4.4, reviews:25000, region:"防晒" },
    { name:"补水面膜玻尿酸28片", cat:5, supplier:6, desc:"28片大包装、三重玻尿酸精华、天丝膜布服帖", priceMin:19, priceMax:59, moq:200, dropship:true, rating:4.5, reviews:35000, region:"面膜" },
    { name:"黄金射频美容仪", cat:5, supplier:6, desc:"1MHz射频+LED红光+EMS微电流、3种模式", priceMin:299, priceMax:699, moq:50, dropship:true, oem:true, rating:4.4, reviews:3200, region:"美容仪器" },
    { name:"黑头铲子去黑头仪", cat:5, supplier:6, desc:"超声波振动铲除黑头、三档调节、IPX7防水、USB充电", priceMin:19, priceMax:49, moq:300, dropship:true, rating:4.2, reviews:8900, region:"个护清洁" },
    { name:"迷你投影仪1080P", cat:8, supplier:1, desc:"1080P分辨率、自动对焦、安卓系统、内置5W音箱", priceMin:199, priceMax:499, moq:100, dropship:true, oem:true, rating:4.3, reviews:5600, region:"家庭娱乐" },
    { name:"投影仪幕布便携", cat:8, supplier:1, desc:"100寸16:9、高增益面料、三角支架、收纳便携包", priceMin:29, priceMax:79, moq:200, dropship:true, rating:4.2, reviews:3800, region:"配件" },
    { name:"蓝牙遥控自拍杆", cat:1, supplier:1, desc:"伸缩1.6m、三脚架一体、蓝牙遥控、手机夹通用", priceMin:15, priceMax:39, moq:500, dropship:true, oem:true, rating:4.3, reviews:25000, region:"手机配件" },
    { name:"手机镜头广角微距", cat:1, supplier:1, desc:"120度超广角+10倍微距双镜头、夹式设计通用", priceMin:9.9, priceMax:25, moq:500, dropship:true, rating:4.2, reviews:12000, region:"手机摄影" },
    { name:"运动相机头戴支架", cat:6, supplier:37, desc:"可调节头带+金属底座、兼容GoPro/Insta360/大疆", priceMin:15, priceMax:35, moq:500, dropship:true, oem:true, rating:4.2, reviews:3800, region:"运动配件" },
    { name:"三脚架手机落地支架", cat:1, supplier:1, desc:"1.7m可伸缩、蓝牙遥控录制、360度旋转头", priceMin:19, priceMax:49, moq:300, dropship:true, rating:4.3, reviews:15000, region:"手机配件" },
    { name:"电子体重秤智能蓝牙", cat:8, supplier:13, desc:"BIA测脂技术、APP同步、15项身体数据", priceMin:19, priceMax:49, moq:300, dropship:true, oem:true, rating:4.3, reviews:15000, region:"智能健康" },
    { name:"血压计电子上臂式", cat:8, supplier:26, desc:"智能加压、大屏语音播报、双用户记忆、心率检测", priceMin:29, priceMax:69, moq:300, dropship:true, rating:4.4, reviews:8900, region:"健康医疗" },
    { name:"血糖仪家用高精准", cat:8, supplier:26, desc:"0.6微升微量采血、5秒出值、记忆500组", priceMin:19, priceMax:49, moq:300, dropship:true, oem:true, rating:4.3, reviews:5600, region:"健康医疗" },
    { name:"空气净化器家用", cat:2, supplier:3, desc:"HEPA滤芯、CADR值400m3/h、静音26dB、智能检测", priceMin:199, priceMax:499, moq:50, dropship:true, rating:4.5, reviews:6800, region:"健康家电" },
    { name:"加湿器大容量5L", cat:2, supplier:3, desc:"5L大水箱、超声波雾化、恒湿设定、静音睡眠模式", priceMin:29, priceMax:79, moq:200, dropship:true, oem:true, rating:4.3, reviews:15000, region:"健康家电" },
    { name:"除湿机家用20L", cat:2, supplier:3, desc:"20L/天除湿量、负离子净化、干衣模式", priceMin:299, priceMax:699, moq:50, dropship:true, rating:4.4, reviews:3200, region:"健康家电" },
    { name:"电风扇塔扇无叶", cat:2, supplier:3, desc:"无叶设计安全、广角送风、8档风速、遥控定时", priceMin:129, priceMax:299, moq:100, dropship:true, oem:true, rating:4.3, reviews:6800, region:"夏季家电" },
    { name:"空气炸锅大容量5L", cat:7, supplier:13, desc:"5L大容量、360度热风循环、8大智能菜单、不粘内胆", priceMin:79, priceMax:169, moq:100, dropship:true, rating:4.5, reviews:15000, region:"厨房电器" },
    { name:"电磁炉大火力3500W", cat:7, supplier:3, desc:"3500W大火力、双环火力、24小时预约、10档调节", priceMin:49, priceMax:129, moq:200, dropship:true, oem:true, rating:4.3, reviews:12000, region:"厨房电器" },
    { name:"电炖锅陶瓷内胆4L", cat:7, supplier:13, desc:"紫砂陶瓷内胆、智能预约、8种模式、4L大容量", priceMin:49, priceMax:119, moq:200, dropship:true, rating:4.3, reviews:5600, region:"厨房电器" },
    { name:"早餐机三明治机", cat:7, supplier:19, desc:"双盘三明治、不粘涂层、5分钟做好、可换华夫饼盘", priceMin:29, priceMax:69, moq:300, dropship:true, oem:true, rating:4.3, reviews:12000, region:"厨房电器" },
    { name:"冰沙机破壁机", cat:7, supplier:19, desc:"1500W强劲电机、6叶刀片、1.5L玻璃杯、一键清洗", priceMin:99, priceMax:249, moq:100, dropship:true, rating:4.4, reviews:6800, region:"厨房电器" },
    { name:"手持搅拌棒电动", cat:7, supplier:19, desc:"800W电机、不锈钢搅拌杆、一机四用多模式", priceMin:29, priceMax:69, moq:300, dropship:true, oem:true, rating:4.3, reviews:8900, region:"厨房电器" },
    { name:"刀具套装厨房7件", cat:7, supplier:4, desc:"德国钢锻造、7件套含刀座、防磨抗菌、锋利持久", priceMin:29, priceMax:89, moq:200, dropship:true, rating:4.4, reviews:12000, region:"厨房刀具" },
    { name:"不粘锅三件套", cat:7, supplier:4, desc:"麦饭石不粘涂层、煎锅+汤锅+炒锅、防滴设计", priceMin:69, priceMax:179, moq:100, dropship:true, oem:true, rating:4.4, reviews:8900, region:"厨房锅具" },
    { name:"保鲜盒玻璃套装12件", cat:7, supplier:4, desc:"高硼硅玻璃、四面锁扣密封、微波炉可用、叠放收纳", priceMin:19, priceMax:49, moq:300, dropship:true, rating:4.3, reviews:15000, region:"厨房收纳" },
    { name:"自行车手机支架", cat:6, supplier:30, desc:"铝合金材质、防震硅胶圈、360度旋转、快拆安装", priceMin:15, priceMax:35, moq:500, dropship:true, oem:true, rating:4.2, reviews:6800, region:"骑行配件" },
    { name:"骑行眼镜风镜防紫外线", cat:6, supplier:5, desc:"PC防弹镜片、UV400防晒、可换镜片、防雾透气", priceMin:19, priceMax:49, moq:300, dropship:true, rating:4.3, reviews:5600, region:"骑行装备" },
    { name:"钓鱼竿海竿套装", cat:6, supplier:12, desc:"高碳纤维竿身、3.6m海竿+渔轮+鱼线+全套配件", priceMin:39, priceMax:99, moq:200, dropship:true, oem:true, rating:4.3, reviews:4200, region:"垂钓" },
    { name:"瑜伽球加厚防爆", cat:6, supplier:5, desc:"防爆PVC材质、承重300kg、送气泵+教程、65cm", priceMin:15, priceMax:39, moq:300, dropship:true, rating:4.2, reviews:8900, region:"运动健身" },
    { name:"跳绳计数电子", cat:6, supplier:5, desc:"PVC钢丝绳、电子计数、精确卡路里、防缠绕轴承", priceMin:9.9, priceMax:25, moq:500, dropship:true, oem:true, rating:4.3, reviews:22000, region:"运动健身" },
    { name:"哑铃套装可调节20kg", cat:6, supplier:5, desc:"包胶哑铃片、镀锌连接杆、快速调节2-20kg、收纳架", priceMin:69, priceMax:169, moq:50, dropship:true, rating:4.4, reviews:6800, region:"运动健身" },
    { name:"仰卧起坐辅助器", cat:6, supplier:5, desc:"加厚泡棉、防滑吸盘、可折叠收纳、家用腹部训练", priceMin:15, priceMax:35, moq:500, dropship:true, oem:true, rating:4.2, reviews:12000, region:"运动健身" },
    { name:"家用引体向上单杠", cat:6, supplier:5, desc:"免打孔安装、承重200kg、三握把设计、防滑海绵", priceMin:29, priceMax:69, moq:200, dropship:true, rating:4.3, reviews:8900, region:"运动健身" },
    { name:"重力被加重毯", cat:3, supplier:50, desc:"玻璃微珠重力填充、分区压感设计、1.5-4.5kg可选", priceMin:69, priceMax:169, moq:100, dropship:true, oem:true, rating:4.3, reviews:5600, region:"睡眠" },
    { name:"纯棉四件套全棉", cat:3, supplier:50, desc:"100%长绒棉、60支高支高密、亲肤柔软、四季通用", priceMin:59, priceMax:149, moq:100, dropship:true, rating:4.5, reviews:12000, region:"家居床品" },
    { name:"羽绒枕五星酒店", cat:3, supplier:50, desc:"95%白鹅绒填充、700+蓬松度、抗菌面料、五星级体验", priceMin:89, priceMax:229, moq:100, dropship:true, oem:true, rating:4.4, reviews:6800, region:"睡眠" },
    { name:"电热毯双人除螨", cat:2, supplier:19, desc:"双人双控调温、除螨功能、自动断电、可水洗面料", priceMin:49, priceMax:129, moq:100, dropship:true, rating:4.3, reviews:8900, region:"冬季取暖" }
  ]

  const products = await Promise.all(
    productData.map((p, i) => {
      const prodId = i + 1
      const images = imageMap[String(prodId)]?.images || []
      return db.product.create({
        data: {
          id: prodId,
          name: p.name,
          description: p.desc,
          categoryId: p.cat,
          supplierId: p.supplier,
          priceMin: p.priceMin,
          priceMax: p.priceMax,
          moq: p.moq,
          supportsDropShipping: p.dropship || false,
          supportsOEM: p.oem || false,
          images: JSON.stringify(images),
          salesData: JSON.stringify({ monthlySales: Math.floor(Math.random() * 50000 + 1000), region: p.region }),
          specs: JSON.stringify({ weight: (Math.random() * 2 + 0.2).toFixed(1) + 'kg', color: '多色可选' }),
          rating: parseFloat((p.rating - Math.random() * 0.3).toFixed(2)),
          reviewCount: p.reviews,
        }
      })
    })
  )
  console.log(`  ✅ ${products.length} products`)

  // ─── Admin user ──────────────────────────────────
  const admin = await db.user.create({
    data: {
      id: 1,
      email: 'admin@lenboss.win',
      password: await hashPassword('admin123'),
      name: '懒老板管理员',
      company: '懒老板团队',
    }
  })
  console.log(`  ✅ admin user: admin@lenboss.win / admin123`)

  console.log('')
  console.log('🎉 Seed complete!')
  console.log(`   ${categories.length} categories`)
  console.log(`   ${suppliers.length} suppliers`)
  console.log(`   ${products.length} products`)
  console.log(`   1 admin user`)
}

main()
  .catch(e => { console.error('Seed failed:', e); process.exit(1) })
  .finally(() => db.$disconnect())
