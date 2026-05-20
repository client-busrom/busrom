'use client'

import React, { useState, useEffect } from 'react'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

interface SpecificationItem {
  text?: string
  value?: Record<string, string>
  color?: string
  image?: any
}

interface SpecificationGroup {
  text?: string
  name?: Record<string, string>
  description?: string
  items?: SpecificationItem[]
  options?: SpecificationItem[]
}

interface ProductSpecificationsProps {
  specifications: any
  locale: string
}

export const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  specifications,
  locale
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({})

  // Initialize selection state: default to first item in each group
  useEffect(() => {
    const specsArray = Array.isArray(specifications)
      ? specifications
      : (specifications?.[locale] || specifications?.["en"] || [])

    if (Array.isArray(specsArray)) {
      const initial: Record<number, number> = {}
      specsArray.forEach((_, idx) => {
        initial[idx] = 0
      })
      setSelectedOptions(initial)
    }
  }, [specifications, locale])

  // Normalize specs data
  const specs = Array.isArray(specifications)
    ? specifications
    : (specifications?.[locale] || specifications?.["en"] || [])

  if (!specs || specs.length === 0) return null

  const handleSelect = (groupIdx: number, itemIdx: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupIdx]: itemIdx
    }))
  }

  return (
    <div className="flex flex-col gap-6">
      {specs.map((spec: SpecificationGroup, idx: number) => {
        const specName = spec.text || spec.name?.[locale] || spec.name?.en || ""

        return (
          <div key={idx} className="flex flex-col gap-2">
            {/* Header Area */}
            <div className="text-base font-bold text-brand-text-black">
              {specName}
              {spec.description && (
                <span className="text-brand-text-main opacity-50 font-medium text-sm ml-1">
                  : {spec.description}
                </span>
              )}
            </div>
            
            <div className="mt-0"> {/* Empty placeholder to maintain spacing logic if needed */}
            </div>
            
            {(() => {
              const items = spec.items || spec.options || []
              const hasVisualsInGroup = items.some((i: any) => !!i.image || (i.color && i.color.trim() !== ''))
              
              // Calculate column class based on max text length for text-only groups
              let isFlexLayout = false
              let layoutClass = "grid grid-cols-3 gap-2.5"
              
              if (!hasVisualsInGroup) {
                const maxTextLength = items.reduce((max: number, item: any) => {
                  const itemText = item.text || item.value?.[locale] || item.value?.en || ""
                  return Math.max(max, itemText.length)
                }, 0)
                
                if (maxTextLength > 8) {
                  layoutClass = "flex flex-wrap gap-2.5"
                  isFlexLayout = true
                }
              } else {
                layoutClass = "grid grid-cols-2 gap-4"
              }
              
              return (
                <div className={layoutClass}>
                  {items.map((item: any, itemIdx: number) => {
                    const hasColor = !!(item.color && item.color.trim() !== '')
                    const hasImage = !!item.image
                    const itemText = item.text || item.value?.[locale] || item.value?.en || ""
                    const isSelected = selectedOptions[idx] === itemIdx

                    if (hasVisualsInGroup) {
                      // Visual Card Style (Fluid width, dynamic auto height)
                      return (
                        <div
                          key={itemIdx}
                          onClick={() => handleSelect(idx, itemIdx)}
                          className={`relative w-full min-h-[122px] p-4 rounded-xl border-2 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-2 ${
                            isSelected 
                              ? "bg-white border-brand-accent-gold shadow-sm" 
                              : "bg-white border-brand-accent-border/30 hover:border-brand-accent-gold/50"
                          }`}
                        >
                          {(hasColor || hasImage) && (
                            <div className={`relative flex items-center justify-center shrink-0 ${
                              hasColor 
                                ? 'w-10 h-10 rounded-full overflow-hidden border shadow-sm' 
                                : 'w-[82px] h-[62px]'
                            }`}>
                              {hasColor ? (
                                <div className="w-full h-full" style={{ backgroundColor: item.color }} />
                              ) : (
                                <OptimizedImage
                                  image={item.image}
                                  alt={itemText}
                                  width={82}
                                  height={62}
                                  objectFit="contain"
                                  className="w-full h-full object-contain"
                                  size="small"
                                />
                              )}
                            </div>
                          )}
                          <span className={`text-xs font-bold leading-tight transition-colors whitespace-normal break-words ${
                            isSelected ? 'text-brand-accent-gold' : 'text-brand-text-main/80 group-hover:text-brand-text-main'
                          }`}>
                            {itemText}
                          </span>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 bg-brand-accent-gold rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      )
                    }

                    // Text-Only Tag Style (Fluid width/fit-content, dynamic auto height)
                    return (
                      <div
                        key={itemIdx}
                        onClick={() => handleSelect(idx, itemIdx)}
                        className={`relative min-h-[52px] px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center text-center ${
                          isSelected 
                            ? "bg-white border-brand-accent-gold shadow-sm" 
                            : "bg-white border-brand-accent-border/30 hover:border-brand-accent-gold/50"
                        } ${isFlexLayout ? 'w-fit max-w-full min-w-[80px]' : 'w-full'}`}
                      >
                        <span className={`text-xs font-bold transition-colors whitespace-normal break-words leading-tight ${
                          isSelected ? 'text-brand-accent-gold' : 'text-brand-text-main/80 group-hover:text-brand-text-main'
                        }`}>
                          {itemText}
                        </span>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-accent-gold rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        )
      })}
    </div>
  )
}
