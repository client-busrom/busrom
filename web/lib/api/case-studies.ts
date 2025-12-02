/**
 * Case Studies GraphQL Queries
 *
 * Data flow:
 * 1. CaseStudies singleton contains category IDs to display
 * 2. Each Category has Applications associated with it
 * 3. Each Application has mainImage and images
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { CaseStudiesData, ImageObject } from '@/lib/content-data'
import { resolveMediaUrl } from '@/lib/image-utils'

const GET_CASE_STUDIES_CONFIG = gql`
  query GetCaseStudiesConfig {
    caseStudies {
      title
      description
      categories
      status
    }
  }
`

const GET_APPLICATIONS_BY_CATEGORY = gql`
  query GetApplicationsByCategory($categoryId: ID!) {
    applications(
      where: {
        category: { id: { equals: $categoryId } },
        status: { equals: "PUBLISHED" }
      }
      take: 3
    ) {
      id
      slug
      name
      mainImage
      images
    }
  }
`

const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(where: { id: $id }) {
      id
      name
      slug
    }
  }
`

const GET_MEDIA = gql`
  query GetMedia($id: ID!) {
    media(where: { id: $id }) {
      id
      filename
      file { url }
      fileUrl
      variants
      altText
    }
  }
`

function extractLocale(field: Record<string, string> | null | undefined, locale: string, fallback: string = 'en'): string {
  if (!field) return ''
  return field[locale] || field[fallback] || ''
}

async function fetchMedia(mediaId: string, locale: string): Promise<ImageObject | null> {
  if (!mediaId) return null
  try {
    const { data } = await keystoneClient.query({ query: GET_MEDIA, variables: { id: mediaId } })
    const media = data?.media
    if (!media) return null

    const baseUrl = media.fileUrl || media.file?.url || ''

    return {
      url: resolveMediaUrl(media.variants?.large || media.variants?.medium || baseUrl),
      altText: extractLocale(media.altText, locale) || media.filename || '',
      thumbnailUrl: resolveMediaUrl(media.variants?.thumbnail || baseUrl),
      variants: media.variants || undefined,
    }
  } catch (error) {
    console.error(`Error fetching media ${mediaId}:`, error)
    return null
  }
}

export async function getCaseStudies(locale: string = 'en'): Promise<CaseStudiesData> {
  try {
    // 1. Get CaseStudies config
    console.log('[CaseStudies] Fetching config...')
    const { data: configData } = await keystoneClient.query({ query: GET_CASE_STUDIES_CONFIG })
    const config = configData?.caseStudies
    console.log('[CaseStudies] Config:', JSON.stringify(config, null, 2))

    if (!config || config.status !== 'PUBLISHED') {
      console.log('[CaseStudies] Config not published or not found')
      return { title: '', description: '', applications: [] }
    }

    const categoryIds: string[] = config.categories || []
    console.log('[CaseStudies] Category IDs:', categoryIds)

    if (categoryIds.length === 0) {
      console.log('[CaseStudies] No categories configured')
      return {
        title: extractLocale(config.title, locale),
        description: extractLocale(config.description, locale),
        applications: []
      }
    }

    // 2. For each category, fetch applications and their images
    const applications = await Promise.all(
      categoryIds.map(async (categoryId) => {
        try {
          // Get category info
          console.log(`[CaseStudies] Fetching category ${categoryId}...`)
          const { data: categoryData } = await keystoneClient.query({
            query: GET_CATEGORY,
            variables: { id: categoryId }
          })
          const category = categoryData?.category
          console.log(`[CaseStudies] Category:`, category?.name)

          // Get applications for this category
          console.log(`[CaseStudies] Fetching applications for category ${categoryId}...`)
          const { data: appsData } = await keystoneClient.query({
            query: GET_APPLICATIONS_BY_CATEGORY,
            variables: { categoryId }
          })
          const apps = appsData?.applications || []
          console.log(`[CaseStudies] Found ${apps.length} applications for category ${categoryId}`)

          if (apps.length === 0) {
            return null
          }

          // Build items array with images from each application
          const items = await Promise.all(
            apps.slice(0, 3).map(async (app: any) => {
              // Try mainImage first, then first image from images array
              let imageId = app.mainImage
              if (!imageId && Array.isArray(app.images) && app.images.length > 0) {
                imageId = app.images[0]
              }
              console.log(`[CaseStudies] App ${app.slug} mainImage ID:`, imageId)

              const image = imageId ? await fetchMedia(imageId, locale) : null
              console.log(`[CaseStudies] App ${app.slug} image:`, image?.url)

              return {
                series: extractLocale(category?.name, locale) || '',
                slug: app.slug,
                image: image || {
                  url: '/placeholder.jpg',
                  altText: extractLocale(app.name, locale) || app.slug,
                },
              }
            })
          )

          return {
            items: items.filter((item) => item.image && item.image.url),
          }
        } catch (error) {
          console.error(`[CaseStudies] Error fetching applications for category ${categoryId}:`, error)
          return null
        }
      })
    )

    // Filter out null results and empty applications
    const validApplications = applications.filter(
      (app): app is { items: Array<{ series: string; slug: string; image: ImageObject }> } =>
        app !== null && app.items.length > 0
    )

    console.log(`[CaseStudies] Final result: ${validApplications.length} application groups`)
    console.log('[CaseStudies] Result:', JSON.stringify(validApplications, null, 2))

    return {
      title: extractLocale(config.title, locale),
      description: extractLocale(config.description, locale),
      applications: validApplications,
    }
  } catch (error) {
    console.error('[CaseStudies] Error fetching CaseStudies:', error)
    return { title: '', description: '', applications: [] }
  }
}
