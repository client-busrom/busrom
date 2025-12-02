# 使用 AWS CLI 批量上传图片指南

本指南说明如何使用 AWS CLI 批量上传图片到 MinIO/S3，然后批量导入到 CMS。

## 🎯 工作流程概览

```
┌─────────────────┐
│  本地图片文件    │
│  ~/workspace/   │
│    products/    │
└────────┬────────┘
         │
         │ 1. AWS CLI 批量上传
         ↓
┌─────────────────┐
│  MinIO/S3       │
│  busrom-media   │
│  bucket         │
└────────┬────────┘
         │
         │ 2. 批量导入脚本
         ↓
┌─────────────────┐
│  CMS 数据库     │
│  MediaFile      │
│  + Category     │
│  + Tags         │
│  + Metadata     │
└─────────────────┘
```

## 📋 前置准备

### 1. 启动本地 MinIO

```bash
cd busrom-work
docker-compose up -d

# 检查 MinIO 状态
docker-compose ps

# 访问 MinIO 控制台
open http://localhost:9001
# 登录: minioadmin / minioadmin123
```

### 2. 配置 AWS CLI

```bash
# 运行配置脚本（只需运行一次）
./scripts/setup-aws-cli-for-minio.sh

# 验证配置
aws s3 ls \
  --endpoint-url http://localhost:9000 \
  --profile minio
```

### 3. 启动 CMS（初始化数据）

```bash
cd cms
npm run dev

# CMS 启动时会自动运行 seed 脚本
# 创建 12 个 MediaCategory 和 55 个 MediaTag
```

访问 http://localhost:3000 验证数据已创建。

## 🚀 方法一: 快速上传（推荐）

适用于简单场景，所有图片使用相同的 category 和 tags。

### 步骤 1: 上传图片到 S3

```bash
# 上传单个产品系列
aws s3 sync ~/workspace/products/01-glass-standoff/product-images/s01/ \
  s3://busrom-media/01-glass-standoff/product-images/s01/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --exclude "*.DS_Store"

# 批量上传所有产品
aws s3 sync ~/workspace/products/ \
  s3://busrom-media/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --exclude "*.DS_Store"
```

### 步骤 2: 创建 metadata 配置文件

**文件**: `scripts/metadata/glass-standoff-s01.json`

```json
{
  "s3Prefix": "01-glass-standoff/product-images/s01/",
  "primaryCategory": "product-image",
  "tags": ["series-glass-standoff"],
  "defaultMetadata": {
    "seriesNumber": 1,
    "specs": ["50mm", "不锈钢"],
    "colors": ["银色"]
  }
}
```

### 步骤 3: 运行导入脚本

```bash
cd busrom-work

# 导入单个配置
tsx scripts/batch-import-from-s3.ts metadata/glass-standoff-s01.json

# 批量导入所有配置
for config in scripts/metadata/*.json; do
  echo "导入: $config"
  tsx scripts/batch-import-from-s3.ts "$config"
done
```

## 🎨 方法二: 自动生成配置（推荐用于大量文件）

适用于复杂场景，自动根据文件夹结构生成所有配置文件。

**✨ 新功能**: 现已支持递归扫描嵌套目录，自动识别场景标签和元数据！

### 步骤 1: 上传所有图片到 S3

```bash
# 批量上传，保持目录结构
aws s3 sync ~/workspace/products/ \
  s3://busrom-media/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --exclude "*.DS_Store" \
  --exclude "*.gitkeep"

# 验证上传
aws s3 ls s3://busrom-media/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --recursive | head -20
```

### 步骤 2: 自动生成所有 metadata 配置

```bash
# 从 busrom-work 目录运行
npx tsx scripts/generate-metadata-configs.ts

# 检查生成的配置文件
ls -lh scripts/metadata/
```

**自动识别功能**：

此脚本会扫描 `~/workspace/products/` 目录，自动：
- ✅ 识别所有10个产品系列
- ✅ 递归扫描多层嵌套目录（如 scene-images/handrail-fitting/group-01/scene-01/）
- ✅ 从文件夹名提取标签（规格、场景类型）
- ✅ 提取元数据（系列编号、场景编号、组编号）
- ✅ 自动分类（product-image, scene-image, dimension-image 等）

**示例输出**：
```
🔍 扫描: 02-glass-connected-fitting
  ✅ glass-connected-fitting-product-images-combined-elbow-adjustable.json
  ✅ glass-connected-fitting-scene-images-handrail-fitting-group-01-scene-01.json
  ...
```

生成的配置示例：
```json
{
  "s3Prefix": "02-glass-connected-fitting/scene-images/handrail-fitting/group-01/scene-01/",
  "primaryCategory": "scene-image",
  "tags": [
    "series-glass-connected-fitting",
    "scene-handrail-fitting"
  ],
  "defaultMetadata": {
    "groupNumber": 1,
    "sceneNumber": 1
  }
}
```

### 步骤 3: 批量导入

```bash
# 进入 cms 目录
cd cms

# 导入所有配置
for config in ../scripts/metadata/*.json; do
  echo "════════════════════════════════════════"
  echo "导入: $(basename $config)"
  echo "════════════════════════════════════════"
  npx tsx ../scripts/batch-import-from-s3.ts "$config"
  echo ""
done
```

## 📝 配置文件详解

### 基本配置

```json
{
  "s3Prefix": "01-glass-standoff/product-images/s01/",
  "primaryCategory": "product-image",
  "tags": ["series-glass-standoff"],
  "defaultMetadata": {
    "seriesNumber": 1
  }
}
```

### 完整配置（带多个标签和自定义 metadata）

```json
{
  "s3Prefix": "02-glass-connected-fitting/product-images/combined-elbow-adjustable/",
  "primaryCategory": "product-image",
  "tags": [
    "series-glass-connected-fitting",
    "spec-combined-elbow-adjustable"
  ],
  "defaultMetadata": {
    "specs": ["90度", "可调节"],
    "colors": ["银色", "黑色"]
  },
  "fileMetadata": {
    "image-001.jpg": {
      "colors": ["银色"]
    },
    "image-002.jpg": {
      "colors": ["黑色"]
    }
  }
}
```

### 指定具体文件列表

```json
{
  "s3Keys": [
    "01-glass-standoff/scene-images/scene-001.jpg",
    "01-glass-standoff/scene-images/scene-002.jpg"
  ],
  "primaryCategory": "scene-image",
  "tags": ["series-glass-standoff", "scene-normal"],
  "defaultMetadata": {}
}
```

## 🔄 完整示例

### 示例 1: 导入玻璃固定夹系列 01

```bash
# 1. 上传图片
aws s3 sync ~/workspace/products/01-glass-standoff/product-images/s01/ \
  s3://busrom-media/01-glass-standoff/product-images/s01/ \
  --endpoint-url http://localhost:9000 \
  --profile minio

# 2. 创建配置文件
cat > scripts/metadata/glass-standoff-s01.json << 'EOF'
{
  "s3Prefix": "01-glass-standoff/product-images/s01/",
  "primaryCategory": "product-image",
  "tags": ["series-glass-standoff"],
  "defaultMetadata": {
    "seriesNumber": 1,
    "specs": ["50mm", "不锈钢"],
    "colors": ["银色"]
  }
}
EOF

# 3. 导入到 CMS
tsx scripts/batch-import-from-s3.ts scripts/metadata/glass-standoff-s01.json
```

### 示例 2: 导入场景图

```bash
# 1. 上传场景图
aws s3 sync ~/workspace/products/01-glass-standoff/scene-images/ \
  s3://busrom-media/01-glass-standoff/scene-images/ \
  --endpoint-url http://localhost:9000 \
  --profile minio

# 2. 创建配置
cat > scripts/metadata/glass-standoff-scenes.json << 'EOF'
{
  "s3Prefix": "01-glass-standoff/scene-images/",
  "primaryCategory": "scene-image",
  "tags": [
    "series-glass-standoff",
    "scene-normal"
  ],
  "defaultMetadata": {
    "sceneNumber": 1
  }
}
EOF

# 3. 导入
tsx scripts/batch-import-from-s3.ts scripts/metadata/glass-standoff-scenes.json
```

## 📊 验证和查看

### 查看 S3 中的文件

```bash
# 列出所有文件
aws s3 ls s3://busrom-media/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --recursive

# 列出特定路径
aws s3 ls s3://busrom-media/01-glass-standoff/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --recursive

# 统计文件数量
aws s3 ls s3://busrom-media/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --recursive | wc -l
```

### 在 CMS 中验证

访问 http://localhost:3000/media 查看导入的图片记录。

### 使用 GraphQL 查询

```graphql
query {
  mediaFiles(where: {
    tags: { some: { slug: { equals: "series-glass-standoff" } } }
  }) {
    id
    filename
    category {
      name
    }
    tags {
      name
    }
    metadata
  }
}
```

## 🛠️ 常用 AWS CLI 命令

### 上传文件

```bash
# 上传单个文件
aws s3 cp image.jpg s3://busrom-media/test/ \
  --endpoint-url http://localhost:9000 \
  --profile minio

# 同步文件夹（保持结构）
aws s3 sync ./local-folder/ s3://busrom-media/remote-folder/ \
  --endpoint-url http://localhost:9000 \
  --profile minio

# 同步并排除某些文件
aws s3 sync ./images/ s3://busrom-media/images/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --exclude "*.DS_Store" \
  --exclude "*.gitkeep"
```

### 列出文件

```bash
# 列出 bucket
aws s3 ls \
  --endpoint-url http://localhost:9000 \
  --profile minio

# 列出文件夹
aws s3 ls s3://busrom-media/01-glass-standoff/ \
  --endpoint-url http://localhost:9000 \
  --profile minio

# 递归列出所有文件
aws s3 ls s3://busrom-media/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --recursive
```

### 删除文件

```bash
# 删除单个文件
aws s3 rm s3://busrom-media/test/image.jpg \
  --endpoint-url http://localhost:9000 \
  --profile minio

# 删除文件夹
aws s3 rm s3://busrom-media/test/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --recursive
```

### 复制文件

```bash
# S3 内部复制
aws s3 cp s3://busrom-media/old/image.jpg s3://busrom-media/new/image.jpg \
  --endpoint-url http://localhost:9000 \
  --profile minio
```

## 💡 最佳实践

### 1. 目录结构规范

保持清晰的目录结构，便于管理：

```
busrom-media/
├── 01-glass-standoff/
│   ├── product-images/
│   │   ├── s01/
│   │   ├── s02/
│   │   └── general/
│   ├── scene-images/
│   ├── actual-photos/
│   └── dimension-images/
├── 02-glass-connected-fitting/
│   ├── product-images/
│   │   ├── combined-elbow-adjustable/
│   │   └── integrated-elbow-fixed/
│   └── scene-images/
└── ...
```

### 2. 文件命名规范

使用有意义的文件名，避免中文和特殊字符：

```
✅ 推荐:
- glass-standoff-s01-main.jpg
- scene-bathroom-001.jpg
- dimension-50mm-drawing.jpg

❌ 不推荐:
- IMG_0001.jpg
- 图片1.jpg
- photo (1).jpg
```

### 3. 批量操作建议

- **先小批量测试**: 先上传少量文件测试流程
- **分批处理**: 不要一次性上传所有文件，按产品系列分批
- **保留备份**: 上传前确保本地有备份
- **验证结果**: 每批上传后验证 CMS 中的数据

### 4. metadata 配置建议

- **使用模板**: 为相似的产品创建配置模板
- **版本控制**: 将配置文件加入 git 版本控制
- **文档说明**: 为每个配置文件添加注释说明

## ⚠️ 注意事项

### 1. file_id 唯一性

- 文件名将作为 `file_id`，必须唯一
- 如果文件名重复，后面的会被跳过
- 建议使用有意义且唯一的文件名

### 2. 图片尺寸信息

- 导入后 `width` 和 `height` 为 null
- 需要后续更新（可以通过额外的脚本处理）

### 3. 图片变体

- 此方法不会自动生成图片变体
- 如需变体，可以：
  - 使用原来的 `batch-upload-with-variants.ts` 脚本
  - 或后续添加变体生成功能

### 4. MinIO vs AWS S3

**本地开发（MinIO）**:
```bash
--endpoint-url http://localhost:9000
--profile minio
```

**生产环境（AWS S3）**:
```bash
# 移除 --endpoint-url
# 使用 production profile
--profile production
```

## 🐛 故障排除

### 问题 1: "Could not connect to the endpoint URL"

**原因**: MinIO 未启动

**解决**:
```bash
docker-compose up -d
docker-compose ps  # 检查状态
```

### 问题 2: "未找到 MediaCategory"

**原因**: seed 数据未初始化

**解决**:
```bash
cd cms
npm run dev  # seed 会自动运行
```

### 问题 3: "Access Denied"

**原因**: AWS CLI 配置错误

**解决**:
```bash
# 重新配置
./scripts/setup-aws-cli-for-minio.sh

# 检查配置
cat ~/.aws/credentials
cat ~/.aws/config
```

### 问题 4: 文件上传成功但导入失败

**检查步骤**:

1. 验证 S3 中的文件:
```bash
aws s3 ls s3://busrom-media/your-path/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --recursive
```

2. 检查配置文件格式:
```bash
cat scripts/metadata/your-config.json | jq .
```

3. 检查 category 和 tag 是否存在:
```bash
# 在 CMS GraphQL 中查询
query {
  mediaCategories {
    slug
  }
  mediaTags {
    slug
  }
}
```

## 📚 相关文档

- [MinIO 文档](https://min.io/docs/minio/linux/index.html)
- [AWS CLI S3 命令参考](https://docs.aws.amazon.com/cli/latest/reference/s3/)
- [Metadata 配置说明](../scripts/metadata/README.md)
- [最终 Seed 结构](./FINAL_SEED_STRUCTURE.md)

## ✅ 快速检查清单

导入前检查:
- [ ] MinIO 已启动 (`docker-compose ps`)
- [ ] AWS CLI 已配置 (`aws s3 ls --endpoint-url http://localhost:9000 --profile minio`)
- [ ] CMS 已启动并初始化数据 (`npm run dev`)
- [ ] 产品图片已准备好 (`~/workspace/products/`)

导入后验证:
- [ ] S3 中文件数量正确
- [ ] CMS 中 MediaFile 记录已创建
- [ ] Category 和 Tags 关联正确
- [ ] Metadata 数据准确
