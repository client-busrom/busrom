"use client"

import type React from "react"

import NextLink from "next/link"
import { usePathname as useNextPathname, useRouter as useNextRouter } from "next/navigation"
import { locales, defaultLocale, nonDefaultLocales } from "@/i18n.config"

/**
 * URL 策略:
 * - 英文(默认): / (无前缀)
 * - 其他语言: /zh, /fr 等
 */

// 从路径里解析 locale
export function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/")
  // 检查第一个段是否是非默认语言
  if (segments.length > 1 && locales.includes(segments[1] as any)) {
    return segments[1]
  }
  // 没有语言前缀 = 默认语言(英文)
  return defaultLocale
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

/**
 * 自定义 Link 组件
 * - 默认语言(en): 不添加前缀，/about
 * - 其他语言: 添加前缀，/zh/about
 */
export function Link({ href, locale, ...props }: LinkProps) {
  let hrefStr = typeof href === "string" ? href : href.pathname || "/"

  // 获取目标 locale
  const targetLocale = locale || getLocaleFromPathname(typeof window !== "undefined" ? window.location.pathname : "/")

  // 移除已有的 locale 前缀（如果有）
  const cleanPath = removeLocalePrefix(hrefStr)

  // 只为非默认语言添加前缀
  if (targetLocale !== defaultLocale) {
    hrefStr = `/${targetLocale}${cleanPath}`
  } else {
    hrefStr = cleanPath
  }

  return <NextLink href={hrefStr} {...props} />
}

/**
 * 移除路径中的 locale 前缀
 */
function removeLocalePrefix(pathname: string): string {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return "/"
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1)
    }
  }
  return pathname
}

/**
 * 替换 pathname 中的语言前缀
 * - 切换到英文: /zh/about -> /about
 * - 切换到中文: /about -> /zh/about
 * - 首页特殊处理: / -> /zh (不是 /zh/)
 */
export function replaceLocaleInPath(pathname: string, newLocale: string): string {
  // 先移除任何已有的 locale 前缀
  const cleanPath = removeLocalePrefix(pathname)

  // 默认语言不需要前缀
  if (newLocale === defaultLocale) {
    return cleanPath || "/"
  }

  // 首页特殊处理：/ 变成 /zh，不是 /zh/
  if (cleanPath === "/") {
    return `/${newLocale}`
  }

  // 非默认语言添加前缀
  return `/${newLocale}${cleanPath}`
}

// 因为 redirect 只能在 server 里用，这里直接导出 next/navigation 的 redirect
export { redirect } from "next/navigation"
