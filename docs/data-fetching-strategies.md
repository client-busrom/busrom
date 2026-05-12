# Busrom 项目：前后端数据抓取与路由映射指南

为了确保 CMS 数据能正确渲染，必须理解以下三类核心页面的“后端集合 -> 前端路由 -> 数据管道”的映射关系。**注意：本项目的前端路径命名与后端集合存在“反直觉”的对应关系。**

---

## 1. 固定模板页 (One-Stop / Overview)
**前端 URL**：`/[locale]/one-stop-solution` 或 `/[locale]/products`
**后端对应**：`pages` (页面) 集合中 Slug 为 `one-stop-solution` 或 `product-overview` 的文档。

### 核心逻辑：
*   **路由控制**：`web/app/[locale]/[slug]/page.tsx`
*   **识别标识 (Slugs)**：在代码中通过 `ONE_STOP_SHOP` 或 `PRODUCT_OVERVIEW` 常量识别。
*   **数据管道 (Pipeline)**：`web/lib/api/pages.ts`
*   **解析机制**：Marker 识别 + 原地注水 (Hydration)。

---

## 2. 产品链接整合页 (Shop Pages)
**前端 URL**：`/[locale]/shop/[slug]` (例如：`/en/shop/shower-room-a1`)
**后端对应**：**`products` (产品)** 集合中的具体文档。
**CMS 名称**：通常标记为**产品链接整合页**。

### 核心逻辑：
*   **路由控制**：`web/app/[locale]/shop/[slug]/page.tsx`
*   **数据管道 (Pipeline)**：`web/lib/api/products.ts` 中的 `getProductBySlug`。
*   **渲染逻辑**：由 `ProductDetailClient` 和 `SectionRenderer` 负责。

---

## 3. 产品详解整合页 (Product Series Pages)
**前端 URL**：`/[locale]/products/[slug]` (例如：`/en/products/shower-room-series`)
**后端对应**：**`product-series` (产品系列)** 集合中的具体条目。
**CMS 名称**：通常标记为**产品详解整合页**。

### 核心逻辑：
*   **路由控制**：`web/app/[locale]/products/[slug]/page.tsx`
*   **数据管道 (Pipeline)**：`web/lib/api/product-series.ts` 中的 `getProductSeriesBySlug`。
*   **解析关键点**：渲染的是整个产品系列的聚合信息。

---

## 快速对照表

| 后端定义 (Payload CMS) | 对应集合 (Collection) | 前端 URL 路径 | API 入口文件 |
| :--- | :--- | :--- | :--- |
| **固定模板 (One-Stop)** | `pages` | `/[locale]/products` | `lib/api/pages.ts` |
| **产品链接整合页** | **`products`** | `/[locale]/shop/[slug]` | `lib/api/products.ts` |
| **产品详解整合页** | **`product-series`** | `/[locale]/products/[slug]` | `lib/api/product-series.ts` |

### 核心区分指南（重要）：
1.  **路径反差**：虽然前端路径叫 `/products/`，但它展示的是**系列 (Series)**；虽然前端路径叫 `/shop/`，但它展示的是**具体产品 (Product)**。
2.  **数据流区别**：固定模板的数据是在 `pages.ts` 里“提前注水”好的；而“整合页”系列则是直接调用对应的详情 API。
