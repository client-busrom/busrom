#!/bin/bash
# =============================================================================
# AWS Infrastructure Setup Script for Busrom
# =============================================================================
# This script creates all necessary AWS resources for the Busrom application
# - ECR repositories for Docker images
# - S3 buckets for media storage
# - RDS PostgreSQL database
# - ECS cluster and services
# - Application Load Balancer
# - CloudWatch log groups
# =============================================================================

set -e  # Exit on error

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="busrom"
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${1:-staging}"  # staging or production

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}AWS Infrastructure Setup for Busrom${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}Region: ${AWS_REGION}${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo -e "${RED}Error: Environment must be 'staging' or 'production'${NC}"
  echo "Usage: $0 [staging|production]"
  exit 1
fi

# Check AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
  echo -e "${RED}Error: AWS CLI is not configured properly${NC}"
  echo "Please run: aws configure"
  exit 1
fi

echo -e "${YELLOW}Current AWS Account:${NC}"
aws sts get-caller-identity
echo ""

# =============================================================================
# 1. Create ECR Repositories
# =============================================================================
echo -e "${GREEN}[1/7] Creating ECR Repositories...${NC}"

create_ecr_repo() {
  local repo_name=$1

  if aws ecr describe-repositories --repository-names "$repo_name" --region "$AWS_REGION" &> /dev/null; then
    echo -e "${YELLOW}  ✓ ECR repository '$repo_name' already exists${NC}"
  else
    aws ecr create-repository \
      --repository-name "$repo_name" \
      --region "$AWS_REGION" \
      --image-scanning-configuration scanOnPush=true \
      --tags Key=Project,Value="$PROJECT_NAME" Key=Environment,Value="$ENVIRONMENT" \
      > /dev/null
    echo -e "${GREEN}  ✓ Created ECR repository: $repo_name${NC}"
  fi
}

create_ecr_repo "${PROJECT_NAME}-cms-${ENVIRONMENT}"
create_ecr_repo "${PROJECT_NAME}-web-${ENVIRONMENT}"

# Get ECR URIs
CMS_ECR_URI=$(aws ecr describe-repositories --repository-names "${PROJECT_NAME}-cms-${ENVIRONMENT}" --region "$AWS_REGION" --query 'repositories[0].repositoryUri' --output text)
WEB_ECR_URI=$(aws ecr describe-repositories --repository-names "${PROJECT_NAME}-web-${ENVIRONMENT}" --region "$AWS_REGION" --query 'repositories[0].repositoryUri' --output text)

echo -e "${GREEN}  CMS ECR URI: ${CMS_ECR_URI}${NC}"
echo -e "${GREEN}  Web ECR URI: ${WEB_ECR_URI}${NC}\n"

# =============================================================================
# 2. Create S3 Bucket for Media Storage
# =============================================================================
echo -e "${GREEN}[2/7] Creating S3 Bucket...${NC}"

S3_BUCKET_NAME="${PROJECT_NAME}-media-${ENVIRONMENT}"

if aws s3 ls "s3://$S3_BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
  aws s3 mb "s3://$S3_BUCKET_NAME" --region "$AWS_REGION"
  echo -e "${GREEN}  ✓ Created S3 bucket: $S3_BUCKET_NAME${NC}"

  # Enable versioning
  aws s3api put-bucket-versioning \
    --bucket "$S3_BUCKET_NAME" \
    --versioning-configuration Status=Enabled

  # Configure CORS
  cat > /tmp/s3-cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

  aws s3api put-bucket-cors \
    --bucket "$S3_BUCKET_NAME" \
    --cors-configuration file:///tmp/s3-cors.json

  echo -e "${GREEN}  ✓ Configured CORS for S3 bucket${NC}"
else
  echo -e "${YELLOW}  ✓ S3 bucket '$S3_BUCKET_NAME' already exists${NC}"
fi

echo -e "${GREEN}  S3 Bucket: s3://${S3_BUCKET_NAME}${NC}\n"

# =============================================================================
# 3. Create VPC (if not exists)
# =============================================================================
echo -e "${GREEN}[3/7] Setting up VPC...${NC}"

# Check for default VPC
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --region "$AWS_REGION" --query 'Vpcs[0].VpcId' --output text)

if [ "$VPC_ID" == "None" ] || [ -z "$VPC_ID" ]; then
  echo -e "${YELLOW}  Creating new VPC...${NC}"
  # Create VPC with CIDR 10.0.0.0/16
  VPC_ID=$(aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --region "$AWS_REGION" \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=${PROJECT_NAME}-vpc-${ENVIRONMENT}},{Key=Project,Value=${PROJECT_NAME}},{Key=Environment,Value=${ENVIRONMENT}}]" \
    --query 'Vpc.VpcId' \
    --output text)

  # Enable DNS hostnames
  aws ec2 modify-vpc-attribute --vpc-id "$VPC_ID" --enable-dns-hostnames
  echo -e "${GREEN}  ✓ Created VPC: $VPC_ID${NC}"
else
  echo -e "${YELLOW}  ✓ Using existing VPC: $VPC_ID${NC}"
fi

# Get subnets
SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --region "$AWS_REGION" --query 'Subnets[*].SubnetId' --output text)
echo -e "${GREEN}  Subnets: $SUBNET_IDS${NC}\n"

# =============================================================================
# 4. Create Security Groups
# =============================================================================
echo -e "${GREEN}[4/7] Creating Security Groups...${NC}"

# Security group for ALB
ALB_SG_NAME="${PROJECT_NAME}-alb-sg-${ENVIRONMENT}"
ALB_SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=$ALB_SG_NAME" "Name=vpc-id,Values=$VPC_ID" \
  --region "$AWS_REGION" \
  --query 'SecurityGroups[0].GroupId' \
  --output text 2>/dev/null || echo "")

if [ -z "$ALB_SG_ID" ] || [ "$ALB_SG_ID" == "None" ]; then
  ALB_SG_ID=$(aws ec2 create-security-group \
    --group-name "$ALB_SG_NAME" \
    --description "Security group for ${PROJECT_NAME} ALB (${ENVIRONMENT})" \
    --vpc-id "$VPC_ID" \
    --region "$AWS_REGION" \
    --query 'GroupId' \
    --output text)

  # Allow HTTP and HTTPS from anywhere
  aws ec2 authorize-security-group-ingress \
    --group-id "$ALB_SG_ID" \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region "$AWS_REGION"

  aws ec2 authorize-security-group-ingress \
    --group-id "$ALB_SG_ID" \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --region "$AWS_REGION"

  echo -e "${GREEN}  ✓ Created ALB security group: $ALB_SG_ID${NC}"
else
  echo -e "${YELLOW}  ✓ ALB security group already exists: $ALB_SG_ID${NC}"
fi

# Security group for ECS tasks
ECS_SG_NAME="${PROJECT_NAME}-ecs-sg-${ENVIRONMENT}"
ECS_SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=$ECS_SG_NAME" "Name=vpc-id,Values=$VPC_ID" \
  --region "$AWS_REGION" \
  --query 'SecurityGroups[0].GroupId' \
  --output text 2>/dev/null || echo "")

if [ -z "$ECS_SG_ID" ] || [ "$ECS_SG_ID" == "None" ]; then
  ECS_SG_ID=$(aws ec2 create-security-group \
    --group-name "$ECS_SG_NAME" \
    --description "Security group for ${PROJECT_NAME} ECS tasks (${ENVIRONMENT})" \
    --vpc-id "$VPC_ID" \
    --region "$AWS_REGION" \
    --query 'GroupId' \
    --output text)

  # Allow traffic from ALB
  aws ec2 authorize-security-group-ingress \
    --group-id "$ECS_SG_ID" \
    --protocol tcp \
    --port 3000 \
    --source-group "$ALB_SG_ID" \
    --region "$AWS_REGION"

  aws ec2 authorize-security-group-ingress \
    --group-id "$ECS_SG_ID" \
    --protocol tcp \
    --port 3001 \
    --source-group "$ALB_SG_ID" \
    --region "$AWS_REGION"

  echo -e "${GREEN}  ✓ Created ECS security group: $ECS_SG_ID${NC}"
else
  echo -e "${YELLOW}  ✓ ECS security group already exists: $ECS_SG_ID${NC}"
fi

echo ""

# =============================================================================
# 5. Create RDS PostgreSQL (Optional - can be skipped for now)
# =============================================================================
echo -e "${GREEN}[5/7] RDS PostgreSQL Setup...${NC}"
echo -e "${YELLOW}  ⚠️  RDS creation is time-consuming (10-15 minutes)${NC}"
echo -e "${YELLOW}  ⚠️  For now, you can use docker-compose PostgreSQL or create RDS manually${NC}"
echo -e "${YELLOW}  ⚠️  Skipping automated RDS creation...${NC}\n"

# Placeholder for RDS creation
# Uncomment and customize as needed
# DB_INSTANCE_ID="${PROJECT_NAME}-db-${ENVIRONMENT}"
# DB_NAME="${PROJECT_NAME//-/_}_${ENVIRONMENT}"

# =============================================================================
# 6. Create ECS Cluster
# =============================================================================
echo -e "${GREEN}[6/7] Creating ECS Cluster...${NC}"

CLUSTER_NAME="${PROJECT_NAME}-cluster-${ENVIRONMENT}"

if aws ecs describe-clusters --clusters "$CLUSTER_NAME" --region "$AWS_REGION" --query 'clusters[0].status' --output text 2>/dev/null | grep -q "ACTIVE"; then
  echo -e "${YELLOW}  ✓ ECS cluster '$CLUSTER_NAME' already exists${NC}"
else
  aws ecs create-cluster \
    --cluster-name "$CLUSTER_NAME" \
    --region "$AWS_REGION" \
    --tags key=Project,value="$PROJECT_NAME" key=Environment,value="$ENVIRONMENT" \
    > /dev/null
  echo -e "${GREEN}  ✓ Created ECS cluster: $CLUSTER_NAME${NC}"
fi

echo ""

# =============================================================================
# 7. Create CloudWatch Log Groups
# =============================================================================
echo -e "${GREEN}[7/7] Creating CloudWatch Log Groups...${NC}"

create_log_group() {
  local log_group_name=$1

  if aws logs describe-log-groups --log-group-name-prefix "$log_group_name" --region "$AWS_REGION" --query "logGroups[?logGroupName=='$log_group_name']" --output text | grep -q "$log_group_name"; then
    echo -e "${YELLOW}  ✓ Log group '$log_group_name' already exists${NC}"
  else
    aws logs create-log-group --log-group-name "$log_group_name" --region "$AWS_REGION"
    aws logs put-retention-policy --log-group-name "$log_group_name" --retention-in-days 30 --region "$AWS_REGION"
    echo -e "${GREEN}  ✓ Created log group: $log_group_name${NC}"
  fi
}

create_log_group "/ecs/${PROJECT_NAME}-cms-${ENVIRONMENT}"
create_log_group "/ecs/${PROJECT_NAME}-web-${ENVIRONMENT}"

echo ""

# =============================================================================
# Summary
# =============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Infrastructure Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}📝 Summary:${NC}"
echo -e "  Environment: ${ENVIRONMENT}"
echo -e "  Region: ${AWS_REGION}"
echo -e "  VPC ID: ${VPC_ID}"
echo -e "  ECS Cluster: ${CLUSTER_NAME}"
echo -e "  S3 Bucket: ${S3_BUCKET_NAME}"
echo -e "  CMS ECR: ${CMS_ECR_URI}"
echo -e "  Web ECR: ${WEB_ECR_URI}"
echo ""

echo -e "${YELLOW}🔑 GitHub Secrets to Configure:${NC}"
ENV_UPPER=$(echo "$ENVIRONMENT" | tr '[:lower:]' '[:upper:]')
echo -e "  AWS_ACCOUNT_ID: $(aws sts get-caller-identity --query Account --output text)"
echo -e "  AWS_REGION: ${AWS_REGION}"
echo -e "  ECS_CLUSTER_${ENV_UPPER}: ${CLUSTER_NAME}"
echo -e "  ECR_REPOSITORY_CMS_${ENV_UPPER}: ${PROJECT_NAME}-cms-${ENVIRONMENT}"
echo -e "  ECR_REPOSITORY_WEB_${ENV_UPPER}: ${PROJECT_NAME}-web-${ENVIRONMENT}"
echo -e "  S3_BUCKET_NAME_${ENV_UPPER}: ${S3_BUCKET_NAME}"
echo ""

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "  1. Create an IAM user for GitHub Actions with necessary permissions"
echo -e "  2. Add AWS credentials to GitHub Secrets (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)"
echo -e "  3. Add the above GitHub Secrets to your repository"
echo -e "  4. Create RDS database (manually or via Terraform)"
echo -e "  5. Configure environment variables in GitHub Secrets"
echo -e "  6. Push to GitHub to trigger deployment workflow"
echo ""

# Save configuration to file
CONFIG_FILE=".aws-infrastructure-${ENVIRONMENT}.env"
cat > "$CONFIG_FILE" <<EOF
# AWS Infrastructure Configuration
# Generated on $(date)
# Environment: ${ENVIRONMENT}

AWS_REGION=${AWS_REGION}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
VPC_ID=${VPC_ID}
ALB_SG_ID=${ALB_SG_ID}
ECS_SG_ID=${ECS_SG_ID}
ECS_CLUSTER=${CLUSTER_NAME}
S3_BUCKET_NAME=${S3_BUCKET_NAME}
CMS_ECR_REPOSITORY=${PROJECT_NAME}-cms-${ENVIRONMENT}
WEB_ECR_REPOSITORY=${PROJECT_NAME}-web-${ENVIRONMENT}
CMS_ECR_URI=${CMS_ECR_URI}
WEB_ECR_URI=${WEB_ECR_URI}
EOF

echo -e "${GREEN}✅ Configuration saved to: $CONFIG_FILE${NC}"
echo ""
