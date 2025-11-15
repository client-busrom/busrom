# Busrom GraphQL API 完整接口文档

**文档版本**: v3.0
**技术栈**: Keystone 6 GraphQL API
**最后更新**: 2025-11-06
**GraphQL Endpoint**: `http://localhost:3000/api/graphql` (开发环境)

---

## 📋 目录

1. [通用接口规范](#通用接口规范)
2. [导航与站点结构](#导航与站点结构)
3. [首页内容区块](#首页内容区块)
4. [产品系列接口](#产品系列接口)
5. [产品SKU接口](#产品sku接口)
6. [博客接口](#博客接口)
7. [应用案例接口](#应用案例接口)
8. [媒体库接口](#媒体库接口)
9. [表单提交接口](#表单提交接口)
10. [FAQ接口](#faq接口)
11. [站点配置接口](#站点配置接口)
12. [SEO相关接口](#seo相关接口)
13. [多语言内容处理](#多语言内容处理)
14. [前端集成示例](#前端集成示例)

---

## 通用接口规范

### 基础信息

- **GraphQL Endpoint**: `POST /api/graphql`
- **开发环境**: `http://localhost:3000/api/graphql`
- **生产环境**: `https://api.busrom.com/api/graphql`

### 认证方式

- **公开查询接口**: 无需认证(所有query操作)
- **管理接口**: 需要JWT Token(mutation操作需要登录)

### 响应格式

```json
{
  "data": {
    "查询名称": { /* 返回数据 */ }
  },
  "errors": [ /* 可选的错误信息 */ ]
}
```

### 通用查询参数

所有列表查询都支持以下参数:

```graphql
# 分页参数
take: Int          # 获取数量(默认20)
skip: Int          # 跳过数量(用于分页)

# 排序参数
orderBy: {
  字段名: asc    # 升序
  字段名: desc   # 降序
}

# 筛选参数
where: {
  字段名: { equals: "值" }      # 等于
  字段名: { contains: "值" }    # 包含
  字段名: { in: ["值1", "值2"] } # 在列表中
}
```

---

## 导航与站点结构

### 1.1 获取完整导航菜单

这是网站顶部导航的完整数据结构,包含多层级菜单、图标、随机图片等。

```graphql
query GetNavigationMenu {
  navigationMenus(
    where: { visible: { equals: true } }
    orderBy: { order: asc }
  ) {
    id
    slug                 # 唯一标识(如: product, service)
    name                 # 多语言名称(JSON格式: {"en":"Product","zh":"产品"})
    type                 # 菜单类型: STANDARD | PRODUCT_CARDS | SUBMENU
    icon                 # 图标名称(Lucide图标,如: Home, Package)
    link                 # 链接地址(如: /product, /service)
    order                # 排序(数字越小越靠前)
    visible              # 是否显示

    # 父级菜单(如果有的话)
    parent {
      id
      slug
    }

    # 子菜单列表
    children(orderBy: { order: asc }) {
      id
      slug
      name
      type
      icon
      link
      order

      # PRODUCT_CARDS类型专用: 通过标签获取随机图片
      mediaTags {
        id
        name
      }
      randomImage {
        id
        filename
        url
      }
    }
  }
}
```

**响应示例**:
```json
{
  "data": {
    "navigationMenus": [
      {
        "id": "clxxx",
        "slug": "product",
        "name": {"en": "Product", "zh": "产品"},
        "type": "PRODUCT_CARDS",
        "icon": null,
        "link": "/product",
        "order": 1,
        "visible": true,
        "parent": null,
        "children": [
          {
            "id": "clyyy",
            "slug": "glass-standoff",
            "name": {"en": "Glass Standoff", "zh": "玻璃驳接爪"},
            "type": "STANDARD",
            "icon": null,
            "link": "/product/glass-standoff",
            "order": 1,
            "mediaTags": [
              {"id": "tag1", "name": "glass-standoff"}
            ],
            "randomImage": {
              "id": "media1",
              "filename": "standoff-01.jpg",
              "url": "https://cdn.busrom.com/uploads/standoff-01.jpg"
            }
          }
        ]
      }
    ]
  }
}
```

### 1.2 仅获取顶级菜单(用于移动端导航)

```graphql
query GetTopLevelNavigation {
  navigationMenus(
    where: {
      visible: { equals: true }
      parent: { equals: null }
    }
    orderBy: { order: asc }
  ) {
    id
    slug
    name
    type
    link
    icon
  }
}
```

---

## 首页内容区块

首页采用模块化设计,每个区块都有独立的GraphQL查询。

### 2.1 Hero Banner(首页轮播图)

```graphql
query GetHeroBanner {
  heroBannerItems(
    where: { visible: { equals: true } }
    orderBy: { order: asc }
  ) {
    id
    title              # 多语言标题(JSON格式)
    subtitle           # 多语言副标题(JSON格式)
    ctaText            # 按钮文字(JSON格式)
    ctaLink            # 按钮链接(JSON格式)

    # 背景图片
    backgroundImage {
      id
      filename
      file {
        url
        width
        height
      }
      # 图片变体(不同尺寸)
      variants {
        thumbnail
        small
        medium
        large
        xlarge
        webp
      }
    }

    # 背景视频URL(可选)
    backgroundVideo

    order
    visible
  }
}
```

### 2.2 产品系列轮播

```graphql
query GetProductSeriesCarousel {
  productSeriesCarousels(take: 1) {
    id
    title              # 区块标题(JSON格式)
    subtitle           # 区块副标题(JSON格式)

    # 精选的产品系列
    featuredSeries {
      id
      slug
      name           # 系列名称(JSON格式)
      description    # 系列描述(JSON格式)

      # 特色图片
      featuredImage {
        id
        filename
        file {
          url
        }
        altText      # 图片alt文本(JSON格式)
        variants {
          medium
          webp
        }
      }
    }

    # "查看全部"按钮配置
    showViewAllButton
    viewAllButtonText   # 按钮文字(JSON格式)
    viewAllButtonLink   # 按钮链接(JSON格式)
  }
}
```

### 2.3 服务特点配置

```graphql
query GetServiceFeatures {
  serviceFeaturesConfigs(take: 1) {
    id
    title              # 区块标题(JSON格式)
    subtitle           # 区块副标题(JSON格式)
    features           # 特点列表(JSON格式,包含图标、标题、描述)
    layout             # 布局方式: GRID | LIST
  }
}
```

**features字段结构示例**:
```json
{
  "en": [
    {
      "icon": "Truck",
      "title": "Fast Delivery",
      "description": "Quick shipping worldwide"
    }
  ],
  "zh": [
    {
      "icon": "Truck",
      "title": "快速交付",
      "description": "全球快速发货"
    }
  ]
}
```

### 2.4 精选产品

```graphql
query GetFeaturedProducts {
  featuredProducts(take: 1) {
    id
    title              # 区块标题(JSON格式)
    subtitle           # 区块副标题(JSON格式)

    # 精选的产品列表
    products {
      id
      sku
      slug
      name           # 产品名称(JSON格式)
      shortDescription  # 短描述(JSON格式)

      # 产品图片
      images(take: 1) {
        id
        filename
        file {
          url
        }
        altText
        variants {
          medium
          webp
        }
      }

      # 价格信息(如果启用)
      price
      compareAtPrice
      inStock
    }
  }
}
```

### 2.5 品牌优势

```graphql
query GetBrandAdvantages {
  brandAdvantages(take: 1) {
    id
    title              # 区块标题(JSON格式)
    subtitle           # 区块副标题(JSON格式)
    advantages         # 优势列表(JSON格式)
    ctaText            # 按钮文字(JSON格式)
    ctaLink            # 按钮链接(JSON格式)
  }
}
```

### 2.6 案例展示

```graphql
query GetCaseStudies {
  caseStudies(take: 1) {
    id
    title              # 区块标题(JSON格式)
    subtitle           # 区块副标题(JSON格式)

    # 精选的应用案例
    applications {
      id
      title          # 案例标题(JSON格式)

      # 案例特色图片
      featuredImage {
        id
        filename
        file {
          url
        }
        variants {
          medium
          webp
        }
      }
    }

    showViewAllButton
    viewAllButtonText
    viewAllButtonLink
  }
}
```

### 2.7 OEM/ODM服务

```graphql
query GetOemOdm {
  oemOdms(take: 1) {
    id
    title              # 标题(JSON格式)
    subtitle           # 副标题(JSON格式)
    content            # 内容(JSON格式)
    features           # 特性列表(JSON格式)
    ctaText
    ctaLink

    # 背景图片
    backgroundImage {
      file {
        url
      }
      variants {
        large
        webp
      }
    }
  }
}
```

### 2.8 报价步骤

```graphql
query GetQuoteSteps {
  quoteSteps(take: 1) {
    id
    title              # 标题(JSON格式)
    subtitle           # 副标题(JSON格式)
    steps              # 步骤列表(JSON格式)
    ctaText
    ctaLink
  }
}
```

### 2.9 3D球体展示

```graphql
query GetSphere3d {
  sphere3ds(take: 1) {
    id
    title              # 标题(JSON格式)
    subtitle           # 副标题(JSON格式)
    tags               # 标签列表(JSON格式,用于球体展示)
  }
}
```

### 2.10 主表单配置

```graphql
query GetMainForm {
  mainFormConfigs(
    where: { status: { equals: "PUBLISHED" } }
    take: 1
  ) {
    id
    internalLabel      # 内部标识

    # 表单占位符(所有为JSON格式)
    placeholderName       # 姓名占位符
    placeholderEmail      # 邮箱占位符
    placeholderWhatsapp   # WhatsApp占位符
    placeholderCompany    # 公司占位符
    placeholderMessage    # 消息占位符
    placeholderVerify     # 验证码占位符

    # 按钮文字
    buttonText         # 提交按钮文字(JSON格式)

    # 设计文字
    designTextLeft     # 设计文字-左(JSON格式)
    designTextRight    # 设计文字-右(JSON格式)

    # 图片
    image1 {
      id
      filename
      file {
        url
      }
      variants {
        medium
        webp
      }
    }
    image2 {
      id
      filename
      file {
        url
      }
      variants {
        medium
        webp
      }
    }

    # 发布状态
    status
    publishedAt
    updatedAt
  }
}
```

**使用示例**:
```typescript
// 提取多语言占位符
const formConfig = data.mainFormConfigs[0]
const locale = 'zh'

const placeholders = {
  name: getLocalizedContent(formConfig.placeholderName, locale, 'Your Name'),
  email: getLocalizedContent(formConfig.placeholderEmail, locale, 'Your Email'),
  whatsapp: getLocalizedContent(formConfig.placeholderWhatsapp, locale, 'WhatsApp Number'),
  company: getLocalizedContent(formConfig.placeholderCompany, locale, 'Company Name'),
  message: getLocalizedContent(formConfig.placeholderMessage, locale, 'Message'),
  verify: getLocalizedContent(formConfig.placeholderVerify, locale, 'Verify Code')
}

const buttonText = getLocalizedContent(formConfig.buttonText, locale, 'Send')
const designTextLeft = getLocalizedContent(formConfig.designTextLeft, locale)
const designTextRight = getLocalizedContent(formConfig.designTextRight, locale)
```

### 2.11 为什么选择Busrom

```graphql
query GetWhyChooseBusrom {
  whyChooseBusroms(take: 1) {
    id
    title              # 标题(JSON格式)
    subtitle           # 副标题(JSON格式)
    reasons            # 理由列表(JSON格式)
  }
}
```

### 2.12 品牌分析

```graphql
query GetBrandAnalysis {
  brandAnalyses(take: 1) {
    id
    title              # 标题(JSON格式)
    content            # 内容(JSON格式)
  }
}
```

### 2.13 品牌价值观

```graphql
query GetBrandValue {
  brandValues(take: 1) {
    id
    title              # 标题(JSON格式)
    values             # 价值观列表(JSON格式)
  }
}
```

### 2.14 系列介绍

```graphql
query GetSeriesIntro {
  seriesIntros(take: 1) {
    id
    title              # 标题(JSON格式)
    subtitle           # 副标题(JSON格式)
    content            # 内容(JSON格式)
  }
}
```

### 2.15 简单CTA(行动号召)

```graphql
query GetSimpleCta {
  simpleCtas(take: 1) {
    id
    title              # 标题(JSON格式)
    subtitle           # 副标题(JSON格式)
    ctaText            # 按钮文字(JSON格式)
    ctaLink            # 按钮链接(JSON格式)
    style              # 样式: PRIMARY | SECONDARY | OUTLINED
  }
}
```

### 2.16 页脚配置

```graphql
query GetFooter {
  footers(take: 1) {
    id
    companyInfo        # 公司信息(JSON格式)
    quickLinks         # 快速链接(JSON格式)
    socialLinks        # 社交媒体链接(JSON格式)
    bottomLinks        # 底部链接(JSON格式)
    copyrightText      # 版权文字(JSON格式)

    # 邮件订阅配置
    newsletter {
      title            # 订阅标题(JSON格式)
      placeholder      # 输入框提示(JSON格式)
      buttonText       # 按钮文字(JSON格式)
    }
  }
}
```

---

## 产品系列接口

### 3.1 获取所有产品系列(列表页)

```graphql
query GetProductSeries($locale: String = "en", $take: Int = 20, $skip: Int = 0) {
  productSeries(
    where: { status: { equals: "PUBLISHED" } }
    orderBy: { order: asc }
    take: $take
    skip: $skip
  ) {
    id
    slug               # URL标识(如: glass-standoff)
    name               # 系列名称(JSON格式: {"en":"...", "zh":"..."})
    description        # 系列描述(JSON格式)

    # 特色图片
    featuredImage {
      id
      filename
      file {
        url
        width
        height
      }
      altText          # 图片alt文本(JSON格式)
      variants {
        thumbnail
        small
        medium
        large
        xlarge
        webp
      }
    }

    # 分类
    category {
      id
      name             # 分类名称(JSON格式)
    }

    # 关联产品数量
    products {
      id
    }

    order
    status
    createdAt
    updatedAt
  }

  # 总数(用于分页)
  productSeriesCount(where: { status: { equals: "PUBLISHED" } })
}
```

**前端使用示例**:
```typescript
// 提取多语言内容
const localizedName = series.name[locale] || series.name['en'] || 'Untitled'
const localizedDesc = series.description[locale] || series.description['en'] || ''

// 计算产品数量
const productCount = series.products.length
```

### 3.2 获取单个产品系列详情(详情页)

```graphql
query GetProductSeriesDetail($slug: String!, $locale: String = "en") {
  productSeries(where: { slug: { equals: $slug } }) {
    id
    slug
    name               # 系列名称(JSON格式)
    description        # 简短描述(JSON格式)

    # 特色图片(包含所有变体尺寸)
    featuredImage {
      id
      filename
      file {
        url
        width
        height
      }
      altText
      cropFocalPoint {
        x # 横向位置 (0-100)，0=最左，50=居中，100=最右
        y # 纵向位置 (0-100)，0=最上，50=居中，100=最下
      }
      variants {
        thumbnail      # 缩略图 150x150
        small          # 小图 400x400
        medium         # 中图 800x800
        large          # 大图 1200x1200
        xlarge         # 超大图 1600x1600
        webp           # WebP格式(更小的文件)
      }
    }

    # 分类
    category {
      id
      name
    }

    # 该系列下的所有产品
    products(
      where: { status: { equals: "PUBLISHED" } }
      orderBy: { order: asc }
    ) {
      id
      sku
      slug
      name
      shortDescription

      # 产品图片
      images(take: 1) {
        id
        filename
        file {
          url
        }
        altText
      }

      # 价格(如果启用)
      price
      compareAtPrice
      inStock
    }

    # 富文本内容翻译(Document Editor格式)
    contentTranslations(where: { locale: { equals: $locale } }) {
      locale
      content          # Document Editor JSON格式
    }

    # SEO信息
    seoTitle
    seoDescription
    seoKeywords

    order
    status
    createdAt
    updatedAt
  }
}
```

**Variables**:
```json
{
  "slug": "glass-standoff",
  "locale": "zh"
}
```

---

## 产品SKU接口

### 4.1 获取产品列表(支持筛选和搜索)

```graphql
query GetProducts(
  $locale: String = "en"
  $status: String = "PUBLISHED"
  $categoryId: ID
  $seriesId: ID
  $search: String
  $take: Int = 20
  $skip: Int = 0
) {
  products(
    where: {
      status: { equals: $status }
      category: { id: { equals: $categoryId } }
      series: { id: { equals: $seriesId } }
      OR: [
        { name: { contains: $search, mode: insensitive } }
        { sku: { contains: $search, mode: insensitive } }
      ]
    }
    take: $take
    skip: $skip
    orderBy: { order: asc }
  ) {
    id
    sku                # 产品编码(如: GDH-001-SS)
    slug               # URL标识
    name               # 产品名称(JSON格式)
    shortDescription   # 短描述(JSON格式)

    # 产品图片(取第一张作为封面)
    images(take: 1) {
      id
      filename
      file {
        url
      }
      altText
    }

    # 分类和系列
    category {
      id
      name
    }
    series {
      id
      slug
      name
    }

    # 价格和库存
    price
    compareAtPrice
    inStock

    # 标签
    tags {
      id
      name
    }

    order
    status
  }

  # 总数(用于分页)
  productsCount(
    where: {
      status: { equals: $status }
      category: { id: { equals: $categoryId } }
      series: { id: { equals: $seriesId } }
    }
  )
}
```

**筛选示例**:
```json
// 按分类筛选
{
  "categoryId": "cat_001",
  "take": 12,
  "skip": 0
}

// 按系列筛选
{
  "seriesId": "series_001",
  "take": 12
}

// 搜索产品
{
  "search": "glass door handle",
  "take": 20
}
```

### 4.2 获取产品详情(详情页)

```graphql
query GetProductDetail($sku: String!, $locale: String = "en") {
  product(where: { sku: { equals: $sku } }) {
    id
    sku
    slug
    name               # 产品名称(JSON格式)
    shortDescription   # 短描述(JSON格式)
    description        # 完整描述(JSON格式)

    # 所有产品图片
    images(orderBy: { order: asc }) {
      id
      filename
      file {
        url
        width
        height
      }
      altText
      variants {
        thumbnail
        small
        medium
        large
        xlarge
        webp
      }
      order
    }

    # 分类和系列
    category {
      id
      name
    }
    series {
      id
      slug
      name
    }

    # 价格和库存
    price
    compareAtPrice
    inStock
    stockQuantity

    # 规格参数(JSON格式)
    specifications

    # 标签
    tags {
      id
      name
    }

    # 富文本内容翻译
    contentTranslations(where: { locale: { equals: $locale } }) {
      locale
      content
    }

    # 同系列的相关产品(排除当前产品)
    series {
      products(
        where: {
          status: { equals: "PUBLISHED" }
          sku: { not: { equals: $sku } }
        }
        take: 4
      ) {
        id
        sku
        slug
        name
        images(take: 1) {
          file {
            url
          }
        }
        price
      }
    }

    # SEO信息
    seoTitle
    seoDescription
    seoKeywords

    status
    createdAt
    updatedAt
  }
}
```

**specifications字段结构示例**:
```json
{
  "en": {
    "Material": "304 Stainless Steel",
    "Finish": "Brushed/Polished",
    "Size": "50mm diameter",
    "Glass Thickness": "8-12mm"
  },
  "zh": {
    "材质": "304不锈钢",
    "表面处理": "拉丝/抛光",
    "尺寸": "直径50mm",
    "玻璃厚度": "8-12mm"
  }
}
```

---

## 博客接口

### 5.1 获取博客列表

```graphql
query GetBlogs(
  $locale: String = "en"
  $status: String = "PUBLISHED"
  $categoryId: ID
  $tagId: ID
  $take: Int = 20
  $skip: Int = 0
) {
  blogs(
    where: {
      status: { equals: $status }
      category: { id: { equals: $categoryId } }
      tags: { some: { id: { equals: $tagId } } }
    }
    orderBy: { publishedAt: desc }
    take: $take
    skip: $skip
  ) {
    id
    slug
    title              # 标题(JSON格式)
    excerpt            # 摘要(JSON格式)

    # 特色图片
    featuredImage {
      id
      filename
      file {
        url
      }
      altText
      variants {
        medium
        webp
      }
    }

    # 分类
    category {
      id
      name
    }

    # 作者
    author {
      id
      name
    }

    # 标签
    tags {
      id
      name
    }

    publishedAt
    readingTime        # 阅读时长(分钟)
    viewCount          # 浏览次数
  }

  # 总数
  blogsCount(where: { status: { equals: $status } })
}
```

### 5.2 获取博客详情

```graphql
query GetBlogDetail($slug: String!, $locale: String = "en") {
  blog(where: { slug: { equals: $slug } }) {
    id
    slug
    title
    excerpt

    # 特色图片
    featuredImage {
      id
      filename
      file {
        url
        width
        height
      }
      altText
      variants {
        medium
        large
        webp
      }
    }

    # 分类
    category {
      id
      name
    }

    # 作者
    author {
      id
      name
      email
    }

    # 标签
    tags {
      id
      name
    }

    # 富文本内容
    contentTranslations(where: { locale: { equals: $locale } }) {
      locale
      content          # Document Editor JSON格式
    }

    # SEO
    seoTitle
    seoDescription
    seoKeywords

    publishedAt
    updatedAt
    readingTime
    viewCount
    status
  }
}
```

---

## 应用案例接口

### 6.1 获取案例列表

```graphql
query GetApplications(
  $locale: String = "en"
  $status: String = "PUBLISHED"
  $take: Int = 20
  $skip: Int = 0
) {
  applications(
    where: { status: { equals: $status } }
    orderBy: { order: asc }
    take: $take
    skip: $skip
  ) {
    id
    title              # 案例标题(JSON格式)

    # 特色图片
    featuredImage {
      id
      filename
      file {
        url
      }
      altText
      variants {
        medium
        webp
      }
    }

    # 分类
    category {
      id
      name
    }

    # 关联产品
    relatedProducts {
      id
      sku
      name
    }

    order
    status
  }

  # 总数
  applicationsCount(where: { status: { equals: $status } })
}
```

### 6.2 获取案例详情

```graphql
query GetApplicationDetail($id: ID!, $locale: String = "en") {
  application(where: { id: $id }) {
    id
    title

    # 特色图片
    featuredImage {
      id
      filename
      file {
        url
        width
        height
      }
      altText
      variants {
        medium
        large
        webp
      }
    }

    # 图片画廊
    gallery {
      id
      filename
      file {
        url
      }
      altText
      variants {
        medium
        webp
      }
    }

    # 分类
    category {
      id
      name
    }

    # 关联产品
    relatedProducts {
      id
      sku
      slug
      name
      images(take: 1) {
        file {
          url
        }
      }
      price
    }

    # 富文本内容
    contentTranslations(where: { locale: { equals: $locale } }) {
      locale
      content
    }

    # SEO
    seoTitle
    seoDescription

    order
    status
    createdAt
    updatedAt
  }
}
```

---

## 媒体库接口

### 7.1 搜索媒体

```graphql
query SearchMedia(
  $categoryId: ID
  $tagIds: [ID!]
  $status: String = "ACTIVE"
  $take: Int = 20
  $skip: Int = 0
) {
  media(
    where: {
      status: { equals: $status }
      category: { id: { equals: $categoryId } }
      tags: { some: { id: { in: $tagIds } } }
    }
    take: $take
    skip: $skip
    orderBy: { createdAt: desc }
  ) {
    id
    filename
    file {
      url
      filesize
      width
      height
    }
    altText            # 图片alt文本(JSON格式)

    cropFocalPoint {
      x # 横向位置 (0-100)，0=最左，50=居中，100=最右
      y # 纵向位置 (0-100)，0=最上，50=居中，100=最下
    }

    # 图片变体(优化过的不同尺寸)
    variants {
      thumbnail
      small
      medium
      large
      xlarge
      webp
    }

    # 分类
    category {
      id
      name
    }

    # 标签
    tags {
      id
      name
    }

    status
    createdAt
  }

  # 总数
  mediaCount(
    where: {
      status: { equals: $status }
      category: { id: { equals: $categoryId } }
      tags: { some: { id: { in: $tagIds } } }
    }
  )
}
```

### 7.2 获取媒体分类(树形结构)

```graphql
query GetMediaCategories {
  mediaCategories(orderBy: { order: asc }) {
    id
    name               # 分类名称(JSON格式)
    slug
    description        # 分类描述(JSON格式)
    icon               # 图标名称
    order

    # 父子关系
    parent {
      id
      name
    }
    children {
      id
      name
      slug
      order
    }

    # 该分类下的媒体数量
    media {
      id
    }
  }
}
```

### 7.3 获取媒体标签

```graphql
query GetMediaTags {
  mediaTags(orderBy: { order: asc }) {
    id
    name               # 标签名称(JSON格式)
    slug
    description        # 标签描述(JSON格式)
    color              # 标签颜色(用于前端显示)
    order

    # 该标签下的媒体数量
    media {
      id
    }
  }
}
```

---

## 表单提交接口

### 8.1 提交联系表单

```graphql
mutation SubmitContactForm($data: ContactFormCreateInput!) {
  createContactForm(data: $data) {
    id
    name
    email
    phone
    company
    message
    source             # 来源: website | landing_page | email
    locale             # 提交时的语言
    status             # 状态: NEW | PENDING | COMPLETED
    createdAt
  }
}
```

**Variables示例**:
```json
{
  "data": {
    "name": "张三",
    "email": "zhang@example.com",
    "phone": "+86 138 0000 0000",
    "company": "ABC公司",
    "message": "我想了解Glass Standoff产品的定制服务",
    "source": "website",
    "locale": "zh"
  }
}
```

**前端完整调用示例**:
```typescript
// components/ContactForm.tsx
import { useState } from 'react'
import { keystoneClient } from '@/lib/keystone-client'
import { gql } from '@apollo/client'

const SUBMIT_CONTACT_FORM = gql`
  mutation SubmitContactForm($data: ContactFormCreateInput!) {
    createContactForm(data: $data) {
      id
      name
      email
      createdAt
    }
  }
`

export function ContactForm() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setLoading(true)

    try {
      const { data, errors } = await keystoneClient.mutate({
        mutation: SUBMIT_CONTACT_FORM,
        variables: {
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            message: formData.message,
            source: 'website',
            locale: 'zh'
          }
        }
      })

      if (errors) {
        console.error('提交失败:', errors)
        alert('提交失败,请稍后重试')
        return
      }

      if (data?.createContactForm) {
        alert('感谢您的留言,我们会尽快回复!')
      }
    } catch (error) {
      console.error('提交错误:', error)
      alert('提交失败,请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
    </form>
  )
}
```

### 8.2 获取表单提交记录(管理员)

```graphql
query GetContactFormSubmissions(
  $status: String
  $take: Int = 50
  $skip: Int = 0
) {
  contactForms(
    where: { status: { equals: $status } }
    orderBy: { createdAt: desc }
    take: $take
    skip: $skip
  ) {
    id
    name
    email
    phone
    company
    message
    source
    locale
    status
    createdAt
    respondedAt
  }

  contactFormsCount(where: { status: { equals: $status } })
}
```

---

## FAQ接口

### 9.1 获取FAQ列表

```graphql
query GetFaqItems {
  faqItems(
    where: { status: { equals: "PUBLISHED" } }
    orderBy: { order: asc }
  ) {
    id
    question           # 问题(JSON格式)
    answer             # 答案(JSON格式)

    # 分类
    category {
      id
      name
    }

    order
  }
}
```

**前端使用示例**:
```typescript
// 按分类分组FAQ
const faqsByCategory = faqItems.reduce((acc, faq) => {
  const categoryName = faq.category.name[locale] || faq.category.name['en']
  if (!acc[categoryName]) {
    acc[categoryName] = []
  }
  acc[categoryName].push({
    question: faq.question[locale] || faq.question['en'],
    answer: faq.answer[locale] || faq.answer['en']
  })
  return acc
}, {})
```

---

## 站点配置接口

### 10.1 获取站点配置

```graphql
query GetSiteConfig {
  siteConfigs(take: 1) {
    id
    siteName           # 站点名称(JSON格式)
    siteUrl            # 站点URL
    defaultLocale      # 默认语言
    supportedLocales   # 支持的语言列表(数组)

    # 联系信息
    contactEmail
    contactPhone

    # 社交媒体(JSON格式)
    socialMedia

    # 营业时间(JSON格式)
    businessHours

    # 地址(JSON格式)
    address

    # 设置
    maintenanceMode    # 维护模式开关

    createdAt
    updatedAt
  }
}
```

**socialMedia字段结构**:
```json
{
  "facebook": "https://facebook.com/busrom",
  "linkedin": "https://linkedin.com/company/busrom",
  "instagram": "https://instagram.com/busrom",
  "youtube": "https://youtube.com/@busrom"
}
```

---

## SEO相关接口

### 11.1 获取SEO设置

```graphql
query GetSeoSettings($page: String, $locale: String = "en") {
  seoSettings(
    where: {
      page: { equals: $page }
      locale: { equals: $locale }
    }
    take: 1
  ) {
    id
    page               # 页面标识(如: home, product, blog)
    locale
    title              # SEO标题
    description        # SEO描述
    keywords           # SEO关键词

    # Open Graph图片
    ogImage {
      file {
        url
      }
    }

    noIndex            # 是否禁止索引
    noFollow           # 是否禁止跟踪链接
    canonicalUrl       # 规范URL
  }
}
```

**前端使用示例**:
```typescript
// app/[locale]/page.tsx
import { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale } = params

  const seoData = await fetchSeoSettings('home', locale)

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      images: [seoData.ogImage?.file?.url],
    }
  }
}
```

### 11.2 获取Sitemap数据

```graphql
query GetSitemapData {
  # 所有产品系列
  productSeries(where: { status: { equals: "PUBLISHED" } }) {
    slug
    updatedAt
  }

  # 所有产品
  products(where: { status: { equals: "PUBLISHED" } }) {
    sku
    updatedAt
  }

  # 所有博客
  blogs(where: { status: { equals: "PUBLISHED" } }) {
    slug
    updatedAt
  }

  # 所有案例
  applications(where: { status: { equals: "PUBLISHED" } }) {
    id
    updatedAt
  }
}
```

**前端实现示例**:
```typescript
// app/sitemap.xml/route.ts
import { getAllSitemapUrls, generateSitemapXML } from '@/lib/api/sitemap'

export async function GET() {
  const urls = await getAllSitemapUrls()
  const xml = generateSitemapXML(urls, 'https://busrom.com')

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400', // 缓存24小时
    }
  })
}
```

---

## 多语言内容处理

### JSON格式多语言字段

所有标记为"JSON格式"的字段都采用以下结构:

```json
{
  "en": "English text",
  "zh": "中文文本",
  "es": "Texto en español",
  "fr": "Texte français",
  "de": "Deutscher Text",
  "ja": "日本語テキスト",
  "ko": "한국어 텍스트",
  "ar": "نص عربي",
  "ru": "Русский текст",
  "pt": "Texto em português"
  // ... 共24种语言
}
```

### 前端提取多语言内容

```typescript
// utils/localization.ts

/**
 * 从JSON多语言字段中提取指定语言的内容
 * @param field - 多语言JSON对象
 * @param locale - 语言代码
 * @param fallback - 备用文本
 */
export function getLocalizedContent(
  field: Record<string, string> | null | undefined,
  locale: string,
  fallback: string = ''
): string {
  if (!field || typeof field !== 'object') {
    return fallback
  }

  // 1. 尝试获取指定语言
  if (field[locale]) {
    return field[locale]
  }

  // 2. 回退到英语
  if (field['en']) {
    return field['en']
  }

  // 3. 返回第一个可用的值
  const values = Object.values(field)
  if (values.length > 0) {
    return values[0]
  }

  // 4. 返回备用文本
  return fallback
}

// 使用示例
const productName = getLocalizedContent(product.name, 'zh', '未命名产品')
```

### Document Editor富文本内容

富文本内容使用关联表存储,通过`contentTranslations`字段查询:

```typescript
// 获取富文本内容
const contentTranslation = item.contentTranslations.find(
  t => t.locale === locale
)

if (contentTranslation) {
  const documentContent = contentTranslation.content
  // documentContent是Document Editor的JSON格式
  // 需要使用Keystone的DocumentRenderer组件渲染
}
```

**Document Editor渲染示例**:
```typescript
import { DocumentRenderer } from '@keystone-6/document-renderer'

// 组件中
<DocumentRenderer document={contentTranslation.content} />
```

---

## 前端集成示例

### Next.js App Router集成

```typescript
// app/[locale]/product/[slug]/page.tsx
import { keystoneClient } from '@/lib/keystone-client'
import { gql } from '@apollo/client'
import { getLocalizedContent } from '@/utils/localization'

const GET_PRODUCT_SERIES = gql`
  query GetProductSeriesDetail($slug: String!, $locale: String!) {
    productSeries(where: { slug: { equals: $slug } }) {
      id
      slug
      name
      description
      featuredImage {
        file { url }
        variants { medium webp }
      }
      products {
        id
        sku
        name
        images(take: 1) {
          file { url }
        }
      }
      contentTranslations(where: { locale: { equals: $locale } }) {
        content
      }
    }
  }
`

export default async function ProductSeriesPage({ params }) {
  const { slug, locale } = params

  // 查询数据
  const { data } = await keystoneClient.query({
    query: GET_PRODUCT_SERIES,
    variables: { slug, locale }
  })

  const series = data?.productSeries

  if (!series) {
    notFound()
  }

  // 提取多语言内容
  const name = getLocalizedContent(series.name, locale)
  const description = getLocalizedContent(series.description, locale)

  return (
    <div>
      <h1>{name}</h1>
      <p>{description}</p>

      {/* 渲染富文本内容 */}
      {series.contentTranslations[0] && (
        <DocumentRenderer
          document={series.contentTranslations[0].content}
        />
      )}

      {/* 产品列表 */}
      <div className="grid grid-cols-3 gap-4">
        {series.products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            locale={locale}
          />
        ))}
      </div>
    </div>
  )
}
```

### 分页查询示例

```typescript
// hooks/useProducts.ts
import { useState, useEffect } from 'react'
import { keystoneClient } from '@/lib/keystone-client'
import { gql } from '@apollo/client'

const GET_PRODUCTS = gql`
  query GetProducts($take: Int!, $skip: Int!) {
    products(
      where: { status: { equals: "PUBLISHED" } }
      take: $take
      skip: $skip
      orderBy: { order: asc }
    ) {
      id
      sku
      name
      images(take: 1) {
        file { url }
      }
    }
    productsCount(where: { status: { equals: "PUBLISHED" } })
  }
`

export function useProducts(page: number = 1, pageSize: number = 12) {
  const [products, setProducts] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)

      const { data } = await keystoneClient.query({
        query: GET_PRODUCTS,
        variables: {
          take: pageSize,
          skip: (page - 1) * pageSize
        }
      })

      setProducts(data?.products || [])
      setTotalCount(data?.productsCount || 0)
      setLoading(false)
    }

    fetchProducts()
  }, [page, pageSize])

  const totalPages = Math.ceil(totalCount / pageSize)

  return { products, totalCount, totalPages, loading }
}
```

### 错误处理

```typescript
// lib/keystone-client.ts
import { ApolloError } from '@apollo/client'

export async function safeQuery<T>(
  query: any,
  variables?: any
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, errors } = await keystoneClient.query({
      query,
      variables
    })

    if (errors && errors.length > 0) {
      console.error('GraphQL Errors:', errors)
      return {
        data: null,
        error: errors[0].message
      }
    }

    return { data, error: null }
  } catch (error) {
    if (error instanceof ApolloError) {
      console.error('Apollo Error:', error.message)
      return {
        data: null,
        error: error.message
      }
    }

    console.error('Unknown Error:', error)
    return {
      data: null,
      error: '查询失败,请稍后重试'
    }
  }
}

// 使用示例
const { data, error } = await safeQuery(GET_PRODUCTS, { take: 12 })

if (error) {
  return <ErrorMessage message={error} />
}

if (!data) {
  return <EmptyState />
}
```

---

## 性能优化建议

### 1. 使用图片变体

始终使用合适尺寸的图片变体,而不是原始图片:

```typescript
// ❌ 不推荐: 使用原始图片
<img src={image.file.url} />

// ✅ 推荐: 使用优化过的变体
<img src={image.variants.medium || image.file.url} />

// ✅ 最佳: 使用WebP格式(更小的文件)
<img
  src={image.variants.webp || image.variants.medium}
  loading="lazy"
/>
```

### 2. 限制查询字段

只查询需要的字段,避免过度查询:

```graphql
# ❌ 不推荐: 查询所有变体
images {
  variants {
    thumbnail
    small
    medium
    large
    xlarge
    webp
  }
}

# ✅ 推荐: 只查询需要的变体
images {
  variants {
    medium
    webp
  }
}
```

### 3. 使用分页

大列表务必使用分页:

```graphql
products(take: 20, skip: 0) { ... }
```

### 4. 缓存策略

```typescript
// Next.js App Router - 静态生成
export const revalidate = 3600 // 1小时重新验证

// Next.js App Router - 动态路由
export async function generateStaticParams() {
  const { data } = await keystoneClient.query({
    query: GET_ALL_PRODUCT_SLUGS
  })

  return data.productSeries.map((series) => ({
    slug: series.slug
  }))
}
```

---

## 常见问题

### Q: 如何处理图片加载失败?

```typescript
<img
  src={image.variants.medium}
  onError={(e) => {
    e.currentTarget.src = '/images/placeholder.jpg'
  }}
  alt={getLocalizedContent(image.altText, locale)}
/>
```

### Q: 如何实现搜索功能?

```graphql
query SearchProducts($search: String!) {
  products(
    where: {
      OR: [
        { name: { contains: $search, mode: insensitive } }
        { sku: { contains: $search, mode: insensitive } }
        { description: { contains: $search, mode: insensitive } }
      ]
    }
  ) {
    id
    sku
    name
  }
}
```

### Q: 如何处理GraphQL错误?

参考上面的"错误处理"章节,使用`safeQuery`包装器。

---

## 技术支持

- **GraphQL Playground**: http://localhost:3000/api/graphql
- **文档**: https://docs.busrom.com/api
- **问题反馈**: api-support@busrom.com

---

**文档维护**: 后端开发团队
**最后更新**: 2025-11-06
