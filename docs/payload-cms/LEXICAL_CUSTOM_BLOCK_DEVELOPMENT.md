# Lexical 自定义块开发指南

本文档详细说明了如何在 Payload CMS 中创建 Lexical 富文本编辑器的自定义块（Custom Feature）。

## 目录

1. [概述](#概述)
2. [文件结构](#文件结构)
3. [开发步骤](#开发步骤)
4. [详细说明](#详细说明)
5. [注册清单](#注册清单)
6. [常见问题](#常见问题)
7. [完整示例](#完整示例)

---

## 概述

Lexical 自定义块是通过 `DecoratorNode` 模式实现的，它允许在富文本编辑器中插入自定义的可视化组件。与传统的 Payload Blocks 不同，Custom Features 提供了更好的 WYSIWYG（所见即所得）编辑体验。

### 核心概念

- **DecoratorNode**: Lexical 节点类型，用于渲染 React 组件
- **Feature**: Payload 对 Lexical 功能的封装，分为 Server 和 Client 两部分
- **Plugin**: 处理命令注册和节点插入的组件
- **Command**: 用于触发节点插入的 Lexical 命令

---

## 文件结构

每个自定义块需要创建以下文件（以 `product-carousel` 为例）：

```
src/lexical-features/product-carousel/
├── index.ts                 # 导出入口
├── node.tsx                 # DecoratorNode 定义
├── plugin.tsx               # 命令注册和处理
├── feature.server.ts        # 服务端 Feature 配置
├── feature.client.tsx       # 客户端 Feature 配置
└── component.client.tsx     # CMS 编辑器中的 React 组件
```

---

## 开发步骤

### 步骤 1: 创建 Node（节点定义）

文件: `node.tsx`

```tsx
// @ts-nocheck
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'

import { DecoratorNode } from 'lexical'
import * as React from 'react'

// 1. 定义数据接口
export interface MyBlockData {
  title: string
  items: Array<{ id: string; value: string }>
}

// 2. 定义序列化类型
export type SerializedMyBlockNode = Spread<
  { data: MyBlockData },
  SerializedLexicalNode
>

// 3. 创建 Node 类
export class MyBlockNode extends DecoratorNode<React.ReactElement> {
  __data: MyBlockData

  // 返回唯一的节点类型标识符
  static getType(): string {
    return 'myBlock' // 必须全局唯一
  }

  static clone(node: MyBlockNode): MyBlockNode {
    return new MyBlockNode(node.__data, node.__key)
  }

  constructor(data: MyBlockData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  // 创建 DOM 容器
  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'my-block-node'
    return div
  }

  updateDOM(): false {
    return false
  }

  // JSON 导入（从数据库加载）
  static importJSON(serializedNode: SerializedMyBlockNode): MyBlockNode {
    return $createMyBlockNode(serializedNode.data)
  }

  // JSON 导出（保存到数据库）
  exportJSON(): SerializedMyBlockNode {
    return {
      data: this.__data,
      type: 'myBlock',
      version: 1,
    }
  }

  // DOM 导入（可选，用于粘贴）
  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-my-block')) {
          return null
        }
        return {
          conversion: convertMyBlockElement,
          priority: 2,
        }
      },
    }
  }

  // DOM 导出
  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-my-block', 'true')
    element.setAttribute('data-my-block', JSON.stringify(this.__data))
    return { element }
  }

  // 数据访问器
  getData(): MyBlockData {
    return this.getLatest().__data
  }

  setData(data: MyBlockData): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  // 渲染 React 组件（关键方法）
  decorate(): React.ReactElement {
    const MyBlockComponent = React.lazy(() =>
      import('./component.client').then((module) => ({
        default: module.MyBlockComponent,
      })),
    )

    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <MyBlockComponent nodeKey={this.__key} data={this.__data} />
      </React.Suspense>
    )
  }

  isInline(): boolean {
    return false // 块级元素
  }

  isIsolated(): boolean {
    return true // 隔离节点，防止光标进入
  }

  getTextContent(): string {
    return `[My Block: ${this.__data.title}]`
  }
}

// DOM 转换函数
function convertMyBlockElement(domNode: HTMLElement): DOMConversionOutput | null {
  const dataAttr = domNode.getAttribute('data-my-block')
  if (dataAttr) {
    try {
      const data = JSON.parse(dataAttr)
      return { node: $createMyBlockNode(data) }
    } catch (e) {
      console.error('Failed to parse my block data:', e)
    }
  }
  return null
}

// 工厂函数
export function $createMyBlockNode(data: MyBlockData): MyBlockNode {
  return new MyBlockNode(data)
}

// 类型检查函数
export function $isMyBlockNode(node: LexicalNode | null | undefined): node is MyBlockNode {
  return node instanceof MyBlockNode
}
```

### 步骤 2: 创建 Plugin（命令处理）

文件: `plugin.tsx`

```tsx
// @ts-nocheck
'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical'
import { useEffect } from 'react'

import { $createMyBlockNode, MyBlockData } from './node'

// 创建插入命令（必须在此文件中定义，确保单例）
export const INSERT_MY_BLOCK_COMMAND: LexicalCommand<MyBlockData | undefined> = createCommand(
  'INSERT_MY_BLOCK_COMMAND',
)

export const MyBlockPlugin = (): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    // 注册命令处理器
    return editor.registerCommand(
      INSERT_MY_BLOCK_COMMAND,
      (payload) => {
        // 创建默认数据
        const defaultData: MyBlockData = {
          title: '',
          items: [],
        }

        // 创建并插入节点
        const node = $createMyBlockNode(payload || defaultData)
        $insertNodes([node])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
```

### 步骤 3: 创建 Feature Server（服务端配置）

文件: `feature.server.ts`

```tsx
// @ts-nocheck
import { createServerFeature } from '@payloadcms/richtext-lexical'
import { MyBlockNode } from './node'

export const MyBlockFeature = createServerFeature({
  feature: {
    // 客户端 Feature 的路径（使用 @ 别名）
    ClientFeature: '@/lexical-features/my-block/feature.client#MyBlockFeatureClient',
    // 注册节点
    nodes: [
      {
        node: MyBlockNode,
        type: MyBlockNode.getType(),
      },
    ],
  },
  // Feature 唯一标识符
  key: 'myBlock',
})
```

### 步骤 4: 创建 Feature Client（客户端配置）

文件: `feature.client.tsx`

```tsx
// @ts-nocheck
'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { MyBlockNode } from './node'
import { MyBlockPlugin } from './plugin'

export const MyBlockFeatureClient = createClientFeature({
  // 注册节点类
  nodes: [MyBlockNode],
  // 注册插件（处理命令）
  plugins: [
    {
      Component: MyBlockPlugin,
      position: 'normal',
    },
  ],
})
```

### 步骤 5: 创建导出入口

文件: `index.ts`

```tsx
export { MyBlockFeature } from './feature.server'
export { MyBlockNode, $createMyBlockNode, $isMyBlockNode } from './node'
export type { MyBlockData } from './node'
export { INSERT_MY_BLOCK_COMMAND } from './plugin'
```

### 步骤 6: 创建编辑器组件

文件: `component.client.tsx`

```tsx
// @ts-nocheck
'use client'

import React, { useState, useCallback } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { MyBlockNode, MyBlockData } from './node'

interface Props {
  nodeKey: string
  data: MyBlockData
}

export const MyBlockComponent: React.FC<Props> = ({ nodeKey, data }) => {
  const [editor] = useLexicalComposerContext()
  const [localData, setLocalData] = useState<MyBlockData>(data)

  // 更新节点数据
  const updateNode = useCallback((newData: MyBlockData) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node && node instanceof MyBlockNode) {
        node.setData(newData)
      }
    })
    setLocalData(newData)
  }, [editor, nodeKey])

  // 删除节点
  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node) {
        node.remove()
      }
    })
  }, [editor, nodeKey])

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px 0',
      backgroundColor: '#f9fafb',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3>My Block</h3>
        <button onClick={handleDelete} style={{ color: 'red' }}>
          Delete
        </button>
      </div>

      <input
        type="text"
        value={localData.title}
        onChange={(e) => updateNode({ ...localData, title: e.target.value })}
        placeholder="Enter title..."
        style={{ width: '100%', padding: '8px' }}
      />

      {/* 更多编辑 UI... */}
    </div>
  )
}
```

---

## 注册清单

创建完所有文件后，必须在以下位置注册 Feature：

### 1. payload.config.ts（必须）

这是最关键的步骤！Feature 必须在编辑器配置中注册才能工作。

```tsx
// 导入 Feature
import { MyBlockFeature } from './src/lexical-features/my-block'

export default buildConfig({
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      // ... 其他 features

      // 添加你的自定义 Feature
      MyBlockFeature(), // <-- 必须添加！

      // 工具栏下拉菜单（通常放在最后）
      BlocksToolbarDropdownFeature(),
    ],
  }),
})
```

### 2. shared/features.ts（推荐）

将 Feature 添加到共享配置中，以便在嵌套编辑器中也可用。

```tsx
// 导入
import { MyBlockFeature } from '../my-block'

// 添加到 getCustomContentFeatures
export const getCustomContentFeatures = () => [
  // ... 其他 features
  MyBlockFeature(),
]
```

### 3. ToolbarButton.tsx（推荐）

在自定义块下拉菜单中添加按钮。

```tsx
// 导入命令
import { INSERT_MY_BLOCK_COMMAND } from '../my-block/plugin'

// 添加点击处理函数
const insertMyBlock = () => {
  editor.dispatchCommand(INSERT_MY_BLOCK_COMMAND, undefined)
  setIsOpen(false)
}

// 在 JSX 中添加按钮
<button type="button" onClick={insertMyBlock}>
  <MyIcon />
  <span>{i18n?.language === 'zh' ? '我的块' : 'My Block'}</span>
</button>
```

---

## 常见问题

### 问题 1: 点击按钮后没有反应

**原因**: Feature 没有在 `payload.config.ts` 中注册

**解决方案**:
1. 确认 Feature 已导入
2. 确认 Feature 函数已在 `features` 数组中调用（注意是 `MyBlockFeature()` 不是 `MyBlockFeature`）

### 问题 2: 控制台显示 `dispatchCommand result: false`

**原因**: 命令没有被注册，通常是因为 Plugin 没有加载

**解决方案**:
1. 检查 `feature.client.tsx` 中 `plugins` 数组是否正确配置
2. 确认 `feature.server.ts` 中 `ClientFeature` 路径正确
3. 确认 Feature 已在 `payload.config.ts` 中注册

### 问题 3: 节点数据没有保存

**原因**: JSON 序列化配置错误

**解决方案**:
1. 检查 `exportJSON()` 返回的 `type` 是否与 `getType()` 一致
2. 检查 `importJSON()` 是否正确解析数据

### 问题 4: 组件不显示

**原因**: `decorate()` 方法配置错误

**解决方案**:
1. 确认 `component.client.tsx` 导出名称正确
2. 确认 lazy import 路径正确
3. 检查组件是否有运行时错误

---

## 完整示例

参考现有实现：

- **简单示例**: `src/lexical-features/notice/` - 提示框
- **带选择器**: `src/lexical-features/single-image/` - 单张图片
- **复杂数据**: `src/lexical-features/product-carousel/` - 产品轮播
- **关联数据**: `src/lexical-features/application-carousel/` - 应用轮播

---

## 翻译支持

如果自定义块包含需要翻译的字段，还需要在 `src/lib/lexical-translation-config.ts` 中配置：

```tsx
// 在 NODE_TRANSLATABLE_FIELDS 中添加
export const NODE_TRANSLATABLE_FIELDS: Record<string, string[]> = {
  // ... 其他节点
  myBlock: ['title', 'description'],
}

// 如果有数组字段，在 ARRAY_ITEM_FIELDS 中添加
export const ARRAY_ITEM_FIELDS: Record<string, string[]> = {
  // ... 其他配置
  'items': ['label', 'text'],
}
```

---

## 检查清单

创建新的自定义块时，使用以下清单确保所有步骤完成：

- [ ] 创建 `node.tsx` - 定义 DecoratorNode
- [ ] 创建 `plugin.tsx` - 定义命令和注册处理器
- [ ] 创建 `feature.server.ts` - 服务端 Feature 配置
- [ ] 创建 `feature.client.tsx` - 客户端 Feature 配置
- [ ] 创建 `index.ts` - 导出入口
- [ ] 创建 `component.client.tsx` - 编辑器 React 组件
- [ ] **在 `payload.config.ts` 中导入并注册 Feature（必须）**
- [ ] 在 `shared/features.ts` 中添加到 `getCustomContentFeatures()`
- [ ] 在 `ToolbarButton.tsx` 中添加下拉菜单按钮
- [ ] 如需翻译，配置 `lexical-translation-config.ts`
- [ ] 重启 CMS 服务并测试

---

## 更新日志

- 2025-01-10: 初始版本，基于 ProductCarousel 实现经验总结
