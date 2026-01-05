"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { CoreSellingPointsData } from "@/lib/content-parser"

/**
 * Core Selling Points Section
 *
 * Figma Design Specs (1920x2257):
 * - Background: Linear gradient from #756F3F to transparent yellow
 * - Section starts at y:2506 in the full page
 *
 * Title Area (y:126 relative):
 * - Title: "Core Selling Points of the Product", 128px Anaheim ExtraBold, gradient white
 * - Title supports /n line breaks
 * - Draggable image list on the right (title layer above images)
 *
 * Tech Spec Area (y:657 relative):
 * - Left: 2 product images stacked with swap arrow button
 * - Right: Specification table with cream background (left-side rounded corners)
 *
 * Product Advantages Area (y:1510 relative):
 * - Left: Category title + large product image (switches with category)
 * - Right: Expandable cards for current category
 * - Left/Right buttons to switch between 4 categories
 */

// Design constants
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 2257
const SECTION_Y_OFFSET = 2506 // Where this section starts in full page

interface CoreSellingPointsProps {
  data: CoreSellingPointsData
  className?: string
}

export function CoreSellingPoints({ data, className }: CoreSellingPointsProps) {
  if (!data) return null

  const {
    title = '',
    titleImages = [],
    techSpecImages = [],
    techSpecTitle = '',
    techSpecItems = [],
    advantagesTitle = '',
    advantagesImages = [],
    advantagesCategories = [],
  } = data

  // State for current category (0-3) and expanded card index
  const [currentCategory, setCurrentCategory] = React.useState(0)
  const [expandedCardIndex, setExpandedCardIndex] = React.useState(0)

  // State for tech spec image swap (0 = first image big, 1 = second image big)
  const [techSpecMainIndex, setTechSpecMainIndex] = React.useState(0)

  // Ref for draggable image container
  const imageContainerRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStartX, setDragStartX] = React.useState(0)
  const [dragOffset, setDragOffset] = React.useState(0)
  const [currentTranslate, setCurrentTranslate] = React.useState(0)

  // Handle mouse drag for image list
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStartX(e.clientX)
    setDragOffset(currentTranslate)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const delta = e.clientX - dragStartX
    setCurrentTranslate(dragOffset + delta)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStartX(e.touches[0].clientX)
    setDragOffset(currentTranslate)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const delta = e.touches[0].clientX - dragStartX
    setCurrentTranslate(dragOffset + delta)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Get current category data
  const currentCategoryData = advantagesCategories[currentCategory] || { title: '', cards: [] }
  const currentImage = advantagesImages[currentCategory] || ''

  // Navigate categories (left/right)
  const goToPrevCategory = () => {
    setCurrentCategory((prev) => (prev > 0 ? prev - 1 : advantagesCategories.length - 1))
    setExpandedCardIndex(0)
  }

  const goToNextCategory = () => {
    setCurrentCategory((prev) => (prev < advantagesCategories.length - 1 ? prev + 1 : 0))
    setExpandedCardIndex(0)
  }

  // Swap tech spec images
  const swapTechSpecImages = () => {
    setTechSpecMainIndex((prev) => (prev === 0 ? 1 : 0))
  }

  // Parse title with /n line breaks
  const titleLines = title.split(/\/n|\\n/).map(line => line.trim()).filter(Boolean)

  return (
    <section
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #756F3F 0%, rgba(255, 227, 0, 0.3) 60%, rgba(255, 227, 0, 0) 100%)',
        }}
      />

      {/* ===== TITLE AREA ===== */}
      {/* Draggable Image List (behind title) */}
      <div
        ref={imageContainerRef}
        className="absolute flex gap-4 cursor-grab active:cursor-grabbing select-none"
        style={{
          left: `${(734 / DESIGN_WIDTH) * 100}%`,
          top: `${((2632 - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
          height: `${(412 / DESIGN_WIDTH) * 100}vw`,
          transform: `translateX(${currentTranslate}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          zIndex: 1,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {titleImages.map((img, index) => (
          <div
            key={`title-img-${index}`}
            className="relative flex-shrink-0 overflow-hidden bg-white pointer-events-none"
            style={{
              width: `${(650 / DESIGN_WIDTH) * 100}vw`,
              height: `${(412 / DESIGN_WIDTH) * 100}vw`,
              borderRadius: `${(30 / DESIGN_WIDTH) * 100}vw`,
            }}
          >
            <Image src={img} alt="" fill className="object-cover" draggable={false} />
          </div>
        ))}
      </div>

      {/* Main Title (above images, supports /n line breaks) */}
      <h2
        className="absolute font-anaheim font-extrabold"
        style={{
          left: `${(153 / DESIGN_WIDTH) * 100}%`,
          top: `${((2677 - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
          width: `${(851 / DESIGN_WIDTH) * 100}%`,
          fontSize: `${(128 / DESIGN_WIDTH) * 100}vw`,
          lineHeight: `${108 / 128}`,
          background: 'linear-gradient(to bottom, #FFFFFF, rgba(255, 250, 209, 0.48))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          zIndex: 2,
        }}
      >
        {titleLines.map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < titleLines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </h2>

      {/* ===== TECH SPEC AREA ===== */}
      {/* Tech Spec Background (left-side rounded corners) */}
      <div
        className="absolute"
        style={{
          left: `${(652 / DESIGN_WIDTH) * 100}%`,
          top: `${((3163 - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
          width: `${(1269 / DESIGN_WIDTH) * 100}vw`,
          height: `${(693 / DESIGN_WIDTH) * 100}vw`,
          backgroundColor: '#FFFDE9',
          borderTopLeftRadius: `${(30 / DESIGN_WIDTH) * 100}vw`,
          borderBottomLeftRadius: `${(30 / DESIGN_WIDTH) * 100}vw`,
        }}
      />

      {/* Tech Spec Left Images with Swap */}
      {techSpecImages.slice(0, 2).map((img, index) => {
        // Position config based on which image is "main"
        const isMain = index === techSpecMainIndex
        const mainPos = { x: 278, y: 3367, w: 316, h: 432, radius: 30 }
        const smallPos = { x: 157, y: 3538, w: 194, h: 221, radius: 18 }
        const pos = isMain ? mainPos : smallPos

        if (!img) return null

        return (
          <div
            key={`tech-img-${index}`}
            className="absolute overflow-hidden bg-white transition-all duration-500 ease-in-out"
            style={{
              left: `${(pos.x / DESIGN_WIDTH) * 100}%`,
              top: `${((pos.y - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
              width: `${(pos.w / DESIGN_WIDTH) * 100}vw`,
              height: `${(pos.h / DESIGN_WIDTH) * 100}vw`,
              borderRadius: `${(pos.radius / DESIGN_WIDTH) * 100}vw`,
              zIndex: isMain ? 1 : 2,
            }}
          >
            <Image src={img} alt="" fill className="object-cover" />
          </div>
        )
      })}

      {/* Tech Spec Image Swap Button */}
      {techSpecImages.length >= 2 && (
        <button
          className="absolute cursor-pointer z-10"
          style={{
            left: `${(236 / DESIGN_WIDTH) * 100}%`,
            top: `${((3217 - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
            width: `${(84 / DESIGN_WIDTH) * 100}vw`,
            height: `${(84 / DESIGN_WIDTH) * 100}vw`,
          }}
          onClick={swapTechSpecImages}
        >
          {/* White circle with arrow icon */}
          <svg
            className="w-full h-full"
            viewBox="0 0 85 85"
            fill="none"
          >
            <circle cx="42.1816" cy="42.1816" r="37.8399" transform="rotate(6.07406 42.1816 42.1816)" stroke="white"/>
            <path d="M58.047 41.8215L58.0462 41.7988C58.0309 41.4968 57.9237 41.2067 57.739 40.9672L57.7281 40.9533L57.7309 40.9573C57.6645 40.8621 57.5891 40.7737 57.5056 40.6931L57.4817 40.6705L46.4688 30.4222C45.7476 29.7511 44.6195 29.7923 43.9493 30.5143L43.9294 30.5361C43.2801 31.2588 43.3277 32.372 44.0415 33.0363L52.1138 40.548L28.0729 41.4272C27.2519 41.4572 26.6107 42.1479 26.6407 42.9697L26.6484 43.1781C26.6913 43.9881 27.3756 44.617 28.1885 44.5873L52.2294 43.7082L44.7273 51.7895C44.0571 52.5114 44.0984 53.6404 44.8195 54.3114C45.5406 54.9826 46.6687 54.9413 47.339 54.2194L57.5748 43.1932L57.5961 43.1699C57.6665 43.0913 57.7297 43.0067 57.7852 42.917L57.7991 42.8941L57.7963 42.8983C57.9756 42.6358 58.0658 42.3226 58.0538 42.0049L58.047 41.8215Z" fill="white"/>
          </svg>
        </button>
      )}

      {/* Tech Spec Title */}
      <h3
        className="absolute font-lilita-one"
        style={{
          left: `${(727 / DESIGN_WIDTH) * 100}%`,
          top: `${((3217 - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
          fontSize: `${(64 / DESIGN_WIDTH) * 100}vw`,
          lineHeight: `${57 / 64}`,
          background: 'linear-gradient(to right, #756F3F, #DBD076)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {techSpecTitle}
      </h3>

      {/* Tech Spec Items */}
      {techSpecItems.map((item, index) => {
        const yPositions = [3315, 3388, 3462, 3541, 3620, 3714]
        const valueYPositions = [3328, 3403, 3475, 3544, 3627, 3723]
        const separatorYPositions = [3377, 3454, 3531, 3608, 3702]

        return (
          <React.Fragment key={`spec-${index}`}>
            {/* Label */}
            <span
              className="absolute font-inter font-semibold text-[#464010]"
              style={{
                left: `${(727 / DESIGN_WIDTH) * 100}%`,
                top: `${((yPositions[index] - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
                fontSize: `${(24 / DESIGN_WIDTH) * 100}vw`,
                lineHeight: `${57 / 24}`,
              }}
            >
              {item.key}
            </span>

            {/* Value */}
            <span
              className="absolute font-inter text-black"
              style={{
                left: `${(1083 / DESIGN_WIDTH) * 100}%`,
                top: `${((valueYPositions[index] - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
                width: `${(707 / DESIGN_WIDTH) * 100}vw`,
                fontSize: `${(20 / DESIGN_WIDTH) * 100}vw`,
                lineHeight: `${30 / 20}`,
              }}
            >
              {item.value}
            </span>

            {/* Separator line */}
            {index < separatorYPositions.length && (
              <div
                className="absolute bg-[#DFD8B8]"
                style={{
                  left: `${(727 / DESIGN_WIDTH) * 100}%`,
                  top: `${((separatorYPositions[index] - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
                  width: `${(1030 / DESIGN_WIDTH) * 100}vw`,
                  height: '1px',
                }}
              />
            )}
          </React.Fragment>
        )
      })}

      {/* ===== PRODUCT ADVANTAGES AREA ===== */}
      {/* Advantages Title (behind image) */}
      <h3
        className="absolute font-josefin-sans font-bold text-[#464010]"
        style={{
          left: `${(153 / DESIGN_WIDTH) * 100}%`,
          top: `${((4087 - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
          width: `${(717 / DESIGN_WIDTH) * 100}%`,
          fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
          lineHeight: `${101 / 96}`,
        }}
      >
        {advantagesTitle || 'Product Advantages and Features'}
      </h3>

      {/* Advantages Main Image (overlaps title) */}
      {currentImage && (
        <div
          className="absolute overflow-hidden transition-all duration-500"
          style={{
            left: `${(468 / DESIGN_WIDTH) * 100}%`,
            top: `${((4016 - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
            width: `${(518 / DESIGN_WIDTH) * 100}vw`,
            height: `${(605 / DESIGN_WIDTH) * 100}vw`,
            borderRadius: `${(60 / DESIGN_WIDTH) * 100}vw`,
          }}
        >
          <Image src={currentImage} alt="" fill className="object-cover" />
          {/* White title overlay on image */}
          <div
            className="absolute font-josefin-sans font-bold text-white"
            style={{
              left: `${((153 - 468) / 518) * 100}%`,
              top: `${((4087 - 4016) / 605) * 100}%`,
              width: `${(717 / 518) * 100}%`,
              fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
              lineHeight: `${101 / 96}`,
            }}
          >
            {advantagesTitle || 'Product Advantages and Features'}
          </div>
        </div>
      )}

      {/* Category Section Title (dynamic based on current category) */}
      {/* Figma: x:1097, y:4072, width:511, height:30, fontSize:96, Jomhuria Regular */}
      <h4
        className="absolute text-black transition-all duration-300 whitespace-nowrap font-jomhuria"
        style={{
          left: `${(1097 / DESIGN_WIDTH) * 100}%`,
          top: `${((4040 - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
          fontSize: `${(96 / DESIGN_WIDTH) * 100}vw`,
          lineHeight: 1,
        }}
      >
        {currentCategoryData.title || 'Materials & Processes'}
      </h4>

      {/* Category Navigation Buttons (LEFT/RIGHT capsule style) */}
      {/* Position config - adjust these values to move buttons */}
      {(() => {
        // Button position config (in Figma design pixels)
        const NAV_BUTTON_LEFT_X = 153     // Left button X position
        const NAV_BUTTON_LEFT_Y = 4500    // Left button Y position
        const NAV_BUTTON_RIGHT_X = 360    // Right button X position
        const NAV_BUTTON_RIGHT_Y = 4430   // Right button Y position
        const NAV_BUTTON_WIDTH = 148      // Button width
        const NAV_BUTTON_HEIGHT = 61      // Button height

        return (
          <>
      {/* Left button - go to previous category */}
      <button
        className="absolute cursor-pointer group"
        style={{
          left: `${(NAV_BUTTON_LEFT_X / DESIGN_WIDTH) * 100}%`,
          top: `${((NAV_BUTTON_LEFT_Y - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
          width: `${(NAV_BUTTON_WIDTH / DESIGN_WIDTH) * 100}vw`,
          height: `${(NAV_BUTTON_HEIGHT / DESIGN_WIDTH) * 100}vw`,
        }}
        onClick={goToPrevCategory}
      >
        {/* Default state - dashed outline with left arrow */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
          viewBox="0 0 148 61"
          fill="none"
        >
          <path d="M43.6943 28.2695H126.695V32.7559H43.6943V37.2422L21.2627 30.5127L43.6943 23.7832V28.2695Z" fill="#BAB489"/>
          <rect x="1" y="1" width="146" height="59" rx="29.5" stroke="#BAB489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6"/>
        </svg>
        {/* Hover state - filled with left arrow */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          viewBox="0 0 146 58"
          fill="none"
        >
          <path d="M29 0C12.9837 1.35295e-06 0 12.9837 0 29C0 45.0163 12.9837 58 29 58H117C133.016 58 146 45.0163 146 29C146 12.9837 133.016 1.77172e-07 117 0H29ZM42.422 27.2812H125.423V31.7676H42.422V36.2539L19.99 29.5244L42.422 22.7949V27.2812Z" fill="#F1DC35"/>
        </svg>
      </button>

      {/* Right button - go to next category */}
      <button
        className="absolute cursor-pointer group"
        style={{
          left: `${(NAV_BUTTON_RIGHT_X / DESIGN_WIDTH) * 100}%`,
          top: `${((NAV_BUTTON_RIGHT_Y - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
          width: `${(NAV_BUTTON_WIDTH / DESIGN_WIDTH) * 100}vw`,
          height: `${(NAV_BUTTON_HEIGHT / DESIGN_WIDTH) * 100}vw`,
        }}
        onClick={goToNextCategory}
      >
        {/* Default state - dashed outline with right arrow */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
          viewBox="0 0 148 61"
          fill="none"
        >
          <path d="M104.306 28.2695H21.3047V32.7559H104.306V37.2422L126.737 30.5127L104.306 23.7832V28.2695Z" fill="#BAB489"/>
          <rect x="1" y="1" width="146" height="59" rx="29.5" stroke="#BAB489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6"/>
        </svg>
        {/* Hover state - filled with right arrow */}
        <svg
          className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          viewBox="0 0 146 58"
          fill="none"
        >
          <path d="M117 0C133.016 1.35295e-06 146 12.9837 146 29C146 45.0163 133.016 58 117 58H29C12.9837 58 0 45.0163 0 29C0 12.9837 12.9837 1.77172e-07 29 0H117ZM103.578 27.2812H20.5771V31.7676H103.578V36.2539L126.01 29.5244L103.578 22.7949V27.2812Z" fill="#F1DC35"/>
        </svg>
      </button>
          </>
        )
      })()}

      {/* Expandable Cards */}
      {currentCategoryData.cards.map((card, index) => {
        const isExpanded = expandedCardIndex === index
        // Calculate Y position based on previous cards
        let baseY = 4142
        for (let i = 0; i < index; i++) {
          baseY += expandedCardIndex === i ? 220 : 117
        }

        return (
          <div
            key={`card-${currentCategory}-${index}`}
            className="absolute cursor-pointer transition-all duration-500 ease-out"
            style={{
              left: `${(1076 / DESIGN_WIDTH) * 100}%`,
              top: `${((baseY - SECTION_Y_OFFSET) / DESIGN_HEIGHT) * 100}%`,
              width: `${(681 / DESIGN_WIDTH) * 100}vw`,
              height: isExpanded ? `${(208 / DESIGN_WIDTH) * 100}vw` : `${(105 / DESIGN_WIDTH) * 100}vw`,
              borderRadius: `${(52.5 / DESIGN_WIDTH) * 100}vw`,
              backgroundColor: isExpanded ? '#F5EB99' : 'transparent',
              border: '2px solid #756F3F',
            }}
            onClick={() => setExpandedCardIndex(index)}
          >
            {/* Card Title */}
            <span
              className="absolute font-inter font-bold text-[#464010] transition-all duration-300"
              style={{
                left: `${(43 / 681) * 100}%`,
                top: isExpanded ? `${(36 / 208) * 100}%` : '50%',
                transform: isExpanded ? 'none' : 'translateY(-50%)',
                fontSize: `${(28 / DESIGN_WIDTH) * 100}vw`,
                lineHeight: `${30 / 28}`,
              }}
            >
              {card.title}
            </span>

            {/* Card Content (only when expanded) */}
            {isExpanded && card.content && (
              <span
                className="absolute font-inter text-[#928E66] transition-opacity duration-300"
                style={{
                  left: `${(43 / 681) * 100}%`,
                  top: `${(86 / 208) * 100}%`,
                  width: `${(559 / 681) * 100}%`,
                  fontSize: `${(20 / DESIGN_WIDTH) * 100}vw`,
                  lineHeight: `${23 / 20}`,
                }}
              >
                {card.content}
              </span>
            )}

            {/* Arrow Icon */}
            <div
              className="absolute transition-transform duration-300"
              style={{
                right: `${(24 / 681) * 100}%`,
                top: '50%',
                transform: `translateY(-50%) rotate(${isExpanded ? '180deg' : '0deg'})`,
                width: `${(52 / DESIGN_WIDTH) * 100}vw`,
                height: `${(52 / DESIGN_WIDTH) * 100}vw`,
              }}
            >
              <svg
                className="w-full h-full"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path d="M32 16C32 7.16344 24.8366 3.13124e-07 16 6.99382e-07C7.16344 1.08564e-06 -1.08564e-06 7.16345 -6.99382e-07 16C-3.13124e-07 24.8366 7.16344 32 16 32C24.8366 32 32 24.8366 32 16ZM21.4863 19L16.2041 13.75L10.9229 19L10 18.1055L16.2041 11.8613L22.4082 18.1055L21.4863 19Z" fill="#756F3F"/>
              </svg>
            </div>
          </div>
        )
      })}
    </section>
  )
}

export default CoreSellingPoints
