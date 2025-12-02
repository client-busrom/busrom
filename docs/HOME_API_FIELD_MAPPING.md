# 首页 API 字段映射文档

> 本文档用于前后端联调，详细说明 `homeContent_EN.ts` (前端 Mock 数据) 与后端 CMS Schemas 的字段对应关系及转换需求。

## 目录

1. [通用说明](#通用说明)
2. [HeroBannerItem](#1-herobanneritem)
3. [ProductSeriesCarousel](#2-productseriescarousel)
4. [ServiceFeaturesConfig](#3-servicefeaturesconfig)
5. [SimpleCta](#4-simplecta)
6. [SeriesIntro](#5-seriesintro)
7. [FeaturedProducts](#6-featuredproducts)
8. [BrandAdvantages](#7-brandadvantages)
9. [OemOdm](#8-oemodm)
10. [QuoteSteps](#9-quotesteps)
11. [MainForm](#10-mainform)
12. [WhyChooseBusrom](#11-whychoosebusrom)
13. [CaseStudies](#12-casestudies)
14. [BrandAnalysis](#13-brandanalysis)
15. [BrandValue](#14-brandvalue)
16. [API 转换层核心任务](#api-转换层核心任务)

---

## 通用说明

### 多语言字段格式

后端所有多语言字段使用 `MultilingualJSONField` 自定义组件，存储格式为：

```typescript
{
  "en": "English text",
  "zh": "中文文本",
  "es": "Texto en español",
  // ... 共支持 24 种语言
}
```

**支持的语言代码**: `en`, `zh`, `es`, `pt`, `fr`, `de`, `it`, `nl`, `sv`, `da`, `no`, `fi`, `is`, `cs`, `hu`, `pl`, `sk`, `ar`, `he`, `fa`, `tr`, `az`, `ber`, `ku`

### 图片字段格式

后端图片字段使用 `SingleMediaField` 自定义组件，存储格式为 **Media ID 字符串**：

```typescript
// 后端存储
"cm1234567890abcdef"  // Media 表的 ID

// 需要查询 Media 表获取完整信息
{
  id: "cm1234567890abcdef",
  filename: "image.jpg",
  file: { url: "/uploads/image.jpg" },
  variants: {
    thumbnail: "/uploads/image-thumb.jpg",
    medium: "/uploads/image-medium.jpg",
    large: "/uploads/image-large.jpg"
  }
}
```

### 前端期望的 ImageObject 格式

```typescript
interface ImageObject {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}
```

---

## 1. HeroBannerItem

**类型**: 多条记录 (最多 9 条)
**后端 Schema**: `cms/schemas/HeroBannerItem.ts`

### 字段映射表

| 前端字段 | 后端字段 | 后端类型 | GraphQL 输出 | 转换说明 |
|---------|---------|---------|--------------|----------|
| `title: string` | `title` | `json` | `{ en: "...", zh: "..." }` | 按 locale 提取对应语言值 |
| `features: string[]` | `feature1` ~ `feature5` | `json` x 5 | 各自 `{ en: "...", zh: "..." }` | 组装成 5 元素数组 |
| `images: ImageObject[]` | `image1` ~ `image4` | `json` x 4 | Media ID 字符串 | 查询 Media 表，组装成 4 元素数组 |
| - | `order` | `integer` | `1-9` | 用于排序，前端无对应字段 |
| - | `status` | `select` | `DRAFT` / `PUBLISHED` | 过滤条件，只返回 PUBLISHED |
| - | `enabled` | `checkbox` | `boolean` | 过滤条件 |

### GraphQL 查询示例

```graphql
query HeroBannerItems {
  heroBannerItems(
    where: { status: { equals: "PUBLISHED" }, enabled: { equals: true } }
    orderBy: { order: asc }
  ) {
    id
    title
    feature1
    feature2
    feature3
    feature4
    feature5
    image1
    image2
    image3
    image4
    order
  }
}
```

### API 转换示例

```typescript
// 后端原始数据
const backendData = {
  title: { en: "Glass Standoff", zh: "玻璃支撑件" },
  feature1: { en: "Feature 1", zh: "特点1" },
  feature2: { en: "Feature 2", zh: "特点2" },
  // ...
  image1: "media-id-1",
  image2: "media-id-2",
  // ...
};

// 转换后 (locale = 'en')
const frontendData = {
  title: "Glass Standoff",
  features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
  images: [
    { src: "/uploads/img1.jpg", alt: "Image 1", width: 800, height: 600 },
    { src: "/uploads/img2.jpg", alt: "Image 2", width: 800, height: 600 },
    // ...
  ],
};
```

---

## 2. ProductSeriesCarousel

**类型**: Singleton (单例)
**后端 Schema**: `cms/schemas/ProductSeriesCarousel.ts`

### 字段映射表

| 前端字段 | 后端字段 | 后端类型 | 转换说明 |
|---------|---------|---------|----------|
| `items: ProductSeriesItem[]` | `items` | `json` | 多语言嵌套结构，按 locale 提取 |
| `items[].key` | - | - | **需生成**，可从 linkUrl 提取或用索引 |
| `items[].order` | 数组索引 | - | 使用数组顺序 |
| `items[].name` | `items[locale][n].title` | `string` | 按 locale 提取 |
| `items[].image` | `items[locale][n].image` | Media ID | 查询 Media |
| `items[].sceneImage` | `items[locale][n].sceneImage` | Media ID | 查询 Media (悬停背景) |
| `items[].buttonText` | `items[locale][n].buttonText` | `string` | 按 locale 提取 |
| `items[].href` | `items[locale][n].linkUrl` | `string` | **字段名不同** |
| - | `autoPlay` | `checkbox` | 新增：是否自动播放 |
| - | `autoPlaySpeed` | `integer` | 新增：播放间隔 (ms) |
| - | `items[locale][n].isShow` | `boolean` | 新增：是否显示该项 |

### 后端 items 字段实际结构

```typescript
// MultilingualCarouselItemsField 存储格式
{
  "en": [
    {
      "isShow": true,
      "title": "Glass Standoff Series",
      "image": "media-id-1",
      "sceneImage": "media-id-2",
      "buttonText": "Learn More",
      "linkUrl": "/product-series/glass-standoff"
    },
    // ... 更多项
  ],
  "zh": [
    {
      "isShow": true,
      "title": "玻璃支撑件系列",
      "image": "media-id-1",
      "sceneImage": "media-id-2",
      "buttonText": "了解更多",
      "linkUrl": "/product-series/glass-standoff"
    },
    // ...
  ],
  // ... 其他语言
}
```

### GraphQL 查询示例

```graphql
query ProductSeriesCarousel {
  productSeriesCarousel {
    items
    autoPlay
    autoPlaySpeed
    status
  }
}
```

### API 转换示例

```typescript
// 后端原始数据
const backendData = {
  items: {
    en: [
      { isShow: true, title: "Glass Standoff", image: "mid-1", sceneImage: "mid-2", buttonText: "Learn More", linkUrl: "/series/glass" },
    ],
    zh: [...]
  },
  autoPlay: true,
  autoPlaySpeed: 5000
};

// 转换后 (locale = 'en')
const frontendData = {
  items: [
    {
      key: "glass-standoff",  // 从 linkUrl 提取
      order: 0,
      name: "Glass Standoff",
      image: { src: "/uploads/img1.jpg", alt: "Glass Standoff" },
      sceneImage: { src: "/uploads/scene1.jpg", alt: "Scene" },
      buttonText: "Learn More",
      href: "/series/glass"
    }
  ],
  autoPlay: true,
  autoPlaySpeed: 5000
};
```

---

## 3. ServiceFeaturesConfig

**类型**: Singleton (单例)
**后端 Schema**: `cms/schemas/ServiceFeaturesConfig.ts`

### 字段映射表

| 前端字段 | 后端字段 | 后端类型 | 转换说明 |
|---------|---------|---------|----------|
| `title: string` | `title` | `json` | 按 locale 提取 |
| `subtitle: string` | `subtitle` | `json` | 按 locale 提取 |
| `features[0].title` | `feature1Title` | `json` | 按 locale 提取 |
| `features[0].shortTitle` | `feature1ShortTitle` | `json` | 按 locale 提取 |
| `features[0].description` | `feature1Description` | `json` | 按 locale 提取 |
| `features[0].images[]` | `feature1Image1` ~ `feature1Image4` | `json` x 4 | 组装成数组，查询 Media |
| `features[1].*` | `feature2*` | `json` | 同上，**仅 2 张图** |
| `features[2].*` | `feature3*` | `json` | 同上，**6 张图** |
| `features[3].*` | `feature4*` | `json` | 同上，**2 张图** |
| `features[4].*` | `feature5*` | `json` | 同上，**2 张图** |

### 图片数量配置

| Feature | 图片数量 | 后端字段 |
|---------|---------|---------|
| Feature 1 | 4 张 | `feature1Image1` ~ `feature1Image4` |
| Feature 2 | 2 张 | `feature2Image1` ~ `feature2Image2` |
| Feature 3 | 6 张 | `feature3Image1` ~ `feature3Image6` |
| Feature 4 | 2 张 | `feature4Image1` ~ `feature4Image2` |
| Feature 5 | 2 张 | `feature5Image1` ~ `feature5Image2` |

### GraphQL 查询示例

```graphql
query ServiceFeaturesConfig {
  serviceFeaturesConfig {
    title
    subtitle
    feature1Title
    feature1ShortTitle
    feature1Description
    feature1Image1
    feature1Image2
    feature1Image3
    feature1Image4
    feature2Title
    feature2ShortTitle
    feature2Description
    feature2Image1
    feature2Image2
    # ... 继续 feature3-5
    status
  }
}
```

---

## 4. SimpleCta

**类型**: Singleton (单例)
**后端 Schema**: `cms/schemas/SimpleCta.ts`

### 字段映射表

| 前端字段 | 后端字段 | 后端类型 | 转换说明 |
|---------|---------|---------|----------|
| `title: string` | `title` | `json` | 按 locale 提取 |
| `title2: string` | `title2` | `json` | 按 locale 提取 |
| `subtitle: string` | `subtitle` | `json` | 按 locale 提取 |
| `description: string` | `description` | `json` | 按 locale 提取 |
| `buttonText: string` | `buttonText` | `json` | 按 locale 提取 |
| `images: ImageObject[]` | `image1` ~ `image3` | `json` x 3 | 组装成 3 元素数组，查询 Media |

### GraphQL 查询示例

```graphql
query SimpleCta {
  simpleCta {
    title
    title2
    subtitle
    description
    buttonText
    image1
    image2
    image3
    status
  }
}
```

---

## 5. SeriesIntro

**类型**: 多条记录
**后端 Schema**: `cms/schemas/SeriesIntro.ts`

### 字段映射表

| 前端字段 | 后端字段 | 后端类型 | 转换说明 |
|---------|---------|---------|----------|
| `series[].title` | `title` | `json` | 按 locale 提取 |
| `series[].description` | `description` | `json` | 按 locale 提取 |
| `series[].images[]` | `images` | `json` | **特殊结构**，见下方说明 |
| `series[].href` | 从 `productSeries` 关联获取 | `relationship` | 需要 JOIN 查询获取 slug |

### images 字段特殊结构

使用 `TagBasedRandomImagesField` 自定义组件，存储格式为：

```typescript
{
  "tags": ["tag-id-1", "tag-id-2"],  // 选中的 MediaTag IDs
  "images": ["media-id-1", "media-id-2", "media-id-3", "media-id-4", "media-id-5"]  // 随机选中的 5 张图片
}
```

### GraphQL 查询示例

```graphql
query SeriesIntros {
  seriesIntros(where: { status: { equals: "PUBLISHED" } }) {
    id
    title
    description
    images
    productSeries {
      id
      slug
      name
    }
  }
}
```

### API 转换示例

```typescript
// 后端原始数据
const backendData = {
  title: { en: "Glass Hardware", zh: "玻璃五金" },
  description: { en: "Description...", zh: "描述..." },
  images: {
    tags: ["tag-1", "tag-2"],
    images: ["media-1", "media-2", "media-3", "media-4", "media-5"]
  },
  productSeries: { slug: "glass-hardware" }
};

// 转换后 (locale = 'en')
const frontendData = {
  title: "Glass Hardware",
  description: "Description...",
  images: [
    { src: "/uploads/img1.jpg", alt: "Image 1" },
    { src: "/uploads/img2.jpg", alt: "Image 2" },
    // ... 5 张图片
  ],
  href: "/product-series/glass-hardware"
};
```

---

## 6. FeaturedProducts

**类型**: Singleton (单例)
**后端 Schema**: `cms/schemas/FeaturedProducts.ts`

### 字段映射表

| 前端字段 | 后端字段 | 后端类型 | 转换说明 |
|---------|---------|---------|----------|
| `title: string` | `title` | `json` | 按 locale 提取 |
| `description: string` | `description` | `json` | 按 locale 提取 |
| `viewAllButton: string` | `viewAllButtonText` | `json` | **字段名不同**，按 locale 提取 |
| `series: FeaturedProductSeries[]` | **无直接字段** | - | **需 API 聚合查询** |
| - | `categories` | `json` | ProductSeries ID 数组 |

### categories 字段结构

使用 `SortableProductSeriesField` 自定义组件，存储格式为：

```typescript
["series-id-1", "series-id-2", "series-id-3"]  // 可排序的 ProductSeries IDs
```

### 重要：聚合查询逻辑

后端只存储配置 (哪些 ProductSeries 要显示)，API 需要：

1. 读取 `categories` 获取 ProductSeries IDs
2. 按顺序查询对应的 ProductSeries
3. 每个 ProductSeries 随机选 3 个 Product
4. 每个 Product 选 3 个规格 (Specs)

### GraphQL 查询示例

```graphql
query FeaturedProducts {
  featuredProducts {
    title
    description
    viewAllButtonText
    categories
    status
  }
}

# 然后根据 categories 查询产品数据
query ProductsBySeriesIds($ids: [ID!]!) {
  productSeriesItems(where: { id: { in: $ids } }) {
    id
    slug
    name
    products(take: 3) {
      id
      name
      slug
      # specs...
    }
  }
}
```

---

## 7. BrandAdvantages

**类型**: Singleton (单例)
**后端 Schema**: `cms/schemas/BrandAdvantages.ts`

### 字段映射表

| 前端字段 | 后端字段 | 后端类型 | 转换说明 |
|---------|---------|---------|----------|
| `advantages: string[]` | `advantage1` ~ `advantage9` | `json` x 9 | 组装成 9 元素数组，按 locale 提取 |
| `icons: string[]` | `icon1` ~ `icon9` | `text` x 9 | 组装成 9 元素数组，Lucide React 图标名 |
| `image: ImageObject` | `image` | `json` | 查询 Media |

### 图标字段说明

后端 `icon1` ~ `icon9` 存储的是 **lucide-react 图标名称**，例如：
- `Sparkles`
- `Target`
- `Component`
- `ShieldCheck`
- `Gauge`
- `EyeOff`
- `Waves`
- `Cpu`
- `Factory`

### GraphQL 查询示例

```graphql
query BrandAdvantages {
  brandAdvantages {
    advantage1
    advantage2
    advantage3
    advantage4
    advantage5
    advantage6
    advantage7
    advantage8
    advantage9
    icon1
    icon2
    icon3
    icon4
    icon5
    icon6
    icon7
    icon8
    icon9
    image
    status
  }
}
```

---

## 8. OemOdm

**类型**: Singleton (单例)
**后端 Schema**: `cms/schemas/OemOdm.ts`

### 字段映射表

| 前端字段 | 后端字段 | 后端类型 | 转换说明 |
|---------|---------|---------|----------|
| `oem.title` | `oemTitle` | `json` | 按 locale 提取 |
| `oem.bgImage` | `oemBgImage` | `json` | 查询 Media |
| `oem.image` | `oemImage` | `json` | 查询 Media |
| `oem.description[0]` | `oemDescription1` | `json` | 按 locale 提取 |
| `oem.description[1]` | `oemDescription2` | `json` | 按 locale 提取 |
| `odm.title` | `odmTitle` | `json` | 按 locale 提取 |
| `odm.bgImage` | `odmBgImage` | `json` | 查询 Media |
| `odm.image` | `odmImage` | `json` | 查询 Media |
| `odm.description[0]` | `odmDescription1` | `json` | 按 locale 提取 |
| `odm.description[1]` | `odmDescription2` | `json` | 按 locale 提取 |

### GraphQL 查询示例

```graphql
query OemOdm {
  oemOdm {
    oemTitle
    oemBgImage
    oemImage
    oemDescription1
    oemDescription2
    odmTitle
    odmBgImage
    odmImage
    odmDescription1
    odmDescription2
    status
  }
}
```

### API 转换示例

```typescript
// 后端原始数据
const backendData = {
  oemTitle: { en: "OEM", zh: "OEM" },
  oemBgImage: "media-id-1",
  oemImage: "media-id-2",
  oemDescription1: { en: "Line 1...", zh: "第一行..." },
  oemDescription2: { en: "Line 2...", zh: "第二行..." },
  // odm 同理
};

// 转换后 (locale = 'en')
const frontendData = {
  oem: {
    title: "OEM",
    bgImage: { src: "/uploads/bg.jpg", alt: "Background" },
    image: { src: "/uploads/main.jpg", alt: "Main" },
    description: ["Line 1...", "Line 2..."]
  },
  odm: { /* 同理 */ }
};
```

---

## 9. QuoteSteps

**类型**: Singleton (单例)
**后端 Schema**: `cms/schemas/QuoteSteps.ts`

### 字段映射表

| 前端字段 | 后端字段 | 后端类型 | 转换说明 |
|---------|---------|---------|----------|
| `title: string` | `title` | `json` | 按 locale 提取 |
| `title2: string` | `title2` | `json` | 按 locale 提取 |
| `subtitle: string` | `subtitle` | `json` | 按 locale 提取 |
| `description: string` | `description` | `json` | 按 locale 提取 |
| `steps[0].text` | `step1Text` | `json` | 按 locale 提取 |
| `steps[0].image` | `step1Image` | `json` | 查询 Media |
| `steps[1].text` | `step2Text` | `json` | 按 locale 提取 |
| `steps[1].image` | `step2Image` | `json` | 查询 Media |
| `steps[2].text` | `step3Text` | `json` | 按 locale 提取 |
| `steps[2].image` | `step3Image` | `json` | 查询 Media |
| `steps[3].text` | `step4Text` | `json` | 按 locale 提取 |
| `steps[3].image` | `step4Image` | `json` | 查询 Media |
| `steps[4].text` | `step5Text` | `json` | 按 locale 提取 |
| `steps[4].image` | `step5Image` | `json` | 查询 Media |

### GraphQL 查询示例

```graphql
query QuoteSteps {
  quoteSteps {
    title
    title2
    subtitle
    description
    step1Text
    step1Image
    step2Text
    step2Image
    step3Text
    step3Image
    step4Text
    step4Image
    step5Text
    step5Image
    status
  }
}
```

---

## 10. MainForm

**类型**: Singleton (单例)
**后端 Schema**: `cms/schemas/MainForm.ts`

### 字段映射表

| 前端字段 | 后端字段 | 后端类型 | 转换说明 |
|---------|---------|---------|----------|
| `placeholderName` | `placeholderName` | `json` | 按 locale 提取 |
| `placeholderEmail` | `placeholderEmail` | `json` | 按 locale 提取 |
| `placeholderWhatsapp` | `placeholderWhatsapp` | `json` | 按 locale 提取 |
| `placeholderCompany` | `placeholderCompany` | `json` | 按 locale 提取 |
| `placeholderMessage` | `placeholderMessage` | `json` | 按 locale 提取 |
| `placeholderVerify` | `placeholderVerify` | `json` | 按 locale 提取 |
| `buttonText` | `buttonText` | `json` | 按 locale 提取 |
| `designTextLeft` | `designTextLeft` | `json` | 按 locale 提取 |
| `designTextRight` | `designTextRight` | `json` | 按 locale 提取 |
| `image1` | `image1` | `json` | 查询 Media |
| `image2` | `image2` | `json` | 查询 Media |
| - | `formConfig` | `relationship` | 新增：可关联 FormConfig 动态表单 |

### GraphQL 查询示例

```graphql
query MainForm {
  mainForm {
    placeholderName
    placeholderEmail
    placeholderWhatsapp
    placeholderCompany
    placeholderMessage
    placeholderVerify
    buttonText
    designTextLeft
    designTextRight
    image1
    image2
    formConfig {
      id
      name
      fields
    }
    status
  }
}
```

---

## 11. WhyChooseBusrom

**类型**: Singleton (单例)
**后端 Schema**: `cms/schemas/WhyChooseBusrom.ts`

### 字段映射表

| 前端字段 | 后端字段 | 后端类型 | 转换说明 |
|---------|---------|---------|----------|
| `title: string` | `title` | `json` | 按 locale 提取 |
| `title2: string` | `title2` | `json` | 按 locale 提取 |
| `reasons[0].title` | `reason1Title` | `json` | 按 locale 提取 |
| `reasons[0].description` | `reason1Description` | `json` | 按 locale 提取 |
| `reasons[0].image` | `reason1Image` | `json` | 查询 Media |
| `reasons[1].*` | `reason2*` | `json` | 同上 |
| `reasons[2].*` | `reason3*` | `json` | 同上 |
| `reasons[3].*` | `reason4*` | `json` | 同上 |
| `reasons[4].*` | `reason5*` | `json` | 同上 |
| - | `viewMoreButtonText` | `json` | **新增字段**，按 locale 提取 |
| - | `viewMoreButtonUrl` | `text` | **新增字段** |

### GraphQL 查询示例

```graphql
query WhyChooseBusrom {
  whyChooseBusrom {
    title
    title2
    reason1Title
    reason1Description
    reason1Image
    reason2Title
    reason2Description
    reason2Image
    reason3Title
    reason3Description
    reason3Image
    reason4Title
    reason4Description
    reason4Image
    reason5Title
    reason5Description
    reason5Image
    viewMoreButtonText
    viewMoreButtonUrl
    status
  }
}
```

---

## 12. CaseStudies

**类型**: Singleton (单例)
**后端 Schema**: `cms/schemas/CaseStudies.ts`

### 字段映射表

| 前端字段 | 后端字段 | 后端类型 | 转换说明 |
|---------|---------|---------|----------|
| `title: string` | `title` | `json` | 按 locale 提取 |
| `description: string` | `description` | `json` | 按 locale 提取 |
| `applications: CaseStudyApplication[]` | **无直接字段** | - | **需 API 聚合查询** |
| - | `categories` | `json` | Category ID 数组 (type=APPLICATION) |

### categories 字段结构

使用 `SortableApplicationCategoriesField` 自定义组件，存储格式为：

```typescript
["category-id-1", "category-id-2", ...]  // 可排序的 APPLICATION 类型 Category IDs
```

### 重要：聚合查询逻辑

后端只存储配置 (哪些应用分类要显示)，API 需要：

1. 读取 `categories` 获取 Category IDs (已按顺序排列)
2. 按顺序查询对应的 Category (type=APPLICATION)
3. 每个 Category 随机选 3 个 Application

### GraphQL 查询示例

```graphql
query CaseStudies {
  caseStudies {
    title
    description
    categories
    status
  }
}

# 然后根据 categories 查询应用数据
query ApplicationsByCategoryIds($ids: [ID!]!) {
  categories(where: { id: { in: $ids }, type: { equals: "APPLICATION" } }) {
    id
    slug
    name
    applications(take: 3) {
      id
      title
      slug
      image
    }
  }
}
```

---

## 13. BrandAnalysis

**类型**: Singleton (单例)
**后端 Schema**: `cms/schemas/BrandAnalysis.ts`

### 字段映射表

| 前端字段 | 后端字段 | 后端类型 | 转换说明 |
|---------|---------|---------|----------|
| `analysis.title` | `analysisTitle` | `json` | 按 locale 提取 |
| `analysis.title2` | `analysisTitle2` | `json` | 按 locale 提取 |
| `analysis.text` | `analysisText` | `json` | 按 locale 提取 |
| `analysis.text2` | `analysisText2` | `json` | 按 locale 提取 |
| `centers[0].title` | `brandCenterTitle` | `json` | 按 locale 提取 |
| `centers[0].description` | `brandCenterDescription` | `json` | 按 locale 提取 |
| **前端无** | `brandCenterLargeImage` | `json` | **新增**：查询 Media |
| **前端无** | `brandCenterSmallImage` | `json` | **新增**：查询 Media |
| `centers[1].title` | `projectCenterTitle` | `json` | 按 locale 提取 |
| `centers[1].description` | `projectCenterDescription` | `json` | 按 locale 提取 |
| **前端无** | `projectCenterLargeImage` | `json` | **新增**：查询 Media |
| **前端无** | `projectCenterSmallImage` | `json` | **新增**：查询 Media |
| `centers[2].title` | `serviceCenterTitle` | `json` | 按 locale 提取 |
| `centers[2].description` | `serviceCenterDescription` | `json` | 按 locale 提取 |
| **前端无** | `serviceCenterLargeImage` | `json` | **新增**：查询 Media |
| **前端无** | `serviceCenterSmallImage` | `json` | **新增**：查询 Media |

### 注意：前端需要新增图片字段

后端为每个 Center 增加了大图和小图字段，前端组件可能需要更新以支持这些图片。

### GraphQL 查询示例

```graphql
query BrandAnalysis {
  brandAnalysis {
    analysisTitle
    analysisTitle2
    analysisText
    analysisText2
    brandCenterTitle
    brandCenterDescription
    brandCenterLargeImage
    brandCenterSmallImage
    projectCenterTitle
    projectCenterDescription
    projectCenterLargeImage
    projectCenterSmallImage
    serviceCenterTitle
    serviceCenterDescription
    serviceCenterLargeImage
    serviceCenterSmallImage
    status
  }
}
```

---

## 14. BrandValue

**类型**: Singleton (单例)
**后端 Schema**: `cms/schemas/BrandValue.ts`

### 字段映射表

| 前端字段 | 后端字段 | 后端类型 | 转换说明 |
|---------|---------|---------|----------|
| `title: string` | `title` | `json` | 按 locale 提取 |
| `subtitle: string` | `subtitle` | `json` | 按 locale 提取 |
| `param1.title` | `param1Title` | `json` | 按 locale 提取 |
| `param1.description` | `param1Description` | `json` | 按 locale 提取 |
| `param1.image` | `param1Image` | `json` | 查询 Media |
| `param2.title` | `param2Title` | `json` | 按 locale 提取 |
| `param2.description` | `param2Description` | `json` | 按 locale 提取 |
| `param2.image` | `param2Image` | `json` | 查询 Media |
| `slogan.title` | `sloganTitle` | `json` | 按 locale 提取 |
| `slogan.description` | `sloganDescription` | `json` | 按 locale 提取 |
| `slogan.image` | `sloganImage` | `json` | 查询 Media |
| `value.title` | `valueTitle` | `json` | 按 locale 提取 |
| `value.description` | `valueDescription` | `json` | 按 locale 提取 |
| `value.image` | `valueImage` | `json` | 查询 Media |
| `vision.title` | `visionTitle` | `json` | 按 locale 提取 |
| `vision.description` | `visionDescription` | `json` | 按 locale 提取 |
| `vision.image` | `visionImage` | `json` | 查询 Media |

### GraphQL 查询示例

```graphql
query BrandValue {
  brandValue {
    title
    subtitle
    param1Title
    param1Description
    param1Image
    param2Title
    param2Description
    param2Image
    sloganTitle
    sloganDescription
    sloganImage
    valueTitle
    valueDescription
    valueImage
    visionTitle
    visionDescription
    visionImage
    status
  }
}
```

---

## API 转换层核心任务

### 1. 多语言提取函数

```typescript
/**
 * 从多语言 JSON 字段提取指定语言的值
 * @param field 多语言字段 { en: "...", zh: "...", ... }
 * @param locale 目标语言代码
 * @param fallback 回退语言代码 (默认 'en')
 */
function extractLocale(
  field: Record<string, string> | null,
  locale: string,
  fallback: string = 'en'
): string {
  if (!field) return '';
  return field[locale] || field[fallback] || '';
}
```

### 2. Media 查询函数

```typescript
/**
 * 根据 Media ID 查询图片信息
 * @param mediaId Media 表的 ID
 * @returns ImageObject
 */
async function fetchMediaById(mediaId: string): Promise<ImageObject | null> {
  if (!mediaId) return null;

  const media = await context.query.Media.findOne({
    where: { id: mediaId },
    query: 'id filename file { url } variants altText'
  });

  if (!media) return null;

  return {
    src: media.variants?.large || media.variants?.medium || media.file?.url,
    alt: extractLocale(media.altText, locale) || media.filename,
    // width, height 可从 variants 或 file 获取
  };
}
```

### 3. 数组组装函数

```typescript
/**
 * 将独立字段组装成数组
 * @param data 原始数据对象
 * @param prefix 字段前缀 (如 'feature', 'image')
 * @param count 数量
 * @param locale 语言代码 (用于多语言字段)
 */
function assembleArray(
  data: any,
  prefix: string,
  count: number,
  locale?: string
): string[] {
  const result = [];
  for (let i = 1; i <= count; i++) {
    const fieldName = `${prefix}${i}`;
    const value = data[fieldName];
    if (locale && typeof value === 'object') {
      result.push(extractLocale(value, locale));
    } else {
      result.push(value);
    }
  }
  return result;
}
```

### 4. 字段名映射

| 前端字段名 | 后端字段名 | 说明 |
|-----------|-----------|------|
| `viewAllButton` | `viewAllButtonText` | FeaturedProducts |
| `href` | `linkUrl` | ProductSeriesCarousel items |
| `name` | `title` | ProductSeriesCarousel items |

### 5. 聚合查询需求

以下模块需要额外的聚合查询：

| 模块 | 配置字段 | 需要查询的数据 |
|------|---------|--------------|
| FeaturedProducts | `categories: ProductSeries IDs` | ProductSeries → Products → Specs |
| CaseStudies | `categories: Category IDs` | Categories (APPLICATION) → Applications |
| SeriesIntro | `productSeries: relationship` | ProductSeries (获取 slug 作为 href) |
| SeriesIntro | `images.images: Media IDs` | Media (获取图片 URL) |

---

## 附录：自定义字段组件说明

### MultilingualJSONField

- **文件**: `cms/custom-fields/MultilingualJSONField.tsx`
- **用途**: 多语言文本输入
- **存储格式**: `{ en: "...", zh: "...", ... }`
- **支持**: 24 种语言，自动翻译功能

### SingleMediaField

- **文件**: `cms/custom-fields/SingleMediaField.tsx`
- **用途**: 单个媒体选择
- **存储格式**: Media ID 字符串
- **功能**: 带筛选的媒体选择器，图片预览

### MultilingualCarouselItemsField

- **文件**: `cms/custom-fields/MultilingualCarouselItemsField.tsx`
- **用途**: 多语言轮播项管理
- **存储格式**: 见 [ProductSeriesCarousel](#2-productseriescarousel) 章节
- **功能**: 拖拽排序，显示/隐藏切换，自动翻译

### SortableProductSeriesField

- **文件**: `cms/custom-fields/SortableProductSeriesField.tsx`
- **用途**: 可排序的产品系列选择
- **存储格式**: `["series-id-1", "series-id-2", ...]`
- **功能**: 拖拽排序，搜索过滤

### SortableApplicationCategoriesField

- **文件**: `cms/custom-fields/SortableApplicationCategoriesField.tsx`
- **用途**: 可排序的应用分类选择
- **存储格式**: `["category-id-1", "category-id-2", ...]`
- **功能**: 拖拽排序，只显示 APPLICATION 类型

### TagBasedRandomImagesField

- **文件**: `cms/custom-fields/TagBasedRandomImagesField.tsx`
- **用途**: 基于标签随机选择图片
- **存储格式**: `{ tags: [...], images: [...] }`
- **功能**: 标签选择，随机生成 5 张匹配图片

---

## 更新日志

| 日期 | 版本 | 说明 |
|------|------|------|
| 2024-XX-XX | 1.0 | 初始版本 |
