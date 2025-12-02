/**
 * Brand Analysis GraphQL Queries
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { BrandAnalysisData } from '@/lib/content-data'

interface ImageObject {
  url: string
  altText: string
  thumbnailUrl?: string
  variants?: Record<string, string>
}

const GET_BRAND_ANALYSIS = gql`
  query GetBrandAnalysis {
    brandAnalysisConfigs {
      analysisTitle
      analysisTitle2
      analysisText
      analysisText2
      center1Number
      center1Text
      center1Image
      center2Number
      center2Text
      center2Image
      center3Number
      center3Text
      center3Image
      center4Number
      center4Text
      center4Image
      status
    }
  }
`

const GET_MEDIA = gql`
  query GetMedia($id: ID!) {
    media(where: { id: $id }) {
      id
      filename
      file { url }
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
    return {
      url: media.variants?.large || media.variants?.medium || media.file?.url || '',
      altText: extractLocale(media.altText, locale) || media.filename || '',
      thumbnailUrl: media.variants?.thumbnail || media.file?.url || '',
      variants: media.variants || undefined,
    }
  } catch (error) {
    console.error(`Error fetching media ${mediaId}:`, error)
    return null
  }
}

export async function getBrandAnalysis(locale: string = 'en'): Promise<BrandAnalysisData> {
  try {
    const { data } = await keystoneClient.query({ query: GET_BRAND_ANALYSIS })
    const config = data?.brandAnalysisConfigs?.[0]
    if (!config || config.status !== 'PUBLISHED') {
      return {
        analysis: { title: '', title2: '', text: '', text2: '' },
        centers: [],
      }
    }

    const images = await Promise.all([
      fetchMedia(config.center1Image, locale),
      fetchMedia(config.center2Image, locale),
      fetchMedia(config.center3Image, locale),
      fetchMedia(config.center4Image, locale),
    ])

    const centers = [
      {
        title: extractLocale(config.center1Number, locale),
        description: extractLocale(config.center1Text, locale),
        largeImage: images[0]?.url || null,
        smallImage: images[0]?.thumbnailUrl || images[0]?.url || null,
      },
      {
        title: extractLocale(config.center2Number, locale),
        description: extractLocale(config.center2Text, locale),
        largeImage: images[1]?.url || null,
        smallImage: images[1]?.thumbnailUrl || images[1]?.url || null,
      },
      {
        title: extractLocale(config.center3Number, locale),
        description: extractLocale(config.center3Text, locale),
        largeImage: images[2]?.url || null,
        smallImage: images[2]?.thumbnailUrl || images[2]?.url || null,
      },
      {
        title: extractLocale(config.center4Number, locale),
        description: extractLocale(config.center4Text, locale),
        largeImage: images[3]?.url || null,
        smallImage: images[3]?.thumbnailUrl || images[3]?.url || null,
      },
    ]

    return {
      analysis: {
        title: extractLocale(config.analysisTitle, locale),
        title2: extractLocale(config.analysisTitle2, locale),
        text: extractLocale(config.analysisText, locale),
        text2: extractLocale(config.analysisText2, locale),
      },
      centers,
    }
  } catch (error) {
    console.error('Error fetching BrandAnalysis:', error)
    return {
      analysis: { title: '', title2: '', text: '', text2: '' },
      centers: [],
    }
  }
}
