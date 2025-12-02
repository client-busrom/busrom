# 批量上传图片完整指南

## 问题背景

通过 AWS production CMS 上传图片速度慢,尤其是大量图片时。本指南提供了一个高效的批量上传方案:

1. **快速上传**: 直接使用 Node.js 上传到 S3,无需通过 CMS API
2. **自动生成变体**: 自动生成所有尺寸变体(thumbnail, small, medium, large, xlarge, webp)
3. **自动录入 CMS**: 自动创建 Media 记录并关联元数据

## 方案架构

```
本地图片文件
    ↓
[批量上传脚本]
    ↓
1. 上传原图到 S3 (使用随机 UUID 作为文件名)
2. 生成 6 种变体并上传到 S3 的 variants/ 目录
3. 提取图片元数据 (宽高、大小、MIME 类型)
4. 在数据库创建 Media 记录
    ↓
完成! CMS 中可见,所有变体可用
```

## 核心优势

✅ **速度快**: 直接上传,无 HTTP 开销
✅ **完全自动化**: 一键完成上传、变体生成、数据库录入
✅ **与 CMS 兼容**: 使用相同的文件命名和存储结构
✅ **支持批量元数据**: 可以为每张图片设置不同的元数据
✅ **错误容忍**: 某张图片失败不影响其他图片

## 使用步骤

### 1. 准备图片文件

将要上传的图片放在一个目录中:

```bash
workspace/
  products/
    01-glass-standoff/
      scene-images/
        01-standoff-scene-001.jpg
        01-standoff-scene-002.jpg
        01-standoff-scene-003.jpg
        ...
```

### 2. 创建元数据文件 (可选)

创建一个 JSON 文件定义元数据,参考模板 `batch-metadata-template.json`:

```json
{
  "primaryCategory": "scene-photo",
  "tags": ["glass-standoff", "50mm"],

  "defaultMetadata": {
    "seriesNumber": 1,
    "specs": ["50mm", "不锈钢"],
    "colors": ["银色"]
  },

  "fileMetadata": {
    "01-standoff-scene-001.jpg": {
      "sceneNumber": 1,
      "notes": "主视图"
    },
    "01-standoff-scene-002.jpg": {
      "sceneNumber": 2,
      "notes": "侧视图"
    }
  }
}
```

**字段说明:**

- `primaryCategory`: 主分类 (对应 MediaCategory 的 ID)
- `tags`: 标签列表 (对应 MediaTag 的 ID)
- `defaultMetadata`: 应用到所有图片的默认元数据
  - `seriesNumber`: 系列编号
  - `combinationNumber`: 组合编号
  - `sceneNumber`: 场景编号
  - `specs`: 规格列表
  - `colors`: 颜色列表
  - `notes`: 备注
- `fileMetadata`: 为特定文件设置的元数据 (会覆盖 defaultMetadata)

### 3. 配置环境变量

确保 `cms/.env` 文件包含正确的 S3 配置:

```bash
# AWS S3 Configuration
S3_BUCKET_NAME=busrom-media-production
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

# CDN Configuration
CDN_DOMAIN=https://d1234567890.cloudfront.net

# Database
DATABASE_URL=postgresql://user:password@host:5432/database
```

### 4. 运行批量上传

#### 不使用元数据文件:

```bash
cd busrom-work
npx tsx scripts/batch-upload-with-variants.ts ../products/01-glass-standoff/scene-images
```

#### 使用元数据文件:

```bash
npx tsx scripts/batch-upload-with-variants.ts ../products/01-glass-standoff/scene-images --metadata scene-metadata.json
```

### 5. 查看上传结果

脚本会实时显示每张图片的上传进度:

```
[1/145] 01-standoff-scene-001.jpg
  📊 Extracting metadata...
    3840x2560, 1.06MB
  ☁️  Uploading to S3...
    ✓ Original uploaded
  🎨 Generating variants...
    ✓ thumbnail
    ✓ small
    ✓ medium
    ✓ large
    ✓ xlarge
    ✓ webp
  💾 Database record created
  ✅ Complete!
```

最后会显示汇总信息:

```
═══════════════════════════════════════════════════════════════
📊 Summary:
   ✅ Success: 142
   ❌ Errors: 3
═══════════════════════════════════════════════════════════════
```

## 文件存储结构

上传后的 S3 结构:

```
s3://busrom-media-production/
  ├── abc-123-def.jpg              # 原图 (UUID 命名)
  ├── xyz-456-ghi.jpg
  └── variants/
      ├── thumbnail/
      │   ├── 01-standoff-scene-001.jpg
      │   └── 01-standoff-scene-002.jpg
      ├── small/
      │   ├── 01-standoff-scene-001.jpg
      │   └── 01-standoff-scene-002.jpg
      ├── medium/
      │   ├── 01-standoff-scene-001.jpg
      │   └── 01-standoff-scene-002.jpg
      ├── large/
      │   ├── 01-standoff-scene-001.jpg
      │   └── 01-standoff-scene-002.jpg
      ├── xlarge/
      │   ├── 01-standoff-scene-001.jpg
      │   └── 01-standoff-scene-002.jpg
      └── webp/
          ├── 01-standoff-scene-001.webp
          └── 01-standoff-scene-002.webp
```

## 数据库记录

每张图片会创建一条 Media 记录:

```sql
INSERT INTO Media (
  filename,
  file_id,
  file_extension,
  width,
  height,
  fileSize,
  mimeType,
  metadata,
  variants,
  ...
)
```

## 高级用法

### 批量上传多个系列

创建多个元数据文件,针对不同系列:

```bash
# 系列 1
npx tsx scripts/batch-upload-with-variants.ts \
  ../products/01-glass-standoff/scene-images \
  --metadata series1-metadata.json

# 系列 2
npx tsx scripts/batch-upload-with-variants.ts \
  ../products/02-glass-connected-fitting/scene-images \
  --metadata series2-metadata.json
```

### 仅上传特定类型的图片

修改脚本或手动筛选文件:

```bash
# 仅上传 JPG
npx tsx scripts/batch-upload-with-variants.ts \
  ../products/scene-images-jpg

# 仅上传 PNG
npx tsx scripts/batch-upload-with-variants.ts \
  ../products/scene-images-png
```

### 自动为场景编号

使用脚本自动生成元数据:

```bash
# 创建自动编号的元数据
node -e "
const files = require('fs').readdirSync('../products/01-glass-standoff/scene-images')
  .filter(f => f.endsWith('.jpg'))
  .sort();

const metadata = {
  defaultMetadata: { seriesNumber: 1 },
  fileMetadata: {}
};

files.forEach((file, i) => {
  metadata.fileMetadata[file] = { sceneNumber: i + 1 };
});

require('fs').writeFileSync('auto-metadata.json', JSON.stringify(metadata, null, 2));
"

# 使用生成的元数据上传
npx tsx scripts/batch-upload-with-variants.ts \
  ../products/01-glass-standoff/scene-images \
  --metadata auto-metadata.json
```

## 故障排查

### 上传失败

**问题**: S3 上传失败

**解决**:
1. 检查 S3 凭证是否正确
2. 检查网络连接
3. 检查 S3 bucket 权限

```bash
# 测试 S3 连接
aws s3 ls s3://busrom-media-production/
```

### 变体生成失败

**问题**: 图片变体生成失败

**解决**:
1. 检查 sharp 库是否正确安装
2. 检查图片文件是否损坏
3. 检查内存是否充足 (处理大图需要较多内存)

```bash
# 重新安装 sharp
npm install sharp --force
```

### 数据库连接失败

**问题**: 无法连接数据库

**解决**:
1. 检查 DATABASE_URL 是否正确
2. 检查数据库是否可访问
3. 检查防火墙设置

```bash
# 测试数据库连接
psql "$DATABASE_URL"
```

## 性能优化

### 并行上传 (高级)

如果需要更快的上传速度,可以修改脚本实现并行上传:

```typescript
// 使用 Promise.all 并行处理
const BATCH_SIZE = 5; // 同时处理 5 张图片

for (let i = 0; i < imageFiles.length; i += BATCH_SIZE) {
  const batch = imageFiles.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(file => uploadImage(file)));
}
```

### 跳过已上传的图片

如果上传中断,可以添加跳过逻辑:

```typescript
// 检查文件是否已存在
const existingMedia = await prisma.media.findFirst({
  where: { filename }
});

if (existingMedia) {
  console.log(`  ⏭️  Skipped (already exists)`);
  continue;
}
```

## 与 CMS 批量上传的对比

| 功能 | 脚本批量上传 | CMS 批量上传页面 |
|------|------------|-----------------|
| 速度 | ⚡ 非常快 (直接上传) | 🐌 慢 (HTTP multipart) |
| 数量限制 | ♾️ 无限制 | ⚠️ 受超时限制 |
| 元数据支持 | ✅ 支持 JSON 配置 | ✅ UI 表单 |
| 变体生成 | ✅ 自动生成 | ✅ 自动生成 |
| 错误恢复 | ✅ 可中断恢复 | ❌ 需要重新上传 |
| 适用场景 | 大批量 (100+ 图片) | 小批量 (< 50 图片) |

## 最佳实践

1. **先小批量测试**: 先用 5-10 张图片测试,确认流程正确
2. **备份原始文件**: 上传前备份原始图片
3. **使用有意义的文件名**: 文件名会保存在数据库中,方便后续查找
4. **合理分批上传**: 建议每次上传 100-200 张,避免单次任务过大
5. **检查上传结果**: 上传后在 CMS 中抽查几张图片,确认元数据正确

## 总结

使用批量上传脚本的完整流程:

```bash
# 1. 准备图片
ls ../products/01-glass-standoff/scene-images

# 2. 创建元数据文件
cp scripts/batch-metadata-template.json scene-metadata.json
# 编辑 scene-metadata.json

# 3. 运行上传
npx tsx scripts/batch-upload-with-variants.ts \
  ../products/01-glass-standoff/scene-images \
  --metadata scene-metadata.json

# 4. 检查 CMS
# 访问 http://cms.busromhouse.com/media
```

这样就完成了从本地到 S3 再到 CMS 的完整流程,速度快、自动化程度高! 🚀
