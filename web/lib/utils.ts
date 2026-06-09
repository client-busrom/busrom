import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ImageObject, ImageCropData } from "./content-data"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 将 ImageObject 的 cropFocalPoint 转换为 CSS object-position 值
 * @param image - ImageObject 对象
 * @returns CSS object-position 字符串，默认为 "50% 50%"（居中）
 */
export function getObjectPosition(image?: ImageObject | null): string {
  if (!image?.cropFocalPoint) {
    return "50% 50%"
  }
  return `${image.cropFocalPoint.x}% ${image.cropFocalPoint.y}%`
}

/**
 * 根据 ImageCropData 生成裁剪渲染所需的 CSS 样式
 */
export function getCropStyles(
  cropData?: ImageCropData | null,
  displayWidth?: number,
  displayHeight?: number,
): { container: React.CSSProperties; image: React.CSSProperties } | null {
  if (!cropData || !cropData.croppedAreaPixels) return null

  const { croppedAreaPixels, variantWidth, variantHeight } = cropData

  if (!croppedAreaPixels.width || !croppedAreaPixels.height) return null

  const container: React.CSSProperties = {
    overflow: 'hidden',
    position: 'relative',
    width: displayWidth ? `${displayWidth}px` : '100%',
    height: displayHeight ? `${displayHeight}px` : '100%',
  }

  const widthPercent = (variantWidth / croppedAreaPixels.width) * 100
  const heightPercent = (variantHeight / croppedAreaPixels.height) * 100
  const leftPercent = (-croppedAreaPixels.x / croppedAreaPixels.width) * 100
  const topPercent = (-croppedAreaPixels.y / croppedAreaPixels.height) * 100

  const image: React.CSSProperties = {
    position: 'absolute',
    width: `${widthPercent}%`,
    height: `${heightPercent}%`,
    left: `${leftPercent}%`,
    top: `${topPercent}%`,
    maxWidth: 'none',
  }

  return { container, image }
}

import { convertToCDNUrl } from './cdn-url'

/**
 * 统一的图片变体获取逻辑
 */
export function getVariantUrl(
  image: ImageObject | null | undefined,
  size: 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge' | string,
  strategy?: string
): string {
  if (!image) return '/images/placeholder.jpg'

  const variants = (image?.variants || (image as any)?.sizes) as any || {}
  const getUrl = (val: any) => (typeof val === 'string' ? val : val?.url)

  const mapping: Record<string, string[]> = {
    thumbnail: ['thumbnail'],
    small: ['small', 'card'],
    medium: ['medium', 'tablet'],
    large: ['large', 'desktop'],
    xlarge: ['xlarge', 'original']
  }

  const getFallbackChain = (target: string): string[] => {
    switch (target) {
      case 'large': return ['large', 'medium', 'small']
      case 'medium': return ['medium', 'small']
      case 'small': return ['small']
      case 'xlarge': return ['xlarge']
      default: return [target]
    }
  }

  const chain = getFallbackChain(size)

  for (const s of chain) {
    const keys = mapping[s] || [s]
    for (const key of keys) {
      const url = getUrl(variants[key])
      if (url) {
        return convertToCDNUrl(url, strategy)
      }
    }
  }

  const finalUrl = image.url || (image as any).fileUrl || (image as any).file?.url || getUrl(variants.xlarge)
  
  if ((!finalUrl || finalUrl === '/images/placeholder.jpg') && Object.keys(variants).length > 0) {
    const firstVariant = Object.values(variants)[0]
    const fallbackUrl = getUrl(firstVariant)
    if (fallbackUrl) return convertToCDNUrl(fallbackUrl, strategy)
  }

  return finalUrl ? convertToCDNUrl(finalUrl, strategy) : '/images/placeholder.jpg'
}

/**
 * 统一生成 srcset 的逻辑
 */
export function getSrcSet(image: ImageObject | null | undefined, strategy?: string): string | undefined {
  if (!image || !image.variants) return undefined

  const v = image.variants as any
  const srcsetParts: string[] = []
  const getUrl = (val: any) => (typeof val === 'string' ? val : val?.url)

  const thumbUrl = getUrl(v.thumbnail)
  const smallUrl = getUrl(v.small || v.card)
  const mediumUrl = getUrl(v.medium || v.tablet)
  const largeUrl = getUrl(v.large || v.desktop)

  if (thumbUrl) srcsetParts.push(`${convertToCDNUrl(thumbUrl, strategy)} 400w`)
  if (smallUrl && smallUrl !== thumbUrl) {
    srcsetParts.push(`${convertToCDNUrl(smallUrl, strategy)} 768w`)
  }
  if (mediumUrl && mediumUrl !== thumbUrl && mediumUrl !== smallUrl) {
    srcsetParts.push(`${convertToCDNUrl(mediumUrl, strategy)} 1024w`)
  }
  if (largeUrl && largeUrl !== thumbUrl && largeUrl !== mediumUrl) {
    srcsetParts.push(`${convertToCDNUrl(largeUrl, strategy)} 1920w`)
  }

  return srcsetParts.length > 0 ? srcsetParts.join(', ') : undefined
}

export function getCropImageUrl(
  image: ImageObject | null | undefined,
  cropData: ImageCropData | null | undefined,
): string {
  if (!image) return '';

  let size = cropData?.variant || 'large';
  const sizeLower = size.toLowerCase();
  
  if (sizeLower.includes('original') || sizeLower.includes('xlarge')) {
    size = 'xlarge';
  } else if (sizeLower.includes('card')) {
    size = 'card';
  } else if (sizeLower.includes('thumbnail')) {
    size = 'thumbnail';
  } else if (sizeLower.includes('desktop') || sizeLower.includes('large')) {
    size = 'large';
  } else if (sizeLower.includes('tablet') || sizeLower.includes('medium')) {
    size = 'medium';
  } else if (sizeLower.includes('small')) {
    size = 'small';
  }

  return getVariantUrl(image, size);
}

export function getLocalizedName(
  name: string | Record<string, string> | undefined | null,
  locale: string,
  fallback: string = ""
): string {
  if (!name) return fallback
  if (typeof name === "string") return name
  return name[locale] || name["en"] || fallback
}

/**
 * 解析并规范化内部链接
 * - 处理绝对路径/相对路径
 * - 处理带有本站域名的完整 URL
 * - 确保以 / 开头（除非是外部链接）
 */
export function resolveInternalLink(path: string | null | undefined): string {
  if (!path) return '#'
  
  let urlStr = path.trim()

  // 1. 处理以 http 开头的完整 URL
  if (urlStr.startsWith('http')) {
    try {
      const url = new URL(urlStr)
      // 检查是否是指向本站的域名（包含各种可能的端口，如 :3001）
      const isInternalDomain = [
        'busromhouse.com',
        'www.busromhouse.com',
        'localhost',
        '127.0.0.1'
      ].some(d => url.hostname === d || url.hostname.endsWith('.' + d))

      if (isInternalDomain) {
        // 转换为相对路径，从而彻底消除端口泄露风险
        urlStr = (url.pathname + url.search + url.hash) || '/'
      } else {
        return urlStr // 真正的外部链接
      }
    } catch (e) {
      return urlStr
    }
  }

  // 2. 处理 mailto 和 tel
  if (urlStr.startsWith('mailto:') || urlStr.startsWith('tel:')) {
    return urlStr
  }

  // 3. 修正旧版链接格式
  if (urlStr === '/product' || urlStr.startsWith('/product?') || urlStr.startsWith('/product/')) {
    urlStr = urlStr.replace(/^\/product/, '/products')
  }

  if (urlStr === '/service/one-stop' || urlStr === '/service/one-stop-shop') {
    urlStr = '/service/one-stop-solution'
  }

  // 4. 清洗重复斜杠并确保以 / 开头
  urlStr = urlStr.replace(/\/+/g, '/')
  if (!urlStr.startsWith('/') && !urlStr.startsWith('#')) {
    urlStr = '/' + urlStr
  }

  return urlStr
}
