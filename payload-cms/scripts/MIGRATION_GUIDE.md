# Media Migration Guide

## Overview

This guide explains how to migrate media files from Keystone CMS to Payload CMS with automatic metadata enrichment based on filename parsing rules.

## Scripts

### 1. `migrate-media-from-keystone-enhanced.ts`

**Purpose**: Import media files from Keystone database to Payload database, automatically filling metadata based on filename patterns.

**Features**:
- ✅ Reads media records from Keystone PostgreSQL
- ✅ Creates media records in Payload PostgreSQL
- ✅ Points to existing S3 files (no re-upload)
- ✅ **Auto-parses filenames** to extract metadata (16 formats supported)
- ✅ **Auto-fills** category, tags, imageNumber, group, sceneNumber, specs
- ✅ Supports both MinIO (local dev) and AWS S3 (production)

**Command**:
```bash
npm run import:media
```

## Environment Configuration

### Local Development (MinIO)

```bash
# Keystone Database
KEYSTONE_DB_HOST=localhost
KEYSTONE_DB_PORT=5432
KEYSTONE_DB_NAME=busrom_cms
KEYSTONE_DB_USER=busrom
KEYSTONE_DB_PASSWORD=busrom_dev_password

# Payload Database
DATABASE_URI=postgresql://busrom_dev:busrom_dev_password@localhost:5432/busrom_payload

# S3 Configuration (MinIO)
AWS_S3_BUCKET=busrom-media
S3_ENDPOINT=http://localhost:9000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
```

### AWS Production

```bash
# Keystone Database (if accessible)
KEYSTONE_DB_HOST=<RDS-endpoint>
KEYSTONE_DB_PORT=5432
KEYSTONE_DB_NAME=busrom_cms
KEYSTONE_DB_USER=busrom
KEYSTONE_DB_PASSWORD=<production-password>

# Payload Database
DATABASE_URI=postgresql://<user>:<password>@<rds-endpoint>:5432/busrom_payload

# S3 Configuration (AWS)
AWS_S3_BUCKET=busrom-media-production
# S3_ENDPOINT - leave empty for AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<aws-access-key>
AWS_SECRET_ACCESS_KEY=<aws-secret-key>
```

## Filename Parsing Rules (16 Formats)

The script automatically extracts metadata from filenames using these patterns:

### 1. **Simple White Background**
```
{series}_white_{number}.jpg
Example: glass-standoff_white_122.jpg

Extracts:
- Series: glass-standoff → Tag: "Glass Standoff"
- Category: white
- Image Number: 122
```

### 2. **White + Shape/Angle**
```
{series}_white_{shape/angle}_{number}.jpg
Example: bathroom-glass-clip_white_135deg_014.jpg
Example: glass-fence-spigot_white_square_033.jpg

Extracts:
- Series: bathroom-glass-clip
- Category: white
- Image Number: 14
```

### 3. **White + Main Subtype**
```
{series}_white_main_{subtype}_{number}.jpg
Example: bathroom-door-handle_white_main_cylinder_018.jpg

Extracts:
- Series: bathroom-door-handle
- Category: white
- Image Number: 18
```

### 4. **White + Multi-Level**
```
{series}_white_{shape}_{type}_{number}.jpg
Example: glass-hinge_white_180deg_straight_040.jpg

Extracts:
- Series: glass-hinge
- Category: white
- Image Number: 40
```

### 5. **White + Series Number**
```
{series}_white_s-{seriesNum}_{number}.jpg
Example: bathroom-door-handle_white_s-19_009.jpg

Extracts:
- Series: bathroom-door-handle
- Category: white
- Image Number: 9
- **Specs**: series = "BRS-019"
```

### 6. **White + Series Number + Color**
```
{series}_white_s-{seriesNum}_{color}_{number}.jpg
Example: bathroom-door-handle_white_s-10_gold_006.jpg

Extracts:
- Series: bathroom-door-handle
- Category: white
- Image Number: 6
- **Specs**: series = "BRS-010", finish = "gold"
```

### 7. **Scene + Letter (Simple)**
```
{series}_scene_{letter}_{number}.jpg
Example: hidden-hook_scene_n_010.jpg

Extracts:
- Series: hidden-hook
- Category: scene
- Image Number: 10
```

### 8. **Scene + Group + Scene Number** ⭐ NEW
```
{series}_scene_g-{group}_sn-{sceneNum}_{number}.jpg
Example: glass-standoff_scene_g-1_sn-7_007.jpg

Extracts:
- Series: glass-standoff
- Category: scene
- **Group**: 1 (metadata.group)
- **Scene Number**: 7 (metadata.sceneNumber)
- **Image Number**: 7 (metadata.imageNumber)
```

### 9. **Scene + Scene Number Only** ⭐ NEW
```
{series}_scene_sn-{sceneNum}_{number}.jpg
Example: guardrail-glass-clip_scene_sn-6_010.jpg

Extracts:
- Series: guardrail-glass-clip
- Category: scene
- **Scene Number**: 6
- Image Number: 10
```

### 10. **Scene + Type + Series Number**
```
{series}_scene_{sceneType}_s-{seriesNum}_{number}.jpg
Example: bathroom-door-handle_scene_door_s-6_003.jpg

Extracts:
- Series: bathroom-door-handle
- Category: scene
- Image Number: 3
- **Specs**: series = "BRS-006"
```

### 11. **Scene + Group + Other**
```
{series}_scene_g-{group}_{other}_{number}.jpg
Example: sliding-door-kit_scene_g-1_other_008.jpg

Extracts:
- Series: sliding-door-kit
- Category: scene
- **Group**: 1
- Image Number: 8
```

### 12. **Product Type**
```
{series}_product_{number}.jpg
Example: hidden-hook_product_010.jpg

Extracts:
- Series: hidden-hook
- Category: product
- Image Number: 10
```

### 13. **Product + Series Number**
```
{series}_product_s-{seriesNum}_{number}.jpg
Example: hidden-hook_product_s-1_001.jpg

Extracts:
- Series: hidden-hook
- Category: product
- Image Number: 1
- **Specs**: series = "BRS-001"
```

### 14. **Other Types (Real/Size/General)**
```
{series}_{type}_{number}.jpg
Example: glass-connected-fitting_real_027.jpg
Example: glass-hinge_general_014.jpg

Extracts:
- Series: glass-connected-fitting
- Category: real/general/size
- Image Number: 27
```

### 15. **Complex Guardrail Variants**
```
{series}_white_guardrail_{shape}_{type}_{number}.jpg
Example: guardrail-glass-clip_white_guardrail_flat_angles_007.jpg

Extracts:
- Series: guardrail-glass-clip
- Category: white
- Image Number: 7
```

### 16. **Common Images** (No Series)
```
common_{type}_{number}.ext
Example: common_color_001.png

Extracts:
- Category: color
- Image Number: 1
- **NO TAG** (common images don't belong to product series)
```

## Key Identifiers

| Identifier | Meaning | Storage Location | Example |
|------------|---------|------------------|---------|
| **s-X** | Product series number | `metadata.specs[series]` = "BRS-00X" | s-10 → BRS-010 |
| **g-X** | Scene group number | `metadata.group` = X | g-1 → group=1 |
| **sn-X** | Scene number | `metadata.sceneNumber` = X | sn-7 → sceneNumber=7 |
| **color** | Surface finish/color | `metadata.specs[finish]` | gold, brass, ss-brushed |
| **n** | Single letter scene ID | Not stored | Format identifier only |
| **_main_** | Main type layer | Not stored | Format identifier only |

## Series Mapping

| Filename Slug | MediaTag Name |
|---------------|---------------|
| `glass-standoff` | Glass Standoff |
| `glass-connected-fitting` | Glass Connected Fitting |
| `glass-fence-spigot` | Glass Fence Spigot |
| `guardrail-glass-clip` | Guardrail Glass Clip |
| `bathroom-glass-clip` | Bathroom Glass Clip |
| `glass-hinge` | Glass Hinge |
| `sliding-door-kit` | Sliding Door Kit |
| `bathroom-door-handle` | Bathroom & Door Handle |
| `hidden-hook` | Hidden Hook |

## Category Mapping

| Filename Type | MediaCategory Name |
|---------------|-------------------|
| `white` | white |
| `scene` | scene |
| `real` | real |
| `size` | size |
| `general` | general |
| `combo` | combo |
| `multi-style` | multi-style |
| `showcase` | showcase |
| `effect` | effect |
| `product` | product |
| `craft` | craft |
| `packaging` | packaging |
| `color` | color |

## Deployment Steps

### AWS Production Deployment

1. **Ensure MediaCategories and MediaTags Exist**
   ```bash
   # Run seed script to create categories and tags
   npm run seed:categories
   ```

2. **Configure Environment Variables**
   - Set all AWS environment variables in ECS task definition or `.env`
   - Ensure DATABASE_URI points to production RDS
   - Ensure AWS credentials have S3 read permissions

3. **Run Migration**
   ```bash
   npm run import:media
   ```

4. **Verify Results**
   ```sql
   -- Check total media
   SELECT COUNT(*) FROM media WHERE status = 'active';

   -- Check category coverage
   SELECT COUNT(*) as with_category FROM media WHERE primary_category_id IS NOT NULL;

   -- Check tag coverage
   SELECT COUNT(DISTINCT parent_id) as with_tags FROM media_rels WHERE path = 'tags';

   -- Check metadata coverage
   SELECT
     COUNT(*) as total,
     COUNT(metadata_image_number) as with_image_number,
     COUNT(metadata_group) as with_group,
     COUNT(metadata_scene_number) as with_scene_number
   FROM media WHERE status = 'active';
   ```

## Expected Results

Based on testing with 2,725 media files:

| Field | Count | Coverage |
|-------|-------|----------|
| **primaryCategory** | 2,725 | 100% |
| **metadata.imageNumber** | 2,725 | 100% |
| **tags** | 2,715 | 99.6% (10 common images excluded) |
| **metadata.group** | 388 | 14.2% (scene images with g-X format) |
| **metadata.sceneNumber** | 346 | 12.7% (scene images with sn-X format) |
| **metadata.specs[series]** | 446 | 16.4% (files with s-X format) |
| **metadata.specs[finish]** | 159 | 5.8% (files with color info) |

## Troubleshooting

### Issue: "Category not found"
**Solution**: Run `npm run seed:categories` first to create all MediaCategories.

### Issue: "Tag not found for series"
**Solution**: Ensure MediaTags exist for all 9 product series. Check with:
```sql
SELECT name FROM media_tags ORDER BY name;
```

### Issue: "Cannot connect to Keystone database"
**Solution**:
- For local: Ensure Keystone PostgreSQL container is running
- For AWS: Ensure RDS security group allows connection from ECS

### Issue: "S3 URL incorrect"
**Solution**:
- Local: Set `S3_ENDPOINT=http://localhost:9000`
- AWS: Leave `S3_ENDPOINT` empty to use AWS S3

## Performance

- **Speed**: ~50-100 media records per second
- **Progress**: Logs every 100 records
- **Error Handling**: Continues on errors, logs first 10 errors
- **Idempotent**: Skips existing filenames, can re-run safely

## Manual Cleanup (if needed)

If you need to re-run the migration from scratch:

```sql
-- Delete all media records
DELETE FROM media_metadata_specs;
DELETE FROM media_rels WHERE path = 'tags';
DELETE FROM media_locales;
DELETE FROM media;

-- Reset sequences
ALTER SEQUENCE media_id_seq RESTART WITH 1;
```

Then re-run:
```bash
npm run import:media
```
