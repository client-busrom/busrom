"use client"

import React, { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// 设计稿基准尺寸
const DESIGN_WIDTH = 1920
const SECTION_HEIGHT = 818

// 内容缩放比例
const CONTENT_SCALE = 0.8

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
  const vw = (v: number) => `${(v / DESIGN_WIDTH) * 100}vw`

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

  // 缩放后的板块高度
  const scaledHeight = SECTION_HEIGHT * CONTENT_SCALE

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: vw(scaledHeight),
        marginTop: vw(40),
        marginBottom: vw(40),
      }}
    >
      {/* 内容容器 - 整体缩小到80%并居中 */}
      <div
        className="absolute left-0 w-full"
        style={{
          height: vw(SECTION_HEIGHT),
          top: `calc(50% - ${vw(SECTION_HEIGHT * CONTENT_SCALE / 2)})`,
          transform: `scale(${CONTENT_SCALE})`,
          transformOrigin: "top center",
        }}
      >
      {/* 背景大号描边 "Value" 文字 - 字符跳动效果 */}
      <div
        className="absolute font-josefin-sans font-bold pointer-events-none w-full text-center flex justify-center"
        style={{
          top: vw(100),
          fontSize: vw(540),
          lineHeight: vw(509),
          letterSpacing: vw(40),
          color: "#fffbe4",
          textShadow: `-1px -1px 0 rgba(70, 64, 16, 0.3), 1px -1px 0 rgba(70, 64, 16, 0.3), -1px 1px 0 rgba(70, 64, 16, 0.3), 1px 1px 0 rgba(70, 64, 16, 0.3)`,
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

      {/* 上方韦恩图区域 */}
      <div
        className="absolute"
        style={{
          left: vw(366),
          top: vw(0),
          width: vw(1173),
          height: vw(552),
        }}
      >
        {/* 左边橄榄色月牙形 - 固定装饰，稍微加宽以消除缝隙 */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: 0,
            width: vw(420),  // 从415增加到420，消除与中间图片的缝隙
            height: vw(552),
          }}
        >
          <Image
            src="/contact-support/key-values-left-crescent.svg"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        {/* 中间月牙形 - 用clipPath裁剪第一张图片 */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: vw(312),
            top: 0,
            width: vw(416),
            height: vw(552),
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
          {currentItem?.images[0] && (
            <div
              key={`img0-${activeIndex}`}
              className="w-full h-full animate-fade-in group/img1 cursor-pointer bg-black"
              style={{
                clipPath: "url(#middle-crescent-clip)",
              }}
            >
              <div className="w-full h-full opacity-85">
                <OptimizedImage
                  image={currentItem.images[0] as any}
                  alt={currentItem.title}
                  size="xlarge"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/img1:scale-110"
                  objectPosition={
                    currentItem.images[0]?.cropFocalPoint
                      ? `${currentItem.images[0].cropFocalPoint.x}% ${currentItem.images[0].cropFocalPoint.y}%`
                      : "center"
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* 右边圆形 - 用clipPath裁剪第二张图片 */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: vw(621),
            top: 0,
            width: vw(552),
            height: vw(552),
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
          {currentItem?.images[1] && (
            <div
              key={`img1-${activeIndex}`}
              className="w-full h-full animate-fade-in group/img2 cursor-pointer bg-black"
              style={{
                clipPath: "url(#right-circle-clip)",
              }}
            >
              <div className="w-full h-full opacity-85">
                <OptimizedImage
                  image={currentItem.images[1] as any}
                  alt={currentItem.title}
                  size="xlarge"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/img2:scale-110"
                  objectPosition={
                    currentItem.images[1]?.cropFocalPoint
                      ? `${currentItem.images[1].cropFocalPoint.x}% ${currentItem.images[1].cropFocalPoint.y}%`
                      : "center"
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* 中间 "Value" 标签 - 字符跳动效果 */}
        <div
          className="absolute font-josefin-sans font-bold text-white text-center flex justify-center"
          style={{
            left: vw(396),
            top: vw(227),
            width: vw(397),
            fontSize: vw(150),
            lineHeight: vw(134),
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
        {currentItem && (
          <div
            key={`title-${activeIndex}`}
            className="absolute animate-fade-in group/title"
            style={{
              left: vw(38),
              top: vw(250),
            }}
          >
            {/* 箭头装饰 - 可点击跳转 */}
            <Link
              href={currentItem.link || "#"}
              className="absolute arrow-link"
              style={{
                left: vw(30),
                top: vw(-77),
                width: vw(35),
                height: vw(32),
              }}
            >
              <Image
                src="/contact-support/key-values-arrow.svg"
                alt=""
                fill
                className="object-contain"
              />
            </Link>
            {/* 标题文字 */}
            <Link
              href={currentItem.link || "#"}
              className="font-josefin-sans font-bold text-white block transition-all duration-300 group-hover/title:text-brand-yellow-bright"
              style={{
                width: vw(224),
                fontSize: vw(32),
                lineHeight: vw(44),
              }}
            >
              {currentItem.title}
            </Link>
          </div>
        )}
      </div>

      {/* 左箭头 */}
      <button
        onClick={handlePrev}
        className="absolute cursor-pointer group z-10"
        style={{
          left: vw(151),
          top: vw(235),
          width: vw(83),
          height: vw(82),
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
        className="absolute cursor-pointer group z-10"
        style={{
          left: vw(1624),
          top: vw(235),
          width: vw(83),
          height: vw(82),
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

      {/* 下方三个要点卡片 */}
      {currentItem && (
        <div
          key={`cards-${activeIndex}`}
          className="absolute flex animate-fade-in"
          style={{
            left: vw(153),
            top: vw(633),
            gap: vw(41),
          }}
        >
          {currentItem.points.map((point, index) => (
            <div
              key={index}
              className="relative bg-brand-cream-light border border-brand-cream-border"
              style={{
                width: vw(507),
                height: vw(185),
                borderRadius: vw(30),
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* 顶部橄榄色小条 */}
              <div
                className="absolute bg-brand-secondary"
                style={{
                  left: vw(40),
                  top: vw(40),
                  width: vw(49),
                  height: vw(8),
                  borderRadius: vw(19),
                }}
              />
              {/* 要点文字 */}
              <p
                className="absolute font-montserrat font-semibold text-left text-brand-orange"
                style={{
                  left: vw(40),
                  top: vw(63),
                  width: vw(428),
                  fontSize: vw(32),
                  lineHeight: vw(44),
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
  )
}
