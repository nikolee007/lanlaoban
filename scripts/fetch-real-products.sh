#!/bin/bash
# 从百度图片搜索下载真实产品图片
# 用法: bash scripts/fetch-real-products.sh

OUTDIR="public/product-images/baidu"
mkdir -p "$OUTDIR"

# 品类 → 搜索关键词 (精准产品词)
declare -A QUERIES
QUERIES["蓝牙耳机"]="蓝牙耳机 真无线 产品摄影 电商主图"
QUERIES["充电宝"]="充电宝 移动电源 产品图 电商"
QUERIES["数据线"]="数据线 type-c 产品摄影"
QUERIES["智能手表"]="智能手表 运动手表 产品图"
QUERIES["手机壳"]="手机壳 保护壳 产品摄影"
QUERIES["T恤"]="纯棉T恤 白色 产品摄影 电商"
QUERIES["连衣裙"]="连衣裙 女装 夏季 产品摄影"
QUERIES["衬衫"]="衬衫 商务 男装 产品摄影"
QUERIES["牛仔裤"]="牛仔裤 男款 产品摄影"
QUERIES["运动服"]="运动服 瑜伽服 健身 产品图"
QUERIES["卫衣"]="卫衣 连帽 男女 产品摄影"
QUERIES["沙发"]="沙发 客厅 家具 产品摄影"
QUERIES["餐桌"]="餐桌 实木 家具 产品图"
QUERIES["床垫"]="床垫 弹簧 产品摄影"
QUERIES["收纳盒"]="收纳盒 塑料 家用 产品图"
QUERIES["陶瓷餐具"]="陶瓷餐具 碗碟 套装 产品摄影"
QUERIES["台灯"]="台灯 LED 护眼 产品摄影"
QUERIES["口红"]="口红 唇膏 美妆 产品摄影"
QUERIES["面膜"]="面膜 护肤 产品摄影"
QUERIES["护肤品"]="护肤品 精华液 产品图"
QUERIES["香水"]="香水 女士 产品摄影"
QUERIES["啤酒"]="啤酒 瓶装 产品摄影"
QUERIES["白酒"]="白酒 瓶装 产品摄影"
QUERIES["饮料"]="饮料 包装 产品图"
QUERIES["咖啡"]="咖啡 豆 包装 产品摄影"
QUERIES["宠物玩具"]="宠物玩具 狗 耐咬 产品图"
QUERIES["猫粮"]="猫粮 宠物 食品 产品摄影"
QUERIES["狗窝"]="狗窝 宠物 用品 产品图"
QUERIES["运动鞋"]="运动鞋 跑鞋 男 产品摄影"
QUERIES["瑜伽垫"]="瑜伽垫 健身 运动 产品图"
QUERIES["哑铃"]="哑铃 健身 器材 产品摄影"
QUERIES["皮鞋"]="皮鞋 男 商务 产品摄影"
QUERIES["拖鞋"]="拖鞋 居家 夏 产品图"
QUERIES["积木"]="积木 儿童 玩具 产品摄影"
QUERIES["玩偶"]="毛绒玩具 公仔 产品图"
QUERIES["儿童玩具"]="儿童玩具 益智 产品摄影"

count=0
for keyword in "${!QUERIES[@]}"; do
    search_term="${QUERIES[$keyword]}"

    # 百度图片搜索API (不用cookie也能用)
    encoded=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$search_term'))")
    url="https://image.baidu.com/search/acjson?tn=resultjson_com&ipn=rj&ct=201326592&fp=result&queryWord=${encoded}&cl=2&lm=-1&ie=utf-8&oe=utf-8&st=-1&ic=0&word=${encoded}&face=0&istype=2&nc=1&pn=0&rn=10"

    result=$(curl -s -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -H "Referer: https://image.baidu.com/" \
        "$url" 2>/dev/null)

    # 提取图片URL
    urls=$(echo "$result" | python3 -c "
import sys,json,re
data = sys.stdin.read()
# 提取thumbURL
urls = re.findall(r'\"thumbURL\":\"([^\"]+)\"', data)
for u in urls[:3]:
    print(u)
" 2>/dev/null)

    if [ -z "$urls" ]; then
        echo "❌ $keyword: 无结果"
        continue
    fi

    i=0
    while IFS= read -r img_url; do
        if [ -z "$img_url" ]; then continue; fi

        ext="${img_url##*.}"
        ext="${ext:0:4}"
        fname="${keyword}_${i}.${ext}"

        curl -sL -o "$OUTDIR/$fname" \
            -H "User-Agent: Mozilla/5.0" \
            -H "Referer: https://image.baidu.com/" \
            "$img_url" 2>/dev/null

        size=$(stat -f%z "$OUTDIR/$fname" 2>/dev/null)
        if [ "$size" -gt 5000 ] 2>/dev/null; then
            echo "✅ $keyword #$i ($((size/1024))KB)"
            count=$((count+1))
        else
            rm -f "$OUTDIR/$fname"
        fi
        i=$((i+1))
    done <<< "$urls"

    sleep 1  # 避免被限制
done

echo ""
echo "🎉 下载完成: $count 张产品图片"
ls -la "$OUTDIR"/*.jpg "$OUTDIR"/*.jpeg "$OUTDIR"/*.png "$OUTDIR"/*.webp 2>/dev/null | wc -l | xargs echo "总文件数:"
