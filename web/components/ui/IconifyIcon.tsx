"use client"

import { Icon } from "@iconify/react"

/**
 * Convert PascalCase Lucide name to Iconify format for backward compatibility
 * "ArrowRight" → "lucide:arrow-right"
 */
function normalizeIconName(name: string): string {
  if (!name) return ""
  // Already in Iconify format (contains ":")
  if (name.includes(":")) return name
  // PascalCase → kebab-case, prefix with lucide:
  const kebab = name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
  return `lucide:${kebab}`
}

interface IconifyIconProps {
  name: string
  size?: number
  className?: string
  color?: string
  style?: React.CSSProperties
}

/**
 * Iconify Icon wrapper with backward compatibility for legacy Lucide PascalCase names.
 *
 * Accepts:
 * - "lucide:arrow-right" (Iconify format) → renders directly
 * - "mdi:home" (any Iconify prefix) → renders directly
 * - "ArrowRight" (legacy Lucide PascalCase) → auto-converts to "lucide:arrow-right"
 */
export function IconifyIcon({ name, size = 24, className, color, style }: IconifyIconProps) {
  if (!name) return null
  const iconName = normalizeIconName(name)

  return (
    <Icon
      icon={iconName}
      width={size}
      height={size}
      className={className}
      color={color}
      style={style}
    />
  )
}
