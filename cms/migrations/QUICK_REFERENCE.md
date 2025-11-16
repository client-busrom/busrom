# 媒体系统快速参考

**Media System Quick Reference**

---

## 🚀 对于运营人员

### 情况 1：系统是空的（推荐使用预设数据）

**方法**：系统已配置自动初始化，直接运行 `npm run dev` 即可

📖 **详细教程**：[README_SEEDS.md](./README_SEEDS.md)
📖 **完整指南**：[OPERATOR_GUIDE.md](./OPERATOR_GUIDE.md)

**简要步骤**：
1. 运行 `npm run dev`
2. 系统自动创建所有种子数据（仅第一次）：
   - MediaCategory 和 MediaTag
   - Product Categories 和 ProductSeries
   - Navigation Menus

---

### 情况 2：需要手动创建分类和标签

参考 [OPERATOR_GUIDE.md](./OPERATOR_GUIDE.md) 中的"方案 B"

---

## 🎯 快速上传第一张图片

1. **访问 CMS**：http://localhost:3000
2. **点击 Media → Create Media**
3. **填写必填项**：
   - File：上传图片
   - Filename：文件名
   - Alt Text：英文 + 中文描述
   - Primary Category：选择分类
   - Tags：选择 2-3 个标签
4. **点击 Save**

---

## 📊 预设数据内容

### 分类（8 个）

```
📁 Common（通用）
📁 Product（产品）
   ├─ 📁 By Product Series（按产品系列）
   └─ 📁 By Function（按功能分类）
      ├─ 📄 Scene Photo（场景图）
      ├─ 📄 White Background（白底图）
      ├─ 📄 Dimension Drawing（尺寸图）
      ├─ 📄 Real Shot（实拍图）
      └─ 📄 Composite Use（合用图）
```

### 标签（25 个）

- **产品系列**（10 个）：Glass Standoff、Glass Hinge、Door Handle...
- **功能类型**（5 个）：Scene Photo、White Background、Dimension Drawing...
- **场景类型**（4 个）：Normal Scene、Single Scene、Combination Scene...
- **规格**（3 个）：50mm、100mm、150mm
- **颜色**（3 个）：Black、Silver、Gold

---

## 🛠️ 对于开发人员

### 运行种子数据

**推荐方法**：使用 `onConnect` hook

详见：[HOW_TO_RUN_SEED.md](./HOW_TO_RUN_SEED.md)

```typescript
// 在 keystone.ts 中添加
import { seedMediaSystem } from './migrations/seed-media-system'

db: {
  async onConnect(context) {
    const categoryCount = await context.query.MediaCategory.count()
    if (categoryCount === 0) {
      await seedMediaSystem(context)
    }
  },
}
```

然后运行：
```bash
npm run dev
```

### 重新生成数据

```bash
# 1. 手动删除现有数据（在 Keystone Admin UI）
# 2. 重新运行种子脚本
npm run seed:media
```

### 自定义种子数据

编辑文件：`cms/migrations/seed-media-system.ts`

---

## 📝 字段说明

### Media 模型

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | Image | ✅ | 上传图片文件 |
| filename | Text | ✅ | 文件名 |
| altText | JSON | ✅ | 多语言 Alt 文本 |
| primaryCategory | Relationship | ❌ | 主分类（单选） |
| tags | Relationship | ❌ | 标签（多选） |
| metadata | JSON | ❌ | 额外属性 |
| status | Select | ✅ | ACTIVE / ARCHIVED |

### MediaCategory 模型

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | JSON | ✅ | 多语言名称 |
| slug | Text | ✅ | URL 友好标识符 |
| parent | Relationship | ❌ | 父分类 |
| depth | Integer | 自动 | 层级深度（0-2） |
| type | Select | ❌ | 分类类型 |
| order | Integer | ❌ | 排序 |

### MediaTag 模型

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | JSON | ✅ | 多语言名称 |
| slug | Text | ✅ | URL 友好标识符 |
| type | Select | ✅ | 标签类型 |
| color | Text | ✅ | HEX 颜色代码 |
| order | Integer | ❌ | 排序 |

---

## 🎨 最佳实践

### 文件命名

```
{系列}-{功能}-{编号}.{扩展名}

示例：
glass-standoff-scene-01.jpg
glass-hinge-white-bg-01.jpg
door-handle-dimension-01.jpg
```

### Alt Text 格式

```
英文：{Product Name} + {Scene Description}
中文：{产品名称} + {场景描述}

示例：
EN: "Glass Standoff in modern bathroom scene"
ZH: "广告螺丝在现代浴室场景中的应用"
```

### 标签选择组合

```
至少选择 2-3 个标签：

✅ Glass Standoff（产品系列）
✅ Scene Photo（功能类型）
✅ Single Scene（场景类型）
✓ 50mm（规格，可选）
✓ Black（颜色，可选）
```

### Metadata 示例

```json
{
  "sceneNumber": 1,
  "sceneType": "单独",
  "seriesNumber": 2,
  "specs": ["50mm", "不锈钢"],
  "colors": ["黑色", "银色"]
}
```

---

## ❓ 常见问题

### Q: 可以删除图片吗？
**A**: 不能物理删除。请将 Status 改为 ARCHIVED。

### Q: 最多可以创建几层分类？
**A**: 最多 3 层（depth: 0, 1, 2）。

### Q: 如何批量上传图片？
**A**: 当前版本不支持，需要逐个上传。

### Q: mediaCount 字段如何更新？
**A**: 自动计算，无需手动维护。

---

## 📚 相关文档

- **运营指南**：[OPERATOR_GUIDE.md](./OPERATOR_GUIDE.md)
- **技术文档**：[README.md](./README.md)
- **种子脚本**：`seed-media-system.ts`
- **Schema 文件**：
  - `schemas/Media.ts`
  - `schemas/MediaCategory.ts`
  - `schemas/MediaTag.ts`

---

**最后更新**: 2025-11-02
