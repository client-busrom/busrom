# 代码示例集

本目录包含 Busrom 网站开发的所有代码示例。

---

## 📁 目录结构

```
examples/
├── README.md                           # 本文件
├── keystone/
│   ├── schema-examples.ts              # Keystone Schema 示例
│   ├── i18n-implementation.ts          # 多语言实现示例
│   ├── s3-upload.ts                    # AWS S3 上传示例
│   └── component-blocks.tsx            # 组件块定义示例
├── nextjs/
│   ├── api-route-handler.ts            # API Route Handler 示例
│   ├── server-component.tsx            # Server Component 示例
│   ├── client-component.tsx            # Client Component 示例
│   └── metadata-generation.ts          # generateMetadata 示例
├── seo/
│   ├── sitemap-generation.ts           # Sitemap 生成示例
│   ├── structured-data.tsx             # 结构化数据示例
│   └── google-indexing-api.ts          # Google Indexing API 示例
└── cdp/
    ├── tracking-sdk.ts                 # 前端埋点 SDK 示例
    ├── event-receiver.ts               # 后端事件接收示例
    └── etl-task.ts                     # ETL 定时任务示例
```

---

## 🔑 核心示例索引

### 1. Keystone 后端示例

| 文件 | 描述 | 关键技术 |
|------|------|---------|
| **schema-examples.ts** | 完整的 Keystone Schema 定义 | 单例模型、关系型、多语言字段 |
| **i18n-implementation.ts** | 多语言实现的完整方案 | 字段级多语言、查询转换 |
| **s3-upload.ts** | AWS S3 图片上传和缩略图生成 | AWS SDK、Sharp 图片处理 |
| **component-blocks.tsx** | 动态内容区的组件块定义 | Keystone Document Field |

---

### 2. Next.js 前端示例

| 文件 | 描述 | 关键技术 |
|------|------|---------|
| **api-route-handler.ts** | GraphQL → RESTful 转换层 | Apollo Client、数据聚合 |
| **server-component.tsx** | 服务端组件实现 | SSR、ISR、Data Fetching |
| **client-component.tsx** | 客户端组件实现 | SWR、useState、useEffect |
| **metadata-generation.ts** | SEO Meta 标签生成 | generateMetadata、hreflang |

---

### 3. SEO 示例

| 文件 | 描述 | 关键技术 |
|------|------|---------|
| **sitemap-generation.ts** | 动态 Sitemap.xml 生成 | Next.js Sitemap API、多语言支持 |
| **structured-data.tsx** | JSON-LD 结构化数据 | Schema.org、Product/Article/Organization |
| **google-indexing-api.ts** | 自动提交到 Google | Google Indexing API、OAuth2 |

---

### 4. CDP 数据分析示例

| 文件 | 描述 | 关键技术 |
|------|------|---------|
| **tracking-sdk.ts** | 前端埋点 SDK 完整实现 | Session 管理、事件追踪 |
| **event-receiver.ts** | 后端事件接收 API | User-Agent 解析、IP 地理位置 |
| **etl-task.ts** | 数据汇总定时任务 | Cron Job、聚合查询 |

---

## 🚀 快速开始

### 示例 1: 创建一个 Keystone Schema

```typescript
// 参考: examples/keystone/schema-examples.ts

import { list } from '@keystone-6/core'
import { text, relationship } from '@keystone-6/core/fields'

export const Product = list({
  fields: {
    sku: text({ isIndexed: 'unique' }),
    name_en: text({ validation: { isRequired: true } }),
    name_zh: text(),
    mainImage: relationship({ ref: 'Media' }),
  }
})
```

---

### 示例 2: 实现 Next.js API 聚合层

```typescript
// 参考: examples/nextjs/api-route-handler.ts

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get('locale') || 'en'
  
  const data = await keystoneClient.query({
    query: GET_HOME_CONTENT,
    variables: { locale }
  })
  
  return Response.json(transformData(data, locale))
}
```

---

### 示例 3: 生成 Sitemap

```typescript
// 参考: examples/seo/sitemap-generation.ts

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchProducts()
  
  return products.map(product => ({
    url: `https://busrom.com/en/shop/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))
}
```

---

## 📚 详细示例说明

### Keystone Schema 示例

**文件**: `examples/keystone/schema-examples.ts`

**包含**:
- ✅ 单例模型 (`HomePage`)
- ✅ 多语言字段定义（24+ 种语言）
- ✅ 关系型字段（一对一、一对多、多对多）
- ✅ 组件 JSON 字段
- ✅ 权限控制（RBAC）

---

### 多语言实现示例

**文件**: `examples/keystone/i18n-implementation.ts`

**包含**:
- ✅ 字段级多语言 Schema 设计
- ✅ GraphQL 查询时的语言字段动态选择
- ✅ API 响应的扁平化转换
- ✅ 回退机制（找不到翻译时返回默认语言）

---

### AWS S3 上传示例

**文件**: `examples/keystone/s3-upload.ts`

**包含**:
- ✅ AWS SDK v3 配置
- ✅ 图片上传到 S3
- ✅ 使用 Sharp 生成缩略图
- ✅ Keystone Hook 中集成上传逻辑

---

### API Route Handler 示例

**文件**: `examples/nextjs/api-route-handler.ts`

**包含**:
- ✅ 从 Keystone GraphQL API 获取数据
- ✅ 数据聚合和转换（多个 GraphQL 查询 → 单个 RESTful 响应）
- ✅ 缓存策略（ISR、Redis）
- ✅ 错误处理

---

### 前端埋点 SDK 示例

**文件**: `examples/cdp/tracking-sdk.ts`

**包含**:
- ✅ Session 管理（生成、存储、过期检测）
- ✅ 事件追踪（页面浏览、表单提交、点击）
- ✅ 自动追踪（页面浏览、SPA 路由变化）
- ✅ 批量发送（减少请求次数）

---

## 🛠️ 如何使用这些示例

### 方法 1: 直接复制粘贴

```bash
# 1. 复制示例文件到你的项目
cp examples/keystone/schema-examples.ts keystone/schemas/Product.ts

# 2. 根据需求修改
# 3. 运行项目
```

---

### 方法 2: 作为参考学习

1. 阅读示例代码中的**注释**
2. 理解**设计模式**和**最佳实践**
3. 根据你的项目需求进行**改编**

---

### 方法 3: 使用 Claude Code

将示例代码和你的需求一起提供给 Claude Code：

```markdown
请参考 `examples/keystone/schema-examples.ts` 中的多语言实现，
为我创建一个 `Blog` 模型，需要支持 24+ 种语言。
```

---

## ⚠️ 注意事项

1. **环境变量**: 所有示例代码中的 `process.env.XXX` 需要在 `.env` 文件中配置
2. **依赖安装**: 确保安装了示例代码中使用的所有 npm 包
3. **版本兼容**: 示例代码基于文档中指定的技术栈版本

---

## 🤝 贡献指南

如果你发现示例代码有问题或可以改进，请：

1. 在项目 Issue 中提出
2. 或直接提交 Pull Request

---

## 📖 相关文档

- [00 - 项目总览](../00-项目总览.md)
- [01 - 前端开发指南](../01-前端开发指南.md)
- [02 - 后端 API 契约](../02-后端API契约.md)
- [03 - CMS 数据模型](../03-CMS数据模型/README.md)
- [04 - SEO 技术规范](../04-SEO技术规范.md)
- [05 - CDP 系统设计](../05-CDP系统设计.md)

---

**最后更新**: 2025-10-31
**维护者**: Busrom 开发团队