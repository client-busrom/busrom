# Metadata 配置文件说明

此文件夹存放批量导入的 metadata 配置文件。

## 📁 文件结构

```
metadata/
├── README.md                           # 本文件
├── glass-standoff-s01.json            # 玻璃固定夹系列 01
├── glass-standoff-s02.json            # 玻璃固定夹系列 02
├── glass-connected-fitting-combined.json  # 玻璃连接件-组合款
└── ...
```

## 📝 配置文件格式

### 基本格式

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

### 完整格式（带单文件覆盖）

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

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `s3Prefix` | string | 二选一 | S3 路径前缀，导入该路径下所有文件 |
| `s3Keys` | string[] | 二选一 | 直接指定 S3 key 列表 |
| `primaryCategory` | string | 是 | MediaCategory 的 slug |
| `tags` | string[] | 是 | MediaTag 的 slug 列表 |
| `defaultMetadata` | object | 否 | 默认 metadata（应用到所有文件） |
| `fileMetadata` | object | 否 | 单个文件的 metadata 覆盖 |

### metadata 支持的字段

```typescript
{
  "seriesNumber": 1,           // 系列序号
  "combinationNumber": 1,      // 组合编号
  "sceneNumber": 1,           // 场景编号
  "specs": ["50mm", "不锈钢"], // 规格列表
  "colors": ["银色", "黑色"],  // 颜色列表
  // 其他自定义字段...
}
```

## 🎯 使用示例

### 示例 1: 玻璃固定夹系列 01

**文件**: `metadata/glass-standoff-s01.json`

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

**使用**:
```bash
# 1. 先用 AWS CLI 上传图片到 MinIO
aws s3 sync ~/workspace/products/01-glass-standoff/product-images/s01/ \
  s3://busrom-media/01-glass-standoff/product-images/s01/ \
  --endpoint-url http://localhost:9000 \
  --profile minio

# 2. 运行导入脚本
tsx scripts/batch-import-from-s3.ts metadata/glass-standoff-s01.json
```

### 示例 2: 玻璃连接件 - 组合款

**文件**: `metadata/glass-connected-fitting-combined.json`

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
  }
}
```

### 示例 3: 指定具体文件列表

**文件**: `metadata/custom-selection.json`

```json
{
  "s3Keys": [
    "01-glass-standoff/scene-images/scene-001.jpg",
    "01-glass-standoff/scene-images/scene-002.jpg",
    "01-glass-standoff/scene-images/scene-003.jpg"
  ],
  "primaryCategory": "scene-image",
  "tags": [
    "series-glass-standoff",
    "scene-normal"
  ],
  "defaultMetadata": {
    "sceneNumber": 1
  },
  "fileMetadata": {
    "scene-001.jpg": { "sceneNumber": 1 },
    "scene-002.jpg": { "sceneNumber": 2 },
    "scene-003.jpg": { "sceneNumber": 3 }
  }
}
```

## 🔄 完整工作流程

### 1. 准备图片文件

确保图片文件在 `~/workspace/products/` 下按产品分类组织好。

### 2. 使用 AWS CLI 批量上传到 MinIO

```bash
# 配置 AWS CLI（只需运行一次）
./scripts/setup-aws-cli-for-minio.sh

# 批量上传图片（保持目录结构）
aws s3 sync ~/workspace/products/01-glass-standoff/ \
  s3://busrom-media/01-glass-standoff/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --exclude "*.DS_Store"
```

### 3. 创建 metadata 配置文件

为每个产品系列创建对应的 JSON 配置文件。

### 4. 运行导入脚本

```bash
# 导入单个系列
tsx scripts/batch-import-from-s3.ts metadata/glass-standoff-s01.json

# 批量导入所有配置
for config in metadata/*.json; do
  tsx scripts/batch-import-from-s3.ts "$config"
done
```

### 5. 验证结果

在 CMS 中检查导入的图片记录：
- http://localhost:3000/media

## 📋 可用的 Category 和 Tag

### MediaCategory (12个)

| Slug | 中文 | 对应文件夹 |
|------|------|-----------|
| product-image | 产品图 | product-images/ |
| scene-image | 场景图 | scene-images/ |
| actual-photo | 实拍图 | actual-photos/ |
| dimension-image | 尺寸图 | dimension-images/ |
| installation-image | 安装图 | installation-images/ |
| detail-image | 细节图 | detail-images/ |
| combined-image | 组合展示图 | combined-images/ |
| multi-style-image | 多款式图 | multi-style-images/ |
| color-display | 颜色展示 | color-images/ |
| common-image | 通用图 | common-images/ |
| manufacturing | 生产图 | manufacturing/ |
| package-image | 包装图 | packages/ |

### 产品系列 Tag (10个)

| Slug | 中文 |
|------|------|
| series-glass-standoff | 玻璃固定夹 |
| series-glass-connected-fitting | 玻璃连接件 |
| series-glass-fence-spigot | 玻璃栏杆立柱 |
| series-guardrail-glass-clip | 护栏玻璃夹 |
| series-bathroom-glass-clip | 浴室玻璃夹 |
| series-glass-hinge | 玻璃合页 |
| series-sliding-door-kit | 滑动门套件 |
| series-bathroom-handle | 浴室拉手 |
| series-door-handle | 门拉手 |
| series-hidden-hook | 隐藏式挂钩 |

### 场景类型 Tag (4个)

| Slug | 中文 |
|------|------|
| scene-normal | 普通场景图 |
| scene-single | 单独场景图 |
| scene-combination | 场景组合图 |
| scene-series | 系列场景图 |

完整的 Tag 列表请参考: `docs/FINAL_SEED_STRUCTURE.md`

## ⚠️ 注意事项

1. **S3 路径命名**: 建议使用 `产品编号-名称/图片类型/子分类/` 的格式
2. **文件命名**: 文件名将作为 `file_id`，需要唯一
3. **已存在的文件**: 如果 `file_id` 已存在，会跳过导入
4. **图片尺寸**: 导入后 `width` 和 `height` 为 null，需要后续更新
5. **图片变体**: 此脚本不生成变体，需要后续处理

## 🛠️ 故障排除

### 问题 1: "未找到 MediaCategory"

确保先运行 seed 脚本初始化数据：
```bash
cd cms
npm run dev  # seed 脚本会自动运行
```

### 问题 2: "连接 S3 失败"

确保 MinIO 正在运行：
```bash
docker-compose up -d
```

### 问题 3: "找不到文件"

检查 S3 中的文件：
```bash
aws s3 ls s3://busrom-media/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --recursive
```
