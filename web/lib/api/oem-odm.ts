/**
 * OEM/ODM GraphQL Queries
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { OemOdmData, ImageObject } from '@/lib/content-data'

const GET_OEM_ODM = gql`
  query GetOemOdm {
    oemOdmConfigs {
      oemTitle
      oemBgImage
      oemImage
      oemDescription1
      oemDescription2
      odmTitle
      odmBgImage
      odmImage
      odmDescription1
      odmDescription2
      status
    }
  }
`

const GET_MEDIA = gql`
  query GetMedia($id: ID!) {
    media(where: { id: $id }) {
      id
      filename
      file {
        url
      }
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
    const { data } = await keystoneClient.query({
      query: GET_MEDIA,
      variables: { id: mediaId },
    })
    const media = data?.media
    if (!media) return null
    const altText = extractLocale(media.altText, locale) || media.filename || ''
    return {
      url: media.variants?.large || media.variants?.medium || media.file?.url || '',
      altText,
      thumbnailUrl: media.variants?.thumbnail || media.file?.url || '',
      variants: media.variants || undefined,
    }
  } catch (error) {
    console.error(`Error fetching media ${mediaId}:`, error)
    return null
  }
}

export async function getOemOdm(locale: string = 'en'): Promise<OemOdmData> {
  try {
    const { data } = await keystoneClient.query({
      query: GET_OEM_ODM,
    })
    const config = data?.oemOdmConfigs?.[0]
    if (!config || config.status !== 'PUBLISHED') {
      return {
        oem: { title: '', bgImage: { url: '', altText: '' }, image: { url: '', altText: '' }, description: [] },
        odm: { title: '', bgImage: { url: '', altText: '' }, image: { url: '', altText: '' }, description: [] },
      }
    }

    const [oemBgImage, oemImage, odmBgImage, odmImage] = await Promise.all([
      fetchMedia(config.oemBgImage, locale),
      fetchMedia(config.oemImage, locale),
      fetchMedia(config.odmBgImage, locale),
      fetchMedia(config.odmImage, locale),
    ])

    return {
      oem: {
        title: extractLocale(config.oemTitle, locale),
        bgImage: oemBgImage || { url: '', altText: '' },
        image: oemImage || { url: '', altText: '' },
        description: [
          extractLocale(config.oemDescription1, locale),
          extractLocale(config.oemDescription2, locale),
        ],
      },
      odm: {
        title: extractLocale(config.odmTitle, locale),
        bgImage: odmBgImage || { url: '', altText: '' },
        image: odmImage || { url: '', altText: '' },
        description: [
          extractLocale(config.odmDescription1, locale),
          extractLocale(config.odmDescription2, locale),
        ],
      },
    }
  } catch (error) {
    console.error('Error fetching OemOdm:', error)
    return {
      oem: { title: '', bgImage: { url: '', altText: '' }, image: { url: '', altText: '' }, description: [] },
      odm: { title: '', bgImage: { url: '', altText: '' }, image: { url: '', altText: '' }, description: [] },
    }
  }
}
