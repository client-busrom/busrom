# Page 路由匹配指南

## 字段说明

### slug (CMS 内部标识)
- **用途**: CMS 内部引用，API 识别
- **格式**: `kebab-case` (例如: `service-overview`, `faq`)
- **唯一性**: 必须唯一
- **示例**:
  - ✅ `service-overview`
  - ✅ `summer-promotion-2024`
  - ❌ `service/overview` (不能包含 /)

### path (前端路由路径)
- **用途**: 前端路由匹配，对应 Next.js 的实际 URL
- **格式**: 必须以 `/` 开头，支持多层级
- **唯一性**: 必须唯一
- **示例**:
  - ✅ `/service`
  - ✅ `/service/one-stop-shop`
  - ✅ `/about-us/story`
  - ✅ `/summer-sale-2024`
  - ❌ `service/overview` (必须以 / 开头)
  - ❌ `/Service/Overview` (必须小写)

## CMS 配置示例

### 固定模板页示例

```typescript
// 服务总览页
{
  slug: "service-overview",           // CMS 内部标识
  path: "/service",                   // 前端路由
  pageType: "TEMPLATE",
  template: "SERVICE_OVERVIEW",
  title: { en: "Our Services", zh: "我们的服务" },
  isSystem: true
}

// 一站式服务页
{
  slug: "one-stop-shop",
  path: "/service/one-stop-shop",     // 多层级路径
  pageType: "TEMPLATE",
  template: "ONE_STOP_SHOP",
  title: { en: "One-Stop Shop", zh: "一站式服务" },
  isSystem: true
}

// FAQ 页
{
  slug: "faq",
  path: "/service/faq",
  pageType: "TEMPLATE",
  template: "FAQ",
  title: { en: "FAQ", zh: "常见问题" },
  isSystem: true
}

// 关于我们 - 故事页
{
  slug: "about-story",
  path: "/about-us/story",
  pageType: "TEMPLATE",
  template: "ABOUT_STORY",
  title: { en: "Our Story", zh: "我们的故事" },
  isSystem: true
}
```

### 自由落地页示例

```typescript
// 夏季促销活动页
{
  slug: "summer-sale-2024",
  path: "/promotions/summer-sale-2024",  // 可以自定义任意路径
  pageType: "FREEFORM",
  title: { en: "Summer Sale 2024", zh: "2024夏季促销" },
  isSystem: false
}

// 黑五活动页
{
  slug: "black-friday-2024",
  path: "/black-friday",               // 也可以用一级路径
  pageType: "FREEFORM",
  title: { en: "Black Friday 2024", zh: "黑色星期五2024" },
  isSystem: false
}
```

## 前端路由实现

### 方案 A: Catch-all 路由 (推荐)

```typescript
// app/[locale]/[...slug]/page.tsx
import { getPageByPath } from '@/lib/api/pages'
import { TemplateRenderer } from '@/components/templates/TemplateRenderer'
import { DocumentRenderer } from '@/components/document-renderer'

export default async function DynamicPage({
  params
}: {
  params: { locale: string; slug: string[] }
}) {
  // 构建完整路径
  const fullPath = '/' + params.slug.join('/')
  // 例如: /service/one-stop-shop

  // 根据 path 查询页面
  const page = await getPageByPath(fullPath, params.locale)

  if (!page) {
    notFound()
  }

  // 根据页面类型渲染
  if (page.pageType === 'TEMPLATE') {
    return (
      <TemplateRenderer
        template={page.template}
        content={page.contentTranslations}
        heroMediaTags={page.heroMediaTags}
        heroText={page.heroText}
        heroSubtitle={page.heroSubtitle}
      />
    )
  } else {
    return (
      <div>
        <Hero
          mediaTags={page.heroMediaTags}
          text={page.heroText}
          subtitle={page.heroSubtitle}
        />
        <DocumentRenderer document={page.contentTranslations.content} />
      </div>
    )
  }
}

// 生成静态路径
export async function generateStaticParams() {
  const pages = await getAllPages()

  return pages.map((page) => ({
    slug: page.path.split('/').filter(Boolean),
    // /service/one-stop-shop => ['service', 'one-stop-shop']
  }))
}
```

### 方案 B: 具体路由 + Fallback

```typescript
// app/[locale]/service/page.tsx (固定模板页)
export default async function ServicePage({ params }: { params: { locale: string } }) {
  const page = await getPageByPath('/service', params.locale)
  return <ServiceOverviewTemplate page={page} />
}

// app/[locale]/service/one-stop-shop/page.tsx
export default async function OneStopShopPage({ params }: { params: { locale: string } }) {
  const page = await getPageByPath('/service/one-stop-shop', params.locale)
  return <OneStopShopTemplate page={page} />
}

// app/[locale]/[...slug]/page.tsx (fallback - 处理所有自由落地页)
export default async function DynamicPage({ params }: { params: { locale: string; slug: string[] } }) {
  const fullPath = '/' + params.slug.join('/')
  const page = await getPageByPath(fullPath, params.locale)

  if (!page || page.pageType !== 'FREEFORM') {
    notFound()
  }

  return <FreeformPageRenderer page={page} />
}
```

## GraphQL 查询示例

### 根据 path 查询页面

```graphql
query GetPageByPath($path: String!, $locale: String!) {
  pages(where: {
    path: { equals: $path },
    status: { equals: "PUBLISHED" }
  }) {
    id
    slug
    path
    pageType
    template
    title

    # Hero Section
    heroMediaTags {
      id
      slug
      name
    }
    heroText
    heroSubtitle

    # Content
    contentTranslations(where: { locale: { equals: $locale } }) {
      locale
      content
    }

    # Metadata
    order
    publishedAt
  }
}
```

### 获取所有已发布页面路径 (用于 sitemap)

```graphql
query GetAllPagePaths {
  pages(where: { status: { equals: "PUBLISHED" } }) {
    path
    updatedAt
  }
}
```

## API 实现示例

```typescript
// lib/api/pages.ts
import { client } from './keystone-client'

export async function getPageByPath(path: string, locale: string) {
  const { data } = await client.query({
    query: GET_PAGE_BY_PATH,
    variables: { path, locale }
  })

  return data?.pages?.[0] || null
}

export async function getAllPages() {
  const { data } = await client.query({
    query: GET_ALL_PAGES
  })

  return data?.pages || []
}
```

## 路径映射表 (参考)

| 功能 | slug | path | template |
|------|------|------|----------|
| 服务总览 | `service-overview` | `/service` | `SERVICE_OVERVIEW` |
| 一站式服务 | `one-stop-shop` | `/service/one-stop-shop` | `ONE_STOP_SHOP` |
| FAQ | `faq` | `/service/faq` | `FAQ` |
| OEM/ODM | `oem-odm` | `/service/oem-odm` | `OEM_ODM` |
| 我们的故事 | `about-story` | `/about-us/story` | `ABOUT_STORY` |
| 支持与保修 | `support` | `/about-us/support` | `SUPPORT` |
| 联系我们 | `contact-us` | `/contact-us` | `CONTACT` |
| 隐私政策 | `privacy-policy` | `/privacy-policy` | `PRIVACY_POLICY` |
| 欺诈警告 | `fraud-notice` | `/fraud-notice` | `FRAUD_NOTICE` |

## 注意事项

1. **path 必须唯一**: 前端路由不能有冲突
2. **path 区分大小写**: 建议全部使用小写
3. **固定模板页建议设置 isSystem=true**: 防止误删
4. **自由落地页可以使用任意路径**: 只要不与固定模板页冲突
5. **SEO 配置**: 通过 `SeoSetting` 模型关联 `path` 或 `slug`

## 前端缓存建议

```typescript
// 固定模板页: ISR (revalidate: 3600)
export const revalidate = 3600 // 1 hour

// 自由落地页: ISR (revalidate: 600)
export const revalidate = 600 // 10 minutes

// 或使用 On-Demand Revalidation
// 在 CMS 更新时通过 webhook 触发重新验证
```
