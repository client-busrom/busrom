#!/bin/bash

# Fix failed migration in production database
# This script marks the failed migration as applied (does NOT delete any data)
# The migration failed because the type already exists, so it's safe to mark as applied

set -e

echo "================================================"
echo "Fix Production Database Migration"
echo "================================================"
echo ""
echo "This will mark migration 20251104114034_navigation_menu_media_tags as applied"
echo "NO DATA WILL BE DELETED - only fixing migration records"
echo ""

# Get the latest task definition
TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition busrom-cms-production \
  --region us-east-1 \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "Using task definition: $TASK_DEF"

# Get VPC configuration from the service
SERVICE_INFO=$(aws ecs describe-services \
  --cluster busrom-cluster-production \
  --services busrom-cms-production \
  --region us-east-1)

SUBNETS=$(echo $SERVICE_INFO | jq -r '.services[0].networkConfiguration.awsvpcConfiguration.subnets | join(",")')
SECURITY_GROUPS=$(echo $SERVICE_INFO | jq -r '.services[0].networkConfiguration.awsvpcConfiguration.securityGroups | join(",")')

echo "Network config:"
echo "  Subnets: $SUBNETS"
echo "  Security Groups: $SECURITY_GROUPS"
echo ""

# Get DATABASE_URL from secrets
DATABASE_URL=$(aws secretsmanager get-secret-value \
  --secret-id busrom/production/DATABASE_URL \
  --region us-east-1 \
  --query SecretString \
  --output text)

echo "Running migration fix task..."
echo ""

# Run a one-off task to fix the migration
TASK_ARN=$(aws ecs run-task \
  --cluster busrom-cluster-production \
  --task-definition busrom-cms-production \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SECURITY_GROUPS],assignPublicIp=DISABLED}" \
  --overrides "{
    \"containerOverrides\": [{
      \"name\": \"busrom-cms\",
      \"command\": [\"sh\", \"-c\", \"echo 'Fixing migration...' && npx prisma migrate resolve --applied 20251104114034_navigation_menu_media_tags && echo 'Checking status...' && npx prisma migrate status\"],
      \"environment\": [{
        \"name\": \"DATABASE_URL\",
        \"value\": \"$DATABASE_URL\"
      }]
    }]
  }" \
  --region us-east-1 \
  --query 'tasks[0].taskArn' \
  --output text)

echo "Task started: $TASK_ARN"
echo ""
echo "Waiting for task to complete (this may take a few minutes)..."
echo "You can also check the logs in CloudWatch: /ecs/busrom-cms-production"
echo ""

# Wait for task to complete
aws ecs wait tasks-stopped \
  --cluster busrom-cluster-production \
  --tasks $TASK_ARN \
  --region us-east-1

# Check task exit code
EXIT_CODE=$(aws ecs describe-tasks \
  --cluster busrom-cluster-production \
  --tasks $TASK_ARN \
  --region us-east-1 \
  --query 'tasks[0].containers[0].exitCode' \
  --output text)

echo ""
echo "================================================"
if [ "$EXIT_CODE" = "0" ]; then
  echo "✓ Migration fix completed successfully!"
  echo "The GitHub Action deployment should now proceed."
else
  echo "✗ Migration fix failed with exit code: $EXIT_CODE"
  echo "Check CloudWatch logs for details: /ecs/busrom-cms-production"
fi
echo "================================================"
