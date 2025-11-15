#!/bin/bash

# ==============================================================================
# 修复依赖安装位置
# ==============================================================================
# 问题: sharp 和 nodemailer 被安装到了根目录
# 原因: 误在根目录 package.json 添加了 dependencies
# 解决: 清理根目录依赖,在 cms/ 中重新安装
# ==============================================================================

echo "🔧 修复依赖安装位置..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 步骤1: 清理根目录的 node_modules
echo "1️⃣ 清理根目录 node_modules..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo -e "${GREEN}✓ 已删除根目录 node_modules${NC}"
else
    echo -e "${YELLOW}⚠ 根目录没有 node_modules${NC}"
fi

# 步骤2: 清理根目录的 package-lock.json
echo ""
echo "2️⃣ 清理根目录 package-lock.json..."
if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
    echo -e "${GREEN}✓ 已删除根目录 package-lock.json${NC}"
else
    echo -e "${YELLOW}⚠ 根目录没有 package-lock.json${NC}"
fi

# 步骤3: 重新安装根目录依赖 (只有 workspace 管理工具)
echo ""
echo "3️⃣ 重新安装根目录依赖..."
npm install
echo -e "${GREEN}✓ 根目录依赖已安装 (concurrently, typescript)${NC}"

# 步骤4: 安装 cms 依赖
echo ""
echo "4️⃣ 安装 CMS 依赖 (包括 sharp 和 nodemailer)..."
cd cms
npm install
cd ..
echo -e "${GREEN}✓ CMS 依赖已安装${NC}"

# 步骤5: 验证安装
echo ""
echo "5️⃣ 验证依赖安装..."

# 检查根目录 (不应该有 sharp 和 nodemailer)
echo ""
echo "根目录:"
if [ -d "node_modules/sharp" ]; then
    echo -e "${RED}✗ sharp 仍在根目录 (不应该存在)${NC}"
else
    echo -e "${GREEN}✓ sharp 不在根目录 (正确)${NC}"
fi

if [ -d "node_modules/nodemailer" ]; then
    echo -e "${RED}✗ nodemailer 仍在根目录 (不应该存在)${NC}"
else
    echo -e "${GREEN}✓ nodemailer 不在根目录 (正确)${NC}"
fi

# 检查 cms 目录 (应该有 sharp 和 nodemailer)
echo ""
echo "cms 目录:"
if [ -d "cms/node_modules/sharp" ]; then
    echo -e "${GREEN}✓ sharp 已安装在 cms/node_modules${NC}"
else
    echo -e "${RED}✗ sharp 未安装在 cms/node_modules${NC}"
fi

if [ -d "cms/node_modules/nodemailer" ]; then
    echo -e "${GREEN}✓ nodemailer 已安装在 cms/node_modules${NC}"
else
    echo -e "${RED}✗ nodemailer 未安装在 cms/node_modules${NC}"
fi

if [ -d "cms/node_modules/@aws-sdk/client-s3" ]; then
    echo -e "${GREEN}✓ @aws-sdk/client-s3 已安装在 cms/node_modules${NC}"
else
    echo -e "${RED}✗ @aws-sdk/client-s3 未安装在 cms/node_modules${NC}"
fi

# 完成
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ 依赖修复完成!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "下一步:"
echo "  1. 启动 Docker: docker-compose up -d"
echo "  2. 启动 CMS: cd cms && npm run dev"
echo "  3. 测试图片上传和优化"
echo ""
