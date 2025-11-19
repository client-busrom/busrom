import { NextRequest, NextResponse } from 'next/server'
import { keystoneClient } from '@/lib/keystone-client'
import { gql } from '@apollo/client'
import { convertToCDNUrl } from '@/lib/cdn-url'

// GraphQL query to get a single product by slug
const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    products(where: { slug: { equals: $slug }, status: { equals: "PUBLISHED" } }, take: 1) {
      id
      sku
      slug
      name
      shortDescription
      description
      contentTranslations {
        locale
        content {
          document
        }
      }
      attributes
      specifications
      showImage
      mainImage
      series {
        id
        slug
        name
        description
      }
      isFeatured
      order
      status
      createdAt
      updatedAt
    }
  }
`

// GraphQL query to get single media
const GET_SINGLE_MEDIA = gql`
  query GetSingleMedia($id: ID!) {
    media(where: { id: $id }) {
      id
      filename
      file {
        url
      }
      variants
      cropFocalPoint
    }
  }
`

// GraphQL query to get related products (same series)
const GET_RELATED_PRODUCTS = gql`
  query GetRelatedProducts($seriesId: ID!, $currentProductId: ID!) {
    products(
      where: {
        series: { id: { equals: $seriesId } }
        id: { not: { equals: $currentProductId } }
        status: { equals: "PUBLISHED" }
      }
      take: 4
      orderBy: { order: asc }
    ) {
      id
      sku
      slug
      name
      showImage
      mainImage
      isFeatured
    }
  }
`

// GraphQL query to get form config
const GET_FORM_CONFIG = gql`
  query GetFormConfig($id: ID!) {
    formConfig(where: { id: $id }) {
      id
      name
      location
      fields
    }
  }
`

/**
 * Helper function to resolve FormConfig from document
 */
async function resolveFormConfigsInDocument(document: any[]) {
  if (!document || !Array.isArray(document)) return document

  const updatedDocument = await Promise.all(
    document.map(async (node) => {
      if (node.type === 'component-block' && node.component === 'formBlock') {
        const formConfigId = node.props?.formConfig?.id
        if (formConfigId) {
          try {
            const { data } = await keystoneClient.query({
              query: GET_FORM_CONFIG,
              variables: { id: formConfigId },
            })
            if (data?.formConfig) {
              return {
                ...node,
                props: {
                  ...node.props,
                  formConfig: {
                    ...node.props.formConfig,
                    value: data.formConfig,
                  },
                },
              }
            }
          } catch (err) {
            console.error(`Failed to fetch formConfig ${formConfigId}:`, err)
          }
        }
      }
      return node
    })
  )

  return updatedDocument
}

/**
 * Helper function to resolve media IDs in component blocks
 */
async function resolveMediaInDocument(document: any[]): Promise<any[]> {
  if (!document || !Array.isArray(document)) return document

  const updatedDocument = await Promise.all(
    document.map(async (node) => {
      // Handle component-block types
      if (node.type === 'component-block') {
        // Link Jump component
        if (node.component === 'linkJump') {
          const mediaIconId = node.props?.mediaIconId
          if (mediaIconId) {
            const media = await resolveSingleMedia(mediaIconId)
            return {
              ...node,
              props: {
                ...node.props,
                mediaIcon: media,
              },
            }
          }
        }

        // Marquee Links component
        if (node.component === 'marqueeLinks') {
          const items = node.props?.items
          if (items && Array.isArray(items)) {
            const resolvedItems = await Promise.all(
              items.map(async (item: any) => {
                if (item.mediaIconId) {
                  const media = await resolveSingleMedia(item.mediaIconId)
                  return {
                    ...item,
                    mediaIcon: media,
                  }
                }
                return item
              })
            )
            return {
              ...node,
              props: {
                ...node.props,
                items: resolvedItems,
              },
            }
          }
        }

        // Carousel component
        if (node.component === 'carousel') {
          const items = node.props?.items
          if (items && Array.isArray(items)) {
            const resolvedItems = await Promise.all(
              items.map(async (item: any) => {
                if (item.mediaId) {
                  const media = await resolveSingleMedia(item.mediaId)
                  return {
                    ...item,
                    media,
                  }
                }
                return item
              })
            )
            return {
              ...node,
              props: {
                ...node.props,
                items: resolvedItems,
              },
            }
          }
        }
      }

      // Handle layout type (recursively process layout-area children)
      if (node.type === 'layout' && node.children) {
        const resolvedChildren = await Promise.all(
          node.children.map(async (child: any) => {
            if (child.type === 'layout-area' && child.children) {
              const resolvedLayoutChildren = await resolveMediaInDocument(child.children)
              return {
                ...child,
                children: resolvedLayoutChildren,
              }
            }
            return child
          })
        )
        return {
          ...node,
          children: resolvedChildren,
        }
      }

      return node
    })
  )

  return updatedDocument
}

/**
 * Helper function to resolve a single media ID
 */
async function resolveSingleMedia(mediaId: string) {
  try {
    const { data, error} = await keystoneClient.query({
      query: GET_SINGLE_MEDIA,
      variables: { id: mediaId },
    })

    if (error || !data?.media) {
      console.error(`Failed to fetch media ${mediaId}:`, error)
      return null
    }

    const media = data.media

    // Convert variants URLs to CDN URLs
    const convertedVariants = media.variants ? Object.fromEntries(
      Object.entries(media.variants).map(([key, value]) => [key, convertToCDNUrl(value as string)])
    ) : null

    // Transform to ImageObject format expected by frontend
    return {
      id: media.id,
      url: convertToCDNUrl(media.file?.url || ''),
      altText: media.filename || '',
      filename: media.filename,
      variants: convertedVariants,
      cropFocalPoint: media.cropFocalPoint || null,
    }
  } catch (err) {
    console.error(`Error fetching media ${mediaId}:`, err)
    return null
  }
}

/**
 * Helper function to resolve media IDs to full media objects
 */
async function resolveMediaIds(showImageId: string | null, mainImageIds: Array<{ id: string }> | null) {
  const results = await Promise.all([
    // Resolve showImage
    showImageId ? resolveSingleMedia(showImageId) : Promise.resolve(null),
    // Resolve mainImage array
    mainImageIds && Array.isArray(mainImageIds)
      ? Promise.all(mainImageIds.map((img) => (img?.id ? resolveSingleMedia(img.id) : Promise.resolve(null))))
      : Promise.resolve(null),
  ])

  const [showImage, mainImageArray] = results

  const mainImage = mainImageArray ? mainImageArray.filter(Boolean) : null

  return { showImage, mainImage }
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

    // Fetch product
    const { data, error } = await keystoneClient.query({
      query: GET_PRODUCT_BY_SLUG,
      variables: { slug },
    })

    if (error) {
      console.error('GraphQL error:', error)
      return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
    }

    const product = data.products[0]

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Resolve media IDs to full media objects
    const { showImage, mainImage } = await resolveMediaIds(product.showImage, product.mainImage)

    // Fetch related products if series exists
    let relatedProducts = []
    if (product.series?.id) {
      const relatedData = await keystoneClient.query({
        query: GET_RELATED_PRODUCTS,
        variables: {
          seriesId: product.series.id,
          currentProductId: product.id,
        },
      })

      if (!relatedData.error) {
        // Resolve media for related products
        const relatedProductsWithMedia = await Promise.all(
          relatedData.data.products.map(async (p: any) => {
            const media = await resolveMediaIds(p.showImage, p.mainImage)
            return {
              ...p,
              localizedName: p.name?.[locale] || p.name?.['en'] || p.sku,
              showImage: media.showImage,
              mainImage: media.mainImage,
            }
          })
        )
        relatedProducts = relatedProductsWithMedia
      }
    }

    // Resolve FormConfigs and Media in content document
    const contentTranslation = product.contentTranslations?.find((t: any) => t.locale === locale) || product.contentTranslations?.find((t: any) => t.locale === 'en')
    if (contentTranslation?.content?.document) {
      contentTranslation.content.document = await resolveFormConfigsInDocument(contentTranslation.content.document)
      contentTranslation.content.document = await resolveMediaInDocument(contentTranslation.content.document)
    }

    // Transform product data
    const transformedProduct = {
      ...product,
      showImage,
      mainImage,
      localizedName: product.name?.[locale] || product.name?.['en'] || product.sku,
      localizedShortDescription:
        product.shortDescription?.[locale] || product.shortDescription?.['en'] || null,
      localizedDescription: product.description?.[locale] || product.description?.['en'] || null,
      // Use content translation with resolved FormConfigs
      contentTranslation,
      // Transform series
      series: product.series
        ? {
            ...product.series,
            localizedName:
              product.series.name?.[locale] || product.series.name?.['en'] || product.series.slug,
            localizedDescription:
              product.series.description?.[locale] ||
              product.series.description?.['en'] ||
              null,
          }
        : null,
      // Add related products
      relatedProducts,
    }

    return NextResponse.json(transformedProduct)
  } catch (error: any) {
    console.error('Product detail API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
