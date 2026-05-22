# AWS Production Deployment Guide

## 🚀 Quick Start

Deploy Payload CMS to AWS production with complete data in 3 steps:

```bash
# 1. Configure environment
cp .env.example .env.production
# Edit .env.production with AWS credentials

# 2. Run database migrations
npm run payload migrate

# 3. Deploy all production data
npm run deploy:production
```

## 📋 Prerequisites

### 1. AWS Resources

- ✅ **RDS PostgreSQL** - Database running and accessible
- ✅ **S3 Bucket** - `busrom-media-production` with existing Keystone media files
- ✅ **ECS/Fargate** - Container running Payload CMS
- ✅ **IAM Role** - With S3 read permissions

### 2. Environment Variables

Create `.env.production` with:

```bash
# Payload Database (AWS RDS)
DATABASE_URI=postgresql://username:password@rds-endpoint.us-east-1.rds.amazonaws.com:5432/busrom_payload

# Keystone Database (if accessible from AWS)
KEYSTONE_DB_HOST=keystone-rds-endpoint.us-east-1.rds.amazonaws.com
KEYSTONE_DB_PORT=5432
KEYSTONE_DB_NAME=busrom_cms
KEYSTONE_DB_USER=busrom
KEYSTONE_DB_PASSWORD=<keystone-db-password>

# AWS S3
AWS_S3_BUCKET=busrom-media-production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
# S3_ENDPOINT - leave empty for AWS S3 (only set for MinIO)

# Payload CMS
PAYLOAD_SECRET=<generate-random-secret>
NEXT_PUBLIC_SERVER_URL=https://cms.busrom.com
```

## 🔧 Deployment Steps

### Step 1: Run Database Migrations

This creates all tables (Media, MediaCategories, MediaTags, etc.):

```bash
npm run payload migrate
```

### Step 2: Seed Base Data

Create MediaCategories and MediaTags:

```bash
npm run seed:categories
```

Expected output:
- 13 MediaCategories created (white, scene, real, size, etc.)
- 15+ MediaTags created (9 product series + color tags)

### Step 3: Deploy Production Data (Automated)

Run the master deployment script:

```bash
npm run deploy:production
```

This will:
1. ✅ Import homepage content (16 modules) - 30 seconds
2. ✅ Map ProductSeries categories (9 series) - 5 seconds
3. ✅ Create SeriesIntroItems (9 items) - 5 seconds
4. ✅ Import ~2700 media files with auto-metadata - 2-5 minutes

**Total time: ~3-6 minutes**

### Alternative: Run Individual Steps

If you need more control:

```bash
# Step 1: Homepage content
npm run import:keystone

# Step 2: ProductSeries categories
npm run import:series-categories

# Step 3: SeriesIntroItems
npm run seed:series-intro

# Step 4: Media migration with auto-metadata
npm run import:media
```

## 📊 Verification

After deployment, verify the data:

```sql
-- Check homepage modules
SELECT COUNT(*) FROM hero_banner_items;  -- Should be 9
SELECT COUNT(*) FROM series_intro_items; -- Should be 9

-- Check media
SELECT COUNT(*) FROM media WHERE status = 'active';  -- Should be ~2700+

-- Check metadata coverage
SELECT
  COUNT(*) as total,
  COUNT(primary_category_id) as with_category,
  COUNT(metadata->>'imageNumber') as with_image_number
FROM media WHERE status = 'active';
-- All should be 100%

-- Check tags coverage
SELECT COUNT(DISTINCT parent_id) as media_with_tags
FROM media_rels WHERE path = 'tags';
-- Should be ~2700 (99.6% - excluding 10 common images)
```

## 🔍 Auto-Metadata Features

The `import:media` script automatically extracts and fills metadata from **16 filename patterns**:

### Example 1: Simple White Background
```
bathroom-door-handle_white_001.jpg
```
- ✅ **Series Tag**: "Bathroom & Door Handle"
- ✅ **Category**: "white"
- ✅ **Image Number**: 1

### Example 2: White + Series Number + Color
```
bathroom-door-handle_white_s-10_gold_006.jpg
```
- ✅ **Series Tag**: "Bathroom & Door Handle"
- ✅ **Category**: "white"
- ✅ **Image Number**: 6
- ✅ **Specs**: `series = "BRS-010"`, `finish = "gold"`

### Example 3: Scene + Group + Scene Number ⭐ NEW
```
glass-standoff_scene_g-1_sn-7_007.jpg
```
- ✅ **Series Tag**: "Glass Standoff"
- ✅ **Category**: "scene"
- ✅ **Group**: 1 (metadata.group)
- ✅ **Scene Number**: 7 (metadata.sceneNumber)
- ✅ **Image Number**: 7

### Example 4: Product + Series Number
```
hidden-hook_product_s-3_002.jpg
```
- ✅ **Series Tag**: "Hidden Hook"
- ✅ **Category**: "product"
- ✅ **Image Number**: 2
- ✅ **Specs**: `series = "BRS-003"`

**Supported: 16 filename patterns** (see `scripts/MIGRATION_GUIDE.md` for complete list)

### Key Identifiers

| Identifier | Meaning | Example |
|------------|---------|---------|
| `s-X` | Product series number → `specs.series = "BRS-00X"` | s-10 → BRS-010 |
| `g-X` | Scene group → `metadata.group = X` | g-1 → group=1 |
| `sn-X` | Scene number → `metadata.sceneNumber = X` | sn-7 → sceneNumber=7 |
| Color | Surface finish → `specs.finish` | gold, brass, ss-brushed |

## 🐛 Troubleshooting

### Issue: "Cannot connect to Keystone database"

**Option A - VPC Peering** (if both databases in AWS):
- Set up VPC peering between old and new VPCs
- Update security groups to allow PostgreSQL traffic

**Option B - Bastion Host**:
- SSH tunnel through bastion: `ssh -L 5432:keystone-rds:5432 ec2-user@bastion`
- Run migration from local machine

**Option C - Database Dump** (slowest but simplest):
```bash
# Export Keystone data
pg_dump -h keystone-rds -U busrom -d busrom_cms -t '"Media"' > keystone_media.sql

# Import to temporary table in Payload DB, then migrate
```

### Issue: "S3 bucket not accessible"

Check IAM permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::busrom-media-production",
        "arn:aws:s3:::busrom-media-production/*"
      ]
    }
  ]
}
```

### Issue: "Migration too slow"

Increase batch size in `migrate-media-from-keystone-enhanced.ts`:
```typescript
// Change progress logging from every 100 to every 500
if (created % 500 === 0) {
  console.log(`Progress: ${created} created...`)
}
```

Or run migration from AWS (faster network):
```bash
# SSH into ECS task or EC2
aws ecs execute-command --cluster busrom-production --task <task-id> --interactive --command "/bin/bash"
npm run import:media
```

## 🔄 Re-Running Migration

If you need to re-run the deployment:

```sql
-- Clean up existing data (CAUTION: DESTRUCTIVE)
DELETE FROM media_metadata_specs;
DELETE FROM media_rels WHERE path = 'tags';
DELETE FROM media_locales;
DELETE FROM media;
DELETE FROM series_intro_items_locales;
DELETE FROM series_intro_items;
DELETE FROM hero_banner_items_locales;
DELETE FROM hero_banner_items;

-- Reset all globals to default
-- (manually delete via Payload CMS admin UI)
```

Then re-run:
```bash
npm run deploy:production
```

## 📈 Expected Results

After successful deployment:

| Data Type | Count | Coverage |
|-----------|-------|----------|
| HeroBannerItems | 9 | 100% |
| SeriesIntroItems | 9 | 100% |
| ProductSeries with Categories | 9 | 100% |
| Media Files | ~2,725 | 100% |
| Media with Category | ~2,725 | 100% |
| Media with Tags | ~2,715 | 99.6% |
| Media with ImageNumber | ~2,725 | 100% |
| Media with Group | ~388 | 14.2% |
| Media with SceneNumber | ~346 | 12.7% |
| Media with Specs[series] | ~446 | 16.4% |
| Media with Specs[finish] | ~159 | 5.8% |

## 🎯 Next Steps

After deployment:

1. **Test CMS Admin**: https://cms.busrom.com/admin
2. **Verify Media Picker**: Check filters work (category, tag, series number)
3. **Test SeriesIntroItems**: Images load correctly with metadata filters
4. **Configure CDN**: Set up CloudFront for media delivery
5. **Set up Backups**: RDS automated backups + S3 versioning

## 📚 Additional Documentation

- **Filename Patterns**: See `scripts/MIGRATION_GUIDE.md`
- **Media Metadata**: See `scripts/parse-media-metadata.ts`
- **Homepage Modules**: See `scripts/import-from-keystone.ts`

## 🆘 Support

If you encounter issues:

1. Check logs: `docker logs <container-id>` or CloudWatch
2. Review error messages in migration output
3. Verify environment variables are correct
4. Check database connectivity and credentials
5. Ensure S3 bucket permissions are correct
