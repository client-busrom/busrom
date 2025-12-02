# 本地数据库迁移验证报告

## 执行时间
2025-11-21

## 执行结果
✅ **所有迁移已成功应用到本地数据库**

## 迁移详情

### 已应用的迁移

```
migrations/
  └─ 20251117040000_update_permission_resource_enum/
    └─ migration.sql
  └─ 20251117041500_add_all_missing_enums/
    └─ migration.sql
  └─ 20251121000000_add_file_upload_fields/    ← 新增的文件上传迁移
    └─ migration.sql
```

### 数据库Schema验证

#### FormConfig 表 - 新增字段

✅ 已成功添加以下列：

| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `maxTotalFileSize` | INTEGER | 10 | 单次提交文件总大小限制(MB) |
| `maxFilesPerSubmission` | INTEGER | 3 | 单次提交文件数量限制 |
| `maxFileUploadsPerDay` | INTEGER | 10 | 每IP每日文件上传数量限制 |

#### FormSubmission 表 - 新增字段

✅ 已成功添加以下列：

| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `attachments` | JSONB | [] | 附件元数据数组 |
| `totalAttachmentSize` | INTEGER | 0 | 附件总大小(bytes) |

### Prisma Schema 验证

✅ `schema.prisma` 已自动更新，包含所有新字段：

```prisma
model FormConfig {
  // ... 其他字段
  maxTotalFileSize      Int?  @default(10)
  maxFilesPerSubmission Int?  @default(3)
  maxFileUploadsPerDay  Int?  @default(10)
  // ...
}

model FormSubmission {
  // ... 其他字段
  attachments         Json? @default("[]")
  totalAttachmentSize Int?  @default(0)
  // ...
}
```

## 迁移过程中的问题处理

### 遇到的问题
在执行迁移时遇到了一些旧迁移的冲突（列已存在）：
- `20251117021814_add_inquiry_link` - inquiryLink 列已存在
- `20251117035000_add_backup_codes` - backupCodes 列已存在

### 解决方案
使用 `prisma migrate resolve --applied` 标记这些迁移为已应用：

```bash
npx prisma migrate resolve --applied 20251117021814_add_inquiry_link
npx prisma migrate resolve --applied 20251117035000_add_backup_codes
```

这是正常的，因为之前这些列已经通过其他方式创建了。

### 最终迁移命令

```bash
npx prisma migrate deploy
```

输出:
```
The following migration(s) have been applied:

migrations/
  └─ 20251117040000_update_permission_resource_enum/
  └─ 20251117041500_add_all_missing_enums/
  └─ 20251121000000_add_file_upload_fields/

All migrations have been successfully applied. ✅
```

## 下一步操作

### 本地测试

1. **启动CMS服务**
   ```bash
   cd /Users/cerfbaleine/workspace/busrom-work/cms
   npm run dev
   ```

2. **访问管理后台**
   - URL: http://localhost:3000
   - 登录管理员账号

3. **创建测试表单**
   - 进入 Form Configurations
   - 创建新的 FormConfig
   - 添加 file 字段类型
   - 配置验证规则：
     - accept: `.pdf,.doc,.docx`
     - maxSize: 5 (MB)
     - multiple: false

4. **测试文件上传**
   - 在前端表单页面
   - 选择文件上传
   - 提交表单
   - 检查后台是否收到附件信息

### 环境变量检查

确保 `.env` 文件包含以下S3配置：

```env
S3_BUCKET_NAME=busrom-media
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin123
USE_MINIO=true
S3_ENDPOINT=http://localhost:9000
```

如果使用AWS S3而非MinIO，修改为：

```env
S3_BUCKET_NAME=busrom-media
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-aws-access-key
S3_SECRET_ACCESS_KEY=your-aws-secret-key
USE_MINIO=false
# CDN_DOMAIN=d123456789.cloudfront.net  # 可选
```

## 验证清单

- [x] 数据库迁移成功执行
- [x] FormConfig 表新增3个字段
- [x] FormSubmission 表新增2个字段
- [x] Prisma Schema 已更新
- [x] 迁移记录已保存到 `_prisma_migrations` 表
- [ ] 本地CMS服务启动测试
- [ ] 文件上传功能测试
- [ ] S3/MinIO 存储测试

## 总结

✅ **本地数据库迁移已成功完成！**

所有文件上传功能所需的数据库字段已添加到本地数据库。现在可以：

1. 启动本地CMS服务进行测试
2. 创建包含文件上传字段的表单
3. 测试完整的文件上传流程
4. 验证安全限制是否生效

部署到AWS时，相同的迁移会自动执行（通过 `start-cms.sh` 脚本）。

## 相关文档

- [FILE_UPLOAD_IMPLEMENTATION.md](docs/FILE_UPLOAD_IMPLEMENTATION.md) - 功能实现详情
- [AWS_DEPLOYMENT_MIGRATIONS.md](docs/AWS_DEPLOYMENT_MIGRATIONS.md) - AWS部署指南
- [DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md) - 部署检查清单
