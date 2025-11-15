# 焦点编辑器使用说明 / Focal Point Editor Usage Guide

## 功能介绍 / Overview

可视化图片焦点编辑器，用于设置图片在任意比例裁剪时的焦点位置。

Visual focal point editor for configuring which part of the image remains visible when cropped to different aspect ratios.

---

## 使用方法 / How to Use

### 1. 编辑 Media 记录

1. 打开 **Media** 列表页面（`/admin/media`）
2. 选择一个已有的 Media 记录（必须已上传图片）
3. 找到 **"Focal Point (焦点位置)"** 字段

### 2. 设置焦点

有两种方式设置焦点：

#### 方式一：手动输入坐标

- **X坐标**：0-100（0=最左，50=居中，100=最右）
- **Y坐标**：0-100（0=最上，50=居中，100=最下）

直接在输入框中输入数值即可。

#### 方式二：可视化编辑（推荐）

点击 **"🎯 可视化编辑"** 按钮：

1. 在全屏模态框中查看完整原图
2. **点击**或**拖拽**红色焦点标记到重要内容位置
3. 实时查看 X 和 Y 坐标百分比
4. 点击 **"💾 保存焦点"** 保存设置

### 3. 保存 Media 记录

不要忘记点击页面底部的 **"Save"** 按钮保存整个 Media 记录。

---

## 实际使用场景 / Use Cases

### 场景 1：人物照片

**情况**：人物在图片右侧
- 将焦点设在人物脸部
- 示例：X=75, Y=30
- **效果**：无论什么比例显示，人物脸部都会保持可见

### 场景 2：产品图片

**情况**：产品在图片中心偏上
- 将焦点设在产品中心
- 示例：X=50, Y=35
- **效果**：产品始终在可见区域内

### 场景 3：风景照片

**情况**：主体景物在左下角
- 将焦点设在主体景物
- 示例：X=25, Y=70
- **效果**：主体景物优先显示

---

## 前端使用方法 / Frontend Integration

### 数据结构

```json
{
  "cropFocalPoint": {
    "x": 50,
    "y": 50
  }
}
```

### TypeScript 类型定义

```typescript
interface Media {
  url: string
  altText: string
  cropFocalPoint?: {
    x: number  // 0-100
    y: number  // 0-100
  }
}
```

### React 组件使用

```tsx
import Image from 'next/image'

function MediaImage({ media }: { media: Media }) {
  const { cropFocalPoint = { x: 50, y: 50 } } = media

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      <Image
        src={media.url}
        alt={media.altText}
        fill
        style={{
          objectFit: 'cover',
          objectPosition: `${cropFocalPoint.x}% ${cropFocalPoint.y}%`
        }}
      />
    </div>
  )
}
```

### 普通 img 标签使用

```html
<img
  src="{{ media.url }}"
  alt="{{ media.altText }}"
  style="
    width: 100%;
    height: 300px;
    object-fit: cover;
    object-position: {{ media.cropFocalPoint.x }}% {{ media.cropFocalPoint.y }}%;
  "
/>
```

---

## 技术说明 / Technical Details

### 工作原理

焦点位置通过 CSS `object-position` 属性实现：

```css
.image {
  object-fit: cover;
  object-position: 50% 50%; /* x% y% */
}
```

- `object-fit: cover` 确保图片填充容器
- `object-position` 控制图片在容器中的对齐位置
- 百分比值表示焦点在图片中的位置

### 跨比例适配

同一张图片可以在不同比例的容器中显示：

| 容器比例 | 说明 | 效果 |
|---------|------|------|
| 16:9 横幅 | 横向宽容器 | 焦点 Y 坐标起主要作用 |
| 1:1 方形 | 方形容器 | X 和 Y 均匀作用 |
| 3:4 竖版 | 竖向高容器 | 焦点 X 坐标起主要作用 |
| 任意比例 | 自定义容器 | 焦点始终保持可见 |

### 默认值

如果未设置焦点，默认为：
```json
{
  "x": 50,
  "y": 50
}
```
即图片居中显示。

---

## 常见问题 / FAQ

### Q: 为什么看不到图片预览？

**A:** 请确保：
1. 已经上传了图片文件
2. 已经保存了 Media 记录
3. S3 存储配置正确，图片可以正常访问

### Q: 创建新 Media 时能使用可视化编辑吗？

**A:** 不能。需要先上传图片并保存记录后，再编辑焦点位置。系统会显示提示信息。

### Q: 修改焦点后，前端能立即看到效果吗？

**A:** 是的，保存后前端通过 GraphQL API 获取新的焦点坐标，刷新页面即可看到效果。

### Q: 可以为每张图片设置不同的焦点吗？

**A:** 是的，每个 Media 记录都有独立的焦点设置。

### Q: 焦点设置会影响原图吗？

**A:** 不会。焦点只是元数据，不会修改原图文件。

---

## 与旧版本的区别

### 旧版本（已废弃）

```typescript
// ❌ 旧字段
cropHorizontalAlign: 'LEFT' | 'CENTER' | 'RIGHT'
cropVerticalAlign: 'TOP' | 'CENTER' | 'BOTTOM'
```

**问题**：
- 只能处理"横→竖"和"竖→横"两种情况
- 无法适配其他比例（如 1:1, 2:1 等）
- 不够精确（只有 3 个选项）

### 新版本（当前）

```typescript
// ✅ 新字段
cropFocalPoint: {
  x: number  // 0-100
  y: number  // 0-100
}
```

**优势**：
- ✅ 适配**任意**展示比例
- ✅ 0-100 的精确控制
- ✅ 通用性强，一次设置到处适用
- ✅ 前端实现简单（直接用 CSS）

---

## 更新日志 / Changelog

- **2025-11-08**:
  - 从 `cropHorizontalAlign` 和 `cropVerticalAlign` 迁移到 `cropFocalPoint`
  - 支持 0-100 的精确百分比控制
  - 添加可视化拖拽编辑功能
  - 支持手动输入坐标
  - 适配任意展示比例
