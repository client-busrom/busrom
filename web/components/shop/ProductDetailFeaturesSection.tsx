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
    <>
    {/* Mobile Layout */}
    <section className="md:hidden bg-brand-main px-4 py-8">
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
    </section>

    {/* Desktop Layout */}
    <section
      className="relative w-full bg-brand-main overflow-hidden hidden md:block"
      style={{
        ["--rpx-detail-features" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
        height: rpx(922),
      }}
    >
      {/* Desktop Content */}
      <div
        className="hidden md:flex items-center h-full"
        style={{ gap: rpx(37) }}
      >
        {/* Left Image */}
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{
            width: rpx(520),
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
                  width: rpx(600),
                  height: rpx(150),
                  borderRadius: rpx(24),
                  padding: rpx(20),
                  paddingBottom: rpx(14),
                }}
                initial={{ opacity: 0, x: -80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{
                  scale: 1.05,
                  x: 25,
                  boxShadow: "0 15px 40px rgba(70, 64, 31, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Title */}
                <h3
                  className={`font-inter font-bold ${style.titleColor}`}
                  style={{
                    fontSize: rpx(24),
                    lineHeight: rpx(24),
                    marginTop: rpx(4),
                  }}
                >
                  {item.title}
                </h3>

                {/* Gradient bar with description */}
                <div
                  className="mt-auto"
                  style={{
                    background: style.barGradient,
                    borderRadius: rpx(12),
                    padding: `${rpx(12)} ${rpx(10)}`,
                  }}
                >
                  {item.description && (
                    <p
                      className={`font-inter ${style.descColor}`}
                      style={{
                        fontSize: rpx(16),
                        lineHeight: rpx(22),
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
          style={{ alignSelf: "center", height: `calc(${rpx(150)} * 3 + ${rpx(25)} * 2)` }}
        >
          {/* Decorative circle */}
          <motion.div
            className="absolute rounded-full bg-[#EAE5BD]"
            style={{
              bottom: rpx(20),
              right: rpx(60),
              width: rpx(190),
              height: rpx(190),
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 3,
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
                fontSize: rpx(72),
                lineHeight: rpx(82),
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
                fontSize: rpx(72),
                lineHeight: rpx(82),
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

    </section>
    </>
  )
}
