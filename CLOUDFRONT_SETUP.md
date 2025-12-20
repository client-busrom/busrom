# CloudFront CDN 配置指南

> **配置日期**: 2025-12-20
> **状态**: 已部署，待 DNS 切换

---

## 架构概览

```
用户请求
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                     CloudFront CDN                          │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │  Web Distribution   │    │  CMS Distribution   │        │
│  │  E5GDR87P1XBMC     │    │  EU3G2SNBZF53K     │        │
│  │                     │    │                     │        │
│  │  d2jkvnz294w3dx    │    │  d3n8qjjwt9btd7    │        │
│  │  .cloudfront.net   │    │  .cloudfront.net   │        │
│  └─────────┬───────────┘    └──────────┬──────────┘        │
│            │                           │                    │
└────────────┼───────────────────────────┼────────────────────┘
             │                           │
             ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│            Application Load Balancer (ALB)                  │
│       busrom-alb-production-1295533190.us-east-1.elb       │
└─────────────────────────────────────────────────────────────┘
             │                           │
             ▼                           ▼
      ┌──────────────┐           ┌──────────────┐
      │  ECS Web     │           │  ECS CMS     │
      │  (Port 3001) │           │  (Port 3000) │
      └──────────────┘           └──────────────┘
```

---

## CloudFront 分发配置

### 1. Web 分发 (www.busromhouse.com)

| 属性 | 值 |
|------|-----|
| **Distribution ID** | `E5GDR87P1XBMC` |
| **CloudFront Domain** | `d2jkvnz294w3dx.cloudfront.net` |
| **状态** | ✅ Deployed |
| **SSL 证书** | `*.busromhouse.com` (ACM) |
| **HTTP 版本** | HTTP/2 + HTTP/3 |

**缓存行为:**

| 路径 | 缓存策略 | TTL |
|------|----------|-----|
| `/_next/static/*` | CachingOptimized | 1年 (不可变) |
| `/*` (默认) | CachingDisabled | 透传到 Origin |

### 2. CMS 分发 (cms.busromhouse.com)

| 属性 | 值 |
|------|-----|
| **Distribution ID** | `EU3G2SNBZF53K` |
| **CloudFront Domain** | `d3n8qjjwt9btd7.cloudfront.net` |
| **状态** | ✅ Deployed |
| **SSL 证书** | `*.busromhouse.com` (ACM) |

**缓存行为:**

| 路径 | 缓存策略 | TTL |
|------|----------|-----|
| `/api/globals/*` | Busrom-CMS-API-Cache-Policy | 60秒 |
| `/api/home*` | Busrom-CMS-API-Cache-Policy | 60秒 |
| `/*` (默认) | CachingDisabled | 透传到 Origin |

**自定义缓存策略 (ID: `1396f7b2-7ad6-4b3e-a6dd-9d2eca2e097d`):**
- DefaultTTL: 60秒
- MaxTTL: 300秒
- 缓存键包含: `locale`, `depth`, `limit` 查询参数

---

## DNS 配置 (待完成)

需要在 Cloudflare 中更新以下 DNS 记录:

### 当前配置 (直接指向 ALB)
```
www.busromhouse.com -> CNAME -> busrom-alb-production-xxx.elb.amazonaws.com
cms.busromhouse.com -> CNAME -> busrom-alb-production-xxx.elb.amazonaws.com
```

### 目标配置 (通过 CloudFront)
```
www.busromhouse.com -> CNAME -> d2jkvnz294w3dx.cloudfront.net
cms.busromhouse.com -> CNAME -> d3n8qjjwt9btd7.cloudfront.net
```

**Cloudflare 设置:**
1. 登录 Cloudflare Dashboard
2. 选择 busromhouse.com 域名
3. 进入 DNS 设置
4. 更新记录:
   - `www` -> CNAME -> `d2jkvnz294w3dx.cloudfront.net` (Proxy 关闭)
   - `cms` -> CNAME -> `d3n8qjjwt9btd7.cloudfront.net` (Proxy 关闭)

> **重要**: 建议关闭 Cloudflare Proxy (橙色云朵变灰色)，让 CloudFront 直接处理 CDN

---

## 缓存预热

### 手动预热
```bash
./scripts/cache-warmup.sh
```

### 自动预热
部署后会自动执行缓存预热 (见 `.github/workflows/deploy-aws.yml`)

---

## 缓存失效

当 CMS 内容更新后，可以手动清除 CloudFront 缓存:

```bash
# 清除 Web 分发的所有缓存
aws cloudfront create-invalidation \
  --distribution-id E5GDR87P1XBMC \
  --paths "/*"

# 清除 CMS 分发的 API 缓存
aws cloudfront create-invalidation \
  --distribution-id EU3G2SNBZF53K \
  --paths "/api/*"
```

---

## 性能对比

### 预期改进

| 指标 | 改进前 | 改进后 (预期) |
|------|--------|--------------|
| **静态资源 TTFB** | 6-7秒 | <100ms |
| **静态资源下载** | 80-100秒 | 1-3秒 |
| **CMS API TTFB** | 2-6秒 | <100ms (缓存命中) |
| **首页总加载** | 2分钟+ | 5-10秒 |

---

## 监控

### CloudWatch 指标
- 请求数: `CloudFront > Requests`
- 缓存命中率: `CloudFront > CacheHitRate`
- 错误率: `CloudFront > 4xxErrorRate`, `5xxErrorRate`

### 验证命令
```bash
# 测试 CloudFront 响应
curl -sI "https://d2jkvnz294w3dx.cloudfront.net/en" | head -20

# 检查缓存状态 (X-Cache header)
curl -sI "https://d2jkvnz294w3dx.cloudfront.net/_next/static/chunks/webpack-xxx.js" | grep -i "x-cache"
```

---

## 故障排查

### 503 Service Unavailable
- 检查 Origin (ALB) 是否可访问
- 检查 ECS 服务是否健康

### 缓存未命中
- 确认缓存策略配置正确
- 检查 `Vary` 响应头

### SSL 证书错误
- 确认 ACM 证书在 us-east-1 区域
- 确认证书包含所需域名

---

## 相关资源

- [AWS CloudFront 文档](https://docs.aws.amazon.com/cloudfront/)
- [缓存预热脚本](./scripts/cache-warmup.sh)
- [部署工作流](./.github/workflows/deploy-aws.yml)
