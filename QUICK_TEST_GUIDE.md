# 文件上传功能 - 快速测试指南

## 🚀 快速开始（5分钟测试）

### 步骤1: 启动本地服务

```bash
# 终端1: 启动CMS
cd /Users/cerfbaleine/workspace/busrom-work/cms
npm run dev

# 终端2: 启动Web前端
cd /Users/cerfbaleine/workspace/busrom-work/web
npm run dev
```

### 步骤2: 确保MinIO运行

```bash
# 检查MinIO容器
docker ps | grep minio

# 如果没有运行，启动MinIO
docker-compose up -d minio
```

访问 MinIO Console: http://localhost:9001
- 用户名: `minioadmin`
- 密码: `minioadmin123`

### 步骤3: 创建测试表单

1. **访问CMS后台**
   - http://localhost:3000
   - 登录管理员账号

2. **创建新的 FormConfig**
   - 导航到: Form Configurations
   - 点击 "Create Form Configuration"

3. **基本配置**
   ```
   Name: test-file-upload
   Display Name (zh): 文件上传测试表单
   Display Name (en): File Upload Test Form
   Location: CUSTOM
   ```

4. **添加字段（中文 - zh）**

   **字段1: 姓名**
   ```
   Field Name: name
   Field Type: text
   Label: 姓名
   Placeholder: 请输入姓名
   Required: ✓
   ```

   **字段2: 简历上传** ⭐ 关键字段
   ```
   Field Name: resume
   Field Type: file
   Label: 上传简历
   Placeholder:
   Required: ✓

   Validation:
   - Accept: .pdf,.doc,.docx
   - Max Size: 5 (MB)
   - Multiple: false
   ```

   **字段3: 附件** ⭐ 多文件上传
   ```
   Field Name: attachments
   Field Type: file
   Label: 附件
   Required: false

   Validation:
   - Accept: image/*,.pdf
   - Max Size: 3 (MB)
   - Multiple: true
   ```

5. **配置文件上传限制**
   ```
   Max Total File Size per Submission: 10 (MB)
   Max Files per Submission: 3
   Max File Uploads per Day (per IP): 10
   ```

6. **配置提交选项**
   ```
   Submit Button Text (zh): 提交
   Submit Button Text (en): Submit

   Success Message (zh): 提交成功！
   Success Message (en): Submitted successfully!

   Notification Email: your-email@example.com
   Enable Email Notification: ✓
   ```

7. **发布表单**
   - Status: Published
   - 点击 Save

### 步骤4: 在前端使用表单

有两种方式测试：

#### 方式A: 使用 DynamicForm 组件

在任意页面中使用：

```tsx
import { DynamicForm } from '@/components/forms/DynamicForm'

export default function TestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">文件上传测试</h1>
      <DynamicForm
        formName="test-file-upload"
        locale="zh"
      />
    </div>
  )
}
```

#### 方式B: 使用 API 直接测试

使用Postman或curl测试API：

**1. 上传文件**
```bash
curl -X POST http://localhost:3001/api/form-file-upload \
  -F "file=@/path/to/your/resume.pdf" \
  -F "formConfigId=<your-form-config-id>" \
  -F "fieldName=resume"
```

响应:
```json
{
  "success": true,
  "fileUrl": "http://localhost:9000/busrom-media/form-attachments/...",
  "fileName": "resume.pdf",
  "fileSize": 102400,
  "fileType": "application/pdf",
  "uploadedAt": "2025-11-21T12:00:00Z"
}
```

**2. 提交表单**
```bash
curl -X POST http://localhost:3001/api/form-submissions \
  -H "Content-Type: application/json" \
  -d '{
    "formConfigId": "<your-form-config-id>",
    "formName": "test-file-upload",
    "data": {
      "name": "张三",
      "resume": "http://localhost:9000/busrom-media/form-attachments/..."
    },
    "attachments": [
      {
        "fieldName": "resume",
        "fileName": "resume.pdf",
        "fileUrl": "http://localhost:9000/busrom-media/form-attachments/...",
        "fileSize": 102400,
        "fileType": "application/pdf",
        "uploadedAt": "2025-11-21T12:00:00Z"
      }
    ],
    "locale": "zh"
  }'
```

### 步骤5: 验证结果

#### 检查表单提交

1. **在CMS后台查看**
   - 导航到: Form Submissions
   - 应该看到新的提交记录
   - 点击查看详情
   - 验证 `attachments` 字段包含文件信息

2. **检查文件存储**
   - 访问 MinIO Console: http://localhost:9001
   - 导航到 bucket: `busrom-media`
   - 查看 `form-attachments/` 目录
   - 应该看到上传的文件

3. **测试文件访问**
   - 复制附件的 fileUrl
   - 在浏览器中打开
   - 应该能下载/查看文件

## 🧪 测试场景

### 测试1: 正常上传

✅ 测试目标:
- 上传符合要求的文件
- 文件类型正确
- 文件大小在限制内

📋 预期结果:
- 上传成功
- 返回文件URL
- 文件保存到MinIO
- 表单提交包含附件信息

### 测试2: 文件类型验证

❌ 测试目标:
- 上传不允许的文件类型（如 .exe）

📋 预期结果:
- 前端提示: "Invalid file type. Accepted: .pdf,.doc,.docx"
- 上传被拒绝

### 测试3: 文件大小限制

❌ 测试目标:
- 上传超过限制的文件（>5MB）

📋 预期结果:
- 前端提示: "File too large. Maximum size: 5MB"
- 上传被拒绝

### 测试4: 速率限制

❌ 测试目标:
- 短时间内上传超过10个文件

📋 预期结果:
- 第11次上传时返回 HTTP 429
- 错误信息: "Too many uploads. Please try again later."

### 测试5: 文件名安全

✅ 测试目标:
- 上传包含特殊字符的文件名

📋 预期结果:
- 文件名被安全处理
- 使用哈希重命名: `{timestamp}-{hash}.pdf`

### 测试6: 多文件上传

✅ 测试目标:
- 使用 multiple: true 的字段上传多个文件

📋 预期结果:
- 最多3个文件上传成功
- attachments 数组包含所有文件信息

### 测试7: 文件类型伪造

❌ 测试目标:
- 将 .exe 文件重命名为 .pdf 上传

📋 预期结果:
- 后端魔数验证失败
- 错误: "Invalid file type or corrupted file"

## 📊 监控和调试

### 查看上传日志

```bash
# CMS日志（文件上传API）
# 终端会显示上传请求

# MinIO日志
docker logs busrom-minio

# 数据库查询
npx prisma studio
# 打开后查看 FormSubmission 表的 attachments 字段
```

### 常见问题排查

**问题1: 文件上传返回500错误**

检查:
```bash
# 1. MinIO是否运行
docker ps | grep minio

# 2. S3环境变量是否配置
cat .env | grep S3

# 3. 查看错误日志
# 在CMS终端查看详细错误信息
```

**问题2: 文件上传后无法访问**

检查:
```bash
# 1. MinIO bucket策略
# 访问 http://localhost:9001
# 检查 busrom-media bucket 的访问策略

# 2. 文件是否真的上传
aws s3 ls s3://busrom-media/form-attachments/ --recursive --endpoint-url http://localhost:9000
```

**问题3: 表单提交不包含附件**

检查:
```
# 前端DynamicForm组件
1. uploadedAttachments state 是否包含数据
2. 表单提交时是否传递了 attachments 参数
3. 在浏览器DevTools Network查看请求payload
```

## ✅ 测试检查清单

### 前置条件
- [ ] CMS服务运行 (http://localhost:3000)
- [ ] Web服务运行 (http://localhost:3001)
- [ ] MinIO运行 (http://localhost:9000)
- [ ] PostgreSQL运行

### 功能测试
- [ ] 创建包含file字段的表单
- [ ] 上传PDF文件成功
- [ ] 上传Word文档成功
- [ ] 上传图片文件成功
- [ ] 尝试上传不允许的类型被拒绝
- [ ] 上传超大文件被拒绝
- [ ] 多文件上传（如果启用）
- [ ] 表单提交包含附件信息
- [ ] MinIO中可以看到文件
- [ ] 文件URL可访问

### 安全测试
- [ ] 文件类型伪造被检测
- [ ] 特殊字符文件名被处理
- [ ] 速率限制生效
- [ ] 文件大小限制生效

### 数据验证
- [ ] FormSubmission 表包含 attachments 字段
- [ ] attachments 是有效的JSON数组
- [ ] totalAttachmentSize 计算正确
- [ ] 文件元数据完整（fileName, fileUrl, fileSize等）

## 🎉 测试成功标志

当你完成所有测试后，应该能够：

✅ 在表单中上传文件
✅ 看到上传进度和成功提示
✅ 在MinIO中看到存储的文件
✅ 在CMS后台看到包含附件的提交记录
✅ 通过URL访问上传的文件
✅ 各种限制和验证正常工作

**恭喜！文件上传功能测试完成！** 🎊

## 下一步

完成测试后，可以：
1. 部署到AWS（参考 `docs/AWS_DEPLOYMENT_MIGRATIONS.md`）
2. 配置生产环境的S3和CloudFront
3. 设置监控和告警
