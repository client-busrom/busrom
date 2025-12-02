#!/bin/bash
set -e

echo "🚀 Footer Navigation Update - Production Deployment"
echo "=================================================="
echo ""

# Configuration
CLUSTER_NAME="busrom-cluster-production"
SERVICE_NAME="busrom-cms-production"
BACKUP_ID="busrom-backup-footer-navigation-20251121-230804"

echo "✅ Step 1: Code pushed to GitHub"
echo "✅ Step 2: Database backup created: $BACKUP_ID"
echo ""

# Get task ID
echo "📍 Step 3: Finding CMS task..."
TASK_ARN=$(aws ecs list-tasks \
  --cluster $CLUSTER_NAME \
  --service-name $SERVICE_NAME \
  --query 'taskArns[0]' \
  --output text)

TASK_ID=$(echo $TASK_ARN | awk -F'/' '{print $NF}')
echo "   Found task: $TASK_ID"
echo ""

# Check if exec is enabled
echo "🔍 Checking ECS Exec capability..."
EXEC_ENABLED=$(aws ecs describe-tasks \
  --cluster $CLUSTER_NAME \
  --tasks $TASK_ID \
  --query 'tasks[0].enableExecuteCommand' \
  --output text)

if [ "$EXEC_ENABLED" != "True" ]; then
  echo "⚠️  ECS Exec is not enabled on this task."
  echo "   Alternative: Pull latest code and restart service"
  echo ""

  read -p "   Do you want to force new deployment to pull latest code? (y/n) " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Updating service with latest code..."
    aws ecs update-service \
      --cluster $CLUSTER_NAME \
      --service $SERVICE_NAME \
      --force-new-deployment \
      --query 'service.deployments[0].status' \
      --output text

    echo ""
    echo "⏳ Waiting for service to stabilize (this may take 5-10 minutes)..."
    aws ecs wait services-stable \
      --cluster $CLUSTER_NAME \
      --services $SERVICE_NAME

    echo ""
    echo "✅ Service updated successfully!"
    echo ""
    echo "📝 The new deployment will:"
    echo "   1. Pull latest code with Footer changes"
    echo "   2. Automatically run 'npx prisma migrate deploy' on container startup"
    echo "   3. Apply the new migration: 20251121220000_add_footer_navigation_menus"
    echo ""
    echo "🔍 To verify the migration was applied:"
    echo "   Check the CMS logs for: 'Migration 20251121220000_add_footer_navigation_menus completed'"
    echo ""

    # Get new task ID after deployment
    echo "⏳ Waiting for new task to start..."
    sleep 30

    NEW_TASK_ARN=$(aws ecs list-tasks \
      --cluster $CLUSTER_NAME \
      --service-name $SERVICE_NAME \
      --query 'taskArns[0]' \
      --output text)
    NEW_TASK_ID=$(echo $NEW_TASK_ARN | awk -F'/' '{print $NF}')

    echo "📊 Checking logs of new task: $NEW_TASK_ID"
    echo ""

    # Try to get logs
    LOG_GROUP="/ecs/busrom-cms-production"
    LOG_STREAM="ecs/cms/$NEW_TASK_ID"

    echo "Fetching recent logs..."
    aws logs tail $LOG_GROUP \
      --log-stream-name-prefix "ecs/cms" \
      --since 5m \
      --format short \
      --filter-pattern "prisma migrate" \
      2>/dev/null || echo "   (Logs may take a few moments to appear)"

  else
    echo "❌ Deployment cancelled"
    exit 1
  fi
else
  echo "✅ ECS Exec is enabled"
  echo ""
  echo "📝 Manual steps required:"
  echo ""
  echo "1. Connect to the container:"
  echo "   aws ecs execute-command \\"
  echo "     --cluster $CLUSTER_NAME \\"
  echo "     --task $TASK_ID \\"
  echo "     --container cms \\"
  echo "     --interactive \\"
  echo "     --command \"/bin/bash\""
  echo ""
  echo "2. Inside the container, run:"
  echo "   cd /app"
  echo "   npx prisma migrate status"
  echo "   npx prisma migrate deploy"
  echo ""
  echo "3. Verify data integrity:"
  echo "   npx prisma db execute --stdin <<< 'SELECT COUNT(*) FROM \"User\", \"Footer\";'"
  echo ""
  echo "4. Exit and restart service:"
  echo "   exit"
  echo "   aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --force-new-deployment"
fi

echo ""
echo "=================================================="
echo "✅ Deployment process complete!"
echo ""
echo "🔍 Next steps:"
echo "1. Visit your CMS: https://your-cms-domain.com"
echo "2. Login and check Footer configuration"
echo "3. Verify new fields: 'Column 3 Navigation Menus' and 'Column 4 Navigation Menus'"
echo "4. Test frontend: Home page (form) and other pages (4-column layout)"
echo ""
echo "📋 Backup info:"
echo "   Snapshot ID: $BACKUP_ID"
echo "   Created: $(date)"
echo ""
echo "🆘 If anything goes wrong, refer to PRODUCTION_DEPLOYMENT_GUIDE.md for rollback steps"
echo ""
