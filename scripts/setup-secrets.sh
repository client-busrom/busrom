#!/bin/bash
# =============================================================================
# AWS Secrets Manager Setup Script
# =============================================================================
# This script creates secrets in AWS Secrets Manager for the application
# =============================================================================

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROJECT_NAME="busrom"
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${1:-staging}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}AWS Secrets Setup for Busrom${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo -e "${RED}Error: Environment must be 'staging' or 'production'${NC}"
  exit 1
fi

# =============================================================================
# Function: Create or Update Secret
# =============================================================================
create_or_update_secret() {
  local secret_name=$1
  local secret_value=$2
  local description=$3

  # Check if secret exists
  if aws secretsmanager describe-secret --secret-id "$secret_name" --region "$AWS_REGION" &>/dev/null; then
    echo -e "${YELLOW}  Updating existing secret: $secret_name${NC}"
    aws secretsmanager update-secret \
      --secret-id "$secret_name" \
      --secret-string "$secret_value" \
      --region "$AWS_REGION" \
      > /dev/null
  else
    echo -e "${GREEN}  Creating new secret: $secret_name${NC}"
    aws secretsmanager create-secret \
      --name "$secret_name" \
      --description "$description" \
      --secret-string "$secret_value" \
      --region "$AWS_REGION" \
      --tags Key=Project,Value="$PROJECT_NAME" Key=Environment,Value="$ENVIRONMENT" \
      > /dev/null
  fi

  echo -e "${GREEN}  ✓ Secret configured: $secret_name${NC}"
}

# =============================================================================
# Collect Secret Values
# =============================================================================
echo -e "${YELLOW}Please provide the following secret values:${NC}\n"

# Database URL
echo -e "${YELLOW}1. DATABASE_URL${NC}"
echo -e "   Format: postgresql://username:password@host:port/database"
echo -e "   Example: postgresql://busrom:password123@busrom-db.abc123.us-east-1.rds.amazonaws.com:5432/busrom"
read -r -p "   Enter DATABASE_URL: " DATABASE_URL
echo ""

# Session Secret
echo -e "${YELLOW}2. SESSION_SECRET${NC}"
echo -e "   A random secret key for session encryption (min 32 characters)"
SESSION_SECRET=$(openssl rand -base64 32)
echo -e "   Generated SESSION_SECRET: ${SESSION_SECRET}"
echo ""

# S3 Credentials
echo -e "${YELLOW}3. S3_ACCESS_KEY_ID${NC}"
read -r -p "   Enter S3 Access Key ID: " S3_ACCESS_KEY_ID
echo ""

echo -e "${YELLOW}4. S3_SECRET_ACCESS_KEY${NC}"
echo -e "   ${YELLOW}提示: 可以直接粘贴密钥（会显示出来）${NC}"
read -r -p "   Enter S3 Secret Access Key: " S3_SECRET_ACCESS_KEY
echo ""

# CDN Domain
echo -e "${YELLOW}5. CDN_DOMAIN${NC}"
if [ "$ENVIRONMENT" == "production" ]; then
  read -r -p "   Enter CloudFront CDN domain (e.g., https://d1234567890.cloudfront.net): " CDN_DOMAIN
else
  read -r -p "   Enter CloudFront CDN domain for staging: " CDN_DOMAIN
fi
echo ""

# Web URL
echo -e "${YELLOW}6. WEB_URL${NC}"
if [ "$ENVIRONMENT" == "production" ]; then
  WEB_URL="https://www.busrom.com"
else
  WEB_URL="https://staging.busrom.com"
fi
echo -e "   Using WEB_URL: ${WEB_URL}"
echo ""

# Next.js API URL
echo -e "${YELLOW}7. NEXT_PUBLIC_API_URL${NC}"
if [ "$ENVIRONMENT" == "production" ]; then
  NEXT_PUBLIC_API_URL="https://cms.busrom.com/api/graphql"
else
  NEXT_PUBLIC_API_URL="https://cms-staging.busrom.com/api/graphql"
fi
echo -e "   Using NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}"
echo ""

# =============================================================================
# Create Secrets
# =============================================================================
echo -e "${GREEN}Creating secrets in AWS Secrets Manager...${NC}\n"

create_or_update_secret \
  "${PROJECT_NAME}/${ENVIRONMENT}/DATABASE_URL" \
  "$DATABASE_URL" \
  "PostgreSQL database connection string for ${PROJECT_NAME} ${ENVIRONMENT}"

create_or_update_secret \
  "${PROJECT_NAME}/${ENVIRONMENT}/SESSION_SECRET" \
  "$SESSION_SECRET" \
  "Keystone session secret for ${PROJECT_NAME} ${ENVIRONMENT}"

create_or_update_secret \
  "${PROJECT_NAME}/${ENVIRONMENT}/S3_ACCESS_KEY_ID" \
  "$S3_ACCESS_KEY_ID" \
  "S3 access key ID for ${PROJECT_NAME} ${ENVIRONMENT}"

create_or_update_secret \
  "${PROJECT_NAME}/${ENVIRONMENT}/S3_SECRET_ACCESS_KEY" \
  "$S3_SECRET_ACCESS_KEY" \
  "S3 secret access key for ${PROJECT_NAME} ${ENVIRONMENT}"

# Only create CDN_DOMAIN secret if it's not empty
if [ -n "$CDN_DOMAIN" ]; then
  create_or_update_secret \
    "${PROJECT_NAME}/${ENVIRONMENT}/CDN_DOMAIN" \
    "$CDN_DOMAIN" \
    "CloudFront CDN domain for ${PROJECT_NAME} ${ENVIRONMENT}"
else
  echo -e "${YELLOW}  ⊘ Skipping CDN_DOMAIN (empty value)${NC}"
fi

create_or_update_secret \
  "${PROJECT_NAME}/${ENVIRONMENT}/WEB_URL" \
  "$WEB_URL" \
  "Web application URL for ${PROJECT_NAME} ${ENVIRONMENT}"

create_or_update_secret \
  "${PROJECT_NAME}/${ENVIRONMENT}/NEXT_PUBLIC_API_URL" \
  "$NEXT_PUBLIC_API_URL" \
  "Next.js API URL for ${PROJECT_NAME} ${ENVIRONMENT}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Secrets Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}📝 Secrets ARN Format:${NC}"
echo -e "  arn:aws:secretsmanager:${AWS_REGION}:AWS_ACCOUNT_ID:secret:${PROJECT_NAME}/${ENVIRONMENT}/SECRET_NAME"
echo ""

echo -e "${YELLOW}📋 Created Secrets:${NC}"
echo -e "  - ${PROJECT_NAME}/${ENVIRONMENT}/DATABASE_URL"
echo -e "  - ${PROJECT_NAME}/${ENVIRONMENT}/SESSION_SECRET"
echo -e "  - ${PROJECT_NAME}/${ENVIRONMENT}/S3_ACCESS_KEY_ID"
echo -e "  - ${PROJECT_NAME}/${ENVIRONMENT}/S3_SECRET_ACCESS_KEY"
echo -e "  - ${PROJECT_NAME}/${ENVIRONMENT}/CDN_DOMAIN"
echo -e "  - ${PROJECT_NAME}/${ENVIRONMENT}/WEB_URL"
echo -e "  - ${PROJECT_NAME}/${ENVIRONMENT}/NEXT_PUBLIC_API_URL"
echo ""

echo -e "${YELLOW}⚠️  Important:${NC}"
echo -e "  - Make sure your ECS Task Execution Role has permission to read these secrets"
echo -e "  - The IAM policy should include secretsmanager:GetSecretValue"
echo ""
