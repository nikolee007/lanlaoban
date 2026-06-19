"""
直接更新 lib/product-placeholder.ts 中的 CATEGORY_REAL_PHOTOS 和 INLINE_KEYWORD_MAP
"""
import os
import re
import json

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(BASE, 'public/product-images/baidu')
TS_PATH = os.path.join(BASE, 'lib/product-placeholder.ts')

# 合法的品类名和其对应的 PHP-style category
CATEGORIES = {
    '电子产品': '电子产品',
    '服装': '服装',
    '家居': '家居',
    '美妆': '美妆',
    '食品': '食品',
    '宠物': '宠物',
    '运动': '运动',
    '鞋类': '鞋类',
    '箱包': '箱包',
    '玩具': '玩具',
}

# 搜索关键词 → 用户友好短关键词
SHORTEN_MAP = {
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


def scan_images():
    files = sorted(os.listdir(IMG_DIR))
    cat_files = {}
    keyword_groups = {}

    for f in files:
        fp = os.path.join(IMG_DIR, f)
        if not os.path.isfile(fp) or os.path.getsize(fp) < 8000:
            continue
        if '_' not in f:
            continue
        parts = f.split('_')
        category = parts[0]
        rel = f'/product-images/baidu/{f}'
        cat_files.setdefault(category, []).append(rel)
        kw_parts = parts[1:-1]
        search_kw = '_'.join(kw_parts)
        keyword_groups.setdefault(search_kw, []).append(rel)

    return cat_files, keyword_groups


def build_ts_blocks(cat_files, keyword_groups):
    """生成替换代码块"""
    # CATEGORY_REAL_PHOTOS
    cat_lines = []
    for cat_name in sorted(cat_files.keys()):
        paths = cat_files[cat_name]
        cat_lines.append(f"  '{cat_name}': [")
        cat_lines += [f"    {repr(p)}," for p in paths]
        cat_lines.append('  ],')
    cat_code = '\n'.join(cat_lines)

    # INLINE_KEYWORD_MAP - 用SHORTEN_MAP转换
    inline_map = {}
    seen_kw = set()
    for search_kw in sorted(keyword_groups.keys()):
        paths = keyword_groups[search_kw]
        short_kw = SHORTEN_MAP.get(search_kw, search_kw[:10])
        if short_kw in inline_map:
            existing = inline_map[short_kw]
            for p in paths:
                if p not in existing:
                    existing.append(p)
        else:
            inline_map[short_kw] = list(paths)
        seen_kw.add(short_kw)

    kw_lines = []
    for kw in sorted(inline_map.keys()):
        paths = inline_map[kw]
        entries = ', '.join(repr(p) for p in paths)
        kw_lines.append(f"  '{kw}': [{entries}],")
    kw_code = '\n'.join(kw_lines)

    return cat_code, kw_code


def replace_section(content, start_marker, end_marker, new_content):
    """替换两个标记之间的内容"""
    start_idx = content.find(start_marker)
    if start_idx < 0:
        print(f'❌ 找不到起始标记: {start_marker}')
        return content
    end_idx = content.find(end_marker, start_idx + len(start_marker))
    if end_idx < 0:
        print(f'❌ 找不到结束标记: {end_marker}')
        return content
    # 找到换行起始
    line_start = content.rfind('\n', 0, start_idx)
    if line_start < 0:
        line_start = 0
    else:
        line_start += 1  # skip the \n
    # 找到换行结束
    line_end = content.find('\n', end_idx)
    if line_end < 0:
        line_end = len(content)

    # 去掉标记行，替换中间内容
    before = content[:line_start]
    after = content[line_end:]

    if start_marker.strip().startswith('const CATEGORY_REAL_PHOTOS'):
        # 保留 const CATEGORY_REAL_PHOTOS: Record<string, string[]> = {
        first_newline = before.rfind('\n')
        header_line = before[first_newline:]
        before = before[:first_newline]
        return before + '\n' + header_line + '\n' + new_content + '\n' + after
    elif start_marker.strip().startswith('const INLINE_KEYWORD_MAP'):
        first_newline = before.rfind('\n')
        header_line = before[first_newline:]
        before = before[:first_newline]
        return before + '\n' + header_line + '\n' + new_content + '\n' + after

    return content


def main():
    with open(TS_PATH, 'r') as f:
        content = f.read()

    cat_files, keyword_groups = scan_images()
    total = sum(len(v) for v in cat_files.values())
    print(f'✅ 扫描到 {total} 张图，{len(cat_files)} 个品类')

    cat_code, kw_code = build_ts_blocks(cat_files, keyword_groups)

    # 替换 CATEGORY_REAL_PHOTOS
    crp_start = 'const CATEGORY_REAL_PHOTOS: Record<string, string[]> = {'
    crp_end = 'const CATEGORY_FALLBACK:'
    crp_old_start = content.find(crp_start)
    crp_old_end = content.find(crp_end, crp_old_start)
    if crp_old_start < 0 or crp_old_end < 0:
        print('❌ 找不到 CATEGORY_REAL_PHOTOS 在 TS 文件中的位置')
        return

    # 找到 map 的结束 } 和常量声明之间的位置
    before_crp = content[:crp_old_start]
    after_crp_header = content[crp_old_start + len(crp_start):]
    # 找到与 const 对齐的结束 }
    # 找到下一个顶格的 }
    map_end = after_crp_header.find('\n}')
    if map_end < 0:
        print('❌ 找不到 CATEGORY_REAL_PHOTOS map 结束')
        return
    # 更新内容
    new_crp_section = crp_start + '\n' + cat_code + '\n}'
    content = before_crp + new_crp_section + content[crp_old_start + len(crp_start) + map_end + 2:]

    # 替换 INLINE_KEYWORD_MAP
    ikm_start = 'const INLINE_KEYWORD_MAP: Record<string, string[]> = {'
    ikm_old_start = content.find(ikm_start)
    if ikm_old_start < 0:
        print('❌ 找不到 INLINE_KEYWORD_MAP 在 TS 文件中的位置')
        return

    before_ikm = content[:ikm_old_start]
    after_ikm_header = content[ikm_old_start + len(ikm_start):]
    # 找到下一个 }（与 const 对齐）
    map_end = after_ikm_header.find('\n}')
    if map_end < 0:
        print('❌ 找不到 INLINE_KEYWORD_MAP map 结束')
        return

    new_ikm_section = ikm_start + '\n' + kw_code + '\n}'
    content = before_ikm + new_ikm_section + content[ikm_old_start + len(ikm_start) + map_end + 2:]

    # 更新注释中的统计数字
    # 查找类似 "// 107 个关键词，523 张图片" 并更新
    kw_count = len(set(k.split('_')[0] for k in keyword_groups.keys()))
    img_count = total

    import re
    content = re.sub(
        r'// \d+ 个关键词，\d+ 张图片',
        f'// {len(set(v[0] for v in [SHORTEN_MAP.get(k, k[:10]) for k in keyword_groups.keys()] ))} 个关键词，{total} 张图片',
        content
    )

    # 更新统计行
    stats_pattern = re.compile(r'// \d+ 个关键词.*')
    # 找到 INLINE_KEYWORD_MAP 前面最近的那行注释
    ikm_line_start = content.rfind('\n', 0, content.find(ikm_start))
    comment_line_before = content.rfind('//', 0, ikm_line_start)
    # 简单方法：找直接提到的
    # 直接替换
    unique_kw = len(set(SHORTEN_MAP.get(k, k[:10]) for k in keyword_groups.keys()))
    content = re.sub(
        r'// (\d+) 个关键词，(\d+) 张图片',
        f'// {unique_kw} 个关键词，{total} 张图片',
        content
    )

    with open(TS_PATH, 'w') as f:
        f.write(content)

    print(f'✅ 已更新 {TS_PATH}')
    print(f'   CATEGORY_REAL_PHOTOS: {len(cat_files)} 个品类')
    print(f'   INLINE_KEYWORD_MAP: {unique_kw} 个关键词, {total} 张图')


if __name__ == '__main__':
    main()
