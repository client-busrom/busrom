"use client"

import React, { useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import Link from "next/link"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 1000

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
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

interface ProjectCommunicationGuideSectionProps {
  title?: string
  subtitle?: string
  description?: string
  image?: MediaObject | null
  locale?: string
}

// 解析文本，提取加粗部分和换行
// 假设后端返回的格式中，加粗文字用 **text** 或 <strong>text</strong> 包裹
// 换行符 \n 会被保留并在渲染时转换为 <br />
interface TextPart {
  text: string
  isBold: boolean
  isLineBreak?: boolean
}

function parseTextWithBold(text: string): TextPart[] {
  const parts: TextPart[] = []

  // 辅助函数：处理文本段落（可能包含换行符）
  const addTextSegments = (content: string, isBold: boolean) => {
    const segments = content.split('\n')
    segments.forEach((seg, i) => {
      if (seg) {
        parts.push({ text: seg, isBold })
      }
      // 在非最后一个段落后添加换行标记
      if (i < segments.length - 1) {
        parts.push({ text: '', isBold: false, isLineBreak: true })
      }
    })
  }

  // 匹配 **text** 或 <strong>text</strong> 格式（支持换行符）
  const regex = /\*\*([\s\S]+?)\*\*|<strong>([\s\S]+?)<\/strong>/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // 添加匹配前的普通文本（可能包含换行）
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index)
      addTextSegments(beforeText, false)
    }
    // 添加加粗文本（也可能包含换行）
    const boldContent = match[1] || match[2]
    addTextSegments(boldContent, true)
    lastIndex = regex.lastIndex
  }

  // 添加剩余的普通文本（可能包含换行）
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    addTextSegments(remainingText, false)
  }

  return parts.length > 0 ? parts : [{ text, isBold: false }]
}

export function ProjectCommunicationGuideSection({
  title = "Start Your Partnership With",
  subtitle = "",
  description = " he ",
  image,
  locale = "en",
}: ProjectCommunicationGuideSectionProps) {
  // vw 尺寸计算 - 采用全局统一的 1920px 封顶算法
  const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`

  // 对于非英语（如西班牙语等），忽略原有的手动换行（\n 替换为空格），让浏览器自动流式换行
  const finalSubtitle = locale !== "en" ? subtitle.replace(/\n/g, " ") : subtitle
  const finalDescription = locale !== "en" ? description.replace(/\n/g, " ") : description

  // 解析 subtitle 文本（加粗部分显示橙色）
  const subtitleParts = useMemo(() => parseTextWithBold(finalSubtitle), [finalSubtitle])

  // 解析右侧描述文本（加粗部分显示黄色边框装饰）
  const descriptionParts = useMemo(() => parseTextWithBold(finalDescription), [finalDescription])

  return (
    <>
      {/* 桌面端版本 - 保持原有绝对定位逻辑 */}
      <section
        className="hidden md:block relative w-full overflow-hidden"
        style={{
          height: vw(SECTION_HEIGHT),
          willChange: "transform",
        }}
      >
        {/* 左侧 Title + Subtitle 流式布局区域 */}
        <div
          className="absolute flex flex-col"
          style={{
            left: vw(159),
            top: vw(220),
          }}
        >
          <h2
            className="font-josefin-sans font-bold text-black"
            style={{
              fontSize: vw(82),
            }}
          >
            {title.split('\n').map((line, i, arr) => {
              const isLast = i === arr.length - 1
              if (isLast) {
                return (
                  <div
                    key={i}
                    className="flex items-end"
                    style={{
                      height: vw(120),
                      marginTop: 0,
                    }}
                  >
                    <span style={{ lineHeight: 1 }}>{line}</span>
                    {/* Busrom Logo - 紧跟文字，底部对齐 */}
                    <div
                      className="relative"
                      style={{
                        width: vw(390),
                        height: vw(115),
                        marginLeft: vw(30),
                      }}
                    >
                      <img
                        src="/contact-support/busrom-logo.svg"
                        alt="Busrom"
                        className="object-contain object-bottom object-left w-full h-full"
                      />
                    </div>
                  </div>
                )
              }
              return (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    lineHeight: vw(95),
                  }}
                >
                  {line}
                </span>
              )
            })}
          </h2>

          {/* 间隔区域 */}
          <div style={{ height: vw(116) }} />

          {/* 左下 Subtitle - 现在是流式布局 */}
          <p
            className="font-josefin-sans font-semibold text-black"
            style={{
              marginLeft: vw(12),
              width: vw(680),
              fontSize: vw(36),
              lineHeight: vw(48),
            }}
          >
            {subtitleParts.map((part, index) => {
              if (part.isLineBreak) {
                return <br key={index} />
              }

              return (
                <span
                  key={index}
                  className={part.isBold ? "font-bold text-brand-accent-orange" : ""}
                >
                  {part.text}
                </span>
              )
            })}
          </p>
        </div>

        {/* 右侧图片区域 - 使用带 viewBox 的 SVG 确保 clipPath 完美缩放 */}
        {image && (
          <svg
            className="absolute overflow-hidden"
            viewBox="0 0 1088 1080"
            preserveAspectRatio="xMidYMid slice"
            style={{
              right: vw(0),
              top: vw(0),
              width: vw(1088),
              height: vw(1080),
            }}
          >
            <defs>
              <clipPath id="image-clip">
                <path d="M454 0C464.502 94.7206 453.461 295.765 319.051 471.838C260.215 548.911 236.855 597.318 233.355 627.838C232.381 636.338 234.355 645.838 241.423 649.611C251.045 654.749 272.221 652.752 304.842 631.961C345.634 605.961 389.697 554.353 415.181 481.456C470.018 324.588 530.832 211.341 604.799 140.49C687.006 61.7462 781.017 39.9102 873.227 59.2998C909.938 67.0195 943.71 85.318 969.892 114.304C995.102 142.215 1008.25 174.386 1014.72 203.326C1027.05 258.488 1018.75 317.214 1005.38 367.137C980.96 458.338 928.374 561.109 859.229 651.528C873.665 644.702 889.521 637.495 906.51 630.438C1017.19 584.467 1171.66 547.001 1370.64 611.61L1296.22 840.831C1167.2 798.941 1073.66 821.975 998.953 853.003C979.26 861.183 960.695 870.022 941.869 879.225C924.382 887.773 903.408 898.291 884.596 906.562C866.095 914.695 840.998 924.682 813.434 929.338C784.319 934.256 744.372 934.56 704.103 913.507C618.509 868.757 585.263 787.105 583.374 715.458C583.083 704.403 582.215 679.183 588 655.941C579.571 669.941 493.916 809.346 436.5 845.941C346.067 903.58 220.969 919.57 110.935 853.549C26.4259 802.843 -5.84353 708.621 0.855469 616.54C7.49248 525.312 50.8247 426.03 127.488 325.604C209.877 217.677 219.834 61.6129 213.003 0H454Z" fill="white" />
              </clipPath>
            </defs>

            <foreignObject x="0" y="0" width="1088" height="1080" clipPath="url(#image-clip)">
              <motion.div
                initial={{ "--reveal-progress": "0%", opacity: 0 } as any}
                whileInView={{ "--reveal-progress": "120%", opacity: 1 } as any}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.8, ease: [0.43, 0.13, 0.23, 0.96] }}
                className="w-full h-full relative"
                style={{
                  WebkitMaskImage: `linear-gradient(110deg, #000 var(--reveal-progress), transparent calc(var(--reveal-progress) + 15%))`,
                  maskImage: `linear-gradient(110deg, #000 var(--reveal-progress), transparent calc(var(--reveal-progress) + 15%))`,
                  willChange: "mask-image, opacity",
                }}
              >
                {image.enableLink && image.linkUrl ? (
                  <Link
                    href={image.linkUrl}
                    target={image.openInNewTab ? "_blank" : undefined}
                    rel={image.openInNewTab ? "noopener noreferrer" : undefined}
                    className="block w-full h-full"
                  >
                    <OptimizedImage
                      image={image as any}
                      alt="Project communication"
                      size="xlarge"
                      className="w-full h-full object-cover"
                    />
                  </Link>
                ) : (
                  <OptimizedImage
                    image={image as any}
                    alt="Project communication"
                    size="xlarge"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* 扫过的光影轨迹 - 持续循环增强质感 */}
                <motion.div
                  initial={{ x: "-150%", skewX: -20 }}
                  animate={{ x: "350%", skewX: -20 }}
                  transition={{
                    duration: 2.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 4
                  }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)",
                    width: "40%",
                    zIndex: 1,
                  }}
                />
              </motion.div>
            </foreignObject>
          </svg>
        )}

        {/* Description Box Area */}
        <div
          className="absolute bg-brand-overlay-olive-60"
          style={{
            left: vw(1020),
            top: vw(600),
            width: vw(597),
            height: vw(321),
            borderRadius: vw(30),
            backdropFilter: `blur(${vw(79)})`,
            WebkitBackdropFilter: `blur(${vw(79)})`,
            willChange: "backdrop-filter, transform",
            boxShadow: `0 4px ${vw(23)} rgba(0, 0, 0, 0.25)`,
          }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            .desc-scroll-area {
              scrollbar-width: thin;
              scrollbar-color: transparent transparent;
              transition: scrollbar-color 0.3s;
            }
            .desc-scroll-area:hover, .desc-scroll-area:active {
              scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
            }
            .desc-scroll-area::-webkit-scrollbar {
              width: 4px;
            }
            .desc-scroll-area::-webkit-scrollbar-track {
              background: transparent;
            }
            .desc-scroll-area::-webkit-scrollbar-thumb {
              background: transparent;
              border-radius: 4px;
            }
            .desc-scroll-area:hover::-webkit-scrollbar-thumb,
            .desc-scroll-area:active::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.3);
            }
          `}} />
          <p
            className="absolute font-josefin-sans font-medium text-white desc-scroll-area"
            data-lenis-prevent="true"
            style={{
              left: vw(24),
              top: vw(35),
              width: vw(557),
              maxHeight: vw(251), // 321 - 35 - 35
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: vw(8), // 防止滚动条挡住文字
              overscrollBehavior: "contain",
              fontSize: vw(26),
            }}
          >
            {descriptionParts.map((part, index) => {
              // 换行标记
              if (part.isLineBreak) {
                return <br key={index} />
              }

              return (
                <span
                  key={index}
                  style={{
                    lineHeight: part.isBold ? vw(51) : vw(38),
                  }}
                >
                  {part.isBold ? (
                    <span
                      className="font-bold bg-brand-yellow-card-bg border border-brand-yellow"
                      style={{
                        fontSize: vw(28),
                        borderRadius: vw(12),
                        padding: `${vw(10)} ${vw(8)} ${vw(2)} ${vw(8)}`,
                        boxDecorationBreak: "clone",
                        WebkitBoxDecorationBreak: "clone",
                      }}
                    >
                      {part.text}
                    </span>
                  ) : (
                    part.text
                  )}
                </span>
              )
            })}
          </p>
        </div>
      </section>

      {/* 移动端版本 - 流式布局 */}
      <section className="block md:hidden relative w-full pt-12 pb-16 px-6 overflow-hidden">
        {/* Title Area */}
        <div className="flex flex-col items-center text-center">
          <h2 className="font-josefin-sans font-bold text-black text-[32px] leading-tight">
            {title.split('\n').join(' ')}
          </h2>
          {/* Logo 居中显示 */}
          <div className="w-[200px] h-auto mb-8">
            <img
              src="/contact-support/busrom-logo.svg"
              alt="Busrom"
              className="w-full h-full object-contain"
            />
          </div>
          {/* Subtitle */}
          <p className="mb-4 font-josefin-sans font-semibold text-black text-[18px] leading-snug px-2">
            {subtitleParts.map((part, index) => {
              if (part.isLineBreak) return <br key={index} />
              return (
                <span
                  key={index}
                  className={part.isBold ? "font-bold text-brand-accent-orange" : ""}
                >
                  {part.text}
                </span>
              )
            })}
          </p>
        </div>

        {/* Image Area - 响应式 SVG 遮罩 */}
        {image && (
          <div className="relative w-full flex justify-center">
            <svg
              className="w-full h-auto max-w-[450px] overflow-hidden"
              viewBox="0 0 1088 1080"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <clipPath id="image-clip-mobile">
                  <path d="M454 0C464.502 94.7206 453.461 295.765 319.051 471.838C260.215 548.911 236.855 597.318 233.355 627.838C232.381 636.338 234.355 645.838 241.423 649.611C251.045 654.749 272.221 652.752 304.842 631.961C345.634 605.961 389.697 554.353 415.181 481.456C470.018 324.588 530.832 211.341 604.799 140.49C687.006 61.7462 781.017 39.9102 873.227 59.2998C909.938 67.0195 943.71 85.318 969.892 114.304C995.102 142.215 1008.25 174.386 1014.72 203.326C1027.05 258.488 1018.75 317.214 1005.38 367.137C980.96 458.338 928.374 561.109 859.229 651.528C873.665 644.702 889.521 637.495 906.51 630.438C1017.19 584.467 1171.66 547.001 1370.64 611.61L1296.22 840.831C1167.2 798.941 1073.66 821.975 998.953 853.003C979.26 861.183 960.695 870.022 941.869 879.225C924.382 887.773 903.408 898.291 884.596 906.562C866.095 914.695 840.998 924.682 813.434 929.338C784.319 934.256 744.372 934.56 704.103 913.507C618.509 868.757 585.263 787.105 583.374 715.458C583.083 704.403 582.215 679.183 588 655.941C579.571 669.941 493.916 809.346 436.5 845.941C346.067 903.58 220.969 919.57 110.935 853.549C26.4259 802.843 -5.84353 708.621 0.855469 616.54C7.49248 525.312 50.8247 426.03 127.488 325.604C209.877 217.677 219.834 61.6129 213.003 0H454Z" fill="white" />
                </clipPath>
              </defs>
              <foreignObject x="0" y="0" width="1088" height="1080" clipPath="url(#image-clip-mobile)">
                <OptimizedImage
                  image={image as any}
                  alt="Project communication"
                  size="xlarge"
                  className="w-full h-full object-cover"
                />
              </foreignObject>
            </svg>
          </div>
        )}

        {/* Description Box Area */}
        <div
          className="relative -mt-24 p-4 bg-brand-overlay-olive-60 overflow-hidden"
          style={{
            borderRadius: "24px",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          }}
        >
          <p className="font-josefin-sans font-medium text-white text-[16px] leading-relaxed">
            {descriptionParts.map((part, index) => {
              if (part.isLineBreak) return " "
              return (
                <span key={index}>
                  {part.isBold ? (
                    <span className="font-bold text-brand-yellow">
                      {part.text}
                    </span>
                  ) : (
                    part.text
                  )}
                </span>
              )
            })}
          </p>
        </div>
      </section>
    </>
  )
}
