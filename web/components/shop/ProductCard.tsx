"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Link } from "@/lib/navigation"
import { cn, getLocalizedName } from "@/lib/utils"
import { useTranslations } from "@/lib/translations"
import type { Product } from "@/lib/types/product"

// Helper to extract URL from variant (can be string or object with url)
function getVariantUrl(variant: string | { url?: string } | undefined): string | undefined {
  if (!variant) return undefined
  if (typeof variant === 'string') return variant
  return variant.url
}

// Helper to extract plain text from rich text (Document JSON) or string
function extractPlainText(content: any): string | null {
  if (!content) return null
  if (typeof content === 'string') return content

  // Handle Lexical/Payload rich text format
  if (content.root?.children) {
    const extractText = (nodes: any[]): string => {
      return nodes.map(node => {
        if (node.text) return node.text
        if (node.children) return extractText(node.children)
        return ''
      }).join(' ').trim()
    }
    const text = extractText(content.root.children)
    return text || null
  }

  return null
}

interface ProductCardProps {
  product: Product & { localizedName?: string }
  locale: string
  // 优先加载 - 首屏图片设置为 true
  priority?: boolean
  // 索引 - 用于计算是否需要优先加载
  index?: number
}

export function ProductCard({ product, locale, priority, index = 0 }: ProductCardProps) {
  // 前8个产品优先加载 (首屏2行 * 4列)
  const shouldPrioritize = priority ?? index < 8
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [hoveredButton, setHoveredButton] = useState<"details" | "inquiry" | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 从 messages 文件获取翻译
  const t = useTranslations(locale, "shop")

  // Get display name
  const displayName =
    product.localizedName || product.name?.[locale] || product.name?.["en"] || product.sku

  // Get short description (API returns localized string directly)
  const shortDescription = typeof product.shortDescription === 'string'
    ? product.shortDescription
    : extractPlainText(product.shortDescription?.[locale] || product.shortDescription?.["en"])

  // Primary display: showImage
  const showImage = product.showImage

  // Additional images from mainImage array (for carousel on hover)
  const mainImages = product.mainImage || []

  // Handle hover image cycling
  const handleMouseEnter = () => {
    setIsHovering(true)
    if (mainImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % mainImages.length)
      }, 1500)
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setCurrentImageIndex(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Determine which image to display
  const displayImage = isHovering && mainImages.length > 0
    ? mainImages[currentImageIndex]
    : showImage

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden",
        "transition-all duration-300"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Container - Square Aspect Ratio */}
      <div 
        className="relative w-[250px] h-[250px] bg-white overflow-hidden mb-3 block cursor-pointer group/image"
      >
        <Link
          href={`/shop/${product.slug}`}
          className="absolute inset-0 z-10"
          target="_blank"
          rel="noopener noreferrer"
        />
        {displayImage ? (
          <Image
            src={getVariantUrl(displayImage.variants?.tablet) || getVariantUrl(displayImage.variants?.card) || getVariantUrl(displayImage.variants?.medium) || getVariantUrl(displayImage.variants?.large) || getVariantUrl(displayImage.variants?.thumbnail) || displayImage.url}
            alt={displayImage.altText || displayName}
            fill
            sizes="250px"
            className={cn(
              "transition-transform duration-500 group-hover/image:scale-105",
              // 初始白底图用 contain 完整展示，悬停轮播图用 cover 填满
              isHovering && mainImages.length > 0 ? "object-cover" : "object-contain"
            )}
            unoptimized
            priority={shouldPrioritize}
            loading={shouldPrioritize ? "eager" : "lazy"}
            fetchPriority={shouldPrioritize ? "high" : "auto"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white text-gray-400">
            No Image
          </div>
        )}

        {/* Status badges (Hot / New / Featured) */}
        <div className="absolute top-0 right-0 flex flex-col items-end z-20">
          {product.isHot && (
            <div className="bg-[#E63946] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-tighter mb-px">
              HOT
            </div>
          )}
          {product.isNew && (
            <div className="bg-[#B5964B] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-tighter mb-px">
              NEW
            </div>
          )}
          {product.isFeatured && (
            <div className="bg-brand-secondary text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-tighter">
              Featured
            </div>
          )}
        </div>

        {/* Overlay with Two Buttons - Always visible on mobile, hover on desktop */}
        <div
          className={cn(
            "absolute inset-0 flex items-end justify-center transition-all duration-300 z-20",
            // Mobile: always show light overlay
            "bg-black/10",
            // Desktop: darker overlay on hover
            "lg:bg-black/0",
            isHovering && "lg:bg-black/20"
          )}
        >
          <div className={cn(
            "flex gap-2 mb-3 transition-all duration-300 transform",
            // Mobile: always visible
            "opacity-100 translate-y-0",
            // Desktop: hidden by default, show on hover
            "lg:opacity-0 lg:translate-y-4",
            isHovering && "lg:opacity-100 lg:translate-y-0"
          )}>
            {/* View Details Button */}
            <Link
              href={`/shop/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredButton("details")}
              onMouseLeave={() => setHoveredButton(null)}
              className={cn(
                "px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 border",
                hoveredButton === "details"
                  ? "bg-brand-secondary text-white border-brand-secondary"
                  : "bg-brand-main text-brand-text-main border-brand-secondary/30"
              )}
            >
              {t.viewDetails}
            </Link>

            {/* Send Inquiry Button */}
            <Link
              href={`/shop/${product.slug}#inquiry`}
              onMouseEnter={() => setHoveredButton("inquiry")}
              onMouseLeave={() => setHoveredButton(null)}
              className={cn(
                "px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 border",
                hoveredButton === "inquiry"
                  ? "bg-brand-secondary text-white border-brand-secondary"
                  : "bg-brand-main text-brand-text-main border-brand-secondary/30"
              )}
            >
              {t.sendInquiry}
            </Link>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col space-y-1 w-[250px]">
        {/* Product Name */}
        <Link
          href={`/shop/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-anaheim font-bold text-sm text-brand-text-black line-clamp-2 hover:text-brand-secondary transition-colors leading-tight uppercase text-left"
        >
          {displayName}
        </Link>

        {/* Short Description */}
        {shortDescription && (
          <p className="text-[11px] text-brand-accent-gold line-clamp-2">
            {shortDescription}
          </p>
        )}
      </div>
    </div>
  )
}
