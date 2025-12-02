/**
 * Quote Steps GraphQL Queries
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { QuoteStepsData, ImageObject } from '@/lib/content-data'

const GET_QUOTE_STEPS = gql`
  query GetQuoteSteps {
    quoteStepsConfigs {
      title
      title2
      subtitle
      description
      step1Text
      step1Image
      step2Text
      step2Image
      step3Text
      step3Image
      step4Text
      step4Image
      step5Text
      step5Image
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

export async function getQuoteSteps(locale: string = 'en'): Promise<QuoteStepsData> {
  try {
    const { data } = await keystoneClient.query({ query: GET_QUOTE_STEPS })
    const config = data?.quoteStepsConfigs?.[0]
    if (!config || config.status !== 'PUBLISHED') {
      return { title: '', title2: '', subtitle: '', description: '', steps: [] }
    }

    const images = await Promise.all([
      fetchMedia(config.step1Image, locale),
      fetchMedia(config.step2Image, locale),
      fetchMedia(config.step3Image, locale),
      fetchMedia(config.step4Image, locale),
      fetchMedia(config.step5Image, locale),
    ])

    const steps = [
      { text: extractLocale(config.step1Text, locale), image: images[0] || { url: '', altText: '' } },
      { text: extractLocale(config.step2Text, locale), image: images[1] || { url: '', altText: '' } },
      { text: extractLocale(config.step3Text, locale), image: images[2] || { url: '', altText: '' } },
      { text: extractLocale(config.step4Text, locale), image: images[3] || { url: '', altText: '' } },
      { text: extractLocale(config.step5Text, locale), image: images[4] || { url: '', altText: '' } },
    ]

    return {
      title: extractLocale(config.title, locale),
      title2: extractLocale(config.title2, locale),
      subtitle: extractLocale(config.subtitle, locale),
      description: extractLocale(config.description, locale),
      steps,
    }
  } catch (error) {
    console.error('Error fetching QuoteSteps:', error)
    return { title: '', title2: '', subtitle: '', description: '', steps: [] }
  }
}
