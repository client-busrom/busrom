"use client"

import * as React from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { cn, resolveInternalLink } from "@/lib/utils"
import type { QuoteData } from "@/lib/content-parser"

/**
 * Quote Section
 *
 * Based on Figma design:
 * - Gradient background (beige to olive)
 * - Center image
 * - Large "BUS ROM" text with arrow in the middle
 * - Two quote texts on left and right
 * - CTA button at bottom right
 */

// Design constants
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 992

interface QuoteProps {
  data: QuoteData
  className?: string
}

export function Quote({ data, className }: QuoteProps) {
  if (!data) return null

  const { image = '', quoteLeft = '', quoteRight = '', ctaText = '', ctaLink = '' } = data

  return (
    <section
      className={cn("relative w-full overflow-hidden", className)}
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #E4DDA3 0%, #756F3F 100%)",
        }}
      />

      {/* Bottom Inner Shadow - 底部内阴影分界线 */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
        style={{
          height: '80px',
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.3) 0%, transparent 100%)',
        }}
      />

      {/* ==================== 1. 桌面端视图 (hidden md:block) ==================== */}
      {/* 100% 完美保留原有绝对定位、vw 计算与动画体系，绝对不影响现有桌面端任何效果！ */}
      <div 
        className="hidden md:block relative w-full"
        style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
      >
        {/* Center Image */}
        {image && (
          <div
            className="absolute overflow-hidden"
            style={{
              left: `${(563 / DESIGN_WIDTH) * 100}%`,
              top: `${(65 / DESIGN_WIDTH) * 100}vw`,
              width: `${(793 / DESIGN_WIDTH) * 100}vw`,
              height: `${(927 / DESIGN_WIDTH) * 100}vw`,
              borderTopLeftRadius: '9999px',
              borderTopRightRadius: '9999px',
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <OptimizedImage
              image={image}
              alt=""
              size="large"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}

        {/* BUS ROM Logo Text - with sway animation pointing towards arrow */}
        <div
          className="absolute animate-logo-sway pointer-events-none"
          style={{
            left: `${(50 / DESIGN_WIDTH) * 100}%`,
            top: `${(400 / DESIGN_WIDTH) * 100}vw`,
            width: `${(1773 / DESIGN_WIDTH) * 100}vw`,
            height: `${(222 / DESIGN_WIDTH) * 100}vw`,
          }}
        >
          <img
            src="/icons/busrom-logo-text.svg"
            alt="BUSROM"
            className="w-full h-full object-contain object-left"
          />
        </div>

        {/* Arrow in the middle of BUS ROM - with pulse animation synced with logo sway */}
        <Link
          href={resolveInternalLink(ctaLink) || "#"}
          className="absolute group animate-arrow-pulse z-20"
          style={{
            left: `${(753 / DESIGN_WIDTH) * 100}%`,
            top: `${(480 / DESIGN_WIDTH) * 100}vw`,
            width: `${(220 / DESIGN_WIDTH) * 100}vw`,
            height: `${(59 / DESIGN_WIDTH) * 100}vw`,
            transformOrigin: 'left center',
          }}
        >
          {/* Default state */}
          <img
            src="/icons/arrow-pill-default.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0"
          />
          {/* Hover state */}
          <img
            src="/icons/arrow-pill-hover.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          />
        </Link>

        {/* Quote Left - white text at bottom left */}
        <div
          className="absolute overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden pointer-events-auto cursor-grab active:cursor-grabbing"
          data-lenis-prevent
          style={{
            left: `${(59 / DESIGN_WIDTH) * 100}%`,
            top: `${(698 / DESIGN_WIDTH) * 100}vw`,
            width: `${(597 / DESIGN_WIDTH) * 100}vw`,
            maxHeight: `${(232 / DESIGN_WIDTH) * 100}vw`, // 4 lines (58vw * 4)
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            overscrollBehavior: 'contain',
          }}
        >
          <p
            className="font-josefin-sans text-white whitespace-pre-line break-words"
            style={{
              fontSize: `${(36 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${(58 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            {quoteLeft || "Choosing Busrom Bathroom Glass Clips To Bring Professional Quality And Aesthetics To Your Project"}
          </p>
        </div>

        {/* Quote Right - dark text at top right */}
        <div
          className="absolute overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden pointer-events-auto cursor-grab active:cursor-grabbing"
          data-lenis-prevent
          style={{
            left: `${(1369 / DESIGN_WIDTH) * 100}%`,
            top: `${(132 / DESIGN_WIDTH) * 100}vw`,
            width: `${(400 / DESIGN_WIDTH) * 100}vw`,
            maxHeight: `${(232 / DESIGN_WIDTH) * 100}vw`, // 4 lines (58vw * 4)
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            overscrollBehavior: 'contain',
          }}
        >
          <p
            className="font-josefin-sans whitespace-pre-line break-words"
            style={{
              fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${(58 / DESIGN_WIDTH) * 100}vw`,
              color: "#46400F",
            }}
          >
            {quoteRight || "Making Every Piece Of Glass Safe, Secure And Premium"}
          </p>
        </div>

        {/* CTA Button - 纯净悬停反色 (Hover Inversion) */}
        <Link
          href={resolveInternalLink(ctaLink) || "#"}
          className="absolute flex items-center group cursor-pointer transition-colors duration-300 bg-[#FEF07D] hover:bg-[#564E16] z-20"
          style={{
            right: `${(318 / DESIGN_WIDTH) * 100}%`,
            top: `${(796 / DESIGN_WIDTH) * 100}vw`,
            width: "max-content",
            height: `${(99 / DESIGN_WIDTH) * 100}vw`,
            borderRadius: `${(49.5 / DESIGN_WIDTH) * 100}vw`,
            paddingLeft: `${(41 / DESIGN_WIDTH) * 100}vw`,
            paddingRight: `${(9 / DESIGN_WIDTH) * 100}vw`,
            gap: `${(20 / DESIGN_WIDTH) * 100}vw`,
            // 保留 GPU 抗锯齿平滑边缘
            transform: "translateZ(0)",
            willChange: "transform",
            boxShadow: "0 0 1px transparent",
          }}
        >
          <span
            className="font-anaheim font-semibold text-black transition-colors duration-300 group-hover:text-white"
            style={{
              fontSize: `${(32 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${(49 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            {ctaText || "Get professional quote"}
          </span>

          {/* 右侧圆形图标容器 - 默认深绿底+黄箭头，悬停黄底+深绿箭头 */}
          <div
            className="rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 bg-[#564E16] group-hover:bg-[#FEF07D]"
            style={{
              width: `${(81 / DESIGN_WIDTH) * 100}vw`,
              height: `${(81 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            <svg
              style={{
                width: `${(32 / DESIGN_WIDTH) * 100}vw`,
                height: `${(32 / DESIGN_WIDTH) * 100}vw`,
              }}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-[#FEF07D] transition-colors duration-300 group-hover:stroke-[#564E16]"
              />
            </svg>
          </div>
        </Link>
      </div>

      {/* ==================== 2. 移动端视图 (md:hidden) ==================== */}
      {/* 专为移动端打造的自适应流式排版，完美解决小屏文字重叠与容器溢出问题 */}
      <div className="md:hidden relative w-full flex flex-col items-center px-6 pt-12 pb-20 z-20">
        {/* 1. 顶部引言 (Quote Right) */}
        <p className="font-josefin-sans text-[#46400F] text-xl font-bold text-center leading-snug mb-8 max-w-[90%] whitespace-pre-line break-words">
          {quoteRight || "Making Every Piece Of Glass Safe, Secure And Premium"}
        </p>

        {/* 2. 核心视觉展示区：拱形图 + BUS ROM 标识与脉冲箭头 */}
        <div className="relative w-full max-w-[320px] mb-10 flex flex-col items-center">
          {image && (
            <div className="w-[85%] aspect-[4/5] rounded-t-full overflow-hidden shadow-2xl relative border border-white/10">
              <OptimizedImage
                image={image}
                alt=""
                size="large"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          {/* 横跨在图片中央的 BUS ROM 文字标识 */}
          <div className="absolute top-1/2 -translate-y-1/2 w-[110%] pointer-events-none animate-logo-sway">
            <img
              src="/icons/busrom-logo-text.svg"
              alt="BUSROM"
              className="w-full h-auto object-contain"
            />
          </div>

          {/* 脉冲箭头按钮 - 精确放置在标识下方/中央位置，方便点击 */}
          <Link
            href={resolveInternalLink(ctaLink) || "#"}
            className="absolute top-[60%] group animate-arrow-pulse w-36 h-10 z-20"
          >
            <img
              src="/icons/arrow-pill-default.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0"
            />
            <img
              src="/icons/arrow-pill-hover.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            />
          </Link>
        </div>

        {/* 3. 底部引言正文 (Quote Left) */}
        <p className="font-josefin-sans text-white text-base leading-relaxed text-center mb-10 max-w-[95%] opacity-95 whitespace-pre-line break-words">
          {quoteLeft || "Choosing Busrom Bathroom Glass Clips To Bring Professional Quality And Aesthetics To Your Project"}
        </p>

        {/* 4. 底部 CTA 按钮 - 移动端专属饱满触控尺寸，继承纯净悬停反色 */}
        <Link
          href={resolveInternalLink(ctaLink) || "#"}
          className="w-max max-w-full h-16 flex items-center group cursor-pointer transition-colors duration-300 bg-[#FEF07D] hover:bg-[#564E16] rounded-full pl-8 pr-2 gap-4 shadow-xl active:scale-95 z-20"
          style={{
            transform: "translateZ(0)",
            willChange: "transform",
            boxShadow: "0 0 1px transparent",
          }}
        >
          <span className="font-anaheim font-semibold text-black text-lg transition-colors duration-300 group-hover:text-white">
            {ctaText || "Get professional quote"}
          </span>

          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 bg-[#564E16] group-hover:bg-[#FEF07D]">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-[#FEF07D] transition-colors duration-300 group-hover:stroke-[#564E16]"
              />
            </svg>
          </div>
        </Link>
      </div>
    </section>
  )
}

export default Quote
