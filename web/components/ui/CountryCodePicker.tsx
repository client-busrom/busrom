"use client"

import React, { useState, useRef, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { CountryFlag } from "@/components/ui/CountryFlag"
import { Search } from "lucide-react"
import { COUNTRIES } from "./PhoneInput"

const DESIGN_WIDTH = 1920;
const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`;

interface CountrySelectorListProps {
  onSelect: (country: [string, string, string]) => void;
  onClose: () => void;
  className?: string;
}

/**
 * Universal Country Selector List
 * Purely handles the search and selection of country codes.
 * Decoupled from any trigger button or input field.
 */
export const CountrySelectorList: React.FC<CountrySelectorListProps> = ({
  onSelect,
  onClose,
  className,
}) => {
  const [search, setSearch] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search on mount
  useEffect(() => {
    const timer = setTimeout(() => searchInputRef.current?.focus(), 50)
    return () => clearTimeout(timer)
  }, [])

  const filteredCountries = search
    ? COUNTRIES.filter(
        ([name, iso2, dialCode]) =>
          name.toLowerCase().includes(search.toLowerCase()) ||
          iso2.toLowerCase().includes(search.toLowerCase()) ||
          dialCode.includes(search)
      )
    : COUNTRIES

  return (
    <div
      className={cn(
        "flex flex-col shadow-2xl overflow-hidden",
        "bg-[#3d3713] border border-white/20 rounded-[0.8vw]",
        className
      )}
      data-lenis-prevent
    >
      {/* Search Area */}
      <div className="p-[0.6vw] border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-[0.6vw] top-1/2 -translate-y-1/2 w-[0.9vw] h-[0.9vw] text-white/40" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country..."
            className="w-full pl-[2vw] pr-[0.8vw] py-[0.5vw] text-[0.9vw] bg-white/5 border border-white/10 rounded-[0.4vw] text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
      </div>

      {/* List Area */}
      <div
        ref={listRef}
        className="overflow-y-auto max-h-[15vw] no-scrollbar"
      >
        {filteredCountries.length === 0 ? (
          <div className="px-[1vw] py-[1.5vw] text-[0.8vw] text-white/40 text-center">
            No results found
          </div>
        ) : (
          filteredCountries.map((country, index) => (
            <button
              key={`${country[1]}-${index}`}
              type="button"
              onClick={() => {
                onSelect(country)
                onClose()
              }}
              className="w-full flex items-center gap-[0.8vw] px-[1vw] py-[0.8vw] text-left transition-all hover:bg-white/10"
            >
              <CountryFlag countryCode={country[1]} className="w-[1.4vw] h-[1vw] rounded-[0.1vw] flex-shrink-0" />
              <span className="text-[0.8vw] font-medium text-white/90 truncate flex-1">
                {country[0]}
              </span>
              <span className="text-[0.7vw] text-white/40 font-mono">
                +{country[2]}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
