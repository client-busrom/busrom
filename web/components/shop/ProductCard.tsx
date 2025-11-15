"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types/product"

interface ProductCardProps {
  product: Product & { localizedName?: string }
  locale: string
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
            src={displayImage.variants?.large || displayImage.url}
            alt={displayImage.altText || displayName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-opacity duration-300"
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

        {/* Carousel indicators - Only show when hovering and has multiple images */}
        {isHovering && mainImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
            {mainImages.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-full transition-all",
                  index === currentImageIndex
                    ? "bg-white w-6 h-2"
                    : "bg-white/60 w-2 h-2"
                )}
              />
            ))}
          </div>
        )}

        {/* Featured badge */}
        {product.isFeatured && (
          <div className="absolute top-0 right-0 bg-brand-secondary text-white text-xs font-semibold px-4 py-2 uppercase tracking-wider">
            Featured
          </div>
        )}
      </Link>

      {/* Product Info - Minimalist Style */}
      <div className="flex flex-col space-y-3 relative">
        {/* Product Name */}
        <Link
          href={`/${locale}/shop/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-anaheim font-extrabold text-xl text-brand-text-black line-clamp-2 hover:text-brand-secondary transition-colors leading-tight"
        >
          {displayName}
        </Link>

        {/* Series */}
        {product.series && 'slug' in product.series && (
          <Link
            href={`/${locale}/products/${product.series.slug}`}
            className="text-xs text-brand-accent-gold hover:text-brand-secondary transition-colors font-medium uppercase tracking-wider"
          >
            {'name' in product.series && (
              product.series.name?.[locale] ||
              product.series.name?.["en"] ||
              "View Series"
            )}
          </Link>
        )}

        {/* Short Description */}
        {shortDescription && (
          <div className="text-sm text-brand-text-black/70 line-clamp-2 leading-relaxed">
            {typeof shortDescription === 'string'
              ? shortDescription
              : shortDescription?.document?.[0]?.children?.[0]?.text || ''}
          </div>
        )}

        {/* Inquiry Button - Slides in on hover (desktop only), always visible on mobile */}
        <div className="lg:overflow-hidden">
          <Link
            href={`/${locale}#contact-form?product=${product.sku}`}
            className={cn(
              "block w-full py-3 px-0 text-center border-t-2 mt-4",
              "border-brand-secondary text-brand-secondary font-anaheim font-bold text-sm uppercase tracking-wider",
              "hover:border-brand-text-black hover:text-brand-text-black transition-all duration-300",
              "focus:outline-none",
              "lg:transform lg:transition-transform lg:duration-300 lg:ease-out",
              isHovering ? "lg:translate-y-0 lg:opacity-100" : "lg:translate-y-full lg:opacity-0"
            )}
          >
            Inquire Now
          </Link>
        </div>
      </div>
    </div>
  )
}
