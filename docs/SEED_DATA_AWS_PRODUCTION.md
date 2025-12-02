# Seeding Data in AWS Production

This guide explains how to populate home page content data in AWS Production environment.

## Prerequisites

- AWS CLI configured with appropriate credentials
- Access to the ECS cluster and service
- Docker image already built with seed scripts included

## Method 1: Using ECS Exec (Recommended)

### Step 1: Enable ECS Exec on the Service

```bash
aws ecs update-service \
  --cluster busrom-cms-cluster \
  --service busrom-cms-service \
  --enable-execute-command \
  --region us-east-1
```

### Step 2: Get Running Task ID

```bash
# List tasks
aws ecs list-tasks \
  --cluster busrom-cms-cluster \
  --service-name busrom-cms-service \
  --region us-east-1

# Get task details
aws ecs describe-tasks \
  --cluster busrom-cms-cluster \
  --tasks <task-arn> \
  --region us-east-1
```

### Step 3: Execute Seed Script

```bash
# Seed specific module (e.g., HeroBannerItem)
aws ecs execute-command \
  --cluster busrom-cms-cluster \
  --task <task-id> \
  --container busrom-cms-container \
  --interactive \
  --command "node scripts/seed-home-content.js --module hero" \
  --region us-east-1

# Or seed all modules at once
aws ecs execute-command \
  --cluster busrom-cms-cluster \
  --task <task-id> \
  --container busrom-cms-container \
  --interactive \
  --command "node scripts/seed-home-content.js --all" \
  --region us-east-1
```

### Step 4: Verify Data

```bash
# Access Keystone Admin UI
# https://cms.busromhouse.com/admin

# Or check via ECS exec
aws ecs execute-command \
  --cluster busrom-cms-cluster \
  --task <task-id> \
  --container busrom-cms-container \
  --interactive \
  --command "/bin/sh" \
  --region us-east-1

# Then inside container:
# node -e "const fetch = require('node-fetch'); ..."
```

## Method 2: Include in Docker Image Startup (One-time)

### Option A: Add to entrypoint script

```dockerfile
# In Dockerfile or docker-entrypoint.sh
CMD ["sh", "-c", "node scripts/seed-home-content.js --all && yarn start"]
```

⚠️ **Warning**: This will run on every container start. Better to use a flag:

```bash
# Use environment variable to control seeding
if [ "$RUN_SEED" = "true" ]; then
  node scripts/seed-home-content.js --all
fi
exec yarn start
```

### Option B: Manual one-time run

Deploy with `RUN_SEED=true` environment variable once, then remove it.

## Method 3: Via Keystone Admin UI (Manual)

1. Access https://cms.busromhouse.com/admin
2. Navigate to each content type
3. Manually create records

⚠️ **Not recommended**: Too slow and error-prone for bulk data.

## Available Seed Modules

List all available modules:
```bash
node scripts/seed-home-content.js --list
```

Current modules:
- `hero` - HeroBannerItem (9 items)
- `carousel` - ProductSeriesCarousel (coming soon)
- `serviceFeatures` - ServiceFeaturesConfig (coming soon)
- `simpleCta` - SimpleCta (coming soon)
- ... (more modules)

## Troubleshooting

### Cannot connect to ECS Exec

**Problem**: `ExecuteCommandException` or connection timeout

**Solution**:
1. Verify task has `enableExecuteCommand: true`
2. Check IAM permissions for ECS Exec
3. Ensure SSM agent is running in container

```bash
# Check task definition
aws ecs describe-tasks \
  --cluster busrom-cms-cluster \
  --tasks <task-id> \
  --query 'tasks[0].enableExecuteCommand'
```

### Seed script fails with "No media found"

**Problem**: Database has no media files

**Solution**: Upload at least one media file via Keystone Admin UI first:
1. Go to https://cms.busromhouse.com/admin/media
2. Upload any image
3. Run seed script again

### GraphQL connection fails

**Problem**: `ECONNREFUSED` or timeout

**Solution**:
```bash
# Make sure Keystone is running
curl https://cms.busromhouse.com/api/health

# Check KEYSTONE_URL environment variable
echo $KEYSTONE_URL

# For ECS Exec, use localhost:
export KEYSTONE_URL=http://localhost:3000
```

## Best Practices

1. **Always backup before seeding production**
   ```bash
   # Backup database first
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```

2. **Test in staging first**
   ```bash
   # Run in staging environment
   KEYSTONE_URL=https://cms-staging.busromhouse.com node scripts/seed-home-content.js --all
   ```

3. **Seed incrementally**
   - Seed one module at a time
   - Verify each module before proceeding
   - Easier to troubleshoot issues

4. **Replace placeholder images**
   - All seeded records use placeholder images
   - Manually upload and assign correct images via Admin UI
   - Or extend seed script to upload images from S3

## Post-Seeding Steps

1. ✅ Verify data in Admin UI
2. ✅ Replace placeholder images with actual product images
3. ✅ Test frontend API endpoints
4. ✅ Verify multilingual content (EN/ZH)
5. ✅ Check all published/draft statuses

## Related Documentation

- [HOME_API_FIELD_MAPPING.md](./HOME_API_FIELD_MAPPING.md) - Field mapping specification
- [AWS_DEPLOYMENT_MIGRATIONS.md](./AWS_DEPLOYMENT_MIGRATIONS.md) - Deployment guide
- [MEDIA_UPLOAD_WORKFLOW.md](./MEDIA_UPLOAD_WORKFLOW.md) - Media management
