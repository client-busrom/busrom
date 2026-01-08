"use client"

import React, { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import {
  ChevronUp,
  ChevronDown,
  Diamond,
  FileText,
  Clock,
  CheckSquare,
  MessageSquare,
  User,
  BarChart3,
  Package,
  Truck,
  Calendar,
  Shield,
  Headphones,
  RefreshCw,
  Star,
} from "lucide-react"

const DESIGN_WIDTH = 1920

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
  width?: number
  height?: number
}

interface ServiceItem {
  title: string
  description: string
  icon?: string
  images?: MediaObject[]
}

interface ServiceCategory {
  title: string
  items: ServiceItem[]
}

interface BrandServicesSectionProps {
  title?: string
  description?: string
  categories: ServiceCategory[]
  decorativeImages?: {
    top?: MediaObject | null
    bottom?: MediaObject | null
  }
}

// Icon mapping using lucide-react icons
const iconMap: Record<string, React.FC<{ className?: string; strokeWidth?: number }>> = {
  // Pre-Purchase Support
  consultation: Diamond,           // Project Consultation & Requirements Gathering
  quotation: FileText,             // Transparent Quotation List
  customization: Clock,            // Customization & OEM/ODM
  samples: CheckSquare,            // Free Samples & Inspection
  communication: MessageSquare,    // Multi-Channel Communication

  // Purchase Support
  dedicated: User,                 // One-On-One Dedicated Sales Consultant
  reporting: BarChart3,            // Timely Reporting In Production
  packaging: Package,              // Customized Packaging & Essential Protection
  shipping: Truck,                 // Transportation Shipping & Customs Clearance
  delivery: Calendar,              // Flexible Delivery Strategies

  // Post-Purchase Support
  quality: Shield,                 // Quality Assurance Commitment
  afterSales: Headphones,          // Comprehensive After-Sales Communication
  returnExchange: RefreshCw,       // Return & Exchange Support System
  followUp: Star,                  // Customer Follow-Up & Satisfaction Tracking
}

// Get icon based on title keywords - comprehensive matching for all items
const getIconForItem = (title: string): React.FC<{ className?: string; strokeWidth?: number }> => {
  const titleLower = title.toLowerCase()

  // Pre-Purchase Support
  if (titleLower.includes("consultation") || titleLower.includes("requirements gathering")) return iconMap.consultation
  if (titleLower.includes("quotation") || titleLower.includes("transparent")) return iconMap.quotation
  if (titleLower.includes("customization") || titleLower.includes("oem") || titleLower.includes("odm")) return iconMap.customization
  if (titleLower.includes("sample") || titleLower.includes("inspection")) return iconMap.samples
  if (titleLower.includes("multi-channel") || titleLower.includes("communication")) return iconMap.communication

  // Purchase Support
  if (titleLower.includes("dedicated") || titleLower.includes("one-on-one") || titleLower.includes("consultant")) return iconMap.dedicated
  if (titleLower.includes("reporting") || titleLower.includes("production")) return iconMap.reporting
  if (titleLower.includes("packaging") || titleLower.includes("protection")) return iconMap.packaging
  if (titleLower.includes("shipping") || titleLower.includes("transportation") || titleLower.includes("customs")) return iconMap.shipping
  if (titleLower.includes("delivery") || titleLower.includes("flexible")) return iconMap.delivery

  // Post-Purchase Support
  if (titleLower.includes("quality") || titleLower.includes("assurance") || titleLower.includes("commitment")) return iconMap.quality
  if (titleLower.includes("after-sales") || titleLower.includes("comprehensive")) return iconMap.afterSales
  if (titleLower.includes("return") || titleLower.includes("exchange")) return iconMap.returnExchange
  if (titleLower.includes("follow-up") || titleLower.includes("satisfaction") || titleLower.includes("tracking")) return iconMap.followUp

  // Default fallback
  return Diamond
}

export function BrandServicesSection({
  title = "Brand Services",
  description = "Our service blends creative strategy with flawless execution to define your story, design your identity, and amplify your presence.",
  categories,
  decorativeImages,
}: BrandServicesSectionProps) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(null)
  const itemSectionRef = useRef<HTMLDivElement>(null)

  const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

  const activeCategory = categories[activeCategoryIndex]

  // Handle category button click - scroll to item section
  const handleCategoryClick = (index: number) => {
    setActiveCategoryIndex(index)
    setExpandedItemIndex(null)
    itemSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Handle prev/next category
  const handlePrevCategory = useCallback(() => {
    setActiveCategoryIndex((prev) => (prev - 1 + categories.length) % categories.length)
    setExpandedItemIndex(null)
  }, [categories.length])

  const handleNextCategory = useCallback(() => {
    setActiveCategoryIndex((prev) => (prev + 1) % categories.length)
    setExpandedItemIndex(null)
  }, [categories.length])

  // Handle item hover/click
  const handleItemInteraction = (index: number) => {
    setExpandedItemIndex(expandedItemIndex === index ? null : index)
  }

  // If no categories, don't render
  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <>
      {/* ==================== Mobile Layout ==================== */}
      <div className="lg:hidden">
        {/* Top Section - Categories */}
        <section className="relative px-4 py-5">
          {/* Background */}
          <div
            className="absolute inset-0 rounded-[20px] mx-4"
            style={{ background: "linear-gradient(180deg, #756F3F 0%, #8F8840 100%)" }}
          />

          {/* Content */}
          <div className="relative px-4 py-1">
            {/* Title */}
            <h2 className="font-anaheim font-extrabold text-[24px] leading-[30px] text-white mb-2">
              {title}
            </h2>
            <p className="font-anaheim font-semibold text-[12px] leading-[18px] text-[#FFF9D3] mb-4">
              {description}
            </p>

            {/* Category Buttons */}
            <div className="space-y-2">
              {categories.map((category, index) => {
                const isActive = index === activeCategoryIndex
                return (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(index)}
                    className={`w-full rounded-[14px] px-3.5 py-2.5 flex items-center justify-between transition-all duration-300 ${
                      isActive ? "bg-[#89834C]" : "bg-transparent border-2 border-[#B7B180]"
                    }`}
                    style={{ boxShadow: isActive ? "0px 12px 12px rgba(91, 84, 30, 0.2)" : "none" }}
                  >
                    <span className={`font-anaheim text-[#FFF38E] ${isActive ? "font-bold text-[15px]" : "font-medium text-[14px]"}`}>
                      {category.title}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 20 22" fill="none" className={isActive ? "" : "opacity-50"}>
                      <path
                        d="M18.349 2.26L4.423 2.26C4.11 2.26 3.853 2.154 3.652 1.944C3.452 1.732 3.352 1.46 3.352 1.13C3.347 0.98 3.37 0.831 3.422 0.691C3.474 0.551 3.552 0.424 3.652 0.317C3.753 0.212 3.874 0.129 4.006 0.075C4.139 0.021 4.281 -0.004 4.423 0.001L19.42 0.001C19.563 -0.004 19.704 0.021 19.837 0.075C19.97 0.129 20.09 0.212 20.192 0.317C20.292 0.424 20.37 0.551 20.421 0.691C20.473 0.831 20.497 0.98 20.492 1.13L20.492 16.945C20.492 17.274 20.391 17.546 20.192 17.758C20.09 17.864 19.97 17.946 19.837 18C19.704 18.055 19.563 18.08 19.42 18.074C19.107 18.074 18.85 17.968 18.649 17.758C18.45 17.546 18.349 17.274 18.349 16.945L18.349 2.26ZM18.649 0.317C18.858 0.112 19.134 -0.001 19.42 0.001C19.561 0 19.701 0.029 19.831 0.087C19.96 0.145 20.077 0.23 20.174 0.338C20.276 0.44 20.356 0.563 20.411 0.7C20.465 0.836 20.493 0.983 20.492 1.13C20.492 1.436 20.391 1.707 20.192 1.944L1.981 21.147C1.771 21.352 1.495 21.466 1.209 21.463C1.069 21.465 0.93 21.436 0.8 21.378C0.671 21.32 0.554 21.236 0.457 21.129C0.355 21.027 0.274 20.903 0.219 20.766C0.164 20.63 0.137 20.482 0.138 20.334C0.136 20.032 0.243 19.741 0.438 19.52L18.649 0.317Z"
                        fill="#FFF38E"
                      />
                    </svg>
                  </button>
                )
              })}
            </div>

            {/* Decorative Image */}
            {decorativeImages?.top && (
              <div className="mt-4 rounded-[14px] overflow-hidden h-[140px]">
                <OptimizedImage
                  image={decorativeImages.top as any}
                  alt="Brand service"
                  size="small"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </section>

        {/* Bottom Section - Service Items */}
        <section ref={itemSectionRef} className="relative px-4 py-5">
          {/* Background */}
          <div
            className="absolute left-4 right-4 inset-y-0 rounded-[24px]"
            style={{ background: "#F1E8CB" }}
          />

          {/* Content */}
          <div className="relative px-4 py-1">
            {/* Category Title */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-anaheim font-extrabold text-[20px] leading-[26px] text-black">
                {activeCategory?.title}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevCategory}
                  className="w-[32px] h-[32px] rounded-full border-2 border-[#756F3F] flex items-center justify-center"
                >
                  <ChevronUp className="w-3 h-3 text-[#756F3F]" strokeWidth={3} />
                </button>
                <button
                  onClick={handleNextCategory}
                  className="w-[32px] h-[32px] rounded-full bg-[#756F3F] flex items-center justify-center"
                >
                  <ChevronDown className="w-3 h-3 text-white" strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Service Items - Vertical List */}
            <div className="space-y-2">
              {activeCategory?.items.map((item, index) => {
                const isExpanded = expandedItemIndex === index
                const IconComponent = getIconForItem(item.title)

                return (
                  <div key={`mobile-${activeCategoryIndex}-${index}`}>
                    <button
                      onClick={() => handleItemInteraction(index)}
                      className={`w-full rounded-[10px] p-2.5 flex items-center gap-2 transition-all ${
                        isExpanded ? "bg-white shadow-lg" : "bg-white/50"
                      }`}
                    >
                      <div className="w-[28px] h-[28px] flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-[20px] h-[20px] text-[#756F3F]" strokeWidth={1.5} />
                      </div>
                      <h4 className="font-anaheim font-bold text-[13px] leading-[17px] text-black text-left flex-1">
                        {item.title}
                      </h4>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#756F3F] transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-1.5 p-2.5 bg-white rounded-[10px] shadow-lg">
                        <p className="font-anaheim font-medium text-[12px] leading-[18px] text-[#535353] mb-2.5">
                          {item.description}
                        </p>
                        {item.images && item.images.length > 0 && (
                          <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                            {item.images.slice(0, 3).map((image, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="flex-shrink-0 w-[80px] h-[60px] rounded-[6px] overflow-hidden"
                              >
                                <OptimizedImage
                                  image={image as any}
                                  alt={`${item.title} ${imgIndex + 1}`}
                                  size="thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full h-[5px] bg-[#756F3F]/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#756F3F] rounded-full transition-all duration-300"
                  style={{ width: `${((activeCategoryIndex + 1) / categories.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ==================== Desktop Layout ==================== */}
      {/* Top Section - Category Selection */}
      <section
        className="hidden lg:block relative mx-auto"
        style={{
          width: vw(1920),
          height: vw(922),
          marginTop: vw(49),
        }}
      >
        {/* Background */}
        <div
          className="absolute"
          style={{
            left: vw(100),
            top: 0,
            width: vw(1720),
            height: vw(922),
            borderRadius: vw(30),
            background: "linear-gradient(180deg, #756F3F 0%, #8F8840 100%)",
          }}
        />

        {/* Content - Left Side */}
        <div
          className="absolute"
          style={{
            left: vw(258),
            top: vw(96),
          }}
        >
          {/* Title and Description */}
          <div style={{ maxWidth: vw(579) }}>
            <h2
              className="font-anaheim font-extrabold text-white"
              style={{
                fontSize: vw(64),
                lineHeight: vw(47),
                marginBottom: vw(31),
              }}
            >
              {title}
            </h2>
            <p
              className="font-anaheim font-semibold text-[#FFF9D3]"
              style={{
                fontSize: vw(24),
                lineHeight: vw(35),
              }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Category Buttons */}
        <div
          className="absolute flex flex-col"
          style={{
            left: vw(194),
            top: vw(336),
          }}
        >
          {categories.map((category, index) => {
            const isActive = index === activeCategoryIndex
            return (
              <div
                key={index}
                className="relative"
                style={{
                  marginBottom: index < categories.length - 1 ? (isActive ? vw(53) : vw(54)) : 0,
                }}
              >
                {/* Category button - click to select */}
                <button
                  onClick={() => setActiveCategoryIndex(index)}
                  className={`flex items-center justify-center transition-all duration-300 ${
                    isActive ? "bg-[#89834C]" : "bg-transparent border-2 border-[#B7B180]"
                  }`}
                  style={{
                    width: isActive ? vw(727) : vw(670),
                    height: isActive ? vw(132) : vw(121),
                    borderRadius: vw(30),
                    boxShadow: isActive ? `0px ${vw(68)} ${vw(48.2)} rgba(91, 84, 30, 0.52)` : "none",
                  }}
                >
                  <span
                    className={`font-anaheim text-[#FFF38E] ${
                      isActive ? "font-bold" : "font-medium"
                    }`}
                    style={{
                      fontSize: isActive ? vw(55) : vw(50),
                    }}
                  >
                    {category.title}
                  </span>
                </button>

                {/* Arrow button - positioned at top right of active button */}
                {isActive && (
                  <button
                    onClick={() => handleCategoryClick(index)}
                    className="absolute rounded-full bg-[#FFF28D] flex items-center justify-center transition-all hover:scale-105"
                    style={{
                      width: vw(76),
                      height: vw(76),
                      right: vw(-38),
                      top: vw(-33),
                    }}
                  >
                    <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                      <path
                        d="M18.349 2.26L4.423 2.26C4.11 2.26 3.853 2.154 3.652 1.944C3.452 1.732 3.352 1.46 3.352 1.13C3.347 0.98 3.37 0.831 3.422 0.691C3.474 0.551 3.552 0.424 3.652 0.317C3.753 0.212 3.874 0.129 4.006 0.075C4.139 0.021 4.281 -0.004 4.423 0.001L19.42 0.001C19.563 -0.004 19.704 0.021 19.837 0.075C19.97 0.129 20.09 0.212 20.192 0.317C20.292 0.424 20.37 0.551 20.421 0.691C20.473 0.831 20.497 0.98 20.492 1.13L20.492 16.945C20.492 17.274 20.391 17.546 20.192 17.758C20.09 17.864 19.97 17.946 19.837 18C19.704 18.055 19.563 18.08 19.42 18.074C19.107 18.074 18.85 17.968 18.649 17.758C18.45 17.546 18.349 17.274 18.349 16.945L18.349 2.26ZM18.649 0.317C18.858 0.112 19.134 -0.001 19.42 0.001C19.561 0 19.701 0.029 19.831 0.087C19.96 0.145 20.077 0.23 20.174 0.338C20.276 0.44 20.356 0.563 20.411 0.7C20.465 0.836 20.493 0.983 20.492 1.13C20.492 1.436 20.391 1.707 20.192 1.944L1.981 21.147C1.771 21.352 1.495 21.466 1.209 21.463C1.069 21.465 0.93 21.436 0.8 21.378C0.671 21.32 0.554 21.236 0.457 21.129C0.355 21.027 0.274 20.903 0.219 20.766C0.164 20.63 0.137 20.482 0.138 20.334C0.136 20.032 0.243 19.741 0.438 19.52L18.649 0.317Z"
                        fill="#7F7945"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Decorative Elements - Right Side */}
        {/* Decorative circle */}
        <div
          className="absolute rounded-full"
          style={{
            width: vw(107),
            height: vw(107),
            background: "#706B38",
            left: vw(1611),
            top: vw(69),
          }}
        />

        {/* "Brand" text - horizontal, near circle, right-aligned */}
        <div
          className="absolute font-anaheim font-medium text-[#FFF8BC] text-right"
          style={{
            fontSize: vw(40),
            right: vw(310),
            top: vw(85),
            letterSpacing: "0.5em",
          }}
        >
          Brand
        </div>

        {/* "Services" text - vertical, near circle */}
        <div
          className="absolute font-anaheim font-medium text-[#FFF8BC]"
          style={{
            fontSize: vw(40),
            left: vw(1620),
            top: vw(180),
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            letterSpacing: "0.5em",
          }}
        >
          Services
        </div>

        {/* Top decorative image */}
        <div
          className="absolute overflow-hidden bg-[#D9D9D9]"
          style={{
            width: vw(505),
            height: vw(365),
            borderRadius: vw(30),
            left: vw(1079),
            top: vw(177),
            boxShadow: `${vw(4)} ${vw(4)} ${vw(11.4)} rgba(0, 0, 0, 0.25)`,
          }}
        >
          {decorativeImages?.top ? (
            <OptimizedImage
              image={decorativeImages.top as any}
              alt="Brand service"
              size="medium"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#D9D9D9]" />
          )}
        </div>

        {/* Bottom decorative image */}
        <div
          className="absolute overflow-hidden bg-[#D9D9D9]"
          style={{
            width: vw(505),
            height: vw(364),
            borderRadius: vw(30),
            left: vw(1213),
            top: vw(503),
            boxShadow: `${vw(4)} ${vw(4)} ${vw(9.3)} rgba(0, 0, 0, 0.25)`,
          }}
        >
          {decorativeImages?.bottom ? (
            <OptimizedImage
              image={decorativeImages.bottom as any}
              alt="Brand service"
              size="medium"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#D9D9D9]" />
          )}
        </div>
      </section>

      {/* Bottom Section - Service Items */}
      <section
        ref={itemSectionRef}
        className="hidden lg:block relative w-full mx-auto"
        style={{
          height: vw(922),
          marginTop: vw(214),
        }}
      >
        {/* Background */}
        <div
          className="absolute inset-y-0"
          style={{
            left: vw(350),
            right: vw(192),
            borderRadius: vw(153),
            background: "#F1E8CB",
          }}
        />

        {/* Content */}
        <div className="relative h-full">
          {/* Left Side - Category Title & Navigation */}
          <div
            className="absolute"
            style={{
              left: vw(158),
              top: vw(72),
            }}
          >
            {/* Category Title */}
            <AnimatePresence mode="wait">
              <motion.h3
                key={activeCategoryIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="font-anaheim font-extrabold text-black whitespace-pre"
                style={{
                  fontSize: vw(80),
                  lineHeight: vw(85),
                }}
              >
                {activeCategory?.title}
              </motion.h3>
            </AnimatePresence>

            {/* Arrow decoration - positioned at x=269.93 relative to section, after title */}
            <div
              style={{
                marginTop: vw(40),
                marginLeft: vw(270 - 158),
              }}
            >
              <svg
                viewBox="0 0 128 18"
                fill="none"
                style={{
                  width: vw(126),
                  height: vw(16),
                }}
              >
                <path d="M118.6 17L126.921 9L118.6 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M52.6415 17L60.9623 9L52.6415 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M105.69 17L114.011 9L105.69 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M39.7317 17L48.0525 9L39.7317 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M92.7805 17L101.099 9L92.7805 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M26.8217 17L35.1405 9L26.8217 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M79.8687 17L88.1895 9L79.8687 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.9099 17L22.2307 9L13.9099 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M66.9588 17L75.2796 9L66.9588 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 17L9.3208 9L1 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Navigation Buttons */}
            <div
              className="flex flex-col"
              style={{
                marginTop: vw(98),
                gap: vw(30),
              }}
            >
              {/* Up Button */}
              <button
                onClick={handlePrevCategory}
                className="rounded-full border-2 border-[#756F3F] bg-transparent flex items-center justify-center transition-all hover:bg-[#756F3F]/10"
                style={{
                  width: vw(74),
                  height: vw(74),
                  boxShadow: `0px ${vw(4)} ${vw(4)} rgba(0, 0, 0, 0.25)`,
                }}
              >
                <ChevronUp
                  className="text-[#756F3F]"
                  strokeWidth={3}
                  style={{
                    width: vw(24),
                    height: vw(24),
                  }}
                />
              </button>

              {/* Down Button */}
              <button
                onClick={handleNextCategory}
                className="rounded-full bg-[#756F3F] flex items-center justify-center transition-all hover:bg-[#756F3F]/90"
                style={{
                  width: vw(74),
                  height: vw(74),
                }}
              >
                <ChevronDown
                  className="text-white"
                  strokeWidth={3}
                  style={{
                    width: vw(24),
                    height: vw(24),
                  }}
                />
              </button>
            </div>

            {/* Progress indicator */}
            <div style={{ marginTop: vw(98) }}>
              <div
                className="bg-[#756F3F]/30 rounded-full overflow-hidden"
                style={{
                  width: vw(126),
                  height: vw(16),
                }}
              >
                <motion.div
                  className="h-full bg-[#756F3F] rounded-full"
                  initial={false}
                  animate={{
                    width: `${((activeCategoryIndex + 1) / categories.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Service Items */}
          <div
            className="absolute"
            style={{
              left: vw(440),
              right: vw(240),
              top: vw(308),
            }}
          >
            <div className="flex justify-between items-start">
              <AnimatePresence mode="wait">
                {activeCategory?.items.map((item, index) => {
                  const isExpanded = expandedItemIndex === index
                  const IconComponent = getIconForItem(item.title)
                  const totalItems = activeCategory?.items.length || 5
                  // For right-side items (last 2 items), position card to the left
                  const isRightSide = index >= totalItems - 2

                  return (
                    <motion.div
                      key={`${activeCategoryIndex}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="relative"
                    >
                      {/* Item Button */}
                      <button
                        onMouseEnter={() => handleItemInteraction(index)}
                        onClick={() => handleItemInteraction(index)}
                        className="flex flex-col items-start text-left"
                        style={{
                          gap: vw(32),
                          width: vw(168),
                        }}
                      >
                        {/* Icon */}
                        <div
                          className="text-black"
                          style={{
                            width: vw(58),
                            height: vw(53),
                          }}
                        >
                          <IconComponent className="w-full h-full" strokeWidth={1.5} />
                        </div>

                        {/* Title */}
                        <h4
                          className="font-anaheim font-bold text-black"
                          style={{
                            fontSize: vw(22),
                            lineHeight: vw(26),
                          }}
                        >
                          {item.title}
                        </h4>
                      </button>

                      {/* Expanded Card */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute overflow-hidden z-10 ${
                              isRightSide ? "right-0" : "left-0"
                            }`}
                            style={{
                              top: vw(-65),
                              width: vw(743),
                              borderRadius: vw(67),
                              boxShadow: `0px 0px ${vw(69.5)} rgba(159, 142, 81, 0.25)`,
                            }}
                            onMouseLeave={() => setExpandedItemIndex(null)}
                          >
                            {/* Card Background */}
                            <div className="bg-white">
                              {/* Top gradient section */}
                              <div
                                style={{
                                  height: vw(264),
                                  padding: vw(30),
                                  background: "linear-gradient(180deg, #FFFDE9 0%, #FAF6D3 100%)",
                                }}
                              >
                                <div
                                  className="flex"
                                  style={{ gap: vw(24) }}
                                >
                                  {/* Icon */}
                                  <div
                                    className="text-black flex-shrink-0"
                                    style={{
                                      width: vw(58),
                                      height: vw(51),
                                    }}
                                  >
                                    <IconComponent className="w-full h-full" strokeWidth={1.5} />
                                  </div>

                                  {/* Title & Description */}
                                  <div className="flex-1">
                                    <h4
                                      className="font-anaheim font-bold text-black"
                                      style={{
                                        fontSize: vw(22),
                                        lineHeight: vw(26),
                                        marginBottom: vw(16),
                                      }}
                                    >
                                      {item.title}
                                    </h4>
                                    <p
                                      className="font-anaheim font-medium text-[#535353] text-justify"
                                      style={{
                                        fontSize: vw(21),
                                        lineHeight: vw(28),
                                      }}
                                    >
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Bottom section with images */}
                              <div
                                className="flex items-end"
                                style={{
                                  height: vw(291),
                                  padding: vw(30),
                                  gap: vw(22),
                                }}
                              >
                                {item.images && item.images.length > 0 ? (
                                  item.images.slice(0, 3).map((image, imgIndex) => (
                                    <div
                                      key={imgIndex}
                                      className="overflow-hidden"
                                      style={{
                                        borderRadius: vw(20),
                                        width: imgIndex === 1 ? vw(282) : vw(218),
                                        height: imgIndex === 1 ? vw(224) : vw(168),
                                      }}
                                    >
                                      <OptimizedImage
                                        image={image as any}
                                        alt={`${item.title} ${imgIndex + 1}`}
                                        size={imgIndex === 1 ? "medium" : "small"}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))
                                ) : (
                                  // Placeholder when no images
                                  <div
                                    className="flex items-end"
                                    style={{ gap: vw(22) }}
                                  >
                                    <div
                                      className="bg-[#E8E4D0]"
                                      style={{
                                        width: vw(218),
                                        height: vw(168),
                                        borderRadius: vw(20),
                                      }}
                                    />
                                    <div
                                      className="bg-[#E8E4D0]"
                                      style={{
                                        width: vw(282),
                                        height: vw(224),
                                        borderRadius: vw(20),
                                      }}
                                    />
                                    <div
                                      className="bg-[#E8E4D0]"
                                      style={{
                                        width: vw(218),
                                        height: vw(168),
                                        borderRadius: vw(20),
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
