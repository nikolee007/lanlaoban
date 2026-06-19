#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
懒老板全球供应链 — 批量生成产品图片 (Python PIL)
使用 SQLite 数据库的真实商品名，按品类配色生成精美占位图
"""

from PIL import Image, ImageDraw, ImageFont
import sqlite3, os, json, math, random

# ---------- 路径 ----------
DB_PATH = os.path.join(os.path.dirname(__file__), '../prisma/dev.db')
OUT = os.path.join(os.path.dirname(__file__), '../public/product-images')
MAP_FILE = os.path.join(os.path.dirname(__file__), '../lib/generated-product-images.json')
os.makedirs(OUT, exist_ok=True)

# ---------- 品类配色 ----------
CATS = {
    '电子':   ('#3B82F6', '#DBEAFE'),
    '手机配件': ('#2563EB', '#DBEAFE'),
    '服装':   ('#FF6034', '#FFE4E6'),
    '女装':   ('#EC4899', '#FCE7F3'),
    '男装':   ('#6366F1', '#EEF2FF'),
    '家居':   ('#22C55E', '#DCFCE7'),
    '美妆':   ('#EC4899', '#FCE7F3'),
    '食品':   ('#F59E0B', '#FEF3C7'),
    '宠物':   ('#8B5CF6', '#EDE9FE'),
    '运动':   ('#0EA5E9', '#E0F2FE'),
    '玩具':   ('#F43F5E', '#FFF0F0'),
    '鞋类':   ('#64748B', '#F1F5F9'),
    '饰品':   ('#D946EF', '#FDF2F8'),
    '文具':   ('#14B8A6', '#CCFBF1'),
    '家电':   ('#0EA5E9', '#E0F2FE'),
    '日用':   ('#84CC16', '#ECFCCB'),
    '其他':   ('#9CA3AF', '#F3F4F6'),
}

# ---------- 关键词 → 品类 ----------
KEYWORDS = [
    (['蓝牙','耳机','充电','数据线','智能','数码','电子','手机','电脑','手表','音箱','电器','LED','灯','充电宝','电池','USB','GaN','PCB','WiFi','VR','模组','芯片','适配器','插座','打火机','投影仪','电视','风扇','空调','除湿机','洗衣机','冰箱','微波炉','电饭煲','空气炸锅','榨汁机','电煮锅','加湿器','净水器','扫地'], '电子'),
    (['手机壳','钢化膜','手机支架','充电器','数据线','充电宝','耳机','音箱','智能手表','手环','蓝牙'], '手机配件'),
    (['连衣裙','T恤','衬衫','外套','大衣','卫衣','毛衣','开衫','风衣','羽绒服','棉服','夹克','西装','马甲','短裤','短裙','半身裙','阔腿裤','直筒裤','牛仔裤','打底裤','运动裤','休闲裤','西裤','内裤','内衣','文胸','内裤','船袜','丝袜','打底袜','家居服','睡衣','保暖内衣','瑜伽裤','泳装','比基尼','汉服','马面裙','旗袍','婚纱礼','唐装'  ], '服装'),
    (['女装','碎花','雪纺','蕾丝','淑女','名媛','法式','韩版','仙女','少女'], '女装'),
    (['男装','男士','商务','牛津纺'], '男装'),
    (['沙发','床垫','床','茶几','椅子','桌子','柜','收纳','置物架','鞋柜','衣柜','床头柜','梳妆台','电视柜','餐边柜','书柜','博古架','花架','屏风','隔断','榻榻米','床架','床箱','床板','床垫','枕头','抱枕','靠垫','坐垫','地垫','地毯','窗帘','窗纱','百叶窗','罗马帘','卷帘'], '家居'),
    (['床品','四件套','被套','床单','枕套','被芯','被','枕芯','毛毯','夏凉被','空调被','蚕丝被','羽绒被','棉花被','毛巾被','浴巾','毛巾','浴袍','地巾'], '家居'),
    (['口红','唇釉','唇膏','唇彩','面膜','眼影','粉底','散粉','蜜粉','腮红','高光','修容','眉笔','眼线','睫毛','护肤','精华','面霜','乳液','爽肤水','洗面奶','洁面','卸妆','防晒','隔离','BB霜','CC霜','气垫','香水','淡香水','香氛','香薰','精油','护手霜','身体乳','沐浴露','洗发水','护发素','发膜','染发','脱毛','美容仪','嫩肤','祛痘','抗皱','紧致','补水','保湿','美白','淡斑','去角质','磨砂'], '美妆'),
    (['食品','零食','饮料','茶','咖啡','啤酒','白酒','红酒','葡萄酒','洋酒','鸡尾酒','果酒','米酒','黄酒','料酒','保健品','营养','蛋白粉','维生素','钙片','益生菌','代餐','酵素','胶原','燕窝','海参','花胶','鱼胶','桃胶','皂角米','雪燕','调料','调味','酱油','醋','料酒','蚝油','生抽','老抽','豆瓣酱','火锅底料','辣椒酱','番茄酱','沙拉酱','果酱','蜂蜜','红糖','冰糖','白糖','面粉','大米','小米','燕麦','即食','方便','速食','螺蛳粉','酸辣粉','米线','面条','自热','预制菜','罐头','火腿','腊肉','香肠','扒鸡','烤鸭','牛肉干','猪肉脯','肉松','鱼干','鱿鱼','虾皮','海带','紫菜','坚果','瓜子','花生','核桃','杏仁','腰果','开心果','碧根果','夏威夷果','松子','葡萄干','红枣','枸杞','桂圆','山楂','果脯','蜜饯','饼干','面包','蛋糕','糕点','月饼','青团','汤圆','水饺','馄饨','包子','馒头','花卷','烧卖','粽子','年糕','糍粑','麻薯','薯片','膨化','巧克力','糖果','果冻','布丁','冰淇淋','雪糕','冰棍','酸奶','牛奶','奶粉','豆浆','豆奶','椰奶','核桃奶','燕麦奶','果汁','可乐','雪碧','苏打水','矿泉水','气泡水','凉茶','功能饮料','运动饮料','椰汁','椰子水'], '食品'),
    (['宠物','猫','狗','猫粮','狗粮','猫砂','宠物粮','宠物零食','宠物玩具','宠物窝','猫窝','狗窝','宠物服装','宠物衣服','牵引绳','项圈','猫砂盆','宠物碗','自动喂食','饮水机'], '宠物'),
    (['运动','健身','瑜伽','跑步','球类','泳衣','泳裤','泳镜','泳帽','比基尼','运动鞋','跑鞋','篮球鞋','足球鞋','羽毛球','乒乓球','网球','高尔夫','骑行','滑雪','滑板','轮滑','登山','徒步','户外','帐篷','睡袋','防潮垫','登山杖','背包','旅行','行李箱','拉杆箱','双肩包','手提包','斜挎包','单肩包','钱包','卡包','钥匙包','化妆包','旅行包','收纳包'], '运动'),
    (['玩具','玩偶','积木','模型','拼图','盲盒','手办','公仔','毛绒','遥控','电动','益智','早教','儿童','婴儿','摇铃','牙胶','安抚','学步','滑板车','扭扭车','平衡车','自行车','儿童车'], '玩具'),
    (['鞋','运动鞋','跑鞋','篮球鞋','板鞋','帆布鞋','皮鞋','拖鞋','凉鞋','靴子','雪地靴','马丁靴','切尔西','乐福鞋','豆豆鞋','小白鞋','老爹鞋','复古老爹鞋','高跟鞋','坡跟鞋','松糕鞋','鱼嘴鞋','罗马鞋','芭蕾鞋','玛丽珍','布鞋','绣花鞋'], '鞋类'),
    (['饰品','项链','手链','手镯','戒指','耳环','耳钉','耳坠','手串','挂坠','吊坠','玉佩','翡翠','黄金','铂金','银饰','珍珠','玛瑙','水晶','琥珀','蜜蜡','石榴石','碧玺','锆石','钻石','莫桑','锁骨链','脚链','发饰','头饰','发夹','发圈','发箍','头绳','簪子','钗','步摇','发冠','胸针','袖扣','领带夹','手表','腕表','钟表','眼镜','太阳镜','墨镜','老花镜','围巾','丝巾','披肩','手套','帽子','棒球帽','渔夫帽','贝雷帽','草帽','礼帽'], '饰品'),
    (['文具','笔','本子','笔记本','便签','胶带','修正带','修正液','橡皮','尺子','圆规','量角器','文具盒','笔袋','书包','书皮','包书皮','文件夹','资料册','档案袋','票夹','长尾夹','回形针','订书机','打孔器','美工刀','剪刀','胶水','固体胶','双面胶','透明胶','墨水','墨囊','彩铅','蜡笔','水彩笔','马克笔','荧光笔','白板笔','粉笔','画板','画架','颜料','水彩','油画','国画','毛笔','宣纸','砚台','墨条'], '文具'),
    (['家电','冰箱','洗衣机','空调','电视','音响','投影仪','微波炉','电饭煲','烤箱','蒸箱','洗碗机','消毒柜','净水器','饮水机','咖啡机','面包机','酸奶机','豆浆机','破壁机','榨汁机','原汁机','料理机','厨师机','和面机','打蛋器','电饼铛','电炖锅','电砂锅','电蒸锅','电火锅','电烤盘','电陶炉','电磁炉','燃气灶','抽油烟机','热水器','电热水器','燃气热水器','空气能','暖气','壁挂炉','取暖器','电暖器','暖风机','油汀','小太阳','浴霸','换气扇','排风扇','新风系统','吸尘器','洗地机','扫地机','拖地机','擦窗机','除螨仪','挂烫机','熨斗','缝纫机','电吹风','剃须刀','电推剪','理发器','直发器','卷发器','美容仪','洁面仪','脱毛仪','足浴盆','按摩椅','按摩器','筋膜枪','体脂秤','血压计','血糖仪','体温计','额温枪','血氧仪','制氧机','呼吸机','雾化器'], '家电'),
    (['五金','螺丝','螺母','螺栓','垫片','弹簧','轴承','齿轮','链条','皮带','密封圈','O型圈','油封','接头','弯头','三通','阀门','球阀','闸阀','截止阀','止回阀','过滤器','管道','管件','法兰','弯管','不锈钢管','钢管','铜管','铝管','PVC管','PE管','PPR管','水管','电线','电缆','开关','插座','断路器','漏保','空开','接触器','继电器','变压器','稳压器','电源','适配器','电机','马达','减速机','气缸','油缸','泵','气泵','水泵','油泵','液压','气动','轴承座','联轴器','离合器','制动器','传感器','编码器','PLC','变频器','伺服','导轨','丝杆','模组','机架','脚轮','万向轮','合页','铰链','拉手','把手','门锁','锁芯','锁体','闭门器'], '五金'),
    (['美妆','护肤','彩妆','化妆'], '美妆'),
    (['日用','收纳','厨具','餐具','锅','碗','瓢','盆','筷子','勺子','叉子','刀子','砧板','菜板','擀面杖','打蛋器','漏勺','汤勺','铲子','夹子','保鲜膜','保鲜袋','垃圾袋','一次性','纸杯','纸碗','纸巾','抽纸','卷纸','手帕纸','湿巾','棉签','化妆棉','牙线','牙签','棉柔巾','洗脸巾','抹布','洗碗布','百洁布','钢丝球','清洁球','海绵擦','玻璃擦','拖把','扫把','簸箕','垃圾桶','收纳箱','收纳盒','收纳筐','收纳架','衣架','裤架','挂钩','粘钩','吸盘','置物架','浴室架','厨房架','调味盒','调味瓶','油壶','米桶','面桶','储物罐','密封罐','保鲜盒','便当盒','饭盒','水杯','杯子','保温杯','玻璃杯','陶瓷杯','马克杯','咖啡杯','茶杯','茶壶','酒具','醒酒器','开瓶器','红酒塞','冰格','制冰机','保温壶','热水瓶','暖壶','暖水瓶','热水袋','暖宝宝','暖手宝','冰袋','冰包'], '日用'),
    (['建材','瓷砖','地板','木地板','复合地板','实木地板','强化地板','石材','大理石','花岗岩','人造石','石英石','岩板','墙纸','壁纸','墙布','无缝墙布','墙板','护墙板','集成墙板','扣板','吊顶','石膏板','龙骨','隔音','保温','防水','涂料','乳胶漆','艺术漆','硅藻泥','腻子','水泥','沙子','砖','红砖','空心砖','加气块','瓦','琉璃瓦','彩钢瓦','沥青瓦','阳光板','耐力板','亚克力','玻璃','钢化玻璃','中空玻璃','夹胶玻璃','Low-E玻璃','门窗','防盗门','木门','实木门','复合门','铝合金门','推拉门','折叠门','移门','隔断门','淋浴房','浴室柜','洗手台','马桶','蹲便器','小便斗','浴缸','水龙头','花洒','下水','地漏','角阀','软管','高压管','编织管','八字阀','水槽','洗碗槽','菜盆','面盆','台上盆','台下盆','一体盆','陶瓷盆','玻璃盆','不锈钢盆'], '建材'),
    (['汽配','汽车','车','摩托车','电动车','自行车','轮胎','轮毂','轮圈','车灯','大灯','尾灯','雾灯','转向灯','日行灯','车膜','改色膜','隐形车衣','太阳膜','隔热膜','防爆膜','车窗膜','车身膜','座套','坐垫','脚垫','后备箱垫','方向盘套','档把套','手刹套','安全带','安全座椅','导航','行车记录仪','倒车影像','雷达','360全景','车载','车充','车载充电','车载支架','车载香水','空气净化','车载冰箱','遮阳挡','遮阳帘','车衣','车罩','车顶箱','行李架','踏板','挡泥板','雨刷','雨刮','玻璃水','防冻液','机油','机滤','空滤','空调滤','刹车片','刹车盘','火花塞','电瓶','蓄电池','启动电源','充气泵','千斤顶','三角架','灭火器','急救包'], '汽配'),
]

def guess_cat(name):
    """根据商品名猜测品类"""
    if not name:
        return '其他'
    name_lower = name
    for kws, c in KEYWORDS:
        if any(k in name_lower for k in kws):
            return c
    return '其他'

# ---------- 从数据库读取 ----------
def get_products():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, name FROM Product ORDER BY id")
    rows = c.fetchall()
    conn.close()
    return rows

# ---------- 生成图片 ----------
W, H = 512, 512

def hex_to_rgb(h):
    return (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16))

def lighten(rgb, factor):
    return tuple(min(255, int(c + (255 - c) * factor)) for c in rgb)

def darken(rgb, factor):
    return tuple(int(c * (1 - factor)) for c in rgb)

def make_image(name, pid, cat):
    accent_hex, light_hex = CATS.get(cat, CATS['其他'])
    ac = hex_to_rgb(accent_hex)
    li = hex_to_rgb(light_hex)

    img = Image.new('RGB', (W, H), li)
    draw = ImageDraw.Draw(img)

    # --- 渐变背景 ---
    for y in range(H):
        t = y / H
        r = int(li[0] + (ac[0] - li[0]) * t * 0.25)
        g = int(li[1] + (ac[1] - li[1]) * t * 0.25)
        b = int(li[2] + (ac[2] - li[2]) * t * 0.25)
        draw.line([(0, y), (W - 1, y)], fill=(min(255, r), min(255, g), min(255, b)))

    # --- 装饰元素：半透明圆 ---
    for cx, cy, r, a in [
        (W*0.15, H*0.15, 140, 25),
        (W*0.85, H*0.85, 160, 18),
        (W*0.75, H*0.20, 80, 12),
        (W*0.25, H*0.80, 100, 15),
    ]:
        overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.ellipse([cx - r, cy - r, cx + r, cy + r], fill=ac + (a,))
        img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
        draw = ImageDraw.Draw(img)

    # --- 产品卡片 ---
    cx, cy = 56, 90
    cw, ch = 400, 332
    draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=24, fill='white')
    # 阴影效果: 模拟阴影
    draw.rounded_rectangle([cx + 3, cy + 3, cx + cw + 3, cy + ch + 3], radius=24, fill=None, outline=darken(li, 0.05), width=1)
    draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=24, fill=None, outline=ac, width=2)

    # --- 产品图形区域 (用色块抽象表示不同品类) ---
    px, py = cx + 30, cy + 20
    pw, ph = 340, 170
    draw.rounded_rectangle([px, py, px + pw, py + ph], radius=14, fill=ac + (30,))

    # 根据品类画不同的抽象图形
    if cat in ('电子', '手机配件', '家电'):
        # 电子类：电路板风格条纹 + 芯片方块
        for i, (x, w, h) in enumerate([(60, 180, 18), (100, 120, 12), (150, 80, 14), (200, 100, 10), (260, 60, 16)]):
            draw.rounded_rectangle([px + x, py + 30 + i*30, px + x + w, py + 30 + i*30 + h], radius=6, fill=lighten(ac, 0.3))
        # 芯片方块
        draw.rounded_rectangle([px + pw//2 - 30, py + ph//2 - 25, px + pw//2 + 30, py + ph//2 + 25], radius=6, fill=ac)
        draw.rounded_rectangle([px + pw//2 - 18, py + ph//2 - 13, px + pw//2 + 18, py + ph//2 + 13], radius=3, fill=lighten(ac, 0.4))
    elif cat in ('服装', '女装', '男装'):
        # 服装类：衣架 + 衣服轮廓
        # 衣架横杆
        draw.rounded_rectangle([px + 60, py + 20, px + pw - 60, py + 26], radius=4, fill=ac)
        # 衣服 (三角形轮廓)
        for i in range(3):
            offset = i * 60
            # 三角形衣服
            cx_shirt = px + 80 + offset
            cy_shirt = py + 40
            shirt_w, shirt_h = 80, 110
            points = [
                (cx_shirt, cy_shirt),
                (cx_shirt - shirt_w//2, cy_shirt + shirt_h),
                (cx_shirt + shirt_w//2, cy_shirt + shirt_h),
            ]
            draw.polygon(points, fill=lighten(ac, 0.15 + i*0.1))
            # 领口
            draw.polygon([
                (cx_shirt, cy_shirt + 15),
                (cx_shirt - 12, cy_shirt + 30),
                (cx_shirt + 12, cy_shirt + 30),
            ], fill=lighten(ac, 0.4))
    elif cat in ('食品',):
        # 食品类：瓶子 + 标签
        for i in range(2):
            bx = px + 70 + i * 130
            by = py + 20
            bw, bh = 80, 130
            # 瓶身
            draw.rounded_rectangle([bx, by + 20, bx + bw, by + bh], radius=10, fill=lighten(ac, 0.2 + i*0.1))
            # 瓶颈
            draw.rounded_rectangle([bx + 25, by, bx + bw - 25, by + 25], radius=5, fill=lighten(ac, 0.3 + i*0.1))
            # 标签
            draw.rounded_rectangle([bx + 10, by + 40, bx + bw - 10, by + 100], radius=6, fill=lighten(ac, 0.4 + i*0.1))
            # 标签装饰线
            draw.rounded_rectangle([bx + 15, by + 55, bx + bw - 15, by + 60], radius=2, fill=ac)
    elif cat in ('美妆',):
        # 美妆类：口红 + 化妆刷
        # 口红1 (竖放)
        draw.rounded_rectangle([px + 70, py + 20, px + 110, py + 130], radius=8, fill=lighten(ac, 0.2))
        draw.rectangle([px + 70, py + 20, px + 110, py + 35], fill=ac)
        draw.rounded_rectangle([px + 85, py + 130, px + 95, py + 140], radius=3, fill=ac)
        # 口红2 (斜放)
        draw.rounded_rectangle([px + 160, py + 30, px + 200, py + 135], radius=8, fill=lighten(ac, 0.35))
        draw.rectangle([px + 160, py + 30, px + 200, py + 45], fill=darken(ac, 0.1))
        # 化妆刷
        bx = px + 250
        draw.rounded_rectangle([bx + 10, py + 30, bx + 16, py + 120], radius=3, fill=darken(ac, 0.2))
        draw.rounded_rectangle([bx, py + 110, bx + 26, py + 135], radius=6, fill=lighten(ac, 0.3))
        draw.rounded_rectangle([bx + 3, py + 112, bx + 23, py + 130], radius=4, fill=lighten(ac, 0.1))
    elif cat in ('家居',):
        # 家居：沙发轮廓
        sofa_y = py + 40
        draw.rounded_rectangle([px + 50, sofa_y, px + pw - 50, sofa_y + 80], radius=12, fill=lighten(ac, 0.2))
        # 扶手
        draw.rounded_rectangle([px + 40, sofa_y - 10, px + 70, sofa_y + 60], radius=8, fill=lighten(ac, 0.35))
        draw.rounded_rectangle([px + pw - 70, sofa_y - 10, px + pw - 40, sofa_y + 60], radius=8, fill=lighten(ac, 0.35))
        # 靠背
        draw.rounded_rectangle([px + 55, sofa_y - 30, px + pw - 55, sofa_y + 15], radius=10, fill=lighten(ac, 0.15))
        # 抱枕
        for i in range(2):
            draw.rounded_rectangle([px + 80 + i*120, sofa_y + 15, px + 140 + i*120, sofa_y + 55], radius=8, fill=lighten(ac, 0.3 + i*0.1))
    elif cat in ('宠物',):
        # 宠物：骨头 + 爪印
        def draw_bone(x, y, size, fill_col):
            s = size
            draw.rounded_rectangle([x, y + s//2, x + s*3, y + s//2 + s], radius=s//2, fill=fill_col)
            draw.ellipse([x - s//3, y, x + s, y + s], fill=fill_col)
            draw.ellipse([x + s*2, y, x + s*3 + s//3, y + s], fill=fill_col)
            draw.ellipse([x - s//3, y + s, x + s, y + s*2], fill=fill_col)
            draw.ellipse([x + s*2, y + s, x + s*3 + s//3, y + s*2], fill=fill_col)
        draw_bone(px + 60, py + 25, 20, lighten(ac, 0.3))
        draw_bone(px + 210, py + 40, 22, lighten(ac, 0.15))
        # 爪印
        for cx, cy, r in [(px+120, py+120, 18), (px+160, py+115, 14), (px+200, py+120, 18), (px+260, py+130, 16), (px+290, py+145, 12)]:
            draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=lighten(ac, 0.25))
    elif cat in ('运动',):
        # 运动：球类 + 跑步鞋
        # 球
        for i, (cx, cy, r) in enumerate([(px+100, py+65, 35), (px+220, py+55, 30), (px+160, py+110, 28)]):
            draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=lighten(ac, 0.2 + i*0.1))
            draw.ellipse([cx-int(r*0.7), cy-int(r*0.7), cx+int(r*0.7), cy+int(r*0.7)], fill=None, outline=lighten(ac, 0.4), width=2)
        # 鞋轮廓
        sx, sy = px + 60, py + 100
        draw.rounded_rectangle([sx, sy, sx + 140, sy + 45], radius=10, fill=lighten(ac, 0.35))
        draw.rounded_rectangle([sx + 115, sy + 5, sx + 145, sy + 35], radius=5, fill=lighten(ac, 0.1))
        draw.rounded_rectangle([sx + 130, sy + 5, sx + 145, sy + 35], radius=4, fill=ac)
    elif cat in ('玩具',):
        # 玩具：积木 + 星星
        for i, (bx, by, bw, bh) in enumerate([(px+50, py+20, 55, 55), (px+120, py+40, 50, 50), (px+185, py+20, 60, 60), (px+260, py+45, 45, 45)]):
            draw.rounded_rectangle([bx, by, bx+bw, by+bh], radius=8, fill=lighten(ac, 0.15 + i*0.1))
            draw.rounded_rectangle([bx+bw//4, by+bh//4, bx+bw*3//4, by+bh*3//4], radius=4, fill=lighten(ac, 0.3 + i*0.1))
            # 积木凸点
            draw.ellipse([bx+bw//2-6, by-4, bx+bw//2+6, by+8], fill=lighten(ac, 0.4))
    elif cat in ('鞋类',):
        # 鞋类：鞋子轮廓
        for i, offset in enumerate([0, 130]):
            sx = px + 40 + offset
            sy = py + 20 + i*65
            # 鞋底
            draw.rounded_rectangle([sx + 15, sy + 40, sx + 140, sy + 48], radius=6, fill=darken(ac, 0.1))
            # 鞋身
            draw.rounded_rectangle([sx + 30, sy + 10, sx + 130, sy + 42], radius=10, fill=lighten(ac, 0.2 + i*0.1))
            # 鞋头
            draw.rounded_rectangle([sx + 95, sy + 12, sx + 135, sy + 38], radius=8, fill=lighten(ac, 0.4 + i*0.1))
            # 鞋带孔
            for hx in [sx+50, sx+65, sx+80]:
                draw.ellipse([hx-2, sy+15, hx+2, sy+19], fill=darken(ac, 0.2))
    elif cat in ('饰品',):
        # 饰品：项链 + 宝石
        # 项链链子
        draw.arc([px+50, py+10, px+pw-50, py+160], 0, 180, fill=lighten(ac, 0.3), width=3)
        # 吊坠
        draw.ellipse([px+pw//2-15, py+75, px+pw//2+15, py+105], fill=lighten(ac, 0.2))
        draw.ellipse([px+pw//2-8, py+82, px+pw//2+8, py+98], fill=lighten(ac, 0.4))
        # 闪亮小点
        for sx, sy in [(px+80, py+40), (px+140, py+55), (px+200, py+50), (px+260, py+45)]:
            draw.ellipse([sx-3, sy-3, sx+3, sy+3], fill=lighten(ac, 0.5))
    elif cat in ('文具',):
        # 文具：笔 + 书本
        # 笔
        draw.rounded_rectangle([px+50, py+25, px+55, py+120], radius=4, fill=darken(ac, 0.1))
        draw.rounded_rectangle([px+45, py+20, px+60, py+30], radius=3, fill=ac)
        # 笔2
        draw.rounded_rectangle([px+80, py+30, px+85, py+115], radius=4, fill=lighten(ac, 0.2))
        draw.rounded_rectangle([px+75, py+25, px+90, py+35], radius=3, fill=lighten(ac, 0.1))
        # 笔3
        draw.rounded_rectangle([px+110, py+35, px+115, py+110], radius=4, fill=lighten(ac, 0.35))
        # 书本
        draw.rounded_rectangle([px+150, py+20, px+310, py+130], radius=6, fill=lighten(ac, 0.2))
        draw.line([(px+230, py+25), (px+230, py+125)], fill=lighten(ac, 0.1), width=2)
        # 书页线
        for ly in range(40, 120, 15):
            draw.line([(px+165, ly), (px+220, ly)], fill=lighten(ac, 0.35), width=1)
            draw.line([(px+240, ly), (px+295, ly)], fill=lighten(ac, 0.35), width=1)
    elif cat in ('五金', '建材', '汽配'):
        # 五金/建材：齿轮 + 工具
        # 大齿轮
        cx_g, cy_g = px + 100, py + 70
        for i in range(8):
            angle = i * math.pi / 4
            gx = cx_g + 35 * math.cos(angle)
            gy = cy_g + 35 * math.sin(angle)
            draw.ellipse([gx-8, gy-8, gx+8, gy+8], fill=lighten(ac, 0.2))
        draw.ellipse([cx_g-28, cy_g-28, cx_g+28, cy_g+28], fill=lighten(ac, 0.15))
        draw.ellipse([cx_g-15, cy_g-15, cx_g+15, cy_g+15], fill=lighten(ac, 0.35))
        draw.ellipse([cx_g-5, cy_g-5, cx_g+5, cy_g+5], fill=ac)
        # 扳手
        dx = px + 210
        draw.rounded_rectangle([dx, py+25, dx+12, py+120], radius=4, fill=darken(ac, 0.15))
        draw.rounded_rectangle([dx-10, py+20, dx+22, py+35], radius=5, fill=ac)
        draw.rounded_rectangle([dx-8, py+22, dx+20, py+33], radius=3, fill=lighten(ac, 0.2))
        # 螺丝
        for s in [(px+280, py+50), (px+285, py+90), (px+280, py+125)]:
            draw.ellipse([s[0]-8, s[1]-8, s[0]+8, s[1]+8], fill=lighten(ac, 0.25))
            draw.line([s[0]-4, s[1], s[0]+4, s[1]], fill=darken(ac, 0.1), width=2)
    else:
        # 其他/日用：通用礼盒
        draw.rounded_rectangle([px+50, py+20, px+pw-50, py+ph-20], radius=12, fill=lighten(ac, 0.15))
        # 蝴蝶结
        draw.rounded_rectangle([px+pw//2-8, py+10, px+pw//2+8, py+40], radius=4, fill=lighten(ac, 0.4))
        # 丝带
        draw.line([(px+50, py+50), (px+pw-50, py+ph-20)], fill=lighten(ac, 0.3), width=4)
        draw.line([(px+pw-50, py+50), (px+50, py+ph-20)], fill=lighten(ac, 0.3), width=4)
        draw.ellipse([px+pw//2-20, py+ph//2-20, px+pw//2+20, py+ph//2+20], fill=lighten(ac, 0.2))

    # --- 底部品类标签 ---
    label_w = 180
    label_h = 34
    lx = (W - label_w) // 2
    ly = py + ph + 14
    draw.rounded_rectangle([lx, ly, lx + label_w, ly + label_h], radius=17, fill=ac)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 18)
        font_small = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 13)
    except:
        font = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # 品类名居中
    cat_text = f'{cat}'
    bbox = draw.textbbox((0, 0), cat_text, font=font)
    tx = (W - (bbox[2] - bbox[0])) // 2
    ty = ly + 2
    draw.text((tx, ty), cat_text, fill='white', font=font)

    # --- 产品名 (底部) ---
    name_display = name if len(name) <= 14 else name[:13] + '…'
    bbox2 = draw.textbbox((0, 0), name_display, font=font_small)
    nx2 = (W - (bbox2[2] - bbox2[0])) // 2
    draw.text((nx2, ly + 40), name_display, fill=darken(li, 0.4), font=font_small)

    # --- 价格标签 (右上角装饰) ---
    price = f'¥{random.randint(9, 399)}'
    draw.rounded_rectangle([W - 95, 25, W - 20, 55], radius=15, fill=ac)
    draw.rounded_rectangle([W - 93, 27, W - 22, 53], radius=13, fill=None, outline=lighten(ac, 0.2), width=1)
    bbox3 = draw.textbbox((0, 0), price, font=font_small)
    px2 = (W - 20 - 95 - (bbox3[2] - bbox3[0])) // 2 + 95
    draw.text((px2, 30), price, fill='white', font=font_small)

    # --- 编号标签 ---
    pid_text = f'#{pid}'
    draw.rounded_rectangle([20, 25, 85, 55], radius=15, fill=ac)
    bbox4 = draw.textbbox((0, 0), pid_text, font=font_small)
    px3 = (85 - 20 - (bbox4[2] - bbox4[0])) // 2 + 20
    draw.text((px3, 30), pid_text, fill='white', font=font_small)

    fp = os.path.join(OUT, f'product-{pid}.webp')
    img.save(fp, 'WEBP', quality=90)
    return fp


# ========== 主流程 ==========
def main():
    products = get_products()
    print(f'📦 数据库共 {len(products)} 个商品 (ID: {products[0][0]}~{products[-1][0]})')

    # 读取已有映射
    mapping = {}
    if os.path.exists(MAP_FILE):
        with open(MAP_FILE) as f:
            mapping = json.load(f)
    existing_ids = set(mapping.keys())
    print(f'🖼️  已有映射: {len(existing_ids)} 张')

    # 统计品类分布
    cat_count = {}

    count = 0
    for pid, name in products:
        pid_str = str(pid)
        if pid_str in existing_ids:
            continue

        cat = guess_cat(name)
        cat_count[cat] = cat_count.get(cat, 0) + 1

        fp = make_image(name, pid, cat)
        mapping[pid_str] = f'/product-images/product-{pid}.webp'
        count += 1

        if count % 10 == 0 or count <= 5:
            print(f'  ✅ #{pid} [{cat}] {name[:25]}')

    # 保存映射
    with open(MAP_FILE, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)

    print(f'\n{"="*50}')
    print(f'✅ 新增 {count} 张，总计 {len(mapping)} 张')
    if cat_count:
        print(f'📊 品类分布:')
        for cat, c in sorted(cat_count.items(), key=lambda x: -x[1]):
            print(f'   {cat}: {c} 张')
    print(f'📄 映射文件: {MAP_FILE}')


if __name__ == '__main__':
    main()
