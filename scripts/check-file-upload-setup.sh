#!/bin/bash

echo "========================================"
echo "  文件上传功能 - 环境检查工具"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check MinIO
echo "1. 检查 MinIO 容器..."
if docker ps | grep -q busrom-minio; then
    check_pass "MinIO 容器正在运行"
    MINIO_STATUS=$(docker inspect --format='{{.State.Health.Status}}' busrom-minio 2>/dev/null || echo "unknown")
    if [ "$MINIO_STATUS" = "healthy" ]; then
        check_pass "MinIO 健康检查: $MINIO_STATUS"
    else
        check_warn "MinIO 健康检查: $MINIO_STATUS"
    fi
else
    check_fail "MinIO 容器未运行"
    echo "   启动命令: docker-compose up -d minio"
fi
echo ""

# 2. Check Web .env.local
echo "2. 检查 Web 环境变量..."
WEB_ENV_FILE="/Users/cerfbaleine/workspace/busrom-work/web/.env.local"

if [ -f "$WEB_ENV_FILE" ]; then
    check_pass "找到 .env.local 文件"

    # Check required variables
    REQUIRED_VARS=("S3_BUCKET_NAME" "S3_ACCESS_KEY_ID" "S3_SECRET_ACCESS_KEY" "USE_MINIO" "S3_ENDPOINT" "NEXT_PUBLIC_CMS_URL")

    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" "$WEB_ENV_FILE"; then
            value=$(grep "^$var=" "$WEB_ENV_FILE" | cut -d'=' -f2)
            check_pass "$var 已配置"
        else
            check_fail "$var 未配置"
            MISSING_VARS=true
        fi
    done
else
    check_fail ".env.local 文件不存在"
    echo "   需要创建: cp .env.example .env.local"
    MISSING_VARS=true
fi
echo ""

# 3. Check MinIO bucket
echo "3. 检查 MinIO Bucket..."
if docker ps | grep -q busrom-minio; then
    if docker exec busrom-minio mc ls /data/busrom-media 2>/dev/null; then
        check_pass "busrom-media bucket 存在"
    else
        check_warn "busrom-media bucket 不存在"
        echo "   创建命令: docker exec busrom-minio mc mb /data/busrom-media"
    fi
else
    check_fail "无法检查 bucket（MinIO 未运行）"
fi
echo ""

# 4. Check Web service
echo "4. 检查 Web 服务..."
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    check_pass "Web 服务运行在 http://localhost:3001"
else
    check_warn "Web 服务未运行或未响应"
    echo "   启动命令: cd web && npm run dev"
fi
echo ""

# 5. Check CMS service
echo "5. 检查 CMS 服务..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    check_pass "CMS 服务运行在 http://localhost:3000"
else
    check_warn "CMS 服务未运行或未响应"
    echo "   启动命令: cd cms && npm run dev"
fi
echo ""

# Summary
echo "========================================"
echo "  检查总结"
echo "========================================"
echo ""

if [ -n "$MISSING_VARS" ]; then
    echo -e "${RED}错误：${NC} 缺少必需的环境变量"
    echo ""
    echo "修复步骤："
    echo "1. 确保 web/.env.local 包含以下内容："
    echo ""
    cat << 'EOF'
S3_BUCKET_NAME=busrom-media
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin123
USE_MINIO=true
S3_ENDPOINT=http://localhost:9000
NEXT_PUBLIC_CMS_URL=http://localhost:3000
EOF
    echo ""
    echo "2. 重启 Web 服务:"
    echo "   cd web && npm run dev"
    echo ""
else
    echo -e "${GREEN}✓ 环境配置检查通过！${NC}"
    echo ""
    echo "如果文件上传仍然失败，请确保："
    echo "1. Web 服务已重启（环境变量才会生效）"
    echo "2. MinIO 可访问: http://localhost:9000"
    echo "3. 查看详细错误日志"
    echo ""
    echo "测试文件上传："
    echo "- 访问包含 file 字段的表单"
    echo "- 选择小文件上传（<5MB）"
    echo "- 查看控制台日志"
    echo ""
fi

echo "详细文档: FIX_FILE_UPLOAD_ERROR.md"
echo "========================================"
