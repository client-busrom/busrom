# Payload CMS Seed 系统完整总结

## 📊 数据类型分类

### ✅ 1. 自动初始化（通过 onInit hook）

这些数据在系统启动时自动创建，无需手动操作：

| 数据类型 | 数量 | 位置 | 说明 |
|---------|------|------|------|
| **Permissions** | 106个 | `src/seed/seed-permissions-system.ts` | 所有资源的 CRUD 权限 |
| **Roles** | 6个 | `src/seed/seed-permissions-system.ts` | Super Admin, Content Editor, 等 |
| **Default Admin User** | 1个 | `payload.config.ts` | 默认管理员账号 |

**特点：**
- ✅ 幂等性：可重复执行，只创建不存在的
- ✅ 代码驱动：定义在源码中
- ✅ 自动执行：每次启动时检查并创建

### 📦 2. 需要手动 Seed（通过脚本）

这些数据需要手动执行脚本创建：

#### A. 基础数据（需要最先创建）

| 数据类型 | 数量 | 脚本位置 | 优先级 |
|---------|------|---------|--------|
| **Categories** | 18个 | `scripts/seed-categories.ts` | 🔴 高 |
| **Media Tags** | ~9个 | ❌ 无专用脚本 | 🔴 高 |
| **Media Categories** | ? | ❌ 无专用脚本 | 🟡 中 |
| **Product Series** | 9个 | ❌ 无专用脚本 | 🔴 高 |

**问题：**
- ⚠️ Media Tags/Categories 没有专用的 seed 脚本
- ⚠️ Product Series 没有专用的 seed 脚本
- ⚠️ 这些是关联数据，其他功能依赖它们

#### B. 内容数据（依赖基础数据）

| 数据类型 | 数量 | 导出/导入脚本 | 依赖 |
|---------|------|-------------|------|
| **Homepage Globals** | 14个 | `scripts/export-homepage-data.ts` / `scripts/seed-production-homepage.ts` | 无 |
| **Navigation Menus** | 34个 | 同上 | Media Tags |
| **Hero Banner Items** | 9个 | 包含在 globals 中 | 无 |

## 🚨 当前问题分析

### 1. Media Tags & Categories 缺少 Seed 脚本

**现状：**
- ✅ `fill-navigation-mediatags.ts` - 只是填充导航菜单的 mediaTags 关联
- ❌ 没有创建 media-tags 本身的脚本

**建议方案：**

#### 方案 A：创建独立 Seed 脚本（推荐）

```typescript
// scripts/seed-media-system.ts
const MEDIA_TAGS = [
  { name: 'Glass Standoff', type: 'product_series' },
  { name: 'Glass Connected Fitting', type: 'product_series' },
  // ... 其他 9 个产品系列
]

const MEDIA_CATEGORIES = [
  { name: 'Product Images', slug: 'product-images' },
  { name: 'Scene Images', slug: 'scene-images' },
  // ... 其他分类
]
```

#### 方案 B：添加到 onInit Hook

将 media tags/categories 的创建添加到 `payload.config.ts` 的 `onInit` 中，像 permissions 一样自动初始化。

### 2. Product Series 缺少 Seed 脚本

**现状：**
- ✅ `seed-series-intro-items.ts` - 创建 SeriesIntro global 数据
- ❌ 没有创建 product-series collection 的脚本

**建议：**
创建 `scripts/seed-product-series.ts` 来初始化 9 个产品系列。

### 3. Categories 已有但独立

**现状：**
- ✅ `scripts/seed-categories.ts` - 完整的 categories seed
- ⚠️ 需要手动执行，不在主 seed 流程中

**建议：**
将 categories 整合到统一的 seed 流程中。

## 🎯 推荐的完整 Seed 流程

### 阶段 1：系统初始化（自动）

```bash
# 启动 Payload 时自动执行
npm run dev
```

**自动创建：**
- Permissions (106个)
- Roles (6个)
- Default Admin User (1个)

### 阶段 2：基础数据 Seed（手动执行一次）

```bash
# 创建基础关联数据
npx tsx scripts/seed-base-data.ts
```

**应包含：**
- Media Tags (9个产品系列标签)
- Media Categories (若干分类)
- Categories (18个：9个产品 + 9个应用)
- Product Series (9个产品系列)

### 阶段 3：内容数据导入

```bash
# 导入 homepage 和 navigation 数据
npx tsx scripts/seed-production-homepage.ts
```

**包含：**
- Homepage Globals (14个)
- Navigation Menus (34个)

## 📝 建议的改进措施

### 立即执行（高优先级）

1. **创建 `scripts/seed-base-data.ts`**
   - 整合 media tags, media categories, categories, product series
   - 幂等性设计
   - 详细日志输出

2. **更新 `README_SEED.md`**
   - 添加 seed 流程说明
   - 明确数据依赖关系
   - 提供完整的部署步骤

### 长期优化（中优先级）

3. **将基础数据添加到 onInit**
   - 像 permissions 一样自动创建
   - 减少手动操作步骤

4. **创建统一的 seed 管理脚本**
   ```bash
   npx tsx scripts/seed-all.ts --env production
   ```
   - 自动检测缺失数据
   - 按正确顺序执行所有 seed
   - 提供验证和回滚功能

## 🔍 当前数据依赖图

```
┌─────────────────────────────────────┐
│ onInit (自动)                        │
│ - Permissions                       │
│ - Roles                             │
│ - Default Admin                     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 基础数据 (需手动 seed)              │
│ - Media Tags ⚠️ 缺少脚本            │
│ - Media Categories ⚠️ 缺少脚本       │
│ - Categories ✅ 已有                │
│ - Product Series ⚠️ 缺少脚本        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 内容数据 (export/import)            │
│ - Homepage Globals ✅ 已有          │
│ - Navigation Menus ✅ 已有          │
│   (依赖 Media Tags)                 │
└─────────────────────────────────────┘
```

## ✅ 下一步行动

1. **确认 Media Tags/Categories 的数据结构**
   - 检查数据库中现有的 media-tags
   - 确定需要哪些 media-categories

2. **创建 seed-base-data.ts 脚本**
   - 参考 seed-permissions-system.ts 的幂等性设计
   - 整合所有基础数据的创建

3. **更新文档**
   - 明确 seed 流程
   - 添加依赖说明
   - 提供故障排除指南

4. **测试完整流程**
   - 在空数据库上测试
   - 验证所有关联关系
   - 确保可重复执行
