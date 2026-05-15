"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
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

interface ImageLinkData {
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

interface ProductDetailFeaturesSectionProps {
  title?: string
  items: DetailFeatureItem[]
  image?: MediaObject | null
  imageLink?: ImageLinkData | null
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
  imageLink,
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
          {imageLink?.enableLink && imageLink.linkUrl ? (
            <Link
              href={imageLink.linkUrl}
              target={imageLink.openInNewTab ? "_blank" : undefined}
              rel={imageLink.openInNewTab ? "noopener noreferrer" : undefined}
              className="block w-full h-full"
            >
              <OptimizedImage
                image={image as any}
                alt={image.altText || image.alt || title || ""}
                size="medium"
                className="w-full h-full object-cover"
                objectPosition={objectPosition}
              />
            </Link>
          ) : (
            <OptimizedImage
              image={image as any}
              alt={image.altText || image.alt || title || ""}
              size="medium"
              className="w-full h-full object-cover"
              objectPosition={objectPosition}
            />
          )}
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
      className="relative w-full bg-brand-main overflow-hidden hidden md:block py-20"
      style={{
        ["--rpx-detail-features" as string]: `calc(100vw / ${DESIGN_WIDTH})`,
      }}
    >
      {/* Desktop Content */}
      <div
        className="hidden md:flex items-start h-full"
        style={{ gap: rpx(37) }}
      >
        {/* Left Image */}
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{
            width: rpx(520),
            height: rpx(500),
            borderTopRightRadius: rpx(30),
            borderBottomRightRadius: rpx(30),
          }}
        >
          {image ? (
            imageLink?.enableLink && imageLink.linkUrl ? (
              <Link
                href={imageLink.linkUrl}
                target={imageLink.openInNewTab ? "_blank" : undefined}
                rel={imageLink.openInNewTab ? "noopener noreferrer" : undefined}
                className="block w-full h-full"
              >
                <OptimizedImage
                  image={image as any}
                  alt={image.altText || image.alt || title || ""}
                  size="xlarge"
                  className="w-full h-full object-cover"
                  objectPosition={objectPosition}
                />
              </Link>
            ) : (
              <OptimizedImage
                image={image as any}
                alt={image.altText || image.alt || title || ""}
                size="xlarge"
                className="w-full h-full object-cover"
                objectPosition={objectPosition}
              />
            )
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
        </div>

        {/* Center Cards - 810x250 from Figma */}
        <div
          className="flex flex-col"
          style={{ gap: rpx(25) }}
        >
          {items.slice(0, 3).map((item, index) => {
            const style = CARD_STYLES[index] || CARD_STYLES[0]
            return (
              <motion.div
                key={index}
                className={`${style.bg} flex flex-col justify-between`}
                initial={{ opacity: 0, x: -80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{
                  scale: 1.02,
                  x: 15,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: rpx(600),
                  height: rpx(150),
                  borderRadius: rpx(24),
                  padding: rpx(20),
                  paddingBottom: rpx(14),
                  willChange: "transform, opacity",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                }}
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
          className="flex-1 flex items-start justify-center"
          style={{ alignSelf: "center", height: rpx(500) }}
        >
          {/* Shared Container for Title and Circle */}
          <div className="relative">
            {/* Decorative circle - centered on the text line */}
            <motion.div
              className="absolute rounded-full bg-[#EAE5BD] z-0"
              style={{
                // Center of the 190px circle should align with the text line
                // Text width is roughly the line-height (56px)
                left: "110%",
                top: "80%",
                width: rpx(190),
                height: rpx(190),
                marginLeft: rpx(-95), // Half of width to center it
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.6, 0.9, 0.6],
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
                  fontSize: rpx(60),
                  lineHeight: rpx(56),
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
                  fontSize: rpx(60),
                  lineHeight: rpx(56),
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  top: 0,
                  left: 0,
                  transform: `translate(${rpx(3)}, ${rpx(3)})`,
                }}
              >
                {title}
              </h2>
            </div>
          </div>
        </div>
      </div>

    </section>
    </>
  )
}
