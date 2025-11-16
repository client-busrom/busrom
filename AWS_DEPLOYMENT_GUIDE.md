# 🚀 Busrom AWS 部署完整指南

> **部署架构**: GitHub Actions + ECR + ECS Fargate + RDS + S3 + CloudFront
> **自动化程度**: 全自动 CI/CD
> **支持环境**: Staging 和 Production

---

## 📋 目录

- [架构概览](#架构概览)
- [前置准备](#前置准备)
- [快速开始](#快速开始)
- [详细部署步骤](#详细部署步骤)
- [GitHub Secrets 配置](#github-secrets-配置)
- [故障排查](#故障排查)

---

## 🏗️ 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                        CloudFront CDN                        │
│                    (静态资源 + 全球加速)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
┌────────▼────────┐     ┌────────▼────────┐
│   GitHub Actions │     │   CloudFlare    │
│   (CI/CD)        │     │   (DNS + SSL)   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │  Application Load     │
         │      Balancer         │
         └───────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
┌────────▼────────┐     ┌────────▼────────┐
│   ECS Fargate   │     │   ECS Fargate   │
│   CMS Service   │     │   Web Service   │
│   (Port 3000)   │     │   (Port 3001)   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │                       │
┌────────▼────────┐     ┌────────▼────────┐
│  RDS PostgreSQL │     │      S3         │
│   (Database)    │     │   (Media)       │
└─────────────────┘     └─────────────────┘
```

### 技术栈

- **容器编排**: AWS ECS Fargate (无需管理服务器)
- **容器镜像**: Amazon ECR
- **数据库**: Amazon RDS PostgreSQL
- **对象存储**: Amazon S3
- **CDN**: Amazon CloudFront
- **负载均衡**: Application Load Balancer (ALB)
- **密钥管理**: AWS Secrets Manager
- **日志**: CloudWatch Logs
- **CI/CD**: GitHub Actions
- **DNS**: Cloudflare (可选)

---

## 📝 前置准备

### 1. 必需的工具和账号

- ✅ AWS 账号（具有管理员权限或足够的 IAM 权限）
- ✅ GitHub 仓库（代码已推送）
- ✅ AWS CLI 已安装（版本 2.x）
- ✅ 本地终端访问
- ✅ 域名（用于生产环境）

### 2. 配置 AWS CLI

```bash
# 检查 AWS CLI 版本
aws --version

# 配置 AWS 凭证
aws configure

# 输入以下信息:
# AWS Access Key ID: [你的 Access Key]
# AWS Secret Access Key: [你的 Secret Key]
# Default region name: us-east-1
# Default output format: json

# 验证配置
aws sts get-caller-identity
```

### 3. 获取 AWS Access Keys

1. 登录 [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. 创建新 IAM 用户或使用现有用户
3. 赋予用户以下权限（或使用 AdministratorAccess）:
   - AmazonECS_FullAccess
   - AmazonEC2ContainerRegistryFullAccess
   - AmazonRDSFullAccess
   - AmazonS3FullAccess
   - CloudWatchLogsFullAccess
   - SecretsManagerReadWrite
   - IAMFullAccess
4. 创建访问密钥并保存

---

## 🚀 快速开始

### 一键部署脚本（推荐用于首次部署）

```bash
# 1. 进入项目目录
cd /Users/cerfbaleine/workspace/busrom-work

# 2. 部署 Staging 环境
./scripts/setup-aws-infrastructure.sh staging
./scripts/setup-ecs-services.sh staging
./scripts/setup-secrets.sh staging

# 3. 部署 Production 环境
./scripts/setup-aws-infrastructure.sh production
./scripts/setup-ecs-services.sh production
./scripts/setup-secrets.sh production
```

---

## 📖 详细部署步骤

### 步骤 1: 创建 AWS 基础设施

这个脚本会创建：
- ECR 仓库（存储 Docker 镜像）
- S3 存储桶（存储媒体文件）
- VPC 和子网（网络配置）
- 安全组（防火墙规则）
- ECS 集群（容器集群）
- CloudWatch 日志组

```bash
# Staging 环境
./scripts/setup-aws-infrastructure.sh staging

# Production 环境
./scripts/setup-aws-infrastructure.sh production
```

**输出示例**:
```
========================================
AWS Infrastructure Setup for Busrom
Environment: staging
Region: us-east-1
========================================

[1/7] Creating ECR Repositories...
  ✓ Created ECR repository: busrom-cms-staging
  ✓ Created ECR repository: busrom-web-staging
  CMS ECR URI: 123456789012.dkr.ecr.us-east-1.amazonaws.com/busrom-cms-staging
  Web ECR URI: 123456789012.dkr.ecr.us-east-1.amazonaws.com/busrom-web-staging

[2/7] Creating S3 Bucket...
  ✓ Created S3 bucket: busrom-media-staging
  ✓ Configured CORS for S3 bucket
  ...
```

完成后会生成配置文件: `.aws-infrastructure-staging.env`

---

### 步骤 2: 创建 RDS 数据库（手动操作）

由于 RDS 创建时间较长（10-15分钟），建议通过 AWS Console 手动创建：

1. 登录 [AWS RDS Console](https://console.aws.amazon.com/rds/)
2. 点击 "Create database"
3. 配置参数：
   - **Engine**: PostgreSQL 15.x
   - **Templates**:
     - Staging: Dev/Test
     - Production: Production
   - **DB instance identifier**: `busrom-db-staging` 或 `busrom-db-production`
   - **Master username**: `busrom_admin`
   - **Master password**: 生成强密码并保存
   - **DB instance class**:
     - Staging: db.t3.micro
     - Production: db.t3.small 或更高
   - **Storage**: 20 GB（可自动扩展）
   - **VPC**: 选择脚本创建的 VPC
   - **Public access**: No
   - **VPC security group**: 选择 `busrom-ecs-sg-*`
   - **Initial database name**: `busrom_cms`
4. 等待数据库创建完成
5. 记录 RDS Endpoint（例如: `busrom-db-staging.abc123.us-east-1.rds.amazonaws.com`）

**数据库连接字符串格式**:
```
postgresql://busrom_admin:K1oQX5pKgzayV67qbWzz@busrom-db-staging.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_cms
```

```
postgresql://busrom_admin:v49EgMZcxK4JCClPW8OY@busrom-db-production.cqhcko4ysea2.us-east-1.rds.amazonaws.com:5432/busrom_cms
```

---

### 步骤 3: 配置 AWS Secrets Manager

这个脚本会将敏感信息存储到 AWS Secrets Manager：

```bash
# Staging 环境
./scripts/setup-secrets.sh staging

# Production 环境
./scripts/setup-secrets.sh production
```

脚本会提示输入以下信息：

1. **DATABASE_URL**:
   ```
   postgresql://busrom_admin:password@busrom-db-staging.abc123.us-east-1.rds.amazonaws.com:5432/busrom_cms
   ```

   ```
   DkduBF1LmR7NbvQn1QTdvNIGOC/YrtEdKoiR1jJb
   ```

   ```
   

2. **SESSION_SECRET**: 自动生成（或手动输入）

3. **S3_ACCESS_KEY_ID**: 从 IAM 获取

4. **S3_SECRET_ACCESS_KEY**: 从 IAM 获取

5. **CDN_DOMAIN**: CloudFront 域名（稍后配置）

6. **WEB_URL**:
   - Staging: `https://staging.busrom.com`
   - Production: `https://www.busrom.com`

7. **NEXT_PUBLIC_API_URL**:
   - Staging: `https://cms-staging.busrom.com/api/graphql`
   - Production: `https://cms.busrom.com/api/graphql`

---

### 步骤 4: 创建 ECS 服务和 ALB

这个脚本会：
- 注册 ECS 任务定义
- 创建 Application Load Balancer
- 创建目标组
- 创建 ECS 服务

```bash
# Staging 环境
./scripts/setup-ecs-services.sh staging

# Production 环境
./scripts/setup-ecs-services.sh production
```

**输出示例**:
```
========================================
✅ ECS Services Setup Complete!
========================================

📝 Summary:
  Environment: staging
  ECS Cluster: busrom-cluster-staging
  ALB DNS: busrom-alb-staging-123456789.us-east-1.elb.amazonaws.com
  ...

🌐 Access URLs (configure DNS to point to ALB):
  CMS: https://cms-staging.busrom.com → busrom-alb-staging-123456789.us-east-1.elb.amazonaws.com
  Web: https://staging.busrom.com → busrom-alb-staging-123456789.us-east-1.elb.amazonaws.com
```

**重要**: 记录 ALB DNS 地址，稍后需要配置 DNS。

---

### 步骤 5: 配置 GitHub Secrets

在 GitHub 仓库中配置以下 Secrets：

1. 进入仓库页面
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下 Secrets：

#### 必需的 Secrets（所有环境通用）

| Secret Name | 值 | 说明 |
|------------|---|-----|
| `AWS_ACCESS_KEY_ID` | `AKIA...` | AWS 访问密钥 ID |
| `AWS_SECRET_ACCESS_KEY` | `xxx...` | AWS 访问密钥 |
| `AWS_REGION` | `us-east-1` | AWS 区域 |

#### Staging 环境 Secrets

| Secret Name | 值 | 说明 |
|------------|---|-----|
| `ECR_REPOSITORY_CMS_STAGING` | `busrom-cms-staging` | CMS ECR 仓库名 |
| `ECR_REPOSITORY_WEB_STAGING` | `busrom-web-staging` | Web ECR 仓库名 |
| `ECS_CLUSTER_STAGING` | `busrom-cluster-staging` | ECS 集群名 |
| `ECS_SERVICE_CMS_STAGING` | `busrom-cms-staging` | CMS ECS 服务名 |
| `ECS_SERVICE_WEB_STAGING` | `busrom-web-staging` | Web ECS 服务名 |
| `NEXT_PUBLIC_API_URL_STAGING` | `https://cms-staging.busrom.com/api/graphql` | Staging API URL |

#### Production 环境 Secrets

| Secret Name | 值 | 说明 |
|------------|---|-----|
| `ECR_REPOSITORY_CMS_PRODUCTION` | `busrom-cms-production` | CMS ECR 仓库名 |
| `ECR_REPOSITORY_WEB_PRODUCTION` | `busrom-web-production` | Web ECR 仓库名 |
| `ECS_CLUSTER_PRODUCTION` | `busrom-cluster-production` | ECS 集群名 |
| `ECS_SERVICE_CMS_PRODUCTION` | `busrom-cms-production` | CMS ECS 服务名 |
| `ECS_SERVICE_WEB_PRODUCTION` | `busrom-web-production` | Web ECS 服务名 |
| `NEXT_PUBLIC_API_URL_PRODUCTION` | `https://cms.busrom.com/api/graphql` | Production API URL |

---

### 步骤 6: 配置 DNS（使用 Cloudflare）

#### Staging 环境

在 Cloudflare 中添加 CNAME 记录：

```
Type: CNAME
Name: staging
Target: busrom-alb-staging-123456789.us-east-1.elb.amazonaws.com
Proxy status: DNS only (灰色云朵)

Type: CNAME
Name: cms-staging
Target: busrom-alb-staging-123456789.us-east-1.elb.amazonaws.com
Proxy status: DNS only (灰色云朵)
```

#### Production 环境

```
Type: CNAME
Name: www
Target: busrom-alb-production-123456789.us-east-1.elb.amazonaws.com
Proxy status: Proxied (橙色云朵)

Type: CNAME
Name: cms
Target: busrom-alb-production-123456789.us-east-1.elb.amazonaws.com
Proxy status: Proxied (橙色云朵)
```

---

### 步骤 7: 首次部署

配置完成后，只需推送代码即可触发自动部署：

```bash
# 部署到 Staging（推送到 develop 分支）
git checkout develop
git add .
git commit -m "feat: Initial AWS deployment setup"
git push origin develop

# 部署到 Production（推送到 main 分支）
git checkout main
git merge develop
git push origin main
```

GitHub Actions 会自动：
1. 构建 Docker 镜像
2. 推送镜像到 ECR
3. 更新 ECS 任务定义
4. 部署到 ECS Fargate
5. 等待服务稳定

查看部署进度：
- 访问 GitHub 仓库 → **Actions** 标签页
- 点击最新的 workflow run

---

## 🔐 GitHub Secrets 配置清单

### 快速配置脚本

你可以使用以下命令快速获取所需的值：

```bash
# 获取 AWS Account ID
aws sts get-caller-identity --query Account --output text

# 获取 ECR 仓库名（自动从配置文件读取）
source .aws-infrastructure-staging.env
echo "CMS ECR: $CMS_ECR_REPOSITORY"
echo "Web ECR: $WEB_ECR_REPOSITORY"
echo "ECS Cluster: $ECS_CLUSTER"
```

### 完整 Secrets 列表

创建一个文件 `github-secrets.txt` 来跟踪所有需要配置的 Secrets：

```bash
# 通用 Secrets
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxx...
AWS_REGION=us-east-1

# Staging Secrets
ECR_REPOSITORY_CMS_STAGING=busrom-cms-staging
ECR_REPOSITORY_WEB_STAGING=busrom-web-staging
ECS_CLUSTER_STAGING=busrom-cluster-staging
ECS_SERVICE_CMS_STAGING=busrom-cms-staging
ECS_SERVICE_WEB_STAGING=busrom-web-staging
NEXT_PUBLIC_API_URL_STAGING=https://cms-staging.busrom.com/api/graphql

# Production Secrets
ECR_REPOSITORY_CMS_PRODUCTION=busrom-cms-production
ECR_REPOSITORY_WEB_PRODUCTION=busrom-web-production
ECS_CLUSTER_PRODUCTION=busrom-cluster-production
ECS_SERVICE_CMS_PRODUCTION=busrom-cms-production
ECS_SERVICE_WEB_PRODUCTION=busrom-web-production
NEXT_PUBLIC_API_URL_PRODUCTION=https://cms.busrom.com/api/graphql
```

**注意**: 不要提交这个文件到 Git！将其添加到 `.gitignore`。

---

## 🔧 配置 SSL 证书（可选但推荐）

### 方式 1: 使用 AWS Certificate Manager (ACM)

1. 登录 [AWS ACM Console](https://console.aws.amazon.com/acm/)
2. 点击 "Request a certificate"
3. 选择 "Request a public certificate"
4. 添加域名:
   - `*.busrom.com`
   - `busrom.com`
5. 选择 DNS validation
6. 在 Cloudflare 中添加验证记录
7. 等待证书颁发
8. 在 ALB 添加 HTTPS listener (端口 443)
9. 将 HTTP (端口 80) 重定向到 HTTPS

### 方式 2: 使用 Cloudflare SSL（推荐）

如果使用 Cloudflare，可以直接启用 Cloudflare 的 SSL：

1. Cloudflare Dashboard → SSL/TLS
2. 选择 "Full" 或 "Full (strict)"
3. 启用 "Always Use HTTPS"
4. 启用 "Automatic HTTPS Rewrites"

---

## 📊 监控和日志

### 查看 ECS 服务状态

```bash
# 查看 Staging 环境
aws ecs describe-services \
  --cluster busrom-cluster-staging \
  --services busrom-cms-staging busrom-web-staging \
  --region us-east-1

# 查看 Production 环境
aws ecs describe-services \
  --cluster busrom-cluster-production \
  --services busrom-cms-production busrom-web-production \
  --region us-east-1
```

### 查看 CloudWatch 日志

```bash
# 查看 CMS 日志（最新 10 条）
aws logs tail /ecs/busrom-cms-staging --follow --region us-east-1

# 查看 Web 日志（最新 10 条）
aws logs tail /ecs/busrom-web-staging --follow --region us-east-1
```

### 访问 CloudWatch Dashboard

1. 登录 [AWS CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. 选择 **Log groups**
3. 找到 `/ecs/busrom-cms-staging` 和 `/ecs/busrom-web-staging`
4. 点击查看详细日志

---

## 🐛 故障排查

### 问题 1: ECS 任务启动失败

**症状**: ECS 服务显示任务不断重启

**可能原因**:
- 环境变量配置错误
- 数据库连接失败
- 镜像构建问题

**解决方法**:
```bash
# 查看任务失败原因
aws ecs describe-tasks \
  --cluster busrom-cluster-staging \
  --tasks TASK_ID \
  --region us-east-1

# 查看容器日志
aws logs tail /ecs/busrom-cms-staging --follow --region us-east-1
```

---

### 问题 2: 无法访问 ALB

**症状**: 访问 ALB DNS 返回 503 或超时

**可能原因**:
- 安全组配置错误
- 健康检查失败
- 容器端口配置错误

**解决方法**:
```bash
# 检查目标组健康状态
aws elbv2 describe-target-health \
  --target-group-arn TARGET_GROUP_ARN \
  --region us-east-1

# 检查安全组规则
aws ec2 describe-security-groups \
  --group-ids sg-xxx \
  --region us-east-1
```

---

### 问题 3: GitHub Actions 部署失败

**症状**: GitHub Actions workflow 失败

**可能原因**:
- GitHub Secrets 配置错误
- AWS 权限不足
- ECR 镜像推送失败

**解决方法**:
1. 检查 GitHub Actions 日志
2. 验证 AWS Secrets:
   ```bash
   aws sts get-caller-identity
   ```
3. 检查 IAM 用户权限
4. 重新触发 workflow

---

### 问题 4: 数据库连接失败

**症状**: CMS 容器日志显示数据库连接错误

**可能原因**:
- DATABASE_URL 配置错误
- RDS 安全组未允许 ECS 访问
- RDS 实例未启动

**解决方法**:
```bash
# 验证 RDS 状态
aws rds describe-db-instances \
  --db-instance-identifier busrom-db-staging \
  --region us-east-1

# 检查安全组
# 确保 ECS 安全组可以访问 RDS 的 5432 端口

# 测试数据库连接（从本地）
psql "postgresql://busrom_admin:password@busrom-db-staging.abc123.us-east-1.rds.amazonaws.com:5432/busrom_cms"
```

---

## 🎯 后续优化建议

### 1. 自动扩展

配置 ECS Auto Scaling：
```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/busrom-cluster-production/busrom-web-production \
  --min-capacity 2 \
  --max-capacity 10
```

### 2. 数据库备份

启用 RDS 自动备份：
- Backup retention period: 7 days
- Backup window: 02:00-03:00 UTC
- Enable automated backups

### 3. CloudFront CDN

为 S3 媒体文件配置 CloudFront 分发。

### 4. 成本优化

- 使用 AWS Compute Savings Plans
- 定期审查 CloudWatch 日志保留策略
- 使用 S3 Lifecycle 策略归档旧文件

---

## 📚 参考资源

- [AWS ECS 文档](https://docs.aws.amazon.com/ecs/)
- [AWS Fargate 定价](https://aws.amazon.com/fargate/pricing/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Keystone.js 部署指南](https://keystonejs.com/docs/guides/deployment)

---

## 📞 支持

如有问题，请参考：
- **项目文档**: `docs/` 目录
- **GitHub Issues**: 提交问题和 bug 报告

---

**最后更新**: 2025-11-16
**版本**: 2.0.0
