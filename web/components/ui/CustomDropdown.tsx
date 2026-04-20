"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomDropdownProps {
  options: { label: string; value: string }[]
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
  buttonClassName?: string
  listClassName?: string
  itemClassName?: string
  containerClassName?: string
  style?: React.CSSProperties
}

/**
 * Premium Custom Dropdown Component
 * Features conditional default styling based on incoming className.
 */
export function CustomDropdown({
  options,
  placeholder = "Select...",
  value,
  onChange,
  className,
  buttonClassName,
  listClassName,
  itemClassName,
  containerClassName,
  style,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options?.find((opt) => opt.value === value)

  return (
    <div 
      className={cn("relative w-full h-full transition-all", className?.includes('z-') ? "" : (isOpen ? "z-[1001]" : "z-10"), containerClassName)} 
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
          "w-full h-full overflow-hidden transition-all",
          !className?.includes('bg-') && !style?.background && "bg-white",
          !className?.includes('border-') && !style?.border && "border-none", 
          !className?.includes('rounded-') && !style?.borderRadius && "rounded-lg",
          className
        )}
        style={{ 
          background: style?.background,
          borderRadius: style?.borderRadius || (style as any)?.borderRadius 
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-between w-full h-full px-4 bg-transparent focus:outline-none transition-all",
            buttonClassName
          )}
        >
          <span className={cn(
            "font-semibold truncate",
            !buttonClassName?.includes('text-') && !style?.color && "text-white",
            !buttonClassName?.includes('text-') && !style?.color && !selectedOption && "opacity-50"
          )}
          style={{ color: 'var(--text-color)' }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            className={cn(
              "w-[1.25vw] h-[1.25vw] transition-transform flex-shrink-0",
              isOpen && "rotate-180",
              !buttonClassName?.includes('text-') && !style?.color && "text-white opacity-50"
            )} 
            style={{ color: 'var(--text-color)' }}
          />
        </button>
      </div>

      {isOpen && (
        <div 
          ref={listRef}
          className={cn(
            "absolute left-0 top-[calc(100%+4px)] w-full shadow-2xl z-50 max-h-[15vw] overflow-y-auto no-scrollbar border border-white/20",
            !listClassName?.includes('bg-') && "bg-[#3d3713]",
            !listClassName?.includes('rounded-') && "rounded-lg",
            listClassName
          )}
        >
          {options?.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-white/10 transition-colors font-medium",
                !itemClassName?.includes('text-') && "text-white/80",
                itemClassName
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
