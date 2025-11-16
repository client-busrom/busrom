#!/bin/bash
# =============================================================================
# GitHub Secrets Value Generator
# =============================================================================
# This script generates all the values needed for GitHub Secrets configuration
# =============================================================================

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}GitHub Secrets Configuration Generator${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Check AWS CLI configuration
if ! aws sts get-caller-identity &> /dev/null; then
  echo -e "${RED}Error: AWS CLI is not configured${NC}"
  echo "Please run: aws configure"
  exit 1
fi

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo -e "${BLUE}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}\n"

# =============================================================================
# Universal Secrets
# =============================================================================
echo -e "${YELLOW}## Universal Secrets ##${NC}"
echo "Copy these to GitHub Repository Secrets:"
echo ""
echo "Secret Name: AWS_ACCESS_KEY_ID"
echo "Value: $(aws configure get aws_access_key_id 2>/dev/null || echo '[Please configure AWS CLI]')"
echo ""
echo "Secret Name: AWS_SECRET_ACCESS_KEY"
echo "Value: $(aws configure get aws_secret_access_key 2>/dev/null || echo '[Please configure AWS CLI]')"
echo ""

# =============================================================================
# Staging Environment
# =============================================================================
STAGING_CONFIG="${PROJECT_ROOT}/.aws-infrastructure-staging.env"

if [ -f "$STAGING_CONFIG" ]; then
  echo -e "${YELLOW}## Staging Environment Secrets ##${NC}"
  source "$STAGING_CONFIG"

  echo "Secret Name: ECR_REPOSITORY_CMS_STAGING"
  echo "Value: ${CMS_ECR_REPOSITORY}"
  echo ""

  echo "Secret Name: ECR_REPOSITORY_WEB_STAGING"
  echo "Value: ${WEB_ECR_REPOSITORY}"
  echo ""

  echo "Secret Name: ECS_CLUSTER_STAGING"
  echo "Value: ${ECS_CLUSTER}"
  echo ""

  echo "Secret Name: ECS_SERVICE_CMS_STAGING"
  echo "Value: ${CMS_SERVICE_NAME:-busrom-cms-staging}"
  echo ""

  echo "Secret Name: ECS_SERVICE_WEB_STAGING"
  echo "Value: ${WEB_SERVICE_NAME:-busrom-web-staging}"
  echo ""

  echo "Secret Name: NEXT_PUBLIC_API_URL_STAGING"
  echo "Value: https://cms-staging.busrom.com/api/graphql"
  echo ""
else
  echo -e "${RED}⚠️  Staging configuration not found: ${STAGING_CONFIG}${NC}"
  echo -e "${YELLOW}Please run: ./scripts/setup-aws-infrastructure.sh staging${NC}\n"
fi

# =============================================================================
# Production Environment
# =============================================================================
PRODUCTION_CONFIG="${PROJECT_ROOT}/.aws-infrastructure-production.env"

if [ -f "$PRODUCTION_CONFIG" ]; then
  echo -e "${YELLOW}## Production Environment Secrets ##${NC}"
  source "$PRODUCTION_CONFIG"

  echo "Secret Name: ECR_REPOSITORY_CMS_PRODUCTION"
  echo "Value: ${CMS_ECR_REPOSITORY}"
  echo ""

  echo "Secret Name: ECR_REPOSITORY_WEB_PRODUCTION"
  echo "Value: ${WEB_ECR_REPOSITORY}"
  echo ""

  echo "Secret Name: ECS_CLUSTER_PRODUCTION"
  echo "Value: ${ECS_CLUSTER}"
  echo ""

  echo "Secret Name: ECS_SERVICE_CMS_PRODUCTION"
  echo "Value: ${CMS_SERVICE_NAME:-busrom-cms-production}"
  echo ""

  echo "Secret Name: ECS_SERVICE_WEB_PRODUCTION"
  echo "Value: ${WEB_SERVICE_NAME:-busrom-web-production}"
  echo ""

  echo "Secret Name: NEXT_PUBLIC_API_URL_PRODUCTION"
  echo "Value: https://cms.busrom.com/api/graphql"
  echo ""
else
  echo -e "${RED}⚠️  Production configuration not found: ${PRODUCTION_CONFIG}${NC}"
  echo -e "${YELLOW}Please run: ./scripts/setup-aws-infrastructure.sh production${NC}\n"
fi

# =============================================================================
# Summary
# =============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Configuration Complete${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "  1. Go to GitHub repository → Settings → Secrets and variables → Actions"
echo -e "  2. Click 'New repository secret'"
echo -e "  3. Copy and paste the secret names and values from above"
echo -e "  4. Refer to GITHUB_SECRETS_TEMPLATE.md for detailed instructions"
echo ""

echo -e "${YELLOW}💾 Export to file (optional):${NC}"
echo -e "  ./scripts/generate-github-secrets.sh > github-secrets-values.txt"
echo -e "  ${RED}⚠️  This file contains sensitive information. Do not commit to Git!${NC}"
echo ""
