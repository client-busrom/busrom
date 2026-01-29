"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn, getLocalizedName } from "@/lib/utils"
import { useTranslations } from "@/lib/translations"
import type { Product } from "@/lib/types/product"

// Helper to extract URL from variant (can be string or object with url)
function getVariantUrl(variant: string | { url?: string } | undefined): string | undefined {
  if (!variant) return undefined
  if (typeof variant === 'string') return variant
  return variant.url
}

interface ProductCardProps {
  product: Product & { localizedName?: string }
  locale: string
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [hoveredButton, setHoveredButton] = useState<"details" | "inquiry" | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 从 messages 文件获取翻译
  const t = useTranslations(locale, "shop")

  // Get display name
  const displayName =
    product.localizedName || product.name?.[locale] || product.name?.["en"] || product.sku

  // Get short description
  const shortDescription = product.shortDescription?.[locale] || product.shortDescription?.["en"] || null

  // Primary display: showImage
  const showImage = product.showImage
  // Carousel images: mainImage array
  const mainImages = product.mainImage || []

  // Auto-rotate through mainImage on hover
  useEffect(() => {
    if (isHovering && mainImages.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % mainImages.length)
      }, 800)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setCurrentImageIndex(0)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHovering, mainImages.length])

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setHoveredButton(null)
  }

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
      <Link
        href={`/${locale}/shop/${product.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-full aspect-square bg-gray-100 overflow-hidden mb-4"
        style={{ aspectRatio: '1 / 1' }}
      >
        {displayImage ? (
          <Image
            src={getVariantUrl(displayImage.variants?.large) || getVariantUrl(displayImage.variants?.desktop) || getVariantUrl(displayImage.variants?.tablet) || getVariantUrl(displayImage.variants?.card) || getVariantUrl(displayImage.variants?.thumbnail) || displayImage.url}
            alt={displayImage.altText || displayName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            style={{
              objectPosition: `${displayImage.cropFocalPoint?.x || 50}% ${displayImage.cropFocalPoint?.y || 50}%`,
              objectFit: 'cover',
            }}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            No Image
          </div>
        )}

        {/* Featured badge */}
        {product.isFeatured && (
          <div className="absolute top-0 right-0 bg-brand-secondary text-white text-xs font-semibold px-4 py-2 uppercase tracking-wider">
            Featured
          </div>
        )}

        {/* Hover Overlay with Two Buttons */}
        <div
          className={cn(
            "absolute inset-0 bg-black/0 flex items-end justify-center transition-all duration-300",
            isHovering ? "bg-black/20" : ""
          )}
        >
          <div className={cn(
            "flex gap-3 mb-4 transition-all duration-300 transform",
            isHovering ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            {/* View Details Button */}
            <Link
              href={`/${locale}/shop/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredButton("details")}
              onMouseLeave={() => setHoveredButton(null)}
              className={cn(
                "px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 border",
                hoveredButton === "details"
                  ? "bg-brand-secondary text-white border-brand-secondary"
                  : "bg-brand-main text-brand-text-main border-brand-secondary/30"
              )}
            >
              {t.viewDetails}
            </Link>

            {/* Send Inquiry Button */}
            <Link
              href={`/${locale}/shop/${product.slug}#inquiry`}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredButton("inquiry")}
              onMouseLeave={() => setHoveredButton(null)}
              className={cn(
                "px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 border",
                hoveredButton === "inquiry"
                  ? "bg-brand-secondary text-white border-brand-secondary"
                  : "bg-brand-main text-brand-text-main border-brand-secondary/30"
              )}
            >
              {t.sendInquiry}
            </Link>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col space-y-2">
        {/* Product Name */}
        <Link
          href={`/${locale}/shop/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-anaheim font-bold text-base text-brand-text-black line-clamp-2 hover:text-brand-secondary transition-colors leading-tight uppercase"
        >
          {displayName}
        </Link>

        {/* Series */}
        {product.series && 'slug' in product.series && (
          <Link
            href={`/${locale}/products/${product.series.slug}`}
            className="text-xs text-brand-accent-gold hover:text-brand-secondary transition-colors"
          >
            {'name' in product.series && getLocalizedName(product.series.name, locale, "View Series")}
          </Link>
        )}
      </div>
    </div>
  )
}
