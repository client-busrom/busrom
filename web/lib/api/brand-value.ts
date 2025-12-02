/**
 * Brand Value GraphQL Queries
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { BrandValueData, ImageObject } from '@/lib/content-data'

const GET_BRAND_VALUE = gql`
  query GetBrandValue {
    brandValueConfigs {
      title
      subtitle
      param1Title
      param1Description
      param1Image
      param2Title
      param2Description
      param2Image
      sloganTitle
      sloganDescription
      sloganImage
      valueTitle
      valueDescription
      valueImage
      visionTitle
      visionDescription
      visionImage
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

export async function getBrandValue(locale: string = 'en'): Promise<BrandValueData> {
  try {
    const { data } = await keystoneClient.query({ query: GET_BRAND_VALUE })
    const config = data?.brandValueConfigs?.[0]
    if (!config || config.status !== 'PUBLISHED') {
      return {
        title: '',
        subtitle: '',
        param1: { title: '', description: '', image: { url: '', altText: '' } },
        param2: { title: '', description: '', image: { url: '', altText: '' } },
        slogan: { title: '', description: '', image: { url: '', altText: '' } },
        value: { title: '', description: '', image: { url: '', altText: '' } },
        vision: { title: '', description: '', image: { url: '', altText: '' } },
      }
    }

    const [param1Image, param2Image, sloganImage, valueImage, visionImage] = await Promise.all([
      fetchMedia(config.param1Image, locale),
      fetchMedia(config.param2Image, locale),
      fetchMedia(config.sloganImage, locale),
      fetchMedia(config.valueImage, locale),
      fetchMedia(config.visionImage, locale),
    ])

    return {
      title: extractLocale(config.title, locale),
      subtitle: extractLocale(config.subtitle, locale),
      param1: {
        title: extractLocale(config.param1Title, locale),
        description: extractLocale(config.param1Description, locale),
        image: param1Image || { url: '', altText: '' },
      },
      param2: {
        title: extractLocale(config.param2Title, locale),
        description: extractLocale(config.param2Description, locale),
        image: param2Image || { url: '', altText: '' },
      },
      slogan: {
        title: extractLocale(config.sloganTitle, locale),
        description: extractLocale(config.sloganDescription, locale),
        image: sloganImage || { url: '', altText: '' },
      },
      value: {
        title: extractLocale(config.valueTitle, locale),
        description: extractLocale(config.valueDescription, locale),
        image: valueImage || { url: '', altText: '' },
      },
      vision: {
        title: extractLocale(config.visionTitle, locale),
        description: extractLocale(config.visionDescription, locale),
        image: visionImage || { url: '', altText: '' },
      },
    }
  } catch (error) {
    console.error('Error fetching BrandValue:', error)
    return {
      title: '',
      subtitle: '',
      param1: { title: '', description: '', image: { url: '', altText: '' } },
      param2: { title: '', description: '', image: { url: '', altText: '' } },
      slogan: { title: '', description: '', image: { url: '', altText: '' } },
      value: { title: '', description: '', image: { url: '', altText: '' } },
      vision: { title: '', description: '', image: { url: '', altText: '' } },
    }
  }
}
