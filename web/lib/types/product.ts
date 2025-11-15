/**
 * Product Types
 *
 * Type definitions for Product and ProductSeries models from Keystone CMS
 */

import { ImageObject } from "../content-data"

/**
 * Product Attribute - Multilingual key-value pair
 */
export interface ProductAttribute {
  key: Record<string, string> // { en: "Material", zh: "材质", ... }
  value: Record<string, string> // { en: "Stainless Steel", zh: "不锈钢", ... }
}

/**
 * Product Specification Variant (e.g., color, size options)
 */
export interface ProductSpecification {
  name: Record<string, string> // { en: "Size", zh: "尺寸", ... }
  options: Array<{
    value: Record<string, string> // { en: "12mm", zh: "12毫米", ... }
    sku?: string
    inStock?: boolean
  }>
}

/**
 * Product Content Translation (rich text content)
 */
export interface ProductContentTranslation {
  locale: string
  content: any // Document editor content (JSON)
}

/**
 * Product Model (from CMS)
 */
export interface Product {
  id: string
  sku: string
  slug: string

  // Multilingual fields (JSON format)
  name: Record<string, string> // { en: "...", zh: "...", ... }
  shortDescription: Record<string, any> // Document JSON
  description: Record<string, any> // Document JSON

  // Content translations (relational)
  contentTranslations?: ProductContentTranslation[]

  // Attributes and specifications
  attributes?: ProductAttribute[]
  specifications?: ProductSpecification[]

  // Images
  showImage: ImageObject | null // List display image
  mainImage: ImageObject[] | null // Detail page images

  // Relationships
  series?: ProductSeries | { id: string }

  // Flags
  isFeatured: boolean

  // Meta
  order: number
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED"
  createdAt: string
  updatedAt: string
}

/**
 * Product Series Content Translation
 */
export interface ProductSeriesContentTranslation {
  locale: string
  content: any // Document editor content (JSON)
}

/**
 * Product Series Model (from CMS)
 */
export interface ProductSeries {
  id: string
  slug: string

  // Multilingual fields
  name: Record<string, string>
  description: Record<string, string>

  // Content translations (relational)
  contentTranslations?: ProductSeriesContentTranslation[]

  // Images
  featuredImage: ImageObject | null

  // Relationships
  category?: { id: string; name: string }
  products?: Product[]

  // Meta
  order: number
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED"
  createdAt: string
  updatedAt: string
}

/**
 * Product List API Response
 */
export interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Product Filter Options
 */
export interface ProductFilters {
  series?: string[] // Series slugs
  category?: string[] // Category IDs
  isFeatured?: boolean
  status?: "PUBLISHED" | "DRAFT" | "ARCHIVED"
  search?: string
}

/**
 * Product Sort Options
 */
export type ProductSortField = "order" | "createdAt" | "updatedAt" | "name"
export type ProductSortDirection = "ASC" | "DESC"

export interface ProductSort {
  field: ProductSortField
  direction: ProductSortDirection
}
