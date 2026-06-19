"""
从百度图片搜索下载真实产品照片
每个品类搜精准关键词，下载真实电商产品图
运行: python3 scripts/fetch_real_products.py
"""

import requests
import re
import os
import json
import time
import urllib.parse
from io import BytesIO

OUT = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public/product-images/baidu')
os.makedirs(OUT, exist_ok=True)

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9',
})

# 精准产品搜索词 → 品类映射
# 每组: (百度搜索词, 品类名)
# 覆盖种子数据中202个商品的全部品类
PRODUCTS = [
    # ═══════ 电子产品 (18组) ═══════
    ('蓝牙耳机', '电子产品'),
    ('无线耳机 充电仓', '电子产品'),
    ('头戴式耳机 头戴', '电子产品'),
    ('充电宝 移动电源', '电子产品'),
    ('手机数据线 type-c', '电子产品'),
    ('蓝牙音箱 便携', '电子产品'),
    ('手机壳 硅胶', '电子产品'),
    ('平板电脑', '电子产品'),
    ('智能手表 运动', '电子产品'),
    ('运动手表 户外', '电子产品'),
    ('智能手环 运动', '电子产品'),
    ('电脑音箱 桌面', '电子产品'),
    ('智能台灯 LED', '电子产品'),
    ('无线充电器 快充', '电子产品'),
    ('蓝牙自拍杆 三脚架', '电子产品'),
    ('行车记录仪 4K', '电子产品'),
    ('智能插座 WiFi', '电子产品'),
    ('VR眼镜 一体机', '电子产品'),
    # ═══════ 服装 (20组) ═══════
    ('纯棉T恤 男', '服装'),
    ('连衣裙 女装 夏', '服装'),
    ('休闲衬衫 男', '服装'),
    ('牛仔裤 男款', '服装'),
    ('运动套装 女', '服装'),
    ('卫衣 连帽衫', '服装'),
    ('羽绒服 轻薄', '服装'),
    ('睡衣 家居服', '服装'),
    ('真丝睡衣 女', '服装'),
    ('运动服 健身', '服装'),
    ('瑜伽裤 女', '服装'),
    ('婴儿连体衣 爬服', '服装'),
    ('儿童服装 童装', '服装'),
    ('夹克 外套 男', '服装'),
    ('针织衫 女 春秋', '服装'),
    ('大衣 羊毛 女', '服装'),
    ('内衣 文胸', '服装'),
    ('POLO衫 男', '服装'),
    ('丝巾 真丝', '服装'),
    ('打底裤 女', '服装'),
    # ═══════ 家居 (20组) ═══════
    ('沙发 客厅', '家居'),
    ('实木餐桌', '家居'),
    ('收纳盒 塑料', '家居'),
    ('陶瓷餐具 套装', '家居'),
    ('LED台灯 护眼', '家居'),
    ('保温杯 不锈钢', '家居'),
    ('枕头 记忆棉', '家居'),
    ('窗帘 遮光', '家居'),
    ('智能马桶 卫浴', '家居'),
    ('全自动洗衣机', '家居'),
    ('扫地机器人 智能', '家居'),
    ('收纳箱 大容量', '家居'),
    ('厨房用品 厨具', '家居'),
    ('床垫 乳胶', '家居'),
    ('四件套 床品', '家居'),
    ('毛巾 纯棉', '家居'),
    ('空气炸锅 智能', '家居'),
    ('电饭煲 迷你', '家居'),
    ('加湿器 超声波', '家居'),
    ('风扇 落地扇', '家居'),
    # ═══════ 美妆 (12组) ═══════
    ('口红 唇膏', '美妆'),
    ('面膜 补水', '美妆'),
    ('护肤品 精华液', '美妆'),
    ('香水 女士', '美妆'),
    ('眼影盘 大地色', '美妆'),
    ('玻尿酸面膜 保湿', '美妆'),
    ('护肤品套装 礼盒', '美妆'),
    ('洗面奶 氨基酸', '美妆'),
    ('精华液 美白', '美妆'),
    ('面霜 保湿', '美妆'),
    ('唇釉 哑光', '美妆'),
    ('防晒霜 隔离', '美妆'),
    # ═══════ 食品 (10组) ═══════
    ('啤酒 罐装', '食品'),
    ('白酒 礼盒', '食品'),
    ('矿泉水 瓶装', '食品'),
    ('咖啡豆 包装', '食品'),
    ('坚果 零食', '食品'),
    ('精酿啤酒 原浆', '食品'),
    ('酱香白酒 茅台', '食品'),
    ('五粮液 浓香', '食品'),
    ('每日坚果 混合', '食品'),
    ('海苔 零食', '食品'),
    # ═══════ 宠物 (8组) ═══════
    ('宠物玩具 狗', '宠物'),
    ('猫粮 猫食品', '宠物'),
    ('狗窝 宠物床', '宠物'),
    ('猫爬架', '宠物'),
    ('狗粮 犬粮', '宠物'),
    ('宠物磨牙棒 狗', '宠物'),
    ('宠物衣服 狗', '宠物'),
    ('猫窝 宠物', '宠物'),
    # ═══════ 运动 (6组) ═══════
    ('运动鞋 跑鞋', '运动'),
    ('瑜伽垫 健身', '运动'),
    ('哑铃 健身器材', '运动'),
    ('运动水壶', '运动'),
    ('跑鞋 男 透气', '运动'),
    ('跑步机 家用', '运动'),
    # ═══════ 鞋类 (4组) ═══════
    ('皮鞋 男 商务', '鞋类'),
    ('拖鞋 居家', '鞋类'),
    ('运动鞋 女', '鞋类'),
    ('真皮男鞋 商务', '鞋类'),
    # ═══════ 箱包皮具 (4组) ═══════
    ('真皮斜挎包 女', '箱包'),
    ('背包 双肩包', '箱包'),
    ('拉杆箱 登机箱', '箱包'),
    ('钱包 男士', '箱包'),
    # ═══════ 玩具 (6组) ═══════
    ('儿童积木 玩具', '玩具'),
    ('毛绒玩具 公仔', '玩具'),
    ('益智玩具 儿童', '玩具'),
    ('遥控车 玩具', '玩具'),
    ('早教玩具 婴儿', '玩具'),
    ('盲盒 潮玩', '玩具'),
]


def search_baidu(keyword, max_retries=3):
    """搜索百度图片，返回图片URL列表"""
    encoded = urllib.parse.quote(keyword)
    url = f'https://image.baidu.com/search/acjson?tn=resultjson_com&ipn=rj&ct=201326592&fp=result&queryWord={encoded}&cl=2&lm=-1&ie=utf-8&oe=utf-8&st=-1&ic=0&word={encoded}&face=0&istype=2&nc=1&pn=0&rn=10'

    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://image.baidu.com/search/index?tn=baiduimage&word=' + encoded,
    }

    for attempt in range(max_retries):
        try:
            r = session.get(url, headers=headers, timeout=15)
            if r.status_code != 200:
                time.sleep(2)
                continue

            # 提取 thumbURL
            urls = re.findall(r'"thumbURL":"([^"]+)"', r.text)
            # 提取 middleURL (备用)
            if not urls:
                urls = re.findall(r'"middleURL":"([^"]+)"', r.text)

            # 过滤掉非图片URL和太短的
            valid = []
            for u in urls:
                if any(u.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']) or '.jpg' in u or '.png' in u:
                    valid.append(u)
                elif len(u) > 30 and 'http' in u:
                    valid.append(u)

            return valid[:5]  # 最多5张

        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(2)
            else:
                return []

    return []


def download_image(url, filepath):
    """下载图片，返回文件大小(bytes)，失败返回0"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://image.baidu.com/',
        }
        r = session.get(url, headers=headers, timeout=15)
        if r.status_code == 200 and len(r.content) > 8000:
            # 检查是否是真实图片
            if r.content[:2] == b'\xff\xd8' or r.content[:4] == b'\x89PNG' or r.content[:4] == b'RIFF':
                with open(filepath, 'wb') as f:
                    f.write(r.content)
                return len(r.content)
    except:
        pass
    return 0


def main():
    count = 0
    mapping = {}  # 品类 → 图片路径列表

    # 先清空旧文件？不，增量下载
    existing = set(os.listdir(OUT))

    for keyword, category in PRODUCTS:
        print(f'🔍 [{category}] {keyword}...', end=' ', flush=True)

        urls = search_baidu(keyword)
        if not urls:
            print('无结果')
            time.sleep(1)
            continue

        print(f'{len(urls)}个', end=' ', flush=True)
        saved = 0

        for i, img_url in enumerate(urls):
            # 生成文件名
            safe_name = re.sub(r'[^一-龥a-zA-Z0-9]', '', keyword)[:10]
            fname = f'{category}_{safe_name}_{i}.jpg'
            if fname in existing:
                saved += 1
                continue

            filepath = os.path.join(OUT, fname)
            size = download_image(img_url, filepath)

            if size > 8000:
                saved += 1
                count += 1
                mapping.setdefault(category, []).append(f'/product-images/baidu/{fname}')
                print('✅', end=' ')
            else:
                # 删除无效文件
                if os.path.exists(filepath) and os.path.getsize(filepath) < 5000:
                    os.remove(filepath)
                print('❌', end=' ')

        print(f'({saved}张)')
        time.sleep(1.5)  # 防反爬

    # 保存映射
    print(f'\n🎉 共下载 {count} 张产品图')
    print(f'📁 保存在: {OUT}')

    # 统计品类覆盖
    cat_counts = {}
    for f in os.listdir(OUT):
        fp = os.path.join(OUT, f)
        if os.path.getsize(fp) < 5000:
            continue
        cat = f.split('_')[0] if '_' in f else '其他'
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    print('\n品类分布:')
    for cat, n in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f'  {cat}: {n}张')


if __name__ == '__main__':
    main()
