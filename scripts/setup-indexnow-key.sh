#!/bin/bash
# =============================================================================
# IndexNow Key Setup for AWS ECS
# =============================================================================
# This script:
# 1. Creates/updates INDEXNOW_KEY in AWS Secrets Manager
# 2. Registers new ECS task definition revisions for CMS and Web
# 3. Updates ECS services to use the new revisions
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
ENVIRONMENT="${1:-production}"
INDEXNOW_KEY="${2:-}"

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo -e "${RED}Error: Environment must be 'staging' or 'production'${NC}"
  echo "Usage: $0 [environment] [optional-indexnow-key]"
  exit 1
fi

# =============================================================================
# Check AWS credentials
# =============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}IndexNow Key Setup for Busrom${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}Region: ${AWS_REGION}${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &>/dev/null; then
  echo -e "${RED}Error: AWS credentials not configured.${NC}"
  echo -e "Please configure one of the following:${NC}"
  echo "  - AWS_PROFILE environment variable"
  echo "  - AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY"
  echo "  - aws configure"
  exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}  ✓ AWS Account: ${AWS_ACCOUNT_ID}${NC}\n"

# =============================================================================
# Generate or use provided key
# =============================================================================
if [ -z "$INDEXNOW_KEY" ]; then
  echo -e "${YELLOW}Generating new IndexNow key...${NC}"
  INDEXNOW_KEY=$(openssl rand -hex 32)
else
  echo -e "${YELLOW}Using provided IndexNow key...${NC}"
fi

echo -e "${GREEN}  Key: ${INDEXNOW_KEY}${NC}\n"

# =============================================================================
# Create or update secret in AWS Secrets Manager
# =============================================================================
SECRET_NAME="${PROJECT_NAME}/${ENVIRONMENT}/INDEXNOW_KEY"
SECRET_ARN="arn:aws:secretsmanager:${AWS_REGION}:${AWS_ACCOUNT_ID}:secret:${SECRET_NAME}"

echo -e "${YELLOW}Creating/updating secret: ${SECRET_NAME}${NC}"
if aws secretsmanager describe-secret --secret-id "$SECRET_NAME" --region "$AWS_REGION" &>/dev/null; then
  aws secretsmanager update-secret \
    --secret-id "$SECRET_NAME" \
    --secret-string "$INDEXNOW_KEY" \
    --region "$AWS_REGION" \
    >/dev/null
  echo -e "${GREEN}  ✓ Secret updated${NC}\n"
else
  aws secretsmanager create-secret \
    --name "$SECRET_NAME" \
    --description "IndexNow API key for ${PROJECT_NAME} ${ENVIRONMENT}" \
    --secret-string "$INDEXNOW_KEY" \
    --region "$AWS_REGION" \
    --tags Key=Project,Value="$PROJECT_NAME" Key=Environment,Value="$ENVIRONMENT" \
    >/dev/null
  echo -e "${GREEN}  ✓ Secret created${NC}\n"
fi

# =============================================================================
# Helper: Update task definition with INDEXNOW_KEY
# =============================================================================
update_task_definition() {
  local service_type=$1
  local container_name=$2
  local task_def_family="${PROJECT_NAME}-${service_type}-${ENVIRONMENT}"
  local tmp_file="/tmp/${service_type}-td-${ENVIRONMENT}.json"
  local new_tmp_file="/tmp/${service_type}-td-${ENVIRONMENT}-new.json"

  echo -e "${YELLOW}Updating task definition: ${task_def_family}${NC}"

  # Get current task definition
  aws ecs describe-task-definition \
    --task-definition "$task_def_family" \
    --region "$AWS_REGION" \
    --query 'taskDefinition' \
    > "$tmp_file"

  # Check if INDEXNOW_KEY is already present
  local has_key
  has_key=$(python3 -c "
import json, sys
with open('$tmp_file') as f:
    td = json.load(f)
for container in td.get('containerDefinitions', []):
    if container.get('name') == '$container_name':
        for secret in container.get('secrets', []):
            if secret.get('name') == 'INDEXNOW_KEY':
                print('yes')
                sys.exit(0)
print('no')
")

  if [ "$has_key" == "yes" ]; then
    echo -e "${YELLOW}  ⊘ INDEXNOW_KEY already present in ${task_def_family}, skipping${NC}\n"
    return
  fi

  # Prepare new task definition
  python3 - <<PY
import json

with open('$tmp_file') as f:
    td = json.load(f)

# Remove fields that cannot be passed to register-task-definition
for field in [
    'taskDefinitionArn', 'revision', 'status', 'requiresAttributes',
    'placementConstraints', 'compatibilities', 'registeredAt', 'registeredBy'
]:
    td.pop(field, None)

# Add INDEXNOW_KEY secret to the specified container
added = False
for container in td.get('containerDefinitions', []):
    if container.get('name') == '$container_name':
        if 'secrets' not in container:
            container['secrets'] = []
        container['secrets'].append({
            'name': 'INDEXNOW_KEY',
            'valueFrom': '$SECRET_ARN'
        })
        added = True
        break

if not added:
    print(f"Container $container_name not found in task definition")
    exit(1)

with open('$new_tmp_file', 'w') as f:
    json.dump(td, f, indent=2)
PY

  # Register new task definition revision
  local new_revision
  new_revision=$(aws ecs register-task-definition \
    --cli-input-json "file://${new_tmp_file}" \
    --region "$AWS_REGION" \
    --query 'taskDefinition.revision' \
    --output text)

  echo -e "${GREEN}  ✓ Registered new revision: ${task_def_family}:${new_revision}${NC}\n"

  # Update ECS service to use new revision
  local service_name="${PROJECT_NAME}-${service_type}-${ENVIRONMENT}"

  echo -e "${YELLOW}Updating ECS service: ${service_name}${NC}"
  aws ecs update-service \
    --cluster "${PROJECT_NAME}-cluster-${ENVIRONMENT}" \
    --service "$service_name" \
    --task-definition "${task_def_family}:${new_revision}" \
    --force-new-deployment \
    --region "$AWS_REGION" \
    >/dev/null

  echo -e "${GREEN}  ✓ Service updated${NC}\n"
}

# =============================================================================
# Update CMS and Web task definitions
# =============================================================================
update_task_definition "payload-cms" "busrom-payload-cms"
update_task_definition "web" "busrom-web"

# =============================================================================
# Summary
# =============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ IndexNow Key Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Key:${NC} ${INDEXNOW_KEY}"
echo -e "${YELLOW}Secret ARN:${NC} ${SECRET_ARN}\n"

echo -e "${YELLOW}Verification:${NC}"
echo "  1. Wait 1-2 minutes for ECS tasks to restart"
echo "  2. Verify key file is accessible:"
echo "     https://www.busromhouse.com/${INDEXNOW_KEY}.txt"
echo "  3. Publish a blog/product in Payload CMS"
echo "  4. Check that IndexNow status changes to 'success'"
echo ""
