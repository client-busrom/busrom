"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  totalResults: number
}

export function ProductSearch({
  searchQuery,
  onSearchChange,
  totalResults,
}: ProductSearchProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-8">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className={cn(
            "w-full pl-10 pr-4 py-2 border-b bg-transparent",
            "focus:outline-none focus:ring-0 focus:border-brand-text-black transition-all",
            "outline-none ring-0",
            isSearchFocused ? "border-brand-text-black" : "border-brand-accent-border",
            "text-brand-text-black placeholder:text-brand-accent-gold"
          )}
          style={{ outline: 'none', boxShadow: 'none' }}
        />
        <svg
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
            isSearchFocused ? "text-brand-text-black" : "text-brand-accent-gold"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Results Count */}
      <div className="flex items-center">
        <span className="text-xs text-brand-accent-gold whitespace-nowrap uppercase tracking-wider">
          {totalResults} product{totalResults !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  )
}
