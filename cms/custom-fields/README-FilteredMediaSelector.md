# Filtered Media Selector 使用说明

这是一个可重用的媒体选择器组件,支持按分类和标签筛选。

## 使用方法

### 1. 在自定义字段中使用

```tsx
import { FilteredMediaSelector } from './FilteredMediaSelector'

export const Field = ({ field, value, onChange }: FieldProps) => {
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false)

  return (
    <FieldContainer>
      <button onClick={() => setMediaSelectorOpen(true)}>
        Select Media
      </button>

      <FilteredMediaSelector
        isOpen={mediaSelectorOpen}
        onClose={() => setMediaSelectorOpen(false)}
        onSelect={(mediaId) => {
          // 处理选择的媒体
          onChange?.(mediaId)
        }}
      />
    </FieldContainer>
  )
}
```

### 2. 参数说明

- `isOpen`: 是否打开模态框
- `onClose`: 关闭模态框的回调
- `onSelect`: 选择媒体时的回调,参数为 mediaId
- `multiple`: (可选) 是否支持多选,默认 false
- `selectedIds`: (可选) 已选择的媒体 ID 数组

### 3. 功能特性

- ✅ 按文件名搜索
- ✅ 按分类筛选
- ✅ 按标签筛选(分组显示)
- ✅ 分页浏览
- ✅ 缩略图预览
- ✅ 支持单选/多选模式

## 已应用到的字段

目前该选择器已应用于:
- ProductSpecificationsField (产品规格)

## 待应用的字段

可以考虑应用到以下 schemas 中使用 Media relationship 的字段:
- Product (showImage, mainImage)
- Application (gallery)
- Blog (featuredImage)
- 以及其他使用 Media 的地方

需要时可以在对应的 schema 中将标准的 relationship 字段改为使用自定义视图,并导入此组件。
