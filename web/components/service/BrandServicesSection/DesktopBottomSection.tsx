"use client"

import React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { ServiceCategory, DESIGN_WIDTH, vw, fontVw } from "./types"
import { getIconForItem } from "./utils"

interface DesktopBottomSectionProps {
  categories: ServiceCategory[]
  activeCategoryIndex: number
  expandedItemIndex: number | null
  setExpandedItemIndex: (index: number | null) => void
  onPrevCategory: () => void
  onNextCategory: () => void
  onPrevItem: () => void
  onNextItem: () => void
  desktopItemSectionRef: React.RefObject<HTMLElement | null>
}

export function DesktopBottomSection({
  categories,
  activeCategoryIndex,
  expandedItemIndex,
  setExpandedItemIndex,
  onPrevCategory,
  onNextCategory,
  onPrevItem,
  onNextItem,
  desktopItemSectionRef,
}: DesktopBottomSectionProps) {
  const activeCategory = categories[activeCategoryIndex]

  const handleItemInteraction = (index: number) => {
    setExpandedItemIndex(expandedItemIndex === index ? null : index)
  }

  return (
    <section
      ref={desktopItemSectionRef}
      className="hidden lg:block relative mx-auto scroll-mt-[80px]"
      style={{
        width: vw(1344),      // 1920 * 0.7
        height: vw(645),      // 922 * 0.7
        marginTop: vw(150),   // 214 * 0.7
      }}
    >
      {/* Background with overflow-hidden */}
      <div
        className="absolute inset-y-0 overflow-hidden"
        style={{
          left: vw(70),       // 100 * 0.7
          right: vw(70),
          borderRadius: vw(107), // 153 * 0.7
          background: "#F1E8CB",
        }}
      />

      {/* Content */}
      <div className="relative h-full">
        {/* Left Side - Category Title & Navigation */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: vw(50),      // 72 * 0.7
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
                fontSize: vw(60),
                lineHeight: vw(68),
              }}
            >
              {activeCategory?.title}
            </motion.h3>
          </AnimatePresence>

          {/* Arrow decoration */}
          <div style={{ marginTop: vw(28), marginLeft: 0 }}> {/* 40 * 0.7 */}
            <svg
              viewBox="0 0 128 18"
              fill="none"
              style={{
                width: vw(88),   // 126 * 0.7
                height: vw(11),  // 16 * 0.7
              }}
            >
              <path d="M1 17L9.3208 9L1 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-wave" style={{ animationDelay: "0s" }} />
              <path d="M13.9099 17L22.2307 9L13.9099 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-wave" style={{ animationDelay: "0.1s" }} />
              <path d="M26.8217 17L35.1405 9L26.8217 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-wave" style={{ animationDelay: "0.2s" }} />
              <path d="M39.7317 17L48.0525 9L39.7317 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-wave" style={{ animationDelay: "0.3s" }} />
              <path d="M52.6415 17L60.9623 9L52.6415 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-wave" style={{ animationDelay: "0.4s" }} />
              <path d="M66.9588 17L75.2796 9L66.9588 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-wave" style={{ animationDelay: "0.5s" }} />
              <path d="M79.8687 17L88.1895 9L79.8687 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-wave" style={{ animationDelay: "0.6s" }} />
              <path d="M92.7805 17L101.099 9L92.7805 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-wave" style={{ animationDelay: "0.7s" }} />
              <path d="M105.69 17L114.011 9L105.69 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-wave" style={{ animationDelay: "0.8s" }} />
              <path d="M118.6 17L126.921 9L118.6 1" stroke="#756F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-wave" style={{ animationDelay: "0.9s" }} />
            </svg>
          </div>

          {/* Navigation Buttons */}
          <div
            className="flex flex-col"
            style={{
              marginTop: vw(69),  // 98 * 0.7
              gap: vw(21),        // 30 * 0.7
            }}
          >
            {/* Up Button */}
            <button
              onClick={onPrevCategory}
              className="group rounded-full border-2 border-[#756F3F] bg-transparent flex items-center justify-center transition-all hover:bg-[#756F3F]"
              style={{
                width: vw(52),    // 74 * 0.7
                height: vw(52),
                boxShadow: `0px ${vw(3)} ${vw(3)} rgba(0, 0, 0, 0.25)`, // 4/4 * 0.7
              }}
            >
              <ChevronUp
                className="text-[#756F3F] group-hover:text-white transition-colors"
                strokeWidth={3}
                style={{
                  width: vw(17),  // 24 * 0.7
                  height: vw(17),
                }}
              />
            </button>

            {/* Down Button */}
            <button
              onClick={onNextCategory}
              className="group rounded-full border-2 border-[#756F3F] bg-transparent flex items-center justify-center transition-all hover:bg-[#756F3F]"
              style={{
                width: vw(52),    // 74 * 0.7
                height: vw(52),
                boxShadow: `0px ${vw(3)} ${vw(3)} rgba(0, 0, 0, 0.25)`,
              }}
            >
              <ChevronDown
                className="text-[#756F3F] group-hover:text-white transition-colors"
                strokeWidth={3}
                style={{
                  width: vw(17),  // 24 * 0.7
                  height: vw(17),
                }}
              />
            </button>
          </div>

          {/* Progress indicator */}
          <div style={{ marginTop: vw(69) }}> {/* 98 * 0.7 */}
            <div
              className="bg-[#756F3F]/30 rounded-full overflow-hidden"
              style={{
                width: vw(88),   // 126 * 0.7
                height: vw(11),  // 16 * 0.7
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

        {/* Right Side - Service Items Container */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: vw(70),     // 100 * 0.7
            right: vw(70),
            top: 0,
            bottom: 0,
            borderRadius: vw(107), // 153 * 0.7
          }}
        >
          {/* Items Row */}
          <motion.div
            className="absolute flex items-start justify-center w-full"
            style={{
              left: 0,
              right: 0,
              top: vw(285), // Fixed top instead of 50% + translateY to prevent shifting
              gap: vw(90),    // 128 * 0.7
            }}
          >
            {activeCategory?.items.map((item, index) => {
              const IconComponent = getIconForItem(item.title)
              const totalItems = activeCategory?.items.length || 5

              // Calculate position for squeeze effect
              const vwToPx = (designPx: number) => (designPx / DESIGN_WIDTH) * (typeof window !== 'undefined' ? window.innerWidth : 1920)

              const itemSpacing = vwToPx(207)   // 296 * 0.7
              const neighborOffset = vwToPx(140) // 200 * 0.7
              const hideOffset = vwToPx(560)    // 800 * 0.7

              let squeezeX = 0
              let itemOpacity = 1
              let itemScale = 1

              if (expandedItemIndex !== null) {
                const leftNeighbor = (expandedItemIndex - 1 + totalItems) % totalItems
                const rightNeighbor = (expandedItemIndex + 1) % totalItems
                const centerIndex = (totalItems - 1) / 2
                const shiftToCenter = (centerIndex - expandedItemIndex) * itemSpacing

                if (index === expandedItemIndex) {
                  squeezeX = shiftToCenter
                  itemOpacity = 1
                  itemScale = 1
                } else if (index === leftNeighbor) {
                  squeezeX = shiftToCenter - neighborOffset
                  itemOpacity = 0.7
                  itemScale = 0.9
                } else if (index === rightNeighbor) {
                  squeezeX = shiftToCenter + neighborOffset
                  itemOpacity = 0.7
                  itemScale = 0.9
                } else {
                  const dist = index - expandedItemIndex
                  squeezeX = dist < 0 ? -hideOffset : hideOffset
                  itemOpacity = 0
                  itemScale = 0.7
                }
              }

              return (
                <motion.div
                  key={`${activeCategoryIndex}-${index}`}
                  className="relative flex-shrink-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: expandedItemIndex !== null ? itemOpacity : 1,
                    y: 0,
                    x: squeezeX,
                    scale: expandedItemIndex !== null ? itemScale : 1,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {/* Item Button */}
                  <button
                    onClick={() => handleItemInteraction(index)}
                    className="flex flex-col items-start text-left"
                    style={{
                      gap: vw(22),      // 32 * 0.7
                      width: vw(118),   // 168 * 0.7
                    }}
                  >
                    {/* Icon with white circle background */}
                    <div
                      className="relative"
                      style={{
                        width: vw(45),   // 64 * 0.7
                        height: vw(41),  // 58 * 0.7
                      }}
                    >
                      {/* White circle */}
                      <div
                        className="absolute rounded-full"
                        style={{
                          width: vw(31),  // 44 * 0.7
                          height: vw(31),
                          backgroundColor: "#F8F7EA",
                          left: 0,
                          top: 0,
                        }}
                      />
                      {/* Icon */}
                      <div
                        className="absolute text-[#756F3F]"
                        style={{
                          width: vw(33),  // 47 * 0.7
                          height: vw(35), // 50 * 0.7
                          right: 0,
                          bottom: 0,
                        }}
                      >
                        <IconComponent className="w-full h-full" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Title */}
                    <div
                      className="custom-scrollbar"
                      data-lenis-prevent
                      style={{
                        maxHeight: fontVw(218), // 8 lines * 26 + 10 padding
                        paddingTop: fontVw(5),
                        paddingBottom: fontVw(5),
                        overflowY: "auto",
                        overflowX: "hidden",
                        overscrollBehavior: "contain",
                        width: "100%",
                      }}
                    >
                      <h4
                        className="font-anaheim font-bold text-black m-0"
                        style={{
                          fontSize: fontVw(20),
                          lineHeight: fontVw(26),
                        }}
                      >
                        {item.title}
                      </h4>
                    </div>
                  </button>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Expanded Card */}
          <AnimatePresence>
            {expandedItemIndex !== null && activeCategory?.items[expandedItemIndex] && (
              <motion.div
                key={`card-${activeCategoryIndex}-${expandedItemIndex}`}
                initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute overflow-hidden z-10"
                style={{
                  left: "50%",
                  top: "50%",
                  width: vw(520),     // 743 * 0.7
                  borderRadius: vw(47), // 67 * 0.7
                  boxShadow: `0px 0px ${vw(49)} rgba(159, 142, 81, 0.25)`, // 69.5 * 0.7
                }}
              >
                {(() => {
                  const item = activeCategory.items[expandedItemIndex]
                  const IconComponent = getIconForItem(item.title)
                  return (
                    <div className="bg-white">
                      {/* Top gradient section */}
                      <div
                        style={{
                          height: vw(220),  // 增加高度以容纳更长描述
                          padding: vw(21),  // 30 * 0.7
                          background: "linear-gradient(180deg, #FFFDE9 0%, #FAF6D3 100%)",
                        }}
                      >
                        <div
                          className="flex"
                          style={{ gap: vw(17) }} // 24 * 0.7
                        >
                          {/* Icon with circle background */}
                          <div
                            className="relative flex-shrink-0"
                            style={{
                              width: vw(45),   // 64 * 0.7
                              height: vw(41),  // 58 * 0.7
                            }}
                          >
                            <div
                              className="absolute rounded-full"
                              style={{
                                width: vw(31),  // 44 * 0.7
                                height: vw(29), // 42 * 0.7
                                backgroundColor: "#EFE8AD",
                                left: 0,
                                top: 0,
                              }}
                            />
                            <div
                              className="absolute text-[#756F3F]"
                              style={{
                                width: vw(33),  // 47 * 0.7
                                height: vw(35), // 50 * 0.7
                                right: 0,
                                bottom: 0,
                              }}
                            >
                              <IconComponent className="w-full h-full" strokeWidth={1.5} />
                            </div>
                          </div>

                          {/* Title & Description */}
                          <div className="flex-1">
                            <div
                              className="custom-scrollbar"
                              data-lenis-prevent
                              style={{
                                maxHeight: fontVw(62), // 2 lines * 26 + 10 padding
                                paddingTop: fontVw(5),
                                paddingBottom: fontVw(5),
                                overflowY: "auto",
                                overflowX: "hidden",
                                overscrollBehavior: "contain",
                                marginBottom: vw(11), // Moved from h4
                              }}
                            >
                              <h4
                                className="font-anaheim font-bold text-black m-0"
                                style={{
                                  fontSize: fontVw(20),
                                  lineHeight: fontVw(26),
                                }}
                              >
                                {item.title}
                              </h4>
                            </div>
                            <div
                              className="custom-scrollbar"
                              data-lenis-prevent
                              style={{
                                maxHeight: fontVw(128), // 6 lines * 20 + 10 padding
                                paddingTop: fontVw(5),
                                paddingRight: fontVw(5),
                                paddingBottom: fontVw(5),
                                overflowY: "auto",
                                overflowX: "hidden",
                                overscrollBehavior: "contain",
                              }}
                            >
                              <p
                                className="font-anaheim font-medium text-[#535353] text-left m-0"
                                style={{
                                  fontSize: fontVw(16),
                                  lineHeight: fontVw(20),
                                }}
                              >
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom section with images */}
                      <div
                        className="flex items-end"
                        style={{
                          height: vw(204),  // 291 * 0.7
                          padding: vw(21),  // 30 * 0.7
                          gap: vw(15),      // 22 * 0.7
                        }}
                      >
                        {item.images && item.images.length > 0 ? (
                          item.images.slice(0, 3).map((image, imgIndex) => (
                            <div
                              key={imgIndex}
                              className="overflow-hidden"
                              style={{
                                borderRadius: vw(14),  // 20 * 0.7
                                width: imgIndex === 1 ? vw(197) : vw(153), // 282/218 * 0.7
                                height: imgIndex === 1 ? vw(157) : vw(118), // 224/168 * 0.7
                              }}
                            >
                              {image.enableLink && image.linkUrl ? (
                                <Link href={image.linkUrl} target={image.openInNewTab ? "_blank" : undefined} rel={image.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                                  <OptimizedImage
                                    image={image as any}
                                    alt={`${item.title} ${imgIndex + 1}`}
                                    size={imgIndex === 1 ? "medium" : "small"}
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                  />
                                </Link>
                              ) : (
                                <OptimizedImage
                                  image={image as any}
                                  alt={`${item.title} ${imgIndex + 1}`}
                                  size={imgIndex === 1 ? "medium" : "small"}
                                  className="w-full h-full object-cover"
                                  loading="eager"
                                />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="flex items-end" style={{ gap: vw(15) }}>
                            <div className="bg-[#E8E4D0]" style={{ width: vw(153), height: vw(118), borderRadius: vw(14) }} />
                            <div className="bg-[#E8E4D0]" style={{ width: vw(197), height: vw(157), borderRadius: vw(14) }} />
                            <div className="bg-[#E8E4D0]" style={{ width: vw(153), height: vw(118), borderRadius: vw(14) }} />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Left Navigation Button */}
          <button
            onClick={expandedItemIndex !== null ? onPrevItem : undefined}
            className={`group absolute z-20 rounded-full flex items-center justify-center transition-all border-2 ${expandedItemIndex !== null
              ? "border-[#756F3F] bg-transparent hover:bg-[#756F3F] cursor-pointer"
              : "border-[#756F3F]/30 bg-transparent cursor-default"
              }`}
            style={{
              width: vw(52),    // 74 * 0.7
              height: vw(52),
              left: vw(42),     // 60 * 0.7
              top: "50%",
              transform: "translateY(-50%)",
              boxShadow: expandedItemIndex !== null ? `0px ${vw(3)} ${vw(3)} rgba(0, 0, 0, 0.25)` : "none",
            }}
            disabled={expandedItemIndex === null}
          >
            <ChevronLeft
              className={`transition-colors ${expandedItemIndex !== null
                ? "text-[#756F3F] group-hover:text-white"
                : "text-[#756F3F]/30"
                }`}
              strokeWidth={3}
              style={{ width: vw(17), height: vw(17) }}
            />
          </button>

          {/* Right Navigation Button */}
          <button
            onClick={expandedItemIndex !== null ? onNextItem : undefined}
            className={`group absolute z-20 rounded-full flex items-center justify-center transition-all border-2 ${expandedItemIndex !== null
              ? "border-[#756F3F] bg-transparent hover:bg-[#756F3F] cursor-pointer"
              : "border-[#756F3F]/30 bg-transparent cursor-default"
              }`}
            style={{
              width: vw(52),    // 74 * 0.7
              height: vw(52),
              right: vw(42),    // 60 * 0.7
              top: "50%",
              transform: "translateY(-50%)",
              boxShadow: expandedItemIndex !== null ? `0px ${vw(3)} ${vw(3)} rgba(0, 0, 0, 0.25)` : "none",
            }}
            disabled={expandedItemIndex === null}
          >
            <ChevronRight
              className={`transition-colors ${expandedItemIndex !== null
                ? "text-[#756F3F] group-hover:text-white"
                : "text-[#756F3F]/30"
                }`}
              strokeWidth={3}
              style={{ width: vw(17), height: vw(17) }}
            />
          </button>

          {/* Close button */}
          {expandedItemIndex !== null && (
            <button
              onClick={() => setExpandedItemIndex(null)}
              className="absolute z-20 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all"
              style={{
                width: vw(35),    // 50 * 0.7
                height: vw(35),
                left: "50%",
                bottom: vw(28),   // 40 * 0.7
                transform: "translateX(-50%)",
                boxShadow: `0px ${vw(3)} ${vw(7)} rgba(0, 0, 0, 0.15)`, // 4/10 * 0.7
              }}
            >
              <ChevronDown
                className="text-[#756F3F]"
                strokeWidth={2.5}
                style={{ width: vw(17), height: vw(17) }}
              />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
