# 🚀 Busrom AWS Deployment Guide

> **部署方案**: GitHub + AWS Copilot + Terraform 混合架构
> **目标环境**: AWS ECS Fargate + RDS + S3 + CloudFront

---

## 📋 目录

- [架构概览](#架构概览)
- [前置准备](#前置准备)
- [第一步：环境准备](#第一步环境准备)
- [第二步：AWS 基础设施](#第二步aws-基础设施)
- [第三步：使用 Copilot 部署](#第三步使用-copilot-部署)
- [第四步：配置域名和 SSL](#第四步配置域名和-ssl)
- [交付清单](#交付清单)

---

## 🏗️ 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                        Cloudflare                           │
│            (DNS + IP Filtering + SSL)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                     CloudFront CDN                          │
│              (静态资源 + 全球加速)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
┌────────▼────────┐     ┌────────▼────────┐
│   ECS Service   │     │   ECS Service   │
│   (CMS - 3000)  │     │   (Web - 3001)  │
│  Payload CMS    │     │    Next.js      │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │                       │
┌────────▼────────┐     ┌────────▼────────┐
│   RDS Postgres  │     │      S3         │
│   (Database)    │     │   (Media)       │
└─────────────────┘     └─────────────────┘
```

---

## 📝 前置准备

### 1. 必需的账号和工具

- ✅ **AWS 账号** - 确保有创建资源的权限
- ✅ **GitHub Organization** - 代码托管
- ✅ **AWS CLI** - 已安装并配置
- ✅ **AWS Copilot CLI** - 用于管理 ECS
- ✅ **Terraform** (可选) - 用于管理基础设施

### 2. 安装 AWS Copilot CLI

```bash
# macOS
brew install aws/tap/copilot-cli

# Linux
sudo curl -Lo /usr/local/bin/copilot https://github.com/aws/copilot-cli/releases/latest/download/copilot-linux
sudo chmod +x /usr/local/bin/copilot

# Windows
scoop install aws-copilot
```

### 3. 配置 AWS CLI

```bash
aws configure
# AWS Access Key ID: [你的 Access Key]
# AWS Secret Access Key: [你的 Secret Key]
# Default region name: us-east-1
# Default output format: json
```

---

## 🔧 第一步：环境准备

### 1.1 克隆仓库

```bash
# 克隆仓库
git clone https://github.com/YOUR-ORG/busrom.git
cd busrom
```

### 1.2 准备环境变量

为生产环境创建 `.env.production` 文件：

**cms/.env.production**:
```bash
# Database
# 使用与 CMS 相同的数据库实例，但不同的数据库名
DATABASE_URL=postgresql://username:***@rds-endpoint:5432/busrom_cdp

# 如果使用同一数据库实例，只需确保数据库名不同
# 例如：busrom_cms (CMS), busrom_cdp (CDP), busrom_web (Web)

# AWS S3 Storage
USE_MINIO=false
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=busrom-media-prod
S3_REGION=us-east-1
# S3_ENDPOINT 留空使用 AWS S3

# CloudFront CDN
CDN_DOMAIN=https://d1234567890.cloudfront.net

# Keystone Session Secret (生成新的!)
SESSION_SECRET=$(openssl rand -base64 32)

# Application URLs
WEB_URL=https://www.busrom.com

# Node Environment
NODE_ENV=production
```

**web/.env.production**:
```bash
# API Endpoint
NEXT_PUBLIC_API_URL=https://cms.busrom.com/api/graphql

# Node Environment
NODE_ENV=production
```

---

## 🏗️ 第二步：AWS 基础设施

### 2.1 创建 S3 存储桶

```bash
# 创建 S3 存储桶
aws s3 mb s3://busrom-media-prod --region us-east-1

# 配置 CORS
aws s3api put-bucket-cors --bucket busrom-media-prod --cors-configuration file://s3-cors.json
```

**s3-cors.json**:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://www.busrom.com", "https://cms.busrom.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 2.2 创建 CloudFront 分配

1. 登录 AWS Console → CloudFront
2. 创建新分配：
   - Origin: `busrom-media-prod.s3.us-east-1.amazonaws.com`
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Cache Policy: CachingOptimized
3. 记录分配域名（如 `d1234567890.cloudfront.net`）

### 2.3 创建 RDS PostgreSQL

```bash
# 使用 AWS Console 或 Terraform 创建
# 配置建议：
# - Instance: db.t3.micro (开发) / db.t3.small (生产)
# - PostgreSQL 15+
# - 启用自动备份
# - 启用多可用区（生产环境）
```

---

## 🚀 第三步：使用 Copilot 部署

### 3.1 初始化 Copilot 应用

```bash
# 初始化应用
copilot app init busrom

# 创建 CMS 服务
copilot svc init \
  --name cms \
  --svc-type "Load Balanced Web Service" \
  --dockerfile ./Dockerfile.cms \
  --port 3000

# 创建 Web 服务
copilot svc init \
  --name web \
  --svc-type "Load Balanced Web Service" \
  --dockerfile ./Dockerfile.web \
  --port 3001
```

### 3.2 配置环境变量

编辑 `copilot/cms/manifest.yml`:
```yaml
name: cms
type: Load Balanced Web Service

image:
  build:
    dockerfile: ./Dockerfile.cms
    context: .
  port: 3000

cpu: 512
memory: 1024
count: 1

variables:
  NODE_ENV: production
  USE_MINIO: false
  S3_REGION: us-east-1
  S3_BUCKET_NAME: busrom-media-prod

secrets:
  DATABASE_URL: /copilot/busrom/production/cms/DATABASE_URL
  SESSION_SECRET: /copilot/busrom/production/cms/SESSION_SECRET
  S3_ACCESS_KEY_ID: /copilot/busrom/production/cms/S3_ACCESS_KEY_ID
  S3_SECRET_ACCESS_KEY: /copilot/busrom/production/cms/S3_SECRET_ACCESS_KEY
  CDN_DOMAIN: /copilot/busrom/production/cms/CDN_DOMAIN

http:
  path: '/'
  healthcheck:
    path: /api/health
    success_codes: '200'
    interval: 30s
    timeout: 10s
    healthy_threshold: 2
    unhealthy_threshold: 3
```

### 3.3 存储密钥到 AWS Secrets Manager

```bash
# 存储数据库连接字符串
aws secretsmanager create-secret \
  --name /copilot/busrom/production/cms/DATABASE_URL \
  --secret-string "postgresql://username:password@rds-endpoint:5432/busrom_cms"

# 存储会话密钥
aws secretsmanager create-secret \
  --name /copilot/busrom/production/cms/SESSION_SECRET \
  --secret-string "$(openssl rand -base64 32)"

# 存储 S3 访问密钥
aws secretsmanager create-secret \
  --name /copilot/busrom/production/cms/S3_ACCESS_KEY_ID \
  --secret-string "AKIA..."

aws secretsmanager create-secret \
  --name /copilot/busrom/production/cms/S3_SECRET_ACCESS_KEY \
  --secret-string "..."

aws secretsmanager create-secret \
  --name /copilot/busrom/production/cms/CDN_DOMAIN \
  --secret-string "https://d1234567890.cloudfront.net"
```

### 3.4 部署服务

```bash
# 创建生产环境
copilot env init --name production --profile default

# 部署 CMS
copilot svc deploy --name cms --env production

# 部署 Web
copilot svc deploy --name web --env production
```

---

## 🌐 第四步：配置域名和 SSL

### 4.1 在 Cloudflare 配置 DNS

```
# A 记录
cms.busrom.com  →  CNAME to copilot-generated-alb.us-east-1.elb.amazonaws.com
www.busrom.com  →  CNAME to copilot-generated-alb.us-east-1.elb.amazonaws.com

# CloudFront CDN
cdn.busrom.com  →  CNAME to d1234567890.cloudfront.net
```

### 4.2 启用 IP 过滤（阻止中国大陆）

在 Cloudflare → Firewall Rules:
```
Expression:
  (ip.geoip.country eq "CN")

Action: Block
```

---

## ✅ 交付清单

### 给甲方的交付物

- ✅ **GitHub 仓库访问权限** - 邀请甲方管理员加入 Organization
- ✅ **AWS 账号配置文档** - RDS、S3、CloudFront 配置说明
- ✅ **环境变量清单** - 所有需要配置的环境变量
- ✅ **部署命令清单** - Copilot 部署步骤
- ✅ **监控和日志** - CloudWatch 配置
- ✅ **备份策略** - RDS 自动备份设置

### 仓库转移步骤

```bash
# 1. 在 GitHub Organization 设置中
# 2. 进入仓库 Settings → Transfer ownership
# 3. 输入甲方的 GitHub Organization 名称
# 4. 确认转移
```

---

## 📞 支持

如有问题，请联系技术团队：
- **Email**: support@busrom.com
- **Documentation**: 查看 `docs/` 目录

---

**最后更新**: 2025-11-16
**版本**: 1.0.0
