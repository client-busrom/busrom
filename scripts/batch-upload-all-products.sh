#!/bin/bash

# 批量上传所有产品图片到本地 MinIO + CMS
#
# 使用方法: ./scripts/batch-upload-all-products.sh

set -e

PRODUCTS_DIR="/Users/cerfbaleine/workspace/products"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_DIR="$SCRIPT_DIR/upload-configs"

# 创建配置目录
mkdir -p "$CONFIG_DIR"

# 产品系列映射
declare -A SERIES_TAG_MAP
SERIES_TAG_MAP["glass-standoff"]="series-glass-standoff"
SERIES_TAG_MAP["glass-connected-fitting"]="series-glass-connected-fitting"
SERIES_TAG_MAP["glass-fence-spigot"]="series-glass-fence-spigot"
SERIES_TAG_MAP["guardrail-glass-clip"]="series-guardrail-glass-clip"
SERIES_TAG_MAP["bathroom-glass-clip"]="series-bathroom-glass-clip"
SERIES_TAG_MAP["glass-hinge"]="series-glass-hinge"
SERIES_TAG_MAP["sliding-door-kit"]="series-sliding-door-kit"
SERIES_TAG_MAP["bathroom-door-handle"]="series-bathroom-door-handle"
SERIES_TAG_MAP["hidden-hook"]="series-hidden-hook"

# 分类映射 (文件夹名 -> category slug)
declare -A CATEGORY_MAP
CATEGORY_MAP["white"]="white"
CATEGORY_MAP["scene"]="scene"
CATEGORY_MAP["real"]="real"
CATEGORY_MAP["size"]="size"
CATEGORY_MAP["general"]="general"
CATEGORY_MAP["combo"]="combo"
CATEGORY_MAP["multi-style"]="multi-style"
CATEGORY_MAP["showcase"]="showcase"
CATEGORY_MAP["effect"]="effect"
CATEGORY_MAP["product"]="product"
CATEGORY_MAP["craft"]="craft"
CATEGORY_MAP["packaging"]="packaging"
CATEGORY_MAP["color"]="color"

total_uploaded=0
total_failed=0

echo "=========================================="
echo "  批量上传产品图片到本地 MinIO + CMS"
echo "=========================================="
echo ""

# 遍历每个产品系列
for series_dir in "$PRODUCTS_DIR"/*/; do
    series_name=$(basename "$series_dir")

    # 跳过隐藏文件夹和非产品系列
    if [[ "$series_name" == "." ]] || [[ "$series_name" == ".." ]] || [[ "$series_name" == ".DS_Store" ]]; then
        continue
    fi

    series_tag="${SERIES_TAG_MAP[$series_name]}"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 处理系列: $series_name"
    if [ -n "$series_tag" ]; then
        echo "   标签: $series_tag"
    fi
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # 遍历每个分类文件夹
    for category_dir in "$series_dir"*/; do
        category_name=$(basename "$category_dir")

        # 跳过隐藏文件夹
        if [[ "$category_name" == "." ]] || [[ "$category_name" == ".." ]] || [[ "$category_name" == ".DS_Store" ]]; then
            continue
        fi

        category_slug="${CATEGORY_MAP[$category_name]}"

        if [ -z "$category_slug" ]; then
            echo "   ⚠️  未知分类: $category_name, 跳过"
            continue
        fi

        # 统计图片数量
        image_count=$(find "$category_dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) 2>/dev/null | wc -l | tr -d ' ')

        if [ "$image_count" -eq 0 ]; then
            continue
        fi

        echo ""
        echo "   📁 $category_name ($category_slug): $image_count 张图片"

        # 构建标签数组
        if [ -n "$series_tag" ]; then
            tags_json="[\"$series_tag\"]"
        else
            tags_json="[]"
        fi

        # 创建配置文件
        config_file="$CONFIG_DIR/${series_name}-${category_name}.json"
        cat > "$config_file" << EOF
{
  "source": "local",
  "localPath": "$category_dir",
  "primaryCategory": "$category_slug",
  "tags": $tags_json,
  "defaultMetadata": {}
}
EOF

        echo "      配置: $config_file"

        # 执行上传
        echo "      上传中..."
        if node "$SCRIPT_DIR/unified-media-upload.js" --config "$config_file" 2>&1 | tail -5; then
            echo "      ✅ 完成"
            total_uploaded=$((total_uploaded + image_count))
        else
            echo "      ❌ 失败"
            total_failed=$((total_failed + image_count))
        fi
    done

    echo ""
done

echo ""
echo "=========================================="
echo "  上传完成!"
echo "=========================================="
echo "  ✅ 成功上传: $total_uploaded 张"
echo "  ❌ 失败: $total_failed 张"
echo "=========================================="
