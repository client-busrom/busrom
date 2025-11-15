# 03 - CMS 数据模型设计

> **阅读时间**: 30 分钟  
> **适用对象**: 后端开发工程师

---

## ✅ 开发任务清单

### Phase 1: 核心模型 (优先级: P0)
- [ ] `HomePage` (单例模型)
- [ ] `Media` + `MediaCategory` (媒体库+分类)
- [ ] `Category` (通用分类系统)
- [ ] `ProductSeries` (产品系列)
- [ ] `Product` (产品/SKU)

### Phase 2: 内容模型 (优先级: P1)
- [ ] `Blog` (博客文章)
- [ ] `Application` (应用案例)
- [ ] `FaqItem` (常见问题)
- [ ] `ContactForm` (表单提交)

### Phase 3: 配置模型 (优先级: P1)
- [ ] `SiteConfig` (站点配置)
- [ ] `Navigation` (导航菜单)
- [ ] `GlobalSEO` (SEO配置)

### Phase 4: 软删除与权限 (优先级: P0)
- [ ] 所有内容模型添加 `status` 字段
- [ ] `Media` 模型添加 `status` 字段
- [ ] 禁用所有物理删除操作
- [ ] 实现 RBAC 权限控制

---

## 🗂️ 多语言实现方案

### 核心决策: 分离字段 (Separate Fields) 方案

经过全面评估，本项目采用**分离字段方案**（每种语言一个独立字段），而非 JSON 嵌套方案。

#### 方案对比

| 维度 | 方案 A: JSON `{en:"...", zh:"..."}` | 方案 B: 分离字段 `name_en`, `name_zh` | 最终选择 |
|------|-----------------------------------|-----------------------------------|---------|
| **存储空间** | 240KB (24语言 × 10KB) | 240KB (24语言 × 10KB) | ✅ **完全相同** |
| **查询性能** | ❌ 500ms (全表扫描) | ✅ 50ms (索引查询) | 🔥 **B 快 10 倍** |
| **全文搜索** | ❌ 不支持 PostgreSQL FTS | ✅ 原生支持 | 🔥 **B 完胜** |
| **索引** | ❌ 无法对 JSON 内部值建索引 | ✅ 每列可独立索引 | ✅ **B** |
| **排序** | ❌ 无法 `ORDER BY name_en` | ✅ 可直接排序 | ✅ **B** |
| **GraphQL 集成** | ⚠️ 需自定义解析器 | ✅ Keystone 原生支持 | ✅ **B** |
| **类型安全** | ❌ `contentBody.en` 无类型检查 | ✅ Prisma 自动生成类型 | ✅ **B** |
| **带宽优化** | ❌ 必须返回所有 24 种语言 | ✅ 按需返回 (省 95%+ 带宽) | ✅ **B** |
| **Schema 复杂度** | ✅ 简洁 (1 个字段) | ❌ 字段多 (24 个字段) | - |
| **数据迁移** | ⚠️ 新增语言需更新每行 | ✅ 新增语言只需加列 | ✅ **B** |

**结论**: 虽然 Schema 字段数量多，但**性能、查询、索引、类型安全**等核心优势让方案 B 成为不二之选。

---

### 多语言字段命名规范

所有需要多语言的字段必须遵循以下命名规范：

```
{fieldName}_{languageCode}
```

**示例**：
- `name_en`, `name_zh`, `name_es`, `name_pt`, `name_fr`, ... (24 种语言)
- `description_en`, `description_zh`, `description_es`, ...
- `contentBody_en`, `contentBody_zh`, `contentBody_es`, ...

**支持的语言代码** (24 种):
```typescript
['en', 'zh', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'sv', 'da', 
 'no', 'fi', 'is', 'cs', 'hu', 'pl', 'sk', 'ar', 'he', 'fa', 
 'tr', 'az', 'ber', 'ku']
```

---

### Keystone Schema 实现示例

```typescript
// keystone/schemas/Product.ts
import { list } from '@keystone-6/core'
import { text, relationship, select } from '@keystone-6/core/fields'

export const Product = list({
  fields: {
    // 核心标识
    sku: text({ isIndexed: 'unique', validation: { isRequired: true } }),
    slug: text({ isIndexed: 'unique' }),
    
    // 🔥 软删除状态
    status: select({
      options: [
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Archived', value: 'ARCHIVED' },
      ],
      defaultValue: 'DRAFT',
      ui: {
        displayMode: 'segmented-control',
      }
    }),
    
    // 🌐 多语言字段：名称 (24 种语言)
    name_en: text({ 
      validation: { isRequired: true },
      ui: { 
        description: 'Product name in English (required)',
        // 在 UI 中隐藏，使用自定义多语言编辑器
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' }
      }
    }),
    name_zh: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_es: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_pt: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_fr: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_de: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_it: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_nl: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_sv: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_da: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_no: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_fi: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_is: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_cs: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_hu: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_pl: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_sk: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_ar: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_he: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_fa: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_tr: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_az: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_ber: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    name_ku: text({ ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    
    // 🔥 虚拟字段：在 CMS UI 中显示多语言编辑器
    name: virtual({
      field: graphql.field({ 
        type: graphql.JSON,
        resolve: async (item, args, context) => {
          // 聚合所有语言的 name 字段为 JSON
          return {
            en: item.name_en,
            zh: item.name_zh,
            es: item.name_es,
            pt: item.name_pt,
            fr: item.name_fr,
            de: item.name_de,
            it: item.name_it,
            nl: item.name_nl,
            sv: item.name_sv,
            da: item.name_da,
            no: item.name_no,
            fi: item.name_fi,
            is: item.name_is,
            cs: item.name_cs,
            hu: item.name_hu,
            pl: item.name_pl,
            sk: item.name_sk,
            ar: item.name_ar,
            he: item.name_he,
            fa: item.name_fa,
            tr: item.name_tr,
            az: item.name_az,
            ber: item.name_ber,
            ku: item.name_ku,
          }
        }
      }),
      ui: {
        // 🔥 使用自定义 React 组件（集成 MultilingualEditor）
        views: './custom-fields/MultilingualTextField',
        createView: { fieldMode: 'edit' },
        itemView: { fieldMode: 'edit' },
        listView: { fieldMode: 'hidden' },
      }
    }),
    
    // 🌐 多语言字段：描述 (24 种语言) - 同样的模式
    description_en: text({ ui: { displayMode: 'textarea', createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    description_zh: text({ ui: { displayMode: 'textarea', createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    // ... 其他 22 种语言
    
    description: virtual({
      field: graphql.field({ type: graphql.JSON }),
      ui: {
        views: './custom-fields/MultilingualTextareaField',
        createView: { fieldMode: 'edit' },
        itemView: { fieldMode: 'edit' },
      }
    }),
    
    // 非语言字段
    mainImage: relationship({ ref: 'Media' }),
    galleryImages: relationship({ ref: 'Media', many: true }),
    categories: relationship({ ref: 'Category', many: true }),
  },
  
  // 🔥 禁用物理删除
  access: {
    operation: {
      delete: () => false,
    }
  },
  
  ui: {
    listView: {
      initialColumns: ['sku', 'name_en', 'status'],
      initialSort: { field: 'createdAt', direction: 'DESC' },
    }
  }
})
```

---

### 自定义多语言编辑器集成

为了让运营人员在 Keystone CMS 中使用友好的多语言编辑界面，我们需要创建**自定义字段视图**。

#### 1. 多语言文本字段编辑器

```typescript
// keystone/custom-fields/MultilingualTextField.tsx
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@keystone-ui/core'
import { FieldProps } from '@keystone-6/core/types'
import { Button } from '@keystone-ui/button'
import { useState } from 'react'
import { MultilingualEditor } from '@/components/multilingual-editor'
import { SUPPORTED_LANGUAGES } from '@/constants/language'

export function MultilingualTextField({ 
  field, 
  value, 
  onChange, 
  autoFocus 
}: FieldProps<typeof controller>) {
  const [isOpen, setIsOpen] = useState(false)
  
  // 🔥 转换：Keystone 分离字段 → MultilingualContent
  const convertToMultilingualContent = () => {
    const content: Record<string, string> = {}
    SUPPORTED_LANGUAGES.forEach(lang => {
      const fieldValue = value?.[`${field.path}_${lang}`]
      if (fieldValue) {
        content[lang] = fieldValue
      }
    })
    return content
  }
  
  // 🔥 转换：MultilingualContent → Keystone 分离字段
  const handleSave = (multilingualContent: Record<string, string>) => {
    const updates: Record<string, any> = {}
    SUPPORTED_LANGUAGES.forEach(lang => {
      updates[`${field.path}_${lang}`] = {
        kind: 'value',
        value: multilingualContent[lang] || ''
      }
    })
    onChange?.(updates)
    setIsOpen(false)
  }
  
  const stats = getCompletionStats(convertToMultilingualContent())
  
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Edit {field.label} ({stats.completed}/{stats.total} languages)
      </Button>
      
      {isOpen && (
        <MultilingualEditor
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSave={handleSave}
          initialContent={convertToMultilingualContent()}
          fieldName={field.label}
          fieldType="text"
          requiredLanguages={['en']}
          enableTranslation={true}
        />
      )}
    </div>
  )
}

function getCompletionStats(content: Record<string, string>) {
  const total = SUPPORTED_LANGUAGES.length
  const completed = SUPPORTED_LANGUAGES.filter(
    lang => content[lang]?.trim()
  ).length
  return { completed, total }
}

// Keystone Controller 定义
export const controller = {
  path: 'name',
  label: 'Name',
  graphqlSelection: SUPPORTED_LANGUAGES.map(lang => `name_${lang}`).join('\n'),
  defaultValue: {},
  deserialize: (data: any) => {
    const result: Record<string, any> = {}
    SUPPORTED_LANGUAGES.forEach(lang => {
      result[`name_${lang}`] = data[`name_${lang}`]
    })
    return result
  },
  serialize: (value: any) => {
    const result: Record<string, any> = {}
    SUPPORTED_LANGUAGES.forEach(lang => {
      result[`name_${lang}`] = value[`name_${lang}`]
    })
    return result
  },
}
```

---

#### 2. 多语言 Document Field 编辑器

```typescript
// keystone/custom-fields/MultilingualDocumentField.tsx
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@keystone-ui/core'
import { FieldProps } from '@keystone-6/core/types'
import { DocumentEditor } from '@keystone-6/fields-document/views'
import { useState } from 'react'
import { SUPPORTED_LANGUAGES, LANGUAGE_FLAGS, LANGUAGE_NAMES } from '@/constants/language'

export function MultilingualDocumentField({ 
  field, 
  value, 
  onChange 
}: FieldProps<typeof controller>) {
  const [activeTab, setActiveTab] = useState('en')
  
  return (
    <div>
      {/* 语言标签页 */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {SUPPORTED_LANGUAGES.map(lang => {
          const hasContent = value?.[`${field.path}_${lang}`]
          return (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              style={{
                padding: '8px 12px',
                border: activeTab === lang ? '2px solid #007bff' : '1px solid #ddd',
                borderRadius: '4px',
                background: hasContent ? '#e8f5e9' : '#fff',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {LANGUAGE_FLAGS[lang]} {lang.toUpperCase()}
              {!hasContent && <span style={{ color: '#999' }}> ○</span>}
              {hasContent && <span style={{ color: '#4caf50' }}> ✓</span>}
            </button>
          )
        })}
      </div>
      
      {/* 当前激活语言的编辑器 */}
      {SUPPORTED_LANGUAGES.map(lang => {
        if (lang !== activeTab) return null
        
        return (
          <div key={lang} style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '4px' }}>
            <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
              {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang]}
            </div>
            <DocumentEditor
              value={value?.[`${field.path}_${lang}`] || []}
              onChange={(newValue) => {
                onChange?.({
                  ...value,
                  [`${field.path}_${lang}`]: {
                    kind: 'value',
                    value: newValue
                  }
                })
              }}
              componentBlocks={componentBlocks}
            />
          </div>
        )
      })}
    </div>
  )
}

export const controller = {
  path: 'contentBody',
  label: 'Content Body',
  graphqlSelection: SUPPORTED_LANGUAGES.map(lang => `contentBody_${lang}`).join('\n'),
  defaultValue: {},
  deserialize: (data: any) => {
    const result: Record<string, any> = {}
    SUPPORTED_LANGUAGES.forEach(lang => {
      result[`contentBody_${lang}`] = data[`contentBody_${lang}`]
    })
    return result
  },
  serialize: (value: any) => {
    const result: Record<string, any> = {}
    SUPPORTED_LANGUAGES.forEach(lang => {
      result[`contentBody_${lang}`] = value[`contentBody_${lang}`]
    })
    return result
  },
}
```

---

## 📋 核心模型详细定义

### 1. HomePage (首页管理) - 单例模型

**特点**: CMS 中**有且仅有一项**，不可删除，不可新增。

```typescript
// keystone/schemas/HomePage.ts
import { list } from '@keystone-6/core'
import { text, relationship, json } from '@keystone-6/core/fields'

export const HomePage = list({
  fields: {
    // SEO
    seo: relationship({ ref: 'GlobalSEO' }),
    
    // 1. Hero Banner (关联到独立列表)
    heroBanner: relationship({ ref: 'HeroBannerItem', many: true }),
    
    // 2. 产品系列轮播
    productSeriesCarousel: relationship({ 
      ref: 'ProductSeriesCarouselItem', 
      many: true 
    }),
    
    // 3-16. 其他区块 (使用 JSON 存储)
    serviceFeatures: json(),
    sphere3d: json(),
    simpleCta: json(),
    // ... 其他区块
    
    // 13. 案例展示 (关联到 Application，只显示 Published)
    caseStudies: relationship({ 
      ref: 'Application', 
      many: true,
      ui: {
        displayMode: 'cards',
        cardFields: ['name_en', 'status'],
      }
    }),
  },
  
  // 单例配置
  isSingleton: true,
  
  // 🔥 禁用删除
  access: {
    operation: {
      delete: () => false,
    }
  },
  
  ui: {
    label: '首页管理',
    singular: '首页',
    plural: '首页',
    hideCreate: true,
    hideDelete: true,
  }
})
```

---

### 2. Media (媒体库) + MediaCategory (媒体分类)

```typescript
// keystone/schemas/Media.ts
import { list } from '@keystone-6/core'
import { text, image, select, relationship, timestamp } from '@keystone-6/core/fields'
import { s3Config } from './s3-config'

export const Media = list({
  fields: {
    // 文件上传 (存储到 AWS S3)
    file: image({
      storage: 's3Config'
    }),
    
    // 🔥 Alt 文本 (多语言 - SEO 核心)
    altText_en: text({ 
      validation: { isRequired: true },
      ui: { description: 'Required for SEO' }
    }),
    altText_zh: text(),
    altText_es: text(),
    altText_pt: text(),
    altText_fr: text(),
    altText_de: text(),
    altText_nl: text(),
    altText_da: text(),
    altText_no: text(),
    altText_sv: text(),
    altText_fi: text(),
    altText_is: text(),
    altText_cs: text(),
    altText_hu: text(),
    altText_pl: text(),
    altText_sk: text(),
    altText_it: text(),
    altText_ar: text(),
    altText_ber: text(),
    altText_ku: text(),
    altText_fa: text(),
    altText_tr: text(),
    altText_he: text(),
    altText_az: text(),
    // 总共 24 种语言
    
    // 🔥 软删除状态
    status: select({
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Archived', value: 'ARCHIVED' },
      ],
      defaultValue: 'ACTIVE',
      ui: {
        displayMode: 'segmented-control',
        description: 'Archived files are hidden but not deleted'
      }
    }),
    
    // 🔥 媒体分类 (文件夹功能)
    categories: relationship({ 
      ref: 'MediaCategory.media', 
      many: true,
      ui: {
        displayMode: 'cards',
        cardFields: ['name'],
      }
    }),
    
    // 文件元信息 (自动生成)
    url: text({ 
      ui: { createView: { fieldMode: 'hidden' } },
      hooks: {
        resolveInput: ({ item }) => item?.file?.url || ''
      }
    }),
    thumbnailUrl: text({ 
      ui: { createView: { fieldMode: 'hidden' } }
    }),
    filesize: integer(),
    width: integer(),
    height: integer(),
    mimeType: text(),
    
    // 上传者
    uploadedBy: relationship({ ref: 'User' }),
    
    // 时间戳
    createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },
  
  // 🔥 禁用物理删除
  access: {
    operation: {
      delete: () => false, // V1 阶段禁止删除
    }
  },
  
  hooks: {
    // 文件上传后自动生成缩略图
    afterOperation: async ({ operation, item, context }) => {
      if (operation === 'create' && item.file) {
        // 调用 S3 Lambda 生成缩略图
        const thumbnailUrl = await generateThumbnail(item.file.url)
        await context.db.Media.updateOne({
          where: { id: item.id },
          data: { thumbnailUrl }
        })
      }
    }
  },
  
  ui: {
    listView: {
      initialColumns: ['file', 'altText_en', 'status', 'categories', 'createdAt'],
      initialSort: { field: 'createdAt', direction: 'DESC' },
    }
  }
})

// keystone/schemas/MediaCategory.ts
export const MediaCategory = list({
  fields: {
    name: text({ validation: { isRequired: true } }),
    
    // 自我关联实现子分类
    parent: relationship({ 
      ref: 'MediaCategory.children',
      ui: {
        displayMode: 'select',
      }
    }),
    children: relationship({ 
      ref: 'MediaCategory.parent', 
      many: true 
    }),
    
    // 反向关联到媒体
    media: relationship({ 
      ref: 'Media.categories', 
      many: true 
    }),
    
    // 描述
    description: text({ ui: { displayMode: 'textarea' } }),
    
    // 排序
    order: integer({ defaultValue: 0 }),
  },
  
  ui: {
    listView: {
      initialColumns: ['name', 'parent', 'order'],
      initialSort: { field: 'order', direction: 'ASC' },
    }
  }
})
```

**CMS 后台效果**：

运营人员在上传/编辑媒体时，可以：
1. 选择一个或多个分类（如"首页 Banner" > "Hero 图片"）
2. 在媒体库中按分类筛选
3. 按 `status: Active / Archived` 筛选
4. **无法删除**任何文件，只能将其状态改为 `Archived`

---

### 3. Category (通用分类)

```typescript
// keystone/schemas/Category.ts
export const Category = list({
  fields: {
    // 名称 (多语言)
    name_en: text({ validation: { isRequired: true } }),
    name_zh: text(),
    name_es: text(),
    // ... 其他 21+ 语言
    
    // Slug (唯一)
    slug: text({ isIndexed: 'unique', validation: { isRequired: true } }),
    
    // 分类类型
    type: select({
      options: [
        { label: 'Product', value: 'PRODUCT' },
        { label: 'Blog', value: 'BLOG' },
        { label: 'Application', value: 'APPLICATION' },
        { label: 'FAQ', value: 'FAQ' },
      ],
      validation: { isRequired: true }
    }),
    
    // 父级分类
    parent: relationship({ ref: 'Category.children' }),
    children: relationship({ ref: 'Category.parent', many: true }),
    
    // 描述
    description_en: text({ ui: { displayMode: 'textarea' } }),
    description_zh: text({ ui: { displayMode: 'textarea' } }),
    // ...
    
    // 排序
    order: integer({ defaultValue: 0 }),
  },
  
  ui: {
    listView: {
      initialColumns: ['name_en', 'type', 'parent', 'order'],
    }
  }
})
```

---

### 4. ProductSeries (产品系列)

```typescript
// keystone/schemas/ProductSeries.ts
export const ProductSeries = list({
  fields: {
    // 名称 (多语言)
    name_en: text({ validation: { isRequired: true } }),
    name_zh: text(),
    name_es: text(),
    // ... 其他语言
    
    // Slug
    slug: text({ isIndexed: 'unique' }),
    
    // 🔥 软删除状态
    status: select({
      options: [
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Archived', value: 'ARCHIVED' },
      ],
      defaultValue: 'DRAFT'
    }),
    
    // 分类
    category: relationship({ ref: 'Category' }),
    
    // 主视觉图
    heroImage: relationship({ ref: 'Media' }),
    
    // 🔥 动态内容区 (核心功能)
    contentBody: document({
      formatting: true,
      links: true,
      dividers: true,
      layouts: [
        [1, 1],
        [1, 1, 1],
      ],
      componentBlocks: {
        // 组件块定义 (见下文)
      }
    }),
    
    // SEO
    seo: relationship({ ref: 'GlobalSEO' }),
    
    // 排序
    order: integer(),
    
    // 时间戳
    createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },
  
  // 🔥 禁用物理删除
  access: {
    operation: {
      delete: () => false,
    }
  },
  
  ui: {
    listView: {
      initialColumns: ['name_en', 'status', 'order', 'updatedAt'],
    }
  }
})
```

---

### 5. Product (产品/SKU)

```typescript
// keystone/schemas/Product.ts
export const Product = list({
  fields: {
    // SKU (唯一标识)
    sku: text({ isIndexed: 'unique', validation: { isRequired: true } }),
    
    // 名称 (多语言)
    name_en: text({ validation: { isRequired: true } }),
    name_zh: text(),
    // ...
    
    // Slug
    slug: text({ isIndexed: 'unique' }),
    
    // 🔥 软删除状态
    status: select({
      options: [
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Archived', value: 'ARCHIVED' },
      ],
      defaultValue: 'DRAFT'
    }),
    
    // 分类 (可属于多个分类)
    categories: relationship({ ref: 'Category', many: true }),
    
    // 图片
    mainImage: relationship({ ref: 'Media' }),
    galleryImages: relationship({ ref: 'Media', many: true }),
    
    // 规格参数 (多语言键值对)
    specifications: json({
      ui: {
        views: './components/SpecificationsEditor',
        description: 'Key-value pairs with multilingual support'
      }
    }),
    
    // 动态内容区
    contentBody: document({ ... }),
    
    // SEO
    seo: relationship({ ref: 'GlobalSEO' }),
    
    // 时间戳
    createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },
  
  // 🔥 禁用物理删除
  access: {
    operation: {
      delete: () => false,
    }
  }
})
```

---

### 6. Blog (博客文章)

```typescript
// keystone/schemas/Blog.ts
export const Blog = list({
  fields: {
    // 标题 (多语言)
    title_en: text({ validation: { isRequired: true } }),
    title_zh: text(),
    // ...
    
    // Slug
    slug: text({ isIndexed: 'unique' }),
    
    // 🔥 软删除状态
    status: select({
      options: [
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Archived', value: 'ARCHIVED' },
      ],
      defaultValue: 'DRAFT'
    }),
    
    // 摘要
    excerpt_en: text({ ui: { displayMode: 'textarea' } }),
    excerpt_zh: text({ ui: { displayMode: 'textarea' } }),
    // ...
    
    // 封面图
    coverImage: relationship({ ref: 'Media' }),
    
    // 分类
    categories: relationship({ ref: 'Category', many: true }),
    
    // 作者
    author: text({ defaultValue: 'Busrom Team' }),
    
    // 动态内容区
    contentBody: document({ ... }),
    
    // SEO
    seo: relationship({ ref: 'GlobalSEO' }),
    
    // 发布时间
    publishedAt: timestamp(),
    createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },
  
  // 🔥 禁用物理删除
  access: {
    operation: {
      delete: () => false,
    }
  }
})
```

---

### 7. Application (应用案例)

```typescript
// keystone/schemas/Application.ts
export const Application = list({
  fields: {
    // 名称 (多语言)
    name_en: text({ validation: { isRequired: true } }),
    name_zh: text(),
    // ...
    
    // Slug
    slug: text({ isIndexed: 'unique' }),
    
    // 🔥 软删除状态
    status: select({
      options: [
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Archived', value: 'ARCHIVED' },
      ],
      defaultValue: 'DRAFT'
    }),
    
    // 主图
    mainImage: relationship({ ref: 'Media' }),
    
    // 相册
    images: relationship({ ref: 'Media', many: true }),
    
    // 动态内容区
    contentBody: document({ ... }),
    
    // SEO
    seo: relationship({ ref: 'GlobalSEO' }),
    
    // 时间戳
    createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },
  
  // 🔥 禁用物理删除
  access: {
    operation: {
      delete: () => false,
    }
  }
})
```

---

### 8. FaqItem (常见问题)

```typescript
// keystone/schemas/FaqItem.ts
export const FaqItem = list({
  fields: {
    // 问题 (多语言)
    question_en: text({ validation: { isRequired: true } }),
    question_zh: text(),
    // ...
    
    // 答案 (多语言)
    answer_en: text({ ui: { displayMode: 'textarea' } }),
    answer_zh: text({ ui: { displayMode: 'textarea' } }),
    // ...
    
    // 🔥 软删除状态
    status: select({
      options: [
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Archived', value: 'ARCHIVED' },
      ],
      defaultValue: 'DRAFT'
    }),
    
    // 分类
    category: relationship({ ref: 'Category' }),
    
    // 排序
    order: integer({ defaultValue: 0 }),
  },
  
  // 🔥 禁用物理删除
  access: {
    operation: {
      delete: () => false,
    }
  }
})
```

---

### 9. Navigation (导航菜单)

```typescript
// keystone/schemas/Navigation.ts
export const Navigation = list({
  fields: {
    // 名称 (多语言)
    name_en: text({ validation: { isRequired: true } }),
    name_zh: text(),
    // ...
    
    // 菜单类型
    type: select({
      options: [
        { label: 'Standard Link', value: 'STANDARD' },
        { label: 'Product Cards (with images)', value: 'PRODUCT_CARDS' },
        { label: 'Submenu (with icons)', value: 'SUBMENU' },
      ],
      defaultValue: 'STANDARD'
    }),
    
    // 图标 (SUBMENU 类型使用)
    icon: relationship({ ref: 'Media' }),
    
    // 图片 (PRODUCT_CARDS 类型使用)
    image: relationship({ ref: 'Media' }),
    
    // 父级菜单
    parent: relationship({ ref: 'Navigation.children' }),
    children: relationship({ ref: 'Navigation.parent', many: true }),
    
    // 排序
    order: integer({ defaultValue: 0 }),
    
    // 链接
    link: text(),
    
    // 是否系统菜单 (不可删除)
    isSystem: checkbox({ defaultValue: false }),
    
    // 是否显示
    visible: checkbox({ defaultValue: true }),
  },
  
  access: {
    operation: {
      // 系统菜单不可删除
      delete: ({ session, item }) => {
        return !item.isSystem
      },
    }
  },
  
  hooks: {
    validateInput: async ({ resolvedData, addValidationError, item }) => {
      if (item?.isSystem && resolvedData.isSystem === false) {
        addValidationError('System navigation items cannot be modified')
      }
    }
  }
})
```

---

### 10. ContactForm (表单提交)

```typescript
// keystone/schemas/ContactForm.ts
export const ContactForm = list({
  fields: {
    // 表单字段
    name: text({ validation: { isRequired: true } }),
    email: text({ validation: { isRequired: true } }),
    whatsapp: text(),
    companyName: text(),
    message: text({ 
      ui: { displayMode: 'textarea' },
      validation: { isRequired: true }
    }),
    
    // 处理状态
    status: select({
      options: [
        { label: 'Unread', value: 'UNREAD' },
        { label: 'Read', value: 'READ' },
        { label: 'Archived', value: 'ARCHIVED' },
      ],
      defaultValue: 'UNREAD'
    }),
    
    // 追踪字段
    source: text(), // 来源页面或产品 SKU
    locale: text(), // 用户语言
    ipAddress: text(),
    userAgent: text(),
    
    // 时间戳
    submittedAt: timestamp({ defaultValue: { kind: 'now' } }),
  },
  
  // 表单数据可以物理删除（特殊情况）
  access: {
    operation: {
      create: () => true,
      delete: ({ session }) => session?.data.role === 'ADMIN',
    }
  },
  
  ui: {
    listView: {
      initialColumns: ['name', 'email', 'status', 'submittedAt'],
      initialSort: { field: 'submittedAt', direction: 'DESC' },
    }
  }
})
```

---

## 🎨 组件块管理系统 (Component Block Manager)

### 核心需求

客户需要一个**可视化的组件块管理系统**，让运营人员可以：

1. ✅ **查看**所有可用的组件块
2. ✅ **创建**新的自定义组件块
3. ✅ **编辑**自定义组件块的配置
4. ✅ **删除**自定义组件块（有限制）
5. ✅ 在 Document Field 编辑器的 **"+" 按钮**中使用这些组件块

---

### 组件块分类与权限

| 组件块类型 | 示例 | 可删除？ | 可编辑？ |
|-----------|------|---------|---------|
| **🔒 系统模板组件块** | Single Image, Image Gallery, Video Embed | ❌ 不可删除 | ❌ 不可编辑<br>（系统预定义） |
| **🔒 复用组件块** | Global Footer, Inquiry Form | ❌ 不可删除 | ✅ 可编辑内容<br>（但不能删除） |
| **🔒 数据库引用组件块** | Product Reference, Blog Post Reference | ❌ 不可删除 | ❌ 不可编辑 |
| **✏️ 自定义模板组件块** | 运营人员创建的组件 | ✅ **可删除** | ✅ 可编辑 |

---

### 数据模型设计

#### ComponentBlockDefinition (组件块定义表)

```typescript
// keystone/schemas/ComponentBlockDefinition.ts
export const ComponentBlockDefinition = list({
  fields: {
    // 基础信息
    key: text({ 
      isIndexed: 'unique', 
      validation: { isRequired: true },
      ui: { description: 'Unique identifier (e.g., "custom-pricing-table")' }
    }),
    
    name: text({ 
      validation: { isRequired: true },
      ui: { description: 'Display name in the "+" menu' }
    }),
    
    icon: text({
      defaultValue: '📦',
      ui: { description: 'Emoji icon for the "+" menu' }
    }),
    
    description: text({
      ui: { displayMode: 'textarea', description: 'Help text for users' }
    }),
    
    // 🔥 组件块类型
    type: select({
      options: [
        { label: '📦 Template Block (模板组件块)', value: 'TEMPLATE' },
        { label: '🔗 Reusable Block (复用组件块)', value: 'REUSABLE' },
        { label: '🔗 Database Reference (数据库引用)', value: 'DATABASE_REF' },
      ],
      validation: { isRequired: true },
      ui: {
        description: 'Type determines behavior and editability'
      }
    }),
    
    // 🔥 是否为系统预定义
    isSystem: checkbox({
      defaultValue: false,
      ui: {
        description: '⚠️ System blocks cannot be deleted',
        itemView: { fieldMode: 'read' } // 只读，防止运营人员修改
      }
    }),
    
    // 🔥 字段定义 (Schema)
    schema: json({
      ui: {
        views: './custom-views/ComponentBlockSchemaEditor',
        description: 'Define the fields for this component block'
      }
    }),
    
    // 🔥 预览组件代码 (可选，高级功能)
    previewCode: text({
      ui: {
        displayMode: 'textarea',
        description: 'Optional: Custom React preview component code'
      }
    }),
    
    // 分类/标签
    category: select({
      options: [
        { label: 'Content', value: 'CONTENT' },
        { label: 'Media', value: 'MEDIA' },
        { label: 'Layout', value: 'LAYOUT' },
        { label: 'Form', value: 'FORM' },
        { label: 'Data Display', value: 'DATA_DISPLAY' },
        { label: 'Other', value: 'OTHER' },
      ],
      defaultValue: 'OTHER'
    }),
    
    // 状态
    status: select({
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Deprecated', value: 'DEPRECATED' },
      ],
      defaultValue: 'ACTIVE',
      ui: {
        description: 'Only ACTIVE blocks appear in the "+" menu'
      }
    }),
    
    // 排序
    order: integer({ 
      defaultValue: 0,
      ui: { description: 'Display order in the "+" menu' }
    }),
    
    // 时间戳
    createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
    createdBy: relationship({ ref: 'User' }),
  },
  
  // 🔥 访问控制：系统块不可删除
  access: {
    operation: {
      delete: ({ session, item }) => {
        // 只有非系统块可以删除
        return !item.isSystem
      },
    }
  },
  
  hooks: {
    validateInput: async ({ resolvedData, item, addValidationError }) => {
      // 防止修改系统块的 isSystem 标志
      if (item?.isSystem && resolvedData.isSystem === false) {
        addValidationError('Cannot change system blocks to non-system')
      }
      
      // 验证 schema JSON 格式
      if (resolvedData.schema) {
        try {
          const schema = JSON.parse(resolvedData.schema)
          // 验证 schema 结构...
        } catch (e) {
          addValidationError('Invalid schema JSON format')
        }
      }
    },
    
    // 删除前检查使用情况
    beforeOperation: async ({ operation, item, context }) => {
      if (operation === 'delete') {
        // 检查是否有页面正在使用此组件块
        const usage = await checkComponentBlockUsage(item.key, context)
        if (usage.count > 0) {
          throw new Error(
            `Cannot delete: This component block is used in ${usage.count} page(s). ` +
            `Please remove all usages first.`
          )
        }
      }
    }
  },
  
  ui: {
    listView: {
      initialColumns: ['icon', 'name', 'type', 'isSystem', 'status', 'order'],
      initialSort: { field: 'order', direction: 'ASC' },
    }
  }
})
```

---

### Schema 定义格式

运营人员在 `schema` 字段中定义组件块的字段，使用简化的 JSON 格式：

#### 示例 1: 简单的定价表组件块

```json
{
  "fields": [
    {
      "name": "title_en",
      "type": "text",
      "label": "Title (English)",
      "required": true
    },
    {
      "name": "title_zh",
      "type": "text",
      "label": "Title (Chinese)"
    },
    {
      "name": "price",
      "type": "number",
      "label": "Price",
      "required": true
    },
    {
      "name": "currency",
      "type": "select",
      "label": "Currency",
      "options": ["USD", "EUR", "GBP", "CNY"],
      "defaultValue": "USD"
    },
    {
      "name": "features",
      "type": "array",
      "label": "Features",
      "itemType": "text"
    },
    {
      "name": "highlighted",
      "type": "checkbox",
      "label": "Highlight this plan"
    }
  ]
}
```

#### 示例 2: 带图片的团队成员卡片

```json
{
  "fields": [
    {
      "name": "photo",
      "type": "relationship",
      "label": "Photo",
      "relationship": "Media"
    },
    {
      "name": "name",
      "type": "text",
      "label": "Name",
      "required": true
    },
    {
      "name": "position_en",
      "type": "text",
      "label": "Position (English)"
    },
    {
      "name": "position_zh",
      "type": "text",
      "label": "Position (Chinese)"
    },
    {
      "name": "bio_en",
      "type": "textarea",
      "label": "Bio (English)"
    },
    {
      "name": "bio_zh",
      "type": "textarea",
      "label": "Bio (Chinese)"
    },
    {
      "name": "linkedin",
      "type": "url",
      "label": "LinkedIn URL"
    }
  ]
}
```

---

### 支持的字段类型

| 字段类型 | JSON 定义 | 前端渲染 | 说明 |
|---------|----------|---------|------|
| **文本** | `"type": "text"` | `<input type="text">` | 单行文本 |
| **多行文本** | `"type": "textarea"` | `<textarea>` | 长文本 |
| **数字** | `"type": "number"` | `<input type="number">` | 数值 |
| **URL** | `"type": "url"` | `<input type="url">` | 网址 |
| **Email** | `"type": "email"` | `<input type="email">` | 邮箱 |
| **复选框** | `"type": "checkbox"` | `<input type="checkbox">` | 布尔值 |
| **下拉选择** | `"type": "select"` | `<select>` | 单选 |
| **多选** | `"type": "multiselect"` | `<select multiple>` | 多选 |
| **日期** | `"type": "date"` | `<input type="date">` | 日期 |
| **颜色** | `"type": "color"` | `<input type="color">` | 颜色选择器 |
| **媒体** | `"type": "relationship"` + `"relationship": "Media"` | 媒体选择器 | 关联 Media 表 |
| **数组** | `"type": "array"` + `"itemType"` | 可重复字段组 | 列表 |
| **对象** | `"type": "object"` + `"fields"` | 嵌套字段组 | 嵌套结构 |

---

### CMS 后台界面设计

#### 1. 组件块列表页

```
┌─────────────────────────────────────────────────────────────┐
│  Component Blocks                                           │
├─────────────────────────────────────────────────────────────┤
│  [+ Create Component Block]          [Filter: All ▼]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔒 System Template Blocks (8)                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📷 Single Image                    [View Schema]      │  │
│  │ 🖼️  Image Gallery                  [View Schema]      │  │
│  │ 📐 Left Image Right Text           [View Schema]      │  │
│  │ 🎬 Video Embed                     [View Schema]      │  │
│  │ 🔘 CTA Button                      [View Schema]      │  │
│  │ 💬 Testimonial                     [View Schema]      │  │
│  │ 📊 Data Table                      [View Schema]      │  │
│  │ ⚠️  Alert Box                      [View Schema]      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  🔒 Reusable & Database Reference Blocks (3)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🔗 Reusable Block                  [View Schema]      │  │
│  │ 📦 Product Reference               [View Schema]      │  │
│  │ 📝 Blog Post Reference             [View Schema]      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ✏️ Custom Template Blocks (2)                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 💰 Pricing Table                   [Edit] [Delete]    │  │
│  │ 👤 Team Member Card                [Edit] [Delete]    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

#### 2. 创建/编辑组件块界面

```
┌──────────────────────────────────────────────────────┐
│  Create Component Block                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Basic Information                                   │
│  ┌────────────────────────────────────────────────┐ │
│  │ Key *           [pricing-table            ]    │ │
│  │ Name *          [💰 Pricing Table          ]    │ │
│  │ Icon            [💰] (Emoji picker)            │ │
│  │ Description     [A customizable pricing...]    │ │
│  │ Type *          [📦 Template Block ▼]          │ │
│  │ Category        [Data Display ▼]               │ │
│  │ Status          [⚪ Active ▼]                   │ │
│  │ Order           [10]                            │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Field Schema                                        │
│  ┌────────────────────────────────────────────────┐ │
│  │ [+ Add Field]                                  │ │
│  │                                                │ │
│  │ ┌─ Field 1 ──────────────────────────────┐    │ │
│  │ │ Name:        [title_en]                │    │ │
│  │ │ Type:        [Text ▼]                  │    │ │
│  │ │ Label:       [Title (English)]         │    │ │
│  │ │ Required:    [✓]                       │    │ │
│  │ │              [▲] [▼] [🗑️]              │    │ │
│  │ └────────────────────────────────────────┘    │ │
│  │                                                │ │
│  │ ┌─ Field 2 ──────────────────────────────┐    │ │
│  │ │ Name:        [price]                   │    │ │
│  │ │ Type:        [Number ▼]                │    │ │
│  │ │ Label:       [Price]                   │    │ │
│  │ │ Required:    [✓]                       │    │ │
│  │ │              [▲] [▼] [🗑️]              │    │ │
│  │ └────────────────────────────────────────┘    │ │
│  │                                                │ │
│  │ ┌─ Field 3 ──────────────────────────────┐    │ │
│  │ │ Name:        [features]                │    │ │
│  │ │ Type:        [Array ▼]                 │    │ │
│  │ │   Item Type: [Text ▼]                  │    │ │
│  │ │ Label:       [Features]                │    │ │
│  │ │              [▲] [▼] [🗑️]              │    │ │
│  │ └────────────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Preview Template (Optional, Advanced)               │
│  ┌────────────────────────────────────────────────┐ │
│  │ [Use Default Preview]  [Custom React Code]     │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  [Cancel]  [Save as Draft]  [Save & Publish]        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### 技术实现方案

#### 方案 1: 运行时动态加载（推荐）

```typescript
// keystone/dynamic-component-blocks.ts
import { component, fields } from '@keystone-6/core/component-blocks'

export async function loadDynamicComponentBlocks(context) {
  // 从数据库加载所有 ACTIVE 状态的组件块定义
  const definitions = await context.query.ComponentBlockDefinition.findMany({
    where: { status: { equals: 'ACTIVE' } },
    orderBy: { order: 'asc' }
  })
  
  const dynamicBlocks = {}
  
  for (const def of definitions) {
    const schema = JSON.parse(def.schema)
    
    // 将 JSON schema 转换为 Keystone fields
    const keystoneFields = convertJSONSchemaToKeystoneFields(schema)
    
    dynamicBlocks[def.key] = component({
      label: `${def.icon} ${def.name}`,
      schema: keystoneFields,
      preview: createDefaultPreview(def, keystoneFields)
    })
  }
  
  return dynamicBlocks
}

function convertJSONSchemaToKeystoneFields(schema) {
  const keystoneFields = {}
  
  for (const field of schema.fields) {
    switch (field.type) {
      case 'text':
        keystoneFields[field.name] = fields.text({
          label: field.label,
          validation: field.required ? { isRequired: true } : undefined
        })
        break
      
      case 'number':
        keystoneFields[field.name] = fields.integer({
          label: field.label,
          validation: field.required ? { isRequired: true } : undefined
        })
        break
      
      case 'select':
        keystoneFields[field.name] = fields.select({
          label: field.label,
          options: field.options.map(opt => ({ label: opt, value: opt })),
          defaultValue: field.defaultValue
        })
        break
      
      case 'relationship':
        keystoneFields[field.name] = fields.relationship({
          label: field.label,
          relationship: field.relationship
        })
        break
      
      case 'array':
        keystoneFields[field.name] = fields.array(
          convertSingleField({ ...field, type: field.itemType })
        )
        break
      
      // ... 其他类型
    }
  }
  
  return keystoneFields
}

function createDefaultPreview(definition, fields) {
  return (props) => {
    return (
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '16px',
        backgroundColor: '#f9f9f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px' }}>{definition.icon}</span>
          <strong>{definition.name}</strong>
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {Object.keys(fields).map(key => (
            <div key={key} style={{ marginBottom: '4px' }}>
              <strong>{fields[key].label}:</strong> {String(props.fields[key].value) || '(empty)'}
            </div>
          ))}
        </div>
      </div>
    )
  }
}
```

---

#### 方案 2: 构建时生成（性能更好，但需重启）

```typescript
// scripts/generate-component-blocks.ts
// 在 Keystone 启动前运行，将数据库中的定义生成为代码文件

import { generateComponentBlocksCode } from './generators'

async function main() {
  const definitions = await fetchComponentBlockDefinitions()
  const code = generateComponentBlocksCode(definitions)
  
  // 写入到 keystone/component-blocks/generated.ts
  await fs.writeFile('./keystone/component-blocks/generated.ts', code)
  
  console.log('✅ Component blocks generated')
}
```

**优缺点对比**：

| 方案 | 优点 | 缺点 |
|------|------|------|
| **运行时加载** | 即时生效，无需重启 | 性能略低 |
| **构建时生成** | 性能最优，代码可追踪 | 需要重启 Keystone |

**推荐**：V1 使用**运行时加载**，后期优化可改为**构建时生成**。

---

### 使用流程示例

#### 运营人员创建"定价表"组件块

1. **进入 CMS** → **Component Blocks** 页面
2. 点击 **[+ Create Component Block]**
3. 填写基本信息：
   - Key: `pricing-table`
   - Name: `💰 Pricing Table`
   - Icon: `💰`
   - Type: `Template Block`
4. 添加字段：
   - `title_en` (Text, Required)
   - `title_zh` (Text)
   - `price` (Number, Required)
   - `currency` (Select: USD/EUR/GBP/CNY)
   - `features` (Array of Text)
   - `highlighted` (Checkbox)
5. 点击 **[Save & Publish]**
6. ✅ 组件块立即出现在 Document Field 编辑器的 **"+" 按钮**菜单中

#### 在产品详情页使用新组件

1. 进入 **Product Series** → **Glass Standoff**
2. 在 `contentBody` 编辑器中点击 **"+"**
3. 看到新的 **"💰 Pricing Table"** 选项
4. 选择并配置：
   - Title: "Standard Plan"
   - Price: 299
   - Currency: USD
   - Features: ["Feature 1", "Feature 2", "Feature 3"]
5. 保存页面
6. ✅ 前端自动渲染定价表

---

### 初始系统组件块定义

在 Keystone seed 数据中预定义所有系统组件块：

```typescript
// keystone/seed-data/component-blocks.ts
export const systemComponentBlocks = [
  {
    key: 'single-image',
    name: 'Single Image',
    icon: '📷',
    type: 'TEMPLATE',
    isSystem: true, // 🔒 不可删除
    schema: JSON.stringify({
      fields: [
        { name: 'image', type: 'relationship', relationship: 'Media', required: true },
        { name: 'caption_en', type: 'text', label: 'Caption (English)' },
        { name: 'caption_zh', type: 'text', label: 'Caption (Chinese)' },
        // ... 24+ 语言
      ]
    }),
    status: 'ACTIVE',
    order: 1
  },
  
  {
    key: 'image-gallery',
    name: 'Image Gallery',
    icon: '🖼️',
    type: 'TEMPLATE',
    isSystem: true,
    schema: JSON.stringify({
      fields: [
        { name: 'images', type: 'array', itemType: { type: 'relationship', relationship: 'Media' } },
        { name: 'layout', type: 'select', options: ['grid-2', 'grid-3', 'grid-4', 'carousel'] },
      ]
    }),
    status: 'ACTIVE',
    order: 2
  },
  
  // ... 其他 6 个系统模板组件块
  
  {
    key: 'reusable-block',
    name: 'Reusable Block',
    icon: '🔗',
    type: 'REUSABLE',
    isSystem: true, // 🔒 不可删除
    schema: JSON.stringify({
      fields: [
        { name: 'block', type: 'relationship', relationship: 'ReusableBlock', required: true }
      ]
    }),
    status: 'ACTIVE',
    order: 100
  },
  
  {
    key: 'product-reference',
    name: 'Product Reference',
    icon: '📦',
    type: 'DATABASE_REF',
    isSystem: true, // 🔒 不可删除
    schema: JSON.stringify({
      fields: [
        { name: 'product', type: 'relationship', relationship: 'Product', required: true },
        { name: 'displayStyle', type: 'select', options: ['card', 'inline'] },
      ]
    }),
    status: 'ACTIVE',
    order: 101
  },
]
```

---

### 安全与限制

#### 1. 删除保护

```typescript
hooks: {
  beforeOperation: async ({ operation, item, context }) => {
    if (operation === 'delete') {
      // 检查使用情况
      const usage = await findPagesUsingComponentBlock(item.key, context)
      
      if (usage.length > 0) {
        throw new Error(
          `Cannot delete: This component block is used in ${usage.length} page(s):\n` +
          usage.map(p => `- ${p.title}`).join('\n') +
          '\n\nPlease remove all usages first.'
        )
      }
    }
  }
}
```

#### 2. Key 命名规范验证

```typescript
hooks: {
  validateInput: ({ resolvedData, addValidationError }) => {
    const key = resolvedData.key
    if (key) {
      // 只允许小写字母、数字、连字符
      if (!/^[a-z0-9-]+$/.test(key)) {
        addValidationError('Key must contain only lowercase letters, numbers, and hyphens')
      }
      
      // 禁止系统保留前缀
      if (key.startsWith('system-') || key.startsWith('keystone-')) {
        addValidationError('Keys cannot start with "system-" or "keystone-"')
      }
    }
  }
}
```

#### 3. Schema 复杂度限制

```typescript
// 限制字段数量和嵌套深度，防止性能问题
const MAX_FIELDS = 20
const MAX_NESTING_DEPTH = 3

function validateSchema(schema, depth = 0) {
  if (depth > MAX_NESTING_DEPTH) {
    throw new Error('Schema nesting too deep')
  }
  
  if (schema.fields.length > MAX_FIELDS) {
    throw new Error(`Too many fields (max ${MAX_FIELDS})`)
  }
  
  // 递归验证嵌套字段
  for (const field of schema.fields) {
    if (field.type === 'object' && field.fields) {
      validateSchema({ fields: field.fields }, depth + 1)
    }
  }
}
```

---

## 🧩 组件块系统架构设计

### 核心概念

在 Keystone Document Field 中，**所有复杂的内容结构**都通过 **"+" 按钮**插入的**组件块 (Component Blocks)** 来实现。

```
┌─────────────────────────────────────────────────────┐
│  Document Field 编辑器                               │
├─────────────────────────────────────────────────────┤
│  工具栏：                                            │
│  [B] [I] [U] ... (基础格式化)                       │
│  [Layouts] (多列布局)                                │
│  [+] ← 这里是组件块的入口！                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  点击 "+" 按钮后，弹出组件库：                        │
│                                                     │
│  ┌─────────────────────────────────────┐            │
│  │  📦 模板组件块 (Template Blocks)     │            │
│  │  ├─ 单张图片                         │            │
│  │  ├─ 图片画廊                         │            │
│  │  ├─ 左图右文 / 右图左文               │            │
│  │  ├─ 视频嵌入                         │            │
│  │  ├─ CTA 按钮                         │            │
│  │  ├─ 引用/评价                        │            │
│  │  ├─ 数据表格                         │            │
│  │  └─ 警告/提示框                      │            │
│  │                                      │            │
│  │  🔗 复用组件块 (Reusable Blocks)     │            │
│  │  ├─ 全局页脚                         │            │
│  │  ├─ 统一询价表单                     │            │
│  │  ├─ 产品对比表                       │            │
│  │  └─ 自定义复用块...                  │            │
│  │                                      │            │
│  │  🔗 数据库引用组件                    │            │
│  │  ├─ 产品引用                         │            │
│  │  ├─ 博客文章引用                     │            │
│  │  └─ 案例引用                         │            │
│  └─────────────────────────────────────┘            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 两种组件块类型对比

| 特性 | **📦 模板组件块** | **🔗 复用组件块** |
|------|------------------|------------------|
| **英文名** | Template Blocks | Reusable Blocks |
| **插入方式** | 点击 "+" 按钮选择 | 点击 "+" 按钮选择 |
| **存储方式** | 数据**直接嵌入**当前文档的 JSON 中 | 存储一个**引用 ID**，实际内容在 `ReusableBlock` 表 |
| **修改影响范围** | 只影响**当前页面** | 影响**所有**引用了它的页面 |
| **典型用途** | 页面特有的内容（如产品详情页的规格表） | 跨页面共享的内容（如全局页脚、统一表单） |
| **类比** | 🖨️ 复印 (图章式复刻) | 🔗 快捷方式 (全局链接) |

---

### 实现原理

#### 模板组件块 (Template Blocks)

**数据存储示例**：

```json
// ProductSeries.contentBody (存储在数据库中)
{
  "type": "component-block",
  "component": "imageGallery",
  "props": {
    "images": [
      { "id": "media_123", "url": "...", "altText": "..." },
      { "id": "media_456", "url": "...", "altText": "..." }
    ],
    "layout": "grid-3",
    "showCaptions": true
  }
}
```

**特点**：
- 数据**完整地**存储在当前文档中
- 修改此组件**不会**影响其他页面
- 如果图片 `media_123` 在数据库中被删除，前端需要处理**断链**

---

#### 复用组件块 (Reusable Blocks)

**数据存储示例**：

```json
// ProductSeries.contentBody (只存储引用)
{
  "type": "component-block",
  "component": "reusableBlock",
  "props": {
    "blockId": "reusable_global_footer" // 只存储 ID
  }
}

// ReusableBlock 表中的实际数据
{
  "id": "reusable_global_footer",
  "key": "global-footer",
  "name": "Global Footer",
  "type": "FOOTER",
  "content_en": { /* 完整的 Document Field JSON */ },
  "content_zh": { /* 完整的 Document Field JSON */ },
  // ...
}
```

**特点**：
- 当前文档只存储一个 **ID 引用**
- 实际内容存储在 `ReusableBlock` 表中
- 修改 `ReusableBlock` 后，**所有**引用它的页面会**自动同步更新**

---

### 运营人员使用体验

#### 场景 1: 插入模板组件块（图片画廊）

1. 在编辑器中点击 **"+" 按钮**
2. 从弹出菜单选择 **"📦 Image Gallery"**
3. 在配置面板中：
   - 选择 3 张图片
   - 选择布局：Grid (3 columns)
   - 勾选"显示图片说明"
4. 点击"插入"
5. ✅ 图片画廊出现在编辑器中

**如果修改**：
- 只能在**当前页面**重新打开此组件进行编辑
- 修改**不会**影响其他页面的图片画廊

---

#### 场景 2: 插入复用组件块（全局页脚）

1. 在编辑器中点击 **"+" 按钮**
2. 从弹出菜单选择 **"🔗 Reusable Block"**
3. 从下拉列表中选择 **"Global Footer"**
4. 点击"插入"
5. ✅ 全局页脚的预览出现在编辑器中

**如果修改**：
- 需要去 **CMS 的 "Reusable Blocks" 管理页面**
- 找到 "Global Footer" 条目并编辑
- 保存后，**所有**引用了它的页面会**自动更新**

---

### Keystone 配置实现

#### componentBlocks 定义（所有组件都在这里）

```typescript
// keystone/component-blocks/index.ts
import { component, fields } from '@keystone-6/core/component-blocks'

export const componentBlocks = {
  // ============================================
  // 📦 模板组件块 (Template Blocks)
  // ============================================
  
  singleImage: component({
    label: '📷 Single Image',
    schema: { /* ... */ },
    preview: (props) => { /* ... */ }
  }),
  
  imageGallery: component({
    label: '🖼️ Image Gallery',
    schema: { /* ... */ },
    preview: (props) => { /* ... */ }
  }),
  
  leftImageRightText: component({
    label: '📐 Left Image Right Text',
    schema: { /* ... */ },
    preview: (props) => { /* ... */ }
  }),
  
  videoEmbed: component({
    label: '🎬 Video Embed',
    schema: { /* ... */ },
    preview: (props) => { /* ... */ }
  }),
  
  ctaButton: component({
    label: '🔘 CTA Button',
    schema: { /* ... */ },
    preview: (props) => { /* ... */ }
  }),
  
  testimonial: component({
    label: '💬 Testimonial',
    schema: { /* ... */ },
    preview: (props) => { /* ... */ }
  }),
  
  dataTable: component({
    label: '📊 Data Table',
    schema: { /* ... */ },
    preview: (props) => { /* ... */ }
  }),
  
  alertBox: component({
    label: '⚠️ Alert Box',
    schema: { /* ... */ },
    preview: (props) => { /* ... */ }
  }),
  
  // ============================================
  // 🔗 复用组件块 (Reusable Blocks)
  // ============================================
  
  reusableBlock: component({
    label: '🔗 Reusable Block',
    schema: {
      block: fields.relationship({ 
        label: 'Select Reusable Block', 
        relationship: 'ReusableBlock',
        selection: 'id key name type'
      }),
    },
    preview: (props) => {
      const block = props.fields.block.value?.data
      if (!block) {
        return (
          <div style={{ 
            border: '2px dashed #ccc', 
            padding: '20px', 
            borderRadius: '8px',
            textAlign: 'center',
            color: '#999'
          }}>
            Select a reusable block...
          </div>
        )
      }
      
      return (
        <div style={{ 
          border: '2px solid #007bff', 
          padding: '20px', 
          borderRadius: '8px',
          backgroundColor: '#f0f8ff'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>🔗</span>
            <strong style={{ color: '#007bff' }}>{block.name}</strong>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#666' 
          }}>
            This is a globally managed block. Changes will affect all pages using it.
          </p>
          <p style={{ 
            margin: '8px 0 0', 
            fontSize: '12px', 
            color: '#999' 
          }}>
            Key: <code>{block.key}</code> | Type: {block.type}
          </p>
        </div>
      )
    }
  }),
  
  // ============================================
  // 🔗 数据库引用组件
  // ============================================
  
  productReference: component({
    label: '📦 Product Reference',
    schema: {
      product: fields.relationship({ 
        label: 'Select Product', 
        relationship: 'Product',
        selection: 'id sku name_en mainImage { url altText_en }'
      }),
      displayStyle: fields.select({
        label: 'Display Style',
        options: [
          { label: 'Card', value: 'card' },
          { label: 'Inline', value: 'inline' },
        ],
        defaultValue: 'card'
      }),
    },
    preview: (props) => {
      const product = props.fields.product.value?.data
      if (!product) return <div>Select a product...</div>
      
      return (
        <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
          <strong>{product.name_en}</strong>
          <p>SKU: {product.sku}</p>
        </div>
      )
    }
  }),
  
  blogPostReference: component({
    label: '📝 Blog Post Reference',
    schema: {
      post: fields.relationship({ 
        label: 'Select Blog Post', 
        relationship: 'Blog',
        selection: 'id slug title_en excerpt_en'
      }),
    },
    preview: (props) => { /* ... */ }
  }),
}
```

---

### CMS 后台管理

#### 复用组件块管理界面

运营人员可以在 CMS 中看到一个专门的管理页面：

```
┌──────────────────────────────────────────────────┐
│  Reusable Blocks                                 │
├──────────────────────────────────────────────────┤
│  [+ Create Reusable Block]                       │
├──────────────────────────────────────────────────┤
│                                                  │
│  📄 Global Footer                                │
│     Key: global-footer  |  Type: FOOTER          │
│     [Edit] [View Usage]                          │
│                                                  │
│  📝 Standard Inquiry Form                        │
│     Key: inquiry-form  |  Type: CONTACT_FORM     │
│     [Edit] [View Usage]                          │
│                                                  │
│  📊 Product Comparison Table                     │
│     Key: product-comparison  |  Type: CUSTOM     │
│     [Edit] [View Usage]                          │
│                                                  │
└──────────────────────────────────────────────────┘
```

**"View Usage" 功能**（可选，但推荐实现）：

点击后显示**哪些页面正在使用此复用块**，避免误删或误改：

```
┌──────────────────────────────────────────┐
│  Usage of "Global Footer"                │
├──────────────────────────────────────────┤
│  This block is used in:                  │
│                                          │
│  • Product: Glass Standoff               │
│  • Product: Glass Clip                   │
│  • Product: Glass Hinge                  │
│  • Blog Post: 2025 Industry Trends       │
│  • Page: About Us > Our Story            │
│                                          │
│  Total: 5 pages                          │
└──────────────────────────────────────────┘
```

---

### 最佳实践建议

#### 1. 什么时候用模板组件块？

✅ **适合场景**：
- 页面特有的内容（如产品详情页的技术参数表）
- 需要个性化定制的组件
- 一次性使用的内容

❌ **不适合场景**：
- 需要跨页面保持一致的内容（用复用组件块）

---

#### 2. 什么时候用复用组件块？

✅ **适合场景**：
- 全局页脚/页眉
- 统一样式的表单（联系表单、询价表单）
- 法律声明、免责条款
- 社交媒体链接区域
- 统一的 CTA 区块

❌ **不适合场景**：
- 需要在不同页面有不同内容的组件

---

#### 3. 命名规范

**复用组件块的 Key 命名**：
- `global-footer` ✅
- `inquiry-form-standard` ✅
- `social-media-links` ✅
- `footer1` ❌（不清晰）
- `temp` ❌（无意义）

---

## 🧩 动态内容区 (Document Field) 完整配置

**Document Field** 是 Keystone 6 提供的强大富文本编辑器，支持：

1. **富文本格式化** (粗体、斜体、下划线、删除线等)
2. **标题层级** (H1-H6)
3. **列表** (有序、无序)
4. **链接** (内部、外部)
5. **代码块** (带语法高亮)
6. **引用块**
7. **分隔线**
8. **多列布局** (1/2、1/3、1/1/1 等)
9. **自定义组件块** (Component Blocks)

**参考文档**: https://keystonejs.com/docs/guides/document-field-demo

---

### Document Field 配置示例

```typescript
// keystone/schemas/ProductSeries.ts (完整配置)
import { list } from '@keystone-6/core'
import { document } from '@keystone-6/fields-document'
import { componentBlocks } from '../component-blocks'

export const ProductSeries = list({
  fields: {
    // ... 其他字段
    
    contentBody: document({
      // 🔥 富文本格式化
      formatting: {
        inlineMarks: {
          bold: true,
          italic: true,
          underline: true,
          strikethrough: true,
          code: true,
          superscript: true,
          subscript: true,
          keyboard: true,
        },
        listTypes: {
          ordered: true,
          unordered: true,
        },
        alignment: {
          center: true,    // 居中对齐
          end: true,       // 右对齐 (靠右)
        },
        // 注意：左对齐是默认的，不需要配置
        // Keystone 会自动提供 "left", "center", "right" 三种对齐方式
        headingLevels: [1, 2, 3, 4, 5, 6],
        blockTypes: {
          blockquote: true,
          code: true,
        },
        softBreaks: true,
      },
      
      // 🔥 链接
      links: true,
      
      // 🔥 分隔线
      dividers: true,
      
      // 🔥 多列布局 (Keystone 官方提供的 5 种布局)
      layouts: [
        [1, 1],           // 两列等宽 (50% / 50%)
        [1, 1, 1],        // 三列等宽 (33% / 33% / 33%)
        [1, 1, 1, 1],     // 四列等宽 (25% / 25% / 25% / 25%)
        [1, 2],           // 左窄右宽 (33% / 66%)
        [2, 1],           // 左宽右窄 (66% / 33%)
      ],
      
      // 🔥 关系引用 (可在文档中插入链接到其他内容)
      relationships: {
        product: {
          listKey: 'Product',
          label: 'Product',
          selection: 'id sku name_en',
        },
        blog: {
          listKey: 'Blog',
          label: 'Blog Post',
          selection: 'id slug title_en',
        },
      },
      
      // 🔥 自定义组件块
      componentBlocks,
      
      ui: {
        description: '拖拽组件块或使用 "/" 命令快速插入内容'
      }
    }),
  }
})
```

---

### 编辑器功能清单

#### 1. 基础格式化

| 功能 | 快捷键 | 说明 |
|------|--------|------|
| **粗体** | `Ctrl/Cmd + B` | **Bold text** |
| **斜体** | `Ctrl/Cmd + I` | *Italic text* |
| **下划线** | `Ctrl/Cmd + U` | <u>Underlined text</u> |
| **删除线** | `Ctrl/Cmd + Shift + X` | ~~Strikethrough~~ |
| **行内代码** | `` Ctrl/Cmd + ` `` | `inline code` |
| **上标** | - | X<sup>2</sup> |
| **下标** | - | H<sub>2</sub>O |
| **键盘** | - | <kbd>Ctrl</kbd> + <kbd>C</kbd> |

#### 2. 标题层级

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

快捷键：`Ctrl/Cmd + Alt + 1-6`

#### 3. 列表

```markdown
- Unordered list item 1
- Unordered list item 2
  - Nested item

1. Ordered list item 1
2. Ordered list item 2
   1. Nested item
```

快捷键：
- 无序列表：`Ctrl/Cmd + Shift + 8`
- 有序列表：`Ctrl/Cmd + Shift + 7`

#### 4. 引用块

```markdown
> This is a blockquote
> It can span multiple lines
```

#### 5. 代码块

````markdown
```javascript
function hello() {
  console.log('Hello, world!')
}
```
````

支持语法高亮的语言：
- JavaScript, TypeScript
- Python, Ruby, PHP
- HTML, CSS, SCSS
- JSON, YAML
- Markdown
- SQL
- Bash/Shell

#### 6. 链接

```markdown
[Link text](https://example.com)
```

快捷键：`Ctrl/Cmd + K`

**内部链接**：可以链接到其他 Keystone 内容项（如产品、文章）

#### 7. 分隔线

```markdown
---
```

视觉上显示为一条水平线。

#### 8. 多列布局

运营人员可以在编辑器中选择 **5 种**官方提供的列布局：

```
┌──────────────┬──────────────┐
│    Col 1     │    Col 2     │  [1, 1] - 两列等宽 (50% / 50%)
└──────────────┴──────────────┘

┌─────────┬─────────┬─────────┐
│  Col 1  │  Col 2  │  Col 3  │  [1, 1, 1] - 三列等宽 (33% / 33% / 33%)
└─────────┴─────────┴─────────┘

┌──────┬──────┬──────┬──────┐
│ Col1 │ Col2 │ Col3 │ Col4 │  [1, 1, 1, 1] - 四列等宽 (25% / 25% / 25% / 25%)
└──────┴──────┴──────┴──────┘

┌────────┬──────────────────┐
│  Col 1 │      Col 2       │  [1, 2] - 左窄右宽 (33% / 66%)
└────────┴──────────────────┘

┌──────────────────┬────────┐
│      Col 1       │  Col 2 │  [2, 1] - 左宽右窄 (66% / 33%)
└──────────────────┴────────┘
```

每列内部可以独立添加任何内容（文本、图片、组件块）。

#### 9. 文本对齐

Keystone 默认提供 **3 种文本对齐方式**：

| 对齐方式 | 说明 | 快捷键 |
|---------|------|--------|
| **左对齐** | 默认对齐方式 | `Ctrl/Cmd + Shift + L` |
| **居中对齐** | 文本居中显示 | `Ctrl/Cmd + Shift + E` |
| **右对齐** | 文本靠右显示 | `Ctrl/Cmd + Shift + R` |

**注意**：
- 左对齐是默认的，不需要在配置中显式启用
- `alignment.center: true` 启用居中对齐
- `alignment.end: true` 启用右对齐（在英文中称为 "end" 对齐）

---

### 编辑器工具栏详解

#### 主工具栏

```
┌─────────────────────────────────────────────────────────────────┐
│ [B] [I] [U] [S] H▼ [≡] [•] [#] ["] [</>] [|] [🔗] [←] [→] [↔] [+] │
└─────────────────────────────────────────────────────────────────┘
  │   │   │   │  │   │   │   │   │    │    │   │   │   │   │   │
  │   │   │   │  │   │   │   │   │    │    │   │   │   │   │   └─ 自定义组件 (重要!)
  │   │   │   │  │   │   │   │   │    │    │   │   │   │   └───── 两端对齐
  │   │   │   │  │   │   │   │   │    │    │   │   │   └─────── 右对齐
  │   │   │   │  │   │   │   │   │    │    │   │   └─────────── 居中对齐
  │   │   │   │  │   │   │   │   │    │    │   └─────────────── 左对齐
  │   │   │   │  │   │   │   │   │    │    └─────────────────── 插入链接
  │   │   │   │  │   │   │   │   │    └──────────────────────── 分隔线
  │   │   │   │  │   │   │   │   └───────────────────────────── 代码块
  │   │   │   │  │   │   │   └───────────────────────────────── 引用块
  │   │   │   │  │   │   └───────────────────────────────────── 有序列表
  │   │   │   │  │   └───────────────────────────────────────── 无序列表
  │   │   │   │  └───────────────────────────────────────────── 标题级别下拉
  │   │   │   └──────────────────────────────────────────────── 删除线
  │   │   └──────────────────────────────────────────────────── 下划线
  │   └──────────────────────────────────────────────────────── 斜体
  └──────────────────────────────────────────────────────────── 粗体
```

#### **🔥 "+" 按钮 - 自定义组件 (Custom Components)**

这是 Keystone Document Field 最强大的功能！

当运营人员点击工具栏**最右侧的 "+" 按钮**时，会弹出**自定义组件库**：

```
┌──────────────────────────────────────┐
│  Insert Custom Component             │
├──────────────────────────────────────┤
│  🖼️  Single Image                     │
│  🖼️  Image Gallery                    │
│  📐  Left Image Right Text            │
│  📐  Right Image Left Text            │
│  🎬  Video Embed                      │
│  🔘  CTA Button                       │
│  💬  Testimonial / Quote              │
│  📊  Data Table                       │
│  ⚠️  Alert / Notice Box               │
│  🔗  Reusable Block (Global Content) │
│  📦  Product Reference                │
│  📝  Blog Post Reference              │
└──────────────────────────────────────┘
```

**与普通组件块的区别**：

| 方式 | 插入方法 | 特点 |
|------|---------|------|
| **普通格式化** | 工具栏左侧按钮 | 基础文本样式、列表、引用等 |
| **"+" 自定义组件** | 工具栏最右侧 **"+" 按钮** | 复杂的结构化数据组件，可以**链接到数据库**中的其他内容 |

**自定义组件的核心优势**：

1. **结构化数据存储**：不是存储为 HTML，而是存储为 JSON 数据
2. **可编辑性强**：插入后可以随时重新打开编辑，修改参数
3. **数据库关联**：可以使用 `fields.relationship()` 链接到其他 Keystone 内容（如产品、文章）
4. **类型安全**：有明确的 Schema 定义，避免数据错误

**示例：插入"产品引用"组件**

```typescript
// 在 componentBlocks 中定义
productReference: component({
  label: 'Product Reference',
  schema: {
    // 🔥 关键：可以直接关联到数据库中的产品
    product: fields.relationship({ 
      label: 'Select Product', 
      relationship: 'Product',
      selection: 'id sku name_en mainImage { url altText_en }' // 指定要获取的字段
    }),
    displayStyle: fields.select({
      label: 'Display Style',
      options: [
        { label: 'Card', value: 'card' },
        { label: 'Inline', value: 'inline' },
        { label: 'Banner', value: 'banner' },
      ],
      defaultValue: 'card'
    }),
    showPrice: fields.checkbox({ label: 'Show Price' }),
    ctaText_en: fields.text({ label: 'CTA Text (English)', defaultValue: 'View Product' }),
    ctaText_zh: fields.text({ label: 'CTA Text (Chinese)', defaultValue: '查看产品' }),
  },
  preview: (props) => {
    const product = props.fields.product.value
    if (!product) {
      return <div style={{ padding: '20px', border: '2px dashed #ccc' }}>
        Select a product...
      </div>
    }
    
    return (
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
      }}>
        {product.data?.mainImage && (
          <img 
            src={product.data.mainImage.url} 
            alt={product.data.mainImage.altText_en}
            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
          />
        )}
        <div>
          <h4 style={{ margin: '0 0 8px' }}>{product.data?.name_en}</h4>
          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>SKU: {product.data?.sku}</p>
          <button style={{
            marginTop: '8px',
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            {props.fields.ctaText_en.value}
          </button>
        </div>
      </div>
    )
  }
}),

// 类似地，可以定义 Blog Post Reference
blogPostReference: component({
  label: 'Blog Post Reference',
  schema: {
    post: fields.relationship({ 
      label: 'Select Blog Post', 
      relationship: 'Blog',
      selection: 'id slug title_en excerpt_en coverImage { url altText_en }'
    }),
    // ... 其他字段
  },
  preview: (props) => {
    // 渲染博客文章卡片预览
  }
})
```

**运营人员使用体验**：

1. 点击 **"+"** 按钮
2. 选择 **"Product Reference"**
3. 在弹出的配置面板中：
   - 从下拉列表中**选择一个产品**（列表从数据库实时加载）
   - 选择显示样式（卡片/内联/横幅）
   - 勾选是否显示价格
   - 自定义 CTA 按钮文字
4. 点击"插入"
5. 组件立即出现在编辑器中，显示**实时的产品预览**
6. 如果产品信息在数据库中更新（如改名、换图），**此引用会自动更新**

---

### "+" 按钮自定义组件完整列表

基于项目需求，以下是推荐的自定义组件：
  // 1. 富文本
  richText: component({
    label: 'Rich Text',
    schema: {
      content: fields.child({ kind: 'block', placeholder: 'Write content...' })
    },
    preview: (props) => props.fields.content.element
  }),
  
  // 2. 单张图片
  singleImage: component({
    label: 'Single Image',
    schema: {
      image: fields.relationship({ label: 'Image', relationship: 'Media' }),
      caption_en: fields.text({ label: 'Caption (English)' }),
      caption_zh: fields.text({ label: 'Caption (Chinese)' }),
      // ... 其他语言
    },
    preview: (props) => {
      return (
        <div>
          <p>Image: {props.fields.image.value?.label}</p>
          <p>Caption: {props.fields.caption_en.value}</p>
        </div>
      )
    }
  }),
  
  // 3. 图片画廊
    
  // 2. 图片画廊
  imageGallery: component({
    label: '🖼️ Image Gallery',
    schema: {
      images: fields.array(
        fields.relationship({ 
          label: 'Image', 
          relationship: 'Media',
          selection: 'id url altText_en altText_zh thumbnailUrl'
        })
      ),
      layout: fields.select({
        label: 'Layout',
        options: [
          { label: 'Grid (2 columns)', value: 'grid-2' },
          { label: 'Grid (3 columns)', value: 'grid-3' },
          { label: 'Grid (4 columns)', value: 'grid-4' },
          { label: 'Carousel', value: 'carousel' },
          { label: 'Masonry', value: 'masonry' },
        ],
        defaultValue: 'grid-3'
      }),
      showCaptions: fields.checkbox({ label: 'Show Image Captions' }),
    },
    preview: (props) => {
      const imageCount = props.fields.images.elements.length
      return (
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '16px',
          backgroundColor: '#f9f9f9'
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>
            🖼️ Image Gallery ({imageCount} {imageCount === 1 ? 'image' : 'images'})
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            Layout: {props.fields.layout.value}
          </p>
        </div>
      )
    }
  }),
  leftImageRightText: component({
    label: 'Left Image Right Text',
    schema: {
      image: fields.relationship({ label: 'Image', relationship: 'Media' }),
      title_en: fields.text({ label: 'Title (English)' }),
      title_zh: fields.text({ label: 'Title (Chinese)' }),
      content: fields.child({ kind: 'block' }),
    },
    preview: (props) => {
      return (
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>Image</div>
          <div style={{ flex: 1 }}>
            <h3>{props.fields.title_en.value}</h3>
            {props.fields.content.element}
          </div>
        </div>
      )
    }
  }),
  
  // 6. 视频嵌入
  videoEmbed: component({
    label: 'Video Embed',
    schema: {
      platform: fields.select({
        label: 'Platform',
        options: [
          { label: 'YouTube', value: 'youtube' },
          { label: 'Vimeo', value: 'vimeo' },
        ],
        defaultValue: 'youtube'
      }),
      videoId: fields.text({ 
        label: 'Video ID',
        validation: { isRequired: true }
      }),
      caption_en: fields.text({ label: 'Caption (English)' }),
      caption_zh: fields.text({ label: 'Caption (Chinese)' }),
    },
    preview: (props) => {
      const { platform, videoId } = props.fields
      const embedUrl = platform.value === 'youtube'
        ? `https://www.youtube.com/embed/${videoId.value}`
        : `https://player.vimeo.com/video/${videoId.value}`
      
      return (
        <div>
          <iframe
            width="100%"
            height="315"
            src={embedUrl}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <p>{props.fields.caption_en.value}</p>
        </div>
      )
    }
  }),
  
  // 7. CTA 按钮
  ctaButton: component({
    label: 'CTA Button',
    schema: {
      text_en: fields.text({ label: 'Button Text (English)' }),
      text_zh: fields.text({ label: 'Button Text (Chinese)' }),
      link: fields.text({ label: 'Link URL' }),
      style: fields.select({
        label: 'Style',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Outline', value: 'outline' },
        ],
        defaultValue: 'primary'
      }),
      openInNewTab: fields.checkbox({ label: 'Open in new tab' }),
    },
    preview: (props) => {
      return (
        <button style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '8px',
          cursor: 'pointer',
          backgroundColor: props.fields.style.value === 'primary' ? '#007bff' : '#6c757d',
          color: 'white',
          border: 'none',
        }}>
          {props.fields.text_en.value || 'Button'}
        </button>
      )
    }
  }),
  
  // 8. 引用/客户评价
  testimonial: component({
    label: 'Testimonial',
    schema: {
      quote_en: fields.text({ 
        label: 'Quote (English)',
        multiline: true 
      }),
      quote_zh: fields.text({ 
        label: 'Quote (Chinese)',
        multiline: true 
      }),
      author: fields.text({ label: 'Author Name' }),
      position: fields.text({ label: 'Position/Company' }),
      avatar: fields.relationship({ label: 'Avatar', relationship: 'Media' }),
    },
    preview: (props) => {
      return (
        <blockquote style={{
          borderLeft: '4px solid #007bff',
          paddingLeft: '20px',
          fontStyle: 'italic',
          color: '#555',
        }}>
          <p>"{props.fields.quote_en.value}"</p>
          <footer>
            — <strong>{props.fields.author.value}</strong>
            {props.fields.position.value && `, ${props.fields.position.value}`}
          </footer>
        </blockquote>
      )
    }
  }),
  
  // 9. 数据表格
  dataTable: component({
    label: 'Data Table',
    schema: {
      headers: fields.array(
        fields.object({
          key: fields.text({ label: 'Key' }),
          label_en: fields.text({ label: 'Label (English)' }),
          label_zh: fields.text({ label: 'Label (Chinese)' }),
        })
      ),
      rows: fields.array(
        fields.object({
          cells: fields.text({ 
            label: 'Cells (comma-separated)',
            multiline: true 
          })
        })
      ),
      caption_en: fields.text({ label: 'Caption (English)' }),
      caption_zh: fields.text({ label: 'Caption (Chinese)' }),
    },
    preview: (props) => {
      return (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {props.fields.headers.elements.map((header, i) => (
                  <th key={i} style={{ 
                    border: '1px solid #ddd', 
                    padding: '8px',
                    backgroundColor: '#f2f2f2'
                  }}>
                    {header.fields.label_en.value}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.fields.rows.elements.map((row, i) => (
                <tr key={i}>
                  {row.fields.cells.value?.split(',').map((cell, j) => (
                    <td key={j} style={{ 
                      border: '1px solid #ddd', 
                      padding: '8px' 
                    }}>
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {props.fields.caption_en.value && (
            <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              {props.fields.caption_en.value}
            </p>
          )}
        </div>
      )
    }
  }),
  
  // 10. 警告/提示框
  alertBox: component({
    label: 'Alert Box',
    schema: {
      type: fields.select({
        label: 'Type',
        options: [
          { label: 'Info', value: 'info' },
          { label: 'Success', value: 'success' },
          { label: 'Warning', value: 'warning' },
          { label: 'Error', value: 'error' },
        ],
        defaultValue: 'info'
      }),
      title_en: fields.text({ label: 'Title (English)' }),
      title_zh: fields.text({ label: 'Title (Chinese)' }),
      content: fields.child({ kind: 'block', placeholder: 'Alert content...' }),
    },
    preview: (props) => {
      const colors = {
        info: '#d1ecf1',
        success: '#d4edda',
        warning: '#fff3cd',
        error: '#f8d7da',
      }
      return (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: colors[props.fields.type.value],
          border: `1px solid ${colors[props.fields.type.value]}`,
        }}>
          <strong>{props.fields.title_en.value}</strong>
          {props.fields.content.element}
        </div>
      )
    }
  }),
    label: 'Reusable Block',
    schema: {
      block: fields.relationship({ 
        label: 'Block', 
        relationship: 'ReusableBlock' 
      }),
    },
    preview: (props) => {
      return (
        <div style={{ 
          border: '2px dashed #ccc', 
          padding: '20px', 
          borderRadius: '8px' 
        }}>
          <p>🔗 Reusable Block: {props.fields.block.value?.label}</p>
        </div>
      )
    }
  }),
}
```

---

## 🔐 User & Role (用户权限)

```typescript
// keystone/schemas/User.ts
export const User = list({
  fields: {
    name: text({ validation: { isRequired: true } }),
    email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
    password: password(),
    
    // 角色
    role: relationship({ ref: 'Role.users' }),
    
    // 状态
    isActive: checkbox({ defaultValue: true }),
  },
  
  access: {
    operation: {
      query: () => true,
      create: ({ session }) => !!session,
      update: ({ session, item }) => {
        return session?.data.role === 'ADMIN' || session?.data.id === item.id
      },
      delete: ({ session }) => session?.data.role === 'ADMIN',
    }
  }
})

// keystone/schemas/Role.ts
export const Role = list({
  fields: {
    name: text({ validation: { isRequired: true } }),
    
    // 权限配置
    canManageContent: checkbox({ defaultValue: false }),
    canManageMedia: checkbox({ defaultValue: false }),
    canManageUsers: checkbox({ defaultValue: false }),
    canManageSettings: checkbox({ defaultValue: false }),
    canViewAnalytics: checkbox({ defaultValue: false }),
    
    users: relationship({ ref: 'User.role', many: true }),
  }
})
```

---

## 🤖 Claude Code Prompt 模板

```markdown
你好，我需要你帮我开发 Keystone 6 的数据模型。

**项目背景**:
- CMS: Keystone 6 + PostgreSQL + Prisma
- 需求文档: `/docs/03-CMS数据模型.md`

**你的任务**:
1. 在 `/keystone/schemas/` 目录下创建所有模型文件
2. 实现多语言支持 (字段级方案，24+ 语言)
3. 所有内容模型添加 `status` 字段 (Published/Draft/Archived)
4. `Media` 模型添加 `status` 字段 (Active/Archived)
5. **禁用所有物理删除操作** (`delete: () => false`)
6. 实现 `MediaCategory` 文件夹功能
7. 配置 AWS S3 图片存储

**验收标准**:
- [ ] 所有模型已创建
- [ ] 多语言字段正确定义 (24+ 语言)
- [ ] 软删除机制正常工作
- [ ] 物理删除已禁用
- [ ] 媒体分类功能正常
- [ ] CMS Admin UI 可访问

请开始工作。
```

---

**文档版本**: v1.0  
**最后更新**: 2025-01-XX