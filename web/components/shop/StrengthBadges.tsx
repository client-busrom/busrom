"use client"

import React from "react"
import { Users, Shield, Truck, Leaf } from "lucide-react"
import { IconifyIcon } from "@/components/ui/IconifyIcon"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

interface StrengthItem {
  icon?: string
  image?: any
  title: string
  subtitle?: string
}

interface StrengthBadgesProps {
  items?: StrengthItem[]
}

// Default strength items matching the design
const defaultItems: StrengthItem[] = [
  { icon: "users", title: "100K+", subtitle: "Happy Customers" },
  { icon: "shield", title: "10 Year", subtitle: "Warranty" },
  { icon: "truck", title: "Free", subtitle: "Delivery" },
  { icon: "leaf", title: "Sustainable", subtitle: "Aluminum" },
]

// Default icons in order (used when no image is provided)
const defaultIcons = [Users, Shield, Truck, Leaf]

export function StrengthBadges({ items }: StrengthBadgesProps) {
  // If no items configured, don't render the component
  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-4 gap-x-2 gap-y-6 py-4">
      {items.slice(0, 8).map((item, index) => {
        // Use default icon based on position if no image
        const DefaultIcon = defaultIcons[index % 4] || Users

        return (
          <div key={index} className="flex flex-col items-center text-center min-w-0">
            {/* Icon/Image Container */}
            <div className="h-12 md:h-14 flex items-center justify-center mb-2">
              {item.image ? (
                <OptimizedImage
                  image={item.image}
                  alt={item.title}
                  className="h-9 md:h-11 w-auto"
                  objectFit="contain"
                  size="small"
                />
              ) : (
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#e8e4d9] flex items-center justify-center overflow-hidden">
                  {item.icon ? (
                    typeof item.icon === 'object' ? (
                      <OptimizedImage
                        image={item.icon}
                        alt={item.title}
                        className="h-6 w-6 md:h-8 md:w-8"
                        objectFit="contain"
                        size="small"
                      />
                    ) : (
                      <IconifyIcon name={item.icon} size={24} color="#5d6b4a" />
                    )
                  ) : (
                    <DefaultIcon className="text-[#5d6b4a]" size={24} />
                  )}
                </div>
              )}
            </div>
            {/* Title */}
            <p className="font-josefin-sans font-semibold text-xs md:text-sm text-[#3a3a3a] leading-tight whitespace-pre-line">
              {item.title}
            </p>
            {/* Subtitle - supports line breaks */}
            {item.subtitle && (
              <p className="font-josefin-sans text-xs md:text-sm text-[#3a3a3a] leading-tight whitespace-pre-line">
                {item.subtitle}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
