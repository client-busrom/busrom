# 修复文件上传错误

## 问题描述

错误信息：
```json
{
  "error": "Upload failed",
  "message": "Resolved credential object is not valid"
}
```

## 原因分析

Web 前端的 `.env.local` 文件缺少 S3/MinIO 配置环境变量，导致文件上传 API 无法连接到存储服务。

## 已修复

✅ 已添加以下环境变量到 `web/.env.local`：

```env
# S3 / MinIO Configuration (for file uploads)
S3_BUCKET_NAME=busrom-media
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin123
USE_MINIO=true
S3_ENDPOINT=http://localhost:9000
NEXT_PUBLIC_CMS_URL=http://localhost:3000
```

## 解决步骤

### 1. 重启 Web 服务（必需）

环境变量修改后必须重启服务才能生效：

```bash
# 停止当前运行的 Web 服务（Ctrl+C）

# 重新启动
cd /Users/cerfbaleine/workspace/busrom-work/web
npm run dev
```

### 2. 验证 MinIO 运行

```bash
# 检查 MinIO 容器状态
docker ps | grep minio

# 应该看到：
# busrom-minio   Up 3 days (healthy)   0.0.0.0:9000-9001->9000-9001/tcp
```

✅ MinIO 正在运行 (端口 9000)

### 3. 验证环境变量

重启后，在浏览器开发者工具中检查 API 请求：

```bash
# 或者查看服务器日志
# Web 服务启动时会加载 .env.local
```

### 4. 测试文件上传

1. 访问包含文件上传字段的表单
2. 选择一个小文件（如 1MB 的 PDF）
3. 上传文件
4. 应该看到上传成功的提示

## 验证清单

- [x] MinIO 容器运行中
- [x] 添加 S3 环境变量到 `.env.local`
- [ ] **重启 Web 服务** ⚠️ 重要
- [ ] 测试文件上传
- [ ] 文件成功保存到 MinIO

## 常见问题

### Q1: 重启后还是报错？

检查环境变量是否真的加载了：

**方式1: 在 API 中打印日志**

在 `web/app/api/form-file-upload/route.ts` 添加临时日志：

```typescript
console.log('S3 Config:', {
  bucket: process.env.S3_BUCKET_NAME,
  region: process.env.S3_REGION,
  accessKey: process.env.S3_ACCESS_KEY_ID?.substring(0, 5) + '***',
  useMinio: process.env.USE_MINIO,
  endpoint: process.env.S3_ENDPOINT,
})
```

**方式2: 检查 Next.js 进程**

```bash
# 确保杀掉所有旧的 Next.js 进程
pkill -f "next dev"

# 重新启动
npm run dev
```

### Q2: MinIO 连接失败？

测试 MinIO 连接：

```bash
# 访问 MinIO Console
open http://localhost:9001

# 登录信息:
# Username: minioadmin
# Password: minioadmin123

# 检查 busrom-media bucket 是否存在
```

如果 bucket 不存在，创建它：

```bash
# 使用 MinIO Client (mc)
docker exec busrom-minio mc mb /data/busrom-media

# 或在 MinIO Console 中手动创建
```

### Q3: 文件上传到哪里了？

本地开发环境文件存储在 MinIO 中：

```bash
# 查看 MinIO 中的文件
docker exec busrom-minio mc ls /data/busrom-media/form-attachments/
```

## 预期结果

重启 Web 服务后，文件上传应该正常工作：

1. ✅ 选择文件后立即上传到 MinIO
2. ✅ 显示上传进度
3. ✅ 上传成功后显示 "✓ File uploaded successfully"
4. ✅ 表单提交时包含文件 URL
5. ✅ MinIO 中可以看到文件：`form-attachments/{formConfigId}/{timestamp}-{hash}.ext`

## 下一步

文件上传修复后，可以继续测试其他功能：

- [ ] 测试文件类型验证（上传不允许的类型）
- [ ] 测试文件大小限制（上传超大文件）
- [ ] 测试多文件上传（如果启用）
- [ ] 测试速率限制（短时间多次上传）

详细测试步骤参考：`QUICK_TEST_GUIDE.md`
