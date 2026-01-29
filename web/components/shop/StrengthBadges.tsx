"use client"

import React from "react"
import Image from "next/image"
import { Users, Shield, Truck, Leaf } from "lucide-react"

interface StrengthItem {
  icon?: string
  image?: { id: string; url?: string } | null
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

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  users: Users,
  shield: Shield,
  truck: Truck,
  leaf: Leaf,
}

export function StrengthBadges({ items = defaultItems }: StrengthBadgesProps) {
  return (
    <div className="flex justify-between items-start gap-2 py-4">
      {items.slice(0, 4).map((item, index) => {
        const IconComponent = item.icon ? (iconMap[item.icon.toLowerCase()] || Users) : null
        const imageUrl = item.image?.url || (item.image?.id ? `/api/media/${item.image.id}/file?width=100` : null)

        return (
          <div key={index} className="flex flex-col items-center text-center flex-1 min-w-0">
            {/* Icon/Image with circular background */}
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#f5f3eb] flex items-center justify-center mb-2 overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={item.title}
                  width={56}
                  height={56}
                  className="w-full h-full object-contain p-2"
                  unoptimized
                />
              ) : IconComponent ? (
                <IconComponent className="text-[#5d6b4a]" size={24} />
              ) : (
                <Users className="text-[#5d6b4a]" size={24} />
              )}
            </div>
            {/* Title */}
            <p className="font-josefin-sans font-semibold text-xs md:text-sm text-[#3a3a3a] leading-tight">
              {item.title}
            </p>
            {/* Subtitle */}
            {item.subtitle && (
              <p className="font-josefin-sans text-xs md:text-sm text-[#3a3a3a] leading-tight">
                {item.subtitle}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
