# Media Tags 筛选功能

## 问题

Media的`tags`字段使用了自定义视图(`GroupedTagsField`)来提供分组显示功能,但Keystone不支持在自定义视图中导出`Filter`组件,导致无法在列表视图中按tags筛选。

## 解决方案

采用**双字段方案**:

1. **`tags`字段** - 主字段,使用自定义分组UI
   - 在编辑视图中使用`GroupedTagsField`提供按类型分组的标签选择
   - 提供更好的用户体验

2. **`tagsFilter`字段** - 辅助字段,用于筛选
   - 使用Keystone标准relationship UI
   - 在列表视图中显示,支持筛选功能
   - 在编辑视图中隐藏(通过`fieldMode: 'hidden'`)

## 字段同步

通过`resolveInput` hook自动同步两个字段:

```typescript
resolveInput: async ({ operation, resolvedData, item, context }) => {
  // 当tags字段更新时,自动同步到tagsFilter
  if (resolvedData.tags !== undefined) {
    resolvedData.tagsFilter = resolvedData.tags
  }
  return resolvedData
}
```

## 使用方法

### 编辑Media记录时
- 使用`tags`字段选择标签
- 标签按类型分组显示(产品系列、功能类型、规格等)
- `tagsFilter`字段会自动同步,无需手动操作

### 在列表视图中筛选
- 点击"Filter"按钮
- 选择"Tags Filter (标签筛选)"
- 选择要筛选的标签
- 列表会显示包含该标签的所有Media记录

## 数据库迁移

添加了新字段`tagsFilter`,需要运行数据库迁移:

```bash
# Keystone会自动检测schema变化
# 在浏览器中刷新,Keystone会提示创建迁移
```

迁移内容:
- 添加`Media_tagsFilter`关联表
- 与`Media_tags`表结构相同

## 初始数据同步

对于已有的Media记录,需要同步tags到tagsFilter:

```typescript
// 在Keystone控制台或创建一个迁移脚本
const medias = await context.db.Media.findMany({
  query: 'id tags { id }'
})

for (const media of medias) {
  await context.db.Media.updateOne({
    where: { id: media.id },
    data: {
      tagsFilter: {
        set: media.tags.map(tag => ({ id: tag.id }))
      }
    }
  })
}
```

## 优势

✅ **保留分组UI** - 编辑时仍使用GroupedTagsField,体验不变
✅ **支持筛选** - 通过tagsFilter字段实现筛选功能
✅ **自动同步** - 通过hook自动保持两个字段一致
✅ **向后兼容** - 现有代码不需要修改

## 注意事项

1. **只编辑tags字段** - 编辑时只操作`tags`字段,`tagsFilter`会自动同步
2. **列表显示** - 列表视图显示`tagsFilter`而不是`tags`
3. **GraphQL查询** - 前端查询时使用`tags`字段即可,`tagsFilter`仅用于后台筛选

## 相关文件

- Media Schema: `cms/schemas/Media.ts`
- Grouped Tags Field: `cms/custom-fields/GroupedTagsField.tsx`
- 批量上传页面: `cms/admin/pages/batch-media-upload.tsx`

## 未来改进

如果Keystone未来支持自定义视图的Filter组件导出,可以:
1. 移除`tagsFilter`字段
2. 在`GroupedTagsField.tsx`中添加`Filter`组件
3. 简化schema配置
