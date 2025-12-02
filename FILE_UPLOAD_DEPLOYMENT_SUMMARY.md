# 文件上传功能 - 部署总结

## 🎯 功能概述

为 FormConfig 动态表单系统实现了完整的文件上传功能，包括：
- ✅ date 和 file 字段类型支持
- ✅ 多层安全防护（6层防御）
- ✅ S3存储集成
- ✅ 自动化数据库迁移
- ✅ 零停机部署支持

## 📋 快速开始

### 本地测试

```bash
# 1. 运行数据库迁移
cd cms
npm run migrate

# 2. 启动本地服务
npm run dev

# 3. 创建测试表单
# - 访问 http://localhost:3000
# - 登录管理员账号
# - 创建 FormConfig，添加 file 字段
# - 测试文件上传
```

### AWS部署

**自动部署（推荐）**:
```bash
# 推送到主分支，GitHub Actions 自动部署
git add .
git commit -m "feat: Add file upload functionality"
git push origin main
```

**手动部署**:
```bash
# 使用提供的部署脚本
./scripts/deploy-to-aws.sh production
```

## 📁 文件清单

### 核心代码

| 文件 | 说明 |
|------|------|
| `cms/schemas/FormConfig.ts` | 添加文件上传限制配置 |
| `cms/schemas/FormSubmission.ts` | 添加附件字段 |
| `cms/custom-fields/FormFieldsConfigField.tsx` | 添加url字段类型 |
| `web/components/forms/DynamicForm.tsx` | 实现file和date字段渲染 |
| `web/app/api/form-file-upload/route.ts` | 文件上传API（含安全验证） |
| `web/app/api/form-submissions/route.ts` | 处理附件提交 |

### 数据库

| 文件 | 说明 |
|------|------|
| `cms/migrations/20251121000000_add_file_upload_fields/migration.sql` | 数据库迁移 |
| `cms/schema.prisma` | Prisma schema（自动生成） |

### 部署配置

| 文件 | 说明 |
|------|------|
| `cms/start-cms.sh` | 容器启动脚本（含自动迁移） |
| `Dockerfile.cms` | Docker镜像构建配置 |
| `scripts/deploy-to-aws.sh` | AWS部署脚本 |

### AWS配置

| 文件 | 说明 |
|------|------|
| `aws-config/s3-bucket-policy.json` | S3 Bucket策略 |
| `aws-config/s3-lifecycle.json` | S3生命周期策略 |

### 文档

| 文件 | 说明 |
|------|------|
| `docs/FILE_UPLOAD_IMPLEMENTATION.md` | 功能实现详细文档 |
| `docs/AWS_DEPLOYMENT_MIGRATIONS.md` | AWS部署和迁移指南 |
| `docs/DEPLOYMENT_CHECKLIST.md` | 部署检查清单 |

## 🚀 部署流程

### 本地环境

```bash
# 1. 运行迁移
cd cms
npm run migrate

# 2. 验证Schema
psql -d busrom_cms -c "\d FormConfig"
psql -d busrom_cms -c "\d FormSubmission"
```

### AWS环境

**部署流程自动化**:

```
代码推送 → GitHub Actions → ECR镜像 → ECS部署 → 自动迁移 → 服务启动
```

**关键步骤**:

1. **构建阶段**
   - Dockerfile 包含 migrations/ 目录
   - 生成 Prisma Client

2. **启动阶段** (start-cms.sh)
   ```bash
   npx prisma migrate deploy  # 自动执行迁移
   npm start                   # 启动服务
   ```

3. **验证**
   - 健康检查通过
   - 迁移成功日志
   - 文件上传测试

## 🔒 安全机制

### 6层防护

| 层级 | 防护措施 | 限制值 |
|------|---------|--------|
| 1. 前端验证 | 文件大小、类型、数量 | 5MB/文件, 3文件/次 |
| 2. API限流 | IP速率限制 | 10文件/小时 |
| 3. 表单配置 | 可配置的提交限制 | 10次/天 |
| 4. 文件验证 | 魔数检查 | 防止类型伪造 |
| 5. 安全命名 | SHA256哈希 | 防止冲突和注入 |
| 6. S3配置 | 生命周期策略 | 90天自动删除 |

### 配置S3安全

```bash
# 1. 设置Bucket策略（只允许form-attachments/公开读取）
aws s3api put-bucket-policy \
  --bucket busrom-media \
  --policy file://aws-config/s3-bucket-policy.json

# 2. 配置生命周期（自动清理）
aws s3api put-bucket-lifecycle-configuration \
  --bucket busrom-media \
  --lifecycle-configuration file://aws-config/s3-lifecycle.json
```

## 📊 数据库变更

### FormConfig 新增字段

```sql
maxTotalFileSize INT DEFAULT 10;           -- 单次提交文件总大小(MB)
maxFilesPerSubmission INT DEFAULT 3;        -- 单次提交文件数量
maxFileUploadsPerDay INT DEFAULT 10;        -- 每IP每日上传限制
```

### FormSubmission 新增字段

```sql
attachments JSONB DEFAULT '[]'::jsonb;      -- 附件元数据
totalAttachmentSize INT DEFAULT 0;          -- 附件总大小(bytes)
```

## ✅ 部署检查清单

### 部署前

- [ ] 本地测试通过
- [ ] 数据库迁移已在本地运行
- [ ] 所有代码已提交到Git
- [ ] S3 Bucket配置已设置

### 部署中

- [ ] Docker镜像构建成功
- [ ] 推送到ECR成功
- [ ] ECS服务更新已启动

### 部署后

- [ ] 容器日志显示 "DATABASE MIGRATIONS COMPLETED"
- [ ] 健康检查通过 (`/api/health` 返回200)
- [ ] 数据库新列已创建
- [ ] 文件上传功能测试通过
- [ ] S3文件可访问

## 🔍 故障排查

### 常见问题

**Q: 迁移失败怎么办？**

查看日志:
```bash
aws logs tail /ecs/busrom-cms --since 10m | grep -i error
```

回滚:
```bash
aws ecs update-service \
  --cluster busrom-cluster \
  --service busrom-cms-service \
  --task-definition busrom-cms:<previous-version>
```

**Q: 文件上传失败？**

检查:
1. S3 Bucket权限
2. 环境变量配置 (`S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`)
3. 文件大小和类型限制
4. API速率限制

**Q: 多个容器同时运行迁移会冲突吗？**

不会。Prisma使用数据库锁保证只有一个进程执行迁移。

## 📈 监控

### CloudWatch 日志

关键日志模式:
```bash
# 成功
"DATABASE MIGRATIONS COMPLETED"
"✓ File uploaded successfully"

# 失败
"Error: P3009"  # 迁移失败
"Too many uploads"  # 速率限制
"Invalid file type"  # 类型验证失败
```

### S3 存储监控

```bash
# 查看存储使用
aws s3 ls s3://busrom-media/form-attachments/ --recursive --summarize

# 查看最近上传
aws s3 ls s3://busrom-media/form-attachments/ --recursive | tail -20
```

## 🎓 最佳实践

1. **本地先测试迁移**
   ```bash
   npm run migrate
   ```

2. **使用staging环境**
   - 先部署到staging
   - 验证功能
   - 再部署到production

3. **监控迁移日志**
   - 部署时实时查看日志
   - 确认迁移成功

4. **定期清理S3**
   - 生命周期策略已配置
   - 90天自动删除

5. **备份重要数据**
   - 迁移前备份数据库
   - 保留迁移脚本历史

## 📞 支持

遇到问题？查看以下资源：

1. **详细文档**
   - [FILE_UPLOAD_IMPLEMENTATION.md](docs/FILE_UPLOAD_IMPLEMENTATION.md)
   - [AWS_DEPLOYMENT_MIGRATIONS.md](docs/AWS_DEPLOYMENT_MIGRATIONS.md)

2. **检查清单**
   - [DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)

3. **示例配置**
   - `aws-config/` 目录

## 🎉 总结

文件上传功能已完全实现并准备好部署：

✅ **代码完成** - 所有功能已实现并测试
✅ **安全可靠** - 6层安全防护
✅ **自动化部署** - 零停机、自动迁移
✅ **生产就绪** - 完整的监控和回滚方案
✅ **文档齐全** - 详细的实现和部署文档

**开始部署**: 运行 `./scripts/deploy-to-aws.sh production`

**祝部署顺利！** 🚀
