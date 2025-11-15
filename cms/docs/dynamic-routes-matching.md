# 动态路由 SEO 和 Script 匹配指南

## 概述

对于动态路由页面（如产品详情、博客文章等），SEO 和 CustomScript 的匹配方式与静态 Page 不同。

## 动态路由映射表

| 模型 | 前端路由模式 | URL 示例 | slug 示例 |
|------|------------|---------|-----------|
| **ProductSeries** | `/product/[series]` | `/product/glass-door-refrigerators` | `glass-door-refrigerators` |
| **Product** | `/shop/[slug]` | `/shop/GDH-001` | `GDH-001` |
| **Application** | `/service/application/[slug]` | `/service/application/retail-store` | `retail-store` |
| **Blog** | `/about-us/blog/[slug]` | `/about-us/blog/energy-tips` | `energy-tips` |

## 匹配方式

### 方式 1: Related Content (推荐) ⭐

最直观的方式，直接关联到具体记录。

```typescript
// 示例：为特定产品系列配置 SEO
SeoSetting {
  scope: "related_content",
  relatedProductSeries: <选择 "glass-door-refrigerators">,
  title: {
    en: "Glass Door Refrigerators - Busrom",
    zh: "玻璃门冰箱 - Busrom"
  },
  description: { en: "...", zh: "..." },
  sitemapPriority: "0.8"
}

// 示例：为特定产品配置 SEO
SeoSetting {
  scope: "related_content",
  relatedProduct: <选择 "GDH-001">,
  title: { en: "GDH-001 Glass Door Refrigerator", zh: "..." }
}

// 示例：为特定博客文章配置 SEO
SeoSetting {
  scope: "related_content",
  relatedBlog: <选择 "energy-saving-tips">,
  schemaType: "Article"
}

// 示例：为特定案例添加转化追踪脚本
CustomScript {
  scope: "related_content",
  relatedApplication: <选择 "retail-store-solution">,
  name: "Case Study Conversion Tracking",
  content: "<script>/* tracking code */</script>"
}
```

**优势**:
- ✅ 直观易用，通过下拉选择
- ✅ 类型安全，避免路径拼写错误
- ✅ 自动关联，删除记录时级联处理

### 方式 2: Path Pattern (批量配置)

使用通配符匹配一类页面。

```typescript
// 示例：所有产品系列页面
SeoSetting {
  scope: "path_pattern",
  pathPattern: "/product/*",
  // 匹配: /product/glass-door-refrigerators, /product/chest-freezers, etc.
  sitemapPriority: "0.8",
  robotsIndex: true
}

// 示例：所有商店产品页面
CustomScript {
  scope: "path_pattern",
  pathPattern: "/shop/*",
  name: "Product Page Analytics",
  content: "<script>/* e-commerce tracking */</script>"
}

// 示例：所有应用案例页面
SeoSetting {
  scope: "path_pattern",
  pathPattern: "/service/application/*",
  sitemapPriority: "0.6"
}

// 示例：所有博客文章
CustomScript {
  scope: "path_pattern",
  pathPattern: "/about-us/blog/*",
  name: "Blog Reading Time Tracker"
}
```

**优势**:
- ✅ 批量配置，一次设置应用到所有
- ✅ 适合统一的默认配置

### 方式 3: Page Type (预定义类型)

通过预定义的页面类型配置。

```typescript
// 产品系列列表页
SeoSetting {
  scope: "page_type",
  pageType: "product_series_list",  // /product 列表页
  title: { en: "Our Product Series", zh: "我们的产品系列" }
}

// 产品系列详情页（所有）
SeoSetting {
  scope: "page_type",
  pageType: "product_series_detail",  // /product/[series] 详情页
  sitemapPriority: "0.8"
}

// 商店列表页
SeoSetting {
  scope: "page_type",
  pageType: "shop_list",  // /shop 列表页
}

// 商品详情页（所有）
SeoSetting {
  scope: "page_type",
  pageType: "shop_detail",  // /shop/[slug] 详情页
  schemaType: "Product"
}

// 博客列表页
SeoSetting {
  scope: "page_type",
  pageType: "blog_list",  // /about-us/blog
}

// 博客文章详情页（所有）
SeoSetting {
  scope: "page_type",
  pageType: "blog_detail",  // /about-us/blog/[slug]
  schemaType: "Article"
}
```

## 前端实现

### 获取动态路由的 SEO 配置

```typescript
// app/[locale]/product/[series]/page.tsx
export default async function ProductSeriesDetail({ params }) {
  const { series, locale } = params

  // 1. 获取产品系列数据
  const productSeries = await getProductSeries(series)

  // 2. 获取 SEO 配置（按优先级）
  const seoConfig = await getSeoConfig({
    type: 'ProductSeries',
    id: productSeries.id,
    slug: productSeries.slug,
    path: `/product/${series}`,
    pageType: 'product_series_detail'
  })

  return (
    <>
      <Head>
        <title>{seoConfig.title[locale]}</title>
        <meta name="description" content={seoConfig.description[locale]} />
      </Head>
      <ProductSeriesTemplate series={productSeries} />
    </>
  )
}
```

### SEO 配置获取逻辑

```typescript
// lib/api/seo.ts
export async function getSeoConfig(options: {
  type: 'ProductSeries' | 'Product' | 'Blog' | 'Application'
  id: string
  slug: string
  path: string
  pageType: string
}) {
  const { type, id, slug, path, pageType } = options

  // 优先级 1: Related Content (关联内容)
  const relatedSeo = await query({
    seoSettings(where: {
      scope: { equals: "related_content" },
      [`related${type}`]: { id: { equals: id } }
    }) {
      ...seoFields
    }
  })
  if (relatedSeo.length > 0) return relatedSeo[0]

  // 优先级 2: Exact Path (精确路径)
  const exactPathSeo = await query({
    seoSettings(where: {
      scope: { equals: "exact_path" },
      exactPath: { equals: path }
    }) {
      ...seoFields
    }
  })
  if (exactPathSeo.length > 0) return exactPathSeo[0]

  // 优先级 3: Path Pattern (路径模式)
  const patternSeo = await getPatternMatchSeo(path)
  if (patternSeo) return patternSeo

  // 优先级 4: Page Type (页面类型)
  const pageTypeSeo = await query({
    seoSettings(where: {
      scope: { equals: "page_type" },
      pageType: { equals: pageType }
    }) {
      ...seoFields
    }
  })
  if (pageTypeSeo.length > 0) return pageTypeSeo[0]

  // 优先级 5: Global (全局)
  return await getGlobalSeo()
}
```

### Script 获取逻辑

```typescript
// lib/api/scripts.ts
export async function getScriptsForDynamicRoute(options: {
  type: 'ProductSeries' | 'Product' | 'Blog' | 'Application'
  id: string
  path: string
  pageType: string
}) {
  const { type, id, path, pageType } = options

  const scripts = await query({
    customScripts(where: {
      enabled: { equals: true },
      OR: [
        // Global
        { scope: { equals: "global" } },

        // Related Content
        {
          scope: { equals: "related_content" },
          [`related${type}`]: { id: { equals: id } }
        },

        // Exact Path
        {
          scope: { equals: "exact_path" },
          exactPath: { equals: path }
        },

        // Page Type
        {
          scope: { equals: "page_type" },
          pageType: { equals: pageType }
        }
      ]
    }) {
      name
      content
      scriptPosition
      priority
    }
  })

  // Pattern matching (需要手动处理)
  const patternScripts = await getPatternMatchScripts(path)

  return [...scripts, ...patternScripts]
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
}
```

## GraphQL 查询示例

### 查询产品系列的 SEO 配置

```graphql
query GetProductSeriesSeo($seriesId: ID!) {
  # 方式 1: 通过关联查询
  seoSettings(where: {
    scope: { equals: "related_content" },
    relatedProductSeries: { id: { equals: $seriesId } }
  }) {
    id
    title
    description
    keywords
    ogImage { file { url } }
    sitemapPriority
    robotsIndex
  }
}
```

### 查询博客文章的脚本

```graphql
query GetBlogScripts($blogId: ID!) {
  customScripts(where: {
    enabled: { equals: true },
    OR: [
      { scope: { equals: "global" } },
      {
        scope: { equals: "related_content" },
        relatedBlog: { id: { equals: $blogId } }
      },
      {
        scope: { equals: "page_type" },
        pageType: { equals: "blog_detail" }
      }
    ]
  }) {
    name
    content
    scriptPosition
    priority
  }
}
```

## 实际应用示例

### 案例 1: 为特定产品系列配置 SEO 和追踪

```typescript
// CMS 配置

// 1. ProductSeries 记录
ProductSeries {
  slug: "glass-door-refrigerators",
  name: { en: "Glass Door Refrigerators", zh: "玻璃门冰箱" }
}

// 2. SEO 配置
SeoSetting {
  scope: "related_content",
  relatedProductSeries: <glass-door-refrigerators>,
  title: {
    en: "Glass Door Refrigerators - Energy Efficient | Busrom",
    zh: "玻璃门冰箱 - 节能高效 | Busrom"
  },
  description: {
    en: "Discover our range of glass door refrigerators...",
    zh: "探索我们的玻璃门冰箱系列..."
  },
  keywords: {
    en: "glass door refrigerator, commercial fridge, display cooler",
    zh: "玻璃门冰箱,商用冰箱,展示柜"
  },
  sitemapPriority: "0.8",
  schemaType: "Product"
}

// 3. 转化追踪脚本
CustomScript {
  scope: "related_content",
  relatedProductSeries: <glass-door-refrigerators>,
  name: "Product Series View Tracking",
  scriptPosition: "footer",
  content: `
    <script>
      gtag('event', 'view_item', {
        items: [{
          item_id: 'glass-door-refrigerators',
          item_name: 'Glass Door Refrigerators Series'
        }]
      });
    </script>
  `,
  enabled: true
}
```

### 案例 2: 为所有博客文章配置默认 SEO

```typescript
// 批量配置 - 使用 Page Type
SeoSetting {
  scope: "page_type",
  pageType: "blog_detail",
  sitemapPriority: "0.4",
  sitemapChangeFreq: "monthly",
  schemaType: "Article",
  robotsIndex: true,
  robotsFollow: true
}

// 特定文章覆盖 - 使用 Related Content
SeoSetting {
  scope: "related_content",
  relatedBlog: <energy-saving-tips>,  // 优先级更高
  title: {
    en: "10 Energy Saving Tips for Commercial Refrigerators",
    zh: "商用冰箱的10个节能技巧"
  },
  sitemapPriority: "0.6"  // 提高优先级
}
```

### 案例 3: 电商追踪（所有商品页面）

```typescript
// 使用 Path Pattern 批量配置
CustomScript {
  scope: "path_pattern",
  pathPattern: "/shop/*",
  name: "E-commerce Enhanced Tracking",
  scriptPosition: "header",
  content: `
    <script>
      // Enhanced e-commerce tracking for all product pages
      gtag('config', 'GA_MEASUREMENT_ID', {
        'custom_map': {'dimension1': 'product_sku'}
      });
    </script>
  `,
  priority: 100,
  enabled: true
}
```

## 路径构建规则

### 前端根据 slug 构建完整路径

```typescript
// 路径构建函数
export function buildFullPath(
  type: 'ProductSeries' | 'Product' | 'Blog' | 'Application',
  slug: string
): string {
  const pathMap = {
    'ProductSeries': `/product/${slug}`,
    'Product': `/shop/${slug}`,
    'Blog': `/about-us/blog/${slug}`,
    'Application': `/service/application/${slug}`
  }

  return pathMap[type]
}

// 使用示例
const productSeries = { slug: 'glass-door-refrigerators' }
const fullPath = buildFullPath('ProductSeries', productSeries.slug)
// => "/product/glass-door-refrigerators"

// 用于查询 SEO
const seo = await getSeoByPath(fullPath)
```

## 最佳实践

### 1. SEO 配置优先级建议

| 场景 | 推荐方式 | 示例 |
|------|---------|------|
| **重要产品系列** | Related Content | 玻璃门冰箱系列 |
| **所有产品系列默认** | Page Type | product_series_detail |
| **热门文章** | Related Content | 精选博客文章 |
| **所有博客默认** | Path Pattern | /about-us/blog/* |
| **特定产品** | Related Content | GDH-001 旗舰产品 |
| **所有商品默认** | Page Type | shop_detail |

### 2. Script 配置建议

| 场景 | 推荐方式 | 示例 |
|------|---------|------|
| **全站追踪** | Global | Google Analytics |
| **电商追踪** | Path Pattern | /shop/* |
| **特定转化页** | Related Content | 重点产品系列 |
| **类型追踪** | Page Type | blog_detail 阅读时间 |

### 3. 性能优化

```typescript
// 缓存 SEO 配置
const seoConfigCache = new Map()

export async function getSeoConfigCached(options) {
  const cacheKey = `${options.type}:${options.id}`

  if (seoConfigCache.has(cacheKey)) {
    return seoConfigCache.get(cacheKey)
  }

  const config = await getSeoConfig(options)
  seoConfigCache.set(cacheKey, config)

  return config
}
```

## 总结

对于动态路由，推荐的匹配方式优先级：

1. **Related Content** (关联内容) - 用于特定重要记录的个性化配置
2. **Page Type** (页面类型) - 用于该类型所有页面的默认配置
3. **Path Pattern** (路径模式) - 用于批量匹配
4. **Global** (全局) - 用于全站默认配置

这种分层配置方式既灵活又易于管理！
