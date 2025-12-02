# Scripts Inventory - 脚本文件清单

> 生成时间: 2024-12-02
> 用途: 整理项目中的临时脚本，标记可删除的文件
> ✅ = 建议保留 | ❌ = 建议删除（一次性/已完成任务）

---

## 根目录 `/` (11个)

| 文件 | 日期 | 用途 | 建议 | 删除 |
|------|------|------|:----:|:----:|
| `quick-test-sitemap.sh` | 11-05 | 快速测试 sitemap | ❌ 一次性测试 | [ ] |
| `test-sitemap.sh` | 11-05 | 测试 sitemap 功能 | ❌ 一次性测试 | [ ] |
| `clear-staging-users.js` | 11-20 | 清理 staging 用户 | ❌ 一次性 | [ ] |
| `fix-admin.sql` | 11-20 | 修复管理员 SQL | ❌ 已执行 | [ ] |
| `setup-staging-hosts.sh` | 11-20 | 设置 staging hosts | ❌ 一次性 | [ ] |
| `test-pdf-upload.sh` | 11-21 | 测试 PDF 上传 | ❌ 一次性测试 | [ ] |
| `fix-production-migration.sh` | 11-22 | 修复生产迁移 | ❌ 已执行 | [ ] |
| `update-media-combination.js` | 11-22 | 更新 Media 组合元数据 | ❌ 已执行 | [ ] |
| `update-media-direct-sql.js` | 11-22 | 直接 SQL 更新 Media | ❌ 已执行 | [ ] |
| `update-via-graphql-admin.js` | 11-22 | GraphQL 更新 Media | ❌ 已执行 | [ ] |
| `sync-media-tags-filter.js` | 11-27 | 同步 tags 到 tagsFilter | ❌ 已执行 | [ ] |

---

## `/scripts` 目录 (38个)

### AWS/部署 - ✅ 建议保留

| 文件 | 日期 | 用途 | 删除 |
|------|------|------|:----:|
| `setup-aws-infrastructure.sh` | 11-20 | AWS 基础设施设置 | [ ] |
| `setup-ecs-services.sh` | 11-20 | ECS 服务设置 | [ ] |
| `attach-managed-policies.sh` | 11-20 | 附加托管策略 | [ ] |
| `attach-iam-policy.sh` | 11-20 | 附加 IAM 策略 | [ ] |
| `attach-full-permissions.sh` | 11-20 | 附加完整权限 | [ ] |
| `generate-github-secrets.sh` | 11-20 | 生成 GitHub secrets | [ ] |
| `setup-secrets.sh` | 11-20 | 设置密钥 | [ ] |
| `deploy-to-aws.sh` | 11-21 | 部署到 AWS | [ ] |

### 一次性脚本 - ❌ 建议删除

| 文件 | 日期 | 用途 | 删除 |
|------|------|------|:----:|
| `seed-contactform.ts` | 11-05 | 种子联系表单 | [ ] |
| `test-minio-setup.sh` | 11-05 | 测试 MinIO | [ ] |
| `fix-dependencies.sh` | 11-05 | 修复依赖 | [ ] |
| `seed-formconfig.ts` | 11-11 | 种子表单配置 | [ ] |
| `check-formconfig.ts` | 11-11 | 检查表单配置 | [ ] |
| `fix-formconfig-status.ts` | 11-11 | 修复表单配置状态 | [ ] |
| `seed-products.ts` | 11-13 | 种子产品（旧版） | [ ] |
| `check-file-upload-setup.sh` | 11-21 | 检查文件上传设置 | [ ] |
| `deploy-footer-update.sh` | 11-21 | 部署 footer 更新 | [ ] |
| `update-combination-metadata.js` | 11-22 | 更新组合元数据 | [ ] |
| `update-combination-metadata-graphql.js` | 11-22 | GraphQL 更新组合元数据 | [ ] |
| `migrate-metadata-to-combination.js` | 11-22 | 迁移元数据到组合 | [ ] |
| `batch-upload-with-variants.ts` | 11-23 | 批量上传变体 | [ ] |
| `batch-import-from-s3.ts` | 11-23 | S3 批量导入 | [ ] |
| `generate-metadata-configs.ts` | 11-23 | 生成元数据配置 | [ ] |
| `setup-aws-cli-for-minio.sh` | 11-23 | 配置 AWS CLI for MinIO | [ ] |
| `clear-media-only.js` | 11-24 | 清理 Media 表 | [ ] |
| `enhance-metadata-configs.js` | 11-24 | 增强元数据配置 | [ ] |
| `verify-import-completion.js` | 11-24 | 验证导入完成 | [ ] |
| `migrate-metadata.js` | 11-26 | 迁移元数据 | [ ] |
| `update-image-dimensions.js` | 11-26 | 更新图片尺寸 | [ ] |
| `trigger-media-hooks.js` | 11-26 | 触发媒体钩子 | [ ] |
| `update-variants-urls-to-cdn.js` | 11-26 | 更新变体 URL 到 CDN | [ ] |
| `fix-imported-media-simple.js` | 11-26 | 简化版修复导入媒体 | [ ] |
| `fix-imported-media.js` | 11-26 | 修复导入媒体 | [ ] |
| `generate-variants.js` | 11-26 | 生成变体 | [ ] |
| `batch-import-from-s3-simple.js` | 11-26 | 简化版 S3 导入 | [ ] |
| `generate-all-variants.js` | 11-26 | 生成所有变体 | [ ] |
| `fix-imported-media-complete.js` | 11-26 | 完整版修复导入媒体 | [ ] |
| `batch-import-keystone-correct.js` | 11-26 | 正确的 Keystone 导入 | [ ] |

---

## `/cms` 根目录 (11个)

| 文件 | 日期 | 用途 | 建议 | 删除 |
|------|------|------|:----:|:----:|
| `test-db-connection.js` | 11-01 | 测试数据库连接 | ❌ 一次性 | [ ] |
| `test-media-create.sh` | 11-08 | 测试媒体创建 | ❌ 一次性 | [ ] |
| `disable-admin-2fa.js` | 11-16 | 禁用管理员 2FA | ✅ 紧急工具 | [ ] |
| `clear-staging-users.js` | 11-20 | 清理 staging 用户 | ❌ 重复 | [ ] |
| `fix-user-admin.js` | 11-20 | 修复用户管理员 | ❌ 已执行 | [ ] |
| `fix-admin.js` | 11-20 | 修复管理员 | ❌ 已执行 | [ ] |
| `fix-admin-direct.js` | 11-20 | 直接修复管理员 | ❌ 已执行 | [ ] |
| `check-form-files.sh` | 11-21 | 检查表单文件 | ❌ 一次性 | [ ] |
| `update-media-batch.js` | 11-22 | 批量更新媒体 | ❌ 已执行 | [ ] |
| `start-cms.sh` | 11-22 | 启动 CMS | ✅ 核心脚本 | [ ] |
| `check-2fa.js` | 11-25 | 检查 2FA 状态 | ❌ 调试用 | [ ] |

---

## `/cms/scripts` 目录 (72个)

### ✅ 核心 Seed 脚本 - 建议保留

| 文件 | 日期 | 用途 | 删除 |
|------|------|------|:----:|
| `seed-navigation-system.ts` | 11-12 | 种子导航系统 | [ ] |
| `seed-product-system.ts` | 11-12 | 种子产品系统 | [ ] |
| `seed-permissions-system.ts` | 11-15 | 种子权限系统 | [ ] |
| `seed-media-system.ts` | 11-28 | 种子媒体系统 | [ ] |
| `seed-home-content.js` | 11-29 | 种子首页内容 | [ ] |
| `startup.sh` | 11-20 | ECS 启动脚本 | [ ] |
| `make-admin.ts` | 11-05 | 设置管理员 | [ ] |
| `make-admin.sql` | 11-05 | 设置管理员 SQL | [ ] |

### ❌ 早期一次性脚本 (11月初) - 建议删除

| 文件 | 日期 | 用途 | 删除 |
|------|------|------|:----:|
| `deploy-setup.sh` | 11-04 | 部署设置 | [ ] |
| `reset-navigation-to-initial.ts` | 11-05 | 重置导航 | [ ] |
| `reset-navigation-to-initial.sh` | 11-05 | 重置导航 Shell | [ ] |
| `regenerate-variants.ts` | 11-05 | 重新生成变体 | [ ] |
| `verify-gmail-auth.js` | 11-05 | 验证 Gmail | [ ] |
| `backup-and-reset-navigation.ts` | 11-05 | 备份重置导航 | [ ] |
| `restore-navigation-backup.ts` | 11-05 | 恢复导航备份 | [ ] |
| `reset-navigation-order.ts` | 11-05 | 重置导航排序 | [ ] |
| `generate-missing-variants.ts` | 11-05 | 生成缺失变体 | [ ] |
| `test-email-config.ts` | 11-05 | 测试邮件配置 | [ ] |
| `test-contact-form.sh` | 11-05 | 测试联系表单 | [ ] |
| `test-smtp-connection.sh` | 11-05 | 测试 SMTP | [ ] |

### ❌ 11月中旬一次性脚本 - 建议删除

| 文件 | 日期 | 用途 | 删除 |
|------|------|------|:----:|
| `delete-all-products.ts` | 11-12 | 删除所有产品 | [ ] |
| `reseed-navigation.ts` | 11-12 | 重新种子导航 | [ ] |
| `seed-test-products.ts` | 11-12 | 种子测试产品 | [ ] |
| `seed-products-v2.js` | 11-13 | 种子产品 v2 | [ ] |
| `seed-products.js` | 11-13 | 种子产品 (JS) | [ ] |
| `seed-products.ts` | 11-13 | 种子产品 (TS) | [ ] |
| `check-media.ts` | 11-13 | 检查媒体 | [ ] |
| `fix-batch-uploaded-media.ts` | 11-13 | 修复批量上传媒体 | [ ] |
| `check-media-keystone.ts` | 11-13 | 检查 Keystone 媒体 | [ ] |
| `cleanup-old-permissions.ts` | 11-13 | 清理旧权限 | [ ] |
| `update-permission-categories.ts` | 11-13 | 更新权限分类 | [ ] |
| `update-pages-to-template.js` | 11-16 | 更新页面模板 | [ ] |
| `create-navigation-pages.js` | 11-16 | 创建导航页面 | [ ] |
| `patch-auth-pages.js` | 11-16 | 修补认证页面 | [ ] |
| `watch-and-patch-auth.js` | 11-16 | 监视修补认证 | [ ] |
| `fix-initial-user-admin.js` | 11-20 | 修复初始用户管理员 | [ ] |
| `update-combination-metadata.ts` | 11-22 | 更新组合元数据 | [ ] |
| `batch-import-keystone-correct.js` | 11-24 | Keystone 批量导入 | [ ] |

### ❌ 11月下旬一次性脚本 - 建议删除

| 文件 | 日期 | 用途 | 删除 |
|------|------|------|:----:|
| `sync-media-tags-filter.js` | 11-27 | 同步媒体标签 | [ ] |
| `seed-hero-banner-items.ts` | 11-27 | 种子 Hero Banner | [ ] |
| `seed-hero-banner-graphql.js` | 11-27 | GraphQL 种子 Banner | [ ] |
| `sync-filekey-to-fileid.ts` | 11-28 | 同步 fileKey 到 fileId | [ ] |
| `verify-scene-images.ts` | 11-28 | 验证场景图片 | [ ] |
| `sync-tags-to-tagsfilter.ts` | 11-28 | 同步 tags 到 tagsFilter | [ ] |
| `check-filter-ids.ts` | 11-28 | 检查过滤器 ID | [ ] |
| `check-minio-files.ts` | 11-28 | 检查 MinIO 文件 | [ ] |
| `update-product-series-tags-prisma.ts` | 11-28 | 更新产品系列标签 | [ ] |
| `create-applications.js` | 11-28 | 创建应用场景 | [ ] |
| `test-graphql-query.ts` | 11-28 | 测试 GraphQL 查询 | [ ] |
| `generate-variants-urls.ts` | 11-28 | 生成变体 URL | [ ] |
| `update-product-series-tags.ts` | 11-28 | 更新产品系列标签 | [ ] |
| `check-rectangular-media.ts` | 11-28 | 检查矩形媒体 | [ ] |
| `check-all-standoff-media.ts` | 11-28 | 检查所有 standoff 媒体 | [ ] |
| `check-glass-standoff-media.ts` | 11-28 | 检查 glass standoff 媒体 | [ ] |
| `update-scene-images-category.ts` | 11-28 | 更新场景图片分类 | [ ] |
| `verify-variants.ts` | 11-28 | 验证变体 | [ ] |
| `check-scene-tags.ts` | 11-28 | 检查场景标签 | [ ] |
| `debug-media-query.ts` | 11-28 | 调试媒体查询 | [ ] |
| `create-application-categories-prisma.js` | 11-28 | 创建应用分类 | [ ] |
| `fix-existing-scene-images.ts` | 11-28 | 修复现有场景图片 | [ ] |
| `seed-applications.js` | 11-28 | 种子应用场景 | [ ] |
| `import-local-scene-images.ts` | 11-28 | 导入本地场景图片 | [ ] |
| `clear-applications.js` | 11-28 | 清理应用场景 | [ ] |
| `cleanup-wrong-scene-imports.ts` | 11-28 | 清理错误场景导入 | [ ] |
| `import-missing-scene-images.js` | 11-28 | 导入缺失场景图片 | [ ] |
| `populate-fileurl.ts` | 11-29 | 填充 fileUrl | [ ] |
| `check-series-intro.ts` | 11-29 | 检查系列介绍 | [ ] |
| `check-standoff-intro-images.ts` | 11-29 | 检查 standoff 介绍图片 | [ ] |
| `update-series-intro.js` | 11-30 | 更新系列介绍 | [ ] |
| `update-series-intro-prisma.ts` | 11-30 | 更新系列介绍 Prisma | [ ] |

### ❌ 今天创建的合并脚本 - 任务完成后可删除

| 文件 | 日期 | 用途 | 删除 |
|------|------|------|:----:|
| `merge-handle-series.js` | 12-02 | 合并 handle 系列 (Prisma) | [ ] |
| `merge-handle-series-graphql.js` | 12-02 | 合并 handle 系列 (GraphQL) | [ ] |
| `merge-handle-series-complete.js` | 12-02 | 完整合并 handle 系列 | [ ] |

---

## 统计

| 目录 | 总数 | 建议保留 | 建议删除 |
|------|------|----------|----------|
| 根目录 | 11 | 0 | **11** |
| /scripts | 38 | 8 | **30** |
| /cms 根目录 | 11 | 2 | **9** |
| /cms/scripts | 72 | 8 | **64** |
| **总计** | **132** | **18** | **114** |

---

## 快速删除命令

完成标记后，运行以下命令删除所有标记的文件：

```bash
# 在确认无误后执行删除
# 请先让 Claude 生成具体的删除命令
```
