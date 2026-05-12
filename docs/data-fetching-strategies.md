# Busrom 项目：前后端数据抓取与路由映射指南

为了确保 CMS 数据能正确渲染，必须理解以下三类核心页面的“后端集合 -> 前端路由 -> 数据管道”的映射关系。

---

## 1. 固定模板页 (One-Stop / Overview)
**前端 URL**：`/[locale]/products` (One-Stop) 或 `/[locale]/product-overview`
**后端对应**：`pages` (页面) 集合中 Slug 为 `one-stop-solution` 或 `product-overview` 的文档。

### 核心逻辑：
*   **路由控制**：`web/app/[locale]/[slug]/page.tsx`
*   **识别标识 (Slugs)**：在代码中通过 `ONE_STOP_SHOP` 或 `PRODUCT_OVERVIEW` 常量识别。
*   **数据管道 (Pipeline)**：`web/lib/api/pages.ts`
*   **解析关键点**：
    *   **Marker 机制**：解析器在富文本中寻找特定的“标记位”（如 `OneStopMarker`）来挂载固定模板。
    *   **原地注水 (Hydration)**：API 层会识别这些 Marker，并并行抓取产品/系列数据，将 ID 直接替换为对象。
*   **常见 Bug**：如果修改了 `pages.ts` 的 `select` 参数，这些页面的图片或分类标题会失效。

---

## 2. 产品链接整合页 (Shop Category Pages)
**前端 URL**：`/[locale]/shop/[slug]` (例如：`/en/shop/shower-room`)
**后端对应**：`pages` (页面) 集合中的普通文档，通常在 CMS 中标记为**产品链接整合页**。

### 核心逻辑：
*   **路由控制**：`web/app/[locale]/shop/[slug]/page.tsx`
*   **数据管道 (Pipeline)**：使用 `SectionRenderer.tsx`。
*   **解析关键点**：
    *   **Section 机制**：使用 `parseSectionData.ts` 对富文本内容进行分块（Sectioning）。
    *   **动态加载**：部分 Section（如产品轮播）可能会调用 `/api/products/carousel` 异步加载数据。
*   **注意**：这套解析流与“固定模板”完全隔离。修改 `one-stop-solution-parser.ts` **不会**影响这类页面。

---

## 3. 产品详解整合页 (Product Detail Pages)
**前端 URL**：`/[locale]/products/[slug]` (例如：`/en/products/faucet-a1`)
**后端对应**：`products` (产品) 集合中的具体条目。

### 核心逻辑：
*   **路由控制**：`web/app/[locale]/products/[slug]/page.tsx`
*   **数据管道 (Pipeline)**：`web/lib/api/products.ts` 中的 `getProductBySlug`。
*   **解析关键点**：
    *   **全字段抓取**：由于是详情页，通常设置 `depth=3` 或更高，以拉取规格 (Specs)、系列、推荐产品等。
    *   **模板驱动**：直接将产品对象传给详情页组件，不涉及复杂的 Page Parser。
*   **常见 Bug**：如果关联的产品系列 (Series) 没有带出分类名，通常是 `depth` 设置不够。

---

## 快速对照表

| 后端定义 (Payload CMS) | 前端 URL 路径 | API 入口文件 | 解析逻辑 |
| :--- | :--- | :--- | :--- |
| **固定模板 (One-Stop)** | `/[locale]/products` | `lib/api/pages.ts` | Marker 识别 + 原地注水 |
| **产品链接整合页** | `/[locale]/shop/[slug]` | `shop/[slug]/page.tsx` | Section 分段解析 |
| **产品详解整合页** | `/[locale]/products/[slug]` | `lib/api/products.ts` | 全字段加载 + 详情模板 |

### 核心区分指南：
1.  **路径区别**：`/shop/` 开头的是列表/整合页，`/products/` 后面跟具体 ID/Slug 的是详情页。
2.  **数据流区别**：固定模板的数据是在 `pages.ts` 里“提前处理”好的；产品链接页的数据是在渲染 Section 时“按需解析”或“二次请求”的。
