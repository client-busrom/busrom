/**
 * Why Choose Busrom GraphQL Queries
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { WhyChooseBusromData, ImageObject } from '@/lib/content-data'

const GET_WHY_CHOOSE_BUSROM = gql`
  query GetWhyChooseBusrom {
    whyChooseBusromConfigs {
      title
      title2
      reason1
      reason1Image
      reason2
      reason2Image
      reason3
      reason3Image
      reason4
      reason4Image
      reason5
      reason5Image
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

export async function getWhyChooseBusrom(locale: string = 'en'): Promise<WhyChooseBusromData> {
  try {
    const { data } = await keystoneClient.query({ query: GET_WHY_CHOOSE_BUSROM })
    const config = data?.whyChooseBusromConfigs?.[0]
    if (!config || config.status !== 'PUBLISHED') {
      return { title: '', title2: '', reasons: [] }
    }

    const images = await Promise.all([
      fetchMedia(config.reason1Image, locale),
      fetchMedia(config.reason2Image, locale),
      fetchMedia(config.reason3Image, locale),
      fetchMedia(config.reason4Image, locale),
      fetchMedia(config.reason5Image, locale),
    ])

    const reasons = [
      { title: '', description: extractLocale(config.reason1, locale), image: images[0] || { url: '', altText: '' } },
      { title: '', description: extractLocale(config.reason2, locale), image: images[1] || { url: '', altText: '' } },
      { title: '', description: extractLocale(config.reason3, locale), image: images[2] || { url: '', altText: '' } },
      { title: '', description: extractLocale(config.reason4, locale), image: images[3] || { url: '', altText: '' } },
      { title: '', description: extractLocale(config.reason5, locale), image: images[4] || { url: '', altText: '' } },
    ]

    return {
      title: extractLocale(config.title, locale),
      title2: extractLocale(config.title2, locale),
      reasons,
    }
  } catch (error) {
    console.error('Error fetching WhyChooseBusrom:', error)
    return { title: '', title2: '', reasons: [] }
  }
}
