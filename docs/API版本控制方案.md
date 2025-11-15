# Keystone GraphQL API 版本控制方案

**文档版本**: v1.0
**最后更新**: 2025-11-06

---

## 📋 目录

1. [为什么需要API版本控制](#为什么需要api版本控制)
2. [Keystone中的版本控制方案](#keystone中的版本控制方案)
3. [方案对比](#方案对比)
4. [推荐方案实现](#推荐方案实现)
5. [前端对接示例](#前端对接示例)
6. [最佳实践](#最佳实践)

---

## 为什么需要API版本控制

### 常见场景

1. **破坏性变更** - 字段改名、删除、类型变更
2. **多客户端支持** - 不同版本的移动App需要不同的API
3. **渐进式升级** - 新旧API共存,逐步迁移
4. **向后兼容** - 保证老客户端不受影响

### 版本控制的好处

- ✅ 保护现有客户端不受破坏性变更影响
- ✅ 允许测试新API而不影响生产环境
- ✅ 清晰的废弃(deprecation)路径
- ✅ 便于追踪API使用情况

---

## Keystone中的版本控制方案

Keystone 6是基于GraphQL的,有以下几种版本控制方案:

### 方案1: 路径版本控制(推荐 ⭐)

**核心思路**: 在URL路径中包含版本号

```
/api/graphql/v1  - 版本1
/api/graphql/v2  - 版本2
```

**优点**:
- ✅ 简单明了,版本一目了然
- ✅ 可以使用不同的schema
- ✅ 完全隔离,互不影响
- ✅ 可以独立部署和缓存

**缺点**:
- ❌ 需要维护多套schema
- ❌ 代码可能重复

### 方案2: 字段级版本控制

**核心思路**: 在同一个schema中,使用不同的字段名

```graphql
type Product {
  # v1字段
  name: String

  # v2字段
  name_v2: JSON      # 多语言JSON格式
  productName: JSON  # 更清晰的命名
}
```

**优点**:
- ✅ 无需多套schema
- ✅ 可以逐步迁移

**缺点**:
- ❌ schema会越来越臃肿
- ❌ 废弃字段难以清理

### 方案3: GraphQL @deprecated指令

**核心思路**: 使用GraphQL内置的废弃机制

```graphql
type Product {
  name: String @deprecated(reason: "使用 productName 代替")
  productName: JSON
}
```

**优点**:
- ✅ GraphQL原生支持
- ✅ 客户端工具可以显示警告
- ✅ 文档自动标注

**缺点**:
- ❌ 只能标记废弃,不能强制禁止
- ❌ 老字段仍然可用

### 方案4: 请求头版本控制

**核心思路**: 通过HTTP头指定版本

```
POST /api/graphql
Headers:
  API-Version: v2
```

**优点**:
- ✅ URL保持简洁
- ✅ 灵活控制

**缺点**:
- ❌ 实现复杂
- ❌ 缓存不友好
- ❌ 调试不便

---

## 方案对比

| 方案 | 易用性 | 维护成本 | 隔离性 | 推荐度 |
|-----|-------|---------|-------|--------|
| 路径版本控制 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 字段级版本 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| @deprecated | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| 请求头控制 | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

---

## 推荐方案实现

### 方案选择建议

**对于Busrom项目,推荐组合使用:**

1. **主方案**: 路径版本控制 (`/api/graphql/v1`, `/api/graphql/v2`)
   - 用于大版本升级
   - 破坏性变更时使用

2. **辅助方案**: @deprecated指令
   - 用于小版本迭代
   - 渐进式废弃字段

---

## 推荐方案实现: 路径版本控制

### 步骤1: 创建版本化的Schema

```typescript
// cms/schema-v1.ts
import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'

export const Product_V1 = list({
  fields: {
    sku: text({ validation: { isRequired: true } }),
    name: text(),  // v1: 简单文本
    description: text(),
  },
  graphql: {
    // 在GraphQL中注册为Product
    plural: 'products',
    singular: 'product',
  }
})

export const lists_v1 = {
  Product: Product_V1,
  // ... 其他模型
}
```

```typescript
// cms/schema-v2.ts
import { list } from '@keystone-6/core'
import { text, json } from '@keystone-6/core/fields'

export const Product_V2 = list({
  fields: {
    sku: text({ validation: { isRequired: true } }),
    name: json({   // v2: 多语言JSON
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField'
      }
    }),
    description: json({
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField'
      }
    }),
  },
  graphql: {
    plural: 'products',
    singular: 'product',
  }
})

export const lists_v2 = {
  Product: Product_V2,
  // ... 其他模型
}
```

### 步骤2: 配置多版本GraphQL端点

```typescript
// cms/keystone.ts
import { config } from '@keystone-6/core'
import { lists_v1 } from './schema-v1'
import { lists_v2 } from './schema-v2'

// 主配置(使用最新版本)
export default config({
  lists: lists_v2,  // 默认使用v2

  graphql: {
    path: '/api/graphql',  // 默认端点
    playground: true,
  },

  server: {
    extendExpressApp: (app, commonContext) => {
      const { graphqlManagementSchema } = require('@keystone-6/core/system')
      const { ApolloServer } = require('@apollo/server')
      const { expressMiddleware } = require('@apollo/server/express4')

      // V1 GraphQL端点
      const schemaV1 = graphqlManagementSchema({
        lists: lists_v1,
        // ... 其他配置
      })

      const apolloServerV1 = new ApolloServer({
        schema: schemaV1,
      })

      await apolloServerV1.start()

      app.use(
        '/api/graphql/v1',
        expressMiddleware(apolloServerV1, {
          context: async () => commonContext
        })
      )

      // V2 GraphQL端点(可选,因为默认就是v2)
      app.use(
        '/api/graphql/v2',
        (req, res, next) => {
          // 重定向到默认端点
          req.url = '/api/graphql'
          next()
        }
      )

      console.log('✅ API v1 available at /api/graphql/v1')
      console.log('✅ API v2 available at /api/graphql/v2')
    }
  }
})
```

### 步骤3: 数据库共享策略

**重要**: v1和v2使用同一个数据库,只是schema不同

```typescript
// 数据迁移脚本
// cms/migrations/migrate-to-v2.ts

/**
 * 将v1的文本字段迁移到v2的JSON字段
 */
export async function migrateToV2(context: any) {
  const products = await context.query.Product.findMany({
    query: 'id sku name description'
  })

  for (const product of products) {
    // 如果name是字符串,转换为JSON
    if (typeof product.name === 'string') {
      await context.query.Product.updateOne({
        where: { id: product.id },
        data: {
          name: {
            en: product.name,  // 默认存为英文
            zh: product.name,  // 暂时也存为相同内容
          }
        }
      })
    }
  }

  console.log(`✅ Migrated ${products.length} products to v2 format`)
}
```

---

## 简化方案: 使用@deprecated(更实用 ⭐⭐⭐⭐⭐)

如果你不想维护多套schema,可以使用更简单的方案:

### 实现步骤

```typescript
// cms/schemas/Product.ts
import { list, graphql } from '@keystone-6/core'
import { text, json } from '@keystone-6/core/fields'

export const Product = list({
  fields: {
    sku: text({ validation: { isRequired: true } }),

    // ❌ 废弃字段(v1)
    name_deprecated: text({
      label: 'Product Name (Deprecated)',
      ui: {
        description: '⚠️ 已废弃,请使用 name 字段',
        itemView: { fieldMode: 'hidden' },  // 在UI中隐藏
      },
    }),

    // ✅ 新字段(v2)
    name: json({
      label: 'Product Name (多语言)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
      },
    }),

    // 在GraphQL Schema中添加废弃标记
    name_v1: graphql.field({
      type: graphql.String,
      deprecationReason: '请使用 name 字段(多语言JSON格式)',
      resolve(item) {
        // 向后兼容: 返回英文版本
        return item.name?.en || item.name_deprecated || ''
      }
    }),
  },

  graphql: {
    // 自定义GraphQL类型,包含废弃标记
    omit: ['name_deprecated'],  // 不直接暴露废弃字段
  }
})
```

### GraphQL Schema效果

```graphql
type Product {
  id: ID!
  sku: String!

  # ✅ 新字段
  name: JSON

  # ❌ 废弃字段(仍然可用,但会显示警告)
  name_v1: String @deprecated(reason: "请使用 name 字段(多语言JSON格式)")
}
```

### 前端查询示例

```graphql
# 老客户端(v1) - 仍然可用,但会收到废弃警告
query GetProduct_V1 {
  products {
    id
    sku
    name_v1  # ⚠️ 废弃警告
  }
}

# 新客户端(v2) - 推荐使用
query GetProduct_V2 {
  products {
    id
    sku
    name     # ✅ 多语言JSON
  }
}
```

---

## 前端对接示例

### 方案1: 路径版本控制对接

```typescript
// lib/api-client-v1.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

export const clientV1 = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:3000/api/graphql/v1',
  }),
  cache: new InMemoryCache(),
})

// lib/api-client-v2.ts
export const clientV2 = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:3000/api/graphql/v2',
  }),
  cache: new InMemoryCache(),
})

// 使用
import { clientV1, clientV2 } from '@/lib/api-client'
import { gql } from '@apollo/client'

// 老客户端使用v1
const { data } = await clientV1.query({
  query: gql`
    query GetProducts {
      products {
        id
        name  # v1: 返回字符串
      }
    }
  `
})

// 新客户端使用v2
const { data } = await clientV2.query({
  query: gql`
    query GetProducts {
      products {
        id
        name  # v2: 返回JSON对象
      }
    }
  `
})
```

### 方案2: @deprecated对接(推荐)

```typescript
// lib/keystone-client.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

export const keystoneClient = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:3000/api/graphql',
  }),
  cache: new InMemoryCache(),

  // 开启废弃警告
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})

// 使用时会看到废弃警告
const { data } = await keystoneClient.query({
  query: gql`
    query GetProducts {
      products {
        id
        name_v1  # ⚠️ GraphQL Playground会显示废弃警告
      }
    }
  `
})

// 推荐: 使用新字段
const { data } = await keystoneClient.query({
  query: gql`
    query GetProducts {
      products {
        id
        name  # ✅ 新的多语言字段
      }
    }
  `
})
```

### 兼容层封装

```typescript
// utils/product-adapter.ts

/**
 * 产品数据适配器 - 统一新旧版本的数据格式
 */
export function adaptProductData(product: any, version: 'v1' | 'v2' = 'v2') {
  if (version === 'v1') {
    // v1格式: 简单字符串
    return {
      id: product.id,
      sku: product.sku,
      name: product.name_v1 || product.name?.en || '',
      description: product.description_v1 || product.description?.en || '',
    }
  }

  // v2格式: 多语言JSON
  return {
    id: product.id,
    sku: product.sku,
    name: product.name || {},
    description: product.description || {},
  }
}

// 使用示例
const { data } = await keystoneClient.query({ ... })

// 根据客户端版本适配数据
const products = data.products.map(p =>
  adaptProductData(p, isLegacyClient ? 'v1' : 'v2')
)
```

---

## 最佳实践

### 1. 版本命名规范

```
v1, v2, v3 ...           # ✅ 推荐: 简单明了
v1.0, v2.0, v2.1 ...     # ✅ 可选: 小版本迭代
2023-01, 2024-01 ...     # ❌ 不推荐: 日期版本
```

### 2. 废弃策略

```typescript
/**
 * 废弃流程:
 * 1. 添加新字段
 * 2. 标记老字段为@deprecated
 * 3. 给客户端6个月迁移期
 * 4. 删除老字段
 */

// Step 1: 添加新字段(2024-01)
name: json({ ... })

// Step 2: 标记废弃(2024-01)
name_v1: graphql.field({
  deprecationReason: '请在2024-07前迁移到 name 字段',
  ...
})

// Step 3: 监控使用情况(2024-01 ~ 2024-07)
// 使用GraphQL metrics追踪name_v1的使用情况

// Step 4: 删除(2024-07)
// 确认无人使用后,删除name_v1字段
```

### 3. 版本文档

```markdown
# API变更日志

## v2.0 (2024-01-01)

### 破坏性变更
- ❌ `Product.name` 从 `String` 改为 `JSON`(多语言支持)
- ❌ `Product.description` 从 `String` 改为 `JSON`

### 迁移指南
老查询:
​```graphql
query {
  products {
    name  # 返回字符串
  }
}
​```

新查询:
​```graphql
query {
  products {
    name  # 返回JSON对象: {"en":"...", "zh":"..."}
  }
}
​```

### 兼容性
- ✅ 提供 `name_v1` 字段向后兼容
- ⚠️ `name_v1` 将在2024-07-01废弃

## v1.0 (2023-01-01)
初始版本
```

### 4. GraphQL Playground中的版本切换

```typescript
// 在GraphQL Playground中可以这样测试不同版本:

// 测试v1
// URL: http://localhost:3000/api/graphql/v1
query GetProducts_V1 {
  products {
    name  # 返回字符串
  }
}

// 测试v2
// URL: http://localhost:3000/api/graphql/v2
query GetProducts_V2 {
  products {
    name  # 返回JSON
  }
}
```

---

## 总结

### 推荐方案

对于Busrom项目,**推荐使用 @deprecated 方案**:

**理由**:
1. ✅ 实现简单,无需多套schema
2. ✅ GraphQL原生支持,生态友好
3. ✅ 可以渐进式迁移
4. ✅ 维护成本低
5. ✅ 老客户端不受影响

### 实施步骤

1. **现在(v1)**: 保持现有schema
2. **添加新字段**: 逐步添加多语言字段
3. **标记废弃**: 使用`@deprecated`标记老字段
4. **监控使用**: 追踪废弃字段的使用情况
5. **清理**: 6个月后删除废弃字段

### 如果需要大版本升级

当有重大破坏性变更时(如完全重构),可以考虑**路径版本控制**:
- `/api/graphql/v1` - 保留老版本
- `/api/graphql/v2` - 新版本

---

## 参考资源

- [GraphQL @deprecated规范](https://spec.graphql.org/June2018/#sec--deprecated)
- [API版本控制最佳实践](https://www.apollographql.com/docs/technotes/TN0012-schema-evolution/)
- [Keystone自定义端点](https://keystonejs.com/docs/guides/custom-routes)

---

**文档维护**: 技术架构团队
**最后更新**: 2025-11-06
