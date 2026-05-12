# Busrom 项目：产品轮播块 (Product Carousel) 开发与解析指南

## 1. 业务背景
在 Busrom 项目的富文本编辑器（Lexical）中，`productCarousel` 是一个高频使用的自定义块。它不仅用于普通的产品滚动展示，还驱动了 `ProductOverview` 首屏的 Hero 随机大图等核心视觉区域。

## 2. 数据模型 (Schema)
每个 `productCarousel` 包含一个 `items` 数组，每个 item 支持两种模式：

| 模式 (`selectionMode`) | 核心字段 | 逻辑描述 |
| :--- | :--- | :--- |
| **manual** (手动) | `product` | 明确指定一个具体的产品 ID 或产品对象。 |
| **auto** (自动) | `productSeries` | 指定一个分类/产品系列，解析器需从中匹配产品。 |

### 附加显示控制字段：
*   `customName`: 手动填写的显示名称（优先级最高）。
*   `showName`: 是否显示产品名称。
*   `showCategory`: 是否显示分类名称（通常用于显示后端的“显示分类”）。
*   `buttonText`: 按钮文案。

---

## 3. 核心架构升级：数据注水 (Hydration) - 2026-05 更新
为了提升渲染效率，我们在 API 层（`lib/api/pages.ts`）实现了 **Lexical 节点原地注水**。
*   **处理**：在 `fetchPageData` 中，我们会并行抓取所有涉及的产品/系列，并将这些完整对象直接替换掉原来的 ID。
*   **兼容性规范**：解析器收到的 `item.product` 可能已变为对象。**必须**使用统一工具函数处理 ID 提取：

```typescript
const getTargetId = (val: any) => (typeof val === 'object' && val !== null ? val.id : val);
```

## 4. 解析器 (Parser) 标准逻辑模板
```typescript
const resolveCarouselItems = (configItems, allProducts) => {
  return configItems.map(item => {
    let product = null;
    const targetId = getTargetId(item.product || item.productSeries);
    
    if (item.selectionMode === 'manual') {
      product = allProducts.find(p => String(p.id) === String(targetId));
    } else {
      // 自动模式：按系列 ID 匹配
      product = allProducts.find(p => {
        const pSeriesId = typeof p.series === 'object' ? p.series.id : p.series;
        return String(pSeriesId) === String(targetId);
      });
    }
    
    if (!product) return null;
    
    // 标题处理：自定义名称 > 分类名(若开启) > 系列/产品名
    const categoryName = product.category?.name || "";
    const baseName = product.name || product.title || "";
    const title = item.customName?.trim() || 
                 ((item.showCategory === true || item.showName === false) ? categoryName : baseName);
                 
    return { ...product, title: title || baseName || categoryName || "" };
  }).filter(Boolean);
};
```

## 5. Payload 3 API 与图片处理警告
*   **字段筛选**：直接请求集合时，必须使用 `&select[fieldName]=true`。格式错误会导致 Payload 仅返回 ID。
*   **Depth 深度**：抓取时 `depth` 必须至少为 2，以获取 `category.name`。
*   **图片数组**：`mainImage` 通常是数组。Hero 组件需要原始数组来实现随机效果，**禁止**在解析层对 Hero 相关的多图字段使用 `resolveMedia`。

## 6. 维护者建议
若发现“有项无图”或“标题为空”，请优先检查 `pages.ts` 中的 `select` 参数拼装以及解析器是否兼容了已注水的对象。
