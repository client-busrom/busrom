#!/bin/bash

echo "=== Sitemap 快速测试 ==="
echo ""

# 1. 测试 HTTP 状态码
echo "1. 测试 HTTP 状态码:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/sitemap.xml)
if [ "$STATUS" -eq 200 ]; then
    echo "   ✅ HTTP Status: $STATUS (正常)"
else
    echo "   ❌ HTTP Status: $STATUS (异常)"
fi
echo ""

# 2. 统计 URL 数量
echo "2. 统计包含的 URL 数量:"
URL_COUNT=$(curl -s http://localhost:3001/sitemap.xml | grep -c '<loc>')
echo "   📊 总共包含 $URL_COUNT 个 URL"
echo ""

# 3. 检查 XML 格式
echo "3. 检查 XML 格式:"
if curl -s http://localhost:3001/sitemap.xml | grep -q '<?xml version="1.0" encoding="UTF-8"?>'; then
    echo "   ✅ XML 声明正确"
else
    echo "   ❌ XML 声明错误"
fi

if curl -s http://localhost:3001/sitemap.xml | grep -q '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'; then
    echo "   ✅ Sitemap 命名空间正确"
else
    echo "   ❌ Sitemap 命名空间错误"
fi
echo ""

# 4. 显示包含的页面
echo "4. 包含的静态页面 (前 15 个):"
echo "---"
curl -s http://localhost:3001/sitemap.xml | grep '<loc>' | sed 's/.*<loc>\(.*\)<\/loc>/   \1/' | head -15
echo "---"
echo ""

# 5. 测试 Robots.txt
echo "5. 测试 Robots.txt:"
ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/robots.txt)
if [ "$ROBOTS_STATUS" -eq 200 ]; then
    echo "   ✅ HTTP Status: $ROBOTS_STATUS (正常)"
else
    echo "   ❌ HTTP Status: $ROBOTS_STATUS (异常)"
fi
echo ""

# 6. 显示 Robots.txt 内容
echo "6. Robots.txt 内容:"
echo "---"
curl -s http://localhost:3001/robots.txt
echo "---"
echo ""

# 7. 检查 Robots.txt 是否包含 Sitemap
echo "7. 检查 Robots.txt 是否包含 Sitemap 链接:"
if curl -s http://localhost:3001/robots.txt | grep -q "Sitemap:"; then
    echo "   ✅ 包含 Sitemap 链接"
    curl -s http://localhost:3001/robots.txt | grep "Sitemap:" | sed 's/^/   /'
else
    echo "   ❌ 缺少 Sitemap 链接"
fi
echo ""

echo "=== 测试完成! ==="
echo ""
echo "📌 访问链接:"
echo "   - Sitemap: http://localhost:3001/sitemap.xml"
echo "   - Robots.txt: http://localhost:3001/robots.txt"
