# Product System 种子数据使用说明

## 概述

本文档说明 **Product System**（产品系统）的自动种子数据功能。

系统包含：
1. **Product Categories** - 产品分类（10个扁平分类，无层级）
2. **ProductSeries** - 产品系列（1对1关联到分类）

---

## 自动初始化

### 🎯 触发条件

当 CMS 启动时，如果检测到 `ProductSeries` 表为空，会自动执行种子数据初始化。

### 📦 自动创建内容

#### 1. Product Categories & ProductSeries（1对1映射）

**扁平结构：** 无层级，每个 Category 对应一个 ProductSeries

| # | Slug | 英文名 | 中文名 |
|---|------|--------|--------|
| 1 | `glass-standoff` | Glass Standoff | 广告螺丝 |
| 2 | `glass-connected-fitting` | Glass Connected Fitting | 玻璃栏杆扶手连接件 |
| 3 | `glass-fence-spigot` | Glass Fence Spigot | 玻璃护栏支架底座 |
| 4 | `guardrail-glass-clip` | Guardrail Glass Clip | 护栏系列 |
| 5 | `bathroom-glass-clip` | Bathroom Glass Clip | 浴室系列 |
| 6 | `glass-hinge` | Glass Hinge | 浴室夹 |
| 7 | `sliding-door-kit` | Sliding Door Kit | 移门滑轮套装 |
| 8 | `bathroom-handle` | Bathroom Handle | 浴室&大门拉手 |
| 9 | `door-handle` | Door Handle | 大门拉手 |
| 10 | `hidden-hook` | Hidden Hook | 挂钩 |

---

## 使用方法

### 方法 1：自动初始化（推荐 ✅）

**最简单的方式 - 什么都不用做！**

1. 确保数据库是空的（或 ProductSeries 表为空）
2. 启动 CMS：
   ```bash
   npm run dev
   ```
3. 系统会自动检测并创建种子数据

**启动时会看到：**
```
🌱 Seeding product system...

📁 创建产品分类...
📁 Creating Product Categories...
     ✓ Glass Hardware (玻璃五金): xxx-xxx-xxx
     ✓ Glass Railing & Fencing (玻璃栏杆护栏): xxx-xxx-xxx
     ✓ Glass Doors (玻璃门系列): xxx-xxx-xxx
     ✓ Hardware Accessories (五金配件): xxx-xxx-xxx
✅ 产品分类创建完成！

📦 创建产品系列...
📦 Creating Product Series...
  ✓ Glass Standoff (广告螺丝)
  ✓ Glass Connected Fitting (玻璃栏杆扶手连接件)
  ...
✅ 产品系列创建完成！

🎉 产品系统初始化完成！
```

### 方法 2：手动执行（备用）

如果需要重新初始化：

```bash
# 1. 清空现有数据
docker-compose exec postgres psql -U busrom -d busrom_cms -c "
DELETE FROM \"ProductSeries\";
DELETE FROM \"Category\" WHERE type = 'PRODUCT';
"

# 2. 重启 CMS（会自动触发种子数据）
npm run dev
```

---

## 验证数据

### 验证 Categories 和 ProductSeries（1对1映射）

```bash
docker-compose exec postgres psql -U busrom -d busrom_cms -c "
SELECT
  c.slug as category_slug,
  c.name->>'zh' as category_name,
  ps.slug as series_slug,
  ps.name->>'zh' as series_name
FROM \"Category\" c
LEFT JOIN \"ProductSeries\" ps ON ps.category = c.id
WHERE c.type = 'PRODUCT'
ORDER BY c.\"order\";
"
```

**预期输出：**
```
category_slug         | category_name      | series_slug           | series_name
-----------------------+--------------------+-----------------------+--------------------
glass-standoff        | 广告螺丝           | glass-standoff        | 广告螺丝
glass-connected-fitting | 玻璃栏杆扶手连接件 | glass-connected-fitting | 玻璃栏杆扶手连接件
glass-fence-spigot    | 玻璃护栏支架底座   | glass-fence-spigot    | 玻璃护栏支架底座
...
(10 rows)
```

---

## 数据特点

### Categories & ProductSeries（1对1映射）

- ✅ **扁平结构** - 无层级关系，10个独立分类
- ✅ **1对1映射** - 每个 Category 对应一个 ProductSeries
- ✅ **相同标识** - Category 和 ProductSeries 使用相同的 slug
- ✅ **多语言** - name 和 description 支持英文和中文
- ✅ **类型标识** - Category type 设置为 'PRODUCT'
- ✅ **状态控制** - status 默认为 'ACTIVE'
- ✅ **有序排列** - order 字段从 1 到 10
- ✅ **防重复** - 通过 slug 唯一性约束避免重复

---

## 代码集成

### keystone.ts 配置

```typescript
import { seedProductSystem } from './migrations/seed-product-system'

export default config({
  db: {
    async onConnect(context) {
      // 自动检测并初始化
      const productSeriesCount = await context.query.ProductSeries.count()

      if (productSeriesCount === 0) {
        await seedProductSystem(context)
      }
    }
  }
})
```

### 种子函数位置

- `/cms/migrations/seed-product-system.ts` - 唯一的种子函数

---

## 与 MediaTag 的区别

### MediaTag (PRODUCT_SERIES 类型)
- **用途：** 给 Media（图片）打标签
- **数量：** 10 个（与 ProductSeries 对应）
- **关系：** 独立于 ProductSeries，只是名称相同

### Category & ProductSeries
- **用途：** 实际的产品分类和系列实体
- **数量：** 各 10 个（1对1映射）
- **关系：** 每个 ProductSeries 关联到一个 Category，可以包含多个 Product（SKU）

**三者是独立的！**

---

## 常见问题

### Q: 为什么重启 CMS 没有触发种子数据？

**A:** 检查以下情况：
1. ProductSeries 表不为空（已有数据则不会重新创建）
2. 检查控制台日志是否有错误
3. 确认 keystone.ts 中已导入 `seedProductSystem`

### Q: 如何重新初始化数据？

**A:**
```bash
# 删除现有数据
docker-compose exec postgres psql -U busrom -d busrom_cms -c "
DELETE FROM \"ProductSeries\";
DELETE FROM \"Category\" WHERE type = 'PRODUCT';
"

# 重启 CMS
npm run dev
```

### Q: 种子数据支持自定义吗？

**A:** 可以！编辑 `/cms/migrations/seed-product-system.ts` 文件：
- 修改 `createCategoriesAndSeries()` 函数中的 `data` 数组来调整数据

---

## 下一步

创建完成后，你可以：

1. ✅ 在 CMS 后台查看 10 个产品分类（扁平结构）
2. ✅ 为每个 ProductSeries 添加 featuredImage
3. ✅ 编辑多语言描述
4. ✅ 创建 Product（SKU）并关联到 ProductSeries
5. ✅ 添加 ProductSeriesContentTranslation（富文本内容）

---

## 相关文件

- `/cms/migrations/seed-product-system.ts` - 种子函数
- `/cms/schemas/Category.ts` - Category Schema
- `/cms/schemas/ProductSeries.ts` - ProductSeries Schema
- `/cms/keystone.ts` - 集成配置

祝使用愉快！🎉
