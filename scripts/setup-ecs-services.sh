#!/bin/bash
# =============================================================================
# ECS Task Definitions and Services Setup Script
# =============================================================================
# This script:
# 1. Creates ECS task definitions for CMS and Web services
# 2. Creates ECS services with load balancers
# 3. Configures auto-scaling
# =============================================================================

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROJECT_NAME="busrom"
ENVIRONMENT="${1:-staging}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Load infrastructure configuration
CONFIG_FILE="$SCRIPT_DIR/../.aws-infrastructure-${ENVIRONMENT}.env"
if [ ! -f "$CONFIG_FILE" ]; then
  echo -e "${RED}Error: Configuration file not found: $CONFIG_FILE${NC}"
  echo "Please run setup-aws-infrastructure.sh first"
  exit 1
fi

source "$CONFIG_FILE"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}ECS Services Setup for Busrom${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# =============================================================================
# Function: Register Task Definition
# =============================================================================
register_task_definition() {
  local service_type=$1  # cms or web
  local template_file="$SCRIPT_DIR/ecs-task-definitions/${service_type}-task-definition.json"
  local output_file="/tmp/${service_type}-task-definition-${ENVIRONMENT}.json"

  echo -e "${GREEN}Registering task definition for ${service_type}...${NC}"

  # Get actual secret ARNs from Secrets Manager
  local DATABASE_URL_ARN=$(aws secretsmanager describe-secret --secret-id "busrom/${ENVIRONMENT}/DATABASE_URL" --region "$AWS_REGION" --query 'ARN' --output text 2>/dev/null || echo "")
  local SESSION_SECRET_ARN=$(aws secretsmanager describe-secret --secret-id "busrom/${ENVIRONMENT}/SESSION_SECRET" --region "$AWS_REGION" --query 'ARN' --output text 2>/dev/null || echo "")
  local S3_ACCESS_KEY_ID_ARN=$(aws secretsmanager describe-secret --secret-id "busrom/${ENVIRONMENT}/S3_ACCESS_KEY_ID" --region "$AWS_REGION" --query 'ARN' --output text 2>/dev/null || echo "")
  local S3_SECRET_ACCESS_KEY_ARN=$(aws secretsmanager describe-secret --secret-id "busrom/${ENVIRONMENT}/S3_SECRET_ACCESS_KEY" --region "$AWS_REGION" --query 'ARN' --output text 2>/dev/null || echo "")
  local WEB_URL_ARN=$(aws secretsmanager describe-secret --secret-id "busrom/${ENVIRONMENT}/WEB_URL" --region "$AWS_REGION" --query 'ARN' --output text 2>/dev/null || echo "")
  local CDN_DOMAIN_ARN=$(aws secretsmanager describe-secret --secret-id "busrom/${ENVIRONMENT}/CDN_DOMAIN" --region "$AWS_REGION" --query 'ARN' --output text 2>/dev/null || echo "arn:aws:secretsmanager:${AWS_REGION}:${AWS_ACCOUNT_ID}:secret:busrom/${ENVIRONMENT}/CDN_DOMAIN")
  local API_URL_ARN=$(aws secretsmanager describe-secret --secret-id "busrom/${ENVIRONMENT}/NEXT_PUBLIC_API_URL" --region "$AWS_REGION" --query 'ARN' --output text 2>/dev/null || echo "")

  # Replace placeholders in template
  sed -e "s|ENVIRONMENT|${ENVIRONMENT}|g" \
      -e "s|AWS_ACCOUNT_ID|${AWS_ACCOUNT_ID}|g" \
      -e "s|AWS_REGION|${AWS_REGION}|g" \
      -e "s|arn:aws:secretsmanager:AWS_REGION:AWS_ACCOUNT_ID:secret:busrom/ENVIRONMENT/DATABASE_URL|${DATABASE_URL_ARN}|g" \
      -e "s|arn:aws:secretsmanager:AWS_REGION:AWS_ACCOUNT_ID:secret:busrom/ENVIRONMENT/SESSION_SECRET|${SESSION_SECRET_ARN}|g" \
      -e "s|arn:aws:secretsmanager:AWS_REGION:AWS_ACCOUNT_ID:secret:busrom/ENVIRONMENT/S3_ACCESS_KEY_ID|${S3_ACCESS_KEY_ID_ARN}|g" \
      -e "s|arn:aws:secretsmanager:AWS_REGION:AWS_ACCOUNT_ID:secret:busrom/ENVIRONMENT/S3_SECRET_ACCESS_KEY|${S3_SECRET_ACCESS_KEY_ARN}|g" \
      -e "s|arn:aws:secretsmanager:AWS_REGION:AWS_ACCOUNT_ID:secret:busrom/ENVIRONMENT/CDN_DOMAIN|${CDN_DOMAIN_ARN}|g" \
      -e "s|arn:aws:secretsmanager:AWS_REGION:AWS_ACCOUNT_ID:secret:busrom/ENVIRONMENT/WEB_URL|${WEB_URL_ARN}|g" \
      "$template_file" > "$output_file"

  # For web task definition, also replace NEXT_PUBLIC_API_URL if present
  if [ "$service_type" == "web" ] && [ -n "$API_URL_ARN" ]; then
    sed -i.bak "s|arn:aws:secretsmanager:AWS_REGION:AWS_ACCOUNT_ID:secret:busrom/ENVIRONMENT/NEXT_PUBLIC_API_URL|${API_URL_ARN}|g" "$output_file"
  fi

  # Register task definition
  aws ecs register-task-definition \
    --cli-input-json file://"$output_file" \
    --region "$AWS_REGION" \
    > /dev/null

  echo -e "${GREEN}  ✓ Task definition registered: ${PROJECT_NAME}-${service_type}-${ENVIRONMENT}${NC}"
}

# =============================================================================
# Function: Create Target Group
# =============================================================================
create_target_group() {
  local service_type=$1  # cms or web
  local port=$2
  local tg_name="${PROJECT_NAME}-${service_type}-tg-${ENVIRONMENT}"

  # Check if target group exists
  TG_ARN=$(aws elbv2 describe-target-groups \
    --names "$tg_name" \
    --region "$AWS_REGION" \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text 2>/dev/null || echo "")

  if [ -z "$TG_ARN" ] || [ "$TG_ARN" == "None" ]; then
    echo -e "${GREEN}Creating target group: $tg_name${NC}" >&2

    TG_ARN=$(aws elbv2 create-target-group \
      --name "$tg_name" \
      --protocol HTTP \
      --port "$port" \
      --vpc-id "$VPC_ID" \
      --target-type ip \
      --health-check-enabled \
      --health-check-path "/api/health" \
      --health-check-interval-seconds 30 \
      --health-check-timeout-seconds 10 \
      --healthy-threshold-count 2 \
      --unhealthy-threshold-count 3 \
      --region "$AWS_REGION" \
      --query 'TargetGroups[0].TargetGroupArn' \
      --output text)

    echo -e "${GREEN}  ✓ Created target group: $TG_ARN${NC}" >&2
  else
    echo -e "${YELLOW}  ✓ Target group already exists: $TG_ARN${NC}" >&2
  fi

  echo "$TG_ARN"
}

# =============================================================================
# Function: Create Application Load Balancer
# =============================================================================
create_alb() {
  local alb_name="${PROJECT_NAME}-alb-${ENVIRONMENT}"

  # Check if ALB exists
  ALB_ARN=$(aws elbv2 describe-load-balancers \
    --names "$alb_name" \
    --region "$AWS_REGION" \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text 2>/dev/null || echo "")

  if [ -z "$ALB_ARN" ] || [ "$ALB_ARN" == "None" ]; then
    echo -e "${GREEN}Creating Application Load Balancer...${NC}" >&2

    # Get all subnet IDs
    SUBNET_IDS=$(aws ec2 describe-subnets \
      --filters "Name=vpc-id,Values=$VPC_ID" \
      --region "$AWS_REGION" \
      --query 'Subnets[*].SubnetId' \
      --output text | tr '\t' ' ')

    ALB_ARN=$(aws elbv2 create-load-balancer \
      --name "$alb_name" \
      --subnets $SUBNET_IDS \
      --security-groups "$ALB_SG_ID" \
      --scheme internet-facing \
      --type application \
      --ip-address-type ipv4 \
      --region "$AWS_REGION" \
      --tags Key=Project,Value="$PROJECT_NAME" Key=Environment,Value="$ENVIRONMENT" \
      --query 'LoadBalancers[0].LoadBalancerArn' \
      --output text)

    echo -e "${GREEN}  ✓ Created ALB: $ALB_ARN${NC}" >&2

    # Get ALB DNS name
    ALB_DNS=$(aws elbv2 describe-load-balancers \
      --load-balancer-arns "$ALB_ARN" \
      --region "$AWS_REGION" \
      --query 'LoadBalancers[0].DNSName' \
      --output text)

    echo -e "${GREEN}  ALB DNS: $ALB_DNS${NC}" >&2
  else
    echo -e "${YELLOW}  ✓ ALB already exists: $ALB_ARN${NC}" >&2

    ALB_DNS=$(aws elbv2 describe-load-balancers \
      --load-balancer-arns "$ALB_ARN" \
      --region "$AWS_REGION" \
      --query 'LoadBalancers[0].DNSName' \
      --output text)
  fi

  echo "$ALB_ARN"
}

# =============================================================================
# Function: Create Listener
# =============================================================================
create_listener() {
  local alb_arn=$1
  local default_tg_arn=$2

  # Check if listener exists
  LISTENER_ARN=$(aws elbv2 describe-listeners \
    --load-balancer-arn "$alb_arn" \
    --region "$AWS_REGION" \
    --query 'Listeners[?Port==`80`].ListenerArn' \
    --output text 2>/dev/null || echo "")

  if [ -z "$LISTENER_ARN" ] || [ "$LISTENER_ARN" == "None" ]; then
    echo -e "${GREEN}Creating ALB listener...${NC}" >&2

    LISTENER_ARN=$(aws elbv2 create-listener \
      --load-balancer-arn "$alb_arn" \
      --protocol HTTP \
      --port 80 \
      --default-actions Type=forward,TargetGroupArn="$default_tg_arn" \
      --region "$AWS_REGION" \
      --query 'Listeners[0].ListenerArn' \
      --output text)

    echo -e "${GREEN}  ✓ Created listener: $LISTENER_ARN${NC}" >&2
  else
    echo -e "${YELLOW}  ✓ Listener already exists: $LISTENER_ARN${NC}" >&2
  fi

  echo "$LISTENER_ARN"
}

# =============================================================================
# Function: Create ECS Service
# =============================================================================
create_ecs_service() {
  local service_type=$1  # cms or web
  local port=$2
  local tg_arn=$3

  local service_name="${PROJECT_NAME}-${service_type}-${ENVIRONMENT}"

  # Check if service exists
  SERVICE_STATUS=$(aws ecs describe-services \
    --cluster "$ECS_CLUSTER" \
    --services "$service_name" \
    --region "$AWS_REGION" \
    --query 'services[0].status' \
    --output text 2>/dev/null || echo "")

  if [ "$SERVICE_STATUS" == "ACTIVE" ]; then
    echo -e "${YELLOW}  ✓ ECS service already exists: $service_name${NC}"
    return
  fi

  echo -e "${GREEN}Creating ECS service: $service_name${NC}"

  # Get subnet IDs
  SUBNET_IDS=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --region "$AWS_REGION" \
    --query 'Subnets[*].SubnetId' \
    --output text | tr '\t' ',')

  aws ecs create-service \
    --cluster "$ECS_CLUSTER" \
    --service-name "$service_name" \
    --task-definition "${PROJECT_NAME}-${service_type}-${ENVIRONMENT}" \
    --desired-count 1 \
    --launch-type FARGATE \
    --platform-version LATEST \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_IDS],securityGroups=[$ECS_SG_ID],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=$tg_arn,containerName=${PROJECT_NAME}-${service_type},containerPort=$port" \
    --health-check-grace-period-seconds 60 \
    --region "$AWS_REGION" \
    > /dev/null

  echo -e "${GREEN}  ✓ Created ECS service: $service_name${NC}"
}

# =============================================================================
# Main Execution
# =============================================================================

# 1. Register task definitions
echo -e "${GREEN}[1/5] Registering task definitions...${NC}"
register_task_definition "cms"
register_task_definition "web"
echo ""

# 2. Create target groups
echo -e "${GREEN}[2/5] Creating target groups...${NC}"
CMS_TG_ARN=$(create_target_group "cms" 3000)
WEB_TG_ARN=$(create_target_group "web" 3001)
echo ""

# 3. Create Application Load Balancer
echo -e "${GREEN}[3/5] Creating Application Load Balancer...${NC}"
ALB_ARN=$(create_alb)
echo ""

# 4. Create listener
echo -e "${GREEN}[4/5] Creating ALB listener and rules...${NC}"
LISTENER_ARN=$(create_listener "$ALB_ARN" "$WEB_TG_ARN")

# Add listener rule for CMS (host-based routing)
if [ "$ENVIRONMENT" == "production" ]; then
  CMS_HOST="cms.busrom.com"
else
  CMS_HOST="cms-staging.busrom.com"
fi

# Check if rule already exists
RULE_ARN=$(aws elbv2 describe-rules \
  --listener-arn "$LISTENER_ARN" \
  --region "$AWS_REGION" \
  --query "Rules[?Priority=='1'].RuleArn" \
  --output text 2>/dev/null || echo "")

if [ -z "$RULE_ARN" ] || [ "$RULE_ARN" == "None" ]; then
  echo -e "${GREEN}Creating listener rule for CMS (host: ${CMS_HOST})...${NC}" >&2

  aws elbv2 create-rule \
    --listener-arn "$LISTENER_ARN" \
    --priority 1 \
    --conditions Field=host-header,Values="$CMS_HOST" \
    --actions Type=forward,TargetGroupArn="$CMS_TG_ARN" \
    --region "$AWS_REGION" \
    > /dev/null

  echo -e "${GREEN}  ✓ Created listener rule for CMS${NC}" >&2
else
  echo -e "${YELLOW}  ✓ Listener rule for CMS already exists${NC}" >&2
fi

echo ""

# 5. Create ECS services
echo -e "${GREEN}[5/5] Creating ECS services...${NC}"
create_ecs_service "cms" 3000 "$CMS_TG_ARN"
create_ecs_service "web" 3001 "$WEB_TG_ARN"
echo ""

# Get ALB DNS
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns "$ALB_ARN" \
  --region "$AWS_REGION" \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

# =============================================================================
# Summary
# =============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ ECS Services Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}📝 Summary:${NC}"
echo -e "  Environment: ${ENVIRONMENT}"
echo -e "  ECS Cluster: ${ECS_CLUSTER}"
echo -e "  ALB DNS: ${ALB_DNS}"
echo -e "  CMS Target Group: ${CMS_TG_ARN}"
echo -e "  Web Target Group: ${WEB_TG_ARN}"
echo ""

echo -e "${YELLOW}🌐 Access URLs (configure DNS to point to ALB):${NC}"
if [ "$ENVIRONMENT" == "production" ]; then
  echo -e "  CMS: https://cms.busrom.com → ${ALB_DNS}"
  echo -e "  Web: https://www.busrom.com → ${ALB_DNS}"
else
  echo -e "  CMS: https://cms-staging.busrom.com → ${ALB_DNS}"
  echo -e "  Web: https://staging.busrom.com → ${ALB_DNS}"
fi
echo ""

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "  1. Configure DNS CNAME records to point to: ${ALB_DNS}"
echo -e "  2. Set up SSL certificate in ACM"
echo -e "  3. Create HTTPS listener (port 443) on the ALB"
echo -e "  4. Store environment variables in AWS Secrets Manager"
echo -e "  5. Push code to GitHub to trigger deployment"
echo ""

# Update configuration file
cat >> "$CONFIG_FILE" <<EOF

# ECS Services Configuration
ALB_ARN=${ALB_ARN}
ALB_DNS=${ALB_DNS}
CMS_TG_ARN=${CMS_TG_ARN}
WEB_TG_ARN=${WEB_TG_ARN}
CMS_SERVICE_NAME=${PROJECT_NAME}-cms-${ENVIRONMENT}
WEB_SERVICE_NAME=${PROJECT_NAME}-web-${ENVIRONMENT}
EOF

echo -e "${GREEN}✅ Configuration updated in: $CONFIG_FILE${NC}"
