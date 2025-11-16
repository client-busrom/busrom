# Seed Data System（种子数据系统）

## 📋 概述

本项目使用**统一的自动化种子数据系统**，在 CMS 首次启动时自动初始化所有必要的基础数据。

---

## 🎯 设计原则

### ✅ 统一存放位置
- **所有种子函数** 统一存放在 `/cms/migrations/` 目录
- **使用 TypeScript + Prisma**，与 Keystone 无缝集成
- **不再使用** scripts 文件夹和 SQL 脚本

### ✅ 自动化执行
- 集成到 `keystone.ts` 的 `onConnect` 钩子
- CMS 启动时自动检测并初始化
- 智能跳过已存在的数据

### ✅ 依赖顺序
种子数据按以下顺序执行：
```
1. Media System     (MediaCategory, MediaTag)
2. Product System   (Category, ProductSeries)
3. Navigation System (NavigationMenu)
```

---

## 📦 种子数据内容

### 1. Media System（媒体系统）

**文件：** `migrations/seed-media-system.ts`

**创建内容：**
- **MediaCategory**（8个）- 媒体分类
  - Scene Photo（场景图）
  - White Background（白底图）
  - Composite Use（合用图）
  - Common（通用图）
  - Dimension Drawing（尺寸图）
  - Real Shot（实拍图）
  - Installation Scene（安装场景图）
  - Detail Shot（细节图）

- **MediaTag**（25+个）- 媒体标签
  - PRODUCT_SERIES（10个）：产品系列标签
  - FUNCTION_TYPE（5个）：功能类型标签
  - SCENE_TYPE（4个）：场景类型标签
  - SPEC（示例）：规格标签
  - COLOR（示例）：颜色标签

**依赖：** 无

---

### 2. Product System（产品系统）

**文件：** `migrations/seed-product-system.ts`

**创建内容：**
- **Category**（10个）- 产品分类（扁平结构，无层级）
- **ProductSeries**（10个）- 产品系列（1对1映射）

  | # | Slug | 英文名 | 中文名 |
  |---|------|--------|--------|
  | 1 | glass-standoff | Glass Standoff | 广告螺丝 |
  | 2 | glass-connected-fitting | Glass Connected Fitting | 玻璃栏杆扶手连接件 |
  | 3 | glass-fence-spigot | Glass Fence Spigot | 玻璃护栏支架底座 |
  | 4 | guardrail-glass-clip | Guardrail Glass Clip | 护栏系列 |
  | 5 | bathroom-glass-clip | Bathroom Glass Clip | 浴室系列 |
  | 6 | glass-hinge | Glass Hinge | 浴室夹 |
  | 7 | sliding-door-kit | Sliding Door Kit | 移门滑轮套装 |
  | 8 | bathroom-handle | Bathroom Handle | 浴室&大门拉手 |
  | 9 | door-handle | Door Handle | 大门拉手 |
  | 10 | hidden-hook | Hidden Hook | 挂钩 |

**特点：** Category 和 ProductSeries 使用相同的 slug，实现 1对1 映射

**依赖：** 无

---

### 3. Navigation System（导航系统）

**文件：** `migrations/seed-navigation-system.ts`

**创建内容：**
- **NavigationMenu**（7个顶级菜单 + 子菜单）

  **顶级菜单：**
  1. **Product**（产品）- PRODUCT_CARDS 类型
     - 10个产品系列子菜单
     - 每个子菜单关联对应的 MediaTag

  2. **Shop**（商城）- STANDARD 类型

  3. **Solutions**（解决方案）- SUBMENU 类型
     - Residential（住宅）
     - Commercial（商业）
     - Public Spaces（公共空间）

  4. **Service**（服务）- SUBMENU 类型
     - One-Stop Service（一站式服务）
     - FAQ（常见问题）

  5. **About**（关于我们）- SUBMENU 类型
     - Our Story（我们的故事）
     - Contact Us（联系我们）

  6. **Blog**（博客）- STANDARD 类型

  7. **Support**（支持）- STANDARD 类型
     - Privacy Policy（隐私政策）
     - Fraud Notice（防诈骗声明）

**依赖：** MediaTag（用于 PRODUCT_CARDS 的随机图片）

---

## 🚀 使用方法

### 自动初始化（推荐 ✅）

**最简单的方式 - 直接启动 CMS！**

```bash
npm run dev
```

**首次启动时会看到：**
```
🔍 Checking for seed data initialization...

🌱 开始初始化媒体系统...
📁 创建媒体分类...
✅ 媒体分类创建完成！
🏷️  创建标签...
✅ 标签创建完成！
🎉 媒体系统初始化完成！

🌱 开始初始化产品系统...
📁 创建产品分类...
✅ 产品分类创建完成！
📦 创建产品系列...
✅ 产品系列创建完成！
🎉 产品系统初始化完成！

🌱 开始初始化导航系统...
🧭 创建导航菜单...
✅ 导航菜单创建完成！
🎉 导航系统初始化完成！

✅ All systems ready!
```

**后续启动时会看到：**
```
🔍 Checking for seed data initialization...

✓ Media system already initialized
✓ Product system already initialized
✓ Navigation system already initialized

✅ All systems ready!
```

---

## 🔄 手动重新初始化

如果需要重置所有种子数据：

```bash
# 1. 清空所有种子数据
docker-compose exec postgres psql -U busrom -d busrom_cms << EOF
DELETE FROM "NavigationMenu";
DELETE FROM "ProductSeries";
DELETE FROM "Category" WHERE type = 'PRODUCT';
DELETE FROM "MediaTag";
DELETE FROM "MediaCategory";
EOF

# 2. 重启 CMS（会自动重新创建）
npm run dev
```

---

## 📁 文件结构

```
/cms/
├── migrations/
│   ├── seed-media-system.ts          # 媒体系统种子数据
│   ├── seed-product-system.ts        # 产品系统种子数据
│   ├── seed-navigation-system.ts     # 导航系统种子数据
│   ├── README_SEEDS.md               # 本文档（种子系统总览）
│   ├── README_PRODUCT_SYSTEM.md      # 产品系统详细文档
│   ├── OPERATOR_GUIDE.md             # 运营人员使用指南
│   └── QUICK_REFERENCE.md            # 快速参考
│
├── keystone.ts                        # 集成了所有种子初始化
└── package.json                       # 已移除 seed 脚本
```

---

## 🔧 技术细节

### 集成方式

**keystone.ts 配置：**
```typescript
import { seedMediaSystem } from './migrations/seed-media-system'
import { seedProductSystem } from './migrations/seed-product-system'
import { seedNavigationSystem } from './migrations/seed-navigation-system'

export default config({
  db: {
    async onConnect(context) {
      // 1. Media System
      const mediaCategoryCount = await context.query.MediaCategory.count()
      if (mediaCategoryCount === 0) {
        await seedMediaSystem(context)
      }

      // 2. Product System
      const productSeriesCount = await context.query.ProductSeries.count()
      if (productSeriesCount === 0) {
        await seedProductSystem(context)
      }

      // 3. Navigation System
      const navigationMenuCount = await context.query.NavigationMenu.count()
      if (navigationMenuCount === 0) {
        await seedNavigationSystem(context)
      }
    }
  }
})
```

### 检测逻辑

每个系统通过检查关键表的记录数来判断是否需要初始化：
- **Media System** → `MediaCategory.count() === 0`
- **Product System** → `ProductSeries.count() === 0`
- **Navigation System** → `NavigationMenu.count() === 0`

### 防重复机制

- ✅ 使用 Prisma 的 `unique` 约束（slug 字段）
- ✅ 智能检测已存在的数据
- ✅ 可安全重复执行

---

## ✅ 验证数据

### 验证媒体系统
```bash
docker-compose exec postgres psql -U busrom -d busrom_cms -c "
SELECT 'MediaCategory' as type, COUNT(*) as count FROM \"MediaCategory\"
UNION ALL
SELECT 'MediaTag', COUNT(*) FROM \"MediaTag\";
"
```

### 验证产品系统
```bash
docker-compose exec postgres psql -U busrom -d busrom_cms -c "
SELECT
  c.slug as category_slug,
  ps.slug as series_slug,
  c.name->>'zh' as name_zh
FROM \"Category\" c
LEFT JOIN \"ProductSeries\" ps ON ps.category = c.id
WHERE c.type = 'PRODUCT'
ORDER BY c.\"order\";
"
```

### 验证导航系统
```bash
docker-compose exec postgres psql -U busrom -d busrom_cms -c "
SELECT COUNT(*) as total_menus FROM \"NavigationMenu\"
UNION ALL
SELECT COUNT(*) FROM \"NavigationMenu\" WHERE parent IS NULL;
"
```

---

## 🚨 常见问题

### Q: 为什么启动时没有执行种子数据？

**A:** 检查以下情况：
1. 对应表已有数据（不会重复创建）
2. 查看控制台是否有错误日志
3. 确认 `keystone.ts` 正确导入了种子函数

### Q: 如何跳过某个系统的初始化？

**A:** 编辑 `keystone.ts`，注释掉对应的种子调用：
```typescript
// 跳过导航系统初始化
// if (navigationMenuCount === 0) {
//   await seedNavigationSystem(context)
// }
```

### Q: 可以修改种子数据吗？

**A:** 可以！编辑 `/cms/migrations/seed-*.ts` 文件，然后：
1. 清空对应表的数据
2. 重启 CMS

### Q: 为什么不用 SQL 脚本？

**A:** TypeScript + Prisma 的优势：
- ✅ 类型安全
- ✅ 与 Keystone 无缝集成
- ✅ 可以访问 Keystone Context API
- ✅ 支持关系和虚拟字段
- ✅ 更易于维护和测试

---

## 📝 开发注意事项

### 添加新的种子数据

1. 在 `/cms/migrations/` 创建新文件：`seed-xxx-system.ts`
2. 导出主函数：`export async function seedXxxSystem(context: Context)`
3. 在 `keystone.ts` 中导入并调用
4. 更新本文档

### 种子函数模板

```typescript
import type { Context } from '.keystone/types'

export async function seedXxxSystem(context: Context) {
  console.log('🌱 开始初始化 XXX 系统...')

  try {
    // 检查是否已存在
    const count = await context.query.XxxModel.count()
    if (count > 0) {
      console.log('  ⚠️  XXX 系统已存在，跳过创建')
      return
    }

    // 创建数据
    await context.query.XxxModel.createOne({
      data: { /* ... */ }
    })

    console.log('✅ XXX 系统初始化完成！')
  } catch (error) {
    console.error('❌ XXX 系统初始化失败:', error)
    throw error
  }
}
```

---

## 📚 相关文档

- [Media System 详细说明](./seed-media-system.ts)
- [Product System 详细说明](./README_PRODUCT_SYSTEM.md)
- [Navigation System 详细说明](./seed-navigation-system.ts)
- [Keystone 配置](../keystone.ts)

---

**祝使用愉快！🎉**

如有问题，请查阅 [Keystone 官方文档](https://keystonejs.com/docs) 或联系开发团队。
