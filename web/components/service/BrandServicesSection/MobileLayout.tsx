"use client"

import React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { ServiceCategory, CategoryImages } from "./types"
import { getIconForItem } from "./utils"

interface MobileLayoutProps {
  title: string
  description: string
  categories: ServiceCategory[]
  categoryImages?: CategoryImages[]
  activeCategoryIndex: number
  setActiveCategoryIndex: (index: number) => void
  expandedItemIndex: number | null
  setExpandedItemIndex: (index: number | null) => void
  mobileItemSectionRef: React.RefObject<HTMLDivElement | null>
}

export function MobileLayout({
  title,
  description,
  categories,
  categoryImages,
  activeCategoryIndex,
  setActiveCategoryIndex,
  expandedItemIndex,
  setExpandedItemIndex,
  mobileItemSectionRef,
}: MobileLayoutProps) {
  const activeCategory = categories[activeCategoryIndex]
  const currentImages = categoryImages?.[activeCategoryIndex] || categoryImages?.[0] || { top: null, bottom: null }

  const handleCategoryClick = (index: number) => {
    setActiveCategoryIndex(index)
    setExpandedItemIndex(null)
    mobileItemSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handlePrevCategory = () => {
    setActiveCategoryIndex((activeCategoryIndex - 1 + categories.length) % categories.length)
    setExpandedItemIndex(null)
  }

  const handleNextCategory = () => {
    setActiveCategoryIndex((activeCategoryIndex + 1) % categories.length)
    setExpandedItemIndex(null)
  }

  const handleItemInteraction = (index: number) => {
    setExpandedItemIndex(expandedItemIndex === index ? null : index)
  }

  return (
    <div className="lg:hidden">
      {/* Top Section - Categories */}
      <section className="relative px-4 py-5">
        <div
          className="absolute inset-0 rounded-[20px] mx-4"
          style={{ background: "linear-gradient(180deg, #756F3F 0%, #8F8840 100%)" }}
        />

        <div className="relative px-4 py-1">
          <h2 className="font-anaheim font-extrabold text-[24px] leading-[30px] text-white mb-2">
            {title}
          </h2>
          <p className="font-anaheim font-semibold text-[12px] leading-[18px] text-[#FFF9D3] mb-4">
            {description}
          </p>

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

          {currentImages?.top && (
            <div className="mt-4 rounded-[14px] overflow-hidden h-[140px]">
              <OptimizedImage
                image={currentImages.top as any}
                alt="Brand service"
                size="small"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* Bottom Section - Service Items */}
      <section ref={mobileItemSectionRef} className="relative px-4 py-5 scroll-mt-[60px]">
        <div
          className="absolute left-4 right-4 inset-y-0 rounded-[24px]"
          style={{ background: "#F1E8CB" }}
        />

        <div className="relative px-4 py-1">
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
  )
}
