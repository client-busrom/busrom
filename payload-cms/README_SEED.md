# Payload CMS Seed 系统使用指南

## 🎯 快速开始

### 数据流程图

```
开发环境                                       生产环境
   ↓                                              ↓
导出脚本                                       导入脚本
   ↓                                              ↑
scripts/export-homepage-data.ts → scripts/homepage-data-export.json → scripts/seed-production-homepage.ts
                                  (JSON 数据文件)
```

### 第一步：导出数据（开发环境）

```bash
npx tsx scripts/export-homepage-data.ts
```

**生成文件：** `scripts/homepage-data-export.json`

这个 JSON 文件包含：
- Homepage Globals (14个)
- Navigation Menus (34个)

### 第二步：导入数据（生产环境）

```bash
npx tsx scripts/seed-production-homepage.ts
```

**读取文件：** `scripts/homepage-data-export.json` ← **必须先存在！**

**重要：** 导入脚本会从 `scripts/homepage-data-export.json` 读取数据，请确保：
1. 该文件已通过导出脚本生成
2. 该文件已通过 Git 或 S3 传输到生产环境

## 📦 包含的数据

### 1. RBAC Permissions & Roles（自动初始化）⚙️

**系统启动时自动 seed，无需手动操作**

通过 `payload.config.ts` 的 `onInit` hook 自动执行：
- ✅ **106 个系统权限** - 覆盖所有 collections 和 globals
- ✅ **6 个预定义角色**：
  - Super Admin（超级管理员）- 所有权限
  - Content Editor（内容编辑）- 内容创建和编辑
  - Content Reviewer（内容审核）- 内容审核和发布
  - Customer Support（客服专员）- 表单处理
  - SEO Specialist（SEO专员）- SEO 设置管理
  - Media Manager（媒体管理员）- 媒体资源管理
- ✅ **幂等性** - 只创建不存在的权限和角色
- ✅ **双语支持** - 英文/中文名称和描述

**位置：** `src/seed/seed-permissions-system.ts`

### 2. Base Data（基础数据）✅

**当前状态：已在开发环境中创建**

- ✅ Media Tags (15个) - 颜色、产品系列等标签
- ✅ Media Categories (13个) - 媒体分类
- ✅ Categories (18个) - 产品和应用分类
- ✅ Product Series (9个) - 产品系列

**生产部署建议：**
- 选项 A：手动在 Payload Admin 中重新创建
- 选项 B：扩展导出/导入脚本包含这些数据（推荐）

### 3. Homepage Globals（14个）

通过脚本导出/导入：
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

### 4. Navigation Menus（34个）

通过脚本导出/导入：
- 6 个顶级菜单
- 28 个子菜单
  - 10 个带 icon（submenu 类型）
  - 18 个带 mediaTags（product_cards 类型）

## 🔍 检查数据状态

### 查看当前基础数据

```bash
npx tsx scripts/check-base-data.ts
```

**输出示例：**
```
📦 Media Tags: 15
📁 Media Categories: 13
🏷️  Categories: 18
📦 Product Series: 9
```

## 🔧 开发工具脚本

### 填充 Navigation Icons

```bash
npx tsx scripts/fill-navigation-icons.ts
```

自动为所有 submenu 子菜单填充 Lucide icons。

### 填充 Navigation MediaTags

```bash
npx tsx scripts/fill-navigation-mediatags.ts
```

自动为所有 product_cards 子菜单填充对应的 media tags。

## ✅ 数据完整性验证

### 检查导出文件

```bash
# 总数
jq '.collections["navigation-menus"] | length' scripts/homepage-data-export.json
# 期望: 34

# 有 icon 的菜单
jq '.collections["navigation-menus"] | map(select(.icon)) | length' scripts/homepage-data-export.json
# 期望: 10

# 有 mediaTags 的菜单
jq '.collections["navigation-menus"] | map(select(.mediaTags | length > 0)) | length' scripts/homepage-data-export.json
# 期望: 18
```

### 检查 API 数据

```bash
# 检查菜单总数
curl http://localhost:3002/api/navigation-menus?limit=100 | jq '.totalDocs'

# 检查特定菜单的 icon
curl http://localhost:3002/api/navigation-menus?where[slug][equals]=fraud-notice | jq '.docs[0].icon'

# 检查特定菜单的 mediaTags
curl http://localhost:3002/api/navigation-menus?where[slug][equals]=product-glass-standoff | jq '.docs[0].mediaTags'
```

## 🚀 生产部署流程

### 方式一：通过 Git（推荐）

1. 在本地导出最新数据
   ```bash
   npx tsx scripts/export-homepage-data.ts
   ```

2. 提交到 Git
   ```bash
   git add scripts/homepage-data-export.json
   git commit -m "chore: Update homepage seed data"
   git push
   ```

3. 在生产服务器拉取并导入
   ```bash
   git pull
   npx tsx scripts/seed-production-homepage.ts
   ```

### 方式二：通过 S3

1. 上传到 S3
   ```bash
   aws s3 cp scripts/homepage-data-export.json s3://your-bucket/seed-data/
   ```

2. 在生产环境下载并导入
   ```bash
   aws s3 cp s3://your-bucket/seed-data/homepage-data-export.json scripts/
   npx tsx scripts/seed-production-homepage.ts
   ```

## 📋 文件说明

| 文件 | 类型 | 用途 |
|------|------|------|
| `scripts/export-homepage-data.ts` | 脚本 | 从 Payload CMS 导出数据 → 生成 JSON 文件 |
| `scripts/seed-production-homepage.ts` | 脚本 | 从 JSON 文件读取 → 导入到 Payload CMS |
| `scripts/homepage-data-export.json` | **数据文件** | **导出脚本的输出，导入脚本的输入** |
| `scripts/fill-navigation-icons.ts` | 脚本 | 填充导航菜单 icons（开发环境使用） |
| `scripts/fill-navigation-mediatags.ts` | 脚本 | 填充导航菜单 mediaTags（开发环境使用） |
| `scripts/check-base-data.ts` | 脚本 | 检查基础数据状态 |
| `scripts/seed-applications-simple.ts` | 脚本 | 创建 9 个应用案例（每个产品系列一个） |

## 🔍 详细文档

- [完整部署指南](./PRODUCTION_DEPLOYMENT_SEED.md)
- [Navigation Menus 指南](./NAVIGATION_MENUS_GUIDE.md)

## ⚠️ 注意事项

1. **幂等性**：seed 脚本可以重复执行，会先删除现有数据再重新导入
2. **备份**：生产环境首次 seed 前建议备份数据库
3. **依赖顺序**：确保 media-tags collection 已经存在
4. **双语支持**：所有数据支持 en/zh 两种语言

## 🆘 故障排除

### 问题：mediaTags 导入后为空

**解决：**
1. 检查 media-tags collection 是否已创建
2. 确认导出文件中包含 mediaTags 数据
3. 重新运行填充脚本后再导出

### 问题：父子关系丢失

**解决：**
1. 检查 Phase 1 是否所有菜单都创建成功
2. 重新运行 seed 脚本

### 问题：图标不显示

**解决：**
1. 确认使用的是有效的 Lucide React 图标名称
2. 检查前端是否正确导入并使用图标组件
