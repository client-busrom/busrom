"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 922
const HEADER_HEIGHT = 46

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-brand-adv) * ${designValue})`

interface MediaObject {
  id: string
  url: string
  alt?: string
  variants?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
  }
  cropFocalPoint?: { x: number; y: number } | null
  width?: number
  height?: number
}

interface CurvedTextConfig {
  left: number
  top: number
  width: number
  height: number
  // SVG path 参数
  path: string
  fontSize?: number
}

interface OemOdmBrandAdvantageProps {
  // 品牌优势列表
  brandAdvantages?: string[]
  // 左侧图片 (中间那张带阴影的)
  leftImage?: MediaObject | null
  // 右侧图片
  rightImage?: MediaObject | null
  // Brand Advantages 弯曲文字配置
  brandCurveConfig?: CurvedTextConfig
  // Click To Know More 弯曲文字配置
  clickCurveConfig?: CurvedTextConfig
  // 标题文字 (弯曲显示)
  title?: string
  // 点击了解更多文字
  clickToKnowMore?: string
  // OEM 文字
  oemLabel?: string
  // ODM 文字
  odmLabel?: string
  // 点击OEM卡片的回调
  onOemClick?: () => void
  // 点击ODM卡片的回调
  onOdmClick?: () => void
}

// 默认内容
const defaultContent = {
  brandAdvantages: [
    "Years Of Focus",
    "Promise Of Quality",
    "Customized Service",
    "Peace Of Mind",
    "Worry-free",
    "Global Trust",
  ],
}

// 默认弯曲文字配置
// 圆角矩形参数: left:277, top:131, width:495, height:712, borderRadius:247.5 (width/2)
// 使用胶囊形状的上半部分路径
const defaultBrandCurve: CurvedTextConfig = {
  left: 0,
  top: 0,
  width: 495,
  height: 400, // 只需要上半部分的高度
  // 胶囊顶部路径: 从左下开始，沿左边上去，绕过顶部，沿右边下来
  // 左右两边起点终点等高
  path: "M 40, 340 L 40, 247.5 A 207.5, 207.5 0 0, 1 455, 247.5 L 455, 340",
  fontSize: 26,
}

const defaultClickCurve: CurvedTextConfig = {
  left: 698, // 与中间胶囊位置对齐
  top: 400, // 底部位置
  width: 495,
  height: 450, // 只需要底部弧线的高度
  // 路径: 从左侧开始，沿着底部弧线到右侧
  // 胶囊底部圆弧: 圆心在 (247.5, 0)，半径 207.5
  // 从左边 (40, 50) 向下到弧线起点，绕过底部弧线，到右边向上
  path: "M 40, 50 L 40, 207.5 A 207.5, 207.5 0 0, 0 455, 207.5 L 455, 50",
  fontSize: 24,
}

export function OemOdmBrandAdvantage({
  brandAdvantages = defaultContent.brandAdvantages,
  leftImage,
  rightImage,
  brandCurveConfig = defaultBrandCurve,
  clickCurveConfig = defaultClickCurve,
  title = "BRAND ADVANTAGES",
  clickToKnowMore = "Click To Know More",
  oemLabel = "OEM",
  odmLabel = "ODM",
  onOemClick,
  onOdmClick,
}: OemOdmBrandAdvantageProps) {
  // 悬停状态: 'oem' | 'odm' | null，默认显示 OEM
  const [hoveredCard, setHoveredCard] = useState<'oem' | 'odm' | null>(null)

  // 当前激活的卡片（默认 OEM）
  const activeCard = hoveredCard || 'oem'

  // Calculate object position from focal point
  const getObjectPosition = (image?: MediaObject | null) =>
    image?.cropFocalPoint
      ? `${image.cropFocalPoint.x}% ${image.cropFocalPoint.y}%`
      : "center"

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        ["--rpx-brand-adv" as string]: `min(calc(100vw / ${DESIGN_WIDTH}), max(calc(600px / ${DESIGN_HEIGHT}), calc(100vh / ${DESIGN_HEIGHT})))`,
      }}
    >
      {/* 内部容器 */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: rpx(DESIGN_HEIGHT) }}
      >
        {/* ========== 右侧装饰椭圆 ========== */}
        <div
          className="absolute rounded-full"
          style={{
            right: 0,
            top: rpx(207),
            width: rpx(656),
            height: rpx(942),
            backgroundColor: "rgba(117, 111, 63, 0.07)",
            borderRadius: rpx(401),
          }}
        />

        {/* ========== BRAND ADVANTAGES 弯曲文字 (在矩形外面避免被裁剪) ========== */}
        <svg
          className="absolute pointer-events-none"
          style={{
            // 位置对齐到圆角矩形
            left: rpx(277 + brandCurveConfig.left),
            top: rpx(131 + brandCurveConfig.top),
            width: rpx(brandCurveConfig.width),
            height: rpx(brandCurveConfig.height),
            zIndex: 5,
          }}
          viewBox={`0 0 ${brandCurveConfig.width} ${brandCurveConfig.height}`}
        >
          <defs>
            <path
              id="brandCurve"
              d={brandCurveConfig.path}
              fill="none"
            />
          </defs>
          <text
            fill="#FFF38E"
            fontSize={brandCurveConfig.fontSize || 24}
            fontFamily="Anaheim, sans-serif"
            fontWeight="bold"
            textAnchor="middle"
            letterSpacing="1em"
          >
            <textPath href="#brandCurve" startOffset="52%">
              {title}
            </textPath>
          </text>
        </svg>

        {/* ========== 左侧黄绿色圆角矩形 ========== */}
        <motion.div
          className="absolute overflow-hidden"
          style={{
            left: rpx(277),
            top: rpx(131),
            width: rpx(495),
            height: rpx(712),
            backgroundColor: "#756F3F",
            borderRadius: rpx(299),
            zIndex: 3, // 最上层
          }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* 品牌优势列表 */}
          <div
            className="absolute flex flex-col items-center text-center"
            style={{
              left: rpx(74),
              top: rpx(150),
              width: rpx(347),
            }}
          >
            {brandAdvantages.map((item, index) => (
              <motion.span
                key={index}
                className="font-anaheim font-semibold text-white capitalize"
                style={{
                  fontSize: rpx(28),
                  lineHeight: rpx(80),
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* ========== 中间图片 - OEM ========== */}
        <motion.div
          className="absolute overflow-hidden cursor-pointer transition-shadow duration-300"
          style={{
            left: rpx(698),
            top: rpx(131),
            width: rpx(496),
            height: rpx(712),
            borderRadius: rpx(299),
            zIndex: 2, // 中间层
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            boxShadow: activeCard === 'oem'
              ? `${rpx(13)} ${rpx(17)} ${rpx(25.5)} rgba(0, 0, 0, 0.44)`
              : 'none',
          }}
          transition={{ duration: 0.3 }}
          onMouseEnter={() => setHoveredCard('oem')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={onOemClick}
        >
          {/* 图片 - 悬停放大 */}
          <motion.div
            className="absolute inset-0"
            animate={{
              scale: activeCard === 'oem' ? 1.1 : 1,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {leftImage ? (
              <OptimizedImage
                image={leftImage as any}
                alt="OEM Service"
                size="large"
                className="w-full h-full object-cover"
                objectPosition={getObjectPosition(leftImage)}
              />
            ) : (
              <div className="w-full h-full bg-black" />
            )}
          </motion.div>
          {/* 渐变叠加 */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, transparent 0%, rgba(44, 22, 14, 0.88) 100%)",
              opacity: 0.98,
            }}
          />

          {/* OEM 文字 - 悬停时变大 */}
          <motion.span
            className="absolute font-anaheim font-bold text-white text-center"
            style={{
              left: rpx(133),
              top: rpx(308),
              width: rpx(230),
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              fontSize: activeCard === 'oem' ? rpx(60) : rpx(48),
              lineHeight: activeCard === 'oem' ? rpx(60) : rpx(48),
            }}
            transition={{ duration: 0.3 }}
          >
            {oemLabel}
          </motion.span>
        </motion.div>

        {/* ========== 上方虚线装饰曲线 (左上角) ========== */}
        <svg
          className="absolute pointer-events-none"
          style={{
            left: rpx(527),
            top: rpx(33),
            width: rpx(837),
            height: rpx(862),
            zIndex: 2, // 与中间卡片同层
          }}
          viewBox="0 0 837 862"
          fill="none"
        >
          {/* 上方虚线曲线 - 从左下到右上 */}
          <path
            d="M20.844 299.957C-7.2055 200.471 -26.163 1.5 122.402 1.5C270.968 1.5 445.455 112.316 514.128 167.724"
            stroke="#756F3F"
            strokeWidth="3"
            strokeDasharray="10 14"
            className="animate-dash-flow"
          />
          {/* 左侧曲线起点圆 */}
          <circle cx="22.1928" cy="301.615" r="8.29048" fill="#756F3F" />
          {/* 上方曲线端点圆 */}
          <circle cx="514.647" cy="167.31" r="8.29048" fill="#756F3F" />
        </svg>

        {/* ========== 下方虚线装饰曲线 (右下角) ========== */}
        <svg
          className="absolute pointer-events-none"
          style={{
            left: rpx(527),
            top: rpx(33),
            width: rpx(837),
            height: rpx(862),
            zIndex: 1, // 在中间卡片下层，右边卡片上层
          }}
          viewBox="0 0 837 862"
          fill="none"
        >
          {/* 下方虚线曲线 */}
          <path
            d="M514.128 704.5C733.304 929 894.766 907.981 813.519 662.251"
            stroke="#756F3F"
            strokeWidth="3"
            strokeDasharray="10 14"
            className="animate-dash-flow"
          />
          {/* 右侧曲线端点圆 */}
          <path
            d="M818.908 662.251C818.908 666.83 815.196 670.542 810.617 670.542C806.039 670.542 802.327 666.83 802.327 662.251C802.327 657.672 806.039 653.961 810.617 653.961C815.196 653.961 818.908 657.672 818.908 662.251Z"
            fill="#756F3F"
          />
          {/* 下方曲线起点圆 */}
          <path
            d="M522.885 703.79C522.885 708.369 519.173 712.081 514.594 712.081C510.016 712.081 506.304 708.369 506.304 703.79C506.304 699.212 510.016 695.5 514.594 695.5C519.173 695.5 522.885 699.212 522.885 703.79Z"
            fill="#756F3F"
          />
        </svg>

        {/* Click to know more 弯曲文字 - OEM (中间胶囊) */}
        <svg
          className="absolute pointer-events-none"
          style={{
            left: rpx(clickCurveConfig.left),
            top: rpx(clickCurveConfig.top),
            width: rpx(clickCurveConfig.width),
            height: rpx(clickCurveConfig.height),
            zIndex: 10,
            opacity: activeCard === 'oem' ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
          viewBox={`0 0 ${clickCurveConfig.width} ${clickCurveConfig.height}`}
        >
          <defs>
            <path
              id="clickCurveOem"
              d={clickCurveConfig.path}
              fill="none"
            />
          </defs>
          <text
            fill="white"
            fontSize={clickCurveConfig.fontSize || 22}
            fontFamily="Anaheim, sans-serif"
            fontWeight="600"
            letterSpacing="0.7em"
          >
            <textPath href="#clickCurveOem" startOffset="40%">
              {clickToKnowMore}
            </textPath>
          </text>
        </svg>

        {/* Click to know more 弯曲文字 - ODM (右侧胶囊) */}
        <svg
          className="absolute pointer-events-none"
          style={{
            // ODM 胶囊位置: left=1119, 相对于 OEM 偏移 421 (1119-698)
            left: rpx(clickCurveConfig.left + 421),
            top: rpx(clickCurveConfig.top),
            width: rpx(clickCurveConfig.width),
            height: rpx(clickCurveConfig.height),
            zIndex: 10,
            opacity: activeCard === 'odm' ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
          viewBox={`0 0 ${clickCurveConfig.width} ${clickCurveConfig.height}`}
        >
          <defs>
            <path
              id="clickCurveOdm"
              d={clickCurveConfig.path}
              fill="none"
            />
          </defs>
          <text
            fill="white"
            fontSize={clickCurveConfig.fontSize || 22}
            fontFamily="Anaheim, sans-serif"
            fontWeight="600"
            letterSpacing="0.7em"
          >
            <textPath href="#clickCurveOdm" startOffset="40%">
              {clickToKnowMore}
            </textPath>
          </text>
        </svg>

        {/* ========== 右侧图片 - ODM ========== */}
        <motion.div
          className="absolute overflow-hidden cursor-pointer transition-shadow duration-300"
          style={{
            left: rpx(1119),
            top: rpx(131),
            width: rpx(496),
            height: rpx(712),
            borderRadius: rpx(299),
            zIndex: 0, // 右侧卡片，在下方虚线下层
          }}
          initial={{ opacity: 0, x: 50 }}
          animate={{
            opacity: 1,
            x: 0,
            boxShadow: activeCard === 'odm'
              ? `${rpx(13)} ${rpx(17)} ${rpx(25.5)} rgba(0, 0, 0, 0.44)`
              : 'none',
          }}
          transition={{ duration: 0.3 }}
          onMouseEnter={() => setHoveredCard('odm')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={onOdmClick}
        >
          {/* 图片 - 悬停放大 */}
          <motion.div
            className="absolute inset-0"
            animate={{
              scale: activeCard === 'odm' ? 1.1 : 1,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {rightImage ? (
              <OptimizedImage
                image={rightImage as any}
                alt="ODM Service"
                size="large"
                className="w-full h-full object-cover"
                objectPosition={getObjectPosition(rightImage)}
              />
            ) : (
              <div className="w-full h-full bg-black" />
            )}
          </motion.div>

          {/* ODM 文字 - 悬停时变大 */}
          <motion.span
            className="absolute font-anaheim font-bold text-white text-center"
            style={{
              left: rpx(162),
              top: rpx(320),
              width: rpx(171),
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              fontSize: activeCard === 'odm' ? rpx(60) : rpx(48),
              lineHeight: activeCard === 'odm' ? rpx(60) : rpx(48),
            }}
            transition={{ duration: 0.3 }}
          >
            {odmLabel}
          </motion.span>
        </motion.div>

        {/* ========== 装饰曲线/箭头 (VECTOR元素) ========== */}
        {/* 右下角连续箭头 - 从左到右波浪动画 */}
        <svg
          className="absolute"
          style={{
            left: rpx(1421),
            top: rpx(766),
            width: rpx(226),
            height: rpx(17),
            zIndex: 10,
          }}
          viewBox="0 0 226 17"
          fill="none"
        >
          {[
            1.5, 12.7115, 23.9248, 35.1357, 46.347, 58.7805, 69.9919, 81.2052,
            92.416, 103.628, 114.25, 125.462, 136.675, 147.886, 159.098,
            171.531, 182.742, 193.956, 205.167, 216.378,
          ].map((x, index) => (
            <path
              key={index}
              d={`M${x} 15.3862L${x + 7.226} 8.4431L${x} 1.5`}
              stroke="#756F3F"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse-wave"
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </svg>
      </div>
    </section>
  )
}

export default OemOdmBrandAdvantage
