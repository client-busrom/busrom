# 博客模板 — 富文本块/布局支持矩阵

> 生成日期: 2026-07-05
> 更新日期: 2026-07-05

## 架构概述

三个博客模板（`BlogTemplateOne` / `BlogTemplateTwo` / `BlogTemplateThree`）共用 `BlogLexicalRenderer` 渲染 Lexical 富文本内容。**`BlogLexicalRenderer` 是独立渲染器**，不再依赖/包裹共享的 `LexicalRenderer`。这样做是为了：

1. 博客模板可以拥有自己专属的块实现和样式，不影响其他子页。
2. 共享 `LexicalRenderer.tsx` 保持原样，避免改动影响全站其他页面。
3. 三个模板的块渲染能力仍然完全一致，差异仅在于布局样式（颜色、网格、侧边栏位置）及模板级功能（作者卡片、推荐帖子等）。

### 核心文件

| 文件 | 说明 |
|------|------|
| `web/components/blog/BlogLexicalRenderer.tsx` | **博客专用 Lexical 渲染器入口**（标准文本节点 + 块映射） |
| `web/components/blog/blocks/` | 博客专用块组件目录 |
| `web/components/blog/BlogLexicalRenderer/context.tsx` | `MediaContext` / `LocaleContext` / `ConvertersContext` |
| `web/components/blog/BlogLexicalRenderer/NestedRenderer.tsx` | 嵌套富文本递归渲染器 |
| `web/components/blog/BlogLexicalRenderer/utils.ts` | 共享工具函数（`getCmsUrl`、`filterUndefined`） |
| `web/components/lexical/LexicalRenderer.tsx` | 共享 Lexical 渲染器（博客渲染器不依赖它） |
| `web/components/blog/templates/BlogTemplateOne.tsx` | 模板一 |
| `web/components/blog/templates/BlogTemplateTwo.tsx` | 模板二 |
| `web/components/blog/templates/BlogTemplateThree.tsx` | 模板三 |

---

## 一、完整支持（✅）

这些块在 `web/components/blog/blocks/` 中有完整实现的 React 渲染组件，并在 `BlogLexicalRenderer.tsx` 中注册映射。

### Content Features（Lexical Features）

| 块名 | Payload Slug | 组件名 | 定义位置 | 渲染器位置 |
|------|-------------|--------|---------|-----------|
| 单图 | `single-image` / `singleImage` | `SingleImageBlock` | `payload-cms/src/lexical-features/single-image/` | `web/components/blog/blocks/SingleImageBlock.tsx` |
| 图片画廊 | `image-gallery` / `custom-image-gallery` / `imageGallery` | `ImageGalleryBlock` | `payload-cms/src/lexical-features/image-gallery/` | `web/components/blog/blocks/ImageGalleryBlock.tsx` |
| 视频嵌入 | `video-embed` / `videoEmbed` | `VideoEmbedBlock` | `payload-cms/src/lexical-features/video-embed/` | `BlogLexicalRenderer.tsx`（内联） |
| CTA 按钮 | `cta-button` / `ctaButton` | `CtaButtonBlock` | `payload-cms/src/lexical-features/cta-button/` | `BlogLexicalRenderer.tsx`（内联） |
| 公告 | `notice` | `NoticeBlock` | `payload-cms/src/lexical-features/notice/` | `BlogLexicalRenderer.tsx`（内联） |
| Hero | `hero` | `HeroBlock` | `payload-cms/src/lexical-features/hero/` | `BlogLexicalRenderer.tsx`（内联） |
| 轮播 | `carousel` | `CarouselBlock` | `payload-cms/src/lexical-features/carousel/` | `web/components/blog/blocks/CarouselBlock.tsx` |
| 链接跳转 | `link-jump` / `linkJump` | `LinkJumpBlock` | `payload-cms/src/lexical-features/link-jump/` | `BlogLexicalRenderer.tsx`（内联） |
| 跑马灯链接 | `marquee-links` / `marqueeLinks` | `MarqueeLinksBlock` | `payload-cms/src/lexical-features/marquee-links/` | `web/components/blog/blocks/MarqueeLinksBlock.tsx` |
| 产品轮播 | `product-carousel` / `productCarousel` | `ProductCarouselBlock` | `payload-cms/src/lexical-features/product-carousel/` | `web/components/lexical/blocks/ProductCarouselBlock.tsx` |
| 图标列表 | `icon-list` / `iconList` | `IconListBlock` | `payload-cms/src/lexical-features/icon-list/` | `web/components/blog/blocks/IconListBlock.tsx` |
| 表单块 | `formBlock` | `FormBlock` | `payload-cms/src/lexical-features/form-block/` | `web/components/blog/blocks/FormBlock.tsx` |
| 案例轮播 | `applicationCarousel` | `ApplicationCarouselBlock` | `payload-cms/src/lexical-features/application-carousel/` | `web/components/blog/blocks/ApplicationCarouselBlock.tsx` |
| FAQ 轮播 | `faqCarousel` | `FaqCarouselBlock` | `payload-cms/src/lexical-features/faq-carousel/` | `web/components/blog/blocks/FaqCarouselBlock.tsx` |
| FAQ 选择 | `faqSelection` | `FaqSelectionBlock` | `payload-cms/src/lexical-features/faq-selection/` | `web/components/blog/blocks/FaqSelectionBlock.tsx` |
| 可复用块 | `reusable-block` / `reusableBlock` | `ReusableBlock` | `payload-cms/src/lexical-features/reusable-block/` | `BlogLexicalRenderer.tsx`（内联） |
| 产品可复用块 | `product-reusable-block` / `productReusableBlock` | `ReusableBlock` | `payload-cms/src/lexical-features/product-reusable-block/` | `BlogLexicalRenderer.tsx`（内联） |
| 系列可复用块 | `series-reusable-block` / `seriesReusableBlock` | `ReusableBlock` | `payload-cms/src/lexical-features/series-reusable-block/` | `BlogLexicalRenderer.tsx`（内联） |

### Layout Blocks

| 块名 | Payload Slug | 组件名 | 定义位置 | 渲染器位置 |
|------|-------------|--------|---------|-----------|
| 两栏布局 | `twoColumns` | `TwoColumnsBlock` | `payload-cms/src/blocks/TwoColumns.ts` | `web/components/blog/blocks/LayoutBlocks.tsx` |
| 三栏布局 | `threeColumns` | `ThreeColumnsBlock` | `payload-cms/src/blocks/ThreeColumns.ts` | `web/components/blog/blocks/LayoutBlocks.tsx` |
| 流式/环绕布局 | `fluidLayout` | `FluidLayoutBlock` | `payload-cms/src/blocks/FluidLayout.ts` | `web/components/blog/blocks/LayoutBlocks.tsx` |
| 容器 | `container` | `ContainerBlock` | `payload-cms/src/blocks/Container.ts` | `web/components/blog/blocks/LayoutBlocks.tsx` |
| 侧边栏布局 | `sidebar` | `SidebarBlock` | `payload-cms/src/blocks/Sidebar.ts` | `web/components/blog/blocks/LayoutBlocks.tsx` |
| 作者卡片 | `authorCard` | `AuthorCardBlock` | `payload-cms/src/blocks/AuthorCard.ts` | `web/components/blog/blocks/AuthorCardBlock.tsx` |
| 清单 | `checklist` | `ChecklistBlock` | `payload-cms/src/blocks/Checklist.ts`（注释称已移除） | `web/components/blog/blocks/ChecklistBlock.tsx` |

> 注：自定义 `Checklist` Block 已被 Payload 原生 `ChecklistFeature` 取代；博客渲染器同时兼容旧版 `checklist` block 数据。

---

## 二、占位符实现（⚠️）

博客渲染器中**没有占位符块**。所有在博客编辑器中可用的块都有真实渲染。

> 共享的 `LexicalRenderer.tsx` 中仍有以下占位符（不影响博客）：
> - `threeColumns`
> - `container`

---

## 三、无渲染器（❌）

博客渲染器中**没有缺失的渲染器**。所有在博客编辑器中可用的块都已映射。

> 共享的 `LexicalRenderer.tsx` 中仍有以下块无渲染器（不影响博客）：
> - `sidebar`
> - `formBlock`
> - `applicationCarousel`
> - `faqCarousel`
> - `faqSelection`
> - `checklist`

---

## 四、模板级功能差异（非 Lexical 块）

三模板在 Lexical 渲染之外的**模板层面功能**有差异：

| 功能 | TemplateOne | TemplateTwo | TemplateThree |
|------|:-----------:|:-----------:|:-------------:|
| TOC（目录） | ✅ 侧边栏 | ✅ 侧边栏 | ✅ 侧边栏 |
| 分享按钮 | ✅ | ✅ | ✅ |
| 搜索框 | ✅ | ✅ | ✅ |
| 分类列表 | ✅ | ✅ | ✅ |
| 推荐帖子 | ✅ | ✅ | ✅ |
| 关注我们 | ✅ | ✅ | ✅ |
| 底部分类 | ✅ | ✅ | ✅ |
| 上下篇分页 | ✅ | ✅ | ✅ |
| 底部推荐 | ✅ | ✅ | ✅ |
| 作者简介卡片 | ✅ 内联 | ❌ | ✅ 内联 |

---

## 五、映射机制说明

`BlogLexicalRenderer` 维护了双层兼容：

1. **顶层 Feature 节点**（`customConverters` 直接映射）：处理 Lexical Feature 生成的顶层节点
2. **嵌套 Block 节点**（`customConverters.blocks`）：处理通过旧版 `BlocksFeature` 或 `blockType` 嵌套在容器块内的子块

两层映射的关键值基本一致，确保无论块在编辑器中如何嵌套都能正确渲染。

### 博客渲染器 vs 共享渲染器

| 范围 | 文件 | 状态 |
|------|------|------|
| 博客模板渲染 | `web/components/blog/BlogLexicalRenderer.tsx` | 全部补齐 ✅ |
| 其他页面渲染 | `web/components/lexical/LexicalRenderer.tsx` | 保持原样（仍有占位符/缺失） |

### 新增/变更块清单

本次补齐的块：

- `threeColumns` → `ThreeColumnsBlock`
- `container` → `ContainerBlock`
- `sidebar` → `SidebarBlock`
- `checklist` → `ChecklistBlock`
- `formBlock` → `FormBlock` / `FormBlockWithLocale`
- `applicationCarousel` → `ApplicationCarouselBlock`
- `faqCarousel` → `FaqCarouselBlock`
- `faqSelection` → `FaqSelectionBlock`
