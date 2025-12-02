# 媒体分类结构分析

基于 `workspace/products/` 文件夹的实际结构分析

## 产品目录结构总览

```
products/
├── _common/                          # 通用图片(所有产品共用)
│   ├── colors/                      # 颜色展示图
│   ├── manufacturing/               # 生产制造相关
│   │   ├── logistics/              # 物流包装
│   │   └── process/                # 生产工艺
│   └── packages/                    # 包装图片
│
├── 01-glass-standoff/               # 玻璃固定夹
│   ├── product-images/
│   │   ├── general/                # 通用产品图
│   │   ├── s01/ ~ s40/             # 40个系列的产品图
│   └── scene-images/                # 场景图
│
├── 02-glass-connected-fitting/      # 玻璃连接件
│   ├── actual-photos/              # 实拍图
│   ├── dimension-images/           # 尺寸图
│   ├── product-images/
│   │   ├── general/
│   │   ├── combined-elbow-adjustable/     # 组合款-弯头-可调
│   │   ├── combined-elbow-fixed/          # 组合款-弯头-固定
│   │   ├── combined-flat-fixed/           # 组合款-平面-固定
│   │   ├── integrated-elbow-adjustable/   # 一体款-弯头-可调
│   │   ├── integrated-elbow-fixed/        # 一体款-弯头-固定
│   │   └── integrated-flat-fixed/         # 一体款-平面-固定
│   └── scene-images/
│
├── 03-glass-fence-spigot/           # 玻璃栏杆立柱
│   ├── multi-style-images/         # 多款式组合图
│   ├── product-images/
│   │   ├── round-head/             # 圆头款
│   │   └── square-head/            # 方头款
│   └── scene-images/
│
├── 04-guardrail-glass-clip/         # 护栏玻璃夹
│   ├── combined-images/            # 组合展示图
│   ├── product-images/
│   │   ├── angle-0/                # 0度角
│   │   ├── angle-90/               # 90度角
│   │   ├── angle-135/              # 135度角
│   │   ├── angle-180/              # 180度角
│   │   ├── circle/                 # 圆形款
│   │   ├── semicircle-arc/         # 半圆-弧形
│   │   ├── semicircle-flat/        # 半圆-平面
│   │   ├── square-arc/             # 方形-弧形
│   │   └── square-flat/            # 方形-平面
│   └── scene-images/
│
├── 05-bathroom-glass-clip/          # 浴室玻璃夹
│   ├── product-images/
│   │   ├── angle-90/
│   │   └── various/                # 多款式
│   └── scene-images/
│
├── 06-glass-hinge/                  # 玻璃合页
│   ├── common-images/              # 通用图片
│   ├── detail-images/              # 细节图
│   ├── installation-images/        # 安装示意图
│   ├── product-images/
│   │   ├── angle-0/
│   │   ├── angle-90-single/        # 90度-单边
│   │   ├── angle-90-double/        # 90度-双边
│   │   ├── angle-90-beveled/       # 90度-斜边
│   │   ├── angle-135/
│   │   ├── angle-180/
│   │   └── angle-360/              # 360度
│   └── scene-images/
│
├── 07-sliding-door-kit/             # 滑动门套件
│   ├── product-images/
│   └── scene-images/
│
├── 08-bathroom-handle/              # 浴室拉手
│   ├── dimension-images/
│   ├── product-images/
│   │   ├── featured-bathroom/      # 精选浴室款
│   │   └── s01/ ~ s24/             # 24个系列
│   └── scene-images/
│
├── 09-door-handle/                  # 门拉手
│   ├── product-images/
│   │   ├── featured-combined/      # 精选组合款
│   │   ├── featured-cylinder/      # 精选圆柱款
│   │   ├── featured-glass-door/    # 精选玻璃门款
│   │   └── featured-square/        # 精选方形款
│   └── scene-images/
│
└── 10-hidden-hook/                  # 隐藏式挂钩
    ├── color-images/               # 颜色展示
    ├── combined-images/            # 组合展示
    ├── product-images/
    │   ├── single-hook-economy/    # 单钩-经济款
    │   ├── single-hook-premium/    # 单钩-高级款
    │   └── double-hook/            # 双钩
    └── scene-images/
```

## 图片类型分类

### 一级分类 (MediaCategory - 按用途分类)

| 分类英文 | 分类中文 | Slug | 描述 | 对应文件夹 |
|---------|---------|------|------|-----------|
| Product Image | 产品图 | product-image | 纯产品展示图(白底或纯色背景) | product-images/* |
| Scene Image | 场景图 | scene-image | 产品使用场景图 | scene-images/ |
| Actual Photo | 实拍图 | actual-photo | 实际拍摄照片 | actual-photos/ |
| Dimension Image | 尺寸图 | dimension-image | 产品尺寸标注图 | dimension-images/ |
| Installation Image | 安装图 | installation-image | 安装示意图 | installation-images/ |
| Detail Image | 细节图 | detail-image | 产品细节特写 | detail-images/ |
| Combined Image | 组合展示图 | combined-image | 多产品组合展示 | combined-images/ |
| Multi-style Image | 多款式图 | multi-style-image | 多款式对比展示 | multi-style-images/ |
| Color Display | 颜色展示 | color-display | 颜色选项展示 | color-images/ |
| Common Image | 通用图 | common-image | 产品通用图片 | common-images/ |
| Manufacturing | 生产图 | manufacturing | 生产制造相关 | manufacturing/* |
| Package Image | 包装图 | package-image | 产品包装展示 | packages/ |

### 二级分类 (MediaTag - 多维度标签)

#### 1. 产品系列 (PRODUCT_SERIES)

| 标签英文 | 标签中文 | Slug |
|---------|---------|------|
| Glass Standoff | 玻璃固定夹 | series-glass-standoff |
| Glass Connected Fitting | 玻璃连接件 | series-glass-connected-fitting |
| Glass Fence Spigot | 玻璃栏杆立柱 | series-glass-fence-spigot |
| Guardrail Glass Clip | 护栏玻璃夹 | series-guardrail-glass-clip |
| Bathroom Glass Clip | 浴室玻璃夹 | series-bathroom-glass-clip |
| Glass Hinge | 玻璃合页 | series-glass-hinge |
| Sliding Door Kit | 滑动门套件 | series-sliding-door-kit |
| Bathroom Handle | 浴室拉手 | series-bathroom-handle |
| Door Handle | 门拉手 | series-door-handle |
| Hidden Hook | 隐藏式挂钩 | series-hidden-hook |

#### 2. 产品子系列/款式 (SPEC - 规格/款式)

**玻璃固定夹 (01)**
- General (通用款)
- Series 01 ~ Series 40 (系列 1 ~ 40)

**玻璃连接件 (02)**
- Combined Elbow Adjustable (组合款-弯头-可调)
- Combined Elbow Fixed (组合款-弯头-固定)
- Combined Flat Fixed (组合款-平面-固定)
- Integrated Elbow Adjustable (一体款-弯头-可调)
- Integrated Elbow Fixed (一体款-弯头-固定)
- Integrated Flat Fixed (一体款-平面-固定)

**玻璃栏杆立柱 (03)**
- Round Head (圆头款)
- Square Head (方头款)

**护栏玻璃夹 (04)**
- Angle 0° (0度角)
- Angle 90° (90度角)
- Angle 135° (135度角)
- Angle 180° (180度角)
- Circle (圆形款)
- Semicircle Arc (半圆-弧形)
- Semicircle Flat (半圆-平面)
- Square Arc (方形-弧形)
- Square Flat (方形-平面)

**浴室玻璃夹 (05)**
- Angle 90° (90度角)
- Various (多款式)

**玻璃合页 (06)**
- Angle 0° (0度)
- Angle 90° Single (90度-单边)
- Angle 90° Double (90度-双边)
- Angle 90° Beveled (90度-斜边)
- Angle 135° (135度)
- Angle 180° (180度)
- Angle 360° (360度)

**浴室拉手 (08)**
- Featured Bathroom (精选浴室款)
- Series 01 ~ Series 24 (系列 1 ~ 24)

**门拉手 (09)**
- Featured Combined (精选组合款)
- Featured Cylinder (精选圆柱款)
- Featured Glass Door (精选玻璃门款)
- Featured Square (精选方形款)

**隐藏式挂钩 (10)**
- Single Hook Economy (单钩-经济款)
- Single Hook Premium (单钩-高级款)
- Double Hook (双钩)

#### 3. 通用标签 (CUSTOM)

- General (通用)
- Common (公共)
- Featured (精选)
- Logistics (物流)
- Process (工艺流程)

#### 4. 材质标签 (SPEC)

- Stainless Steel (不锈钢)
- Brass (黄铜)
- Aluminum (铝合金)
- Chrome (镀铬)

#### 5. 颜色标签 (COLOR)

- Silver (银色)
- Black (黑色)
- Gold (金色)
- Rose Gold (玫瑰金)
- Brushed (拉丝)
- Polished (抛光)

## 文件命名规则

观察到的命名模式:

```
{产品编号}-{产品简称}-{类型}-{序号}.jpg

示例:
01-standoff-general-001.jpg        # 玻璃固定夹-通用款-001
01-standoff-s01-001.jpg           # 玻璃固定夹-系列01-001
01-standoff-scene-001.jpg         # 玻璃固定夹-场景图-001
02-fitting-actual-001.jpg         # 玻璃连接件-实拍图-001
02-fitting-dimension-001.jpg      # 玻璃连接件-尺寸图-001
06-hinge-common-001.jpg           # 玻璃合页-通用图-001
06-hinge-detail-001.jpg           # 玻璃合页-细节图-001
06-hinge-installation-001.jpg     # 玻璃合页-安装图-001
10-hook-color-001.jpg             # 隐藏挂钩-颜色图-001
common-color-001.png              # 通用-颜色-001
common-process-001.jpg            # 通用-工艺-001
common-package-001.png            # 通用-包装-001
```

## 元数据映射

基于文件夹路径自动映射元数据:

| 文件夹路径 | primaryCategory | tags | metadata.seriesNumber |
|-----------|----------------|------|----------------------|
| 01-glass-standoff/product-images/general/ | product-image | glass-standoff, general | null |
| 01-glass-standoff/product-images/s01/ | product-image | glass-standoff, series-01 | 1 |
| 01-glass-standoff/scene-images/ | scene-image | glass-standoff | null |
| 02-glass-connected-fitting/actual-photos/ | actual-photo | glass-connected-fitting | null |
| 02-glass-connected-fitting/dimension-images/ | dimension-image | glass-connected-fitting | null |
| 06-glass-hinge/common-images/ | common-image | glass-hinge | null |
| 06-glass-hinge/detail-images/ | detail-image | glass-hinge | null |
| 06-glass-hinge/installation-images/ | installation-image | glass-hinge | null |
| _common/colors/ | color-display | common | null |
| _common/manufacturing/process/ | manufacturing | common, process | null |
| _common/packages/ | package-image | common | null |

## 实施建议

### 1. 数据库初始化顺序

1. 创建 MediaCategory (12个分类)
2. 创建产品系列 MediaTag (10个产品)
3. 创建规格/款式 MediaTag (根据每个产品的子分类)
4. 创建通用 MediaTag (general, common, featured 等)
5. 创建材质和颜色 MediaTag

### 2. 批量上传策略

建议按产品系列分批上传:

```bash
# 1. 通用图片
npx tsx scripts/batch-upload-with-variants.ts ../products/_common/colors
npx tsx scripts/batch-upload-with-variants.ts ../products/_common/manufacturing/process
npx tsx scripts/batch-upload-with-variants.ts ../products/_common/packages

# 2. 产品01 - 玻璃固定夹
npx tsx scripts/batch-upload-with-variants.ts ../products/01-glass-standoff/product-images/general
npx tsx scripts/batch-upload-with-variants.ts ../products/01-glass-standoff/product-images/s01
# ... 继续 s02 到 s40
npx tsx scripts/batch-upload-with-variants.ts ../products/01-glass-standoff/scene-images

# 3. 产品02 - 玻璃连接件
# 以此类推...
```

### 3. 元数据模板示例

**01-glass-standoff general:**
```json
{
  "primaryCategory": "product-image",
  "tags": ["series-glass-standoff", "general"],
  "defaultMetadata": {
    "seriesNumber": null
  }
}
```

**01-glass-standoff s01:**
```json
{
  "primaryCategory": "product-image",
  "tags": ["series-glass-standoff", "spec-series-01"],
  "defaultMetadata": {
    "seriesNumber": 1
  }
}
```

**06-glass-hinge installation:**
```json
{
  "primaryCategory": "installation-image",
  "tags": ["series-glass-hinge"],
  "defaultMetadata": {}
}
```

## 总结

- **图片总数**: 约 2000-3000 张
- **产品系列**: 10 个
- **图片类型**: 12 种
- **子系列/款式**: 约 100+ 种

这种分类结构既保持了灵活性,又能精确反映实际的产品结构。
