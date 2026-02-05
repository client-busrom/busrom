"use client"

import React, { useState, useRef, useCallback } from "react"
import { BrandServicesSectionProps } from "./types"
import { MobileLayout } from "./MobileLayout"
import { DesktopTopSection } from "./DesktopTopSection"
import { DesktopBottomSection } from "./DesktopBottomSection"

export function BrandServicesSection({
  title = "Brand Services",
  description = "Our service blends creative strategy with flawless execution to define your story, design your identity, and amplify your presence.",
  categories,
  categoryImages,
}: BrandServicesSectionProps) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(null)
  const mobileItemSectionRef = useRef<HTMLDivElement>(null)
  const desktopItemSectionRef = useRef<HTMLElement>(null)

  const activeCategory = categories[activeCategoryIndex]

  // Handle category button click - scroll to item section
  const handleCategoryClick = (index: number) => {
    setActiveCategoryIndex(index)
    setExpandedItemIndex(null)
    if (window.innerWidth >= 1024) {
      desktopItemSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    } else {
      mobileItemSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
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

  // Handle prev/next item for expanded card navigation
  const handlePrevItem = useCallback(() => {
    if (expandedItemIndex === null) return
    const totalItems = activeCategory?.items.length || 0
    setExpandedItemIndex((prev) => {
      if (prev === null || prev === 0) return totalItems - 1
      return prev - 1
    })
  }, [expandedItemIndex, activeCategory?.items.length])

  const handleNextItem = useCallback(() => {
    if (expandedItemIndex === null) return
    const totalItems = activeCategory?.items.length || 0
    setExpandedItemIndex((prev) => {
      if (prev === null || prev === totalItems - 1) return 0
      return prev + 1
    })
  }, [expandedItemIndex, activeCategory?.items.length])

  // If no categories, don't render
  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <>
      {/* Mobile Layout */}
      <MobileLayout
        title={title}
        description={description}
        categories={categories}
        categoryImages={categoryImages}
        activeCategoryIndex={activeCategoryIndex}
        setActiveCategoryIndex={setActiveCategoryIndex}
        expandedItemIndex={expandedItemIndex}
        setExpandedItemIndex={setExpandedItemIndex}
        mobileItemSectionRef={mobileItemSectionRef}
      />

      {/* Desktop Layout */}
      <DesktopTopSection
        title={title}
        description={description}
        categories={categories}
        categoryImages={categoryImages}
        activeCategoryIndex={activeCategoryIndex}
        setActiveCategoryIndex={setActiveCategoryIndex}
        onCategoryClick={handleCategoryClick}
      />

      <DesktopBottomSection
        categories={categories}
        activeCategoryIndex={activeCategoryIndex}
        expandedItemIndex={expandedItemIndex}
        setExpandedItemIndex={setExpandedItemIndex}
        onPrevCategory={handlePrevCategory}
        onNextCategory={handleNextCategory}
        onPrevItem={handlePrevItem}
        onNextItem={handleNextItem}
        desktopItemSectionRef={desktopItemSectionRef}
      />
    </>
  )
}

// Re-export types for external use
export type { BrandServicesSectionProps, ServiceCategory, CategoryImages, MediaObject, ServiceItem } from "./types"
