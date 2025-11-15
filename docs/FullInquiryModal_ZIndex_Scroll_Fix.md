# Full Inquiry Modal - Z-Index & Scroll 修复

## 问题描述

1. **弹窗被 header 遮挡**: 表单弹窗的层级低于 header
2. **内部滚动被 Lenis 阻断**: 弹窗内容无法正常滚动

## 解决方案

### 1. 提高弹窗 z-index

#### 修改前:
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
```

#### 修改后:
```tsx
<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
```

**原因**:
- Header 使用 `z-[60]` (位于 `/components/layout/header.tsx:109`)
- 弹窗原本使用 `z-50`,低于 header
- 修改为 `z-[9999]` 确保弹窗始终在最上层

**修改位置**:
- 第 395 行: 成功提示弹窗
- 第 413 行: 表单弹窗

### 2. 阻止 Lenis 捕获弹窗内滚动事件

#### 新增代码:

```tsx
const modalContentRef = useRef<HTMLDivElement>(null)

// Prevent Lenis from capturing scroll events inside modal
useEffect(() => {
  const modalContentEl = modalContentRef.current

  const stopPropagation = (event: WheelEvent | TouchEvent) => {
    event.stopPropagation()
  }

  if (isOpen && modalContentEl) {
    modalContentEl.addEventListener('wheel', stopPropagation)
    modalContentEl.addEventListener('touchmove', stopPropagation)
  }

  return () => {
    if (modalContentEl) {
      modalContentEl.removeEventListener('wheel', stopPropagation)
      modalContentEl.removeEventListener('touchmove', stopPropagation)
    }
  }
}, [isOpen])
```

#### 添加 ref 到弹窗容器:

```tsx
<div
  ref={modalContentRef}
  className="bg-brand-main rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-brand-accent-border"
  onClick={resetActivityTimer}
>
```

**功能说明**:

1. **阻止事件冒泡**:
   - 使用 `stopPropagation()` 阻止滚动事件冒泡到 document
   - Lenis 监听的是 document 级别的滚动事件
   - 阻止冒泡后,Lenis 不会捕获弹窗内的滚动

2. **保持 Lenis 运行**:
   - **不需要**停止 Lenis (`lenis.stop()`)
   - 背景页面的平滑滚动仍然正常工作
   - 只是弹窗内的滚动不会被 Lenis 拦截

3. **支持桌面和移动端**:
   - `wheel` 事件: 桌面端鼠标滚轮
   - `touchmove` 事件: 移动端触摸滑动

4. **清理函数**:
   - 弹窗关闭时移除事件监听器
   - 防止内存泄漏

**参考实现**:
- 这个方法与 `LocaleSwitcher.tsx` (第 65-90 行) 的实现相同
- 经过验证的可靠方案

**修改位置**:
- 第 62 行: 添加 `modalContentRef`
- 第 64-83 行: 新增 useEffect hook
- 第 416 行: 添加 ref 到弹窗容器

## 工作原理

### Lenis 平滑滚动与事件冒泡

Lenis 是一个平滑滚动库,在 `LenisProvider` 中初始化:
- 监听 document 级别的滚动事件 (wheel, touchmove)
- 拦截事件并应用平滑滚动效果

**事件冒泡机制**:
```
滚动事件流: 弹窗容器 → document → Lenis 拦截
使用 stopPropagation: 弹窗容器 → ❌ 停止 (不会到达 Lenis)
```

**为什么这个方案更好**:
1. ✅ Lenis 继续为背景页面提供平滑滚动
2. ✅ 弹窗内滚动不受 Lenis 影响,保持原生滚动
3. ✅ 无需频繁启动/停止 Lenis
4. ✅ 性能更好,代码更简洁

### Z-Index 层级

网站的 z-index 层级规划:
- Header: `z-[60]`
- 菜单/导航: 通常 `z-[70]` - `z-[100]`
- Modal/弹窗: `z-[9999]` (最高层级)

## 测试步骤

1. ✅ 打开产品详情页
2. ✅ 点击 "Submit Inquiry" 打开弹窗
3. ✅ 验证弹窗不被 header 遮挡
4. ✅ 验证弹窗内容可以正常滚动 (原生滚动,非平滑滚动)
5. ✅ 验证背景页面的 Lenis 平滑滚动仍然正常工作
6. ✅ 关闭弹窗,验证一切恢复正常

## 相关文件

- `/web/components/shop/FullInquiryModal.tsx` - 表单弹窗组件
- `/web/components/layout/header.tsx` - Header 组件
- `/web/components/lenis-provider.tsx` - Lenis 平滑滚动提供者

## 注意事项

1. **事件监听器**: 只在弹窗内容容器上添加监听器,不影响其他元素
2. **清理函数**: 确保弹窗关闭时移除事件监听器,防止内存泄漏
3. **Z-Index 规范**: 未来添加新的弹窗/模态框时,应使用 `z-[9999]` 或更高的值
4. **移动端**: `touchmove` 事件处理确保移动端滚动也能正常工作
5. **原生滚动**: 弹窗内使用原生滚动(非平滑),性能更好且更直观

## 优化建议

### 1. 创建全局 z-index 常量

```typescript
// lib/constants.ts
export const Z_INDEX = {
  HEADER: 60,
  DROPDOWN: 70,
  MODAL_OVERLAY: 9998,
  MODAL: 9999,
} as const
```

### 2. 创建可复用的 Hook

```typescript
// hooks/usePreventLenisScroll.ts
export function usePreventLenisScroll(
  isOpen: boolean,
  ref: React.RefObject<HTMLElement>
) {
  useEffect(() => {
    const element = ref.current

    const stopPropagation = (event: WheelEvent | TouchEvent) => {
      event.stopPropagation()
    }

    if (isOpen && element) {
      element.addEventListener('wheel', stopPropagation)
      element.addEventListener('touchmove', stopPropagation)
    }

    return () => {
      if (element) {
        element.removeEventListener('wheel', stopPropagation)
        element.removeEventListener('touchmove', stopPropagation)
      }
    }
  }, [isOpen, ref])
}
```

然后在组件中使用:
```typescript
const modalContentRef = useRef<HTMLDivElement>(null)
usePreventLenisScroll(isOpen, modalContentRef)
```

## 已完成

- ✅ 提高弹窗 z-index 至 `z-[9999]`
- ✅ 使用 `stopPropagation()` 阻止 Lenis 捕获弹窗内滚动事件
- ✅ 弹窗内保持原生滚动,性能更好
- ✅ 背景页面的 Lenis 平滑滚动继续正常工作
- ✅ 添加清理函数防止内存泄漏
- ✅ 支持桌面端 (wheel) 和移动端 (touchmove)

## 与 LocaleSwitcher 的实现对比

两者使用完全相同的方案:

| 特性 | LocaleSwitcher | FullInquiryModal |
|------|----------------|------------------|
| 方法 | `stopPropagation()` | `stopPropagation()` |
| 监听事件 | `wheel`, `touchmove` | `wheel`, `touchmove` |
| Ref 使用 | ✅ 两个列表各有 ref | ✅ 弹窗容器有 ref |
| 清理函数 | ✅ | ✅ |
| Lenis 状态 | 保持运行 | 保持运行 |
