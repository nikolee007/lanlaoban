#!/bin/bash
# 从百度图片搜索批量下载真实产品图
# 按品类搜索，下载到 public/product-images/ 目录

OUTDIR="public/product-images"
mkdir -p "$OUTDIR"

# 品类 → 搜索关键词
declare -A QUERIES
QUERIES["蓝牙耳机"]="蓝牙耳机 无线 产品图"
QUERIES["充电宝"]="充电宝 移动电源 产品摄影"
QUERIES["智能手表"]="智能手表 产品摄影 电商"
QUERIES["T恤"]="纯棉T恤 服装 产品图"
QUERIES["连衣裙"]="连衣裙 女装 产品摄影"
QUERIES["运动鞋"]="运动鞋 跑鞋 产品摄影"
QUERIES["陶瓷餐具"]="陶瓷餐具 碗碟 产品图"
QUERIES["沙发"]="沙发 家具 产品摄影"
QUERIES["口红"]="口红 化妆品 产品摄影"
QUERIES["面膜"]="面膜 护肤品 产品图"
QUERIES["啤酒"]="啤酒 饮料 产品摄影"
QUERIES["白酒"]="白酒 酒瓶 产品摄影"
QUERIES["宠物玩具"]="宠物玩具 狗 产品图"
QUERIES["LED灯"]="LED台灯 照明 产品摄影"
QUERIES["收纳盒"]="收纳盒 家居 产品图"
QUERIES["保温杯"]="保温杯 水杯 产品摄影"
QUERIES["背包"]="双肩包 背包 产品摄影"
QUERIES["瑜伽服"]="瑜伽服 运动 产品摄影"

# 品类名称映射
declare -A CAT_MAP
CAT_MAP["蓝牙耳机"]="电子产品"
CAT_MAP["充电宝"]="电子产品"
CAT_MAP["智能手表"]="电子产品"
CAT_MAP["T恤"]="服装"
CAT_MAP["连衣裙"]="服装"
CAT_MAP["运动鞋"]="鞋类"
CAT_MAP["陶瓷餐具"]="家居"
CAT_MAP["沙发"]="家居"
CAT_MAP["口红"]="美妆"
CAT_MAP["面膜"]="美妆"
CAT_MAP["啤酒"]="食品"
CAT_MAP["白酒"]="食品"
CAT_MAP["宠物玩具"]="宠物"
CAT_MAP["LED灯"]="电子产品"
CAT_MAP["收纳盒"]="家居"
CAT_MAP["保温杯"]="家居"
CAT_MAP["背包"]="服装"
CAT_MAP["瑜伽服"]="运动"

for keyword in "${!QUERIES[@]}"; do
    search_term="${QUERIES[$keyword]}"
    echo "--- 搜索: $search_term ---"

    # 百度图片搜索API
    url="https://image.baidu.com/search/acjson?tn=resultjson_com&ipn=rj&word=$(echo $search_term | xxd -plain | tr -d '\n' | sed 's/\(..\)/%\1/g')&pn=0&rn=10"

    # 下载搜索结果
    result=$(curl -s -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "$url" 2>/dev/null)

    # 提取图片URL
    echo "$result" | grep -o '"thumbURL":"[^"]*"' | head -5 | while read -r line; do
        img_url=$(echo "$line" | sed 's/"thumbURL":"//;s/"//')
        if [ -n "$img_url" ]; then
            echo "  下载: $img_url"
        fi
    done

    sleep 1  # 频率限制
done
