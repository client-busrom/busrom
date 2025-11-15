# ActivityLog 操作日志完善指南

**文档版本**: v1.0
**创建日期**: 2025-11-12
**优先级**: 🔴 高
**预计工作量**: 4-6小时

---

## 📋 概述

ActivityLog 数据模型已创建，但目前仅有 **User** 和 **Role** 两个模型集成了自动日志记录功能。

本文档提供完整的实施方案，为所有关键模型添加操作日志记录，实现：
- ✅ 安全审计追踪
- ✅ 操作历史记录
- ✅ 故障排查支持
- ✅ 数据变更回溯

---

## 🎯 实施目标

### 当前状态
- ✅ ActivityLog 数据模型已创建
- ✅ User 和 Role 已集成
- ❌ 其余 40+ 模型未集成

### 目标状态
- ✅ 10个高优先级模型完成集成
- ✅ 5个中优先级模型完成集成
- ⏳ 低优先级模型按需集成

---

## 📊 优先级分级

### 🔴 P0 - 高优先级（必须实现，预计3小时）

这些模型涉及核心业务、安全配置或全站影响，必须记录所有操作：

| 序号 | 模型 | 文件路径 | 记录操作 | 原因 |
|------|------|---------|---------|------|
| 1 | **SiteConfig** | `cms/schemas/SiteConfig.ts` | update | 全站配置，影响所有页面 |
| 2 | **CustomScript** | `cms/schemas/CustomScript.ts` | create/update/delete | 代码注入，安全风险高 |
| 3 | **Product** | `cms/schemas/Product.ts` | create/update/delete | 核心业务数据 |
| 4 | **ProductSeries** | `cms/schemas/ProductSeries.ts` | create/update/delete | 核心业务数据 |
| 5 | **SeoSetting** | `cms/schemas/SeoSetting.ts` | create/update/delete | SEO配置，影响搜索排名 |
| 6 | **NavigationMenu** | `cms/schemas/NavigationMenu.ts` | create/update/delete | 导航结构，影响用户体验 |
| 7 | **Media** | `cms/schemas/Media.ts` | create/delete | 文件管理，删除不可恢复 |
| 8 | **Blog** | `cms/schemas/Blog.ts` | create/update/delete | 内容发布 |
| 9 | **Application** | `cms/schemas/Application.ts` | create/update/delete | 案例内容 |
| 10 | **Page** | `cms/schemas/Page.ts` | create/update/delete | 页面管理 |

### 🟡 P1 - 中优先级（建议实现，预计1小时）

这些模型涉及内容管理和配置，建议记录关键操作：

| 序号 | 模型 | 文件路径 | 记录操作 | 原因 |
|------|------|---------|---------|------|
| 11 | **ContactForm** | `cms/schemas/ContactForm.ts` | delete | 防止误删客户数据 |
| 12 | **Footer** | `cms/schemas/Footer.ts` | update | 全站页脚配置 |
| 13 | **FormConfig** | `cms/schemas/FormConfig.ts` | create/update/delete | 表单配置 |
| 14 | **Category** | `cms/schemas/Category.ts` | create/update/delete | 分类管理 |
| 15 | **FaqItem** | `cms/schemas/FaqItem.ts` | create/update/delete | FAQ管理 |

### 🟢 P2 - 低优先级（可选，按需实现）

这些模型主要是首页组件和辅助内容，可按需添加：

- HomeContent 及各种首页组件（HeroBannerItem, ServiceFeaturesConfig 等）
- 翻译模型（ProductContentTranslation, BlogContentTranslation 等）
- MediaCategory, MediaTag
- DocumentTemplate, ReusableBlock
- Permission

---

## 🛠️ 技术实现方案

### 方案选择

我们采用 **方案1：逐个添加 + 辅助函数** 的混合方案：

**优点**：
- ✅ 精确控制记录内容
- ✅ 代码复用性高
- ✅ 性能可控
- ✅ 灵活定制

---

## 📝 实施步骤

### 第1步：创建通用日志工具函数

创建文件 `cms/lib/activity-logger.ts`：

```typescript
/**
 * Activity Logger Utility
 *
 * Provides helper functions to log operations to ActivityLog
 */

import { KeystoneContext } from '@keystone-6/core/types'

/**
 * Log an operation to ActivityLog
 *
 * @param context - Keystone context
 * @param operation - Operation type (create/update/delete)
 * @param entity - Entity name (e.g., "Product", "Blog")
 * @param item - The item being operated on
 * @param changes - Specific fields to log (optional, defaults to full item)
 */
export async function logActivity(
  context: KeystoneContext,
  operation: 'create' | 'update' | 'delete',
  entity: string,
  item: any,
  changes?: Record<string, any>
) {
  // Skip if no session (system operations or public API)
  if (!context.session?.itemId) {
    return
  }

  try {
    // Use changes if provided, otherwise log essential fields only
    const changeData = changes || extractEssentialFields(entity, item)

    await context.query.ActivityLog.createOne({
      data: {
        user: { connect: { id: context.session.itemId } },
        action: operation,
        entity,
        entityId: item.id,
        changes: JSON.stringify(changeData),
        ipAddress: (context as any).req?.ip || 'unknown',
        userAgent: (context as any).req?.headers?.['user-agent'] || 'unknown',
      },
    })

    console.log(`✅ Logged ${operation} operation on ${entity} ${item.id}`)
  } catch (error) {
    // Don't throw error to prevent blocking the operation
    console.error(`❌ Failed to log ${entity} activity:`, error)
  }
}

/**
 * Extract essential fields based on entity type
 *
 * This avoids logging sensitive or unnecessary data
 */
function extractEssentialFields(entity: string, item: any): Record<string, any> {
  const baseFields: Record<string, any> = {
    id: item.id,
  }

  // Entity-specific essential fields
  switch (entity) {
    case 'Product':
      return {
        ...baseFields,
        sku: item.sku,
        name: item.name,
        status: item.status,
        isFeatured: item.isFeatured,
      }

    case 'ProductSeries':
      return {
        ...baseFields,
        slug: item.slug,
        name: item.name,
        status: item.status,
      }

    case 'Blog':
      return {
        ...baseFields,
        slug: item.slug,
        title: item.title,
        status: item.status,
      }

    case 'Application':
      return {
        ...baseFields,
        slug: item.slug,
        name: item.name,
        status: item.status,
      }

    case 'Page':
      return {
        ...baseFields,
        slug: item.slug,
        title: item.title,
        status: item.status,
      }

    case 'Media':
      return {
        ...baseFields,
        filename: item.filename,
        filesize: item.filesize,
        mimeType: item.mimeType,
      }

    case 'SiteConfig':
      return {
        ...baseFields,
        siteName: item.siteName,
        // Don't log sensitive fields like SMTP passwords
      }

    case 'CustomScript':
      return {
        ...baseFields,
        name: item.name,
        enabled: item.enabled,
        scope: item.scope,
        // Don't log full script content (too large)
      }

    case 'SeoSetting':
      return {
        ...baseFields,
        pageType: item.pageType,
        title: item.title?.en,
      }

    case 'NavigationMenu':
      return {
        ...baseFields,
        label: item.label?.en,
        url: item.url,
        position: item.position,
        enabled: item.enabled,
      }

    case 'ContactForm':
      return {
        ...baseFields,
        name: item.name,
        email: item.email,
        status: item.status,
      }

    case 'Footer':
    case 'FormConfig':
      return {
        ...baseFields,
        // These are singletons, just log the ID
      }

    case 'Category':
      return {
        ...baseFields,
        slug: item.slug,
        name: item.name,
      }

    case 'FaqItem':
      return {
        ...baseFields,
        question: item.question?.en?.substring(0, 100), // First 100 chars
        published: item.published,
      }

    default:
      // For unknown entities, log minimal info
      return {
        ...baseFields,
        name: item.name,
        title: item.title,
        slug: item.slug,
      }
  }
}

/**
 * Convenience wrapper for create operations
 */
export async function logCreate(
  context: KeystoneContext,
  entity: string,
  item: any,
  changes?: Record<string, any>
) {
  return logActivity(context, 'create', entity, item, changes)
}

/**
 * Convenience wrapper for update operations
 */
export async function logUpdate(
  context: KeystoneContext,
  entity: string,
  item: any,
  changes?: Record<string, any>
) {
  return logActivity(context, 'update', entity, item, changes)
}

/**
 * Convenience wrapper for delete operations
 */
export async function logDelete(
  context: KeystoneContext,
  entity: string,
  item: any,
  changes?: Record<string, any>
) {
  return logActivity(context, 'delete', entity, item, changes)
}
```

---

### 第2步：为高优先级模型添加日志

#### 2.1 SiteConfig（最重要）

**文件**: `cms/schemas/SiteConfig.ts`

在 `hooks` 部分添加（如果没有hooks则创建）：

```typescript
import { logActivity } from '../lib/activity-logger'

export const SiteConfig = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      // SiteConfig is singleton, only log updates
      if (operation === 'update' && item) {
        await logActivity(context, 'update', 'SiteConfig', item)
      }
    },
  },

  // ... rest of config ...
})
```

---

#### 2.2 CustomScript（安全关键）

**文件**: `cms/schemas/CustomScript.ts`

```typescript
import { logActivity } from '../lib/activity-logger'

export const CustomScript = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if (['create', 'update', 'delete'].includes(operation) && item) {
        await logActivity(context, operation as any, 'CustomScript', item, {
          name: item.name,
          enabled: item.enabled,
          scope: item.scope,
          pageType: item.pageType,
          scriptPosition: item.scriptPosition,
          // Don't log script content (too large and potentially sensitive)
        })
      }
    },
  },

  // ... rest of config ...
})
```

---

#### 2.3 Product（已有hooks，需合并）

**文件**: `cms/schemas/Product.ts`

**注意**: Product 已有 IndexNow hooks，需要合并：

```typescript
import { logActivity } from '../lib/activity-logger'

export const Product = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      // Existing IndexNow logic
      if ((operation === 'create' || operation === 'update') && item?.status === 'PUBLISHED') {
        try {
          const productUrl = buildFullUrl(`/shop/${item.sku}`)
          await submitUrlToIndexNow(productUrl, context)
        } catch (error) {
          console.error('Error submitting to IndexNow:', error)
        }
      }

      // NEW: ActivityLog
      if (['create', 'update', 'delete'].includes(operation) && item) {
        await logActivity(context, operation as any, 'Product', item)
      }
    },
  },

  // ... rest of config ...
})
```

---

#### 2.4 ProductSeries

**文件**: `cms/schemas/ProductSeries.ts`

```typescript
import { logActivity } from '../lib/activity-logger'

export const ProductSeries = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      // Existing IndexNow logic (if any)
      if ((operation === 'create' || operation === 'update') && item?.status === 'PUBLISHED') {
        try {
          const seriesUrl = buildFullUrl(`/product/${item.slug}`)
          await submitUrlToIndexNow(seriesUrl, context)
        } catch (error) {
          console.error('Error submitting to IndexNow:', error)
        }
      }

      // NEW: ActivityLog
      if (['create', 'update', 'delete'].includes(operation) && item) {
        await logActivity(context, operation as any, 'ProductSeries', item)
      }
    },
  },

  // ... rest of config ...
})
```

---

#### 2.5 Blog（已有hooks，需合并）

**文件**: `cms/schemas/Blog.ts`

```typescript
import { logActivity } from '../lib/activity-logger'

export const Blog = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      // Existing IndexNow logic (if any)
      if ((operation === 'create' || operation === 'update') && item?.status === 'PUBLISHED') {
        try {
          const blogUrl = buildFullUrl(`/about-us/blog/${item.slug}`)
          await submitUrlToIndexNow(blogUrl, context)
        } catch (error) {
          console.error('Error submitting to IndexNow:', error)
        }
      }

      // NEW: ActivityLog
      if (['create', 'update', 'delete'].includes(operation) && item) {
        await logActivity(context, operation as any, 'Blog', item)
      }
    },
  },

  // ... rest of config ...
})
```

---

#### 2.6 Application（已有hooks，需合并）

**文件**: `cms/schemas/Application.ts`

```typescript
import { logActivity } from '../lib/activity-logger'

export const Application = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      // Existing IndexNow logic (if any)
      if ((operation === 'create' || operation === 'update') && item?.status === 'PUBLISHED') {
        try {
          const appUrl = buildFullUrl(`/service/application/${item.slug}`)
          await submitUrlToIndexNow(appUrl, context)
        } catch (error) {
          console.error('Error submitting to IndexNow:', error)
        }
      }

      // NEW: ActivityLog
      if (['create', 'update', 'delete'].includes(operation) && item) {
        await logActivity(context, operation as any, 'Application', item)
      }
    },
  },

  // ... rest of config ...
})
```

---

#### 2.7 Page

**文件**: `cms/schemas/Page.ts`

```typescript
import { logActivity } from '../lib/activity-logger'

export const Page = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      // IndexNow (if needed)
      if ((operation === 'create' || operation === 'update') && item?.status === 'PUBLISHED') {
        try {
          const pageUrl = buildFullUrl(`/${item.slug}`)
          await submitUrlToIndexNow(pageUrl, context)
        } catch (error) {
          console.error('Error submitting to IndexNow:', error)
        }
      }

      // NEW: ActivityLog
      if (['create', 'update', 'delete'].includes(operation) && item) {
        await logActivity(context, operation as any, 'Page', item)
      }
    },
  },

  // ... rest of config ...
})
```

---

#### 2.8 Media（已有hooks，需合并）

**文件**: `cms/schemas/Media.ts`

**注意**: Media 已有图片优化 hooks，需要合并：

```typescript
import { logActivity } from '../lib/activity-logger'

export const Media = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      // Existing image optimization logic
      if (operation === 'create' && item?.file?.url) {
        try {
          // Generate image variants...
          await generateImageVariants(item, context)
        } catch (error) {
          console.error('Error generating image variants:', error)
        }
      }

      // NEW: ActivityLog (only log create and delete, not update)
      if ((operation === 'create' || operation === 'delete') && item) {
        await logActivity(context, operation as any, 'Media', item, {
          filename: item.filename,
          filesize: item.filesize,
          mimeType: item.mimeType,
          url: item.file?.url,
        })
      }
    },
  },

  // ... rest of config ...
})
```

---

#### 2.9 SeoSetting

**文件**: `cms/schemas/SeoSetting.ts`

```typescript
import { logActivity } from '../lib/activity-logger'

export const SeoSetting = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if (['create', 'update', 'delete'].includes(operation) && item) {
        await logActivity(context, operation as any, 'SeoSetting', item)
      }
    },
  },

  // ... rest of config ...
})
```

---

#### 2.10 NavigationMenu

**文件**: `cms/schemas/NavigationMenu.ts`

```typescript
import { logActivity } from '../lib/activity-logger'

export const NavigationMenu = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if (['create', 'update', 'delete'].includes(operation) && item) {
        await logActivity(context, operation as any, 'NavigationMenu', item)
      }
    },
  },

  // ... rest of config ...
})
```

---

### 第3步：为中优先级模型添加日志

#### 3.1 ContactForm（已有hooks，需合并）

**文件**: `cms/schemas/ContactForm.ts`

**注意**: ContactForm 已有邮件发送 hooks，只需添加 delete 日志：

```typescript
import { logActivity } from '../lib/activity-logger'

export const ContactForm = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      // Existing email sending logic for create
      if (operation === 'create' && item) {
        try {
          console.log(`📧 Sending email notification for contact form: ${item.name}`)
          // ... email logic ...
        } catch (error) {
          console.error('Error sending email:', error)
        }
      }

      // NEW: ActivityLog for delete operations (to prevent accidental data loss)
      if (operation === 'delete' && item) {
        await logActivity(context, 'delete', 'ContactForm', item, {
          name: item.name,
          email: item.email,
          companyName: item.companyName,
          submittedAt: item.submittedAt,
        })
      }
    },
  },

  // ... rest of config ...
})
```

---

#### 3.2 Footer

**文件**: `cms/schemas/Footer.ts`

```typescript
import { logActivity } from '../lib/activity-logger'

export const Footer = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      // Footer is singleton, only log updates
      if (operation === 'update' && item) {
        await logActivity(context, 'update', 'Footer', item)
      }
    },
  },

  // ... rest of config ...
})
```

---

#### 3.3 FormConfig

**文件**: `cms/schemas/FormConfig.ts`

```typescript
import { logActivity } from '../lib/activity-logger'

export const FormConfig = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if (['create', 'update', 'delete'].includes(operation) && item) {
        await logActivity(context, operation as any, 'FormConfig', item)
      }
    },
  },

  // ... rest of config ...
})
```

---

#### 3.4 Category

**文件**: `cms/schemas/Category.ts`

```typescript
import { logActivity } from '../lib/activity-logger'

export const Category = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if (['create', 'update', 'delete'].includes(operation) && item) {
        await logActivity(context, operation as any, 'Category', item)
      }
    },
  },

  // ... rest of config ...
})
```

---

#### 3.5 FaqItem

**文件**: `cms/schemas/FaqItem.ts`

```typescript
import { logActivity } from '../lib/activity-logger'

export const FaqItem = list({
  // ... existing fields ...

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if (['create', 'update', 'delete'].includes(operation) && item) {
        await logActivity(context, operation as any, 'FaqItem', item)
      }
    },
  },

  // ... rest of config ...
})
```

---

## ✅ 验收测试清单

### 测试环境准备

1. 启动 CMS: `cd cms && npm run dev`
2. 登录管理后台: `http://localhost:3000`
3. 打开 ActivityLog 列表页面

### 测试用例

#### 测试1: SiteConfig 修改记录

```
✅ 操作步骤:
1. 进入 Site Config
2. 修改站点名称
3. 保存

✅ 预期结果:
- ActivityLog 中出现一条 update 记录
- entity = "SiteConfig"
- action = "update"
- changes 包含修改的字段
- user 为当前登录用户
- 有 IP 地址和 User-Agent
```

---

#### 测试2: Product 创建/更新/删除

```
✅ 操作步骤:
1. 创建一个新产品
2. 修改产品状态
3. 删除产品

✅ 预期结果:
- ActivityLog 中出现3条记录
- 第1条: action = "create", entity = "Product"
- 第2条: action = "update", entity = "Product"
- 第3条: action = "delete", entity = "Product"
- 每条记录的 changes 包含 sku, name, status
```

---

#### 测试3: CustomScript 安全审计

```
✅ 操作步骤:
1. 创建一个追踪脚本
2. 修改脚本启用状态
3. 删除脚本

✅ 预期结果:
- ActivityLog 中出现3条记录
- changes 不包含完整脚本内容（只记录 name, enabled, scope）
- 可以追溯谁创建/修改/删除了脚本
```

---

#### 测试4: Media 文件上传/删除

```
✅ 操作步骤:
1. 上传一张图片
2. 删除该图片

✅ 预期结果:
- ActivityLog 中出现2条记录
- 第1条: action = "create", 包含 filename, filesize, mimeType
- 第2条: action = "delete", 包含文件信息
- 可以追溯文件删除操作
```

---

#### 测试5: ContactForm 删除保护

```
✅ 操作步骤:
1. 提交一个测试表单（不会创建日志）
2. 删除该表单提交

✅ 预期结果:
- ActivityLog 中出现1条 delete 记录
- changes 包含 name, email, companyName
- 防止误删客户数据
```

---

## 🔍 调试和故障排查

### 常见问题

#### 问题1: 日志没有创建

**可能原因**:
1. 用户未登录（`context.session` 为空）
2. hooks 没有正确添加
3. ActivityLog 权限配置错误

**解决方法**:
```typescript
// 在 hooks 中添加调试日志
hooks: {
  afterOperation: async ({ operation, item, context }) => {
    console.log('🔍 Debug:', {
      operation,
      itemId: item?.id,
      hasSession: !!context.session,
      userId: context.session?.itemId,
    })

    await logActivity(context, operation as any, 'Product', item)
  },
}
```

---

#### 问题2: TypeScript 类型错误

**错误信息**:
```
Type '"create"' is not assignable to type '"create" | "update" | "delete"'
```

**解决方法**:
```typescript
// 添加类型断言
await logActivity(context, operation as 'create' | 'update' | 'delete', 'Product', item)

// 或者使用条件判断
if (operation === 'create' || operation === 'update' || operation === 'delete') {
  await logActivity(context, operation, 'Product', item)
}
```

---

#### 问题3: IP 地址显示为 undefined

**原因**: 在某些环境下 `req.ip` 可能不可用

**解决方法**:
已在 `activity-logger.ts` 中处理：
```typescript
ipAddress: (context as any).req?.ip || 'unknown',
```

---

## 📊 性能影响评估

### 预期性能影响

- **写入延迟**: 每次操作增加 ~50-100ms（数据库写入）
- **数据库负载**: 每个操作额外1条 INSERT 语句
- **存储增长**: 预计每月 1000-5000 条记录（约 1-5 MB）

### 性能优化建议

1. **定期清理旧日志**（可选）:
   ```typescript
   // 删除6个月前的日志
   const sixMonthsAgo = new Date()
   sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

   await context.query.ActivityLog.deleteMany({
     where: {
       timestamp: { lt: sixMonthsAgo }
     }
   })
   ```

2. **数据库索引**（已包含）:
   - `timestamp` 字段已有索引（用于按时间查询）
   - `entity` + `entityId` 复合索引（用于查找特定对象的历史）

3. **异步日志记录**（已实现）:
   - 日志记录不会抛出异常
   - 失败不会阻塞主操作

---

## 📈 监控和报告

### 日志统计查询

#### 查询最近24小时的操作

```graphql
query RecentActivities {
  activityLogs(
    where: {
      timestamp: {
        gte: "2025-11-11T00:00:00Z"
      }
    }
    orderBy: { timestamp: desc }
    take: 100
  ) {
    id
    user {
      name
      email
    }
    action
    entity
    entityId
    timestamp
  }
}
```

---

#### 查询特定用户的操作

```graphql
query UserActivities($userId: ID!) {
  activityLogs(
    where: {
      user: { id: { equals: $userId } }
    }
    orderBy: { timestamp: desc }
    take: 50
  ) {
    id
    action
    entity
    entityId
    changes
    timestamp
  }
}
```

---

#### 查询特定实体的历史

```graphql
query EntityHistory($entity: String!, $entityId: String!) {
  activityLogs(
    where: {
      entity: { equals: $entity }
      entityId: { equals: $entityId }
    }
    orderBy: { timestamp: asc }
  ) {
    id
    user {
      name
    }
    action
    changes
    timestamp
  }
}
```

---

### 可视化报告（可选）

可以在 Keystone Admin UI 中添加自定义页面展示统计：

```typescript
// cms/admin/pages/activity-dashboard.tsx
export default function ActivityDashboard() {
  // 查询最近7天的操作统计
  // 按操作类型分组
  // 按用户分组
  // 显示图表
}
```

---

## 🚀 部署上线

### 部署前检查清单

- [ ] 所有高优先级模型已添加日志
- [ ] 所有中优先级模型已添加日志
- [ ] 本地测试全部通过
- [ ] 验收测试清单完成
- [ ] 代码已提交到 Git

### 部署步骤

1. **提交代码**:
   ```bash
   git add .
   git commit -m "feat: Add ActivityLog integration for all models

   - Created activity-logger utility
   - Added logging for 15 key models
   - Includes create/update/delete operations
   - Sensitive data excluded from logs

   🤖 Generated with Claude Code

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

2. **部署到生产环境**:
   ```bash
   # 部署到 AWS
   npm run deploy:production

   # 或手动部署
   cd cms
   npm run build
   pm2 restart keystone
   ```

3. **验证部署**:
   - 登录生产环境 CMS
   - 执行一次测试操作
   - 检查 ActivityLog 是否正常创建

---

## 📚 参考资料

### Keystone 文档
- [Hooks API](https://keystonejs.com/docs/config/hooks)
- [Context API](https://keystonejs.com/docs/context/overview)
- [Access Control](https://keystonejs.com/docs/guides/auth-and-access-control)

### 相关文档
- `docs/01-数据模型与架构.md` - 数据模型定义
- `cms/schemas/User.ts` - User 模型参考实现
- `cms/schemas/ActivityLog.ts` - ActivityLog 数据模型

---

## 📞 支持和反馈

如有问题或建议，请联系开发团队或在项目中创建 Issue。

---

**文档维护**: 开发团队
**最后更新**: 2025-11-12
**文档状态**: ✅ 完整

