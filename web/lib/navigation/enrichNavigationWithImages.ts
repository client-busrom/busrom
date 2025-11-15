/**
 * Navigation Menu Image Enrichment
 *
 * Automatically adds product series images to Shop/Product navigation submenu items.
 *
 * @example
 * ```typescript
 * const menus = await getNavigationMenus()
 * const series = await getProductSeries()
 * const enrichedMenus = enrichNavigationWithImages(menus, series)
 * ```
 */

interface ImageData {
  id: string
  url: string
  alt?: string | null
  width?: number | null
  height?: number | null
}

interface Product {
  id: string
  coverImage?: ImageData | null
}

interface ProductSeries {
  id: string
  slug: string
  name: Record<string, string>
  products?: Product[]
}

interface NavigationMenuItem {
  id: string
  name: Record<string, string>
  type: 'STANDARD' | 'PRODUCT_CARDS' | 'SUBMENU'
  icon?: string | null
  link?: string | null
  order: number
  image?: ImageData | null
  children?: NavigationMenuItem[]
}

/**
 * Enriches navigation menus with product series images
 *
 * @param menus - Array of navigation menus from NavigationMenu model
 * @param productSeries - Array of product series from ProductSeries model
 * @returns Navigation menus with images added to Shop/Product submenu items
 */
export function enrichNavigationWithImages(
  menus: NavigationMenuItem[],
  productSeries: ProductSeries[]
): NavigationMenuItem[] {
  // Create a map of series slug to image
  const seriesImageMap = new Map<string, ImageData | null>()

  for (const series of productSeries) {
    if (series.products && series.products.length > 0) {
      const firstProduct = series.products[0]
      if (firstProduct.coverImage) {
        seriesImageMap.set(series.slug, firstProduct.coverImage)
      }
    }
  }

  // Process each menu
  return menus.map(menu => {
    // Only process Shop and Product menus
    const needsImages = ['Shop', 'Product'].some(name =>
      menu.name.en === name || menu.name['zh-CN'] === name
    )

    if (!needsImages || !menu.children || menu.children.length === 0) {
      return menu
    }

    // Enrich children with images
    const enrichedChildren = menu.children.map(child => {
      // If already has a manually set image, keep it
      if (child.image) {
        return child
      }

      // Extract series slug from link
      const seriesSlug = extractSeriesSlug(child.link || '')

      if (!seriesSlug) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[enrichNavigationWithImages] Cannot extract series slug from link: ${child.link}`
          )
        }
        return child
      }

      // Get image from map
      const image = seriesImageMap.get(seriesSlug) || null

      return {
        ...child,
        image,
      }
    })

    return {
      ...menu,
      children: enrichedChildren,
    }
  })
}

/**
 * Extracts product series slug from a navigation link
 *
 * Supports two formats:
 * - /shop?series=glass-standoff  (Shop menu)
 * - /product/glass-standoff       (Product menu)
 *
 * @param link - Navigation link URL
 * @returns Series slug or null if not found
 */
export function extractSeriesSlug(link: string): string | null {
  if (!link) return null

  // Match /shop?series=xxx
  const shopMatch = link.match(/[?&]series=([^&]+)/)
  if (shopMatch) {
    return shopMatch[1]
  }

  // Match /product/xxx
  const productMatch = link.match(/\/product\/([^/?]+)/)
  if (productMatch) {
    return productMatch[1]
  }

  return null
}

/**
 * Validates navigation menu structure
 *
 * @param menus - Navigation menus to validate
 * @returns Validation result with errors
 */
export function validateNavigationMenus(menus: NavigationMenuItem[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  for (const menu of menus) {
    // Check required fields
    if (!menu.id) {
      errors.push(`Menu missing ID: ${JSON.stringify(menu)}`)
    }

    if (!menu.name || Object.keys(menu.name).length === 0) {
      errors.push(`Menu ${menu.id} missing name`)
    }

    if (!menu.type) {
      errors.push(`Menu ${menu.id} missing type`)
    }

    // Check children
    if (menu.children) {
      for (const child of menu.children) {
        if (!child.link) {
          errors.push(`Child menu ${child.id} of ${menu.id} missing link`)
        }

        // For PRODUCT_CARDS type, warn if no image
        if (menu.type === 'PRODUCT_CARDS' && !child.image) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `Child menu ${child.id} (${child.name.en}) has no image. ` +
              `Make sure the product series has at least one published product with a cover image.`
            )
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
