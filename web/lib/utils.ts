import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ImageObject } from "./content-data"

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
 * 获取本地化名称
 * 处理两种情况：
 * 1. 已本地化的字符串 (从 Payload API 获取时已经本地化)
 * 2. Record<string, string> 格式的多语言对象
 *
 * @param name - 名称（可以是字符串或多语言对象）
 * @param locale - 当前语言
 * @param fallback - 后备值
 * @returns 本地化后的字符串
 */
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
 * 站内链接解析器 - 确保 CMS 与前端路由 100% 对齐
 * 
 * 规则：
 * 1. 详解页 (Series) -> /products/[slug]
 * 2. 产品售卖页 (Products) -> /shop/[slug]
 * 3. 自定义页面 (Pages) -> 使用其自带的 path 字段 (如 /about)
 */
export function resolveInternalLink(url: string | null | undefined): string {
  if (!url) return "#"
  
  let path = url.trim()
  
  // 处理外部链接
  if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('tel:')) {
    return path
  }

  // 1. 修正详解页前缀: /product/xxx -> /products/xxx
  // (注意: 这里是单数变复数)
  if (path.startsWith('/product/')) {
    path = path.replace(/^\/product\//, '/products/')
  }

  // 2. 修正 One-Stop Shop 特定路径
  if (path === '/service/one-stop') {
    path = '/service/one-stop-shop'
  }

  // 3. 修正旧版 series 参数
  if (path.includes('/shop?series=')) {
    path = path.replace('/shop?series=', '/shop?category=')
  }

  // 4. 清洗重复斜杠
  path = path.replace(/\/+/g, '/')
  
  if (!path.startsWith('/')) {
    path = '/' + path
  }

  return path
}
