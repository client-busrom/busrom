"use client"

import React, { useState } from "react"
import {
  FileText,
  MessageSquare,
  ClipboardCheck,
  Factory,
  Truck,
} from "lucide-react"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 899

// 背景 SVG 位置配置
// line.svg: top=191, 曲线起点 y=265 → 实际 y = 456
// topLight.svg (新): 高度592，曲线在 y≈559 → top = 456 - 559 = -103
// bottomLight.svg (新): 高度707，曲线在 y≈255 → top = 456 - 255 = 201
const TOP_LIGHT_TOP = -103   // topLight.svg 相对于板块顶部的偏移
const BOTTOM_LIGHT_TOP = 201 // bottomLight.svg 相对于板块顶部的偏移

// 步骤图标映射（根据文本内容匹配）
const STEP_ICONS = [
  FileText,        // Submit A Project Inquiry
  MessageSquare,   // Technology & Product Communication
  ClipboardCheck,  // Quotation & Product Confirmation
  Factory,         // Place Order & Production
  Truck,           // Delivery
]

// 步骤位置配置（基于 Figma，y 相对于板块 y=6708）
// x, y: 默认位置（靠近线条）
// hoverY: 悬停时的 y 位置（下移）
// maskX, maskWidth: 悬停时显示的矩形遮罩区域（也是悬停触发区域）
const STEP_POSITIONS = [
  {
    x: 182, y: 514, hoverY: 564, iconX: 240, iconY: 470,
    maskX: 120, maskWidth: 321
  },
  {
    x: 505, y: 540, hoverY: 597, iconX: 599, iconY: 479,
    maskX: 441, maskWidth: 321
  },
  {
    x: 824, y: 365, hoverY: 415, iconX: 880, iconY: 320,
    maskX: 762, maskWidth: 321
  },
  {
    x: 1145, y: 274, hoverY: 324, iconX: 1200, iconY: 230,
    maskX: 1083, maskWidth: 321
  },
  {
    x: 1467, y: 328, hoverY: 378, iconX: 1520, iconY: 284,
    maskX: 1405, maskWidth: 321
  },
]

export interface CooperationProcessStep {
  id: string | number
  title: string
}

interface CooperationProcessSectionProps {
  titleLine1?: string
  titleLine2?: string
  steps?: CooperationProcessStep[]
  buttonText?: string
  onButtonClick?: () => void
}

export function CooperationProcessSection({
  titleLine1 = "Cooperation",
  titleLine2 = "Process",
  steps = [],
  buttonText = "Get A Solution",
  onButtonClick,
}: CooperationProcessSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // vw 尺寸计算
  const vw = (v: number) => `${(v / DESIGN_WIDTH) * 100}vw`

  return (
    <section
      className="relative w-full"
      style={{
        aspectRatio: `${DESIGN_WIDTH} / ${SECTION_HEIGHT}`,
        marginTop: vw(80),
      }}
    >
      {/* 每个 item 的悬停背景（使用 clipPath 遮罩显示对应区域） */}
      {STEP_POSITIONS.map((pos, index) => {
        const isHovered = hoveredIndex === index
        return (
          <div
            key={`hover-bg-${index}`}
            className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            style={{
              clipPath: `inset(-100% ${((DESIGN_WIDTH - pos.maskX - pos.maskWidth) / DESIGN_WIDTH) * 100}% -100% ${(pos.maskX / DESIGN_WIDTH) * 100}%)`,
            }}
          >
            {/* 线条上方的渐变 - topLight.svg */}
            <svg
              className="absolute"
              style={{
                left: 0,
                top: vw(TOP_LIGHT_TOP),
                width: vw(1920),
                height: vw(592),
              }}
              viewBox="0 0 1920 592"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`topGrad-${index}`} x1="1054.5" y1="7.94953e-06" x2="1099.25" y2="758.668" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFBE5" stopOpacity="0"/>
                  <stop offset="0.649038" stopColor="#FFE75E"/>
                </linearGradient>
                <clipPath id={`topClip-${index}`}>
                  {/* 线条上方区域：从左上角开始，沿曲线绘制，然后闭合到右上角 */}
                  <path d="M0 0H2077V622C2057.17 614.052 1993.5 481.918 1848.06 420.239C1678.6 348.376 1450.15 304 1282.19 304C1114.23 304 935.775 331.155 770.814 452.693C655.123 537.93 485.383 559.328 355.414 559.328H0V0Z"/>
                </clipPath>
              </defs>
              <g clipPath={`url(#topClip-${index})`}>
                <rect width="2077" height="592" fill={`url(#topGrad-${index})`}/>
              </g>
            </svg>

            {/* 线条下方的渐变 - bottomLight.svg */}
            <svg
              className="absolute"
              style={{
                left: 0,
                top: vw(BOTTOM_LIGHT_TOP),
                width: vw(1920),
                height: vw(707),
              }}
              viewBox="0 0 1920 707"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`bottomGrad-${index}`} x1="951" y1="195.5" x2="860" y2="715.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFBE5" stopOpacity="0"/>
                  <stop offset="1" stopColor="#FFEF95"/>
                </linearGradient>
                <mask id={`bottomMask-${index}`} style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="2077" height="707">
                  <path d="M356.243 255.328H0V707H2077V320.5C2057.18 312.552 1983.67 173.729 1848.17 116.239C1678.79 44.376 1450.45 0.000208128 1282.57 0C1114.69 -0.000208126 936.324 27.1553 771.443 148.693C655.808 233.93 486.149 255.328 356.243 255.328Z" fill="#FFFDE8"/>
                </mask>
              </defs>
              <g mask={`url(#bottomMask-${index})`}>
                <rect width="2077" height="770" transform="matrix(1 0 0 -1 0 708)" fill={`url(#bottomGrad-${index})`}/>
              </g>
            </svg>
          </div>
        )
      })}

      {/* 标题区域 */}
      <div
        className="absolute"
        style={{
          left: vw(162),
          top: vw(0),
        }}
      >
        {/* Cooperation - 黑色实心 */}
        <h2
          className="font-josefin-sans font-bold text-black"
          style={{
            fontSize: vw(96),
            lineHeight: vw(90),
          }}
        >
          {titleLine1}
        </h2>
        {/* Process - 浅色填充 + 描边 */}
        <h2
          className="font-josefin-sans font-bold text-stroke-dark-olive"
          style={{
            fontSize: vw(96),
            lineHeight: vw(90),
            color: "#D8D193",
            marginTop: vw(11),
          }}
        >
          {titleLine2}
        </h2>
      </div>

      {/* 流程线 + 箭头 SVG */}
      <svg
        className="absolute"
        style={{
          left: vw(0),
          top: vw(191), // 6899-6708=191
          width: vw(1920),
          height: vw(720),
        }}
        viewBox="0 0 1920 720"
        fill="none"
        preserveAspectRatio="none"
      >
        {/* 曲线路径 */}
        <path
          d="M0 265H356.586C486.617 265 656.439 243.797 772.186 159.337C937.225 38.9077 1115.77 11.9998 1283.81 12C1451.85 12.0002 1680.4 55.9715 1849.94 127.179C1938.8 171.619 2093.3 288.2 2000.5 399C1884.5 537.5 1491.5 537.767 1386 457.267C1363.5 440.098 1328 399 1362.5 363.5C1415.74 308.713 1489 401.5 1418 443C1347 484.5 1084.5 512 1061 719.5"
          stroke="#BDAC38"
          strokeWidth="4"
        />
        {/* 箭头1 */}
        <path
          d="M437.647 261.689L418.968 283.462L415.759 280.774L431.445 262.259L412.651 246.907L415.317 243.681L437.647 261.689ZM466.063 259.082L447.384 280.854L444.175 278.167L459.861 259.65L441.067 244.299L443.733 241.072L466.063 259.082ZM494.478 256.475L475.798 278.247L472.589 275.56L488.275 257.044L469.481 241.692L472.147 238.466L494.478 256.475Z"
          fill="#BDAC38"
        />
        {/* 箭头2 */}
        <path
          d="M1113 23.2236L1094.32 44.9961L1091.11 42.3086L1106.79 23.793L1088 8.44141L1090.67 5.21484L1113 23.2236ZM1141.41 20.6162L1122.73 42.3877L1119.52 39.7012L1135.21 21.1846L1116.42 5.83301L1119.08 2.60645L1141.41 20.6162ZM1169.83 18.0088L1151.15 39.7812L1147.94 37.0938L1163.62 18.5781L1144.83 3.22656L1147.5 0L1169.83 18.0088Z"
          fill="#BDAC38"
        />
        {/* 箭头3 */}
        <path
          d="M1718.49 80.1112L1692.82 92.9148L1690.91 89.1916L1712.56 78.2259L1701.2 56.7781L1704.91 54.841L1718.49 80.1112ZM1745.69 88.7498L1720.02 101.553L1718.1 97.8303L1739.75 86.8637L1728.4 65.4159L1732.11 63.4787L1745.69 88.7498ZM1772.88 97.3877L1747.21 110.191L1745.3 106.468L1766.95 95.5025L1755.59 74.0547L1759.3 72.1175L1772.88 97.3877Z"
          fill="#BDAC38"
        />
        {/* 箭头4 */}
        <path
          d="M1783.21 498.79L1800.78 476.111L1804.12 478.635L1789.37 497.911L1808.91 512.304L1806.41 515.66L1783.21 498.79ZM1754.96 502.814L1772.53 480.136L1775.86 482.659L1761.12 501.936L1780.66 516.33L1778.16 519.685L1754.96 502.814ZM1726.71 506.838L1744.28 484.159L1747.62 486.683L1732.88 505.96L1752.41 520.353L1749.91 523.709L1726.71 506.838Z"
          fill="#BDAC38"
        />
        {/* 箭头5 */}
        <path
          d="M1117.94 594.557L1115.86 573.261L1118.95 573.043L1120.82 591.05L1138.74 589.56L1139.1 592.663L1117.94 594.557ZM1104.71 610.625L1102.64 589.33L1105.73 589.111L1107.6 607.118L1125.51 605.628L1125.87 608.732L1104.71 610.625ZM1091.49 626.693L1089.41 605.397L1092.51 605.178L1094.38 623.186L1112.29 621.696L1112.65 624.799L1091.49 626.693Z"
          fill="#BDAC38"
        />
      </svg>

      {/* 流程步骤悬停区域、文字和图标 */}
      {steps.slice(0, 5).map((step, index) => {
        const pos = STEP_POSITIONS[index]
        const Icon = STEP_ICONS[index]
        const isHovered = hoveredIndex === index
        // 悬停时使用 hoverY，否则使用默认 y
        const currentY = isHovered ? pos.hoverY : pos.y
        // 悬停时加粗，字体变大
        const fontSize = isHovered ? 36 : 32

        return (
          <React.Fragment key={step.id}>
            {/* 透明悬停触发区域 - 覆盖整个 mask 区域，高度限制避免覆盖按钮 */}
            <div
              className="absolute cursor-pointer"
              style={{
                left: vw(pos.maskX),
                top: 0,
                width: vw(pos.maskWidth),
                height: vw(750),  // 限制高度，不覆盖底部按钮
                zIndex: 10,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />

            {/* 图标 - 默认隐藏，悬停显示 */}
            <div
              className={`absolute flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              style={{
                left: vw(pos.iconX),
                top: vw(pos.iconY),
                width: vw(60),
                height: vw(60),
              }}
            >
              <Icon
                className="text-brand-dark-olive"
                style={{
                  width: vw(48),
                  height: vw(48),
                }}
                strokeWidth={1.5}
              />
            </div>

            {/* 文字 - 悬停时加粗下移，支持 \n 换行 */}
            <p
              className={`absolute font-josefin-sans text-black transition-all duration-300 pointer-events-none whitespace-pre-line ${
                isHovered ? "font-bold text-brand-dark-olive" : "font-medium"
              }`}
              style={{
                left: vw(pos.x),
                top: vw(currentY),
                width: vw(280),
                fontSize: vw(fontSize),
                lineHeight: isHovered ? vw(42) : vw(38),
              }}
            >
              {step.title}
            </p>
          </React.Fragment>
        )
      })}

      {/* Get A Solution 按钮区域 - 小球碰撞动画 (CSS) */}
      <style jsx>{`
        @keyframes ballLeft {
          0%, 50%, 100% { transform: translateX(0); }
          25% { transform: translateX(-20px); }
        }
        @keyframes ballRight {
          0%, 50%, 100% { transform: translateX(0); }
          75% { transform: translateX(20px); }
        }
      `}</style>
      <button
        className="absolute flex items-center cursor-pointer group"
        style={{
          left: vw(1176),
          top: vw(769),  // 7477-6708=769
          height: vw(66),
        }}
        onClick={onButtonClick}
      >
        {/* 第一个圆形 - 左球 */}
        <div
          className="absolute rounded-full ball-left"
          style={{
            left: 0,
            top: 0,
            width: vw(66),
            height: vw(66),
            backgroundColor: "#CEC47B",
          }}
        />
        {/* 第二个圆形 - 右球 */}
        <div
          className="absolute rounded-full ball-right"
          style={{
            left: vw(44),
            top: 0,
            width: vw(66),
            height: vw(66),
            backgroundColor: "rgba(205, 196, 123, 0.59)",
          }}
        />
        {/* 文字 - 每个字符单独跳动 */}
        <span
          className="relative font-medium flex items-center"
          style={{
            left: vw(25),
            height: vw(66),
            fontSize: vw(40),
            lineHeight: 1,
            color: "#56502F",
            fontFamily: "var(--font-anaheim), sans-serif",
          }}
        >
          {buttonText.split("").map((char, index) => (
            <span
              key={index}
              className="inline-block animate-char-bounce"
              style={{
                animationDelay: `${index * 0.08}s`,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </button>
    </section>
  )
}
