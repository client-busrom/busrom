# 02 API接口规范

**文档版本**: v2.0
**技术栈**: Keystone 6 GraphQL API
**最后更新**: 2025-11-04

---

## 文档导航

- [01-数据模型与架构](./01-数据模型与架构.md)
- **当前文档**: 02-API接口规范
- [03-CMS后台功能](./03-CMS后台功能.md)
- [04-安全与性能](./04-安全与性能.md)
- [05-部署与验收](./05-部署与验收.md)

---

## 🔌 完整API接口规范

### 通用接口规范

**基础URL**: `https://api.busrom.com/api/graphql`

**认证方式**:
- 公开接口:无需认证
- 管理接口:需要JWT Token(通过Keystone Session)

**响应格式**:
```json
{
  "data": { ... },
  "errors": [ ... ]
}
```

---

### 1. 首页数据接口

**Endpoint**: `POST /api/graphql`

**Query**:
```graphql
query GetHomeData {
  # Hero Banner
  homeContent(where: { section: "hero_banner" }) {
    content
    enabled
  }

  # 产品系列轮播
  productSeries(
    where: { featured: { equals: true } },
    orderBy: { order: asc },
    take: 8
  ) {
    id
    slug
    name
    description
    coverImage {
      url
      altText
      width
      height
    }
  }

  # 精选产品
  products(
    where: { featured: { equals: true } },
    take: 12
  ) {
    id
    sku
    name
    images(take: 1) {
      url
      altText
    }
    series {
      name
    }
    specifications
  }

  # 精选案例
  applications(
    where: { featured: { equals: true } },
    take: 6
  ) {
    id
    slug
    name
    mainImage {
      url
      altText
    }
    summary
  }

  # 服务特点
  homeContent(where: { section: "service_features" }) {
    content
  }

  # 品牌优势
  homeContent(where: { section: "brand_advantages" }) {
    content
  }
}
```

**响应示例**:
```json
{
  "data": {
    "homeContent": {
      "content": "{\"title\":\"Why Choose Busrom\",...}",
      "enabled": true
    },
    "productSeries": [
      {
        "id": "clxxx",
        "slug": "glass-standoff",
        "name": "Glass Standoff",
        "description": "Premium stainless steel glass standoffs",
        "coverImage": {
          "url": "https://cdn.busrom.com/uploads/glass-standoff.jpg",
          "altText": "Glass Standoff Series",
          "width": 1200,
          "height": 800
        }
      }
    ],
    "products": [...],
    "applications": [...]
  }
}
```

---

### 2. 产品系列接口

**2.1 获取所有产品系列**

**Query**:
```graphql
query GetProductSeries($skip: Int, $take: Int) {
  productSeries(
    skip: $skip,
    take: $take,
    orderBy: { order: asc }
  ) {
    id
    slug
    name
    description
    coverImage {
      url
      altText
    }
    productCount
  }

  productSeriesCount
}
```

**2.2 获取单个产品系列详情**

**Query**:
```graphql
query GetProductSeriesDetail($slug: String!) {
  productSeries(where: { slug: $slug }) {
    id
    name
    description
    detailedDescription
    coverImage {
      url
      altText
    }
    gallery {
      url
      altText
    }
    features
    applications
    specifications

    # 关联产品
    products(orderBy: { order: asc }) {
      id
      sku
      name
      images(take: 1) {
        url
        altText
      }
      specifications
    }

    # SEO
    seoSetting {
      title
      description
      keywords
      ogImage { url }
    }
  }
}
```

---

### 3. 产品(SKU)接口

**3.1 获取产品列表(支持筛选)**

**Query**:
```graphql
query GetProducts(
  $skip: Int,
  $take: Int,
  $category: ID,
  $series: ID,
  $search: String
) {
  products(
    skip: $skip,
    take: $take,
    where: {
      AND: [
        { category: { id: { equals: $category } } },
        { series: { id: { equals: $series } } },
        {
          OR: [
            { name: { contains: $search, mode: insensitive } },
            { sku: { contains: $search, mode: insensitive } }
          ]
        }
      ]
    },
    orderBy: { order: asc }
  ) {
    id
    sku
    name
    images(take: 1) {
      url
      altText
    }
    category {
      name
    }
    series {
      name
    }
    specifications
    featured
  }

  productsCount(where: { ... })
}
```

**3.2 获取产品详情**

**Query**:
```graphql
query GetProductDetail($sku: String!) {
  product(where: { sku: $sku }) {
    id
    sku
    name
    description
    detailedDescription

    images {
      url
      altText
      width
      height
    }

    category {
      id
      name
      slug
    }

    series {
      id
      name
      slug
    }

    specifications
    features
    dimensions
    materials
    finishes

    # 关联案例
    relatedApplications {
      id
      slug
      name
      mainImage {
        url
        altText
      }
    }

    # 推荐产品
    relatedProducts(take: 4) {
      id
      sku
      name
      images(take: 1) {
        url
      }
    }

    # SEO
    seoSetting {
      title
      description
      keywords
      schemaData
    }
  }
}
```

---

### 4. 博客接口

**4.1 获取博客列表**

**Query**:
```graphql
query GetBlogs(
  $skip: Int,
  $take: Int,
  $category: ID,
  $tag: String
) {
  blogs(
    skip: $skip,
    take: $take,
    where: {
      status: { equals: "published" },
      category: { id: { equals: $category } },
      tags: { some: { name: { equals: $tag } } }
    },
    orderBy: { publishedAt: desc }
  ) {
    id
    slug
    title
    summary
    coverImage {
      url
      altText
    }
    author {
      name
      avatar { url }
    }
    publishedAt
    category {
      name
      slug
    }
    tags {
      name
    }
    readTime
  }

  blogsCount(where: { status: { equals: "published" } })
}
```

**4.2 获取博客详情**

**Query**:
```graphql
query GetBlogDetail($slug: String!) {
  blog(where: { slug: $slug }) {
    id
    slug
    title
    summary
    content
    coverImage {
      url
      altText
    }
    author {
      name
      avatar { url }
      bio
    }
    publishedAt
    updatedAt
    category {
      name
      slug
    }
    tags {
      name
    }
    readTime

    # SEO
    seoSetting {
      title
      description
      keywords
      ogImage { url }
      schemaData
    }

    # 相关文章
    relatedBlogs(take: 3) {
      id
      slug
      title
      coverImage { url }
      publishedAt
    }
  }
}
```

---

### 5. 应用案例接口

**5.1 获取案例列表**

**Query**:
```graphql
query GetApplications($skip: Int, $take: Int) {
  applications(
    skip: $skip,
    take: $take,
    where: { status: { equals: "published" } },
    orderBy: { publishedAt: desc }
  ) {
    id
    slug
    name
    summary
    mainImage {
      url
      altText
    }
    client
    industry
    publishedAt
  }

  applicationsCount(where: { status: { equals: "published" } })
}
```

**5.2 获取案例详情**

**Query**:
```graphql
query GetApplicationDetail($slug: String!) {
  application(where: { slug: $slug }) {
    id
    slug
    name
    summary

    # 案例主图
    mainImage {
      url
      altText
      width
      height
    }

    # 案例图库
    gallery {
      url
      altText
    }

    # 案例详情(支持动态字段)
    client
    industry
    projectDate
    location

    # 可选字段
    background
    challenge
    solution
    result
    testimonial

    # 使用的产品
    productsUsed {
      id
      sku
      name
      images(take: 1) {
        url
      }
    }

    publishedAt

    # SEO
    seoSetting {
      title
      description
      schemaData
    }
  }
}
```

---

### 6. FAQ接口

**Query**:
```graphql
query GetFaqs {
  faqItems(
    where: { published: { equals: true } },
    orderBy: { order: asc }
  ) {
    id
    category {
      name
    }
    question
    answer
    order
  }

  # 按分类分组
  categories {
    name
    faqs(where: { published: { equals: true } }) {
      id
      question
      answer
    }
  }
}
```

---

### 7. 表单提交接口

**7.1 提交联系表单**

**Mutation**:
```graphql
mutation SubmitContactForm($data: ContactFormCreateInput!) {
  createContactForm(data: $data) {
    id
    name
    email
    submittedAt
  }
}
```

**Variables**:
```json
{
  "data": {
    "name": "张三",
    "email": "zhang@example.com",
    "whatsapp": "+86 138 0000 0000",
    "companyName": "ABC公司",
    "message": "我想了解Glass Standoff产品的定制服务",
    "relatedProduct": {
      "connect": { "id": "clxxx" }
    },
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**前端调用示例**:
```typescript
// components/ContactForm.tsx
const handleSubmit = async (formData) => {
  try {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation SubmitContactForm($data: ContactFormCreateInput!) {
            createContactForm(data: $data) {
              id
              name
              submittedAt
            }
          }
        `,
        variables: {
          data: {
            name: formData.name,
            email: formData.email,
            whatsapp: formData.whatsapp,
            companyName: formData.companyName,
            message: formData.message,
            ipAddress: await getClientIP(),
            userAgent: navigator.userAgent
          }
        }
      })
    });

    const result = await response.json();

    if (result.data?.createContactForm) {
      toast.success('感谢您的留言,我们会尽快回复!');
    }
  } catch (error) {
    toast.error('提交失败,请稍后重试');
  }
};
```

**7.2 后台查询表单**

**Query**:
```graphql
query GetContactForms(
  $skip: Int,
  $take: Int,
  $status: String
) {
  contactForms(
    skip: $skip,
    take: $take,
    where: { status: { equals: $status } },
    orderBy: { submittedAt: desc }
  ) {
    id
    name
    email
    whatsapp
    companyName
    message
    relatedProduct {
      sku
      name
    }
    submittedAt
    status
    ipAddress
    emailSent
  }

  contactFormsCount(where: { status: { equals: $status } })
}
```

---

### 8. 站点配置接口

**Query**:
```graphql
query GetSiteConfig {
  siteConfig {
    siteName
    companyName
    logo {
      url
      altText
    }
    favicon {
      url
    }
    email
    phone
    whatsapp
    address
    facebookUrl
    linkedinUrl
    instagramUrl
    googleAnalyticsId
    enableCaptcha
    recaptchaSiteKey
  }
}
```

---

### 9. 导航菜单接口

**Query**:
```graphql
query GetNavigation($position: String!) {
  navigationMenus(
    where: {
      position: { equals: $position },
      enabled: { equals: true },
      parentMenu: { equals: null }
    },
    orderBy: { order: asc }
  ) {
    id
    label
    url
    icon
    openInNewTab
    childMenus(orderBy: { order: asc }) {
      id
      label
      url
      icon
    }
  }
}
```

---

### 10. SEO相关接口

**10.1 获取Sitemap数据**

**Query**:
```graphql
query GetSitemapData {
  # 所有产品系列
  productSeries(where: { status: { equals: "published" } }) {
    slug
    updatedAt
  }

  # 所有产品
  products(where: { status: { equals: "published" } }) {
    sku
    updatedAt
  }

  # 所有博客
  blogs(where: { status: { equals: "published" } }) {
    slug
    updatedAt
  }

  # 所有案例
  applications(where: { status: { equals: "published" } }) {
    slug
    updatedAt
  }
}
```

**后端实现**:
```typescript
// app/sitemap.xml/route.ts
export async function GET() {
  const data = await fetchSitemapData();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${data.productSeries.map(s => `
    <url>
      <loc>https://busrom.com/product/${s.slug}</loc>
      <lastmod>${s.updatedAt}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('')}

  ${data.products.map(p => `
    <url>
      <loc>https://busrom.com/shop/${p.sku}</loc>
      <lastmod>${p.updatedAt}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>
  `).join('')}

  ${data.blogs.map(b => `
    <url>
      <loc>https://busrom.com/blog/${b.slug}</loc>
      <lastmod>${b.updatedAt}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `).join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400', // 缓存24小时
    }
  });
}
```

**10.2 IndexNow推送接口**

**实现逻辑**:
```typescript
// lib/indexnow.ts
export async function submitToIndexNow(urls: string[]) {
  const siteConfig = await getSiteConfig();

  if (!siteConfig.enableIndexNow || !siteConfig.indexNowKey) {
    return;
  }

  // 提交到Bing IndexNow
  await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'busrom.com',
      key: siteConfig.indexNowKey,
      keyLocation: `https://busrom.com/${siteConfig.indexNowKey}.txt`,
      urlList: urls
    })
  });
}

// Keystone Hook中调用
export const Product = list({
  hooks: {
    afterOperation: async ({ operation, item }) => {
      if (operation === 'create' || operation === 'update') {
        await submitToIndexNow([
          `https://busrom.com/shop/${item.sku}`
        ]);
      }
    }
  }
});
```

---

## 下一步

API接口已经定义完成,接下来了解CMS后台功能:
- [03-CMS后台功能](./03-CMS后台功能.md) - 学习如何使用后台管理这些数据

---

**文档维护**: 开发团队
**最后审核**: 2025-11-04
