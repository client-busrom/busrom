#!/bin/bash

echo "======================================"
echo "测试 Sitemap 和 Robots.txt 功能"
echo "======================================"
echo ""

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 测试 Sitemap 是否可访问
echo "📋 测试 1: 检查 /sitemap.xml 是否可访问..."
SITEMAP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/sitemap.xml)
if [ "$SITEMAP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Sitemap 可访问 (HTTP $SITEMAP_STATUS)${NC}"
else
    echo -e "${RED}❌ Sitemap 无法访问 (HTTP $SITEMAP_STATUS)${NC}"
    exit 1
fi
echo ""

# 2. 测试 Robots.txt 是否可访问
echo "🤖 测试 2: 检查 /robots.txt 是否可访问..."
ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/robots.txt)
if [ "$ROBOTS_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Robots.txt 可访问 (HTTP $ROBOTS_STATUS)${NC}"
else
    echo -e "${RED}❌ Robots.txt 无法访问 (HTTP $ROBOTS_STATUS)${NC}"
    exit 1
fi
echo ""

# 3. 保存 Sitemap 内容到临时文件
echo "💾 测试 3: 获取 Sitemap 内容..."
curl -s http://localhost:3001/sitemap.xml > /tmp/sitemap.xml
echo -e "${GREEN}✅ Sitemap 已保存到 /tmp/sitemap.xml${NC}"
echo ""

# 4. 检查 Sitemap 格式
echo "🔍 测试 4: 验证 Sitemap 格式..."
if grep -q '<?xml version="1.0" encoding="UTF-8"?>' /tmp/sitemap.xml; then
    echo -e "${GREEN}✅ XML 声明正确${NC}"
else
    echo -e "${RED}❌ XML 声明缺失${NC}"
fi

if grep -q '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' /tmp/sitemap.xml; then
    echo -e "${GREEN}✅ Sitemap 命名空间正确${NC}"
else
    echo -e "${RED}❌ Sitemap 命名空间错误${NC}"
fi
echo ""

# 5. 统计 URL 数量
echo "📊 测试 5: 统计包含的 URL 数量..."
URL_COUNT=$(grep -c '<loc>' /tmp/sitemap.xml)
echo -e "${YELLOW}ℹ️  Sitemap 包含 ${URL_COUNT} 个 URL${NC}"
echo ""

# 6. 显示前 10 个 URL
echo "📝 测试 6: 显示前 10 个 URL..."
echo "---"
grep '<loc>' /tmp/sitemap.xml | head -10 | sed 's/.*<loc>\(.*\)<\/loc>/  - \1/'
echo "---"
echo ""

# 7. 检查是否包含重要页面
echo "🔎 测试 7: 检查是否包含重要页面..."

declare -a IMPORTANT_PAGES=(
    "http://localhost:3001/"
    "http://localhost:3001/product"
    "http://localhost:3001/shop"
    "http://localhost:3001/service"
    "http://localhost:3001/about-us/blog"
    "http://localhost:3001/contact-us"
)

for page in "${IMPORTANT_PAGES[@]}"; do
    if grep -q "<loc>$page</loc>" /tmp/sitemap.xml; then
        echo -e "${GREEN}✅ $page${NC}"
    else
        echo -e "${RED}❌ $page (缺失)${NC}"
    fi
done
echo ""

# 8. 检查是否包含动态页面
echo "🔄 测试 8: 检查是否包含动态页面..."
PRODUCT_PAGES=$(grep -c '<loc>http://localhost:3001/shop/' /tmp/sitemap.xml)
SERIES_PAGES=$(grep -c '<loc>http://localhost:3001/product/' /tmp/sitemap.xml | grep -v 'http://localhost:3001/product$')
BLOG_PAGES=$(grep -c '<loc>http://localhost:3001/about-us/blog/' /tmp/sitemap.xml)

echo -e "${YELLOW}ℹ️  产品详情页: ${PRODUCT_PAGES} 个${NC}"
echo -e "${YELLOW}ℹ️  产品系列页: ${SERIES_PAGES} 个${NC}"
echo -e "${YELLOW}ℹ️  博客文章页: ${BLOG_PAGES} 个${NC}"
echo ""

# 9. 测试 Robots.txt 内容
echo "🤖 测试 9: 检查 Robots.txt 内容..."
curl -s http://localhost:3001/robots.txt > /tmp/robots.txt
cat /tmp/robots.txt
echo ""

# 10. 检查 Robots.txt 是否包含 Sitemap 链接
echo "🔗 测试 10: 检查 Robots.txt 是否包含 Sitemap 链接..."
if grep -q "Sitemap:" /tmp/robots.txt; then
    echo -e "${GREEN}✅ Robots.txt 包含 Sitemap 链接${NC}"
    grep "Sitemap:" /tmp/robots.txt | sed 's/^/  /'
else
    echo -e "${RED}❌ Robots.txt 缺少 Sitemap 链接${NC}"
fi
echo ""

# 11. 测试缓存头
echo "🗄️  测试 11: 检查缓存策略..."
CACHE_HEADER=$(curl -s -I http://localhost:3001/sitemap.xml | grep -i "cache-control")
echo "Sitemap Cache-Control: $CACHE_HEADER"

ROBOTS_CACHE=$(curl -s -I http://localhost:3001/robots.txt | grep -i "cache-control")
echo "Robots.txt Cache-Control: $ROBOTS_CACHE"
echo ""

# 总结
echo "======================================"
echo -e "${GREEN}✅ 所有测试完成!${NC}"
echo "======================================"
echo ""
echo "📌 快速访问链接:"
echo "  - Sitemap: http://localhost:3001/sitemap.xml"
echo "  - Robots.txt: http://localhost:3001/robots.txt"
echo ""
echo "📂 临时文件:"
echo "  - Sitemap 副本: /tmp/sitemap.xml"
echo "  - Robots.txt 副本: /tmp/robots.txt"
echo ""
