"use client"

import React, { useState, useCallback } from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
import { MediaObject as BaseMediaObject } from "@/lib/lexical-utils"
import { HollowText } from "@/components/common/HollowText"

// 移除 CONTENT_SCALE，直接使用实际 x0.8 后的数值

interface MediaObject extends BaseMediaObject {
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

export interface KeyValuesCooperationItem {
  id: string | number
  title: string
  link?: string
  images: (MediaObject | null)[] // 每个item有2张图片
  points: string[] // 3个要点
}

interface KeyValuesCooperationSectionProps {
  label?: string
  items?: KeyValuesCooperationItem[]
}

export function KeyValuesCooperationSection({
  label = "Value",
  items = [],
}: KeyValuesCooperationSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // vw 尺寸计算
  const vw = (px: number) => `calc(${px} * min(100vw, 1920px) / 1920)`

  // 当前显示的item
  const currentItem = items[activeIndex] || null

  // 左箭头点击
  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
  }, [items.length])

  // 右箭头点击
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
  }, [items.length])

  // 移除缩放相关的派生变量

  return (
    <>
      {/* 桌面端版本 - 保持原有复杂的绝对定位和 vw 缩放逻辑 */}
      <section
        className="hidden md:block relative w-full overflow-hidden"
        style={{
          height: vw(736), // 920 * 0.8
          marginTop: vw(96), // 120 * 0.8
        }}
      >
        {/* 核心容器：在宽屏下通过 mx-auto 居中 */}
        <div 
          className="relative h-full mx-auto"
          style={{ width: vw(1920) }}
        >
          {/* 背景大号描边 "Value" 文字 - 使用 HollowText 实现透明镂空效果 */}
          <HollowText
            strokeColor="rgba(70, 64, 16, 0.3)"
            strokeWidth={1}
            className="absolute font-josefin-sans font-bold pointer-events-none w-full text-center flex justify-center"
            style={{
              top: vw(80), // 100 * 0.8
              fontSize: vw(432), // 540 * 0.8
              lineHeight: vw(407.2), // 509 * 0.8
              letterSpacing: vw(32), // 40 * 0.8
            }}
          >
            {label.split("").map((char, index) => (
              <span
                key={index}
                className="inline-block animate-char-bounce"
                style={{
                  animationDelay: `${index * 0.15}s`,
                }}
              >
                {char}
              </span>
            ))}
          </HollowText>

      {/* 上方韦恩图区域 */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: vw(0),
          width: vw(938.4),
          height: vw(441.6),
        }}
      >
        {/* 左边橄榄色月牙形 - 固定装饰，稍微加宽以消除缝隙 */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: 0,
            width: vw(336), // 420 * 0.8
            height: vw(441.6), // 552 * 0.8
          }}
        >
          <img
            src="/contact-support/key-values-left-crescent.svg"
            alt=""
            className="object-contain"
          />
        </div>

        {/* 中间月牙形 - 用clipPath裁剪第一张图片 */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: vw(249.6), // 312 * 0.8
            top: 0,
            width: vw(332.8), // 416 * 0.8
            height: vw(441.6), // 552 * 0.8
          }}
        >
          {/* SVG clipPath 定义 */}
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              <clipPath id="middle-crescent-clip" clipPathUnits="objectBoundingBox">
                <path
                  transform="scale(0.002404, 0.001812)"
                  d="M276 0C327.086 0 374.929 13.8798 415.967 38.0732C342.393 89.893 294 177.789 294 277.5C294 376.161 341.379 463.253 413.651 515.276C373.134 538.635 326.128 552 276 552C123.569 552 0 428.431 0 276C0 123.569 123.569 0 276 0Z"
                />
              </clipPath>
            </defs>
          </svg>
          {/* 图片 - 黑色背景 + 85%透明度图片 */}
          {items.map((item, idx) => (
            <div
              key={`img0-${idx}`}
              className={`w-full h-full animate-fade-in group/img1 cursor-pointer bg-black ${idx === activeIndex ? "block" : "hidden"}`}
              style={{
                clipPath: "url(#middle-crescent-clip)",
              }}
            >
              <div className="w-full h-full opacity-85">
                {item.images[0]?.enableLink && item.images[0]?.linkUrl ? (
                  <Link href={item.images[0].linkUrl} target={item.images[0].openInNewTab ? "_blank" : undefined} rel={item.images[0].openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                    <OptimizedImage
                      image={item.images[0] as any}
                      alt={item.title}
                      size="medium"
                      priority={true}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/img1:scale-110"
                      objectPosition={
                        item.images[0]?.cropFocalPoint
                          ? `${item.images[0].cropFocalPoint.x}% ${item.images[0].cropFocalPoint.y}%`
                          : "center"
                      }
                    />
                  </Link>
                ) : (
                  <OptimizedImage
                    image={item.images[0] as any}
                    alt={item.title}
                    size="medium"
                    priority={true}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/img1:scale-110"
                    objectPosition={
                      item.images[0]?.cropFocalPoint
                        ? `${item.images[0].cropFocalPoint.x}% ${item.images[0].cropFocalPoint.y}%`
                        : "center"
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 右边圆形 - 用clipPath裁剪第二张图片 */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: vw(496.8), // 621 * 0.8
            top: 0,
            width: vw(441.6), // 552 * 0.8
            height: vw(441.6), // 552 * 0.8
          }}
        >
          {/* SVG clipPath 定义 */}
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              <clipPath id="right-circle-clip" clipPathUnits="objectBoundingBox">
                <circle cx="0.5" cy="0.5" r="0.5" />
              </clipPath>
            </defs>
          </svg>
          {/* 图片 - 黑色背景 + 85%透明度图片 */}
          {items.map((item, idx) => (
            <div
              key={`img1-${idx}`}
              className={`w-full h-full animate-fade-in group/img2 cursor-pointer bg-black ${idx === activeIndex ? "block" : "hidden"}`}
              style={{
                clipPath: "url(#right-circle-clip)",
              }}
            >
              <div className="w-full h-full opacity-85">
                {item.images[1]?.enableLink && item.images[1]?.linkUrl ? (
                  <Link href={item.images[1].linkUrl} target={item.images[1].openInNewTab ? "_blank" : undefined} rel={item.images[1].openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                    <OptimizedImage
                      image={item.images[1] as any}
                      alt={item.title}
                      size="medium"
                      priority={true}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/img2:scale-110"
                      objectPosition={
                        item.images[1]?.cropFocalPoint
                          ? `${item.images[1].cropFocalPoint.x}% ${item.images[1].cropFocalPoint.y}%`
                          : "center"
                      }
                    />
                  </Link>
                ) : (
                  <OptimizedImage
                    image={item.images[1] as any}
                    alt={item.title}
                    size="medium"
                    priority={true}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/img2:scale-110"
                    objectPosition={
                      item.images[1]?.cropFocalPoint
                        ? `${item.images[1].cropFocalPoint.x}% ${item.images[1].cropFocalPoint.y}%`
                        : "center"
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 中间 "Value" 标签 - 字符跳动效果 */}
        <div
          className="absolute font-josefin-sans font-bold text-white text-center flex justify-center"
          style={{
            left: vw(316.8), // 396 * 0.8
            top: vw(181.6), // 227 * 0.8
            width: vw(317.6), // 397 * 0.8
            fontSize: vw(120), // 150 * 0.8
            lineHeight: vw(107.2), // 134 * 0.8
          }}
        >
          {label.split("").map((char, index) => (
            <span
              key={index}
              className="inline-block animate-char-bounce"
              style={{
                animationDelay: `${index * 0.15}s`,
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* 标题 + 箭头链接 */}
        {items.map((item, idx) => (
          <div
            key={`title-${idx}`}
            className={`absolute animate-fade-in group/title ${idx === activeIndex ? "block" : "hidden"}`}
            style={{
              left: vw(30.4),
              top: vw(200),
            }}
          >
            {/* 箭头装饰 - 可点击跳转 */}
            <Link
              href={item.link || "#"}
              className="absolute arrow-link"
              style={{
                left: vw(24),
                top: vw(-61.6),
                width: vw(28),
                height: vw(25.6),
              }}
            >
              <img
                src="/contact-support/key-values-arrow.svg"
                alt=""
                className="object-contain"
              />
            </Link>
            {/* 标题文字 */}
            <Link
              href={item.link || "#"}
              className="font-josefin-sans font-bold text-white block transition-all duration-300 group-hover/title:text-brand-yellow-bright"
              style={{
                width: vw(179.2),
                fontSize: vw(25.6),
                lineHeight: vw(35.2),
              }}
            >
              {item.title}
            </Link>
          </div>
        ))}
      </div>

      {/* 左箭头 */}
      <button
        onClick={handlePrev}
        className="absolute left-1/2 cursor-pointer group z-10"
        style={{
          top: vw(220.8), // 韦恩图的中心线
          transform: `translate(calc(-50% - ${vw(716.8)}), -50%)`,
          width: vw(66.4),
          height: vw(65.6),
        }}
      >
        {/* 默认状态 - 空心圆 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="40" ry="40" stroke="#464010" strokeWidth="2" fill="none" />
          <path
            d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z"
            fill="#464010"
          />
        </svg>
        {/* 悬停状态 - 实心圆 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="41.5" ry="41" fill="#756F3F" />
          <path
            d="M50.9281 27.5226L48.6081 25.1592L32.4131 41.057L48.608 56.9547L50.9281 54.5914L37.3117 41.057L50.9281 27.5226Z"
            fill="white"
          />
        </svg>
      </button>

      {/* 右箭头 */}
      <button
        onClick={handleNext}
        className="absolute left-1/2 cursor-pointer group z-10"
        style={{
          top: vw(220.8), // 韦恩图的中心线
          transform: `translate(calc(-50% + ${vw(716.8)}), -50%)`,
          width: vw(66.4),
          height: vw(65.6),
        }}
      >
        {/* 默认状态 - 空心圆 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="40" ry="40" stroke="#464010" strokeWidth="2" fill="none" />
          <path
            d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z"
            fill="#464010"
          />
        </svg>
        {/* 悬停状态 - 实心圆 */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          viewBox="0 0 83 82"
          fill="none"
        >
          <ellipse cx="41.5" cy="41" rx="41.5" ry="41" fill="#756F3F" />
          <path
            d="M32.0719 27.5226L34.3919 25.1592L50.5869 41.057L34.392 56.9547L32.0719 54.5914L45.6883 41.057L32.0719 27.5226Z"
            fill="white"
          />
        </svg>
      </button>

      {/* 下方三个要点卡片 - 改为 Flex 布局并支持高度自撑 */}
      {currentItem && (
        <div
          key={`cards-${activeIndex}`}
          className="absolute flex justify-center animate-fade-in w-full"
          style={{
            top: vw(506.4), // 633 * 0.8
            gap: vw(32.8), // 41 * 0.8
            paddingLeft: vw(122.4), // 153 * 0.8
            paddingRight: vw(122.4), // 153 * 0.8
          }}
        >
          {currentItem.points.map((point, index) => (
            <div
              key={index}
              className="flex flex-col bg-brand-cream-light border border-brand-cream-border"
              style={{
                flex: 1,
                minHeight: vw(148), // 185 * 0.8
                borderRadius: vw(24), // 30 * 0.8
                padding: `${vw(32)} ${vw(32)}`, // 40 * 0.8
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* 顶部橄榄色小条 */}
              <div
                className="bg-brand-secondary shrink-0"
                style={{
                  width: vw(39.2), // 49 * 0.8
                  height: vw(6.4), // 8 * 0.8
                  borderRadius: vw(15.2), // 19 * 0.8
                  marginBottom: vw(12), // 15 * 0.8
                }}
              />
              {/* 要点文字 */}
              <p
                className="font-acme font-semibold text-left text-brand-orange"
                style={{
                  fontSize: vw(25.6), // 32 * 0.8
                  lineHeight: vw(35.2), // 44 * 0.8
                  width: "100%",
                }}
              >
                {point}
              </p>
            </div>
          ))}
        </div>
      )}
        </div>
      </section>

      {/* 移动端版本 - 流式响应式布局 */}
      <section className="block md:hidden relative w-full pt-4 pb-10 px-4 overflow-hidden">
        {/* 背景装饰文字 "Value" */}
        <div className="text-center mb-4 overflow-hidden">
          <h2 className="font-josefin-sans font-bold text-brand-cream-border/30 text-4xl leading-none uppercase tracking-tighter whitespace-nowrap">
            {label}
          </h2>
        </div>

        {/* 核心内容区 - 轮播切换 */}
        <div className="relative flex flex-col items-center">
          {/* 简化版韦恩图视觉 - 两个重叠的圆形 */}
          <div className="relative w-full aspect-[4/3] max-w-[260px] mb-6">
            {items.map((item, idx) => (
              <React.Fragment key={`mobile-circles-${idx}`}>
                {/* 左侧圆形图片 */}
                <div 
                  className={`absolute left-0 top-0 w-[140px] h-[140px] rounded-full overflow-hidden border-4 border-white shadow-xl z-10 transition-opacity duration-300 ${idx === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  {item.images[0] && (
                    <OptimizedImage
                      image={item.images[0] as any}
                      alt={item.title}
                      size="medium"
                      priority={true}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {/* 右侧圆形图片 */}
                <div 
                  className={`absolute right-0 bottom-0 w-[140px] h-[140px] rounded-full overflow-hidden border-4 border-white shadow-xl z-20 transition-opacity duration-300 ${idx === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  {item.images[1] && (
                    <OptimizedImage
                      image={item.images[1] as any}
                      alt={item.title}
                      size="medium"
                      priority={true}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </React.Fragment>
            ))}
            {/* 中间文字标识 */}
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <span className="font-josefin-sans font-bold text-brand-secondary/40 text-4xl opacity-50">
                {label}
              </span>
            </div>
          </div>

          {/* 标题与导航控制 */}
          <div className="w-full flex items-center justify-between mb-6 px-1 gap-2">
            <button
              onClick={handlePrev}
              className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full border border-brand-secondary/50 text-brand-secondary active:bg-brand-secondary/10"
            >
              <svg className="w-7 h-7 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            
            <div className="flex-1 relative h-16 overflow-hidden">
              {items.map((item, idx) => (
                <Link 
                  key={`mobile-title-${idx}`}
                  href={item.link || "#"}
                  className={`absolute inset-0 cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 ${idx === activeIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
                >
                  <h3 className="font-josefin-sans font-bold text-brand-secondary text-xl text-center leading-tight underline underline-offset-4 decoration-brand-secondary/30">
                    {item.title}
                  </h3>
                  <svg 
                    className="w-4 h-4 text-brand-secondary" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full border border-brand-secondary/50 text-brand-secondary active:bg-brand-secondary/10"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* 三个要点 - 垂直堆叠卡片 */}
          <div className="w-full relative min-h-[300px]">
            {items.map((item, idx) => (
              <div 
                key={`mobile-points-${idx}`}
                className={`absolute inset-0 flex flex-col gap-3 transition-opacity duration-300 ${idx === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                {item.points.map((point, pIdx) => (
                  <div
                    key={pIdx}
                    className="w-full p-4 bg-brand-cream-light border border-brand-cream-border rounded-[20px] flex flex-col gap-2 shadow-sm"
                  >
                    <div className="w-8 h-1 bg-brand-secondary rounded-full" />
                    <p className="font-acme font-semibold text-brand-orange text-base leading-snug">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
