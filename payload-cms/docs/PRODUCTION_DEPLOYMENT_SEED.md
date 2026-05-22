# Production Deployment Seed Guide

## 📋 概览

此文档说明如何使用 Payload CMS seed 系统进行 AWS 生产环境部署。

系统支持完整的数据导出和导入，包括所有 homepage globals 和 navigation menus（包含 icons 和 media tags）。

## ✅ 已完成的配置

### 1. Navigation Menus（导航菜单）✅

所有 34 个导航菜单已完全配置：

**架构：**
- 6 个顶级菜单（home, product, shop, service, about-us, contact-us）
- 28 个子菜单（18 个 product_cards 子菜单 + 10 个 submenu 子菜单）

**数据完整性：**
- ✅ **10 个 SUBMENU 子菜单** - 全部配置了 Lucide icons
  - About Us: fraud-notice, privacy-policy, support, blog, our-story
  - Service: application, faq, oem-odm, one-stop-shop, service-overview

- ✅ **18 个 PRODUCT_CARDS 子菜单** - 全部配置了 MediaTags
  - Product 系列：9 个子菜单（glass-standoff, glass-connected-fitting, 等）
  - Shop 系列：9 个子菜单（同样的产品系列）

### 2. Homepage Globals（首页全局配置）✅

包含 14 个 globals：
- service-features
- sphere-3d
- simple-cta
- featured-products
- brand-advantages
- oem-odm
- quote-steps
- main-form
- why-choose-busrom
- case-studies
- brand-analysis
- brand-value
- footer
- product-series-carousel

## 🚀 部署流程

### Step 1: 从 Payload CMS 导出数据

```bash
cd payload-cms
npx tsx scripts/export-homepage-data.ts
```

**输出：**
- `scripts/homepage-data-export.json`
- 包含所有 globals 和 navigation-menus 数据
- 完整的 JSON 格式，包含所有关联数据

**验证导出：**
```bash
jq '.collections["navigation-menus"] | length' scripts/homepage-data-export.json
# 应该输出: 34

jq '.collections["navigation-menus"] | map(select(.icon)) | length' scripts/homepage-data-export.json
# 应该输出: 10 (有 icon 的菜单)

jq '.collections["navigation-menus"] | map(select(.mediaTags | length > 0)) | length' scripts/homepage-data-export.json
# 应该输出: 18 (有 mediaTags 的菜单)
```

### Step 2: 在生产环境导入数据

```bash
cd payload-cms
npx tsx scripts/seed-production-homepage.ts
```

**这个脚本会：**
1. 读取 `scripts/homepage-data-export.json`
2. 导入所有 14 个 globals（支持多语言）
3. 导入所有 34 个 navigation menus（包括 icons 和 mediaTags）
4. 自动处理父子关系

**输出示例：**
```
📦 Loaded export data:
   - Globals: 14
   - Collections: 1

🌱 Seeding globals...
  ✅ service-features
  ✅ sphere-3d
  ...

🧭 Seeding navigation menus...
  🗑️  Deleting 34 existing menus...
  📝 Phase 1: Creating menus...
    ✅ home
    ✅ product (type: product_cards)
    ✅ product-glass-standoff (mediaTags: 1)
    ✅ fraud-notice (icon: AlertTriangle)
    ...

  🔗 Phase 2: Setting parent relationships...
    ✅ product-glass-standoff -> product
    ✅ fraud-notice -> about-us
    ...

  ✅ Seeded 34 navigation menus

✅ Production homepage data seeded successfully!
```

## 📁 相关文件

### 核心脚本

| 文件 | 用途 | 依赖 |
|------|------|------|
| `scripts/export-homepage-data.ts` | 从 Payload CMS 导出数据 | ✅ 生产就绪 |
| `scripts/seed-production-homepage.ts` | 导入数据到 Payload CMS | ✅ 生产就绪 |
| `scripts/homepage-data-export.json` | 导出的数据文件 | ✅ 版本控制 |

### 辅助脚本（开发使用）

| 文件 | 用途 | 状态 |
|------|------|------|
| `scripts/fill-navigation-mediatags.ts` | 填充 navigation menu mediaTags | ✅ 开发工具 |
| `scripts/fill-navigation-icons.ts` | 填充 navigation menu icons | ✅ 开发工具 |

## 🔄 数据完整性

### ✅ 完整的数据导出/导入系统

**支持的数据类型：**
- ✅ Navigation Menus（34个，包含完整的层级关系）
- ✅ Homepage Globals（14个全局配置）
- ✅ 所有关联数据（icons + mediaTags + parent relationships）
- ✅ 双语内容（en/zh）

**数据验证：**
- ✅ 自动验证 mediaTags 关联
- ✅ 自动验证父子关系
- ✅ 详细的日志输出

## 📊 数据完整性检查

### Navigation Menus 结构

```typescript
{
  slug: string              // 唯一标识
  name: {                   // 双语名称
    en: string
    zh: string
  }
  type: 'standard' | 'submenu' | 'product_cards'
  icon: string | null       // Lucide 图标名（仅 submenu 子菜单）
  mediaTags: number[]       // MediaTag IDs（仅 product_cards 子菜单）
  parent: number | null     // 父菜单 ID
  link: string | null       // 链接 URL
  order: number             // 排序
  visible: boolean          // 是否可见
  isSystem: boolean         // 是否系统菜单
}
```

### 验证清单

导入后，验证以下内容：

```bash
# 1. 检查菜单总数
curl http://localhost:3002/api/navigation-menus?limit=100 | jq '.docs | length'
# 期望: 34

# 2. 检查 submenu 子菜单的 icons
curl http://localhost:3002/api/navigation-menus?where[parent][exists]=true&where[icon][exists]=true | jq '.docs | length'
# 期望: 10

# 3. 检查 product_cards 子菜单的 mediaTags
curl http://localhost:3002/api/navigation-menus?where[mediaTags][exists]=true | jq '.docs | length'
# 期望: 18
```

## 🎯 生产部署步骤

### 1. 本地准备

```bash
# 确保本地数据是最新的
cd payload-cms
npx tsx scripts/export-homepage-data.ts

# 验证导出文件
ls -lh scripts/homepage-data-export.json
```

### 2. 上传到 AWS

```bash
# 将导出文件上传到 S3 或直接包含在部署包中
aws s3 cp scripts/homepage-data-export.json s3://your-bucket/seed-data/

# 或者直接提交到 Git
git add scripts/homepage-data-export.json
git commit -m "chore: Update homepage seed data"
git push
```

### 3. 在生产环境执行 Seed

```bash
# SSH 到生产服务器或通过 ECS Task
cd /app/payload-cms

# 如果从 S3 下载
aws s3 cp s3://your-bucket/seed-data/homepage-data-export.json scripts/

# 执行 seed
npx tsx scripts/seed-production-homepage.ts
```

### 4. 验证

```bash
# 检查数据是否正确导入
curl https://your-production-domain.com/api/navigation-menus?limit=100 | jq '.totalDocs'
# 期望: 34
```

## 🔧 故障排除

### 问题：导入时 mediaTags 丢失

**原因：** MediaTags collection 未先导入

**解决：**
1. 确保 media-tags collection 已经存在
2. 重新运行 seed 脚本

### 问题：父子关系丢失

**原因：** Phase 2 parent relationship update 失败

**解决：**
1. 检查 Phase 1 是否所有菜单都创建成功
2. 查看 idMap 是否正确映射
3. 重新运行 seed 脚本

### 问题：Icons 或 MediaTags 为空

**原因：** 导出时未包含这些字段

**解决：**
1. 检查本地 Payload 数据库是否有这些数据
2. 重新运行填充脚本：
   ```bash
   npx tsx scripts/fill-navigation-icons.ts
   npx tsx scripts/fill-navigation-mediatags.ts
   ```
3. 重新导出数据

## 📝 总结

✅ **完整的 Payload CMS Seed 系统**
- 支持完整的 navigation menus（包括 icons 和 mediaTags）
- 支持所有 homepage globals（14个全局配置）
- 双语支持（en/zh）
- 可重复执行（幂等性）
- 自动处理关联关系

✅ **生产就绪**
- 已在开发环境测试验证
- 包含完整的错误处理
- 提供详细的日志输出
- 支持数据完整性验证

🚀 **部署简单**
- 2 个命令完成整个流程（export → seed）
- 无需手动配置数据
- 适合 CI/CD 自动化集成
- 支持版本控制（JSON文件可提交到Git）
