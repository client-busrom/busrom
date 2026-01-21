"use client"

import React, { useMemo } from "react"
import Image from "next/image"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 981

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
}

interface ProjectCommunicationGuideSectionProps {
  title?: string
  subtitle?: string
  description?: string
  image?: MediaObject | null
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

  // 匹配 **text** 或 <strong>text</strong> 格式
  const regex = /\*\*(.+?)\*\*|<strong>(.+?)<\/strong>/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // 添加匹配前的普通文本（可能包含换行）
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index)
      // 按换行符分割
      const segments = beforeText.split('\n')
      segments.forEach((seg, i) => {
        if (seg) {
          parts.push({ text: seg, isBold: false })
        }
        // 在非最后一个段落后添加换行标记
        if (i < segments.length - 1) {
          parts.push({ text: '', isBold: false, isLineBreak: true })
        }
      })
    }
    // 添加加粗文本
    parts.push({ text: match[1] || match[2], isBold: true })
    lastIndex = regex.lastIndex
  }

  // 添加剩余的普通文本（可能包含换行）
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    const segments = remainingText.split('\n')
    segments.forEach((seg, i) => {
      if (seg) {
        parts.push({ text: seg, isBold: false })
      }
      // 在非最后一个段落后添加换行标记
      if (i < segments.length - 1) {
        parts.push({ text: '', isBold: false, isLineBreak: true })
      }
    })
  }

  return parts.length > 0 ? parts : [{ text, isBold: false }]
}

export function ProjectCommunicationGuideSection({
  title = "Start Your Partnership With",
  subtitle = "From **Sample Testing** To **Mass Production**, We Provide One-Stop Support For Your Project.",
  description = "Busrom Provides **Global Distributors** , **Channel Partners** , And **Engineering Projects** With Stable Supply, Customized Production, Technical Solutions, And Stringent Quality Control To Help You Efficiently Advance Project Implementation.",
  image,
}: ProjectCommunicationGuideSectionProps) {
  // vw 尺寸计算
  const vw = (v: number) => `${(v / DESIGN_WIDTH) * 100}vw`

  // 解析 subtitle 文本（加粗部分显示橙色）
  const subtitleParts = useMemo(() => parseTextWithBold(subtitle), [subtitle])

  // 解析右侧描述文本（加粗部分显示黄色边框装饰）
  const descriptionParts = useMemo(() => parseTextWithBold(description), [description])

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: `${DESIGN_WIDTH} / ${SECTION_HEIGHT}`,
      }}
    >
      {/* 左上 Title + Busrom Logo */}
      <div
        className="absolute"
        style={{
          left: vw(159),
          top: vw(121),
        }}
      >
        {/* Title 文字 */}
        <h2
          className="font-josefin-sans font-bold text-black"
          style={{
            fontSize: vw(82),
          }}
        >
          {title.split('\n').map((line, i, arr) => (
            <span
              key={i}
              style={{
                display: 'block',
                lineHeight: i === arr.length - 1 ? vw(160) : vw(90),
              }}
            >
              {/* 最后一行（With）和 Busrom Logo 同一行，基线对齐 */}
              {i === arr.length - 1 ? (
                <>
                  <span>{line}</span>
                  {/* Busrom Logo */}
                  <span
                    className="relative inline-block"
                    style={{
                      width: vw(450),
                      height: vw(112),
                      marginLeft: vw(15),
                      marginBottom: vw(-10),
                      verticalAlign: 'baseline',
                    }}
                  >
                    <Image
                      src="/contact-support/busrom-logo.svg"
                      alt="Busrom"
                      fill
                      className="object-contain object-bottom object-left"
                    />
                  </span>
                </>
              ) : (
                line
              )}
            </span>
          ))}
        </h2>
      </div>

      {/* 左下 Subtitle */}
      <p
        className="absolute font-josefin-sans font-semibold text-black"
        style={{
          left: vw(171),
          top: vw(585),
          width: vw(400),
          fontSize: vw(32),
          lineHeight: vw(42),
        }}
      >
        {subtitleParts.map((part, index) => {
          // 换行标记
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

      {/* 右侧图片区域 - 使用 SVG mask 实现沿轨迹擦出效果 */}
      {image && (
        <div
          className="absolute overflow-hidden"
          style={{
            right: vw(0),
            top: vw(-50),
            width: vw(1045),
            height: vw(959),
          }}
        >
          {/* SVG clipPath 定义 */}
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <clipPath id="image-clip" clipPathUnits="objectBoundingBox">
                <path
                  transform="scale(0.000957, 0.001043)"
                  d="M452.535 0C463.037 94.7206 453.461 322.323 319.051 498.396C260.215 575.47 236.855 623.877 233.355 654.396C232.381 662.896 234.355 672.396 241.423 676.17C251.045 681.308 272.221 679.311 304.842 658.52C345.634 632.52 389.697 580.912 415.181 508.015C470.018 351.147 530.832 237.899 604.799 167.049C687.006 88.3047 781.017 66.4688 873.227 85.8584C909.938 93.5781 943.71 111.877 969.892 140.862C995.102 168.773 1008.25 200.944 1014.72 229.885C1027.05 285.046 1018.76 343.772 1005.38 393.695C980.96 484.896 928.374 587.668 859.229 678.087C873.665 671.261 889.521 664.053 906.51 656.997C1017.19 611.026 1171.66 573.559 1370.64 638.169L1296.22 867.39C1167.2 825.499 1073.66 848.533 998.953 879.562C979.26 887.741 960.695 896.581 941.869 905.783C924.382 914.332 903.408 924.849 884.596 933.12C866.095 941.254 840.998 951.24 813.434 955.896C784.319 960.815 744.372 961.119 704.103 940.065C618.509 895.316 585.263 813.664 583.374 742.017C583.073 730.596 583.524 719.148 584.684 707.769C544.109 771.772 492.414 824.756 434.374 861.749C343.941 919.388 220.969 946.128 110.935 880.107C26.4259 829.402 -5.84353 735.18 0.855469 643.099C7.49248 551.871 50.8247 452.589 127.488 352.162C209.877 244.236 219.834 88.1715 213.003 26.5586L452.535 0Z"
                />
              </clipPath>
            </defs>
          </svg>
          {/* 图片容器 */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              clipPath: "url(#image-clip)",
            }}
          >
            <OptimizedImage
              image={image as any}
              alt="Project communication"
              size="xlarge"
              className="w-full h-full object-cover"
              objectPosition={
                image.cropFocalPoint
                  ? `${image.cropFocalPoint.x}% ${image.cropFocalPoint.y}%`
                  : "center"
              }
            />
          </div>
        </div>
      )}

      {/* 右侧卡片 */}
      <div
        className="absolute bg-brand-overlay-olive-60"
        style={{
          left: vw(1087),
          top: vw(566),
          width: vw(597),
          height: vw(321),
          borderRadius: vw(30),
          backdropFilter: `blur(${vw(79)})`,
          boxShadow: `0 4px ${vw(23)} rgba(0, 0, 0, 0.25)`,
        }}
      >
        {/* 卡片内文字 */}
        <p
          className="absolute font-josefin-sans font-medium text-white"
          style={{
            left: vw(24),
            top: vw(35),
            width: vw(557),
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
  )
}
