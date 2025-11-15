# Database Migration & Backup Guide

## 🚨 重要提醒：Keystone 数据库迁移注意事项

Keystone 6 使用 Prisma 进行数据库迁移。在生产环境中，必须非常小心处理迁移以避免数据丢失。

---

## 📋 目录
1. [数据库备份策略](#1-数据库备份策略)
2. [MinIO 文件备份策略](#2-minio-文件备份策略)
3. [Keystone 迁移安全流程](#3-keystone-迁移安全流程)
4. [AWS 部署最佳实践](#4-aws-部署最佳实践)
5. [数据恢复流程](#5-数据恢复流程)

---

## 1. 数据库备份策略

### 1.1 开发环境自动备份脚本

创建 `scripts/backup-db.sh`:

```bash
#!/bin/bash
# Database Backup Script

BACKUP_DIR="./backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/busrom_cms_$DATE.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
docker exec busrom-postgres pg_dump -U busrom -d busrom_cms > $BACKUP_FILE

# 压缩备份
gzip $BACKUP_FILE

echo "✅ Database backed up to: ${BACKUP_FILE}.gz"

# 保留最近 30 天的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### 1.2 生产环境自动备份（AWS RDS）

```bash
# 使用 AWS RDS 自动备份
# 在 RDS 设置中：
# - Backup Retention Period: 30 days
# - Automated Backup Window: 03:00-04:00 UTC
# - Copy Snapshots to Another Region: Yes (灾难恢复)
```

### 1.3 手动备份命令

```bash
# 开发环境
npm run backup:db

# 生产环境 (RDS)
aws rds create-db-snapshot \
  --db-instance-identifier busrom-prod \
  --db-snapshot-identifier busrom-manual-$(date +%Y%m%d-%H%M%S)
```

---

## 2. MinIO 文件备份策略

### 2.1 开发环境备份脚本

创建 `scripts/backup-media.sh`:

```bash
#!/bin/bash
# MinIO Media Files Backup Script

BACKUP_DIR="./backups/media"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/media_$DATE.tar.gz"

mkdir -p $BACKUP_DIR

# 使用 mc mirror 同步备份
docker exec busrom-minio sh -c \
  "mc alias set admin http://localhost:9000 minioadmin minioadmin123 && \
   mc mirror admin/busrom-media /tmp/backup"

# 从容器复制到主机
docker cp busrom-minio:/tmp/backup $BACKUP_DIR/media_$DATE

# 压缩
tar -czf $BACKUP_FILE -C $BACKUP_DIR media_$DATE
rm -rf $BACKUP_DIR/media_$DATE

echo "✅ Media files backed up to: $BACKUP_FILE"

# 保留最近 30 天的备份
find $BACKUP_DIR -name "media_*.tar.gz" -mtime +30 -delete
```

### 2.2 生产环境（AWS S3）

```bash
# S3 自动版本控制和生命周期策略
aws s3api put-bucket-versioning \
  --bucket busrom-media-prod \
  --versioning-configuration Status=Enabled

# S3 跨区域复制（灾难恢复）
aws s3api put-bucket-replication \
  --bucket busrom-media-prod \
  --replication-configuration file://replication-config.json
```

---

## 3. Keystone 迁移安全流程

### 3.1 开发环境迁移流程

```bash
# ⚠️ 迁移前必须执行的步骤

# 1. 备份数据库
npm run backup:db

# 2. 备份 MinIO 文件
npm run backup:media

# 3. 测试迁移（使用备份数据库）
npm run migrate:test

# 4. 如果测试通过，执行真实迁移
npm run migrate

# 5. 验证数据完整性
npm run verify:data
```

### 3.2 Keystone Prisma 迁移命令

**永远不要在生产环境使用以下命令：**
- ❌ `npx prisma migrate reset` - 会删除所有数据！
- ❌ `npx prisma db push` - 可能导致数据丢失！

**推荐使用：**
- ✅ `npx prisma migrate dev` - 开发环境迁移（有交互式确认）
- ✅ `npx prisma migrate deploy` - 生产环境迁移（只执行未应用的迁移）

### 3.3 创建迁移脚本

创建 `scripts/migrate-safe.sh`:

```bash
#!/bin/bash
# Safe Migration Script

set -e  # 遇到错误立即退出

echo "🔍 Starting safe migration process..."

# 1. 检查是否在生产环境
if [ "$NODE_ENV" = "production" ]; then
  echo "⚠️  PRODUCTION ENVIRONMENT DETECTED"
  read -p "Are you sure you want to proceed? (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    echo "❌ Migration cancelled"
    exit 1
  fi
fi

# 2. 备份数据库
echo "📦 Creating database backup..."
./scripts/backup-db.sh

# 3. 备份 MinIO 文件
echo "📦 Creating media backup..."
./scripts/backup-media.sh

# 4. 检查 Prisma Schema
echo "🔍 Checking Prisma schema..."
npx prisma validate

# 5. 生成迁移（仅开发环境）
if [ "$NODE_ENV" != "production" ]; then
  echo "📝 Generating migration..."
  npx prisma migrate dev --name "$1"
else
  # 6. 生产环境：仅应用已存在的迁移
  echo "🚀 Applying migrations..."
  npx prisma migrate deploy
fi

# 7. 重新生成 Prisma Client
echo "🔄 Regenerating Prisma Client..."
npx prisma generate

# 8. 验证数据完整性（可选）
echo "✅ Migration completed successfully"
echo "💾 Backups stored in:"
echo "   - Database: ./backups/database/"
echo "   - Media:    ./backups/media/"
```

使用方法：
```bash
# 开发环境
./scripts/migrate-safe.sh "add_new_field"

# 生产环境
NODE_ENV=production ./scripts/migrate-safe.sh
```

---

## 4. AWS 部署最佳实践

### 4.1 数据库（RDS PostgreSQL）

```yaml
RDS Configuration:
  - Multi-AZ Deployment: Yes (高可用)
  - Automated Backups: Enabled (30 days retention)
  - Backup Window: 03:00-04:00 UTC
  - Maintenance Window: Sunday 04:00-05:00 UTC
  - Encryption: Enabled (at rest & in transit)
  - Performance Insights: Enabled
  - Enhanced Monitoring: Enabled

Point-in-Time Recovery:
  - Enabled (可以恢复到任意时间点，最多 35 天内)
```

### 4.2 文件存储（S3）

```yaml
S3 Configuration:
  - Versioning: Enabled (防止误删)
  - Object Lock: Enabled (防止恶意删除)
  - Cross-Region Replication: Enabled (灾难恢复)
  - Lifecycle Policy:
      - Archive to Glacier after 90 days
      - Delete old versions after 365 days
  - Server-Side Encryption: AES-256
  - Access Logging: Enabled

Backup Strategy:
  - 使用 S3 版本控制保留文件历史
  - 使用 AWS Backup 定期创建快照
  - 跨区域复制到另一个 AWS 区域
```

### 4.3 应用部署（ECS/Fargate）

```yaml
Deployment Strategy:
  - Blue/Green Deployment (零停机)
  - 迁移流程:
      1. 在 Blue 环境执行数据库迁移
      2. 测试 Blue 环境
      3. 切换流量到 Blue
      4. 保留 Green 环境 24 小时（以防回滚）

Rollback Plan:
  - 数据库迁移支持回滚脚本
  - 容器镜像版本控制
  - RDS 快照可快速恢复
```

---

## 5. 数据恢复流程

### 5.1 从备份恢复数据库

```bash
# 开发环境
gunzip backups/database/busrom_cms_20241106_120000.sql.gz
docker exec -i busrom-postgres psql -U busrom -d busrom_cms < backups/database/busrom_cms_20241106_120000.sql

# 生产环境 (RDS)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier busrom-prod-restored \
  --db-snapshot-identifier busrom-prod-snapshot-20241106
```

### 5.2 从备份恢复 MinIO/S3

```bash
# 开发环境 (MinIO)
tar -xzf backups/media/media_20241106_120000.tar.gz -C /tmp
docker cp /tmp/media_20241106/. busrom-minio:/data/busrom-media/

# 生产环境 (S3)
# 使用 S3 版本控制恢复
aws s3api list-object-versions --bucket busrom-media-prod
aws s3api restore-object \
  --bucket busrom-media-prod \
  --key path/to/file.jpg \
  --version-id <version-id>
```

### 5.3 验证数据完整性

创建 `scripts/verify-data.sh`:

```bash
#!/bin/bash
# Data Integrity Verification Script

echo "🔍 Verifying data integrity..."

# 检查数据库连接
docker exec busrom-postgres psql -U busrom -d busrom_cms -c "SELECT COUNT(*) FROM \"Media\";"

# 检查 MinIO 连接
docker exec busrom-minio mc ls local/busrom-media/ | wc -l

# 检查关键表的记录数
echo "📊 Database Record Counts:"
docker exec busrom-postgres psql -U busrom -d busrom_cms -c "
  SELECT
    'Users' as table, COUNT(*) FROM \"User\"
  UNION ALL
  SELECT 'Media', COUNT(*) FROM \"Media\"
  UNION ALL
  SELECT 'Products', COUNT(*) FROM \"Product\"
  UNION ALL
  SELECT 'ProductSeries', COUNT(*) FROM \"ProductSeries\"
  UNION ALL
  SELECT 'Blogs', COUNT(*) FROM \"Blog\";
"

echo "✅ Verification completed"
```

---

## 6. 添加到 package.json

在 `package.json` 中添加以下脚本：

```json
{
  "scripts": {
    "backup:db": "bash scripts/backup-db.sh",
    "backup:media": "bash scripts/backup-media.sh",
    "backup:all": "npm run backup:db && npm run backup:media",
    "migrate:safe": "bash scripts/migrate-safe.sh",
    "verify:data": "bash scripts/verify-data.sh",
    "restore:db": "bash scripts/restore-db.sh",
    "restore:media": "bash scripts/restore-media.sh"
  }
}
```

---

## 7. 自动化定时备份（生产环境）

### 7.1 使用 AWS Backup

```yaml
AWS Backup Plan:
  Name: busrom-daily-backup
  Rules:
    - Rule 1: Daily Database Backup
      - Schedule: Daily at 03:00 UTC
      - Retention: 30 days
      - Targets: RDS busrom-prod

    - Rule 2: Weekly Full Backup
      - Schedule: Sunday at 02:00 UTC
      - Retention: 90 days
      - Targets: RDS + S3
```

### 7.2 使用 CloudWatch Events + Lambda

创建 Lambda 函数定期执行备份验证和清理任务。

---

## 8. 紧急恢复检查清单

当发生数据丢失时：

- [ ] 1. **停止所有写入操作** - 立即停止应用程序
- [ ] 2. **评估损失范围** - 检查哪些数据丢失
- [ ] 3. **确认最新备份** - 找到最近的可用备份
- [ ] 4. **通知团队** - 告知相关人员
- [ ] 5. **执行恢复** - 从备份恢复数据
- [ ] 6. **验证数据** - 确认恢复的数据完整
- [ ] 7. **恢复服务** - 重新启动应用程序
- [ ] 8. **事后分析** - 分析原因，改进流程

---

## 9. 关键提醒

### ⚠️ 永远不要在生产环境执行：
```bash
npx prisma migrate reset      # ❌ 会删除所有数据
npx prisma db push            # ❌ 可能导致数据丢失
npx prisma migrate dev        # ❌ 仅用于开发环境
docker-compose down -v        # ❌ 会删除所有卷数据
```

### ✅ 生产环境安全命令：
```bash
npx prisma migrate deploy     # ✅ 安全迁移
npx prisma generate          # ✅ 更新客户端
npx prisma validate          # ✅ 验证 schema
```

---

## 10. 清理孤立文件工具

当数据库和文件存储不同步时，使用此脚本清理孤立文件：

创建 `scripts/cleanup-orphaned-files.sh`:

```bash
#!/bin/bash
# Cleanup Orphaned Files in MinIO/S3

echo "🔍 Finding orphaned files..."

# 1. 获取数据库中所有 Media 记录的文件名
DB_FILES=$(docker exec busrom-postgres psql -U busrom -d busrom_cms -t -c \
  "SELECT filename FROM \"Media\";")

# 2. 获取 MinIO 中的所有文件
MINIO_FILES=$(docker exec busrom-minio mc ls local/busrom-media/ --json | \
  jq -r '.key')

# 3. 找出孤立文件（在 MinIO 但不在数据库中）
echo "$MINIO_FILES" | while read file; do
  if ! echo "$DB_FILES" | grep -q "$file"; then
    echo "🗑️  Orphaned file: $file"
    # 取消注释以执行删除
    # docker exec busrom-minio mc rm "local/busrom-media/$file"
  fi
done

echo "✅ Cleanup completed"
```

---

## 总结

**核心原则：**
1. **始终备份** - 在任何迁移操作前
2. **测试优先** - 先在测试环境验证
3. **渐进式部署** - 使用蓝绿部署
4. **保留回滚能力** - 至少保留 24 小时
5. **监控告警** - 实时监控迁移过程

遵循这些最佳实践，可以最大程度避免数据丢失！
