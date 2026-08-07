/**
 * 真实案例数据 — 懒老板操盘 IP 成果
 * 视频文件位于 public/videos/,封面位于 public/videos/posters/
 */

export interface CaseVideo {
  /** 案例名 */
  name: string
  /** 行业分类 */
  industry: string
  /** 视频路径 */
  video: string
  /** 封面路径 */
  poster: string
  /** 方向 */
  orientation: 'portrait' | 'landscape'
  /** 一句话简介 */
  desc: string
  /** 流量标签(真实操盘数据) */
  stats?: string
}

/** 真实数字人 IP — 24 个 */
export const digitalIpCases: CaseVideo[] = [
  { name: '成人声乐老师', industry: '音乐教育', orientation: 'portrait', video: '/videos/digital-成人声乐老师.mp4', poster: '/videos/posters/digital-成人声乐老师.jpg', desc: '成人声乐教学 IP · 口播引流', stats: '全网 5000w+' },
  { name: '宠物产品 IP', industry: '宠物', orientation: 'portrait', video: '/videos/digital-宠物产品-IP.mp4', poster: '/videos/posters/digital-宠物产品-IP.jpg', desc: '宠物用品种草 IP · 带货视频', stats: '单条 800w+' },
  { name: '儿童声乐老师', industry: '音乐教育', orientation: 'portrait', video: '/videos/digital-儿童声乐老师.mp4', poster: '/videos/posters/digital-儿童声乐老师.jpg', desc: '少儿声乐教学 IP · 人设口播', stats: '全网 3000w+' },
  { name: '服装主理人', industry: '服装', orientation: 'portrait', video: '/videos/digital-服装主理人.mp4', poster: '/videos/posters/digital-服装主理人.jpg', desc: '服装店主 IP · 真人形象口播', stats: '单条 300w+' },
  { name: '服装主理人 2', industry: '服装', orientation: 'portrait', video: '/videos/digital-服装主理人-2.mp4', poster: '/videos/posters/digital-服装主理人-2.jpg', desc: '服装人设 IP · 穿搭口播', stats: '全网 1000w+' },
  { name: '服装主理人 3', industry: '服装', orientation: 'portrait', video: '/videos/digital-服装主理人-3.mp4', poster: '/videos/posters/digital-服装主理人-3.jpg', desc: '品牌创始人 IP · 故事口播', stats: '全网 2000w+' },
  { name: '钢琴 IP', industry: '音乐教育', orientation: 'portrait', video: '/videos/digital-钢琴-IP.mp4', poster: '/videos/posters/digital-钢琴-IP.jpg', desc: '钢琴教学 IP · 演奏+口播', stats: '单条 500w+' },
  { name: '韩语 IP', industry: '语言教育', orientation: 'portrait', video: '/videos/digital-韩语-IP.mp4', poster: '/videos/posters/digital-韩语-IP.jpg', desc: '韩语教学 IP · 干货口播', stats: '全网 1500w+' },
  { name: '合唱指挥老师', industry: '音乐教育', orientation: 'portrait', video: '/videos/digital-合唱指挥老师.mp4', poster: '/videos/posters/digital-合唱指挥老师.jpg', desc: '合唱指挥 IP · 专业口播', stats: '全网 800w+' },
  { name: '葫芦丝老师', industry: '音乐教育', orientation: 'portrait', video: '/videos/digital-葫芦丝老师.mp4', poster: '/videos/posters/digital-葫芦丝老师.jpg', desc: '民族乐器教学 IP', stats: '单条 200w+' },
  { name: '律师导师', industry: '法律', orientation: 'portrait', video: '/videos/digital-律师导师.mp4', poster: '/videos/posters/digital-律师导师.jpg', desc: '法律咨询 IP · 专业人设', stats: '全网 5000w+' },
  { name: '母婴 IP', industry: '母婴', orientation: 'portrait', video: '/videos/digital-母婴-IP.mp4', poster: '/videos/posters/digital-母婴-IP.jpg', desc: '母婴育儿 IP · 知识口播', stats: '全网 2000w+' },
  { name: '商业导师', industry: '商业咨询', orientation: 'portrait', video: '/videos/digital-商业导师.mp4', poster: '/videos/posters/digital-商业导师.jpg', desc: '商业模式 IP · 认知口播', stats: '单条 400w+' },
  { name: '生发导师', industry: '健康', orientation: 'portrait', video: '/videos/digital-生发导师.mp4', poster: '/videos/posters/digital-生发导师.jpg', desc: '健康养护 IP · 案例口播', stats: '全网 1200w+' },
  { name: '生发导师 2', industry: '健康', orientation: 'portrait', video: '/videos/digital-生发导师-2.mp4', poster: '/videos/posters/digital-生发导师-2.jpg', desc: '养护知识 IP · 干货内容', stats: '全网 900w+' },
  { name: '太极拳导师', industry: '健身', orientation: 'portrait', video: '/videos/digital-太极拳导师.mp4', poster: '/videos/posters/digital-太极拳导师.jpg', desc: '太极教学 IP · 演示+口播', stats: '全网 1800w+' },
  { name: '糖水店老板', industry: '餐饮', orientation: 'portrait', video: '/videos/digital-糖水店老板.mp4', poster: '/videos/posters/digital-糖水店老板.jpg', desc: '糖水店老板 IP · 店铺口播', stats: '单条 300w+' },
  { name: '舞蹈博主 IP', industry: '舞蹈', orientation: 'portrait', video: '/videos/digital-舞蹈博主-IP.mp4', poster: '/videos/posters/digital-舞蹈博主-IP.jpg', desc: '舞蹈达人 IP · 演出内容', stats: '全网 4000w+' },
  { name: '舞蹈老师', industry: '舞蹈教育', orientation: 'portrait', video: '/videos/digital-舞蹈老师.mp4', poster: '/videos/posters/digital-舞蹈老师.jpg', desc: '舞蹈教学 IP · 教学口播', stats: '全网 3000w+' },
  { name: '医生 IP', industry: '医疗健康', orientation: 'portrait', video: '/videos/digital-医生-IP.mp4', poster: '/videos/posters/digital-医生-IP.jpg', desc: '医生科普 IP · 专业人设', stats: '全网 6000w+' },
  { name: '幼师数字人', industry: '幼教', orientation: 'portrait', video: '/videos/digital-幼师数字人.mp4', poster: '/videos/posters/digital-幼师数字人.jpg', desc: '幼师人设 IP · 亲子内容', stats: '单条 200w+' },
  { name: '玉石 IP', industry: '珠宝', orientation: 'portrait', video: '/videos/digital-玉石-IP.mp4', poster: '/videos/posters/digital-玉石-IP.jpg', desc: '玉石文玩 IP · 鉴定口播', stats: '全网 1500w+' },
  { name: '运营导师', industry: '商业咨询', orientation: 'portrait', video: '/videos/digital-运营导师.mp4', poster: '/videos/posters/digital-运营导师.jpg', desc: '运营教学 IP · 干货输出', stats: '全网 2000w+' },
  { name: '植发导师', industry: '医疗健康', orientation: 'portrait', video: '/videos/digital-植发导师.mp4', poster: '/videos/posters/digital-植发导师.jpg', desc: '植发咨询 IP · 专业科普', stats: '全网 2500w+' },
]

/** 真实产品宣传片 — 9 个 */
export const productCases: CaseVideo[] = [
  { name: '电吹风', industry: '个护电器', orientation: 'landscape', video: '/videos/product-电吹风.mp4', poster: '/videos/posters/product-电吹风.jpg', desc: '30s 精品产品宣传片' },
  { name: '水滴轮', industry: '户外渔具', orientation: 'landscape', video: '/videos/product-水滴轮.mp4', poster: '/videos/posters/product-水滴轮.jpg', desc: '钓鱼装备 AI 宣传片' },
  { name: '童车', industry: '母婴用品', orientation: 'landscape', video: '/videos/product-童车.mp4', poster: '/videos/posters/product-童车.jpg', desc: '婴儿推车 AI 宣传片' },
  { name: '香水', industry: '美妆', orientation: 'landscape', video: '/videos/product-香水.mp4', poster: '/videos/posters/product-香水.jpg', desc: '香水品牌 AI 广告片' },
  { name: '鞋耙子', industry: '家居', orientation: 'landscape', video: '/videos/product-鞋耙子.mp4', poster: '/videos/posters/product-鞋耙子.jpg', desc: '家居小工具 AI 宣传片' },
  { name: '音响', industry: '数码', orientation: 'landscape', video: '/videos/product-音响.mp4', poster: '/videos/posters/product-音响.jpg', desc: '智能音响 AI 广告片' },
  { name: '饮料', industry: '食品饮料', orientation: 'landscape', video: '/videos/product-饮料.mp4', poster: '/videos/posters/product-饮料.jpg', desc: '饮品品牌 AI 宣传片' },
  { name: '羽绒服', industry: '服装', orientation: 'landscape', video: '/videos/product-羽绒服.mp4', poster: '/videos/posters/product-羽绒服.jpg', desc: '服装单品 AI 宣传片' },
  { name: '圆珠笔', industry: '办公文具', orientation: 'landscape', video: '/videos/product-圆珠笔.mp4', poster: '/videos/posters/product-圆珠笔.jpg', desc: '文具产品 AI 广告片' },
]

/** 全量案例 */
export const allCases: CaseVideo[] = [...digitalIpCases, ...productCases]
