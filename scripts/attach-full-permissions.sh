#!/bin/bash
# =============================================================================
# 附加完整权限 - 适用于开发和扩展需求
# =============================================================================
# 这个脚本会给 IAM 用户附加 AdministratorAccess 或完整的服务权限
# 适合需要频繁添加新 AWS 服务的开发环境
# =============================================================================

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
IAM_USER="${1:-busrom-develop}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}附加完整 AWS 权限${NC}"
echo -e "${GREEN}用户: ${IAM_USER}${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Verify user exists
if ! aws iam get-user --user-name "$IAM_USER" &>/dev/null; then
  echo -e "${RED}错误: IAM 用户 '${IAM_USER}' 不存在${NC}"
  exit 1
fi

echo -e "${GREEN}✓ 找到用户 '${IAM_USER}'${NC}\n"

# 询问用户选择方案
echo -e "${YELLOW}请选择权限方案:${NC}"
echo -e "${BLUE}1. AdministratorAccess ${NC}(最简单，拥有所有权限，推荐用于开发环境)"
echo -e "${BLUE}2. 扩展服务权限集${NC}(包含当前需要和未来可能需要的服务)"
echo ""
read -p "请输入选择 (1 或 2): " choice

if [ "$choice" == "1" ]; then
  echo -e "\n${GREEN}方案 1: 附加 AdministratorAccess${NC}\n"

  POLICY_ARN="arn:aws:iam::aws:policy/AdministratorAccess"

  if aws iam attach-user-policy \
    --user-name "$IAM_USER" \
    --policy-arn "$POLICY_ARN"; then
    echo -e "${GREEN}✓ 成功附加 AdministratorAccess${NC}"
  else
    echo -e "${YELLOW}⚠️  可能已经附加或发生错误${NC}"
  fi

elif [ "$choice" == "2" ]; then
  echo -e "\n${GREEN}方案 2: 附加扩展服务权限集${NC}\n"

  # 完整的服务权限列表
  POLICIES=(
    # 核心部署服务
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
    "arn:aws:iam::aws:policy/AmazonECS_FullAccess"
    "arn:aws:iam::aws:policy/AmazonS3FullAccess"
    "arn:aws:iam::aws:policy/AmazonRDSFullAccess"
    "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
    "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
    "arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess"
    "arn:aws:iam::aws:policy/AmazonVPCFullAccess"
    "arn:aws:iam::aws:policy/IAMFullAccess"

    # AI/ML 服务
    "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"
    "arn:aws:iam::aws:policy/AmazonBedrockFullAccess"

    # 数据和分析
    "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
    "arn:aws:iam::aws:policy/AmazonElastiCacheFullAccess"
    "arn:aws:iam::aws:policy/AmazonKinesisFullAccess"

    # 其他常用服务
    "arn:aws:iam::aws:policy/CloudFrontFullAccess"
    "arn:aws:iam::aws:policy/AmazonSNSFullAccess"
    "arn:aws:iam::aws:policy/AmazonSQSFullAccess"
    "arn:aws:iam::aws:policy/AWSLambda_FullAccess"
    "arn:aws:iam::aws:policy/AmazonAPIGatewayAdministrator"

    # 开发工具
    "arn:aws:iam::aws:policy/AWSCodeBuildAdminAccess"
    "arn:aws:iam::aws:policy/AWSCodeDeployFullAccess"
    "arn:aws:iam::aws:policy/AWSCodePipelineFullAccess"
  )

  POLICY_NAMES=(
    "AmazonEC2ContainerRegistryFullAccess"
    "AmazonECS_FullAccess"
    "AmazonS3FullAccess"
    "AmazonRDSFullAccess"
    "CloudWatchLogsFullAccess"
    "SecretsManagerReadWrite"
    "ElasticLoadBalancingFullAccess"
    "AmazonVPCFullAccess"
    "IAMFullAccess"
    "AmazonSageMakerFullAccess"
    "AmazonBedrockFullAccess"
    "AmazonDynamoDBFullAccess"
    "AmazonElastiCacheFullAccess"
    "AmazonKinesisFullAccess"
    "CloudFrontFullAccess"
    "AmazonSNSFullAccess"
    "AmazonSQSFullAccess"
    "AWSLambda_FullAccess"
    "AmazonAPIGatewayAdministrator"
    "AWSCodeBuildAdminAccess"
    "AWSCodeDeployFullAccess"
    "AWSCodePipelineFullAccess"
  )

  # 附加每个策略
  for i in "${!POLICIES[@]}"; do
    POLICY_ARN="${POLICIES[$i]}"
    POLICY_NAME="${POLICY_NAMES[$i]}"

    echo -e "${YELLOW}正在附加: ${POLICY_NAME}...${NC}"

    if aws iam attach-user-policy \
      --user-name "$IAM_USER" \
      --policy-arn "$POLICY_ARN" 2>/dev/null; then
      echo -e "${GREEN}  ✓ 已附加: ${POLICY_NAME}${NC}"
    else
      echo -e "${YELLOW}  ⚠️  已存在或出错: ${POLICY_NAME}${NC}"
    fi
  done

else
  echo -e "${RED}无效选择，退出${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ 权限附加完成！${NC}"
echo -e "${GREEN}========================================${NC}\n"

# 列出已附加的策略
echo -e "${YELLOW}验证已附加的策略...${NC}"
aws iam list-attached-user-policies --user-name "$IAM_USER" --output table

echo ""
echo -e "${GREEN}📋 后续步骤:${NC}"
echo -e "  1. 验证上面所有必需的策略都已附加"
echo -e "  2. 运行基础设施设置脚本:"
echo -e "     ${GREEN}./scripts/setup-aws-infrastructure.sh staging${NC}"
echo -e "  3. 如需使用 SageMaker，可以参考 AWS SageMaker 文档"
echo -e "  4. Gemini API 调用需要在应用代码中配置 API Key"
echo ""

echo -e "${YELLOW}⚠️  安全提示:${NC}"
if [ "$choice" == "1" ]; then
  echo -e "  - AdministratorAccess 拥有完全权限，请妥善保管访问密钥"
  echo -e "  - 强烈建议启用 MFA (多因素认证)"
  echo -e "  - 定期轮换访问密钥 (每 90 天)"
  echo -e "  - 生产环境建议使用最小权限原则"
else
  echo -e "  - 这些权限集合很强大，请妥善保管访问密钥"
  echo -e "  - 建议启用 MFA (多因素认证)"
  echo -e "  - 定期轮换访问密钥"
fi
echo ""
