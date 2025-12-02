# Seed 脚本对比分析

## 两个初始化脚本对比

### 脚本 A: `cms/scripts/seed-media-system.ts` (已存在,自动运行)
**位置**: 已集成在 `keystone.ts` 中,启动时自动运行

### 脚本 B: `cms/scripts/seed-media-taxonomy.ts` (新创建)
**位置**: 需要手动运行: `npm run seed:media-taxonomy`

---

## MediaCategory 对比

### 脚本 A (已存在) - 6 个分类

| Slug | 中文名 | 英文名 |
|------|-------|--------|
| scene-photo | 场景图 | Scene Photo |
| white-background | 白底图 | White Background |
| composite-use | 合用图 | Composite Use |
| common | 通用图 | Common |
| dimension-drawing | 尺寸图 | Dimension Drawing |
| real-shot | 实拍图 | Real Shot |

### 脚本 B (新创建) - 12 个分类

| Slug | 中文名 | 英文名 |
|------|-------|--------|
| product-image | 产品图 | Product Image |
| scene-image | 场景图 | Scene Image |
| actual-photo | 实拍图 | Actual Photo |
| dimension-image | 尺寸图 | Dimension Image |
| installation-image | 安装图 | Installation Image |
| detail-image | 细节图 | Detail Image |
| combined-image | 组合展示图 | Combined Image |
| multi-style-image | 多款式图 | Multi-style Image |
| color-display | 颜色展示 | Color Display |
| common-image | 通用图 | Common Image |
| manufacturing | 生产图 | Manufacturing |
| package-image | 包装图 | Package Image |

### 🔴 冲突分析 - MediaCategory

**重复/相似的分类:**

1. **场景图**
   - 脚本 A: `scene-photo` (场景图)
   - 脚本 B: `scene-image` (场景图)
   - **冲突**: Slug 不同,但含义相同

2. **实拍图**
   - 脚本 A: `real-shot` (实拍图)
   - 脚本 B: `actual-photo` (实拍图)
   - **冲突**: Slug 不同,但含义相同

3. **尺寸图**
   - 脚本 A: `dimension-drawing` (尺寸图)
   - 脚本 B: `dimension-image` (尺寸图)
   - **冲突**: Slug 不同,但含义相同

4. **通用图**
   - 脚本 A: `common` (通用图)
   - 脚本 B: `common-image` (通用图)
   - **冲突**: Slug 不同,但含义相同

5. **白底图 vs 产品图**
   - 脚本 A: `white-background` (白底图)
   - 脚本 B: `product-image` (产品图)
   - **差异**: 概念相似但不完全相同,白底图是产品图的一种

6. **合用图 vs 组合展示图**
   - 脚本 A: `composite-use` (合用图)
   - 脚本 B: `combined-image` (组合展示图)
   - **差异**: 概念相似但不完全相同

**脚本 B 新增的分类:**
- installation-image (安装图)
- detail-image (细节图)
- multi-style-image (多款式图)
- color-display (颜色展示)
- manufacturing (生产图)
- package-image (包装图)

---

## MediaTag 对比

### 产品系列标签 (PRODUCT_SERIES)

#### 脚本 A - 10 个产品系列

| Slug | 中文名 |
|------|-------|
| glass-standoff | 广告螺丝 |
| glass-connected-fitting | 玻璃栏杆扶手连接件 |
| glass-fence-spigot | 玻璃护栏支架底座 |
| guardrail-glass-clip | 护栏系列 |
| bathroom-glass-clip | 浴室系列 |
| glass-hinge | 浴室夹 |
| sliding-door-kit | 移门滑轮套装 |
| bathroom-handle | 浴室&大门拉手 |
| door-handle | 大门拉手 |
| hidden-hook | 挂钩 |

#### 脚本 B - 10 个产品系列

| Slug | 中文名 |
|------|-------|
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

### 🔴 冲突分析 - 产品系列

**主要差异:**

1. **Slug 命名规则不同**
   - 脚本 A: 直接使用产品名称 (如 `glass-standoff`)
   - 脚本 B: 带 `series-` 前缀 (如 `series-glass-standoff`)

2. **中文名称有差异**
   - 产品 1: 广告螺丝 vs 玻璃固定夹
   - 产品 2: 玻璃栏杆扶手连接件 vs 玻璃连接件
   - 产品 3: 玻璃护栏支架底座 vs 玻璃栏杆立柱
   - 产品 4: 护栏系列 vs 护栏玻璃夹
   - 产品 5: 浴室系列 vs 浴室玻璃夹
   - 产品 6: 浴室夹 vs 玻璃合页
   - 产品 7: 移门滑轮套装 vs 滑动门套件
   - 产品 8: 浴室&大门拉手 vs 浴室拉手

---

### 功能类型标签 (FUNCTION_TYPE)

#### 脚本 A - 5 个功能类型

| Slug | 中文名 |
|------|-------|
| func-scene-photo | 场景图 |
| func-white-background | 白底图 |
| func-dimension-drawing | 尺寸图 |
| func-real-shot | 实拍图 |
| func-composite-use | 合用图 |

#### 脚本 B - 0 个

**脚本 B 没有创建 FUNCTION_TYPE 标签**

### 🔴 冲突分析 - 功能类型

- 脚本 A 创建了 5 个 FUNCTION_TYPE 标签
- 脚本 B 没有创建 FUNCTION_TYPE 标签
- **注意**: 脚本 A 的功能类型标签与 MediaCategory 概念重复

---

### 场景类型标签 (SCENE_TYPE)

#### 脚本 A - 4 个场景类型

| Slug | 中文名 |
|------|-------|
| scene-normal | 普通场景图 |
| scene-single | 单独场景图 |
| scene-combination | 场景组合图 |
| scene-series | 系列场景图 |

#### 脚本 B - 0 个

**脚本 B 没有创建 SCENE_TYPE 标签**

---

### 规格标签 (SPEC)

#### 脚本 A - 3 个样例

| Slug | 值 |
|------|-----|
| spec-50mm | 50mm |
| spec-100mm | 100mm |
| spec-150mm | 150mm |

#### 脚本 B - 100+ 个详细规格

包括:
- General, Common, Featured
- 40 个玻璃固定夹系列 (spec-standoff-s01 ~ s40)
- 6 个玻璃连接件款式
- 2 个玻璃栏杆立柱款式
- 9 个护栏玻璃夹款式
- 7 个玻璃合页款式
- 24 个浴室拉手系列
- 5 个门拉手精选款
- 3 个隐藏挂钩款式
- 等等...

### 🔴 冲突分析 - 规格标签

- 脚本 A 只创建了 3 个样例规格标签
- 脚本 B 创建了 100+ 个详细规格标签,完全基于实际产品结构
- **Slug 命名可能有部分冲突** (都使用 `spec-` 前缀)

---

### 颜色标签 (COLOR)

#### 脚本 A - 3 个样例颜色

| Slug | 中文名 |
|------|-------|
| color-black | 黑色 |
| color-silver | 银色 |
| color-gold | 金色 |

#### 脚本 B - 6 个颜色

| Slug | 中文名 |
|------|-------|
| color-silver | 银色 |
| color-black | 黑色 |
| color-gold | 金色 |
| color-rose-gold | 玫瑰金 |
| color-brushed | 拉丝 |
| color-polished | 抛光 |

### 🔴 冲突分析 - 颜色标签

- 前 3 个颜色完全相同 (slug 和名称都一样)
- 脚本 B 额外增加了 3 个颜色
- **无冲突**,脚本 B 是脚本 A 的扩展

---

### 自定义标签 (CUSTOM)

#### 脚本 A - 0 个

#### 脚本 B - 2 个

| Slug | 中文名 |
|------|-------|
| custom-logistics | 物流 |
| custom-process | 工艺流程 |

---

## 🚨 总体冲突总结

### 严重冲突

1. **MediaCategory Slug 不一致**
   - 4 个相同概念的分类使用了不同的 slug
   - 如果两个脚本都运行,会创建重复的分类

2. **产品系列 Slug 命名规则不同**
   - 脚本 A: 无前缀
   - 脚本 B: 有 `series-` 前缀
   - 会创建 20 个重复的产品系列标签

### 中度冲突

3. **FUNCTION_TYPE 标签冗余**
   - 脚本 A 创建了 FUNCTION_TYPE 标签,与 MediaCategory 概念重复
   - 脚本 B 没有创建,更符合扁平化设计

4. **中文名称不统一**
   - 同一产品在两个脚本中的中文名称不同

### 轻度冲突

5. **颜色标签部分重复**
   - 前 3 个颜色相同,脚本 B 额外增加 3 个
   - 可以共存,但会有少量重复创建

---

## 💡 解决方案建议

### 方案 1: 合并两个脚本 (推荐)

**优点:**
- 统一数据源
- 避免重复和冲突
- 便于维护

**步骤:**

1. **修改 `seed-media-system.ts`** (已集成到 keystone.ts)
   - 更新 MediaCategory 为 12 个 (使用脚本 B 的定义)
   - 更新产品系列 slug 为带 `series-` 前缀
   - 移除 FUNCTION_TYPE 标签 (冗余)
   - 保留 SCENE_TYPE 标签
   - 扩展 SPEC 标签为完整的 100+ 个
   - 扩展 COLOR 标签为 6 个
   - 添加 CUSTOM 标签

2. **删除 `seed-media-taxonomy.ts`**
   - 因为已经合并到 `seed-media-system.ts`

3. **更新相关引用**
   - 批量上传脚本中的 category 和 tag slug 需要更新

### 方案 2: 禁用旧脚本,使用新脚本

**优点:**
- 新脚本更完整,基于实际产品结构
- 不需要修改现有代码

**缺点:**
- 需要修改 keystone.ts
- 已有数据可能需要迁移

**步骤:**

1. **修改 `keystone.ts`**
   - 注释掉 `seedMediaSystem` 的调用
   - 改为调用 `seedMediaTaxonomy`

2. **清理已有数据** (如果需要)
   ```sql
   DELETE FROM "MediaTag";
   DELETE FROM "MediaCategory";
   ```

3. **运行新的初始化脚本**
   ```bash
   npm run seed:media-taxonomy
   ```

### 方案 3: 保持两个脚本,但避免冲突 (不推荐)

**步骤:**

1. **修改新脚本的 slug**
   - 在所有 slug 前添加 `v2-` 前缀
   - 例如: `v2-product-image`, `v2-series-glass-standoff`

2. **两个脚本并存**
   - 旧脚本自动运行
   - 新脚本手动运行 (如果需要)

---

## 📝 推荐执行方案

我建议采用 **方案 1: 合并两个脚本**

### 具体步骤:

1. 创建一个新的合并版本的 `seed-media-system.ts`
2. 使用新脚本的 12 个 MediaCategory 定义
3. 使用新脚本的 10 个产品系列 (带 `series-` 前缀)
4. 保留旧脚本的 SCENE_TYPE 标签 (4 个)
5. 使用新脚本的完整 SPEC 标签 (100+)
6. 使用新脚本的 6 个 COLOR 标签
7. 添加新脚本的 2 个 CUSTOM 标签
8. 删除旧脚本的 FUNCTION_TYPE 标签 (冗余)

这样可以:
- ✅ 避免所有冲突
- ✅ 保留最完整的数据定义
- ✅ 统一命名规则
- ✅ 自动运行,无需手动操作
- ✅ 便于长期维护

需要我帮你创建合并后的脚本吗?
