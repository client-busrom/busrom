# 文件上传功能实现文档

## 概述

本文档描述了为 FormConfig 动态表单系统实现的完整文件上传功能，包括多层安全防护机制以防止滥用。

## 实现日期

2025-11-21

## 功能特性

### 1. 支持的字段类型

新增以下字段类型到 FormConfig：

- **date** - 日期选择器
  - 支持 minDate/maxDate 验证

- **file** - 文件上传
  - 支持文件类型限制（accept）
  - 支持文件大小限制（maxSize，MB）
  - 支持多文件上传（multiple）

- **url** - URL 输入（已添加到 schema 定义）

### 2. 数据库Schema变更

#### FormConfig 新增字段

```typescript
maxTotalFileSize: integer       // 单次提交文件总大小限制(MB)，默认: 10
maxFilesPerSubmission: integer  // 单次提交文件数量限制，默认: 3
maxFileUploadsPerDay: integer   // 每IP每日文件上传数量限制，默认: 10
```

#### FormSubmission 新增字段

```typescript
attachments: json               // 附件元数据数组，默认: []
totalAttachmentSize: integer    // 附件总大小(bytes)，默认: 0
```

### 3. API端点

#### POST /api/form-file-upload

文件上传端点，包含以下安全检查：

**请求参数:**
- `file`: File - 上传的文件
- `formConfigId`: string - 表单配置ID
- `fieldName`: string - 字段名称

**响应:**
```json
{
  "success": true,
  "fileUrl": "https://cdn.example.com/form-attachments/...",
  "fileName": "original-name.pdf",
  "fileSize": 1024000,
  "fileType": "application/pdf",
  "uploadedAt": "2025-11-21T12:00:00Z"
}
```

## 安全防护机制

### 第1层：前端验证 (DynamicForm.tsx)

1. **文件大小检查**
   - 根据字段配置的 `validation.maxSize` 限制
   - 默认限制: 5MB

2. **文件类型检查**
   - 根据字段配置的 `validation.accept` 验证
   - 支持 MIME类型和文件扩展名
   - 示例: `image/*`, `.pdf`, `application/pdf`

3. **文件数量限制**
   - 单文件上传: 1个
   - 多文件上传: 最多3个

4. **文件名安全检查**
   - 只允许: 字母、数字、空格、连字符、下划线、点号
   - 正则: `/^[a-zA-Z0-9_\-\.\s]+$/`

### 第2层：API速率限制 (form-file-upload/route.ts)

1. **IP限流**
   - 默认: 10个文件/小时
   - 使用内存Map跟踪上传次数
   - 超限返回 HTTP 429

2. **表单配置验证**
   - 验证 formConfigId 有效性
   - 验证字段类型为 'file'
   - 获取该表单的文件限制配置

### 第3层：服务器端文件验证

1. **文件大小再次验证**
   - 使用表单配置的 maxSize 限制
   - 防止前端绕过

2. **文件类型魔数验证**（Magic Number Check）
   ```typescript
   // 支持的文件魔数
   const FILE_MAGIC_NUMBERS = {
     'image/jpeg': [0xFF, 0xD8, 0xFF],
     'image/png': [0x89, 0x50, 0x4E, 0x47],
     'image/gif': [0x47, 0x49, 0x46],
     'image/webp': [0x52, 0x49, 0x46, 0x46],
     'application/pdf': [0x25, 0x50, 0x44, 0x46],
     'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4B, 0x03, 0x04],
     // ... more types
   }
   ```
   - 读取文件头部字节
   - 验证真实文件类型
   - 防止文件扩展名伪造

### 第4层：安全文件名生成

```typescript
// 生成安全的唯一文件名
const fileHash = crypto.createHash('sha256')
  .update(uint8Array)
  .digest('hex')
  .slice(0, 16)

const timestamp = Date.now()
const safeExt = ext.replace(/[^a-z0-9]/gi, '')
const safeFileName = `form-attachments/${formConfigId}/${timestamp}-${fileHash}.${safeExt}`
```

- 使用时间戳 + SHA256哈希
- 防止文件名冲突
- 按表单ID组织目录结构

### 第5层：S3存储配置

1. **对象元数据**
   ```typescript
   Metadata: {
     originalName: file.name,
     uploadedBy: ip,
     formConfigId: formConfigId,
     formName: formConfig.name,
     fieldName: fieldName,
     uploadTimestamp: timestamp.toString(),
   }
   ```

2. **对象标签**（用于生命周期管理）
   ```typescript
   Tagging: 'Type=FormAttachment&AutoDelete=true'
   ```

3. **存储路径结构**
   ```
   form-attachments/
     ├── {formConfigId}/
     │   ├── {timestamp}-{hash}.pdf
     │   ├── {timestamp}-{hash}.jpg
     │   └── ...
   ```

## S3 Bucket 配置建议

### 1. Bucket Policy（只读公开访问）

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

### 2. Lifecycle Policy（自动清理）

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

- 30天后转移到 STANDARD_IA（低频访问）
- 90天后自动删除
- 节省存储成本

## 数据流程

### 文件上传流程

```
1. 用户选择文件
   ↓
2. 前端验证（大小、类型、数量）
   ↓
3. 调用 /api/form-file-upload
   ↓
4. API 检查速率限制
   ↓
5. 获取表单配置和字段限制
   ↓
6. 服务器端验证（大小、魔数）
   ↓
7. 生成安全文件名
   ↓
8. 上传到 S3
   ↓
9. 返回 CDN URL
   ↓
10. 前端显示上传成功
   ↓
11. 存储 URL 到 formData
```

### 表单提交流程

```
1. 用户填写表单（含文件字段）
   ↓
2. 文件已上传到 S3（在选择时）
   ↓
3. 提交表单
   ↓
4. POST /api/form-submissions
   ↓
5. GraphQL Mutation: createFormSubmission
   - data: { 其他字段数据 }
   - attachments: [{ fileUrl, fileName, fileSize, ... }]
   - totalAttachmentSize: 计算总大小
   ↓
6. 存储到 FormSubmission 表
   ↓
7. 发送邮件通知（含附件链接）
```

## 防滥用总结

| 层级 | 防护措施 | 限制值 |
|------|---------|--------|
| 前端验证 | 文件类型、大小、数量 | 5MB/文件, 3文件/次 |
| API限流 | IP速率限制 | 10文件/小时 |
| 表单配置 | IP提交次数限制 | 10次/天 (configurable) |
| 文件验证 | 魔数检查、真实类型验证 | MIME类型验证 |
| S3配置 | Bucket策略、生命周期 | 90天自动删除 |
| 监控 | 可疑行为检测 | 超过阈值告警 |

## 配置示例

### 创建带文件上传的表单

1. 在 CMS 后台创建 FormConfig
2. 添加 file 类型字段：
   ```json
   {
     "fieldName": "resume",
     "fieldType": "file",
     "label": "Upload Resume",
     "placeholder": "",
     "required": true,
     "validation": {
       "accept": ".pdf,.doc,.docx",
       "maxSize": 5,
       "multiple": false
     }
   }
   ```

3. 配置文件上传限制：
   - Max Total File Size: 10 MB
   - Max Files Per Submission: 3
   - Max File Uploads Per Day: 10

### 环境变量要求

```env
# S3 Configuration
S3_BUCKET_NAME=busrom-media
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

# Optional: CloudFront CDN
CDN_DOMAIN=d123456789.cloudfront.net

# Optional: MinIO (local development)
USE_MINIO=true
S3_ENDPOINT=http://localhost:9000
```

## 测试建议

### 1. 功能测试

- [ ] 上传支持的文件类型
- [ ] 上传不支持的文件类型（应拒绝）
- [ ] 上传超过大小限制的文件（应拒绝）
- [ ] 多文件上传（如果启用）
- [ ] 文件名特殊字符处理

### 2. 安全测试

- [ ] 尝试伪造文件扩展名（.exe → .pdf）
- [ ] 尝试绕过前端验证（直接调用API）
- [ ] 测试速率限制（连续上传超过10个文件）
- [ ] 测试文件名注入攻击（特殊字符）
- [ ] 验证文件存储路径安全

### 3. 性能测试

- [ ] 大文件上传（接近限制）
- [ ] 并发上传
- [ ] S3上传延迟测试

## 监控和维护

### 监控指标

1. **上传成功率**
   - 成功上传数 / 总尝试数

2. **被拒绝的上传**
   - 按原因分类（大小超限、类型不允许、速率限制等）

3. **存储使用量**
   - form-attachments/ 目录总大小
   - 按表单统计

4. **可疑活动**
   - 同一IP短时间大量上传
   - 频繁被拒绝的IP

### 告警设置

- 单IP每小时上传超过50个文件
- form-attachments/ 总大小超过10GB
- 上传失败率超过10%

## 未来改进建议

1. **病毒扫描**
   - 集成 ClamAV 或云扫描服务
   - 在上传后异步扫描

2. **图片处理**
   - 自动生成缩略图
   - 图片压缩优化

3. **分布式限流**
   - 使用 Redis 替代内存Map
   - 支持多服务器部署

4. **审计日志**
   - 记录所有文件操作
   - 支持合规性审计

5. **存储优化**
   - 重复文件检测（基于哈希）
   - 智能存储层级转换

## 相关文件

- `cms/schemas/FormConfig.ts` - 表单配置Schema
- `cms/schemas/FormSubmission.ts` - 表单提交Schema
- `cms/custom-fields/FormFieldsConfigField.tsx` - 表单字段配置UI
- `web/components/forms/DynamicForm.tsx` - 前端动态表单组件
- `web/app/api/form-file-upload/route.ts` - 文件上传API
- `web/app/api/form-submissions/route.ts` - 表单提交API
- `cms/migrations/20251121000000_add_file_upload_fields/migration.sql` - 数据库迁移

## 联系方式

如有问题或建议，请联系开发团队。
