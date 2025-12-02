# 产品图片元数据映射总结

本文档说明产品图片文件夹结构如何映射到 CMS 的 Category、Tag 和 Metadata。

## 📊 核心映射规则

### 垂类区分

#### 1. 场景图 (scene-images)
使用 **metadata 编号**表示层级关系：

| 文件夹 | Metadata 字段 | 示例 |
|--------|--------------|------|
| `group-01`, `group-02` | `combinationNumber` | `{ combinationNumber: 1 }` |
| `scene-01`, `scene-02` | `sceneNumber` | `{ sceneNumber: 1 }` |

使用 **tag** 表示场景类型：
- `handrail-fitting` → `scene-handrail-fitting`
- `outdoor` → `scene-outdoor`
- `standalone` → `scene-standalone`

**示例**：
```
scene-images/
├── handrail-fitting/        ← tag: scene-handrail-fitting
│   ├── group-01/            ← metadata: combinationNumber = 1
│   │   └── scene-01/        ← metadata: sceneNumber = 1
│   │       └── photo.jpg
```

生成的配置：
```json
{
  "s3Prefix": "02-glass-connected-fitting/scene-images/handrail-fitting/group-01/scene-01/",
  "primaryCategory": "scene-image",
  "tags": [
    "series-glass-connected-fitting",
    "scene-handrail-fitting"
  ],
  "defaultMetadata": {
    "combinationNumber": 1,
    "sceneNumber": 1
  }
}
```

#### 2. 白底图/产品图 (product-images)
使用 **metadata** 表示系列编号，**tag** 表示特殊规格：

| 文件夹类型 | 映射方式 | 示例 |
|-----------|---------|------|
| `s01`, `s02`, `s40` | metadata: `seriesNumber` | `{ seriesNumber: 1 }` |
| `combined-elbow-adjustable` | tag: `spec-combined-elbow-adjustable` | 规格标签 |
| `angle-90` | tag: `spec-angle-90` | 角度规格 |
| `general` | tag: `spec-general` | 通用规格 |

**示例**：
```
product-images/
├── s01/                     ← metadata: seriesNumber = 1
├── combined-elbow-adjustable/  ← tag: spec-combined-elbow-adjustable
└── angle-90/                   ← tag: spec-angle-90
```

## 🗂️ Category 映射

| 文件夹名 | Category Slug |
|---------|---------------|
| `product-images` | `product-image` |
| `scene-images` | `scene-image` |
| `dimension-images` | `dimension-image` |
| `actual-photos` | `actual-photo` |
| `combined-images` | `combined-image` |
| `multi-style-images` | `multi-style-image` |
| `color-images` | `color-display` |
| `common-images` | `common-image` |
| `manufacturing` | `manufacturing` |
| `packages` | `package-image` |
| `detail-images` | `detail-image` |
| `installation-images` | `installation-image` |

## 🏷️ Tag 映射

### 产品系列标签 (PRODUCT_SERIES)
自动添加对应的产品系列标签：

| 产品文件夹 | Tag Slug |
|-----------|----------|
| `01-glass-standoff` | `series-glass-standoff` |
| `02-glass-connected-fitting` | `series-glass-connected-fitting` |
| `03-glass-fence-spigot` | `series-glass-fence-spigot` |
| `04-guardrail-glass-clip` | `series-guardrail-glass-clip` |
| `05-bathroom-glass-clip` | `series-bathroom-glass-clip` |
| `06-glass-hinge` | `series-glass-hinge` |
| `07-sliding-door-kit` | `series-sliding-door-kit` |
| `08-bathroom-handle` | `series-bathroom-handle` |
| `09-door-handle` | `series-door-handle` |
| `10-hidden-hook` | `series-hidden-hook` |

### 规格标签 (SPEC)

#### 玻璃连接件规格
- `combined-elbow-adjustable` → `spec-combined-elbow-adjustable`
- `combined-elbow-fixed` → `spec-combined-elbow-fixed`
- `combined-flat-fixed` → `spec-combined-flat-fixed`
- `integrated-elbow-adjustable` → `spec-integrated-elbow-adjustable`
- `integrated-elbow-fixed` → `spec-integrated-elbow-fixed`
- `integrated-flat-fixed` → `spec-integrated-flat-fixed`

#### 头型规格
- `round-head` → `spec-round-head`
- `square-head` → `spec-square-head`

#### 角度规格
- `angle-0` → `spec-angle-0`
- `angle-90` → `spec-angle-90`
- `angle-90-single` → `spec-angle-90-single`
- `angle-90-double` → `spec-angle-90-double`
- `angle-90-beveled` → `spec-angle-90-beveled`
- `angle-135` → `spec-angle-135`
- `angle-180` → `spec-angle-180`
- `angle-360` → `spec-angle-360`

#### 形状规格
- `circle` → `spec-circle`
- `semicircle-arc` → `spec-semicircle-arc`
- `semicircle-flat` → `spec-semicircle-flat`
- `square-arc` → `spec-square-arc`
- `square-flat` → `spec-square-flat`
- `various` → `spec-various`

#### 门拉手规格
- `featured-bathroom` → `spec-featured-bathroom`
- `featured-combined` → `spec-featured-combined`
- `featured-cylinder` → `spec-featured-cylinder`
- `featured-glass-door` → `spec-featured-glass-door`
- `featured-square` → `spec-featured-square`
- `main-bathroom` → `spec-main-bathroom`
- `main-combined` → `spec-main-combined`
- `main-cylinder` → `spec-main-cylinder`
- `main-glass-door` → `spec-main-glass-door`
- `main-square` → `spec-main-square`

#### 挂钩规格
- `single-hook-economy` → `spec-single-hook-economy`
- `single-hook-premium` → `spec-single-hook-premium`
- `double-hook` → `spec-double-hook`

#### 通用规格
- `general` → `spec-general`
- `common` → `spec-common`
- `featured` → `spec-featured`

### 场景类型标签 (SCENE_TYPE)

#### 具体应用场景
- `handrail-fitting` → `scene-handrail-fitting` (扶手连接件场景)
- `glass-connector` → `scene-glass-connector` (玻璃连接件场景)
- `bathroom-series` → `scene-bathroom` (浴室场景)
- `guardrail-series` → `scene-guardrail` (护栏场景)
- `outdoor` → `scene-outdoor` (室外场景)
- `indoor` → `scene-indoor` (室内场景)
- `standalone` → `scene-standalone` (独立场景)
- `closeup` → `scene-closeup` (特写场景)

#### 场景格式
- `rectangular` → `scene-rectangular` (长方形格式，如 1200x627)
- `square` → `scene-square` (正方形格式，如 800x800)

## 📝 Metadata 字段说明

所有 metadata 存储在 JSON 字段中：

```typescript
interface Metadata {
  seriesNumber?: number       // 系列编号 (s01 → 1, s02 → 2)
  combinationNumber?: number  // 组合编号 (group-01 → 1, group-02 → 2)
  sceneNumber?: number        // 场景编号 (scene-01 → 1, scene-02 → 2)
  specs?: string[]           // 规格描述（可选）
  colors?: string[]          // 颜色描述（可选）
  notes?: string             // 备注（可选）
}
```

### 提取规则

| 文件夹模式 | Metadata 字段 | 提取逻辑 |
|-----------|--------------|---------|
| `s(\d+)` | `seriesNumber` | 提取数字部分 |
| `group-(\d+)` | `combinationNumber` | 提取数字部分 |
| `scene-(\d+)` | `sceneNumber` | 提取数字部分 |
| `series-(\d+)` | `seriesNumber` | 提取数字部分 |

## ✅ 验证结果

### Seed 数据统计
- ✅ **12个** MediaCategory
- ✅ **82个** MediaTag
  - 10个产品系列标签
  - 14个场景类型标签
  - 38个规格标签
  - 6个颜色标签
  - 2个自定义标签

### 配置文件统计
- ✅ 生成约 **200+** 个配置文件
- ✅ 使用 **55个** 不同标签
- ✅ 所有标签都已在 Seed 中定义

### 标签类型分布
- 产品系列 (series-): 10个
- 规格标签 (spec-): 36个
- 场景类型 (scene-): 9个

## 🔧 使用流程

### 1. 生成配置文件
```bash
npx tsx scripts/generate-metadata-configs.ts
```

### 2. 上传到 S3
```bash
aws s3 sync ~/workspace/products/ s3://busrom-media/ \
  --endpoint-url http://localhost:9000 \
  --profile minio \
  --exclude "*.DS_Store"
```

### 3. 批量导入
```bash
cd cms
for config in ../scripts/metadata/*.json; do
  npx tsx ../scripts/batch-import-from-s3.ts "$config"
done
```

### 4. 更新尺寸和生成变体
```bash
node ../scripts/update-image-dimensions.js
node ../scripts/generate-variants.js
```

## 📚 相关文档

- [PRODUCTS_CLASSIFICATION_TAGS.md](./PRODUCTS_CLASSIFICATION_TAGS.md) - 产品分类和标签详细说明
- [BATCH_UPLOAD_AWS_CLI_GUIDE.md](./BATCH_UPLOAD_AWS_CLI_GUIDE.md) - 批量上传指南
- [FINAL_SEED_STRUCTURE.md](./FINAL_SEED_STRUCTURE.md) - Seed 数据结构

---

**最后更新**: 2025-11-23
**版本**: v1.0
