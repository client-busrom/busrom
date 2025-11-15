# IndexNow 协议实现指南

## 📋 什么是 IndexNow?

IndexNow 是一个开放协议,允许网站在内容发生变化时立即通知搜索引擎,而不是等待搜索引擎爬虫。

### 支持的搜索引擎

- ✅ **Bing** (Microsoft)
- ✅ **Yandex** (俄罗斯最大搜索引擎)
- ✅ **Seznam.cz** (捷克搜索引擎)
- ⚠️ **Google** - 不支持 IndexNow (需要单独的 Indexing API)

---

## 🔧 实现步骤

### 步骤 1: 生成 API Key

在 CMS 后台 Site Config 中:

1. 生成一个随机的 API Key (至少 8 个字符)
   ```
   示例: a1b2c3d4e5f6g7h8
   ```

2. 填写到 `indexNowKey` 字段

### 步骤 2: 创建验证文件

创建路由: `web/app/indexnow-[key].txt/route.ts`

```typescript
/**
 * IndexNow API Key Verification File
 *
 * This route serves the API key verification file required by IndexNow protocol.
 * URL format: /indexnow-{your-api-key}.txt
 *
 * Example: /indexnow-a1b2c3d4e5f6g7h8.txt
 */

import { NextResponse } from 'next/server'

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/api/graphql'

/**
 * Fetch IndexNow API Key from CMS
 */
async function getIndexNowKey(): Promise<string | null> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetSiteConfig {
            siteConfig {
              indexNowKey
            }
          }
        `,
      }),
      cache: 'no-store',
    })

    const { data } = await response.json()
    return data?.siteConfig?.indexNowKey || null
  } catch (error) {
    console.error('Error fetching IndexNow key:', error)
    return null
  }
}

/**
 * Serve IndexNow API Key
 *
 * The key in the URL must match the key in the CMS configuration
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key: urlKey } = await params
    const configKey = await getIndexNowKey()

    // Verify that URL key matches config key
    if (!configKey || urlKey !== configKey) {
      return new NextResponse('Invalid key', { status: 404 })
    }

    // Return the key as plain text
    return new NextResponse(configKey, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error('Error serving IndexNow key:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
```

### 步骤 3: 创建提交函数

创建文件: `cms/lib/indexnow.ts`

```typescript
/**
 * IndexNow Protocol Implementation
 *
 * This module provides functionality to submit URL updates to search engines
 * that support the IndexNow protocol (Bing, Yandex, Seznam).
 *
 * Documentation: https://www.indexnow.org/documentation
 */

/**
 * Site Config Interface
 */
interface SiteConfig {
  enableIndexNow?: boolean | null
  indexNowKey?: string | null
}

/**
 * Fetch Site Config
 */
async function getSiteConfig(context: any): Promise<SiteConfig | null> {
  try {
    const siteConfig = await context.db.SiteConfig.findMany({
      take: 1,
    })
    return siteConfig[0] || null
  } catch (error) {
    console.error('Error fetching site config:', error)
    return null
  }
}

/**
 * Submit URLs to IndexNow
 *
 * @param urls - Array of full URLs to submit (e.g., ["https://busrom.com/shop/product-1"])
 * @param context - Keystone context
 */
export async function submitToIndexNow(
  urls: string[],
  context: any
): Promise<boolean> {
  try {
    console.log(`📡 IndexNow: Submitting ${urls.length} URLs...`)

    // Fetch site config
    const config = await getSiteConfig(context)

    if (!config?.enableIndexNow) {
      console.log('⏭️  IndexNow is disabled. Skipping submission.')
      return false
    }

    if (!config?.indexNowKey) {
      console.warn('⚠️  IndexNow API key not configured. Skipping submission.')
      return false
    }

    // Get base URL from environment
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busrom.com'
    const hostname = new URL(baseUrl).hostname

    // Prepare request body
    const requestBody = {
      host: hostname,
      key: config.indexNowKey,
      keyLocation: `${baseUrl}/indexnow-${config.indexNowKey}.txt`,
      urlList: urls,
    }

    // Submit to IndexNow endpoint
    // This endpoint is supported by Bing, Yandex, and Seznam
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(requestBody),
    })

    if (response.ok) {
      console.log(`✅ IndexNow: Successfully submitted ${urls.length} URLs`)
      console.log(`   URLs: ${urls.join(', ')}`)
      return true
    } else {
      const statusText = response.statusText
      console.error(`❌ IndexNow: Submission failed (${response.status}: ${statusText})`)

      // Log response body for debugging
      try {
        const responseText = await response.text()
        if (responseText) {
          console.error(`   Response: ${responseText}`)
        }
      } catch (e) {
        // Ignore if response has no body
      }

      return false
    }
  } catch (error) {
    console.error('❌ IndexNow: Error submitting URLs:', error)
    return false
  }
}

/**
 * Submit a single URL to IndexNow
 *
 * @param url - Full URL to submit
 * @param context - Keystone context
 */
export async function submitUrlToIndexNow(
  url: string,
  context: any
): Promise<boolean> {
  return submitToIndexNow([url], context)
}

/**
 * Helper: Build full URL from path
 *
 * @param path - URL path (e.g., "/shop/product-1")
 * @returns Full URL (e.g., "https://busrom.com/shop/product-1")
 */
export function buildFullUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busrom.com'
  return `${baseUrl}${path}`
}
```

### 步骤 4: 在 CMS Hooks 中集成

修改各个内容模型,在创建/更新时触发 IndexNow:

#### Product 模型

```typescript
// cms/schemas/Product.ts
import { submitUrlToIndexNow, buildFullUrl } from '../lib/indexnow'

export const Product = list({
  // ... 其他配置

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      // Only submit on create or update of published products
      if ((operation === 'create' || operation === 'update') && item?.status === 'PUBLISHED') {
        try {
          // Build product URL
          const productUrl = buildFullUrl(`/shop/${item.sku}`)

          // Submit to IndexNow
          await submitUrlToIndexNow(productUrl, context)
        } catch (error) {
          console.error('Error submitting to IndexNow:', error)
          // Don't throw error to prevent blocking the operation
        }
      }
    },
  },
})
```

#### Blog 模型

```typescript
// cms/schemas/Blog.ts
import { submitUrlToIndexNow, buildFullUrl } from '../lib/indexnow'

export const Blog = list({
  // ... 其他配置

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if ((operation === 'create' || operation === 'update') && item?.status === 'PUBLISHED') {
        try {
          const blogUrl = buildFullUrl(`/about-us/blog/${item.slug}`)
          await submitUrlToIndexNow(blogUrl, context)
        } catch (error) {
          console.error('Error submitting to IndexNow:', error)
        }
      }
    },
  },
})
```

#### ProductSeries 模型

```typescript
// cms/schemas/ProductSeries.ts
import { submitUrlToIndexNow, buildFullUrl } from '../lib/indexnow'

export const ProductSeries = list({
  // ... 其他配置

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if ((operation === 'create' || operation === 'update') && item?.status === 'PUBLISHED') {
        try {
          const seriesUrl = buildFullUrl(`/product/${item.slug}`)
          await submitUrlToIndexNow(seriesUrl, context)
        } catch (error) {
          console.error('Error submitting to IndexNow:', error)
        }
      }
    },
  },
})
```

#### Application 模型

```typescript
// cms/schemas/Application.ts
import { submitUrlToIndexNow, buildFullUrl } from '../lib/indexnow'

export const Application = list({
  // ... 其他配置

  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if ((operation === 'create' || operation === 'update') && item?.status === 'PUBLISHED') {
        try {
          const appUrl = buildFullUrl(`/service/application/${item.id}`)
          await submitUrlToIndexNow(appUrl, context)
        } catch (error) {
          console.error('Error submitting to IndexNow:', error)
        }
      }
    },
  },
})
```

---

## 🧪 测试步骤

### 1. 配置 API Key

1. 登录 CMS: `http://localhost:3000`
2. 进入 **Site Config**
3. 勾选 `Enable IndexNow`
4. 填写 `IndexNow API Key`,例如: `a1b2c3d4e5f6g7h8`
5. 保存

### 2. 验证 API Key 文件

访问: `http://localhost:3001/indexnow-a1b2c3d4e5f6g7h8.txt`

**预期结果**: 显示你的 API Key (纯文本)

### 3. 测试提交

1. 在 CMS 中创建或更新一个产品
2. 将状态设置为 `PUBLISHED`
3. 保存
4. 查看服务器日志,应该看到:
   ```
   📡 IndexNow: Submitting 1 URLs...
   ✅ IndexNow: Successfully submitted 1 URLs
      URLs: https://busrom.com/shop/GDH-001-SS
   ```

### 4. 验证提交成功

IndexNow 返回的状态码:
- `200 OK` - 提交成功
- `202 Accepted` - 提交成功,URL 已加入队列
- `400 Bad Request` - 请求格式错误
- `403 Forbidden` - API Key 验证失败
- `422 Unprocessable Entity` - URL 格式错误

---

## 📊 IndexNow vs Sitemap

| 特性 | IndexNow | Sitemap |
|------|----------|---------|
| 更新速度 | **即时** (秒级) | 被动等待爬虫 (天/周) |
| 提交方式 | 主动推送 | 被动发现 |
| 支持引擎 | Bing, Yandex, Seznam | 所有搜索引擎 |
| URL 数量 | 每次最多 10,000 | 最多 50,000 |
| 使用场景 | 内容更新通知 | 网站结构索引 |
| 是否替代 Sitemap | ❌ 否,应配合使用 | ✅ 基础必需 |

---

## 💡 最佳实践

### 1. 只提交重要更新

不要提交所有内容变化,只提交:
- ✅ 新发布的内容
- ✅ 重大内容更新
- ✅ URL 变更
- ❌ 不要提交草稿
- ❌ 不要提交微小修改(如错别字)

### 2. 批量提交

如果一次更新多个内容,使用批量提交:

```typescript
const urls = [
  buildFullUrl('/shop/product-1'),
  buildFullUrl('/shop/product-2'),
  buildFullUrl('/shop/product-3'),
]

await submitToIndexNow(urls, context)
```

### 3. 错误处理

IndexNow 提交失败不应阻塞内容发布:

```typescript
try {
  await submitUrlToIndexNow(url, context)
} catch (error) {
  console.error('IndexNow failed:', error)
  // Continue anyway - sitemap will still work
}
```

### 4. 监控提交

建议记录提交历史:

```typescript
// 可选: 创建 IndexNowLog 模型记录提交
await context.db.IndexNowLog.createOne({
  data: {
    url: productUrl,
    status: 'success',
    submittedAt: new Date(),
  }
})
```

---

## 🔍 常见问题

### Q1: IndexNow 是否支持 Google?

**答**: ❌ 否。Google 不支持 IndexNow 协议。需要使用 Google Indexing API (见下一个指南)。

### Q2: 提交后多久生效?

**答**: 通常 1-24 小时内,Bing 会重新爬取该 URL。

### Q3: 可以删除 URL 吗?

**答**: ❌ IndexNow 不支持删除通知。只能提交新增/更新。

### Q4: 如何验证提交成功?

**答**:
1. 检查 HTTP 返回码 (200/202)
2. 查看 Bing Webmaster Tools 的索引状态
3. 使用 `site:` 搜索验证

### Q5: API Key 泄露怎么办?

**答**:
1. 在 CMS 中生成新的 API Key
2. 旧的验证文件会自动失效
3. 重新提交 URL

---

## 📚 参考资料

- **官方文档**: https://www.indexnow.org/documentation
- **API 规范**: https://www.indexnow.org/faq
- **Bing Webmaster**: https://www.bing.com/webmasters

---

**下一步**: 查看 [Google Indexing API 实现指南](./GoogleIndexingAPI实现指南.md)
