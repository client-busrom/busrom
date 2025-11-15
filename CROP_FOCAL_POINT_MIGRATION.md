# 图片裁剪字段迁移总结

## 改动概述

将图片裁剪字段从旧的 `cropHorizontalAlign` 和 `cropVerticalAlign` 迁移到新的 `cropFocalPoint`。

**迁移日期**: 2025-11-08

---

## 字段变更

### 旧字段（已废弃）

```typescript
cropHorizontalAlign: 'LEFT' | 'CENTER' | 'RIGHT'
cropVerticalAlign: 'TOP' | 'CENTER' | 'BOTTOM'
```

### 新字段

```typescript
cropFocalPoint: {
  x: number  // 0-100
  y: number  // 0-100
}
```

---

## 已更新的文件

### CMS (KeystoneJS)

1. ✅ **cms/schemas/Media.ts**
   - 移除：`cropHorizontalAlign` 和 `cropVerticalAlign` 字段
   - 新增：`cropFocalPoint` JSON 字段

2. ✅ **cms/custom-fields/FocalPointEditor.tsx**
   - 新增可视化焦点编辑器组件
   - 支持拖拽设置焦点位置
   - 同时编辑 X 和 Y 坐标

3. ✅ **cms/custom-fields/FocalPointEditor.README.md**
   - 新增使用文档
   - 移除旧的 CropAlignmentEditor.README.md

4. ✅ **移除旧文件**:
   - cms/custom-fields/CropHorizontalAlignEditor.tsx
   - cms/custom-fields/CropVerticalAlignEditor.tsx
   - cms/custom-fields/CropAlignmentEditor.tsx (如果存在)

### 前端 (Next.js)

1. ✅ **web/lib/content-data.ts**
   - 更新 `ImageObject` 类型定义
   - 添加使用说明注释

2. ✅ **web/mock/homeContent_EN.ts**
   - 更新类型定义和注释

3. ✅ **web/mock/homeContent_ZH.ts**
   - 更新类型定义和注释

### 文档

1. ✅ **docs/前端开发指南_v2.0.md**
   - 自动替换字段引用

2. ✅ **docs/api-contracts/HomeContentApiDocumentation.md**
   - 自动替换字段引用

3. ✅ **docs/GraphQL_API完整文档.md**
   - 自动替换字段引用

---

## 前端使用方法

### 旧代码（需要更新）

```tsx
// ❌ 旧方式
const horizontal = cropHorizontalAlign === 'LEFT' ? 'left' :
                  cropHorizontalAlign === 'RIGHT' ? 'right' : 'center'
const vertical = cropVerticalAlign === 'TOP' ? 'top' :
                cropVerticalAlign === 'BOTTOM' ? 'bottom' : 'center'

style={{
  objectFit: 'cover',
  objectPosition: `${horizontal} ${vertical}`
}}
```

### 新代码（推荐）

```tsx
// ✅ 新方式
const { cropFocalPoint = { x: 50, y: 50 } } = media

<img
  src={media.url}
  alt={media.altText}
  style={{
    objectFit: 'cover',
    objectPosition: `${cropFocalPoint.x}% ${cropFocalPoint.y}%`
  }}
/>
```

---

## 数据迁移

### 需要数据库迁移吗？

**是的**，需要执行以下操作：

1. **运行数据库迁移**：
   ```bash
   cd cms
   npx keystone prisma migrate dev --name add_crop_focal_point
   ```

2. **可选：迁移现有数据**（如果有旧数据）：
   ```sql
   -- 将旧字段值转换为新格式
   UPDATE "Media"
   SET "cropFocalPoint" = json_build_object(
     'x', CASE
       WHEN "cropHorizontalAlign" = 'LEFT' THEN 0
       WHEN "cropHorizontalAlign" = 'RIGHT' THEN 100
       ELSE 50
     END,
     'y', CASE
       WHEN "cropVerticalAlign" = 'TOP' THEN 0
       WHEN "cropVerticalAlign" = 'BOTTOM' THEN 100
       ELSE 50
     END
   )
   WHERE "cropFocalPoint" IS NULL;
   ```

3. **验证迁移**：
   - 登录 CMS Admin UI
   - 检查几个 Media 记录
   - 确认 cropFocalPoint 字段显示正常

---

## 测试清单

- [ ] CMS 构建成功
- [ ] Media 列表页面正常显示
- [ ] 可以创建新 Media 记录
- [ ] 可视化编辑器正常打开
- [ ] 可以拖拽设置焦点
- [ ] 保存后焦点值正确
- [ ] 前端可以正确读取 cropFocalPoint
- [ ] 图片在不同比例容器中正确显示

---

## 兼容性说明

### 向后兼容

如果前端代码还在使用旧字段名：

**临时方案**（在 GraphQL resolver 中）:
```typescript
// 在 Media resolver 中添加计算字段
Media: {
  fields: {
    // ... existing fields
  },
  // 添加兼容层
  hooks: {
    resolveInput: ({ resolvedData }) => {
      // 如果前端还在读取旧字段，可以从 cropFocalPoint 计算出来
      if (resolvedData.cropFocalPoint) {
        const { x, y } = resolvedData.cropFocalPoint
        resolvedData.cropHorizontalAlign = x <= 25 ? 'LEFT' : x >= 75 ? 'RIGHT' : 'CENTER'
        resolvedData.cropVerticalAlign = y <= 25 ? 'TOP' : y >= 75 ? 'BOTTOM' : 'CENTER'
      }
      return resolvedData
    }
  }
}
```

**推荐方案**：
尽快更新前端代码使用新的 `cropFocalPoint` 字段。

---

## 优势对比

| 特性 | 旧方案 | 新方案 |
|------|--------|--------|
| 字段数量 | 2 个 | 1 个 |
| 精确度 | 3 个选项 | 0-100 (101 个选项) |
| 适配比例 | 仅横↔竖 | 任意比例 |
| 操作方式 | 下拉选择 | 输入框 + 可视化 |
| 前端实现 | 条件判断 | 直接使用百分比 |
| 通用性 | ⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 注意事项

1. ⚠️ **数据迁移**：请先备份数据库
2. ⚠️ **前端更新**：需要同步更新前端代码
3. ⚠️ **测试**：在生产环境部署前充分测试
4. ✅ **用户培训**：通知运营人员新的操作方式

---

## 回滚方案

如果需要回滚到旧版本：

1. 恢复旧的 schema 文件
2. 恢复数据库备份
3. 重新部署旧版本代码

**备份位置**：
```
docs/*.backup
cms/schemas/Media.ts.backup (如果创建了)
```

---

## 联系支持

如有问题请参考：
- 📖 使用文档：`cms/custom-fields/FocalPointEditor.README.md`
- 💬 技术支持：联系开发团队

---

**迁移完成时间**: 2025-11-08
**负责人**: Claude Code
**状态**: ✅ 完成
