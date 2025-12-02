# AWS 部署与数据库迁移指南

## 概述

本文档描述了如何在AWS环境中自动执行数据库迁移，特别是针对新增的文件上传功能。

## 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │   ECS Task   │      │   ECS Task   │                     │
│  │   (CMS)      │──────│   (CMS)      │                     │
│  │              │      │              │                     │
│  │ 1. Build     │      │ 1. Build     │                     │
│  │ 2. Migrate ← │──────│ 2. Migrate ← │────┐                │
│  │ 3. Start     │      │ 3. Start     │    │                │
│  └──────────────┘      └──────────────┘    │                │
│         │                     │             │                │
│         └──────────┬──────────┘             │                │
│                    │                        │                │
│                    ▼                        ▼                │
│         ┌────────────────────┐   ┌──────────────────┐       │
│         │   RDS PostgreSQL   │   │   S3 Bucket      │       │
│         │   (Database)       │   │   (Migrations)   │       │
│         └────────────────────┘   └──────────────────┘       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 自动化迁移流程

### 1. 构建阶段（Dockerfile.cms）

```dockerfile
# Stage 3: Runner
FROM node:20-slim AS runner

# ... 省略其他步骤 ...

# 📌 关键：确保 migrations 目录被复制到镜像中
COPY --chown=keystone:nodejs cms/migrations ./cms/migrations

# 生成 Prisma Client
RUN npx prisma generate
```

**重要**: Dockerfile 已经配置好，确保 `migrations/` 目录包含在Docker镜像中。

### 2. 启动阶段（start-cms.sh）

启动脚本会自动执行迁移：

```bash
#!/bin/sh
set -e

echo "=== ABOUT TO RUN DATABASE MIGRATIONS ==="
# Run migrations in production (safe, no data loss)
npx prisma migrate deploy --schema=./schema.prisma
echo "=== DATABASE MIGRATIONS COMPLETED ==="

echo "=== STARTING KEYSTONE CMS ==="
exec npm start
```

**工作原理**:
- `prisma migrate deploy` 读取 `migrations/` 目录
- 检查数据库中的 `_prisma_migrations` 表
- 只执行尚未应用的迁移
- 不会丢失数据（与 `db push --accept-data-loss` 不同）

### 3. 迁移执行顺序

```
Container Start
    ↓
Check migrations directory
    ↓
Create symlink: prisma/migrations -> ../migrations
    ↓
Connect to RDS PostgreSQL
    ↓
Check _prisma_migrations table
    ↓
Apply pending migrations:
    - 20251117041500_add_all_missing_enums
    - 20251121000000_add_file_upload_fields  ← 新迁移
    - ... 其他待执行的迁移
    ↓
Start Keystone CMS
```

## 新迁移文件

### 文件位置

```
cms/migrations/20251121000000_add_file_upload_fields/
└── migration.sql
```

### 迁移内容

```sql
-- AlterTable: Add file upload limit fields to FormConfig
ALTER TABLE "FormConfig" ADD COLUMN IF NOT EXISTS "maxTotalFileSize" INTEGER DEFAULT 10;
ALTER TABLE "FormConfig" ADD COLUMN IF NOT EXISTS "maxFilesPerSubmission" INTEGER DEFAULT 3;
ALTER TABLE "FormConfig" ADD COLUMN IF NOT EXISTS "maxFileUploadsPerDay" INTEGER DEFAULT 10;

-- AlterTable: Add attachment fields to FormSubmission
ALTER TABLE "FormSubmission" ADD COLUMN IF NOT EXISTS "attachments" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "FormSubmission" ADD COLUMN IF NOT EXISTS "totalAttachmentSize" INTEGER DEFAULT 0;
```

**安全特性**:
- 使用 `ADD COLUMN IF NOT EXISTS` - 避免重复执行错误
- 使用 `DEFAULT` 值 - 不影响现有数据
- 向后兼容 - 旧代码仍可正常运行

## 部署流程

### 方式1: 通过 CI/CD 自动部署（推荐）

#### GitHub Actions 示例

```yaml
# .github/workflows/deploy-cms.yml
name: Deploy CMS to AWS ECS

on:
  push:
    branches: [main]
    paths:
      - 'cms/**'
      - 'Dockerfile.cms'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: busrom-cms
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -f Dockerfile.cms -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster busrom-cluster \
            --service busrom-cms-service \
            --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster busrom-cluster \
            --services busrom-cms-service
```

**流程**:
1. 代码推送到 `main` 分支
2. Docker镜像自动构建（包含新的迁移文件）
3. 推送到 ECR
4. ECS 自动更新服务
5. 新容器启动时自动运行迁移
6. CMS启动

### 方式2: 手动部署

#### 步骤1: 构建并推送Docker镜像

```bash
# 1. 登录 ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# 2. 构建镜像
docker build -f Dockerfile.cms -t busrom-cms:latest .

# 3. 标记镜像
docker tag busrom-cms:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/busrom-cms:latest

# 4. 推送镜像
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/busrom-cms:latest
```

#### 步骤2: 更新 ECS 服务

```bash
# 强制重新部署（使用最新镜像）
aws ecs update-service \
  --cluster busrom-cluster \
  --service busrom-cms-service \
  --force-new-deployment

# 等待部署完成
aws ecs wait services-stable \
  --cluster busrom-cluster \
  --services busrom-cms-service
```

#### 步骤3: 验证迁移

```bash
# 查看容器日志
aws logs tail /ecs/busrom-cms --follow

# 应该看到类似输出：
# === ABOUT TO RUN DATABASE MIGRATIONS ===
# Prisma Migrate applied the following migration(s):
# migrations/20251121000000_add_file_upload_fields
# === DATABASE MIGRATIONS COMPLETED ===
```

## 零停机部署策略

### ECS 服务配置

确保 ECS 服务配置了滚动更新：

```json
{
  "deploymentConfiguration": {
    "maximumPercent": 200,
    "minimumHealthyPercent": 100,
    "deploymentCircuitBreaker": {
      "enable": true,
      "rollback": true
    }
  }
}
```

**工作原理**:
1. ECS启动新任务（Task）
2. 新任务运行迁移（幂等性保证）
3. 新任务通过健康检查
4. 流量切换到新任务
5. 旧任务优雅关闭

### 迁移幂等性

所有迁移都使用 `IF NOT EXISTS`，确保：
- 多个容器同时启动时不会冲突
- 重复执行不会报错
- 向后兼容

## 回滚策略

### 场景1: 迁移失败

如果迁移SQL有问题：

```bash
# 1. 查看错误日志
aws logs tail /ecs/busrom-cms --since 5m

# 2. 回滚到上一个镜像版本
aws ecs update-service \
  --cluster busrom-cluster \
  --service busrom-cms-service \
  --task-definition busrom-cms:<previous-revision>

# 3. 修复迁移SQL
# 编辑 cms/migrations/20251121000000_add_file_upload_fields/migration.sql

# 4. 重新部署
```

### 场景2: 迁移成功但应用有bug

```bash
# 1. 回滚到上一个镜像
aws ecs update-service \
  --cluster busrom-cluster \
  --service busrom-cms-service \
  --task-definition busrom-cms:<previous-revision>

# 注意：数据库schema已变更，但有默认值，旧代码仍可运行
```

### 场景3: 需要回滚数据库

**不推荐**，但如果必须：

```sql
-- 连接到 RDS
psql -h <rds-endpoint> -U <username> -d busrom_cms

-- 手动删除新增的列
ALTER TABLE "FormConfig" DROP COLUMN IF EXISTS "maxTotalFileSize";
ALTER TABLE "FormConfig" DROP COLUMN IF EXISTS "maxFilesPerSubmission";
ALTER TABLE "FormConfig" DROP COLUMN IF EXISTS "maxFileUploadsPerDay";
ALTER TABLE "FormSubmission" DROP COLUMN IF EXISTS "attachments";
ALTER TABLE "FormSubmission" DROP COLUMN IF EXISTS "totalAttachmentSize";

-- 删除迁移记录
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20251121000000_add_file_upload_fields';
```

## 监控与告警

### CloudWatch 日志

关键日志模式：

```bash
# 成功的迁移
"DATABASE MIGRATIONS COMPLETED"

# 失败的迁移
"Error: P3009" # Migration已应用但失败
"Error: P3005" # 数据库schema不一致
```

### 建议的告警

```yaml
# CloudWatch Alarm
MetricName: MigrationFailure
Namespace: ECS/ContainerInsights
Statistic: Sum
Period: 300
EvaluationPeriods: 1
Threshold: 1
ComparisonOperator: GreaterThanThreshold

# 基于日志模式
FilterPattern: "Error: P3"
```

### Health Check

Dockerfile 中已配置健康检查：

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

- `start-period=90s` - 给迁移足够时间完成
- 只有通过健康检查后才接收流量

## 验证清单

部署后检查：

- [ ] ECS任务状态为 RUNNING
- [ ] CloudWatch日志显示 "DATABASE MIGRATIONS COMPLETED"
- [ ] 健康检查通过
- [ ] API `/api/health` 返回 200
- [ ] 数据库中可以看到新列：
  ```sql
  \d "FormConfig"
  \d "FormSubmission"
  ```
- [ ] 测试文件上传功能

## 常见问题

### Q1: 多个容器同时启动，会执行多次迁移吗？

**A**: 不会。Prisma使用数据库锁（advisory locks）确保同一时间只有一个进程执行迁移。

### Q2: 迁移失败会影响整个部署吗？

**A**: 会。如果迁移失败，容器会退出，ECS会重试。这是正确的行为 - 保证数据一致性。

### Q3: 可以跳过迁移直接启动吗？

**A**: 技术上可以，但强烈不推荐。如果需要：
```bash
# 修改 start-cms.sh，注释掉迁移命令
# npx prisma migrate deploy --schema=./schema.prisma
```

### Q4: 如何在staging环境测试迁移？

**A**:
1. 创建staging环境的ECS集群
2. 使用staging RDS数据库
3. 先在staging部署和测试
4. 验证成功后再部署到production

### Q5: 大型迁移（如添加索引）会阻塞服务吗？

**A**: 可能会。对于大表的操作，建议：
```sql
-- 使用 CONCURRENTLY 避免锁表
CREATE INDEX CONCURRENTLY idx_name ON "TableName"(column);

-- 或在维护窗口执行
```

## 最佳实践

1. **始终在本地测试迁移**
   ```bash
   cd cms
   npm run migrate -- --name test_migration
   ```

2. **使用描述性的迁移名称**
   ```
   ✅ 20251121000000_add_file_upload_fields
   ❌ 20251121000000_update
   ```

3. **向后兼容**
   - 新增列使用默认值
   - 不要删除列（先弃用，后删除）
   - 使用 `IF NOT EXISTS`

4. **监控迁移时间**
   - 大型迁移提前告知团队
   - 考虑在低峰期部署

5. **保留迁移文件**
   - 不要删除已部署的迁移
   - 版本控制所有迁移

## 相关文件

- `Dockerfile.cms` - CMS Docker镜像构建配置
- `cms/start-cms.sh` - 容器启动脚本（含迁移）
- `cms/migrations/` - 所有数据库迁移文件
- `cms/schema.prisma` - Prisma schema定义

## 总结

文件上传功能的迁移会在AWS部署时**自动执行**：

1. ✅ 迁移文件已包含在Docker镜像中
2. ✅ 启动脚本会自动运行 `prisma migrate deploy`
3. ✅ 迁移是幂等的（可重复执行）
4. ✅ 支持零停机部署
5. ✅ 有回滚机制

**只需正常部署新版本，迁移会自动完成！** 🚀
