"""
从 public/product-images/baidu/ 目录扫描所有图片，
重新生成 lib/baidu-image-map.json 和 product-placeholder.ts 中的 INLINE_KEYWORD_MAP / CATEGORY_REAL_PHOTOS
"""
import os
import json
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(BASE, 'public/product-images/baidu')
JSON_MAP_PATH = os.path.join(BASE, 'lib/baidu-image-map.json')
TS_PATH = os.path.join(BASE, 'lib/product-placeholder.ts')


def scan_images():
    """扫描目录，返回 (category→files, keyword_map)"""
    if not os.path.isdir(IMG_DIR):
        print(f'❌ 目录不存在: {IMG_DIR}')
        return {}, {}

    files = sorted(os.listdir(IMG_DIR))
    # 按品类分组
    cat_files = {}
    # 关键词映射（从文件名推断搜索词）
    keyword_map = {}  # 搜索词 → [路径]

    for f in files:
        fp = os.path.join(IMG_DIR, f)
        if not os.path.isfile(fp) or os.path.getsize(fp) < 8000:
            continue
        # 文件名: 品类_搜索词_序号.jpg
        # 例如: 电子产品_蓝牙耳机_0.jpg
        if '_' not in f:
            continue
        parts = f.split('_')
        category = parts[0]
        cat_files.setdefault(category, []).append(f'/product-images/baidu/{f}')

        # 重建搜索词：取去掉品类和序号后的中间部分
        # parts[0] = category, parts[-1] = 0.jpg → 去掉
        kw_parts = parts[1:-1]
        search_kw = '_'.join(kw_parts)
        keyword_map.setdefault(search_kw, []).append(f'/product-images/baidu/{f}')

    return cat_files, keyword_map


def build_json_map(keyword_map):
    """从关键词映射生成 baidu-image-map.json"""
    return keyword_map


def build_ts_blocks(cat_files, keyword_map):
    """生成 product-placeholder.ts 需要的代码块"""
    # 1. CATEGORY_REAL_PHOTOS
    cat_blocks = {}
    for cat_name in sorted(cat_files.keys()):
        cat_blocks[cat_name] = cat_files[cat_name]

    # 2. INLINE_KEYWORD_MAP - 需要推导用户友好的短关键词
    # 从文件名中关键词部分取前10个有效字符作为短关键词
    # 同时去重合并同义词
    inline_kw_map = {}
    used_paths = set()

    # 简化的关键词逻辑：
    # 每个搜索词都作为一个关键词（部分可能重复，但去重处理）
    seen = set()
    for kw in sorted(keyword_map.keys()):
        paths = keyword_map[kw]
        # 去短关键词
        short_kw = shorten_keyword(kw)
        if short_kw in seen:
            # 合并路径
            existing = inline_kw_map.get(short_kw, [])
            for p in paths:
                if p not in existing:
                    existing.append(p)
            inline_kw_map[short_kw] = existing
        else:
            inline_kw_map[short_kw] = list(paths)
            seen.add(short_kw)

    return cat_blocks, inline_kw_map


def shorten_keyword(kw):
    """
    将搜索关键词缩短为用户友好的短关键词
    例如:
      'LED台灯护眼' → 'LED台灯'
      '纯棉T恤男' → '纯棉T恤'
      '手机壳硅胶' → '手机壳'
      '充电宝移动电源' → '充电宝'
      '智能手表运动' → '智能手表'
      ...
    """
    # 已知的常用短关键词映射
    KNOWN_MAP = {
        'LED台灯护眼': 'LED台灯',
        '纯棉T恤男': '纯棉T恤',
        '手机壳硅胶': '手机壳',
        '充电宝移动电源': '充电宝',
        '智能手表运动': '智能手表',
        '智能手环运动': '智能手环',
        '运动手表户外': '运动手表',
        '蓝牙音箱便携': '蓝牙音箱',
        '电脑音箱桌面': '电脑音箱',
        '手机数据线typec': '手机数据线',
        '无线耳机充电仓': '无线耳机',
        '无线充电器快充': '无线充电器',
        '头戴式耳机头戴': '头戴式耳机',
        '智能台灯LED': '智能台灯',
        '智能插座WiFi': '智能插座',
        '蓝牙自拍杆三脚架': '自拍杆',
        '行车记录仪4K': '行车记录仪',
        'VR眼镜一体机': 'VR眼镜',
        '运动鞋跑鞋': '运动鞋',
        '跑鞋男透气': '跑鞋',
        '运动水壶': '运动水壶',
        '瑜伽垫健身': '瑜伽垫',
        '哑铃健身器材': '哑铃',
        '跑步机家用': '跑步机',
        '连衣裙女装夏': '连衣裙',
        '牛仔裤男款': '牛仔裤',
        '休闲衬衫男': '休闲衬衫',
        '运动套装女': '运动套装',
        '卫衣连帽衫': '卫衣',
        '卫衣连帽': '卫衣',
        '羽绒服轻薄': '羽绒服',
        '睡衣家居服': '睡衣',
        '真丝睡衣女': '真丝睡衣',
        '婴儿连体衣爬服': '婴儿连体衣',
        '儿童服装童装': '儿童服装',
        '夹克外套男': '夹克',
        '大衣羊毛女': '大衣',
        'POLO衫男': 'POLO衫',
        '丝巾真丝': '丝巾',
        '内衣文胸': '内衣',
        '打底裤女': '打底裤',
        '运动服健身': '运动服',
        '瑜伽裤女': '瑜伽裤',
        '针织衫女春秋': '针织衫',
        '沙发客厅': '沙发',
        '实木餐桌': '实木餐桌',
        '收纳盒塑料': '收纳盒',
        '陶瓷餐具套装': '陶瓷餐具',
        '保温杯不锈钢': '保温杯',
        '枕头记忆棉': '枕头',
        '窗帘遮光': '窗帘',
        '智能马桶卫浴': '智能马桶',
        '全自动洗衣机': '全自动洗衣机',
        '扫地机器人智能': '扫地机器人',
        '空气炸锅智能': '空气炸锅',
        '电饭煲迷你': '电饭煲',
        '加湿器超声波': '加湿器',
        '厨房用品厨具': '厨房用品',
        '四件套床品': '四件套',
        '床垫乳胶': '床垫',
        '毛巾纯棉': '毛巾',
        '收纳箱大容量': '收纳箱',
        '收纳箱有盖': '收纳箱',
        '风扇落地扇': '风扇',
        '口红唇膏': '口红',
        '面膜补水': '面膜',
        '护肤品精华液': '护肤品',
        '香水女士': '香水',
        '眼影盘大地色': '眼影',
        '眼影盘': '眼影',
        '洗面奶氨基酸': '洗面奶',
        '精华液美白': '精华液',
        '面霜保湿': '面霜',
        '唇釉哑光': '唇釉',
        '玻尿酸面膜保湿': '玻尿酸面膜',
        '玻尿酸面膜': '玻尿酸面膜',
        '护肤品套装': '护肤品套装',
        '护肤品套装礼盒': '护肤品套装',
        '防晒霜隔离': '防晒霜',
        '啤酒罐装': '啤酒',
        '白酒礼盒': '白酒',
        '矿泉水瓶装': '矿泉水',
        '咖啡豆包装': '咖啡',
        '坚果零食': '坚果',
        '坚果混合零食': '坚果',
        '每日坚果混合': '每日坚果',
        '精酿啤酒原浆': '精酿啤酒',
        '酱香白酒茅台': '酱香白酒',
        '五粮液浓香': '五粮液',
        '海苔零食': '海苔',
        '宠物玩具狗': '宠物玩具',
        '猫粮猫食品': '猫粮',
        '狗粮犬粮': '狗粮',
        '狗窝宠物床': '狗窝',
        '猫爬架': '猫爬架',
        '猫窝宠物': '猫窝',
        '宠物磨牙棒狗': '宠物磨牙棒',
        '宠物衣服狗': '宠物衣服',
        '运动鞋女': '运动鞋',
        '运动鞋跑鞋': '运动鞋',
        '皮鞋男商务': '皮鞋',
        '拖鞋居家': '拖鞋',
        '真皮男鞋商务': '真皮男鞋',
        '真皮斜挎包女': '真皮斜挎包',
        '背包双肩包': '背包',
        '拉杆箱登机箱': '拉杆箱',
        '钱包男士': '钱包',
        '儿童积木玩具': '儿童积木',
        '儿童积木乐高': '儿童积木',
        '毛绒玩具公仔': '毛绒玩具',
        '益智玩具儿童': '益智玩具',
        '遥控车玩具': '遥控车',
        '早教玩具婴儿': '早教玩具',
        '婴儿玩具早教': '早教玩具',
        '盲盒潮玩': '盲盒',
    }
    if kw in KNOWN_MAP:
        return KNOWN_MAP[kw]
    # 兜底：取前10个字符
    return kw[:10]


def format_path_block(paths):
    """格式化路径数组为TS代码"""
    parts = []
    for p in paths:
        parts.append(repr(p))
    return ', '.join(parts)


def generate_ts_code(cat_blocks, inline_kw_map, total_img_count):
    """生成需要替换的代码块"""
    # 1. CATEGORY_REAL_PHOTOS
    cat_lines = []
    for cat_name in sorted(cat_blocks.keys()):
        paths = cat_blocks[cat_name]
        lines = [f"  '{cat_name}': ["]
        lines += [f"    {repr(p)}," for p in paths]
        lines.append('  ],')
        cat_lines.append('\n'.join(lines))

    cat_code = '\n'.join(cat_lines)

    # 2. INLINE_KEYWORD_MAP
    kw_lines = []
    for kw in sorted(inline_kw_map.keys()):
        paths = inline_kw_map[kw]
        entries = ', '.join(repr(p) for p in paths)
        kw_lines.append(f"  '{kw}': [{entries}],")

    kw_code = '\n'.join(kw_lines)

    return cat_code, kw_code, len(inline_kw_map)


def main():
    print(f'📁 扫描目录: {IMG_DIR}')
    cat_files, keyword_map = scan_images()

    if not cat_files:
        print('⚠️  未找到图片，确保先运行 fetch_real_products.py')
        return

    total = sum(len(v) for v in cat_files.values())
    print(f'✅ 找到 {total} 张图片，共 {len(cat_files)} 个品类')

    # 1. 更新 baidu-image-map.json
    json_map = build_json_map(keyword_map)
    with open(JSON_MAP_PATH, 'w', encoding='utf-8') as f:
        json.dump(json_map, f, ensure_ascii=False, indent=2)
    print(f'📝 已更新 {JSON_MAP_PATH} ({len(json_map)} 个关键词)')

    # 2. 生成 TS 代码
    cat_blocks, inline_kw_map = build_ts_blocks(cat_files, keyword_map)
    cat_code, kw_code, kw_count = generate_ts_code(cat_blocks, inline_kw_map, total)

    total_cat_img = sum(len(v) for v in cat_blocks.values())
    total_kw_img = sum(len(v) for v in inline_kw_map.values())

    print(f'📝 CATEGORY_REAL_PHOTOS: {len(cat_blocks)} 个品类, {total_cat_img} 张图')
    print(f'📝 INLINE_KEYWORD_MAP: {kw_count} 个关键词, {total_kw_img} 张图')

    # 输出代码到控制台，用于手动或自动替换
    print('\n' + '='*60)
    print('INLINE_KEYWORD_MAP 代码:')
    print('='*60)
    print(kw_code)
    print('\n' + '='*60)
    print('CATEGORY_REAL_PHOTOS 代码:')
    print('='*60)
    print(cat_code)

    # 可选：直接写入 TS 文件
    # 由于替换复杂，这里输出文件引用，手动确认后写入
    print('\n✅ 映射重建完成')
    print(f'运行: 需要将上述代码更新到 {TS_PATH}')


if __name__ == '__main__':
    main()
