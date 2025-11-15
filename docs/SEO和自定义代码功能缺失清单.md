# SEO 和自定义代码管理功能缺失清单

**文档版本**: v1.0
**创建日期**: 2025-11-05
**分析基于**: 需求文档第5、6点

---

## 📊 功能对比总览

| 序号 | 功能需求 | CMS 后台 | 前端实现 | 状态 | 优先级 |
|------|----------|----------|----------|------|--------|
| **5. SEO 功能支持** |
| 5.1 | URL 策略(友好路径) | ✅ | ❌ | 部分完成 | 🔴 高 |
| 5.2 | 图片 alt 属性 | ✅ | ❌ | 部分完成 | 🔴 高 |
| 5.3 | Meta 标签(title/description) | ✅ | ❌ | 部分完成 | 🔴 高 |
| 5.4 | Sitemap 和 Robots.txt | ✅ | ✅ | **完成** | ✅ 完成 |
| 5.5 | IndexNow 自动收录协议 | ✅ 配置 | ❌ | 未实现 | 🟡 中 |
| 5.6 | Google Indexing API | ❌ | ❌ | 未实现 | 🟡 中 |
| 5.7 | 多语言 hreflang 标签 | ✅ 提示 | ❌ | 未实现 | 🔴 高 |
| 5.8 | 页面性能优化(压缩/缓存) | ❌ | ❌ | 未实现 | 🟡 中 |
| 5.9 | 结构化数据(JSON-LD) | ✅ 配置 | ❌ | 未实现 | 🟡 中 |
| 5.10 | Open Graph 标签 | ✅ 配置 | ❌ | 未实现 | 🔴 高 |
| **6. 自定义代码管理** |
| 6.1 | 全局代码注入 | ✅ | ❌ | 未实现 | 🔴 高 |
| 6.2 | 单页代码注入 | ✅ | ❌ | 未实现 | 🔴 高 |
| 6.3 | 安全性验证(XSS防护) | ⚠️ | ❌ | 部分实现 | 🔴 高 |
| 6.4 | 实时预览 | ❌ | ❌ | 未实现 | 🟢 低 |
| 6.5 | 版本管理和一键启用/禁用 | ✅ | ❌ | 部分实现 | 🟢 低 |

---

## 🔴 高优先级缺失功能 (必须实现)

### 1. ❌ 前端 Meta 标签渲染

**需求**:
> 每个页面都应有定制的 `<title>` 和 `<meta name="description">`

**现状**:
- ✅ CMS 后台: `SeoSetting` 模型已配置 `title`、`description`、`keywords` 字段
- ❌ 前端: 没有实现从 CMS 读取并渲染 meta 标签的逻辑

**缺失内容**:
1. 前端页面没有调用 CMS API 获取 SEO 设置
2. 没有在 `generateMetadata()` 中使用 CMS 数据
3. 没有实现 keywords meta 标签

**实现建议**:
```typescript
// web/lib/api/seo.ts
export async function getSeoSettings(pageType: string) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    query: `
      query GetSeoSettings($pageType: String!) {
        seoSettings(where: { pageType: { equals: $pageType } }) {
          title
          description
          keywords
          ogTitle
          ogDescription
          ogImage { file { url } }
        }
      }
    `,
    variables: { pageType }
  })
  return response.data.seoSettings[0]
}

// web/app/[locale]/page.tsx
export async function generateMetadata() {
  const seo = await getSeoSettings('home')
  return {
    title: seo?.title?.en || 'Busrom',
    description: seo?.description?.en,
    keywords: seo?.keywords?.en?.split(','),
    openGraph: {
      title: seo?.ogTitle,
      description: seo?.ogDescription,
      images: [seo?.ogImage?.file?.url]
    }
  }
}
```

---

### 2. ❌ 图片 Alt 属性自动填充

**需求**:
> 为每张图片添加合理的 alt 属性以提高可访问性和 SEO

**现状**:
- ✅ CMS 后台: `Media` 模型有 `altText` 字段(24语言)
- ❌ 前端: 没有实现从 Media 数据中读取 alt 属性

**缺失内容**:
1. 前端组件渲染图片时没有使用 `altText`
2. 需要创建 Image 组件自动从 CMS 获取 alt 属性

**实现建议**:
```typescript
// web/components/OptimizedImage.tsx
export function OptimizedImage({ mediaId, locale = 'en' }) {
  const media = await getMediaById(mediaId)

  return (
    <img
      src={media.variants?.medium || media.file.url}
      alt={media.altText?.[locale] || media.filename}
      width={media.width}
      height={media.height}
    />
  )
}
```

---

### 3. ❌ 多语言 hreflang 标签

**需求**:
> 为每种语言生成独立 URL,并在 HTML `<head>` 中使用 hreflang 标签

**现状**:
- ✅ CMS 后台: `SeoSetting` 有 `hreflangInfo` 说明字段(只读)
- ✅ 前端: 已有多语言路由结构 `/[locale]/...`
- ❌ 前端: 没有在 `<head>` 中生成 hreflang 链接

**缺失内容**:
1. 没有在页面 metadata 中添加 `alternates.languages`
2. 没有生成 `<link rel="alternate" hreflang="..."` 标签

**实现建议**:
```typescript
// web/app/[locale]/page.tsx
export async function generateMetadata({ params }) {
  const { locale } = await params

  return {
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'zh-CN': '/zh-CN',
        'es': '/es',
        'fr': '/fr',
        'de': '/de',
        'ja': '/ja',
        'ko': '/ko',
        'x-default': '/en', // 默认语言
      }
    }
  }
}
```

---

### 4. ❌ Open Graph 标签渲染

**需求**:
> 首页和文章可考虑生成 Open Graph 标签以优化社交分享展示

**现状**:
- ✅ CMS 后台: `SeoSetting` 有 `ogTitle`、`ogDescription`、`ogImage` 字段
- ❌ 前端: 没有实现 OG 标签渲染

**缺失内容**:
1. 没有在 metadata 中使用 OG 数据
2. 没有 Twitter Card 配置

**实现建议**:
```typescript
export async function generateMetadata() {
  const seo = await getSeoSettings('home')

  return {
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: 'Busrom',
      title: seo?.ogTitle || seo?.title,
      description: seo?.ogDescription || seo?.description,
      images: [{
        url: seo?.ogImage?.file?.url,
        width: 1200,
        height: 630,
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.ogTitle,
      description: seo?.ogDescription,
      images: [seo?.ogImage?.file?.url],
    }
  }
}
```

---

### 5. ❌ 全局/单页代码注入

**需求**:
> CMS 后台需提供全局代码注入功能,支持单页代码注入

**现状**:
- ✅ CMS 后台: `CustomScript` 模型完整(支持 scope、pageType、position 等)
- ❌ 前端: 没有实现脚本注入逻辑

**缺失内容**:
1. 前端 layout.tsx 中没有读取 CustomScript 数据
2. 没有 ScriptInjector 组件
3. 没有根据 scope/pageType 匹配脚本的逻辑
4. 没有根据 scriptPosition 注入到正确位置

**实现建议**:
```typescript
// web/lib/api/custom-scripts.ts
export async function getCustomScripts(pageType: string, path: string) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    query: `
      query GetCustomScripts {
        customScripts(
          where: {
            enabled: { equals: true }
            OR: [
              { scope: { equals: "global" } }
              {
                AND: [
                  { scope: { equals: "page_type" } }
                  { pageType: { equals: "${pageType}" } }
                ]
              }
            ]
          }
          orderBy: { priority: asc }
        ) {
          id
          name
          content
          scriptPosition
          async
          defer
        }
      }
    `
  })
  return response.data.customScripts
}

// web/components/ScriptInjector.tsx
export function ScriptInjector({ pageType, path }) {
  const scripts = await getCustomScripts(pageType, path)

  const headerScripts = scripts.filter(s => s.scriptPosition === 'header')
  const footerScripts = scripts.filter(s => s.scriptPosition === 'footer')

  return (
    <>
      {/* Header scripts */}
      {headerScripts.map(script => (
        <Script
          key={script.id}
          id={script.id}
          strategy={script.async ? 'afterInteractive' : 'beforeInteractive'}
          dangerouslySetInnerHTML={{ __html: script.content }}
        />
      ))}

      {/* Footer scripts */}
      {footerScripts.map(script => (
        <Script
          key={script.id}
          id={script.id}
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{ __html: script.content }}
        />
      ))}
    </>
  )
}

// web/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <ScriptInjector pageType="global" position="header" />
      </head>
      <body>
        {children}
        <ScriptInjector pageType="global" position="footer" />
      </body>
    </html>
  )
}
```

---

## 🟡 中等优先级缺失功能 (建议实现)

### 6. ❌ IndexNow 协议实现

**需求**:
> 部署 IndexNow 协议让网站更新后的内容可以自动提交到主流搜索引擎

**现状**:
- ✅ CMS 后台: `SiteConfig` 有 `enableIndexNow` 和 `indexNowKey` 字段
- ❌ 前端: 没有实现 IndexNow 提交逻辑

**缺失内容**:
1. 没有 IndexNow API 提交函数
2. 没有在内容更新/创建时触发 IndexNow
3. 没有 `/indexnow-{key}.txt` 验证文件

**实现建议**:
```typescript
// cms/lib/indexnow.ts
export async function submitToIndexNow(urls: string[]) {
  const config = await getSiteConfig()

  if (!config.enableIndexNow || !config.indexNowKey) {
    return
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

  // Submit to Bing, Yandex, Seznam
  await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: new URL(baseUrl).hostname,
      key: config.indexNowKey,
      keyLocation: `${baseUrl}/indexnow-${config.indexNowKey}.txt`,
      urlList: urls.map(path => `${baseUrl}${path}`)
    })
  })
}

// cms/schemas/Product.ts - 添加到 hooks
hooks: {
  afterOperation: async ({ operation, item }) => {
    if (operation === 'create' || operation === 'update') {
      await submitToIndexNow([`/shop/${item.sku}`])
    }
  }
}

// web/app/indexnow-[key].txt/route.ts
export async function GET() {
  const config = await getSiteConfig()
  return new Response(config.indexNowKey, {
    headers: { 'Content-Type': 'text/plain' }
  })
}
```

---

### 7. ❌ Google Indexing API

**需求**:
> 部署 Google 的 Indexing 即时索引协议

**现状**:
- ❌ CMS 后台: 没有 Google Indexing API 配置
- ❌ 前端: 没有实现

**缺失内容**:
1. 需要在 SiteConfig 添加 Google Service Account 配置
2. 需要实现 Google Indexing API 提交函数
3. 需要在内容更新时触发提交

**实现建议**:
```typescript
// cms/lib/google-indexing.ts
import { google } from 'googleapis'

export async function submitToGoogleIndexing(url: string, type: 'URL_UPDATED' | 'URL_DELETED') {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    scopes: ['https://www.googleapis.com/auth/indexing']
  })

  const indexing = google.indexing({ version: 'v3', auth })

  await indexing.urlNotifications.publish({
    requestBody: {
      url: url,
      type: type
    }
  })
}

// 在 CMS hooks 中调用
hooks: {
  afterOperation: async ({ operation, item }) => {
    if (operation === 'create' || operation === 'update') {
      await submitToGoogleIndexing(`${baseUrl}/shop/${item.sku}`, 'URL_UPDATED')
    }
    if (operation === 'delete') {
      await submitToGoogleIndexing(`${baseUrl}/shop/${item.sku}`, 'URL_DELETED')
    }
  }
}
```

---

### 8. ❌ 结构化数据(JSON-LD)渲染

**需求**:
> 后端生成 JSON-LD 格式的结构化数据,供前端渲染到页面

**现状**:
- ✅ CMS 后台: `SeoSetting` 有 `schemaType` 和 `schemaData` 字段
- ❌ 前端: 没有实现 JSON-LD 渲染

**缺失内容**:
1. 没有在页面中插入 `<script type="application/ld+json">` 标签
2. 没有为产品、文章等自动生成结构化数据

**实现建议**:
```typescript
// web/lib/schema.ts
export function generateProductSchema(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images?.map(img => img.file.url),
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": "Busrom"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD"
    }
  }
}

// web/app/shop/[sku]/page.tsx
export default function ProductPage({ product }) {
  const schema = generateProductSchema(product)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* 页面内容 */}
    </>
  )
}
```

---

### 9. ❌ 页面性能优化

**需求**:
> 使用 gzip/Brotli 压缩资源,合理设置缓存头

**现状**:
- ❌ 没有配置资源压缩
- ⚠️ Sitemap/Robots.txt 有缓存(1小时)
- ❌ 没有配置静态资源缓存策略

**缺失内容**:
1. 没有在 Next.js 配置中启用压缩
2. 没有配置静态资源缓存头
3. 没有配置图片优化选项

**实现建议**:
```javascript
// web/next.config.js
module.exports = {
  compress: true, // 启用 gzip 压缩

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  headers: async () => {
    return [
      {
        source: '/:all*(svg|jpg|png|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      }
    ]
  }
}
```

---

## 🟢 低优先级缺失功能 (可选)

### 10. ❌ 自定义代码实时预览

**需求**:
> 提供在后台预览插入脚本后的生效情况的可视化界面

**现状**:
- ❌ CMS 后台没有预览功能

**实现建议**:
- 可以在 CustomScript 详情页添加"预览"按钮
- 打开一个 iframe 显示带有该脚本的测试页面
- 或者提供一个预览 URL,在新窗口打开

---

### 11. ⚠️ 自定义代码版本管理

**需求**:
> 记录每次自定义代码更改的版本

**现状**:
- ✅ 有 `updatedAt` 时间戳
- ✅ 有 `enabled` 启用/禁用开关
- ❌ 没有版本历史记录

**实现建议**:
- 可以添加一个 `CustomScriptVersion` 模型
- 每次更新时保存历史版本
- 支持回滚到历史版本

---

## 📝 实现优先级建议

### 第一阶段 (高优先级 - 必须实现)

1. **前端 Meta 标签渲染** - 基础 SEO,影响所有页面
2. **图片 Alt 属性** - SEO 和可访问性
3. **多语言 hreflang** - 国际化 SEO
4. **Open Graph 标签** - 社交分享优化
5. **全局/单页代码注入** - 追踪代码和分析工具

**预计工作量**: 3-5 天

---

### 第二阶段 (中等优先级 - 建议实现)

1. **IndexNow 协议** - 自动提交到搜索引擎
2. **Google Indexing API** - 快速索引
3. **结构化数据** - 增强搜索结果显示
4. **页面性能优化** - 提升加载速度和排名

**预计工作量**: 2-3 天

---

### 第三阶段 (低优先级 - 可选)

1. **自定义代码预览**
2. **版本管理**

**预计工作量**: 1-2 天

---

## ✅ 总结

### 已完成功能:
- ✅ Sitemap 和 Robots.txt 自动生成
- ✅ CMS 后台所有配置字段
- ✅ 图片多尺寸优化

### 主要缺失:
- ❌ **前端集成** - 大部分 SEO 和代码注入功能只有 CMS 配置,没有前端实现
- ❌ **自动化提交** - IndexNow 和 Google Indexing API 未实现
- ❌ **结构化数据** - JSON-LD 未渲染

### 建议:
**优先完成第一阶段的 5 个高优先级功能**,这些直接影响 SEO 效果和追踪代码使用。第二阶段功能可以在网站上线后逐步添加。

---

**文档维护**: AI Assistant
**最后更新**: 2025-11-05
