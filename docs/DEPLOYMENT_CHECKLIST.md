# 文件上传功能部署检查清单

## 部署前检查

### 本地环境

- [ ] **运行数据库迁移**
  ```bash
  cd cms
  npm run migrate
  ```

- [ ] **验证Schema变更**
  ```bash
  # 检查 FormConfig 表
  psql -d busrom_cms -c "\d FormConfig"
  # 应该看到: maxTotalFileSize, maxFilesPerSubmission, maxFileUploadsPerDay

  # 检查 FormSubmission 表
  psql -d busrom_cms -c "\d FormSubmission"
  # 应该看到: attachments, totalAttachmentSize
  ```

- [ ] **测试文件上传功能**
  - 创建一个包含 file 字段的表单
  - 上传测试文件
  - 验证文件保存到 S3
  - 验证表单提交包含附件信息

### 代码检查

- [ ] **确认所有文件已提交**
  ```bash
  git status
  # 应该包含:
  # - cms/schemas/FormConfig.ts (修改)
  # - cms/schemas/FormSubmission.ts (修改)
  # - cms/custom-fields/FormFieldsConfigField.tsx (修改)
  # - web/components/forms/DynamicForm.tsx (修改)
  # - web/app/api/form-file-upload/route.ts (新建)
  # - web/app/api/form-submissions/route.ts (修改)
  # - cms/migrations/20251121000000_add_file_upload_fields/migration.sql (新建)
  # - cms/start-cms.sh (修改)
  ```

- [ ] **验证启动脚本**
  ```bash
  cat cms/start-cms.sh | grep "migrate deploy"
  # 应该看到: npx prisma migrate deploy --schema=./schema.prisma
  ```

## AWS环境检查

### S3 配置

- [ ] **验证 S3 Bucket 存在**
  ```bash
  aws s3 ls s3://busrom-media/
  ```

- [ ] **设置 Bucket Policy（公开读取）**
  ```bash
  aws s3api put-bucket-policy \
    --bucket busrom-media \
    --policy file://s3-bucket-policy.json
  ```

  `s3-bucket-policy.json`:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::busrom-media/form-attachments/*"
      }
    ]
  }
  ```

- [ ] **配置 Lifecycle Policy（自动清理）**
  ```bash
  aws s3api put-bucket-lifecycle-configuration \
    --bucket busrom-media \
    --lifecycle-configuration file://s3-lifecycle.json
  ```

  `s3-lifecycle.json`:
  ```json
  {
    "Rules": [
      {
        "Id": "DeleteOldFormAttachments",
        "Status": "Enabled",
        "Filter": {
          "Prefix": "form-attachments/"
        },
        "Expiration": {
          "Days": 90
        },
        "Transitions": [
          {
            "Days": 30,
            "StorageClass": "STANDARD_IA"
          }
        ]
      }
    ]
  }
  ```

### RDS 配置

- [ ] **确认数据库连接**
  ```bash
  # 从本地测试连接
  psql -h <rds-endpoint> -U <username> -d busrom_cms -c "SELECT version();"
  ```

- [ ] **检查迁移历史**
  ```bash
  psql -h <rds-endpoint> -U <username> -d busrom_cms -c "SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;"
  ```

### ECS 配置

- [ ] **验证任务定义包含正确的环境变量**
  ```bash
  aws ecs describe-task-definition \
    --task-definition busrom-cms:latest \
    --query 'taskDefinition.containerDefinitions[0].environment'
  ```

  必需的环境变量:
  - `DATABASE_URL`
  - `S3_BUCKET_NAME`
  - `S3_REGION`
  - `S3_ACCESS_KEY_ID`
  - `S3_SECRET_ACCESS_KEY`
  - `CDN_DOMAIN` (可选，用于CloudFront)

- [ ] **检查服务配置**
  ```bash
  aws ecs describe-services \
    --cluster busrom-cluster \
    --services busrom-cms-service
  ```

  验证:
  - `desiredCount` >= 1
  - `minimumHealthyPercent` = 100 (零停机)
  - `maximumPercent` = 200

## 部署步骤

### 方式A: 使用 CI/CD（推荐）

- [ ] **推送代码到主分支**
  ```bash
  git add .
  git commit -m "feat: Add file upload functionality with security controls"
  git push origin main
  ```

- [ ] **监控 GitHub Actions**
  - 访问: https://github.com/your-org/busrom-work/actions
  - 等待构建完成
  - 等待部署完成

### 方式B: 手动部署

- [ ] **构建并推送 Docker 镜像**
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

- [ ] **更新 ECS 服务**
  ```bash
  aws ecs update-service \
    --cluster busrom-cluster \
    --service busrom-cms-service \
    --force-new-deployment
  ```

- [ ] **等待部署完成**
  ```bash
  aws ecs wait services-stable \
    --cluster busrom-cluster \
    --services busrom-cms-service
  ```

## 部署后验证

### 检查容器日志

- [ ] **查看迁移日志**
  ```bash
  aws logs tail /ecs/busrom-cms --follow --since 5m
  ```

  应该看到:
  ```
  === ABOUT TO RUN DATABASE MIGRATIONS ===
  Prisma Migrate applied the following migration(s):
  migrations/20251121000000_add_file_upload_fields
  === DATABASE MIGRATIONS COMPLETED ===
  === STARTING KEYSTONE CMS ===
  ```

- [ ] **检查是否有错误**
  ```bash
  aws logs filter-log-events \
    --log-group-name /ecs/busrom-cms \
    --start-time $(date -u -d '5 minutes ago' +%s)000 \
    --filter-pattern "Error"
  ```

### 验证数据库

- [ ] **连接到生产数据库**
  ```bash
  psql -h <rds-endpoint> -U <username> -d busrom_cms
  ```

- [ ] **检查新列是否存在**
  ```sql
  -- 检查 FormConfig
  SELECT column_name, data_type, column_default
  FROM information_schema.columns
  WHERE table_name = 'FormConfig'
  AND column_name IN ('maxTotalFileSize', 'maxFilesPerSubmission', 'maxFileUploadsPerDay');

  -- 检查 FormSubmission
  SELECT column_name, data_type, column_default
  FROM information_schema.columns
  WHERE table_name = 'FormSubmission'
  AND column_name IN ('attachments', 'totalAttachmentSize');
  ```

- [ ] **验证迁移记录**
  ```sql
  SELECT migration_name, finished_at, success
  FROM _prisma_migrations
  WHERE migration_name = '20251121000000_add_file_upload_fields';
  ```

### 功能测试

- [ ] **访问 CMS 后台**
  - URL: https://cms.busrom.com (或你的域名)
  - 登录管理员账号

- [ ] **创建测试表单**
  1. 进入 Form Configurations
  2. 创建新表单
  3. 添加 file 字段
  4. 配置文件上传限制
  5. 发布表单

- [ ] **测试文件上传**
  1. 在前端页面打开表单
  2. 选择并上传文件
  3. 提交表单
  4. 检查 CMS 后台是否收到提交（含附件）

- [ ] **验证文件存储**
  ```bash
  aws s3 ls s3://busrom-media/form-attachments/ --recursive
  ```

- [ ] **测试文件访问**
  - 复制文件URL
  - 在浏览器中打开
  - 应该可以下载/查看文件

### 安全测试

- [ ] **测试文件大小限制**
  - 尝试上传超过限制的文件（应被拒绝）

- [ ] **测试文件类型限制**
  - 尝试上传不允许的文件类型（应被拒绝）

- [ ] **测试速率限制**
  - 短时间内上传多个文件
  - 超过限制后应返回 429 错误

- [ ] **测试文件名安全**
  - 尝试特殊字符文件名
  - 应被安全处理

### 性能监控

- [ ] **检查 CloudWatch 指标**
  ```bash
  aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name CPUUtilization \
    --dimensions Name=ServiceName,Value=busrom-cms-service \
    --start-time $(date -u -d '1 hour ago' --iso-8601=seconds) \
    --end-time $(date -u --iso-8601=seconds) \
    --period 300 \
    --statistics Average
  ```

- [ ] **检查内存使用**
  ```bash
  aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name MemoryUtilization \
    --dimensions Name=ServiceName,Value=busrom-cms-service \
    --start-time $(date -u -d '1 hour ago' --iso-8601=seconds) \
    --end-time $(date -u --iso-8601=seconds) \
    --period 300 \
    --statistics Average
  ```

## 回滚计划（如果需要）

### 情况1: 迁移失败

- [ ] **检查错误日志**
  ```bash
  aws logs tail /ecs/busrom-cms --since 10m | grep -A 10 "Error"
  ```

- [ ] **回滚到上一个镜像**
  ```bash
  # 查找上一个任务定义版本
  aws ecs list-task-definitions --family-prefix busrom-cms --sort DESC --max-items 5

  # 回滚
  aws ecs update-service \
    --cluster busrom-cluster \
    --service busrom-cms-service \
    --task-definition busrom-cms:<previous-version>
  ```

### 情况2: 应用运行但功能有问题

- [ ] **禁用文件上传字段**
  - 在 CMS 中编辑表单
  - 临时移除 file 字段
  - 发布更新

- [ ] **或回滚代码**
  ```bash
  git revert HEAD
  git push origin main
  # 等待 CI/CD 重新部署
  ```

## 部署后清理

- [ ] **验证旧任务已停止**
  ```bash
  aws ecs list-tasks \
    --cluster busrom-cluster \
    --service-name busrom-cms-service
  ```

- [ ] **检查S3存储成本**
  ```bash
  aws s3 ls s3://busrom-media/form-attachments/ --recursive --summarize
  ```

- [ ] **设置告警**
  - S3 存储超过阈值
  - 上传失败率过高
  - 容器重启频繁

## 文档更新

- [ ] **更新运维文档**
  - 记录新的环境变量
  - 更新架构图
  - 添加故障排查指南

- [ ] **通知团队**
  - 新功能已上线
  - 如何使用文件上传
  - 限制和配置说明

## 总结

完成所有检查项后，文件上传功能应该：

✅ 在生产环境正常运行
✅ 数据库迁移已应用
✅ S3存储已配置
✅ 安全限制已生效
✅ 零停机部署完成
✅ 监控和告警已设置

**问题反馈**: 如遇到问题，查看 `docs/AWS_DEPLOYMENT_MIGRATIONS.md` 中的故障排查部分。
