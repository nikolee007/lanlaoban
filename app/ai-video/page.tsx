'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'
import Breadcrumb from '../components/Breadcrumb'
import { useToast } from '../contexts/ToastContext'
import {
  FiZap, FiCopy, FiPlay, FiClock, FiCamera, FiUser, FiStar, FiGlobe,
  FiShoppingBag, FiEdit3, FiChevronLeft, FiRefreshCw, FiCheck,
  FiMonitor, FiSmartphone, FiMove, FiImage, FiCheckSquare, FiArrowRight,
  FiThumbsUp, FiMessageSquare, FiTrendingUp,
} from 'react-icons/fi'

type VideoType = 'restaurant' | 'trust' | 'review' | 'brand' | 'knowledge' | 'crossborder'
type Step = 'select' | 'form' | 'result'
type Tab = 'shots' | 'script' | 'guide' | 'todo'

interface ScriptBlock {
  t0: string; t1: string; title: string; line: string; emotion: string; tip: string; shotType: string; shotDesc: string }

const INFO: Record<VideoType, { icon: any; title: string; desc: string; color: string; bg: string; demo: string; brand: string; sell: string }> = {  restaurant: { icon: FiCamera, title: '餐饮探店·老板IP', desc: '餐厅老板打造人设吸引同城流量', color: '#FF6034', bg: '#FFF0EB', demo: '招牌红烧牛肉面', brand: '老李牛肉面馆', sell: '三代祖传秘方,每天现熬8小时,牛肉大块' },
  trust: { icon: FiUser, title: '人设信任·个人IP', desc: '创业者/手艺人建立信任', color: '#2563EB', bg: '#EFF6FF', demo: '定制西服', brand: '张师傅西装定制', sell: '20年经验,全手工制作,终身免费修改' },
  review: { icon: FiStar, title: '好物测评·带货种草', desc: '产品测评带货', color: '#8B5CF6', bg: '#F5F3FF', demo: '智能扫地机器人', brand: '智净X1 Pro', sell: '激光导航,5000Pa吸力,自动集尘' },
  brand: { icon: FiShoppingBag, title: '品牌故事·匠心传承', desc: '工厂/老字号品牌故事', color: '#059669', bg: '#ECFDF5', demo: '手工皮具', brand: '一川手工皮具', sell: '进口植鞣革,纯手工缝制,越用越好看' },
  knowledge: { icon: FiEdit3, title: '知识口播·专家IP', desc: '知识博主输出价值', color: '#D97706', bg: '#FFFBEB', demo: '跨境电商课程', brand: '老李跨境说', sell: '10年经验,月销百万实操,0基础可学' },
  crossborder: { icon: FiGlobe, title: '跨境电商 · 带货种草', desc: '适合跨境电商卖家、TikTok Shop商家、独立站运营', color: '#0EA5E9', bg: '#F0F9FF', demo: '便携式榨汁机 USB-C充电', brand: 'FreshBlend Pro', sell: 'USB-C充电便携、30秒鲜榨、304不锈钢刀片' },
}

const SCRIPTS: Record<VideoType, ScriptBlock[]> = {
  restaurant: [
    { t0:'0:00',t1:'0:08',title:'痛点反问钩子',line:'你是不是也觉得，现在在外面吃饭，越来越难吃到一碗真材实料的面了？菜单上写得天花乱坠，端上来一看——冷冻肉、合成汤、预制菜一加热就给你端上来了。花七八十块钱，吃的全是科技与狠活。',emotion:'😣 被戳中→"说的就是我的遭遇，外面吃饭确实经常踩雷"',tip:'开头直接抛痛点反问，手机前置自拍，眼神看镜头',shotType:'自拍',shotDesc:'胸口以上近景口播，手机举平视，眼神看镜头，背景是厨房烟火气' },
    { t0:'0:08',t1:'0:18',title:'共情故事',line:'我开店15年，这条街上的店换了一波又一波，倒了一批又一批。很多同行为了省成本，用添加剂提鲜、用冷冻肉充数、用浓汤宝兑汤。但我老李不干那事。开店第一天的底线——我自己不吃的东西，绝不端给客人。',emotion:'😌 产生信任→"这个老板实在，15年还能坚持底线，不容易"',tip:'语气放缓，带点无奈又坚定，行走镜头展示厨房',shotType:'行走',shotDesc:'手持轻微晃动，边走边拍厨房环境，拍到灶台上熬汤的真材实料' },
    { t0:'0:18',t1:'0:28',title:'三点避坑',line:'做餐饮想长久，三点缺一不可：第一，食材新鲜是底线——冷冻肉和新鲜肉，吃一口就分得出来。第二，手艺传统是灵魂——该熬的汤不能省时间，该揉的面不能图省事。第三，良心经营是根本——你骗客人一次，他永远不会再回来。这三点做不到，再便宜也没用。',emotion:'🤔 觉得有道理→"三点确实说到心坎里了，做餐饮的核心就是这个"',tip:'语速加快，坚定有力，配合手指比划',shotType:'自拍',shotDesc:'回到正面近景口播，用手势比划一二三，背景虚化' },
    { t0:'0:28',t1:'0:38',title:'差异化展示',line:'所以我家的面，汤是牛骨加老鸡熬足8小时的，汤白味浓，喝完不口干——因为没有味精。牛肉是澳洲牛腱子用手撕的，不用机器切，纤维不断口感才好。面条是自己和的，加了鸡蛋和碱水，劲道弹牙。成本比别家高30%，但吃过的人十个有九个都成了回头客。',emotion:'😋 想尝试→"说得我都饿了，确实和外面那些预制菜不一样"',tip:'切特写展示食材和成品，语速放缓',shotType:'特写',shotDesc:'特写镜头拍牛肉纹理、汤沸腾冒泡、面条劲道弹跳，每个2-3秒' },
    { t0:'0:38',t1:'0:45',title:'私信收口',line:'想知道一碗真正的好面该是什么味？别的地方你吃不到。评论区打"想吃"，我请你来店里免费尝一碗，不好吃不要钱。地址在左下角，同城的兄弟来就完了。',emotion:'😍 行动冲动→"免费尝一碗不吃亏，评论一下也没啥损失"',tip:'微笑收尾，真诚邀请，眼神指向评论区',shotType:'自拍',shotDesc:'回到正面，微笑对着镜头，手指向评论区，画面叠加店铺地址和定位' },
  ],
  trust: [
    { t0:'0:00',t1:'0:06',title:'钩子反问',line:'你花5000块买的西装，穿出来像卖保险的？问题不在钱，在不合身。大部分成品西装是给标准身材做的，你但凡肩膀宽一点、手臂长一点、腰围粗一点，穿上去就是借来的衣服。',emotion:'😅 被扎心→"确实，我买的西装就是不合身"',tip:'开场直接扎痛点，眼神坚定',shotType:'自拍',shotDesc:'胸口近景，手机举平视，自然光从侧面来' },
    { t0:'0:06',t1:'0:15',title:'行业乱象拆解',line:'现在的西装市场，全是快消品在冲量。面料差、做工糙、版型千篇一律，工厂流水线一天出几百件，能合谁的身？大多数人买西装就两个结局：不是挂在衣柜里落灰，就是穿出去被人看出来不合身。两三千块钱打水漂。',emotion:'😤 恍然大悟→"原来不是我身材的问题，是衣服的问题"',tip:'语气透露出对行业现状的无奈，走动着说',shotType:'行走',shotDesc:'在挂满西装的衣架间行走，边走边拍，自然光' },
    { t0:'0:15',t1:'0:23',title:'自我人设',line:'我做定制西装22年了。从16岁当学徒，从最基础的锁扣眼学起，到现在自己开店带了七个徒弟。我的原则很简单，也从来没变过——不合身的西装，绝不交到客户手里。做不到这一条的，不配叫裁缝。',emotion:'😌 敬意→"22年老师傅，这门手艺值得尊重"',tip:'语速放缓，真诚，眼神有力',shotType:'自拍',shotDesc:'回到工作台前，边说边整理手边的工具，背景是半成品西装' },
    { t0:'0:23',t1:'0:32',title:'专业价值',line:'定制和成品最大的区别在哪？37个身体数据。从肩宽到胸围、从腰围到袖长、从前胸宽到后背宽，多一厘米不行，少一厘米也不行。一套西装从量体到交货要用28天，光手工扣眼就要一整天——一个扣眼一个老师傅缝一上午。这才是西装该有的做法。',emotion:'🤩 觉得专业→"37个数据、28天工期，确实讲究，这人靠谱"',tip:'语速平稳专业，手势辅助说明',shotType:'特写',shotDesc:'手部特写拍量体、裁缝、锁扣眼细节，每个2-3秒' },
    { t0:'0:32',t1:'0:38',title:'收口引流',line:'想要一套真正合身的西装？评论区扣"定制"，我免费帮你量体出方案。合不合身，你试了就知道。我是老张，一个靠谱的裁缝。',emotion:'🥰 想咨询→"免费量体出方案，试试也没什么损失"',tip:'微笑收尾，真诚邀请',shotType:'自拍',shotDesc:'对着镜头微笑，叠加工室地址联系方式' },
  ],
  review: [
    { t0:'0:00',t1:'0:05',title:'钩子反问',line:'你家的扫地机器人，是不是也经常撞墙、卡住、扫不干净？买回来用了三天就后悔了，放在墙角落灰？这不是你的问题，是大多数扫地机根本就没做好。',emotion:'😣 共鸣→"太真实了，我家的扫地机就是个智障"',tip:'用用户的痛点开场',shotType:'自拍',shotDesc:'坐在客厅对着镜头说，背景有机器人' },
    { t0:'0:05',t1:'0:14',title:'乱象拆解',line:'市面上千元级的扫地机，我测评了不下20台。大多数的问题是：导航不准——撞墙撞到怀疑人生。吸力虚标——标5000Pa实际连猫毛都吸不干净。避障靠撞——地上的数据线、拖鞋、狗屎，它不识别，直接碾过去。三千块的机子和五百块的差别真不大。',emotion:'😤 恍然大悟→"原来不是我买得便宜的问题，是行业都这样"',tip:'语速平实，数据感',shotType:'行走',shotDesc:'走到产品展示区，拿起不同产品对比' },
    { t0:'0:14',t1:'0:22',title:'真实测评',line:'这台智净X1 Pro，我用了三个月才敢说。激光导航建图5分钟搞定，全屋走到位了一次成型。5000Pa吸力是实测数据，不是虚标——酱油倒在地上一遍过去干干净净，你去看那个污水箱就知道了。避障用的是结构光，地上的拖鞋、电线、宠物，全部绕开走。骗不了我的，每一台我都用数据说话。',emotion:'🤔 半信半疑→"真的假的？三个月实测数据应该假不了"',tip:'展示真实使用数据',shotType:'特写',shotDesc:'俯拍机器人工作过程，切到手机APP展示建图数据和清扫记录' },
    { t0:'0:22',t1:'0:28',title:'价值判断',line:'三千块的价位段，能做到这个配置的，目前市面上我一个都没找到。激光导航加5000Pa吸力加自动集尘加结构光避障，这一个配置放在别家至少要五千起步。不是我替它说话，是它的性价比摆在那里，你对比一下就知道。',emotion:'😯 被说服→"这么一比确实划算，三千块买五千的配置"',tip:'对比式表达，语速坚定不移',shotType:'自拍',shotDesc:'对着镜头分析，手势比划出数据对比' },
    { t0:'0:28',t1:'0:32',title:'收口',line:'最近想换扫地机的，评论区打"想看细节"，我发你三个月实测对比图。关注我，买东西不踩坑，买东西之前先看一眼我的测评。',emotion:'🤝 行动→"发个评论拿对比图也不亏，先关注再说"',tip:'自然收尾',shotType:'自拍',shotDesc:'微笑对着镜头，指向评论区' },
  ],
  brand: [
    { t0:'0:00',t1:'0:08',title:'痛点焦虑',line:'你有没有这种感觉？想买一个好包，贵的买不起，便宜的拿不出手。两千块买个所谓轻奢，背出去懂的人一眼就看出来——五金件是塑料镀的、皮料是二层贴面的、缝线三个月就开了。花那个冤枉钱，不如不买。',emotion:'😣 被说中→"确实，买包这件事我一直很纠结"',tip:'娓娓道来，引发共鸣，语速舒缓',shotType:'自拍',shotDesc:'坐在工作台前，暖光打亮半边脸，沉稳开场' },
    { t0:'0:08',t1:'0:18',title:'行业剖析',line:'为什么市面上的包要么贵得离谱要么差得看不下去？因为真正用心做产品的人越来越少了。大家都在比价格、比营销、比谁请的明星大，没人比手艺。一块皮料从生皮到植鞣染色再到成品，三个月打底。有哪个品牌愿意为品质等三个月？没有，他们只等得起三天。',emotion:'😤 产生认同→"说得好，现在确实没人在意品质了"',tip:'语速平稳，有理有据',shotType:'行走',shotDesc:'在工作室里边走边展示墙上挂着的皮料和工具' },
    { t0:'0:18',t1:'0:30',title:'三点干货',line:'如何一眼辨别一个好皮具？看三点就够了。第一看皮料——真正的植鞣革会呼吸、会变色、越用越有光泽，用十年跟新的一样。第二看缝线——马鞍缝法双针交叉，断一根线另一根还撑着，不会整个散开。第三看过边——手工封边要打磨三遍以上，摸上去像婴儿皮肤一样光滑，不是机器随便滚一圈的那种粗糙边。',emotion:'🤔 学到东西→"原来要看这三个地方，以前都不知道"',tip:'手势配合，专业自信，语速稍快',shotType:'自拍+特写',shotDesc:'回到工作台前比划三点，每点切特写展示对应工艺细节' },
    { t0:'0:30',t1:'0:40',title:'品牌理念',line:'我做的东西不追潮流，不赶旺季。一个邮差包，设计稿画了两个月，推翻了四版才满意。打版打了六次才定版——每一次打版出来都觉得这里不对那里不对，拆了重来。我不想做爆款，我做的是十年后你还愿意背的包。你愿意等，我就愿意做。',emotion:'😌 感动/认可→"这个匠人精神，现在太少见了"',tip:'坚定有力，传达品牌理念',shotType:'自拍+特写',shotDesc:'边说边展示设计稿到成品的对比，表情认真而坚定' },
    { t0:'0:40',t1:'0:45',title:'私信引流',line:'想知道什么才是值得花钱入手的好东西？关注我，看我每天怎么把一个包从皮料到成品做出来。评论区打"定制"，我优先给你免费出设计方案。',emotion:'🥰 想关注→"关注看看，说不定下一个包就在这里买了"',tip:'真诚收尾，微笑',shotType:'自拍',shotDesc:'对着镜头微笑，叠加工室信息' },
  ],
  knowledge: [
    { t0:'0:00',t1:'0:05',title:'认知冲击',line:'90%做跨境电商的人，第一步就踩坑了——你以为第一步是选品？是开店？是找供应链？都不是。第一步是搞清楚你自己的姿势对不对。大部分人上来就干，干完三个月发现钱没赚到，货压了一仓库，平台罚款交了一堆。',emotion:'😯 被吸引→"难道我就是那90%？先听听他怎么说"',tip:'语气坚定有力，制造紧迫感',shotType:'自拍',shotDesc:'坐书桌前正面镜头，背景是书架' },
    { t0:'0:05',t1:'0:14',title:'真话拆解',line:'大部分人是怎么做的？打开1688搜"什么好卖"，看到别人卖得好就跟。大错特错。你先要想清楚三个问题，而且顺序不能乱：第一，你的目标市场在哪——欧美还是东南亚，不同市场的玩法完全不同。第二，你选哪个平台——TikTok、亚马逊、Shopee，每个平台的红利期和规则天差地别。第三，你有什么优势——是供应链便宜、还是你会拍视频、还是你懂运营。三个问题不想清楚，后面全白干。',emotion:'🤔 思考→"三个问题我一个都没想清楚，确实是我太急了"',tip:'语速适中，干货感，手势比划',shotType:'自拍',shotDesc:'正面口播，用手势比划一二三' },
    { t0:'0:14',t1:'0:22',title:'方法干货',line:'我做跨境电商10年，踩过的坑比大多数人走的路还多。最后总结了一个公式照着做就不会错：成功等于供应链能力乘以平台选择乘以运营执行力。注意，是乘号不是加号——其中任何一个环节是零，结果就是零。而且顺序不能乱：先搞定供应链，再选平台，最后才是学运营。顺序搞反了？那就是去交学费。你交过几次就知道了。',emotion:'😲 被说服→"乘号这个说法有道理，一个不行全白搭"',tip:'加重语气强调乘号和顺序的重要性',shotType:'自拍+白板',shotDesc:'说话同时用手势，切到白板边写边讲' },
    { t0:'0:22',t1:'0:30',title:'实操案例',line:'上个月刚带的一个学员，零基础、英语只会说hello和thank you，三个月做到月销5万美金。他做的是什么？TikTok加家居小件，一件利润8到12美金，一天发一两百单。不是他有多厉害，是路走对了——先找供应链，再选TikTok美区，最后学拍视频投流。路对了，谁都能做出来。',emotion:'😍 被激励→"零基础都能做到月销5万，那我也可以试试"',tip:'用具体数据说话，增加可信度',shotType:'自拍+录屏',shotDesc:'切手机录屏展示后台数据，再切回人脸' },
    { t0:'0:30',t1:'0:35',title:'收口',line:'想学怎么做跨境电商，不想走弯路？评论区打"跨境"，我把这套实操落地流程完整发你。关注我，少走弯路，少交学费。',emotion:'🤝 行动冲动→"发个评论就能拿到实操流程，不亏"',tip:'干练收尾',shotType:'自拍',shotDesc:'对着镜头干练收尾，手指向评论区' },
  ],
  crossborder: [
    { t0:'0:00',t1:'0:10',title:'痛点反问钩子',line:'你还在花20块买一杯加糖精兑水的假果汁？告诉你一个很多人不知道的秘密——花一半的钱，喝到真正新鲜健康的鲜榨果汁，而且随时随地都能喝。今天带你看一个我从TikTok上挖到的宝藏。',emotion:'😯 好奇→"20块的果汁居然是糖精兑的？一半的钱能喝到真的？"',tip:'开场直接抛反差痛点，语速轻快，眼神有神',shotType:'自拍',shotDesc:'胸口以上近景口播，手机举平视，眼神看镜头，背景简约明亮' },
    { t0:'0:10',t1:'0:28',title:'开箱展示',line:'今天开箱这个FreshBlend Pro便携榨汁机，注意看三个关键细节：第一，USB-C充电——这意味着你不需要带专用充电器，手机充电线、笔记本充电线插上就能充，车上、办公室、户外都能充。第二，30秒鲜榨——早上起来切个水果丢进去，30秒一杯鲜榨，刷牙洗脸的时间就好了，完全不影响出门。第三，304不锈钢刀片——不是那种便宜的普通钢材，是食品级的304不锈钢，耐用好清洗，水冲一下就好了。',emotion:'🤩 被种草→"USB-C充电确实方便，30秒也太快了吧"',tip:'语速轻快，开箱感，展示产品细节',shotType:'特写+俯拍',shotDesc:'俯拍开箱过程，手指依次点出三个细节：USB-C接口、杯体、刀片，每个细节3-5秒' },
    { t0:'0:28',t1:'0:50',title:'场景应用',line:'这个东西最厉害的不是参数，是你生活里处处用得上。办公室放一个，下午两三点困了，打个橙汁喝，比喝咖啡健康多了，维生素C直接补充。健身房包里装一个，练完来杯蛋白奶昔，杯子一盖就能走，不用在健身房水池边洗半天。周末露营带上它——你见过户外喝鲜榨果汁的吗？只要有电的地方就能用，车上点烟器都能充。什么样的生活品质？就是这个。',emotion:'😌 代入感→"我办公室/健身房确实需要一个，露营喝果汁也太爽了吧"',tip:'场景切换自然，语气带入真实使用感受',shotType:'行走+特写',shotDesc:'在不同场景中切换：办公室书桌→健身房更衣室→户外营地，手持搅拌杯展示工作状态' },
    { t0:'0:50',t1:'1:15',title:'对比测评',line:'和市面同类产品硬碰硬比一下。某品牌A，卖八百块——不能充电，只能插着电源用，出门就是一块废铁。某品牌B，五百块——刀片是普通钢材，打两三个月就钝了，打出来的果汁有金属味。你再看看FreshBlend Pro，三百多块，USB-C充电、304不锈钢刀片、30秒出汁，还多了个便携杯盖。不是一个级别的产品，价格只有它们的一半。你选哪个？',emotion:'🤔 被说服→"八百块不能充电？五百块有金属味？三百多这个确实香"',tip:'语速加快，对比增强说服力，手势辅助',shotType:'自拍+俯拍',shotDesc:'正面镜头对比分析，切俯拍展示三台机器并排放置，展示参数差异' },
    { t0:'1:15',t1:'1:35',title:'口碑见证',line:'上个月在TikTok上发了条视频，就是拍这个榨汁机，播放量50万，卖了差不多3000多台。评论区全是在说好话——有人用了两个月回来说电池还很耐用，充一次电能打七八杯。有人说比家里两千块的破壁机还好清洗，水一冲就干净了。还有人说办公室同事看了全下单了，现在整层楼一人一个。你自己看看这个评论区。',emotion:'😍 从众心理→"3000多个人买了，评价都这么好，那应该真不错"',tip:'语速自然，带着分享真实的语气',shotType:'自拍+录屏',shotDesc:'对着镜头分享，切手机屏展示TikTok后台数据和评论区好评截图' },
    { t0:'1:35',t1:'1:50',title:'价格锚定',line:'我给你们谈了个粉丝专属价，比官网便宜60块。多少钱？三百出头。一个充电宝的价格，你买一个充电宝用两年，这个榨汁机你也至少用两年。算下来一天不到一块钱，你喝一杯外面的果汁就二十块钱，每一天回本，之后全是省下来的。你的健康值多少钱？',emotion:'😲 觉得划算→"三百出头确实不贵，一天不到一块钱，少喝一杯外面的果汁就回本了"',tip:'语速放缓，突出性价比，用手势比划算账',shotType:'自拍',shotDesc:'正面镜头，表情真诚，用手势比划价格对比，展示专属价标签' },
    { t0:'1:50',t1:'2:00',title:'行动号召',line:'链接在下方，直接下单就行。或者去TikTok搜FreshBlend看更多真实使用视频。评论区告诉我你最想打什么果汁，我抽一个人免费送你一台。关注我，TikTok跨境好物不踩雷，每个品我都亲自用过才推荐。',emotion:'🔥 立刻行动→"链接就在下面，还有抽奖机会，现在下单"',tip:'语速干脆，行动导向，微笑收尾',shotType:'自拍',shotDesc:'对着镜头微笑收尾，指向评论区/屏幕下方的链接，手势干脆利落' },
  ],

}



/* ─── 中文镜头类型 → 英文ID映射 ─────────────── */
function shotTypeToId(shotType: string): string {
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

/* ─── 拍摄机位模板 ─────────────────────────── */
interface CamSetup { label: string; subjectPos: string; camPos: string; desc: string }
interface ShotTpl {
  id: string; name: string; icon: any; desc: string; angles: string[]; tips: string[]
  phoneSetup: CamSetup[]   // 手机架设说明
  camSetup: CamSetup[]     // 相机架设说明
  phoneIllus: string       // 简单示意图标识
}
const SHOT_TEMPLATES: ShotTpl[] = [
  {
    id:'selfie', name:'自拍机位', icon: FiSmartphone,
    desc:'手机前置，老板对镜头说话',
    angles:['正面平视','略微俯拍15°','侧45°'],
    tips:['手机举到与眼睛同高','看镜头不是看屏幕','自然光最好不背光'],
    phoneSetup:[
      { label:'手持自拍', subjectPos:'面对镜头站立', camPos:'手机前置，手臂伸直',
        desc:'适合：对镜头直接说话的段落，有亲切感' },
      { label:'支架自拍', subjectPos:'站在手机前1.5米', camPos:'手机支架固定，镜头调至眼睛高度',
        desc:'适合：长段口播，双手自由做手势' },
    ],
    camSetup:[
      { label:'相机正面', subjectPos:'站/坐在镜头前1.5-2m', camPos:'相机+三脚架，镜头与眼平齐',
        desc:'标准口播机位，背景虚化效果更好' },
      { label:'相机侧45°', subjectPos:'面对镜头侧45°', camPos:'相机在正前方，构图上留出"视线空间"',
        desc:'适合需要展示侧脸/手势的内容' },
    ],
    phoneIllus:'自拍',
  },
  {
    id:'standing', name:'站姿机位', icon: FiMove,
    desc:'站着展示全身/半身',
    angles:['正面全身','正面半身','侧身45°半身'],
    tips:['双脚与肩同宽','手自然摆动','背景有纵深感'],
    phoneSetup:[
      { label:'手机正面', subjectPos:'站在手机前2-3m', camPos:'手机竖屏横拍，镜头在胸高位置',
        desc:'适合：展示全身着装/站姿口播' },
      { label:'手机侧跟', subjectPos:'侧身45°站立', camPos:'手机在正面偏侧20°，拍半身',
        desc:'显身材轮廓，适合穿搭/展示' },
    ],
    camSetup:[
      { label:'相机正面', subjectPos:'站在背景前1m', camPos:'相机三脚架，镜头高1.2-1.4m',
        desc:'适合：站姿口播/产品展示' },
      { label:'相机全景', subjectPos:'站在场景中央', camPos:'相机拉远至3-4m，拍全身+环境',
        desc:'适合：展示环境+人物关系' },
    ],
    phoneIllus:'站立',
  },
  {
    id:'sitting', name:'坐姿机位', icon: FiMonitor,
    desc:'坐着说话，访谈口播',
    angles:['沙发正坐','吧台高脚凳','办公桌后'],
    tips:['身体前倾有亲和力','双手放桌面','背景别太乱'],
    phoneSetup:[
      { label:'正面坐姿', subjectPos:'坐在桌前/沙发上', camPos:'手机放在桌面上靠支架，镜头与脸平齐',
        desc:'适合：知识分享/访谈类内容' },
      { label:'侧前方', subjectPos:'坐姿侧对镜头约30°', camPos:'手机在侧前方40cm，镜头略高于脸',
        desc:'显脸小，有专业访谈感' },
    ],
    camSetup:[
      { label:'相机正面', subjectPos:'坐在桌前', camPos:'相机+三脚架在正前方1.5m，镜头与眼平',
        desc:'标准访谈机位，背景有书架/墙壁' },
      { label:'双人访谈', subjectPos:'两人对坐或并坐', camPos:'相机在侧面，拍两人同框',
        desc:'适合：对谈类/采访类内容' },
    ],
    phoneIllus:'坐姿',
  },
  {
    id:'walking', name:'走动机位', icon: FiMove,
    desc:'边走边讲展示环境',
    angles:['跟拍正面','侧面跟拍','前方引导背对'],
    tips:['走慢30%','先对镜头说再走','手持稳定器'],
    phoneSetup:[
      { label:'手持跟拍', subjectPos:'边走边讲', camPos:'手机稳定器手持，镜头一直对准人',
        desc:'最有沉浸感的拍法，边走边介绍环境' },
      { label:'前方引导', subjectPos:'背对镜头往前走', camPos:'跟在身后1.5m，拍背影+前方环境',
        desc:'适合：开场引入/转场' },
    ],
    camSetup:[
      { label:'滑轨跟拍', subjectPos:'沿着固定路线走', camPos:'相机在滑轨上平行移动跟拍',
        desc:'电影感最强，需要滑轨设备' },
      { label:'固定跟拍', subjectPos:'从远处走近', camPos:'相机固定三脚架，人从远走近',
        desc:'适合：进门/登场场景' },
    ],
    phoneIllus:'走动',
  },
  {
    id:'overhead', name:'俯拍机位', icon: FiMonitor,
    desc:'从上往下拍美食/开箱',
    angles:['正上方90°','斜上方45°','侧上方30°'],
    tips:['手机横过来正上方拍','光线均匀无阴影','背景用纯色桌布'],
    phoneSetup:[
      { label:'手机正上方90°', subjectPos:'桌面物品/食材等', camPos:'手机固定在高处支架上，正对下方',
        desc:'适合：美食展示/开箱/产品测评' },
      { label:'手机侧上方45°', subjectPos:'物品/手部动作', camPos:'手机斜上方支架，带一点立体感',
        desc:'适合：做菜过程/手工艺/开箱' },
    ],
    camSetup:[
      { label:'相机俯拍架', subjectPos:'桌面操作台', camPos:'相机安装在专业俯拍架上，正对操作台',
        desc:'固定机位，保证光线均匀' },
      { label:'相机侧拍', subjectPos:'手部操作', camPos:'相机45°俯拍，镜头距物体30-40cm',
        desc:'适合：手工艺/做菜过程' },
    ],
    phoneIllus:'俯拍',
  },
  {
    id:'closeup', name:'特写机位', icon: FiStar,
    desc:'拍产品/食材/手工细节',
    angles:['产品特写10-15cm','手部动作特写','表情肩部以上'],
    tips:['用后置镜头更清晰','靠近再靠近','慢动作更高级'],
    phoneSetup:[
      { label:'手持特写', subjectPos:'物品放在桌上', camPos:'手机后置镜头，距物品10-15cm，对焦清晰',
        desc:'手稳或靠桌上拍，近到能看见纹理' },
      { label:'支架特写', subjectPos:'固定拍摄区域', camPos:'手机固定在支架上，微距模式拍摄',
        desc:'适合：产品细节/食材纹理/工艺细节' },
    ],
    camSetup:[
      { label:'微距镜头', subjectPos:'物品在灯光下', camPos:'相机+微距镜头，距物品5-10cm',
        desc:'需要专用微距镜头，拍极致的纹理感' },
      { label:'长焦特写', subjectPos:'人在远处', camPos:'相机远距离+长焦镜头，拍表情/眼神',
        desc:'自然捕捉表情，不会让被拍者有压迫感' },
    ],
    phoneIllus:'特写',
  },
  {
    id:'envshot', name:'环境机位', icon: FiCamera,
    desc:'拍整体环境氛围',
    angles:['全景站角落','纵深从门口拍','灯光/装饰特写'],
    tips:['超广角','有人在使用更生动','暖色灯光有氛围'],
    phoneSetup:[
      { label:'手机全景', subjectPos:'站在场景中做动作', camPos:'手机后置超广角，站在角落拍全景',
        desc:'拍出空间感，展示环境全貌' },
      { label:'手机纵深', subjectPos:'在场景深处', camPos:'从门口往内拍，利用纵深线条',
        desc:'有层次感的拍法，展示环境深度' },
    ],
    camSetup:[
      { label:'相机超广角', subjectPos:'在场景中活动', camPos:'相机+超广角镜头架在角落',
        desc:'画质更好，适合正式的宣传片' },
      { label:'相机滑轨', subjectPos:'保持自然状态', camPos:'相机滑轨缓慢平移，拍出动态环境感',
        desc:'高级感十足，适合品牌宣传' },
    ],
    phoneIllus:'环境',
  },
  {
    id:'broll', name:'空镜转场', icon: FiCamera,
    desc:'没人画面用于转场',
    angles:['窗外/门口','物品静物','光影纹理'],
    tips:['每个3-5秒','跟内容相关','加文字更有信息量'],
    phoneSetup:[
      { label:'手持空镜', subjectPos:'无需人', camPos:'手机后置手持，缓慢移动拍摄'
        ,desc:'适合：过渡场景/氛围镜头' },
      { label:'支架慢镜', subjectPos:'物品静止', camPos:'手机支架固定，拍物品静态或慢动作',
        desc:'适合：产品静物/环境细节' },
    ],
    camSetup:[
      { label:'相机延时', subjectPos:'车流/人流/日落', camPos:'相机+三脚架固定，间隔拍摄合成延时',
        desc:'极有氛围感的转场方式' },
      { label:'相机慢门', subjectPos:'水流/灯光/车流', camPos:'相机+三脚架+ND滤镜，慢门模糊效果',
        desc:'艺术感强，适合品牌调性展示' },
    ],
    phoneIllus:'空镜',
  },
]

function getTpl(vt: VideoType): ShotTpl[] {
  const m: Record<string, string[]> = {
    restaurant: ['selfie','standing','walking','overhead','closeup','envshot','broll'],
    trust: ['selfie','standing','sitting','closeup','envshot','broll'],
    review: ['selfie','overhead','closeup','envshot','broll'],
    brand: ['standing','sitting','closeup','envshot','broll'],
    knowledge: ['selfie','sitting','broll'],
    crossborder: ['selfie','standing','overhead','closeup','broll'],
  }
  return (m[vt] || []).map(id => SHOT_TEMPLATES.find(t => t.id === id)!).filter(Boolean)
}

const CS = ['#FF6034','#FF8045','#FFA055','#3B82F6','#6366F1','#8B5CF6','#EC4899']

function getShotImage(shotId: string, vt: VideoType): string {
  // 精确映射表 — 使用实际存在的图片文件
  const map: Record<string, Record<string, string>> = {
    selfie:   { restaurant:'/shooting-templates/selfie_restaurant.png',  trust:'/shooting-templates/selfie_trust.png',  review:'/shooting-templates/selfie_review.png',  brand:'/shooting-templates/selfie_restaurant.png',  knowledge:'/shooting-templates/selfie_knowledge.png',  crossborder:'/shooting-templates/selfie_review.png' },
    standing: { restaurant:'/shooting-templates/standing_restaurant.png',trust:'/shooting-templates/standing_trust.png',review:'/shooting-templates/standing_trust.png',  brand:'/shooting-templates/standing_brand.png',       knowledge:'/shooting-templates/standing_trust.png',  crossborder:'/shooting-templates/standing_restaurant.png' },
    sitting:  { restaurant:'/shooting-templates/sitting_trust.png',      trust:'/shooting-templates/sitting_trust.png',  review:'/shooting-templates/sitting_trust.png',  brand:'/shooting-templates/sitting_brand.png',        knowledge:'/shooting-templates/sitting_knowledge.png', crossborder:'/shooting-templates/sitting_trust.png' },
    walking:  { restaurant:'/shooting-templates/walking_restaurant.png', trust:'/shooting-templates/walking_restaurant.png',review:'/shooting-templates/walking_restaurant.png',brand:'/shooting-templates/walking_brand.png',       knowledge:'/shooting-templates/walking_restaurant.png',crossborder:'/shooting-templates/walking_restaurant.png' },
    overhead: { restaurant:'/shooting-templates/overhead_restaurant.png',trust:'/shooting-templates/overhead_restaurant.png',review:'/shooting-templates/overhead_review.png',brand:'/shooting-templates/overhead_restaurant.png',knowledge:'/shooting-templates/overhead_restaurant.png',crossborder:'/shooting-templates/overhead_review.png' },
    closeup:  { restaurant:'/shooting-templates/closeup_restaurant.png', trust:'/shooting-templates/closeup_trust.png', review:'/shooting-templates/closeup_review.png', brand:'/shooting-templates/closeup_brand.png',       knowledge:'/shooting-templates/closeup_trust.png', crossborder:'/shooting-templates/closeup_review.png' },
    envshot:  { restaurant:'/shooting-templates/envshot_restaurant.png', trust:'/shooting-templates/envshot_trust.png',review:'/shooting-templates/envshot_review.png', brand:'/shooting-templates/envshot_brand.png',       knowledge:'/shooting-templates/envshot_trust.png', crossborder:'/shooting-templates/envshot_review.png' },
    broll:    { restaurant:'/shooting-templates/broll_restaurant.png',   trust:'/shooting-templates/broll_restaurant.png',review:'/shooting-templates/broll_review.png',   brand:'/shooting-templates/broll_brand.png',         knowledge:'/shooting-templates/broll_restaurant.png',crossborder:'/shooting-templates/broll_review.png' },
  }
  return map[shotId]?.[vt] || map[shotId]?.restaurant || ''
}

function recommendType(q1: string, q2: string): VideoType {
  if (q1 === 'physical') return q2 === 'food' ? 'restaurant' : 'brand'
  if (q1 === 'digital') return 'review'
  if (q1 === 'expert') return 'knowledge'
  return 'trust'
}

export default function AiVideoPage() {
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>('select')
  const [vt, setVt] = useState<VideoType>('restaurant')
  const [prod, setProd] = useState('')
  const [brand, setBrand] = useState('')
  const [sell, setSell] = useState('')
  const [tab, setTab] = useState<Tab>('todo')
  const [hover, setHover] = useState<number | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [q1, setQ1] = useState(''); const [q2, setQ2] = useState('')
  const [doneTasks, setDoneTasks] = useState<string[]>([])
  const [aiScripts, setAiScripts] = useState<any[] | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [industry, setIndustry] = useState('')
  const [customer, setCustomer] = useState('')
  const [years, setYears] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (step === 'result' && resultRef.current) resultRef.current.scrollIntoView({ behavior: 'smooth' }) }, [step])
  // 加载 IP 资料 — 优先从 API（登录用户），兜底 localStorage
  useEffect(() => {
    async function loadProfile() {
      let data: Record<string, any> | null = null

      // 1. 尝试从 API 加载（登录用户）
      try {
        const token = localStorage.getItem('lanlaoban_token')
        if (token) {
          const res = await fetch('/api/ip-profile', {
            headers: { Authorization: `Bearer ${token}` },
          })
          const json = await res.json()
          if (json.success && json.data) data = json.data
        }
      } catch {}

      // 2. 兜底：从 localStorage 加载
      if (!data) {
        try {
          const saved = localStorage.getItem('lanlaoban_interview')
          if (saved) data = JSON.parse(saved)
        } catch {}
      }

      // 3. 回填表单
      if (data) {
        if (data.industry) setIndustry(data.industry)
        if (data.product) setProd(data.product)
        if (data.name) setBrand(data.name)
        if (data.customer) setCustomer(data.customer)
        if (data.experience || data.startYear) setYears(data.experience || data.startYear)
        if (data.sell || data.advantage) setSell(data.sell || data.advantage || '')
        const kw = (data.industry || '').toLowerCase()
        if (/餐饮|饭店|火锅|烧烤|奶茶|咖啡|小吃/.test(kw)) setVt('restaurant' as VideoType)
        else if (/装修|建材|家具|定制|门窗|工程|设计/.test(kw)) setVt('brand' as VideoType)
        else if (/工厂|加工|制造|五金|机械|工业/.test(kw)) setVt('trust' as VideoType)
        else if (/跨境|外贸|出口|电商/.test(kw)) setVt('crossborder' as VideoType)
        else if (/教育|培训|知识|咨询/.test(kw)) setVt('knowledge' as VideoType)
      }
    }
    loadProfile()
  }, [])
  const info = INFO[vt];
  const rawScripts = aiScripts || SCRIPTS[vt];
  const blocks = Array.isArray(rawScripts) && rawScripts.length > 0 && 'content' in rawScripts[0]
    ? aiToBlocks(rawScripts as any[])
    : (SCRIPTS[vt] as ScriptBlock[]);
  const tpls = getTpl(vt)

  const pick = (t: VideoType) => {
    setVt(t); const i = INFO[t]; setProd(i.demo); setBrand(i.brand); setSell(i.sell); setStep('form')
  }
  const showDemo = (t: VideoType) => {
    setVt(t); const i = INFO[t]; setProd(i.demo); setBrand(i.brand); setSell(i.sell); setStep('result')
  }
  const doQuiz = () => {
    const t = recommendType(q1, q2); setVt(t); const i = INFO[t]; setProd(i.demo); setBrand(i.brand); setSell(i.sell)
    setShowQuiz(false); setStep('form')
  }
  const toggleTask = (id: string) => {
    setDoneTasks(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  // Convert AI scripts format to UI ScriptBlock format
  function aiToBlocks(raw: any[]): ScriptBlock[] {
    const totalSec = 120;
    const seg = totalSec / raw.length;
    const defaultShots = ['自拍', '行走', '特写', '自拍', '行走', '特写', '自拍', '自拍'];
    const defaultDescs = [
      '胸口以上近景口播，眼神看镜头',
      '手持轻微晃动，边走边展示环境',
      '特写镜头展示产品细节',
      '回到正面近景口播，手势比划',
      '边走边讲，展示场景',
      '产品/食材特写，每个3秒',
      '正面口播收尾',
      '微笑对镜头引导行动'
    ];
    const emotionHooks = ['😣 被戳中','😌 产生共鸣','🤔 觉得有用','😲 被说服','😍 想试试','🔥 想行动','🤝 不亏','👉 现在就做'];
    return raw.map((s, i) => ({
      t0: `${Math.floor(i * seg / 60)}:${String(Math.floor(i * seg % 60)).padStart(2, '0')}`,
      t1: `${Math.floor((i + 1) * seg / 60)}:${String(Math.floor((i + 1) * seg % 60)).padStart(2, '0')}`,
      title: s.title || `第${i + 1}段`,
      line: s.content || '',
      emotion: s.emotion || `${emotionHooks[i % emotionHooks.length]}→留住了`,
      tip: '语速自然，配合手势，看镜头',
      shotType: defaultShots[i % defaultShots.length],
      shotDesc: defaultDescs[i % defaultDescs.length],
    }));
  }

  const handleAIGenerate = async () => {
    const coachMap: Record<string, string> = { restaurant: 'boge', trust: 'libazi', review: 'libazi', brand: 'zhuge', knowledge: 'libazi', crossborder: 'libazi' };
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/generate/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: industry || info.title.replace(/[\u00b7]/g, '').split('·')[0].trim() || '餐饮',
          product: prod,
          targetCustomer: customer || '本地消费者',
          years: years || '3',
          style: coachMap[vt] || 'libazi',
        }),
      });
      const data = await res.json();
      if (data.scripts && data.scripts.length > 0) {
        setAiScripts(data.scripts);
        setStep('result');
      } else {
        setAiError(data.error || 'AI生成失败，试试默认模板');
      }
    } catch {
      setAiError('网络错误，请重试');
    }
    setAiLoading(false);
  }
  const copyAll = () => {
    const t = blocks.map(b => `【${b.t0}-${b.t1}】${b.title}\n${b.line}\n ${b.shotType} | ${b.shotDesc}`).join('\n\n')
    navigator.clipboard.writeText(t); showToast('脚本已复制，去拍摄吧！', 'success')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
        <Breadcrumb items={[{ label: '懒老板', href: '/' }, { label: 'AI 一键短视频' }]} />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">

        {/* ═══ 选类型 ═══ */}
        {step === 'select' && (
          <div>
            <div className="mb-8 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ backgroundColor: '#FFF0EB' }}><FiCamera className="h-7 w-7" style={{ color: '#FF6034' }} /></div>
              <h1 className="text-2xl font-bold text-gray-900">AI 一键短视频</h1>
              <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto">选一个类型 → 填信息 → 拿到完整脚本+拍摄指导<br/>不会拍的小白也能做出2分钟短视频</p>
              
              {/* ═══ 真实产出展示：脚本是本地数据生成，100%稳定 ═══ */}
              <div className="mt-6 mx-auto max-w-3xl">
                <div className="flex items-center gap-2 mb-3">
                  <FiPlay className="h-4 w-4 text-brand-400" />
                  <span className="text-xs font-bold text-gray-500 tracking-wider">生成的脚本长这样</span>
                  <span className="text-[9px] text-gray-400">选类型→填信息→即可获得同样的完整脚本</span>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-50 shadow-sm">
                  {SCRIPTS.restaurant.slice(0, 4).map((b, i) => (
                    <div key={i} className="p-3 flex gap-3">
                      <div className="w-12 shrink-0 text-center">
                        <div className="text-[10px] font-mono font-bold text-brand-400">{b.t0}</div>
                        <div className="text-[8px] text-gray-300">→{b.t1}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-semibold text-gray-700">{b.title}</span>
                          <span className="text-[8px] text-gray-400 ml-auto">{b.shotType}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-relaxed">{b.line}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 text-center">
                    <span className="text-[10px] text-gray-400">+ 3段 · 完整脚本共7段，含每段机位说明+拍摄技巧</span>
                  </div>
                </div>
              </div>
              {/* 快速推荐入口 */}
              <button onClick={() => setShowQuiz(!showQuiz)} className="mt-4 inline-flex items-center gap-2 rounded-full border-2 px-5 py-2 text-sm font-semibold transition-all hover:shadow-sm" style={{ borderColor: '#FF6034', color: '#FF6034' }}>
                不确定选哪个？回答2个问题帮你推荐
              </button>
              {showQuiz && (
                <div className="mt-4 mx-auto max-w-md rounded-xl border border-gray-100 bg-white p-5 shadow-sm text-left">
                  <p className="text-sm font-semibold text-gray-900 mb-3">你拍视频主要想做什么？</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['physical','digital','expert','service'].map(o => (
                      <button key={o} onClick={() => setQ1(o)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${q1===o ? 'text-white' : 'text-gray-600 border-gray-200 hover:border-brand-200'}`}
                        style={q1===o ? { backgroundColor: '#FF6034', borderColor: '#FF6034' } : {}}>
                        { {physical:'卖实体产品',digital:'推荐好物',expert:'分享知识',service:'提供服务'}[o] }
                      </button>
                    ))}
                  </div>
                  {q1 && <>
                    <p className="text-sm font-semibold text-gray-900 mb-3">具体哪个领域？</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['food','fashion','tech','home','edu','other'].map(o => (
                        <button key={o} onClick={() => setQ2(o)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${q2===o ? 'text-white' : 'text-gray-600 border-gray-200 hover:border-brand-200'}`}
                          style={q2===o ? { backgroundColor: '#FF6034', borderColor: '#FF6034' } : {}}>
                          { {food:'餐饮美食',fashion:'服装/设计',tech:'数码科技',home:'家居生活',edu:'教育培训',other:'其他'}[o] }
                        </button>
                      ))}
                    </div>
                  {q2 && <button onClick={doQuiz} className="w-full rounded-lg py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#FF6034" }}>查看推荐</button>}
                  </>}
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(Object.entries(INFO) as [VideoType, typeof INFO[VideoType]][]).map(([k, v]) => {
                const Icon = v.icon
                return (
                  <div key={k} className="card relative overflow-hidden group p-5 transition-all duration-300">
                    {/* Hover gradient border */}
                    <div className="absolute inset-0 rounded-2xl p-px bg-gradient-to-r from-brand-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="w-full h-full rounded-2xl bg-white" />
                    </div>
                    <div className="relative z-10 cursor-pointer" onClick={() => pick(k)}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: v.bg }}>
                          <Icon className="h-5 w-5" style={{ color: v.color }} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{v.title}</p>
                          <p className="text-[11px] text-gray-400">{v.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px]" style={{ color: v.color }}>
                        <FiPlay className="h-3 w-3" /> 7段精编·2:00·含拍摄指导
                      </div>
                    </div>
                    <div className="relative z-10 mt-4 flex gap-2">
                      <button onClick={() => showDemo(k)}
                        className="flex-1 rounded-lg py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #FF6034, #8B5CF6)' }}>
                        看演示
                      </button>
                      <button onClick={() => pick(k)}
                        className="flex-1 rounded-lg py-2 text-xs font-semibold text-white transition-all hover:brightness-110"
                        style={{ backgroundColor: v.color }}>
                        立即使用
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══ 填信息 ═══ */}
        {step === 'form' && (
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setStep('select')} className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-700"><FiChevronLeft className="h-4 w-4" /> 重选类型</button>
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: info.bg }}>
                  <info.icon className="h-5 w-5" style={{ color: info.color }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{info.title}</h2>
                  <p className="text-xs text-gray-400">填写后AI自动生成7段脚本+拍摄指导</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">品牌/店铺名称 <span className="text-gray-400 font-normal">如：老李牛肉面馆</span></label>
                  <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="例：老李牛肉面馆" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">行业 <span className="text-gray-400 font-normal">如：餐饮、服装、家装</span></label>
                  <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="例：餐饮美食" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">产品/服务 <span className="text-gray-400 font-normal">如：招牌红烧牛肉面</span></label>
                  <input value={prod} onChange={e => setProd(e.target.value)} placeholder="例：招牌红烧牛肉面" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">目标客户 <span className="text-gray-400 font-normal">如：同城年轻人、宝妈、老板</span></label>
                  <input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="例：本地食客、25-45岁" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">从业年限 <span className="text-gray-400 font-normal">如：5年、10年、15年</span></label>
                  <input value={years} onChange={e => setYears(e.target.value)} placeholder="例：5年" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">核心卖点 <span className="text-gray-400 font-normal">逗号隔开，如：三代秘方,现熬8小时,牛肉大块</span></label>
                  <textarea value={sell} onChange={e => setSell(e.target.value)} placeholder="例：三代祖传秘方,每天现熬8小时,牛肉大块" rows={2} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 resize-none" />
                </div>
              </div>
              <button onClick={handleAIGenerate} disabled={aiLoading} className="btn-ai w-full mt-6">
                <FiZap className="h-4 w-4" /> {aiLoading ? 'AI生成中...' : 'AI生成专属脚本'}
              </button>
              {aiError && <p className="text-red-500 text-sm mt-2">{aiError}</p>}
              <button onClick={() => setStep('result')} className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                或直接看示例模板
              </button>
            </div>
            {/* 预览 */}
            <div className="mt-4 card !p-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">脚本结构预览</p>
              <div className="flex gap-1">
                {blocks.map((b, i) => (
                  <div key={i} className="h-2 rounded-full flex-1 bg-gradient-to-r from-brand-400 via-purple-500 to-brand-400 animate-gradient-x" style={{ opacity: 0.6 }} title={b.title} />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>开场钩子</span><span>中间内容</span><span>号召行动</span>
              </div>
            </div>
            {/* 拍摄机位预览 */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">需要用到的 {tpls.length} 种拍摄机位</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {tpls.map(t => (
                  <div key={t.id} className="shrink-0 rounded-lg border border-gray-100 bg-white px-3 py-2 text-center">
                    <t.icon className="h-4 w-4 mx-auto mb-1" style={{ color: info.color }} />
                    <p className="text-[10px] text-gray-600 whitespace-nowrap">{t.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ 结果 ═══ */}
        {step === 'result' && (
          <div ref={resultRef}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: info.bg }}>
                  <info.icon className="h-4 w-4" style={{ color: info.color }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{info.title}</h2>
                  <p className="text-xs text-gray-400">{brand} × {prod} · 2:00</p>
                </div>
              </div>
              <button onClick={() => setStep('select')} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                <FiRefreshCw className="h-3.5 w-3.5" /> 重做
              </button>
            </div>

            {/* ═══ 步骤导航（大号引导） ═══ */}
            <div className="mb-8">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  {k:'todo' as Tab, step:'第一步', l:'拍摄清单', desc:'核对拍摄所需的一切准备', icon:FiCheckSquare, color:'#FF6034'},
                  {k:'script' as Tab, step:'第二步', l:'完整脚本', desc:'逐段精读，记住台词', icon:FiEdit3, color:'#3B82F6'},
                  {k:'shots' as Tab, step:'第三步', l:'怎么拍', desc:'每段脚本的拍摄指导+参考图', icon:FiCamera, color:'#8B5CF6'},
                  {k:'guide' as Tab, step:'参考', l:'机位库', desc:'8种机位的效果+架设图', icon:FiMonitor, color:'#059669'},
                ].map(tabItem => (
                  <button key={tabItem.k} onClick={() => setTab(tabItem.k)}
                    className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 border-2 ${
                      tab === tabItem.k
                        ? 'border-transparent shadow-lg scale-[1.02]'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                    }`}
                    style={tab === tabItem.k ? { background: `linear-gradient(135deg, ${tabItem.color}15, ${tabItem.color}08)`, borderColor: tabItem.color } : {}}>
                    {tab === tabItem.k && (
                      <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${tabItem.color}, transparent 70%)` }} />
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                        tab === tabItem.k ? 'text-white shadow-md' : 'bg-gray-100 text-gray-400'
                      }`} style={tab === tabItem.k ? { backgroundColor: tabItem.color } : {}}>
                        <tabItem.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            tab === tabItem.k ? 'opacity-80' : 'text-gray-400'
                          }`} style={tab === tabItem.k ? { color: tabItem.color } : {}}>{tabItem.step}</span>
                        </div>
                        <p className={`text-base font-bold ${tab === tabItem.k ? 'text-gray-900' : 'text-gray-700'}`}>{tabItem.l}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{tabItem.desc}</p>
                      </div>
                      {tab === tabItem.k && (
                        <div className="ml-auto">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 shadow-sm">
                            <FiArrowRight className="h-3 w-3" style={{ color: tabItem.color }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* 进度指示器 */}
              <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-400">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold text-[10px]">1</span>
                <span className="text-gray-300">——</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold text-[10px]">2</span>
                <span className="text-gray-300">——</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold text-[10px]">3</span>
                <span className="text-gray-300">——</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold text-[10px]">4</span>
                <span className="text-gray-300 ml-2">按顺序从上往下做，每一步都准备好了再下一步</span>
              </div>
            </div>

            {/* ═══ 拍摄清单（默认） ═══ */}
            {tab === 'todo' && (
              <div>
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-apple mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">拍摄清单</h3>
                    <span className="text-xs text-gray-400">{doneTasks.length}/10 已完成</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div className="h-2 rounded-full transition-all bg-gradient-to-r from-brand-400 to-purple-500" style={{ width:`${doneTasks.length/10*100}%` }} /></div>
                  <div className="space-y-2">
                    {[
                      {id:'read',label:'通读一遍脚本，理解内容'},
                      {id:'props',label:'准备：手机+支架+充电+领夹麦'},
                      {id:'light',label:'找光线好的位置（脸朝向窗）'},
                      {id:'clean',label:'清理拍摄背景（不要太乱）'},
                      {id:'dress',label:'穿纯色衣服（不要条纹/格子）'},
                      {id:'test',label:'试拍10秒，检查声音和画面'},
                      {id:'film1',label:'拍摄第1-3段（开场+环境+人设）'},
                      {id:'film2',label:'拍摄第4-7段（产品+反馈+行动）'},
                      {id:'review',label:'回看素材，补拍不满意的部分'},
                      {id:'share',label:'发布！复制脚本发到抖音/TikTok'},
                    ].map(task => (
                      <button key={task.id} onClick={() => toggleTask(task.id)} className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-all ${doneTasks.includes(task.id) ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${doneTasks.includes(task.id) ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                          {doneTasks.includes(task.id) && <FiCheck className="h-3.5 w-3.5 text-white" />}
                        </div>
                        <span className={`text-sm ${doneTasks.includes(task.id) ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{task.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 下一步引导 */}
                <div className="grid gap-3 sm:grid-cols-3 mb-6">
                  <div className="card text-center cursor-pointer" onClick={() => setTab('script')}>
                    <p className="text-2xl mb-1" style={{fontSize:"20px",fontWeight:700,color:"#FF6034"}}>A</p>
                    <p className="text-sm font-semibold text-gray-900">看完整脚本</p>
                    <p className="text-[11px] text-gray-400">知道要说什么</p>
                  </div>
                  <div className="card text-center cursor-pointer" onClick={() => setTab('shots')}>
                    <p className="text-2xl mb-1" style={{fontSize:"20px",fontWeight:700,color:"#3B82F6"}}>B</p>
                    <p className="text-sm font-semibold text-gray-900">看拍摄指导</p>
                    <p className="text-[11px] text-gray-400">知道要怎么拍</p>
                  </div>
                  <div className="card text-center cursor-pointer" onClick={() => setTab('guide')}>
                    <p className="text-2xl mb-1" style={{fontSize:"20px",fontWeight:700,color:"#8B5CF6"}}>C</p>
                    <p className="text-sm font-semibold text-gray-900">看机位库</p>
                    <p className="text-[11px] text-gray-400">学全部技巧</p>
                  </div>
                </div>

                {/* 关联货源 */}
                <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #FFF5F0, #FFE4D6, #F0EBFF)' }}>
                  <p className="text-sm font-semibold text-gray-900">拍完了？去全球供应链找更多好货来拍！</p>
                  <p className="text-xs text-gray-500 mt-1">每个商品都可以用AI一键生成短视频脚本</p>
                  <Link href="/global-supply" className="mt-3 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: '#FF6034' }}>
                    去找货源 <FiArrowRight className="h-4 w-4" />
                  </Link>
                  <button onClick={copyAll} className="mt-3 ml-3 inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold" style={{ borderColor: '#FF6034', color: '#FF6034' }}>
                    <FiCopy className="h-4 w-4" /> 复制脚本
                  </button>
                </div>
              </div>
            )}

            {/* ═══ 脚本视图 ═══ */}
            {tab === 'script' && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900">完整脚本</h3>
                  <button onClick={copyAll} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"><FiCopy className="h-3.5 w-3.5" /> 复制全部</button>
                </div>
                <div className="text-xs text-gray-400 mb-4 flex items-center gap-2">
                  <FiClock className="h-3 w-3" /> 总时长2:00 · {blocks.length}段 · {brand} × {prod}
                </div>
                <div className="space-y-4">
                  {blocks.map((b, i) => {
                    const emotionIcon = (b.emotion || '').match(/^(\p{Emoji})/u)?.[1] || ''
                    const emotionText = (b.emotion || '').replace(/^\p{Emoji}\s*/u, '')
                    return (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-gray-400">[{b.t0}→{b.t1}]</span>
                        <span className="text-xs font-semibold text-gray-700">{b.title}</span>
                        <span className="text-[10px] text-gray-400 ml-auto">{b.shotType}</span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{b.line}</p>
                      {/* 观众情绪预判 */}
                      <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100/60">
                        <span className="text-sm leading-none shrink-0 mt-0.5">{emotionIcon || '👁️'}</span>
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">🎣 情绪钩子 · 用户为什么不划走</span>
                          <p className="text-xs text-purple-700/80 leading-relaxed mt-0.5">{emotionText}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5"> {b.shotDesc}</p>
                      {i < blocks.length - 1 && <hr className="mt-3 border-gray-100" />}
                    </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ═══ 拍摄指导视图 ═══ */}
            {tab === 'shots' && (
              <div>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2"><FiClock className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium text-gray-700">时间线 · 共2:00</span></div>
                  <div className="flex h-8 rounded-lg overflow-hidden shadow-sm">
                    {blocks.map((b, i) => {
                      const s = parseInt(b.t0) || 0; const e = parseInt(b.t1) || 120
                      return <div key={i} className="flex items-center justify-center text-[8px] font-bold text-white" style={{width:`${(e-s)/120*100}%`,minWidth:16,background:`linear-gradient(135deg, ${CS[i % CS.length]}, ${CS[(i+1) % CS.length]})`}}>{e-s>15&&b.t0}</div>
                    })}
                  </div>
                </div>
                <div className="space-y-3">
                  {blocks.map((b, i) => (
                    <div key={i} className="card p-4 hover:shadow-apple-md transition-all"
                      onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                      <div className="flex gap-3">
                        <div className="shrink-0 w-12 text-center pt-0.5">
                          <div className="text-base font-bold" style={{ color: CS[i % CS.length] }}>{b.t0}</div>
                          <div className="text-[9px] text-gray-400">→{b.t1}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CS[i % CS.length] }} />
                            <h3 className="font-bold text-sm text-gray-900">{b.title}</h3>
                            <span className="text-[10px] text-gray-400 ml-auto">{b.shotType}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{b.line}</p>
                          {/* 情绪预判（拍摄指导版精简显示） */}
                          {b.emotion && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-[10px]">{b.emotion.match(/^(\p{Emoji})/u)?.[1] || '👁️'}</span>
                              <span className="text-[10px] text-purple-500/70 italic">🎣 {(b.emotion || '').replace(/^\p{Emoji}\s*/u, '').split('→')[0]}</span>
                            </div>
                          )}
                          {hover === i && (
                            <div className="bg-gray-50 rounded-lg p-3 mt-2">
                              <div className="flex gap-3">
                                <div className="w-24 sm:w-28 shrink-0">
                                  <div className="aspect-[3/4] rounded-lg bg-gray-200 overflow-hidden">
                                    <img
                                      src={(() => {
                                        const sid = shotTypeToId(b.shotType)
                                        const primary = getShotImage(sid, vt)
                                        const chineseMap: Record<string, string> = {
                                          'restaurant-特写': '/shooting-templates/restaurant-美食特写.png',
                                          'restaurant-自拍': '/shooting-templates/restaurant-老板面对镜头.png',
                                          'restaurant-行走': '/shooting-templates/restaurant-第一人称做菜.png',
                                          'restaurant-环境': '/shooting-templates/restaurant-环境全景.png',
                                          'brand-特写': '/shooting-templates/brand-产品细节.png',
                                          'brand-自拍': '/shooting-templates/brand-创始人肖像.png',
                                          'brand-环境': '/shooting-templates/brand-工作室氛围.png',
                                          'trust-特写': '/shooting-templates/trust-手工艺特写.png',
                                          'trust-自拍': '/shooting-templates/trust-面对面访谈.png',
                                          'trust-环境': '/shooting-templates/trust-老板工作室.png',
                                          'knowledge-自拍': '/shooting-templates/knowledge-口播正面.png',
                                          'review-特写': '/shooting-templates/review-功能演示.png',
                                        }
                                        return chineseMap[`${vt}-${sid}`] || chineseMap[`${vt}-${b.shotType}`] || primary
                                      })()}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-medium text-gray-500 mb-0.5"> {b.shotType}</p>
                                  <p className="text-xs text-gray-600 mb-1">{b.shotDesc}</p>
                                  <p className="text-xs text-gray-500"> {b.tip}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ 机位库视图 ═══ */}
            {tab === 'guide' && (
              <div>
                <p className="text-sm text-gray-500 mb-4">共 {tpls.length} 种机位 · 每种含效果参考 + 手机/相机架设示意</p>
                <div className="grid gap-6 sm:grid-cols-2">
                  {tpls.map(t => (
                    <div key={t.id} className="card overflow-hidden p-0 hover:shadow-apple-md transition-all">
                      {/* 效果图 */}
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        <img src={getShotImage(t.id, vt)} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90"><t.icon className="h-3.5 w-3.5" style={{ color: '#FF6034' }} /></div>
                            <p className="text-sm font-bold text-white">{t.name}</p>
                          </div>
                        </div>
                        {/* 效果图标签 */}
                        <div className="absolute top-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-[9px] text-white font-medium">效果参考</div>
                      </div>

                      <div className="p-4">
                        {/* 角度 + 技巧 */}
                        <p className="text-xs text-gray-500 mb-3">{t.desc}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {t.angles.map((a,i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{a}</span>)}
                        </div>

                        {/* 机位架设示意图 — iPhone */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FiSmartphone className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-[11px] font-semibold text-gray-700">手机架设</span>
                          </div>
                          <div className="grid gap-2">
                            {t.phoneSetup.map((s, i) => (
                              <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                <div className="flex items-start gap-3">
                                  {/* 简易示意图 */}
                                  <div className="relative w-14 h-14 shrink-0 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                                    <div className="text-center">
                                      <div className="text-[16px] leading-none mb-0.5"><FiSmartphone className="h-4 w-4 mx-auto" style={{ color: '#FF6034' }} /></div>
                                      <div className="text-[7px] text-gray-400 leading-tight">手机</div>
                                    </div>
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 56 56" fill="none">
                                      {/* 视线箭头 */}
                                      <path d="M28 14 L28 28 L40 40" stroke={i === 0 ? '#FF6034' : '#3B82F6'} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-gray-700">{s.label}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">人：{s.subjectPos}</p>
                                    <p className="text-[10px] text-gray-400">机：{s.camPos}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{s.desc}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 机位架设示意图 — 相机 */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FiCamera className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-[11px] font-semibold text-gray-700">相机架设</span>
                          </div>
                          <div className="grid gap-2">
                            {t.camSetup.map((s, i) => (
                              <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                <div className="flex items-start gap-3">
                                  <div className="relative w-14 h-14 shrink-0 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                                    <div className="text-center">
                                      <div className="text-[16px] leading-none mb-0.5"><FiCamera className="h-4 w-4 mx-auto" /></div>
                                      <div className="text-[7px] text-gray-400 leading-tight">相机</div>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-gray-700">{s.label}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">人：{s.subjectPos}</p>
                                    <p className="text-[10px] text-gray-400">机：{s.camPos}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{s.desc}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 技巧 */}
                        <div>
                          <p className="text-[10px] font-medium text-gray-500 mb-1.5">拍摄技巧：</p>
                          {t.tips.map((tip,i) => <p key={i} className="text-[11px] text-gray-500">• {tip}</p>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 小白必看 */}
                <div className="mt-6 card">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">新手拍视频必看</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[{title:'光线',tips:['脸朝窗户或光源','别在头顶只有一盏灯下拍','黄昏前1小时光线最柔美']},{title:'声音',tips:['手机离嘴20-30cm','安静环境拍','嘈杂环境买¥30领夹麦']},{title:'画面',tips:['拍前擦镜头','横屏握稳或放支架','每个镜头至少5秒']},{title:'剪辑',tips:['剪映免费版够用','字幕自动生成','加背景音乐更专业']},{title:'发布',tips:['9:16竖屏发抖音','标题带关键词','发布时间晚7-9点']},{title:'坚持',tips:['至少连续发30天','每天看数据优化','前10条是练手']}].map((s,i)=>(
                      <div key={i} className="rounded-lg bg-gray-50 p-4"><p className="text-sm font-semibold text-gray-900 mb-2">{s.title}</p><ul className="space-y-1">{s.tips.map((tip,j)=><li key={j} className="text-xs text-gray-600 flex gap-1.5"><span className="text-brand-400">•</span>{tip}</li>)}</ul></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 底部TA */}
            <div className="mt-8 rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #FFF5F0, #FFE4D6, #F0EBFF)' }}>
              <p className="text-sm font-semibold text-gray-900">拿到脚本了？现在就去拍第一条视频</p>
              <p className="text-xs text-gray-500 mt-1">拍完去全球供应链找更多好货来创作</p>
              <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
                <button onClick={copyAll} className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: '#FF6034' }}>
                  <FiCopy className="h-4 w-4" /> 复制脚本
                </button>
                <button onClick={() => setStep('select')} className="inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold" style={{ borderColor: '#FF6034', color: '#FF6034' }}>
                  <FiZap className="h-4 w-4" /> 再做一个
                </button>
                <Link href="/digital-human" className="inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold" style={{ borderColor: '#8B5CF6', color: '#8B5CF6' }}>
                  <FiUser className="h-4 w-4" /> 数字人口播
                </Link>
                <Link href="/cross-border" className="inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold" style={{ borderColor: '#059669', color: '#059669' }}>
                  <FiGlobe className="h-4 w-4" /> 跨境AI工具
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
