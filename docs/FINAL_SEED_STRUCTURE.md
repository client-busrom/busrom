# 最终 Seed 数据结构

## 📊 数据统计

| 类别 | 数量 | 说明 |
|------|------|------|
| MediaCategory | 12 | 图片用途分类 |
| PRODUCT_SERIES | 10 | 产品系列标签 |
| SCENE_TYPE | 4 | 场景类型标签 |
| SPEC | 33 | 规格/款式标签 |
| COLOR | 6 | 颜色标签 |
| CUSTOM | 2 | 自定义标签 |
| **总计** | **67** | **所有标签** |

## 📁 MediaCategory (12个)

基于实际产品文件夹结构的图片用途分类:

| # | Slug | EN | ZH | 对应文件夹 |
|---|------|----|----|-----------|
| 1 | product-image | Product Image | 产品图 | product-images/ |
| 2 | scene-image | Scene Image | 场景图 | scene-images/ |
| 3 | actual-photo | Actual Photo | 实拍图 | actual-photos/ |
| 4 | dimension-image | Dimension Image | 尺寸图 | dimension-images/ |
| 5 | installation-image | Installation Image | 安装图 | installation-images/ |
| 6 | detail-image | Detail Image | 细节图 | detail-images/ |
| 7 | combined-image | Combined Image | 组合展示图 | combined-images/ |
| 8 | multi-style-image | Multi-style Image | 多款式图 | multi-style-images/ |
| 9 | color-display | Color Display | 颜色展示 | color-images/ |
| 10 | common-image | Common Image | 通用图 | common-images/ |
| 11 | manufacturing | Manufacturing | 生产图 | manufacturing/ |
| 12 | package-image | Package Image | 包装图 | packages/ |

## 🏷️ MediaTag 分类

### 1. 产品系列 (PRODUCT_SERIES - 10个)

对应 products/ 下的 10 个产品文件夹:

| # | Slug | EN | ZH | 文件夹 |
|---|------|----|----|--------|
| 1 | series-glass-standoff | Glass Standoff | 玻璃固定夹 | 01-glass-standoff/ |
| 2 | series-glass-connected-fitting | Glass Connected Fitting | 玻璃连接件 | 02-glass-connected-fitting/ |
| 3 | series-glass-fence-spigot | Glass Fence Spigot | 玻璃栏杆立柱 | 03-glass-fence-spigot/ |
| 4 | series-guardrail-glass-clip | Guardrail Glass Clip | 护栏玻璃夹 | 04-guardrail-glass-clip/ |
| 5 | series-bathroom-glass-clip | Bathroom Glass Clip | 浴室玻璃夹 | 05-bathroom-glass-clip/ |
| 6 | series-glass-hinge | Glass Hinge | 玻璃合页 | 06-glass-hinge/ |
| 7 | series-sliding-door-kit | Sliding Door Kit | 滑动门套件 | 07-sliding-door-kit/ |
| 8 | series-bathroom-handle | Bathroom Handle | 浴室拉手 | 08-bathroom-handle/ |
| 9 | series-door-handle | Door Handle | 门拉手 | 09-door-handle/ |
| 10 | series-hidden-hook | Hidden Hook | 隐藏式挂钩 | 10-hidden-hook/ |

### 2. 场景类型 (SCENE_TYPE - 4个)

用于场景图的分类:

| # | Slug | EN | ZH |
|---|------|----|----|
| 1 | scene-normal | Normal Scene | 普通场景图 |
| 2 | scene-single | Single Scene | 单独场景图 |
| 3 | scene-combination | Combination Scene | 场景组合图 |
| 4 | scene-series | Series Scene | 系列场景图 |

### 3. 规格/款式 (SPEC - 33个)

#### 通用规格 (3个)

| Slug | EN | ZH |
|------|----|----|
| spec-general | General | 通用款 |
| spec-common | Common | 公共 |
| spec-featured | Featured | 精选 |

#### 玻璃连接件款式 (6个)

| Slug | EN | ZH |
|------|----|----|
| spec-combined-elbow-adjustable | Combined Elbow Adjustable | 组合款-弯头-可调 |
| spec-combined-elbow-fixed | Combined Elbow Fixed | 组合款-弯头-固定 |
| spec-combined-flat-fixed | Combined Flat Fixed | 组合款-平面-固定 |
| spec-integrated-elbow-adjustable | Integrated Elbow Adjustable | 一体款-弯头-可调 |
| spec-integrated-elbow-fixed | Integrated Elbow Fixed | 一体款-弯头-固定 |
| spec-integrated-flat-fixed | Integrated Flat Fixed | 一体款-平面-固定 |

#### 玻璃栏杆立柱款式 (2个)

| Slug | EN | ZH |
|------|----|----|
| spec-round-head | Round Head | 圆头款 |
| spec-square-head | Square Head | 方头款 |

#### 角度规格 (8个)

| Slug | EN | ZH |
|------|----|----|
| spec-angle-0 | Angle 0° | 0度角 |
| spec-angle-90 | Angle 90° | 90度角 |
| spec-angle-90-single | Angle 90° Single | 90度-单边 |
| spec-angle-90-double | Angle 90° Double | 90度-双边 |
| spec-angle-90-beveled | Angle 90° Beveled | 90度-斜边 |
| spec-angle-135 | Angle 135° | 135度角 |
| spec-angle-180 | Angle 180° | 180度角 |
| spec-angle-360 | Angle 360° | 360度 |

#### 形状规格 (6个)

| Slug | EN | ZH |
|------|----|----|
| spec-circle | Circle | 圆形款 |
| spec-semicircle-arc | Semicircle Arc | 半圆-弧形 |
| spec-semicircle-flat | Semicircle Flat | 半圆-平面 |
| spec-square-arc | Square Arc | 方形-弧形 |
| spec-square-flat | Square Flat | 方形-平面 |
| spec-various | Various | 多款式 |

#### 门拉手精选款 (5个)

| Slug | EN | ZH |
|------|----|----|
| spec-featured-bathroom | Featured Bathroom | 精选浴室款 |
| spec-featured-combined | Featured Combined | 精选组合款 |
| spec-featured-cylinder | Featured Cylinder | 精选圆柱款 |
| spec-featured-glass-door | Featured Glass Door | 精选玻璃门款 |
| spec-featured-square | Featured Square | 精选方形款 |

#### 隐藏挂钩款式 (3个)

| Slug | EN | ZH |
|------|----|----|
| spec-single-hook-economy | Single Hook Economy | 单钩-经济款 |
| spec-single-hook-premium | Single Hook Premium | 单钩-高级款 |
| spec-double-hook | Double Hook | 双钩 |

### 4. 颜色 (COLOR - 6个)

| # | Slug | EN | ZH |
|---|------|----|----|
| 1 | color-silver | Silver | 银色 |
| 2 | color-black | Black | 黑色 |
| 3 | color-gold | Gold | 金色 |
| 4 | color-rose-gold | Rose Gold | 玫瑰金 |
| 5 | color-brushed | Brushed | 拉丝 |
| 6 | color-polished | Polished | 抛光 |

### 5. 自定义 (CUSTOM - 2个)

| # | Slug | EN | ZH |
|---|------|----|----|
| 1 | custom-logistics | Logistics | 物流 |
| 2 | custom-process | Process | 工艺流程 |

## 🎯 系列序号管理

**重要**: 系列序号(如 s01-s40, s01-s24)不作为 Tag,而是通过 `metadata.seriesNumber` 字段管理:

### 玻璃固定夹 (01-glass-standoff)

- **文件夹**: `product-images/s01/` ~ `product-images/s40/`
- **Tag**: `series-glass-standoff` + `spec-general`
- **Metadata**: `{ seriesNumber: 1 }` ~ `{ seriesNumber: 40 }`

### 浴室拉手 (08-bathroom-handle)

- **文件夹**: `product-images/s01/` ~ `product-images/s24/`
- **Tag**: `series-bathroom-handle`
- **Metadata**: `{ seriesNumber: 1 }` ~ `{ seriesNumber: 24 }`

### 示例元数据映射

```json
// 01-glass-standoff/product-images/s01/
{
  "primaryCategory": "product-image",
  "tags": ["series-glass-standoff"],
  "defaultMetadata": {
    "seriesNumber": 1
  }
}

// 01-glass-standoff/product-images/general/
{
  "primaryCategory": "product-image",
  "tags": ["series-glass-standoff", "spec-general"],
  "defaultMetadata": {
    "seriesNumber": null
  }
}

// 02-glass-connected-fitting/product-images/combined-elbow-adjustable/
{
  "primaryCategory": "product-image",
  "tags": ["series-glass-connected-fitting", "spec-combined-elbow-adjustable"],
  "defaultMetadata": {}
}
```

## ✅ 优势

1. **Tag 数量合理**: 从 134+ 减少到 67 个
2. **灵活性更高**: 系列序号通过 metadata 管理,可以动态筛选
3. **避免冗余**: 不需要为每个系列创建单独的 tag
4. **易于扩展**: 新增系列只需设置 seriesNumber,无需创建新 tag
5. **结构清晰**: Tag 用于分类,metadata 用于编号

## 🔍 筛选示例

### 按产品系列筛选

```graphql
query {
  mediaFiles(where: {
    tags: { some: { slug: { equals: "series-glass-standoff" } } }
  }) {
    filename
  }
}
```

### 按系列序号筛选

通过前端客户端筛选 metadata:

```typescript
// 筛选玻璃固定夹系列 01 的图片
const series01Images = allImages.filter(img =>
  img.metadata?.seriesNumber === 1
)
```

### 组合筛选

```typescript
// 筛选玻璃固定夹系列 01-10 的产品图
const images = allImages.filter(img =>
  img.tags.includes('series-glass-standoff') &&
  img.category === 'product-image' &&
  img.metadata?.seriesNumber >= 1 &&
  img.metadata?.seriesNumber <= 10
)
```

## 📝 总结

- **MediaCategory (12个)**: 基于实际文件夹结构,完整覆盖所有图片类型
- **MediaTag (55个)**: 产品系列(10) + 场景类型(4) + 规格款式(33) + 颜色(6) + 自定义(2)
- **Metadata**: 用于存储系列序号、组合编号、场景编号等可变数据
- **所有数据**: EN/ZH 完整双语 ✅
