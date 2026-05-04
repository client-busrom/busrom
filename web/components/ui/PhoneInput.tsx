"use client"

import React, { useState, useRef, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { CountryFlag } from "@/components/ui/CountryFlag"
import { ChevronDown, Search } from "lucide-react"

// Country data: [name, iso2, dialCode]
export const COUNTRIES: [string, string, string][] = [
  ["United States", "US", "1"],
  ["China", "CN", "86"],
  ["United Kingdom", "GB", "44"],
  ["Germany", "DE", "49"],
  ["France", "FR", "33"],
  ["Italy", "IT", "39"],
  ["Spain", "ES", "34"],
  ["Canada", "CA", "1"],
  ["Australia", "AU", "61"],
  ["Brazil", "BR", "55"],
  ["Mexico", "MX", "52"],
  ["Japan", "JP", "81"],
  ["South Korea", "KR", "82"],
  ["India", "IN", "91"],
  ["Russia", "RU", "7"],
  ["Turkey", "TR", "90"],
  ["Saudi Arabia", "SA", "966"],
  ["United Arab Emirates", "AE", "971"],
  ["Qatar", "QA", "974"],
  ["Kuwait", "KW", "965"],
  ["Bahrain", "BH", "973"],
  ["Oman", "OM", "968"],
  ["Israel", "IL", "972"],
  ["Egypt", "EG", "20"],
  ["South Africa", "ZA", "27"],
  ["Nigeria", "NG", "234"],
  ["Argentina", "AR", "54"],
  ["Colombia", "CO", "57"],
  ["Chile", "CL", "56"],
  ["Peru", "PE", "51"],
  ["Netherlands", "NL", "31"],
  ["Belgium", "BE", "32"],
  ["Switzerland", "CH", "41"],
  ["Austria", "AT", "43"],
  ["Sweden", "SE", "46"],
  ["Norway", "NO", "47"],
  ["Denmark", "DK", "45"],
  ["Finland", "FI", "358"],
  ["Poland", "PL", "48"],
  ["Czech Republic", "CZ", "420"],
  ["Hungary", "HU", "36"],
  ["Ireland", "IE", "353"],
  ["Portugal", "PT", "351"],
  ["Greece", "GR", "30"],
  ["Romania", "RO", "40"],
  ["Thailand", "TH", "66"],
  ["Vietnam", "VN", "84"],
  ["Philippines", "PH", "63"],
  ["Indonesia", "ID", "62"],
  ["Malaysia", "MY", "60"],
  ["Singapore", "SG", "65"],
  ["New Zealand", "NZ", "64"],
  ["Pakistan", "PK", "92"],
  ["Bangladesh", "BD", "880"],
  ["Ukraine", "UA", "380"],
  ["Morocco", "MA", "212"],
  ["Algeria", "DZ", "213"],
  ["Tunisia", "TN", "216"],
  ["Iran", "IR", "98"],
  ["Iraq", "IQ", "964"],
  ["Jordan", "JO", "962"],
  ["Lebanon", "LB", "961"],
  ["Panama", "PA", "507"],
  ["Costa Rica", "CR", "506"],
  ["Uruguay", "UY", "598"],
  ["Dominican Republic", "DO", "1"],
  ["Iceland", "IS", "354"],
  ["Luxembourg", "LU", "352"],
  ["Slovakia", "SK", "421"],
  ["Croatia", "HR", "385"],
  ["Serbia", "RS", "381"],
  ["Bulgaria", "BG", "359"],
  ["Slovenia", "SI", "386"],
  ["Lithuania", "LT", "370"],
  ["Latvia", "LV", "371"],
  ["Estonia", "EE", "372"],
  ["Cyprus", "CY", "357"],
  ["Malta", "MT", "356"],
  ["Georgia", "GE", "995"],
  ["Azerbaijan", "AZ", "994"],
  ["Kenya", "KE", "254"],
  ["Ghana", "GH", "233"],
  ["Tanzania", "TZ", "255"],
  ["Ethiopia", "ET", "251"],
  ["Cambodia", "KH", "855"],
  ["Myanmar", "MM", "95"],
  ["Sri Lanka", "LK", "94"],
  ["Nepal", "NP", "977"],
  ["Mongolia", "MN", "976"],
  ["Taiwan", "TW", "886"],
  ["Hong Kong", "HK", "852"],
  ["Macau", "MO", "853"],
]

interface PhoneInputProps {
  value: string
  onChange: (phone: string) => void
  placeholder?: string
  className?: string
  containerClassName?: string
  buttonClassName?: string
  inputClassName?: string
  dropdownClassName?: string
  searchInputClassName?: string
  countryItemClassName?: string
  dialCodeClassName?: string
  chevronClassName?: string
  error?: boolean
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
  style?: React.CSSProperties
  inputStyle?: React.CSSProperties
  dialCodeStyle?: React.CSSProperties
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Phone number",
  className,
  containerClassName,
  buttonClassName,
  inputClassName,
  dropdownClassName,
  searchInputClassName,
  countryItemClassName,
  dialCodeClassName,
  chevronClassName,
  error,
  disabled,
  required,
  name,
  id,
  style,
  inputStyle,
  dialCodeStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<[string, string, string]>(COUNTRIES[0])
  const [phoneNumber, setPhoneNumber] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Parse initial value (e.g. "+8613800138000")
  useEffect(() => {
    if (value && !phoneNumber) {
      const cleanValue = value.startsWith('+') ? value.slice(1) : value
      // Try to match country by dial code (longest match first)
      const sortedCountries = [...COUNTRIES].sort((a, b) => b[2].length - a[2].length)
      for (const country of sortedCountries) {
        if (cleanValue.startsWith(country[2])) {
          setSelectedCountry(country)
          setPhoneNumber(cleanValue.slice(country[2].length))
          return
        }
      }
      setPhoneNumber(cleanValue)
    }
  }, []) // Only on mount

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Lenis scroll prevention
  useEffect(() => {
    const el = listRef.current
    if (!el) return

    const stopPropagation = (e: WheelEvent | TouchEvent) => {
      e.stopPropagation()
    }

    if (isOpen) {
      el.addEventListener('wheel', stopPropagation, { passive: false })
      el.addEventListener('touchmove', stopPropagation, { passive: false })
    }

    return () => {
      el.removeEventListener('wheel', stopPropagation)
      el.removeEventListener('touchmove', stopPropagation as any)
    }
  }, [isOpen])

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d]/g, '')
    setPhoneNumber(newNumber)
    onChange(`+${selectedCountry[2]}${newNumber}`)
  }

  const handleCountrySelect = (country: [string, string, string]) => {
    setSelectedCountry(country)
    setIsOpen(false)
    setSearch("")
    onChange(`+${country[2]}${phoneNumber}`)
  }

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
      className={cn("relative w-full transition-all", className?.includes('z-') ? "" : (isOpen ? "z-[1001]" : "z-10"), containerClassName)} 
      ref={dropdownRef} 
      data-lenis-prevent 
      style={{ 
        ...style, 
        height: style?.height || '100%', 
        background: 'transparent',
        '--text-color': style?.color || 'white'
      } as any}
    >
      <div 
        className={cn(
          "w-full h-full overflow-hidden flex items-center transition-all",
          !className?.includes('bg-') && !style?.background && "bg-white",
          !className?.includes('border-') && !style?.border && "border-none",
          !className?.includes('rounded-') && !style?.borderRadius && "rounded-lg",
          className
        )}
        style={{ background: style?.background, borderRadius: style?.borderRadius }}
      >
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "h-full flex items-center px-3 md:px-5 lg:px-[0.8333vw] transition-all",
            !buttonClassName?.includes('hover:') && "hover:bg-transparent",
            !className?.includes('border-') && "border-r",
            dialCodeClassName?.includes('border-') ? "" : "border-r-gray-200",
            buttonClassName
          )}
        >
          <CountryFlag 
            countryCode={selectedCountry[1]} 
            className="w-6 h-4 md:w-9 md:h-6 lg:w-[1.458vw] lg:h-[0.9375vw] rounded-sm flex-shrink-0" 
          />
          <span className={cn("ml-2 md:ml-3 font-semibold text-base md:text-[24px] lg:text-[0.8333vw]", dialCodeClassName)} style={{ color: 'var(--text-color)', ...dialCodeStyle }}>
            +{selectedCountry[2]}
          </span>
          <ChevronDown 
            className={cn("w-4 h-4 md:w-6 md:h-6 lg:w-[0.9375vw] lg:h-[0.9375vw] transition-transform ml-1", isOpen && "rotate-180", !chevronClassName?.includes('text-') && !style?.color && "text-white", chevronClassName)} 
            style={{ color: 'var(--text-color)' }}
          />
        </button>

        {/* Phone number input */}
        <input
          type="tel"
          id={id}
          name={name}
          required={required}
          disabled={disabled}
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          spellCheck="false"
          className={cn(
            "flex-1 min-w-0 px-4 md:px-6 lg:px-[0.8333vw] py-2.5 font-semibold text-base md:text-[24px] lg:text-[0.8333vw] h-full",
            !inputClassName?.includes('bg-') && "bg-white",
            !inputClassName?.includes('text-') && "text-brand-text-black",
            !inputClassName?.includes('placeholder:') && "placeholder:text-gray-400",
            "focus:outline-none",
            disabled && "cursor-not-allowed",
            inputClassName
          )}
          style={inputStyle}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute left-0 top-full mt-1 w-full border shadow-xl z-[1002] overflow-hidden",
            !dropdownClassName?.includes('bg-') && "bg-white",
            !dropdownClassName?.includes('border-') && "border-gray-200",
            !dropdownClassName?.includes('rounded-') && "rounded-lg",
            dropdownClassName
          )}
          style={{ maxHeight: '320px' }}
        >
          {/* Search */}
          <div className={cn("p-2 border-b", !dropdownClassName?.includes('border-') ? "border-gray-100" : "border-inherit")}>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                spellCheck="false"
                className={cn(
                  "w-full pl-8 pr-3 py-2 text-base rounded-md focus:outline-none",
                  !searchInputClassName?.includes('bg-') && "bg-white",
                  !searchInputClassName?.includes('border-') && "border border-gray-200",
                  !searchInputClassName?.includes('text-') && "text-brand-text-black",
                  searchInputClassName
                )}
              />
            </div>
          </div>

          {/* Country list */}
          <div
            ref={listRef}
            className="overflow-y-auto scrollbar-hide"
            style={{ maxHeight: '260px' }}
            data-lenis-prevent
          >
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">No results found</div>
            ) : (
              filteredCountries.map(([countryName, iso2, dialCode], index) => (
                <button
                  key={`${iso2}-${index}`}
                  type="button"
                  onClick={() => handleCountrySelect([countryName, iso2, dialCode])}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3.5 text-left transition-all",
                    !countryItemClassName?.includes('bg-') ? "hover:bg-white/5" : "hover:bg-black/5",
                    !countryItemClassName?.includes('text-') && "text-brand-text-black",
                    countryItemClassName
                  )}
                >
                  <CountryFlag countryCode={iso2} className="w-6 h-5 rounded-sm flex-shrink-0" />
                  <span className="text-sm font-semibold truncate flex-1 leading-tight">{countryName}</span>
                  <span className="text-xs opacity-50 font-medium flex-shrink-0">+{dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
