import { NextRequest, NextResponse } from 'next/server'

// Payload CMS API 基础地址
const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002'

// CDN Domain configuration
const CDN_DOMAIN = process.env.NEXT_PUBLIC_CDN_DOMAIN || 'http://localhost:8080'

/**
 * Normalize image URL to use CDN domain
 * Converts MinIO URLs (localhost:9000) to CDN URLs (localhost:8080)
 */
function normalizeToCDN(url: string): string {
  if (!url) return url

  // Already using CDN domain
  if (url.includes(CDN_DOMAIN) || url.includes('cloudfront.net')) {
    return url
  }

  try {
    const urlObj = new URL(url)

    // MinIO URL: http://localhost:9000/busrom-media/...
    if (url.includes('localhost:9000')) {
      return `${CDN_DOMAIN}${urlObj.pathname}`
    }

    // S3 URL: https://xxx.s3.amazonaws.com/bucket/...
    if (urlObj.hostname.includes('amazonaws.com')) {
      const pathParts = urlObj.pathname.split('/').filter(Boolean)
      if (pathParts.length > 1) {
        pathParts.shift() // Remove bucket name
      }
      return `${CDN_DOMAIN}/${pathParts.join('/')}`
    }

    return url
  } catch {
    return url
  }
}

/**
 * Transform image variants to use CDN URLs
 */
function transformImageVariants(variants: any) {
  if (!variants) return null

  const transformed: any = {}
  for (const [key, value] of Object.entries(variants)) {
    if (value && typeof value === 'object' && 'url' in value) {
      transformed[key] = {
        ...value,
        url: normalizeToCDN((value as any).url)
      }
    } else if (typeof value === 'string') {
      transformed[key] = normalizeToCDN(value)
    } else {
      transformed[key] = value
    }
  }
  return transformed
}

/**
 * Convert Payload's focalX/focalY to cropFocalPoint format
 */
function getCropFocalPoint(media: any): { x: number; y: number } | undefined {
  if (media?.focalX !== undefined && media?.focalX !== null &&
      media?.focalY !== undefined && media?.focalY !== null) {
    return { x: media.focalX, y: media.focalY }
  }
  return undefined
}

/**
 * Transform a media object to include CDN URLs
 */
function transformMediaObject(media: any) {
  if (!media || typeof media !== 'object') return media
  if (typeof media === 'string' || typeof media === 'number') return media

  return {
    ...media,
    url: media.url ? normalizeToCDN(media.url) : undefined,
    variants: transformImageVariants(media.sizes || media.variants),
  }
}

/**
 * Recursively populate image references in Lexical content
 * Fetches media objects by ID and replaces them in the content tree
 */
async function populateLexicalImages(node: any, mediaCache: Map<string, any>, depth = 0): Promise<any> {
  if (!node || typeof node !== 'object') return node

  // Handle arrays
  if (Array.isArray(node)) {
    return Promise.all(node.map(item => populateLexicalImages(item, mediaCache, depth)))
  }

  // Clone the node
  const populated = { ...node }

  // Check if this node has image data that needs population
  if (populated.data && typeof populated.data === 'object') {
    // Handle single image field
    if (populated.data.image) {
      const imageId = typeof populated.data.image === 'object' ? populated.data.image.id : populated.data.image
      if (imageId && !mediaCache.has(String(imageId))) {
        try {
          const mediaRes = await fetch(`${CMS_URL}/api/media/${imageId}`)
          if (mediaRes.ok) {
            const mediaData = await mediaRes.json()
            mediaCache.set(String(imageId), transformMediaObject(mediaData))
          }
        } catch (err) {
          console.error(`[populateLexicalImages] Failed to fetch media ${imageId}:`, err)
        }
      }
      if (mediaCache.has(String(imageId))) {
        populated.data.image = mediaCache.get(String(imageId))
      }
    }

    // Handle images array (for gallery)
    if (Array.isArray(populated.data.images)) {
      populated.data.images = await Promise.all(
        populated.data.images.map(async (item: any) => {
          if (!item || typeof item !== 'object') return item

          const imageId = typeof item.image === 'object' ? item.image.id : item.image
          if (imageId && !mediaCache.has(String(imageId))) {
            try {
              const mediaRes = await fetch(`${CMS_URL}/api/media/${imageId}`)
              if (mediaRes.ok) {
                const mediaData = await mediaRes.json()
                mediaCache.set(String(imageId), transformMediaObject(mediaData))
              }
            } catch (err) {
              console.error(`[populateLexicalImages] Failed to fetch media ${imageId}:`, err)
            }
          }

          return {
            ...item,
            image: mediaCache.has(String(imageId)) ? mediaCache.get(String(imageId)) : item.image
          }
        })
      )
    }

    // Handle media icon
    if (populated.data.mediaIcon) {
      const iconId = typeof populated.data.mediaIcon === 'object' ? populated.data.mediaIcon.id : populated.data.mediaIcon
      if (iconId && !mediaCache.has(String(iconId))) {
        try {
          const mediaRes = await fetch(`${CMS_URL}/api/media/${iconId}`)
          if (mediaRes.ok) {
            const mediaData = await mediaRes.json()
            mediaCache.set(String(iconId), transformMediaObject(mediaData))
          }
        } catch (err) {
          console.error(`[populateLexicalImages] Failed to fetch media icon ${iconId}:`, err)
        }
      }
      if (mediaCache.has(String(iconId))) {
        populated.data.mediaIcon = mediaCache.get(String(iconId))
      }
    }

    // Handle backgroundImage
    if (populated.data.backgroundImage) {
      const bgId = typeof populated.data.backgroundImage === 'object' ? populated.data.backgroundImage.id : populated.data.backgroundImage
      if (bgId && !mediaCache.has(String(bgId))) {
        try {
          const mediaRes = await fetch(`${CMS_URL}/api/media/${bgId}`)
          if (mediaRes.ok) {
            const mediaData = await mediaRes.json()
            mediaCache.set(String(bgId), transformMediaObject(mediaData))
          }
        } catch (err) {
          console.error(`[populateLexicalImages] Failed to fetch background image ${bgId}:`, err)
        }
      }
      if (mediaCache.has(String(bgId))) {
        populated.data.backgroundImage = mediaCache.get(String(bgId))
      }
    }

    // Handle carousel/marquee items with media
    if (Array.isArray(populated.data.items)) {
      populated.data.items = await Promise.all(
        populated.data.items.map(async (item: any) => {
          if (!item || typeof item !== 'object') return item

          const result = { ...item }

          // Handle item.media
          if (result.media) {
            const mediaId = typeof result.media === 'object' ? result.media.id : result.media
            if (mediaId && !mediaCache.has(String(mediaId))) {
              try {
                const mediaRes = await fetch(`${CMS_URL}/api/media/${mediaId}`)
                if (mediaRes.ok) {
                  const mediaData = await mediaRes.json()
                  mediaCache.set(String(mediaId), transformMediaObject(mediaData))
                }
              } catch (err) {
                console.error(`[populateLexicalImages] Failed to fetch item media ${mediaId}:`, err)
              }
            }
            if (mediaCache.has(String(mediaId))) {
              result.media = mediaCache.get(String(mediaId))
            }
          }

          // Handle item.mediaIcon
          if (result.mediaIcon) {
            const iconId = typeof result.mediaIcon === 'object' ? result.mediaIcon.id : result.mediaIcon
            if (iconId && !mediaCache.has(String(iconId))) {
              try {
                const mediaRes = await fetch(`${CMS_URL}/api/media/${iconId}`)
                if (mediaRes.ok) {
                  const mediaData = await mediaRes.json()
                  mediaCache.set(String(iconId), transformMediaObject(mediaData))
                }
              } catch (err) {
                console.error(`[populateLexicalImages] Failed to fetch item icon ${iconId}:`, err)
              }
            }
            if (mediaCache.has(String(iconId))) {
              result.mediaIcon = mediaCache.get(String(iconId))
            }
          }

          return result
        })
      )
    }

    // Handle carousel slides with images
    if (Array.isArray(populated.data.slides)) {
      populated.data.slides = await Promise.all(
        populated.data.slides.map(async (slide: any) => {
          if (!slide || typeof slide !== 'object') return slide

          const result = { ...slide }

          // Handle slide.image
          if (result.image) {
            const imageId = typeof result.image === 'object' ? result.image.id : result.image
            if (imageId && !mediaCache.has(String(imageId))) {
              try {
                const mediaRes = await fetch(`${CMS_URL}/api/media/${imageId}`)
                if (mediaRes.ok) {
                  const mediaData = await mediaRes.json()
                  mediaCache.set(String(imageId), transformMediaObject(mediaData))
                }
              } catch (err) {
                console.error(`[populateLexicalImages] Failed to fetch slide image ${imageId}:`, err)
              }
            }
            if (mediaCache.has(String(imageId))) {
              result.image = mediaCache.get(String(imageId))
            }
          }

          return result
        })
      )
    }
  }

  // Recursively process root (top level of Lexical content)
  if (populated.root && typeof populated.root === 'object') {
    populated.root = await populateLexicalImages(populated.root, mediaCache, depth + 1)
  }

  // Recursively process children
  if (populated.children && Array.isArray(populated.children)) {
    populated.children = await populateLexicalImages(populated.children, mediaCache, depth + 1)
  }

  // Recursively process fields (for blocks)
  if (populated.fields && typeof populated.fields === 'object') {
    for (const [key, value] of Object.entries(populated.fields)) {
      if (value && typeof value === 'object') {
        populated.fields[key] = await populateLexicalImages(value, mediaCache, depth + 1)
      }
    }
  }

  return populated
}

/**
 * GET /api/products/[slug]
 *
 * Query parameters:
 * - locale: string (default: 'en')
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'

    console.log('[Product Detail API] Fetching product from Payload CMS:', { slug, locale })

    // 从 Payload CMS 获取单个产品
    // TODO: Re-enable status filter after setting product status to 'published' in Payload CMS
    // const productUrl = `${CMS_URL}/api/products?where[slug][equals]=${slug}&where[status][equals]=published&limit=1&locale=${locale}&depth=3`
    const productUrl = `${CMS_URL}/api/products?where[slug][equals]=${slug}&limit=1&locale=${locale}&depth=3`
    console.log('[Product Detail API] Request URL:', productUrl)

    const productResponse = await fetch(productUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    })

    if (!productResponse.ok) {
      console.error('[Product Detail API] Payload CMS error:', productResponse.status)
      return NextResponse.json(
        { error: 'Failed to fetch product from CMS' },
        { status: productResponse.status }
      )
    }

    const productData = await productResponse.json()

    if (!productData.docs || productData.docs.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = productData.docs[0]
    console.log('[Product Detail API] Product found:', product.id)

    // Populate image references in Lexical content
    const mediaCache = new Map<string, any>()
    if (product.contentTranslation) {
      console.log('[Product Detail API] Populating Lexical images...')
      product.contentTranslation = await populateLexicalImages(product.contentTranslation, mediaCache)
      console.log('[Product Detail API] Populated', mediaCache.size, 'unique images')
    }

    // 获取同系列的相关产品
    let relatedProducts = []
    if (product.series?.id) {
      // TODO: Re-enable status filter after setting product status to 'published' in Payload CMS
      // const relatedUrl = `${CMS_URL}/api/products?where[series][equals]=${product.series.id}&where[id][not_equals]=${product.id}&where[status][equals]=published&limit=4&sort=order&locale=${locale}&depth=2`
      const relatedUrl = `${CMS_URL}/api/products?where[series][equals]=${product.series.id}&where[id][not_equals]=${product.id}&limit=4&sort=order&locale=${locale}&depth=2`

      try {
        const relatedResponse = await fetch(relatedUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 60 },
        })

        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json()
          relatedProducts = relatedData.docs.map((p: any) => ({
            id: p.id,
            sku: p.sku,
            slug: p.slug,
            name: p.name,
            localizedName: p.name,
            showImage: p.showImage
              ? {
                  id: p.showImage.id,
                  url: normalizeToCDN(p.showImage.url),
                  altText: p.showImage.alt || '',
                  filename: p.showImage.filename,
                  variants: transformImageVariants(p.showImage.sizes),
                  cropFocalPoint: getCropFocalPoint(p.showImage),
                }
              : null,
            mainImage: p.mainImage && Array.isArray(p.mainImage)
              ? p.mainImage.map((img: any) => ({
                  id: img.id,
                  url: normalizeToCDN(img.url),
                  altText: img.alt || '',
                  filename: img.filename,
                  variants: transformImageVariants(img.sizes),
                  cropFocalPoint: getCropFocalPoint(img),
                }))
              : [],
            isFeatured: p.featured || false,
          }))
          console.log('[Product Detail API] Found related products:', relatedProducts.length)
        }
      } catch (error) {
        console.error('[Product Detail API] Failed to fetch related products:', error)
      }
    }

    // Transform product data to match frontend expectations
    const transformedProduct = {
      id: product.id,
      sku: product.sku,
      slug: product.slug,
      name: product.name,
      localizedName: product.name,
      shortDescription: product.shortDescription,
      localizedShortDescription: product.shortDescription,
      description: product.description,
      localizedDescription: product.description,
      // Content (rich text from Payload)
      content: product.contentTranslation, // Lexical rich text content
      contentTranslation: product.contentTranslation
        ? {
            locale,
            content: {
              document: product.contentTranslation, // Payload rich text content
            },
          }
        : null,
      // Attributes and specifications (JSON fields)
      attributes: product.attributes || null,
      specifications: product.specifications || null,
      // Images (with CDN URL transformation)
      showImage: product.showImage
        ? {
            id: product.showImage.id,
            url: normalizeToCDN(product.showImage.url),
            altText: product.showImage.alt || '',
            filename: product.showImage.filename,
            variants: transformImageVariants(product.showImage.sizes),
            cropFocalPoint: getCropFocalPoint(product.showImage),
          }
        : null,
      mainImage: product.mainImage && Array.isArray(product.mainImage)
        ? product.mainImage.map((img: any) => ({
            id: img.id,
            url: normalizeToCDN(img.url),
            altText: img.alt || '',
            filename: img.filename,
            variants: transformImageVariants(img.sizes),
            cropFocalPoint: getCropFocalPoint(img),
          }))
        : [],
      // Series
      series: product.series
        ? {
            id: product.series.id,
            slug: product.series.slug,
            name: product.series.name,
            localizedName: product.series.name,
            description: product.series.description,
            localizedDescription: product.series.description,
          }
        : null,
      // Metadata
      isFeatured: product.featured || false,
      order: product.order || 0,
      status: product.status === 'published' ? 'PUBLISHED' : 'DRAFT',
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // Related products
      relatedProducts,
    }

    return NextResponse.json(transformedProduct)
  } catch (error: any) {
    console.error('[Product Detail API] Error:', error)
    console.error('[Product Detail API] Error stack:', error?.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}
