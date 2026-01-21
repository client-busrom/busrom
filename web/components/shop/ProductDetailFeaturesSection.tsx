"use client"

import React from "react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// Design reference dimensions (from Figma 1920x922)
const DESIGN_WIDTH = 1920

// Responsive size function
const rpx = (designValue: number) => `calc(var(--rpx-detail-features) * ${designValue})`

interface MediaObject {
  id: string
  url: string
  alt?: string
  altText?: string
  variants?: Record<string, string>
  cropFocalPoint?: { x: number; y: number } | null
}

interface DetailFeatureItem {
  title: string
  description?: string
}

interface ProductDetailFeaturesSectionProps {
  title?: string
  items: DetailFeatureItem[]
  image?: MediaObject | null
}

// Card styles for each position (top to bottom: dark, medium, light)
const CARD_STYLES = [
  {
    bg: "bg-[#46401F]",
    titleColor: "text-white",
    descColor: "text-[#FFEE63]",
    barGradient: "linear-gradient(to bottom, rgba(165, 151, 35, 1), rgba(70, 64, 16, 0))",
  },
  {
    bg: "bg-[#908741]",
    titleColor: "text-white",
    descColor: "text-[#FFE61F]",
    barGradient: "linear-gradient(to bottom, rgba(214, 194, 43, 1), rgba(144, 135, 65, 0))",
  },
  {
    bg: "bg-[#EEE5A2]",
    titleColor: "text-[#46401F]",
    descColor: "text-[#766D28]",
    barGradient: "linear-gradient(to bottom, rgba(255, 232, 58, 1), rgba(238, 229, 162, 0))",
  },
]

export function ProductDetailFeaturesSection({
  title = "Product Detail Features",
  items,
  image,
}: ProductDetailFeaturesSectionProps) {
  // Calculate object position from focal point
  const objectPosition = image?.cropFocalPoint
    ? `${image.cropFocalPoint.x}% ${image.cropFocalPoint.y}%`
    : "center"

  return (
    <section
      className="relative w-full bg-brand-main overflow-hidden"
      style={{
        ["--rpx-detail-features" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
        paddingTop: rpx(67),
        paddingBottom: rpx(55),
      }}
    >
      {/* Desktop Layout */}
      <div
        className="hidden md:flex items-stretch"
        style={{ gap: rpx(37) }}
      >
        {/* Left Image */}
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{
            width: rpx(433),
            borderTopRightRadius: rpx(30),
            borderBottomRightRadius: rpx(30),
          }}
        >
          {image ? (
            <OptimizedImage
              image={image as any}
              alt={image.altText || image.alt || title || ""}
              size="xlarge"
              className="w-full h-full object-cover"
              objectPosition={objectPosition}
            />
          ) : (
            <div className="w-full h-full bg-gray-300" style={{ minHeight: rpx(800) }} />
          )}
        </div>

        {/* Center Cards - 810x250 from Figma */}
        <div
          className="flex flex-col"
          style={{ gap: rpx(25), paddingTop: rpx(10) }}
        >
          {items.slice(0, 3).map((item, index) => {
            const style = CARD_STYLES[index] || CARD_STYLES[0]
            return (
              <motion.div
                key={index}
                className={`${style.bg} flex flex-col justify-between`}
                style={{
                  width: rpx(810),
                  height: rpx(250),
                  borderRadius: rpx(30),
                  padding: rpx(44),
                  paddingBottom: rpx(20),
                }}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ scale: 1.02, x: 10 }}
              >
                {/* Title */}
                <h3
                  className={`font-inter font-bold ${style.titleColor}`}
                  style={{
                    fontSize: rpx(36),
                    lineHeight: rpx(30),
                    marginTop: rpx(15),
                  }}
                >
                  {item.title}
                </h3>

                {/* Gradient bar with description */}
                <div
                  className="mt-auto"
                  style={{
                    background: style.barGradient,
                    borderRadius: rpx(14),
                    padding: `${rpx(15)} ${rpx(12)}`,
                  }}
                >
                  {item.description && (
                    <p
                      className={`font-inter ${style.descColor}`}
                      style={{
                        fontSize: rpx(24),
                        lineHeight: rpx(31),
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Right Column - Title and Circle */}
        <div
          className="flex-1 relative flex items-start justify-center"
          style={{ paddingTop: rpx(38) }}
        >
          {/* Decorative circle */}
          <motion.div
            className="absolute rounded-full bg-[#EAE5BD]"
            style={{
              bottom: rpx(153),
              right: rpx(38),
              width: rpx(190),
              height: rpx(190),
            }}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Vertical Title with stroke effect */}
          <div className="relative z-10">
            {/* Stroke layer (behind) */}
            <h2
              className="font-josefin-sans font-bold whitespace-pre-line text-transparent"
              style={{
                fontSize: rpx(100),
                lineHeight: rpx(113),
                WebkitTextStroke: `2px #464010`,
                writingMode: "vertical-rl",
                textOrientation: "mixed",
              }}
            >
              {title}
            </h2>
            {/* Fill layer (front) */}
            <h2
              className="absolute font-josefin-sans font-bold whitespace-pre-line text-[#46401F]"
              style={{
                fontSize: rpx(100),
                lineHeight: rpx(113),
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                bottom: 3,
                left: 3,
              }}
            >
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden px-4 py-8">
        {/* Title */}
        <h2 className="font-josefin-sans font-bold text-2xl text-center text-[#46401F] mb-6">
          {title}
        </h2>

        {/* Image */}
        {image && (
          <div className="w-full h-48 rounded-2xl overflow-hidden mb-6">
            <OptimizedImage
              image={image as any}
              alt={image.altText || image.alt || title || ""}
              size="medium"
              className="w-full h-full object-cover"
              objectPosition={objectPosition}
            />
          </div>
        )}

        {/* Cards */}
        <div className="space-y-4">
          {items.slice(0, 3).map((item, index) => {
            const style = CARD_STYLES[index] || CARD_STYLES[0]
            return (
              <div
                key={index}
                className={`${style.bg} rounded-2xl p-4`}
              >
                <h3 className={`font-inter font-bold text-lg mb-2 ${style.titleColor}`}>
                  {item.title}
                </h3>
                {item.description && (
                  <p className={`font-inter text-sm ${style.descColor}`}>
                    {item.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
