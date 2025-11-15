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
