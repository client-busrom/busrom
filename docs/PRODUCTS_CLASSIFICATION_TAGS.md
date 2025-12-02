# 产品图片分类和Tag结构文档

## 📁 总体结构

```
products/
├── _common/                           # 通用资源
├── 01-glass-standoff/                 # 广告螺丝
├── 02-glass-connected-fitting/        # 玻璃栏杆扶手连接件
├── 03-glass-fence-spigot/            # 玻璃护栏支架底座（泳池夹）
├── 04-guardrail-glass-clip/          # 护栏玻璃夹
├── 05-bathroom-glass-clip/           # 浴室玻璃夹
├── 06-glass-hinge/                   # 玻璃合页
├── 07-sliding-door-kit/              # 移门滑轮套装
├── 08-bathroom-handle/               # 浴室拉手
├── 09-door-handle/                   # 大门拉手
└── 10-hidden-hook/                   # 挂钩
```

---

## 🏷️ 通用分类标签 (Tags)

### 图片类型 (Image Type)
- `product-images` - 产品图（白底图）
- `scene-images` - 场景图
- `dimension-images` - 尺寸图
- `actual-photos` - 实拍图
- `color-images` - 颜色图
- `combined-images` - 合用图/组合图
- `common-images` - 通用图
- `detail-images` - 产品详情页图
- `installation-images` - 安装效果图
- `multi-style-images` - 多款式图
- `white-bg-images` - 白底图
- `effect-images` - 场景效果图

### 场景分类 (Scene Category)
- `group-XX` - 场景组合编号 (如: group-01, group-02)
- `scene-XX` - 场景编号 (如: scene-01, scene-02)
- `series-XX` - 系列编号 (如: series-01, series-21)
- `standalone` - 独立场景图
- `closeup` - 近距离场景

### 产品系列 (Product Series)
- `s01` ~ `s40` - 系列编号（用于Glass Standoff, Bathroom Handle等）

---

## 📦 各系列详细分类

### 0. _common - 通用资源
**目录**: `products/_common/`

#### 子分类:
```
├── colors/                    # 颜色通用图
├── manufacturing/             # 工艺通用图
│   ├── process/              # 工艺流程
│   └── logistics/            # 运输和服务
└── packages/                  # 包装通用图
```

#### 标签建议:
- `common`, `universal`
- `color-chart`, `color-options`
- `manufacturing-process`, `quality-control`
- `packaging`, `shipping`, `logistics`

---

### 1. Glass Standoff - 广告螺丝
**中文名**: 广告螺丝
**目录**: `products/01-glass-standoff/`

#### 子分类:
```
├── product-images/            # 产品图（白底图）
│   ├── general/              # 通用图
│   ├── s01/ ~ s40/           # 系列1-40
└── scene-images/             # 场景图
    ├── group-01/             # 场景组合一
    │   ├── scene-01/ ~ scene-10/   # 场景1-10
    │   └── common/           # 场景通用图
    ├── group-02/             # 场景组合二
    │   ├── scene-01/
    │   └── scene-02/
    ├── guardrail-series/     # 护栏和楼梯系列
    │   ├── group-01/
    │   └── group-02/
    ├── rectangular/          # 长方形规格 (1200x627)
    └── square/               # 正方形规格 (800x800)
```

#### 标签建议:
**产品类型**: `glass-standoff`, `advertising-screw`, `sign-holder`

**应用场景**:
- `signage`, `display`, `advertising`
- `indoor`, `outdoor`
- `guardrail`, `staircase`

**规格分类**:
- `flat-bottom`, `arc-bottom` (平底/弧底)
- `rectangular-format`, `square-format` (尺寸规格)

**系列标签**: `series-01` ~ `series-40`

---

### 2. Glass Connected Fitting - 玻璃栏杆扶手连接件
**中文名**: 玻璃栏杆扶手连接件 / 玻璃连接配件
**目录**: `products/02-glass-connected-fitting/`

#### 子分类:
```
├── product-images/            # 产品图（白底图）
│   ├── general/              # 通用图
│   ├── integrated-elbow-fixed/      # 一体件-弯头-不可调节
│   ├── integrated-elbow-adjustable/ # 一体件-弯头-可调节
│   ├── integrated-flat-fixed/       # 一体件-平头-不可调节
│   ├── combined-elbow-fixed/        # 组合件-弯头-不可调节
│   └── combined-flat-fixed/         # 组合件-平头-不可调节
├── actual-photos/            # 实拍图
├── dimension-images/         # 尺寸图
└── scene-images/             # 场景图
    ├── handrail-fitting/     # 玻璃栏杆扶手连接件
    │   ├── group-01/
    │   │   ├── scene-01/ ~ scene-04/
    │   ├── group-02/
    │   │   ├── scene-01/ ~ scene-03/
    │   └── group-03/
    │       ├── scene-01/ ~ scene-04/
    └── glass-connector/      # 玻璃连接配件
        └── group-01/
            ├── scene-02/, scene-03/, scene-05/, scene-09/, scene-10/
```

#### 标签建议:
**产品类型**: `glass-fitting`, `handrail-connector`, `glass-connector`

**结构类型**:
- `integrated` - 一体件
- `combined` - 组合件

**头型分类**:
- `elbow` - 弯头
- `flat` - 平头

**功能特性**:
- `adjustable` - 可调节
- `fixed` - 不可调节

**应用场景**:
- `handrail`, `guardrail`, `balustrade`
- `indoor`, `outdoor`
- `commercial`, `residential`

---

### 3. Glass Fence Spigot - 玻璃护栏支架底座
**中文名**: 玻璃护栏支架底座（泳池夹）
**目录**: `products/03-glass-fence-spigot/`

#### 子分类:
```
├── product-images/            # 产品图（白底图）
│   ├── round-head/           # 圆头
│   └── square-head/          # 方头
├── multi-style-images/       # 多款式图
└── scene-images/             # 场景图
    ├── group-01/             # 场景组合一
    │   ├── scene-01/ ~ scene-09/
    ├── group-02/             # 场景组合二
    │   ├── scene-01/, scene-02/
    ├── round-head/           # 圆头场景图
    └── square-head/          # 方头场景图
```

#### 标签建议:
**产品类型**: `glass-spigot`, `fence-spigot`, `pool-spigot`, `balustrade-spigot`

**头型分类**:
- `round-head` - 圆头
- `square-head` - 方头

**应用场景**:
- `pool-fence`, `balcony`, `terrace`, `deck`
- `frameless-glass`, `glass-railing`
- `outdoor`, `waterproof`

**材质**: `stainless-steel`, `316-grade`, `marine-grade`

---

### 4. Guardrail Glass Clip - 护栏玻璃夹
**中文名**: 护栏玻璃夹（护栏系列）
**目录**: `products/04-guardrail-glass-clip/`
**说明**: 从原Glass Clip分离，主要用于护栏或楼梯扶手

#### 子分类:
```
├── product-images/            # 产品图（白底图）
│   ├── angle-0/              # 0度
│   ├── angle-90/             # 90度
│   ├── angle-135/            # 135度
│   ├── angle-180/            # 180度
│   ├── semicircle-flat/      # 半圆-平底
│   ├── semicircle-arc/       # 半圆-弧底
│   ├── circle/               # 圆形
│   ├── square-flat/          # 方形-平底
│   └── square-arc/           # 方形-弧底
├── combined-images/          # 合用图
└── scene-images/             # 场景图
    ├── group-01/             # 场景组合一（护栏和楼梯系列）
    │   ├── scene-01/ ~ scene-11/
    ├── group-02/             # 场景组合二
    │   ├── scene-01/ ~ scene-08/
    └── outdoor/              # 室外场景图
```

#### 标签建议:
**产品类型**: `glass-clip`, `guardrail-clip`, `staircase-clip`, `railing-clip`

**角度分类**:
- `0-degree`, `90-degree`, `135-degree`, `180-degree`

**形状分类**:
- `semicircle` - 半圆
- `circle` - 圆形
- `square` - 方形

**底座类型**:
- `flat-bottom` - 平底
- `arc-bottom` - 弧底

**应用场景**:
- `outdoor`, `staircase`, `guardrail`, `balustrade`
- `frameless-glass`, `glass-railing`

---

### 5. Bathroom Glass Clip - 浴室玻璃夹
**中文名**: 浴室玻璃夹（浴室系列）
**目录**: `products/05-bathroom-glass-clip/`
**说明**: 从原Glass Clip分离，主要用于浴室玻璃固定

#### 子分类:
```
├── product-images/            # 产品图（白底图）
│   ├── angle-90/             # 90度
│   └── various/              # 各种款式
└── scene-images/             # 场景图
    ├── bathroom-series/      # 浴室固定夹系列
    └── indoor/               # 室内场景图
```

#### 标签建议:
**产品类型**: `glass-clip`, `bathroom-clip`, `shower-clip`

**应用场景**:
- `bathroom`, `shower`, `bathtub`, `shower-enclosure`
- `indoor`, `wet-area`
- `wall-to-glass`, `glass-to-glass`

**角度**: `90-degree`

**材质**: `brass`, `stainless-steel`, `chrome-finish`

---

### 6. Glass Hinge - 玻璃合页
**中文名**: 玻璃合页（浴室夹）
**目录**: `products/06-glass-hinge/`

#### 子分类:
```
├── product-images/            # 产品图（白底图）
│   ├── angle-0/              # 0度
│   ├── angle-90-single/      # 90度单边
│   ├── angle-90-double/      # 90度双边
│   ├── angle-90-beveled/     # 90度斜边
│   ├── angle-135/            # 135度
│   ├── angle-180/            # 180度
│   └── angle-360/            # 360度
├── common-images/            # 通用图
├── detail-images/            # 产品详情页
├── installation-images/      # 安装效果图
└── scene-images/             # 场景图
    ├── group-01/             # 场景组合一
    │   ├── scene-01/ ~ scene-08/
    │   ├── other/            # 其他场景图
    │   └── white/            # 白色场景图
    └── standalone/           # 独立场景图
```

#### 标签建议:
**产品类型**: `glass-hinge`, `shower-hinge`, `door-hinge`

**角度分类**:
- `0-degree` - 固定安装
- `90-degree` - 90度开合
- `135-degree` - 135度开合
- `180-degree` - 180度开合
- `360-degree` - 360度旋转

**边型分类**:
- `single-sided` - 单边
- `double-sided` - 双边
- `beveled` - 斜边
- `straight` - 直边

**应用场景**:
- `shower-door`, `bathroom-door`, `glass-door`
- `wall-to-glass`, `glass-to-glass`
- `frameless-shower`, `hinged-door`

**颜色**: `chrome`, `brushed-nickel`, `gold`, `black`, `white`

---

### 7. Sliding Door Kit - 移门滑轮套装
**中文名**: 移门滑轮套装
**目录**: `products/07-sliding-door-kit/`

#### 子分类:
```
├── product-images/            # 产品图（白底图）
└── scene-images/             # 场景图
    ├── group-01/             # 场景组合一
    │   ├── scene-01/ ~ scene-05/
    │   └── other/            # 其他场景图
    ├── series-01/ ~ series-21/  # 系列1-21场景图
    └── standalone/           # 独立场景图
```

#### 标签建议:
**产品类型**: `sliding-door-kit`, `barn-door-hardware`, `sliding-track`

**套装类型**:
- `complete-kit` - 完整套装
- `track-system` - 轨道系统
- `roller-set` - 滑轮组

**应用场景**:
- `sliding-glass-door`, `barn-door`, `closet-door`
- `interior-door`, `room-divider`
- `modern`, `industrial`, `minimalist`

**系列标签**: `series-01` ~ `series-21`

**材质**: `stainless-steel`, `aluminum`, `soft-close`

---

### 8. Bathroom Handle - 浴室拉手
**中文名**: 浴室拉手
**目录**: `products/08-bathroom-handle/`
**说明**: 从原Bathroom & Door Handle分离，主要用于浴室玻璃门

#### 子分类:
```
├── product-images/            # 产品图（白底图）
│   ├── s01/ ~ s24/           # 系列1-24
│   ├── featured-bathroom/    # 特色浴室拉手
│   ├── main-bathroom/        # 主图-浴室门拉手
│   └── main-combined/        # 主图-组合图
├── dimension-images/         # 尺寸图
└── scene-images/             # 场景图
    ├── group-01-closeup/     # 场景组合1-近距离
    ├── group-02-closeup/     # 场景组合2-近距离
    ├── group-03-closeup/     # 场景组合3-近距离
    ├── group-04/ ~ group-07/ # 场景组合4-7
    ├── standalone/           # 独立场景图
    └── effect-images/        # 场景效果图
```

#### 标签建议:
**产品类型**: `bathroom-handle`, `shower-handle`, `glass-door-handle`

**款式分类**:
- `straight`, `curved`, `L-shaped`, `T-shaped`
- `single-sided`, `back-to-back`

**尺寸**: `300mm`, `400mm`, `500mm`, `600mm`, `custom-length`

**应用场景**:
- `shower-door`, `bathroom-door`, `glass-partition`
- `residential`, `commercial`, `hotel`

**系列标签**: `series-01` ~ `series-24`

**颜色**:
- `polished-chrome`, `brushed-stainless-steel`
- `gold`, `rose-gold`, `black`, `white`

---

### 9. Door Handle - 大门拉手
**中文名**: 大门拉手
**目录**: `products/09-door-handle/`
**说明**: 从原Bathroom & Door Handle分离，主要用于大门（玻璃门和实体门）

#### 子分类:
```
├── product-images/            # 产品图（白底图）
│   ├── s16/ ~ s24/           # 系列16-24
│   ├── featured-glass-door/  # 特色玻璃大门拉手
│   ├── featured-square/      # 特色方形拉手
│   ├── featured-cylinder/    # 特色圆柱拉手
│   ├── featured-combined/    # 特色组合图
│   ├── main-glass-door/      # 主图-玻璃大门拉手
│   ├── main-square/          # 主图-方形拉手
│   ├── main-cylinder/        # 主图-圆柱拉手
│   └── main-combined/        # 主图-组合图
└── scene-images/             # 场景图
    ├── standalone/           # 独立场景图
    └── effect-images/        # 场景效果图
```

#### 标签建议:
**产品类型**: `door-handle`, `entrance-handle`, `pull-handle`

**款式分类**:
- `square-handle` - 方形拉手
- `cylinder-handle` - 圆柱拉手
- `glass-door-handle` - 玻璃大门拉手
- `ladder-pull` - 梯形拉手

**门类型**:
- `glass-door`, `wooden-door`, `metal-door`
- `entrance-door`, `office-door`, `commercial-door`

**应用场景**:
- `entrance`, `lobby`, `office`, `commercial`
- `residential`, `hotel`, `storefront`

**系列标签**: `series-16` ~ `series-24`

**尺寸**: `600mm`, `800mm`, `1000mm`, `1200mm`, `custom-length`

**材质**:
- `solid-brass`, `stainless-steel-304`, `stainless-steel-316`

**表面处理**:
- `polished-chrome`, `brushed-stainless`
- `pvd-gold`, `matte-black`, `bronze`

---

### 10. Hidden Hook - 挂钩
**中文名**: 挂钩（旋转式或非旋转式隐藏挂钩）
**目录**: `products/10-hidden-hook/`

#### 子分类:
```
├── product-images/            # 产品图
│   ├── single-hook-economy/  # 单钩-经济款
│   ├── single-hook-premium/  # 单钩-豪华款
│   └── double-hook/          # 双钩
├── white-bg-images/          # 白底图
├── color-images/             # 颜色图
├── combined-images/          # 合用图
└── scene-images/             # 场景图
```

#### 标签建议:
**产品类型**: `hook`, `robe-hook`, `towel-hook`, `coat-hook`

**款式分类**:
- `single-hook` - 单钩
- `double-hook` - 双钩
- `rotating` - 旋转式
- `fixed` - 固定式
- `hidden` - 隐藏式

**档次分类**:
- `economy` - 经济款
- `premium` - 豪华款

**应用场景**:
- `bathroom`, `bedroom`, `hallway`, `closet`
- `towel-hook`, `robe-hook`, `clothes-hook`

**颜色**:
- `stainless-steel` - 不锈钢色
- `gold` - 金色
- `rose-gold` - 玫瑰金
- `black` - 黑色
- `grey` - 灰色

**材质**: `stainless-steel`, `brass`, `zinc-alloy`

---

## 🎨 统一颜色标签 (Color Tags)

适用于所有支持多颜色的产品:

- `polished-chrome` - 亮光不锈钢色/抛光铬
- `brushed-stainless` - 拉丝不锈钢色
- `brushed-nickel` - 拉丝镍
- `gold` - 金色
- `pvd-gold` - PVD镀金
- `rose-gold` - 玫瑰金
- `matte-black` - 哑光黑
- `glossy-black` - 亮光黑
- `white` - 白色
- `bronze` - 青铜色
- `antique-brass` - 古铜色

---

## 📐 统一尺寸标签 (Size Tags)

### 长度规格 (Length)
- `300mm`, `400mm`, `500mm`, `600mm`
- `800mm`, `1000mm`, `1200mm`, `1500mm`
- `custom-length` - 定制长度

### 格式规格 (Format)
- `rectangular-1200x627` - 长方形 (用于社交媒体)
- `square-800x800` - 正方形 (用于社交媒体)

### 玻璃厚度 (Glass Thickness)
- `8mm-10mm-glass`
- `10mm-12mm-glass`
- `12mm-15mm-glass`

---

## 🏗️ 统一应用场景标签 (Application Tags)

### 位置 (Location)
- `indoor` - 室内
- `outdoor` - 室外
- `bathroom` - 浴室
- `shower` - 淋浴间
- `balcony` - 阳台
- `staircase` - 楼梯
- `entrance` - 入口
- `office` - 办公室

### 用途 (Purpose)
- `frameless-glass` - 无框玻璃
- `glass-partition` - 玻璃隔断
- `glass-railing` - 玻璃栏杆
- `glass-door` - 玻璃门
- `shower-enclosure` - 淋浴房
- `balustrade` - 栏杆扶手

### 项目类型 (Project Type)
- `residential` - 住宅
- `commercial` - 商业
- `hotel` - 酒店
- `office-building` - 写字楼
- `shopping-mall` - 购物中心
- `restaurant` - 餐厅

---

## 🔧 统一材质标签 (Material Tags)

- `stainless-steel-304` - 304不锈钢
- `stainless-steel-316` - 316不锈钢（船用级）
- `solid-brass` - 实心黄铜
- `zinc-alloy` - 锌合金
- `aluminum-alloy` - 铝合金
- `tempered-glass` - 钢化玻璃

---

## 🌟 统一功能特性标签 (Feature Tags)

- `adjustable` - 可调节
- `fixed` - 固定式
- `rotating` - 旋转式
- `soft-close` - 缓冲/软关
- `wall-mount` - 壁装
- `floor-mount` - 地装
- `frameless` - 无框
- `heavy-duty` - 重载
- `waterproof` - 防水
- `corrosion-resistant` - 防腐蚀

---

## 📋 建议的Tag使用策略

### 每个产品图片应包含的Tag类别:

1. **产品类型** (必需): 如 `glass-hinge`, `door-handle`
2. **系列/型号** (如适用): 如 `series-01`, `s24`
3. **颜色** (如适用): 如 `polished-chrome`, `gold`
4. **尺寸** (如适用): 如 `600mm`, `90-degree`
5. **应用场景** (建议): 如 `bathroom`, `shower`, `indoor`
6. **材质** (建议): 如 `stainless-steel-304`
7. **功能特性** (如适用): 如 `adjustable`, `soft-close`

### Tag命名规范:
- 使用小写字母
- 单词之间用连字符 `-` 连接
- 使用英文（便于国际化）
- 保持简洁明了

### 示例完整Tag集合:
```
产品: 06-glass-hinge/product-images/angle-90-single/

建议Tags:
- glass-hinge
- shower-hinge
- 90-degree
- single-sided
- wall-to-glass
- bathroom
- polished-chrome
- stainless-steel-304
- frameless-shower
- residential
- commercial
```

---

## 📊 文件命名规范

### 产品图命名格式:
```
{产品前缀}-{类型}-{编号}.{扩展名}

示例:
01-standoff-scene-001.jpg        # Glass Standoff场景图
06-hinge-scene-001.jpg           # Glass Hinge场景图
08-bathroom-scene-001.jpg        # Bathroom Handle场景图
```

### 目录命名规范:
- 使用小写字母和连字符
- 保持语义明确
- 英文命名（便于URL友好）

---

## 🔍 搜索优化建议

### SEO关键词分类:

**玻璃五金类** (Glass Hardware):
- glass hardware, glass fittings, glass accessories
- frameless glass, architectural glass
- shower hardware, bathroom hardware

**功能性关键词**:
- wall mount, floor mount, ceiling mount
- adjustable, fixed, rotating
- heavy duty, commercial grade

**应用场景关键词**:
- shower door, glass door, glass partition
- glass railing, glass balustrade, glass fence
- staircase railing, pool fence

**品质相关**:
- stainless steel, solid brass, marine grade
- corrosion resistant, waterproof
- premium quality, commercial grade

---

## 📝 备注

1. 本文档基于实际整理后的 `products/` 目录结构生成
2. 所有Tag建议均为英文，便于国际化和SEO优化
3. 各产品系列可根据实际需求添加或调整Tag
4. 建议在数据库中使用多对多关系存储Tag，便于灵活查询和过滤

---

**文档版本**: v1.0
**最后更新**: 2025-11-23
**图片总数**: 2,771张
**产品系列**: 10个
