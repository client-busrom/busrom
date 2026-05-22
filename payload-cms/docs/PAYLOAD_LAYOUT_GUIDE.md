# Payload CMS Layout 功能指南

## 关于你的问题："keystone的document的layout，payload有吗"

Payload CMS **有** layout 功能，但实现方式与 Keystone 不同。

## Keystone Document Layout 回顾

在 Keystone 中，document layout 用于：
- 控制表单字段的布局和分组
- 使用 `ui.layout` 配置项
- 支持多列布局
- 支持字段分组和标签页

## Payload CMS 的 Layout 方案

Payload 提供了**更灵活**的布局方式：

### 方式 1: Field Groups (字段分组)

使用 `group` field type 来组织字段：

```typescript
{
  name: 'productInfo',
  type: 'group',
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'price',
      type: 'number',
    },
  ],
  admin: {
    description: 'Basic product information',
  },
}
```

### 方式 2: Tabs (标签页)

使用 `tabs` field type 来创建标签页：

```typescript
{
  type: 'tabs',
  tabs: [
    {
      label: 'Content',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'content',
          type: 'richText',
        },
      ],
    },
    {
      label: 'SEO',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
        },
      ],
    },
  ],
}
```

### 方式 3: Rows (行布局)

使用 `row` field type 来创建水平布局：

```typescript
{
  type: 'row',
  fields: [
    {
      name: 'firstName',
      type: 'text',
      admin: {
        width: '50%',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      admin: {
        width: '50%',
      },
    },
  ],
}
```

### 方式 4: Collapsible (可折叠区域)

使用 `collapsible` field type 来创建可折叠的区域：

```typescript
{
  type: 'collapsible',
  label: 'Advanced Settings',
  fields: [
    {
      name: 'customCSS',
      type: 'code',
    },
    {
      name: 'customJS',
      type: 'code',
    },
  ],
  admin: {
    initCollapsed: true,
  },
}
```

## 实际应用示例

### 示例 1: Product Collection 布局

```typescript
import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  fields: [
    // Tab 1: Basic Info
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basic Info',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'slug',
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
            },
          ],
        },
        // Tab 2: Pricing
        {
          label: 'Pricing',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'salePrice',
                  type: 'number',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        // Tab 3: Media
        {
          label: 'Media',
          fields: [
            {
              name: 'images',
              type: 'array',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
        // Tab 4: SEO
        {
          label: 'SEO',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
            },
            {
              name: 'metaDescription',
              type: 'textarea',
            },
          ],
        },
      ],
    },
  ],
}
```

### 示例 2: 使用 Collapsible 和 Group

```typescript
{
  fields: [
    // Main content
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
    },

    // Advanced options (collapsible)
    {
      type: 'collapsible',
      label: 'Advanced Options',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'customSettings',
          type: 'group',
          fields: [
            {
              name: 'enableComments',
              type: 'checkbox',
            },
            {
              name: 'featured',
              type: 'checkbox',
            },
          ],
        },
      ],
    },
  ],
}
```

## Payload vs Keystone Layout 对比

| 功能 | Keystone | Payload |
|------|----------|---------|
| 字段分组 | ✅ `ui.layout` | ✅ `group` field |
| 标签页 | ✅ Manual | ✅ `tabs` field |
| 多列布局 | ✅ Grid | ✅ `row` field |
| 可折叠区域 | ❌ | ✅ `collapsible` field |
| 自定义宽度 | ✅ | ✅ `admin.width` |
| 条件显示 | ✅ | ✅ `admin.condition` |

## 优势对比

### Payload 的优势：
1. **更灵活** - 可以嵌套 tabs、groups、rows
2. **类型安全** - TypeScript 支持更好
3. **内置功能** - collapsible、array、blocks 都是内置的
4. **响应式** - 自动适配移动端

### Keystone 的优势：
1. **简单直观** - `ui.layout` 一目了然
2. **快速上手** - 学习曲线较低

## 推荐实践

对于 Busrom CMS，推荐使用以下布局策略：

### 1. Products Collection
```typescript
// 使用 Tabs 分组不同类型的信息
- Tab 1: 基本信息 (名称、描述、分类)
- Tab 2: 规格参数 (尺寸、重量、材质)
- Tab 3: 媒体资源 (图片、视频)
- Tab 4: SEO 设置
```

### 2. Rich Text Content
```typescript
// 使用 Tabs + Collapsible
- Tab 1: 内容 (富文本编辑器)
- Tab 2: 元数据 (标题、摘要、标签)
- Tab 3: 高级选项 (自定义脚本、样式)
  - Collapsible: 自定义 CSS
  - Collapsible: 自定义 JS
```

### 3. Forms
```typescript
// 使用 Row + Group
- Row: 并排显示相关字段
- Group: 逻辑分组字段
```

## 实施建议

基于 Busrom 项目的需求，建议：

1. **立即采用**：
   - Products: 使用 Tabs 分组 (Basic Info, Specs, Media, SEO)
   - Blogs: 使用 Tabs (Content, SEO, Settings)
   - Pages: 使用 Tabs (Content, Layout, SEO)

2. **渐进优化**：
   - 添加 Collapsible 区域隐藏高级选项
   - 使用 Row 改善字段并排显示
   - 使用 Group 逻辑分组相关字段

3. **保持一致**：
   - 所有 collection 使用相似的 tab 结构
   - SEO tab 始终放在最后
   - Content tab 始终放在第一个

## 下一步

1. ✅ 理解 Payload Layout 系统
2. 📝 更新现有 Collections 添加更好的布局
3. 🔧 测试 Blocks 预览功能
4. 🎨 实现前端 Lexical 渲染

## 参考资料

- [Payload Fields Documentation](https://payloadcms.com/docs/fields/overview)
- [Tabs Field](https://payloadcms.com/docs/fields/tabs)
- [Group Field](https://payloadcms.com/docs/fields/group)
- [Row Field](https://payloadcms.com/docs/fields/row)
- [Collapsible Field](https://payloadcms.com/docs/fields/collapsible)
