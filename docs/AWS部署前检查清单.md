# AWS 部署前检查清单

> **文档版本**: v1.0
> **生成日期**: 2025-11-15
> **适用项目**: Busrom 企业官网 (Next.js 15 + Keystone 6)
> **文档目的**: 确保生产环境部署前所有必要功能已实现,避免上线后频繁修改

---

## 📊 项目现状总览

### 技术栈
- **前端**: Next.js 15.0.3 + React 19 + TypeScript 5.6 + Tailwind CSS 3.4
- **后端 CMS**: Keystone 6.3.1 + PostgreSQL 15 + Prisma 5.22
- **存储**: AWS S3 (生产) / MinIO (开发) + CloudFront CDN
- **国际化**: next-intl (配置 24 语言,实现 2 语言: en, zh)
- **API**: GraphQL (Keystone) + REST 转换层 (Next.js API Routes)

### 项目结构
```
busrom-work/
├── cms/                  # Keystone CMS 后端 (端口 3000)
├── web/                  # Next.js 前端 (端口 3001)
├── docs/                 # 项目文档 (50+ 个 md 文件)
└── docker-compose.yml    # PostgreSQL + MinIO + Nginx
```

### 完成度评估

| 模块 | 完成度 | 状态 | 说明 |
|-----|--------|------|------|
| **后端 CMS** | 80-85% | ⭐⭐⭐⭐ | 数据模型完整,核心功能已实现 |
| **前端页面** | 15-20% | ⭐ | 仅首页完整,核心页面缺失 |
| **API 层** | 40% | ⭐⭐ | 部分端点已实现,需补充 6+ 端点 |
| **国际化** | 30% | ⭐⭐ | 仅 en/zh 完整,其他 22 语言未实现 |
| **SEO 优化** | 25% | ⭐⭐ | Sitemap/Robots 已实现,缺 JSON-LD |
| **文档** | 70% | ⭐⭐⭐ | 架构文档完善,部分超前实现 |

**总体评估**: 项目架构合理,后端基础扎实,但**前端需要大量投入**完成核心功能

---

## 🎯 一、必须完成的核心页面 (P0 优先级)

### 1.1 产品系统页面

#### 📋 清单

| 页面 | 路由 | 当前状态 | 导航菜单引用 | 优先级 | 工作量 |
|-----|------|---------|-------------|--------|--------|
| **产品系列列表页** | `/[locale]/products` | ❌ 未实现 | ✅ Product 菜单 | **P0** | 3-5天 |
| **产品系列详情页** | `/[locale]/products/[slug]` | ❌ 未实现 | ✅ 系列子菜单 (9个) | **P0** | 5-7天 |
| **产品列表页 (Shop)** | `/[locale]/shop` | ⚠️ 仅框架 | ✅ Shop 菜单 | **P0** | 5-7天 |
| **产品详情页** | `/[locale]/shop/[slug]` | ⚠️ 仅路由 | ✅ 产品卡片链接 | **P0** | 7-10天 |

#### 📍 影响分析
- 导航菜单中 **Product** 和 **Shop** 菜单占据 2/6 的顶级位置
- **10 个产品系列**子菜单全部指向未实现的页面:
  1. Glass Standoff (广告螺丝/玻璃立柱)
  2. Glass Connected Fitting (玻璃栏杆扶手连接件)
  3. Glass Fence Spigot (玻璃护栏支架底座)
  4. Guardrail Glass Clip (护栏系列)
  5. Bathroom Glass Clip (浴室系列)
  6. Glass Hinge (浴室夹)
  7. Sliding Door Kit (移门滑轮套装)
  8. Bathroom Handle (浴室&大门拉手)
  9. Door Handle (大门拉手)
  10. Hidden Hook (挂钩)
- **用户点击任何产品系列或产品都会遇到 404 错误**

#### ✅ 实现要点

**产品系列列表页 (`/products`)**:
- 网格布局展示 **10 个系列**
- 每个系列显示:
  - 封面图 (从 ProductSeries.coverImage 或首个产品图片)
  - 系列名称 (多语言)
  - 简短描述 (1-2 句话)
  - 产品数量统计
- 响应式设计 (移动端 1 列,桌面端 3 列)
- Hover 效果和动画
- SEO: 动态生成 metadata

**产品系列详情页 (`/products/[slug]`)**:
- 系列介绍区域:
  - 大图 Banner
  - 系列名称和详细描述
  - 应用场景说明
- 该系列下的所有产品列表:
  - 网格布局
  - 筛选和排序功能
  - 产品卡片 (图片、名称、SKU、价格区间)
- 相关系列推荐
- SEO: Open Graph tags, JSON-LD (ProductCollection)

**Shop 产品列表页 (`/shop`) - 完善现有实现**:
- ✅ 已实现: 基础筛选、排序、分页
- ❌ 需补充:
  - 产品卡片样式优化
  - 快速预览 (Quick View) 功能
  - 批量询价功能
  - 对比功能 (最多 4 个产品)
  - 视图切换 (网格/列表)
- 参考文件: `web/app/[locale]/shop/ShopPageClient.tsx:1`

**产品详情页 (`/shop/[slug]`)**:
- 产品图片区域:
  - 主图轮播 (支持缩放)
  - 缩略图导航
  - 360° 视图 (如有)
- 产品信息:
  - 名称、SKU、系列归属
  - 详细描述 (Document Editor 内容渲染)
  - 规格参数表格
  - 材质和工艺说明
- 功能区:
  - 询价按钮 (跳转到询价表单)
  - 下载技术文档 (PDF/CAD 文件)
  - 分享到社交媒体
- 相关产品推荐
- SEO: JSON-LD (Product schema), 完整 metadata

#### 📦 后端支持现状
- ✅ Product Schema (44 字段) - 完整实现
- ✅ ProductSeries Schema - 完整实现
- ✅ ProductContentTranslation - 多语言支持
- ✅ GraphQL API - 已支持所有查询
- ⚠️ REST API - 需补充系列相关端点

---

### 1.2 内容系统页面

#### 📋 清单

| 页面 | 路由 | 当前状态 | 导航菜单引用 | 优先级 | 工作量 |
|-----|------|---------|-------------|--------|--------|
| **博客列表页** | `/[locale]/blog` | ❌ 未实现 | ✅ About Us > Blog | **P0** | 3-5天 |
| **博客详情页** | `/[locale]/blog/[slug]` | ❌ 未实现 | ✅ 博客文章链接 | **P0** | 5-7天 |
| **应用案例列表** | `/[locale]/applications` | ❌ 未实现 | ✅ Service > 应用案例 | **P0** | 4-6天 |
| **应用案例详情** | `/[locale]/applications/[slug]` | ❌ 未实现 | ✅ 案例卡片链接 | **P0** | 5-7天 |

#### 📍 影响分析
- Service 菜单下的 "应用案例" (Applications) 链接无效
- About Us 菜单下的 "Blog" 链接无效
- 首页的 "Case Studies" 模块可能有链接指向这些页面

#### ✅ 实现要点

**博客列表页 (`/blog`)**:
- 时间线布局或卡片网格
- 文章卡片显示:
  - 封面图
  - 标题和摘要
  - 发布日期、作者
  - 分类标签
  - 阅读时间估算
- 功能:
  - 分类筛选 (技术文章、行业资讯、公司动态等)
  - 搜索功能
  - 分页或无限滚动
- SEO: 博客列表 metadata

**博客详情页 (`/blog/[slug]`)**:
- 文章头部:
  - 大图 Banner
  - 标题、作者、日期
  - 分类和标签
- 富文本内容渲染:
  - 使用 Keystone Document Editor 渲染器
  - 支持图片、视频、代码块、表格
  - 目录导航 (TOC)
- 互动功能:
  - 社交分享按钮
  - 相关文章推荐
  - 上一篇/下一篇导航
- SEO: JSON-LD (Article schema), Open Graph

**应用案例列表页 (`/applications`)**:
- 卡片网格布局
- 案例卡片显示:
  - 项目封面图
  - 项目名称和客户
  - 应用行业 (建筑/酒店/商业/住宅)
  - 使用的产品系列
  - 项目规模/地点
- 功能:
  - 按行业筛选
  - 按产品系列筛选
  - 按地区筛选
- SEO: 案例列表 metadata

**应用案例详情页 (`/applications/[slug]`)**:
- 项目概览:
  - 大图轮播
  - 项目基本信息表格
  - 客户评价/证言
- 内容区域:
  - 项目背景和挑战
  - 解决方案说明
  - 使用的产品列表 (带链接)
  - 实施过程
  - 效果展示 (前后对比、数据)
- 相关案例推荐
- SEO: JSON-LD, Open Graph

#### 📦 后端支持现状
- ✅ Blog Schema - 完整实现
- ✅ BlogContentTranslation - 多语言支持
- ✅ Application Schema - 完整实现
- ✅ ApplicationContentTranslation - 多语言支持
- ✅ GraphQL API - 已支持
- ❌ REST API - 需补充 4 个端点

---

### 1.3 通用页面系统

#### 📋 清单

| 页面 | 路由 | 当前状态 | 导航菜单引用 | 优先级 | 工作量 |
|-----|------|---------|-------------|--------|--------|
| **FAQ 页面** | `/[locale]/faq` | ❌ 未实现 | ✅ Service > FAQ | **P0** | 2-3天 |
| **联系我们** | `/[locale]/contact-us` | ❌ 未实现 | ✅ Contact Us 菜单 | **P0** | 3-4天 |
| **关于我们** | `/[locale]/about-us` | ❌ 未实现 | ✅ About Us > Our Story | **P1** | 3-5天 |
| **隐私政策** | `/[locale]/privacy-policy` | ❌ 未实现 | ✅ About Us > Privacy | **P1** | 1-2天 |
| **欺诈警告** | `/[locale]/fraud-notice` | ❌ 未实现 | ✅ About Us > Fraud Notice | **P1** | 1天 |

#### 📍 影响分析
- **顶级菜单 "Contact Us" 完全无法访问** (严重问题)
- Service 菜单的 4 个子菜单中 1 个无效 (FAQ)
- About Us 菜单的 5 个子菜单中 4 个无效

#### ✅ 实现要点

**FAQ 页面 (`/faq`)**:
- 手风琴式问答列表
- 分类标签 (产品问题、订购流程、售后服务等)
- 搜索功能 (实时筛选)
- 问题快速跳转锚点
- "未找到答案?" - 引导到联系表单
- 可使用 **Page** 通用系统 + 自定义组件

**联系我们 (`/contact-us`)** - **最高优先级**:
- 联系表单:
  - 姓名、邮箱、电话、公司名称
  - 国家/地区选择
  - 咨询类型 (产品询价、技术支持、合作洽谈等)
  - 详细留言
  - 附件上传 (可选)
  - 使用现有 FormSubmission 系统
- 公司信息:
  - 地址、电话、邮箱
  - 营业时间
  - Google Maps 嵌入
- 其他联系方式:
  - WhatsApp / WeChat 二维码
  - 社交媒体链接
- SEO: 联系方式 JSON-LD (Organization schema)

**关于我们 (`/about-us`)**:
- 公司介绍 (历史、使命、愿景)
- 团队展示 (核心成员)
- 资质证书 (ISO 认证等)
- 企业文化和价值观
- 发展历程时间线
- 使用 **Page** 通用系统实现

**隐私政策 / 欺诈警告**:
- 使用 **Page** 通用系统
- 富文本内容 (Document Editor)
- 最后更新时间显示
- 锚点导航

#### 📦 后端支持现状
- ✅ Page Schema - 通用页面系统已实现
- ✅ PageContentTranslation - 多语言支持
- ✅ FormSubmission - 表单提交系统已实现
- ✅ 邮件发送功能 - 已实现 (SMTP)
- ❌ REST API - 需补充 `/api/pages/[slug]` 端点

---

### 1.4 服务页面

#### 📋 清单

| 页面 | 路由 | 当前状态 | 导航菜单引用 |
|-----|------|---------|-------------|
| **一站式服务** | `/[locale]/service/one-stop-shop` | ❌ 未实现 | ✅ Service 子菜单 |
| **定制解决方案** | `/[locale]/service/custom-solutions` | ❌ 未实现 | ✅ Service 子菜单 |
| **质量保证** | `/[locale]/service/quality-assurance` | ❌ 未实现 | ✅ Service 子菜单 |

#### 📍 影响分析
- Service 菜单的 4 个子菜单中 3 个无效

#### ✅ 实现要点
- 使用后端的 **Page** 通用页面系统实现
- 每个页面包含:
  - Banner 图
  - 服务介绍
  - 服务流程图
  - 相关产品推荐
  - CTA (联系我们/获取报价)

#### 📦 后端支持现状
- ✅ Page Schema 支持

---

## 🔧 二、API 接口检查清单

### 2.1 已实现的 REST API ✅

| 端点 | 方法 | 功能 | 文件位置 | 状态 |
|-----|------|------|---------|------|
| `/api/navigation` | GET | 获取导航菜单 (多语言) | `web/app/api/navigation/route.ts` | ✅ 已测试 |
| `/api/products` | GET | 获取产品列表 (筛选/排序/分页) | `web/app/api/products/route.ts` | ✅ 已实现 |
| `/api/products/[slug]` | GET | 获取产品详情 | `web/app/api/products/[slug]/route.ts` | ✅ 已实现 |
| `/api/product-series` | GET | 获取产品系列列表 | `web/app/api/product-series/route.ts` | ✅ 已实现 |
| `/api/form-submissions` | POST | 提交表单 | `web/app/api/form-submissions/route.ts` | ✅ 已实现 |
| `/sitemap.xml` | GET | 动态生成 Sitemap | `web/app/sitemap.xml/route.ts` | ✅ 已实现 |
| `/robots.txt` | GET | 动态生成 Robots.txt | `web/app/robots.txt/route.ts` | ✅ 已实现 |

### 2.2 需要实现的 REST API ❌

| 端点 | 方法 | 功能 | 优先级 | GraphQL 支持 | 参考实现 |
|-----|------|------|--------|-------------|----------|
| `/api/product-series/[slug]` | GET | 获取产品系列详情 | **P0** | ✅ productSeries query | `/api/products/[slug]` |
| `/api/blogs` | GET | 获取博客列表 (分页/筛选) | **P0** | ✅ blogs query | `/api/products` |
| `/api/blogs/[slug]` | GET | 获取博客详情 | **P0** | ✅ blog query | `/api/products/[slug]` |
| `/api/applications` | GET | 获取应用案例列表 | **P0** | ✅ applications query | `/api/products` |
| `/api/applications/[slug]` | GET | 获取应用案例详情 | **P0** | ✅ application query | `/api/products/[slug]` |
| `/api/pages/[slug]` | GET | 获取通用页面内容 | **P0** | ✅ pages query | `/api/products/[slug]` |
| `/api/home-page` | GET | 获取首页内容 | **P1** | ✅ homePage query | - |
| `/api/footer` | GET | 获取页脚内容 | **P1** | ✅ footer query | - |
| `/api/site-config` | GET | 获取站点配置 | **P1** | ✅ siteConfig query | - |

### 2.3 实现模板

#### 标准列表 API 模板

```typescript
// web/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { apolloClient } from "@/lib/apollo-client"
import { gql } from "@apollo/client"

const GET_RESOURCES = gql`
  query GetResources($where: ResourceWhereInput, $take: Int, $skip: Int, $orderBy: [ResourceOrderByInput!]) {
    resources(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
      id
      slug
      name
      # ... 其他字段
      contentTranslations {
        locale
        content
      }
    }
    resourcesCount(where: $where)
  }
`

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const locale = searchParams.get("locale") || "en"
  const page = parseInt(searchParams.get("page") || "1")
  const pageSize = parseInt(searchParams.get("pageSize") || "12")

  try {
    const { data } = await apolloClient.query({
      query: GET_RESOURCES,
      variables: {
        where: { visible: { equals: true } },
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: [{ order: "asc" }]
      }
    })

    // 提取单语言内容
    const resources = data.resources.map((resource: any) => ({
      id: resource.id,
      slug: resource.slug,
      localizedName: resource.name?.[locale] || resource.name?.en,
      // ... 其他字段转换
    }))

    return NextResponse.json({
      resources,
      total: data.resourcesCount,
      page,
      pageSize,
      totalPages: Math.ceil(data.resourcesCount / pageSize)
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    )
  }
}
```

#### 标准详情 API 模板

```typescript
// web/app/api/[resource]/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { apolloClient } from "@/lib/apollo-client"
import { gql } from "@apollo/client"

const GET_RESOURCE = gql`
  query GetResource($slug: String!) {
    resource(where: { slug: $slug }) {
      id
      slug
      name
      # ... 其他字段
      contentTranslations {
        locale
        content
      }
    }
  }
`

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const searchParams = request.nextUrl.searchParams
  const locale = searchParams.get("locale") || "en"

  try {
    const { data } = await apolloClient.query({
      query: GET_RESOURCE,
      variables: { slug: params.slug }
    })

    if (!data.resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      )
    }

    // 提取单语言内容
    const resource = {
      id: data.resource.id,
      slug: data.resource.slug,
      localizedName: data.resource.name?.[locale] || data.resource.name?.en,
      // ... 其他字段转换
    }

    return NextResponse.json({ resource })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 500 }
    )
  }
}
```

### 2.4 GraphQL 转 REST API 的架构正确性 ✅

**当前架构** (推荐):

```
┌─────────────────────────────┐
│   React 组件                │
│   (处理简单的 JSON)          │
└──────────┬──────────────────┘
           │ fetch('/api/...')
┌──────────▼──────────────────┐
│   Next.js API Route         │
│   - 多语言处理              │
│   - 图片变体选择            │
│   - 数据转换                │
└──────────┬──────────────────┘
           │ Apollo Client
┌──────────▼──────────────────┐
│   Keystone GraphQL API      │
│   (复杂的多语言结构)         │
└──────────────────────────────┘
```

**优势**:
1. ✅ **简化前端代码** - 组件不需要处理多语言 JSON `{ en: "...", zh: "..." }`
2. ✅ **统一数据转换** - 在 API 层提取对应语言的文本
3. ✅ **图片优化** - API 层选择合适的图片尺寸变体 (thumbnail/small/medium 等)
4. ✅ **缓存友好** - REST 端点更容易被 CDN 缓存
5. ✅ **类型安全** - TypeScript 类型定义更清晰
6. ✅ **版本控制** - 更容易实现 API 版本管理

**结论**: **不需要改回纯 GraphQL**,当前架构是 B2C/B2B 网站的最佳实践。

---

## 🌐 三、国际化 (i18n) 检查清单

### 3.1 当前配置 vs 实际支持

| 项目 | 配置值 | 实际状态 | 风险 | 建议 |
|-----|--------|---------|------|-----|
| **前端 locale 配置** | 2 种 (en, zh) | ✅ 完整支持 | 无 | 保持当前配置 |
| **路由架构** | **24 种语言架构** | ✅ 灵活扩展 | 低 | **保持 24 语言架构** |
| **启用的语言** | 2 种 (en, zh) | ✅ 完整翻译 | 无 | 当前只启用 2 语言 |
| **UI 翻译文件** | 24 种语言文件 | ⚠️ 仅 en/zh 完整 | 低 | 保留作为扩展模板 |
| **后端多语言字段** | JSON 支持所有语言 | ✅ 架构支持 | 无 | 按需填充 |
| **中间件降级** | 未启用语言重定向 | ❌ 需实现 | 中 | 实现路由降级逻辑 |

### 3.2 关键问题

**当前架构设计** (推荐保持):

```typescript
// i18n.config.ts - 只启用 2 种语言
export const locales = ["en", "zh"] as const

// lib/utils/locale.ts - 路由支持 24 种语言架构
const SUPPORTED_LOCALES = [
  "en", "fr", "de", "it", "es", "pt",  // 欧洲语言
  "cs", "hu", "pl", "sk",              // 斯拉夫语言
  "ar", "he", "fa", "tr", "az", "ku",  // 中东/北非
  "zh", "ber"                          // 亚洲
] // 24 语言架构,未来扩展灵活
```

**架构优势**:
- ✅ 路由层支持 24 语言 = 未来扩展无需改动路由逻辑
- ✅ 配置层只启用 2 语言 = 当前维护成本低
- ✅ 通过中间件降级 = 未启用语言自动重定向
- ✅ 最佳实践 = 国际化 B2B 网站标准架构

**翻译文件策略**:

```
web/messages/
├── en.json  ✅ 完整 (已启用)
├── zh.json  ✅ 完整 (已启用)
├── fr.json  📝 模板 (未启用,保留作为扩展模板)
├── de.json  📝 模板 (未启用,保留作为扩展模板)
└── ... (其他 20 种语言文件 - 保留作为模板)
```

### 3.3 解决方案 - 24 语言架构,当前实现 2 语言 (推荐)

**策略**: 保持 24 语言的架构支持,当前只实现 en 和 zh

**工作量**: 1-2 天 (配置调整)

**实施步骤**:

1. **保持路由架构支持 24 语言**:
   - `lib/utils/locale.ts` 的 `getLocaleFromPathname` 保持 24 语言支持
   - 这样未来扩展新语言无需修改路由逻辑

2. **i18n 配置只启用 2 语言**:
   ```typescript
   // i18n.config.ts - 当前只启用 en 和 zh
   export const locales = ["en", "zh"] as const
   ```

3. **保留其他 22 种语言翻译文件** (作为模板):
   - 不删除 `messages/fr.json`, `messages/de.json` 等
   - 这些文件作为未来扩展的模板
   - 当需要支持新语言时,只需翻译并在 `i18n.config.ts` 中启用

4. **路由降级处理**:
   - 访问未启用的语言路径 (如 `/fr/shop`) 时
   - 中间件自动重定向到默认语言 (en)
   - 或显示语言选择页面

**优点**:
- ✅ **架构灵活** - 未来扩展新语言无需改动路由
- ✅ **当前专注** - 只维护 en/zh 两种语言
- ✅ **渐进实施** - 可随时启用新语言
- ✅ **SEO 友好** - 支持 hreflang 标签扩展
- ✅ **降低成本** - 不需要立即翻译 22 种语言

**缺点**:
- ⚠️ 需要路由中间件处理未启用语言的降级

**扩展新语言流程** (未来):
1. 翻译对应的 `messages/{locale}.json` 文件
2. 在 `i18n.config.ts` 中添加新 locale
3. 测试新语言的路由和显示
4. 上线 - 无需修改其他代码

### 3.4 具体实施

**当前配置** (保持不变):
```typescript
// i18n.config.ts
export const locales = ["en", "zh"] as const
export const defaultLocale = "en" as const
```

**路由支持** (保持 24 语言架构):
```typescript
// lib/utils/locale.ts
const SUPPORTED_LOCALES = [
  "en", "fr", "de", "it", "es", "pt",  // 欧洲语言
  "cs", "hu", "pl", "sk",              // 斯拉夫语言
  "ar", "he", "fa", "tr", "az", "ku",  // 中东/北非
  "zh", "ber"                          // 亚洲
] as const // 保持 24 语言架构
```

**中间件降级** (需实现):
```typescript
// middleware.ts
import { locales } from './i18n.config'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const locale = getLocaleFromPathname(pathname)

  // 如果是未启用的语言,重定向到默认语言
  if (locale && !locales.includes(locale)) {
    const newPathname = pathname.replace(`/${locale}`, '/en')
    return NextResponse.redirect(new URL(newPathname, request.url))
  }

  // 其他逻辑...
}
```

### 3.5 建议

**优势总结**:
- 24 语言架构 = 未来扩展灵活性
- 2 语言实现 = 当前维护成本低
- 最佳平衡方案,符合国际化 B2B 网站需求

---

## 🗂️ 四、数据完整性检查清单

### 4.1 必须在 CMS 中准备的数据

| 内容类型 | 最小数量 | 推荐数量 | 当前状态 | 优先级 |
|---------|---------|---------|---------|--------|
| **Product (产品 SKU)** | 30 | 50-100 | ⚠️ 待确认 | **P0** |
| **ProductSeries (产品系列)** | **10** | **10** | ✅ 导航菜单已配置 | **P0** |
| **Blog (博客文章)** | 10 | 20-30 | ❌ 待创建 | **P0** |
| **Application (应用案例)** | 5 | 10-15 | ❌ 待创建 | **P0** |
| **Page (通用页面)** | 8 | 10-15 | ❌ 待创建 | **P0** |
| **Media (图片)** | 100 | 200-300 | ⚠️ 待确认 | **P0** |
| **NavigationMenu** | 6 个顶级 | 6 个顶级 | ✅ 已配置 | ✅ 完成 |
| **HomeContent (首页内容)** | 1 | 1 | ⚠️ Mock 数据 | **P1** |
| **Footer (页脚)** | 1 | 1 | ❌ 待创建 | **P1** |
| **SiteConfig (站点配置)** | 1 | 1 | ⚠️ 待确认 | **P1** |

### 4.2 产品数据要求

**每个产品系列至少需要**:
- 5-10 个产品 SKU
- 每个产品至少 3-5 张高质量图片
- 完整的规格参数
- 详细的产品描述 (en + zh)
- 技术文档/CAD 文件 (如有)

**当前 10 个产品系列**:
1. Glass Standoff (广告螺丝/玻璃立柱) - 建议 8-10 个 SKU
2. Glass Connected Fitting (玻璃栏杆扶手连接件) - 建议 6-8 个 SKU
3. Glass Fence Spigot (玻璃护栏支架底座) - 建议 5-7 个 SKU
4. Guardrail Glass Clip (护栏系列) - 建议 5-7 个 SKU
5. Bathroom Glass Clip (浴室系列) - 建议 4-6 个 SKU
6. Glass Hinge (浴室夹) - 建议 6-8 个 SKU
7. Sliding Door Kit (移门滑轮套装) - 建议 4-6 个 SKU
8. Bathroom Handle (浴室&大门拉手) - 建议 6-8 个 SKU
9. Door Handle (大门拉手) - 建议 5-7 个 SKU
10. Hidden Hook (挂钩) - 建议 3-5 个 SKU

**总计推荐**: 52-72 个产品 SKU

### 4.3 内容数据要求

**博客文章** (最小 10 篇):
- 产品介绍类 (3-4 篇)
- 行业资讯类 (2-3 篇)
- 技术教程类 (2-3 篇)
- 公司动态类 (2-3 篇)

**应用案例** (最小 5 个):
- 至少覆盖 3 种不同行业 (建筑/酒店/商业/住宅)
- 每个案例至少 5-10 张项目图片
- 详细的项目描述和产品使用情况

**通用页面** (必需 8 个):
- About Us (关于我们)
- FAQ (常见问题)
- Privacy Policy (隐私政策)
- Fraud Notice (欺诈警告)
- One-stop Shop (一站式服务)
- Custom Solutions (定制解决方案)
- Quality Assurance (质量保证)
- Support (支持)

### 4.4 首页内容检查

**当前状态**: ⚠️ 所有模块使用 Mock 数据

| 模块 | 数据来源 | 当前状态 | 需要操作 |
|-----|---------|---------|---------|
| **Hero Banner** | HomeContent.heroBannerItems | ⚠️ Mock | 在 CMS 配置 3-5 个 Banner |
| **Product Series Carousel** | ProductSeries | ⚠️ Mock | 连接真实 API |
| **Featured Products** | HomeContent.featuredProducts | ⚠️ Mock | 选择 6-8 个精选产品 |
| **Case Studies** | HomeContent.caseStudies | ⚠️ Mock | 连接 Application |
| **Service Features** | HomeContent.serviceFeaturesConfig | ⚠️ Mock | 配置 3-4 个服务特色 |
| **Brand Advantages** | HomeContent.brandAdvantages | ⚠️ Mock | 配置 4-6 个品牌优势 |
| **OEM/ODM** | HomeContent.oemOdm | ⚠️ Mock | 配置 OEM/ODM 信息 |
| **Quote Steps** | HomeContent.quoteSteps | ⚠️ Mock | 配置询价流程 |
| **Why Choose Busrom** | HomeContent.whyChooseBusrom | ⚠️ Mock | 配置选择理由 |
| **Brand Value** | HomeContent.brandValue | ⚠️ Mock | 配置品牌价值 |

**关键任务**:
1. 在 Keystone CMS 中填充 HomeContent 的所有字段
2. 修改前端组件从 API 获取数据而非 Mock
3. 移除 Mock 数据文件 (`lib/mock-data/*`)

### 4.5 媒体库准备

**图片规格要求**:
- 产品图片: 最小 1200×1200px,白色背景
- 封面图片: 最小 1920×1080px
- Banner 图片: 最小 1920×600px
- 案例图片: 最小 1200×800px
- 格式: JPG (自动生成 WebP)

**自动优化功能** ✅:
- 后端已实现 5 种尺寸变体:
  - thumbnail (300px)
  - small (640px)
  - medium (1024px)
  - large (1920px)
  - original
- 自动生成 WebP 格式
- 自动提取元数据 (尺寸、文件大小、MIME 类型)

**文件位置**: `cms/lib/image-optimizer.ts`

---

## 🚀 五、SEO 和生产环境检查清单

### 5.1 SEO 基础设施

| 功能 | 实现状态 | 文件位置 | 优先级 | 备注 |
|-----|---------|---------|--------|------|
| **Sitemap.xml** | ✅ 已实现 | `web/app/sitemap.xml/route.ts` | P0 | 需测试多语言 URL |
| **Robots.txt** | ✅ 已实现 | `web/app/robots.txt/route.ts` | P0 | 需配置生产环境规则 |
| **Meta 标签** | ⚠️ 部分实现 | 各页面 `layout.tsx` | P0 | 每个页面需独立 metadata |
| **结构化数据 (JSON-LD)** | ❌ 未实现 | - | P0 | Product, Organization, Article |
| **Open Graph 标签** | ❌ 未实现 | - | P0 | 产品/博客分享图 |
| **Twitter Card** | ❌ 未实现 | - | P1 | 社交媒体分享 |
| **Hreflang 标签** | ❌ 未实现 | - | P0 | 多语言站点必需 |
| **Canonical URL** | ❌ 未实现 | - | P0 | 避免重复内容 |
| **IndexNow** | ⚠️ 文档存在 | 见 `docs/IndexNow实现指南.md` | P1 | 快速索引 |
| **Google Indexing API** | ⚠️ 文档存在 | 见 `docs/GoogleIndexingAPI实现指南.md` | P1 | 加速收录 |

### 5.2 结构化数据 (JSON-LD) 清单

#### 必须实现的 Schema

**1. Organization (全站)** - 优先级 P0

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Busrom",
  "url": "https://www.busrom.com",
  "logo": "https://cdn.busrom.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+86-xxx-xxxx",
    "contactType": "Customer Service",
    "availableLanguage": ["en", "zh"]
  },
  "sameAs": [
    "https://facebook.com/busrom",
    "https://linkedin.com/company/busrom"
  ]
}
```

**2. Product (产品详情页)** - 优先级 P0

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Glass Standoff BS-001",
  "image": "https://cdn.busrom.com/products/bs-001.jpg",
  "description": "High-quality stainless steel glass standoff...",
  "sku": "BS-001",
  "brand": {
    "@type": "Brand",
    "name": "Busrom"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
```

**3. Article (博客详情页)** - 优先级 P0

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "博客标题",
  "image": "https://cdn.busrom.com/blog/cover.jpg",
  "author": {
    "@type": "Person",
    "name": "作者名称"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Busrom",
    "logo": {
      "@type": "ImageObject",
      "url": "https://cdn.busrom.com/logo.png"
    }
  },
  "datePublished": "2025-11-15",
  "dateModified": "2025-11-15"
}
```

**4. FAQPage (FAQ 页面)** - 优先级 P1

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "问题标题",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "答案内容"
      }
    }
  ]
}
```

### 5.3 Open Graph 和 Twitter Card 模板

**每个页面需要的 Meta 标签**:

```tsx
// Next.js Metadata API
export const metadata: Metadata = {
  title: "页面标题",
  description: "页面描述",
  openGraph: {
    title: "OG 标题",
    description: "OG 描述",
    type: "website", // or "article" for blog
    url: "https://www.busrom.com/page-url",
    images: [
      {
        url: "https://cdn.busrom.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "图片描述"
      }
    ],
    locale: "en_US", // or "zh_CN"
  },
  twitter: {
    card: "summary_large_image",
    title: "Twitter 标题",
    description: "Twitter 描述",
    images: ["https://cdn.busrom.com/twitter-image.jpg"]
  },
  alternates: {
    canonical: "https://www.busrom.com/page-url",
    languages: {
      "en": "https://www.busrom.com/en/page-url",
      "zh": "https://www.busrom.com/zh/page-url"
    }
  }
}
```

### 5.4 性能优化清单

| 项目 | 状态 | 目标 | 建议 |
|-----|------|------|-----|
| **图片优化** | ✅ 已实现 | Lighthouse 90+ | 后端已生成 5 种尺寸 + WebP |
| **Next.js Image** | ⚠️ 部分使用 | 全站统一 | 替换所有 `<img>` 为 `<Image>` |
| **代码分割** | ✅ 自动 | - | Next.js 默认支持 |
| **字体优化** | ⚠️ 待确认 | - | 使用 `next/font` |
| **懒加载** | ⚠️ 部分实现 | - | 首页模块实现懒加载 |
| **缓存策略** | ❌ 未配置 | - | 配置 CDN 缓存规则 |
| **Bundle Size** | ⚠️ 待测试 | < 200KB (gzip) | 使用 `@next/bundle-analyzer` |
| **Core Web Vitals** | ⚠️ 待测试 | 全绿 | LCP < 2.5s, FID < 100ms, CLS < 0.1 |

### 5.5 错误处理和回退

| 页面/功能 | 状态 | 文件位置 | 建议 |
|----------|------|---------|-----|
| **404 页面** | ❌ 未自定义 | `web/app/not-found.tsx` | 创建品牌化 404 页面 |
| **500 页面** | ❌ 未自定义 | `web/app/error.tsx` | 创建友好的错误页面 |
| **API 错误** | ⚠️ 基础实现 | 各 API Route | 统一错误格式和日志 |
| **图片加载失败** | ❌ 无回退 | - | 添加占位图 |
| **网络超时** | ❌ 无提示 | - | 添加重试机制和提示 |
| **表单验证** | ⚠️ 基础实现 | - | 增强客户端/服务端验证 |

### 5.6 安全检查清单

| 项目 | 状态 | 建议 |
|-----|------|-----|
| **HTTPS** | ⚠️ 生产环境 | AWS Certificate Manager |
| **CORS 配置** | ⚠️ 待确认 | 限制允许的源 |
| **API Rate Limiting** | ❌ 未实现 | 防止滥用 |
| **表单防 CSRF** | ⚠️ 待确认 | 使用 CSRF Token |
| **SQL Injection** | ✅ Prisma 防护 | - |
| **XSS 防护** | ⚠️ 基础实现 | 内容清理和转义 |
| **环境变量安全** | ⚠️ 待确认 | 不提交到 Git |
| **依赖安全扫描** | ❌ 未配置 | `npm audit` 定期检查 |

---

## 📦 六、AWS 部署环境配置检查

### 6.1 环境变量清单

#### 前端环境变量 (`web/.env.production`)

```bash
# ==================== CMS API ====================
KEYSTONE_URL=https://cms.busrom.com/api/graphql

# ==================== Next.js 配置 ====================
NEXT_PUBLIC_SITE_URL=https://www.busrom.com
NEXT_PUBLIC_CDN_URL=https://cdn.busrom.com

# ==================== 分析和跟踪 ====================
# 这些值从 CMS 的 CustomScript 获取,通常不需要硬编码
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_TIKTOK_PIXEL=XXXXXXXXXXXX

# ==================== 其他配置 ====================
NODE_ENV=production
```

#### 后端环境变量 (`cms/.env.production`)

```bash
# ==================== 数据库 ====================
DATABASE_URL=postgresql://busrom_user:STRONG_PASSWORD@busrom-db.xxxxx.us-east-1.rds.amazonaws.com:5432/busrom_prod

# ==================== AWS S3 媒体存储 ====================
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_BUCKET_NAME=busrom-media-prod
AWS_CLOUDFRONT_DOMAIN=cdn.busrom.com

# ==================== Session 安全 ====================
SESSION_SECRET=生成一个至少 32 字符的强随机字符串

# ==================== SMTP 邮件发送 (AWS SES) ====================
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=AKIA...
SMTP_PASS=AWS SES SMTP 密码
SMTP_FROM_EMAIL=noreply@busrom.com
SMTP_FROM_NAME=Busrom

# ==================== 其他配置 ====================
NODE_ENV=production
PORT=3000
```

### 6.2 AWS 服务配置清单

| 服务 | 用途 | 配置要点 | 估算成本 (月) |
|-----|------|---------|-------------|
| **EC2 / ECS Fargate** | 运行 Next.js + Keystone | t3.medium (2vCPU, 4GB) × 2 | $60-80 |
| **RDS PostgreSQL** | 数据库 | db.t3.medium, 100GB SSD | $80-100 |
| **S3** | 媒体存储 | 100GB 存储 + 传输 | $5-10 |
| **CloudFront** | CDN | 500GB 传输 | $40-60 |
| **Route 53** | DNS | 托管区域 + 查询 | $1-2 |
| **SES** | 邮件发送 | 每月 10,000 封免费 | $0-5 |
| **Certificate Manager** | SSL 证书 | 公共证书免费 | $0 |
| **ALB** | 负载均衡 | Application Load Balancer | $20-30 |
| **总计** | - | - | **$206-287** |

### 6.3 推荐部署架构

```
┌─────────────────────────────────────────────────┐
│               用户浏览器                         │
└─────────────────┬───────────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────────┐
│           CloudFront CDN                        │
│  - 缓存静态资源 (图片/CSS/JS)                    │
│  - SSL 终止                                     │
│  - 域名: www.busrom.com, cdn.busrom.com        │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│      Application Load Balancer (ALB)           │
│  - 路径路由: /api/* → CMS, /* → Web            │
│  - 健康检查                                     │
└─────────┬───────────────────┬───────────────────┘
          │                   │
┌─────────▼──────────┐  ┌─────▼────────────────┐
│  ECS Task 1        │  │  ECS Task 2          │
│  Next.js (web)     │  │  Keystone (cms)      │
│  端口: 3001        │  │  端口: 3000          │
│  副本数: 2         │  │  副本数: 2           │
└─────────┬──────────┘  └─────┬────────────────┘
          │                   │
          └───────┬───────────┘
                  │
     ┌────────────▼───────────┐
     │   RDS PostgreSQL 15    │
     │   Multi-AZ 部署        │
     │   自动备份             │
     └────────────────────────┘

     ┌────────────────────────┐
     │   S3 Bucket            │
     │   媒体文件存储          │
     │   版本控制启用          │
     └────────────────────────┘
```

### 6.4 RDS PostgreSQL 配置

**实例规格**:
- 实例类型: `db.t3.medium` (2vCPU, 4GB RAM)
- 存储: 100GB SSD (GP3)
- Multi-AZ: 是 (高可用)
- 备份保留: 7 天
- 加密: 启用

**安全组规则**:
```
入站规则:
- 类型: PostgreSQL (5432)
- 源: ECS 任务的安全组
```

**参数组配置**:
```
max_connections = 200
shared_buffers = 1GB
effective_cache_size = 3GB
```

### 6.5 S3 和 CloudFront 配置

**S3 Bucket 配置**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::busrom-media-prod/*"
    }
  ]
}
```

**CORS 配置**:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://www.busrom.com", "https://cms.busrom.com"],
    "ExposeHeaders": []
  }
]
```

**CloudFront 缓存策略**:
- 图片 (*.jpg, *.png, *.webp): TTL 31536000 (1 年)
- 静态资源 (*.js, *.css): TTL 86400 (1 天)
- HTML: TTL 3600 (1 小时)

### 6.6 ECS Fargate 配置

**Next.js 任务定义**:
```json
{
  "family": "busrom-web",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "web",
      "image": "busrom/web:latest",
      "portMappings": [{ "containerPort": 3001 }],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "NEXT_PUBLIC_SITE_URL", "value": "https://www.busrom.com" }
      ],
      "secrets": [
        { "name": "KEYSTONE_URL", "valueFrom": "arn:aws:secretsmanager:..." }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/busrom-web",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

**Keystone 任务定义**:
```json
{
  "family": "busrom-cms",
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "cms",
      "image": "busrom/cms:latest",
      "portMappings": [{ "containerPort": 3000 }],
      "secrets": [
        { "name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:..." },
        { "name": "SESSION_SECRET", "valueFrom": "arn:aws:secretsmanager:..." }
      ]
    }
  ]
}
```

### 6.7 域名和 SSL 配置

**Route 53 记录**:
```
www.busrom.com    → A (Alias) → CloudFront 分发
cms.busrom.com    → A (Alias) → ALB
cdn.busrom.com    → CNAME → CloudFront 域名
```

**Certificate Manager**:
- 证书 1: `*.busrom.com` (通配符证书)
- 验证方法: DNS 验证
- 自动续期: 启用

### 6.8 部署前检查表

- [ ] RDS 实例已创建并可连接
- [ ] S3 Bucket 已创建并配置 CORS
- [ ] CloudFront 分发已创建并绑定域名
- [ ] SSL 证书已申请并验证
- [ ] ECS 集群已创建
- [ ] Docker 镜像已构建并推送到 ECR
- [ ] 环境变量已配置到 AWS Secrets Manager
- [ ] ALB 已创建并配置健康检查
- [ ] Route 53 DNS 记录已配置
- [ ] SES 已验证发件域名
- [ ] CloudWatch 日志组已创建
- [ ] IAM 角色和权限已配置

---

## ✅ 七、部署前最小可行性检查表 (MVP)

### 阶段 1: 基础页面实现 (2-3 周)

**产品系统** (12-15 天):
- [ ] 产品系列列表页 (`/products`) - 3-5 天
  - [ ] 创建页面组件 `app/[locale]/products/page.tsx`
  - [ ] 实现 API 端点 `/api/product-series`
  - [ ] 网格布局展示 9 个系列
  - [ ] 响应式设计和动画
  - [ ] SEO metadata

- [ ] 产品系列详情页 (`/products/[slug]`) - 5-7 天
  - [ ] 创建页面组件 `app/[locale]/products/[slug]/page.tsx`
  - [ ] 实现 API 端点 `/api/product-series/[slug]`
  - [ ] 系列介绍区域
  - [ ] 该系列产品列表
  - [ ] 相关系列推荐
  - [ ] SEO 和 JSON-LD

- [ ] 完善 Shop 产品列表 (`/shop`) - 2-3 天
  - [ ] 优化产品卡片样式
  - [ ] 添加快速预览功能
  - [ ] 完善筛选和排序

- [ ] 产品详情页 (`/shop/[slug]`) - 7-10 天
  - [ ] 创建页面组件 `app/[locale]/shop/[slug]/page.tsx`
  - [ ] 完善 API 端点 `/api/products/[slug]`
  - [ ] 图片轮播和缩放
  - [ ] 规格参数展示
  - [ ] 询价和下载功能
  - [ ] 相关产品推荐
  - [ ] Product JSON-LD

**通用页面** (3-4 天):
- [ ] 联系我们页面 (`/contact-us`) - 2-3 天 **最高优先级**
  - [ ] 创建页面组件
  - [ ] 集成表单系统 (已有 FormSubmission)
  - [ ] 地图集成
  - [ ] 公司信息展示

- [ ] FAQ 页面 (`/faq`) - 1-2 天
  - [ ] 创建页面组件
  - [ ] 使用 Page 系统或自定义实现
  - [ ] 手风琴式问答

### 阶段 2: 内容系统 (1-2 周)

**博客系统** (5-7 天):
- [ ] 博客列表页 (`/blog`) - 3-4 天
  - [ ] 创建页面组件
  - [ ] 实现 API 端点 `/api/blogs`
  - [ ] 卡片布局和筛选
  - [ ] 分页功能

- [ ] 博客详情页 (`/blog/[slug]`) - 2-3 天
  - [ ] 创建页面组件
  - [ ] 实现 API 端点 `/api/blogs/[slug]`
  - [ ] Document Editor 内容渲染
  - [ ] 相关文章推荐
  - [ ] Article JSON-LD

**应用案例系统** (5-7 天):
- [ ] 应用案例列表页 (`/applications`) - 3-4 天
  - [ ] 创建页面组件
  - [ ] 实现 API 端点 `/api/applications`
  - [ ] 卡片网格和筛选

- [ ] 应用案例详情页 (`/applications/[slug]`) - 2-3 天
  - [ ] 创建页面组件
  - [ ] 实现 API 端点 `/api/applications/[slug]`
  - [ ] 项目展示区域
  - [ ] 产品链接

### 阶段 3: 通用页面系统 (1 周)

- [ ] 关于我们页面 (`/about-us`) - 2 天
  - [ ] 使用 Page 系统
  - [ ] 实现 API 端点 `/api/pages/[slug]`

- [ ] 服务页面 (`/service/*`) - 2 天
  - [ ] 一站式服务
  - [ ] 定制解决方案
  - [ ] 质量保证
  - [ ] 使用 Page 系统

- [ ] 隐私政策和其他静态页面 - 1 天
  - [ ] 隐私政策
  - [ ] 欺诈警告
  - [ ] 支持页面

### 阶段 4: 数据和优化 (1 周)

**数据准备** (3-4 天):
- [ ] 在 CMS 中添加至少 50 个产品
- [ ] 在 CMS 中添加至少 10 篇博客文章
- [ ] 在 CMS 中添加至少 5 个应用案例
- [ ] 在 CMS 中创建所有通用页面内容
- [ ] 配置首页 HomeContent (移除 Mock 数据)
- [ ] 上传和优化所有图片资源

**SEO 优化** (2-3 天):
- [ ] 为所有页面添加 metadata
- [ ] 实现结构化数据 (JSON-LD)
  - [ ] Organization (全站)
  - [ ] Product (产品详情页)
  - [ ] Article (博客详情页)
  - [ ] FAQPage (FAQ 页面)
- [ ] 配置 Open Graph 标签
- [ ] 配置 Hreflang 标签
- [ ] 测试 Sitemap 和 Robots.txt

**错误处理** (1 天):
- [ ] 创建自定义 404 页面
- [ ] 创建自定义 500 错误页面
- [ ] 统一 API 错误格式
- [ ] 添加图片加载失败回退

### 阶段 5: 部署和测试 (1 周)

**AWS 环境配置** (2-3 天):
- [ ] 创建 RDS PostgreSQL 实例
- [ ] 创建 S3 Bucket 并配置
- [ ] 配置 CloudFront CDN
- [ ] 申请 SSL 证书
- [ ] 创建 ECS 集群和任务定义
- [ ] 配置 ALB
- [ ] 配置 Route 53 DNS
- [ ] 验证 SES 发件域名

**部署** (1-2 天):
- [ ] 构建和推送 Docker 镜像
- [ ] 部署 Keystone CMS
- [ ] 部署 Next.js 前端
- [ ] 配置环境变量
- [ ] 运行数据库迁移
- [ ] 导入初始数据

**测试** (2-3 天):
- [ ] 测试所有页面路由
- [ ] 测试所有导航菜单链接
- [ ] 测试多语言切换 (en/zh)
- [ ] 测试表单提交和邮件发送
- [ ] 测试图片加载和 CDN
- [ ] 性能测试 (Lighthouse)
- [ ] 移动端适配测试
- [ ] 浏览器兼容性测试
- [ ] SEO 检查 (结构化数据测试工具)
- [ ] 安全检查

---

## 📊 八、总结和建议

### 8.1 项目现状评估

**优势** ✅:
- 后端架构完善,数据模型完整
- GraphQL + REST 转换层设计合理
- 图片优化和媒体管理系统完善
- SEO 基础设施部分就绪
- 文档详细,便于后续开发

**劣势** ⚠️:
- 前端完成度低 (仅 15-20%)
- 核心页面缺失,导航链接大量 404
- 首页使用 Mock 数据,未连接 CMS
- 国际化配置混乱 (24 语言 vs 2 语言)
- SEO 优化不完整 (缺 JSON-LD, OG tags)

**风险** 🔴:
1. **大量页面 404** - 导航菜单配置完整但页面未实现,用户体验极差
2. **SEO 不完整** - 缺少结构化数据和 hreflang,影响搜索排名
3. **性能未优化** - 首页 Mock 数据可能影响加载速度
4. **国际化问题** - 24 语言路由存在但翻译不完整,导致混乱
5. **数据准备不足** - CMS 中缺少足够的产品和内容数据

### 8.2 推荐部署策略

#### 方案 A: 快速 MVP (6-8 周) - 推荐

**目标**: 上线可用的 B2B 询价网站

**范围**:
- 产品系统 (系列列表/详情 + Shop 列表/详情)
- 联系我们页面 (最高优先级)
- FAQ 页面
- 基础 SEO (metadata + Product JSON-LD)
- 2 种语言 (en, zh)

**优点**:
- ✅ 快速上线,获得市场反馈
- ✅ 核心功能完整
- ✅ 降低初期风险

**缺点**:
- ❌ 内容系统缺失 (博客/案例)
- ❌ SEO 不够完善

#### 方案 B: 完整版本 (10-12 周)

**目标**: 功能完善的企业官网

**范围**:
- 方案 A 的所有内容
- 博客系统
- 应用案例系统
- 所有通用页面 (关于我们/服务页面等)
- 完整 SEO (所有 JSON-LD + OG tags + hreflang)
- 性能优化 (Lighthouse 90+)

**优点**:
- ✅ 功能完整
- ✅ SEO 优化完善
- ✅ 内容丰富

**缺点**:
- ❌ 上线时间长
- ❌ 初期投入大

### 8.3 立即行动项

**本周必须决定**:
1. **国际化范围** - 支持 2 语言还是 24 语言?
   - 推荐: 先支持 2 语言 (en, zh)
   - 修改 `getLocaleFromPathname` 只接受 en/zh

2. **部署策略** - 快速 MVP 还是完整版本?
   - 推荐: 快速 MVP (6-8 周)
   - 后续迭代添加博客和案例

3. **数据准备** - 谁负责准备产品和内容数据?
   - 至少需要 50 个产品 SKU
   - 至少需要 10 篇博客文章 (如选择完整版本)

**下周开始开发**:
1. **第 1 优先级**: 联系我们页面 (顶级菜单完全无法访问)
2. **第 2 优先级**: 产品系列列表页
3. **第 3 优先级**: 产品详情页
4. **同步进行**: 在 CMS 中准备产品数据

### 8.4 成功指标

**技术指标**:
- ✅ 所有导航菜单链接可访问 (0 个 404)
- ✅ Lighthouse 性能分数 > 90
- ✅ 核心 Web Vitals 全绿
- ✅ 移动端适配 100%

**业务指标**:
- ✅ 首页加载时间 < 2 秒
- ✅ 询价表单转化率可追踪
- ✅ SEO 排名进入前 3 页 (3 个月内)

**内容指标**:
- ✅ 至少 50 个产品 SKU
- ✅ 至少 10 篇博客文章 (如有)
- ✅ 至少 5 个应用案例 (如有)

---

## 📝 附录

### A. 相关文档索引

- **架构设计**: `docs/01-数据模型与架构.md`
- **API 规范**: `docs/02-API接口规范.md`
- **部署指南**: `docs/05-部署与验收.md`
- **前端开发指南**: `docs/前端开发指南_v2.0.md`
- **导航菜单**: `docs/导航菜单配置说明.md`
- **图片优化**: `docs/07-图片变体使用指南.md`
- **SEO 功能**: `docs/SEO和自定义代码功能缺失清单.md`

### B. 技术栈版本

- Next.js: 15.0.3
- React: 19.0.0
- TypeScript: 5.6.3
- Tailwind CSS: 3.4.1
- Keystone: 6.3.1
- Prisma: 5.22.0
- PostgreSQL: 15
- Node.js: 20.18.1

### C. 联系方式

如有问题,请参考:
- 项目文档: `docs/` 目录
- GraphQL API: `http://localhost:3000/api/graphql`
- Apollo Studio: 浏览器访问 CMS GraphQL 端点

---

**文档结束**

> 本文档将随着项目进展持续更新。最后更新: 2025-11-15
