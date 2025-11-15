/**
 * Tests for enrichNavigationWithImages
 */

import {
  enrichNavigationWithImages,
  extractSeriesSlug,
  validateNavigationMenus
} from '../enrichNavigationWithImages'

describe('extractSeriesSlug', () => {
  it('should extract slug from shop query parameter', () => {
    expect(extractSeriesSlug('/shop?series=glass-standoff')).toBe('glass-standoff')
    expect(extractSeriesSlug('/shop?series=glass-connected-fitting')).toBe('glass-connected-fitting')
  })

  it('should extract slug from product path', () => {
    expect(extractSeriesSlug('/product/glass-standoff')).toBe('glass-standoff')
    expect(extractSeriesSlug('/product/glass-connected-fitting')).toBe('glass-connected-fitting')
  })

  it('should handle query parameters with ampersands', () => {
    expect(extractSeriesSlug('/shop?series=glass-standoff&page=1')).toBe('glass-standoff')
  })

  it('should return null for invalid links', () => {
    expect(extractSeriesSlug('')).toBe(null)
    expect(extractSeriesSlug('/about-us')).toBe(null)
    expect(extractSeriesSlug('/shop')).toBe(null)
    expect(extractSeriesSlug('/product')).toBe(null)
  })

  it('should handle links with trailing slashes', () => {
    expect(extractSeriesSlug('/product/glass-standoff/')).toBe('glass-standoff')
  })

  it('should handle links with query strings in product paths', () => {
    expect(extractSeriesSlug('/product/glass-standoff?page=1')).toBe('glass-standoff')
  })
})

describe('enrichNavigationWithImages', () => {
  const mockProductSeries = [
    {
      id: 'series-1',
      slug: 'glass-standoff',
      name: { en: 'Glass Standoff' },
      products: [
        {
          id: 'product-1',
          coverImage: {
            id: 'image-1',
            url: '/images/glass-standoff.jpg',
            alt: 'Glass Standoff',
            width: 800,
            height: 800
          }
        }
      ]
    },
    {
      id: 'series-2',
      slug: 'glass-connected-fitting',
      name: { en: 'Glass Connected Fitting' },
      products: [
        {
          id: 'product-2',
          coverImage: {
            id: 'image-2',
            url: '/images/glass-fitting.jpg',
            alt: 'Glass Fitting',
            width: 800,
            height: 800
          }
        }
      ]
    },
    {
      id: 'series-3',
      slug: 'glass-clip',
      name: { en: 'Glass Clip' },
      products: [] // No products
    }
  ]

  it('should add images to Shop submenu items', () => {
    const menus = [
      {
        id: 'menu-shop',
        name: { en: 'Shop' },
        type: 'PRODUCT_CARDS' as const,
        order: 1,
        children: [
          {
            id: 'shop-1',
            name: { en: 'Glass Standoff' },
            type: 'PRODUCT_CARDS' as const,
            link: '/shop?series=glass-standoff',
            order: 1
          },
          {
            id: 'shop-2',
            name: { en: 'Glass Connected Fitting' },
            type: 'PRODUCT_CARDS' as const,
            link: '/shop?series=glass-connected-fitting',
            order: 2
          }
        ]
      }
    ]

    const result = enrichNavigationWithImages(menus, mockProductSeries)

    expect(result[0].children?.[0].image).toEqual({
      id: 'image-1',
      url: '/images/glass-standoff.jpg',
      alt: 'Glass Standoff',
      width: 800,
      height: 800
    })

    expect(result[0].children?.[1].image).toEqual({
      id: 'image-2',
      url: '/images/glass-fitting.jpg',
      alt: 'Glass Fitting',
      width: 800,
      height: 800
    })
  })

  it('should add images to Product submenu items', () => {
    const menus = [
      {
        id: 'menu-product',
        name: { en: 'Product' },
        type: 'PRODUCT_CARDS' as const,
        order: 1,
        children: [
          {
            id: 'product-1',
            name: { en: 'Glass Standoff' },
            type: 'PRODUCT_CARDS' as const,
            link: '/product/glass-standoff',
            order: 1
          }
        ]
      }
    ]

    const result = enrichNavigationWithImages(menus, mockProductSeries)

    expect(result[0].children?.[0].image).toEqual({
      id: 'image-1',
      url: '/images/glass-standoff.jpg',
      alt: 'Glass Standoff',
      width: 800,
      height: 800
    })
  })

  it('should preserve manually set images', () => {
    const menus = [
      {
        id: 'menu-shop',
        name: { en: 'Shop' },
        type: 'PRODUCT_CARDS' as const,
        order: 1,
        children: [
          {
            id: 'shop-1',
            name: { en: 'Glass Standoff' },
            type: 'PRODUCT_CARDS' as const,
            link: '/shop?series=glass-standoff',
            order: 1,
            image: {
              id: 'manual-image',
              url: '/images/manual.jpg',
              alt: 'Manual Image',
              width: 1000,
              height: 1000
            }
          }
        ]
      }
    ]

    const result = enrichNavigationWithImages(menus, mockProductSeries)

    // Should keep the manual image
    expect(result[0].children?.[0].image?.id).toBe('manual-image')
    expect(result[0].children?.[0].image?.url).toBe('/images/manual.jpg')
  })

  it('should not modify non-Shop/Product menus', () => {
    const menus = [
      {
        id: 'menu-service',
        name: { en: 'Service' },
        type: 'SUBMENU' as const,
        order: 1,
        children: [
          {
            id: 'service-1',
            name: { en: 'FAQ' },
            type: 'STANDARD' as const,
            link: '/service/faq',
            order: 1
          }
        ]
      }
    ]

    const result = enrichNavigationWithImages(menus, mockProductSeries)

    expect(result[0].children?.[0].image).toBeUndefined()
  })

  it('should handle series without products', () => {
    const menus = [
      {
        id: 'menu-shop',
        name: { en: 'Shop' },
        type: 'PRODUCT_CARDS' as const,
        order: 1,
        children: [
          {
            id: 'shop-1',
            name: { en: 'Glass Clip' },
            type: 'PRODUCT_CARDS' as const,
            link: '/shop?series=glass-clip',
            order: 1
          }
        ]
      }
    ]

    const result = enrichNavigationWithImages(menus, mockProductSeries)

    // Should have null image
    expect(result[0].children?.[0].image).toBeNull()
  })

  it('should handle menus without children', () => {
    const menus = [
      {
        id: 'menu-home',
        name: { en: 'Home' },
        type: 'STANDARD' as const,
        link: '/',
        order: 1
      }
    ]

    const result = enrichNavigationWithImages(menus, mockProductSeries)

    expect(result).toEqual(menus)
  })

  it('should handle Chinese menu names', () => {
    const menus = [
      {
        id: 'menu-shop',
        name: { en: 'Shop', 'zh-CN': '商店' },
        type: 'PRODUCT_CARDS' as const,
        order: 1,
        children: [
          {
            id: 'shop-1',
            name: { en: 'Glass Standoff', 'zh-CN': '玻璃立柱' },
            type: 'PRODUCT_CARDS' as const,
            link: '/shop?series=glass-standoff',
            order: 1
          }
        ]
      }
    ]

    const result = enrichNavigationWithImages(menus, mockProductSeries)

    expect(result[0].children?.[0].image).toBeTruthy()
  })
})

describe('validateNavigationMenus', () => {
  it('should pass validation for valid menus', () => {
    const menus = [
      {
        id: 'menu-1',
        name: { en: 'Home' },
        type: 'STANDARD' as const,
        link: '/',
        order: 1
      }
    ]

    const result = validateNavigationMenus(menus)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should fail validation for menu without ID', () => {
    const menus = [
      {
        id: '',
        name: { en: 'Home' },
        type: 'STANDARD' as const,
        link: '/',
        order: 1
      }
    ] as any

    const result = validateNavigationMenus(menus)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should fail validation for menu without name', () => {
    const menus = [
      {
        id: 'menu-1',
        name: {},
        type: 'STANDARD' as const,
        link: '/',
        order: 1
      }
    ] as any

    const result = validateNavigationMenus(menus)

    expect(result.valid).toBe(false)
  })

  it('should fail validation for child without link', () => {
    const menus = [
      {
        id: 'menu-1',
        name: { en: 'Shop' },
        type: 'PRODUCT_CARDS' as const,
        order: 1,
        children: [
          {
            id: 'child-1',
            name: { en: 'Glass Standoff' },
            type: 'PRODUCT_CARDS' as const,
            order: 1
            // Missing link
          }
        ]
      }
    ] as any

    const result = validateNavigationMenus(menus)

    expect(result.valid).toBe(false)
  })
})
