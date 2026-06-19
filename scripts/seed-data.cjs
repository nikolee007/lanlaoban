/**
 * 懒老板全球供应链 — 种子数据脚本 (真实感增强版)
 *
 * 162+ 供应商 / 202+ 商品 / 覆盖15个产业带 / 真实电商级数据
 *
 * 用法:
 *   node scripts/seed-data.cjs              # 追加数据
 *   node scripts/seed-data.cjs --drop       # 清空后重新插入
 *
 * 环境变量: DATABASE_URL (从 .env / .env.local 读取)
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// =====================================================================
//  分类数据 (保持不变)
// =====================================================================
const categories = [
  { name: '消费电子',        type: 'crossborder', icon: '', sortOrder: 1 },
  { name: '手机配件',        type: 'crossborder', icon: '', sortOrder: 2, parentName: '消费电子' },
  { name: '智能穿戴',        type: 'crossborder', icon: '', sortOrder: 3, parentName: '消费电子' },
  { name: '小家电',          type: 'both',        icon: '', sortOrder: 4, parentName: '消费电子' },
  { name: '服装服饰',        type: 'both',        icon: '', sortOrder: 5 },
  { name: '女装',            type: 'both',        icon: '', sortOrder: 6, parentName: '服装服饰' },
  { name: '男装',            type: 'both',        icon: '', sortOrder: 7, parentName: '服装服饰' },
  { name: '运动服装',        type: 'crossborder', icon: '', sortOrder: 8, parentName: '服装服饰' },
  { name: '童装',            type: 'both',        icon: '', sortOrder: 9, parentName: '服装服饰' },
  { name: '鞋类',            type: 'both',        icon: '', sortOrder: 10 },
  { name: '运动鞋',          type: 'both',        icon: '', sortOrder: 11, parentName: '鞋类' },
  { name: '拖鞋凉鞋',        type: 'both',        icon: '', sortOrder: 12, parentName: '鞋类' },
  { name: '家居家具',        type: 'domestic',    icon: '', sortOrder: 13 },
  { name: '客厅家具',        type: 'domestic',    icon: '', sortOrder: 14, parentName: '家居家具' },
  { name: '卧室家具',        type: 'domestic',    icon: '', sortOrder: 15, parentName: '家居家具' },
  { name: '家纺布艺',        type: 'both',        icon: '', sortOrder: 16 },
  { name: '日用百货',        type: 'both',        icon: '', sortOrder: 17 },
  { name: '厨房用品',        type: 'both',        icon: '', sortOrder: 18, parentName: '日用百货' },
  { name: '收纳整理',        type: 'both',        icon: '', sortOrder: 19, parentName: '日用百货' },
  { name: '饰品配件',        type: 'crossborder', icon: '', sortOrder: 20 },
  { name: '文具办公',        type: 'both',        icon: '', sortOrder: 21 },
  { name: '玩具潮玩',        type: 'both',        icon: '', sortOrder: 22 },
  { name: '宠物用品',        type: 'crossborder', icon: '', sortOrder: 23 },
  { name: '卫浴陶瓷',        type: 'both',        icon: '', sortOrder: 24 },
  { name: '灯具照明',        type: 'crossborder', icon: '', sortOrder: 25 },
  { name: '食品加工',        type: 'domestic',    icon: '', sortOrder: 26 },
  { name: '箱包皮具',        type: 'both',        icon: '', sortOrder: 27 },
  { name: '五金工具',        type: 'both',        icon: '', sortOrder: 28 },
];

// =====================================================================
//  图片路径映射 — 按品类匹配到 baidu 目录
// =====================================================================
const IMAGE_BASE = '/product-images/baidu';

const imageMap = {
  // 消费电子
  '无线耳机': ['电子产品_无线耳机充电仓_0.jpg','电子产品_无线耳机充电仓_1.jpg','电子产品_无线耳机充电仓_2.jpg','电子产品_无线耳机充电仓_3.jpg','电子产品_无线耳机充电仓_4.jpg'],
  '充电宝': ['电子产品_充电宝移动电源_0.jpg','电子产品_充电宝移动电源_1.jpg','电子产品_充电宝移动电源_2.jpg','电子产品_充电宝移动电源_3.jpg','电子产品_充电宝移动电源_4.jpg'],
  '数据线': ['电子产品_手机数据线typec_0.jpg','电子产品_手机数据线typec_1.jpg','电子产品_手机数据线typec_2.jpg','电子产品_手机数据线typec_3.jpg','电子产品_手机数据线typec_4.jpg'],
  '蓝牙音箱': ['电子产品_蓝牙音箱便携_0.jpg','电子产品_蓝牙音箱便携_1.jpg','电子产品_蓝牙音箱便携_2.jpg','电子产品_蓝牙音箱便携_3.jpg','电子产品_蓝牙音箱便携_4.jpg'],
  '智能手表': ['电子产品_智能手表运动_0.jpg','电子产品_智能手表运动_1.jpg','电子产品_智能手表运动_2.jpg','电子产品_智能手表运动_3.jpg','电子产品_智能手表运动_4.jpg'],
  '手机壳': ['电子产品_手机壳硅胶_0.jpg','电子产品_手机壳硅胶_1.jpg','电子产品_手机壳硅胶_2.jpg','电子产品_手机壳硅胶_3.jpg','电子产品_手机壳硅胶_4.jpg'],
  '平板': ['电子产品_平板电脑_0.jpg','电子产品_平板电脑_1.jpg','电子产品_平板电脑_2.jpg','电子产品_平板电脑_3.jpg','电子产品_平板电脑_4.jpg'],
  // 服装
  '连衣裙': ['服装_连衣裙女装夏_0.jpg','服装_连衣裙女装夏_1.jpg','服装_连衣裙女装夏_2.jpg','服装_连衣裙女装夏_3.jpg','服装_连衣裙女装夏_4.jpg'],
  'T恤': ['服装_纯棉T恤男_0.jpg','服装_纯棉T恤男_1.jpg','服装_纯棉T恤男_2.jpg','服装_纯棉T恤男_3.jpg','服装_纯棉T恤男_4.jpg'],
  '牛仔裤': ['服装_牛仔裤男款_0.jpg','服装_牛仔裤男款_1.jpg','服装_牛仔裤男款_2.jpg','服装_牛仔裤男款_3.jpg','服装_牛仔裤男款_4.jpg'],
  '卫衣': ['服装_卫衣连帽_0.jpg','服装_卫衣连帽_3.jpg','服装_卫衣连帽_4.jpg'],
  '睡衣': ['服装_睡衣家居服_0.jpg','服装_睡衣家居服_1.jpg','服装_睡衣家居服_2.jpg','服装_睡衣家居服_3.jpg','服装_睡衣家居服_4.jpg'],
  '衬衫': ['服装_休闲衬衫男_0.jpg','服装_休闲衬衫男_1.jpg','服装_休闲衬衫男_2.jpg','服装_休闲衬衫男_3.jpg','服装_休闲衬衫男_4.jpg'],
  '羽绒服': ['服装_羽绒服轻薄_0.jpg','服装_羽绒服轻薄_1.jpg','服装_羽绒服轻薄_2.jpg','服装_羽绒服轻薄_3.jpg','服装_羽绒服轻薄_4.jpg'],
  '运动套装': ['服装_运动套装女_0.jpg','服装_运动套装女_1.jpg','服装_运动套装女_2.jpg','服装_运动套装女_3.jpg','服装_运动套装女_4.jpg'],
  // 家居
  '沙发': ['家居_沙发客厅_0.jpg','家居_沙发客厅_1.jpg','家居_沙发客厅_2.jpg','家居_沙发客厅_3.jpg','家居_沙发客厅_4.jpg'],
  '餐桌': ['家居_实木餐桌_0.jpg','家居_实木餐桌_1.jpg','家居_实木餐桌_2.jpg','家居_实木餐桌_3.jpg','家居_实木餐桌_4.jpg'],
  '餐具': ['家居_陶瓷餐具套装_0.jpg','家居_陶瓷餐具套装_1.jpg','家居_陶瓷餐具套装_2.jpg','家居_陶瓷餐具套装_3.jpg','家居_陶瓷餐具套装_4.jpg'],
  '收纳盒': ['家居_收纳盒塑料_0.jpg','家居_收纳盒塑料_1.jpg','家居_收纳盒塑料_2.jpg','家居_收纳盒塑料_3.jpg','家居_收纳盒塑料_4.jpg'],
  '收纳箱': ['家居_收纳箱有盖_0.jpg','家居_收纳箱有盖_1.jpg','家居_收纳箱有盖_2.jpg','家居_收纳箱有盖_3.jpg','家居_收纳箱有盖_4.jpg'],
  '枕头': ['家居_枕头记忆棉_0.jpg','家居_枕头记忆棉_1.jpg','家居_枕头记忆棉_2.jpg','家居_枕头记忆棉_3.jpg','家居_枕头记忆棉_4.jpg'],
  '窗帘': ['家居_窗帘遮光_0.jpg','家居_窗帘遮光_1.jpg','家居_窗帘遮光_2.jpg','家居_窗帘遮光_3.jpg','家居_窗帘遮光_4.jpg'],
  '台灯': ['家居_LED台灯护眼_1.jpg','家居_LED台灯护眼_2.jpg','家居_LED台灯护眼_3.jpg','家居_LED台灯护眼_4.jpg'],
  '保温杯': ['家居_保温杯不锈钢_0.jpg','家居_保温杯不锈钢_1.jpg','家居_保温杯不锈钢_2.jpg','家居_保温杯不锈钢_3.jpg','家居_保温杯不锈钢_4.jpg'],
  '智能马桶': ['家居_智能马桶卫浴_0.jpg','家居_智能马桶卫浴_1.jpg','家居_智能马桶卫浴_2.jpg','家居_智能马桶卫浴_3.jpg','家居_智能马桶卫浴_4.jpg'],
  '厨房': ['家居_厨房用品厨具_0.jpg','家居_厨房用品厨具_1.jpg','家居_厨房用品厨具_2.jpg','家居_厨房用品厨具_3.jpg','家居_厨房用品厨具_4.jpg'],
  // 美妆
  '口红': ['美妆_口红唇膏_0.jpg','美妆_口红唇膏_1.jpg','美妆_口红唇膏_2.jpg','美妆_口红唇膏_3.jpg','美妆_口红唇膏_4.jpg'],
  '面膜': ['美妆_面膜补水_0.jpg','美妆_面膜补水_1.jpg','美妆_面膜补水_2.jpg','美妆_面膜补水_3.jpg','美妆_面膜补水_4.jpg'],
  '护肤品': ['美妆_护肤品套装_0.jpg','美妆_护肤品套装_1.jpg','美妆_护肤品套装_2.jpg','美妆_护肤品套装_3.jpg','美妆_护肤品套装_4.jpg'],
  '精华液': ['美妆_护肤品精华液_0.jpg','美妆_护肤品精华液_1.jpg','美妆_护肤品精华液_2.jpg','美妆_护肤品精华液_3.jpg','美妆_护肤品精华液_4.jpg'],
  '香水': ['美妆_香水女士_0.jpg','美妆_香水女士_1.jpg','美妆_香水女士_2.jpg','美妆_香水女士_3.jpg','美妆_香水女士_4.jpg'],
  '眼影': ['美妆_眼影盘_0.jpg','美妆_眼影盘_1.jpg','美妆_眼影盘_2.jpg','美妆_眼影盘_3.jpg','美妆_眼影盘_4.jpg'],
  // 食品
  '坚果': ['食品_坚果混合零食_0.jpg','食品_坚果混合零食_1.jpg','食品_坚果混合零食_2.jpg','食品_坚果混合零食_3.jpg','食品_坚果混合零食_4.jpg'],
  '咖啡': ['食品_咖啡豆包装_0.jpg','食品_咖啡豆包装_1.jpg','食品_咖啡豆包装_2.jpg','食品_咖啡豆包装_3.jpg','食品_咖啡豆包装_4.jpg'],
  '啤酒': ['食品_啤酒罐装_0.jpg','食品_啤酒罐装_1.jpg','食品_啤酒罐装_2.jpg','食品_啤酒罐装_3.jpg','食品_啤酒罐装_4.jpg'],
  '精酿': ['食品_精酿啤酒原浆_0.jpg','食品_精酿啤酒原浆_1.jpg','食品_精酿啤酒原浆_2.jpg','食品_精酿啤酒原浆_3.jpg','食品_精酿啤酒原浆_4.jpg'],
  '矿泉水': ['食品_矿泉水瓶装_0.jpg','食品_矿泉水瓶装_1.jpg','食品_矿泉水瓶装_2.jpg','食品_矿泉水瓶装_3.jpg','食品_矿泉水瓶装_4.jpg'],
  '白酒': ['食品_白酒礼盒_0.jpg','食品_白酒礼盒_1.jpg','食品_白酒礼盒_2.jpg','食品_白酒礼盒_3.jpg','食品_白酒礼盒_4.jpg'],
  // 玩具
  '积木': ['玩具_儿童积木乐高_0.jpg','玩具_儿童积木乐高_1.jpg','玩具_儿童积木乐高_2.jpg','玩具_儿童积木乐高_3.jpg','玩具_儿童积木乐高_4.jpg'],
  '毛绒公仔': ['玩具_毛绒玩具公仔_0.jpg','玩具_毛绒玩具公仔_1.jpg','玩具_毛绒玩具公仔_2.jpg','玩具_毛绒玩具公仔_3.jpg','玩具_毛绒玩具公仔_4.jpg'],
  '遥控车': ['玩具_遥控车玩具_0.jpg','玩具_遥控车玩具_1.jpg','玩具_遥控车玩具_2.jpg','玩具_遥控车玩具_3.jpg','玩具_遥控车玩具_4.jpg'],
  '益智': ['玩具_益智玩具儿童_0.jpg','玩具_益智玩具儿童_1.jpg','玩具_益智玩具儿童_2.jpg','玩具_益智玩具儿童_3.jpg','玩具_益智玩具儿童_4.jpg'],
  '婴儿玩具': ['玩具_婴儿玩具早教_0.jpg','玩具_婴儿玩具早教_1.jpg','玩具_婴儿玩具早教_2.jpg','玩具_婴儿玩具早教_3.jpg','玩具_婴儿玩具早教_4.jpg'],
  // 鞋类
  '运动鞋': ['鞋类_运动鞋女_0.jpg','鞋类_运动鞋女_1.jpg','鞋类_运动鞋女_2.jpg','鞋类_运动鞋女_3.jpg','鞋类_运动鞋女_4.jpg'],
  '皮鞋': ['鞋类_皮鞋男商务_0.jpg','鞋类_皮鞋男商务_1.jpg','鞋类_皮鞋男商务_2.jpg','鞋类_皮鞋男商务_3.jpg','鞋类_皮鞋男商务_4.jpg'],
  '拖鞋': ['鞋类_拖鞋居家_0.jpg','鞋类_拖鞋居家_1.jpg','鞋类_拖鞋居家_2.jpg','鞋类_拖鞋居家_3.jpg','鞋类_拖鞋居家_4.jpg'],
  // 宠物
  '猫粮': ['宠物_猫粮猫食品_0.jpg','宠物_猫粮猫食品_1.jpg','宠物_猫粮猫食品_2.jpg','宠物_猫粮猫食品_3.jpg','宠物_猫粮猫食品_4.jpg'],
  '猫窝': ['宠物_猫爬架_0.jpg','宠物_猫爬架_1.jpg','宠物_猫爬架_2.jpg','宠物_猫爬架_3.jpg','宠物_猫爬架_4.jpg'],
  '狗窝': ['宠物_狗窝宠物床_0.jpg','宠物_狗窝宠物床_1.jpg','宠物_狗窝宠物床_2.jpg','宠物_狗窝宠物床_3.jpg','宠物_狗窝宠物床_4.jpg'],
  '宠物玩具': ['宠物_宠物玩具狗_1.jpg','宠物_宠物玩具狗_2.jpg','宠物_宠物玩具狗_3.jpg','宠物_宠物玩具狗_4.jpg'],
  '磨牙棒': ['宠物_宠物磨牙棒狗_0.jpg','宠物_宠物磨牙棒狗_1.jpg','宠物_宠物磨牙棒狗_2.jpg','宠物_宠物磨牙棒狗_3.jpg','宠物_宠物磨牙棒狗_4.jpg'],
  // 运动
  '瑜伽垫': ['运动_瑜伽垫健身_0.jpg','运动_瑜伽垫健身_1.jpg','运动_瑜伽垫健身_2.jpg','运动_瑜伽垫健身_3.jpg','运动_瑜伽垫健身_4.jpg'],
  '哑铃': ['运动_哑铃健身器材_0.jpg','运动_哑铃健身器材_2.jpg','运动_哑铃健身器材_3.jpg','运动_哑铃健身器材_4.jpg'],
  '运动水壶': ['运动_运动水壶_0.jpg','运动_运动水壶_1.jpg','运动_运动水壶_2.jpg','运动_运动水壶_3.jpg','运动_运动水壶_4.jpg'],
};

function getImagePaths(productName) {
  for (const [key, paths] of Object.entries(imageMap)) {
    if (productName.includes(key)) {
      return JSON.stringify(paths.map(f => `${IMAGE_BASE}/${f}`));
    }
  }
  return null;
}

/**
 * 根据商品名称和描述判断品类，返回对应的 specs JSON 字符串
 */
function getProductSpecs(productName, description) {
  const text = productName + ' ' + (description || '');

  // 电子产品
  if (/耳机|音箱|音质|蓝牙|充电宝|数据线|充电器|GaN|充电支架|智能手表|智能眼镜|VR|AR|PCB|PCBA|电路板|扬声器|电源适配|WiFi智能|智能插座|行车记录|车载|无人机|IoT|物联网|模组|喇叭|开关电源|USB-C墙壁|转换器/i.test(text)) {
    return JSON.stringify({"芯片":"蓝牙5.3","续航":"8小时","防水":"IPX5","重量":"45g"});
  }
  if (/空气炸|榨汁|加湿器|取暖器|风扇|电饭煲|煮锅|养生壶|微波炉|电磁炉|蒸烤|电炖|除湿|净化|冰箱|冷柜|迷你冰箱|香薰/i.test(text)) {
    return JSON.stringify({"芯片":"蓝牙5.3","续航":"8小时","防水":"IPX5","重量":"45g"});
  }
  if (/LED|照明|吸顶|灯带|灯泡|筒灯|射灯|灯饰|水晶灯|太阳能|庭院灯/i.test(text)) {
    return JSON.stringify({"芯片":"蓝牙5.3","续航":"8小时","防水":"IPX5","重量":"45g"});
  }
  if (/打火机|电子/i.test(text) && /打火机/.test(text)) {
    return JSON.stringify({"芯片":"蓝牙5.3","续航":"8小时","防水":"IPX5","重量":"45g"});
  }

  // 服装
  if (/连衣裙|T恤|衬衫|卫衣|大衣|运动服|瑜伽|运动套装|童装|婴儿|爬服|内衣|文胸|睡衣|家居服|保暖|男装|女装|裤子|牛仔裤|羊绒|羊毛|针织|免烫|POLO/.test(text)) {
    return JSON.stringify({"面料":"100%棉","克重":"260g","版型":"修身","尺码":"S-3XL"});
  }

  // 家居
  if (/沙发|茶几|床垫|床架|床头柜|桌|椅|柜|家具|瓷砖|陶瓷|餐具|茶具|花瓶|收纳|枕头|窗帘|保温杯|床品|四件套|毛巾|被子|枕芯|坐垫|抱枕|地毯|卫浴|马桶|花洒|水龙头|浴巾|岩板|大理石/i.test(text)) {
    return JSON.stringify({"材质":"陶瓷","尺寸":"10寸","重量":"500g"});
  }
  if (/抽纸|纸巾|纸制品|洗洁精|洗衣凝珠|清洁|保鲜/i.test(text)) {
    return JSON.stringify({"材质":"陶瓷","尺寸":"10寸","重量":"500g"});
  }

  // 美妆
  if (/面膜|洗面奶|精华|唇釉|口红|护肤|化妆品|面霜|眼霜|防晒|香水|眼影|洁面|润肤/i.test(text)) {
    return JSON.stringify({"容量":"30ml","保质期":"3年","适合肤质":"所有肤质"});
  }

  // 其他品类推断
  if (/食品|海鲜|虾|鱼|辣酱|零食|坚果|月饼|糕点|腊味|预制菜|啤酒|白酒|茶叶|咖啡|矿泉水|零食|肉脯|果干|调味|酱料/i.test(text)) {
    return JSON.stringify({"规格":"标准装","保质期":"12个月","重量":"500g"});
  }
  if (/玩具|积木|盲盒|公仔|遥控|娃娃|泡泡机|水枪|布书|摇铃|牙胶|益智|婴儿玩具/i.test(text)) {
    return JSON.stringify({"材质":"ABS环保","安全标准":"EN71","适用年龄":"3岁+"});
  }
  if (/宠物|猫|狗|猫窝|猫粮|狗粮|冻干|磨牙棒/i.test(text)) {
    return JSON.stringify({"规格":"标准装","重量":"1.5kg","保质期":"18个月"});
  }
  if (/鞋|运动鞋|拖鞋|凉鞋|跑鞋|皮鞋/i.test(text)) {
    return JSON.stringify({"面料":"头层牛皮","鞋底":"橡胶","尺码":"38-44"});
  }
  if (/五金|工具|螺丝|紧固件|合页|门夹|锁|管材|水管|PPR|PVC|球阀|法兰|阀门|墙壁开关/.test(text)) {
    return JSON.stringify({"材质":"304不锈钢","规格":"标准件","表面处理":"拉丝"});
  }
  if (/文具|笔芯|钢笔|水彩笔|铅笔|蜡笔|画本|水笔|包装纸|办公|本子/i.test(text)) {
    return JSON.stringify({"规格":"标准装","数量":"100支装","材质":"不锈钢笔头"});
  }
  if (/背包|双肩|箱包|拉杆箱|手提包|钱包|皮包|女包|斜挎/i.test(text)) {
    return JSON.stringify({"材质":"头层牛皮","尺寸":"标准款","颜色":"多色可选"});
  }
  if (/饰品|项链|耳环|发夹|锁骨链|珍珠|戒指|手链|发圈|胸针|耳钉|黄金/.test(text)) {
    return JSON.stringify({"材质":"999足金","重量":"约3g","工艺":"手工打磨"});
  }
  if (/眼镜|太阳镜|老花镜|光学/.test(text)) {
    return JSON.stringify({"镜片":"TAC偏光","镜框":"TR90","UV防护":"UV400"});
  }

  // 默认
  return JSON.stringify({"规格":"标准版"});
}

/**
 * 供应商增强数据池 — 合作品牌、月产能、交货周期、付款方式
 */
const partnerBrandsPool = {
  electronics: ['小米','华为','OPPO','vivo','荣耀','三星','苹果','Anker','Belkin','Baseus','UGREEN','ROMOSS'],
  garment: ['SHEIN','ZARA','H&M','优衣库','海澜之家','太平鸟','森马','以纯','七匹狼','红豆'],
  homeFurniture: ['宜家','顾家家居','全友','林氏家居','源氏木语','索菲亚','欧派','尚品宅配'],
  beauty: ['完美日记','花西子','珀莱雅','自然堂','百雀羚','欧莱雅','雅诗兰黛','兰蔻'],
  food: ['三只松鼠','良品铺子','百草味','来伊份','洽洽','旺旺','康师傅','统一'],
  general: ['Amazon Basics','Walmart','Target','Costco','Shopify品牌商'],
};

const monthlyCapacityPool = {
  electronics: ['月产能50万对','月产能30万台','月产能20万件','月产能10万件','月产能5万件'],
  garment: ['月产能10万件','月产能5万件','月产能3万件','月产能1万件','月产能5000件'],
  homeFurniture: ['月产能5000套','月产能3000套','月产能1000套','月产能2000套'],
  beauty: ['月产能50万支','月产能30万盒','月产能20万瓶','月产能10万件'],
  default: ['月产能10000件','月产能5000件','月产能2000件','月产能1000件'],
};

const deliveryLeadTimePool = [
  '样品3-5天，大货15-20天',
  '样品5-7天，大货20-30天',
  '样品7-10天，大货25-35天',
  '样品2-3天，大货10-15天',
  '样品5天，大货20天',
  '样品7天，大货30天',
];

const paymentTermsPool = ['T/T 30%定金+70%尾款','T/T 50%定金+50%尾款','L/C 即期','L/C 远期','PayPal','T/T + PayPal','L/C + T/T','西联汇款'];

function getSupplierEnhancements(businessTags) {
  const tags = businessTags || '';
  let category = 'default';
  if (/电子|蓝牙|数码|智能|手机|电器|LED|灯饰|照明|五金|开关/.test(tags)) category = 'electronics';
  else if (/服装|服饰|女装|男装|童装|内衣|运动|瑜伽|纺织/.test(tags)) category = 'garment';
  else if (/家具|家居|床垫|沙发|家纺|布艺|陶瓷|卫浴/.test(tags)) category = 'homeFurniture';
  else if (/美妆|护肤|化妆品|面膜|口红|彩妆/.test(tags)) category = 'beauty';
  else if (/食品|零食|海鲜|茶叶|饮料|坚果/.test(tags)) category = 'food';

  return {
    partnerBrands: Math.random() < 0.35 // ~35% have partner brands
      ? JSON.stringify(pickRandomN(partnerBrandsPool[category] || partnerBrandsPool.general, 1 + Math.floor(Math.random() * 3)))
      : null,
    monthlyCapacity: Math.random() < 0.55 // ~55% have monthly capacity
      ? pickRandom(monthlyCapacityPool[category] || monthlyCapacityPool.default)
      : null,
    deliveryLeadTime: Math.random() < 0.55 // ~55% have delivery lead time
      ? pickRandom(deliveryLeadTimePool)
      : null,
    paymentTerms: pickRandom(paymentTermsPool), // 100% have payment terms
  };
}


// =====================================================================
//  联系人、电话、公司简介数据池
// =====================================================================

const contactNames = {
  // 按产业带
  shenzhen: ['陈建平','李国华','王伟强','张明辉','刘志远','赵德明','林嘉诚','杨文斌'],
  guangzhou: ['陈伟杰','黄志强','周晓明','吴建华','郑永强','梁志强','何伟强','罗志明'],
  dongguan: ['邓志坚','黄国平','冯伟明','何建国','朱国栋','徐伟良','曾志伟','赖志明'],
  foshan: ['区伟雄','谭国华','何伟文','梁永康','关志伟','卢伟明','崔国良','潘志强'],
  yiwu: ['楼伟明','金国平','毛伟强','陈永良','傅志华','方伟建','龚国荣','童志坚'],
  quanzhou: ['蔡国强','陈伟忠','黄国荣','许志强','苏伟明','吴国栋','林伟强','郑永康'],
  wenzhou: ['徐志坚','陈国良','叶伟明','黄志文','周国平','郑伟杰','金国荣','林志远'],
  zhongshan: ['欧伟强','黄国伟','陈志明','林伟良','刘国荣','何伟华','郑志强','冯国栋'],
  ningbo: ['陈伟国','张志成','王国强','赵永明','徐伟良','胡国平','周志远','吴伟荣'],
  qingdao: ['王永强','张伟平','赵建明','刘国栋','孙志远','周国良','吴永康','郑建军'],
  shantou: ['陈伟鹏','林国明','黄志伟','许永康','郑国平','张伟杰','杨志诚','刘永强'],
  nantong: ['顾伟明','张建国','陈永良','周志远','吴国平','黄伟荣','钱志强','陆永康'],
  hangzhou: ['钱伟强','赵志远','孙国明','周永康','吴建平','郑伟良','陈志荣','林永强'],
};

const contactPhones = [
  '138****2568','139****7831','137****4902','136****6157','158****3849',
  '189****5027','186****1394','150****8276','152****4613','188****7295',
  '135****6482','159****3175','187****8036','133****5729','151****9641',
];

const companyIntros = {
  shenzhen: {
    electronics: [
      '深耕消费电子领域18年，拥有完整SMT贴片线和注塑车间，月产能50万+',
      '专注TWS耳机和智能穿戴研发制造，深圳高新技术企业，研发团队30余人',
      '华强北源头工厂，专业3C数码配件生产商，支持OEM/ODM定制服务',
      '以品质为核心竞争力，通过ISO9001/ISO14001双体系认证，出口30多国',
    ],
    accessories: [
      '手机配件行业领军企业，拥有50+专利技术，日产能10万件',
      '专业手机壳/钢化膜生产商，服务过小米/华为等品牌代工',
      '年产量超5000万件，产品远销欧美东南亚，电商供应链经验丰富',
    ],
  },
  guangzhou: {
    garment: [
      '广州十三行源头女装工厂，200+工人，日产连衣裙3000件，快反7天出货',
      '专注快时尚女装15年，与SHEIN/ZARA等深度合作，版型精准质量稳定',
      '集设计/生产/销售一体，年开发新款1000+，支持小单快返模式',
    ],
    leather: [
      '广州花都皮具产业带标杆企业，手工缝制工艺获SGS认证',
      '20年头层牛皮处理经验，意大利进口设备，日产箱包2000个',
    ],
    cosmetic: [
      '白云区化妆品生产示范基地，GMPC十万级净化车间，配方研发能力突出',
      '专注功效型护肤品代工，拥有独立实验室，服务国内外品牌50+',
    ],
  },
  dongguan: {
    electronics: [
      '东莞长安镇电子制造标杆企业，35000m2现代化厂房，全自动化产线',
      '专注小家电ODM18年，与Philips/松下等品牌长期合作，年产值超2亿',
    ],
    hardware: [
      '精密五金制造专家，日本进口CNC设备50台，精度达0.01mm',
      '20年五金冲压经验，服务汽车/电子/家具行业，IATF16949认证',
    ],
  },
  foshan: {
    furniture: [
      '佛山顺德老牌家具厂，30000m2生产基地，实木/板式/软体全品类',
      '专注客厅家具20年，拥有自主设计团队，产品远销40多个国家',
    ],
    building: [
      '佛山陶瓷产业带龙头企业，4条全自动生产线，日产能50000m2',
      '专业卫浴/瓷砖/管材制造商，工程案例遍布全国及海外市场',
    ],
  },
  yiwu: {
    general: [
      '义乌国际商贸城驻点工厂，SKU超2000个，支持混批一件代发',
      '小商品全品类供应链服务商，日处理订单3000+，物流覆盖全球',
    ],
    jewelry: [
      '义乌饰品产业带源头工厂，韩国设计团队加持，月出新品100+',
      '专注时尚饰品15年，拥有真空电镀/点钻等全套工艺生产线',
    ],
  },
  default: [
    '源头工厂直供，自有生产线，品质可控，交期保障，欢迎验厂',
    '专注跨境电商供应链，支持一件代发，48小时极速出货，售后无忧',
    '自有工厂+研发团队，产品通过多项国际认证，出口经验丰富',
    '实力源头厂家，提供OEM/ODM定制服务，最低起订量灵活，合作共赢',
  ],
};

function getCompanyIntro(region, industry) {
  const pool = companyIntros[region]?.[industry] || companyIntros[region]?.general || companyIntros.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getContactName(region) {
  const pool = contactNames[region] || contactNames.shenzhen;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getContactPhone() {
  return contactPhones[Math.floor(Math.random() * contactPhones.length)];
}

// =====================================================================
//  真实感评价模板
// =====================================================================

const reviewerNames = [
  '张建国','李明华','王淑芬','刘伟强','陈秀兰','杨志刚','赵美玲','黄国平',
  '周晓燕','吴文斌','郑秀英','孙建军','林桂芳','何志强','郭秀珍','马永强',
  '胡晓明','曹桂英','沈国栋','韩秀英','谢伟民','曾玉兰','彭志远','苏桂华',
  '卢建平','蒋美琴','蔡永康','余秀芳','潘伟杰','戴桂香','钟志明','熊秀兰',
  '石建忠','谭美华','廖国荣','邹秀萍','徐伟强','宋玉珍','范志勇','方桂珍',
  '夏永明','侯秀英','唐建国','冯美玲','孟伟华','丁秀芳','程志刚','沈秀琴',
  '叶建平','罗美兰','梁国良','邓秀英','许志伟','曾秀芳','魏建国','姚秀珍',
  '谭伟强','廖美华','邹志明','石秀兰','熊建平','彭秀英',
];

const reviewTemplates = {
  electronics: [
    '蓝牙连接稳定，10米隔墙也能正常播放，音质在这个价位很能打',
    '降噪效果超预期，地铁上开一半音量就够了，续航实测8小时+',
    '充电速度很快，半小时充了60%，数显电量很准，做工精致',
    '第3次复购了，品质一直稳定，客户退货率不到2%，良心厂家',
    '样品测试了所有功能，配对速度很快，包装也很用心，值得长期合作',
    '电池耐用，比之前进的货好太多了，客户反馈明显提升',
    '音质清晰通透，低音有弹性，跟千元级耳机有得一拼',
    '发货速度点赞，头天下单第二天到，大货品质和样品完全一致',
  ],
  clothing: [
    '面料手感真的不错，洗了一次没缩水没掉色，走线工整细致',
    '版型很好，按尺码表选的非常合身，试穿效果超出预期',
    '比我在广州拿的同类货好太多，价格还便宜，决定长期合作',
    '客户穿了说很舒服，已经返单了，第二批数量翻了三倍',
    '色差控制得很好，跟样品一致，不用担心退货问题',
    '包装很规范，每件独立包装吊牌齐全，直接可以上架销售',
    '做工细致，拉链顺滑，纽扣缝线牢固，细节处理很到位',
    '面料透气性很好，夏天穿不闷热，顾客评价很高',
  ],
  homeFurniture: [
    '实木纹理很漂亮，完全没有异味，组装后很稳固质感很好',
    '海绵密度很足，坐了两个月没有塌陷，布艺也好打理',
    '岩板台面质感很好，耐磨耐热，客户收到都说物超所值',
    '物流包装很到位，木架加固，长途运输没有任何磕碰',
    '佛山家具确实名不虚传，工艺水准超出预期，性价比很高',
    '定制尺寸也做得很准，沟通很顺畅，交货时间刚刚好',
    '油漆工艺不错，颜色均匀有光泽，没有色差和流挂',
  ],
  dailyGoods: [
    '义乌的东西确实便宜又好用，走量神器，利润空间很不错',
    '品质一直很稳定，已经回购了6次，每次发货都很快',
    '包装很精致，送礼也拿得出手，客户好评率很高',
    '在速卖通上卖得很好，价格有竞争力，准备加大采购量',
    '混批政策很灵活，拿样也方便，很适合我们这种小卖家',
    '物流很快，下单到收货不到5天，包装保护得很好',
    '1688上回头客很多，产品确实经得起市场检验',
  ],
  shoes: [
    '穿了两周才来评价，鞋底耐磨鞋面没开胶，质量没话说',
    '脚感很舒适，不需要磨合期，第一天穿就很合脚',
    '透气性很好，运动后脚不闷汗，比之前进的货好太多',
    '第一批货已经卖完了，客户反馈非常好，马上追加订单',
    '尺码很标准，按照尺码表选的非常合适，不偏码',
    '这个价格能买到这样的品质，性价比直接拉满',
  ],
  food: [
    '样品试吃后很满意，口感很新鲜，各项检测报告齐全',
    '生产日期很新鲜，保质期还长，出口通关很顺利',
    '包装密封性很好，运输中没有漏气或破损的情况',
    '检测报告很齐全，海关通关顺利，出口资质完备放心',
    '味道很纯正，客户反馈非常好，已签了长期供应合同',
    '价格有竞争力，质量也很稳定，适合做长线产品',
  ],
  toys: [
    '质量好价格还便宜，客户收到都说物超所值，复购率很高',
    '检测报告齐全，出口欧洲没问题，EN71认证全部通过',
    '益智功能设计得很好，客户反馈小朋友很喜欢玩',
    'ABS材质没有异味，边缘光滑不划手，安全性有保障',
    '盲盒设计很受欢迎，隐藏款吸引力大，复购率超高',
    '样品和大货品质完全一致，没有偷工减料，可以放心合作',
  ],
  beauty: [
    '做了皮肤测试很温和不刺激，敏感肌客户用了也说好',
    '成分透明检测报告齐全，出口资质完备，放心合作',
    '包装设计很有档次，客户很喜欢这种简约大气的风格',
    '复购率很高，客户用了都说好，已经形成口碑效应了',
    '在东南亚市场很有竞争力，价格定位很准',
  ],
  general: [
    '品质一直很稳定，多次回购了，值得长期合作的供应商',
    '发货速度快包装到位，产品没有任何破损',
    '价格有优势质量有保障，性价比在同类产品里算很高的',
    '沟通很顺畅配合度高，响应及时，省心省力',
    '样品和大货品质一致，没有落差，可以放心下单',
    '售后处理及时，有问题积极配合解决，服务态度好',
  ],
};

const platforms = ['1688', 'Amazon', 'TikTokShop', 'Shopee', 'Lazada', 'Temu', 'Wish', 'eBay', 'AliExpress', 'SHEIN'];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

function getReviewPool(productName, supplierTags) {
  const allTags = supplierTags ? supplierTags.join(' ') + ' ' + productName : productName;
  if (/耳机|音箱|音质|蓝牙|充电|数据线|手机|智能|电子|数码/i.test(allTags)) return reviewTemplates.electronics;
  if (/服装|衣服|女装|男装|童装|内衣|运动服|瑜伽|连衣裙|T恤|衬衫|卫衣|大衣/i.test(allTags)) return reviewTemplates.clothing;
  if (/沙发|家具|茶几|床垫|桌|椅|柜|家居/i.test(allTags)) return reviewTemplates.homeFurniture;
  if (/日用|收纳|厨房|保温|硅胶|塑料|清洁/i.test(allTags)) return reviewTemplates.dailyGoods;
  if (/鞋|运动鞋|拖鞋|凉鞋|跑鞋/i.test(allTags)) return reviewTemplates.shoes;
  if (/食品|海鲜|虾|鱼肉|调味|酱料|零食|茶叶|饮料/i.test(allTags)) return reviewTemplates.food;
  if (/玩具|积木|盲盒|公仔|潮玩|遥控/i.test(allTags)) return reviewTemplates.toys;
  if (/美妆|护肤|化妆品|面膜|洗面奶|口红/i.test(allTags)) return reviewTemplates.beauty;
  return reviewTemplates.general;
}

function generateReviews(targetId, targetType, productRating, productName, supplierTags) {
  const count = 3 + Math.floor(Math.random() * 6); // 3-8
  const pool = getReviewPool(productName, supplierTags);
  const results = [];

  for (let i = 0; i < count; i++) {
    const platform = pickRandom(platforms);
    // 评分分布: 4-5星70%, 3星20%, 1-2星10%
    const ratingRand = Math.random();
    let rating;
    if (ratingRand < 0.70) {
      rating = 4 + Math.floor(Math.random() * 2); // 4 or 5
    } else if (ratingRand < 0.90) {
      rating = 3; // 3
    } else {
      rating = 1 + Math.floor(Math.random() * 2); // 1 or 2
    }
    const reviewer = pickRandom(reviewerNames);
    const reviewTexts = pickRandomN(pool, 1 + Math.floor(Math.random() * 2));
    const daysAgo = Math.floor(Math.random() * 90) + 1;

    // Build keywords as realistic individual reviews
    const keywords = reviewTexts.map(t => `"${reviewer}": ${t}`);

    results.push({
      targetId,
      targetType,
      platform,
      rating,
      reviewCount: Math.floor(50 + Math.random() * 800),
      returnRate: +(Math.random() * 4 + 0.5).toFixed(1),
      repurchaseRate: +(Math.random() * 40 + 15).toFixed(1),
      keywords: JSON.stringify(keywords),
      collectedAt: new Date(Date.now() - daysAgo * 86400000),
    });
  }

  return results;
}

// =====================================================================
//  供应商数据 — 162家，覆盖15个产业带（增强版）
// =====================================================================

const suppliers = [
  // ═════════════════════════════════════════════════════════════════════
  //  深圳 · 华强北 — 消费电子 (12家)
  // ═════════════════════════════════════════════════════════════════════
  {
    nameZh: '深圳市华创数码科技有限公司',
    nameEn: 'Shenzhen Huachuang Digital Technology Co., Ltd.',
    location: '广东深圳 · 华强北',
    contactName: '陈建平',
    contactPhone: '138****2568',
    companyIntro: '深耕消费电子领域18年，拥有完整SMT贴片线和注塑车间，月产能50万+',
    yearEstablished: 2012, employeeCount: 380,
    annualExportRevenue: 1200,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'FCC', 'RoHS', 'BSCI']),
    businessTags: JSON.stringify(['蓝牙耳机', 'TWS耳机', '充电宝', '数据线', 'PCBA定制']),
    exportDestinations: JSON.stringify(['美国', '德国', '英国', '日本', '巴西', '东南亚']),
    rating: 4.8, reviewCount: 2340, isVerified: true, type: 'factory',
    products: [
      {
        name: '蓝牙5.3 TWS降噪耳机 入耳式',
        description: '搭载杰理AC7006芯片，ANC主动降噪深度-35dB，蓝牙5.3连接稳定10米不断连。IPX5防水防汗，续航6+18小时，支持无线充电。月产能50万对，支持OEM定制。',
        priceMin: 28.5, priceMax: 168.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'FCC', 'RoHS']),
        images: getImagePaths('无线耳机'),
        rating: 4.7, reviewCount: 15800,
      },
      {
        name: '磁吸无线充电宝 20000mAh 快充版',
        description: '支持MagSafe磁吸充电，PD 20W+QC 18W双向快充，LED数显精准电量。铝合金外壳散热好，通过UN38.3航空认证。容量档位10000/20000/30000mAh可选。',
        priceMin: 58.0, priceMax: 299.0, currency: 'CNY', moq: 50,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'FCC', 'RoHS', 'UN38.3']),
        images: getImagePaths('充电宝'),
        rating: 4.8, reviewCount: 23500,
      },
      {
        name: '编织快充数据线 Type-C 1.2m 100W',
        description: '尼龙编织线材耐弯折，支持PD 100W超级快充，数据传输速度480Mbps。锌合金接口耐用不生锈，经过20000+次弯折测试。1米/1.8米/2米多长度可选。',
        priceMin: 6.8, priceMax: 35.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'RoHS']),
        images: getImagePaths('数据线'),
        rating: 4.6, reviewCount: 42000,
      },
    ],
  },
  {
    nameZh: '深圳中科微电子有限公司',
    nameEn: 'Shenzhen Zhongke Microelectronics Co., Ltd.',
    location: '广东深圳 · 南山科技园',
    contactName: '李国华',
    contactPhone: '139****7831',
    companyIntro: '专注智能穿戴和医疗级穿戴设备研发制造，深圳高新技术企业，研发团队30余人',
    yearEstablished: 2015, employeeCount: 220,
    annualExportRevenue: 800,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'FCC', 'RoHS', 'IATF 16949']),
    businessTags: JSON.stringify(['智能穿戴', '智能手表', '运动手环', '医疗穿戴']),
    exportDestinations: JSON.stringify(['美国', '欧盟', '日本', '韩国', '中东']),
    rating: 4.7, reviewCount: 1280, isVerified: true, type: 'factory',
    products: [
      {
        name: '智能运动手表 AMOLED 1.43寸',
        description: '1.43寸AMOLED圆形屏，466x466分辨率细腻显示。支持GPS+北斗双模定位，心率血氧睡眠全天候监测。IP68防水等级，7-14天超长续航，支持100+运动模式。',
        priceMin: 85.0, priceMax: 245.0, currency: 'CNY', moq: 200,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'FCC', 'RoHS', 'IP68']),
        images: getImagePaths('智能手表'),
        rating: 4.6, reviewCount: 8700,
      },
    ],
  },
  {
    nameZh: '深圳亿品电子有限公司',
    nameEn: 'Shenzhen Yipin Electronics Co., Ltd.',
    location: '广东深圳 · 龙华',
    contactName: '王伟强',
    contactPhone: '137****4902',
    companyIntro: '以品质为核心竞争力，通过ISO9001/ISO14001双体系认证，蓝牙音箱出口30多国',
    yearEstablished: 2010, employeeCount: 450,
    annualExportRevenue: 2000,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'CE', 'FCC', 'UL', 'RoHS']),
    businessTags: JSON.stringify(['蓝牙音箱', '便携音箱', '户外音响', '桌面音箱']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '南美', '非洲']),
    rating: 4.5, reviewCount: 3160, isVerified: true, type: 'factory',
    products: [
      {
        name: '便携蓝牙音箱 IPX7防水 30W',
        description: '30W大功率震撼音效，360度环绕立体声。IPX7级防水可浸泡1米水深30分钟，户外泳池沙滩放心用。蓝牙5.3稳定连接，TF卡/AUX多模式播放，续航12小时。',
        priceMin: 45.0, priceMax: 168.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'FCC', 'RoHS', 'IPX7']),
        images: getImagePaths('蓝牙音箱'),
        rating: 4.5, reviewCount: 12100,
      },
    ],
  },
  {
    nameZh: '深圳赛格智能科技有限公司',
    nameEn: 'Shenzhen Saige Intelligent Technology Co., Ltd.',
    location: '广东深圳 · 福田区',
    contactName: '张明辉',
    contactPhone: '136****6157',
    companyIntro: '专注智能眼镜和AR/VR穿戴设备研发，团队核心来自大疆和华为，拥有多项发明专利',
    yearEstablished: 2017, employeeCount: 180,
    annualExportRevenue: 600,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'FCC', 'RoHS', 'UL']),
    businessTags: JSON.stringify(['智能眼镜', 'VR眼镜', 'AR眼镜', '智能穿戴', '无人机']),
    exportDestinations: JSON.stringify(['美国', '日本', '韩国', '欧洲', '中东']),
    rating: 4.3, reviewCount: 890, isVerified: false, type: 'factory',
    products: [
      {
        name: '智能音频眼镜 蓝牙5.3 防蓝光',
        description: 'TR90超轻镜框仅28g佩戴无感，开放式定向传音不漏音。防蓝光镜片可选保护视力，触控操作接听换歌。续航5小时通话/8小时连续听歌，支持无线充电。',
        priceMin: 65.0, priceMax: 220.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'FCC', 'RoHS']),
        images: getImagePaths('无线耳机'),
        rating: 4.2, reviewCount: 3400,
      },
      {
        name: '无人机航拍 4K高清 三轴云台',
        description: '4K/30fps超高清航拍画质，三轴机械防抖云台画面稳定如履平地。GPS+GLONASS双模精准定位，5级抗风安全飞行。28分钟续航时间，含遥控器+备用电池套装。',
        priceMin: 280.0, priceMax: 880.0, currency: 'CNY', moq: 30,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'FCC', 'RoHS']),
        rating: 4.1, reviewCount: 2100,
      },
    ],
  },
  {
    nameZh: '深圳华强微电子有限公司',
    nameEn: 'Shenzhen Huaqiang Microelectronics Co., Ltd.',
    location: '广东深圳 · 华强北',
    contactName: '刘志远',
    contactPhone: '158****3849',
    companyIntro: '华强北源头PCB/PCBA工厂，拥有50+专利技术，日产能10万件，支持加急打样',
    yearEstablished: 2009, employeeCount: 150,
    annualExportRevenue: 500,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'RoHS', 'REACH']),
    businessTags: JSON.stringify(['PCB', 'PCBA', '电子元器件', '电路板定制', 'SMT贴片']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '印度', '巴西']),
    rating: 4.4, reviewCount: 1100, isVerified: false, type: 'factory',
    products: [
      {
        name: '多层PCB电路板 4-12层 打样/批量',
        description: 'FR-4玻纤板材，4-12层多层板精密工艺。最小线宽线距3/3mil，最小孔径0.2mm高精度。支持加急打样24小时出货，批量生产交期7-10天。',
        priceMin: 1.5, priceMax: 25.0, currency: 'CNY', moq: 100,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'RoHS', 'UL']),
        rating: 4.5, reviewCount: 9800,
      },
    ],
  },
  {
    nameZh: '深圳鼎盛数码配件有限公司',
    nameEn: 'Shenzhen Dingsheng Digital Accessories Co., Ltd.',
    location: '广东深圳 · 龙岗区',
    contactName: '赵德明',
    contactPhone: '189****5027',
    companyIntro: '年产量超5000万件的手机配件大厂，服务过小米/华为等品牌代工，电商供应链完善',
    yearEstablished: 2014, employeeCount: 200,
    annualExportRevenue: 700,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'CE', 'RoHS']),
    businessTags: JSON.stringify(['手机壳', '手机配件', '屏幕保护膜', '平板配件']),
    exportDestinations: JSON.stringify(['美国', '英国', '日本', '东南亚', '中东']),
    rating: 4.5, reviewCount: 1500, isVerified: true, type: 'factory',
    products: [
      {
        name: '透明防摔手机壳 军工认证',
        description: '德国拜耳TPU原料精制，透明不发黄持久如新。四角气囊防摔设计，通过军工级2米跌落认证。精准开孔完美贴合，支持MagSafe磁吸。iPhone全系列通用。',
        priceMin: 3.5, priceMax: 28.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'RoHS']),
        images: getImagePaths('手机壳'),
        rating: 4.4, reviewCount: 32000,
      },
      {
        name: '防窥钢化膜 2.5D弧边',
        description: '9H硬度钢化玻璃抗刮耐磨，28度防窥角度保护隐私。真空电镀疏油层抗指纹易清洁，2.5D弧边精准贴合不翘边。自动吸附排气安装简单无气泡。',
        priceMin: 4.0, priceMax: 22.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        images: getImagePaths('手机壳'),
        rating: 4.3, reviewCount: 28000,
      },
    ],
  },
  {
    nameZh: '深圳蓝媒科技有限公司',
    nameEn: 'Shenzhen Lanmei Technology Co., Ltd.',
    location: '广东深圳 · 宝安区',
    contactName: '林嘉诚',
    contactPhone: '186****1394',
    companyIntro: '专注蓝牙音箱和Soundbar研发制造，拥有独立电声实验室和消音室，调音技术领先',
    yearEstablished: 2016, employeeCount: 120,
    annualExportRevenue: 400,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'FCC', 'RoHS']),
    businessTags: JSON.stringify(['蓝牙音箱', '智能音箱', 'Soundbar', '音频方案']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '东南亚', '南美']),
    rating: 4.4, reviewCount: 760, isVerified: false, type: 'factory',
    products: [
      {
        name: 'RGB游戏蓝牙音箱 桌面2.0',
        description: '2.0声道桌面立体声音箱，RGB幻彩灯效随音律动。蓝牙5.0+USB+AUX三模连接兼容多设备。3寸全频喇叭单元，10Wx2输出功率，低音有弹性。',
        priceMin: 32.0, priceMax: 128.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'RoHS']),
        images: getImagePaths('蓝牙音箱'),
        rating: 4.4, reviewCount: 8900,
      },
    ],
  },
  {
    nameZh: '深圳华芯智能科技有限公司',
    nameEn: 'Shenzhen Huaxin Intelligent Technology Co., Ltd.',
    location: '广东深圳 · 南山区',
    contactName: '杨文斌',
    contactPhone: '150****8276',
    companyIntro: '智能家居IoT领域专家，WiFi/蓝牙/Zigbee全协议支持，与亚马逊Alexa深度合作',
    yearEstablished: 2013, employeeCount: 280,
    annualExportRevenue: 1100,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'FCC', 'UL', 'RoHS', 'Wi-Fi Alliance']),
    businessTags: JSON.stringify(['智能家居', '智能插座', '智能开关', 'WiFi模组']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '澳大利亚', '日本', '中东']),
    rating: 4.6, reviewCount: 1800, isVerified: true, type: 'factory',
    products: [
      {
        name: 'WiFi智能插座 带电量统计',
        description: '支持Amazon Alexa和Google Home语音控制，远程开关家电。内置电量统计芯片实时查看功耗，帮助节省电费。支持定时开关和过载保护，安全可靠。',
        priceMin: 12.0, priceMax: 55.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'FCC', 'UL', 'RoHS']),
        rating: 4.6, reviewCount: 15400,
      },
    ],
  },
  {
    nameZh: '深圳创达车品电子有限公司',
    nameEn: 'Shenzhen Chuangda Auto Electronics Co., Ltd.',
    location: '广东深圳 · 龙华新区',
    contactName: '张明辉',
    contactPhone: '152****4613',
    companyIntro: '车载电子专业制造商，SONY传感器官方合作伙伴，行车记录仪月销10万+',
    yearEstablished: 2011, employeeCount: 160,
    annualExportRevenue: 550,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'FCC', 'RoHS']),
    businessTags: JSON.stringify(['行车记录仪', '车载电子', '车载充电器', '倒车影像']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '俄罗斯', '中东', '东南亚']),
    rating: 4.3, reviewCount: 1200, isVerified: false, type: 'factory',
    products: [
      {
        name: '4K超清行车记录仪 前后双录',
        description: '前录4K/30fps超清画质，后录1080P。搭载SONY IMX415旗舰传感器，F1.8大光圈夜视效果出色。GPS轨迹记录+停车监控+碰撞锁定三合一。',
        priceMin: 45.0, priceMax: 168.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'FCC', 'RoHS']),
        rating: 4.3, reviewCount: 6200,
      },
    ],
  },
  {
    nameZh: '深圳盛世创新科技有限公司',
    nameEn: 'Shenzhen Shengshi Innovation Technology Co., Ltd.',
    location: '广东深圳 · 光明区',
    contactName: '陈建平',
    contactPhone: '188****7295',
    companyIntro: 'VR/AR设备新锐品牌，高通XR生态合作伙伴，研发投入占比超15%',
    yearEstablished: 2018, employeeCount: 90,
    annualExportRevenue: 300,
    certifications: JSON.stringify(['CE', 'FCC', 'RoHS']),
    businessTags: JSON.stringify(['VR设备', '3C数码', '直播设备', '手机支架']),
    exportDestinations: JSON.stringify(['美国', '日本', '韩国', '欧洲']),
    rating: 4.2, reviewCount: 540, isVerified: false, type: 'factory',
    products: [
      {
        name: 'VR一体机 4K高清 6DOF',
        description: '搭载高通XR2旗舰芯片性能强劲，4K Fast-LCD双屏显示细腻真实。6DOF空间定位精准追踪，手势识别无需手柄。256GB大容量存储，含双手柄套装。',
        priceMin: 320.0, priceMax: 980.0, currency: 'CNY', moq: 20,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'FCC', 'RoHS']),
        rating: 4.0, reviewCount: 1800,
      },
    ],
  },
  {
    nameZh: '深圳优品数码商行',
    nameEn: 'Shenzhen Youpin Digital Trading Co.',
    location: '广东深圳 · 华强北',
    contactName: '王伟强',
    contactPhone: '135****6482',
    companyIntro: '华强北一站式数码配件分销商，SKU超2000个，支持混批一件代发，物流覆盖全球',
    yearEstablished: 2019, employeeCount: 30,
    annualExportRevenue: 150,
    certifications: JSON.stringify([]),
    businessTags: JSON.stringify(['数码配件', '手机壳', '屏幕膜', '数据线', '充电器', '分销']),
    exportDestinations: JSON.stringify(['东南亚', '中东', '非洲', '南美']),
    rating: 4.1, reviewCount: 420, isVerified: false, type: 'distributor',
    products: [
      {
        name: 'USB-C快充充电器 20W GaN',
        description: '氮化镓GaN黑科技，20W PD快充体积缩小50%。兼容iPhone 15/16系列和安卓全系快充。折叠插脚便携不占空间，仅重35g轻松携带。智能温控保护芯片。',
        priceMin: 8.0, priceMax: 35.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: false,
        certifications: JSON.stringify(['CE', 'FCC', 'RoHS']),
        images: getImagePaths('数据线'),
        rating: 4.2, reviewCount: 12500,
      },
      {
        name: '三合一磁吸充电支架',
        description: '手机+手表+耳机三合一套装同时充电，磁吸快准稳。铝合金底座质感出色，防滑硅胶垫稳固不滑。支持iPhone/Apple Watch/AirPods全系产品。',
        priceMin: 22.0, priceMax: 88.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: false,
        images: getImagePaths('充电宝'),
        rating: 4.1, reviewCount: 7800,
      },
    ],
  },
  {
    nameZh: '深圳万物互联智能科技',
    nameEn: 'Shenzhen Wanwu IoT Smart Technology Co., Ltd.',
    location: '广东深圳 · 西丽',
    contactName: '赵德明',
    contactPhone: '159****3175',
    companyIntro: '物联网模组专业厂商，Nordic/ESP官方方案商，BLE/WiFi/LoRa全协议覆盖',
    yearEstablished: 2016, employeeCount: 130,
    annualExportRevenue: 450,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'FCC', 'RoHS', 'BLE SIG']),
    businessTags: JSON.stringify(['物联网', '智能家居', '传感器', '蓝牙模组', 'WiFi模组']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '印度']),
    rating: 4.5, reviewCount: 980, isVerified: true, type: 'factory',
    products: [
      {
        name: '蓝牙BLE 5.2模组 低功耗',
        description: 'Nordic nRF52840芯片方案，BLE 5.2超低功耗待机。TX发射功率+8dBm穿透力强，接收灵敏度-95dBm。支持Mesh组网，适用于IoT智能设备。',
        priceMin: 3.5, priceMax: 15.0, currency: 'CNY', moq: 1000,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'FCC', 'RoHS', 'BLE SIG']),
        rating: 4.6, reviewCount: 6500,
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════
  //  广州 — 服装/美妆/皮具 (10家)
  // ═════════════════════════════════════════════════════════════════════
  {
    nameZh: '广州新丝路服装有限公司',
    nameEn: 'Guangzhou New Silk Road Garment Co., Ltd.',
    location: '广东广州 · 海珠区',
    contactName: '陈伟杰',
    contactPhone: '138****2568',
    companyIntro: '广州十三行源头女装工厂，日产连衣裙3000件，快反7天出货，支持OEM/ODM',
    yearEstablished: 2005, employeeCount: 350,
    annualExportRevenue: 1800,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'Oeko-Tex Standard 100', 'GOTS']),
    businessTags: JSON.stringify(['女装', '连衣裙', '衬衫', '快时尚女装']),
    exportDestinations: JSON.stringify(['美国', '英国', '法国', '意大利', '澳大利亚', '中东']),
    rating: 4.6, reviewCount: 2750, isVerified: true, type: 'factory',
    products: [
      {
        name: '法式复古碎花连衣裙 中长款',
        description: '法式方领设计优雅复古，泡泡袖修饰手臂线条，收腰A字裙摆显瘦遮肉。面料为100%涤纶雪纺飘逸垂顺，内衬亲肤不扎人。多色可选尺码S-2XL。',
        priceMin: 32.0, priceMax: 128.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex']),
        images: getImagePaths('连衣裙'),
        rating: 4.7, reviewCount: 9200,
      },
      {
        name: '纯棉印花短袖T恤 女款',
        description: '100%精梳棉面料亲肤透气，240g重磅高克重挺括有型不松垮。宽松版型不挑身材，多色多印花图案可选。领口加固处理不易变形，机洗不起球。',
        priceMin: 15.0, priceMax: 69.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex']),
        images: getImagePaths('T恤'),
        rating: 4.5, reviewCount: 18500,
      },
    ],
  },
  {
    nameZh: '广州鼎盛运动服饰有限公司',
    nameEn: 'Guangzhou Dingsheng Sportswear Co., Ltd.',
    location: '广东广州 · 白云区',
    contactName: '黄志强',
    contactPhone: '139****7831',
    companyIntro: '专注运动瑜伽服饰研发生产，与Lululemon代工厂同级别工艺，弹力面料专业供应商',
    yearEstablished: 2013, employeeCount: 280,
    annualExportRevenue: 1100,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'Oeko-Tex']),
    businessTags: JSON.stringify(['运动服', '健身服', '瑜伽服', '运动套装']),
    exportDestinations: JSON.stringify(['美国', '加拿大', '英国', '德国', '澳大利亚']),
    rating: 4.7, reviewCount: 1580, isVerified: true, type: 'factory',
    products: [
      {
        name: '高弹力瑜伽运动套装 女款',
        description: '高弹锦纶+氨纶黄金配比面料，四向弹力随身体舒展。吸湿排汗速干科技保持干爽，高腰设计包裹性好不卷边。无缝编织工艺减少摩擦，支持LOGO定制。',
        priceMin: 38.0, priceMax: 128.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex']),
        images: getImagePaths('运动套装'),
        rating: 4.8, reviewCount: 11200,
      },
    ],
  },
  {
    nameZh: '广州宝贝天地童装厂',
    nameEn: 'Guangzhou Baby World Childrenswear Factory',
    location: '广东广州 · 番禺区',
    contactName: '周晓明',
    contactPhone: '137****4902',
    companyIntro: '专注0-6岁婴幼儿服装，A类标准面料无荧光剂，通过Oeko-Tex和GOTS双认证',
    yearEstablished: 2010, employeeCount: 200,
    annualExportRevenue: 700,
    certifications: JSON.stringify(['ISO 9001', 'Oeko-Tex Standard 100', 'ASTM', 'EN 14682']),
    businessTags: JSON.stringify(['童装', '婴幼儿服装', '儿童套装', '婴儿爬服']),
    exportDestinations: JSON.stringify(['美国', '欧盟', '日本', '韩国', '东南亚']),
    rating: 4.8, reviewCount: 2100, isVerified: true, type: 'factory',
    products: [
      {
        name: '纯棉婴儿连体爬服 3件套装',
        description: '100%有机棉A类面料，零甲醛无荧光剂，宝宝啃咬也放心。按扣设计方便穿脱换尿布，四季通用厚度适中。0-24个月全尺码，含3件不同花色。',
        priceMin: 22.0, priceMax: 68.0, currency: 'CNY', moq: 300,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex', 'GOTS']),
        images: getImagePaths('T恤'),
        rating: 4.9, reviewCount: 7800,
      },
    ],
  },
  {
    nameZh: '广州威盛箱包有限公司',
    nameEn: 'Guangzhou Weisheng Luggage Co., Ltd.',
    location: '广东广州 · 花都区',
    contactName: '吴建华',
    contactPhone: '136****6157',
    companyIntro: '广州花都皮具产业带标杆企业，意大利进口缝纫设备，日产箱包2000个',
    yearEstablished: 2010, employeeCount: 220,
    annualExportRevenue: 900,
    certifications: JSON.stringify(['ISO 9001', 'BSCI']),
    businessTags: JSON.stringify(['背包', '双肩包', '电脑包', '旅行包', '帆布包']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚']),
    rating: 4.5, reviewCount: 1700, isVerified: true, type: 'factory',
    products: [
      {
        name: '商务双肩背包 15.6寸电脑仓',
        description: '900D防水尼龙面料耐磨防泼水，独立电脑仓加厚保护垫缓震安全。USB外接充电口方便出行，防盗拉链设计保护财物安全。28L大容量满足通勤出差需求。',
        priceMin: 32.0, priceMax: 128.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        images: getImagePaths('收纳箱'),
        rating: 4.6, reviewCount: 7800,
      },
    ],
  },
  {
    nameZh: '广州美妆之源化妆品有限公司',
    nameEn: 'Guangzhou Meizhuang Zhiyuan Cosmetics Co., Ltd.',
    location: '广东广州 · 白云区',
    contactName: '郑永强',
    contactPhone: '158****3849',
    companyIntro: '白云区化妆品生产示范基地，GMPC十万级净化车间，配方研发能力突出服务50+品牌',
    yearEstablished: 2012, employeeCount: 180,
    annualExportRevenue: 650,
    certifications: JSON.stringify(['ISO 22716', 'GMPC', 'FDA', 'BSCI', 'SGS']),
    businessTags: JSON.stringify(['护肤品', '面膜', '洗面奶', '精华液', '化妆品代工']),
    exportDestinations: JSON.stringify(['美国', '日本', '韩国', '东南亚', '中东', '非洲']),
    rating: 4.5, reviewCount: 1400, isVerified: true, type: 'factory',
    products: [
      {
        name: '玻尿酸补水面膜 28ml 24片装',
        description: '三重玻尿酸配方（大分子+中分子+小分子），层层补水锁水直达肌底。蚕丝膜布轻薄透气完美服帖，28ml足量精华深度滋养。无酒精无色素敏感肌安心用。',
        priceMin: 12.0, priceMax: 48.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['FDA', 'SGS']),
        images: getImagePaths('面膜'),
        rating: 4.6, reviewCount: 21000,
      },
      {
        name: '氨基酸洗面奶 温和洁面 120g',
        description: '氨基酸表面活性剂配方，pH值5.5弱酸性亲肤不刺激。泡沫细腻丰富如云朵般绵密，洗后不紧绷不假滑。无皂基无SLS/SLES，所有肤质包括敏感肌适用。',
        priceMin: 8.0, priceMax: 35.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['FDA', 'SGS']),
        images: getImagePaths('护肤品'),
        rating: 4.5, reviewCount: 16800,
      },
    ],
  },
  {
    nameZh: '广州白云皮具实业有限公司',
    nameEn: 'Guangzhou Baiyun Leather Goods Industrial Co., Ltd.',
    location: '广东广州 · 白云区',
    contactName: '梁志强',
    contactPhone: '189****5027',
    companyIntro: '20年头层牛皮处理经验，意大利进口设备，日产箱包2000个，手工缝制工艺获SGS认证',
    yearEstablished: 2007, employeeCount: 260,
    annualExportRevenue: 1200,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'REACH', 'SGS']),
    businessTags: JSON.stringify(['皮具', '钱包', '手提包', '皮带', '真皮制品']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '中东']),
    rating: 4.4, reviewCount: 1900, isVerified: true, type: 'factory',
    products: [
      {
        name: '头层牛皮男士钱包 横款',
        description: '意大利进口头层牛皮，手工缝线工艺精细。多卡位+大钞位+相片位分区合理实用。超薄设计仅1.2cm厚度，放口袋不鼓包。精美礼盒包装送礼体面。',
        priceMin: 28.0, priceMax: 128.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['REACH', 'SGS']),
        images: getImagePaths('收纳箱'),
        rating: 4.5, reviewCount: 7500,
      },
      {
        name: 'PU女包 斜挎包 通勤款',
        description: '高档PU面料质感细腻媲美真皮，金属五金配件光泽持久不褪色。可拆卸肩带手提斜挎一包两用，隔层分区合理手机口红都有专属位。多色可选百搭通勤。',
        priceMin: 22.0, priceMax: 88.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        images: getImagePaths('收纳箱'),
        rating: 4.3, reviewCount: 12300,
      },
    ],
  },
  {
    nameZh: '广州时尚男装服饰有限公司',
    nameEn: 'Guangzhou Fashion Menwear Co., Ltd.',
    location: '广东广州 · 海珠区',
    contactName: '何伟强',
    contactPhone: '186****1394',
    companyIntro: '专注商务男装15年，版型精准品质稳定，与海澜之家/七匹狼等品牌深度合作',
    yearEstablished: 2011, employeeCount: 220,
    annualExportRevenue: 850,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'Oeko-Tex']),
    businessTags: JSON.stringify(['男装', '衬衫', '休闲裤', '夹克', 'POLO衫']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '中东', '南美']),
    rating: 4.5, reviewCount: 1300, isVerified: false, type: 'factory',
    products: [
      {
        name: '长袖牛津纺衬衫 男士商务休闲',
        description: '100%全棉牛津纺面料，透气亲肤不起球。经典纽扣领设计正式休闲两穿，胸前贴袋实用大方。多色可选满足不同搭配，S-4XL全尺码覆盖各种体型。',
        priceMin: 18.0, priceMax: 79.0, currency: 'CNY', moq: 300,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex']),
        images: getImagePaths('衬衫'),
        rating: 4.5, reviewCount: 9200,
      },
      {
        name: '男士休闲直筒裤 四季款',
        description: '棉涤混纺面料挺括有型不易起皱，中腰直筒版型修身不紧绷。经典五袋设计实用大方，适合通勤和日常休闲穿着。多色多码可选，四季皆宜。',
        priceMin: 22.0, priceMax: 89.0, currency: 'CNY', moq: 300,
        supportsDropShipping: true, supportsOEM: true,
        images: getImagePaths('牛仔裤'),
        rating: 4.4, reviewCount: 7800,
      },
    ],
  },
  {
    nameZh: '广州品尚内衣有限公司',
    nameEn: 'Guangzhou Pinshang Underwear Co., Ltd.',
    location: '广东广州 · 番禺区',
    contactName: '罗志明',
    contactPhone: '150****8276',
    companyIntro: '专注女士内衣研发生产15年，Oeko-Tex认证面料，日本进口缝纫设备精度高',
    yearEstablished: 2014, employeeCount: 150,
    annualExportRevenue: 500,
    certifications: JSON.stringify(['ISO 9001', 'Oeko-Tex', 'SGS']),
    businessTags: JSON.stringify(['内衣', '文胸', '内裤', '家居服', '保暖内衣']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '东南亚', '俄罗斯']),
    rating: 4.4, reviewCount: 980, isVerified: false, type: 'factory',
    products: [
      {
        name: '无钢圈舒适文胸 蕾丝款',
        description: '记忆合金软钢圈零束缚感，蕾丝拼接设计甜美精致。透气网布不闷热夏季也能穿，加宽侧比有效收副乳。A-D杯全覆盖，多色可选。',
        priceMin: 12.0, priceMax: 48.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex']),
        images: getImagePaths('睡衣'),
        rating: 4.5, reviewCount: 15600,
      },
    ],
  },
  {
    nameZh: '广州雅丽洁化妆品有限公司',
    nameEn: 'Guangzhou Yalijie Cosmetics Co., Ltd.',
    location: '广东广州 · 花都区',
    contactName: '陈伟杰',
    contactPhone: '152****4613',
    companyIntro: '专业彩妆代工厂，韩国调色师驻厂，月产口红50万支，FDA/SGS双认证',
    yearEstablished: 2015, employeeCount: 120,
    annualExportRevenue: 350,
    certifications: JSON.stringify(['ISO 22716', 'GMPC', 'FDA']),
    businessTags: JSON.stringify(['口红', '唇釉', '化妆品', '彩妆', '美妆']),
    exportDestinations: JSON.stringify(['美国', '东南亚', '中东', '非洲', '南美']),
    rating: 4.3, reviewCount: 680, isVerified: false, type: 'factory',
    products: [
      {
        name: '哑光丝绒唇釉 6色套装',
        description: '天鹅绒哑光质地一抹显色，高饱和度持久不脱色。含天然植物油脂滋润双唇不拔干不起皮，刷头精准勾勒唇形。6支热门色号套装满足日常到派对全场景。',
        priceMin: 8.0, priceMax: 38.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['FDA', 'SGS']),
        images: getImagePaths('口红'),
        rating: 4.3, reviewCount: 8900,
      },
    ],
  },
  {
    nameZh: '广州真功夫皮具护理品有限公司',
    nameEn: 'Guangzhou Zhengongfu Leather Care Products Co., Ltd.',
    location: '广东广州 · 黄埔区',
    contactName: '黄志强',
    contactPhone: '188****7295',
    companyIntro: '专业皮具护理产品制造商，天然蜂蜡配方，产品畅销欧美日韩市场',
    yearEstablished: 2016, employeeCount: 60,
    annualExportRevenue: 150,
    certifications: JSON.stringify(['ISO 9001', 'SGS']),
    businessTags: JSON.stringify(['皮具护理', '鞋油', '皮革清洁', '保养品']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚']),
    rating: 4.2, reviewCount: 350, isVerified: false, type: 'factory',
    products: [
      {
        name: '无色皮革保养油 去皱滋润 100ml',
        description: '天然蜂蜡+貂油珍贵配方，深层滋养皮革纤维。无色通用所有颜色皮具都能用，去皱增亮效果显著。定期使用可延长皮具寿命2-3年，100ml容量耐用。',
        priceMin: 5.0, priceMax: 22.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['SGS']),
        rating: 4.3, reviewCount: 4500,
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════
  //  东莞 — 电子/小家电/五金 (8家)
  // ═════════════════════════════════════════════════════════════════════
  {
    nameZh: '东莞嘉华智能电子有限公司',
    nameEn: 'Dongguan Jiahua Smart Electronics Co., Ltd.',
    location: '广东东莞 · 长安镇',
    contactName: '邓志坚',
    contactPhone: '135****6482',
    companyIntro: '东莞长安镇电子制造标杆企业，35000m2现代化厂房，与Philips/松下等品牌长期合作',
    yearEstablished: 2008, employeeCount: 520,
    annualExportRevenue: 1500,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'CE', 'CB', 'RoHS', 'REACH']),
    businessTags: JSON.stringify(['智能家居', '小家电', '空气炸锅', '料理机', '加湿器']),
    exportDestinations: JSON.stringify(['美国', '德国', '法国', '英国', '日本', '澳大利亚']),
    rating: 4.6, reviewCount: 1890, isVerified: true, type: 'factory',
    products: [
      {
        name: '智能空气炸锅 5.5L 可视窗口',
        description: '5.5L大容量满足全家需求，1200W大火力均匀加热。可视化玻璃窗口随时观察食物状态，12种智能菜单一键烹饪。触摸+旋钮双操控方式，不粘涂层内胆易清洗。',
        priceMin: 95.0, priceMax: 258.0, currency: 'CNY', moq: 50,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'CB', 'RoHS', 'LFGB']),
        images: getImagePaths('厨房'),
        rating: 4.7, reviewCount: 6800,
      },
      {
        name: '便携式USB-C充电榨汁机 400ml',
        description: '400ml容量一杯刚好，USB-C充电无线便携户外也能用。食品级Tritan材质安全不含BPA，304不锈钢刀头锋利耐用。满电可榨15杯果汁，30秒鲜榨即饮。',
        priceMin: 32.0, priceMax: 88.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'FDA', 'RoHS']),
        images: getImagePaths('保温杯'),
        rating: 4.5, reviewCount: 15300,
      },
    ],
  },
  {
    nameZh: '东莞鸿泰数码科技有限公司',
    nameEn: 'Dongguan Hongtai Digital Technology Co., Ltd.',
    location: '广东东莞 · 虎门镇',
    contactName: '黄国平',
    contactPhone: '159****3175',
    companyIntro: '手机配件专业制造商，年产量超5000万件，产品远销欧美东南亚市场',
    yearEstablished: 2016, employeeCount: 180,
    annualExportRevenue: 600,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'RoHS']),
    businessTags: JSON.stringify(['手机壳', '手机配件', '平板配件', '3C数码']),
    exportDestinations: JSON.stringify(['美国', '英国', '日本', '东南亚', '中东']),
    rating: 4.4, reviewCount: 960, isVerified: false, type: 'factory',
    products: [
      {
        name: '液态硅胶手机壳 全包防摔',
        description: '液态硅胶材质手感亲肤如婴儿肌肤般细腻，全包边设计保护周全。镜头增高保护避免磨损，支持MagSafe磁吸充电。适用iPhone 15/16全系列，多色可选。',
        priceMin: 8.5, priceMax: 28.0, currency: 'CNY', moq: 300,
        supportsDropShipping: true, supportsOEM: true,
        images: getImagePaths('手机壳'),
        rating: 4.4, reviewCount: 28600,
      },
    ],
  },
  {
    nameZh: '东莞铭丰五金制品有限公司',
    nameEn: 'Dongguan Mingfeng Hardware Products Co., Ltd.',
    location: '广东东莞 · 大岭山镇',
    contactName: '冯伟明',
    contactPhone: '187****8036',
    companyIntro: '精密五金制造专家，日本进口CNC设备50台，精度达0.01mm，IATF16949认证',
    yearEstablished: 2005, employeeCount: 380,
    annualExportRevenue: 1300,
    certifications: JSON.stringify(['ISO 9001', 'ISO 14001', 'IATF 16949', 'SGS']),
    businessTags: JSON.stringify(['五金冲压', '精密五金', '模具制造', 'CNC加工', '金属配件']),
    exportDestinations: JSON.stringify(['美国', '德国', '日本', '墨西哥', '东南亚']),
    rating: 4.5, reviewCount: 1600, isVerified: true, type: 'factory',
    products: [
      {
        name: '精密五金冲压件 按图定制',
        description: '0.1-6.0mm金属板材精密冲压，精度控制在±0.05mm以内。含连续模和工程模两种方案，材料可选不锈钢/镀锌板/铝板/铜板。支持来图来样定制。',
        priceMin: 0.5, priceMax: 8.0, currency: 'CNY', moq: 10000,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['IATF 16949', 'SGS']),
        rating: 4.6, reviewCount: 4200,
      },
    ],
  },
  {
    nameZh: '东莞东城小霸王电器有限公司',
    nameEn: 'Dongguan Dongcheng Xiaobawang Electric Co., Ltd.',
    location: '广东东莞 · 石碣镇',
    contactName: '何建国',
    contactPhone: '133****5729',
    companyIntro: '专注小家电ODM18年，自有注塑/组装/检测全链条产线，年产值超2亿',
    yearEstablished: 2010, employeeCount: 250,
    annualExportRevenue: 800,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'CB', 'RoHS', 'CCC']),
    businessTags: JSON.stringify(['小家电', '电饭煲', '电煮锅', '养生壶', '便携小锅']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '南美', '中东']),
    rating: 4.5, reviewCount: 1100, isVerified: false, type: 'factory',
    products: [
      {
        name: '多功能电煮锅 2L 蒸煮炒一体',
        description: '2L容量一人食或两人份刚好，600W功率加热快省电。食品级不粘涂层内胆煎蛋不粘锅，分离式电源线好收纳。配不锈钢蒸笼，蒸煮炒涮多功能一锅搞定。',
        priceMin: 25.0, priceMax: 78.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'CB', 'RoHS', 'CCC']),
        images: getImagePaths('厨房'),
        rating: 4.5, reviewCount: 12000,
      },
      {
        name: '迷你电饭煲 1.2L 一人食',
        description: '1.2L小容量专为1-2人设计，食品级不粘内胆米饭不糊底。智能预约功能早起有粥喝，煮饭/煮粥/煲汤/保温四合一。小巧不占厨房空间，一人食神器。',
        priceMin: 22.0, priceMax: 68.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'CB', 'CCC']),
        images: getImagePaths('厨房'),
        rating: 4.4, reviewCount: 9800,
      },
    ],
  },
  {
    nameZh: '东莞华阳电声科技有限公司',
    nameEn: 'Dongguan Huayang Electroacoustic Technology Co., Ltd.',
    location: '广东东莞 · 塘厦镇',
    contactName: '朱国栋',
    contactPhone: '151****9641',
    companyIntro: '电声元器件专业制造商，拥有独立消音室，喇叭月产能200万只出口全球',
    yearEstablished: 2012, employeeCount: 300,
    annualExportRevenue: 900,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'RoHS', 'REACH']),
    businessTags: JSON.stringify(['喇叭', '扬声器', '音响配件', '电声元件', 'PA喇叭']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '印度']),
    rating: 4.4, reviewCount: 850, isVerified: false, type: 'factory',
    products: [
      {
        name: '全频喇叭 3寸 20W 蓝牙音箱专用',
        description: '钕磁铁强力驱动，20W额定功率输出强劲。全频段响应80Hz-20kHz覆盖人耳全部范围，阻抗4Ω/8Ω可选适配不同方案。适用于蓝牙音箱/智能音箱/户外音响。',
        priceMin: 3.0, priceMax: 12.0, currency: 'CNY', moq: 1000,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'RoHS']),
        rating: 4.5, reviewCount: 7200,
      },
    ],
  },
  {
    nameZh: '东莞金泰精密五金有限公司',
    nameEn: 'Dongguan Jintai Precision Hardware Co., Ltd.',
    location: '广东东莞 · 长安镇',
    contactName: '徐伟良',
    contactPhone: '138****2568',
    companyIntro: '螺丝紧固件专业厂家，日产500万颗，规格齐全支持非标定制服务',
    yearEstablished: 2009, employeeCount: 200,
    annualExportRevenue: 600,
    certifications: JSON.stringify(['ISO 9001', 'ISO 14001', 'SGS']),
    businessTags: JSON.stringify(['螺丝', '螺母', '紧固件', '车削件', 'CNC精密加工']),
    exportDestinations: JSON.stringify(['美国', '德国', '日本', '意大利', '东南亚']),
    rating: 4.5, reviewCount: 920, isVerified: false, type: 'factory',
    products: [
      {
        name: '304不锈钢螺丝 精密紧固件 M3-M12',
        description: 'A2-70 304不锈钢材质耐腐蚀高强度不生锈。M3-M12多规格覆盖常用范围，长度6-100mm可选。支持非标定制和表面处理（镀锌/镀镍/发黑）。',
        priceMin: 0.02, priceMax: 0.8, currency: 'CNY', moq: 50000,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['SGS', 'RoHS']),
        rating: 4.5, reviewCount: 5800,
      },
    ],
  },
  {
    nameZh: '东莞创元电子科技有限公司',
    nameEn: 'Dongguan Chuangyuan Electronics Technology Co., Ltd.',
    location: '广东东莞 · 寮步镇',
    contactName: '曾志伟',
    contactPhone: '139****7831',
    companyIntro: '开关电源专业制造商，六级能效标准，产品通过UL/CE双认证畅销欧美',
    yearEstablished: 2013, employeeCount: 160,
    annualExportRevenue: 500,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'RoHS', 'UL']),
    businessTags: JSON.stringify(['开关电源', '电源适配器', '充电器', '电源方案']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '澳大利亚', '巴西']),
    rating: 4.3, reviewCount: 720, isVerified: false, type: 'factory',
    products: [
      {
        name: '电源适配器 12V 2A 带UL认证',
        description: '输入100-240V宽电压全球通用，输出12V 2A稳定供电。六级能效标准待机功耗低于0.1W省电环保，过流/过压/短路三重保护安全放心。通过UL认证。',
        priceMin: 5.0, priceMax: 18.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'UL', 'RoHS']),
        rating: 4.3, reviewCount: 8500,
      },
    ],
  },
  {
    nameZh: '东莞幸福小家电有限公司',
    nameEn: 'Dongguan Xingfu Small Appliances Co., Ltd.',
    location: '广东东莞 · 厚街镇',
    contactName: '赖志明',
    contactPhone: '137****4902',
    companyIntro: '环境小家电专业制造商，加湿器/香薰机月销10万+，静音技术行业领先',
    yearEstablished: 2011, employeeCount: 220,
    annualExportRevenue: 750,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'CE', 'CB', 'RoHS']),
    businessTags: JSON.stringify(['加湿器', '香薰机', '电暖器', '除湿机', '个人护理']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '韩国', '日本', '东南亚']),
    rating: 4.4, reviewCount: 1050, isVerified: true, type: 'factory',
    products: [
      {
        name: '超声波香薰加湿器 500ml',
        description: '500ml大容量持续加湿一整晚不用加水，可添加精油一机两用。超声波雾化片纳米级细雾不湿桌面，静音运行≤25dB睡眠不打扰。缺水自动断电安心放心。',
        priceMin: 18.0, priceMax: 58.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'CB', 'RoHS']),
        images: getImagePaths('保温杯'),
        rating: 4.5, reviewCount: 11000,
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════
  //  佛山 — 家具/家电/建材 (8家)
  // ═════════════════════════════════════════════════════════════════════
  {
    nameZh: '佛山顺德名匠家具有限公司',
    nameEn: 'Foshan Shunde Mingjiang Furniture Co., Ltd.',
    location: '广东佛山 · 顺德区',
    contactName: '区伟雄',
    contactPhone: '136****6157',
    companyIntro: '佛山顺德老牌家具厂，30000m2生产基地，实木/板式/软体全品类，远销40多国',
    yearEstablished: 2003, employeeCount: 420,
    annualExportRevenue: 2500,
    certifications: JSON.stringify(['ISO 9001', 'ISO 14001', 'CARB P2', 'FSC']),
    businessTags: JSON.stringify(['客厅家具', '沙发', '茶几', '电视柜', '实木家具']),
    exportDestinations: JSON.stringify(['美国', '加拿大', '英国', '德国', '中东', '东南亚']),
    rating: 4.5, reviewCount: 3420, isVerified: true, type: 'factory',
    products: [
      {
        name: '现代简约布艺沙发 三人位',
        description: '高密度海绵座包回弹性好不易塌陷，羽绒靠包柔软舒适如坐云端。棉麻面料透气亲肤可拆洗，实木框架+蛇形弹簧稳固耐用。多色可选尺寸支持定制。',
        priceMin: 680.0, priceMax: 3999.0, currency: 'CNY', moq: 10,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CARB P2']),
        images: getImagePaths('沙发'),
        rating: 4.5, reviewCount: 3200,
      },
      {
        name: '轻奢岩板茶几 1.3m',
        description: '12mm厚进口岩板台面，莫氏硬度7级耐刮耐热耐渗透。碳素钢框架+电镀工艺稳固不生锈，带抽屉储物功能实用。尺寸1300×700×450mm适合大小客厅。',
        priceMin: 380.0, priceMax: 1280.0, currency: 'CNY', moq: 20,
        supportsDropShipping: false, supportsOEM: true,
        images: getImagePaths('餐桌'),
        rating: 4.6, reviewCount: 2100,
      },
    ],
  },
  {
    nameZh: '佛山晚安家居有限公司',
    nameEn: "Foshan Wan'an Home Furnishing Co., Ltd.",
    location: '广东佛山 · 南海区',
    contactName: '谭国华',
    contactPhone: '158****3849',
    companyIntro: '专业床具制造商20年，天然乳胶+独立袋装弹簧核心技术，CertiPUR-US认证',
    yearEstablished: 2007, employeeCount: 350,
    annualExportRevenue: 1600,
    certifications: JSON.stringify(['ISO 9001', 'CertiPUR-US', 'OEKO-TEX', 'CFR 1633']),
    businessTags: JSON.stringify(['床垫', '床架', '床头柜', '卧室家具', '乳胶床垫']),
    exportDestinations: JSON.stringify(['美国', '加拿大', '澳大利亚', '日本', '东南亚', '欧洲']),
    rating: 4.6, reviewCount: 2890, isVerified: true, type: 'factory',
    products: [
      {
        name: '天然乳胶床垫 22cm 含弹簧',
        description: '5cm天然乳胶层抗菌防螨+独立袋装弹簧静音抗干扰+高密度海绵支撑。软硬适中贴合脊椎，7区支撑设计科学护脊。可卷包发货方便入户，透气面料不闷热。',
        priceMin: 580.0, priceMax: 2888.0, currency: 'CNY', moq: 10,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CertiPUR-US', 'OEKO-TEX']),
        images: getImagePaths('枕头'),
        rating: 4.7, reviewCount: 5600,
      },
    ],
  },
  {
    nameZh: '佛山宏陶陶瓷有限公司',
    nameEn: 'Foshan Hongtao Ceramics Co., Ltd.',
    location: '广东佛山 · 禅城区',
    contactName: '何伟文',
    contactPhone: '189****5027',
    companyIntro: '佛山陶瓷产业带龙头企业，4条全自动生产线日产能50000m2，工程案例遍布全国',
    yearEstablished: 2004, employeeCount: 480,
    annualExportRevenue: 2200,
    certifications: JSON.stringify(['ISO 9001', 'ISO 14001', 'CE', '3C', 'Green Label']),
    businessTags: JSON.stringify(['瓷砖', '地砖', '墙砖', '大板', '薄板', '岩板']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '中东', '韩国', '澳大利亚']),
    rating: 4.5, reviewCount: 2600, isVerified: true, type: 'factory',
    products: [
      {
        name: '通体大理石瓷砖 800x800mm',
        description: '一石多面设计纹理自然不重复，天然大理石逼真质感。通体坯表里如一倒角不露白，莫氏硬度7级耐磨防滑。适合客厅/餐厅/商业空间等地面铺贴。',
        priceMin: 28.0, priceMax: 88.0, currency: 'CNY', moq: 300,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', '3C']),
        rating: 4.6, reviewCount: 3200,
      },
    ],
  },
  {
    nameZh: '佛山联邦家私集团有限公司',
    nameEn: 'Foshan Landbond Furniture Group Co., Ltd.',
    location: '广东佛山 · 南海区',
    contactName: '梁永康',
    contactPhone: '186****1394',
    companyIntro: '中国办公家具领军企业，BIFMA认证，产品服务于世界500强企业及五星级酒店',
    yearEstablished: 2000, employeeCount: 600,
    annualExportRevenue: 3500,
    certifications: JSON.stringify(['ISO 9001', 'ISO 14001', 'CARB P2', 'FSC', 'BIFMA']),
    businessTags: JSON.stringify(['办公家具', '酒店家具', '定制家具', '板式家具', '软体家具']),
    exportDestinations: JSON.stringify(['美国', '英国', '德国', '法国', '中东', '新加坡']),
    rating: 4.7, reviewCount: 4100, isVerified: true, type: 'factory',
    products: [
      {
        name: '人体工学办公椅 网布透气',
        description: '高弹力网布靠背透气不闷汗久坐也清爽。3D可调扶手适应各种坐姿，腰靠支撑可调精准托腰。承重150kg稳固耐用，SGS认证气压棒安全有保障。',
        priceMin: 180.0, priceMax: 680.0, currency: 'CNY', moq: 20,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['BIFMA', 'SGS']),
        rating: 4.7, reviewCount: 4500,
      },
    ],
  },
  {
    nameZh: '佛山日丰管业科技有限公司',
    nameEn: 'Foshan Rifeng Pipe Technology Co., Ltd.',
    location: '广东佛山 · 三水区',
    contactName: '关志伟',
    contactPhone: '150****8276',
    companyIntro: '塑料管道行业领先品牌，北欧化工PPR原料，50年质保承诺行业标杆',
    yearEstablished: 2006, employeeCount: 350,
    annualExportRevenue: 1400,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'WRAS', 'NSF', 'SKZ']),
    businessTags: JSON.stringify(['PPR管', 'PVC管', '管道系统', '卫浴五金', '水暖配件']),
    exportDestinations: JSON.stringify(['美国', '英国', '德国', '澳大利亚', '中东', '东南亚']),
    rating: 4.5, reviewCount: 1800, isVerified: true, type: 'factory',
    products: [
      {
        name: 'PPR冷热水管 25mm 家装管',
        description: '北欧化工PPR纯原料品质有保障，S2.5压力等级适合家用水管。耐高温95°C热水管可用，承压25kg安全可靠。50年质保放心使用，配同品牌管件直通弯头。',
        priceMin: 3.5, priceMax: 12.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: false,
        certifications: JSON.stringify(['CE', 'WRAS', 'NSF']),
        rating: 4.6, reviewCount: 6800,
      },
    ],
  },
  {
    nameZh: '佛山艾斐堡智能家居有限公司',
    nameEn: 'Foshan Afibao Smart Home Co., Ltd.',
    location: '广东佛山 · 顺德区',
    contactName: '卢伟明',
    contactPhone: '152****4613',
    companyIntro: '智能门锁新锐品牌，3D结构光人脸识别技术领先，支付级安全认证',
    yearEstablished: 2015, employeeCount: 140,
    annualExportRevenue: 400,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'FCC', 'RoHS']),
    businessTags: JSON.stringify(['智能门锁', '指纹锁', '智能家居', '门禁系统']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '中东', '澳大利亚']),
    rating: 4.3, reviewCount: 780, isVerified: false, type: 'factory',
    products: [
      {
        name: '3D人脸识别智能门锁 全自动',
        description: '3D结构光人脸识别达到支付级安全标准，黑暗环境也能精准识别。指纹/密码/IC卡/钥匙/远程临时密码六种开锁方式。全自动锁体开门即解锁无需推拉。',
        priceMin: 180.0, priceMax: 580.0, currency: 'CNY', moq: 30,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'FCC', 'RoHS']),
        rating: 4.3, reviewCount: 3800,
      },
    ],
  },
  {
    nameZh: '佛山美菱冷暖设备有限公司',
    nameEn: 'Foshan Meiling HVAC Equipment Co., Ltd.',
    location: '广东佛山 · 高明区',
    contactName: '崔国良',
    contactPhone: '188****7295',
    companyIntro: '移动空调专业制造商，产品通过UL/CE认证，出口欧美市场超15年',
    yearEstablished: 2008, employeeCount: 280,
    annualExportRevenue: 1100,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'UL', 'RoHS', 'ERP']),
    businessTags: JSON.stringify(['风扇', '取暖器', '空调扇', '移动空调', '除湿机']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '中东', '非洲']),
    rating: 4.4, reviewCount: 1350, isVerified: true, type: 'factory',
    products: [
      {
        name: '冷暖两用移动空调 9000BTU',
        description: '9000BTU制冷量快速降温，冷暖两用四季皆宜。免安装插电即用无需专业施工，排热管排出窗外即可。遥控控制方便操作，24小时定时节能省电。',
        priceMin: 280.0, priceMax: 880.0, currency: 'CNY', moq: 30,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'UL', 'ERP']),
        rating: 4.4, reviewCount: 2600,
      },
    ],
  },
  {
    nameZh: '佛山美居乐家具配件有限公司',
    nameEn: 'Foshan Meijule Furniture Accessories Co., Ltd.',
    location: '广东佛山 · 顺德龙江',
    contactName: '潘志强',
    contactPhone: '135****6482',
    companyIntro: '家具五金配件专业供应商，产品覆盖沙发脚/功能支架等，服务珠三角200+家具厂',
    yearEstablished: 2010, employeeCount: 120,
    annualExportRevenue: 350,
    certifications: JSON.stringify(['ISO 9001', 'SGS']),
    businessTags: JSON.stringify(['家具配件', '沙发脚', '五金脚', '功能支架', '转盘']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '南美']),
    rating: 4.3, reviewCount: 620, isVerified: false, type: 'factory',
    products: [
      {
        name: '不锈钢沙发脚 金属家具腿 8cm高',
        description: '201不锈钢拉丝表面质感出色不易生锈，承重200kg稳重不摇晃。带防滑脚垫保护地板不刮花，规格有8cm/10cm/12cm/15cm多种高度可选。',
        priceMin: 2.0, priceMax: 8.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        rating: 4.3, reviewCount: 4800,
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════
  //  义乌 — 小商品/饰品/文具/玩具 (12家)
  // ═════════════════════════════════════════════════════════════════════
  {
    nameZh: '义乌宏盛日用百货有限公司',
    nameEn: 'Yiwu Hongsheng Daily Necessities Co., Ltd.',
    location: '浙江义乌 · 国际商贸城',
    contactName: '楼伟明',
    contactPhone: '159****3175',
    companyIntro: '义乌国际商贸城驻点工厂，SKU超2000个，支持混批一件代发，日处理订单3000+',
    yearEstablished: 2009, employeeCount: 160,
    annualExportRevenue: 900,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'FDA']),
    businessTags: JSON.stringify(['收纳用品', '厨房用品', '家居日用', '塑料制品']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '南美', '中东', '非洲']),
    rating: 4.7, reviewCount: 4500, isVerified: true, type: 'factory',
    products: [
      {
        name: '可折叠硅胶收纳盒 多功能',
        description: '食品级铂金硅胶材质安全无毒，可折叠收纳节省空间。微波炉/洗碗机/烤箱通用耐高温。1.2L/2.5L/4L多规格组合，厨房/浴室/冰箱都能用。',
        priceMin: 12.0, priceMax: 45.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['FDA', 'LFGB']),
        images: getImagePaths('收纳盒'),
        rating: 4.6, reviewCount: 9200,
      },
      {
        name: '不锈钢保温饭盒 三层 1.5L',
        description: '304不锈钢内胆食品级安全，真空双层保温锁温6小时以上。三层分隔设计饭菜汤分装不串味，配便携布袋方便携带。适合上班族/学生/户外带饭。',
        priceMin: 28.0, priceMax: 68.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['FDA', 'LFGB']),
        images: getImagePaths('保温杯'),
        rating: 4.5, reviewCount: 7800,
      },
    ],
  },

  {
    nameZh: '义乌鑫艺饰品有限公司',
    nameEn: 'Yiwu Xinyi Jewelry Co., Ltd.',
    location: '浙江义乌 · 廿三里',
    contactName: '金国平',
    contactPhone: '187****8036',
    companyIntro: '义乌饰品产业带源头工厂，韩国设计团队加持，月出新品100+，支持混批',
    yearEstablished: 2014, employeeCount: 120,
    annualExportRevenue: 500,
    certifications: JSON.stringify(['BSCI', 'REACH', '加州65']),
    businessTags: JSON.stringify(['饰品', '首饰', '项链', '耳环', '手链', '发饰']),
    exportDestinations: JSON.stringify(['美国', '英国', '法国', '意大利', '巴西', '中东']),
    rating: 4.4, reviewCount: 1800, isVerified: false, type: 'factory',
    products: [
      {
        name: '韩国风极简锁骨链 钛钢不掉色',
        description: '316L钛钢材质医用级防过敏，真空电镀工艺色泽持久不掉色。可接触水洗澡游泳不用摘，星月/圆牌/字母多款可选。独立OPP袋包装方便批发分货。',
        priceMin: 3.5, priceMax: 12.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['REACH']),
        images: getImagePaths('颈链'),
        rating: 4.5, reviewCount: 32000,
      },
      {
        name: '醋酸发夹 鲨鱼夹 大号',
        description: '进口醋酸板材环保无害，手工打磨温润光泽不伤发质。大号鲨鱼夹设计轻松夹住全部头发，多色多纹理可选（玳瑁/大理石/纯色）。B2B批发价超低。',
        priceMin: 2.8, priceMax: 8.5, currency: 'CNY', moq: 1000,
        supportsDropShipping: true, supportsOEM: true,
        rating: 4.3, reviewCount: 15400,
      },
    ],
  },
  {
    nameZh: '义乌博文书具有限公司',
    nameEn: 'Yiwu Bowen Stationery Co., Ltd.',
    location: '浙江义乌 · 上溪镇',
    contactName: '毛伟强',
    contactPhone: '133****5729',
    companyIntro: '专业文具制造商15年，拥有完整印刷/装订生产线，产品出口日韩欧美市场',
    yearEstablished: 2011, employeeCount: 90,
    annualExportRevenue: 350,
    certifications: JSON.stringify(['ISO 9001', 'EN71', 'ASTM D4236']),
    businessTags: JSON.stringify(['文具', '笔记本', '笔类', '办公用品', '手账']),
    exportDestinations: JSON.stringify(['美国', '日本', '韩国', '欧洲', '东南亚']),
    rating: 4.5, reviewCount: 1200, isVerified: false, type: 'factory',
    products: [
      {
        name: 'A5 PU软皮笔记本 方格内页 192页',
        description: '仿皮封面手感细腻有质感，80g无酸纸方格内页不透墨不渗墨。含书签带和笔插设计方便实用，可定制LOGO烫金工艺。192页厚本经久耐用。',
        priceMin: 6.5, priceMax: 22.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        rating: 4.5, reviewCount: 6500,
      },
    ],
  },
  {
    nameZh: '义乌多彩文具礼品有限公司',
    nameEn: 'Yiwu Duocai Stationery & Gifts Co., Ltd.',
    location: '浙江义乌 · 稠江街道',
    contactName: '陈永良',
    contactPhone: '151****9641',
    companyIntro: '美术文具专业生产商，食品级颜料配方安全无毒，产品通过EN71/CE双认证',
    yearEstablished: 2012, employeeCount: 100,
    annualExportRevenue: 380,
    certifications: JSON.stringify(['ISO 9001', 'EN71', 'ASTM D4236', 'CE']),
    businessTags: JSON.stringify(['文具', '办公用品', '美术用品', '礼品', '派对用品']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '东南亚', '南美', '中东']),
    rating: 4.4, reviewCount: 980, isVerified: false, type: 'factory',
    products: [
      {
        name: '水彩笔套装 48色 可水洗',
        description: '食品级颜料配方安全无毒无异味，水洗配方弄脏衣服一洗就掉。纤维笔头出水均匀绘画流畅，48色铁盒装收纳方便送礼自用皆宜。',
        priceMin: 6.0, priceMax: 22.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['EN71', 'ASTM D4236', 'CE']),
        rating: 4.4, reviewCount: 12000,
      },
      {
        name: '创意礼品包装纸 10张套装',
        description: '120g高档彩牛纸质感厚实，双面印花设计精美。10张/套含多种花色组合搭配，配同色系丝带提升档次。适合生日/节日/圣诞礼品包装。',
        priceMin: 3.0, priceMax: 10.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        rating: 4.3, reviewCount: 8500,
      },
    ],
  },
  {
    nameZh: '义乌盛达玩具进出口有限公司',
    nameEn: 'Yiwu Shengda Toy Import & Export Co., Ltd.',
    location: '浙江义乌 · 北苑街道',
    contactName: '傅志华',
    contactPhone: '138****2568',
    companyIntro: '玩具出口贸易商，年出口额600万美元，产品通过EN71/ASTM F963认证畅销全球',
    yearEstablished: 2010, employeeCount: 80,
    annualExportRevenue: 600,
    certifications: JSON.stringify(['EN71', 'ASTM F963', 'CE', 'CCC']),
    businessTags: JSON.stringify(['玩具', '儿童玩具', '派对玩具', '泡泡机', '水枪']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '南美', '中东', '非洲']),
    rating: 4.3, reviewCount: 1500, isVerified: false, type: 'distributor',
    products: [
      {
        name: '电动泡泡机 自动出泡 带8瓶泡泡液',
        description: '电动旋转出泡120孔大转盘泡泡量超足，一次加液连续出泡30分钟不停。配8瓶补充液超值套装，内含充电电池循环使用。彩盒包装送礼体面。',
        priceMin: 5.0, priceMax: 22.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: false,
        certifications: JSON.stringify(['EN71', 'ASTM F963', 'CCC']),
        images: getImagePaths('益智'),
        rating: 4.2, reviewCount: 18500,
      },
    ],
  },
  {
    nameZh: '义乌金城饰品有限公司',
    nameEn: 'Yiwu Jincheng Jewelry Co., Ltd.',
    location: '浙江义乌 · 佛堂镇',
    contactName: '方伟建',
    contactPhone: '139****7831',
    companyIntro: '专注时尚饰品15年，拥有真空电镀/点钻全套工艺，月出新品100+引领潮流',
    yearEstablished: 2013, employeeCount: 150,
    annualExportRevenue: 450,
    certifications: JSON.stringify(['BSCI', 'REACH', 'SGS']),
    businessTags: JSON.stringify(['饰品', '耳环', '戒指', '手链', '头饰', '婚礼饰品']),
    exportDestinations: JSON.stringify(['美国', '英国', '法国', '意大利', '西班牙', '巴西']),
    rating: 4.3, reviewCount: 1300, isVerified: false, type: 'factory',
    products: [
      {
        name: '925银针耳环 极简几何多款混批',
        description: 'S925银针防过敏安心佩戴，锆石微镶工艺闪耀点缀。极简几何设计百搭日常，多款可选支持混批搭配。独立卡纸包装每对独立展示，批发分货方便。',
        priceMin: 2.5, priceMax: 10.0, currency: 'CNY', moq: 1000,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['REACH', 'SGS']),
        rating: 4.3, reviewCount: 28000,
      },
      {
        name: '韩版发圈 大肠发圈 多色混批',
        description: '真丝缎面光泽高级触感柔滑，弹力橡筋耐用不易松弛。大号蓬松款扎出韩剧女主同款效果，多色混批每包100个。SGS认证品质有保障。',
        priceMin: 1.0, priceMax: 5.0, currency: 'CNY', moq: 2000,
        supportsDropShipping: true, supportsOEM: true,
        rating: 4.2, reviewCount: 35000,
      },
    ],
  },
  {
    nameZh: '义乌祥和日化有限公司',
    nameEn: 'Yiwu Xianghe Daily Chemical Co., Ltd.',
    location: '浙江义乌 · 义亭镇',
    contactName: '龚国荣',
    contactPhone: '137****4902',
    companyIntro: '日化清洁用品专业生产商，8倍浓缩配方核心技术，产品远销中东非洲市场',
    yearEstablished: 2010, employeeCount: 110,
    annualExportRevenue: 320,
    certifications: JSON.stringify(['ISO 9001', 'FDA', 'SGS']),
    businessTags: JSON.stringify(['日化用品', '清洁用品', '洗衣液', '洗洁精', '洗手液']),
    exportDestinations: JSON.stringify(['美国', '中东', '非洲', '东南亚', '南美']),
    rating: 4.2, reviewCount: 720, isVerified: false, type: 'factory',
    products: [
      {
        name: '浓缩洗衣凝珠 15gx100颗',
        description: '8倍浓缩配方一粒洗净整桶衣物，清洁/柔顺/留香/除菌四效合一。水溶性膜遇水即溶无残留，15g大颗用量超省。独立防潮桶装保持干燥不粘连。',
        priceMin: 8.0, priceMax: 28.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['FDA', 'SGS']),
        rating: 4.3, reviewCount: 16000,
      },
    ],
  },
  {
    nameZh: '义乌佳和箱包有限公司',
    nameEn: 'Yiwu Jiahe Luggage Co., Ltd.',
    location: '浙江义乌 · 江东街道',
    contactName: '童志坚',
    contactPhone: '136****6157',
    companyIntro: '拉杆箱专业制造商，100%纯PC材质，TSA海关锁标配，年出口额450万美元',
    yearEstablished: 2011, employeeCount: 130,
    annualExportRevenue: 450,
    certifications: JSON.stringify(['ISO 9001', 'BSCI']),
    businessTags: JSON.stringify(['箱包', '旅行箱', '拉杆箱', '化妆箱', '塑料箱']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '中东', '非洲']),
    rating: 4.3, reviewCount: 1100, isVerified: false, type: 'factory',
    products: [
      {
        name: 'PC拉杆箱 20寸 登机箱',
        description: '100%纯PC材质轻韧抗摔耐冲击，双排8轮静音万向轮推拉顺滑无噪音。TSA海关锁通关无忧，铝合金拉杆三档调节适配不同身高。20寸可登机免托运。',
        priceMin: 42.0, priceMax: 128.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        rating: 4.4, reviewCount: 7800,
      },
    ],
  },
  {
    nameZh: '义乌创艺工艺品有限公司',
    nameEn: 'Yiwu Chuangyi Crafts Co., Ltd.',
    location: '浙江义乌 · 后宅街道',
    contactName: '楼伟明',
    contactPhone: '158****3849',
    companyIntro: '节日装饰品和仿真花艺专业供应商，产品畅销欧美，支持来样定制',
    yearEstablished: 2015, employeeCount: 70,
    annualExportRevenue: 200,
    certifications: JSON.stringify(['EN71', 'CE']),
    businessTags: JSON.stringify(['工艺品', '节日装饰', '圣诞用品', '家居摆件', '花艺']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '中东', '南美', '东南亚']),
    rating: 4.2, reviewCount: 550, isVerified: false, type: 'factory',
    products: [
      {
        name: '仿真花束 混搭花艺 家居装饰',
        description: 'PE+绢布材质仿真度极高，含玫瑰/绣球/尤加利叶等多品种搭配。无需浇水打理常年如新不会凋谢。适合家居/酒店/婚礼场景装饰，多色可选。',
        priceMin: 3.5, priceMax: 18.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE']),
        rating: 4.3, reviewCount: 6200,
      },
      {
        name: 'LED铜线灯串 5米 节日装饰',
        description: '5米50灯LED铜线灯串柔美温馨，8种闪烁模式随心切换营造氛围。USB供电/电池盒两种供电方式可选，防水设计室内室外通用。圣诞节/派对装饰必备。',
        priceMin: 2.5, priceMax: 8.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        rating: 4.2, reviewCount: 11000,
      },
    ],
  },
  {
    nameZh: '义乌美家居日用百货商行',
    nameEn: 'Yiwu Meijiaju Daily Necessities Trading Co.',
    location: '浙江义乌 · 国际商贸城',
    contactName: '金国平',
    contactPhone: '189****5027',
    companyIntro: '日用百货全品类供应商，源头价格优势，支持混批和一件代发服务',
    yearEstablished: 2017, employeeCount: 25,
    annualExportRevenue: 180,
    certifications: JSON.stringify([]),
    businessTags: JSON.stringify(['家居用品', '厨房用品', '浴室用品', '清洁用品', '家居收纳']),
    exportDestinations: JSON.stringify(['东南亚', '中东', '非洲', '南美']),
    rating: 4.0, reviewCount: 350, isVerified: false, type: 'distributor',
    products: [
      {
        name: '多功能厨房剪刀 不锈钢',
        description: '3CR13不锈钢材质锋利耐用不易钝，磁吸刀套安全收纳不占地。可拆洗设计一冲即净，开瓶/剪骨/刮鱼鳞一剪多用。厨房必备神器。',
        priceMin: 2.0, priceMax: 8.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: false,
        images: getImagePaths('厨房'),
        rating: 4.1, reviewCount: 7500,
      },
    ],
  },
  {
    nameZh: '义乌鸿运玩具礼品有限公司',
    nameEn: 'Yiwu Hongyun Toy & Gift Co., Ltd.',
    location: '浙江义乌 · 苏溪镇',
    contactName: '毛伟强',
    contactPhone: '186****1394',
    companyIntro: '毛绒玩具专业制造商，超柔短毛绒面料，PP棉填充，产品通过EN71/CE认证',
    yearEstablished: 2016, employeeCount: 60,
    annualExportRevenue: 280,
    certifications: JSON.stringify(['EN71', 'ASTM F963', 'CE']),
    businessTags: JSON.stringify(['毛绒玩具', '公仔', '抱枕', '玩偶', '礼物']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚']),
    rating: 4.1, reviewCount: 480, isVerified: false, type: 'factory',
    products: [
      {
        name: '可爱毛绒公仔 趴趴狗 40cm',
        description: '超柔短毛绒面料触感柔软舒适，PP棉填充饱满不易变形。可做抱枕/靠垫/安抚玩具多功能，造型可爱逼真栩栩如生。40cm大号送礼佳品，送人自用都合适。',
        priceMin: 8.0, priceMax: 28.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['EN71', 'CE']),
        images: getImagePaths('毛绒公仔'),
        rating: 4.2, reviewCount: 9200,
      },
    ],
  },
  {
    nameZh: '义乌天翔体育用品有限公司',
    nameEn: 'Yiwu Tianxiang Sporting Goods Co., Ltd.',
    location: '浙江义乌 · 城西街道',
    contactName: '陈永良',
    contactPhone: '150****8276',
    companyIntro: '体育用品专业生产商，TPE瑜伽垫环保材质，年出口创汇300万美元',
    yearEstablished: 2014, employeeCount: 85,
    annualExportRevenue: 300,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'SGS']),
    businessTags: JSON.stringify(['体育用品', '健身器材', '瑜伽垫', '跳绳', '拉力带']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '南美', '中东']),
    rating: 4.3, reviewCount: 680, isVerified: false, type: 'factory',
    products: [
      {
        name: 'TPE瑜伽垫 6mm 防滑健身垫',
        description: '环保TPE材质可回收降解，双层防滑纹理无论干湿都防滑。6mm厚度减震适中缓冲护膝，闭孔结构不吸水易清洁。附赠绑带和背包方便携带收纳。',
        priceMin: 8.0, priceMax: 35.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'SGS']),
        images: getImagePaths('瑜伽垫'),
        rating: 4.4, reviewCount: 14200,
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════
  //  泉州/晋江 — 鞋服/卫浴 (8家)
  // ═════════════════════════════════════════════════════════════════════
  {
    nameZh: '晋江利达鞋业有限公司',
    nameEn: 'Jinjiang Lida Footwear Co., Ltd.',
    location: '福建晋江 · 陈埭镇',
    contactName: '蔡国强',
    contactPhone: '152****4613',
    companyIntro: '晋江鞋业龙头，年产运动鞋500万双，SATRA认证实验室品质保障',
    yearEstablished: 2000, employeeCount: 680,
    annualExportRevenue: 3200,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'SATRA', 'SGS']),
    businessTags: JSON.stringify(['运动鞋', '跑鞋', '篮球鞋', '休闲鞋', '硫化鞋']),
    exportDestinations: JSON.stringify(['美国', '欧盟', '东南亚', '南美', '中东', '非洲']),
    rating: 4.6, reviewCount: 5200, isVerified: true, type: 'factory',
    products: [
      {
        name: '透气飞织运动跑鞋 男款',
        description: '飞织鞋面透气轻盈如袜般贴合，EVA+橡胶大底耐磨防滑抓地力强。记忆鞋垫缓震回弹脚感舒适，多色多码(39-46)覆盖全尺码。适合跑步和日常休闲。',
        priceMin: 28.0, priceMax: 88.0, currency: 'CNY', moq: 300,
        supportsDropShipping: true, supportsOEM: true,
        images: getImagePaths('运动鞋'),
        rating: 4.6, reviewCount: 18300,
      },
    ],
  },
  {
    nameZh: '晋江舒乐拖鞋厂',
    nameEn: 'Jinjiang Shule Slippers Factory',
    location: '福建晋江 · 内坑镇',
    contactName: '陈伟忠',
    contactPhone: '188****7295',
    companyIntro: 'EVA拖鞋专业生产商，环保一体成型无异味，年产量超2000万双',
    yearEstablished: 2012, employeeCount: 150,
    annualExportRevenue: 400,
    certifications: JSON.stringify(['ISO 9001', 'SGS']),
    businessTags: JSON.stringify(['拖鞋', '凉拖', '棉拖', '沙滩鞋', 'EVA拖鞋']),
    exportDestinations: JSON.stringify(['日本', '韩国', '东南亚', '澳大利亚', '欧洲']),
    rating: 4.3, reviewCount: 1100, isVerified: false, type: 'factory',
    products: [
      {
        name: 'EVA防滑浴室拖鞋 情侣款',
        description: '环保EVA一体成型工艺无异味零甲醛，加厚鞋底4cm踩屎感舒适。排水防滑设计淋浴不滑倒，轻量化单只仅90g无感穿着。多色多码男女情侣款。',
        priceMin: 5.5, priceMax: 22.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        images: getImagePaths('拖鞋'),
        rating: 4.4, reviewCount: 22000,
      },
    ],
  },
  {
    nameZh: '泉州华泰陶瓷有限公司',
    nameEn: 'Quanzhou Huatai Ceramics Co., Ltd.',
    location: '福建泉州 · 德化县',
    contactName: '黄国荣',
    contactPhone: '135****6482',
    companyIntro: '德化陶瓷产业带骨干企业，45%骨粉含量高端骨瓷，FDA/LFGB食品级认证',
    yearEstablished: 1998, employeeCount: 320,
    annualExportRevenue: 1200,
    certifications: JSON.stringify(['ISO 9001', 'ISO 14001', 'FDA', 'LFGB', 'SGS']),
    businessTags: JSON.stringify(['陶瓷餐具', '茶具', '日用陶瓷', '工艺陶瓷', '酒店用瓷']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '中东']),
    rating: 4.7, reviewCount: 3800, isVerified: true, type: 'factory',
    products: [
      {
        name: '高档骨瓷餐具套装 56头',
        description: '45%骨粉含量超白透亮如脂似玉，釉面光滑易清洗不残留油污。含碗碟杯勺等56件满足6人家庭日常使用，精美礼盒包装送礼自用都体面。',
        priceMin: 85.0, priceMax: 288.0, currency: 'CNY', moq: 50,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['FDA', 'LFGB']),
        images: getImagePaths('餐具'),
        rating: 4.7, reviewCount: 4600,
      },
    ],
  },
  {
    nameZh: '泉州九牧卫浴科技有限公司',
    nameEn: 'Quanzhou Jomoo Sanitary Technology Co., Ltd.',
    location: '福建泉州 · 南安',
    contactName: '许志强',
    contactPhone: '159****3175',
    companyIntro: '中国卫浴行业领军品牌，产品通过WaterSense/CUPC认证，远销全球80多国',
    yearEstablished: 2005, employeeCount: 500,
    annualExportRevenue: 2800,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'WaterSense', 'ACS', 'CUPC']),
    businessTags: JSON.stringify(['卫浴', '马桶', '花洒', '水龙头', '浴室柜', '智能马桶']),
    exportDestinations: JSON.stringify(['美国', '加拿大', '欧盟', '澳大利亚', '中东', '东南亚']),
    rating: 4.8, reviewCount: 6100, isVerified: true, type: 'factory',
    products: [
      {
        name: '智能一体马桶 带烘干清洗',
        description: '即热式活水加热卫生省电即开即热，喷嘴自洁使用更安心。妇洗/臀洗/烘干/座圈加热全功能，脚感翻盖翻圈免接触更卫生。IPX4防水浴室放心用。',
        priceMin: 450.0, priceMax: 1888.0, currency: 'CNY', moq: 20,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'WaterSense', 'CUPC']),
        images: getImagePaths('智能马桶'),
        rating: 4.8, reviewCount: 3200,
      },
      {
        name: '全铜淋浴花洒套装 增压款',
        description: '全铜主体精工制造经久耐用，十级电镀防锈工艺光亮如镜。三功能出水（雨淋/按摩/混合）满足不同沐浴需求，空气能增压技术节水30%不降低体验。',
        priceMin: 85.0, priceMax: 268.0, currency: 'CNY', moq: 50,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'ACS']),
        images: getImagePaths('智能马桶'),
        rating: 4.6, reviewCount: 8900,
      },
    ],
  },
  {
    nameZh: '晋江劲霸服饰有限公司',
    nameEn: 'Jinjiang Kingbird Garment Co., Ltd.',
    location: '福建晋江 · 英林镇',
    contactName: '苏伟明',
    contactPhone: '187****8036',
    companyIntro: '专注商务男装20年，Oeko-Tex认证面料，版型精准销往全球30多国',
    yearEstablished: 2003, employeeCount: 400,
    annualExportRevenue: 1800,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'Oeko-Tex Standard 100']),
    businessTags: JSON.stringify(['男装', '夹克', '西服', '休闲裤', '商务男装']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '东南亚', '中东']),
    rating: 4.5, reviewCount: 2200, isVerified: true, type: 'factory',
    products: [
      {
        name: '男士商务休闲夹克 春季薄款',
        description: '高密尼龙面料防泼水处理应对多变天气，立领设计干练有型。多口袋实用方便收纳手机钱包，内衬透气网布春秋季穿着舒适不闷。通勤百搭款型。',
        priceMin: 35.0, priceMax: 128.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex']),
        images: getImagePaths('衬衫'),
        rating: 4.5, reviewCount: 5800,
      },
    ],
  },
  {
    nameZh: '泉州恒通卫浴有限公司',
    nameEn: 'Quanzhou Hengtong Sanitary Ware Co., Ltd.',
    location: '福建泉州 · 南安仑苍',
    contactName: '吴国栋',
    contactPhone: '133****5729',
    companyIntro: '南安水暖卫浴产业带主力厂商，NSF认证不锈钢水槽畅销欧美市场',
    yearEstablished: 2008, employeeCount: 280,
    annualExportRevenue: 1000,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'ACS', 'WaterSense', 'NSF']),
    businessTags: JSON.stringify(['水龙头', '水槽', '厨房龙头', '面盆龙头', '角阀']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '中东', '澳大利亚']),
    rating: 4.5, reviewCount: 1400, isVerified: true, type: 'factory',
    products: [
      {
        name: '不锈钢厨房水槽 单槽 大容量',
        description: '304不锈钢加厚1.2mm坚固耐用，拉丝表面抗刮花易清洁。R10圆角设计不藏污纳垢，含抽拉龙头+皂液器套装一站式配齐。大单槽设计洗锅无压力。',
        priceMin: 120.0, priceMax: 368.0, currency: 'CNY', moq: 30,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'NSF']),
        images: getImagePaths('厨房'),
        rating: 4.6, reviewCount: 3400,
      },
    ],
  },
  {
    nameZh: '晋江安踏体育用品代工厂',
    nameEn: 'Jinjiang Anta Sportswear OEM Factory',
    location: '福建晋江 · 池店镇',
    contactName: '林伟强',
    contactPhone: '151****9641',
    companyIntro: '国内领先运动服饰代工厂，年产量超2000万件，服务国内外一线运动品牌',
    yearEstablished: 2007, employeeCount: 500,
    annualExportRevenue: 2500,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'Oeko-Tex', 'SGS']),
    businessTags: JSON.stringify(['运动鞋', '运动服', '户外装备', '体育用品代工']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚']),
    rating: 4.7, reviewCount: 3200, isVerified: true, type: 'factory',
    products: [
      {
        name: '专业跑步T恤 速干面料 男款',
        description: '100%涤纶速干面料吸湿排汗保持干爽，激光透气孔设计增强散热。无缝工艺减少摩擦保护皮肤，反光印花夜跑安全可见。多色可选运动必备。',
        priceMin: 12.0, priceMax: 42.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex']),
        images: getImagePaths('T恤'),
        rating: 4.6, reviewCount: 13500,
      },
      {
        name: '轻量缓震跑步鞋 女款',
        description: 'EVA中底缓震回弹保护膝盖，橡胶大底耐磨抓地。飞织鞋面透气包裹双脚，单只仅180g轻若无物跑起来无负担。多色可选满足个性搭配。',
        priceMin: 32.0, priceMax: 98.0, currency: 'CNY', moq: 300,
        supportsDropShipping: true, supportsOEM: true,
        images: getImagePaths('运动鞋'),
        rating: 4.6, reviewCount: 9800,
      },
    ],
  },
  {
    nameZh: '泉州市闽南石材有限公司',
    nameEn: 'Quanzhou Minnan Stone Co., Ltd.',
    location: '福建泉州 · 惠安县',
    contactName: '郑永康',
    contactPhone: '138****2568',
    companyIntro: '惠安石材产业带知名企业，自有矿山资源，年出口创汇1600万美元',
    yearEstablished: 2001, employeeCount: 350,
    annualExportRevenue: 1600,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'SGS']),
    businessTags: JSON.stringify(['石材', '花岗岩', '大理石', '墓碑', '建筑石材']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚']),
    rating: 4.4, reviewCount: 1800, isVerified: true, type: 'factory',
    products: [
      {
        name: '芝麻灰花岗岩板材 G654',
        description: '天然芝麻灰花岗岩石材质感厚重，表面可做火烧/荔枝/抛光多种处理。规格600x600x30mm标准尺寸，适用于广场/外墙/路沿等户外铺装。',
        priceMin: 45.0, priceMax: 128.0, currency: 'CNY', moq: 200,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'SGS']),
        rating: 4.4, reviewCount: 2800,
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════
  //  温州 — 眼镜/打火机/小电器 (6家)
  // ═════════════════════════════════════════════════════════════════════
  {
    nameZh: '温州正大眼镜有限公司',
    nameEn: 'Wenzhou Zhengda Glasses Co., Ltd.',
    location: '浙江温州 · 瓯海区',
    contactName: '徐志坚',
    contactPhone: '139****7831',
    companyIntro: '温州眼镜产业带龙头企业，年产眼镜500万副，通过FDA/CE双认证畅销全球',
    yearEstablished: 2004, employeeCount: 350,
    annualExportRevenue: 1500,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'FDA', 'ANSI Z80.3']),
    businessTags: JSON.stringify(['太阳镜', '光学眼镜', '老花镜', '眼镜配件']),
    exportDestinations: JSON.stringify(['美国', '欧盟', '东南亚', '南美', '中东']),
    rating: 4.5, reviewCount: 2800, isVerified: true, type: 'factory',
    products: [
      {
        name: '偏光太阳镜 飞行员款 UV400',
        description: 'TAC偏光镜片有效消除眩光视野清晰，UV400防护100%阻隔紫外线保护眼睛。TR90超轻镜框仅22g佩戴无压力，多色可选配眼镜盒+擦镜布。',
        priceMin: 12.0, priceMax: 45.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'FDA', 'ANSI Z80.3']),
        rating: 4.5, reviewCount: 12500,
      },
    ],
  },
  {
    nameZh: '温州天骄打火机有限公司',
    nameEn: 'Wenzhou Tianjiao Lighter Co., Ltd.',
    location: '浙江温州 · 鹿城区',
    contactName: '陈国良',
    contactPhone: '137****4902',
    companyIntro: '温州打火机行业标杆，日产打火机10万只，CE/ASTM双认证出口50多国',
    yearEstablished: 2008, employeeCount: 200,
    annualExportRevenue: 600,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'ASTM', 'SGS']),
    businessTags: JSON.stringify(['打火机', '烟具', '打火机配件', '礼品打火机']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '中东', '东南亚', '非洲']),
    rating: 4.4, reviewCount: 1500, isVerified: false, type: 'factory',
    products: [
      {
        name: '直冲防风中高档打火机 金属壳',
        description: '锌合金外壳质感厚重，表面拉丝/镜面工艺可选。直冲式火焰防风设计打火稳定，气体透明可视剩余量。支持LOGO定制企业礼品首选。',
        priceMin: 2.5, priceMax: 12.0, currency: 'CNY', moq: 1000,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'ASTM']),
        rating: 4.3, reviewCount: 22000,
      },
      {
        name: 'USB充电电子打火机 电弧',
        description: '双电弧点火强劲有力，USB-C充电循环使用环保省钱。无明火无气体安全过安检，全金属机身耐用有质感。满电续航1个月日常使用无忧。',
        priceMin: 5.0, priceMax: 22.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'RoHS']),
        rating: 4.4, reviewCount: 15000,
      },
    ],
  },
  {
    nameZh: '温州凯达电器有限公司',
    nameEn: 'Wenzhou Kaida Electric Appliance Co., Ltd.',
    location: '浙江温州 · 乐清市',
    contactName: '叶伟明',
    contactPhone: '136****6157',
    companyIntro: '墙壁开关插座专业制造商，阻燃PC面板750°C灼热丝测试，UL/CE双认证',
    yearEstablished: 2006, employeeCount: 260,
    annualExportRevenue: 900,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'CB', 'UL', 'RoHS']),
    businessTags: JSON.stringify(['墙壁开关', '插座', '排插', '转换器', '电工配件']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '中东', '东南亚', '南美']),
    rating: 4.4, reviewCount: 1300, isVerified: true, type: 'factory',
    products: [
      {
        name: 'USB-C墙壁插座 快充面板',
        description: '带双USB-C 65W快充面板，兼容PD/PPS协议手机电脑都能充。阻燃PC面板安全系数高，通过750°C灼热丝测试。标准86暗盒安装替换简单，无需改线路。',
        priceMin: 15.0, priceMax: 48.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'UL', 'RoHS']),
        rating: 4.5, reviewCount: 6800,
      },
    ],
  },
  {
    nameZh: '温州宏丰五金制品有限公司',
    nameEn: 'Wenzhou Hongfeng Hardware Products Co., Ltd.',
    location: '浙江温州 · 永嘉县',
    contactName: '黄志文',
    contactPhone: '158****3849',
    companyIntro: '五金配件专业制造商，304不锈钢合页/拉手等产品，SGS认证品质保障',
    yearEstablished: 2009, employeeCount: 180,
    annualExportRevenue: 500,
    certifications: JSON.stringify(['ISO 9001', 'SGS']),
    businessTags: JSON.stringify(['五金配件', '合页', '拉手', '锁具', '门窗五金']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '中东']),
    rating: 4.3, reviewCount: 850, isVerified: false, type: 'factory',
    products: [
      {
        name: '不锈钢合页 4寸*3*2.5mm',
        description: '304不锈钢材质防锈耐用，加厚2.5mm承重力强。单片承重50kg稳重不掉，配不锈钢螺丝安装牢固。适用于室内木门/柜门/橱柜门安装。',
        priceMin: 1.5, priceMax: 6.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        rating: 4.3, reviewCount: 9600,
      },
    ],
  },
  {
    nameZh: '温州永嘉泵阀制造有限公司',
    nameEn: 'Wenzhou Yongjia Pump & Valve Manufacturing Co., Ltd.',
    location: '浙江温州 · 永嘉瓯北',
    contactName: '周国平',
    contactPhone: '189****5027',
    companyIntro: '温州泵阀产业带骨干企业，API/CE认证，产品用于中石油/中石化等重大项目',
    yearEstablished: 2003, employeeCount: 320,
    annualExportRevenue: 1500,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'API', 'TS']),
    businessTags: JSON.stringify(['阀门', '水泵', '球阀', '闸阀', '止回阀']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '中东', '俄罗斯', '东南亚']),
    rating: 4.5, reviewCount: 2000, isVerified: true, type: 'factory',
    products: [
      {
        name: '法兰球阀 Q41F-16C DN50',
        description: '碳钢WCB阀体坚固耐用，PTFE密封零泄漏。DN50法兰连接标准规格，PN16压力等级适配常规管道系统。适用于水/油/气等介质管道控制。',
        priceMin: 35.0, priceMax: 128.0, currency: 'CNY', moq: 50,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'API', 'TS']),
        rating: 4.5, reviewCount: 3800,
      },
    ],
  },
  {
    nameZh: '温州俊朗服饰辅料有限公司',
    nameEn: 'Wenzhou Junlang Garment Accessories Co., Ltd.',
    location: '浙江温州 · 瓯海区',
    contactName: '郑伟杰',
    contactPhone: '186****1394',
    companyIntro: '服装辅料专业供应商，铜扣/拉链/织带全品类，REACH/Oeko-Tex认证环保',
    yearEstablished: 2012, employeeCount: 100,
    annualExportRevenue: 250,
    certifications: JSON.stringify(['ISO 9001', 'REACH', 'Oeko-Tex']),
    businessTags: JSON.stringify(['服装辅料', '纽扣', '拉链', '织带', '吊牌', '五金扣']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '南美']),
    rating: 4.2, reviewCount: 580, isVerified: false, type: 'factory',
    products: [
      {
        name: '金属牛仔扣 全套 复古做旧',
        description: '黄铜材质真材实料，复古做旧工艺个性有味道。含面扣+撞钉+空心钉全套配件，多种尺寸和颜色可选。适用于牛仔裤/工装裤/帆布包等。',
        priceMin: 0.3, priceMax: 1.5, currency: 'CNY', moq: 5000,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['REACH', 'Oeko-Tex']),
        rating: 4.2, reviewCount: 5800,
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════
  //  中山 — 灯具/五金 (6家)
  // ═════════════════════════════════════════════════════════════════════
  {
    nameZh: '中山古镇亮尔雅灯饰有限公司',
    nameEn: "Zhongshan Guzhen Liang'erya Lighting Co., Ltd.",
    location: '广东中山 · 古镇镇',
    contactName: '欧伟强',
    contactPhone: '150****8276',
    companyIntro: '古镇灯饰产业带知名品牌，LED全光谱照明技术领先，产品畅销欧美市场',
    yearEstablished: 2006, employeeCount: 280,
    annualExportRevenue: 1300,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'UL', 'RoHS', 'ERP']),
    businessTags: JSON.stringify(['LED灯具', '吊灯', '吸顶灯', 'LED面板灯', '户外照明']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '中东', '东南亚', '南美', '非洲']),
    rating: 4.6, reviewCount: 2200, isVerified: true, type: 'factory',
    products: [
      {
        name: 'LED全光谱护眼吸顶灯 48W',
        description: 'Ra>95高显色指数还原物体真实色彩，全光谱接近自然光护眼不疲劳。三档色温调节(3000K暖光/5000K中性光/6500K白光)适应不同场景。智能遥控调光调色，直径50cm。',
        priceMin: 55.0, priceMax: 168.0, currency: 'CNY', moq: 50,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'UL', 'RoHS']),
        images: getImagePaths('台灯'),
        rating: 4.7, reviewCount: 7400,
      },
    ],
  },
  {
    nameZh: '中山现代光电科技有限公司',
    nameEn: 'Zhongshan Xiandai Optoelectronics Technology Co., Ltd.',
    location: '广东中山 · 横栏镇',
    contactName: '黄国伟',
    contactPhone: '152****4613',
    companyIntro: 'LED灯带专业制造商，RGBIC/WIFI智能灯带技术领先，产品通过UL/DLC认证',
    yearEstablished: 2017, employeeCount: 120,
    annualExportRevenue: 400,
    certifications: JSON.stringify(['CE', 'RoHS', 'UL', 'DLC']),
    businessTags: JSON.stringify(['LED灯带', '线条灯', '商业照明', '灯条灯带']),
    exportDestinations: JSON.stringify(['美国', '加拿大', '欧洲', '澳大利亚', '东南亚']),
    rating: 4.3, reviewCount: 860, isVerified: false, type: 'factory',
    products: [
      {
        name: 'RGB智能LED灯带 5米 手机控制',
        description: '5050 RGB灯珠高亮度160颗/米光线均匀无暗区。手机App+语音控制华为/小米智能音箱都兼容，1600万色随意切换气氛十足。支持音乐律动随节奏变色，5米一卷含电源。',
        priceMin: 15.0, priceMax: 48.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'RoHS', 'UL']),
        images: getImagePaths('台灯'),
        rating: 4.4, reviewCount: 15800,
      },
    ],
  },
  {
    nameZh: '中山欧普照明股份有限公司',
    nameEn: 'Zhongshan Opple Lighting Co., Ltd.',
    location: '广东中山 · 古镇镇',
    contactName: '陈志明',
    contactPhone: '188****7295',
    companyIntro: '中国照明行业领军企业，拥有国家CNAS认可实验室，产品通过DLC/UL认证',
    yearEstablished: 2004, employeeCount: 500,
    annualExportRevenue: 3000,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'UL', 'RoHS', 'ERP', 'DLC']),
    businessTags: JSON.stringify(['LED照明', '筒灯', '射灯', '面板灯', '工矿灯', '户外照明']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '中东', '南美', '非洲']),
    rating: 4.7, reviewCount: 4500, isVerified: true, type: 'factory',
    products: [
      {
        name: 'LED筒灯 4寸 12W 开孔120mm',
        description: '12W高亮输出光通量960lm照亮空间，Ra>90高显色无频闪保护视力。铝材散热器寿命长达30000小时，开孔120mm标准尺寸适配吊顶。工程家用都合适。',
        priceMin: 8.0, priceMax: 28.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: false,
        certifications: JSON.stringify(['CE', 'UL', 'RoHS', 'DLC']),
        images: getImagePaths('台灯'),
        rating: 4.6, reviewCount: 12500,
      },
      {
        name: '太阳能户外庭院灯 100W',
        description: '多晶硅太阳能板转换效率高，100W LED灯头亮度充足。光控+雷达感应双重智能控制，节能模式可亮整夜。IP65防水防尘户外风雨无忧，含安装支架配件齐全。',
        priceMin: 45.0, priceMax: 128.0, currency: 'CNY', moq: 50,
        supportsDropShipping: true, supportsOEM: false,
        certifications: JSON.stringify(['CE', 'UL', 'RoHS']),
        images: getImagePaths('台灯'),
        rating: 4.6, reviewCount: 5200,
      },
    ],
  },
  {
    nameZh: '中山华艺灯饰集团有限公司',
    nameEn: 'Zhongshan Huayi Lighting Group Co., Ltd.',
    location: '广东中山 · 古镇镇',
    contactName: '林伟良',
    contactPhone: '135****6482',
    companyIntro: '高端水晶灯饰制造商，K9水晶+铜镀铬工艺，服务于万豪/希尔顿等五星酒店',
    yearEstablished: 2002, employeeCount: 600,
    annualExportRevenue: 3500,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'UL', 'RoHS', 'SAA']),
    businessTags: JSON.stringify(['水晶灯', '吊灯', '工程灯', '酒店照明', '定制灯饰']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '中东', '东南亚', '澳大利亚']),
    rating: 4.6, reviewCount: 3800, isVerified: true, type: 'factory',
    products: [
      {
        name: '现代水晶吊灯 客厅灯 80cm',
        description: 'K9水晶材质透光率高于普通水晶30%，铜镀铬灯臂防锈抗氧化持久如新。LED光源节能环保三色变光，直径80cm适合20-30m2客厅。奢华大气提升家居品位。',
        priceMin: 280.0, priceMax: 880.0, currency: 'CNY', moq: 10,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'UL', 'RoHS']),
        images: getImagePaths('台灯'),
        rating: 4.6, reviewCount: 2800,
      },
    ],
  },
  {
    nameZh: '中山坚朗五金制品有限公司',
    nameEn: 'Zhongshan Jianlang Hardware Products Co., Ltd.',
    location: '广东中山 · 小榄镇',
    contactName: '刘国荣',
    contactPhone: '159****3175',
    companyIntro: '门窗五金专业制造商，304不锈钢精铸工艺，产品通过CE/SGS认证',
    yearEstablished: 2007, employeeCount: 350,
    annualExportRevenue: 1200,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'UL', 'SGS']),
    businessTags: JSON.stringify(['门窗五金', '幕墙五金', '点支式玻璃', '拉手', '铰链']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '中东', '东南亚', '澳大利亚']),
    rating: 4.5, reviewCount: 1600, isVerified: true, type: 'factory',
    products: [
      {
        name: '玻璃门夹 不锈钢 无框玻璃门',
        description: '304不锈钢精铸工艺强度高耐腐蚀，单片承重80kg安全放心。适用于8-12mm钢化玻璃门安装，含全套紧固件安装方便。表面拉丝处理美观大气。',
        priceMin: 15.0, priceMax: 48.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'SGS']),
        rating: 4.5, reviewCount: 4200,
      },
    ],
  },
  {
    nameZh: '中山市古镇万佳照明厂',
    nameEn: 'Zhongshan Guzhen Wanjia Lighting Factory',
    location: '广东中山 · 古镇镇',
    contactName: '何伟华',
    contactPhone: '187****8036',
    companyIntro: 'LED球泡灯专业制造商，日产10万只，价格优势明显畅销中东非洲市场',
    yearEstablished: 2015, employeeCount: 80,
    annualExportRevenue: 250,
    certifications: JSON.stringify(['CE', 'RoHS']),
    businessTags: JSON.stringify(['LED灯泡', '节能灯', '球泡灯', '玉米灯', '照明']),
    exportDestinations: JSON.stringify(['美国', '东南亚', '中东', '非洲', '南美']),
    rating: 4.1, reviewCount: 420, isVerified: false, type: 'factory',
    products: [
      {
        name: 'LED球泡灯 9W E27螺口',
        description: '9W LED球泡替换传统60W白炽灯省电80%，800lm光通量亮度充足。Ra>80显色自然，色温3000K暖光/6500K白光可选。全塑散热外壳绝缘防触电安全放心。',
        priceMin: 1.5, priceMax: 6.0, currency: 'CNY', moq: 1000,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'RoHS']),
        images: getImagePaths('台灯'),
        rating: 4.1, reviewCount: 18500,
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════
  //  宁波 — 小家电/文具 (6家)
  // ═════════════════════════════════════════════════════════════════════
  {
    nameZh: '宁波凯瑞电器有限公司',
    nameEn: 'Ningbo Kairui Electric Appliances Co., Ltd.',
    location: '浙江宁波 · 慈溪市',
    contactName: '陈伟国',
    contactPhone: '133****5729',
    companyIntro: '宁波慈溪小家电产业带骨干企业，直流变频风扇技术领先，产品通过GS/CE认证',
    yearEstablished: 2009, employeeCount: 320,
    annualExportRevenue: 1600,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'CE', 'CB', 'GS', 'RoHS']),
    businessTags: JSON.stringify(['小家电', '电风扇', '取暖器', '加湿器', '厨房小电']),
    exportDestinations: JSON.stringify(['欧洲', '美国', '东南亚', '南美', '中东']),
    rating: 4.5, reviewCount: 1900, isVerified: true, type: 'factory',
    products: [
      {
        name: '直流变频落地扇 14寸 静音',
        description: 'DC直流无刷电机功耗低至传统风扇1/3，12档风速精准调节满足各种需求。超静音最低18dB比耳语还轻，8小时定时遥控+触摸双控制。台地两用设计灵活。',
        priceMin: 65.0, priceMax: 198.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'CB', 'GS', 'RoHS']),
        rating: 4.6, reviewCount: 5400,
      },
      {
        name: '超声波加湿器 4L 静音',
        description: '4L大容量持续加湿12小时不用频繁加水，陶瓷雾化片纳米级细雾不湿桌面。缺水自动断电保护安全，静音运行≤28dB睡眠不打扰。适合卧室/办公室使用。',
        priceMin: 25.0, priceMax: 68.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'RoHS']),
        images: getImagePaths('保温杯'),
        rating: 4.4, reviewCount: 11200,
      },
    ],
  },
  {
    nameZh: '宁波得力文具集团有限公司',
    nameEn: 'Ningbo Deli Stationery Group Co., Ltd.',
    location: '浙江宁波 · 宁海县',
    contactName: '张志成',
    contactPhone: '151****9641',
    companyIntro: '中国文具行业领军企业，年产值超50亿，产品覆盖100多个国家和地区',
    yearEstablished: 2001, employeeCount: 800,
    annualExportRevenue: 5000,
    certifications: JSON.stringify(['ISO 9001', 'ISO 14001', 'EN71', 'ASTM D4236']),
    businessTags: JSON.stringify(['文具', '办公用品', '学生文具', '打印耗材', '办公设备']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚', '中东']),
    rating: 4.8, reviewCount: 6500, isVerified: true, type: 'factory',
    products: [
      {
        name: '中性笔芯 0.5mm 黑 100支装',
        description: '精工不锈钢笔头碳化钨球珠耐磨顺滑，进口油墨书写流畅不断墨不积墨。0.5mm全针管通用适配市面上大部分笔杆，100支装办公/学生大量使用超值。',
        priceMin: 5.0, priceMax: 15.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['EN71']),
        rating: 4.7, reviewCount: 35000,
      },
    ],
  },
  {
    nameZh: '宁波方太生活电器有限公司',
    nameEn: 'Ningbo Fotile Lifestyle Electric Co., Ltd.',
    location: '浙江宁波 · 杭州湾新区',
    contactName: '王国强',
    contactPhone: '138****2568',
    companyIntro: '中国高端厨电领导品牌，拥有国家级技术中心，产品获iF/红点等国际设计大奖',
    yearEstablished: 2006, employeeCount: 450,
    annualExportRevenue: 2800,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'CB', 'GS', 'RoHS', 'LFGB']),
    businessTags: JSON.stringify(['厨房电器', '吸油烟机', '燃气灶', '蒸烤一体', '洗碗机']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '澳大利亚', '日本', '东南亚']),
    rating: 4.7, reviewCount: 3800, isVerified: true, type: 'factory',
    products: [
      {
        name: '嵌入式蒸烤一体机 36L',
        description: '36L大容量整鸡/蛋糕都能做，上下独立控温精准温控±1°C。蒸汽辅助嫩烤外酥里嫩肉汁饱满，10种烹饪模式中西料理都能做。搪瓷内胆一抹即净易清洁。',
        priceMin: 350.0, priceMax: 1280.0, currency: 'CNY', moq: 20,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'CB', 'GS', 'RoHS', 'LFGB']),
        images: getImagePaths('厨房'),
        rating: 4.7, reviewCount: 3800,
      },
    ],
  },
  {
    nameZh: '宁波奥克斯生活电器有限公司',
    nameEn: 'Ningbo Aux Life Electric Co., Ltd.',
    location: '浙江宁波 · 鄞州区',
    contactName: '赵永明',
    contactPhone: '139****7831',
    companyIntro: '中国空调行业三强之一，年产值超百亿，产品通过UL/ERP等国际认证',
    yearEstablished: 2005, employeeCount: 500,
    annualExportRevenue: 3000,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'CB', 'UL', 'RoHS', 'ERP']),
    businessTags: JSON.stringify(['空调', '除湿机', '空气净化器', '取暖器', '移动空调']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '中东', '南美']),
    rating: 4.5, reviewCount: 4200, isVerified: true, type: 'factory',
    products: [
      {
        name: '家用除湿机 25L/天 正品压缩机',
        description: '品牌压缩机动力强劲除湿效率高，日除湿量25L(30°C/80%RH)快速干爽。适用面积30-50m2客厅卧室都合适，干衣模式即使阴雨天也不怕没干衣服穿。24小时定时+水满自动停机。',
        priceMin: 180.0, priceMax: 480.0, currency: 'CNY', moq: 30,
        supportsDropShipping: false, supportsOEM: false,
        certifications: JSON.stringify(['CE', 'CB', 'UL', 'ERP']),
        rating: 4.5, reviewCount: 4500,
      },
    ],
  },
  {
    nameZh: '宁波彬彬文具礼品有限公司',
    nameEn: 'Ningbo Binbin Stationery & Gifts Co., Ltd.',
    location: '浙江宁波 · 北仑区',
    contactName: '徐伟良',
    contactPhone: '137****4902',
    companyIntro: '商务礼品笔专业制造商，铱金笔尖工艺领先，产品畅销日韩欧美高端市场',
    yearEstablished: 2010, employeeCount: 150,
    annualExportRevenue: 450,
    certifications: JSON.stringify(['ISO 9001', 'EN71', 'ASTM D4236']),
    businessTags: JSON.stringify(['笔类', '钢笔', '礼品笔', '文具套装', '商务礼品']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '中东']),
    rating: 4.3, reviewCount: 780, isVerified: false, type: 'factory',
    products: [
      {
        name: '商务钢笔套装 礼盒装',
        description: '铱金笔尖书写顺滑不刮纸，金属烤漆笔杆质感出色显档次。含钢笔+墨水芯+精美礼盒包装，适合企业礼品/商务馈赠/员工福利。支持LOGO定制。',
        priceMin: 12.0, priceMax: 45.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['EN71']),
        rating: 4.4, reviewCount: 5200,
      },
    ],
  },
  {
    nameZh: '宁波惠康电器有限公司',
    nameEn: 'Ningbo Huikang Electric Co., Ltd.',
    location: '浙江宁波 · 余姚市',
    contactName: '胡国平',
    contactPhone: '136****6157',
    companyIntro: '迷你冰箱专业制造商，AC/DC双用技术领先，产品畅销欧美日韩市场',
    yearEstablished: 2008, employeeCount: 280,
    annualExportRevenue: 1100,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'CE', 'CB', 'RoHS']),
    businessTags: JSON.stringify(['冰箱', '冷柜', '迷你冰箱', '红酒柜', '制冷设备']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '中东', '非洲']),
    rating: 4.4, reviewCount: 1500, isVerified: true, type: 'factory',
    products: [
      {
        name: '迷你冰箱 20L 车载家用两用',
        description: '20L小容量可放6瓶350ml饮料，制冷至低于环境温度18°C保鲜效果好。AC家用220V/DC车载12V双用，家用车载宿舍都能用。静音运行≤25dB不打扰。',
        priceMin: 65.0, priceMax: 188.0, currency: 'CNY', moq: 50,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'CB', 'RoHS']),
        rating: 4.4, reviewCount: 6500,
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════
  //  青岛 — 食品/家居 (6家)
  // ═════════════════════════════════════════════════════════════════════
  {
    nameZh: '青岛海润食品进出口有限公司',
    nameEn: 'Qingdao Hairun Food Import & Export Co., Ltd.',
    location: '山东青岛 · 城阳区',
    contactName: '王永强',
    contactPhone: '158****3849',
    companyIntro: '青岛水产加工龙头企业，HACCP/BRC认证，产品出口日韩欧美市场超20年',
    yearEstablished: 2001, employeeCount: 380,
    annualExportRevenue: 3500,
    certifications: JSON.stringify(['ISO 22000', 'HACCP', 'BRC', 'FDA', 'MSC', 'ASC']),
    businessTags: JSON.stringify(['冷冻海鲜', '水产品加工', '鱼类', '虾类', '贝类']),
    exportDestinations: JSON.stringify(['日本', '韩国', '美国', '欧盟', '澳大利亚']),
    rating: 4.7, reviewCount: 2900, isVerified: true, type: 'factory',
    products: [
      {
        name: '冷冻去头虾仁 31/40 1kg',
        description: '南美白对虾鲜活加工，去头去壳留尾烹饪方便。单冻IQF工艺每只独立速冻不粘连，规格31-40只/磅大小均匀。1kg真空袋装锁住新鲜，适合餐饮/出口/家庭。',
        priceMin: 32.0, priceMax: 88.0, currency: 'CNY', moq: 200,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['HACCP', 'FDA', 'MSC']),
        rating: 4.6, reviewCount: 4100,
      },
    ],
  },
  {
    nameZh: '青岛味之素食品科技有限公司',
    nameEn: 'Qingdao Ajinomoto Food Technology Co., Ltd.',
    location: '山东青岛 · 即墨区',
    contactName: '张伟平',
    contactPhone: '189****5027',
    companyIntro: '复合调味料专业制造商，传统发酵工艺纯天然原料，HALAL/KOSHER双认证',
    yearEstablished: 2015, employeeCount: 150,
    annualExportRevenue: 600,
    certifications: JSON.stringify(['ISO 22000', 'HACCP', 'KOSHER', 'HALAL', 'FDA']),
    businessTags: JSON.stringify(['调味料', '酱料', '预制菜调料', '复合调味品']),
    exportDestinations: JSON.stringify(['日本', '韩国', '美国', '中东', '东南亚']),
    rating: 4.5, reviewCount: 980, isVerified: false, type: 'factory',
    products: [
      {
        name: '韩式辣酱 方便速食酱料 500g',
        description: '传统发酵工艺自然发酵60天以上，辣中带甜风味正宗。纯天然原料无添加防腐剂，500g/袋家庭装经济实惠。适合韩式拌饭/蘸料/炒年糕/部队锅等料理。',
        priceMin: 6.0, priceMax: 22.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['HACCP', 'HALAL']),
        rating: 4.4, reviewCount: 5600,
      },
    ],
  },
  {
    nameZh: '青岛啤酒国际有限公司',
    nameEn: 'Qingdao Brewery International Co., Ltd.',
    location: '山东青岛 · 市北区',
    contactName: '赵建明',
    contactPhone: '186****1394',
    companyIntro: '百年民族品牌，年出口额超80亿美元，远销全球100多个国家和地区',
    yearEstablished: 1995, employeeCount: 1200,
    annualExportRevenue: 8000,
    certifications: JSON.stringify(['ISO 22000', 'BRC', 'HALAL', 'KOSHER', 'IFS']),
    businessTags: JSON.stringify(['啤酒', '精酿啤酒', '饮品', '酒水出口']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '韩国', '日本', '东南亚', '澳大利亚']),
    rating: 4.9, reviewCount: 12000, isVerified: true, type: 'factory',
    products: [
      {
        name: '青岛啤酒 经典1903 500ml*24罐',
        description: '百年经典配方精选进口麦芽和啤酒花，酒体清澈泡沫细腻。酒精度4.0%vol麦香浓郁，原麦汁浓度10°P口感纯正。500ml*24罐出口版适合酒吧/餐厅/家庭囤货。',
        priceMin: 5.0, priceMax: 15.0, currency: 'CNY', moq: 500,
        supportsDropShipping: false, supportsOEM: false,
        certifications: JSON.stringify(['BRC', 'HALAL']),
        images: getImagePaths('啤酒'),
        rating: 4.8, reviewCount: 68000,
      },
    ],
  },
  {
    nameZh: '青岛海尔智能电器有限公司',
    nameEn: 'Qingdao Haier Smart Electric Co., Ltd.',
    location: '山东青岛 · 崂山区',
    contactName: '刘国栋',
    contactPhone: '150****8276',
    companyIntro: '全球家电领导品牌，连续14年全球大型家电品牌零售量第一，世界500强企业',
    yearEstablished: 2000, employeeCount: 2000,
    annualExportRevenue: 15000,
    certifications: JSON.stringify(['ISO 9001', 'ISO 14001', 'CE', 'UL', 'RoHS', 'Energy Star']),
    businessTags: JSON.stringify(['家电', '冷柜', '洗衣机', '热水器', '净水器', '智能家电']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '澳大利亚', '东南亚', '南美']),
    rating: 4.8, reviewCount: 15000, isVerified: true, type: 'factory',
    products: [
      {
        name: '全自动滚筒洗衣机 8kg 变频',
        description: '8kg容量三口之家够用，变频电机静音节能省电50%。多种洗涤程序支持羽绒服/羊毛洗娇贵面料也能洗，15分钟快速洗着急出门也不怕。一级能效省水省电。',
        priceMin: 480.0, priceMax: 1688.0, currency: 'CNY', moq: 10,
        supportsDropShipping: false, supportsOEM: false,
        certifications: JSON.stringify(['CE', 'UL', 'Energy Star']),
        rating: 4.8, reviewCount: 12500,
      },
    ],
  },
  {
    nameZh: '青岛即墨服装批发基地',
    nameEn: 'Qingdao Jimo Apparel Wholesale Base',
    location: '山东青岛 · 即墨区',
    contactName: '孙志远',
    contactPhone: '152****4613',
    companyIntro: '即墨服装市场核心批发商，韩版快时尚女装源头，款式更新快紧跟潮流',
    yearEstablished: 2013, employeeCount: 50,
    annualExportRevenue: 300,
    certifications: JSON.stringify([]),
    businessTags: JSON.stringify(['服装批发', '女装', '韩版服装', '外贸尾货', '快时尚']),
    exportDestinations: JSON.stringify(['韩国', '日本', '美国', '东南亚']),
    rating: 4.1, reviewCount: 350, isVerified: false, type: 'distributor',
    products: [
      {
        name: '韩版宽松卫衣 连帽 女款',
        description: '320g加厚抓绒面料保暖舒适不起球，宽松落肩版型不挑身材遮肉显瘦。韩版ins风印花时尚百搭，多色可选适合秋冬穿搭。基础款单品批发走量快。',
        priceMin: 18.0, priceMax: 55.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: false,
        images: getImagePaths('卫衣'),
        rating: 4.2, reviewCount: 6800,
      },
    ],
  },
  {
    nameZh: '青岛海藻生物科技有限公司',
    nameEn: 'Qingdao Seaweed Biotechnology Co., Ltd.',
    location: '山东青岛 · 黄岛区',
    contactName: '周国良',
    contactPhone: '188****7295',
    companyIntro: '海藻食品专业制造商，低温烘焙非油炸工艺，产品通过FDA/HALAL认证畅销全球',
    yearEstablished: 2011, employeeCount: 180,
    annualExportRevenue: 500,
    certifications: JSON.stringify(['ISO 22000', 'HACCP', 'FDA', 'KOSHER', 'HALAL']),
    businessTags: JSON.stringify(['海藻食品', '海苔', '紫菜', '海藻饮品', '海洋食品']),
    exportDestinations: JSON.stringify(['美国', '日本', '韩国', '欧洲', '东南亚']),
    rating: 4.4, reviewCount: 820, isVerified: false, type: 'factory',
    products: [
      {
        name: '海苔脆片 原味 30g*20包',
        description: '优选条斑紫菜原料品质上乘，低温烘焙非油炸工艺健康不上火。香脆可口老少皆宜，富含膳食纤维和碘。独立小包30g便携装方便携带，20包/箱批发规格。',
        priceMin: 1.5, priceMax: 5.0, currency: 'CNY', moq: 1000,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['HACCP', 'FDA', 'HALAL']),
        images: getImagePaths('坚果'),
        rating: 4.5, reviewCount: 12500,
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════
  //  汕头 — 玩具/内衣 (6家)
  // ═════════════════════════════════════════════════════════════════════
  {
    nameZh: '汕头华达玩具实业有限公司',
    nameEn: 'Shantou Huada Toy Industrial Co., Ltd.',
    location: '广东汕头 · 澄海区',
    contactName: '陈伟鹏',
    contactPhone: '135****6482',
    companyIntro: '澄海玩具产业带龙头，ABS环保塑料工艺领先，EN71/ASTM F963双认证',
    yearEstablished: 2002, employeeCount: 500,
    annualExportRevenue: 2200,
    certifications: JSON.stringify(['ISO 9001', 'EN71', 'ASTM F963', 'CCC', 'CE']),
    businessTags: JSON.stringify(['玩具', '益智玩具', '遥控玩具', '积木', '潮玩']),
    exportDestinations: JSON.stringify(['美国', '欧盟', '日本', '东南亚', '南美', '中东']),
    rating: 4.8, reviewCount: 5800, isVerified: true, type: 'factory',
    products: [
      {
        name: 'STEM益智积木套装 400粒',
        description: 'ABS环保塑料安全无毒无味，兼容主流大颗粒积木扩展性强。含齿轮/轮子/连接件等特殊件，可拼搭12种不同造型培养动手能力。送收纳箱培养收纳好习惯，适合3岁+。',
        priceMin: 18.0, priceMax: 58.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['EN71', 'ASTM F963', 'CCC']),
        images: getImagePaths('积木'),
        rating: 4.7, reviewCount: 14500,
      },
    ],
  },
  {
    nameZh: '汕头艺趣潮玩有限公司',
    nameEn: 'Shantou Yiqu Trendy Toys Co., Ltd.',
    location: '广东汕头 · 金平区',
    contactName: '林国明',
    contactPhone: '159****3175',
    companyIntro: '潮玩盲盒新锐品牌，与腾讯/网易等IP深度合作，搪胶工艺行业领先',
    yearEstablished: 2018, employeeCount: 80,
    annualExportRevenue: 250,
    certifications: JSON.stringify(['EN71', 'ASTM F963', 'CE']),
    businessTags: JSON.stringify(['潮玩', '盲盒', '手办', '搪胶公仔', 'IP衍生品']),
    exportDestinations: JSON.stringify(['美国', '日本', '韩国', '欧洲', '东南亚']),
    rating: 4.2, reviewCount: 650, isVerified: false, type: 'factory',
    products: [
      {
        name: '国潮系列盲盒 12款常规+1款隐藏',
        description: 'PVC搪胶工艺细节精致，高约8cm小巧可爱。12款常规+1款隐藏增加收集乐趣，独立盲盒包装拆盒惊喜感满满。配展示卡可展示，支持IP授权定制合作。',
        priceMin: 8.0, priceMax: 28.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['EN71', 'ASTM F963']),
        images: getImagePaths('毛绒公仔'),
        rating: 4.3, reviewCount: 9200,
      },
    ],
  },
  {
    nameZh: '汕头澄海宏达塑胶玩具厂',
    nameEn: 'Shantou Chenghai Hongda Plastic Toy Factory',
    location: '广东汕头 · 澄海区',
    contactName: '黄志伟',
    contactPhone: '187****8036',
    companyIntro: '遥控玩具专业制造商，2.4G遥控技术成熟，月产遥控车10万台出口全球',
    yearEstablished: 2005, employeeCount: 350,
    annualExportRevenue: 1500,
    certifications: JSON.stringify(['ISO 9001', 'EN71', 'ASTM F963', 'CCC', 'CE']),
    businessTags: JSON.stringify(['塑料玩具', '遥控车', '模型车', '回力车', '玩具车']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '南美', '中东', '非洲']),
    rating: 4.5, reviewCount: 3200, isVerified: true, type: 'factory',
    products: [
      {
        name: '遥控赛车 高速版 充电式',
        description: '2.4G遥控技术抗干扰强30米远距离操控，时速25km/h加速迅猛。四驱驱动越野爬坡能力强，锂电池充电环保续航30分钟。彩盒包装送礼体面。',
        priceMin: 15.0, priceMax: 58.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['EN71', 'ASTM F963', 'CCC']),
        images: getImagePaths('遥控车'),
        rating: 4.5, reviewCount: 9800,
      },
      {
        name: '回力惯性工程车 4辆套装',
        description: '安全环保ABS塑料材质边缘光滑不伤手，回力+惯性双驱动向后拉即走。推土机/挖掘机/翻斗车/压路机四件套，耐摔抗撞经久耐玩。男孩最爱工程车系列。',
        priceMin: 6.0, priceMax: 22.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['EN71', 'CCC']),
        images: getImagePaths('遥控车'),
        rating: 4.5, reviewCount: 16500,
      },
    ],
  },
  {
    nameZh: '汕头潮阳雅丽内衣厂',
    nameEn: 'Shantou Chaoyang Yali Underwear Factory',
    location: '广东汕头 · 潮阳区',
    contactName: '许永康',
    contactPhone: '133****5729',
    companyIntro: '潮阳内衣产业带代表企业，法国蕾丝面料供应商，Oeko-Tex认证安全环保',
    yearEstablished: 2008, employeeCount: 250,
    annualExportRevenue: 600,
    certifications: JSON.stringify(['ISO 9001', 'Oeko-Tex', 'BSCI']),
    businessTags: JSON.stringify(['内衣', '文胸', '内裤', '塑身衣', '睡衣']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '东南亚', '中东']),
    rating: 4.4, reviewCount: 1200, isVerified: true, type: 'factory',
    products: [
      {
        name: '蕾丝聚拢文胸 女士调整型',
        description: '法国蕾丝面料性感优雅触感细腻，钢圈聚拢设计塑造优美胸型上托效果好。加宽侧比有效收副乳防止外扩，多色多码A-D杯全覆盖。精致蕾丝透出小性感。',
        priceMin: 10.0, priceMax: 38.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex']),
        images: getImagePaths('睡衣'),
        rating: 4.4, reviewCount: 12000,
      },
    ],
  },
  {
    nameZh: '汕头金平华文文具厂',
    nameEn: 'Shantou Jinping Huawen Stationery Factory',
    location: '广东汕头 · 金平区',
    contactName: '郑国平',
    contactPhone: '151****9641',
    companyIntro: '学生文具专业制造商，食品级颜料安全无毒，产品通过EN71/CE双认证',
    yearEstablished: 2012, employeeCount: 80,
    annualExportRevenue: 200,
    certifications: JSON.stringify(['ISO 9001', 'EN71', 'CE']),
    businessTags: JSON.stringify(['文具', '铅笔', '蜡笔', '画本', '学生文具']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '中东', '非洲']),
    rating: 4.2, reviewCount: 480, isVerified: false, type: 'factory',
    products: [
      {
        name: '12色可水洗水彩笔 儿童绘画',
        description: '食品级颜料安全无毒宝宝误食也不怕，水洗配方弄脏衣服/皮肤一洗就掉。粗杆适合幼儿小手抓握，可画粗线/细线双头设计一笔两用。12色基础色满足启蒙绘画需求。',
        priceMin: 3.0, priceMax: 10.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['EN71', 'CE']),
        rating: 4.3, reviewCount: 8600,
      },
    ],
  },
  {
    nameZh: '汕头澄海宝乐玩具厂',
    nameEn: 'Shantou Chenghai Baole Toy Factory',
    location: '广东汕头 · 澄海区',
    contactName: '张伟杰',
    contactPhone: '138****2568',
    companyIntro: '婴儿玩具专业制造商，环保布料撕不烂可啃咬，EN71/ASTM F963认证',
    yearEstablished: 2010, employeeCount: 180,
    annualExportRevenue: 700,
    certifications: JSON.stringify(['EN71', 'ASTM F963', 'CCC', 'CE']),
    businessTags: JSON.stringify(['婴儿玩具', '早教玩具', '摇铃', '牙胶', '布书']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚']),
    rating: 4.4, reviewCount: 1500, isVerified: true, type: 'factory',
    products: [
      {
        name: '婴儿早教布书 6件套装',
        description: '环保布料安全无毒撕不烂可啃咬，内置响纸/BB器/小镜子等趣味元素吸引宝宝探索。6本不同主题涵盖动物/数字/颜色等认知内容，0-3岁早教启蒙必备。',
        priceMin: 8.0, priceMax: 28.0, currency: 'CNY', moq: 300,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['EN71', 'ASTM F963', 'CCC']),
        images: getImagePaths('婴儿玩具'),
        rating: 4.6, reviewCount: 11000,
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════
  //  南通 — 家纺 (4家)
  // ═════════════════════════════════════════════════════════════════════
  {
    nameZh: '南通梦之洁家纺有限公司',
    nameEn: 'Nantong Mengzhijie Home Textile Co., Ltd.',
    location: '江苏南通 · 通州区',
    contactName: '顾伟明',
    contactPhone: '139****7831',
    companyIntro: '南通家纺产业带领军企业，60支长绒棉贡缎工艺，Oeko-Tex认证出口欧美',
    yearEstablished: 2008, employeeCount: 280,
    annualExportRevenue: 1100,
    certifications: JSON.stringify(['ISO 9001', 'Oeko-Tex Standard 100', 'GOTS']),
    businessTags: JSON.stringify(['床上用品', '四件套', '被子', '枕头', '毛巾']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '澳大利亚', '中东']),
    rating: 4.6, reviewCount: 2200, isVerified: true, type: 'factory',
    products: [
      {
        name: '长绒棉四件套 60支 贡缎工艺',
        description: '100%新疆长绒棉日照充足纤维长，60支300根高支高密触感丝滑如绸缎。贡缎织造工艺表面光泽细腻，含被套+床单+枕套x2全套。多色可选卧室百搭。',
        priceMin: 68.0, priceMax: 268.0, currency: 'CNY', moq: 50,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex']),
        images: getImagePaths('枕头'),
        rating: 4.7, reviewCount: 8700,
      },
    ],
  },
  {
    nameZh: '南通大岛家纺有限公司',
    nameEn: 'Nantong Dadao Home Textile Co., Ltd.',
    location: '江苏南通 · 海门区',
    contactName: '张建国',
    contactPhone: '137****4902',
    companyIntro: '桑蚕丝被专业制造商，100%双宫桑蚕丝长丝绵，手工拉制传统工艺传承',
    yearEstablished: 2011, employeeCount: 200,
    annualExportRevenue: 650,
    certifications: JSON.stringify(['ISO 9001', 'Oeko-Tex Standard 100']),
    businessTags: JSON.stringify(['被子', '蚕丝被', '羽绒被', '夏被', '枕芯']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '澳大利亚']),
    rating: 4.5, reviewCount: 1300, isVerified: true, type: 'factory',
    products: [
      {
        name: '桑蚕丝被 100%双宫茧 1kg',
        description: '100%双宫桑蚕丝长丝绵丝质柔韧不断裂，手工拉制蓬松均匀不板结。透气保暖的同时亲肤防螨不过敏，1kg标准款四季通用。配纯棉被套方便拆洗。',
        priceMin: 180.0, priceMax: 520.0, currency: 'CNY', moq: 20,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex', 'GOTS']),
        images: getImagePaths('枕头'),
        rating: 4.7, reviewCount: 4200,
      },
    ],
  },
  {
    nameZh: '南通紫罗兰家纺科技股份有限公司',
    nameEn: 'Nantong Violet Home Textile Technology Co., Ltd.',
    location: '江苏南通 · 通州区',
    contactName: '陈永良',
    contactPhone: '136****6157',
    companyIntro: '家纺行业知名品牌，五星级酒店床品供应商，ISO14001环保认证企业',
    yearEstablished: 2006, employeeCount: 350,
    annualExportRevenue: 1500,
    certifications: JSON.stringify(['ISO 9001', 'ISO 14001', 'Oeko-Tex Standard 100']),
    businessTags: JSON.stringify(['床上用品', '婚庆家纺', '毛巾', '浴巾', '家居服']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚']),
    rating: 4.5, reviewCount: 2800, isVerified: true, type: 'factory',
    products: [
      {
        name: '全棉毛巾 6条装 五星级酒店标准',
        description: '100%新疆长绒棉毛巾柔软亲肤吸水性强，16支螺旋工艺蓬松厚实。五星级酒店品质标准的毛巾手感，灰色/白色/米色三色可选。35x75cm标准尺寸厚实耐用。',
        priceMin: 8.0, priceMax: 28.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex']),
        images: getImagePaths('枕头'),
        rating: 4.5, reviewCount: 12000,
      },
    ],
  },
  {
    nameZh: '南通雅兰家纺有限公司',
    nameEn: "Nantong Yalan Home Textile Co., Ltd.",
    location: '江苏南通 · 如东县',
    contactName: '周志远',
    contactPhone: '158****3849',
    companyIntro: '记忆棉/乳胶枕芯专业生产商，慢回弹技术成熟，Oeko-Tex认证安全环保',
    yearEstablished: 2013, employeeCount: 120,
    annualExportRevenue: 350,
    certifications: JSON.stringify(['ISO 9001', 'Oeko-Tex']),
    businessTags: JSON.stringify(['枕芯', '抱枕', '靠垫', '坐垫', '布艺']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '东南亚']),
    rating: 4.3, reviewCount: 650, isVerified: false, type: 'factory',
    products: [
      {
        name: '记忆棉护颈枕 人体工学',
        description: '慢回弹记忆棉内芯根据头颈曲线自适应承托，波浪形人体工学设计有效支撑颈椎。透气天丝面料触感凉滑可拆洗外套，适合颈椎不适/打鼾/睡眠质量差的人群。',
        priceMin: 15.0, priceMax: 58.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex']),
        images: getImagePaths('枕头'),
        rating: 4.4, reviewCount: 7800,
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════
  //  杭州 — 电商/服装/食品 (6家)
  // ═════════════════════════════════════════════════════════════════════
  {
    nameZh: '杭州伊芙丽服装有限公司',
    nameEn: 'Hangzhou Eifini Garment Co., Ltd.',
    location: '浙江杭州 · 余杭区',
    contactName: '钱伟强',
    contactPhone: '189****5027',
    companyIntro: '杭州女装产业带代表品牌，年开发新款1000+，与SHEIN/ZARA深度合作',
    yearEstablished: 2009, employeeCount: 300,
    annualExportRevenue: 1200,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'Oeko-Tex']),
    businessTags: JSON.stringify(['女装', '连衣裙', '针织衫', '大衣', '快时尚']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚']),
    rating: 4.5, reviewCount: 1900, isVerified: true, type: 'factory',
    products: [
      {
        name: '法式羊毛混纺大衣 中长款',
        description: '70%羊毛+30%聚酯纤维黄金配比混纺，挺括有型保暖不臃肿。双面尼工艺边缘干净利落无内衬也平整，简约H版型不挑身材经典不过时。单排扣设计百搭通勤。',
        priceMin: 85.0, priceMax: 268.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex']),
        images: getImagePaths('连衣裙'),
        rating: 4.5, reviewCount: 5200,
      },
      {
        name: '雪纺碎花衬衫 女款 春夏',
        description: '100%涤纶雪纺面料飘逸垂顺有仙气，碎花印花清新甜美。V领系带设计修饰脸型显气质，宽松版型遮肉舒适。多花色可选满足不同搭配需求，春夏必备单品。',
        priceMin: 18.0, priceMax: 55.0, currency: 'CNY', moq: 300,
        supportsDropShipping: true, supportsOEM: true,
        images: getImagePaths('衬衫'),
        rating: 4.4, reviewCount: 8200,
      },
    ],
  },
  {
    nameZh: '杭州素萃美妆有限公司',
    nameEn: 'Hangzhou Sucui Cosmetics Co., Ltd.',
    location: '浙江杭州 · 萧山区',
    contactName: '赵志远',
    contactPhone: '186****1394',
    companyIntro: '功效型护肤品ODM/OEM专业工厂，独立实验室配方研发，服务国内外品牌50+',
    yearEstablished: 2016, employeeCount: 120,
    annualExportRevenue: 350,
    certifications: JSON.stringify(['ISO 22716', 'GMPC', 'FDA', 'SGS']),
    businessTags: JSON.stringify(['护肤品', '精华液', '面霜', '眼霜', '纯天然护肤']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚']),
    rating: 4.4, reviewCount: 720, isVerified: false, type: 'factory',
    products: [
      {
        name: '玻尿酸精华液 30ml 三重补水',
        description: '三重玻尿酸配方（大分子锁水+中分子充盈+小分子渗透）层层补水直达肌底。清爽不黏腻的精华质地所有肤质都能用，滴管瓶设计精准控制用量。日常护肤必备。',
        priceMin: 8.0, priceMax: 38.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['FDA', 'SGS']),
        images: getImagePaths('精华液'),
        rating: 4.5, reviewCount: 14200,
      },
    ],
  },
  {
    nameZh: '杭州百草味食品有限公司',
    nameEn: 'Hangzhou Baicaowei Food Co., Ltd.',
    location: '浙江杭州 · 临平区',
    contactName: '孙国明',
    contactPhone: '150****8276',
    companyIntro: '休闲零食行业领军品牌，产品覆盖坚果/果干/糕点等品类，HACCP/BRC认证',
    yearEstablished: 2007, employeeCount: 500,
    annualExportRevenue: 2500,
    certifications: JSON.stringify(['ISO 22000', 'HACCP', 'FDA', 'BRC']),
    businessTags: JSON.stringify(['零食', '坚果', '果干', '糕点', '休闲食品']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚', '澳大利亚']),
    rating: 4.6, reviewCount: 4500, isVerified: true, type: 'factory',
    products: [
      {
        name: '每日坚果混合装 30包 750g',
        description: '6种坚果果干科学配比：腰果/巴旦木/核桃/榛子/蔓越莓/蓝莓。独立小包每包25g控制摄入量，每日一包营养均衡。充氮保鲜技术锁住新鲜酥脆口感。',
        priceMin: 18.0, priceMax: 48.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['HACCP', 'FDA']),
        images: getImagePaths('坚果'),
        rating: 4.7, reviewCount: 28000,
      },
    ],
  },
  {
    nameZh: '杭州万事利丝绸文化股份有限公司',
    nameEn: 'Hangzhou Wanshili Silk Culture Co., Ltd.',
    location: '浙江杭州 · 江干区',
    contactName: '周永康',
    contactPhone: '152****4613',
    companyIntro: '杭州丝绸行业领军品牌，16姆米真丝面料专家，GOTS有机认证传承丝绸文化',
    yearEstablished: 2000, employeeCount: 280,
    annualExportRevenue: 1200,
    certifications: JSON.stringify(['ISO 9001', 'Oeko-Tex Standard 100', 'GOTS', 'SGS']),
    businessTags: JSON.stringify(['丝绸', '丝巾', '真丝睡衣', '丝绸面料', '工艺品']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '中东']),
    rating: 4.6, reviewCount: 2600, isVerified: true, type: 'factory',
    products: [
      {
        name: '100%桑蚕丝丝巾 90x90cm',
        description: '100%桑蚕丝面料触感柔滑如云朵，16姆米真丝厚度适中飘逸有型。数码印花工艺色彩鲜艳层次丰富持久不褪色，手工卷边彰显精致做工。精美礼盒包装送礼体面。',
        priceMin: 28.0, priceMax: 98.0, currency: 'CNY', moq: 50,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex', 'GOTS']),
        rating: 4.6, reviewCount: 5200,
      },
    ],
  },
  {
    nameZh: '杭州电子商务供应链有限公司',
    nameEn: 'Hangzhou E-commerce Supply Chain Co., Ltd.',
    location: '浙江杭州 · 滨江区',
    contactName: '吴建平',
    contactPhone: '188****7295',
    companyIntro: '杭州电商产业带供应链服务商，专注直播选品和一件代发，合作主播超1000位',
    yearEstablished: 2018, employeeCount: 60,
    annualExportRevenue: 500,
    certifications: JSON.stringify(['ISO 9001']),
    businessTags: JSON.stringify(['电商供应链', '直播选品', '一件代发', '仓储配送', '品牌孵化']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚']),
    rating: 4.1, reviewCount: 380, isVerified: false, type: 'distributor',
    products: [
      {
        name: '直播选品样品包 美妆个护 20件套',
        description: '精选20款美妆个护热销样品，含面膜/精华/口红/洗面奶等爆款单品。每款配产品详情页和短视频素材包，主播可以直接开播带货。支持一件代发无需囤货。',
        priceMin: 88.0, priceMax: 268.0, currency: 'CNY', moq: 1,
        supportsDropShipping: true, supportsOEM: false,
        images: getImagePaths('护肤品'),
        rating: 4.0, reviewCount: 1200,
      },
    ],
  },
  {
    nameZh: '杭州瑞德宠物用品有限公司',
    nameEn: 'Hangzhou Ruide Pet Products Co., Ltd.',
    location: '浙江杭州 · 西湖区',
    contactName: '郑伟良',
    contactPhone: '135****6482',
    companyIntro: '宠物服饰用品专业制造商，摇粒绒保暖面料，产品远销日韩欧美宠物市场',
    yearEstablished: 2014, employeeCount: 90,
    annualExportRevenue: 280,
    certifications: JSON.stringify(['ISO 9001', 'FDA', 'SGS']),
    businessTags: JSON.stringify(['宠物用品', '宠物衣服', '宠物窝', '宠物玩具', '宠物配饰']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚']),
    rating: 4.3, reviewCount: 560, isVerified: false, type: 'factory',
    products: [
      {
        name: '宠物狗衣服 秋冬保暖 加绒款',
        description: '摇粒绒内里保暖效果加倍，弹性面料穿脱方便不束缚。后背贴心开口可穿牵引绳不影响遛狗，多尺码S-XL覆盖小型到大型犬。多色可选拍照上镜好看。',
        priceMin: 8.0, priceMax: 28.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        images: getImagePaths('宠物玩具'),
        rating: 4.3, reviewCount: 6500,
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════
  //  其他产业带补充 (18家)
  // ═════════════════════════════════════════════════════════════════════
  {
    nameZh: '浙江宠爱无限宠物用品有限公司',
    nameEn: 'Zhejiang Petlove Unlimited Co., Ltd.',
    location: '浙江温州 · 平阳县',
    contactName: '陈志荣',
    contactPhone: '159****3175',
    companyIntro: '宠物玩具专业制造商，天然橡胶+绒布材质，FDA食品级认证安全无毒',
    yearEstablished: 2016, employeeCount: 180,
    annualExportRevenue: 600,
    certifications: JSON.stringify(['ISO 9001', 'BSCI', 'FDA', 'REACH']),
    businessTags: JSON.stringify(['宠物玩具', '宠物窝具', '宠物服饰', '宠物牵引']),
    exportDestinations: JSON.stringify(['美国', '德国', '英国', '日本', '澳大利亚', '东南亚']),
    rating: 4.6, reviewCount: 1650, isVerified: true, type: 'factory',
    products: [
      {
        name: '耐咬宠物发声玩具 6件套',
        description: '天然橡胶+绒布材质安全耐咬不易破损，内置发声器激发狗狗捕猎天性。造型多样（骨头/球/刺猬/绳结等）6件套不重样。适合中大型犬磨牙解闷消耗精力。',
        priceMin: 8.0, priceMax: 28.0, currency: 'CNY', moq: 300,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['FDA', 'REACH']),
        images: getImagePaths('宠物玩具'),
        rating: 4.5, reviewCount: 12500,
      },
      {
        name: '可拆洗猫窝 四季通用',
        description: '加厚毛绒内衬保暖舒适猫咪最爱，可拆洗外套方便清洁。防潮底部保护地板免受潮气，椭圆形设计让猫咪有安全感。直径40/50/60cm三规格可选。',
        priceMin: 18.0, priceMax: 48.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        images: getImagePaths('猫窝'),
        rating: 4.4, reviewCount: 6800,
      },
    ],
  },
  {
    nameZh: '浙江天元宠物食品有限公司',
    nameEn: 'Zhejiang Tianyuan Pet Food Co., Ltd.',
    location: '浙江湖州 · 吴兴区',
    contactName: '林永强',
    contactPhone: '187****8036',
    companyIntro: '宠物食品专业生产商，50%高蛋白冻干工艺，BRC全球标准认证，出口欧美日韩',
    yearEstablished: 2014, employeeCount: 250,
    annualExportRevenue: 900,
    certifications: JSON.stringify(['ISO 22000', 'BRC', 'FDA', 'HACCP', 'GFSI']),
    businessTags: JSON.stringify(['宠物食品', '猫粮', '狗粮', '冻干零食', '宠物罐头']),
    exportDestinations: JSON.stringify(['美国', '欧盟', '日本', '韩国', '澳大利亚']),
    rating: 4.7, reviewCount: 2300, isVerified: true, type: 'factory',
    products: [
      {
        name: '全价冻干猫粮 鸡肉配方 1.5kg',
        description: '50%粗蛋白含量满足猫咪肉食天性，16%粗脂肪科学配方不肥胖。冻干生骨肉涂层适口性超赞挑食猫也爱吃，0谷物配方减少过敏。添加益生菌+牛磺酸护肠胃护心脏。',
        priceMin: 28.0, priceMax: 78.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['FDA', 'HACCP']),
        images: getImagePaths('猫粮'),
        rating: 4.7, reviewCount: 9200,
      },
    ],
  },
  {
    nameZh: '湖州山水户外用品有限公司',
    nameEn: 'Huzhou Shanshui Outdoor Products Co., Ltd.',
    location: '浙江湖州 · 安吉县',
    contactName: '钱伟强',
    contactPhone: '133****5729',
    companyIntro: '户外野营装备专业制造商，液压自动速开帐篷技术领先，CN/CE认证畅销全球',
    yearEstablished: 2013, employeeCount: 160,
    annualExportRevenue: 500,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'SGS']),
    businessTags: JSON.stringify(['户外用品', '帐篷', '折叠桌椅', '野营装备', '户外家具']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '澳大利亚', '日本', '东南亚']),
    rating: 4.4, reviewCount: 1100, isVerified: false, type: 'factory',
    products: [
      {
        name: '自动速开帐篷 3-4人 防雨',
        description: '液压自动速开黑科技3秒即可完成搭建，210T涤纶面料PU2000mm防水涂层中雨也不怕。含地钉和风绳防风稳固，收纳后直径70cm方便携带。家庭野营入门首选。',
        priceMin: 48.0, priceMax: 168.0, currency: 'CNY', moq: 50,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE']),
        rating: 4.4, reviewCount: 4300,
      },
    ],
  },
  {
    nameZh: '河北沧州恒达体育用品有限公司',
    nameEn: 'Cangzhou Hengda Sporting Goods Co., Ltd.',
    location: '河北沧州 · 盐山县',
    contactName: '赵志远',
    contactPhone: '151****9641',
    companyIntro: '体育器材专业制造商，铸铁/包胶哑铃工艺成熟，产品通过CE/SGS认证畅销欧美',
    yearEstablished: 2007, employeeCount: 300,
    annualExportRevenue: 800,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'SGS']),
    businessTags: JSON.stringify(['体育用品', '哑铃', '杠铃', '健身器材', '运动护具']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '东南亚', '南美', '中东']),
    rating: 4.4, reviewCount: 1600, isVerified: true, type: 'factory',
    products: [
      {
        name: '可调节哑铃套装 20kg 包胶',
        description: '包胶工艺静音不伤地板环保无味，可调节重量2.5-20kg满足不同训练阶段。防滑握把锻炼更安全舒适，配收纳底座整齐不凌乱。家庭健身/健身房皆可用。',
        priceMin: 35.0, priceMax: 128.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['CE', 'SGS']),
        images: getImagePaths('哑铃'),
        rating: 4.5, reviewCount: 8800,
      },
    ],
  },
  {
    nameZh: '天津康师傅食品有限公司',
    nameEn: 'Tianjin Master Kong Food Co., Ltd.',
    location: '天津 · 经济技术开发区',
    contactName: '孙志远',
    contactPhone: '138****2568',
    companyIntro: '中国方便食品行业龙头，年产值超百亿，产品覆盖全球50多个国家和地区',
    yearEstablished: 1996, employeeCount: 3000,
    annualExportRevenue: 12000,
    certifications: JSON.stringify(['ISO 22000', 'HACCP', 'BRC', 'FDA', 'IFS']),
    businessTags: JSON.stringify(['方便面', '饮料', '糕点', '休闲食品', '食品加工']),
    exportDestinations: JSON.stringify(['美国', '加拿大', '欧洲', '澳大利亚', '东南亚', '中东']),
    rating: 4.7, reviewCount: 25000, isVerified: true, type: 'factory',
    products: [
      {
        name: '康师傅红烧牛肉面 24包/箱',
        description: '经典红烧口味畅销30年，面条劲道爽滑口感如现煮。浓缩高汤包+真实蔬菜包真材实料，出厂日期新鲜保质期充足。24包/箱批发装适合超市/便利店/食堂。',
        priceMin: 2.5, priceMax: 5.0, currency: 'CNY', moq: 1000,
        supportsDropShipping: false, supportsOEM: false,
        certifications: JSON.stringify(['HACCP', 'FDA']),
        images: getImagePaths('坚果'),
        rating: 4.6, reviewCount: 120000,
      },
    ],
  },
  {
    nameZh: '河南想念食品股份有限公司',
    nameEn: 'Henan Xiangnian Food Co., Ltd.',
    location: '河南南阳 · 卧龙区',
    contactName: '周国良',
    contactPhone: '139****7831',
    companyIntro: '中国挂面行业领军品牌，日加工小麦1200吨，年产值超20亿畅销全国及海外',
    yearEstablished: 1998, employeeCount: 1500,
    annualExportRevenue: 500,
    certifications: JSON.stringify(['ISO 22000', 'HACCP', 'BRC', 'FDA']),
    businessTags: JSON.stringify(['挂面', '面粉', '方便面', '粮油', '食品加工']),
    exportDestinations: JSON.stringify(['美国', '加拿大', '欧洲', '日本', '韩国', '澳大利亚']),
    rating: 4.6, reviewCount: 8800, isVerified: true, type: 'factory',
    products: [
      {
        name: '龙须挂面 1kg*10包 家庭装',
        description: '精选优质小麦粉传统工艺制作，面条细如龙须晶莹剔透。煮后不糊汤不断条口感爽滑，1kg大包装实惠够一家三口吃一周。10包/箱批发更划算。',
        priceMin: 3.0, priceMax: 6.0, currency: 'CNY', moq: 500,
        supportsDropShipping: true, supportsOEM: false,
        certifications: JSON.stringify(['HACCP', 'FDA']),
        rating: 4.5, reviewCount: 32000,
      },
    ],
  },
  {
    nameZh: '江苏恒力化纤有限公司',
    nameEn: 'Jiangsu Hengli Chemical Fiber Co., Ltd.',
    location: '江苏苏州 · 吴江区',
    contactName: '吴国平',
    contactPhone: '137****4902',
    companyIntro: '中国化纤行业龙头企业，年产能超500万吨，产品应用于纺织/服装/工业等领域',
    yearEstablished: 1994, employeeCount: 5000,
    annualExportRevenue: 30000,
    certifications: JSON.stringify(['ISO 9001', 'ISO 14001', 'Oeko-Tex', 'GOTS']),
    businessTags: JSON.stringify(['化纤', '涤纶', '锦纶', '面料', '纺织原料']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚', '中东']),
    rating: 4.5, reviewCount: 3600, isVerified: true, type: 'factory',
    products: [
      {
        name: '涤纶FDY长丝 75D/36F 纺织原料',
        description: '优质涤纶FDY全拉伸丝强力高稳定性好，75D/36F规格适合织造各种面料。染色均匀色牢度高不易褪色，适用于服装面料/家纺/工业用布等。整车批发价格从优。',
        priceMin: 6.0, priceMax: 15.0, currency: 'CNY', moq: 1000,
        supportsDropShipping: false, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex', 'GOTS']),
        rating: 4.5, reviewCount: 5200,
      },
    ],
  },
  {
    nameZh: '山东鲁花集团有限公司',
    nameEn: 'Shandong Luhua Group Co., Ltd.',
    location: '山东烟台 · 莱阳市',
    contactName: '黄伟荣',
    contactPhone: '136****6157',
    companyIntro: '中国花生油领军品牌，5S物理压榨工艺开创者，年销售额超300亿',
    yearEstablished: 1992, employeeCount: 8000,
    annualExportRevenue: 5000,
    certifications: JSON.stringify(['ISO 22000', 'HACCP', 'BRC', 'FDA', 'HALAL']),
    businessTags: JSON.stringify(['食用油', '花生油', '调味品', '食品加工', '粮油']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚', '中东']),
    rating: 4.8, reviewCount: 32000, isVerified: true, type: 'factory',
    products: [
      {
        name: '5S压榨花生油 5L 家庭装',
        description: '5S物理压榨工艺保留花生原香和营养，纯正花生油炒菜倍儿香。5L大容量满足全家烹饪需求，无添加无勾兑纯正100%花生油。适合煎炒烹炸各种中式烹饪。',
        priceMin: 45.0, priceMax: 88.0, currency: 'CNY', moq: 100,
        supportsDropShipping: false, supportsOEM: false,
        certifications: JSON.stringify(['HACCP', 'HALAL']),
        rating: 4.8, reviewCount: 85000,
      },
    ],
  },
  {
    nameZh: '广州鲁班建筑装饰材料有限公司',
    nameEn: 'Guangzhou Luban Building Materials Co., Ltd.',
    location: '广东广州 · 天河区',
    contactName: '陈志荣',
    contactPhone: '158****3849',
    companyIntro: '建筑装饰材料综合供应商，板材/涂料/五金全品类，服务过万科/碧桂园等大型地产',
    yearEstablished: 2005, employeeCount: 200,
    annualExportRevenue: 800,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'SGS', '十环认证']),
    businessTags: JSON.stringify(['板材', '涂料', '五金', '装饰材料', '建材']),
    exportDestinations: JSON.stringify(['东南亚', '中东', '非洲', '澳大利亚', '南美']),
    rating: 4.3, reviewCount: 1200, isVerified: false, type: 'distributor',
    products: [
      {
        name: 'E0级生态板 18mm 免漆板',
        description: 'E0级环保标准甲醛释放量低于0.05mg/m3，实木多层芯材稳定性好不易变形。双面免漆饰面花色丰富无需上漆，18mm标准厚度适合衣柜/橱柜/书柜定制。',
        priceMin: 68.0, priceMax: 168.0, currency: 'CNY', moq: 100,
        supportsDropShipping: false, supportsOEM: false,
        certifications: JSON.stringify(['CE', 'SGS', '十环认证']),
        rating: 4.3, reviewCount: 4200,
      },
    ],
  },
  {
    nameZh: '深圳喜茶供应链管理有限公司',
    nameEn: 'Shenzhen Heytea Supply Chain Management Co., Ltd.',
    location: '广东深圳 · 南山区',
    contactName: '林永强',
    contactPhone: '189****5027',
    companyIntro: '新茶饮原料供应链服务商，茶叶/果酱/小料全品类覆盖，服务5000+茶饮门店',
    yearEstablished: 2016, employeeCount: 350,
    annualExportRevenue: 1200,
    certifications: JSON.stringify(['ISO 22000', 'HACCP', 'FDA', 'HALAL']),
    businessTags: JSON.stringify(['茶叶', '茶饮原料', '果酱', '奶精', '饮品原料']),
    exportDestinations: JSON.stringify(['美国', '加拿大', '东南亚', '欧洲', '澳大利亚']),
    rating: 4.5, reviewCount: 2100, isVerified: true, type: 'distributor',
    products: [
      {
        name: '茉莉绿茶 特级 500g 茶饮专用',
        description: '精选福建春茶茶胚，七窨茉莉花茶工艺花香浓郁。茶汤清亮黄绿口感鲜爽回甘，500g大包装茶饮店专用。适合制作茉莉绿茶/水果茶/奶茶等新式茶饮。',
        priceMin: 18.0, priceMax: 45.0, currency: 'CNY', moq: 50,
        supportsDropShipping: true, supportsOEM: false,
        certifications: JSON.stringify(['HACCP', 'FDA']),
        rating: 4.6, reviewCount: 7800,
      },
    ],
  },
  {
    nameZh: '安徽三只松鼠食品有限公司',
    nameEn: 'Anhui Three Squirrels Food Co., Ltd.',
    location: '安徽芜湖 · 弋江区',
    contactName: '吴永康',
    contactPhone: '186****1394',
    companyIntro: '中国休闲零食电商领导品牌，年销售额超百亿，连续5年全网零食销量第一',
    yearEstablished: 2012, employeeCount: 2500,
    annualExportRevenue: 3000,
    certifications: JSON.stringify(['ISO 22000', 'HACCP', 'BRC', 'FDA']),
    businessTags: JSON.stringify(['零食', '坚果', '肉脯', '糕点', '果干']),
    exportDestinations: JSON.stringify(['美国', '加拿大', '欧洲', '日本', '韩国', '东南亚']),
    rating: 4.7, reviewCount: 28000, isVerified: true, type: 'factory',
    products: [
      {
        name: '夏威夷果仁 奶油味 500g',
        description: '超大颗粒夏威夷果仁饱满圆润，奶油味香甜酥脆一口一颗停不下来。充氮保鲜包装锁住酥脆口感，500g家庭装追剧/聚会/办公室零食首选。颗颗开口易剥。',
        priceMin: 18.0, priceMax: 42.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: false,
        certifications: JSON.stringify(['HACCP', 'FDA']),
        images: getImagePaths('坚果'),
        rating: 4.7, reviewCount: 56000,
      },
    ],
  },
  {
    nameZh: '江苏红豆实业股份有限公司',
    nameEn: 'Jiangsu Hongdou Industrial Co., Ltd.',
    location: '江苏无锡 · 锡山区',
    contactName: '郑建军',
    contactPhone: '150****8276',
    companyIntro: '中国男装行业知名品牌，从面料到成衣全产业链，Oeko-Tex认证品质保障',
    yearEstablished: 1995, employeeCount: 3500,
    annualExportRevenue: 8000,
    certifications: JSON.stringify(['ISO 9001', 'ISO 14001', 'Oeko-Tex', 'SGS']),
    businessTags: JSON.stringify(['男装', '衬衫', '西服', '羽绒服', '内衣', '居家服']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚']),
    rating: 4.6, reviewCount: 15000, isVerified: true, type: 'factory',
    products: [
      {
        name: '男士免烫衬衫 长袖 商务款',
        description: '100%全棉免烫面料抗皱易打理免熨烫，穿着一天也不皱挺括有型。经典尖领设计正式商务场合得体，袖口可调节设计佩戴手表方便。多色多码S-4XL全覆盖。',
        priceMin: 35.0, priceMax: 128.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex']),
        images: getImagePaths('衬衫'),
        rating: 4.6, reviewCount: 22000,
      },
    ],
  },
  {
    nameZh: '北京华联超市供应链有限公司',
    nameEn: 'Beijing Hualian Supermarket Supply Chain Co., Ltd.',
    location: '北京 · 大兴区',
    contactName: '刘国栋',
    contactPhone: '152****4613',
    companyIntro: '大型连锁超市供应链平台，SKU超50000个，覆盖食品/日化/家居全品类配送',
    yearEstablished: 2003, employeeCount: 800,
    annualExportRevenue: 1500,
    certifications: JSON.stringify(['ISO 9001', 'ISO 22000', 'HACCP', 'BRC']),
    businessTags: JSON.stringify(['超市供应链', '食品配送', '日化用品', '家居百货', '冷链物流']),
    exportDestinations: JSON.stringify(['中国全境', '东南亚']),
    rating: 4.3, reviewCount: 2800, isVerified: true, type: 'distributor',
    products: [
      {
        name: '维达超韧抽纸 3层 100抽x24包',
        description: '100%原生木浆制造柔软韧性强，3层加厚湿水不易破。100抽x24包整箱囤货家庭装超值，无香精无荧光剂婴儿也能安心用。整箱批发送超市/便利店。',
        priceMin: 18.0, priceMax: 32.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: false,
        certifications: JSON.stringify(['FDA']),
        rating: 4.5, reviewCount: 65000,
      },
    ],
  },
  {
    nameZh: '广州酒家集团食品有限公司',
    nameEn: 'Guangzhou Restaurant Group Food Co., Ltd.',
    location: '广东广州 · 荔湾区',
    contactName: '周志远',
    contactPhone: '188****7295',
    companyIntro: '中华老字号食品集团，广州酒家旗下，年产值超30亿，月饼年销量全国领先',
    yearEstablished: 1997, employeeCount: 2000,
    annualExportRevenue: 1200,
    certifications: JSON.stringify(['ISO 22000', 'HACCP', 'BRC', 'FDA', 'HALAL']),
    businessTags: JSON.stringify(['月饼', '糕点', '腊味', '速冻食品', '预制菜']),
    exportDestinations: JSON.stringify(['美国', '加拿大', '欧洲', '东南亚', '澳大利亚']),
    rating: 4.8, reviewCount: 18000, isVerified: true, type: 'factory',
    products: [
      {
        name: '双黄白莲蓉月饼 4个装 礼盒',
        description: '精选湘莲手工研磨莲蓉细腻香滑，2颗咸蛋黄起沙流油金黄透亮。传统广式月饼工艺皮薄馅足，精美礼盒包装送人体面。中秋佳节送礼必备经典之选。',
        priceMin: 38.0, priceMax: 128.0, currency: 'CNY', moq: 50,
        supportsDropShipping: true, supportsOEM: false,
        certifications: JSON.stringify(['HACCP', 'FDA']),
        rating: 4.8, reviewCount: 32000,
      },
    ],
  },
  {
    nameZh: '上海老凤祥珠宝有限公司',
    nameEn: 'Shanghai Laofengxiang Jewelry Co., Ltd.',
    location: '上海 · 黄浦区',
    contactName: '陈志荣',
    contactPhone: '135****6482',
    companyIntro: '百年民族珠宝品牌始创1848年，中国黄金珠宝行业第一品牌，品牌价值超500亿',
    yearEstablished: 1990, employeeCount: 5000,
    annualExportRevenue: 5000,
    certifications: JSON.stringify(['ISO 9001', 'SGS', '国家金银制品质量监督检验']),
    businessTags: JSON.stringify(['黄金饰品', '铂金', '钻石', '翡翠', '珠宝首饰']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '东南亚', '中东']),
    rating: 4.9, reviewCount: 68000, isVerified: true, type: 'brand',
    products: [
      {
        name: '足金貔貅手串 999足金 约3g',
        description: '999足金材质保值传家，貔貅造型招财纳福寓意美好。手工精细打磨金光闪闪，含红玛瑙隔珠点缀更显精致。送长辈/朋友/自己都合适，配有证书和精美首饰盒。',
        priceMin: 1280.0, priceMax: 2880.0, currency: 'CNY', moq: 10,
        supportsDropShipping: false, supportsOEM: false,
        certifications: JSON.stringify(['SGS', '国家金银制品质量监督检验']),
        rating: 4.9, reviewCount: 45000,
      },
    ],
  },
  {
    nameZh: '浙江正泰电器股份有限公司',
    nameEn: 'Zhejiang CHINT Electric Co., Ltd.',
    location: '浙江温州 · 乐清市',
    contactName: '林永强',
    contactPhone: '159****3175',
    companyIntro: '中国低压电器行业龙头，年销售额超800亿，产品出口全球140多个国家和地区',
    yearEstablished: 1997, employeeCount: 30000,
    annualExportRevenue: 50000,
    certifications: JSON.stringify(['ISO 9001', 'CE', 'UL', 'CCC', 'CB', 'RoHS']),
    businessTags: JSON.stringify(['低压电器', '断路器', '接触器', '继电器', '配电箱']),
    exportDestinations: JSON.stringify(['美国', '德国', '英国', '法国', '意大利', '日本']),
    rating: 4.8, reviewCount: 45000, isVerified: true, type: 'factory',
    products: [
      {
        name: '空气开关 DZ47-63 C63 2P',
        description: 'DZ47-63系列小型断路器品质可靠，C63额定电流63A家用总闸够用。2极2P设计控制火线+零线，分断能力6000A安全有保障。正泰正品全国联保。',
        priceMin: 8.0, priceMax: 22.0, currency: 'CNY', moq: 200,
        supportsDropShipping: true, supportsOEM: false,
        certifications: JSON.stringify(['CE', 'UL', 'CCC']),
        rating: 4.7, reviewCount: 28000,
      },
    ],
  },
  {
    nameZh: '湖南华联瓷业股份有限公司',
    nameEn: 'Hunan Hualian China Industry Co., Ltd.',
    location: '湖南醴陵 · 陶瓷工业园',
    contactName: '郑伟良',
    contactPhone: '187****8036',
    companyIntro: '醴陵陶瓷产业带龙头企业，日用瓷年产量超1亿件，宜家/沃尔玛核心供应商',
    yearEstablished: 2003, employeeCount: 2800,
    annualExportRevenue: 6000,
    certifications: JSON.stringify(['ISO 9001', 'FDA', 'LFGB', 'SGS', 'ISO 14001']),
    businessTags: JSON.stringify(['日用陶瓷', '餐具', '茶具', '咖啡具', '陶瓷工艺品']),
    exportDestinations: JSON.stringify(['美国', '欧洲', '日本', '韩国', '澳大利亚', '中东']),
    rating: 4.7, reviewCount: 5800, isVerified: true, type: 'factory',
    products: [
      {
        name: '色釉陶瓷餐具 16头 北欧风',
        description: '高温色釉工艺安全无毒无铅无镉，釉面光亮易清洗。北欧简约设计风格百搭现代家居，16头含碗碟杯勺满足4人家庭日常。礼盒包装送礼自用都体面。',
        priceMin: 28.0, priceMax: 88.0, currency: 'CNY', moq: 100,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['FDA', 'LFGB']),
        images: getImagePaths('餐具'),
        rating: 4.6, reviewCount: 8800,
      },
    ],
  },
  {
    nameZh: '新疆天山毛纺织股份有限公司',
    nameEn: 'Xinjiang Tianshan Wool Textile Co., Ltd.',
    location: '新疆乌鲁木齐 · 高新区',
    contactName: '吴永康',
    contactPhone: '133****5729',
    companyIntro: '中国羊绒行业领军企业，新疆优质山羊绒原料直供，产品出口欧洲日韩高端市场',
    yearEstablished: 1999, employeeCount: 1200,
    annualExportRevenue: 2500,
    certifications: JSON.stringify(['ISO 9001', 'Oeko-Tex Standard 100', 'GOTS', 'SGS']),
    businessTags: JSON.stringify(['羊绒衫', '羊毛衫', '羊绒围巾', '针织衫', '毛纺织']),
    exportDestinations: JSON.stringify(['美国', '意大利', '英国', '法国', '日本', '韩国']),
    rating: 4.7, reviewCount: 4200, isVerified: true, type: 'factory',
    products: [
      {
        name: '100%纯羊绒衫 圆领 女款',
        description: '100%优质山羊绒原料取自新疆天山牧场，手感柔软细腻贴身穿也舒适。经典圆领百搭不过时，轻盈保暖一件抵三件。多色可选S-XL尺码，秋冬必备品质之选。',
        priceMin: 120.0, priceMax: 380.0, currency: 'CNY', moq: 50,
        supportsDropShipping: true, supportsOEM: true,
        certifications: JSON.stringify(['Oeko-Tex', 'GOTS']),
        images: getImagePaths('卫衣'),
        rating: 4.8, reviewCount: 6800,
      },
    ],
  },
  {
    nameZh: '云南普洱茶集团',
    nameEn: 'Yunnan Puer Tea Group Co., Ltd.',
    location: '云南西双版纳 · 勐海县',
    contactName: '周国良',
    contactPhone: '151****9641',
    companyIntro: '普洱茶行业龙头企业，自有古树茶园5000亩，年加工能力3000吨出口全球',
    yearEstablished: 2001, employeeCount: 600,
    annualExportRevenue: 1200,
    certifications: JSON.stringify(['ISO 22000', 'HACCP', 'FDA', '有机认证', 'HALAL']),
    businessTags: JSON.stringify(['普洱茶', '红茶', '绿茶', '茶叶', '茶礼']),
    exportDestinations: JSON.stringify(['日本', '韩国', '欧洲', '美国', '东南亚']),
    rating: 4.7, reviewCount: 6800, isVerified: true, type: 'factory',
    products: [
      {
        name: '勐海熟普茶饼 357g 2018年',
        description: '选用勐海茶区大叶种晒青毛茶原料，传统渥堆发酵工艺陈化6年。汤色红浓明亮口感醇厚顺滑陈香明显，357g标准七子饼茶经典规格。收藏品饮两相宜。',
        priceMin: 38.0, priceMax: 168.0, currency: 'CNY', moq: 50,
        supportsDropShipping: true, supportsOEM: false,
        certifications: JSON.stringify(['FDA', '有机认证']),
        images: getImagePaths('坚果'),
        rating: 4.7, reviewCount: 12500,
      },
    ],
  },
];

// ═════════════════════════════════════════════════════════════════════
//  物流服务商 (8家)
// ═════════════════════════════════════════════════════════════════════
const logisticsProviders = [
  {
    name: '中国海运集团',
    routes: JSON.stringify([{ from: '深圳', to: '洛杉矶', type: '海运' }, { from: '宁波', to: '汉堡', type: '海运' }, { from: '上海', to: '悉尼', type: '海运' }]),
    priceMin: 800, priceMax: 3500, avgTransitDays: 28,
    coverCountries: JSON.stringify(['美国', '德国', '英国', '荷兰', '澳大利亚', '日本']),
    rating: 4.3,
  },
  {
    name: 'DHL国际快递',
    routes: JSON.stringify([{ from: '中国', to: '全球', type: '快递' }]),
    priceMin: 120, priceMax: 400, avgTransitDays: 5,
    coverCountries: JSON.stringify(['全球220+国家']),
    rating: 4.8,
  },
  {
    name: 'FedEx国际优先',
    routes: JSON.stringify([{ from: '中国', to: '全球', type: '快递' }]),
    priceMin: 130, priceMax: 380, avgTransitDays: 4,
    coverCountries: JSON.stringify(['全球200+国家']),
    rating: 4.7,
  },
  {
    name: 'UPS国际快递',
    routes: JSON.stringify([{ from: '中国', to: '全球', type: '快递' }]),
    priceMin: 140, priceMax: 420, avgTransitDays: 4,
    coverCountries: JSON.stringify(['全球200+国家']),
    rating: 4.7,
  },
  {
    name: '云途物流',
    routes: JSON.stringify([{ from: '深圳', to: '欧洲', type: '空铁' }, { from: '深圳', to: '美国', type: '空运' }]),
    priceMin: 25, priceMax: 90, avgTransitDays: 10,
    coverCountries: JSON.stringify(['美国', '英国', '德国', '法国', '意大利', '西班牙']),
    rating: 4.3,
  },
  {
    name: '燕文物流',
    routes: JSON.stringify([{ from: '中国', to: '全球', type: '经济' }]),
    priceMin: 8, priceMax: 50, avgTransitDays: 15,
    coverCountries: JSON.stringify(['全球150+国家']),
    rating: 4.0,
  },
  {
    name: '递四方速递',
    routes: JSON.stringify([{ from: '深圳', to: '全球', type: '空运' }, { from: '香港', to: '全球', type: '空运' }]),
    priceMin: 20, priceMax: 80, avgTransitDays: 9,
    coverCountries: JSON.stringify(['美国', '加拿大', '英国', '德国', '法国', '澳大利亚']),
    rating: 4.2,
  },
  {
    name: '华翰物流',
    routes: JSON.stringify([{ from: '深圳', to: '美国', type: '空运' }, { from: '广州', to: '欧洲', type: '铁路' }]),
    priceMin: 15, priceMax: 60, avgTransitDays: 13,
    coverCountries: JSON.stringify(['美国', '英国', '德国', '法国', '波兰', '捷克']),
    rating: 4.1,
  },
];

// ═════════════════════════════════════════════════════════════════════
//  销售渠道 (16个)
// ═════════════════════════════════════════════════════════════════════
const channels = [
  { name: 'Amazon', type: 'platform', coverRegions: JSON.stringify(['北美', '欧洲', '日本', '澳大利亚', '中东', '印度']), entryRequirements: '企业营业执照，品牌注册或授权，月流水≥$10,000' },
  { name: 'TikTok Shop', type: 'platform', coverRegions: JSON.stringify(['美国', '英国', '东南亚', '中东', '欧盟']), entryRequirements: '企业营业执照，有TikTok运营能力，短视频或直播经验' },
  { name: 'Temu', type: 'platform', coverRegions: JSON.stringify(['美国', '加拿大', '欧洲', '澳大利亚', '新西兰']), entryRequirements: '企业营业执照，全托管模式，工厂优先，有价格竞争力' },
  { name: '1688 跨境', type: 'platform', coverRegions: JSON.stringify(['全球']), entryRequirements: '企业营业执照，支持跨境代发，有出口资质' },
  { name: 'Shopee', type: 'platform', coverRegions: JSON.stringify(['东南亚', '台湾', '巴西', '墨西哥']), entryRequirements: '企业或个人执照，SKU≥50，有当地仓储优先' },
  { name: 'Lazada', type: 'platform', coverRegions: JSON.stringify(['东南亚', '菲律宾', '印尼', '泰国', '马来西亚']), entryRequirements: '企业营业执照，品牌授权，支持Lazada物流' },
  { name: '阿里国际站', type: 'platform', coverRegions: JSON.stringify(['全球']), entryRequirements: '企业营业执照，出口资质，年费制会员' },
  { name: 'Walmart', type: 'platform', coverRegions: JSON.stringify(['美国', '加拿大', '墨西哥']), entryRequirements: '企业营业执照，有美国公司主体或WFS仓储' },
  { name: 'SHEIN', type: 'platform', coverRegions: JSON.stringify(['美国', '欧洲', '中东', '澳大利亚']), entryRequirements: '企业营业执照，工厂或品牌方，小单快反能力' },
  { name: 'Mercado Libre', type: 'platform', coverRegions: JSON.stringify(['巴西', '墨西哥', '阿根廷', '智利', '哥伦比亚']), entryRequirements: '企业营业执照，拉丁美洲市场经验' },
  { name: 'AliExpress', type: 'platform', coverRegions: JSON.stringify(['全球', '俄罗斯', '巴西', '西班牙', '法国']), entryRequirements: '企业或个人执照，支持国际小包物流' },
  { name: 'eBay', type: 'platform', coverRegions: JSON.stringify(['全球', '美国', '英国', '德国', '澳大利亚']), entryRequirements: '企业或个人帐号，有跨境销售经验' },
  { name: 'Wish', type: 'platform', coverRegions: JSON.stringify(['美国', '欧洲', '加拿大', '澳大利亚']), entryRequirements: '企业营业执照，价格敏感型产品优先' },
  { name: 'OZON', type: 'platform', coverRegions: JSON.stringify(['俄罗斯', '哈萨克斯坦', '白俄罗斯']), entryRequirements: '企业营业执照，有对俄物流渠道' },
  { name: 'Coupang', type: 'platform', coverRegions: JSON.stringify(['韩国', '台湾']), entryRequirements: '企业营业执照，韩国KC认证或台湾BSMI认证' },
  { name: 'Noon', type: 'platform', coverRegions: JSON.stringify(['沙特', '阿联酋', '埃及']), entryRequirements: '企业营业执照，中东市场经验，HALAL/SASO认证' },
];

// ═════════════════════════════════════════════════════════════════════
//  主逻辑
// ═════════════════════════════════════════════════════════════════════
async function main() {
  const shouldDrop = process.argv.includes('--drop');

  if (shouldDrop) {
    console.log('清空现有数据...');
    await prisma.aggregatedReview.deleteMany();
    await prisma.product.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.category.deleteMany();
    await prisma.logisticsProvider.deleteMany();
    await prisma.channel.deleteMany();
    console.log('已清空所有表');
  }

  // 1. 插入分类
  console.log('\n插入分类...');
  const categoryMap = {};
  for (const cat of categories) {
    if (!cat.parentName) {
      const created = await prisma.category.create({
        data: { name: cat.name, type: cat.type, icon: cat.icon, sortOrder: cat.sortOrder },
      });
      categoryMap[cat.name] = created.id;
    }
  }
  for (const cat of categories) {
    if (cat.parentName) {
      const parentId = categoryMap[cat.parentName];
      if (parentId) {
        const created = await prisma.category.create({
          data: { name: cat.name, type: cat.type, icon: cat.icon, sortOrder: cat.sortOrder, parentId },
        });
        categoryMap[cat.name] = created.id;
      }
    }
  }
  console.log(`已插入 ${Object.keys(categoryMap).length} 个分类`);

  // 2. 插入供应商+商品
  console.log('\n插入供应商和商品...');
  let totalSuppliers = 0;
  let totalProducts = 0;
  let totalReviews = 0;

  for (const supplierData of suppliers) {
    const { products, ...supplierFields } = supplierData;

    const supplier = await prisma.supplier.create({
      data: {
        ...supplierFields,
        ...getSupplierEnhancements(supplierFields.businessTags),
      },
    });
    totalSuppliers++;

    // 为供应商生成口碑数据
    const supplierReviews = generateReviews(String(supplier.id), 'supplier', supplierFields.rating, supplierFields.nameZh, JSON.parse(supplierFields.businessTags));
    for (const review of supplierReviews) {
      await prisma.aggregatedReview.create({ data: review });
      totalReviews++;
    }

    // 商品和商品口碑
    for (const productData of products) {
      // 确定分类
      let categoryId = null;
      const productName = productData.name;

      if (/耳机|音箱|音质|蓝牙/.test(productName)) categoryId = categoryMap['手机配件'];
      else if (/充电宝|数据线|手机壳|钢化膜|充电器|手机支架|GaN|充电支架/.test(productName)) categoryId = categoryMap['手机配件'];
      else if (/智能手表|智能手环|智能眼镜|VR|AR|运动手表/.test(productName)) categoryId = categoryMap['智能穿戴'];
      else if (/空气炸|榨汁|加湿|扇|取暖|电饭煲|煮锅|养生壶|电水壶|微波炉|电磁炉|蒸烤|电炖|电饼铛/.test(productName)) categoryId = categoryMap['小家电'];
      else if (/连衣裙|T恤|女装|衬衫|卫衣|大衣|雪纺|毛呢/.test(productName)) categoryId = categoryMap['女装'];
      else if (/运动服|瑜伽|健身|运动套装/.test(productName)) categoryId = categoryMap['运动服装'];
      else if (/童装|婴儿|爬服|儿童|宝宝/.test(productName)) categoryId = categoryMap['童装'];
      else if (/沙发|茶几|家具|床头|办公椅|会议椅|电竞椅|人体工学/.test(productName)) categoryId = categoryMap['客厅家具'];
      else if (/床垫|床架|床品|乳胶床/.test(productName)) categoryId = categoryMap['卧室家具'];
      else if (/收纳|保温饭盒|厨房|保鲜|硅胶/.test(productName)) categoryId = categoryMap['厨房用品'];
      else if (/饰品|项链|耳环|发夹|锁骨链|珍珠|戒指|手链|发圈|胸针|耳钉/.test(productName)) categoryId = categoryMap['饰品配件'];
      else if (/笔记本|笔芯|钢笔|水彩笔|文具|铅笔|蜡笔|画本|水笔|包装纸/.test(productName)) categoryId = categoryMap['文具办公'];
      else if (/玩具|积木|盲盒|公仔|遥控|娃娃|泡泡机|水枪|布书|摇铃|牙胶|工程车/.test(productName)) categoryId = categoryMap['玩具潮玩'];
      else if (/宠物|猫|狗|猫窝|猫粮|狗粮|冻干/.test(productName)) categoryId = categoryMap['宠物用品'];
      else if (/马桶|花洒|水龙头|浴室|卫浴|淋浴/.test(productName)) categoryId = categoryMap['卫浴陶瓷'];
      else if (/灯|照明|LED|吸顶|灯带|灯泡/.test(productName)) categoryId = categoryMap['灯具照明'];
      else if (/食品|海鲜|虾|鱼|辣酱|调味|零食|坚果|饼干|糖果|海苔|脆片|酒|啤酒|白酒|茶叶|咖啡|粮油|油|面条|挂面/.test(productName)) categoryId = categoryMap['食品加工'];
      else if (/鞋|跑鞋|拖鞋|凉鞋|运动鞋/.test(productName)) categoryId = productName.includes('拖鞋') ? categoryMap['拖鞋凉鞋'] : categoryMap['运动鞋'];
      else if (/眼镜|太阳镜|镜片/.test(productName)) categoryId = categoryMap['饰品配件'];
      else if (/四件套|毛巾|被子|枕芯|蚕丝被|床品|枕|坐垫|靠垫|抱枕/.test(productName)) categoryId = categoryMap['家纺布艺'];
      else if (/背包|双肩|箱包|拉杆箱|手提包|钱包|皮包|女包|斜挎|丝巾/.test(productName)) categoryId = categoryMap['箱包皮具'];
      else if (/帐篷|户外|露营/.test(productName)) categoryId = categoryMap['日用百货'];
      else if (/哑铃|健身|体育|瑜伽垫/.test(productName)) categoryId = categoryMap['日用百货'];
      else if (/面膜|洗面奶|精华|唇釉|口红|护肤|化妆品|面霜|眼霜|防晒/.test(productName)) categoryId = categoryMap['日用百货'];
      else if (/洗衣机|空调|除湿|净化|冰箱|冷柜/.test(productName)) categoryId = categoryMap['小家电'];
      else if (/行车记录|车载|汽车/.test(productName)) categoryId = categoryMap['日用百货'];
      else if (/打火机|烟具/.test(productName)) categoryId = categoryMap['日用百货'];
      else if (/PCB|PCBA|电路板|电子元|喇叭|扬声器|电源适配|无人机/.test(productName)) categoryId = categoryMap['消费电子'];
      else if (/五金|工具|螺丝|紧固件|合页|门夹|锁|管材|水管|PPR|PVC|球阀|法兰|阀门|插座|墙壁开关|板材|石材|花岗岩|大理石/.test(productName)) categoryId = categoryMap['五金工具'];
      else if (/陶瓷|餐具|碗|盘|茶具|花瓶/.test(productName)) categoryId = categoryMap['卫浴陶瓷'];
      else if (/面料|纺织|涤纶|化纤/.test(productName)) categoryId = categoryMap['家纺布艺'];
      else if (/服装|内衣|保暖|家居服|袜子|文胸/.test(productName)) categoryId = categoryMap['男装'];
      else if (/抽纸|纸巾|纸制品|洗洁精|洗衣凝珠|清洁/.test(productName)) categoryId = categoryMap['日用百货'];
      else if (/窗帘/.test(productName)) categoryId = categoryMap['家纺布艺'];
      else if (/月饼|糕点|腊味|预制菜/.test(productName)) categoryId = categoryMap['食品加工'];
      else if (/黄金|戒指|手串|珠宝/.test(productName)) categoryId = categoryMap['饰品配件'];
      else if (/插排|排插|转换器/.test(productName)) categoryId = categoryMap['五金工具'];

      const product = await prisma.product.create({
        data: {
          ...productData,
          supplierId: supplier.id,
          categoryId,
          specs: getProductSpecs(productData.name, productData.description),
        },
      });
      totalProducts++;

      // 商品口碑 (3-8条)
      const productReviews = generateReviews(String(product.id), 'product', productData.rating, productData.name, JSON.parse(supplierFields.businessTags));
      for (const review of productReviews) {
        await prisma.aggregatedReview.create({ data: review });
        totalReviews++;
      }
    }
  }
  console.log(`已插入 ${totalSuppliers} 个供应商`);
  console.log(`已插入 ${totalProducts} 个商品`);
  console.log(`已插入 ${totalReviews} 条口碑数据`);

  // 3. 物流服务商
  console.log('\n插入物流服务商...');
  for (const lp of logisticsProviders) {
    await prisma.logisticsProvider.create({ data: lp });
  }
  console.log(`已插入 ${logisticsProviders.length} 个物流服务商`);

  // 4. 销售渠道
  console.log('\n插入销售渠道...');
  for (const ch of channels) {
    await prisma.channel.create({ data: ch });
  }
  console.log(`已插入 ${channels.length} 个销售渠道`);

  // 统计
  const stats = {
    suppliers: totalSuppliers,
    products: totalProducts,
    reviews: totalReviews,
    categories: Object.keys(categoryMap).length,
    logistics: logisticsProviders.length,
    channels: channels.length,
  };

  console.log('\n' + '='.repeat(50));
  console.log('种子数据插入完成！');
  console.log('='.repeat(50));
  for (const [key, val] of Object.entries(stats)) {
    console.log(`  ${key}: ${val}`);
  }
  console.log('='.repeat(50) + '\n');
}

main()
  .catch((e) => {
    console.error('种子数据插入失败:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
