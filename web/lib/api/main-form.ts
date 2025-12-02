/**
 * Main Form GraphQL Queries
 */

import { gql } from '@apollo/client'
import { keystoneClient } from '@/lib/keystone-client'
import type { MainFormData, ImageObject } from '@/lib/content-data'

const GET_MAIN_FORM = gql`
  query GetMainForm {
    mainFormConfigs {
      placeholderName
      placeholderEmail
      placeholderWhatsapp
      placeholderCompany
      placeholderMessage
      placeholderVerify
      buttonText
      designTextLeft
      designTextRight
      image1
      image2
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

export async function getMainForm(locale: string = 'en'): Promise<MainFormData> {
  try {
    const { data } = await keystoneClient.query({ query: GET_MAIN_FORM })
    const config = data?.mainFormConfigs?.[0]
    if (!config || config.status !== 'PUBLISHED') {
      return {
        placeholderName: '',
        placeholderEmail: '',
        placeholderWhatsapp: '',
        placeholderCompany: '',
        placeholderMessage: '',
        placeholderVerify: '',
        buttonText: '',
        designTextLeft: '',
        designTextRight: '',
        image1: { url: '', altText: '' },
        image2: { url: '', altText: '' },
      }
    }

    const [image1, image2] = await Promise.all([
      fetchMedia(config.image1, locale),
      fetchMedia(config.image2, locale),
    ])

    return {
      placeholderName: extractLocale(config.placeholderName, locale),
      placeholderEmail: extractLocale(config.placeholderEmail, locale),
      placeholderWhatsapp: extractLocale(config.placeholderWhatsapp, locale),
      placeholderCompany: extractLocale(config.placeholderCompany, locale),
      placeholderMessage: extractLocale(config.placeholderMessage, locale),
      placeholderVerify: extractLocale(config.placeholderVerify, locale),
      buttonText: extractLocale(config.buttonText, locale),
      designTextLeft: extractLocale(config.designTextLeft, locale),
      designTextRight: extractLocale(config.designTextRight, locale),
      image1: image1 || { url: '', altText: '' },
      image2: image2 || { url: '', altText: '' },
    }
  } catch (error) {
    console.error('Error fetching MainForm:', error)
    return {
      placeholderName: '',
      placeholderEmail: '',
      placeholderWhatsapp: '',
      placeholderCompany: '',
      placeholderMessage: '',
      placeholderVerify: '',
      buttonText: '',
      designTextLeft: '',
      designTextRight: '',
      image1: { url: '', altText: '' },
      image2: { url: '', altText: '' },
    }
  }
}
