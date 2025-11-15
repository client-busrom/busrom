# SEO 和 Script 路径匹配指南

## 概述

`SeoSetting` 和 `CustomScript` 模型支持多种灵活的页面匹配方式，现在已完全兼容新的 `Page` 模型（支持通过 `path` 匹配）。

## 匹配方式

### 1. Global (全局)
适用于所有页面

```typescript
// 示例：全局 Google Analytics
{
  scope: 'global',
  name: 'Google Analytics',
  // 将在所有页面加载
}
```

### 2. Page Type (页面类型)
通过预定义的页面类型匹配

```typescript
// 示例：首页 SEO
{
  scope: 'page_type',
  pageType: 'home',
  title: { en: 'Welcome to Busrom', zh: '欢迎来到Busrom' }
}

// 示例：产品列表页
{
  scope: 'page_type',
  pageType: 'shop_list',
  sitemapPriority: '0.8'
}
```

**预定义页面类型**:
- `home` - 首页
- `product_series_list` - 产品系列列表
- `product_series_detail` - 产品系列详情
- `shop_list` - 商店列表
- `shop_detail` - 商品详情
- `blog_list` - 博客列表
- `blog_detail` - 博客详情
- `application_list` - 案例列表
- `application_detail` - 案例详情
- `service_overview` - 服务总览
- `service_one_stop` - 一站式服务
- `service_faq` - FAQ
- `about_story` - 我们的故事
- `about_support` - 支持页面
- `contact` - 联系我们
- `privacy_policy` - 隐私政策
- `fraud_notice` - 欺诈警告
- `custom` - 自定义（需填写 customPageRule）

### 3. Exact Path (精确路径) ⭐ 推荐用于 Page
通过完整 URL 路径精确匹配

```typescript
// 示例：为特定页面配置 SEO
{
  scope: 'exact_path',
  exactPath: '/service/one-stop-shop',  // 必须与 Page.path 完全一致
  title: { en: 'One-Stop Shop', zh: '一站式服务' },
  sitemapPriority: '0.8'
}

// 示例：为落地页添加特定脚本
{
  scope: 'exact_path',
  exactPath: '/promotions/summer-sale-2024',
  name: 'Facebook Pixel - Summer Campaign',
  content: '<script>...</script>'
}
```

### 4. Path Pattern (路径模式) - 支持通配符
使用通配符匹配一组路径

```typescript
// 示例：所有促销页面
{
  scope: 'path_pattern',
  pathPattern: '/promotions/*',
  // 匹配: /promotions/summer-sale, /promotions/black-friday, etc.
}

// 示例：所有服务相关页面
{
  scope: 'path_pattern',
  pathPattern: '/service/*',
  // 匹配: /service/one-stop-shop, /service/faq, /service/oem-odm, etc.
}

// 示例：商店所有产品详情页
{
  scope: 'path_pattern',
  pathPattern: '/shop/*',
  // 匹配: /shop/product-1, /shop/product-2, etc.
}
```

### 5. Related Content (关联内容) ⭐ NEW
直接关联到特定内容记录

```typescript
// 示例：为特定 Page 配置 SEO
{
  scope: 'related_content',
  relatedPage: <选择 Page 记录>,
  // 通过下拉选择，显示 path 作为标签
  title: { en: 'One-Stop Shop', zh: '一站式服务' }
}

// 示例：为特定产品配置 SEO
{
  scope: 'related_content',
  relatedProduct: <选择 Product>,
  title: { en: 'Product Name - Busrom', zh: '产品名称 - Busrom' }
}

// 示例：为特定博客文章配置
{
  scope: 'related_content',
  relatedBlog: <选择 Blog>,
  // ...
}
```

## 实际应用示例

### 为 Page 模型配置 SEO 和 Script

#### 方式 A: 使用 Exact Path（推荐）

```typescript
// CMS 中创建 Page
Page {
  slug: "one-stop-shop",
  path: "/service/one-stop-shop",  // ← 关键
  pageType: "TEMPLATE",
  template: "ONE_STOP_SHOP"
}

// 配置 SEO
SeoSetting {
  scope: "exact_path",
  exactPath: "/service/one-stop-shop",  // ← 与 Page.path 完全一致
  title: { en: "One-Stop Shop - Busrom", zh: "一站式服务 - Busrom" },
  description: { en: "Complete solutions...", zh: "完整解决方案..." },
  sitemapPriority: "0.8",
  robotsIndex: true
}

// 添加特定脚本
CustomScript {
  scope: "exact_path",
  exactPath: "/service/one-stop-shop",
  name: "Service Page Tracking",
  content: "<script>/* tracking code */</script>"
}
```

#### 方式 B: 使用 Related Content（更直观）

```typescript
// 配置 SEO - 通过关联
SeoSetting {
  scope: "related_content",
  relatedPage: <选择 "/service/one-stop-shop">,  // 下拉选择，显示 path
  title: { en: "One-Stop Shop - Busrom", zh: "一站式服务 - Busrom" },
  // ...
}

// 添加脚本 - 通过关联
CustomScript {
  scope: "related_content",
  relatedPage: <选择 "/service/one-stop-shop">,
  name: "Service Page Tracking",
  // ...
}
```

#### 方式 C: 使用 Path Pattern（批量匹配）

```typescript
// 所有服务页面使用相同配置
SeoSetting {
  scope: "path_pattern",
  pathPattern: "/service/*",  // 匹配所有 /service/* 路径
  // 适用于: /service, /service/one-stop-shop, /service/faq, etc.
  sitemapPriority: "0.8"
}

CustomScript {
  scope: "path_pattern",
  pathPattern: "/service/*",
  name: "Service Section Tracking",
  // ...
}
```

### 不同类型页面的最佳实践

#### 固定模板页（TEMPLATE）

```typescript
// Page 配置
{
  slug: "faq",
  path: "/service/faq",
  pageType: "TEMPLATE",
  template: "FAQ",
  isSystem: true
}

// SEO 配置（推荐：Exact Path）
SeoSetting {
  scope: "exact_path",
  exactPath: "/service/faq",
  title: { en: "FAQ - Busrom", zh: "常见问题 - Busrom" },
  sitemapPriority: "0.6",
  schemaType: "FAQPage"
}
```

#### 自由落地页（FREEFORM）

```typescript
// Page 配置
{
  slug: "summer-sale-2024",
  path: "/promotions/summer-sale-2024",
  pageType: "FREEFORM"
}

// SEO 配置（推荐：Related Content 或 Exact Path）
SeoSetting {
  scope: "exact_path",
  exactPath: "/promotions/summer-sale-2024",
  title: { en: "Summer Sale 2024", zh: "2024夏季促销" },
  sitemapPriority: "0.4"
}

// 活动追踪脚本
CustomScript {
  scope: "exact_path",
  exactPath: "/promotions/summer-sale-2024",
  name: "Summer Campaign Pixel",
  content: "<script>/* conversion tracking */</script>"
}
```

## 前端匹配逻辑

### 获取当前页面的 SEO 配置

```typescript
// lib/api/seo.ts
export async function getSeoForPage(path: string) {
  // 1. 首先查找精确路径匹配
  const exactMatch = await findSeoByExactPath(path)
  if (exactMatch) return exactMatch

  // 2. 查找路径模式匹配
  const patternMatch = await findSeoByPattern(path)
  if (patternMatch) return patternMatch

  // 3. 查找页面类型匹配
  const pageTypeMatch = await findSeoByPageType(path)
  if (pageTypeMatch) return pageTypeMatch

  // 4. 查找关联内容匹配
  const relatedMatch = await findSeoByRelatedPage(path)
  if (relatedMatch) return relatedMatch

  // 5. 返回全局配置
  return await findGlobalSeo()
}

// 精确匹配
async function findSeoByExactPath(path: string) {
  return await query({
    seoSettings(where: {
      scope: { equals: "exact_path" },
      exactPath: { equals: path }
    }) {
      ...seoFields
    }
  })
}

// 模式匹配
async function findSeoByPattern(path: string) {
  const allPatterns = await query({
    seoSettings(where: { scope: { equals: "path_pattern" } }) {
      pathPattern
      ...seoFields
    }
  })

  return allPatterns.find(setting => {
    const regex = new RegExp(
      '^' + setting.pathPattern.replace(/\*/g, '.*') + '$'
    )
    return regex.test(path)
  })
}

// 关联页面匹配
async function findSeoByRelatedPage(path: string) {
  return await query({
    seoSettings(where: {
      scope: { equals: "related_content" },
      relatedPage: {
        path: { equals: path }
      }
    }) {
      ...seoFields
    }
  })
}
```

### 获取当前页面的 Scripts

```typescript
// lib/api/scripts.ts
export async function getScriptsForPage(path: string) {
  const scripts = await query({
    customScripts(where: {
      enabled: { equals: true },
      OR: [
        { scope: { equals: "global" } },
        { scope: { equals: "exact_path" }, exactPath: { equals: path } },
        { scope: { equals: "related_content" }, relatedPage: { path: { equals: path } } }
      ]
    }) {
      name
      content
      scriptPosition
      priority
    }
  })

  // 还需要手动匹配 path_pattern
  const patternScripts = await getPatternScripts(path)

  return [...scripts, ...patternScripts]
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
}
```

## 优先级规则

当多个配置匹配同一页面时，按以下优先级应用：

1. **Related Content** (关联内容) - 最高优先级
2. **Exact Path** (精确路径)
3. **Path Pattern** (路径模式)
4. **Page Type** (页面类型)
5. **Global** (全局) - 最低优先级

## 最佳实践

### SEO 配置
- ✅ 固定模板页使用 **Exact Path** 或 **Related Content**
- ✅ 自由落地页使用 **Exact Path** 或 **Related Content**
- ✅ 批量配置使用 **Path Pattern**
- ✅ 默认配置使用 **Page Type** 或 **Global**

### Script 配置
- ✅ 全站追踪（GA, GTM）使用 **Global**
- ✅ 特定页面转化追踪使用 **Exact Path** 或 **Related Content**
- ✅ 活动页面像素使用 **Exact Path**
- ✅ 某类页面追踪使用 **Path Pattern**

### 路径格式
- ✅ 所有 path 必须以 `/` 开头
- ✅ 使用小写字母
- ✅ 使用 `-` 连接单词
- ✅ Exact Path 必须与 Page.path 完全一致
- ✅ Path Pattern 使用 `*` 作为通配符

## 迁移指南

如果你之前使用 `LandingPage` 或 `TemplateBasedPage`，现在统一使用 `Page`：

```typescript
// 旧配置 (不再适用)
SeoSetting {
  scope: "exact_path",
  exactPath: "/service-overview"  // ❌ 旧格式
}

// 新配置
SeoSetting {
  scope: "exact_path",
  exactPath: "/service"  // ✅ 新格式（与 Page.path 一致）
}

// 或使用关联方式（更推荐）
SeoSetting {
  scope: "related_content",
  relatedPage: <选择 Page>  // ✅ 直接选择
}
```
