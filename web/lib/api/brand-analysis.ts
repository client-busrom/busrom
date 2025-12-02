/**
 * Brand Analysis GraphQL Queries
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { BrandAnalysisData, ImageObject } from '@/lib/content-data'

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
        number: extractLocale(config.center1Number, locale),
        text: extractLocale(config.center1Text, locale),
        image: images[0] || { url: '', altText: '' },
      },
      {
        number: extractLocale(config.center2Number, locale),
        text: extractLocale(config.center2Text, locale),
        image: images[1] || { url: '', altText: '' },
      },
      {
        number: extractLocale(config.center3Number, locale),
        text: extractLocale(config.center3Text, locale),
        image: images[2] || { url: '', altText: '' },
      },
      {
        number: extractLocale(config.center4Number, locale),
        text: extractLocale(config.center4Text, locale),
        image: images[3] || { url: '', altText: '' },
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
