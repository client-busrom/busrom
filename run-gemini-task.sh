#!/bin/bash
# ============================================
# 一键让 Gemini 执行滑轨门动效开发任务
# 使用方法：在项目根目录打开终端，运行：
#   chmod +x run-gemini-task.sh && ./run-gemini-task.sh
# ============================================

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 准备将滑轨门开发任务交给 Gemini...${NC}"

# 1. 检查 Gemini CLI 是否安装
if ! command -v gemini &> /dev/null; then
    echo -e "${YELLOW}⏳ Gemini CLI 未安装，正在安装...${NC}"
    npm install -g @google/gemini-cli@latest
    if ! command -v gemini &> /dev/null; then
        echo -e "${RED}❌ 安装失败，请手动运行: npm install -g @google/gemini-cli${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Gemini CLI 版本: $(gemini --version)${NC}"

# 2. 检查 API Key
if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  未检测到 GEMINI_API_KEY 环境变量${NC}"
    echo -e "请输入你的 Google AI Studio API Key (以 AIza 开头):"
    read -r GEMINI_API_KEY
    export GEMINI_API_KEY
fi

# 3. 确认任务文件存在
if [ ! -f "GEMINI_TASK_sliding_door.md" ]; then
    echo -e "${RED}❌ 找不到 GEMINI_TASK_sliding_door.md，请确认在项目根目录运行${NC}"
    exit 1
fi

echo -e "${GREEN}📋 任务文件: GEMINI_TASK_sliding_door.md${NC}"
echo -e "${GREEN}📁 目标文件: web/components/oem-odm/OemOdmWhatWeOffer.tsx${NC}"
echo ""
echo -e "${YELLOW}🤖 正在启动 Gemini，YOLO 模式（自动批准所有操作）...${NC}"
echo ""

# 4. 执行任务
gemini \
  -p "请读取 GEMINI_TASK_sliding_door.md 文件中的完整开发指令。按照文档中的技术方案，修改 web/components/oem-odm/OemOdmWhatWeOffer.tsx 文件，为 PC 端的 What We Offer You 板块添加磨砂玻璃滑轨门滚动动效。要求：1) 使用 GSAP ScrollTrigger + pin 实现 sticky 和开关门动画 2) 严格按照文档中的 SVG 层级关系（Layer 0-3）和 z-index 放置所有 7 个 SVG 3) 只有 left-door 和 right-door 做 translateX 动画，其他 SVG 固定不动 4) 不要修改移动端代码 5) 不要修改现有的卡片 hover 效果和标题动画 6) 注意 Lenis 平滑滚动的兼容性" \
  -y

echo ""
echo -e "${GREEN}✅ Gemini 任务执行完毕！${NC}"
echo -e "请检查 web/components/oem-odm/OemOdmWhatWeOffer.tsx 的改动"
echo -e "运行 ${YELLOW}cd web && npm run dev${NC} 查看效果"
