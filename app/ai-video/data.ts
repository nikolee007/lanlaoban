import {
  FiCamera, FiUser, FiStar, FiShoppingBag, FiEdit3, FiGlobe,
  FiSmartphone, FiMonitor, FiMove, FiImage,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'

export type VideoType = 'restaurant' | 'trust' | 'review' | 'brand' | 'knowledge' | 'crossborder'
export type Step = 'select' | 'form' | 'result'
export type Tab = 'shots' | 'script' | 'guide' | 'todo'

export interface ScriptBlock {
  t0: string; t1: string; title: string; line: string
  emotion: string; tip: string; shotType: string; shotDesc: string
}

export interface VideoTypeInfo {
  icon: IconType
  title: string
  desc: string
  color: string
  bg: string
  demo: string
  brand: string
  sell: string
}

export const INFO: Record<VideoType, VideoTypeInfo> = {
  restaurant: {
    icon: FiCamera, title: '餐饮探店·老板IP', desc: '餐厅老板打造人设吸引同城流量',
    color: '#FF6034', bg: '#FFF0EB', demo: '招牌红烧牛肉面',
    brand: '老李牛肉面馆', sell: '三代祖传秘方,每天现熬8小时,牛肉大块',
  },
  trust: {
    icon: FiUser, title: '人设信任·个人IP', desc: '创业者/手艺人建立信任',
    color: '#2563EB', bg: '#EFF6FF', demo: '定制西服',
    brand: '张师傅西装定制', sell: '20年经验,全手工制作,终身免费修改',
  },
  review: {
    icon: FiStar, title: '好物测评·带货种草', desc: '产品测评带货',
    color: '#8B5CF6', bg: '#F5F3FF', demo: '智能扫地机器人',
    brand: '智净X1 Pro', sell: '激光导航,5000Pa吸力,自动集尘',
  },
  brand: {
    icon: FiShoppingBag, title: '品牌故事·匠心传承', desc: '工厂/老字号品牌故事',
    color: '#059669', bg: '#ECFDF5', demo: '手工皮具',
    brand: '一川手工皮具', sell: '进口植鞣革,纯手工缝制,越用越好看',
  },
  knowledge: {
    icon: FiEdit3, title: '知识口播·专家IP', desc: '知识博主输出价值',
    color: '#D97706', bg: '#FFFBEB', demo: '跨境电商课程',
    brand: '老李跨境说', sell: '10年经验,月销百万实操,0基础可学',
  },
  crossborder: {
    icon: FiGlobe, title: '跨境电商 · 带货种草',
    desc: '适合跨境电商卖家、TikTok Shop商家、独立站运营',
    color: '#0EA5E9', bg: '#F0F9FF', demo: '便携式榨汁机 USB-C充电',
    brand: 'FreshBlend Pro',
    sell: 'USB-C充电便携、30秒鲜榨、304不锈钢刀片',
  },
}

export const SCRIPTS: Record<VideoType, ScriptBlock[]> = {
  restaurant: [
    { t0: '0:00', t1: '0:08', title: '痛点反问钩子',
      line: '你是不是也觉得，现在在外面吃饭，越来越难吃到一碗真材实料的面了？菜单上写得天花乱坠，端上来一看——冷冻肉、合成汤、预制菜一加热就给你端上来了。花七八十块钱，吃的全是科技与狠活。',
      emotion: '😣 被戳中→"说的就是我的遭遇，外面吃饭确实经常踩雷"',
      tip: '开头直接抛痛点反问，手机前置自拍，眼神看镜头',
      shotType: '自拍', shotDesc: '胸口以上近景口播，手机举平视，眼神看镜头，背景是厨房烟火气' },
    { t0: '0:08', t1: '0:18', title: '共情故事',
      line: '我开店15年，这条街上的店换了一波又一波，倒了一批又一批。很多同行为了省成本，用添加剂提鲜、用冷冻肉充数、用浓汤宝兑汤。但我老李不干那事。开店第一天的底线——我自己不吃的东西，绝不端给客人。',
      emotion: '😌 产生信任→"这个老板实在，15年还能坚持底线，不容易"',
      tip: '语气放缓，带点无奈又坚定，行走镜头展示厨房',
      shotType: '行走', shotDesc: '手持轻微晃动，边走边拍厨房环境，拍到灶台上熬汤的真材实料' },
    { t0: '0:18', t1: '0:28', title: '三点避坑',
      line: '做餐饮想长久，三点缺一不可：第一，食材新鲜是底线——冷冻肉和新鲜肉，吃一口就分得出来。第二，手艺传统是灵魂——该熬的汤不能省时间，该揉的面不能图省事。第三，良心经营是根本——你骗客人一次，他永远不会再回来。这三点做不到，再便宜也没用。',
      emotion: '🤔 觉得有道理→"三点确实说到心坎里了，做餐饮的核心就是这个"',
      tip: '语速加快，坚定有力，配合手指比划',
      shotType: '自拍', shotDesc: '回到正面近景口播，用手势比划一二三，背景虚化' },
    { t0: '0:28', t1: '0:38', title: '差异化展示',
      line: '所以我家的面，汤是牛骨加老鸡熬足8小时的，汤白味浓，喝完不口干——因为没有味精。牛肉是澳洲牛腱子用手撕的，不用机器切，纤维不断口感才好。面条是自己和的，加了鸡蛋和碱水，劲道弹牙。成本比别家高30%，但吃过的人十个有九个都成了回头客。',
      emotion: '😋 想尝试→"说得我都饿了，确实和外面那些预制菜不一样"',
      tip: '切特写展示食材和成品，语速放缓',
      shotType: '特写', shotDesc: '特写镜头拍牛肉纹理、汤沸腾冒泡、面条劲道弹跳，每个2-3秒' },
    { t0: '0:38', t1: '0:45', title: '私信收口',
      line: '想知道一碗真正的好面该是什么味？别的地方你吃不到。评论区打"想吃"，我请你来店里免费尝一碗，不好吃不要钱。地址在左下角，同城的兄弟来就完了。',
      emotion: '😍 行动冲动→"免费尝一碗不吃亏，评论一下也没啥损失"',
      tip: '微笑收尾，真诚邀请，眼神指向评论区',
      shotType: '自拍', shotDesc: '回到正面，微笑对着镜头，手指向评论区，画面叠加店铺地址和定位' },
  ],
  trust: [
    { t0: '0:00', t1: '0:06', title: '钩子反问',
      line: '你花5000块买的西装，穿出来像卖保险的？问题不在钱，在不合身。大部分成品西装是给标准身材做的，你但凡肩膀宽一点、手臂长一点、腰围粗一点，穿上去就是借来的衣服。',
      emotion: '😅 被扎心→"确实，我买的西装就是不合身"',
      tip: '开场直接扎痛点，眼神坚定',
      shotType: '自拍', shotDesc: '胸口近景，手机举平视，自然光从侧面来' },
    { t0: '0:06', t1: '0:15', title: '行业乱象拆解',
      line: '现在的西装市场，全是快消品在冲量。面料差、做工糙、版型千篇一律，工厂流水线一天出几百件，能合谁的身？大多数人买西装就两个结局：不是挂在衣柜里落灰，就是穿出去被人看出来不合身。两三千块钱打水漂。',
      emotion: '😤 恍然大悟→"原来不是我身材的问题，是衣服的问题"',
      tip: '语气透露出对行业现状的无奈，走动着说',
      shotType: '行走', shotDesc: '在挂满西装的衣架间行走，边走边拍，自然光' },
    { t0: '0:15', t1: '0:23', title: '自我人设',
      line: '我做定制西装22年了。从16岁当学徒，从最基础的锁扣眼学起，到现在自己开店带了七个徒弟。我的原则很简单，也从来没变过——不合身的西装，绝不交到客户手里。做不到这一条的，不配叫裁缝。',
      emotion: '😌 敬意→"22年老师傅，这门手艺值得尊重"',
      tip: '语速放缓，真诚，眼神有力',
      shotType: '自拍', shotDesc: '回到工作台前，边说边整理手边的工具，背景是半成品西装' },
    { t0: '0:23', t1: '0:32', title: '专业价值',
      line: '定制和成品最大的区别在哪？37个身体数据。从肩宽到胸围、从腰围到袖长、从前胸宽到后背宽，多一厘米不行，少一厘米也不行。一套西装从量体到交货要用28天，光手工扣眼就要一整天——一个扣眼一个老师傅缝一上午。这才是西装该有的做法。',
      emotion: '🤩 觉得专业→"37个数据、28天工期，确实讲究，这人靠谱"',
      tip: '语速平稳专业，手势辅助说明',
      shotType: '特写', shotDesc: '手部特写拍量体、裁缝、锁扣眼细节，每个2-3秒' },
    { t0: '0:32', t1: '0:38', title: '收口引流',
      line: '想要一套真正合身的西装？评论区扣"定制"，我免费帮你量体出方案。合不合身，你试了就知道。我是老张，一个靠谱的裁缝。',
      emotion: '🥰 想咨询→"免费量体出方案，试试也没什么损失"',
      tip: '微笑收尾，真诚邀请',
      shotType: '自拍', shotDesc: '对着镜头微笑，叠加工室地址联系方式' },
  ],
  review: [
    { t0: '0:00', t1: '0:05', title: '钩子反问',
      line: '你家的扫地机器人，是不是也经常撞墙、卡住、扫不干净？买回来用了三天就后悔了，放在墙角落灰？这不是你的问题，是大多数扫地机根本就没做好。',
      emotion: '😣 共鸣→"太真实了，我家的扫地机就是个智障"',
      tip: '用用户的痛点开场',
      shotType: '自拍', shotDesc: '坐在客厅对着镜头说，背景有机器人' },
    { t0: '0:05', t1: '0:14', title: '乱象拆解',
      line: '市面上千元级的扫地机，我测评了不下20台。大多数的问题是：导航不准——撞墙撞到怀疑人生。吸力虚标——标5000Pa实际连猫毛都吸不干净。避障靠撞——地上的数据线、拖鞋、狗屎，它不识别，直接碾过去。三千块的机子和五百块的差别真不大。',
      emotion: '😤 恍然大悟→"原来不是我买得便宜的问题，是行业都这样"',
      tip: '语速平实，数据感',
      shotType: '行走', shotDesc: '走到产品展示区，拿起不同产品对比' },
    { t0: '0:14', t1: '0:22', title: '真实测评',
      line: '这台智净X1 Pro，我用了三个月才敢说。激光导航建图5分钟搞定，全屋走到位了一次成型。5000Pa吸力是实测数据，不是虚标——酱油倒在地上一遍过去干干净净，你去看那个污水箱就知道了。避障用的是结构光，地上的拖鞋、电线、宠物，全部绕开走。骗不了我的，每一台我都用数据说话。',
      emotion: '🤔 半信半疑→"真的假的？三个月实测数据应该假不了"',
      tip: '展示真实使用数据',
      shotType: '特写', shotDesc: '俯拍机器人工作过程，切到手机APP展示建图数据和清扫记录' },
    { t0: '0:22', t1: '0:28', title: '价值判断',
      line: '三千块的价位段，能做到这个配置的，目前市面上我一个都没找到。激光导航加5000Pa吸力加自动集尘加结构光避障，这一个配置放在别家至少要五千起步。不是我替它说话，是它的性价比摆在那里，你对比一下就知道。',
      emotion: '😯 被说服→"这么一比确实划算，三千块买五千的配置"',
      tip: '对比式表达，语速坚定不移',
      shotType: '自拍', shotDesc: '对着镜头分析，手势比划出数据对比' },
    { t0: '0:28', t1: '0:32', title: '收口',
      line: '最近想换扫地机的，评论区打"想看细节"，我发你三个月实测对比图。关注我，买东西不踩坑，买东西之前先看一眼我的测评。',
      emotion: '🤝 行动→"发个评论拿对比图也不亏，先关注再说"',
      tip: '自然收尾',
      shotType: '自拍', shotDesc: '微笑对着镜头，指向评论区' },
  ],
  brand: [
    { t0: '0:00', t1: '0:08', title: '痛点焦虑',
      line: '你有没有这种感觉？想买一个好包，贵的买不起，便宜的拿不出手。两千块买个所谓轻奢，背出去懂的人一眼就看出来——五金件是塑料镀的、皮料是二层贴面的、缝线三个月就开了。花那个冤枉钱，不如不买。',
      emotion: '😣 被说中→"确实，买包这件事我一直很纠结"',
      tip: '娓娓道来，引发共鸣，语速舒缓',
      shotType: '自拍', shotDesc: '坐在工作台前，暖光打亮半边脸，沉稳开场' },
    { t0: '0:08', t1: '0:18', title: '行业剖析',
      line: '为什么市面上的包要么贵得离谱要么差得看不下去？因为真正用心做产品的人越来越少了。大家都在比价格、比营销、比谁请的明星大，没人比手艺。一块皮料从生皮到植鞣染色再到成品，三个月打底。有哪个品牌愿意为品质等三个月？没有，他们只等得起三天。',
      emotion: '😤 产生认同→"说得好，现在确实没人在意品质了"',
      tip: '语速平稳，有理有据',
      shotType: '行走', shotDesc: '在工作室里边走边展示墙上挂着的皮料和工具' },
    { t0: '0:18', t1: '0:30', title: '三点干货',
      line: '如何一眼辨别一个好皮具？看三点就够了。第一看皮料——真正的植鞣革会呼吸、会变色、越用越有光泽，用十年跟新的一样。第二看缝线——马鞍缝法双针交叉，断一根线另一根还撑着，不会整个散开。第三看过边——手工封边要打磨三遍以上，摸上去像婴儿皮肤一样光滑，不是机器随便滚一圈的那种粗糙边。',
      emotion: '🤔 学到东西→"原来要看这三个地方，以前都不知道"',
      tip: '手势配合，专业自信，语速稍快',
      shotType: '自拍+特写', shotDesc: '回到工作台前比划三点，每点切特写展示对应工艺细节' },
    { t0: '0:30', t1: '0:40', title: '品牌理念',
      line: '我做的东西不追潮流，不赶旺季。一个邮差包，设计稿画了两个月，推翻了四版才满意。打版打了六次才定版——每一次打版出来都觉得这里不对那里不对，拆了重来。我不想做爆款，我做的是十年后你还愿意背的包。你愿意等，我就愿意做。',
      emotion: '😌 感动/认可→"这个匠人精神，现在太少见了"',
      tip: '坚定有力，传达品牌理念',
      shotType: '自拍+特写', shotDesc: '边说边展示设计稿到成品的对比，表情认真而坚定' },
    { t0: '0:40', t1: '0:45', title: '私信引流',
      line: '想知道什么才是值得花钱入手的好东西？关注我，看我每天怎么把一个包从皮料到成品做出来。评论区打"定制"，我优先给你免费出设计方案。',
      emotion: '🥰 想关注→"关注看看，说不定下一个包就在这里买了"',
      tip: '真诚收尾，微笑',
      shotType: '自拍', shotDesc: '对着镜头微笑，叠加工室信息' },
  ],
  knowledge: [
    { t0: '0:00', t1: '0:05', title: '认知冲击',
      line: '90%做跨境电商的人，第一步就踩坑了——你以为第一步是选品？是开店？是找供应链？都不是。第一步是搞清楚你自己的姿势对不对。大部分人上来就干，干完三个月发现钱没赚到，货压了一仓库，平台罚款交了一堆。',
      emotion: '😯 被吸引→"难道我就是那90%？先听听他怎么说"',
      tip: '语气坚定有力，制造紧迫感',
      shotType: '自拍', shotDesc: '坐书桌前正面镜头，背景是书架' },
    { t0: '0:05', t1: '0:14', title: '真话拆解',
      line: '大部分人是怎么做的？打开1688搜"什么好卖"，看到别人卖得好就跟。大错特错。你先要想清楚三个问题，而且顺序不能乱：第一，你的目标市场在哪——欧美还是东南亚，不同市场的玩法完全不同。第二，你选哪个平台——TikTok、亚马逊、Shopee，每个平台的红利期和规则天差地别。第三，你有什么优势——是供应链便宜、还是你会拍视频、还是你懂运营。三个问题不想清楚，后面全白干。',
      emotion: '🤔 思考→"三个问题我一个都没想清楚，确实是我太急了"',
      tip: '语速适中，干货感，手势比划',
      shotType: '自拍', shotDesc: '正面口播，用手势比划一二三' },
    { t0: '0:14', t1: '0:22', title: '方法干货',
      line: '我做跨境电商10年，踩过的坑比大多数人走的路还多。最后总结了一个公式照着做就不会错：成功等于供应链能力乘以平台选择乘以运营执行力。注意，是乘号不是加号——其中任何一个环节是零，结果就是零。而且顺序不能乱：先搞定供应链，再选平台，最后才是学运营。顺序搞反了？那就是去交学费。你交过几次就知道了。',
      emotion: '😲 被说服→"乘号这个说法有道理，一个不行全白搭"',
      tip: '加重语气强调乘号和顺序的重要性',
      shotType: '自拍+白板', shotDesc: '说话同时用手势，切到白板边写边讲' },
    { t0: '0:22', t1: '0:30', title: '实操案例',
      line: '上个月刚带的一个学员，零基础、英语只会说hello和thank you，三个月做到月销5万美金。他做的是什么？TikTok加家居小件，一件利润8到12美金，一天发一两百单。不是他有多厉害，是路走对了——先找供应链，再选TikTok美区，最后学拍视频投流。路对了，谁都能做出来。',
      emotion: '😍 被激励→"零基础都能做到月销5万，那我也可以试试"',
      tip: '用具体数据说话，增加可信度',
      shotType: '自拍+录屏', shotDesc: '切手机录屏展示后台数据，再切回人脸' },
    { t0: '0:30', t1: '0:35', title: '收口',
      line: '想学怎么做跨境电商，不想走弯路？评论区打"跨境"，我把这套实操落地流程完整发你。关注我，少走弯路，少交学费。',
      emotion: '🤝 行动冲动→"发个评论就能拿到实操流程，不亏"',
      tip: '干练收尾',
      shotType: '自拍', shotDesc: '对着镜头干练收尾，手指向评论区' },
  ],
  crossborder: [
    { t0: '0:00', t1: '0:10', title: '痛点反问钩子',
      line: '你还在花20块买一杯加糖精兑水的假果汁？告诉你一个很多人不知道的秘密——花一半的钱，喝到真正新鲜健康的鲜榨果汁，而且随时随地都能喝。今天带你看一个我从TikTok上挖到的宝藏。',
      emotion: '😯 好奇→"20块的果汁居然是糖精兑的？一半的钱能喝到真的？"',
      tip: '开场直接抛反差痛点，语速轻快，眼神有神',
      shotType: '自拍', shotDesc: '胸口以上近景口播，眼神看镜头，背景简约明亮' },
    { t0: '0:10', t1: '0:28', title: '开箱展示',
      line: '今天开箱这个FreshBlend Pro便携榨汁机，注意看三个关键细节：第一，USB-C充电——这意味着你不需要带专用充电器，手机充电线、笔记本充电线插上就能充，车上、办公室、户外都能充。第二，30秒鲜榨——早上起来切个水果丢进去，30秒一杯鲜榨，刷牙洗脸的时间就好了，完全不影响出门。第三，304不锈钢刀片——不是那种便宜的普通钢材，是食品级的304不锈钢，耐用好清洗，水冲一下就好了。',
      emotion: '🤩 被种草→"USB-C充电确实方便，30秒也太快了吧"',
      tip: '语速轻快，开箱感，展示产品细节',
      shotType: '特写+俯拍', shotDesc: '俯拍开箱过程，手指依次点出三个细节：USB-C接口、杯体、刀片，每个细节3-5秒' },
    { t0: '0:28', t1: '0:50', title: '场景应用',
      line: '这个东西最厉害的不是参数，是你生活里处处用得上。办公室放一个，下午两三点困了，打个橙汁喝，比喝咖啡健康多了，维生素C直接补充。健身房包里装一个，练完来杯蛋白奶昔，杯子一盖就能走，不用在健身房水池边洗半天。周末露营带上它——你见过户外喝鲜榨果汁的吗？只要有电的地方就能用，车上点烟器都能充。什么样的生活品质？就是这个。',
      emotion: '😌 代入感→"我办公室/健身房确实需要一个，露营喝果汁也太爽了吧"',
      tip: '场景切换自然，语气带入真实使用感受',
      shotType: '行走+特写', shotDesc: '在不同场景中切换：办公室书桌→健身房更衣室→户外营地，手持搅拌杯展示工作状态' },
    { t0: '0:50', t1: '1:15', title: '对比测评',
      line: '和市面同类产品硬碰硬比一下。某品牌A，卖八百块——不能充电，只能插着电源用，出门就是一块废铁。某品牌B，五百块——刀片是普通钢材，打两三个月就钝了，打出来的果汁有金属味。你再看看FreshBlend Pro，三百多块，USB-C充电、304不锈钢刀片、30秒出汁，还多了个便携杯盖。不是一个级别的产品，价格只有它们的一半。你选哪个？',
      emotion: '🤔 被说服→"八百块不能充电？五百块有金属味？三百多这个确实香"',
      tip: '语速加快，对比增强说服力，手势辅助',
      shotType: '自拍+俯拍', shotDesc: '正面镜头对比分析，切俯拍展示三台机器并排放置，展示参数差异' },
    { t0: '1:15', t1: '1:35', title: '口碑见证',
      line: '上个月在TikTok上发了条视频，就是拍这个榨汁机，播放量50万，卖了差不多3000多台。评论区全是在说好话——有人用了两个月回来说电池还很耐用，充一次电能打七八杯。有人说比家里两千块的破壁机还好清洗，水一冲就干净了。还有人说办公室同事看了全下单了，现在整层楼一人一个。你自己看看这个评论区。',
      emotion: '😍 从众心理→"3000多个人买了，评价都这么好，那应该真不错"',
      tip: '语速自然，带着分享真实的语气',
      shotType: '自拍+录屏', shotDesc: '对着镜头分享，切手机屏展示TikTok后台数据和评论区好评截图' },
    { t0: '1:35', t1: '1:50', title: '价格锚定',
      line: '我给你们谈了个粉丝专属价，比官网便宜60块。多少钱？三百出头。一个充电宝的价格，你买一个充电宝用两年，这个榨汁机你也至少用两年。算下来一天不到一块钱，你喝一杯外面的果汁就二十块钱，每一天回本，之后全是省下来的。你的健康值多少钱？',
      emotion: '😲 觉得划算→"三百出头确实不贵，一天不到一块钱，少喝一杯外面的果汁就回本了"',
      tip: '语速放缓，突出性价比，用手势比划算账',
      shotType: '自拍', shotDesc: '正面镜头，表情真诚，用手势比划价格对比，展示专属价标签' },
    { t0: '1:50', t1: '2:00', title: '行动号召',
      line: '链接在下方，直接下单就行。或者去TikTok搜FreshBlend看更多真实使用视频。评论区告诉我你最想打什么果汁，我抽一个人免费送你一台。关注我，TikTok跨境好物不踩雷，每个品我都亲自用过才推荐。',
      emotion: '🔥 立刻行动→"链接就在下面，还有抽奖机会，现在下单"',
      tip: '语速干脆，行动导向，微笑收尾',
      shotType: '自拍', shotDesc: '对着镜头微笑收尾，指向评论区/屏幕下方的链接，手势干脆利落' },
  ],
}

// ── Shot template types and data ──
interface CamSetup { label: string; subjectPos: string; camPos: string; desc: string }
export interface ShotTpl {
  id: string; name: string; icon: IconType; desc: string
  angles: string[]; tips: string[]
  phoneSetup: CamSetup[]; camSetup: CamSetup[]; phoneIllus: string
}

export const SHOT_TEMPLATES: ShotTpl[] = [
  {
    id: 'selfie', name: '自拍机位', icon: FiSmartphone,
    desc: '手机前置，老板对镜头说话',
    angles: ['正面平视', '略微俯拍15°', '侧45°'],
    tips: ['手机举到与眼睛同高', '看镜头不是看屏幕', '自然光最好不背光'],
    phoneSetup: [
      { label: '手持自拍', subjectPos: '面对镜头站立', camPos: '手机前置，手臂伸直',
        desc: '适合：对镜头直接说话的段落，有亲切感' },
      { label: '支架自拍', subjectPos: '站在手机前1.5米', camPos: '手机支架固定，镜头调至眼睛高度',
        desc: '适合：长段口播，双手自由做手势' },
    ],
    camSetup: [
      { label: '相机正面', subjectPos: '站/坐在镜头前1.5-2m', camPos: '相机+三脚架，镜头与眼平齐',
        desc: '标准口播机位，背景虚化效果更好' },
    ],
    phoneIllus: '自拍',
  },
  {
    id: 'standing', name: '站姿机位', icon: FiMove,
    desc: '站着展示全身/半身',
    angles: ['正面全身', '正面半身', '侧身45°半身'],
    tips: ['双脚与肩同宽', '手自然摆动', '背景有纵深感'],
    phoneSetup: [
      { label: '手机正面', subjectPos: '站在手机前2-3m', camPos: '手机竖屏横拍，镜头在胸高位置',
        desc: '适合：展示全身着装/站姿口播' },
    ],
    camSetup: [
      { label: '相机正面', subjectPos: '站在背景前1m', camPos: '相机三脚架，镜头高1.2-1.4m',
        desc: '适合：站姿口播/产品展示' },
    ],
    phoneIllus: '站立',
  },
  {
    id: 'sitting', name: '坐姿机位', icon: FiMonitor,
    desc: '坐着说话，访谈口播',
    angles: ['沙发正坐', '吧台高脚凳', '办公桌后'],
    tips: ['身体前倾有亲和力', '双手放桌面', '背景别太乱'],
    phoneSetup: [
      { label: '正面坐姿', subjectPos: '坐在桌前/沙发上', camPos: '手机放在桌面上靠支架，镜头与脸平齐',
        desc: '适合：知识分享/访谈类内容' },
    ],
    camSetup: [
      { label: '相机正面', subjectPos: '坐在桌前', camPos: '相机+三脚架在正前方1.5m，镜头与眼平',
        desc: '标准访谈机位，背景有书架/墙壁' },
    ],
    phoneIllus: '坐姿',
  },
  {
    id: 'walking', name: '走动机位', icon: FiMove,
    desc: '边走边讲展示环境',
    angles: ['跟拍正面', '侧面跟拍', '前方引导背对'],
    tips: ['走慢30%', '先对镜头说再走', '手持稳定器'],
    phoneSetup: [
      { label: '手持跟拍', subjectPos: '边走边讲', camPos: '手机稳定器手持，镜头一直对准人',
        desc: '最有沉浸感的拍法，边走边介绍环境' },
    ],
    camSetup: [
      { label: '滑轨跟拍', subjectPos: '沿着固定路线走', camPos: '相机在滑轨上平行移动跟拍',
        desc: '电影感最强，需要滑轨设备' },
    ],
    phoneIllus: '走动',
  },
  {
    id: 'overhead', name: '俯拍机位', icon: FiMonitor,
    desc: '从上往下拍美食/开箱',
    angles: ['正上方90°', '斜上方45°', '侧上方30°'],
    tips: ['手机横过来正上方拍', '光线均匀无阴影', '背景用纯色桌布'],
    phoneSetup: [
      { label: '手机正上方90°', subjectPos: '桌面物品/食材等', camPos: '手机固定在高处支架上，正对下方',
        desc: '适合：美食展示/开箱/产品测评' },
    ],
    camSetup: [
      { label: '相机俯拍架', subjectPos: '桌面操作台', camPos: '相机安装在专业俯拍架上，正对操作台',
        desc: '固定机位，保证光线均匀' },
    ],
    phoneIllus: '俯拍',
  },
  {
    id: 'closeup', name: '特写机位', icon: FiStar,
    desc: '拍产品/食材/手工细节',
    angles: ['产品特写10-15cm', '手部动作特写', '表情肩部以上'],
    tips: ['用后置镜头更清晰', '靠近再靠近', '慢动作更高级'],
    phoneSetup: [
      { label: '手持特写', subjectPos: '物品放在桌上', camPos: '手机后置镜头，距物品10-15cm，对焦清晰',
        desc: '手稳或靠桌上拍，近到能看见纹理' },
    ],
    camSetup: [
      { label: '微距镜头', subjectPos: '物品在灯光下', camPos: '相机+微距镜头，距物品5-10cm',
        desc: '需要专用微距镜头，拍极致的纹理感' },
    ],
    phoneIllus: '特写',
  },
  {
    id: 'envshot', name: '环境机位', icon: FiCamera,
    desc: '拍整体环境氛围',
    angles: ['全景站角落', '纵深从门口拍', '灯光/装饰特写'],
    tips: ['超广角', '有人在使用更生动', '暖色灯光有氛围'],
    phoneSetup: [
      { label: '手机全景', subjectPos: '站在场景中做动作', camPos: '手机后置超广角，站在角落拍全景',
        desc: '拍出空间感，展示环境全貌' },
    ],
    camSetup: [
      { label: '相机超广角', subjectPos: '在场景中活动', camPos: '相机+超广角镜头架在角落',
        desc: '画质更好，适合正式的宣传片' },
    ],
    phoneIllus: '环境',
  },
  {
    id: 'broll', name: '空镜转场', icon: FiCamera,
    desc: '没人画面用于转场',
    angles: ['窗外/门口', '物品静物', '光影纹理'],
    tips: ['每个3-5秒', '跟内容相关', '加文字更有信息量'],
    phoneSetup: [
      { label: '手持空镜', subjectPos: '无需人', camPos: '手机后置手持，缓慢移动拍摄',
        desc: '适合：过渡场景/氛围镜头' },
    ],
    camSetup: [
      { label: '相机延时', subjectPos: '车流/人流/日落', camPos: '相机+三脚架固定，间隔拍摄合成延时',
        desc: '极有氛围感的转场方式' },
    ],
    phoneIllus: '空镜',
  },
]

export const COLOR_SCHEME = ['#FF6034', '#FF8045', '#FFA055', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899']

// ── Helper functions ──
export function shotTypeToId(shotType: string): string {
  if (shotType.includes('自拍')) return 'selfie'
  if (shotType.includes('行走')) return 'walking'
  if (shotType.includes('坐')) return 'sitting'
  if (shotType.includes('站')) return 'standing'
  if (shotType.includes('俯拍')) return 'overhead'
  if (shotType.includes('特写')) return 'closeup'
  if (shotType.includes('空镜') || shotType.includes('环境')) return 'envshot'
  if (shotType.includes('录屏') || shotType.includes('白板')) return 'broll'
  return 'selfie'
}

export function getTpl(vt: VideoType): ShotTpl[] {
  const m: Record<string, string[]> = {
    restaurant: ['selfie', 'standing', 'walking', 'overhead', 'closeup', 'envshot', 'broll'],
    trust: ['selfie', 'standing', 'sitting', 'closeup', 'envshot', 'broll'],
    review: ['selfie', 'overhead', 'closeup', 'envshot', 'broll'],
    brand: ['standing', 'sitting', 'closeup', 'envshot', 'broll'],
    knowledge: ['selfie', 'sitting', 'broll'],
    crossborder: ['selfie', 'standing', 'overhead', 'closeup', 'broll'],
  }
  return (m[vt] || []).map(id => SHOT_TEMPLATES.find(t => t.id === id)!).filter(Boolean)
}

export function getShotImage(shotId: string, vt: VideoType): string {
  const map: Record<string, Record<string, string>> = {
    selfie: { restaurant: '/shooting-templates/selfie_restaurant.png', trust: '/shooting-templates/selfie_trust.png', review: '/shooting-templates/selfie_review.png', brand: '/shooting-templates/selfie_restaurant.png', knowledge: '/shooting-templates/selfie_knowledge.png', crossborder: '/shooting-templates/selfie_review.png' },
    standing: { restaurant: '/shooting-templates/standing_restaurant.png', trust: '/shooting-templates/standing_trust.png', review: '/shooting-templates/standing_trust.png', brand: '/shooting-templates/standing_brand.png', knowledge: '/shooting-templates/standing_trust.png', crossborder: '/shooting-templates/standing_restaurant.png' },
    sitting: { restaurant: '/shooting-templates/sitting_trust.png', trust: '/shooting-templates/sitting_trust.png', review: '/shooting-templates/sitting_trust.png', brand: '/shooting-templates/sitting_brand.png', knowledge: '/shooting-templates/sitting_knowledge.png', crossborder: '/shooting-templates/sitting_trust.png' },
    walking: { restaurant: '/shooting-templates/walking_restaurant.png', trust: '/shooting-templates/walking_restaurant.png', review: '/shooting-templates/walking_restaurant.png', brand: '/shooting-templates/walking_brand.png', knowledge: '/shooting-templates/walking_restaurant.png', crossborder: '/shooting-templates/walking_restaurant.png' },
    overhead: { restaurant: '/shooting-templates/overhead_restaurant.png', trust: '/shooting-templates/overhead_restaurant.png', review: '/shooting-templates/overhead_review.png', brand: '/shooting-templates/overhead_restaurant.png', knowledge: '/shooting-templates/overhead_restaurant.png', crossborder: '/shooting-templates/overhead_review.png' },
    closeup: { restaurant: '/shooting-templates/closeup_restaurant.png', trust: '/shooting-templates/closeup_trust.png', review: '/shooting-templates/closeup_review.png', brand: '/shooting-templates/closeup_brand.png', knowledge: '/shooting-templates/closeup_trust.png', crossborder: '/shooting-templates/closeup_review.png' },
    envshot: { restaurant: '/shooting-templates/envshot_restaurant.png', trust: '/shooting-templates/envshot_trust.png', review: '/shooting-templates/envshot_review.png', brand: '/shooting-templates/envshot_brand.png', knowledge: '/shooting-templates/envshot_trust.png', crossborder: '/shooting-templates/envshot_review.png' },
    broll: { restaurant: '/shooting-templates/broll_restaurant.png', trust: '/shooting-templates/broll_restaurant.png', review: '/shooting-templates/broll_review.png', brand: '/shooting-templates/broll_brand.png', knowledge: '/shooting-templates/broll_restaurant.png', crossborder: '/shooting-templates/broll_review.png' },
  }
  return map[shotId]?.[vt] || map[shotId]?.restaurant || ''
}

export function recommendType(q1: string, q2: string): VideoType {
  if (q1 === 'physical') return q2 === 'food' ? 'restaurant' : 'brand'
  if (q1 === 'digital') return 'review'
  if (q1 === 'expert') return 'knowledge'
  return 'trust'
}

export function aiToBlocks(raw: { title?: string; content?: string; emotion?: string }[]): ScriptBlock[] {
  const totalSec = 120
  const seg = totalSec / raw.length
  const defaultShots = ['自拍', '行走', '特写', '自拍', '行走', '特写', '自拍', '自拍']
  const defaultDescs = [
    '胸口以上近景口播，眼神看镜头', '手持轻微晃动，边走边展示环境',
    '特写镜头展示产品细节', '回到正面近景口播，手势比划',
    '边走边讲，展示场景', '产品/食材特写，每个3秒',
    '正面口播收尾', '微笑对镜头引导行动',
  ]
  const emotionHooks = ['😣 被戳中', '😌 产生共鸣', '🤔 觉得有用', '😲 被说服', '😍 想试试', '🔥 想行动', '🤝 不亏', '👉 现在就做']
  return raw.map((s, i) => ({
    t0: `${Math.floor(i * seg / 60)}:${String(Math.floor(i * seg % 60)).padStart(2, '0')}`,
    t1: `${Math.floor((i + 1) * seg / 60)}:${String(Math.floor((i + 1) * seg % 60)).padStart(2, '0')}`,
    title: s.title || `第${i + 1}段`,
    line: s.content || '',
    emotion: s.emotion || `${emotionHooks[i % emotionHooks.length]}→留住了`,
    tip: '语速自然，配合手势，看镜头',
    shotType: defaultShots[i % defaultShots.length],
    shotDesc: defaultDescs[i % defaultDescs.length],
  }))
}
