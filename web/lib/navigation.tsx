"use client"

import type React from "react"

import NextLink from "next/link"
import { usePathname as useNextPathname, useRouter as useNextRouter } from "next/navigation"
import { locales, defaultLocale } from "@/i18n.config"

// 从路径里解析 locale
export function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/")
  if (segments.length > 1 && locales.includes(segments[1] as any)) {
    return segments[1]
  }
  return defaultLocale // 使用配置中的默认语言
}

// 自定义 usePathname 返回当前路径
export function usePathname(): string {
  const pathname = useNextPathname()
  return pathname || "/"
}

// 自定义 useRouter 包装 next/navigation 的 router
export function useRouter() {
  const router = useNextRouter()
  return router
}

interface LinkProps extends React.ComponentProps<typeof NextLink> {
  locale?: string
}

// 自定义 Link，自动添加 locale 路径前缀
export function Link({ href, locale, ...props }: LinkProps) {
  let hrefStr = typeof href === "string" ? href : href.pathname || "/"

  // 如果没有 locale 就用当前 pathname 中的 locale，或默认 locale
  const currentLocale = locale || getLocaleFromPathname(typeof window !== "undefined" ? window.location.pathname : "/")

  // 检查 href 是否已经包含任何 locale 前缀，避免重复添加
  const hasLocalePrefix = locales.some((loc) => hrefStr.startsWith(`/${loc}`))

  if (!hasLocalePrefix) {
    hrefStr = `/${currentLocale}${hrefStr.startsWith("/") ? "" : "/"}${hrefStr}`
  }

  return <NextLink href={hrefStr} {...props} />
}

/**
 * 替换 pathname 中的语言前缀（如 /en/about -> /zh/about）
 */
export function replaceLocaleInPath(pathname: string, newLocale: string): string {
  const segments = pathname.split("/").filter(Boolean)

  // 如果第一个路径段是 locale，则移除
  if (segments.length > 0 && locales.includes(segments[0] as any)) {
    segments.shift()
  }

  // 拼接新路径
  return `/${newLocale}${segments.length > 0 ? "/" + segments.join("/") : ""}`
}

// 因为 redirect 只能在 server 里用，这里直接导出 next/navigation 的 redirect
export { redirect } from "next/navigation"
