# 本地开发环境 vs AWS 生产环境 - 关键差异分析

## 概述

本文档详细说明本地开发环境和 AWS 生产环境之间的关键差异,帮助理解为什么本地正常的功能在 AWS 上可能出现问题。

---

## 核心差异对比表

| 配置项 | 本地开发 | AWS Staging/Production | 影响 |
|--------|---------|----------------------|------|
| **NODE_ENV** | `development` | `production` | 日志级别、错误处理、调试信息 |
| **运行方式** | `npm run dev` (开发模式) | `npm start` (生产模式) | 热重载、错误显示 |
| **存储后端** | MinIO (本地) | AWS S3 | 文件上传、URL 生成 |
| **数据库** | Docker PostgreSQL | AWS RDS | 连接字符串、性能 |
| **CDN** | Nginx (localhost:8080) | AWS CloudFront | 媒体文件访问 URL |
| **容器化** | 直接运行 Node | Docker + ECS Fargate | 启动流程、环境隔离 |
| **环境变量** | 本地 .env 文件 | ECS Task Definition | 配置管理方式 |
| **代码文件** | 直接访问源码 | 构建后的代码 | TypeScript 编译、文件路径 |

---

## 1. 环境变量差异

### 本地开发 (`cms/.env`)

```bash
# 开发环境配置
NODE_ENV=development
USE_MINIO=true

# 本地数据库
DATABASE_URL=postgresql://busrom:busrom_dev_password@localhost:5432/busrom_cms

# MinIO (本地 S3)
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin123
S3_ENDPOINT=http://localhost:9000
S3_BUCKET_NAME=busrom-media
S3_REGION=us-east-1

# 本地 CDN
CDN_DOMAIN=http://localhost:8080

# 应用 URL
WEB_URL=http://localhost:3001
```

### AWS 环境 (ECS Task Definition)

```bash
# 生产环境配置
NODE_ENV=production
USE_MINIO=false

# AWS RDS
DATABASE_URL=postgresql://username:password@rds-endpoint.amazonaws.com:5432/busrom_cms

# AWS S3 (从 IAM Role 获取凭证)
S3_BUCKET_NAME=busrom-media-staging
S3_REGION=us-east-1
# 注意: S3_ACCESS_KEY_ID 和 S3_SECRET_ACCESS_KEY 通过 IAM Role 自动提供
# 注意: S3_ENDPOINT 为空或不设置 (使用 AWS S3)

# AWS CloudFront
CDN_DOMAIN=https://d1234567890.cloudfront.net

# 应用 URL
WEB_URL=https://staging.busrom.com  # 或 production
```

### 关键差异说明

1. **存储模式切换**: `USE_MINIO=true` vs `USE_MINIO=false`
   - 本地使用 MinIO 模拟 S3
   - AWS 使用真实的 S3 服务

2. **S3_ENDPOINT**:
   - 本地: `http://localhost:9000` (指向 MinIO)
   - AWS: 不设置或为空 (使用 AWS S3 默认端点)

3. **认证方式**:
   - 本地: 显式的 access key 和 secret
   - AWS: IAM Role 自动提供凭证(更安全)

---

## 2. 启动流程差异

### 本地开发启动流程

```bash
# 1. 直接运行开发服务器
npm run dev

# 内部执行:
# - 启动 TypeScript watch 模式
# - Keystone dev server (支持热重载)
# - 自动重新编译代码
```

**特点**:
- ✅ 立即看到代码更改
- ✅ 详细的错误堆栈
- ✅ 支持 TypeScript 直接运行
- ⚠️  开发模式性能较低

### AWS 生产启动流程

```bash
# 1. Docker 容器启动
# 2. 执行 start-cms.sh 脚本

#!/bin/sh
# 检查 migrations 目录
ls -la | grep migrations

# 创建 Prisma 符号链接
mkdir -p prisma
ln -s ../migrations prisma/migrations

# 运行数据库迁移
npx prisma migrate deploy --schema=./schema.prisma

# 启动生产服务器
npm start
```

**特点**:
- ✅ 先运行数据库迁移
- ✅ 生产优化的构建
- ✅ 更好的性能
- ⚠️  需要重新构建镜像才能看到代码更改
- ⚠️  错误信息较少

---

## 3. 自定义认证页面处理差异

### 本地开发

```javascript
// scripts/watch-and-patch-auth.js 监控并自动修补
// Keystone 每次重新生成 pages/init.js 和 pages/signin.js 时
// 脚本会立即替换为自定义页面

✅ Patched signin.js to use custom branded page
✅ Patched init.js to use custom branded page
🎨 Custom auth pages activated!
```

### AWS 生产环境

生产构建时:
1. Keystone 生成标准的 `pages/init.js`
2. **可能存在问题**: 自动修补脚本可能不运行
3. 导致使用了默认的 Keystone UI 而不是自定义页面

**解决方案**:
- 在 Dockerfile 构建阶段运行修补脚本
- 或者在启动脚本中添加修补逻辑

---

## 4. 数据库初始化差异

### 本地开发

```javascript
// cms/keystone.ts - onConnect hook
onConnect: async (context) => {
  // 每次启动都会检查并初始化
  await seedMediaSystem(context);
  await seedProductSystem(context);
  await seedNavigationSystem(context);
  await initializeRBACSystem(context);
}
```

输出:
```
✓ Media system already initialized
✓ Product system already initialized
✓ Navigation system already initialized
✅ 178 permissions initialized!
✅ 6 roles initialized!
```

### AWS 生产环境

**首次部署** (新数据库):
1. Docker 启动脚本运行 `npx prisma migrate deploy`
2. 创建所有表结构
3. `onConnect` hook 执行种子数据

**后续部署** (现有数据库):
1. 运行新的迁移(如果有)
2. `onConnect` hook 检查数据已存在,跳过种子

**潜在问题**:
- 如果数据库是空的但没有正确运行种子,会缺少关键数据
- 权限和角色可能未初始化

---

## 5. 文件路径和构建差异

### 本地开发

```
cms/
├── schema.prisma
├── keystone.ts
├── migrations/          ← 直接访问
├── routes/
├── scripts/
└── node_modules/
```

### AWS Docker 容器

```
/app/cms/
├── schema.prisma
├── keystone.ts
├── migrations/          ← 通过 COPY 复制
├── prisma/
│   └── migrations/      ← 符号链接指向 ../migrations
├── .keystone/           ← 构建生成的文件
└── node_modules/
```

**关键点**:
- Dockerfile 中明确复制 `migrations` 文件夹
- 启动脚本创建符号链接 `prisma/migrations -> ../migrations`
- 确保 Prisma 能找到迁移文件

---

## 6. 用户注册和权限分配差异

### 理论上应该一致

本地和 AWS 都使用相同的代码:

```typescript
// cms/components/CustomPages/InitPage.tsx
const handleSubmit = async (e) => {
  // 1. 创建用户
  const user = await context.query.User.createOne({
    data: { name, email, password, isAdmin: true }
  });

  // 2. 分配超级管理员角色
  const superAdminRole = await context.query.Role.findOne({
    where: { code: 'super_admin' }
  });

  await context.query.User.updateOne({
    where: { id: user.id },
    data: { roles: { connect: [{ id: superAdminRole.id }] } }
  });
}
```

### 实际可能的问题

在 AWS 环境中可能出现:

1. **角色未初始化**
   - 如果 `initializeRBACSystem` 未正确执行
   - `super_admin` 角色不存在
   - 用户创建成功但没有角色

2. **数据库连接时机**
   - `onConnect` hook 可能在用户访问 `/init` 之前未执行
   - 权限和角色数据缺失

3. **环境变量问题**
   - 生产环境的严格错误处理可能隐藏了错误
   - 日志不够详细,难以定位问题

---

## 7. 日志和调试差异

### 本地开发 (NODE_ENV=development)

```
✨ Starting Keystone
⭐️ Server listening on :3000
✨ Generating GraphQL and Prisma schemas
🔍 Checking for seed data initialization...
✓ Media system already initialized
...
prisma:query SELECT "public"."User"...  ← Prisma 查询日志
```

- ✅ 详细的 Prisma 查询日志
- ✅ 完整的错误堆栈
- ✅ 开发友好的错误页面

### AWS 生产环境 (NODE_ENV=production)

```
Starting Keystone...
Server ready
```

- ⚠️  最小化的日志输出
- ⚠️  错误信息被压缩
- ⚠️  需要通过 CloudWatch 查看日志
- ⚠️  调试困难

---

## 8. 网络和访问差异

### 本地开发

```
CMS:  http://localhost:3000
Web:  http://localhost:3001
CDN:  http://localhost:8080
```

- ✅ 直接访问
- ✅ 无需 HTTPS
- ✅ 无需域名配置

### AWS 生产环境

```
CMS:  https://cms-staging.busrom.com (通过 ALB)
      ↓
      ECS Service (内部端口 3000)
      ↓
      实际容器端口 3000

Web:  https://staging.busrom.com (通过 ALB)
      ↓
      ECS Service (内部端口 3001)
      ↓
      实际容器端口 3000

CDN:  https://d1234567890.cloudfront.net
      ↓
      S3 Bucket
```

- ⚠️  需要配置 ALB 健康检查
- ⚠️  HTTPS 终止在 ALB
- ⚠️  容器内部仍使用 HTTP
- ⚠️  域名需要正确解析

---

## 潜在问题根源分析

基于以上差异,AWS 部署的 `/init` 注册问题可能由以下原因引起:

### 1. 自定义认证页面未应用 (最可能)

**症状**: AWS 上访问 `/init` 显示 Keystone 默认 UI,而不是你的自定义品牌页面

**原因**:
- `scripts/watch-and-patch-auth.js` 只在开发模式运行
- Docker 构建时未执行修补
- 生产环境使用了默认的 `pages/init.js`

**验证方法**:
```bash
# 进入运行的 ECS 容器
aws ecs execute-command --cluster busrom-cluster-staging \
  --task <task-id> --container busrom-cms --interactive --command /bin/sh

# 检查文件内容
cat /app/cms/.keystone/admin/pages/init.js | grep "CustomInitPage"
```

**解决方案**:
在 `Dockerfile.cms` 添加:
```dockerfile
# After build stage
RUN node scripts/patch-auth-pages.js
```

或在 `start-cms.sh` 添加:
```bash
# Before starting Keystone
node scripts/patch-auth-pages.js
```

### 2. RBAC 系统未初始化

**症状**: 用户创建成功但无法登录或没有权限

**原因**:
- `initializeRBACSystem` 执行失败
- `super_admin` 角色不存在
- 用户没有被分配角色

**验证方法**:
```bash
# 连接到 RDS 数据库
psql $DATABASE_URL

# 检查角色表
SELECT * FROM "Role" WHERE code = 'super_admin';

# 检查用户角色关联
SELECT u.email, r.name FROM "User" u
LEFT JOIN "_Role_users" ru ON u.id = ru."B"
LEFT JOIN "Role" r ON r.id = ru."A"
WHERE u.email = 'admin@test.com';
```

**解决方案**:
确保 `onConnect` hook 正确执行:
```typescript
// cms/keystone.ts
onConnect: async (context) => {
  console.log('🔧 Running onConnect hook...');
  try {
    await initializeRBACSystem(context);
    console.log('✅ RBAC system initialized');
  } catch (error) {
    console.error('❌ RBAC initialization failed:', error);
    throw error; // 阻止启动,强制修复
  }
}
```

### 3. 环境变量配置错误

**症状**: S3 上传失败、数据库连接失败等

**检查清单**:
- [ ] `DATABASE_URL` 正确指向 RDS
- [ ] `S3_BUCKET_NAME` 与实际 bucket 匹配
- [ ] `USE_MINIO=false` (AWS 环境)
- [ ] `CDN_DOMAIN` 指向 CloudFront
- [ ] `SESSION_SECRET` 已设置且足够安全

### 4. 数据库迁移问题

**症状**: 表结构不匹配、字段缺失

**检查**:
```bash
# 查看 ECS 容器日志
aws logs tail /ecs/busrom-cms-staging --follow

# 查找迁移日志
# 应该看到: "npx prisma migrate deploy"
# 以及: "Applied X migrations"
```

---

## 本地测试验证 AWS 配置

为了确保本地修复的代码能在 AWS 正常工作,建议:

### 1. 模拟生产环境配置

临时修改 `cms/.env`:
```bash
# 暂时设置为生产模式
NODE_ENV=production
```

然后运行:
```bash
npm run build
npm start  # 而不是 npm run dev
```

### 2. 使用 Docker 本地测试

```bash
# 构建 Docker 镜像
docker build -t busrom-cms:test -f Dockerfile.cms .

# 运行容器
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://busrom:busrom_dev_password@host.docker.internal:5432/busrom_cms" \
  -e USE_MINIO=true \
  -e S3_ENDPOINT=http://host.docker.internal:9000 \
  busrom-cms:test

# 访问 http://localhost:3000/init
# 测试注册流程
```

### 3. 检查构建输出

```bash
# 查看构建后的文件
docker run --rm busrom-cms:test ls -la /app/cms/.keystone/admin/pages/

# 应该看到:
# - init.js (检查是否是自定义版本)
# - signin.js (检查是否是自定义版本)
```

---

## 推荐的部署前检查清单

在推送代码到 GitHub 触发部署之前:

- [ ] 本地使用 `NODE_ENV=production npm start` 测试
- [ ] 本地使用 Docker 构建并测试
- [ ] 确认 `scripts/patch-auth-pages.js` 在构建时执行
- [ ] 验证所有环境变量在 ECS Task Definition 中正确配置
- [ ] 检查 RDS 数据库是否需要重建
- [ ] 确认 S3 bucket 权限配置正确
- [ ] 测试 `/init` 注册流程(清空数据库后)
- [ ] 测试 `/signin` 登录流程
- [ ] 检查 CloudWatch 日志是否有错误

---

## 总结

| 差异类型 | 影响级别 | 建议 |
|---------|---------|-----|
| NODE_ENV | 高 | 本地也要测试生产模式 |
| 启动流程 | 高 | 确保 start-cms.sh 包含所有必要步骤 |
| 自定义页面 | 高 | 在 Docker 构建时修补 |
| 环境变量 | 中 | 使用 .env.example 作为参考 |
| 日志级别 | 中 | 在生产环境添加关键日志 |
| 网络配置 | 低 | AWS 自动处理 |

**核心建议**:
1. 在本地完成所有测试(包括生产模式)
2. 使用 Docker 本地验证
3. 确保自定义认证页面在生产构建中正确应用
4. 在 AWS 部署后立即检查 CloudWatch 日志
5. 保持本地和 AWS 环境变量同步(除了特定于环境的值)
