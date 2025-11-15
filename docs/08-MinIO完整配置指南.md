# 08 MinIO + Nginx 完整配置指南

**文档版本**: v1.0
**创建日期**: 2025-11-05
**适用环境**: 开发环境 / 生产环境

---

## 🎉 好消息:你的配置已完成!

你的项目已经完整配置好了MinIO + Nginx CDN,可以和AWS S3 + CloudFront一样使用图片自动优化功能!

---

## ✅ 配置检查清单

### 1. Docker服务 ✅ 已配置

`docker-compose.yml` 包含以下服务:

| 服务 | 端口 | 用途 | 状态 |
|-----|------|------|------|
| **postgres** | 5432 | PostgreSQL数据库 | ✅ |
| **minio** | 9000, 9001 | MinIO对象存储 | ✅ |
| **minio-init** | - | 自动创建bucket | ✅ |
| **nginx-cdn** | 8080 | Nginx CDN反代 | ✅ |

### 2. 环境变量 ✅ 已配置

`cms/.env` 配置:

```bash
# MinIO模式
USE_MINIO=true

# MinIO认证
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin123
S3_ENDPOINT=http://localhost:9000

# Bucket配置
S3_BUCKET_NAME=busrom-media
S3_REGION=us-east-1

# CDN域名
CDN_DOMAIN=http://localhost:8080
```

### 3. 图片优化器 ✅ 已更新

`cms/lib/image-optimizer.ts` 支持MinIO:
- ✅ `forcePathStyle: true` (MinIO必需)
- ✅ 动态S3_ENDPOINT配置
- ✅ 兼容AWS S3和MinIO

### 4. Nginx配置 ✅ 已配置

`docker/nginx/cdn.conf` 功能:
- ✅ 缓存层 (60分钟)
- ✅ Gzip压缩
- ✅ CORS支持
- ✅ 缓存控制头
- ✅ 健康检查端点

---

## 🚀 快速开始

### 步骤1: 启动所有服务

```bash
# 启动Docker服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 预期输出:
# NAME                STATUS    PORTS
# busrom-postgres     Up        0.0.0.0:5432->5432/tcp
# busrom-minio        Up        0.0.0.0:9000-9001->9000-9001/tcp
# busrom-cdn          Up        0.0.0.0:8080->80/tcp
```

### 步骤2: 验证MinIO

#### 方式1: Web控制台

访问: http://localhost:9001

- 用户名: `minioadmin`
- 密码: `minioadmin123`

登录后检查:
- ✅ Bucket `busrom-media` 已创建
- ✅ Access Policy: Public (download)

#### 方式2: 命令行

```bash
# 查看MinIO日志
docker-compose logs minio

# 应该看到:
# API: http://localhost:9000
# Console: http://localhost:9001
```

### 步骤3: 验证Nginx CDN

```bash
# 测试健康检查
curl http://localhost:8080/health
# 应返回: OK

# 测试缓存头
curl -I http://localhost:8080/busrom-media/test.jpg
# 应包含:
# X-Cache-Status: MISS (首次访问)
# X-Cache-Status: HIT  (后续访问)
# Cache-Control: public, max-age=31536000, immutable
```

### 步骤4: 启动CMS并测试

```bash
cd cms

# 安装依赖(如果还没安装)
npm install

# 生成Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 启动CMS
npm run dev
```

访问: http://localhost:3000

### 步骤5: 测试图片上传和优化

1. **登录CMS**
   - URL: http://localhost:3000
   - 使用管理员账号登录

2. **进入Media管理**
   - 侧边栏 → Media
   - 点击 "Create Media"

3. **上传测试图片**
   - 选择一张图片(建议2-5MB)
   - 填写Filename: `test-product`
   - 填写Alt Text (至少英文)
   - 点击Save

4. **等待自动生成**
   - 保存后等待10-30秒
   - 刷新页面

5. **查看变体**
   - 滚动到 "Image Variants (图片变体)" 区域
   - 应该看到6个变体卡片:

```
✅ 已生成 6 个图片变体

🖼️ Thumbnail (缩略图) - 150×150
   [预览] [复制URL]
   http://localhost:8080/busrom-media/variants/thumbnail/test-product.jpg

📱 Small (移动端) - 400px
   [预览] [复制URL]
   http://localhost:8080/busrom-media/variants/small/test-product.jpg

💻 Medium (平板) - 800px
   [预览] [复制URL]
   http://localhost:8080/busrom-media/variants/medium/test-product.jpg

🖥️ Large (桌面) - 1200px
   [预览] [复制URL]
   http://localhost:8080/busrom-media/variants/large/test-product.jpg

📺 XLarge (全屏) - 1920px
   [预览] [复制URL]
   http://localhost:8080/busrom-media/variants/xlarge/test-product.jpg

⚡ WebP (优化格式) - Optimized
   [预览] [复制URL]
   http://localhost:8080/busrom-media/variants/webp/test-product.webp
```

6. **测试变体访问**

点击 "预览" 按钮,或直接在浏览器访问URL:

```bash
# 访问缩略图
curl -I http://localhost:8080/busrom-media/variants/thumbnail/test-product.jpg

# 应返回 200 OK
# 包含缓存头: X-Cache-Status, Cache-Control
```

---

## 🔍 工作流程

### 图片上传和优化流程

```
┌────────────┐
│ 1. 上传图片 │
│  (CMS后台) │
└─────┬──────┘
      │
      ↓
┌─────────────────────┐
│ 2. Keystone保存原图  │
│   到MinIO (9000)    │
└─────┬───────────────┘
      │
      ↓
┌─────────────────────────┐
│ 3. afterOperation Hook  │
│   触发图片优化          │
└─────┬───────────────────┘
      │
      ↓
┌─────────────────────────┐
│ 4. image-optimizer.ts   │
│   - 下载原图            │
│   - 生成6个变体         │
│   - 上传到MinIO         │
└─────┬───────────────────┘
      │
      ↓
┌─────────────────────────┐
│ 5. 更新Media记录        │
│   - 保存variants URLs  │
│   - 保存元数据          │
└─────┬───────────────────┘
      │
      ↓
┌─────────────────────────┐
│ 6. 前端访问图片         │
│   http://localhost:8080 │
│   → Nginx缓存           │
│   → MinIO返回           │
└─────────────────────────┘
```

### URL路径说明

| 类型 | URL模式 | 示例 |
|------|---------|------|
| 原图 | `{CDN}/busrom-media/{filename}` | `http://localhost:8080/busrom-media/product.jpg` |
| 缩略图 | `{CDN}/busrom-media/variants/thumbnail/{filename}` | `http://localhost:8080/busrom-media/variants/thumbnail/product.jpg` |
| WebP | `{CDN}/busrom-media/variants/webp/{filename}.webp` | `http://localhost:8080/busrom-media/variants/webp/product.webp` |

---

## 📊 性能对比: MinIO vs AWS S3

### 功能对比

| 功能 | MinIO + Nginx | AWS S3 + CloudFront | 说明 |
|------|--------------|---------------------|------|
| **对象存储** | ✅ 完全兼容S3 API | ✅ | 零代码修改 |
| **CDN缓存** | ✅ Nginx缓存 | ✅ CloudFront | 同样效果 |
| **图片优化** | ✅ | ✅ | 完全一致 |
| **CORS支持** | ✅ | ✅ | 本地开发友好 |
| **缓存控制** | ✅ 60分钟缓存 | ✅ | 可调整 |
| **访问速度** | ⚡ 本地极快 | 🌐 取决于地区 | 开发环境更快 |
| **成本** | **💰 免费** | 💵 按量收费 | MinIO无额外费用 |
| **配置复杂度** | 🟢 简单(Docker) | 🟡 需要AWS账号 | MinIO更简单 |

### 成本对比

假设每月1000张图片,每张5MB,生成6个变体:

**AWS S3 + CloudFront:**
- S3存储: 1000 × 5MB × 7 = 35GB = ~$0.81/月
- CloudFront传输: 假设100GB = ~$8.50/月
- 请求费用: ~$0.50/月
- **总计: ~$9.81/月**

**MinIO + 自建服务器:**
- 服务器成本: $5-10/月 (VPS)
- 存储: 包含在服务器中
- 带宽: 包含在服务器中
- **总计: ~$5-10/月** (固定成本,不随使用量增长)

**开发环境:**
- MinIO: **完全免费** ✅
- AWS S3: 需要测试费用 ❌

---

## 🔧 高级配置

### 调整Nginx缓存时间

编辑 `docker/nginx/cdn.conf`:

```nginx
# 修改缓存有效期
proxy_cache_valid 200 60m;  # 60分钟 → 改为其他值

# 例如:
# proxy_cache_valid 200 1d;   # 1天
# proxy_cache_valid 200 1h;   # 1小时
# proxy_cache_valid 200 5m;   # 5分钟
```

重启Nginx:
```bash
docker-compose restart nginx-cdn
```

### 调整变体尺寸

编辑 `cms/lib/image-optimizer.ts`:

```typescript
const SIZE_VARIANTS = {
  thumbnail: { width: 150, height: 150, fit: 'cover' },  // 改为其他尺寸
  small: { width: 400, height: null, fit: 'inside' },
  medium: { width: 800, height: null, fit: 'inside' },
  large: { width: 1200, height: null, fit: 'inside' },
  xlarge: { width: 1920, height: null, fit: 'inside' },
}
```

### 添加新的变体类型

```typescript
const SIZE_VARIANTS = {
  // ... 现有变体
  xxlarge: { width: 3840, height: null, fit: 'inside' },  // 4K
  tiny: { width: 100, height: 100, fit: 'cover' },       // 超小图标
}
```

记得同时更新TypeScript类型:

```typescript
export interface ImageVariants {
  thumbnail: string
  small: string
  medium: string
  large: string
  xlarge: string
  xxlarge: string  // 新增
  tiny: string     // 新增
  webp: string
}
```

### 清除Nginx缓存

```bash
# 方式1: 重启nginx-cdn
docker-compose restart nginx-cdn

# 方式2: 清空缓存目录
docker-compose exec nginx-cdn sh -c "rm -rf /var/cache/nginx/*"

# 方式3: 重建容器(完全清除)
docker-compose down
docker volume rm busrom-work_nginx_cache
docker-compose up -d
```

---

## 🐛 故障排除

### 问题1: variants字段为空 {}

**症状:** 上传图片后variants字段没有URL

**可能原因:**
1. MinIO未启动
2. S3配置错误
3. 图片优化器报错

**解决步骤:**

```bash
# 1. 检查MinIO状态
docker-compose ps minio
# 应该显示 "Up"

# 2. 检查CMS日志
cd cms
npm run dev
# 上传图片,观察控制台输出

# 应该看到:
# 🔄 Processing image optimization for: test-product.jpg
# 📊 Metadata extracted: { width: 1920, height: 1080, ... }
#   ✅ Generated thumbnail: http://localhost:8080/...
#   ✅ Generated small: http://localhost:8080/...
#   ...
# ✅ Image optimization completed

# 3. 如果看到错误,检查S3配置
echo "S3_ENDPOINT=$S3_ENDPOINT"
echo "S3_BUCKET_NAME=$S3_BUCKET_NAME"
echo "CDN_DOMAIN=$CDN_DOMAIN"
```

### 问题2: 变体URL访问404

**症状:** 变体URL存在,但访问返回404

**解决步骤:**

```bash
# 1. 直接测试MinIO
curl http://localhost:9000/busrom-media/variants/thumbnail/test.jpg

# 2. 测试Nginx反代
curl http://localhost:8080/busrom-media/variants/thumbnail/test.jpg

# 3. 检查MinIO bucket权限
# 访问 http://localhost:9001
# 进入 busrom-media bucket
# 检查 Access Policy 是否为 Public

# 4. 检查文件是否真的上传了
docker-compose exec minio ls -R /data/busrom-media/

# 应该看到:
# /data/busrom-media/variants/thumbnail/
# /data/busrom-media/variants/small/
# ...
```

### 问题3: MinIO启动失败

**症状:** `docker-compose up` 报错

**解决步骤:**

```bash
# 1. 查看详细日志
docker-compose logs minio

# 2. 检查端口占用
lsof -i :9000
lsof -i :9001

# 3. 清理重启
docker-compose down
docker volume rm busrom-work_minio_data
docker-compose up -d

# 4. 等待minio-init完成
docker-compose logs minio-init
# 应该看到:
# ✅ MinIO bucket setup complete!
```

### 问题4: 图片生成太慢

**症状:** 等待超过1分钟还没生成

**可能原因:**
1. 原图太大 (> 10MB)
2. 服务器性能不足
3. 网络问题

**解决方法:**

```bash
# 1. 检查原图大小
# 建议上传前压缩到 5MB 以下

# 2. 查看生成日志
cd cms
npm run dev
# 观察控制台输出,看哪一步慢

# 3. 调整超时设置
# 编辑 cms/lib/image-optimizer.ts
# 增加Sharp处理超时
```

### 问题5: Nginx缓存不生效

**症状:** 每次访问都是MISS,没有HIT

**解决步骤:**

```bash
# 1. 检查缓存头
curl -I http://localhost:8080/busrom-media/test.jpg
# 查找: X-Cache-Status

# 2. 多次访问同一URL
curl http://localhost:8080/busrom-media/test.jpg > /dev/null
curl -I http://localhost:8080/busrom-media/test.jpg
# 第二次应该返回 X-Cache-Status: HIT

# 3. 检查Nginx缓存目录
docker-compose exec nginx-cdn ls -la /var/cache/nginx/

# 4. 检查Nginx配置
docker-compose exec nginx-cdn nginx -t
# 应返回: syntax is ok
```

---

## 🚀 生产环境部署

### 切换到AWS S3

当你准备部署到生产环境时,只需修改环境变量:

```bash
# cms/.env.production

# 切换到AWS S3
USE_MINIO=false

# AWS S3凭证
S3_ACCESS_KEY_ID=your_aws_access_key_id
S3_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_ENDPOINT=  # 留空或删除此行

# AWS S3配置
S3_BUCKET_NAME=busrom-media-production
S3_REGION=us-east-1

# CloudFront CDN
CDN_DOMAIN=https://d1234567890.cloudfront.net
```

**无需修改代码!** 图片优化器会自动适配。

### 保留MinIO用于开发

你可以同时保留两套配置:

```bash
# .env.development (本地开发)
USE_MINIO=true
S3_ENDPOINT=http://localhost:9000
CDN_DOMAIN=http://localhost:8080

# .env.production (生产环境)
USE_MINIO=false
S3_ENDPOINT=
CDN_DOMAIN=https://d1234567890.cloudfront.net
```

---

## 📚 相关文档

- [图片变体使用指南](./07-图片变体使用指南.md)
- [图片变体快速开始](./07-图片变体快速开始.md)
- [数据模型与架构](./01-数据模型与架构.md)
- [API接口规范](./02-API接口规范.md)

---

## ✅ 配置检查清单

在开始使用前,确认以下项目:

- [ ] Docker Desktop已安装并运行
- [ ] `docker-compose up -d` 成功启动所有服务
- [ ] MinIO Web控制台可访问 (http://localhost:9001)
- [ ] Nginx CDN健康检查通过 (`curl http://localhost:8080/health`)
- [ ] CMS已启动 (`npm run dev` in cms/)
- [ ] 已创建管理员账号并能登录
- [ ] 上传测试图片成功
- [ ] variants字段显示6个变体URL
- [ ] 点击"预览"按钮可以查看图片
- [ ] 前端可以正常访问变体URL

全部完成? 🎉 **恭喜!你的MinIO图片优化系统已就绪!**

---

**文档维护**: 开发团队
**最后更新**: 2025-11-05
