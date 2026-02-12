"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 922
const HEADER_HEIGHT = 46

// 动画配置
const INITIAL_DELAY = 0.3 // 初始延迟(秒)
const DRAWER_ANIMATION_DURATION = 1.0 // 抽屉动画时长(秒)
const MASK_FADE_DELAY = INITIAL_DELAY + DRAWER_ANIMATION_DURATION // 遮罩在抽屉动画完成后开始渐隐
const MASK_FADE_DURATION = 0.6 // 遮罩渐隐时长(秒)

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-value-guide) * ${designValue})`

// CSS 动画 keyframes
const drawerAnimationStyles = `
@keyframes drawerSlideLeft {
  0% {
    opacity: 0;
    transform: translateX(15vw);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes drawerSlideRight {
  0% {
    opacity: 0;
    transform: translateX(-15vw);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes floatUpDown {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
`

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
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

interface OemOdmValueGuideProps {
  titleLines?: string[]
  features?: string[]
  leftDescription?: string
  rightDescription?: string
  leftImage?: MediaObject | null
  rightImage?: MediaObject | null
}

const defaultContent = {
  titleLines: ["Customized", "Glass", "Hardware", "Solutions For", "Building", "Projects"],
  features: ["Professional", "Efficient", "Reliable"],
  leftDescription: "We Are Committed To More Than Just Delivering Premium Glass Hardware Products—We Provide Comprehensive Support To Ensure A Smooth And Hassle-Free Experience. From Expert Guidance To Responsive After-Sales Assistance, Our Services Are Designed To Meet The Unique Needs Of Dealers, And Contractors Alike, Helping You Achieve The Best Results With Confidence.",
  rightDescription: "For Dealers, Contractors Or Architect, We Provide Bulk Order Assistance, Product Training, And Technical Consultation. No Matter The Customer, Busrom Strives To Ensure Seamless Service And Long-Term Satisfaction With Our Indoor & Outdoor Solutions.",
}

export function OemOdmValueGuide({
  titleLines = defaultContent.titleLines,
  features = defaultContent.features,
  leftDescription = defaultContent.leftDescription,
  rightDescription = defaultContent.rightDescription,
  leftImage,
  rightImage,
}: OemOdmValueGuideProps) {
  const [isLeftImageHovered, setIsLeftImageHovered] = useState(false)
  const [isRightTextExpanded, setIsRightTextExpanded] = useState(false)

  const getObjectPosition = (image?: MediaObject | null) =>
    image?.cropFocalPoint ? `${image.cropFocalPoint.x}% ${image.cropFocalPoint.y}%` : "center"

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        paddingTop: `${HEADER_HEIGHT}px`,
        ["--rpx-value-guide" as string]: `min(calc(100vw / ${DESIGN_WIDTH}), max(calc(600px / ${DESIGN_HEIGHT}), calc(100vh / ${DESIGN_HEIGHT})))`,
      }}
    >
      {/* 注入 CSS keyframes */}
      <style dangerouslySetInnerHTML={{ __html: drawerAnimationStyles }} />
      {/* ================================================================
          PC 端布局 (md 以上显示) - 完全保留你提供的原始逻辑
          ================================================================ */}
      <div className="hidden md:block relative w-full overflow-hidden" style={{ height: rpx(DESIGN_HEIGHT) }}>
        {/* 背景层 */}
        <div className="absolute left-0 top-0 bottom-0" style={{ width: rpx(683), backgroundColor: "#f0ebda" }} />
        <div className="absolute right-0 top-0 bottom-0" style={{ left: rpx(683), backgroundColor: "rgba(186,179,123,0.67)", backdropFilter: "blur(12px)" }} />
        {/* 右侧椭圆装饰 - 模糊渐变效果 (z-index: 1，在背景上层，内容下层) */}
        <div className="absolute overflow-hidden" style={{ left: rpx(683), top: 0, width: rpx(1237), height: rpx(922), zIndex: 1 }}>
          <div
            className="absolute"
            style={{
              left: rpx(-332),
              top: rpx(-212),
              width: rpx(1707),
              height: rpx(1457),
              background: "radial-gradient(ellipse 50% 50% at 50% 50%, #756F3F 0%, rgba(117,111,63,0.91) 22.58%, rgba(117,111,63,0) 100%)",
              filter: "blur(63px)",
              borderRadius: "50%",
            }}
          />
        </div>

        {/* 左侧图片 - 底部对齐，抽屉动画从中间往左滑出 */}
        <motion.div
          className="absolute overflow-hidden cursor-pointer"
          style={{
            left: rpx(76),
            bottom: 0,
            width: rpx(607),
            height: rpx(761),
            borderTopLeftRadius: rpx(321),
            zIndex: 2,
          }}
          initial={{ opacity: 0, x: "15vw" }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: DRAWER_ANIMATION_DURATION, delay: INITIAL_DELAY, ease: [0.25, 0.1, 0.25, 1] }}
          onMouseEnter={() => setIsLeftImageHovered(true)}
          onMouseLeave={() => setIsLeftImageHovered(false)}
        >
          {leftImage?.enableLink && leftImage.linkUrl ? (
            <Link
              href={leftImage.linkUrl}
              target={leftImage.openInNewTab ? '_blank' : undefined}
              rel={leftImage.openInNewTab ? 'noopener noreferrer' : undefined}
              className="block w-full h-full grayscale"
            >
              <OptimizedImage image={leftImage as any} alt="OEM Service" size="large" className="w-full h-full object-cover" objectPosition={getObjectPosition(leftImage)} priority />
            </Link>
          ) : (
            <div className="w-full h-full grayscale">
              {leftImage ? (
                <OptimizedImage image={leftImage as any} alt="OEM Service" size="large" className="w-full h-full object-cover" objectPosition={getObjectPosition(leftImage)} priority />
              ) : (
                <div className="w-full h-full bg-gray-400"><Image src="/images/placeholder-person.jpg" alt="OEM Service" fill className="object-cover" priority /></div>
              )}
            </div>
          )}
        </motion.div>

        {/* 主标题 */}
        <div className="absolute flex flex-col items-center" style={{ left: rpx(600), top: rpx(178), width: rpx(603), zIndex: 20 }}>
          {titleLines.map((line, index) => (
            <div key={index} className="relative" style={{ height: rpx(70) }}>
              <span className="absolute inset-0 font-anaheim font-extrabold uppercase text-center leading-none" style={{ fontSize: rpx(60), lineHeight: rpx(70), color: "rgba(0,0,0,0.4)", filter: "blur(19px)", transform: `translateY(${rpx(4)})` }}>{line}</span>
              <motion.span className="relative font-anaheim font-extrabold uppercase text-center leading-none block" style={{ fontSize: rpx(60), lineHeight: rpx(70), backgroundImage: "linear-gradient(165deg, rgb(253, 255, 181) 12%, rgb(254, 210, 116) 45%, rgb(255, 240, 37) 86%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}>{line}</motion.span>
            </div>
          ))}
        </div>

        {/* 右上角装饰 + 特性文字 */}
        <motion.div className="absolute" style={{ right: rpx(210), top: rpx(210), zIndex: 20 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
          <div className="absolute" style={{ left: rpx(-110), top: rpx(-50), width: rpx(142), height: rpx(141) }}>
            {/* 外圈虚线 - 旋转动画 */}
            <svg
              className="absolute inset-0 animate-spin-slow"
              style={{ width: '100%', height: '100%', transformOrigin: 'center center' }}
              viewBox="0 0 142 141"
              fill="none"
            >
              <circle
                cx="71"
                cy="70.5"
                r="68"
                stroke="#FFF3BD"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="12 12"
                fill="none"
              />
            </svg>
            {/* 内部箭头 - 浮动动画 */}
            <svg
              className="absolute inset-0"
              style={{ width: '100%', height: '100%', animation: 'floatUpDown 2s ease-in-out infinite' }}
              viewBox="0 0 142 141"
              fill="none"
            >
              <path
                d="M84.6357 53.5703C86.3824 53.0541 88.2177 54.0426 88.7354 55.7783L96.6416 82.2852L96.6582 82.3428C96.7154 82.5482 96.7533 82.7591 96.7695 82.9717L96.7725 82.9951C96.8414 83.5464 96.7398 84.1055 96.4805 84.5977L96.46 84.6348L96.2979 84.9316C96.0183 85.4454 95.5802 85.8566 95.0479 86.1045L95.0566 86.1006L95.0127 86.124C94.84 86.2141 94.6595 86.2891 94.4736 86.3477L94.418 86.3643L67.7422 94.251C65.9955 94.7673 64.1593 93.7786 63.6416 92.043C63.1239 90.3074 64.1199 88.4822 65.8662 87.9658L85.418 82.1855L46.292 61.1162C44.9695 60.4037 44.4709 58.7691 45.1641 57.4473L45.3477 57.1104C46.0727 55.7818 47.7439 55.2884 49.0801 56.0078L88.2061 77.0762L82.4102 57.6475C81.8977 55.9293 82.869 54.123 84.583 53.5859L84.6357 53.5703Z"
                fill="#FFF3BD"
              />
            </svg>
          </div>
          <div className="flex flex-col items-center">
            {features.map((feature, index) => (
              <div key={index} className="relative" style={{ marginBottom: rpx(8) }}>
                <span className="absolute font-anaheim font-bold uppercase" style={{ fontSize: rpx(48), lineHeight: rpx(76), color: "#504911", left: rpx(2), top: rpx(4) }}>{feature}</span>
                <motion.span className="relative font-anaheim font-bold uppercase" style={{ fontSize: rpx(48), lineHeight: rpx(76), color: "#fffeee" }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}>{feature}</motion.span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 右侧图片 - 底部对齐，抽屉动画从中间往右滑出 */}
        <motion.div
          className="absolute overflow-hidden"
          style={{
            right: rpx(165),
            bottom: 0,
            width: rpx(486),
            height: rpx(579),
            borderTopRightRadius: rpx(209),
            zIndex: 2,
          }}
          initial={{ opacity: 0, x: "-15vw" }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: DRAWER_ANIMATION_DURATION, delay: INITIAL_DELAY, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {rightImage?.enableLink && rightImage.linkUrl ? (
            <Link
              href={rightImage.linkUrl}
              target={rightImage.openInNewTab ? '_blank' : undefined}
              rel={rightImage.openInNewTab ? 'noopener noreferrer' : undefined}
              className="block w-full h-full grayscale"
            >
              <OptimizedImage image={rightImage as any} alt="Professional Service" size="large" className="w-full h-full object-cover" objectPosition={getObjectPosition(rightImage)} priority />
            </Link>
          ) : (
            <div className="w-full h-full grayscale">
              {rightImage ? (
                <OptimizedImage image={rightImage as any} alt="Professional Service" size="large" className="w-full h-full object-cover" objectPosition={getObjectPosition(rightImage)} priority />
              ) : (
                <div className="w-full h-full bg-gray-500"><Image src="/images/placeholder-work.jpg" alt="Professional Service" fill className="object-cover" priority /></div>
              )}
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.85) 100%)" }} />
        </motion.div>

        {/* 左下角悬停卡片 */}
        <AnimatePresence>
          {isLeftImageHovered && (
            <motion.div className="absolute" style={{ left: rpx(76), top: rpx(486), width: rpx(453), height: rpx(435), backgroundColor: "rgba(60,54,9,0.5)", backdropFilter: "blur(6px)", borderTopRightRadius: rpx(128), zIndex: 15 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }} onMouseEnter={() => setIsLeftImageHovered(true)} onMouseLeave={() => setIsLeftImageHovered(false)}>
              <p className="font-anaheim font-semibold text-white capitalize" style={{ padding: rpx(35), paddingTop: rpx(35), fontSize: rpx(24), lineHeight: rpx(32) }}>{leftDescription}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 右下角控制 */}
        <motion.div className="absolute flex flex-col items-center" style={{ right: rpx(200), bottom: rpx(80), width: rpx(418), zIndex: 15 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
          <motion.button className="mb-4 cursor-pointer" onClick={() => setIsRightTextExpanded(!isRightTextExpanded)} animate={{ y: isRightTextExpanded ? 0 : [0, 8, 0], rotate: isRightTextExpanded ? 180 : 0 }} transition={{ y: { duration: 2, repeat: isRightTextExpanded ? 0 : Infinity, ease: "easeInOut" }, rotate: { duration: 0.3 } }}>
            <svg style={{ width: rpx(23), height: rpx(24) }} viewBox="0 0 23 24" fill="none"><path d="M11.5848 24L11.6059 24C11.8856 23.9967 12.1575 23.923 12.3852 23.7887L12.3984 23.7808L12.3946 23.7829C12.4848 23.7349 12.5692 23.6797 12.6465 23.6183L12.6682 23.6007L22.5163 15.4821C23.1612 14.9504 23.1612 14.0884 22.5163 13.5567L22.4968 13.541C21.8506 13.0253 20.8197 13.0305 20.1814 13.5567L12.9629 19.5075L12.9629 1.13601C12.9629 0.508592 12.346 1.73776e-06 11.5851 1.68103e-06L11.3921 1.66664e-06C10.6418 0.0102016 10.0371 0.514862 10.0371 1.13601L10.0371 19.5076L2.81867 13.5568C2.17388 13.0252 1.12853 13.0252 0.483701 13.5568C-0.161204 14.0884 -0.161239 14.9504 0.48363 15.4821L10.3325 23.6013L10.3534 23.6182C10.4237 23.6741 10.4998 23.7248 10.5808 23.7696L10.6015 23.7808L10.5977 23.7786C10.8344 23.9227 11.1209 24.0003 11.4151 24L11.5848 24Z" fill="white" /></svg>
          </motion.button>
          <div className="relative">
            <p className="font-anaheim font-semibold text-white capitalize" style={{ fontSize: rpx(24), lineHeight: rpx(32), overflow: "hidden", display: "-webkit-box", WebkitLineClamp: isRightTextExpanded ? "unset" : 3, WebkitBoxOrient: "vertical" }}>{rightDescription}</p>
          </div>
        </motion.div>

        {/* 中间遮罩层 - 覆盖两张图片之间的中间区域，抽屉动画完成后渐隐 */}
        <motion.div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: rpx(683),
            right: rpx(651),
            zIndex: 10,
            background: "linear-gradient(to right, #f0ebda 0%, #9a946a 100%)",
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: MASK_FADE_DURATION, delay: MASK_FADE_DELAY, ease: "easeOut" }}
        />
      </div>

      {/* ================================================================
          移动端布局 (md 以下显示) - 适配小屏的流式布局
          ================================================================ */}
      <div className="block md:hidden bg-[#f0ebda] px-6 pb-16 pt-8">
        {/* 移动端标题 - 居中，金色渐变 */}
        <div className="text-center mb-8">
          {titleLines.map((line, index) => (
            <motion.h2
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="font-anaheim font-extrabold uppercase text-[10vw] leading-tight"
              style={{
                backgroundImage: "linear-gradient(165deg, rgb(253, 255, 181) 12%, rgb(254, 210, 116) 45%, rgb(255, 240, 37) 86%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0px 4px 10px rgba(0,0,0,0.15)"
              }}
            >
              {line}
            </motion.h2>
          ))}
        </div>

        {/* 移动端特性标签 - 胶囊状排列 */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {features.map((feature, i) => (
            <span key={i} className="px-4 py-1.5 bg-[#756F3F] text-[#FFF3BD] rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
              {feature}
            </span>
          ))}
        </div>

        {/* 移动端图片 1 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="relative w-full aspect-[4/5] rounded-tl-[60px] overflow-hidden grayscale shadow-2xl mb-12"
        >
          {leftImage?.enableLink && leftImage.linkUrl ? (
            <Link
              href={leftImage.linkUrl}
              target={leftImage.openInNewTab ? '_blank' : undefined}
              rel={leftImage.openInNewTab ? 'noopener noreferrer' : undefined}
              className="block w-full h-full"
            >
              <OptimizedImage image={leftImage as any} alt="OEM" className="w-full h-full object-cover" />
            </Link>
          ) : leftImage ? (
            <OptimizedImage image={leftImage as any} alt="OEM" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-400" />
          )}
          {/* 文字直接浮盖 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex items-end pointer-events-none">
            <p className="text-white text-xs font-anaheim leading-relaxed">{leftDescription}</p>
          </div>
        </motion.div>

        {/* 移动端图片 2 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="relative w-[85%] ml-auto aspect-square rounded-tr-[80px] overflow-hidden grayscale opacity-70 shadow-xl mb-12"
        >
          {rightImage?.enableLink && rightImage.linkUrl ? (
            <Link
              href={rightImage.linkUrl}
              target={rightImage.openInNewTab ? '_blank' : undefined}
              rel={rightImage.openInNewTab ? 'noopener noreferrer' : undefined}
              className="block w-full h-full"
            >
              <OptimizedImage image={rightImage as any} alt="Pro" className="w-full h-full object-cover" />
            </Link>
          ) : rightImage ? (
            <OptimizedImage image={rightImage as any} alt="Pro" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-500" />
          )}
        </motion.div>

        {/* 移动端底部描述 */}
        <div className="text-center px-4">
          <div className="w-12 h-1 bg-[#756F3F]/30 mx-auto mb-6 rounded-full" />
          <p className="text-[#504911] font-anaheim font-semibold text-sm italic leading-relaxed">
            {rightDescription}
          </p>
        </div>
      </div>
    </section>
  )
}

export default OemOdmValueGuide