# 08 MinIO + Nginx 本地开发配置指南

**文档版本**: v1.0
**创建日期**: 2025-11-05
**适用环境**: 开发环境 / 生产环境

---

## 📋 概述

使用 **MinIO (S3兼容对象存储) + Nginx (CDN反代)** 可以完全替代 AWS S3 + CloudFront，实现:

- ✅ 图片自动优化和变体生成
- ✅ CDN加速访问
- ✅ 成本更低(自建服务器)
- ✅ 完全兼容S3 API
- ✅ 本地开发环境友好

---

## 🏗️ 架构图

```
┌─────────────┐
│  Keystone   │
│     CMS     │
└──────┬──────┘
       │ Upload
       ↓
┌─────────────┐     ┌─────────────┐
│   MinIO     │────→│   Nginx     │
│  (S3 API)   │     │  (反代CDN)  │
└─────────────┘     └──────┬──────┘
                           │
                           ↓
                    ┌─────────────┐
                    │   Browser   │
                    │  (访问图片)  │
                    └─────────────┘
```

**访问路径:**
1. CMS上传图片 → MinIO (端口9000)
2. 生成变体 → MinIO存储
3. 前端访问 → Nginx (端口80/443) → MinIO
4. 浏览器获取 → 优化后的图片

---

## 🚀 快速开始 (Docker Compose)

### 步骤1: 创建Docker Compose配置

你的项目已经有 `docker-compose.yml`，我们需要添加MinIO和Nginx服务。

<function_calls>
<invoke name="Read">
<parameter name="file_path">/Users/cerfbaleine/workspace/busrom-work/docker-compose.yml