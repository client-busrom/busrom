# ProductSeriesCarousel 前端查询指南

## 概述

ProductSeriesCarousel 数据现在支持多语言,每个语言都有独立的轮播项列表。前端使用 **Apollo Client** 直接查询 GraphQL API 获取数据。

## 数据结构

### CMS 数据结构

```json
{
  "items": {
    "en": [
      {
        "isShow": true,
        "title": "Series Name",
        "image": "media-id-123",
        "sceneImage": "media-id-456",
        "buttonText": "Learn More",
        "linkUrl": "/product-series/example"
      }
    ],
    "zh": [
      {
        "isShow": true,
        "title": "系列名称",
        "image": "media-id-123",
        "sceneImage": "media-id-456",
        "buttonText": "了解更多",
        "linkUrl": "/product-series/example"
      }
    ]
  },
  "autoPlay": true,
  "autoPlaySpeed": 5000,
  "status": "ACTIVE"
}
```

### 前端数据结构

```typescript
interface ProductSeriesItem {
  key: string
  order: number
  name: string
  image: ImageObject
  href: string
}

interface ImageObject {
  url: string
  altText: string
  thumbnailUrl?: string
}
```

## 使用方法

### 方法 1: 在 Server Component 中使用

在 Next.js 的 Server Component 中直接获取数据:

```typescript
// app/[locale]/page.tsx
import { getProductSeriesCarousel } from '@/lib/api/product-series-carousel'

export default async function Home({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  // 获取轮播数据
  const carouselItems = await getProductSeriesCarousel(locale)

  return (
    <div>
      <ProductSeriesCarousel data={carouselItems} locale={locale} />
    </div>
  )
}
```

### 方法 2: 在 Client Component 中使用

如果需要在客户端组件中使用,可以通过 props 传递:

```typescript
// HomePageClient.tsx
'use client'

import { ProductSeriesCarousel } from '@/components/home/product-series-carousel'

interface Props {
  carouselData: ProductSeriesItem[]
  locale: Locale
}

export function HomePageClient({ carouselData, locale }: Props) {
  return (
    <div>
      <ProductSeriesCarousel data={carouselData} locale={locale} />
    </div>
  )
}
```

### 方法 3: 获取配置信息

```typescript
import { getCarouselConfig } from '@/lib/api/product-series-carousel'

const config = await getCarouselConfig()
// { autoPlay: true, autoPlaySpeed: 5000 }
```

## 完整示例

### 更新 page.tsx

```typescript
// app/[locale]/page.tsx
import type { Locale } from "@/i18n.config"
import { getProductSeriesCarousel } from "@/lib/api/product-series-carousel"
import { getUserPreferencesFromCookies } from "@/lib/server/user-preferences"
import { HomePageClient } from "./HomePageClient"

export default async function Home({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const preferences = await getUserPreferencesFromCookies()
  const currentLanguage = (preferences.language as Locale) || locale

  // 获取轮播数据
  const carouselData = await getProductSeriesCarousel(currentLanguage)

  // 获取其他内容数据...
  const content = {
    // ... 其他模块数据
    productSeriesCarousel: carouselData,
  }

  return (
    <HomePageClient
      initialContent={content}
      currentLanguage={currentLanguage}
    />
  )
}
```

### 组件使用

组件代码保持不变,数据结构完全兼容:

```typescript
// components/home/product-series-carousel.tsx
'use client'

import type { ProductSeriesItem } from '@/lib/content-data'

type Props = {
  data: ProductSeriesItem[]
  locale: Locale
}

export default function ProductSeriesCarousel({ data, locale }: Props) {
  // 组件逻辑保持不变
  const leftItem = data[leftItemIndex]
  const rightItem = data[rightItemIndex]

  return (
    <section>
      <Image
        src={leftItem.image.url}
        alt={leftItem.image.altText || leftItem.name}
        // ...
      />
      <span>{leftItem.name}</span>
    </section>
  )
}
```

## GraphQL 查询详情

底层 GraphQL 查询:

```graphql
query GetProductSeriesCarousel {
  productSeriesCarousels {
    items
    autoPlay
    autoPlaySpeed
    status
  }
}
```

媒体查询:

```graphql
query GetMedia($id: ID!) {
  media(where: { id: $id }) {
    id
    filename
    file {
      url
    }
    variants
  }
}
```

## 数据转换流程

1. **查询 CMS** → 获取多语言数据结构
2. **选择语言** → 提取指定语言的轮播项
3. **过滤显示** → 只保留 `isShow: true` 的项
4. **获取媒体** → 查询每个 media ID 的详细信息
5. **转换格式** → 转换为前端需要的 `ProductSeriesItem` 格式
6. **排序返回** → 按 order 排序后返回

## 环境变量配置

确保在 `.env.local` 中配置:

```bash
# Keystone CMS GraphQL API
CMS_GRAPHQL_URL=http://localhost:3000/api/graphql

# 或者在生产环境
CMS_GRAPHQL_URL=https://your-cms-domain.com/api/graphql
```

## 缓存策略

Apollo Client 配置为 `no-cache`,确保每次都获取最新数据:

```typescript
const defaultOptions: DefaultOptions = {
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
}
```

如果需要缓存,可以修改 `web/lib/keystone-client.ts`:

```typescript
const defaultOptions: DefaultOptions = {
  query: {
    fetchPolicy: 'cache-first', // 优先使用缓存
    errorPolicy: 'all',
  },
}
```

## 错误处理

查询助手已内置错误处理:

- 如果 CMS 无数据,返回空数组 `[]`
- 如果状态不是 `ACTIVE`,返回空数组
- 如果指定语言无数据,返回空数组
- 媒体加载失败的项会被过滤掉

## 调试

启用 Apollo DevTools:

```typescript
// web/lib/keystone-client.ts
export const keystoneClient = new ApolloClient({
  // ...
  connectToDevTools: process.env.NODE_ENV === 'development',
})
```

在浏览器控制台查看 GraphQL 查询:

```typescript
import { getProductSeriesCarousel } from '@/lib/api/product-series-carousel'

const data = await getProductSeriesCarousel('en')
console.log('Carousel data:', data)
```

## 常见问题

### Q: 为什么要用 Apollo Client 而不是 REST API?

A:
- GraphQL 更灵活,可以精确查询需要的字段
- 减少网络请求次数
- 类型安全,配合 TypeScript 使用更好
- Keystone CMS 原生支持 GraphQL

### Q: 如何切换到 REST API?

A: 可以创建一个 REST API endpoint:

```typescript
// app/api/carousel/[locale]/route.ts
import { getProductSeriesCarousel } from '@/lib/api/product-series-carousel'

export async function GET(
  request: Request,
  { params }: { params: { locale: string } }
) {
  const data = await getProductSeriesCarousel(params.locale)
  return Response.json(data)
}
```

然后在前端使用 fetch:

```typescript
const res = await fetch(`/api/carousel/${locale}`)
const data = await res.json()
```

### Q: 如何实现增量更新?

A: 使用 React Query 或 SWR:

```typescript
'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useCarouselData(locale: string) {
  const { data, error } = useSWR(`/api/carousel/${locale}`, fetcher, {
    refreshInterval: 60000, // 每分钟刷新
  })

  return {
    data,
    isLoading: !error && !data,
    isError: error
  }
}
```

## 总结

- ✅ 使用 **Apollo Client** 直接查询 GraphQL API
- ✅ 支持多语言,每个语言独立管理
- ✅ 自动转换数据格式
- ✅ 内置错误处理和数据验证
- ✅ 前端组件无需修改,数据结构完全兼容
