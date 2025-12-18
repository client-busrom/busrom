# Payload CMS 部署检查清单

## ✅ 已完成的准备工作

### 1. Docker 配置
- [x] 创建 `Dockerfile.payload-cms`
- [x] 创建 `payload-cms/start-payload.sh` 启动脚本
- [x] 配置多阶段构建（依赖安装、构建、运行）

### 2. GitHub Actions 配置
- [x] 更新 `.github/workflows/deploy-aws.yml`
- [x] 修改 `build-cms` job 为 `build-payload-cms`
- [x] 修改 `deploy-cms` job 为 `deploy-payload-cms`
- [x] 更新 health check

### 3. 代码准备
- [x] Payload CMS 所有 Collections 已创建
- [x] Payload CMS 所有 Globals 已创建
- [x] `/api/home` 端点已实现（聚合所有首页数据）
- [x] 首页数据已导入（通过 seed 脚本）

## 📋 部署前需要在 AWS 做的事

### 1. 创建 ECR 仓库
需要在 AWS ECR 中创建新的 Docker 镜像仓库：

**Staging:**
```bash
aws ecr create-repository \
  --repository-name busrom-payload-cms-staging \
  --region us-east-1
```

**Production:**
```bash
aws ecr create-repository \
  --repository-name busrom-payload-cms-production \
  --region us-east-1
```

### 2. 创建 ECS Task Definition

需要在 AWS ECS 中创建新的任务定义：`busrom-payload-cms-staging` 和 `busrom-payload-cms-production`

**关键配置项：**
- Container Name: `busrom-payload-cms`
- Image: `<account-id>.dkr.ecr.us-east-1.amazonaws.com/busrom-payload-cms-staging:latest`
- Port: `3002`
- CPU: 512 (0.5 vCPU)
- Memory: 1024 (1 GB) - 可根据需要调整

**环境变量（必须）：**
```json
{
  "NODE_ENV": "production",
  "PORT": "3002",
  "DATABASE_URI": "<from-secrets-manager>",
  "PAYLOAD_SECRET": "<from-secrets-manager>",
  "S3_BUCKET": "<your-s3-bucket>",
  "S3_REGION": "us-east-1",
  "S3_ACCESS_KEY_ID": "<from-secrets-manager>",
  "S3_SECRET_ACCESS_KEY": "<from-secrets-manager>",
  "NEXT_PUBLIC_SERVER_URL": "https://cms.busrom.com"
}
```

### 3. 创建 ECS Service

需要创建新的 ECS 服务来运行 Payload CMS：

**Staging:**
```bash
aws ecs create-service \
  --cluster busrom-cluster-staging \
  --service-name busrom-payload-cms-staging \
  --task-definition busrom-payload-cms-staging \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

**Production:**
```bash
aws ecs create-service \
  --cluster busrom-cluster-production \
  --service-name busrom-payload-cms-production \
  --task-definition busrom-payload-cms-production \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### 4. 配置 Load Balancer

需要配置 ALB 将流量路由到 Payload CMS：

**Target Group:**
- Target Type: IP
- Protocol: HTTP
- Port: 3002
- Health Check Path: `/api/health`
- Health Check Interval: 30 seconds

**Listener Rules:**
- Host: `cms.busrom.com` (production) 或 `cms-staging.busrom.com` (staging)
- Path: `/*`
- Forward to: Payload CMS target group

### 5. 配置 GitHub Secrets

需要在 GitHub 仓库的 Settings > Secrets 中添加（如果还没有）：

**必需的 Secrets:**
- `AWS_ACCESS_KEY_ID` - AWS 访问密钥
- `AWS_SECRET_ACCESS_KEY` - AWS 密钥
- `ECR_REPOSITORY_PAYLOAD_CMS_STAGING` - (可选) Staging ECR 仓库名
- `ECR_REPOSITORY_PAYLOAD_CMS_PRODUCTION` - (可选) Production ECR 仓库名
- `ECS_CLUSTER_STAGING` - (可选) Staging ECS 集群名
- `ECS_CLUSTER_PRODUCTION` - (可选) Production ECS 集群名
- `ECS_SERVICE_PAYLOAD_CMS_STAGING` - (可选) Staging ECS 服务名
- `ECS_SERVICE_PAYLOAD_CMS_PRODUCTION` - (可选) Production ECS 服务名

### 6. 数据库准备

**Payload CMS 使用 PostgreSQL + Prisma**

需要确保：
- [x] 数据库已创建
- [x] 数据库连接字符串已配置
- [ ] 首次部署时需要运行数据库迁移（如果需要）

## 🚀 部署步骤

### 第一次部署（手动触发）

1. **提交代码到 GitHub**
   ```bash
   git add .
   git commit -m "feat: Add Payload CMS deployment configuration"
   git push origin main  # 或 develop 分支用于 staging
   ```

2. **GitHub Actions 会自动：**
   - 构建 Payload CMS Docker 镜像
   - 推送到 ECR
   - 部署到 ECS
   - 构建 Web Docker 镜像
   - 部署 Web 到 ECS

3. **监控部署**
   - 访问 GitHub Actions 页面查看部署进度
   - 检查 AWS ECS 控制台确认服务状态

### 验证部署

部署完成后，访问以下 URL 验证：

**Staging:**
- API Health: https://cms-staging.busrom.com/api/health
- Admin Panel: https://cms-staging.busrom.com/admin
- Home API: https://cms-staging.busrom.com/api/home?locale=en

**Production:**
- API Health: https://cms.busrom.com/api/health
- Admin Panel: https://cms.busrom.com/admin
- Home API: https://cms.busrom.com/api/home?locale=en

## ⚠️ 注意事项

### 1. 数据迁移
如果需要保留 Keystone 的数据：
- 首页数据已经通过 seed 脚本导入
- Media 文件需要确保 S3 配置正确
- 用户账号需要重新创建（Payload 的用户系统不同）

### 2. 环境变量差异
- Keystone 使用 `DATABASE_URL`
- Payload 使用 `DATABASE_URI`
- 确保在 ECS Task Definition 中配置正确

### 3. 端口配置
- Keystone: 3000
- Payload: 3002
- 确保 Load Balancer 和安全组配置正确

### 4. 首次登录
Payload CMS 首次启动时会提示创建管理员账号，或者需要通过种子脚本创建：
```bash
npm run seed:admin-user
```

## 🔄 后续部署

后续只需要 push 代码到 main 或 develop 分支，GitHub Actions 会自动处理部署。

## 📞 问题排查

### 部署失败
1. 检查 GitHub Actions 日志
2. 检查 ECS Task 日志（CloudWatch）
3. 检查数据库连接
4. 检查环境变量配置

### 服务无法访问
1. 检查 ECS Service 状态
2. 检查 Target Group Health
3. 检查安全组规则
4. 检查 ALB Listener Rules

### 数据库连接失败
1. 检查 `DATABASE_URI` 格式
2. 检查数据库安全组
3. 检查数据库用户权限
