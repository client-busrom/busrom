# 04 - SEO 技术规范

> **阅读时间**: 15 分钟  
> **适用对象**: 全栈开发工程师

---

## ✅ SEO 实施清单

### Phase 1: 基础 SEO (优先级: P0)
- [ ] 所有页面实现 `generateMetadata`
- [ ] 所有图片设置 `alt` 属性
- [ ] 实现 canonical URL
- [ ] 实现 hreflang 标签（多语言）
- [ ] 配置 robots.txt

### Phase 2: 高级 SEO (优先级: P1)
- [ ] 自动生成 sitemap.xml
- [ ] 实现结构化数据 (JSON-LD)
- [ ] Open Graph 标签
- [ ] Twitter Card 标签

### Phase 3: 自动化 (优先级: P2)
- [ ] Google Indexing API 集成
- [ ] IndexNow 协议集成
- [ ] 自动提交新内容到搜索引擎

---

## 🎯 核心 SEO 目标

| 指标 | 目标值 | 验收方式 |
|------|--------|---------|
| **Lighthouse SEO** | > 95 分 | 提供截图 |
| **页面加载时间** | LCP < 2.5s | Core Web Vitals |
| **图片 Alt 覆盖率** | 100% | 代码审查 |
| **Sitemap 更新** | 内容变更后 24 小时内 | 自动化测试 |
| **移动端友好** | 通过 Google Mobile-Friendly Test | 提供截图 |

---

## 📋 Meta 标签规范

### 1. 基础 Meta 标签（所有页面必须）

```typescript
// app/[locale]/layout.tsx 或各页面的 generateMetadata
import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    // 标题（最多 60 字符）
    title: 'Busrom - High-Quality Glass Hardware Manufacturer',
    
    // 描述（最多 160 字符）
    description: 'Professional glass hardware products including standoffs, clips, hinges, and more. Global shipping with OEM/ODM services.',
    
    // 关键词（可选，但建议添加）
    keywords: ['glass hardware', 'glass standoff', 'glass clip', 'glass hinge'],
    
    // Canonical URL（避免重复内容）
    alternates: {
      canonical: `https://busrom.com/${params.locale}`,
    },
    
    // Robots（控制索引）
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    },
    
    // Open Graph（社交分享）
    openGraph: {
      type: 'website',
      locale: params.locale,
      url: `https://busrom.com/${params.locale}`,
      siteName: 'Busrom',
      title: 'Busrom - High-Quality Glass Hardware',
      description: '...',
      images: [
        {
          url: 'https://busrom.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Busrom Glass Hardware',
        }
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: '@busrom',
      title: '...',
      description: '...',
      images: ['https://busrom.com/twitter-image.jpg'],
    },
  }
}
```

---

### 2. 多语言标签（hreflang）

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const languages = ['en', 'zh', 'es', 'fr', 'de', /* ...其他 24+ 种语言 */]
  
  return {
    alternates: {
      canonical: `https://busrom.com/${params.locale}/product/glass-standoff`,
      
      // 为每种语言生成 hreflang
      languages: Object.fromEntries(
        languages.map(lang => [
          lang,
          `/product/glass-standoff`  // Next.js 会自动加上语言前缀
        ])
      )
    }
  }
}
```

**渲染后的 HTML**:

```html
<link rel="canonical" href="https://busrom.com/en/product/glass-standoff" />
<link rel="alternate" hreflang="en" href="https://busrom.com/en/product/glass-standoff" />
<link rel="alternate" hreflang="zh" href="https://busrom.com/zh/product/glass-standoff" />
<link rel="alternate" hreflang="es" href="https://busrom.com/es/product/glass-standoff" />
<!-- ... -->
<link rel="alternate" hreflang="x-default" href="https://busrom.com/en/product/glass-standoff" />
```

---

## 🖼️ 图片 SEO 规范

### 1. 强制 Alt 属性

**所有图片必须有 alt 属性**，验收时会进行代码审查。

```tsx
// ✅ 正确
import Image from 'next/image'

<Image
  src={product.mainImage}
  alt={product.name}  // 必须有意义的描述
  width={800}
  height={600}
/>

// ❌ 错误
<Image src={product.mainImage} alt="" />  // 空 alt
<img src="..." />  // 缺少 alt
```

### 2. 文件名优化

**后端上传图片时**，应该：

```typescript
// keystone/hooks/media-upload.ts
export async function beforeCreate({ resolvedData }) {
  const file = resolvedData.file
  
  // 原文件名: "IMG_1234.jpg"
  // 优化后: "glass-standoff-304-stainless-steel.jpg"
  const optimizedFilename = slugify(resolvedData.altText_en || file.filename)
  
  return {
    ...resolvedData,
    file: {
      ...file,
      filename: `${optimizedFilename}.${file.extension}`
    }
  }
}
```

### 3. 响应式图片

```tsx
<Image
  src="/product.jpg"
  alt="Glass Standoff"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isAboveFold}  // 首屏图片使用 priority
/>
```

---

## 🗺️ Sitemap.xml 实现

### 方案：Next.js 动态 Sitemap

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://busrom.com'
  const languages = ['en', 'zh', 'es', /* ... */]
  
  // 1. 静态页面
  const staticPages = [
    '/',
    '/about-us/story',
    '/contact-us',
    '/privacy-policy',
  ]
  
  // 2. 动态页面 - 产品系列
  const productSeries = await fetch(`${process.env.API_URL}/api/v1/product/series?locale=en`)
    .then(res => res.json())
  
  // 3. 动态页面 - 商品
  const products = await fetch(`${process.env.API_URL}/api/v1/shop/products?locale=en&limit=1000`)
    .then(res => res.json())
  
  // 4. 动态页面 - 博客
  const blogs = await fetch(`${process.env.API_URL}/api/v1/blog?locale=en&limit=1000`)
    .then(res => res.json())
  
  const sitemapEntries: MetadataRoute.Sitemap = []
  
  // 为每种语言生成 URL
  for (const lang of languages) {
    // 静态页面
    staticPages.forEach(page => {
      sitemapEntries.push({
        url: `${baseUrl}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: page === '/' ? 1.0 : 0.8,
      })
    })
    
    // 产品系列
    productSeries.series?.forEach(series => {
      sitemapEntries.push({
        url: `${baseUrl}/${lang}/product/${series.slug}`,
        lastModified: new Date(series.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.9,
      })
    })
    
    // 商品
    products.products?.forEach(product => {
      sitemapEntries.push({
        url: `${baseUrl}/${lang}/shop/${product.slug}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })
    
    // 博客
    blogs.articles?.forEach(article => {
      sitemapEntries.push({
        url: `${baseUrl}/${lang}/blog/${article.slug}`,
        lastModified: new Date(article.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    })
  }
  
  return sitemapEntries
}
```

**验收要求**:
- 访问 `https://busrom.com/sitemap.xml` 应返回完整的 sitemap
- 每次内容更新后，sitemap 应在 24 小时内自动更新
- 提供 sitemap 的完整截图

---

## 🤖 Robots.txt 配置

```typescript
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',       // 禁止爬取 Keystone CMS 后台
          '/api/',         // 禁止爬取 API
          '/_next/',       // 禁止爬取 Next.js 内部文件
          '/private/',     // 禁止爬取私有内容
        ],
      },
      {
        userAgent: 'GPTBot',  // 禁止 ChatGPT 爬虫
        disallow: '/',
      },
      {
        userAgent: 'CCBot',   // 禁止 Common Crawl
        disallow: '/',
      }
    ],
    sitemap: 'https://busrom.com/sitemap.xml',
  }
}
```

**渲染后** (`https://busrom.com/robots.txt`):

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

Sitemap: https://busrom.com/sitemap.xml
```

---

## 📊 结构化数据（JSON-LD）

### 1. 网站组织信息（全局）

```tsx
// components/SEO/OrganizationSchema.tsx
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Busrom",
    "url": "https://busrom.com",
    "logo": "https://busrom.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-XXX-XXX-XXXX",
      "contactType": "Customer Service",
      "availableLanguage": ["en", "zh", "es"]
    },
    "sameAs": [
      "https://www.linkedin.com/company/busrom",
      "https://twitter.com/busrom",
    ]
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 2. 产品结构化数据

```tsx
// components/SEO/ProductSchema.tsx
export function ProductSchema({ product }: { product: Product }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.mainImage,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "Busrom"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://busrom.com/shop/${product.slug}`,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Busrom"
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount
    } : undefined
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 3. 博客文章结构化数据

```tsx
// components/SEO/ArticleSchema.tsx
export function ArticleSchema({ article }: { article: Blog }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "image": article.coverImage,
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt,
    "author": {
      "@type": "Organization",
      "name": "Busrom"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Busrom",
      "logo": {
        "@type": "ImageObject",
        "url": "https://busrom.com/logo.png"
      }
    },
    "description": article.excerpt
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

---

## 🔄 自动索引提交

### 1. Google Indexing API

```typescript
// lib/seo/google-indexing.ts
import { google } from 'googleapis'

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  scopes: ['https://www.googleapis.com/auth/indexing'],
})

export async function notifyGoogleOfUpdate(url: string, type: 'URL_UPDATED' | 'URL_DELETED') {
  const indexing = google.indexing({ version: 'v3', auth })
  
  try {
    await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type,
      },
    })
    console.log(`✅ Google notified: ${url}`)
  } catch (error) {
    console.error('❌ Google Indexing API error:', error)
  }
}
```

**在 Keystone Hook 中调用**:

```typescript
// keystone/schemas/Product.ts
export const Product = list({
  fields: { /* ... */ },
  
  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if (operation === 'create' || operation === 'update') {
        // 通知 Google
        const url = `https://busrom.com/en/shop/${item.slug}`
        await notifyGoogleOfUpdate(url, 'URL_UPDATED')
      }
    }
  }
})
```

---

### 2. IndexNow 协议

```typescript
// lib/seo/indexnow.ts
export async function notifyIndexNow(urls: string[]) {
  const apiKey = process.env.INDEXNOW_API_KEY
  
  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'busrom.com',
        key: apiKey,
        keyLocation: `https://busrom.com/${apiKey}.txt`,
        urlList: urls
      })
    })
    
    console.log(`✅ IndexNow notified: ${urls.length} URLs`)
  } catch (error) {
    console.error('❌ IndexNow error:', error)
  }
}
```

**配置密钥文件**:

```typescript
// app/[apiKey]/route.ts
export async function GET() {
  return new Response(process.env.INDEXNOW_API_KEY, {
    headers: { 'Content-Type': 'text/plain' }
  })
}
```

---

## 📈 性能优化（影响 SEO）

### 1. Core Web Vitals 优化

| 指标 | 目标 | 优化方法 |
|------|------|---------|
| **LCP** | < 2.5s | 1. 使用 Next.js Image<br>2. 首屏图片 `priority`<br>3. CDN 加速 |
| **FID** | < 100ms | 1. 减少 JavaScript<br>2. 代码分割<br>3. 懒加载 |
| **CLS** | < 0.1 | 1. 图片设置宽高<br>2. 避免动态插入内容<br>3. 字体优化 |

### 2. 字体优化

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // 防止 FOIT (Flash of Invisible Text)
  preload: true,
})

export default function RootLayout({ children }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

---

## ✅ SEO 验收清单

### 必须提供的截图/文档

- [ ] **Lighthouse 报告**（所有页面 SEO > 95）
- [ ] **Sitemap.xml 截图**（显示完整 URL 列表）
- [ ] **Robots.txt 截图**
- [ ] **Google Search Console 验证**（网站已提交）
- [ ] **图片 Alt 覆盖率报告**（100% 覆盖）
- [ ] **hreflang 标签截图**（View Source 显示）
- [ ] **结构化数据测试**（Google Rich Results Test 通过）
- [ ] **移动端友好测试**（通过 Google Mobile-Friendly Test）

### 代码审查要点

```bash
# 1. 检查是否有缺失 alt 的图片
grep -r "<img" app/ components/ | grep -v "alt="

# 2. 检查是否有硬编码的 URL (应使用相对路径)
grep -r "https://busrom.com" app/ components/

# 3. 检查是否有内联样式 (影响 CLS)
grep -r "style=" app/ components/
```

---

## 🤖 Claude Code Prompt 模板

```markdown
你好，我需要你帮我实现 Busrom 网站的 SEO 优化。

**项目背景**:
- 技术栈: Next.js 14 (App Router)
- 需求文档: 请仔细阅读 `/docs/04-SEO技术规范.md`

**你的任务**:
1. 为所有页面实现 `generateMetadata` 函数
2. 实现自动 sitemap.xml 生成
3. 配置 robots.txt
4. 添加结构化数据 (JSON-LD)
5. 实现 Google Indexing API 集成
6. 确保所有图片有 alt 属性

**具体要求**:
- 所有页面必须有 unique title 和 description
- 必须实现 hreflang 标签（24+ 语言）
- Lighthouse SEO 分数必须 > 95
- 提供完整的验收截图

**验收标准**:
- [ ] Sitemap 自动生成
- [ ] Robots.txt 可访问
- [ ] 结构化数据通过 Google 测试
- [ ] 图片 Alt 覆盖率 100%
- [ ] Lighthouse SEO > 95

请开始工作。
```

---

**文档版本**: v1.0  
**最后更新**: 2025-10-31