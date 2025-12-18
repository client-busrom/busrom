# Payload CMS Lexical 编辑器完整自定义指南

## 📚 所有可用的配置选项

### 1️⃣ 内置 Features（功能）

#### 文本格式化
- ✅ `BoldFeature()` - 粗体
- ✅ `ItalicFeature()` - 斜体
- ✅ `UnderlineFeature()` - 下划线
- ✅ `StrikethroughFeature()` - 删除线
- ✅ `SubscriptFeature()` - 下标
- ✅ `SuperscriptFeature()` - 上标
- ✅ `InlineCodeFeature()` - 行内代码

#### 结构化内容
- ✅ `ParagraphFeature()` - 段落
- ✅ `HeadingFeature()` - 标题（H1-H6）
- ✅ `BlockquoteFeature()` - 引用块
- ✅ `HorizontalRuleFeature()` - 分割线
- ✅ `OrderedListFeature()` - 有序列表
- ✅ `UnorderedListFeature()` - 无序列表
- ✅ `CheckListFeature()` - 复选框列表

#### 富内容
- ✅ `LinkFeature()` - 链接
- ✅ `UploadFeature()` - 上传媒体文件
- ✅ `BlocksFeature()` - 自定义 Blocks（你正在用的）
- ✅ `RelationshipFeature()` - 关联其他文档

#### 工具栏
- ✅ `FixedToolbarFeature()` - 固定工具栏
- ✅ `InlineToolbarFeature()` - 浮动工具栏

#### 布局
- ✅ `AlignFeature()` - 对齐方式
- ✅ `IndentFeature()` - 缩进

---

## 2️⃣ 编辑器基础配置

```typescript
editor: lexicalEditor({
  // 占位符文本
  placeholder: '开始输入...',

  // 隐藏左侧栏
  hideGutter: true,

  // 隐藏添加按钮
  hideAddButton: true,

  // 隐藏拖拽手柄
  hideDragHandle: true,

  features: ({ defaultFeatures, rootFeatures }) => [
    ...defaultFeatures,
    // 添加你的自定义 features
  ],
})
```

---

## 3️⃣ Blocks 配置选项

### Block 级别配置

```typescript
export const MyBlock: Block = {
  slug: 'my-block',
  labels: {
    singular: { en: 'My Block', zh: '我的块' },
    plural: { en: 'My Blocks', zh: '我的块' }
  },

  admin: {
    // ❌ 不自动生成 blockName 字段
    disableBlockName: true,

    // ✅ 默认折叠状态
    initCollapsed: true,

    // ✅ 是否可拖拽排序
    isSortable: true,

    // ✅ 自定义组件
    components: {
      // 自定义标签显示
      Label: './CustomLabel.tsx',

      // 自定义预览组件（完全替换默认界面）
      Block: './CustomBlockPreview.tsx',
    },
  },

  fields: [
    // 你的字段定义
  ],
}
```

### Blocks Field 级别配置

```typescript
{
  name: 'content',
  type: 'blocks',
  blocks: [Block1, Block2],

  admin: {
    // 条件显示
    condition: (data, siblingData, { user }) => {
      return user.role === 'admin'
    },

    // 描述文字
    description: '添加内容块构建页面',

    // 字段宽度
    width: '100%',

    // 是否只读
    readOnly: false,

    // 是否隐藏
    hidden: false,
  },

  // 限制数量
  minRows: 1,
  maxRows: 10,
}
```

---

## 4️⃣ 自定义 Slash 菜单（"/" 菜单）

```typescript
import { ClientFeature } from '@payloadcms/richtext-lexical/client'

export const myCustomFeature: ClientFeature = {
  slashMenu: [
    {
      // 添加到现有的 'basic' 组
      groupKey: 'basic',
      items: [
        {
          key: 'my-item',
          label: '我的项目',
          description: '插入自定义内容',
          onSelect: () => {
            // 插入自定义节点
          },
        },
      ],
    },
    // 或创建新的菜单组
    {
      groupKey: 'custom',
      groupLabel: '自定义内容',
      items: [
        // 你的自定义项目
      ],
    },
  ],
  nodes: [],
}
```

---

## 5️⃣ 自定义工具栏按钮

```typescript
export const myToolbarFeature: ClientFeature = {
  // 固定工具栏
  toolbarFixed: [
    {
      groupKey: 'my-group',
      items: [
        {
          key: 'my-button',
          label: '我的按钮',
          icon: 'icon-name',
          onClick: () => {
            // 执行操作
          },
        },
      ],
    },
  ],

  // 浮动工具栏
  toolbarInline: [
    {
      groupKey: 'my-inline-group',
      items: [
        // 你的按钮
      ],
    },
  ],

  nodes: [],
}
```

---

## 6️⃣ 创建自定义节点

### Decorator Node（叶子节点，如视频）

```typescript
import { DecoratorNode } from 'lexical'

export class VideoNode extends DecoratorNode<VideoComponent> {
  __url: string
  __id: string

  static getType() {
    return 'video'
  }

  exportJSON() {
    return {
      type: 'video',
      url: this.__url,
      id: this.__id,
    }
  }

  static importJSON(json) {
    return new VideoNode(json)
  }

  // 渲染节点
  decorate() {
    return <VideoComponent url={this.__url} id={this.__id} />
  }
}
```

### Element Node（分支节点，如自定义块）

```typescript
import { ElementNode } from 'lexical'

export class CustomBlockNode extends ElementNode {
  static getType() {
    return 'customBlock'
  }

  exportJSON() {
    return {
      type: 'customBlock',
      // 自定义属性
    }
  }

  createDOM() {
    const element = document.createElement('div')
    element.className = 'custom-block'
    return element
  }

  updateDOM() {
    return false
  }
}
```

---

## 7️⃣ HTML 转换器（服务端渲染）

```typescript
import { HTMLConverter } from '@payloadcms/richtext-lexical'

const myHTMLConverter: HTMLConverter = {
  nodeTypes: [VideoNode.getType()],
  converter: async ({ node }) => {
    return `
      <video
        src="${node.__url}"
        controls
        width="100%"
      ></video>
    `
  },
}
```

---

## 8️⃣ Markdown 转换器

```typescript
import { MarkdownTransformer } from '@payloadcms/richtext-lexical'

const myMarkdownTransformer: MarkdownTransformer = {
  // 匹配模式
  pattern: /^\+\+\+ (.+)$/gm,

  // Markdown -> Node
  replace: (textNode, match) => {
    return new MyCustomNode({ content: match[1] })
  },

  // Node -> Markdown
  export: (node) => {
    return `+++ ${node.content}`
  },
}
```

---

## 9️⃣ 完整的自定义 Feature 示例

### feature.server.ts

```typescript
import { Feature } from '@payloadcms/richtext-lexical'
import { VideoNode } from './nodes/VideoNode'

export const videoFeature = (): Feature => ({
  feature: {
    nodes: [VideoNode],

    htmlConverters: [
      // HTML 转换器
    ],

    markdownTransformers: [
      // Markdown 转换器
    ],

    translations: {
      en: {
        video: {
          label: 'Video',
          insertVideo: 'Insert Video',
        },
      },
      zh: {
        video: {
          label: '视频',
          insertVideo: '插入视频',
        },
      },
    },
  },

  clientFeature: '@/features/video/feature.client',
})
```

### feature.client.tsx

```typescript
import { ClientFeature } from '@payloadcms/richtext-lexical/client'
import { VideoNode } from './nodes/VideoNode'

export const videoFeatureClient: ClientFeature = {
  nodes: [VideoNode],

  slashMenu: [
    {
      groupKey: 'media',
      items: [
        {
          key: 'video',
          label: 'Video',
          onSelect: () => {
            // 插入视频节点
          },
        },
      ],
    },
  ],

  toolbarFixed: [
    // 工具栏按钮
  ],
}
```

---

## 🔟 内容转换工具

### Lexical -> HTML

```typescript
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

const html = convertLexicalToHTML({
  data: lexicalData,
  features: yourFeatures,
})
```

### Markdown -> Lexical

```typescript
import { $convertFromMarkdownString } from '@payloadcms/richtext-lexical'

editor.update(() => {
  $convertFromMarkdownString(markdownContent, transformers)
}, { discrete: true })
```

---

## 📊 自定义级别总结

| 级别 | 描述 | 难度 |
|------|------|------|
| **Level 0** | 使用默认 features | ⭐ 简单 |
| **Level 1** | 选择需要的 features | ⭐ 简单 |
| **Level 2** | 配置 features 参数 | ⭐⭐ 中等 |
| **Level 3** | 自定义工具栏/Slash 菜单 | ⭐⭐ 中等 |
| **Level 4** | 创建自定义节点 | ⭐⭐⭐ 困难 |
| **Level 5** | 完整自定义 Feature | ⭐⭐⭐⭐ 高级 |

---

## 🎯 关于 Blocks 预览的结论

根据研究，**Payload 的 `admin.components.Block` 不适合做"所见即所得"编辑**：

### 为什么？

1. ❌ 完全替换默认表单界面
2. ❌ 没有提供表单字段数据
3. ❌ 主要用于**只读预览**，不是编辑界面

### Payload 的默认体验已经很好：

1. ✅ 默认就是**折叠/展开**模式
2. ✅ 点击展开显示表单字段
3. ✅ 编辑完可以折叠
4. ✅ 支持拖拽排序

### 建议：

**不要自定义 `admin.components.Block`**，直接使用 Payload 默认的编辑体验。

如果需要更好的预览：
- ✅ 使用 `admin.components.Label` 自定义标签
- ✅ 配置 `initCollapsed: true` 默认折叠
- ✅ 在**前端网站**渲染时使用我们创建的预览组件

---

## 📚 参考资源

- [Payload Rich Text 官方文档](https://payloadcms.com/docs/rich-text/overview)
- [官方 Features](https://payloadcms.com/docs/rich-text/official-features)
- [自定义 Features](https://payloadcms.com/docs/rich-text/custom-features)
- [Lexical 框架文档](https://lexical.dev/docs/)
- [Blocks Field 文档](https://payloadcms.com/docs/fields/blocks)

---

## 💡 下一步建议

1. ✅ **保持默认的 Blocks 编辑体验** - 不自定义 Block 组件
2. 🔧 **专注于前端渲染** - 使用 `src/blocks/previews/` 中的组件渲染网站内容
3. 🎨 **更新前端 API** - 处理 Lexical JSON 数据
4. 🚀 **创建前端渲染组件** - 完成从 CMS 到网站的完整流程
