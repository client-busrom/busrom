# 02 - 后端 API 契约

> **阅读时间**: 25 分钟  
> **适用对象**: 后端开发工程师、全栈开发工程师

---

## ✅ 开发任务清单

### Phase 1: GraphQL API 基础 (优先级: P0)
- [ ] Keystone 6 GraphQL API 配置
- [ ] 实现多语言查询支持
- [ ] AWS S3 图片上传集成
- [ ] 测试 GraphQL Playground

### Phase 2: Next.js 聚合层开发 (优先级: P0)
- [ ] 实现 `/api/v1/home` 聚合接口
- [ ] 实现 `/api/v1/product/*` 系列接口
- [ ] 实现 `/api/v1/shop/*` 商品接口
- [ ] 实现 `/api/v1/media/categories` 接口
- [ ] 实现表单提交接口

### Phase 3: 软删除与状态过滤 (优先级: P0)
- [ ] 所有内容 API 默认只返回 `status: "Published"`
- [ ] CMS 后台支持查看所有状态
- [ ] 媒体库支持 `status: "Active" / "Archived"` 过滤

### Phase 4: 缓存与优化 (优先级: P1)
- [ ] 配置 Redis 缓存
- [ ] 实现 ISR (Incremental Static Regeneration)
- [ ] API 响应时间优化 (< 200ms)

---

## 🌐 多语言 (i18n) 契约

### 核心原则

**前后端分工明确**：

| 职责方 | 负责内容 |
|--------|---------|
| **前端** | 1. 检测访客语言 (Cookie / Accept-Language)<br>2. URL 重定向 (`/` → `/en`)<br>3. 语言切换 UI |
| **后端** | 1. 接受 `?locale=xx` 查询参数<br>2. 返回对应语言的**扁平化 JSON**<br>3. 不存在时回退到默认语言 (`en`) |

### API 设计规范

#### ✅ 正确：扁平化单语言响应

```http
GET /api/v1/home?locale=zh
```

```json
{
  "seo": {
    "title": "Busrom - 高品质玻璃五金制造商",
    "description": "专业的玻璃五金产品...",
    "ogImage": {
      "url": "https://s3.../og-image.jpg",
      "altText": "Busrom 产品展示",
      "thumbnailUrl": "https://s3.../og-image-thumb.jpg"
    }
  },
  "heroBanner": [
    {
      "title": "创新玻璃五金解决方案",
      "features": ["高品质", "定制化", "快速交付", "全球配送", "专业支持"],
      "images": [
        {
          "url": "https://s3.../hero1.jpg",
          "altText": "玻璃五金产品展示",
          "thumbnailUrl": "https://s3.../hero1-thumb.jpg"
        }
      ]
    }
  ]
}
```

#### ❌ 错误：嵌套多语言对象

```json
{
  "seo": {
    "en": { "title": "Busrom - Glass Hardware" },
    "zh": { "title": "Busrom - 玻璃五金" }
  }
}
```

### 回退机制

```typescript
// Next.js API Route Handler
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  let locale = searchParams.get('locale') || 'en'
  
  // 查询数据库
  let content = await getHomeContentByLocale(locale)
  
  // 如果不存在该语言，回退到英文
  if (!content) {
    console.warn(`Locale '${locale}' not found, falling back to 'en'`)
    locale = 'en'
    content = await getHomeContentByLocale('en')
  }
  
  return Response.json(content)
}
```

---

## 🖼️ ImageObject 契约 (核心SEO要求)

**所有图片字段必须返回 `ImageObject` 结构**，而非简单的 URL 字符串。

### ImageObject 结构

```typescript
interface ImageObject {
  url: string           // S3 完整 URL
  altText: string       // 根据 locale 解析的 Alt 文本
  thumbnailUrl?: string // 缩略图 URL (可选)
}
```

### 示例对比

```typescript
// ❌ 错误：返回简单字符串
{
  "mainImage": "https://s3.../product.jpg"
}

// ✅ 正确：返回 ImageObject
{
  "mainImage": {
    "url": "https://s3.../product.jpg",
    "altText": "304不锈钢玻璃支撑件",
    "thumbnailUrl": "https://s3.../product-thumb.jpg"
  }
}
```

---

## 📡 核心 API 接口

### 1. 首页内容接口

#### `GET /api/v1/home?locale={code}`

**用途**: 获取首页所有 16 个区块的数据

**查询参数**:
- `locale` (必填): 语言代码 (如 `en`, `zh`, `es`)

**核心契约**:
1. 所有图片字段必须是 `ImageObject`
2. 所有关联内容（如 `caseStudies`）只返回 `status: "Published"` 的条目
3. 如果 `locale` 不存在，自动回退到 `en`

**响应格式**:

```json
{
  "seo": {
    "title": "string",
    "description": "string",
    "ogImage": {
      "url": "string",
      "altText": "string",
      "thumbnailUrl": "string"
    }
  },
  "heroBanner": [
    {
      "title": "string",
      "features": ["string", "string", "string", "string", "string"],
      "images": [
        {
          "url": "string",
          "altText": "string",
          "thumbnailUrl": "string"
        }
      ],
      "link": "string"
    }
  ],
  "productSeriesCarousel": [
    {
      "key": "string",
      "order": 1,
      "name": "string",
      "image": {
        "url": "string",
        "altText": "string",
        "thumbnailUrl": "string"
      },
      "href": "/product/glass-standoff"
    }
  ],
  "caseStudies": {
    "title": "string",
    "description": "string",
    "applications": [
      {
        "id": "string",
        "name": "string",
        "slug": "string",
        "mainImage": {
          "url": "string",
          "altText": "string",
          "thumbnailUrl": "string"
        },
        "images": [
          {
            "url": "string",
            "altText": "string",
            "thumbnailUrl": "string"
          }
        ]
      }
    ]
  }
}
```

**完整 TypeScript 类型定义**: 见 `api-contracts/home-response.ts`

---

### 2. 媒体分类接口 (新增)

#### `GET /api/v1/media/categories`

**用途**: 获取所有媒体分类（用于前端构建媒体库筛选菜单）

**查询参数**: 无

**响应格式**:

```json
{
  "categories": [
    {
      "id": "cat_1",
      "name": "首页 Banner",
      "parent": null,
      "children": []
    },
    {
      "id": "cat_2",
      "name": "产品图片",
      "parent": null,
      "children": [
        {
          "id": "cat_2_1",
          "name": "玻璃支撑件",
          "parent": "cat_2",
          "children": []
        }
      ]
    }
  ]
}
```

---

### 3. 产品系列接口

#### `GET /api/v1/product/series?locale={code}`

**用途**: 获取所有产品系列列表 (用于 `/product` 页面和导航菜单)

**核心契约**:
- 只返回 `status: "Published"` 的系列
- `image` 字段必须是 `ImageObject`

**响应格式**:

```json
{
  "series": [
    {
      "slug": "glass-standoff",
      "name": "玻璃支撑件",
      "description": "高品质玻璃支撑件...",
      "image": {
        "url": "https://s3.../glass-standoff.jpg",
        "altText": "玻璃支撑件产品系列",
        "thumbnailUrl": "https://s3.../glass-standoff-thumb.jpg"
      },
      "href": "/zh/product/glass-standoff"
    }
  ]
}
```

---

#### `GET /api/v1/product/series/{slug}?locale={code}`

**用途**: 获取单个产品系列详情页数据

**核心契约**:
- 必须是 `status: "Published"` 的系列
- `heroImage` 必须是 `ImageObject`
- `contentBody` 中的所有图片也必须是 `ImageObject`

**响应格式**:

```json
{
  "slug": "glass-standoff",
  "name": "玻璃支撑件",
  "seo": {
    "title": "玻璃支撑件 - Busrom",
    "description": "...",
    "ogImage": {
      "url": "https://s3.../og-glass-standoff.jpg",
      "altText": "玻璃支撑件 OG 图片"
    }
  },
  "heroImage": {
    "url": "https://s3.../hero-glass-standoff.jpg",
    "altText": "玻璃支撑件主视觉图",
    "thumbnailUrl": "https://s3.../hero-glass-standoff-thumb.jpg"
  },
  "contentBody": [
    {
      "type": "rich-text",
      "content": "<p>产品介绍...</p>"
    },
    {
      "type": "image-gallery",
      "images": [
        {
          "url": "https://s3.../1.jpg",
          "altText": "产品细节图1",
          "thumbnailUrl": "https://s3.../1-thumb.jpg"
        }
      ]
    }
  ]
}
```

---

### 4. 商品接口 (Shop)

#### `GET /api/v1/shop/products?locale={code}&page=1&limit=20&category={slug}&q={keyword}`

**用途**: 获取商品列表 (分页、筛选、搜索)

**查询参数**:
- `locale`: 语言代码
- `page`: 页码 (默认 1)
- `limit`: 每页数量 (默认 20)
- `category`: 分类 slug (可选)
- `q`: 搜索关键词 (可选)

**核心契约**:
- **只返回 `status: "Published"` 的商品**
- `mainImage` 必须是 `ImageObject`

**响应格式**:

```json
{
  "products": [
    {
      "sku": "GS-001",
      "name": "304不锈钢玻璃支撑件",
      "slug": "gs-001-glass-standoff",
      "mainImage": {
        "url": "https://s3.../gs001-main.jpg",
        "altText": "GS-001 产品主图",
        "thumbnailUrl": "https://s3.../gs001-main-thumb.jpg"
      },
      "categories": ["glass-standoff", "304-stainless-steel"]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 96,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

#### `GET /api/v1/shop/products/{sku}?locale={code}`

**用途**: 获取单个商品详情

**核心契约**:
- 必须是 `status: "Published"` 的商品
- `mainImage` 和 `galleryImages` 必须是 `ImageObject[]`

**响应格式**:

```json
{
  "sku": "GS-001",
  "name": "304不锈钢玻璃支撑件",
  "slug": "gs-001-glass-standoff",
  "seo": { 
    "title": "...",
    "description": "...",
    "ogImage": {
      "url": "https://s3.../og.jpg",
      "altText": "产品 OG 图片"
    }
  },
  "mainImage": {
    "url": "https://s3.../main.jpg",
    "altText": "产品主图",
    "thumbnailUrl": "https://s3.../main-thumb.jpg"
  },
  "galleryImages": [
    {
      "url": "https://s3.../1.jpg",
      "altText": "产品图1",
      "thumbnailUrl": "https://s3.../1-thumb.jpg"
    },
    {
      "url": "https://s3.../2.jpg",
      "altText": "产品图2",
      "thumbnailUrl": "https://s3.../2-thumb.jpg"
    }
  ],
  "specifications": [
    { "key": "材质", "value": "304不锈钢" },
    { "key": "尺寸", "value": "50mm x 20mm" }
  ],
  "contentBody": [
    {
      "type": "rich-text",
      "content": "<h2>产品详情</h2><p>...</p>"
    }
  ]
}
```

---

### 5. 博客接口

#### `GET /api/v1/blog?locale={code}&page=1&limit=10`

**核心契约**:
- **只返回 `status: "Published"` 的文章**
- `coverImage` 必须是 `ImageObject`

**响应格式**:

```json
{
  "articles": [
    {
      "slug": "glass-hardware-trends-2025",
      "title": "2025年玻璃五金行业趋势",
      "excerpt": "摘要...",
      "coverImage": {
        "url": "https://s3.../cover.jpg",
        "altText": "文章封面图",
        "thumbnailUrl": "https://s3.../cover-thumb.jpg"
      },
      "publishedAt": "2025-01-15T08:00:00Z",
      "author": "Busrom Team"
    }
  ],
  "pagination": { 
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 28
  }
}
```

---

#### `GET /api/v1/blog/{slug}?locale={code}`

**核心契约**:
- 必须是 `status: "Published"` 的文章

**响应格式**:

```json
{
  "slug": "glass-hardware-trends-2025",
  "title": "2025年玻璃五金行业趋势",
  "seo": {
    "title": "...",
    "description": "...",
    "ogImage": {
      "url": "https://s3.../og.jpg",
      "altText": "文章 OG 图片"
    }
  },
  "coverImage": {
    "url": "https://s3.../cover.jpg",
    "altText": "文章封面图",
    "thumbnailUrl": "https://s3.../cover-thumb.jpg"
  },
  "publishedAt": "2025-01-15T08:00:00Z",
  "contentBody": [
    { "type": "rich-text", "content": "..." }
  ]
}
```

---

### 6. 应用案例接口

#### `GET /api/v1/applications?locale={code}`

**核心契约**:
- **只返回 `status: "Published"` 的案例**
- `mainImage` 必须是 `ImageObject`

类似博客接口，返回案例列表。

---

#### `GET /api/v1/applications/{slug}?locale={code}`

**核心契约**:
- 必须是 `status: "Published"` 的案例

类似博客详情，返回单个案例详情。

---

### 7. 表单提交接口

#### `POST /api/v1/submit/contact`

**用途**: 接收联系表单提交

**请求体**:

```json
{
  "name": "张三",
  "email": "zhang@example.com",
  "whatsapp": "+86 138 0000 0000",
  "companyName": "示例公司",
  "message": "我对你们的产品感兴趣...",
  "locale": "zh",
  "source": "/zh/shop/gs-001-glass-standoff",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "203.0.113.45"
  }
}
```

**响应格式**:

```json
{
  "success": true,
  "message": "感谢您的咨询，我们将尽快回复。",
  "submissionId": "sub_1234567890"
}
```

**后端处理逻辑**:

1. **验证**: 检查必填字段 (name, email, message)
2. **过滤**: XSS 防护，清理 HTML 标签
3. **存储**: 保存到 `ContactForm` 模型
4. **通知**: (可选) 发送邮件通知运营团队
5. **追踪**: 记录 IP、User-Agent、来源页面

---

### 8. CDP 埋点接口

#### `POST /api/v1/track/event`

**用途**: 接收前端埋点数据

**请求体**:

```json
{
  "event": "page_view",
  "properties": {
    "page": "/zh/product/glass-standoff",
    "referrer": "https://google.com",
    "locale": "zh"
  },
  "context": {
    "userAgent": "...",
    "ip": "203.0.113.45",
    "sessionId": "sess_xyz123"
  },
  "timestamp": "2025-01-15T12:34:56.789Z"
}
```

**响应格式**:

```json
{
  "success": true,
  "eventId": "evt_1234567890"
}
```

---

## 🔗 GraphQL → RESTful 转换层

### 实现示例

```typescript
// app/api/v1/home/route.ts
import { keystoneGraphQLClient } from '@/lib/keystone-client'
import { gql } from '@apollo/client'

const GET_HOME_CONTENT = gql`
  query GetHomeContent($locale: String!) {
    homePage {
      heroBanner {
        title_en
        title_zh
        title_es
        features_en
        features_zh
        features_es
        images {
          url
          altText_en
          altText_zh
          altText_es
          thumbnailUrl
        }
      }
      caseStudies(where: { status: { equals: "Published" } }) {
        id
        name_en
        name_zh
        name_es
        slug
        mainImage {
          url
          altText_en
          altText_zh
          altText_es
          thumbnailUrl
        }
        images {
          url
          altText_en
          altText_zh
          altText_es
          thumbnailUrl
        }
      }
    }
  }
`

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get('locale') || 'en'
  
  try {
    const { data } = await keystoneGraphQLClient.query({
      query: GET_HOME_CONTENT,
      variables: { locale }
    })
    
    // 聚合和转换数据
    const response = transformHomeData(data, locale)
    
    return Response.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    })
  } catch (error) {
    console.error('Failed to fetch home content:', error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function transformHomeData(data: any, locale: string) {
  return {
    seo: data.homePage.seo,
    heroBanner: data.homePage.heroBanner.map(item => ({
      title: item[`title_${locale}`],
      features: JSON.parse(item[`features_${locale}`]),
      images: item.images.map(img => ({
        url: img.url,
        altText: img[`altText_${locale}`],
        thumbnailUrl: img.thumbnailUrl
      }))
    })),
    caseStudies: {
      applications: data.homePage.caseStudies.map(app => ({
        id: app.id,
        name: app[`name_${locale}`],
        slug: app.slug,
        mainImage: {
          url: app.mainImage.url,
          altText: app.mainImage[`altText_${locale}`],
          thumbnailUrl: app.mainImage.thumbnailUrl
        },
        images: app.images.map(img => ({
          url: img.url,
          altText: img[`altText_${locale}`],
          thumbnailUrl: img.thumbnailUrl
        }))
      }))
    }
  }
}
```

---

## ⚡ 缓存策略

### ISR (Incremental Static Regeneration)

```typescript
// Next.js API Route
export async function GET(request: Request) {
  const content = await getHomeContent(locale)
  
  return Response.json(content, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
```

---

## 🔒 安全规范

### XSS 防护

```typescript
import DOMPurify from 'isomorphic-dompurify'

export async function POST(request: Request) {
  const body = await request.json()
  
  const sanitized = {
    name: DOMPurify.sanitize(body.name),
    email: DOMPurify.sanitize(body.email),
    message: DOMPurify.sanitize(body.message, { ALLOWED_TAGS: [] })
  }
  
  await saveContactForm(sanitized)
  
  return Response.json({ success: true })
}
```

---

## 🤖 Claude Code Prompt 模板

```markdown
你好，我需要你帮我开发 Busrom 网站的后端 API 聚合层。

**项目背景**：
- Keystone 6 提供 GraphQL API
- Next.js 需要 RESTful 风格的 API
- 需求文档：`/docs/02-后端API契约.md`

**你的任务**：
1. 在 Next.js 中创建 `/app/api/v1/` 目录
2. 实现所有核心 API 接口
3. 实现 GraphQL 到 RESTful 的数据转换
4. 确保所有图片返回 ImageObject 结构
5. 确保内容 API 只返回 Published 状态

**验收标准**：
- [ ] 所有图片字段都是 ImageObject
- [ ] 内容 API 正确过滤 status
- [ ] 多语言回退机制正常
- [ ] API 响应时间 < 200ms

请开始工作。
```

---

**文档版本**: v1.0  
**最后更新**: 2025-11-01