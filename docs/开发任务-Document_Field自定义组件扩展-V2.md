# Document Field 自定义组件扩展 - 开发任务文档 V2

> **创建日期**: 2025-11-06
> **文档版本**: 2.0
> **文档状态**: 待开发
> **优先级**: 高
> **预计工期**: 6-9 工作日

---

## 📋 项目背景

### 当前状态

在Busrom CMS系统中，以下四个模型使用了**关系型多语言内容翻译方案**：

- **Product** (产品) - `ProductContentTranslation`
- **ProductSeries** (产品系列) - `ProductSeriesContentTranslation`
- **Blog** (博客) - `BlogContentTranslation`
- **Application** (应用案例) - `ApplicationContentTranslation`

这些ContentTranslation表中的 `content` 字段都使用了 **Keystone Document Field**。

### 核心概念澄清

#### ContentTranslation的单语言架构

```typescript
// ProductSeriesContentTranslation 示例
{
  id: "clx123...",
  locale: "en",  // 单一语言标识
  content: [     // Document JSON - 这个content本身就是单一语言的
    { "type": "paragraph", "children": [{ "text": "This is English content" }] }
  ],
  productSeries: { connect: { id: "clx456..." } }
}
```

**关键理解**：
- ❌ **错误**：每个组件块需要24个语言字段（如 `caption_en`, `caption_zh`...）
- ✅ **正确**：每个ContentTranslation记录本身就代表一种语言，组件块内的文本字段应该是**单一语言**的

### 问题说明

根据Keystone官方文档（<https://keystonejs.com/docs/guides/document-field-demo>），Document Field支持通过工具栏右侧的 **"+" 按钮**添加**自定义组件 (Component Blocks)**。

官方原文：
> "The really cool stuff is behind the + button on the right of the toolbar – these are the Custom Components."

**但是**，我们目前的Document Field配置中**没有启用任何自定义组件**。

### 需求目标

我们需要实现**三种类型的"组件"**：

1. **Keystone原生Component Blocks（自定义组件块）** - 用于结构化数据（如单张图片、视频嵌入）
2. **图章模板（Document Template）** - 预编辑的Document JSON片段，应用后可自由编辑
3. **复用块（Reusable Block）** - 预编辑的Document JSON片段，通过引用关系保持同步

---

## 🎯 三种组件类型对比

| 特性 | **自定义组件块<br>(Component Blocks)** | **图章模板<br>(Document Template)** | **复用块<br>(Reusable Block)** |
|------|------|------|------|
| **本质** | Keystone原生Component Block | 预编辑的Document JSON | 预编辑的Document JSON |
| **存储位置** | 直接存在document JSON中 | DocumentTemplate表 | ReusableBlock表 |
| **插入方式** | 点击"+"按钮选择 | 点击"+"选择，然后应用模板 | 点击"+"选择，存储引用ID |
| **应用后** | 结构化组件 | **JSON数组拼接**，变成普通节点 | 保持引用，不展开 |
| **修改影响** | 只影响当前文档 | 只影响当前文档（已应用） | **影响所有引用处** |
| **数据结构** | 结构化字段（text, select等） | 完整的Document JSON | 完整的Document JSON |
| **前端渲染** | 自定义renderer | 正常渲染（已展开为普通节点） | 动态加载并递归渲染 |
| **典型用途** | 单张图片、视频、CTA按钮 | 产品介绍模板、FAQ模板 | 全局页脚、统一表单 |
| **版本控制** | 不需要 | 不需要 | 需要（保留3个版本） |

---

## 📐 架构设计

### 工作流程示意

```
运营人员编辑 ProductSeriesContentTranslation (locale: "en")
    ↓
在Document Editor中点击 "+" 按钮
    ↓
选择组件类型：
    ├─ 📦 Single Image          → Component Block (结构化组件)
    ├─ 🎬 Video Embed           → Component Block (结构化组件)
    ├─ 📋 Insert Template       → 选择图章模板 → 点击"Apply" → JSON拼接
    └─ 🔗 Reusable Block        → 选择复用块 → 存储引用ID
    ↓
保存
    ↓
前端渲染：
    ├─ Component Blocks      → 自定义renderer
    ├─ 图章模板（已应用）      → 普通document节点
    └─ 复用块引用            → 查询并递归渲染
```

### 图章模板的应用机制

**关键：图章模板就是简单的JSON数组拼接**

**示例**：

当前document：
```json
[
  { "type": "heading", "children": [{ "text": "产品介绍" }] },
  { "type": "paragraph", "children": [{ "text": "段落1" }] },

  // 🔥 插入图章模板占位符
  {
    "type": "component-block",
    "component": "documentTemplate",
    "props": { "template": "template_id_123" }
  },

  { "type": "paragraph", "children": [{ "text": "段落2" }] }
]
```

点击"Apply Template"后：
```json
[
  { "type": "heading", "children": [{ "text": "产品介绍" }] },
  { "type": "paragraph", "children": [{ "text": "段落1" }] },

  // 🔥 模板内容直接拼接进来（替换占位符）
  { "type": "heading", "level": 2, "children": [{ "text": "特点标题" }] },
  { "type": "paragraph", "children": [{ "text": "特点描述..." }] },
  { "type": "component-block", "component": "singleImage", "props": {...} },

  { "type": "paragraph", "children": [{ "text": "段落2" }] }
]
```

---

## 🔧 开发任务清单

### 阶段 1: 基础架构搭建 (2天)

#### 1.1 创建Component Blocks目录

**文件结构**：

```
cms/
├── component-blocks/
│   ├── index.ts                    # 主入口，导出所有组件块
│   ├── README.md                   # 使用说明
│   ├── types.ts                    # TypeScript类型定义
│   └── components/
│       ├── single-image.tsx        # 单张图片
│       ├── image-gallery.tsx       # 图片画廊
│       ├── video-embed.tsx         # 视频嵌入
│       ├── cta-button.tsx          # CTA按钮
│       ├── quote.tsx               # 引用/评价
│       ├── notice-box.tsx          # 提示框
│       ├── hero.tsx                # Hero区块
│       ├── carousel.tsx            # 轮播图
│       ├── checklist.tsx           # 检查清单
│       ├── divider.tsx             # 分割线
│       ├── document-template.tsx   # 📋 图章模板引用
│       └── reusable-block.tsx      # 🔗 复用块引用
```

**验收标准**：
- [ ] 目录结构创建完成
- [ ] index.ts 可以正确导入和导出组件块
- [ ] TypeScript编译无错误

---

#### 1.2 创建DocumentTemplate Schema

```typescript
// cms/schemas/DocumentTemplate.ts
import { list } from '@keystone-6/core'
import { text, select, json, timestamp, relationship } from '@keystone-6/core/fields'

export const DocumentTemplate = list({
  fields: {
    // 基础信息
    key: text({
      label: 'Template Key',
      validation: { isRequired: true },
      isIndexed: 'unique',
      ui: {
        description: 'Unique identifier (e.g., "product-intro-template")'
      }
    }),

    name: text({
      label: 'Template Name',
      validation: { isRequired: true },
    }),

    description: text({
      label: 'Description',
      ui: {
        displayMode: 'textarea',
      }
    }),

    category: select({
      label: 'Category',
      options: [
        { label: 'Product Introduction', value: 'product-intro' },
        { label: 'Feature Section', value: 'feature' },
        { label: 'FAQ Section', value: 'faq' },
        { label: 'Testimonial', value: 'testimonial' },
        { label: 'Call to Action', value: 'cta' },
        { label: 'Comparison Table', value: 'comparison' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'other',
    }),

    // 🔥 核心：Document内容
    content: json({
      label: 'Template Content',
      defaultValue: [],
      ui: {
        views: './custom-fields/DocumentEditor',
        description: '使用Document编辑器编辑模板内容（支持所有格式和组件块）'
      }
    }),

    // 预览图
    previewImage: relationship({
      label: 'Preview Image',
      ref: 'Media',
      ui: {
        displayMode: 'cards',
        cardFields: ['file', 'filename'],
      }
    }),

    // 标签
    tags: text({
      label: 'Tags',
      ui: {
        description: 'Comma-separated tags (e.g., "product, hero, banner")'
      }
    }),

    // 使用统计
    usageCount: json({
      label: 'Usage Statistics',
      defaultValue: { count: 0 },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      }
    }),

    // 状态
    status: select({
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'active',
      ui: {
        displayMode: 'segmented-control',
      }
    }),

    createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },

  ui: {
    listView: {
      initialColumns: ['name', 'category', 'status', 'updatedAt'],
      initialSort: { field: 'updatedAt', direction: 'DESC' },
    },
    labelField: 'name',
  },

  access: {
    operation: {
      query: () => true,
      create: () => true,
      update: () => true,
      delete: ({ session, item }) => {
        // 不允许删除使用次数超过10次的模板
        return (item.usageCount?.count || 0) < 10
      }
    }
  }
})
```

**验收标准**：
- [ ] DocumentTemplate表创建成功
- [ ] 可以在CMS中创建和编辑模板
- [ ] content字段使用Document编辑器

---

#### 1.3 创建ReusableBlock Schema

```typescript
// cms/schemas/ReusableBlock.ts
import { list } from '@keystone-6/core'
import { text, select, json, timestamp, relationship, integer } from '@keystone-6/core/fields'
import { SUPPORTED_LOCALES } from '../lib/languages'

export const ReusableBlock = list({
  fields: {
    key: text({
      label: 'Key',
      isIndexed: 'unique',
      validation: { isRequired: true }
    }),

    name: text({
      label: 'Name',
      validation: { isRequired: true }
    }),

    locale: select({
      label: 'Locale',
      options: SUPPORTED_LOCALES.map(l => ({ label: l.name, value: l.code })),
      defaultValue: 'en',
      validation: { isRequired: true }
    }),

    category: select({
      label: 'Category',
      options: [
        { label: 'Footer', value: 'footer' },
        { label: 'Form', value: 'form' },
        { label: 'CTA Section', value: 'cta' },
        { label: 'Navigation', value: 'navigation' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'other'
    }),

    // 🔥 核心：Document内容
    content: json({
      label: 'Block Content',
      defaultValue: [],
      ui: {
        views: './custom-fields/DocumentEditor',
      }
    }),

    // 版本历史
    versions: relationship({
      ref: 'ReusableBlockVersion.reusableBlock',
      many: true,
      ui: {
        displayMode: 'cards',
        cardFields: ['versionNumber', 'createdAt'],
        description: '版本历史（最多保留3个版本）',
        inlineCreate: false,
        inlineEdit: false,
        linkToItem: true,
      }
    }),

    status: select({
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
      ],
      defaultValue: 'active',
      ui: {
        displayMode: 'segmented-control',
      }
    }),

    updatedAt: timestamp({ db: { updatedAt: true } }),
    createdAt: timestamp({ defaultValue: { kind: 'now' } }),
  },

  hooks: {
    // 🔥 保存前，创建版本快照
    beforeOperation: async ({ operation, resolvedData, item, context }) => {
      if (operation === 'update' && item && resolvedData.content) {
        // 1. 获取下一个版本号
        const versions = await context.query.ReusableBlockVersion.findMany({
          where: { reusableBlock: { id: { equals: item.id } } },
          query: 'versionNumber',
          orderBy: { versionNumber: 'desc' },
          take: 1,
        })

        const nextVersion = versions.length > 0 ? versions[0].versionNumber + 1 : 1

        // 2. 创建新版本记录
        await context.query.ReusableBlockVersion.createOne({
          data: {
            reusableBlock: { connect: { id: item.id } },
            content: item.content,
            versionNumber: nextVersion,
          }
        })

        // 3. 清理旧版本，只保留最近3个
        const allVersions = await context.query.ReusableBlockVersion.findMany({
          where: { reusableBlock: { id: { equals: item.id } } },
          query: 'id versionNumber',
          orderBy: { versionNumber: 'desc' },
        })

        if (allVersions.length > 3) {
          const toDelete = allVersions.slice(3)
          for (const version of toDelete) {
            await context.query.ReusableBlockVersion.deleteOne({
              where: { id: version.id }
            })
          }
        }
      }
    }
  },

  ui: {
    listView: {
      initialColumns: ['name', 'locale', 'category', 'status', 'updatedAt'],
      initialSort: { field: 'updatedAt', direction: 'DESC' },
    },
    labelField: 'name',
  }
})
```

**ReusableBlockVersion Schema**：

```typescript
// cms/schemas/ReusableBlockVersion.ts
import { list } from '@keystone-6/core'
import { json, timestamp, relationship, integer } from '@keystone-6/core/fields'

export const ReusableBlockVersion = list({
  fields: {
    reusableBlock: relationship({
      ref: 'ReusableBlock.versions',
      ui: { displayMode: 'cards' }
    }),

    versionNumber: integer({
      label: 'Version Number',
      validation: { isRequired: true }
    }),

    content: json({
      label: 'Content Snapshot',
    }),

    createdAt: timestamp({
      defaultValue: { kind: 'now' }
    }),
  },

  ui: {
    listView: {
      initialColumns: ['reusableBlock', 'versionNumber', 'createdAt'],
      initialSort: { field: 'createdAt', direction: 'DESC' },
    },
    isHidden: true,
  },

  access: {
    operation: {
      query: () => true,
      create: () => true,
      update: () => false, // 版本记录不可修改
      delete: () => true,
    }
  }
})
```

**验收标准**：
- [ ] ReusableBlock和ReusableBlockVersion表创建成功
- [ ] 版本控制正常工作（保存时自动创建版本）
- [ ] 只保留最近3个版本

---

#### 1.4 更新schema.ts

```typescript
// cms/schema.ts
import { DocumentTemplate } from './schemas/DocumentTemplate'
import { ReusableBlock } from './schemas/ReusableBlock'
import { ReusableBlockVersion } from './schemas/ReusableBlockVersion'

export const lists = {
  // ... 现有的lists

  // 🔥 新增
  DocumentTemplate,
  ReusableBlock,
  ReusableBlockVersion,
}
```

**验收标准**：
- [ ] 数据库迁移成功
- [ ] CMS可以访问新的管理界面

---

### 阶段 2: 实现自定义组件块 (3天)

参考Keystone官方文档和 `docs/如何使用文档字段.md` 中的示例，实现以下10个组件块：

#### 2.1 单张图片 (Single Image)

```typescript
// cms/component-blocks/components/single-image.tsx
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const singleImage = component({
  label: '📷 Single Image',
  schema: {
    image: fields.relationship({
      label: 'Image',
      listKey: 'Media',
      selection: 'id url thumbnailUrl filename altText',
    }),
    text: fields.text({
      label: 'Caption',
      defaultValue: ''
    }),
    alignment: fields.select({
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
      defaultValue: 'center',
    }),
    size: fields.select({
      label: 'Size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Full Width', value: 'full' },
      ],
      defaultValue: 'large',
    }),
  },
  preview: (props) => {
    const image = props.fields.image.value
    const alignment = props.fields.alignment.value
    const size = props.fields.size.value

    return (
      <div style={{ textAlign: alignment }}>
        {image?.data ? (
          <img
            src={image.data.thumbnailUrl || image.data.url}
            alt={props.fields.text.value || image.data.filename}
            style={{
              maxWidth: size === 'full' ? '100%' : size === 'large' ? '80%' : size === 'medium' ? '60%' : '40%',
              borderRadius: '8px',
            }}
          />
        ) : (
          <div style={{
            padding: '40px',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            display: 'inline-block'
          }}>
            📷 Select an image
          </div>
        )}
        {props.fields.text.value && (
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            {props.fields.text.value}
          </p>
        )}
      </div>
    )
  }
})
```

---

#### 2.2 图片画廊 (Image Gallery)

```typescript
// cms/component-blocks/components/image-gallery.tsx
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const imageGallery = component({
  label: '🖼️ Image Gallery',
  schema: {
    images: fields.array(
      fields.relationship({
        label: 'Image',
        listKey: 'Media',
        selection: 'id url thumbnailUrl filename altText',
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
      defaultValue: 'grid-3',
    }),
    showCaptions: fields.checkbox({
      label: 'Show Image Captions',
      defaultValue: false,
    }),
  },
  preview: (props) => {
    const imageCount = props.fields.images.elements.length
    const layout = props.fields.layout.value

    const columns = layout === 'grid-2' ? 2 : layout === 'grid-3' ? 3 : layout === 'grid-4' ? 4 : 3

    return (
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
      }}>
        <p style={{ margin: '0 0 12px', fontWeight: 'bold' }}>
          🖼️ Image Gallery ({imageCount} {imageCount === 1 ? 'image' : 'images'})
        </p>
        <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#666' }}>
          Layout: {layout}
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '8px'
        }}>
          {props.fields.images.elements.slice(0, 6).map((img, idx) => {
            const imageData = img.value?.data
            return (
              <div key={idx} style={{
                aspectRatio: '1',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {imageData ? (
                  <img
                    src={imageData.thumbnailUrl || imageData.url}
                    alt={imageData.filename}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '24px' }}>📷</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
})
```

---

#### 2.3 视频嵌入 (Video Embed)

```typescript
// cms/component-blocks/components/video-embed.tsx
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const videoEmbed = component({
  label: '🎬 Video Embed',
  schema: {
    platform: fields.select({
      label: 'Platform',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
      ],
      defaultValue: 'youtube',
    }),
    videoId: fields.text({
      label: 'Video ID',
      validation: { isRequired: true },
    }),
    text: fields.text({
      label: 'Caption',
      defaultValue: ''
    }),
    autoplay: fields.checkbox({
      label: 'Autoplay',
      defaultValue: false,
    }),
  },
  preview: (props) => {
    const platform = props.fields.platform.value
    const videoId = props.fields.videoId.value

    const embedUrl = platform === 'youtube'
      ? `https://www.youtube.com/embed/${videoId}${props.fields.autoplay.value ? '?autoplay=1' : ''}`
      : `https://player.vimeo.com/video/${videoId}${props.fields.autoplay.value ? '?autoplay=1' : ''}`

    return (
      <div>
        {videoId ? (
          <iframe
            width="100%"
            height="315"
            src={embedUrl}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: '8px' }}
          />
        ) : (
          <div style={{
            padding: '60px',
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            🎬 Enter Video ID
          </div>
        )}
        {props.fields.text.value && (
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            {props.fields.text.value}
          </p>
        )}
      </div>
    )
  }
})
```

---

#### 2.4 CTA按钮 (Call-to-Action Button)

```typescript
// cms/component-blocks/components/cta-button.tsx
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const ctaButton = component({
  label: '🔘 CTA Button',
  schema: {
    text: fields.text({
      label: 'Button Text',
      defaultValue: 'Learn More'
    }),
    link: fields.url({
      label: 'Link URL',
      validation: { isRequired: true },
    }),
    style: fields.select({
      label: 'Style',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
      ],
      defaultValue: 'primary',
    }),
    size: fields.select({
      label: 'Size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
      defaultValue: 'medium',
    }),
    openInNewTab: fields.checkbox({
      label: 'Open in new tab',
      defaultValue: false,
    }),
  },
  preview: (props) => {
    const styles = {
      primary: { backgroundColor: '#007bff', color: 'white', border: 'none' },
      secondary: { backgroundColor: '#6c757d', color: 'white', border: 'none' },
      outline: { backgroundColor: 'transparent', color: '#007bff', border: '2px solid #007bff' },
    }

    const sizes = {
      small: { padding: '8px 16px', fontSize: '14px' },
      medium: { padding: '12px 24px', fontSize: '16px' },
      large: { padding: '16px 32px', fontSize: '18px' },
    }

    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <button
          style={{
            ...styles[props.fields.style.value],
            ...sizes[props.fields.size.value],
            fontWeight: 'bold',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {props.fields.text.value || 'Button Text'}
        </button>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
          Link: {props.fields.link.value || '(not set)'}
          {props.fields.openInNewTab.value && ' (opens in new tab)'}
        </p>
      </div>
    )
  }
})
```

---

#### 2.5 引用/评价 (Quote)

参考官方示例：

```typescript
// cms/component-blocks/components/quote.tsx
import { component, fields, NotEditable } from '@keystone-6/fields-document/component-blocks'

export const quote = component({
  label: '💬 Quote',
  schema: {
    content: fields.child({
      kind: 'block',
      placeholder: 'Quote...',
      formatting: { inlineMarks: 'inherit', softBreaks: 'inherit' },
      links: 'inherit',
    }),
    attribution: fields.child({
      kind: 'inline',
      placeholder: 'Attribution...'
    }),
  },
  preview: (props) => {
    return (
      <div
        style={{
          borderLeft: '4px solid #007bff',
          paddingLeft: '20px',
          margin: '20px 0',
        }}
      >
        <div style={{ fontStyle: 'italic', color: '#555', fontSize: '16px' }}>
          {props.fields.content.element}
        </div>
        <div style={{ fontWeight: 'bold', color: '#666', marginTop: '12px' }}>
          <NotEditable>— </NotEditable>
          {props.fields.attribution.element}
        </div>
      </div>
    )
  },
  chromeless: true,
})
```

---

#### 2.6 提示框 (Notice Box)

参考官方示例：

```typescript
// cms/component-blocks/components/notice-box.tsx
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const noticeBox = component({
  label: '💡 Notice Box',
  schema: {
    intent: fields.select({
      label: 'Intent',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
      ],
      defaultValue: 'info',
    }),
    content: fields.child({
      kind: 'block',
      placeholder: 'Notice content...',
      formatting: { inlineMarks: 'inherit', softBreaks: 'inherit' },
      links: 'inherit',
    }),
  },
  preview: (props) => {
    const colors = {
      info: { bg: '#d1ecf1', border: '#bee5eb', icon: 'ℹ️' },
      success: { bg: '#d4edda', border: '#c3e6cb', icon: '✅' },
      warning: { bg: '#fff3cd', border: '#ffeaa7', icon: '⚠️' },
      error: { bg: '#f8d7da', border: '#f5c6cb', icon: '❌' },
    }

    const style = colors[props.fields.intent.value]

    return (
      <div
        style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: style.bg,
          border: `2px solid ${style.border}`,
          display: 'flex',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '24px' }}>{style.icon}</div>
        <div style={{ flex: 1 }}>
          {props.fields.content.element}
        </div>
      </div>
    )
  },
  chromeless: true,
})
```

---

#### 2.7 Hero区块 (Hero)

参考官方示例：

```typescript
// cms/component-blocks/components/hero.tsx
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const hero = component({
  label: '🎯 Hero',
  schema: {
    imageSrc: fields.url({
      label: 'Image URL or use Media Library',
    }),
    image: fields.relationship({
      label: 'Or Select from Media Library',
      listKey: 'Media',
      selection: 'id url thumbnailUrl',
    }),
    title: fields.child({
      kind: 'inline',
      placeholder: 'Hero title...',
    }),
    content: fields.child({
      kind: 'block',
      placeholder: 'Hero content...',
      formatting: 'inherit',
      links: 'inherit',
    }),
    cta: fields.conditional(
      fields.checkbox({ label: 'Show Call to Action' }),
      {
        true: fields.object({
          text: fields.child({
            kind: 'inline',
            placeholder: 'CTA text...',
          }),
          href: fields.url({ label: 'Link' }),
        }),
        false: fields.empty(),
      }
    ),
  },
  preview: (props) => {
    const imageUrl = props.fields.image.value?.data?.url || props.fields.imageSrc.value

    return (
      <div style={{
        border: '2px solid #007bff',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#f8f9fa',
      }}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Hero"
            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
          />
        )}
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', color: '#007bff' }}>
            {props.fields.title.element}
          </h2>
          <div style={{ marginBottom: '16px' }}>
            {props.fields.content.element}
          </div>
          {props.fields.cta.discriminant && (
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
            }}>
              {props.fields.cta.value.text.element}
            </button>
          )}
        </div>
      </div>
    )
  }
})
```

---

#### 2.8 轮播图 (Carousel)

参考官方示例：

```typescript
// cms/component-blocks/components/carousel.tsx
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const carousel = component({
  label: '🎠 Carousel',
  schema: {
    items: fields.array(
      fields.object({
        title: fields.text({ label: 'Title' }),
        image: fields.url({ label: 'Image URL' }),
        text: fields.text({
          label: 'Description',
          multiline: true,
        }),
      })
    ),
  },
  preview: (props) => {
    const itemCount = props.fields.items.elements.length

    return (
      <div style={{
        border: '2px solid #6c757d',
        borderRadius: '12px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
      }}>
        <p style={{ margin: '0 0 12px', fontWeight: 'bold' }}>
          🎠 Carousel ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </p>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
          {props.fields.items.elements.map((item, idx) => (
            <div key={idx} style={{
              minWidth: '200px',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'white',
            }}>
              {item.fields.image.value && (
                <img
                  src={item.fields.image.value}
                  alt={item.fields.title.value}
                  style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                />
              )}
              <div style={{ padding: '12px' }}>
                <strong style={{ display: 'block', marginBottom: '8px' }}>
                  {item.fields.title.value || 'Item Title'}
                </strong>
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                  {item.fields.text.value || 'Description...'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
})
```

---

#### 2.9 检查清单 (Checklist)

参考官方示例：

```typescript
// cms/component-blocks/components/checklist.tsx
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const checklist = component({
  label: '✅ Checklist',
  schema: {
    items: fields.array(
      fields.object({
        isComplete: fields.checkbox({ label: 'Is Complete' }),
        content: fields.child({
          kind: 'inline',
          placeholder: 'Item...'
        }),
      })
    ),
  },
  preview: (props) => {
    return (
      <div style={{
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
      }}>
        <p style={{ margin: '0 0 12px', fontWeight: 'bold' }}>
          ✅ Checklist
        </p>
        {props.fields.items.elements.map((item, idx) => (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
            padding: '8px',
            backgroundColor: 'white',
            borderRadius: '4px',
          }}>
            <input
              type="checkbox"
              checked={item.fields.isComplete.value}
              readOnly
              style={{ cursor: 'pointer' }}
            />
            <div style={{
              flex: 1,
              textDecoration: item.fields.isComplete.value ? 'line-through' : 'none',
              color: item.fields.isComplete.value ? '#999' : '#000'
            }}>
              {item.fields.content.element}
            </div>
          </div>
        ))}
      </div>
    )
  }
})
```

---

#### 2.10 分割线 (Divider)

```typescript
// cms/component-blocks/components/divider.tsx
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const divider = component({
  label: '➖ Divider',
  schema: {
    style: fields.select({
      label: 'Style',
      options: [
        { label: 'Solid', value: 'solid' },
        { label: 'Dashed', value: 'dashed' },
        { label: 'Dotted', value: 'dotted' },
      ],
      defaultValue: 'solid',
    }),
    spacing: fields.select({
      label: 'Spacing',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
      defaultValue: 'medium',
    }),
  },
  preview: (props) => {
    const spacings = {
      small: '16px',
      medium: '32px',
      large: '48px',
    }

    return (
      <div style={{
        margin: `${spacings[props.fields.spacing.value]} 0`,
      }}>
        <hr style={{
          border: 'none',
          borderTop: `2px ${props.fields.style.value} #dee2e6`,
        }} />
      </div>
    )
  },
  chromeless: true,
})
```

---

#### 2.11 图章模板引用 (Document Template)

```typescript
// cms/component-blocks/components/document-template.tsx
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const documentTemplate = component({
  label: '📋 Insert Template',
  schema: {
    template: fields.relationship({
      label: 'Select Template',
      listKey: 'DocumentTemplate',
      selection: 'id key name description category previewImage { url thumbnailUrl }',
    })
  },
  preview: (props) => {
    const template = props.fields.template.value

    if (!template?.data) {
      return (
        <div style={{
          padding: '20px',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#999'
        }}>
          📋 Select a template to insert
        </div>
      )
    }

    const previewImage = template.data.previewImage

    return (
      <div style={{
        border: '2px solid #ffc107',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fff3cd'
      }}>
        <div style={{ fontWeight: 'bold', color: '#856404', marginBottom: '8px', fontSize: '16px' }}>
          📋 {template.data.name}
        </div>
        {template.data.description && (
          <p style={{ fontSize: '14px', color: '#856404', margin: '8px 0' }}>
            {template.data.description}
          </p>
        )}
        {previewImage && (
          <img
            src={previewImage.thumbnailUrl || previewImage.url}
            alt={template.data.name}
            style={{
              width: '100%',
              maxHeight: '200px',
              objectFit: 'cover',
              borderRadius: '4px',
              marginTop: '8px'
            }}
          />
        )}
        <div style={{
          fontSize: '12px',
          color: '#856404',
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#ffe69c',
          borderRadius: '4px',
          fontStyle: 'italic'
        }}>
          💡 Click "Apply Template" button below to insert this template's content into your document
        </div>
      </div>
    )
  }
})
```

---

#### 2.12 复用块引用 (Reusable Block)

```typescript
// cms/component-blocks/components/reusable-block.tsx
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const reusableBlockReference = component({
  label: '🔗 Reusable Block',
  schema: {
    block: fields.relationship({
      label: 'Select Reusable Block',
      listKey: 'ReusableBlock',
      selection: 'id key name locale category status',
    })
  },
  preview: (props) => {
    const block = props.fields.block.value

    if (!block?.data) {
      return (
        <div style={{
          padding: '20px',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#999'
        }}>
          🔗 Select a reusable block
        </div>
      )
    }

    return (
      <div style={{
        border: '2px solid #007bff',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#e7f3ff'
      }}>
        <div style={{ fontWeight: 'bold', color: '#0056b3', marginBottom: '8px', fontSize: '16px' }}>
          🔗 {block.data.name}
        </div>
        <div style={{ fontSize: '14px', color: '#0056b3', marginBottom: '4px' }}>
          <strong>Locale:</strong> {block.data.locale}
        </div>
        <div style={{ fontSize: '14px', color: '#0056b3', marginBottom: '4px' }}>
          <strong>Key:</strong> {block.data.key}
        </div>
        <div style={{ fontSize: '14px', color: '#0056b3' }}>
          <strong>Category:</strong> {block.data.category}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#0056b3',
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#cce5ff',
          borderRadius: '4px',
          fontStyle: 'italic'
        }}>
          ℹ️ This block's content will be loaded dynamically on the frontend. Changes to the source block will reflect everywhere it's used.
        </div>
      </div>
    )
  }
})
```

---

#### 2.13 导出所有组件块

```typescript
// cms/component-blocks/index.ts
import { singleImage } from './components/single-image'
import { imageGallery } from './components/image-gallery'
import { videoEmbed } from './components/video-embed'
import { ctaButton } from './components/cta-button'
import { quote } from './components/quote'
import { noticeBox } from './components/notice-box'
import { hero } from './components/hero'
import { carousel } from './components/carousel'
import { checklist } from './components/checklist'
import { divider } from './components/divider'
import { documentTemplate } from './components/document-template'
import { reusableBlockReference } from './components/reusable-block'

export const componentBlocks = {
  // 结构化组件
  singleImage,
  imageGallery,
  videoEmbed,
  ctaButton,
  quote,
  noticeBox,
  hero,
  carousel,
  checklist,
  divider,

  // 特殊组件
  documentTemplate,
  reusableBlockReference,
}
```

**验收标准**：
- [ ] 所有10个组件块实现完成
- [ ] 在CMS中可以通过"+"按钮看到所有组件
- [ ] 每个组件的preview正确显示
- [ ] 可以插入、编辑、删除组件块

---

### 阶段 3: 图章模板应用功能 (2天)

#### 3.1 创建自定义DocumentEditor

```tsx
// cms/custom-fields/DocumentEditorWithTemplate.tsx
import { FieldProps } from '@keystone-6/core/types'
import { useState } from 'react'
import { DocumentEditor } from '@keystone-6/fields-document/views'
import { Button } from '@keystone-ui/button'

export function DocumentEditorWithTemplate(props: FieldProps<any>) {
  const [isApplying, setIsApplying] = useState(false)

  // 🔥 查找所有documentTemplate组件块
  const findTemplateBlocks = (document: any[]) => {
    const templates: any[] = []

    function traverse(nodes: any[], path: number[] = []) {
      if (!Array.isArray(nodes)) return

      nodes.forEach((node, index) => {
        if (node.type === 'component-block' && node.component === 'documentTemplate') {
          templates.push({
            node,
            path: [...path, index],
          })
        }

        // 递归遍历children
        if (node.children && Array.isArray(node.children)) {
          traverse(node.children, [...path, index, 'children'])
        }

        // 递归遍历layout-area的children
        if (node.type === 'layout' && Array.isArray(node.children)) {
          node.children.forEach((area: any, areaIdx: number) => {
            if (area.type === 'layout-area' && Array.isArray(area.children)) {
              traverse(area.children, [...path, index, 'children', areaIdx, 'children'])
            }
          })
        }
      })
    }

    traverse(document)
    return templates
  }

  // 🔥 应用所有模板
  const applyTemplates = async () => {
    setIsApplying(true)

    try {
      const document = JSON.parse(JSON.stringify(props.value)) // 深拷贝
      const templateBlocks = findTemplateBlocks(document)

      if (templateBlocks.length === 0) {
        alert('No templates to apply')
        setIsApplying(false)
        return
      }

      // 从后往前处理，避免索引变化
      for (let i = templateBlocks.length - 1; i >= 0; i--) {
        const { path, node } = templateBlocks[i]

        // 1. 获取template的content
        const templateId = node.props?.template
        if (!templateId) continue

        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            query: `
              query GetTemplate($id: ID!) {
                documentTemplate(where: { id: $id }) {
                  id
                  content
                }
              }
            `,
            variables: { id: templateId }
          })
        })

        const result = await response.json()

        if (result.errors) {
          console.error('GraphQL errors:', result.errors)
          alert('Failed to load template: ' + result.errors[0].message)
          continue
        }

        const templateContent = result.data?.documentTemplate?.content

        if (!templateContent || !Array.isArray(templateContent)) {
          console.error('Invalid template content:', templateContent)
          continue
        }

        // 2. 🔥 定位到父数组并替换
        let current: any = document

        for (let j = 0; j < path.length - 1; j++) {
          const key = path[j]
          if (current[key] === undefined) {
            console.error('Invalid path at index', j, 'key', key)
            break
          }
          current = current[key]
        }

        const index = path[path.length - 1]

        // 🔥 关键：splice替换，删除1个元素，插入templateContent的所有元素
        if (Array.isArray(current)) {
          current.splice(index, 1, ...templateContent)
        }
      }

      // 3. 更新document
      props.onChange(document)
      alert(`✅ Applied ${templateBlocks.length} template(s) successfully!`)

    } catch (error) {
      console.error('Error applying templates:', error)
      alert('Failed to apply templates: ' + error.message)
    } finally {
      setIsApplying(false)
    }
  }

  const templateCount = findTemplateBlocks(props.value || []).length

  return (
    <div>
      <DocumentEditor {...props} />

      {/* 🔥 应用模板按钮 */}
      {templateCount > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div>
              <strong style={{ color: '#856404', fontSize: '16px' }}>
                📋 {templateCount} Template{templateCount > 1 ? 's' : ''} Ready to Apply
              </strong>
              <p style={{ fontSize: '14px', color: '#856404', margin: '4px 0 0' }}>
                Click the button to replace template placeholders with their actual content
              </p>
            </div>
            <Button
              onClick={applyTemplates}
              isLoading={isApplying}
              tone="active"
              weight="bold"
              size="large"
            >
              {isApplying ? '⏳ Applying...' : `📋 Apply Template${templateCount > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

**验收标准**：
- [ ] 插入documentTemplate组件后，显示"Apply Template"按钮
- [ ] 点击按钮后，模板内容正确展开
- [ ] 展开后的内容可以正常编辑

---

#### 3.2 更新ContentTranslation Schema

修改所有4个ContentTranslation Schema，使用新的自定义编辑器：

```typescript
// cms/schemas/ProductSeriesContentTranslation.ts
import { componentBlocks } from '../component-blocks'

content: document({
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
      center: true,
      end: true,
    },
    headingLevels: [1, 2, 3, 4, 5, 6],
    blockTypes: {
      blockquote: true,
      code: true,
    },
    softBreaks: true,
  },
  links: true,
  dividers: true,
  layouts: [
    [1, 1],
    [1, 1, 1],
    [2, 1],
    [1, 2],
    [1, 2, 1],
  ],

  // 🔥 添加component blocks
  componentBlocks,

  ui: {
    // 🔥 使用支持模板应用的自定义编辑器
    views: './custom-fields/DocumentEditorWithTemplate',
  },
}),
```

对以下文件进行相同修改：
- `cms/schemas/ProductContentTranslation.ts`
- `cms/schemas/BlogContentTranslation.ts`
- `cms/schemas/ApplicationContentTranslation.ts`

**验收标准**：
- [ ] 所有4个ContentTranslation的document field都支持组件块
- [ ] 可以正常插入和应用模板

---

### 阶段 4: 前端渲染器实现 (2天)

#### 4.1 安装依赖

```bash
cd web
npm install @keystone-6/document-renderer
```

#### 4.2 创建Document Renderer

```tsx
// web/lib/document-renderer.tsx
import { DocumentRenderer } from '@keystone-6/document-renderer'
import { InferRenderersForComponentBlocks } from '@keystone-6/fields-document/component-blocks'
import type { componentBlocks } from '../../cms/component-blocks'

type Renderers = InferRenderersForComponentBlocks<typeof componentBlocks>

export const componentBlockRenderers: Renderers = {
  // 单张图片
  singleImage: (props) => {
    const { image, text, alignment, size } = props

    const sizeMap = {
      small: '40%',
      medium: '60%',
      large: '80%',
      full: '100%',
    }

    return (
      <figure style={{ textAlign: alignment, margin: '2rem 0' }}>
        {image && (
          <img
            src={image.url}
            alt={text || image.filename}
            style={{
              maxWidth: sizeMap[size],
              height: 'auto',
              borderRadius: '8px',
            }}
            loading="lazy"
          />
        )}
        {text && (
          <figcaption style={{
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: '#666'
          }}>
            {text}
          </figcaption>
        )}
      </figure>
    )
  },

  // 图片画廊
  imageGallery: (props) => {
    const { images, layout, showCaptions } = props

    const layoutClass = `gallery-${layout}`

    return (
      <div className={`image-gallery ${layoutClass}`}>
        {images.map((img: any, idx: number) => (
          <div key={idx} className="gallery-item">
            <img
              src={img.url}
              alt={img.altText || img.filename}
              loading="lazy"
            />
            {showCaptions && img.altText && (
              <p className="gallery-caption">{img.altText}</p>
            )}
          </div>
        ))}
      </div>
    )
  },

  // 视频嵌入
  videoEmbed: (props) => {
    const { platform, videoId, text, autoplay } = props

    const embedUrl = platform === 'youtube'
      ? `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`
      : `https://player.vimeo.com/video/${videoId}${autoplay ? '?autoplay=1' : ''}`

    return (
      <div className="video-embed" style={{ margin: '2rem 0' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={embedUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '8px',
            }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {text && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            {text}
          </p>
        )}
      </div>
    )
  },

  // CTA按钮
  ctaButton: (props) => {
    const { text, link, style, size, openInNewTab } = props

    return (
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <a
          href={link}
          target={openInNewTab ? '_blank' : '_self'}
          rel={openInNewTab ? 'noopener noreferrer' : undefined}
          className={`cta-button cta-${style} cta-${size}`}
        >
          {text}
        </a>
      </div>
    )
  },

  // 引用
  quote: (props) => {
    return (
      <blockquote className="quote">
        <div className="quote-content">{props.content}</div>
        <div className="quote-attribution">— {props.attribution}</div>
      </blockquote>
    )
  },

  // 提示框
  noticeBox: (props) => {
    return (
      <div className={`notice-box notice-${props.intent}`}>
        {props.content}
      </div>
    )
  },

  // Hero
  hero: (props) => {
    const imageUrl = props.image?.url || props.imageSrc

    return (
      <div className="hero-block">
        {imageUrl && (
          <img src={imageUrl} alt="Hero" className="hero-image" />
        )}
        <div className="hero-content">
          <h2 className="hero-title">{props.title}</h2>
          <div className="hero-body">{props.content}</div>
          {props.cta.discriminant && (
            <a href={props.cta.value.href} className="hero-cta">
              {props.cta.value.text}
            </a>
          )}
        </div>
      </div>
    )
  },

  // 轮播图
  carousel: (props) => {
    return (
      <div className="carousel">
        {props.items.map((item: any, idx: number) => (
          <div key={idx} className="carousel-item">
            <img src={item.image} alt={item.title} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    )
  },

  // 检查清单
  checklist: (props) => {
    return (
      <div className="checklist">
        {props.items.map((item: any, idx: number) => (
          <div key={idx} className="checklist-item">
            <input
              type="checkbox"
              checked={item.isComplete}
              readOnly
            />
            <span className={item.isComplete ? 'completed' : ''}>
              {item.content}
            </span>
          </div>
        ))}
      </div>
    )
  },

  // 分割线
  divider: (props) => {
    const spacingMap = {
      small: '1rem',
      medium: '2rem',
      large: '3rem',
    }

    return (
      <hr
        className={`divider divider-${props.style}`}
        style={{ margin: `${spacingMap[props.spacing]} 0` }}
      />
    )
  },

  // 🔗 复用块引用
  reusableBlockReference: async (props) => {
    const block = props.block

    if (!block?.content) {
      return (
        <div className="reusable-block-error">
          ⚠️ Reusable block not found
        </div>
      )
    }

    // 🔥 递归渲染复用块的content
    return (
      <div className="reusable-block-wrapper">
        <DocumentRenderer
          document={block.content}
          componentBlocks={componentBlockRenderers}
        />
      </div>
    )
  },

  // 📋 图章模板（理论上前端不应该看到）
  documentTemplate: (props) => {
    return (
      <div className="template-not-applied-error">
        <strong>⚠️ Template Not Applied</strong>
        <p>Template "{props.template?.name}" was not applied in CMS.</p>
        <p>Please contact the content editor to apply the template.</p>
      </div>
    )
  }
}

// 🔥 导出渲染函数
export function renderDocumentContent(content: any, locale?: string) {
  if (!content) return null

  return (
    <DocumentRenderer
      document={content}
      componentBlocks={componentBlockRenderers}
    />
  )
}
```

**验收标准**：
- [ ] 所有组件块在前端正确渲染
- [ ] 复用块可以递归渲染
- [ ] 样式正确应用

---

#### 4.3 更新前端页面

```tsx
// web/app/[locale]/product/[slug]/page.tsx
import { renderDocumentContent } from '@/lib/document-renderer'

export default async function ProductPage({
  params
}: {
  params: { locale: string; slug: string }
}) {
  // 查询产品数据
  const product = await fetchProduct(params.slug, params.locale)

  return (
    <div className="product-page">
      <h1>{product.name[params.locale]}</h1>

      {/* 🔥 渲染Document内容 */}
      <div className="product-content">
        {renderDocumentContent(product.contentByLocale, params.locale)}
      </div>
    </div>
  )
}
```

对以下文件进行类似修改：
- `web/app/[locale]/product-series/[slug]/page.tsx`
- `web/app/[locale]/about-us/blog/[slug]/page.tsx`
- `web/app/[locale]/service/application/[slug]/page.tsx`

**验收标准**：
- [ ] 所有页面正确渲染Document内容
- [ ] 组件块样式正确
- [ ] 多语言切换正常

---

#### 4.4 添加样式

```css
/* web/styles/document-renderer.css */

/* 图片画廊 */
.image-gallery {
  display: grid;
  gap: 1rem;
  margin: 2rem 0;
}

.gallery-grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.gallery-grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.gallery-grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

.gallery-carousel {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
}

.gallery-item img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.gallery-caption {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

/* CTA按钮 */
.cta-button {
  display: inline-block;
  font-weight: bold;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.cta-primary {
  background-color: #007bff;
  color: white;
}

.cta-secondary {
  background-color: #6c757d;
  color: white;
}

.cta-outline {
  background-color: transparent;
  color: #007bff;
  border: 2px solid #007bff;
}

.cta-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.cta-medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.cta-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* 引用 */
.quote {
  border-left: 4px solid #007bff;
  padding-left: 1.5rem;
  margin: 2rem 0;
  font-style: italic;
  color: #555;
}

.quote-attribution {
  font-weight: bold;
  color: #666;
  margin-top: 0.75rem;
}

/* 提示框 */
.notice-box {
  padding: 1rem;
  border-radius: 8px;
  margin: 2rem 0;
}

.notice-info {
  background-color: #d1ecf1;
  border: 2px solid #bee5eb;
}

.notice-success {
  background-color: #d4edda;
  border: 2px solid #c3e6cb;
}

.notice-warning {
  background-color: #fff3cd;
  border: 2px solid #ffeaa7;
}

.notice-error {
  background-color: #f8d7da;
  border: 2px solid #f5c6cb;
}

/* Hero */
.hero-block {
  border-radius: 12px;
  overflow: hidden;
  margin: 2rem 0;
}

.hero-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.hero-content {
  padding: 2rem;
}

.hero-title {
  margin: 0 0 1rem;
  color: #007bff;
}

.hero-cta {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
}

/* 检查清单 */
.checklist {
  margin: 2rem 0;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}

.checklist-item.completed {
  text-decoration: line-through;
  color: #999;
}

/* 分割线 */
.divider {
  border: none;
  border-top: 2px solid #dee2e6;
}

.divider-dashed {
  border-top-style: dashed;
}

.divider-dotted {
  border-top-style: dotted;
}

/* 错误提示 */
.reusable-block-error,
.template-not-applied-error {
  padding: 1rem;
  border: 2px solid #dc3545;
  border-radius: 8px;
  background-color: #f8d7da;
  color: #721c24;
  margin: 2rem 0;
}
```

**验收标准**：
- [ ] 所有组件块样式正确
- [ ] 响应式布局正常
- [ ] 移动端显示正常

---

### 阶段 5: 测试与文档 (1天)

#### 5.1 功能测试

**CMS后台测试**：
- [ ] 可以创建DocumentTemplate
- [ ] 可以创建ReusableBlock
- [ ] 可以通过"+"按钮看到所有12个组件
- [ ] 可以插入documentTemplate并应用
- [ ] 可以插入reusableBlockReference
- [ ] 复用块的版本控制正常工作
- [ ] 保存和编辑功能正常

**前端渲染测试**：
- [ ] 所有组件块在前端正确渲染
- [ ] 图章模板应用后正确显示
- [ ] 复用块引用正确加载并渲染
- [ ] 多语言切换正常
- [ ] 响应式布局正常

**性能测试**：
- [ ] 页面加载速度正常
- [ ] 图片懒加载正常工作
- [ ] 复用块加载不影响性能

---

#### 5.2 编写文档

创建以下文档：

1. **cms/component-blocks/README.md** - 组件块使用指南
2. **docs/组件块开发指南.md** - 如何添加新组件块
3. **docs/图章模板使用指南.md** - 运营人员使用手册
4. **docs/复用块使用指南.md** - 运营人员使用手册

**文档内容要求**：
- 每个组件块的功能说明
- 使用示例（带截图）
- 最佳实践建议
- 常见问题解答

**验收标准**：
- [ ] 所有文档完成
- [ ] 包含使用截图
- [ ] 有清晰的示例

---

## 📝 技术要点

### 1. 单语言架构

**关键理解**：
- ContentTranslation本身就代表一种语言
- 组件块内的文本字段是**单一语言**的
- 文本字段统一使用 `text` 作为key名

### 2. 图章模板的应用机制

**核心**：就是简单的JSON数组拼接

```javascript
// 替换前
document = [A, B, TemplateBlock, C]

// 替换后（TemplateBlock.content = [D, E, F]）
document = [A, B, D, E, F, C]
```

使用 `array.splice(index, 1, ...templateContent)` 实现

### 3. 复用块的引用机制

**存储**：
```json
{
  "type": "component-block",
  "component": "reusableBlockReference",
  "props": {
    "block": "block_id_123"  // 只存ID
  }
}
```

**前端渲染**：
- GraphQL查询时带上block的content
- 使用DocumentRenderer递归渲染

### 4. 版本控制

- 每次保存ReusableBlock时自动创建版本
- 只保留最近3个版本
- 自动清理旧版本

---

## ⚠️ 注意事项

### 1. GraphQL查询

**复用块引用的查询**：

```graphql
query GetContent($slug: String!, $locale: String!) {
  productSeriesItems(where: { slug: { equals: $slug } }) {
    contentByLocale(locale: $locale) {
      locale
      content(hydrateRelationships: true)  # 🔥 重要：hydrate relationships
    }
  }
}
```

### 2. 性能考虑

- 图片使用懒加载
- 复用块查询使用缓存（后期优化）
- 避免过深的嵌套

### 3. 安全性

- URL验证
- XSS防护
- 权限控制

### 4. 数据迁移

现有的Document Field数据不会自动支持新组件块，需要：
- 运营人员手动编辑现有内容
- 或编写数据迁移脚本

---

## 🎯 验收标准总结

### CMS后台
- [ ] Document Editor右侧有"+"按钮
- [ ] 可以看到12个组件（10个标准+2个特殊）
- [ ] 图章模板可以正确应用
- [ ] 复用块引用正常工作
- [ ] 版本控制正常

### 前端网站
- [ ] 所有组件块正确渲染
- [ ] 样式正确
- [ ] 响应式布局正常
- [ ] 多语言切换正常
- [ ] 复用块动态加载正常

### 性能
- [ ] 页面加载 < 3秒
- [ ] 图片懒加载
- [ ] 无内存泄漏

### 文档
- [ ] 使用指南完整
- [ ] 有使用截图
- [ ] 有示例代码

---

## 📚 参考资料

### Keystone官方文档
- [Document Field Guide](https://keystonejs.com/docs/guides/document-fields)
- [Document Field Demo](https://keystonejs.com/docs/guides/document-field-demo)
- [Component Blocks API](https://keystonejs.com/docs/apis/fields#document)

### 项目内部文档
- `docs/如何使用文档字段.md` - Keystone Document Field完整说明
- `cms/lib/languages.ts` - 支持的语言列表

---

## 💡 后续优化建议

1. **模板库扩展** - 添加更多预设模板
2. **拖拽排序** - 增强组件块的拖拽功能
3. **预览模式** - 全屏预览功能
4. **AI辅助** - AI生成组件内容建议
5. **查询缓存** - 复用块查询缓存优化

---

**文档结束**
