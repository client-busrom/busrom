# Gemini 开发任务：What We Offer You 板块 — 磨砂玻璃滑轨门滚动动效

## 🎯 任务目标

为 `OemOdmWhatWeOffer` 组件（PC端）添加 **磨砂玻璃滑轨门** 滚动联动动画。效果模拟真实的铝合金滑轨推拉玻璃门——两扇磨砂玻璃门扇挂在顶部导轨上，随页面滚动从中间向两侧滑开，露出底下的卡片内容，然后再合拢关闭。

---

## 📁 需要修改的文件

**主文件**：`web/components/oem-odm/OemOdmWhatWeOffer.tsx`（541行）

**参考文件**：
- `web/components/layout/header.tsx` — header 高度约 46px
- `web/components/templates/OemOdmTemplate.tsx` — 父组件上下文
- `web/package.json` — 已安装依赖：`framer-motion ^12.23.24`、`gsap ^3.13.0`、`lenis ^1.3.14`

---

## 🎬 动画行为详细规格

### 滚动方向：从上往下（正向）

```
阶段1：正常滚动
  ↓ 板块顶部到达 viewport top + 46px（header高度）
阶段2：板块 position: sticky / pin，吸附在 top: 46px
  ↓ 继续滚动 → 两扇门从中间向两侧滑开
阶段3：门完全打开（scroll progress 0→1）
  ↓ 继续滚动 200px（停留阶段，门保持全开）
阶段4：继续滚动 → 门从两侧向中间关闭（scroll progress 1→0）
阶段5：门完全关闭 → sticky 取消 → 页面恢复正常滚动
```

### 滚动方向：从下往上（反向）

完全对称的反向效果（GSAP scrub 自动支持双向）。

### 时间轴参数

| 阶段 | 滚动距离 | 动画内容 |
|------|---------|---------|
| 开门 | 500px | left-door `translateX(0%) → translateX(-100%)`, right-door `translateX(0%) → translateX(100%)` |
| 停留 | 200px | 无动画，门保持全开 |
| 关门 | 500px | left-door `translateX(-100%) → translateX(0%)`, right-door `translateX(100%) → translateX(0%)` |

**总 pin 滚动距离** = 1200px

---

## 🪟 SVG 资源详细规格

所有 SVG 已放置在 `web/public/images/oem-odm/sliding-door/` 目录下。

### 层级结构（从下到上）

```
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 3 (z-index: 28) — left-clip.svg + right-clip.svg            │  ← 顶部导轨夹扣/支架
│ Layer 2 (z-index: 27) — stick.svg                                 │  ← 顶部导轨横杆（全宽）
│ Layer 1 (z-index: 26) — left-door.svg + right-door.svg            │  ← 🚪 滑动门扇（这两个做动画）
│ Layer 0 (z-index: 25) — rectangle-398.svg + rectangle-399.svg     │  ← 固定侧面磨砂玻璃板
│                                                                     │
│ ------ 门层以下 ------                                              │
│ z-index: 20 — 卡片内容层（现有 3 张 Offer 卡片）                    │
│ z-index: 10 — 标题层 "What We Offer You"                           │
│ z-index: 0  — 背景图片                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### 各 SVG 详细信息

#### Layer 0：固定侧面磨砂玻璃板（不移动）

| 文件 | 尺寸 | 视觉效果 | 位置 |
|------|------|---------|------|
| `rectangle-398.svg` | 341×1641 | 白色 26% 透明 + backdrop-filter: blur(23px) + 黑色 2px 边框 | 左侧固定 |
| `rectangle-399.svg` | 341×1641 | 同上 | 右侧固定 |

**作用**：门打开后露出的侧面固定玻璃板，门关闭时被门扇遮挡。

**定位**（基于 1920px 设计稿）：
- rectangle-398：左侧，`left: 0`
- rectangle-399：右侧，`right: 0`

#### Layer 1：滑动门扇（⚡ 做动画的元素）

| 文件 | 尺寸 | 视觉效果 |
|------|------|---------|
| `left-door.svg` | 730×1641 | 白色 58% 透明玻璃面板，左右各 6px 黑色竖向框轨，底部两个黑色脚块(26px高)，右侧有竖向拉手（圆角矩形，x=627-653, y=525-1117, 渐变黑→灰色） |
| `right-door.svg` | 729×1641 | 白色 58% 透明玻璃面板，左右各 6px 黑色竖向框轨，底部两个黑色脚块(26px高)，左侧有竖向拉手（圆角矩形 rx=13, x=78-104, y=525-1117, 渐变黑→灰色） |

**关键结构解析 — left-door.svg**：
```
730px 宽度构成：
├── 52px  左侧留空（底部有脚块 52×26）
├── 6px   左框轨（黑色实心竖条）
├── 666px 玻璃面板（白色58%透明）
├── 6px   右框轨（黑色实心竖条）
└── 拉手在 x=627~653, y=525~1117（渐变黑→灰竖条）
```

**关键结构解析 — right-door.svg**：
```
729px 宽度构成（镜像对称）：
├── 6px   左框轨
├── 665px 玻璃面板（白色58%透明）
├── 6px   右框轨
├── 52px  右侧留空（底部有脚块 52×26）
└── 拉手在 x=78~104, y=525~1117（渐变黑→灰竖条）
```

**动画**：
- 关闭状态：两扇门居中并排，拉手在中间相邻
- 打开状态：left-door `translateX(-100%)`，right-door `translateX(100%)`

**初始定位（关闭状态，1920px 基准）**：
- left-door：`left: calc(50% - 730px)` 即 `left: 230px`
- right-door：`left: 50%` 即 `left: 960px`
- 两扇门拉手在中缝对齐

#### Layer 2：导轨横杆（不移动）

| 文件 | 尺寸 | 视觉效果 |
|------|------|---------|
| `stick.svg` | 1920×42 | 全宽横向滑轨。主杆: y=8, h=25, 渐变黑→灰。左端轮: cx=202, r=21。右端轮: cx=1733, r=21 |

**定位**：全宽 1920px，固定在板块顶部，`top: 0`

#### Layer 3：导轨端夹扣（不移动）

| 文件 | 尺寸 | 视觉效果 |
|------|------|---------|
| `left-clip.svg` | 583×87 | 4个圆: 2个大圆(r=29, y=29)在两端 + 2个小圆(r=12, y=75)在两端，渐变黑→灰 |
| `right-clip.svg` | 583×87 | 同上（镜像） |

**定位**（基于 1920px 设计稿）：
- left-clip：`left: 0, top: 0`（与导轨对齐）
- right-clip：`right: 0, top: 0`（与导轨对齐）

---

## 🔧 技术实现方案

### 推荐方案：GSAP ScrollTrigger + pin

```tsx
"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// ... 保留现有常量和接口 ...

export function OemOdmWhatWeOffer({ title, items }: OemOdmWhatWeOfferProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  // refs for sliding door animation
  const sectionRef = useRef<HTMLDivElement>(null)
  const pcContainerRef = useRef<HTMLDivElement>(null)
  const leftDoorRef = useRef<HTMLDivElement>(null)
  const rightDoorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 仅 PC 端启用
    if (window.innerWidth < 768) return

    const section = sectionRef.current
    const leftDoor = leftDoorRef.current
    const rightDoor = rightDoorRef.current
    if (!section || !leftDoor || !rightDoor) return

    const HEADER_HEIGHT = 46
    const OPEN_SCROLL = 500
    const PAUSE_SCROLL = 200
    const CLOSE_SCROLL = 500
    const TOTAL_SCROLL = OPEN_SCROLL + PAUSE_SCROLL + CLOSE_SCROLL

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: `top top+=${HEADER_HEIGHT}`,
        end: `+=${TOTAL_SCROLL}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.5,
        anticipatePin: 1,
        // markers: true,  // 调试用
      }
    })

    // 阶段1：开门 (0 → 0.417)
    const openDuration = OPEN_SCROLL / TOTAL_SCROLL
    tl.to(leftDoor, {
      x: "-100%",
      duration: openDuration,
      ease: "power2.inOut",
    }, 0)
    tl.to(rightDoor, {
      x: "100%",
      duration: openDuration,
      ease: "power2.inOut",
    }, 0)

    // 阶段2：停留 (0.417 → 0.583) — 空段，什么都不做

    // 阶段3：关门 (0.583 → 1.0)
    const closeStart = (OPEN_SCROLL + PAUSE_SCROLL) / TOTAL_SCROLL
    const closeDuration = CLOSE_SCROLL / TOTAL_SCROLL
    tl.to(leftDoor, {
      x: "0%",
      duration: closeDuration,
      ease: "power2.inOut",
    }, closeStart)
    tl.to(rightDoor, {
      x: "0%",
      duration: closeDuration,
      ease: "power2.inOut",
    }, closeStart)

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === section) st.kill()
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full">

      {/* ========== PC端布局 ========== */}
      <div
        ref={pcContainerRef}
        className="hidden md:block relative w-full overflow-hidden"
        style={{
          ["--rpx-what-we-offer" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
          height: rpx(DESIGN_HEIGHT),
        }}
      >
        {/* z-0：背景图片 */}
        <div className="absolute inset-0" style={{
          backgroundImage: "url('/images/oem-odm/what-we-offer-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }} />

        {/* z-10：标题 "What We Offer You" */}
        <div className="absolute left-1/2" style={{ transform: "translateX(-50%)", top: rpx(120), zIndex: 10 }}>
          {/* ... 现有标题代码保持不变 ... */}
        </div>

        {/* z-20：三张卡片内容 */}
        <div className="absolute left-1/2" style={{ transform: "translateX(-50%)", width: rpx(1344), height: rpx(DESIGN_HEIGHT), zIndex: 20 }}>
          {/* ... 现有卡片代码保持不变 ... */}
        </div>

        {/* ====== 滑轨门系统（新增） ====== */}

        {/* Layer 0 (z-25)：固定侧面磨砂玻璃板 */}
        <img
          src="/images/oem-odm/sliding-door/rectangle-398.svg"
          alt=""
          className="absolute top-0 left-0 pointer-events-none"
          style={{ height: "100%", width: "auto", zIndex: 25 }}
        />
        <img
          src="/images/oem-odm/sliding-door/rectangle-399.svg"
          alt=""
          className="absolute top-0 right-0 pointer-events-none"
          style={{ height: "100%", width: "auto", zIndex: 25 }}
        />

        {/* Layer 1 (z-26)：滑动门扇 — 做动画的元素 */}
        <div
          ref={leftDoorRef}
          className="absolute top-0 pointer-events-none"
          style={{
            left: `calc(50% - ${rpx(730)})`,
            width: rpx(730),
            height: "100%",
            zIndex: 26,
            willChange: "transform",
          }}
        >
          <img
            src="/images/oem-odm/sliding-door/left-door.svg"
            alt=""
            className="w-full h-full"
            style={{ objectFit: "fill" }}
          />
        </div>
        <div
          ref={rightDoorRef}
          className="absolute top-0 pointer-events-none"
          style={{
            left: "50%",
            width: rpx(729),
            height: "100%",
            zIndex: 26,
            willChange: "transform",
          }}
        >
          <img
            src="/images/oem-odm/sliding-door/right-door.svg"
            alt=""
            className="w-full h-full"
            style={{ objectFit: "fill" }}
          />
        </div>

        {/* Layer 2 (z-27)：导轨横杆 */}
        <img
          src="/images/oem-odm/sliding-door/stick.svg"
          alt=""
          className="absolute top-0 left-0 w-full pointer-events-none"
          style={{ height: rpx(42), zIndex: 27, objectFit: "fill" }}
        />

        {/* Layer 3 (z-28)：导轨端夹扣 */}
        <img
          src="/images/oem-odm/sliding-door/left-clip.svg"
          alt=""
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: rpx(583), height: rpx(87), zIndex: 28 }}
        />
        <img
          src="/images/oem-odm/sliding-door/right-clip.svg"
          alt=""
          className="absolute top-0 right-0 pointer-events-none"
          style={{ width: rpx(583), height: rpx(87), zIndex: 28 }}
        />

        {/* ====== 滑轨门系统结束 ====== */}
      </div>

      {/* ========== 移动端布局（完全不变） ========== */}
      <div className="block md:hidden px-5 py-10">
        {/* ... 保持现有代码完全不变 ... */}
      </div>
    </section>
  )
}
```

---

## ⚠️ 重要注意事项

### 1. Lenis 兼容性
项目使用了 `lenis` 平滑滚动。GSAP ScrollTrigger 与 Lenis 可能冲突。解决方案：

```tsx
// 在 useEffect 中，创建 ScrollTrigger 之前：
ScrollTrigger.defaults({
  scroller: document.documentElement
})
// 或者如果 lenis 挂在 body 上：
// ScrollTrigger.defaults({ scroller: document.body })
```

如果仍有问题，尝试在 lenis 初始化处（全局布局组件）添加：
```tsx
lenis.on('scroll', ScrollTrigger.update)
```

### 2. framer-motion 共存
- 门元素使用原生 `<div>` + GSAP 控制 transform
- 卡片继续使用 `<motion.div>` + framer-motion
- 两者互不干扰

### 3. overflow: hidden
PC 端容器需要 `overflow: hidden`，防止门滑出时超出板块边界。

### 4. 移动端不启用
门动画仅在 `md:` 断点以上启用（`window.innerWidth >= 768`）。加一个 resize 监听或 CSS media query 双保险。

### 5. SVG 缩放
所有 SVG 尺寸基于 1920px 设计稿。使用现有的 `rpx()` 函数做响应式缩放，确保在不同屏幕宽度下比例正确。

### 6. 性能
- 门扇元素设置 `will-change: transform`
- SVG 使用 `<img>` 标签（非 inline SVG），减少 DOM 节点
- GSAP scrub 自动处理 requestAnimationFrame

---

## ✅ 验收标准

1. **滚动向下**：板块到达 header 底部(46px) → pin住 → 门从中间向两侧滑开 → 停留200px → 门关闭 → 取消pin
2. **滚动向上**：完全对称的反向效果
3. **动画丝滑**：scrub 模式，门位移与滚动进度严格绑定，无跳帧
4. **层级正确**：夹扣(28) > 导轨(27) > 门扇(26) > 固定玻璃板(25) > 卡片(20) > 标题(10) > 背景(0)
5. **SVG 正确渲染**：7 个 SVG 全部可见，位置准确，比例正确
6. **移动端无影响**：门和导轨仅 PC 端渲染
7. **现有功能不受影响**：卡片 hover 效果、标题动画保持原样
8. **性能良好**：60fps 流畅，无布局抖动（layout shift）
9. **Lenis 兼容**：平滑滚动与 ScrollTrigger pin 不冲突

---

## 🔍 调试建议

- `markers: true` 可视化 ScrollTrigger 的 start/end 触发线
- 浏览器 DevTools → Performance tab 检查动画帧率
- 如果 pin 时页面跳动，检查 `pinSpacing` 和 Lenis 的交互
- 检查 SVG 在小屏(如 1024px, 1280px)下的缩放是否正常
