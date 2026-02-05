"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { ServiceCategory, CategoryImages, vw } from "./types"

interface DesktopTopSectionProps {
  title: string
  description: string
  categories: ServiceCategory[]
  categoryImages?: CategoryImages[]
  activeCategoryIndex: number
  setActiveCategoryIndex: (index: number) => void
  onCategoryClick: (index: number) => void
}

export function DesktopTopSection({
  title,
  description,
  categories,
  categoryImages,
  activeCategoryIndex,
  setActiveCategoryIndex,
  onCategoryClick,
}: DesktopTopSectionProps) {
  const activeCategory = categories[activeCategoryIndex]
  const currentImages = categoryImages?.[activeCategoryIndex] || categoryImages?.[0] || { top: null, bottom: null }

  return (
    <section
      className="hidden lg:block relative mx-auto"
      style={{
        width: vw(1344),      // 1920 * 0.7
        height: vw(655),      // 936 * 0.7
        marginTop: vw(34),    // 49 * 0.7
      }}
    >
      {/* Background */}
      <div
        className="absolute"
        style={{
          left: vw(70),       // 100 * 0.7
          top: 0,
          width: vw(1204),    // 1720 * 0.7
          height: vw(655),    // 936 * 0.7
          borderRadius: vw(21), // 30 * 0.7
          background: "linear-gradient(180deg, #756F3F 0%, #8F8840 100%)",
        }}
      />

      {/* Content - Left Side */}
      <div
        className="absolute"
        style={{
          left: vw(181),      // 258 * 0.7
          top: vw(58),        // 上移20px (72 - 20 = 52, 四舍五入58)
        }}
      >
        {/* Title and Description */}
        <div style={{ maxWidth: vw(405) }}> {/* 579 * 0.7 */}
          <h2
            className="font-anaheim font-extrabold text-white"
            style={{
              fontSize: vw(60),
              lineHeight: vw(68),
              marginBottom: vw(28), // 40 * 0.7
            }}
          >
            {title}
          </h2>
          <p
            className="font-anaheim font-semibold text-[#FFF9D3]"
            style={{
              fontSize: vw(20),
              lineHeight: vw(30),
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
          left: vw(136),
          top: vw(262),       // 下移10px
        }}
      >
        {categories.map((category, index) => {
          const isActive = index === activeCategoryIndex
          return (
            <div
              key={index}
              className="relative"
              style={{
                marginBottom: index < categories.length - 1 ? (isActive ? vw(42) : vw(43)) : 0, // 60/62 * 0.7
              }}
            >
              {/* Category button */}
              <button
                onClick={() => setActiveCategoryIndex(index)}
                className={`flex items-center justify-center transition-all duration-300 ${
                  isActive ? "bg-[#89834C]" : "bg-transparent border-2 border-[#B7B180]"
                }`}
                style={{
                  width: isActive ? vw(509) : vw(469),  // 727/670 * 0.7
                  height: isActive ? vw(92) : vw(85),   // 132/121 * 0.7
                  borderRadius: vw(21),                 // 30 * 0.7
                  boxShadow: isActive ? `0px ${vw(48)} ${vw(34)} rgba(91, 84, 30, 0.52)` : "none", // 68/48.2 * 0.7
                }}
              >
                <span
                  className={`font-anaheim text-[#FFF38E] ${isActive ? "font-bold" : "font-medium"}`}
                  style={{
                    fontSize: vw(29),
                  }}
                >
                  {category.title}
                </span>
              </button>

              {/* Arrow button */}
              {isActive && (
                <button
                  onClick={() => onCategoryClick(index)}
                  className="absolute rounded-full bg-[#FFF28D] flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    width: vw(53),    // 76 * 0.7
                    height: vw(53),
                    right: vw(-27),   // -38 * 0.7
                    top: vw(-23),     // -33 * 0.7
                  }}
                >
                  <svg width="14" height="15" viewBox="0 0 20 22" fill="none">
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
          width: vw(75),      // 107 * 0.7
          height: vw(75),
          background: "#706B38",
          left: vw(1128),     // 1611 * 0.7
          top: vw(48),        // 69 * 0.7
        }}
      />

      {/* "Brand" text */}
      <div
        className="absolute font-anaheim font-medium text-[#FFF8BC] text-right"
        style={{
          fontSize: vw(28),   // 40 * 0.7
          right: vw(217),     // 310 * 0.7
          top: vw(60),        // 85 * 0.7
          letterSpacing: "0.5em",
        }}
      >
        Brand
      </div>

      {/* "Services" text - vertical */}
      <div
        className="absolute font-anaheim font-medium text-[#FFF8BC]"
        style={{
          fontSize: vw(28),   // 40 * 0.7
          left: vw(1134),     // 1620 * 0.7
          top: vw(126),       // 180 * 0.7
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
          width: vw(354),     // 505 * 0.7
          height: vw(256),    // 365 * 0.7
          borderRadius: vw(21), // 30 * 0.7
          left: vw(755),      // 1079 * 0.7
          top: vw(124),       // 177 * 0.7
          boxShadow: `${vw(3)} ${vw(3)} ${vw(8)} rgba(0, 0, 0, 0.25)`, // 4/4/11.4 * 0.7
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`top-${activeCategoryIndex}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full"
          >
            {currentImages.top ? (
              <OptimizedImage
                image={currentImages.top as any}
                alt={`${activeCategory?.title || 'Brand service'} - top`}
                size="medium"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#D9D9D9]" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom decorative image */}
      <div
        className="absolute overflow-hidden bg-[#D9D9D9]"
        style={{
          width: vw(354),     // 505 * 0.7
          height: vw(255),    // 364 * 0.7
          borderRadius: vw(21), // 30 * 0.7
          left: vw(849),      // 1213 * 0.7
          top: vw(352),       // 503 * 0.7
          boxShadow: `${vw(3)} ${vw(3)} ${vw(7)} rgba(0, 0, 0, 0.25)`, // 4/4/9.3 * 0.7
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`bottom-${activeCategoryIndex}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="w-full h-full"
          >
            {currentImages.bottom ? (
              <OptimizedImage
                image={currentImages.bottom as any}
                alt={`${activeCategory?.title || 'Brand service'} - bottom`}
                size="medium"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#D9D9D9]" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
