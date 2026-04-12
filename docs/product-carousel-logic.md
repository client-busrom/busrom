# Busrom 项目：产品轮播块 (Product Carousel) 开发与解析指南

## 1. 业务背景
在 Busrom 项目的富文本编辑器（Lexical）中，`productCarousel` 是一个高频使用的自定义块。它不仅用于普通的产品滚动展示，还驱动了 `ProductOverview` 首屏的 Hero 随机大图等核心视觉区域。

## 2. 数据模型 (Schema)
每个 `productCarousel` 包含一个 `items` 数组，每个 item 支持两种模式：

| 模式 (`selectionMode`) | 核心字段 | 逻辑描述 |
| :--- | :--- | :--- |
| **manual** (手动) | `product` | 明确指定一个具体的产品 ID 或产品对象。 |
| **auto** (自动) | `productSeries` | 指定一个分类/产品系列，前端需从该系列中随机抽取产品。 |

### 附加显示字段：
*   `customName`: 手动填写的显示名称（优先级最高）。
*   `showName`: 是否显示产品名称。
*   `showCategory`: 是否显示分类名称（若为 true，通常优先显示分类名）。
*   `buttonText`: 按钮文案。

## 3. 前端解析标准逻辑
在开发解析器 (Parser) 时，必须兼容上述两种模式，否则会导致数据丢失（如 `item.product` 为空）。

### 推荐解析代码模板：
```typescript
const resolveCarouselItems = (configItems, allProducts) => {
  return configItems.map(item => {
    let product = null;
    
    if (item.selectionMode === 'manual') {
      // 手动模式：按产品 ID 匹配
      const prodId = typeof item.product === 'object' ? item.product.id : item.product;
      product = allProducts.find(p => String(p.id) === String(prodId));
    } else {
      // 自动模式：按分类/系列 ID 随机匹配
      const seriesId = typeof item.productSeries === 'object' ? item.productSeries.id : item.productSeries;
      product = allProducts.find(p => String(p.series?.id || p.series) === String(seriesId));
    }
    
    if (!product) return null;
    
    return {
      ...product,
      // 标题处理：自定义名称 > 分类名(若开启) > 产品名
      title: item.customName || (item.showCategory ? product.category?.name : product.name)
    };
  }).filter(Boolean);
};
```

## 4. 图片处理的关键坑点
*   **数组 vs 对象**：Payload CMS 中的 `mainImage` 通常是图片的**数组**。
*   **解析器警告**：常用的 `resolveMedia()` 工具函数通常只能处理**单个对象**。如果直接把 `mainImage` 数组传给它，会返回 `null`。
*   **Hero Section 特殊需求**：首屏 Hero 组件为了实现随机切换特效，**必须**拿到原始的图片数组（`mainImage`、`gallery`）。在解析这一块时，**禁止**对图片字段使用 `resolveMedia`，应透传整个数组供组件内部处理。

## 5. 维护者建议
在修改 `ProductOverview` 或 `OneStopSolution` 等模板的数据解析流时，请务必先核对该区域的 `productCarousel` 标记。标记不匹配或解析模式单一（只写了 manual）是导致线上图片“突然消失”的最常见原因。
