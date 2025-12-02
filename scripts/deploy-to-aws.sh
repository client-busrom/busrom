#!/bin/bash
set -e

# ============================================
# AWS ECS Deployment Script
# ============================================
# Builds and deploys the CMS to AWS ECS
#
# Usage:
#   ./scripts/deploy-to-aws.sh [environment]
#
# Examples:
#   ./scripts/deploy-to-aws.sh staging
#   ./scripts/deploy-to-aws.sh production

ENVIRONMENT=${1:-production}
REGION="us-east-1"
ECR_REPO_NAME="busrom-cms"
ECS_CLUSTER="busrom-cluster"
ECS_SERVICE="busrom-cms-service"

echo "=================================================="
echo "  Deploying CMS to AWS ECS ($ENVIRONMENT)"
echo "=================================================="

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
IMAGE_URI="${ECR_REGISTRY}/${ECR_REPO_NAME}:latest"

echo ""
echo "Configuration:"
echo "  Environment:  $ENVIRONMENT"
echo "  Region:       $REGION"
echo "  Account ID:   $ACCOUNT_ID"
echo "  Image URI:    $IMAGE_URI"
echo ""

# Step 1: Login to ECR
echo "Step 1/5: Logging in to Amazon ECR..."
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ECR_REGISTRY
echo "✓ Logged in to ECR"

# Step 2: Build Docker image
echo ""
echo "Step 2/5: Building Docker image..."
docker build -f Dockerfile.cms -t ${ECR_REPO_NAME}:latest .
echo "✓ Image built successfully"

# Step 3: Tag image
echo ""
echo "Step 3/5: Tagging image..."
docker tag ${ECR_REPO_NAME}:latest $IMAGE_URI
echo "✓ Image tagged: $IMAGE_URI"

# Step 4: Push to ECR
echo ""
echo "Step 4/5: Pushing image to ECR..."
docker push $IMAGE_URI
echo "✓ Image pushed to ECR"

# Step 5: Update ECS service
echo ""
echo "Step 5/5: Updating ECS service..."
aws ecs update-service \
  --cluster $ECS_CLUSTER \
  --service $ECS_SERVICE \
  --force-new-deployment \
  --region $REGION \
  > /dev/null

echo "✓ ECS service update initiated"

echo ""
echo "=================================================="
echo "  Deployment Started Successfully!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "  1. Wait for deployment to complete (5-10 minutes)"
echo "  2. Monitor deployment status:"
echo "     aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE"
echo ""
echo "  3. Check container logs:"
echo "     aws logs tail /ecs/busrom-cms --follow"
echo ""
echo "  4. Verify migrations:"
echo "     Look for: 'DATABASE MIGRATIONS COMPLETED'"
echo ""
echo "  5. Test the application:"
echo "     https://cms.busrom.com/api/health"
echo ""
echo "=================================================="

# Optional: Wait for deployment to stabilize
read -p "Wait for deployment to complete? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Waiting for service to stabilize (this may take several minutes)..."
    aws ecs wait services-stable \
      --cluster $ECS_CLUSTER \
      --services $ECS_SERVICE \
      --region $REGION

    echo ""
    echo "✓ Deployment completed successfully!"
    echo ""

    # Show recent logs
    echo "Recent logs:"
    aws logs tail /ecs/busrom-cms --since 2m
fi
