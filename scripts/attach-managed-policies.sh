#!/bin/bash
# =============================================================================
# Attach AWS Managed Policies Script
# =============================================================================
# This script attaches all necessary AWS managed policies to an IAM user
# Run this with an AWS administrator account
# =============================================================================

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
IAM_USER="${1:-busrom-develop}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Attaching AWS Managed Policies${NC}"
echo -e "${GREEN}User: ${IAM_USER}${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Verify user exists
if ! aws iam get-user --user-name "$IAM_USER" &>/dev/null; then
  echo -e "${RED}Error: IAM user '${IAM_USER}' does not exist${NC}"
  exit 1
fi

echo -e "${GREEN}✓ User '${IAM_USER}' found${NC}\n"

# Array of policies to attach
POLICIES=(
  "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
  "arn:aws:iam::aws:policy/AmazonECS_FullAccess"
  "arn:aws:iam::aws:policy/AmazonS3FullAccess"
  "arn:aws:iam::aws:policy/AmazonRDSFullAccess"
  "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
  "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
  "arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess"
  "arn:aws:iam::aws:policy/AmazonVPCFullAccess"
  "arn:aws:iam::aws:policy/IAMFullAccess"
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
)

# Attach each policy
for i in "${!POLICIES[@]}"; do
  POLICY_ARN="${POLICIES[$i]}"
  POLICY_NAME="${POLICY_NAMES[$i]}"

  echo -e "${YELLOW}Attaching: ${POLICY_NAME}...${NC}"

  if aws iam attach-user-policy \
    --user-name "$IAM_USER" \
    --policy-arn "$POLICY_ARN" 2>/dev/null; then
    echo -e "${GREEN}  ✓ Attached: ${POLICY_NAME}${NC}"
  else
    echo -e "${YELLOW}  ⚠️  Already attached or error: ${POLICY_NAME}${NC}"
  fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Policy Attachment Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

# List attached policies
echo -e "${YELLOW}Verifying attached policies...${NC}"
aws iam list-attached-user-policies --user-name "$IAM_USER" --output table

echo ""
echo -e "${GREEN}📋 Next Steps:${NC}"
echo -e "  1. Verify all required policies are attached above"
echo -e "  2. Try running the infrastructure setup script:"
echo -e "     ${GREEN}./scripts/setup-aws-infrastructure.sh staging${NC}"
echo ""
