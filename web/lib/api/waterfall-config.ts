import { convertToCDNUrl } from '@/lib/cdn-url'

const CMS_URL = process.env.CMS_GRAPHQL_URL
  ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '')
  : (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002')

export interface WaterfallConfigData {
  imageStaggerDelay: number;
  imageAnimationDuration: number;
  imageHoldDuration: number;
  textAnimationDuration: number;
  textHoldDuration: number;
}

export const defaultWaterfallConfig: WaterfallConfigData = {
  imageStaggerDelay: 0.2,
  imageAnimationDuration: 0.8,
  imageHoldDuration: 2.0,
  textAnimationDuration: 0.8,
  textHoldDuration: 3.0,
}

export async function getWaterfallConfig(locale?: string): Promise<WaterfallConfigData> {
  try {
    const url = new URL(`${CMS_URL}/api/globals/waterfall-config`)
    url.searchParams.append('depth', '1')
    if (locale) {
      url.searchParams.append('locale', locale)
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 },
      redirect: 'manual',
    })

    if (!response.ok || response.status === 302) {
      return defaultWaterfallConfig
    }

    const text = await response.text()
    if (!text || text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
      return defaultWaterfallConfig
    }

    const data = JSON.parse(text)

    return {
      imageStaggerDelay: data.imageStaggerDelay ?? defaultWaterfallConfig.imageStaggerDelay,
      imageAnimationDuration: data.imageAnimationDuration ?? defaultWaterfallConfig.imageAnimationDuration,
      imageHoldDuration: data.imageHoldDuration ?? defaultWaterfallConfig.imageHoldDuration,
      textAnimationDuration: data.textAnimationDuration ?? defaultWaterfallConfig.textAnimationDuration,
      textHoldDuration: data.textHoldDuration ?? defaultWaterfallConfig.textHoldDuration,
    }
  } catch (error) {
    console.error('Error fetching waterfall config:', error)
    return defaultWaterfallConfig
  }
}
