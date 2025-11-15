#!/bin/bash

# ==============================================================================
# MinIO图片优化系统测试脚本
# ==============================================================================
# 用途: 验证MinIO + Nginx CDN + 图片优化器配置是否正确
# 使用: chmod +x scripts/test-minio-setup.sh && ./scripts/test-minio-setup.sh
# ==============================================================================

echo "🔍 开始测试MinIO图片优化系统..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果统计
PASSED=0
FAILED=0

# 测试函数
test_service() {
    local service_name=$1
    local test_command=$2
    local expected_result=$3

    echo -n "测试 $service_name... "

    if eval "$test_command" &> /dev/null; then
        echo -e "${GREEN}✓ 通过${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ 失败${NC}"
        echo "  命令: $test_command"
        ((FAILED++))
        return 1
    fi
}

# ==============================================================================
# 1. 测试Docker服务
# ==============================================================================
echo "═══════════════════════════════════════════════════════"
echo "📦 测试Docker服务"
echo "═══════════════════════════════════════════════════════"

test_service "Docker运行状态" "docker ps > /dev/null"
test_service "PostgreSQL容器" "docker ps | grep busrom-postgres"
test_service "MinIO容器" "docker ps | grep busrom-minio"
test_service "Nginx CDN容器" "docker ps | grep busrom-cdn"

echo ""

# ==============================================================================
# 2. 测试端口访问
# ==============================================================================
echo "═══════════════════════════════════════════════════════"
echo "🔌 测试端口访问"
echo "═══════════════════════════════════════════════════════"

test_service "PostgreSQL (5432)" "nc -z localhost 5432"
test_service "MinIO API (9000)" "nc -z localhost 9000"
test_service "MinIO Console (9001)" "nc -z localhost 9001"
test_service "Nginx CDN (8080)" "nc -z localhost 8080"

echo ""

# ==============================================================================
# 3. 测试MinIO
# ==============================================================================
echo "═══════════════════════════════════════════════════════"
echo "🪣 测试MinIO"
echo "═══════════════════════════════════════════════════════"

test_service "MinIO健康检查" "curl -f -s http://localhost:9000/minio/health/live"
test_service "MinIO Web控制台" "curl -f -s http://localhost:9001 > /dev/null"

# 测试Bucket
echo -n "测试Bucket (busrom-media)... "
if docker exec busrom-minio mc ls local/busrom-media &> /dev/null; then
    echo -e "${GREEN}✓ 通过${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ 失败${NC}"
    echo "  Bucket可能未创建,运行: docker-compose up -d minio-init"
    ((FAILED++))
fi

echo ""

# ==============================================================================
# 4. 测试Nginx CDN
# ==============================================================================
echo "═══════════════════════════════════════════════════════"
echo "🌐 测试Nginx CDN"
echo "═══════════════════════════════════════════════════════"

test_service "Nginx健康检查" "curl -f -s http://localhost:8080/health"

# 测试缓存头
echo -n "测试缓存头... "
CACHE_HEADER=$(curl -s -I http://localhost:8080/health | grep -i "cache-control")
if [ -n "$CACHE_HEADER" ]; then
    echo -e "${GREEN}✓ 通过${NC}"
    echo "  $CACHE_HEADER"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ 警告${NC}"
    echo "  未找到Cache-Control头"
fi

# 测试CORS头
echo -n "测试CORS头... "
CORS_HEADER=$(curl -s -I http://localhost:8080/health | grep -i "access-control-allow-origin")
if [ -n "$CORS_HEADER" ]; then
    echo -e "${GREEN}✓ 通过${NC}"
    echo "  $CORS_HEADER"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ 警告${NC}"
    echo "  未找到CORS头"
fi

echo ""

# ==============================================================================
# 5. 测试环境变量
# ==============================================================================
echo "═══════════════════════════════════════════════════════"
echo "⚙️  测试环境变量"
echo "═══════════════════════════════════════════════════════"

if [ -f "cms/.env" ]; then
    echo -n "检查USE_MINIO... "
    if grep -q "USE_MINIO=true" cms/.env; then
        echo -e "${GREEN}✓ 已启用MinIO${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ 未启用MinIO${NC}"
        echo "  建议设置 USE_MINIO=true"
    fi

    echo -n "检查S3_ENDPOINT... "
    if grep -q "S3_ENDPOINT=http://localhost:9000" cms/.env; then
        echo -e "${GREEN}✓ 正确${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ 配置错误${NC}"
        echo "  应设置为: S3_ENDPOINT=http://localhost:9000"
        ((FAILED++))
    fi

    echo -n "检查CDN_DOMAIN... "
    if grep -q "CDN_DOMAIN=http://localhost:8080" cms/.env; then
        echo -e "${GREEN}✓ 正确${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ 配置错误${NC}"
        echo "  应设置为: CDN_DOMAIN=http://localhost:8080"
        ((FAILED++))
    fi

    echo -n "检查S3_BUCKET_NAME... "
    if grep -q "S3_BUCKET_NAME=busrom-media" cms/.env; then
        echo -e "${GREEN}✓ 正确${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ 配置错误${NC}"
        echo "  应设置为: S3_BUCKET_NAME=busrom-media"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗ 找不到cms/.env文件${NC}"
    ((FAILED++))
fi

echo ""

# ==============================================================================
# 6. 测试依赖包
# ==============================================================================
echo "═══════════════════════════════════════════════════════"
echo "📦 测试依赖包"
echo "═══════════════════════════════════════════════════════"

cd cms

echo -n "检查sharp... "
if npm list sharp &> /dev/null; then
    echo -e "${GREEN}✓ 已安装${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ 未安装${NC}"
    echo "  运行: npm install sharp"
    ((FAILED++))
fi

echo -n "检查@aws-sdk/client-s3... "
if npm list @aws-sdk/client-s3 &> /dev/null; then
    echo -e "${GREEN}✓ 已安装${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ 未安装${NC}"
    echo "  运行: npm install @aws-sdk/client-s3"
    ((FAILED++))
fi

echo -n "检查nodemailer... "
if npm list nodemailer &> /dev/null; then
    echo -e "${GREEN}✓ 已安装${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ 未安装${NC}"
    echo "  邮件功能需要: npm install nodemailer"
fi

cd ..

echo ""

# ==============================================================================
# 7. 测试关键文件
# ==============================================================================
echo "═══════════════════════════════════════════════════════"
echo "📄 测试关键文件"
echo "═══════════════════════════════════════════════════════"

FILES=(
    "cms/lib/image-optimizer.ts"
    "cms/lib/email-sender.ts"
    "cms/schemas/Media.ts"
    "cms/schemas/ContactForm.ts"
    "cms/custom-views/variants-display.tsx"
    "web/lib/api/sitemap.ts"
    "web/app/sitemap.xml/route.ts"
    "web/app/robots.txt/route.ts"
    "docker/nginx/cdn.conf"
    "docker-compose.yml"
)

for file in "${FILES[@]}"; do
    echo -n "检查 $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ 存在${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ 不存在${NC}"
        ((FAILED++))
    fi
done

echo ""

# ==============================================================================
# 测试总结
# ==============================================================================
echo "═══════════════════════════════════════════════════════"
echo "📊 测试总结"
echo "═══════════════════════════════════════════════════════"

TOTAL=$((PASSED + FAILED))
echo "总计: $TOTAL 项测试"
echo -e "${GREEN}通过: $PASSED 项${NC}"
echo -e "${RED}失败: $FAILED 项${NC}"

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 恭喜!所有测试通过!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "✅ MinIO图片优化系统已就绪!"
    echo ""
    echo "下一步:"
    echo "  1. 启动CMS: cd cms && npm run dev"
    echo "  2. 访问: http://localhost:3000"
    echo "  3. 上传测试图片,查看图片变体"
    echo ""
    echo "📚 查看文档:"
    echo "  - docs/08-MinIO完整配置指南.md"
    echo "  - docs/07-图片变体使用指南.md"
    echo ""
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ 有 $FAILED 项测试失败${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "请检查上述失败项并修复后重新运行测试"
    echo ""
    echo "常见问题:"
    echo "  - Docker服务未启动: docker-compose up -d"
    echo "  - 端口被占用: 检查端口5432, 9000, 9001, 8080"
    echo "  - 依赖未安装: cd cms && npm install"
    echo "  - 配置错误: 检查 cms/.env 文件"
    echo ""
    echo "📚 查看故障排除:"
    echo "  docs/08-MinIO完整配置指南.md (🐛 故障排除章节)"
    echo ""
    exit 1
fi
