# GitHub Secrets 配置模板

> 在 GitHub 仓库中配置这些 Secrets 以启用自动部署

## 📍 如何配置

1. 进入 GitHub 仓库页面
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 按照下面的表格逐个添加

---

## 🔑 必需的 Secrets（所有环境通用）

| Secret Name | 示例值 | 如何获取 | 说明 |
|------------|-------|---------|------|
| `AWS_ACCESS_KEY_ID` | `AKIAIOSFODNN7EXAMPLE` | AWS IAM Console → Users → Security credentials | AWS 访问密钥 ID |
| `AWS_SECRET_ACCESS_KEY` | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | AWS IAM Console → Users → Security credentials | AWS 访问密钥（创建时显示一次） |

**获取步骤**:
```bash
# 1. 创建 IAM 用户（仅首次）
aws iam create-user --user-name github-actions-deployer

# 2. 附加必需的权限策略
aws iam attach-user-policy \
  --user-name github-actions-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess

aws iam attach-user-policy \
  --user-name github-actions-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess

# 3. 创建访问密钥
aws iam create-access-key --user-name github-actions-deployer

# 输出会显示 AccessKeyId 和 SecretAccessKey
```

---

## 🧪 Staging 环境 Secrets

### 基础配置

从 `.aws-infrastructure-staging.env` 文件中获取这些值：

```bash
# 读取配置文件
source .aws-infrastructure-staging.env

# 显示需要的值
echo "ECR_REPOSITORY_CMS_STAGING=${CMS_ECR_REPOSITORY}"
echo "ECR_REPOSITORY_WEB_STAGING=${WEB_ECR_REPOSITORY}"
echo "ECS_CLUSTER_STAGING=${ECS_CLUSTER}"
echo "ECS_SERVICE_CMS_STAGING=${CMS_SERVICE_NAME}"
echo "ECS_SERVICE_WEB_STAGING=${WEB_SERVICE_NAME}"
```

### Secrets 列表

| Secret Name | 示例值 | 说明 |
|------------|-------|------|
| `ECR_REPOSITORY_CMS_STAGING` | `busrom-cms-staging` | CMS Docker 镜像仓库名 |
| `ECR_REPOSITORY_WEB_STAGING` | `busrom-web-staging` | Web Docker 镜像仓库名 |
| `ECS_CLUSTER_STAGING` | `busrom-cluster-staging` | ECS 集群名称 |
| `ECS_SERVICE_CMS_STAGING` | `busrom-cms-staging` | CMS ECS 服务名 |
| `ECS_SERVICE_WEB_STAGING` | `busrom-web-staging` | Web ECS 服务名 |
| `NEXT_PUBLIC_API_URL_STAGING` | `https://cms-staging.busrom.com/api/graphql` | Staging 环境 API URL |

---

## 🚀 Production 环境 Secrets

### 基础配置

从 `.aws-infrastructure-production.env` 文件中获取这些值：

```bash
# 读取配置文件
source .aws-infrastructure-production.env

# 显示需要的值
echo "ECR_REPOSITORY_CMS_PRODUCTION=${CMS_ECR_REPOSITORY}"
echo "ECR_REPOSITORY_WEB_PRODUCTION=${WEB_ECR_REPOSITORY}"
echo "ECS_CLUSTER_PRODUCTION=${ECS_CLUSTER}"
echo "ECS_SERVICE_CMS_PRODUCTION=${CMS_SERVICE_NAME}"
echo "ECS_SERVICE_WEB_PRODUCTION=${WEB_SERVICE_NAME}"
```

### Secrets 列表

| Secret Name | 示例值 | 说明 |
|------------|-------|------|
| `ECR_REPOSITORY_CMS_PRODUCTION` | `busrom-cms-production` | CMS Docker 镜像仓库名 |
| `ECR_REPOSITORY_WEB_PRODUCTION` | `busrom-web-production` | Web Docker 镜像仓库名 |
| `ECS_CLUSTER_PRODUCTION` | `busrom-cluster-production` | ECS 集群名称 |
| `ECS_SERVICE_CMS_PRODUCTION` | `busrom-cms-production` | CMS ECS 服务名 |
| `ECS_SERVICE_WEB_PRODUCTION` | `busrom-web-production` | Web ECS 服务名 |
| `NEXT_PUBLIC_API_URL_PRODUCTION` | `https://cms.busrom.com/api/graphql` | Production 环境 API URL |

---

## 🛠️ 一键生成所有值的脚本

创建并运行这个脚本来生成所有需要的值：

```bash
#!/bin/bash
# scripts/generate-github-secrets.sh

echo "=========================================="
echo "GitHub Secrets Configuration"
echo "=========================================="
echo ""

# AWS Account Info
echo "## AWS Credentials ##"
echo "AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)"
echo "AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)"
echo ""

# Staging Environment
if [ -f ".aws-infrastructure-staging.env" ]; then
  source .aws-infrastructure-staging.env
  echo "## Staging Environment ##"
  echo "ECR_REPOSITORY_CMS_STAGING=${CMS_ECR_REPOSITORY}"
  echo "ECR_REPOSITORY_WEB_STAGING=${WEB_ECR_REPOSITORY}"
  echo "ECS_CLUSTER_STAGING=${ECS_CLUSTER}"
  echo "ECS_SERVICE_CMS_STAGING=${CMS_SERVICE_NAME}"
  echo "ECS_SERVICE_WEB_STAGING=${WEB_SERVICE_NAME}"
  echo "NEXT_PUBLIC_API_URL_STAGING=https://cms-staging.busrom.com/api/graphql"
  echo ""
fi

# Production Environment
if [ -f ".aws-infrastructure-production.env" ]; then
  source .aws-infrastructure-production.env
  echo "## Production Environment ##"
  echo "ECR_REPOSITORY_CMS_PRODUCTION=${CMS_ECR_REPOSITORY}"
  echo "ECR_REPOSITORY_WEB_PRODUCTION=${WEB_ECR_REPOSITORY}"
  echo "ECS_CLUSTER_PRODUCTION=${ECS_CLUSTER}"
  echo "ECS_SERVICE_CMS_PRODUCTION=${CMS_SERVICE_NAME}"
  echo "ECS_SERVICE_WEB_PRODUCTION=${WEB_SERVICE_NAME}"
  echo "NEXT_PUBLIC_API_URL_PRODUCTION=https://cms.busrom.com/api/graphql"
  echo ""
fi

echo "=========================================="
echo "Copy these values to GitHub Secrets"
echo "=========================================="
```

**使用方法**:
```bash
chmod +x scripts/generate-github-secrets.sh
./scripts/generate-github-secrets.sh > github-secrets-values.txt

# 查看生成的值
cat github-secrets-values.txt

# ⚠️ 注意: 这个文件包含敏感信息，不要提交到 Git！
```

---

## ✅ 验证清单

配置完成后，使用这个清单验证所有 Secrets 是否正确配置：

### 通用 Secrets
- [ ] `AWS_ACCESS_KEY_ID` - 已配置
- [ ] `AWS_SECRET_ACCESS_KEY` - 已配置

### Staging Secrets
- [ ] `ECR_REPOSITORY_CMS_STAGING` - 已配置
- [ ] `ECR_REPOSITORY_WEB_STAGING` - 已配置
- [ ] `ECS_CLUSTER_STAGING` - 已配置
- [ ] `ECS_SERVICE_CMS_STAGING` - 已配置
- [ ] `ECS_SERVICE_WEB_STAGING` - 已配置
- [ ] `NEXT_PUBLIC_API_URL_STAGING` - 已配置

### Production Secrets
- [ ] `ECR_REPOSITORY_CMS_PRODUCTION` - 已配置
- [ ] `ECR_REPOSITORY_WEB_PRODUCTION` - 已配置
- [ ] `ECS_CLUSTER_PRODUCTION` - 已配置
- [ ] `ECS_SERVICE_CMS_PRODUCTION` - 已配置
- [ ] `ECS_SERVICE_WEB_PRODUCTION` - 已配置
- [ ] `NEXT_PUBLIC_API_URL_PRODUCTION` - 已配置

---

## 🔒 安全建议

1. **定期轮换访问密钥**: 建议每 90 天轮换一次 AWS 访问密钥

2. **最小权限原则**: GitHub Actions IAM 用户只需要以下权限:
   - `AmazonECS_FullAccess`
   - `AmazonEC2ContainerRegistryFullAccess`
   - `CloudWatchLogsReadOnlyAccess`

3. **使用 IAM 角色（推荐）**: 如果可能，使用 OIDC 配置 GitHub Actions 直接使用 IAM 角色，而不是访问密钥

4. **监控访问**: 启用 AWS CloudTrail 监控 API 调用

---

## 🧪 测试配置

配置完成后，可以手动触发 GitHub Actions 来测试：

1. 进入 GitHub 仓库 → **Actions**
2. 选择 **Deploy to AWS ECS** workflow
3. 点击 **Run workflow**
4. 选择环境（staging 或 production）
5. 点击 **Run workflow** 按钮

如果配置正确，workflow 应该成功运行并部署应用。

---

## 📚 相关文档

- [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) - 完整部署指南
- [DEPLOYMENT.md](./DEPLOYMENT.md) - AWS Copilot 部署方案
- [.github/workflows/deploy-aws.yml](./.github/workflows/deploy-aws.yml) - GitHub Actions workflow 配置

---

**最后更新**: 2025-11-16
