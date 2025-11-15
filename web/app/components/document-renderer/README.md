# Document Renderer

这个目录包含了用于渲染 Keystone CMS document 字段的组件。

## 文件结构

```
document-renderer/
├── DocumentRenderer.tsx    # 主渲染器组件
├── NoticeBox.tsx          # Notice Box 组件（使用 lucide-react 图标）
├── renderers.tsx          # 所有 component blocks 和 blocks 的渲染器配置
├── index.ts               # 导出文件
└── README.md              # 本文件
```

## 使用方法

### 基本用法

```tsx
import { DocumentRenderer } from '@/app/components/document-renderer'

export default function ProductPage({ product }) {
  return (
    <div>
      <h1>{product.name}</h1>

      {/* 渲染富文本内容 */}
      <DocumentRenderer
        document={product.content.document}
        className="prose prose-lg max-w-none"
      />
    </div>
  )
}
```

### GraphQL 查询

确保在 GraphQL 查询中包含 document 字段：

```graphql
query GetProduct($slug: String!) {
  product(where: { slug: $slug }) {
    id
    name
    content {
      document(hydrateRelationships: true)
    }
  }
}
```

**重要**: 设置 `hydrateRelationships: true` 来获取完整的关联数据（如图片）。

### 已支持的 Component Blocks

1. **Notice Box** - 信息提示框
   - 使用 lucide-react 图标
   - 支持 4 种类型：info, success, warning, error
   - 响应式设计，自动适配移动端

2. **Single Image** - 单张图片
   - 使用 Next.js Image 组件优化
   - 支持 caption 显示

3. **Image Gallery** - 图片画廊
   - 网格布局，响应式
   - 每张图片支持独立 caption

4. **Quote** - 引用块
   - 支持引用来源（attribution）
   - 样式化的左边框

5. **Hero** - Hero 区块
   - 支持图片、标题、内容、CTA 按钮
   - 渐变背景

6. **CTA Button** - 行动号召按钮
   - 支持 3 种变体：primary, secondary, outline

7. **Video Embed** - 视频嵌入
   - 支持 YouTube 和直接视频 URL
   - 响应式 16:9 比例

8. **Carousel** - 轮播图
   - 横向滚动
   - 支持 snap scroll

9. **Checklist** - 检查列表
   - 支持已选/未选状态
   - 带图标指示

10. **Reusable Block Reference** - 可复用块引用
    - 需要额外的 GraphQL 查询实现

## Notice Box 图标映射

CMS 和前端使用不同的图标库：

| 类型 | CMS (Keystone UI) | 前端 (lucide-react) |
|------|------------------|-------------------|
| Info | InfoIcon | Info |
| Success | CheckCircleIcon | CheckCircle |
| Warning | AlertTriangleIcon | AlertTriangle |
| Error | AlertCircleIcon | AlertCircle |

## 自定义样式

### 方式 1: 修改 NoticeBox 组件

编辑 `NoticeBox.tsx` 中的 `noticeConfigs` 对象来自定义颜色：

```tsx
const noticeConfigs = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',      // 修改背景色
    borderColor: 'border-blue-200', // 修改边框色
    textColor: 'text-blue-900',     // 修改文字色
    iconColor: 'text-blue-600',     // 修改图标色
  },
  // ...
}
```

### 方式 2: 使用 Tailwind 类名覆盖

```tsx
<DocumentRenderer
  document={content}
  className="[&_.notice-info]:bg-custom-blue-50"
/>
```

### 方式 3: 修改 renderers.tsx

直接修改 `renderers.tsx` 中的渲染逻辑。

## 添加新的 Component Block

1. 在 CMS 中创建新的 component block
2. 在 `renderers.tsx` 的 `componentBlockRenderers` 中添加对应的渲染器
3. （可选）创建单独的组件文件，类似 `NoticeBox.tsx`

示例：

```tsx
// renderers.tsx
export const componentBlockRenderers = {
  // ...其他渲染器

  myNewBlock: (props) => {
    return (
      <div className="my-custom-block">
        {props.title}
        {props.content}
      </div>
    )
  },
}
```

## 注意事项

1. **图片路径**: 确保 Next.js 配置中允许从 CMS 的图片域名加载图片
2. **Hydrate Relationships**: 总是在 GraphQL 查询中设置 `hydrateRelationships: true`
3. **类型安全**: 考虑为 props 添加 TypeScript 类型定义
4. **性能**: 使用 Next.js Image 组件的优化特性

## 依赖

- `@keystone-6/document-renderer` - Keystone 官方渲染器
- `lucide-react` - 图标库
- `next/image` - Next.js 图片优化
- `tailwindcss` - 样式库
- `@/lib/utils` - cn 工具函数（可选）
