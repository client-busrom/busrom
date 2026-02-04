"use client"

import React, { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 922
const HEADER_HEIGHT = 46

// 响应式尺寸函数
const rpx = (designValue: number) => `calc(var(--rpx-value-guide) * ${designValue})`

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

        {/* 左侧图片 */}
        <motion.div
          className="absolute overflow-hidden cursor-pointer"
          style={{ left: rpx(76), top: rpx(160), width: rpx(607), height: rpx(761), borderTopLeftRadius: rpx(321), zIndex: 2 }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onMouseEnter={() => setIsLeftImageHovered(true)}
          onMouseLeave={() => setIsLeftImageHovered(false)}
        >
          <div className="w-full h-full grayscale">
            {leftImage ? (
              <OptimizedImage image={leftImage as any} alt="OEM Service" size="large" className="w-full h-full object-cover" objectPosition={getObjectPosition(leftImage)} priority />
            ) : (
              <div className="w-full h-full bg-gray-400"><Image src="/images/placeholder-person.jpg" alt="OEM Service" fill className="object-cover" priority /></div>
            )}
          </div>
        </motion.div>

        {/* 主标题 */}
        <div className="absolute flex flex-col items-center" style={{ left: rpx(600), top: rpx(228), width: rpx(603), zIndex: 20 }}>
          {titleLines.map((line, index) => (
            <div key={index} className="relative" style={{ lineHeight: rpx(70) }}>
              <span className="absolute inset-0 font-anaheim font-extrabold uppercase text-center leading-none" style={{ fontSize: rpx(60), color: "rgba(0,0,0,0.4)", filter: "blur(19px)", transform: `translateY(${rpx(4)})` }}>{line}</span>
              <motion.span className="relative font-anaheim font-extrabold uppercase text-center leading-none block" style={{ fontSize: rpx(60), backgroundImage: "linear-gradient(165deg, rgb(253, 255, 181) 12%, rgb(254, 210, 116) 45%, rgb(255, 240, 37) 86%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}>{line}</motion.span>
            </div>
          ))}
        </div>

        {/* 右上角装饰 + 特性文字 */}
        <motion.div className="absolute" style={{ right: rpx(210), top: rpx(210), zIndex: 20 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
          <svg className="absolute" style={{ left: rpx(-110), top: rpx(-50), width: rpx(142), height: rpx(141) }} viewBox="0 0 142 141" fill="none">
            <path d="M58.4824 137.752C61.4102 138.282 64.3938 138.625 67.417 138.771L67.3242 140.767C64.2131 140.616 61.1431 140.263 58.1299 139.718L58.4824 137.752ZM85.5205 138.297L85.7295 139.274C84.2301 139.593 82.7103 139.867 81.1719 140.092L80.2646 140.219C79.0304 140.383 77.7986 140.513 76.5713 140.613L76.4053 138.622C77.8908 138.501 79.3828 138.332 80.8789 138.113C82.375 137.895 83.8529 137.63 85.3105 137.32L85.5205 138.297ZM41.3877 132.284C44.0931 133.557 46.8887 134.659 49.7578 135.577L49.4551 136.529L49.1523 137.479C46.1995 136.535 43.3231 135.401 40.5391 134.091L41.3877 132.284ZM103.13 133.141C100.403 134.525 97.5651 135.74 94.6299 136.774L94.2959 135.834L94.2969 135.833L93.9619 134.891C96.8145 133.886 99.5717 132.703 102.222 131.358L103.13 133.141ZM26.2686 122.601C28.564 124.532 30.9851 126.314 33.5137 127.934L32.4365 129.615C29.835 127.949 27.3453 126.115 24.9834 124.128L26.2686 122.601ZM118.344 122.719C116.058 124.77 113.632 126.678 111.078 128.428L109.945 126.779C112.427 125.079 114.784 123.224 117.006 121.23L118.344 122.719ZM14.1562 109.354C15.8785 111.821 17.7583 114.164 19.7773 116.372L19.0391 117.046L18.4785 117.558L18.3027 117.719C16.2247 115.447 14.2906 113.034 12.5176 110.494L13.3369 109.925L14.1562 109.354ZM130.352 108.726C128.666 111.305 126.812 113.772 124.804 116.112L123.285 114.812C125.237 112.537 127.039 110.138 128.677 107.631L130.352 108.726ZM5.9248 93.4189C6.94499 96.2656 8.14491 99.017 9.51074 101.66L7.96582 102.455L7.73438 102.573C6.3281 99.8518 5.09231 97.0198 4.04199 94.0889L4.98145 93.7539H4.98242L5.9248 93.4189ZM137.469 91.8203L138.335 92.1035C137.374 95.0432 136.222 97.9065 134.891 100.677L133.087 99.8096C134.38 97.1179 135.5 94.3361 136.434 91.4805L137.469 91.8203ZM84.6357 53.5703C86.3824 53.0541 88.2177 54.0426 88.7354 55.7783L96.6416 82.2852L96.6582 82.3428C96.7154 82.5482 96.7533 82.7591 96.7695 82.9717L96.7725 82.9951C96.8414 83.5464 96.7398 84.1055 96.4805 84.5977L96.46 84.6348L96.2979 84.9316C96.0183 85.4454 95.5802 85.8566 95.0479 86.1045L95.0566 86.1006L95.0127 86.124C94.84 86.2141 94.6595 86.2891 94.4736 86.3477L94.418 86.3643L67.7422 94.251C65.9955 94.7673 64.1593 93.7786 63.6416 92.043C63.1239 90.3074 64.1199 88.4822 65.8662 87.9658L85.418 82.1855L46.292 61.1162C44.9695 60.4037 44.4709 58.7691 45.1641 57.4473L45.3477 57.1104C46.0727 55.7818 47.7439 55.2884 49.0801 56.0078L88.2061 77.0762L82.4102 57.6475C81.8977 55.9293 82.869 54.123 84.583 53.5859L84.6357 53.5703ZM2.13965 75.8818C2.26149 77.366 2.43386 78.8568 2.65527 80.3516C2.87671 81.8464 3.14429 83.3231 3.45801 84.7793L1.50391 85.1953C1.18111 83.6969 0.903546 82.1783 0.675781 80.6406C0.447949 79.1025 0.272853 77.5678 0.147461 76.04L2.13965 75.8818ZM140.892 73.9277L141.694 73.9678C141.538 77.0751 141.176 80.1408 140.618 83.1494L138.651 82.7832C139.193 79.8612 139.546 76.8832 139.697 73.8652L140.892 73.9277ZM3.04102 57.9854C2.49959 60.9071 2.14856 63.8847 1.99707 66.9023L0.998047 66.8496L0.99707 66.8506L0 66.7979C0.15599 63.6909 0.517694 60.6254 1.0752 57.6172L3.04102 57.9854ZM140.19 55.5703C140.513 57.0691 140.79 58.588 141.018 60.126C141.245 61.6636 141.421 63.1974 141.547 64.7246L140.55 64.8066L140.551 64.8057L139.553 64.8867C139.431 63.4024 139.26 61.911 139.039 60.416C138.818 58.9211 138.548 57.4445 138.234 55.9883L140.19 55.5703ZM8.60645 40.957C7.31315 43.6488 6.19355 46.4314 5.25977 49.2871L4.30957 48.9746L4.30859 48.9756L3.35938 48.6621C4.32056 45.7227 5.47282 42.8598 6.80371 40.0898L8.60645 40.957ZM133.959 38.1934C135.365 40.9146 136.602 43.7461 137.652 46.6768L135.77 47.3486C134.749 44.5021 133.548 41.7515 132.183 39.1084L133.959 38.1934ZM18.4082 25.9561C16.4563 28.2306 14.6547 30.6301 13.0166 33.1367L11.3418 32.041C13.0276 29.4615 14.8811 26.9929 16.8896 24.6523L18.4082 25.9561ZM123.392 23.0479C125.469 25.3197 127.404 27.7316 129.177 30.2715L128.356 30.8428V30.8418L127.536 31.4141C125.814 28.9466 123.935 26.6021 121.916 24.3945L123.392 23.0479ZM31.1816 13.1631L31.748 13.9873C29.2666 15.6873 26.9082 17.5427 24.6865 19.5361L24.0186 18.791L23.8047 18.5547L23.3506 18.0479C25.6367 15.9967 28.0626 14.0873 30.6162 12.3379L31.1816 13.1631ZM109.257 11.1514C111.859 12.8179 114.35 14.651 116.712 16.6387L115.426 18.167C113.13 16.2352 110.709 14.4537 108.18 12.834L109.257 11.1514ZM47.7324 5.87695C44.8797 6.88193 42.1218 8.06425 39.4717 9.40918L38.5645 7.625C41.2917 6.24099 44.1291 5.02528 47.0645 3.99121L47.7324 5.87695ZM92.542 3.28711C95.4942 4.23156 98.3708 5.36496 101.154 6.6748L100.73 7.57812L100.729 7.57715L100.305 8.48242C97.5994 7.20942 94.8044 6.10723 91.9355 5.18945L92.542 3.28711ZM65.2051 1.14941V1.14844L65.2881 2.14551C63.8026 2.26645 62.3105 2.43563 60.8145 2.6543C59.3184 2.87299 57.8405 3.13799 56.3828 3.44727L55.9648 1.49121C57.1689 1.23577 58.3859 1.00998 59.6152 0.814453L60.5215 0.675781C62.0352 0.45453 63.5451 0.282173 65.0488 0.158203L65.1221 0.152344L65.2051 1.14941ZM74.3701 0C77.1883 0.136201 79.9728 0.438415 82.7119 0.899414L83.5635 1.04785L83.2109 3.01562C80.2834 2.48609 77.3002 2.14219 74.2773 1.99609L74.3701 0Z" fill="#FFF3BD" />
          </svg>
          <div className="flex flex-col items-center">
            {features.map((feature, index) => (
              <div key={index} className="relative" style={{ marginBottom: rpx(8) }}>
                <span className="absolute font-anaheim font-bold uppercase" style={{ fontSize: rpx(48), lineHeight: rpx(76), color: "#504911", left: rpx(2), top: rpx(4) }}>{feature}</span>
                <motion.span className="relative font-anaheim font-bold uppercase" style={{ fontSize: rpx(48), lineHeight: rpx(76), color: "#fffeee" }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}>{feature}</motion.span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 右侧图片 */}
        <motion.div className="absolute overflow-hidden" style={{ right: rpx(165), top: rpx(340), width: rpx(486), height: rpx(579), borderTopRightRadius: rpx(209), zIndex: 2 }} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
          <div className="w-full h-full grayscale">
            {rightImage ? (
              <OptimizedImage image={rightImage as any} alt="Professional Service" size="large" className="w-full h-full object-cover" objectPosition={getObjectPosition(rightImage)} priority />
            ) : (
              <div className="w-full h-full bg-gray-500"><Image src="/images/placeholder-work.jpg" alt="Professional Service" fill className="object-cover" priority /></div>
            )}
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.85) 100%)" }} />
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
          {leftImage ? (
            <OptimizedImage image={leftImage as any} alt="OEM" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-400" />
          )}
          {/* 文字直接浮盖 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex items-end">
            <p className="text-white text-xs font-anaheim leading-relaxed">{leftDescription}</p>
          </div>
        </motion.div>

        {/* 移动端图片 2 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="relative w-[85%] ml-auto aspect-square rounded-tr-[80px] overflow-hidden grayscale opacity-70 shadow-xl mb-12"
        >
          {rightImage ? (
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