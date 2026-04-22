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
 * 
 * 使用方式：
 * ```tsx
 * const cropStyles = getCropStyles(cropData, containerWidth, containerHeight)
 * if (cropStyles) {
 *   // 有裁剪数据 — 用 overflow:hidden 容器 + transform 定位
 *   <div style={cropStyles.container}>
 *     <img style={cropStyles.image} src={...} />
 *   </div>
 * } else {
 *   // 无裁剪数据 — 用 object-fit:cover + objectPosition 的旧方式
 *   <img style={{ objectFit: 'cover', objectPosition: getObjectPosition(image) }} />
 * }
 * ```
 * 
 * @param cropData - 后台裁剪编辑器输出的数据
 * @param displayWidth - 实际渲染容器的宽度（px 或 CSS 值）
 * @param displayHeight - 实际渲染容器的高度（px 或 CSS 值）
 * @returns 容器和图片的 CSS 样式对象，或 null（无裁剪数据时）
 */
export function getCropStyles(
  cropData?: ImageCropData | null,
  displayWidth?: number,
  displayHeight?: number,
): { container: React.CSSProperties; image: React.CSSProperties } | null {
  if (!cropData || !cropData.croppedAreaPixels) return null

  const { croppedAreaPixels, variantWidth, variantHeight } = cropData

  // 如果没有有效裁剪区域，返回 null
  if (!croppedAreaPixels.width || !croppedAreaPixels.height) return null

  // 容器需要 overflow:hidden，显示裁剪框大小的区域
  const container: React.CSSProperties = {
    overflow: 'hidden',
    position: 'relative',
    width: displayWidth ? `${displayWidth}px` : '100%',
    height: displayHeight ? `${displayHeight}px` : '100%',
  }

  // 计算缩放：容器显示尺寸 / 裁剪区域像素尺寸
  // 如果没有指定 displayWidth/displayHeight，就用 100% 并让 CSS 自适应
  const scaleX = displayWidth ? displayWidth / croppedAreaPixels.width : 1
  const scaleY = displayHeight ? displayHeight / croppedAreaPixels.height : 1
  const scale = Math.max(scaleX, scaleY)

  // 图片定位：将裁剪区域的左上角对齐到容器左上角
  const image: React.CSSProperties = {
    position: 'absolute',
    width: `${variantWidth * scale}px`,
    height: `${variantHeight * scale}px`,
    left: `${-croppedAreaPixels.x * scale}px`,
    top: `${-croppedAreaPixels.y * scale}px`,
    maxWidth: 'none',
  }

  return { container, image }
}

/**
 * 根据 cropData.variant 获取对应的图片变体 URL
 * 
 * 变体映射：
 *   original → image.url (xlarge)
 *   desktop  → variants.large (1920px)
 *   tablet   → variants.medium (1024px)
 *   card     → variants.small (768px)
 *   thumbnail → variants.thumbnail (400px)
 */
export function getCropImageUrl(
  image: ImageObject | null | undefined,
  cropData: ImageCropData | null | undefined,
): string {
  if (!image) return ''
  if (!cropData?.variant) return image.variants?.large || image.url || ''

  const variantMap: Record<string, string | undefined> = {
    original: image.url || (image.variants?.xlarge as string | undefined),
    desktop: (image.variants?.large || image.variants?.desktop) as string | undefined,
    tablet: (image.variants?.medium || image.variants?.tablet) as string | undefined,
    card: (image.variants?.small || image.variants?.card) as string | undefined,
    thumbnail: image.variants?.thumbnail as string | undefined,
  }

  return variantMap[cropData.variant] || image.variants?.large || image.url || ''
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

  // 1. 修正详解页前缀: /product/xxx -> /products/xxx 或 /product -> /products
  // (注意: 这里是单数变复数)
  if (path === '/product' || path.startsWith('/product?') || path.startsWith('/product/')) {
    path = path.replace(/^\/product/, '/products')
  }

  // 2. 修正 One-Stop Solution 特定路径
  if (path === '/service/one-stop' || path === '/service/one-stop-shop') {
    path = '/service/one-stop-solution'
  }

  // 3. 修正 FAQ 路径从 /service/faq 移动到 /faq
  if (path === '/service/faq' || path.startsWith('/service/faq?')) {
    path = path.replace(/^\/service\/faq/, '/faq')
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
