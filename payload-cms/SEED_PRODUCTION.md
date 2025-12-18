# Production Homepage Seeding Guide

本文档说明如何在 AWS production 环境中自动生成 homepage 相关的数据。

## 📋 概述

已导出的数据包括：

### Globals (14个)
1. `service-features` - 服务特性
2. `sphere-3d` - 3D 球体
3. `simple-cta` - 简单 CTA
4. `featured-products` - 精选产品
5. `brand-advantages` - 品牌优势
6. `oem-odm` - OEM/ODM
7. `quote-steps` - 报价步骤
8. `main-form` - 主表单
9. `why-choose-busrom` - 为什么选择 Busrom
10. `case-studies` - 案例研究
11. `brand-analysis` - 品牌分析
12. `brand-value` - 品牌价值
13. `footer` - 页脚
14. `product-series-carousel` - 产品系列轮播

### Collections (1个)
1. `navigation-menus` - 导航菜单 (34条记录) - ⚠️ 建议手动配置或单独迁移

## 🚀 使用方法

### 方法一：独立运行 seed 脚本（推荐生产环境使用）

```bash
# 在 production 服务器上运行
npx tsx src/seed/seed-production-homepage.ts
```

这会自动：
- 加载 `src/seed/homepage-data-export.json` 中的数据
- 更新所有 14 个 globals
- 创建/更新 navigation menus
- 输出详细的执行日志

### 方法二：集成到主 seed 流程

在 `src/seed/index.ts` 或其他 seed 文件中：

```typescript
import { seedProductionHomepage } from './seed-production-homepage'

export async function seed(payload: Payload) {
  // ... 其他 seed 逻辑

  await seedProductionHomepage(payload)

  // ... 继续其他 seed
}
```

## 📝 数据说明

### 完整翻译支持
所有数据均包含完整的英文 (en) 和中文 (zh) 翻译：

- ✅ **Service Features**: 5个功能特性，包含营销内容
- ✅ **Why Choose Busrom**: 标题、副标题、按钮文字、5个理由
- ✅ **Footer**: 联系信息、官方声明（4行）
- ✅ **Brand Value**: 品质、创新等参数标题
- ✅ **其他所有 globals**: 完整双语内容

### 已修复的翻译问题

以下字段的中文翻译已在导出前补充：

**why-choose-busrom:**
- `title2`: "Busrom"
- `viewMoreButtonText`: "查看更多信息"

**footer:**
- `contactEmailLabel`: "电子邮箱"
- `afterSalesLabel`: "售后服务"
- `whatsappLabel`: "WhatsApp"
- `officialNoticeLine1-4`: 完整的官方声明中文文本

**brand-value:**
- `param1Title`: "品质"
- `param2Title`: "创新"

## 🔧 维护和更新

### 重新导出当前数据

如果在开发环境中更新了 homepage 数据，需要重新导出：

```bash
# 1. 导出最新数据
npx tsx scripts/export-homepage-data.ts

# 2. 检查是否有缺失的中文翻译
npx tsx scripts/check-missing-translations.ts

# 3. 如果有缺失，填充翻译
npx tsx scripts/fill-missing-translations.ts

# 4. 重新导出
npx tsx scripts/export-homepage-data.ts

# 5. 复制到 seed 目录
cp scripts/homepage-data-export.json src/seed/homepage-data-export.json
```

### 文件结构

```
payload-cms/
├── scripts/
│   ├── export-homepage-data.ts          # 导出脚本
│   ├── check-missing-translations.ts    # 检查缺失翻译
│   ├── fill-missing-translations.ts     # 填充缺失翻译
│   └── homepage-data-export.json        # 导出的数据（开发环境）
├── src/seed/
│   ├── seed-production-homepage.ts      # 生产环境 seed 脚本
│   └── homepage-data-export.json        # 生产环境使用的数据
└── SEED_PRODUCTION.md                   # 本文档
```

## ⚙️ AWS Production 部署

在 AWS production 环境中：

1. **首次部署**：确保 `src/seed/homepage-data-export.json` 包含在 Docker 镜像中

2. **运行 seed**：
   ```bash
   # 在容器启动后或手动触发
   npx tsx src/seed/seed-production-homepage.ts
   ```

3. **验证**：
   ```bash
   # 检查 API 返回
   curl https://your-production-domain.com/api/home?locale=en
   curl https://your-production-domain.com/api/home?locale=zh
   ```

## 📊 数据大小

- 导出文件大小：约 3500 行 JSON
- 包含完整的双语内容
- 不包含 Media 文件（需要单独迁移 S3 bucket）

## ⚠️ 注意事项

1. **Media References**: 导出的数据中包含 media ID 引用，需要确保 production 环境中有对应的 media 记录
2. **Navigation Menus**: 如果已存在同名菜单，会更新而不是创建新的
3. **Locale Support**: 数据同时包含 en 和 zh，seed 时会自动处理
4. **System Fields**: `id`, `createdAt`, `updatedAt` 等系统字段会自动移除

## 🔄 从 Keystone CMS 迁移

如果还需要从 Keystone CMS 迁移其他数据：

```bash
# 查看现有的 Keystone 迁移脚本
ls -la cms/scripts/seed-data/

# 这些脚本不再需要了，homepage 数据已完全迁移到 Payload
```

现在所有 homepage 相关数据都可以直接从 `homepage-data-export.json` 恢复，不需要再从 Keystone CMS 迁移。
