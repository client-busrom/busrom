# Navigation Menu Image Enrichment

## 📋 概述

这个工具库提供了为导航菜单自动添加产品系列图片的功能。

## 🚀 使用方法

### 方式 1: Server Component（推荐）

```typescript
// app/components/Header.tsx

import { enrichNavigationWithImages } from '@/lib/navigation/enrichNavigationWithImages'

export async function Header() {
  // 从 Keystone GraphQL API 获取数据
  const response = await fetch('http://localhost:3000/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetNavigationData {
          navigationMenus(
            where: { parent: null, visible: true },
            orderBy: { order: asc }
          ) {
            id
            name
            type
            icon
            link
            order
            children(
              where: { visible: true },
              orderBy: { order: asc }
            ) {
              id
              name
              type
              icon
              link
              order
              image {
                id
                url
                alt
                width
                height
              }
            }
          }

          productSeries(where: { isActive: true }) {
            id
            slug
            name
            products(
              where: { status: "PUBLISHED" },
              orderBy: { createdAt: desc },
              take: 1
            ) {
              id
              coverImage {
                id
                url
                alt
                width
                height
              }
            }
          }
        }
      `
    }),
    next: { revalidate: 300 } // 5 minutes cache
  })

  const { data } = await response.json()

  // 合并数据
  const enrichedMenus = enrichNavigationWithImages(
    data.navigationMenus,
    data.productSeries
  )

  return <Navigation menus={enrichedMenus} />
}
```

### 方式 2: API Route

```typescript
// app/api/navigation/route.ts

import { NextResponse } from 'next/server'
import { enrichNavigationWithImages } from '@/lib/navigation/enrichNavigationWithImages'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'

  try {
    // 从 Keystone 获取数据
    const response = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetNavigationData {
            navigationMenus(where: { parent: null, visible: true }) {
              id name type icon link order
              children(where: { visible: true }) {
                id name type icon link order
                image { id url alt width height }
              }
            }
            productSeries(where: { isActive: true }) {
              id slug name
              products(where: { status: "PUBLISHED" }, take: 1) {
                coverImage { id url alt width height }
              }
            }
          }
        `
      })
    })

    const { data } = await response.json()

    // 合并数据
    const enrichedMenus = enrichNavigationWithImages(
      data.navigationMenus,
      data.productSeries
    )

    return NextResponse.json({
      success: true,
      data: enrichedMenus
    })
  } catch (error) {
    console.error('Error fetching navigation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation' },
      { status: 500 }
    )
  }
}
```

### 方式 3: React Query（客户端）

```typescript
// hooks/useNavigation.ts

import { useQuery } from '@tanstack/react-query'

export function useNavigation(locale = 'en') {
  return useQuery({
    queryKey: ['navigation', locale],
    queryFn: async () => {
      const response = await fetch(`/api/navigation?locale=${locale}`)
      if (!response.ok) throw new Error('Failed to fetch navigation')
      const { data } = await response.json()
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

// 在组件中使用
function Navigation() {
  const { data: menus, isLoading } = useNavigation()

  if (isLoading) return <div>Loading...</div>

  return (
    <nav>
      {menus?.map(menu => (
        <MenuItem key={menu.id} menu={menu} />
      ))}
    </nav>
  )
}
```

## 📊 数据流程

```
1. 获取 NavigationMenu 数据
   ↓
2. 获取 ProductSeries 数据（包含第一个产品的图片）
   ↓
3. enrichNavigationWithImages()
   - 创建 slug → image 映射
   - 从 link 提取 slug
   - 为子菜单添加图片
   ↓
4. 返回完整的导航数据
```

## 🎯 链接格式

函数会自动识别两种链接格式：

### Shop 菜单（查询参数）
```
/shop?series=glass-standoff
/shop?series=glass-connected-fitting
```

### Product 菜单（路径参数）
```
/product/glass-standoff
/product/glass-connected-fitting
```

## 🔍 优先级

1. **手动设置的图片**优先
   - 如果在 CMS 中为菜单项手动选择了图片，将使用手动设置的

2. **自动获取的图片**次之
   - 从产品系列的第一个已发布产品中获取封面图

3. **无图片**
   - 如果系列没有产品或产品没有图片，`image` 为 `null`

## 🧪 测试

```typescript
import { enrichNavigationWithImages, extractSeriesSlug } from './enrichNavigationWithImages'

// 测试 slug 提取
console.log(extractSeriesSlug('/shop?series=glass-standoff'))
// 输出: 'glass-standoff'

console.log(extractSeriesSlug('/product/glass-standoff'))
// 输出: 'glass-standoff'

// 测试完整功能
const menus = [
  {
    id: '1',
    name: { en: 'Shop' },
    type: 'PRODUCT_CARDS',
    children: [
      {
        id: '1-1',
        name: { en: 'Glass Standoff' },
        link: '/shop?series=glass-standoff'
      }
    ]
  }
]

const series = [
  {
    id: 's1',
    slug: 'glass-standoff',
    name: { en: 'Glass Standoff' },
    products: [
      {
        id: 'p1',
        coverImage: {
          url: '/images/glass-standoff.jpg',
          alt: 'Glass Standoff'
        }
      }
    ]
  }
]

const result = enrichNavigationWithImages(menus, series)
console.log(result[0].children[0].image)
// 输出: { url: '/images/glass-standoff.jpg', alt: 'Glass Standoff' }
```

## 📝 类型定义

```typescript
interface ImageData {
  id: string
  url: string
  alt?: string | null
  width?: number | null
  height?: number | null
}

interface Product {
  id: string
  coverImage?: ImageData | null
}

interface ProductSeries {
  id: string
  slug: string
  name: Record<string, string>
  products?: Product[]
}

interface NavigationMenuItem {
  id: string
  name: Record<string, string>
  type: 'STANDARD' | 'PRODUCT_CARDS' | 'SUBMENU'
  icon?: string | null
  link?: string | null
  order: number
  image?: ImageData | null
  children?: NavigationMenuItem[]
}
```

## ⚡ 性能优化

### 缓存策略

```typescript
// Next.js Server Component
export const revalidate = 300 // 5 minutes

// Next.js API Route
{ next: { revalidate: 300 } }

// React Query
{
  staleTime: 5 * 60 * 1000,
  cacheTime: 10 * 60 * 1000
}
```

### 减少数据传输

```typescript
// 只获取第一个产品
products(take: 1, where: { status: "PUBLISHED" }) {
  coverImage { id url alt width height }
}
```

## 🐛 故障排除

### 问题: 子菜单没有图片

**可能原因**:
1. 产品系列没有已发布的产品
2. 产品没有设置封面图
3. 链接格式不正确

**解决方案**:
```typescript
// 检查产品系列
const series = await getProductSeries()
console.log(series.filter(s => s.products.length === 0))

// 检查链接格式
const slug = extractSeriesSlug(link)
console.log('Extracted slug:', slug)

// 开启开发模式警告
// process.env.NODE_ENV === 'development' 时会自动输出警告
```

### 问题: 图片未更新

**可能原因**:
- 缓存未过期

**解决方案**:
```typescript
// 清除 Next.js 缓存
fetch('/api/revalidate?path=/api/navigation')

// 清除 React Query 缓存
queryClient.invalidateQueries(['navigation'])
```

## 📚 相关文档

- [导航菜单配置说明](../../../docs/导航菜单配置说明.md)
- [导航菜单图片获取方案](../../../docs/导航菜单图片获取方案.md)
- [数据模型与架构](../../../docs/01-数据模型与架构.md)
