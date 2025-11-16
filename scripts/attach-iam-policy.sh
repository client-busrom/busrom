#!/bin/bash
# =============================================================================
# IAM Policy Attachment Script
# =============================================================================
# This script creates and attaches the necessary IAM policy to the IAM user
# =============================================================================

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
POLICY_NAME="BusromDeploymentPolicy"
POLICY_FILE="$(dirname "$0")/iam-policy.json"
IAM_USER="${1:-busrom-develop}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}IAM Policy Setup for Busrom${NC}"
echo -e "${GREEN}User: ${IAM_USER}${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Check if policy file exists
if [ ! -f "$POLICY_FILE" ]; then
  echo -e "${RED}Error: Policy file not found: $POLICY_FILE${NC}"
  exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${YELLOW}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}\n"

# Check if policy already exists
POLICY_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${POLICY_NAME}"

if aws iam get-policy --policy-arn "$POLICY_ARN" &>/dev/null; then
  echo -e "${YELLOW}Policy already exists: ${POLICY_NAME}${NC}"
  echo -e "${YELLOW}Getting policy ARN...${NC}"
else
  echo -e "${GREEN}Creating IAM policy: ${POLICY_NAME}${NC}"

  # Create the policy
  POLICY_ARN=$(aws iam create-policy \
    --policy-name "$POLICY_NAME" \
    --policy-document file://"$POLICY_FILE" \
    --description "Policy for Busrom deployment to AWS (ECR, ECS, S3, RDS, etc.)" \
    --query 'Policy.Arn' \
    --output text)

  echo -e "${GREEN}✓ Created policy: ${POLICY_ARN}${NC}"
fi

echo ""

# Check if user exists
if ! aws iam get-user --user-name "$IAM_USER" &>/dev/null; then
  echo -e "${RED}Error: IAM user '${IAM_USER}' does not exist${NC}"
  echo -e "${YELLOW}Please create the user first or specify a different user:${NC}"
  echo -e "${YELLOW}  $0 <username>${NC}"
  exit 1
fi

# Attach policy to user
echo -e "${GREEN}Attaching policy to user: ${IAM_USER}${NC}"

if aws iam attach-user-policy \
  --user-name "$IAM_USER" \
  --policy-arn "$POLICY_ARN"; then
  echo -e "${GREEN}✓ Successfully attached policy to user${NC}"
else
  echo -e "${YELLOW}⚠️  Policy might already be attached${NC}"
fi

echo ""

# List all policies attached to the user
echo -e "${GREEN}Current policies attached to ${IAM_USER}:${NC}"
aws iam list-attached-user-policies --user-name "$IAM_USER" --output table

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ IAM Policy Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}📝 Policy ARN:${NC}"
echo -e "  ${POLICY_ARN}"
echo ""

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "  1. Verify the policy is attached to the user"
echo -e "  2. Try running the infrastructure setup script again:"
echo -e "     ${GREEN}./scripts/setup-aws-infrastructure.sh staging${NC}"
echo ""
