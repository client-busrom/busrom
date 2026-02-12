export interface MediaObject {
  id: string
  url: string
  alt?: string
  variants?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
  }
  cropFocalPoint?: { x: number; y: number } | null
  width?: number
  height?: number
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

export interface ServiceItem {
  title: string
  description: string
  icon?: string
  images?: MediaObject[]
}

export interface ServiceCategory {
  title: string
  items: ServiceItem[]
}

export interface CategoryImages {
  top: MediaObject | null
  bottom: MediaObject | null
}

export interface BrandServicesSectionProps {
  title?: string
  description?: string
  categories: ServiceCategory[]
  categoryImages?: CategoryImages[]
}

// Design constants
export const DESIGN_WIDTH = 1920

// vw conversion function (no scale - use actual values)
export const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

// Font vw conversion function (no scale - use standard font sizes: 60/48/24/20/16)
export const fontVw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`
