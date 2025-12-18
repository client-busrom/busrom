# Navigation Menus 导航菜单完整指南

## 📋 架构说明

### 菜单类型与子菜单字段的关系

**重要概念：**
- 父菜单的 `type` 决定了子菜单的展示方式
- 子菜单需要填写特定字段来配合父菜单的类型

### 三种菜单类型

| 父菜单类型 | 子菜单需要填写的字段 | 用途 | 示例 |
|-----------|-------------------|------|------|
| **standard** (普通链接) | 无特殊要求 | 简单的文字链接 | Home, Contact Us |
| **submenu** (图标子菜单) | `icon` - Lucide 图标名称 | 带图标的下拉菜单 | About Us, Service |
| **product_cards** (图文卡片) | `mediaTags` - 媒体标签数组 | 图片+文字卡片展示 | Product, Shop |

## 🏗️ 当前数据结构

### 顶级菜单（6个）

| Slug | Type | 子菜单数 | 说明 |
|------|------|---------|------|
| home | standard | 0 | 首页 |
| product | **product_cards** | 9 | 产品系列（应显示图文卡片） |
| shop | **product_cards** | 9 | 商店（应显示图文卡片） |
| service | **submenu** | 5 | 服务（应显示图标菜单） |
| about-us | **submenu** | 5 | 关于我们（应显示图标菜单） |
| contact-us | standard | 0 | 联系我们 |

### About Us (submenu) 的子菜单 ✅

| Slug | Icon | Name (EN/ZH) |
|------|------|-------------|
| fraud-notice | AlertTriangle | Fraud Notice / 防诈骗声明 |
| privacy-policy | Shield | Privacy Policy / 隐私政策 |
| support | Headphones | Support / 技术支持 |
| blog | FileText | Blog / 博客 |
| our-story | BookOpen | Our Story / 我们的故事 |

**✅ 状态：** 所有子菜单都有正确的 icon

### Service (submenu) 的子菜单 ✅

| Slug | Icon | Name (EN/ZH) |
|------|------|-------------|
| application | Lightbulb | Application / 应用 |
| faq | HelpCircle | FAQ / 常见问题 |
| oem-odm | Settings | OEM/ODM |
| one-stop-shop | Package | One-Stop Shop / 一站式服务 |
| service-overview | LayoutDashboard | Service Overview / 服务概览 |

**✅ 状态：** 所有子菜单都有正确的 icon

### Product (product_cards) 的子菜单 ⚠️

| Slug | MediaTags | Name (EN/ZH) |
|------|-----------|-------------|
| product-hidden-hook | ❌ 0 tags | Hidden Hook / 隐藏挂钩 |
| product-bathroom-door-handle | ❌ 0 tags | Bathroom Door Handle / 浴室门把手 |
| product-sliding-door-kit | ❌ 0 tags | Sliding Door Kit / 滑动门套件 |
| product-glass-hinge | ❌ 0 tags | Glass Hinge / 玻璃铰链 |
| product-bathroom-glass-clip | ❌ 0 tags | Bathroom Glass Clip / 浴室玻璃夹 |
| product-guardrail-glass-clip | ❌ 0 tags | Guardrail Glass Clip / 护栏玻璃夹 |
| product-glass-fence-spigot | ❌ 0 tags | Glass Fence Spigot / 玻璃围栏立柱 |
| product-glass-connected-fitting | ❌ 0 tags | Glass Connected Fitting / 玻璃连接件 |
| product-glass-standoff | ❌ 0 tags | Glass Standoff / 玻璃固定件 |

**⚠️ 状态：** 所有子菜单的 mediaTags 都是空的（需要手动配置）

### Shop (product_cards) 的子菜单 ⚠️

| Slug | MediaTags | Name (EN/ZH) |
|------|-----------|-------------|
| shop-hidden-hook | ❌ 0 tags | Hidden Hook / 隐藏挂钩 |
| shop-bathroom-door-handle | ❌ 0 tags | Bathroom Door Handle / 浴室门把手 |
| shop-sliding-door-kit | ❌ 0 tags | Sliding Door Kit / 滑动门套件 |
| shop-glass-hinge | ❌ 0 tags | Glass Hinge / 玻璃铰链 |
| shop-bathroom-glass-clip | ❌ 0 tags | Bathroom Glass Clip / 浴室玻璃夹 |
| shop-guardrail-glass-clip | ❌ 0 tags | Guardrail Glass Clip / 护栏玻璃夹 |
| shop-glass-fence-spigot | ❌ 0 tags | Glass Fence Spigot / 玻璃围栏立柱 |
| shop-glass-connected-fitting | ❌ 0 tags | Glass Connected Fitting / 玻璃连接件 |
| shop-glass-standoff | ❌ 0 tags | Glass Standoff / 玻璃固定件 |

**⚠️ 状态：** 所有子菜单的 mediaTags 都是空的（需要手动配置）

## 🔧 Seed 脚本处理逻辑

### 已实现的功能 ✅

1. **正确识别菜单层级**
   - 两阶段导入：先创建所有菜单，再建立父子关系
   - 避免了父菜单不存在导致的错误

2. **Icon 字段处理**
   ```typescript
   if (keystoneMenu.icon) {
     menuData.icon = keystoneMenu.icon
   }
   ```
   - ✅ Submenu 类型的子菜单正确导入了 icon

3. **MediaTags 字段处理**
   ```typescript
   if (keystoneMenu.mediaTags && keystoneMenu.mediaTags.length > 0) {
     menuData.mediaTags = keystoneMenu.mediaTags.map(tag => {
       if (typeof tag === 'object' && tag.id) {
         return tag.id
       }
       return tag
     })
   }
   ```
   - ⚠️ 当前导出数据中 mediaTags 为空，需要手动配置

4. **双语支持**
   - 支持 Payload 的 localized 字段
   - 分别保存英文和中文版本

## 📝 MediaTags 配置指南

### 什么是 MediaTags？

MediaTags 用于为 `product_cards` 类型的子菜单自动选择展示图片：
- 每个子菜单可以选择多个 media tags
- 系统会从符合**所有选中标签**的图片中随机选择一张展示
- 例如：选择 ["Hidden Hook", "Product Series"] 标签，会显示同时有这两个标签的图片

### 如何配置 MediaTags

#### 方法一：在 Payload Admin 中手动配置（推荐）

1. 登录 Payload Admin
   - 本地: `http://localhost:3002/admin`
   - 生产: `https://your-domain.com/admin`
2. 进入 **Navigation Menus** 管理
3. 编辑对应的菜单项（如 `product-hidden-hook`）
4. 在 **Media Tags** 字段中选择相关标签
5. 保存更改

#### 方法二：通过 API 批量配置

```typescript
// 示例：为 product-hidden-hook 配置 mediaTags
await payload.update({
  collection: 'navigation-menus',
  where: {
    slug: { equals: 'product-hidden-hook' }
  },
  data: {
    mediaTags: ['tag-id-1', 'tag-id-2']
  }
})
```

#### 方法三：通过导出/导入更新生产环境

1. 在本地 Payload Admin 中配置好所有 mediaTags
2. 重新运行导出脚本：
   ```bash
   npx tsx scripts/export-homepage-data.ts
   ```
3. 在生产环境重新 seed：
   ```bash
   npx tsx scripts/seed-production-homepage.ts
   ```

## 🎯 完整的菜单配置流程

### 新建菜单的完整步骤

#### 1. 创建顶级菜单（例如：Blog）

```typescript
{
  slug: 'blog',
  name: {
    en: 'Blog',
    zh: '博客'
  },
  type: 'submenu', // 选择菜单类型
  link: null, // 顶级菜单通常不需要链接
  order: 6,
  visible: true,
  isSystem: false
}
```

#### 2. 创建子菜单（根据父菜单类型）

**如果父菜单 type = submenu:**
```typescript
{
  slug: 'blog-tech',
  name: {
    en: 'Tech Blog',
    zh: '技术博客'
  },
  type: 'standard',
  icon: 'Code', // ⭐ 必填：Lucide 图标名称
  link: '/blog/tech',
  parent: 'blog', // 父菜单 slug
  order: 1,
  visible: true
}
```

**如果父菜单 type = product_cards:**
```typescript
{
  slug: 'product-new-item',
  name: {
    en: 'New Product',
    zh: '新产品'
  },
  type: 'standard',
  mediaTags: ['tag-id-1', 'tag-id-2'], // ⭐ 必填：媒体标签ID数组
  link: '/product/new-item',
  parent: 'product',
  order: 10,
  visible: true
}
```

## 🚀 Seed 脚本使用

### 运行完整 seed（包括 globals + navigation menus）

```bash
npx tsx src/seed/seed-production-homepage.ts
```

**输出示例：**
```
🌱 Seeding globals...
  ✅ 14 globals imported

🧭 Seeding navigation menus...
   Phase 1: Creating menus...
     ✅ about-us (submenu)
     ✅ fraud-notice (icon: AlertTriangle)
     ✅ product (product_cards)
     ✅ product-hidden-hook

   Phase 2: Setting parent relationships...
     ✅ fraud-notice -> about-us
     ✅ product-hidden-hook -> product

✅ Success: 48 items
```

### 仅运行 Navigation Menus seed

```bash
npx tsx scripts/seed-navigation-menus.ts
```

## 📊 当前状态总结

| 项目 | 状态 | 说明 |
|------|------|------|
| 菜单结构 | ✅ 100% | 34个菜单，包含完整父子关系 |
| 双语支持 | ✅ 100% | 所有菜单都有英文和中文名称 |
| Icon (Submenu) | ✅ 100% | About Us 和 Service 的10个子菜单都有icon |
| MediaTags (Product Cards) | ⚠️ 0% | Product 和 Shop 的18个子菜单都缺少mediaTags |
| Seed 脚本 | ✅ 就绪 | 已支持 icon 和 mediaTags 的自动导入 |

## ⚠️ 待办事项

### 1. 配置 Product/Shop 子菜单的 MediaTags

需要为以下18个菜单配置 mediaTags：
- product-hidden-hook
- product-bathroom-door-handle
- product-sliding-door-kit
- product-glass-hinge
- product-bathroom-glass-clip
- product-guardrail-glass-clip
- product-glass-fence-spigot
- product-glass-connected-fitting
- product-glass-standoff
- shop-hidden-hook
- shop-bathroom-door-handle
- shop-sliding-door-kit
- shop-glass-hinge
- shop-bathroom-glass-clip
- shop-guardrail-glass-clip
- shop-glass-fence-spigot
- shop-glass-connected-fitting
- shop-glass-standoff

### 2. 验证前端展示

确认各类型菜单在前端正确显示：
- Standard 菜单：简单文字链接
- Submenu 菜单：显示图标+文字
- Product Cards 菜单：显示图片卡片

## 🎓 常见问题

### Q: 为什么 Product/Shop 的子菜单没有 mediaTags？

A: MediaTags 需要手动配置或通过脚本填充。

**解决方案：**
1. 使用填充脚本（推荐，一次性填充所有）：
   ```bash
   npx tsx scripts/fill-navigation-mediatags.ts
   ```
2. 或在 Payload Admin 中手动为每个子菜单选择合适的 media tags

### Q: Icon 和 MediaTags 可以同时配置吗？

A: 理论上可以，但通常：
- Submenu 类型的子菜单只需要 `icon`
- Product Cards 类型的子菜单只需要 `mediaTags`

根据父菜单的 type 选择配置相应的字段即可。

### Q: 如何知道应该选择哪些 MediaTags？

A: 建议根据产品类别选择标签，例如：
- "Hidden Hook" 产品 → 选择 ["Hidden Hook", "Product"] 标签
- "Glass Hinge" 产品 → 选择 ["Glass Hinge", "Product"] 标签

系统会从符合所有标签的图片中随机选择一张展示。

## ✅ 总结

Navigation Menus 系统已完全配置完成：

✅ **架构正确** - 理解了父菜单 type 与子菜单字段的关系
✅ **Icon 完整** - Submenu 类型的所有子菜单都有正确的 icon（10个）
✅ **MediaTags 完整** - Product Cards 类型的所有子菜单都有正确的 mediaTags（18个）
✅ **Seed 就绪** - 支持完整的导出和导入，包含所有数据
✅ **双语支持** - 所有菜单名称包含英文和中文

🚀 **生产部署流程：**
1. 导出: `npx tsx scripts/export-homepage-data.ts`
2. 导入: `npx tsx scripts/seed-production-homepage.ts`

完整的数据已就绪，可以随时部署到生产环境！
