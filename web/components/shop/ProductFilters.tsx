"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { ProductSeries, ProductSortField, ProductSortDirection } from "@/lib/types/product"

interface ProductFiltersProps {
  series: ProductSeries[]
  selectedSeries: string[]
  onSeriesChange: (series: string[]) => void
  locale: string
  sortBy: ProductSortField
  sortDirection: ProductSortDirection
  onSortChange: (sortBy: ProductSortField, direction: ProductSortDirection) => void
}

export function ProductFilters({
  series,
  selectedSeries,
  onSeriesChange,
  locale,
  sortBy,
  sortDirection,
  onSortChange,
}: ProductFiltersProps) {
  const [isSeriesOpen, setIsSeriesOpen] = useState(true)
  const [isSortOpen, setIsSortOpen] = useState(true)

  const selectSeries = (seriesSlug: string) => {
    // 单选逻辑：如果点击已选中的，则取消选择；否则选择新的
    if (selectedSeries.includes(seriesSlug)) {
      onSeriesChange([])
    } else {
      onSeriesChange([seriesSlug])
    }
  }

  const clearFilters = () => {
    onSeriesChange([])
  }

  const hasActiveFilters = selectedSeries.length > 0

  const sortOptions: Array<{
    label: string
    value: ProductSortField
    direction: ProductSortDirection
  }> = [
    { label: "Default Order", value: "order", direction: "ASC" },
    { label: "Newest First", value: "createdAt", direction: "DESC" },
    { label: "Oldest First", value: "createdAt", direction: "ASC" },
    { label: "Recently Updated", value: "updatedAt", direction: "DESC" },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-accent-border">
        <h3 className="font-anaheim font-bold text-lg text-brand-text-black uppercase tracking-wider">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-brand-secondary hover:text-brand-text-black transition-colors uppercase tracking-wider"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Sort Section */}
      <div className="mb-6">
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center justify-between w-full mb-4 pb-3 border-b border-brand-accent-border"
        >
          <h4 className="font-anaheim font-semibold text-sm text-brand-text-black uppercase tracking-wider">
            Sort By
          </h4>
          <svg
            className={cn(
              "w-4 h-4 transition-transform text-brand-text-black",
              isSortOpen ? "rotate-180" : ""
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isSortOpen && (
          <div className="space-y-3">
            {sortOptions.map((option, index) => {
              const isSelected = option.value === sortBy && option.direction === sortDirection

              return (
                <label
                  key={index}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="sort"
                      checked={isSelected}
                      onChange={() => onSortChange(option.value, option.direction)}
                      className="w-4 h-4 appearance-none border border-brand-accent-border checked:bg-brand-secondary checked:border-brand-secondary focus:outline-none focus:ring-0 transition-colors cursor-pointer"
                    />
                    {isSelected && (
                      <div className="absolute w-2 h-2 bg-white pointer-events-none" />
                    )}
                  </div>
                  <span className="text-sm text-brand-text-black group-hover:text-brand-secondary transition-colors">
                    {option.label}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Series Filter */}
      <div className="mb-6">
        <button
          onClick={() => setIsSeriesOpen(!isSeriesOpen)}
          className="flex items-center justify-between w-full mb-4 pb-3 border-b border-brand-accent-border"
        >
          <h4 className="font-anaheim font-semibold text-sm text-brand-text-black uppercase tracking-wider">
            Product Series
          </h4>
          <svg
            className={cn(
              "w-4 h-4 transition-transform text-brand-text-black",
              isSeriesOpen ? "rotate-180" : ""
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isSeriesOpen && (
          <div className="space-y-3">
            {series.map((s) => {
              const isSelected = selectedSeries.includes(s.slug)
              const displayName = s.name?.[locale] || s.name?.["en"] || s.slug

              return (
                <label
                  key={s.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="product-series"
                      checked={isSelected}
                      onChange={() => selectSeries(s.slug)}
                      className="w-4 h-4 appearance-none border border-brand-accent-border checked:bg-brand-secondary checked:border-brand-secondary focus:outline-none focus:ring-0 transition-colors cursor-pointer"
                    />
                    {isSelected && (
                      <div className="absolute w-2 h-2 bg-white pointer-events-none" />
                    )}
                  </div>
                  <span className="text-sm text-brand-text-black group-hover:text-brand-secondary transition-colors">
                    {displayName}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Active Filters Count */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-brand-accent-border">
          <p className="text-xs text-brand-accent-gold uppercase tracking-wider">
            {selectedSeries.length} filter{selectedSeries.length > 1 ? "s" : ""} applied
          </p>
        </div>
      )}
    </div>
  )
}
