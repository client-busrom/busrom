# 批量上传重构 - 使用Keystone原生Image Field

## 概述

将批量媒体上传功能从自定义REST API重构为使用Keystone原生的GraphQL mutation和image field上传机制。

**重构日期**: 2025-11-13

## 问题背景

之前的批量上传实现存在以下问题:

1. ❌ **自定义API不完整**: `upload-media.ts` 中的实现有错误,`Readable`未导入,`storage.getDataFromStream()` 不是标准API
2. ❌ **不一致**: 批量上传与Keystone标准的单张上传使用不同的机制
3. ❌ **维护成本高**: 需要单独维护文件上传逻辑
4. ❌ **功能缺失**: 无法保证触发所有Keystone hooks(图片优化、variants生成等)

## 解决方案

### 新的上传方式

使用 **GraphQL multipart request** 标准,直接调用Keystone的 `createMedia` mutation:

```typescript
const operations = {
  query: `
    mutation CreateMedia($data: MediaCreateInput!) {
      createMedia(data: $data) {
        id
        filename
        file { url }
      }
    }
  `,
  variables: {
    data: {
      filename: "...",
      file: { upload: null }, // 将被实际文件替换
      altText: { ... },
      primaryCategory: { connect: { id: "..." } },
      tags: { connect: [...] },
      metadata: { ... },
      status: 'ACTIVE',
    },
  },
}

// FormData for multipart upload
const formData = new FormData()
formData.append('operations', JSON.stringify(operations))
formData.append('map', JSON.stringify({ '0': ['variables.data.file.upload'] }))
formData.append('0', file, filename)

// Send to GraphQL endpoint
await fetch('/api/graphql', {
  method: 'POST',
  body: formData,
  credentials: 'include',
})
```

### 文件修改

#### 1. 前端文件

**修改**: `cms/admin/pages/batch-media-upload.tsx`
- 移除对 `/api/upload-media` 的调用
- 改用 GraphQL multipart request
- 直接调用 `/api/graphql` endpoint

**修改**: `cms/custom-fields/BatchMediaUpload.tsx`
- 同样的修改,使用GraphQL mutation

#### 2. 后端文件

**修改**: `cms/keystone.ts`
- 移除 `uploadMediaHandler` 的导入
- 移除 `/api/upload-media` 路由注册

**废弃**: `cms/routes/upload-media.ts`
- 重命名为 `upload-media.ts.deprecated`
- 添加废弃说明

#### 3. 文档文件

**修改**: `cms/docs/BATCH_MEDIA_UPLOAD.md`
- 更新"技术架构"部分
- 说明新的上传方式和优势

**新增**: `cms/docs/BATCH_UPLOAD_REFACTOR.md` (本文档)
- 记录重构过程和原因

## 优势

### ✅ 一致性
批量上传与单张上传使用完全相同的机制,行为一致。

### ✅ 自动优化
自动触发Media model的所有hooks:
- 提取元数据 (width, height, fileSize, mimeType)
- 生成优化变体 (thumbnail, small, medium, large, xlarge, webp)
- 记录活动日志

### ✅ 类型安全
通过GraphQL schema自动验证:
- 字段类型检查
- 必填字段验证
- 关系完整性

### ✅ 简化维护
- 无需维护自定义文件上传逻辑
- 无需处理S3客户端配置
- 无需手动构建file_id和file_extension

### ✅ 标准化
遵循GraphQL multipart request规范:
- [graphql-multipart-request-spec](https://github.com/jaydenseric/graphql-multipart-request-spec)
- 与Apollo Client、URQL等客户端兼容

## 技术细节

### GraphQL Multipart Request格式

```
POST /api/graphql
Content-Type: multipart/form-data; boundary=----...

------...
Content-Disposition: form-data; name="operations"

{"query":"mutation...","variables":{...}}
------...
Content-Disposition: form-data; name="map"

{"0":["variables.data.file.upload"]}
------...
Content-Disposition: form-data; name="0"; filename="image.jpg"
Content-Type: image/jpeg

[binary data]
------...--
```

### Keystone Image Field处理流程

1. **接收请求**: Keystone GraphQL API接收multipart请求
2. **解析文件**: 根据`map`字段将文件放入正确的变量位置
3. **上传S3**: 使用配置的storage (`s3_images`) 上传文件
4. **创建记录**: 在数据库中创建Media记录,保存file_id和file_extension
5. **触发Hooks**: 执行`afterOperation` hook进行优化

### Media Model Hooks

位置: `cms/schemas/Media.ts:326-408`

```typescript
hooks: {
  afterOperation: async ({ operation, item, context }) => {
    if (operation === 'create') {
      // 1. 提取元数据
      const metadata = await extractImageMetadata(fileUrl)

      // 2. 生成变体
      const variants = await generateImageVariants(fileUrl)

      // 3. 更新记录
      await context.db.Media.updateOne({
        where: { id: item.id },
        data: {
          width: metadata.width,
          height: metadata.height,
          fileSize: metadata.fileSize,
          mimeType: metadata.mimeType,
          variants: variants,
        },
      })
    }
  }
}
```

## 测试建议

### 1. 基本上传测试
- [ ] 上传单张图片
- [ ] 上传多张图片(5-10张)
- [ ] 上传大图片(接近10MB)

### 2. 字段测试
- [ ] 设置altText (中文/英文)
- [ ] 选择primaryCategory
- [ ] 选择多个tags
- [ ] 设置metadata (sceneNumber, specs, colors等)

### 3. 批量操作测试
- [ ] 批量设置字段并应用
- [ ] 批量设置后单独编辑某张图片
- [ ] 验证字段覆盖逻辑

### 4. Hook验证
- [ ] 检查上传后的Media记录是否有width/height
- [ ] 检查variants是否正确生成
- [ ] 检查ActivityLog是否记录

### 5. 错误处理测试
- [ ] 上传非图片文件
- [ ] 上传超大文件(>10MB)
- [ ] 网络中断情况
- [ ] 必填字段缺失

## 迁移指南

如果有其他代码依赖旧的 `/api/upload-media` endpoint:

### 1. 查找所有引用
```bash
grep -r "/api/upload-media" cms/
```

### 2. 替换为GraphQL mutation
使用上述的GraphQL multipart request方式。

### 3. 测试验证
确保上传后的Media记录包含所有必要字段。

## 相关文件

- 批量上传页面: `cms/admin/pages/batch-media-upload.tsx`
- 批量上传字段: `cms/custom-fields/BatchMediaUpload.tsx`
- Media Schema: `cms/schemas/Media.ts`
- 图片优化: `cms/lib/image-optimizer.ts`
- Keystone配置: `cms/keystone.ts`
- 用户文档: `cms/docs/BATCH_MEDIA_UPLOAD.md`

## 参考资料

- [Keystone Images and Files Guide](https://keystonejs.com/docs/guides/images-and-files)
- [GraphQL Multipart Request Spec](https://github.com/jaydenseric/graphql-multipart-request-spec)
- [Keystone Storage API](https://keystonejs.com/docs/apis/config#storage)

## 总结

通过这次重构,批量上传功能现在:
- ✅ 使用Keystone标准机制
- ✅ 代码更简洁、更可靠
- ✅ 自动享受所有Keystone功能
- ✅ 更易于维护和扩展
