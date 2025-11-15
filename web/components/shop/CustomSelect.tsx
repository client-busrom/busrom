"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 找到当前选中的选项
  const selectedOption = options.find((opt) => opt.value === value)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // 阻止 Lenis 滚动冲突
  useEffect(() => {
    const dropdownEl = dropdownRef.current

    const stopPropagation = (event: WheelEvent | TouchEvent) => {
      event.stopPropagation()
    }

    if (isOpen && dropdownEl) {
      dropdownEl.addEventListener('wheel', stopPropagation, { passive: false })
      dropdownEl.addEventListener('touchmove', stopPropagation, { passive: false })
    }

    return () => {
      if (dropdownEl) {
        dropdownEl.removeEventListener('wheel', stopPropagation)
        dropdownEl.removeEventListener('touchmove', stopPropagation)
      }
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* 选择器按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-0 py-0 bg-transparent text-brand-text-black text-sm focus:outline-none text-left flex items-center justify-between"
      >
        <span className={cn(!selectedOption && "text-brand-accent-gold")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={cn(
            "w-4 h-4 ml-2 transition-transform duration-200",
            isOpen && "rotate-180"
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

      {/* 下拉选项 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-background border border-brand-accent-border shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                "w-full px-4 py-3 text-left text-sm transition-colors border-b border-brand-accent-border last:border-b-0",
                option.value === value
                  ? "bg-brand-text-black text-white"
                  : "text-brand-text-black hover:bg-brand-accent-border/20"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
