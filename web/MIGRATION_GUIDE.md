# 项目功能迁移指南

本文档提供了从 Busrom 项目迁移关键功能和组件到新项目的完整代码和说明。

## 目录

1. [Tailwind 配置](#1-tailwind-配置)
2. [全局样式 (globals.css)](#2-全局样式-globalscss)
3. [中间件配置](#3-中间件配置)
4. [工具函数库](#4-工具函数库)
5. [Hooks](#5-hooks)
6. [核心组件](#6-核心组件)
7. [页面组件](#7-页面组件)
8. [Layout 组件](#8-layout-组件)
9. [Home 组件](#9-home-组件)
10. [HeroBanner 组件](#10-herobanner-组件)
11. [依赖包](#11-依赖包)
12. [Apollo Client 适配说明](#12-apollo-client-适配说明)

---

## 1. Tailwind 配置

### 文件路径: `tailwind.config.ts`

```typescript
/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // --- 1. shadcn/ui 语义化颜色 (由 globals.css 驱动) ---
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // --- 2. 品牌调色板 (根据你的设计规范调整) ---
        brand: {
          main: "#F6F4ED",
          secondary: "#756F3F",
          text: {
            main: "#3C3C3C",
            black: "#000000",
            inverse: "#FFFFFF",
          },
          accent: {
            gold: "#A08745",
            "gold-light": "#978350",
            border: "#CDC094",
          },
          cream: {
            DEFAULT: "#FFFAD3",
            dark: "#DAC99E",
          },
          form: {
            bg: "#BFB672",
            "input-border": "#FFFFFF",
            "input-text": "#2B1F00",
            "button-bg": "#684D07",
            "title-stroke": "#363109",
          },
          footer: {
            "button-bg": "#D4CC8E",
            "button-text": "#625D2F",
            "emphasis-bg": "#625D2F",
            "emphasis-text": "#D2CC9E",
          }
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // --- Web Fonts (使用 CSS 变量) ---
        'paytone-one': ['var(--font-paytone-one)', 'sans-serif'],
        'poller-one':  ['var(--font-poller-one)', 'serif'],
        'pavanam':     ['var(--font-pavanam)', 'sans-serif'],
        'phudu':       ['var(--font-phudu)', 'sans-serif'],
        'anaheim':     ['var(--font-anaheim)', 'sans-serif'],
        'montserrat':  ['var(--font-montserrat)', 'sans-serif'],

        // --- 系统字体 ---
        'arial':    ['Arial', 'sans-serif'],
        'pingfang': ['"PingFang SC"', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar-hide"),
    require('@tailwindcss/aspect-ratio'),
  ],
}
export default config
```

**说明:**
- 保留了 shadcn/ui 的语义化颜色系统
- 添加了品牌色调色板 (根据你的项目调整颜色值)
- 配置了 Google Fonts 和系统字体
- 包含必要的 Tailwind 插件

---

## 2. 全局样式 (globals.css)

### 文件路径: `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* 品牌颜色映射 (来自 Figma 规范) */

    /* 主背景: #F6F4ED (主选色) */
    --background: 48 27% 95%;

    /* 主文字: #3C3C3C (柔和的黑色) */
    --foreground: 0 0% 24%;

    /* 卡片/弹出框背景: #FFFFFF */
    --card: 0 0% 100%;
    --card-foreground: 0 0% 24%;

    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 24%;

    /* 主要交互色 (按钮): #756F3F */
    --primary: 55 18% 44%;
    --primary-foreground: 0 0% 100%;

    /* 次要交互色: #A08745 */
    --secondary: 44 38% 45%;
    --secondary-foreground: 0 0% 100%;

    /* 柔和/禁用状态: #DAC99E */
    --muted: 44 46% 76%;
    --muted-foreground: 55 18% 44%;

    /* 悬停/强调状态 */
    --accent: 44 46% 76%;
    --accent-foreground: 0 0% 24%;

    /* 破坏性/错误色 */
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    /* 边框/输入框: #CDC094 */
    --border: 48 30% 72%;
    --input: 0 0% 100%;

    /* 焦点环 */
    --ring: 55 18% 44%;

    /* 圆角 */
    --radius: 0.5rem;
  }

  .dark {
    /* 暗黑模式 (可选) */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

html, body {
  /* 在加载完成前禁用滚动条,避免布局问题 */
  overflow: hidden;
}

/* 文字光泽扫过效果动画 */
@layer utilities {
  @keyframes shine {
    to {
      background-position-x: -250%;
    }
  }
}

.animate-shine {
  animation: shine 2s linear infinite;
}

/* 文字描边效果 */
.text-stroke-black {
  color: hsl(var(--background)) !important;
  text-shadow:
    -1px -1px 0 #000,
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000;
}

.text-stroke-custom {
  -webkit-text-stroke: 0.04em #443D05;
  text-stroke: 0.04em #443D05;
}

.text-stroke-custom-light {
  -webkit-text-stroke: 0.03em #FDF6C2;
  text-stroke: 0.03em #FDF6C2;
}

.text-stroke-custom-orange {
  -webkit-text-stroke: 0.04em #75703F;
  text-stroke: 0.04em #75703F;
}

.text-stroke-custom-white {
  -webkit-text-stroke: 0.04em#6B4E00;
  text-stroke: 0.04em#6B4E00;
}

.text-stroke-custom-gold {
  -webkit-text-stroke: 0.04em#565020;
  text-stroke: 0.04em#565020;
}
```

**注意事项:**
- CSS 变量使用 HSL 格式 (Hue Saturation Lightness)
- 根据你的设计规范调整颜色值
- `overflow: hidden` 在 Preloader 完成后需要恢复

---

## 3. 中间件配置

### 文件路径: `middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from '@/i18n.config';

function getLocale(request: NextRequest): string {
  // 1. 优先从 user-preferences cookie 中获取语言
  const preferencesCookie = request.cookies.get('user-preferences')?.value;
  if (preferencesCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(preferencesCookie));
      if (parsed.language && locales.includes(parsed.language)) {
        return parsed.language;
      }
    } catch (e) { /* ignore malformed cookie */ }
  }

  // 2. 如果没有 cookie,再从 Accept-Language header 获取
  const languages = request.headers.get('accept-language')?.split(',')?.map(lang => lang.split(';')[0]);
  if (languages) {
    for (const lang of languages) {
      if (locales.includes(lang as any)) return lang;
      const baseLang = lang.split('-')[0];
      if (locales.includes(baseLang as any)) return baseLang;
    }
  }

  // 3. 回退到默认语言
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
```

**说明:**
- 根据新项目实际的语言列表修改 `locales`
- 自动将用户重定向到合适的语言路径
- 优先级: Cookie > Accept-Language Header > 默认语言

---

## 4. 工具函数库

### 4.1 lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 4.2 lib/countries-languages.ts

```typescript
export interface Country {
  code: string
  name: string
  flag: string
}

export interface Language {
  code: string
  name: string
  nativeName: string
}

export const countries: Record<string, Country[]> = {
  "North America": [
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
  ],
  "South America": [
    { code: "MX", name: "Mexico", flag: "🇲🇽" },
    { code: "BR", name: "Brazil", flag: "🇧🇷" },
    { code: "CO", name: "Colombia", flag: "🇨🇴" },
    { code: "GY", name: "Guyana", flag: "🇬🇾" },
    { code: "BS", name: "Bahamas", flag: "🇧🇸" },
    { code: "PA", name: "Panama", flag: "🇵🇦" },
    { code: "UY", name: "Uruguay", flag: "🇺🇾" },
    { code: "CL", name: "Chile", flag: "🇨🇱" },
    { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
    { code: "AR", name: "Argentina", flag: "🇦🇷" },
    { code: "DO", name: "Dominican Republic", flag: "🇩🇴" },
    { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹" },
  ],
  Europe: [
    { code: "AT", name: "Austria", flag: "🇦🇹" },
    { code: "BE", name: "Belgium", flag: "🇧🇪" },
    { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
    { code: "DK", name: "Denmark", flag: "🇩🇰" },
    { code: "DE", name: "Germany", flag: "🇩🇪" },
    { code: "HU", name: "Hungary", flag: "🇭🇺" },
    { code: "IE", name: "Ireland", flag: "🇮🇪" },
    { code: "IS", name: "Iceland", flag: "🇮🇸" },
    { code: "IT", name: "Italy", flag: "🇮🇹" },
    { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
    { code: "NL", name: "Netherlands", flag: "🇳🇱" },
    { code: "NO", name: "Norway", flag: "🇳🇴" },
    { code: "PL", name: "Poland", flag: "🇵🇱" },
    { code: "SK", name: "Slovakia", flag: "🇸🇰" },
    { code: "ES", name: "Spain", flag: "🇪🇸" },
    { code: "SE", name: "Sweden", flag: "🇸🇪" },
    { code: "CH", name: "Switzerland", flag: "🇨🇭" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "FI", name: "Finland", flag: "🇫🇮" },
  ],
  Africa: [
    { code: "SC", name: "Seychelles", flag: "🇸🇨" },
    { code: "MU", name: "Mauritius", flag: "🇲🇺" },
    { code: "GA", name: "Gabon", flag: "🇬🇦" },
    { code: "GQ", name: "Equatorial Guinea", flag: "🇬🇶" },
    { code: "EG", name: "Egypt", flag: "🇪🇬" },
    { code: "BW", name: "Botswana", flag: "🇧🇼" },
    { code: "DZ", name: "Algeria", flag: "🇩🇿" },
    { code: "ZA", name: "South Africa", flag: "🇿🇦" },
    { code: "LY", name: "Libya", flag: "🇱🇾" },
    { code: "TN", name: "Tunisia", flag: "🇹🇳" },
    { code: "SZ", name: "Eswatini", flag: "🇸🇿" },
    { code: "NA", name: "Namibia", flag: "🇳🇦" },
    { code: "CV", name: "Cabo Verde", flag: "🇨🇻" },
    { code: "MA", name: "Morocco", flag: "🇲🇦" },
    { code: "AO", name: "Angola", flag: "🇦🇴" },
  ],
  "Middle East": [
    { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
    { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
    { code: "QA", name: "Qatar", flag: "🇶🇦" },
    { code: "BH", name: "Bahrain", flag: "🇧🇭" },
    { code: "KW", name: "Kuwait", flag: "🇰🇼" },
    { code: "IL", name: "Israel", flag: "🇮🇱" },
    { code: "TR", name: "Turkey", flag: "🇹🇷" },
    { code: "OM", name: "Oman", flag: "🇴🇲" },
    { code: "AZ", name: "Azerbaijan", flag: "🇦🇿" },
    { code: "LB", name: "Lebanon", flag: "🇱🇧" },
    { code: "JO", name: "Jordan", flag: "🇯🇴" },
    { code: "IR", name: "Iran", flag: "🇮🇷" },
    { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  ],
  Oceania: [
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
    { code: "PW", name: "Palau", flag: "🇵🇼" },
    { code: "NR", name: "Nauru", flag: "🇳🇷" },
    { code: "FJ", name: "Fiji", flag: "🇫🇯" },
    { code: "TV", name: "Tuvalu", flag: "🇹🇻" },
    { code: "TO", name: "Tonga", flag: "🇹🇴" },
    { code: "WS", name: "Samoa", flag: "🇼🇸" },
    { code: "MH", name: "Marshall Islands", flag: "🇲🇭" },
    { code: "FM", name: "Micronesia", flag: "🇫🇲" },
    { code: "KI", name: "Kiribati", flag: "🇰🇮" },
    { code: "VU", name: "Vanuatu", flag: "🇻🇺" },
    { code: "PG", name: "Papua New Guinea", flag: "🇵🇬" },
    { code: "SB", name: "Solomon Islands", flag: "🇸🇧" },
  ],
  "Rest Of The World": [{ code: "ROW", name: "Rest Of The World", flag: "🌍" }],
}

export const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "ber", name: "Berber", nativeName: "Tamazight" },
  { code: "ku", name: "Kurdish", nativeName: "Kurdî" },
  { code: "fa", name: "Persian", nativeName: "فارسی" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "he", name: "Hebrew", nativeName: "עברית" },
  { code: "az", name: "Azerbaijani", nativeName: "Azərbaycan" },
]

// 默认设置
export const DEFAULT_COUNTRY = "US"
export const DEFAULT_LANGUAGE = "en"

// 获取国家信息
export function getCountryByCode(code: string): Country | undefined {
  for (const region of Object.values(countries)) {
    const country = region.find((c) => c.code === code)
    if (country) return country
  }
  return undefined
}

// 获取语言信息
export function getLanguageByCode(code: string): Language | undefined {
  return languages.find((l) => l.code === code)
}

// 获取所有国家的扁平列表
export function getAllCountries(): Country[] {
  return Object.values(countries).flat()
}
```

**说明:** 根据新项目的需求调整国家和语言列表。

### 4.3 lib/scroll-utils.ts

```typescript
export const smoothScrollToTop = () => {
  const scrollStep = -window.scrollY / (500 / 15) // 500ms duration
  const scrollInterval = setInterval(() => {
    if (window.scrollY !== 0) {
      window.scrollBy(0, scrollStep)
    } else {
      clearInterval(scrollInterval)
    }
  }, 15)
}

export const scrollToElement = (elementId: string, offset = 0) => {
  const element = document.getElementById(elementId)
  if (element) {
    const elementPosition = element.offsetTop - offset
    window.scrollTo({
      top: elementPosition,
      behavior: "smooth",
    })
  }
}
```

### 4.4 lib/navigation.tsx

```typescript
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

// 自定义 Link,自动添加 locale 路径前缀
export function Link({ href, locale, ...props }: LinkProps) {
  let hrefStr = typeof href === "string" ? href : href.pathname || "/"

  const currentLocale = locale || getLocaleFromPathname(typeof window !== "undefined" ? window.location.pathname : "/")

  const hasLocalePrefix = locales.some((loc) => hrefStr.startsWith(`/${loc}`))

  if (!hasLocalePrefix) {
    hrefStr = `/${currentLocale}${hrefStr.startsWith("/") ? "" : "/"}${hrefStr}`
  }

  return <NextLink href={hrefStr} {...props} />
}

/**
 * 替换 pathname 中的语言前缀(如 /en/about -> /zh/about)
 */
export function replaceLocaleInPath(pathname: string, newLocale: string): string {
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length > 0 && locales.includes(segments[0] as any)) {
    segments.shift()
  }

  return `/${newLocale}${segments.length > 0 ? "/" + segments.join("/") : ""}`
}

export { redirect } from "next/navigation"
```

### 4.5 lib/server/user-preferences.ts

```typescript
import { cookies } from "next/headers"
import { DEFAULT_COUNTRY, DEFAULT_LANGUAGE } from "@/lib/countries-languages"

export async function getUserPreferencesFromCookies(): Promise<{ country: string; language: string }> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("user-preferences")?.value

  if (raw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(raw))
      return {
        country: parsed.country || DEFAULT_COUNTRY,
        language: parsed.language || DEFAULT_LANGUAGE,
      }
    } catch (error) {
      console.error("Failed to parse user-preferences cookie:", error)
    }
  }

  return {
    country: DEFAULT_COUNTRY,
    language: DEFAULT_LANGUAGE,
  }
}
```

### 4.6 i18n.config.ts

```typescript
export const defaultLocale = "en"

// 只包含当前有完整内容和 UI 翻译的语言
export const locales = ["en", "zh"] as const

export type Locale = (typeof locales)[number]

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

// 用于 next-intl 的静态 UI 翻译
export const getMessages = async (locale: Locale) => {
  return (await import(`./messages/${locale}.json`)).default
}
```

**说明:** 根据新项目支持的语言修改 `locales` 数组。

---

## 5. Hooks

### 5.1 hooks/use-mobile.tsx

```typescript
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```

### 5.2 hooks/useUserPreferences.ts

```typescript
"use client"

import { useState, useEffect } from "react"
import { DEFAULT_COUNTRY, DEFAULT_LANGUAGE } from "@/lib/countries-languages"

export interface UserPreferences {
  country: string
  language: string
}

const STORAGE_KEY = "user-preferences"

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    country: DEFAULT_COUNTRY,
    language: DEFAULT_LANGUAGE,
  })

  const [isLoaded, setIsLoaded] = useState(false)

  // 从 localStorage 加载偏好设置(仅客户端运行)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setPreferences({
          country: parsed.country || DEFAULT_COUNTRY,
          language: parsed.language || DEFAULT_LANGUAGE,
        })
      }
    } catch (error) {
      console.error("Failed to load user preferences from localStorage:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // 同时更新 localStorage 和 cookie
  const savePreferences = (updated: UserPreferences) => {
    setPreferences(updated)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

      document.cookie = `user-preferences=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=31536000`
    } catch (error) {
      console.error("Failed to save user preferences:", error)
    }
  }

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    savePreferences({ ...preferences, ...newPrefs })
  }

  const updateCountry = (country: string) => {
    updatePreferences({ country })
  }

  const updateLanguage = (language: string) => {
    updatePreferences({ language })
  }

  return {
    preferences,
    isLoaded,
    updateCountry,
    updateLanguage,
    updatePreferences,
  }
}
```

---

## 6. 核心组件

### 6.1 components/easings.ts

```typescript
export const easings: Record<string, { fn: (t: number) => number }> = {
  // Linear
  linear: { fn: (t) => t },

  // Quad
  easeInQuad: { fn: (t) => t * t },
  easeOutQuad: { fn: (t) => t * (2 - t) },
  easeInOutQuad: { fn: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t) },
  easeOutInQuad: { fn: (t) => (t < 0.5 ? t * (2 * t) : (2 * t - 1) * (2 - (2 * t - 1))) },

  // Cubic
  easeInCubic: { fn: (t) => t * t * t },
  easeOutCubic: { fn: (t) => 1 - Math.pow(1 - t, 3) },
  easeInOutCubic: { fn: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) },
  easeOutInCubic: { fn: (t) => (t < 0.5 ? 1 - Math.pow(1 - 2 * t, 3) / 2 : Math.pow(2 * t - 1, 3) / 2 + 0.5) },

  // Quart
  easeInQuart: { fn: (t) => t ** 4 },
  easeOutQuart: { fn: (t) => 1 - Math.pow(1 - t, 4) },
  easeInOutQuart: { fn: (t) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2) },
  easeOutInQuart: { fn: (t) => (t < 0.5 ? 1 - Math.pow(1 - 2 * t, 4) / 2 : Math.pow(2 * t - 1, 4) / 2 + 0.5) },

  // Quint
  easeInQuint: { fn: (t) => t ** 5 },
  easeOutQuint: { fn: (t) => 1 - Math.pow(1 - t, 5) },
  easeInOutQuint: { fn: (t) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2) },
  easeOutInQuint: { fn: (t) => (t < 0.5 ? 1 - Math.pow(1 - 2 * t, 5) / 2 : Math.pow(2 * t - 1, 5) / 2 + 0.5) },

  // Expo
  easeInExpo: { fn: (t) => (t === 0 ? 0 : 2 ** (10 * t - 10)) },
  easeOutExpo: { fn: (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)) },
  easeInOutExpo: { fn: (t) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2 },
  easeOutInExpo: { fn: (t) => t < 0.5 ? 1 - 2 ** (-20 * t) / 2 : 2 ** (20 * (t - 0.5) - 10) / 2 + 0.5 },

  // Circ
  easeInCirc: { fn: (t) => 1 - Math.sqrt(1 - t * t) },
  easeOutCirc: { fn: (t) => Math.sqrt(1 - (t - 1) ** 2) },
  easeInOutCirc: { fn: (t) => t < 0.5 ? (1 - Math.sqrt(1 - 4 * t ** 2)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2 },
  easeOutInCirc: { fn: (t) => t < 0.5 ? Math.sqrt(1 - (2 * t - 1) ** 2) / 2 : 1 - Math.sqrt(1 - (2 * t - 1) ** 2) / 2 },

  // Back
  easeInBack: { fn: (t) => t * t * (2.70158 * t - 1.70158) },
  easeOutBack: { fn: (t) => 1 + (--t) * t * (2.70158 * t + 1.70158) },
  easeInOutBack: { fn: (t) => t < 0.5 ? 2 * t * t * (7.189819 * t - 2.5949095) : 1 + 2 * (--t) * t * (7.189819 * t + 2.5949095) },
  easeOutInBack: { fn: (t) => t < 0.5 ? 1 + 2 * (2 * t - 1) * (2 * t) * (7.189819 * 2 * t + 2.5949095) : 2 * ((2 * t - 1) ** 2 * (7.189819 * (2 * t - 1) - 2.5949095)) },

  // Elastic
  easeInElastic: { fn: (t) => t === 0 ? 0 : t === 1 ? 1 : (-2) ** (10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3)) },
  easeOutElastic: { fn: (t) => t === 0 ? 0 : t === 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1 },
  easeInOutElastic: { fn: (t) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(2 ** (20 * t - 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2 : (2 ** (-20 * t + 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2 + 1 },
  easeOutInElastic: { fn: (t) => t < 0.5 ? 2 ** (-20 * t) * Math.sin((20 * t - 0.75) * ((2 * Math.PI) / 3)) / 2 : (-2) ** (20 * (t - 0.5) - 10) * Math.sin((20 * (t - 0.5) - 10.75) * ((2 * Math.PI) / 3)) / 2 + 0.5 },

  // Bounce
  easeInBounce: { fn: (t) => 1 - easings.easeOutBounce.fn(1 - t) },
  easeOutBounce: { fn: (t) => {
    const n1 = 7.5625, d1 = 2.75
    if (t < 1 / d1) return n1 * t * t
    else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
    else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
    else return n1 * (t -= 2.625 / d1) * t + 0.984375
  }},
  easeInOutBounce: { fn: (t) => t < 0.5 ? (1 - easings.easeOutBounce.fn(1 - 2 * t)) / 2 : (1 + easings.easeOutBounce.fn(2 * t - 1)) / 2 },
  easeOutInBounce: { fn: (t) => t < 0.5 ? easings.easeOutBounce.fn(2 * t) / 2 : 0.5 + (1 - easings.easeOutBounce.fn(2 - 2 * t)) / 2 },
}
```

### 6.2 components/lenis-provider.tsx

```typescript
"use client"

import { useEffect } from "react"
import Lenis from "lenis"
import { easings } from "./easings"

interface LenisProviderProps {
  easingKey: string
}

export function LenisProvider({ easingKey }: LenisProviderProps) {
  useEffect(() => {
    const selected = easings[easingKey]

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    const lenis = new Lenis({
      duration: 1,
      easing: selected.fn,
      lerp: 0.05,
      syncTouch: true,
      syncTouchLerp: isTouchDevice ? 0.15 : undefined,
      touchMultiplier: 1,
      wheelMultiplier: 1,
      smoothWheel: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [easingKey])

  return null
}
```

### 6.3 components/Preloader.tsx

**注意:** 这个组件使用了 Three.js,需要预先准备好 SVG logo 和图片资源。

```typescript
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import gsap from "gsap";

// GLSL 着色器代码
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uProgressReveal;
  uniform float uProgressShine;
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    float alpha = step(vUv.x, uProgressReveal);
    if (alpha < 0.5) discard;
    float shineWidth = 0.2;
    float shinePosition = uProgressShine * (1.0 + shineWidth) - shineWidth;
    float gradientFactor = smoothstep(shinePosition - shineWidth, shinePosition, vUv.x) - smoothstep(shinePosition, shinePosition + shineWidth, vUv.x);
    vec3 finalColor = mix(uBaseColor, uHighlightColor, gradientFactor);
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

interface PreloaderProps {
  onLoadingComplete: () => void;
}

export function Preloader({ onLoadingComplete }: PreloaderProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    // --- 场景设置 ---
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 2;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountNode.appendChild(renderer.domElement);

    // --- 材质 ---
    const loadingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uProgressReveal: { value: 0 },
        uProgressShine: { value: 0 },
        uBaseColor: { value: new THREE.Color("#EBE6D8") },
        uHighlightColor: { value: new THREE.Color("#000000") },
        uOpacity: { value: 1.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    // --- 资源加载 ---
    const loadingManager = new THREE.LoadingManager();
    const fontLoader = new FontLoader(loadingManager);
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const svgLoader = new SVGLoader(loadingManager);

    let font: any = null;
    let loadingText: THREE.Mesh | null = null;
    let percentageText: THREE.Mesh | null = null;
    let logoMesh: THREE.Group | null = null;

    // 加载你的品牌 Logo SVG (需要根据实际路径调整)
    svgLoader.load('/Busrom1.svg', (data) => {
      const paths = data.paths;
      const group = new THREE.Group();

      for (let i = 0; i < paths.length; i++) {
          const path = paths[i];
          const fillColor = path.userData?.style.fill;
          const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setStyle(fillColor).convertSRGBToLinear(),
            opacity: path.userData?.style.fillOpacity,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
          });
          const shapes = SVGLoader.createShapes(path);
          for (let j = 0; j < shapes.length; j++) {
              const shape = shapes[j];
              const extrudeSettings = { depth: 24, bevelEnabled: false };
              const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
              const mesh = new THREE.Mesh(geometry, material);
              group.add(mesh);
          }
      }

      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());
      group.children.forEach((mesh) => {
          if (mesh instanceof THREE.Mesh) {
            mesh.geometry.translate(-center.x, -center.y, -center.z);
          }
      });

      group.scale.set(0.01, -0.01, 0.01);
      group.position.set(0, 0, 0);
      logoMesh = group;
    });

    fontLoader.load("https://cdn.jsdelivr.net/npm/three@0.137/examples/fonts/helvetiker_bold.typeface.json", (loadedFont) => {
      font = loadedFont;
      const loadingGeo = new TextGeometry("Loading", { font, size: 0.15, depth: 0.05, curveSegments: 12 });
      loadingGeo.center();
      loadingText = new THREE.Mesh(loadingGeo, loadingMaterial);
      loadingText.position.y = 0.1;
      scene.add(loadingText);
      loadingMaterial.uniforms.uProgressReveal.value = 1;

      // 预加载一些图片资源 (根据实际需要调整)
      for (let i = 1; i <= 7; i++) {
        textureLoader.load(`/${i}.jpg`);
      }
    });

    // --- 动画逻辑 ---
    const masterTimeline = gsap.timeline({ paused: true });

    const fakeProgress = { value: 0 };
    masterTimeline.to(fakeProgress, {
      value: 100,
      duration: 2.5,
      ease: "power1.out",
      onUpdate: () => {
        if (!font) return;
        if (percentageText) {
          scene.remove(percentageText);
          percentageText.geometry.dispose();
        }
        const percentageGeo = new TextGeometry(`${Math.round(fakeProgress.value)}%`, { font, size: 0.12, depth: 0.05, curveSegments: 12 });
        percentageGeo.center();
        percentageText = new THREE.Mesh(percentageGeo, loadingMaterial);
        percentageText.position.y = -0.1;
        scene.add(percentageText);
      },
    });

    masterTimeline.to(loadingMaterial.uniforms.uOpacity, {
      value: 0,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        if (loadingText) scene.remove(loadingText);
        if (percentageText) scene.remove(percentageText);
      },
    });

    masterTimeline.call(() => {
      if (!logoMesh) return;
      scene.add(logoMesh);
      gsap.from(logoMesh.scale, { x: 0, y: 0, z: 0, duration: 2, ease: "power2.out" });
      gsap.from(logoMesh.rotation, {
        y: -Math.PI,
        duration: 1.5,
        ease: "power1.inOut",
      });
    });

    masterTimeline.to({}, { duration: 2, onComplete: onLoadingComplete });

    loadingManager.onLoad = () => {
      masterTimeline.play();
    };

    gsap.to(loadingMaterial.uniforms.uProgressShine, {
      value: 1,
      duration: 2,
      ease: "power1.inOut",
      repeat: -1,
      repeatDelay: 0.5,
    });

    // --- 渲染循环与窗口大小调整 ---
    let animationFrameId: number;
    const animate = () => {
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mountNode) return;
      const w = mountNode.clientWidth;
      const h = mountNode.clientHeight;
      renderer.setSize(w, h);
      const aspect = w / h;
      camera.left = -1 * aspect;
      camera.right = 1 * aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // --- 清理 ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (mountNode && renderer.domElement) {
        mountNode.removeChild(renderer.domElement);
      }
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const mat = object.material as THREE.ShaderMaterial | THREE.ShaderMaterial[] | THREE.MeshBasicMaterial;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else if (mat) {
            mat.dispose();
          }
        }
      });
      renderer.dispose();
      gsap.killTweensOf("*");
    };
  }, [onLoadingComplete]);

  return <div ref={mountRef} className="fixed inset-0 z-50" style={{ backgroundColor: "#EBE6D8" }}></div>;
}
```

**注意事项:**
- 需要准备 SVG logo 文件并放在 `public/` 目录
- 需要准备预加载的图片资源
- 根据品牌修改颜色和文字内容

### 6.4 components/image-wall.tsx

```typescript
import { useEffect, useRef } from "react"
import Image from "next/image"
import gsap from "gsap"

// 定义图片数据结构
const imageDetails = [
  { src: '/1.jpg', position: { top: "50%", left: "50%" }, aspectRatio: '9 / 16', widthScale: 1.0 },
  { src: '/2.jpg', position: { top: "50%", left: "35%" }, aspectRatio: '9 / 6', widthScale: 1.0 },
  { src: '/3.jpg', position: { top: "50%", left: "65%" }, aspectRatio: '9 / 12', widthScale: 0.8 },
  { src: '/4.jpg', position: { top: "75%", left: "50%" }, aspectRatio: '9 / 6', widthScale: 1.0 },
  { src: '/5.jpg', position: { top: "65%", left: "65%" }, aspectRatio: '9 / 6', widthScale: 1.4 },
  { src: '/6.jpg', position: { top: "30%", left: "65%" }, aspectRatio: '9 / 6', widthScale: 1.4 },
  { src: '/7.jpg', position: { top: "25%", left: "40%" }, aspectRatio: '9 / 6', widthScale: 1 },
];

const BASE_WIDTH = 256;

interface ImageWallProps {
  isActive: boolean;
  onComplete: () => void;
}

export function ImageWall({ isActive, onComplete }: ImageWallProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current
    if (!container) return

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(container, {
          opacity: 0,
          duration: 1,
          onComplete: onComplete,
        })
      },
    })

    gsap.set(container, { opacity: 1, pointerEvents: 'auto' });

    tl.fromTo(
      ".image-item",
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.2,
      }
    )
  }, [isActive, onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 bg-[#EBE6D8] opacity-0 pointer-events-none"
    >
      {imageDetails.map((item, index) => {
        const width = BASE_WIDTH * item.widthScale;

        return (
          <div
            key={item.src}
            className="image-item absolute overflow-hidden shadow-lg -translate-x-1/2 -translate-y-1/2"
            style={{
              top: item.position.top,
              left: item.position.left,
              width: `${width}px`,
              aspectRatio: item.aspectRatio,
            }}
          >
            <Image
              src={item.src}
              alt={`Gallery image ${index + 1}`}
              fill
              className="object-cover"
              sizes={`${width}px`}
            />
          </div>
        )
      })}
    </div>
  )
}
```

**注意事项:**
- 根据你的实际图片资源调整 `imageDetails` 数组
- 图片路径为 `public/` 目录下的相对路径

### 6.5 components/ScrollToTop.tsx

```typescript
"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false)

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 z-50 p-3 rounded-full bg-black text-white shadow-lg transition-opacity",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}

export default ScrollToTop
```

### 6.6 components/ScrollToTopOnRouteChange.tsx

```typescript
"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export default function ScrollToTopOnRouteChange() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [pathname, searchParams?.toString()])

  return null
}
```

### 6.7 components/LocaleSwitcher.tsx

```typescript
"use client"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronDown, Globe } from "lucide-react"
import { useUserPreferences } from "@/hooks/useUserPreferences"
import {
  countries,
  languages,
  getCountryByCode,
  getLanguageByCode,
  getAllCountries,
  type Country,
  type Language,
} from "@/lib/countries-languages"
import { cn } from "@/lib/utils"
import { usePathname, useRouter, replaceLocaleInPath } from "@/lib/navigation"
import { Button } from "@/components/ui/button"

// 定义 Header 传入的主题类型
type HeaderTheme = "transparent" | "light" | "dark";

interface LocaleSwitcherProps {
  activeTheme: HeaderTheme;
}

export default function LocaleSwitcher({ activeTheme }: LocaleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const countryListRef = useRef<HTMLDivElement>(null);
  const languageListRef = useRef<HTMLDivElement>(null);
  const { preferences, isLoaded, updateCountry, updateLanguage } = useUserPreferences()
  const pathname = usePathname()
  const router = useRouter()

  // 临时状态,用于下拉菜单中的选择
  const [tempCountryCode, setTempCountryCode] = useState(preferences.country)
  const [tempLanguageCode, setTempLanguageCode] = useState(preferences.language)

  // 同步临时状态
  useEffect(() => {
    if (isLoaded) {
      setTempCountryCode(preferences.country)
      setTempLanguageCode(preferences.language)
    }
  }, [preferences, isLoaded])

  // 获取当前显示的对象
  const selectedCountry = getCountryByCode(preferences.country)
  const selectedLanguage = getLanguageByCode(preferences.language)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTempCountryCode(preferences.country)
        setTempLanguageCode(preferences.language)
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [preferences])

  // --- 阻止 Lenis 滚动冲突 ---
  useEffect(() => {
    const countryListEl = countryListRef.current;
    const languageListEl = languageListRef.current;

    const stopPropagation = (event: WheelEvent | TouchEvent) => {
      event.stopPropagation();
    };

    if (isOpen && countryListEl && languageListEl) {
      countryListEl.addEventListener('wheel', stopPropagation);
      languageListEl.addEventListener('wheel', stopPropagation);
      countryListEl.addEventListener('touchmove', stopPropagation);
      languageListEl.addEventListener('touchmove', stopPropagation);
    }

    return () => {
      if (countryListEl && languageListEl) {
        countryListEl.removeEventListener('wheel', stopPropagation);
        languageListEl.removeEventListener('wheel', stopPropagation);
        countryListEl.removeEventListener('touchmove', stopPropagation);
        languageListEl.removeEventListener('touchmove', stopPropagation);
      }
    };
  }, [isOpen]);

  // 更新临时国家选择
  const handleTempCountrySelect = (countryCode: string) => {
    setTempCountryCode(countryCode)
  }

  // 更新临时语言选择
  const handleTempLanguageSelect = (languageCode: string) => {
    setTempLanguageCode(languageCode)
  }

  // 点击确认按钮
  const handleConfirm = () => {
    const originalLanguage = preferences.language;

    updateCountry(tempCountryCode)
    updateLanguage(tempLanguageCode)

    if (tempLanguageCode !== originalLanguage) {
      const newPath = replaceLocaleInPath(pathname, tempLanguageCode)
      router.push(newPath)
    }

    setIsOpen(false)
  }

  // 加载状态
  if (!isLoaded) {
    return (
      <div className="flex items-center space-x-1 opacity-50">
        <Globe className={cn("w-4 h-4", activeTheme === 'transparent' ? 'text-white' : 'text-brand-text-main')} />
        <span className={cn("text-xs", activeTheme === 'transparent' ? 'text-white' : 'text-brand-text-main')}>Loading...</span>
      </div>
    )
  }

  // 动态计算按钮文字颜色
  const buttonTextColor = activeTheme === 'transparent' ? 'text-white' : 'text-brand-text-main';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
            "flex items-center space-x-1 group transition-opacity hover:opacity-80",
            buttonTextColor
        )}
        aria-label="Select country and language"
      >
        <span className="text-lg">{selectedCountry?.flag}</span>
        <span className="text-xs font-medium">
          {selectedCountry?.name} / {selectedLanguage?.nativeName}
        </span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[400px] bg-background rounded-lg shadow-lg border border-border z-50">
          <div className="flex max-h-80">
            {/* 左列:国家 */}
            <div ref={countryListRef} className="w-1/2 overflow-y-auto p-2 border-r border-border scrollbar-hide">
              <h3 className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Country</h3>
              <div className="space-y-1">
                {getAllCountries().map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleTempCountrySelect(country.code)}
                    className={cn(
                      "w-full flex items-center justify-between space-x-2 px-2 py-1.5 text-left rounded-md transition-colors text-sm",
                      tempCountryCode === country.code
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-foreground",
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                    {tempCountryCode === country.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 右列:语言 */}
            <div ref={languageListRef} className="w-1/2 overflow-y-auto p-2 scrollbar-hide">
              <h3 className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Language</h3>
              <div className="space-y-1">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleTempLanguageSelect(language.code)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-1.5 text-left rounded-md transition-colors text-sm",
                      tempLanguageCode === language.code
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-foreground",
                    )}
                  >
                    <span>{language.name} ({language.nativeName})</span>
                    {tempLanguageCode === language.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 确认按钮 */}
          <div className="border-t border-border p-3 flex justify-end">
            <Button size="sm" onClick={handleConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## 7. 页面组件

### 7.1 components/ClientLayoutWrapper.tsx (需要适配 Apollo)

**原始版本 (使用 SWR):**

```typescript
"use client";

import { useState, useCallback, useEffect } from "react";
import { SWRConfig } from 'swr';
import { Preloader } from "@/components/Preloader";
import { ImageWall } from "@/components/image-wall";

const fetcher = (resource: string) => fetch(resource).then(res => {
  if (!res.ok) throw new Error('An error occurred while fetching the data.');
  return res.json();
});

type LoadingStage = "loading" | "imageWall" | "done";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("loading");

  useEffect(() => {
    if (sessionStorage.getItem("preloaderDone") === "true") {
      // setLoadingStage("done"); // 取消注释以跳过动画
    }
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setLoadingStage("imageWall");
  }, []);

  const handleImageWallComplete = useCallback(() => {
    sessionStorage.setItem("preloaderDone", "true");
    setLoadingStage("done");
  }, []);

  return (
    <SWRConfig value={{ fetcher }}>
      <div
        className={`transition-opacity duration-700 ${loadingStage === 'done' ? 'opacity-100' : 'opacity-0'}`}
      >
        {children}
      </div>

      {loadingStage !== "done" && (
        <>
          {loadingStage === "loading" && <Preloader onLoadingComplete={handleLoadingComplete} />}
          <ImageWall
            isActive={loadingStage === "imageWall"}
            onComplete={handleImageWallComplete}
          />
        </>
      )}
    </SWRConfig>
  );
}
```

**适配 Apollo Client 的版本:** 见 [第12节](#12-apollo-client-适配说明)

### 7.2 app/[locale]/layout.tsx

```typescript
import type React from "react";
import { Suspense } from "react";
import { Anaheim, Inter, Montserrat, Pavanam, Paytone_One, Phudu, Poller_One } from "next/font/google";
import "../globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollToTopOnRouteChange from "@/components/ScrollToTopOnRouteChange";
import { isValidLocale, defaultLocale } from "@/i18n.config";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";
import { LenisProvider } from "@/components/lenis-provider";

// --- 配置所有 Google Fonts ---
const paytoneOne = Paytone_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-paytone-one",
  display: "swap",
});

const pollerOne = Poller_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poller-one",
  display: "swap",
});

const pavanam = Pavanam({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pavanam",
  display: "swap",
});

const phudu = Phudu({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-phudu",
  display: "swap",
});

const anaheim = Anaheim({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-anaheim",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({ subsets: ["latin"] });

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }, { locale: "es" }, { locale: "fr" }, { locale: "de" }];
}

export default function RootLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
  const validLocale = isValidLocale(locale) ? locale : defaultLocale;

  return (
    <html
      lang={validLocale}
      className={`
      ${paytoneOne.variable}
      ${pollerOne.variable}
      ${pavanam.variable}
      ${phudu.variable}
      ${anaheim.variable}
      ${montserrat.variable}
      font-sans
    `}
    >
      <body className={inter.className}>
        <ClientLayoutWrapper>
          <LenisProvider easingKey={"easeOutQuad"} />
          <div className="flex flex-col min-h-screen">
            <Header locale={validLocale} />
            {children}
            <Suspense fallback={null}>
              <ScrollToTopOnRouteChange />
              <ScrollToTop />
            </Suspense>
            <Footer locale={validLocale} />
          </div>
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
```

**说明:**
- 根据新项目的字体需求调整 Google Fonts 导入
- 根据新项目支持的语言调整 `generateStaticParams`

### 7.3 app/[locale]/page.tsx

```typescript
import type { Locale } from "@/i18n.config"
import { getHomeContent, HomeContent } from "@/lib/content-data"
import { getUserPreferencesFromCookies } from "@/lib/server/user-preferences"
import { HomePageClient } from "./HomePageClient"

export default async function Home({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const preferences = await getUserPreferencesFromCookies()
  const currentLanguage = preferences.language as Locale || locale
  const content = getHomeContent(currentLanguage) as HomeContent;

  return (
    <HomePageClient
      initialContent={content}
      currentLanguage={currentLanguage}
    />
  )
}
```

**Apollo 适配说明:** 如果使用 Apollo Client,服务端数据获取逻辑需要改为使用 Apollo 的 SSR 方法。详见 [第12节](#12-apollo-client-适配说明)。

### 7.4 app/[locale]/HomePageClient.tsx

```typescript
"use client";

import type { Locale } from "@/i18n.config";
import type { HomeContent } from "@/lib/content-data";

// 导入所有模块组件
import HeroBanner from "@/components/home/hero-banner";
import ProductSeriesCarousel from "@/components/home/product-series-carousel";
import ServiceFeatures from "@/components/home/service-features";
import Sphere3D from "@/components/home/sphere-3d";
import SimpleCta from "@/components/home/simple-cta";
import SeriesIntro from "@/components/home/series-intro";
import FeaturedProducts from "@/components/home/featured-products";
import BrandAdvantages from "@/components/home/brand-advantages";
import OemOdm from "@/components/home/oem-odm";
import QuoteSteps from "@/components/home/quote-steps";
import MainForm from "@/components/home/main-form";
import WhyChooseBusrom from "@/components/home/why-choose-busrom";
import CaseStudies from "@/components/home/case-studies";
import BrandAnalysis from "@/components/home/brand-analysis";
import BrandValue from "@/components/home/brand-value";

export function HomePageClient({
  initialContent,
  currentLanguage
}: {
  initialContent: HomeContent,
  currentLanguage: Locale
}) {

  // Apollo 客户端数据获取逻辑将在这里实现
  // 详见第12节

  if (!initialContent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">

      {/* 模块 1: Hero Banner */}
      <div data-header-theme="transparent">
        <HeroBanner data={initialContent.heroBanner} locale={currentLanguage} />
      </div>

      {/* 模块 2: 产品系列轮播 */}
      <div data-header-theme="dark">
        <ProductSeriesCarousel data={initialContent.productSeriesCarousel} locale={currentLanguage} />
      </div>

      {/* 模块 3: 服务特色 */}
      <div data-header-theme="light">
        <ServiceFeatures data={initialContent.serviceFeatures} />
      </div>

      {/* 模块 4: 3D球体 */}
      <div data-header-theme="light">
        <Sphere3D />
      </div>

      {/* 模块 5: 简易表单跳转 */}
      <div data-header-theme="light">
        <SimpleCta data={initialContent.simpleCta} />
      </div>

      {/* 模块 6: 系列产品介绍 */}
      <div data-header-theme="dark">
        <SeriesIntro data={initialContent.seriesIntro} />
      </div>

      {/* 模块 7: 精选产品 */}
      <div data-header-theme="light">
        <FeaturedProducts data={initialContent.featuredProducts} locale={currentLanguage} />
      </div>

      {/* 模块 8: 品牌优势 */}
      <div data-header-theme="transparent">
        <BrandAdvantages data={initialContent.brandAdvantages} />
      </div>

      {/* 模块 9: OEM / ODM合作 */}
      <div data-header-theme="transparent">
        <OemOdm data={initialContent.oemOdm} />
      </div>

      {/* 模块 10: 获取报价五步曲 */}
      <div data-header-theme="light">
        <QuoteSteps data={initialContent.quoteSteps} />
      </div>

      {/* 模块 11: 表单 */}
      <div data-header-theme="transparent">
        <MainForm data={initialContent.mainForm} />
      </div>

      {/* 模块 12: 为什么选择Busrom */}
      <div data-header-theme="light">
        <WhyChooseBusrom data={initialContent.whyChooseBusrom} />
      </div>

      {/* 模块 13: 应用案例轮播 */}
      <div data-header-theme="light">
        <CaseStudies data={initialContent.caseStudies} />
      </div>

      {/* 模块 14: 品牌价值植入 */}
      <div data-header-theme="transparent">
        <BrandAnalysis data={initialContent.brandAnalysis} />
      </div>

      {/* 模块 15: 品牌价值体现 */}
      <div data-header-theme="light">
        <BrandValue data={initialContent.brandValue} />
      </div>

    </main>
  )
}
```

**说明:**
- 根据新项目的实际模块调整组件导入和渲染
- `data-header-theme` 属性用于控制 Header 的主题切换

---

## 8. Layout 组件

Layout 组件包括 Header, Footer, Mobile Menu 等,这些组件的代码量较大。

**迁移说明:**
1. 将 `components/layout/header.tsx` 完整复制
2. 将 `components/layout/footer.tsx` 完整复制
3. 将 `components/layout/mobile-menu.tsx` 完整复制

**注意事项:**
- Header 组件使用了 `data-header-theme` 属性来响应页面滚动时的主题变化
- 需要根据新项目的导航结构调整菜单项
- Footer 组件的内容需要根据新项目的需求修改

---

## 9. Home 组件

Home 页面的所有模块组件位于 `components/home/` 目录下。

**需要迁移的组件列表:**
- `hero-banner.tsx` - 英雄横幅轮播
- `product-series-carousel.tsx` - 产品系列轮播
- `service-features.tsx` - 服务特色
- `sphere-3d.tsx` - 3D 球体动画
- `simple-cta.tsx` - 简单 CTA
- `series-intro.tsx` - 系列介绍
- `featured-products.tsx` - 精选产品
- `brand-advantages.tsx` - 品牌优势
- `oem-odm.tsx` - OEM/ODM 合作
- `quote-steps.tsx` - 报价步骤
- `main-form.tsx` - 主表单
- `why-choose-busrom.tsx` - 为什么选择我们
- `case-studies.tsx` - 案例研究
- `brand-analysis.tsx` - 品牌分析
- `brand-value.tsx` - 品牌价值
- `FeatureImageLayout.tsx` - 特色图片布局 (辅助组件)

**迁移方式:**
由于每个组件代码量较大,建议直接复制整个 `components/home/` 目录到新项目。

**注意事项:**
- 这些组件依赖于特定的数据结构 (`HomeContent` 类型)
- 需要根据新项目的 GraphQL schema 调整数据类型定义
- 图片路径需要根据新项目的资源位置调整

---

## 10. HeroBanner 组件

HeroBanner 组件包含 9 个不同的横幅设计,位于 `components/HeroBanner/` 目录。

**需要迁移的组件:**
- `HeroBanner1.tsx` ~ `HeroBanner9.tsx`

**迁移方式:**
直接复制整个 `components/HeroBanner/` 目录。

**示例 - HeroBanner 主组件:**

详见上文 [6.3 components/home/hero-banner.tsx](#63-componentshomehero-bannertsx)

**注意事项:**
- 每个 HeroBanner 组件都有独特的设计和动画
- 使用了 Embla Carousel 进行轮播
- 图片资源需要放在 `public/` 目录

---

## 11. 依赖包

### 需要安装的 npm 包

```json
{
  "dependencies": {
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "gsap": "^3.13.0",
    "lenis": "^1.3.11",
    "three": "^0.180.0",
    "embla-carousel-react": "latest",
    "embla-carousel-fade": "^8.6.0",
    "lucide-react": "^0.454.0",
    "framer-motion": "^12.23.24"
  },
  "devDependencies": {
    "@types/three": "^0.180.0",
    "tailwind-scrollbar-hide": "^4.0.0",
    "@tailwindcss/aspect-ratio": "^0.4.2"
  }
}
```

**Tailwind 插件:**
```bash
npm install tailwindcss-animate tailwind-scrollbar-hide @tailwindcss/aspect-ratio
```

**注意:** 如果新项目已经使用 Apollo Client,不需要安装 SWR:
```bash
npm install @apollo/client graphql
```

---

## 12. Apollo Client 适配说明

由于新项目使用 Apollo Client 而不是 SWR,需要对以下部分进行适配:

### 12.1 ClientLayoutWrapper 适配

```typescript
"use client";

import { useState, useCallback, useEffect } from "react";
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client'; // 你的 Apollo Client 实例
import { Preloader } from "@/components/Preloader";
import { ImageWall } from "@/components/image-wall";

type LoadingStage = "loading" | "imageWall" | "done";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("loading");

  useEffect(() => {
    if (sessionStorage.getItem("preloaderDone") === "true") {
      // setLoadingStage("done"); // 取消注释以跳过动画
    }
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setLoadingStage("imageWall");
  }, []);

  const handleImageWallComplete = useCallback(() => {
    sessionStorage.setItem("preloaderDone", "true");
    setLoadingStage("done");
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <div
        className={`transition-opacity duration-700 ${loadingStage === 'done' ? 'opacity-100' : 'opacity-0'}`}
      >
        {children}
      </div>

      {loadingStage !== "done" && (
        <>
          {loadingStage === "loading" && <Preloader onLoadingComplete={handleLoadingComplete} />}
          <ImageWall
            isActive={loadingStage === "imageWall"}
            onComplete={handleImageWallComplete}
          />
        </>
      )}
    </ApolloProvider>
  );
}
```

### 12.2 HomePageClient 适配

```typescript
"use client";

import { useQuery, gql } from '@apollo/client';
import type { Locale } from "@/i18n.config";
import type { HomeContent } from "@/lib/content-data";

// 定义 GraphQL 查询
const GET_HOME_CONTENT = gql`
  query GetHomeContent($language: String!) {
    homeContent(language: $language) {
      heroBanner {
        # 你的字段
      }
      productSeriesCarousel {
        # 你的字段
      }
      # ... 其他模块
    }
  }
`;

// ... 导入所有组件

export function HomePageClient({
  initialContent,
  currentLanguage
}: {
  initialContent: HomeContent,
  currentLanguage: Locale
}) {

  // 使用 Apollo Client 进行客户端数据获取
  const { data, loading, error } = useQuery<{ homeContent: HomeContent }>(GET_HOME_CONTENT, {
    variables: { language: currentLanguage },
    // 使用服务端传来的初始数据
    skip: false, // 如果你想在客户端重新获取数据
  });

  // 优先使用 Apollo 返回的数据,如果没有则使用初始数据
  const content = data?.homeContent || initialContent;

  if (error) {
    console.error("Apollo query failed:", error);
  }

  if (loading && !content) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* 渲染所有模块 */}
      <div data-header-theme="transparent">
        <HeroBanner data={content.heroBanner} locale={currentLanguage} />
      </div>
      {/* ... 其他模块 */}
    </main>
  )
}
```

### 12.3 服务端数据获取适配 (page.tsx)

```typescript
import type { Locale } from "@/i18n.config"
import { getUserPreferencesFromCookies } from "@/lib/server/user-preferences"
import { HomePageClient } from "./HomePageClient"
import { getClient } from "@/lib/apollo-client-server" // SSR Apollo Client
import { gql } from "@apollo/client"

const GET_HOME_CONTENT = gql`
  query GetHomeContent($language: String!) {
    homeContent(language: $language) {
      # 你的字段
    }
  }
`;

export default async function Home({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const preferences = await getUserPreferencesFromCookies()
  const currentLanguage = preferences.language as Locale || locale

  // 使用 Apollo Client 在服务端获取数据
  const client = getClient();
  const { data } = await client.query({
    query: GET_HOME_CONTENT,
    variables: { language: currentLanguage },
  });

  return (
    <HomePageClient
      initialContent={data.homeContent}
      currentLanguage={currentLanguage}
    />
  )
}
```

### 12.4 创建 Apollo Client 实例

**lib/apollo-client.ts (客户端):**

```typescript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
```

**lib/apollo-client-server.ts (服务端):**

```typescript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc';

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.GRAPHQL_ENDPOINT, // 服务端环境变量
    }),
    cache: new InMemoryCache(),
  });
});
```

**环境变量 (.env.local):**

```bash
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://your-graphql-api.com/graphql
GRAPHQL_ENDPOINT=https://your-graphql-api.com/graphql
```

---

## 总结

本文档提供了从 Busrom 项目迁移到新项目的完整代码和说明。主要包括:

1. ✅ Tailwind 配置和全局样式
2. ✅ 中间件和国际化配置
3. ✅ 工具函数库 (utils, countries, scroll, navigation)
4. ✅ Hooks (use-mobile, useUserPreferences)
5. ✅ 核心组件 (Preloader, ImageWall, Lenis, LocaleSwitcher, ScrollToTop 等)
6. ✅ 页面结构 (Layout, Page, HomePageClient)
7. ✅ Layout 组件 (Header, Footer, Mobile Menu)
8. ✅ Home 模块组件 (15个功能模块)
9. ✅ HeroBanner 组件 (9个横幅设计)
10. ✅ Apollo Client 适配方案

### 迁移步骤建议

1. **第一阶段: 基础设施**
   - 复制 `tailwind.config.ts` 和 `globals.css`
   - 安装必要的依赖包
   - 配置 Apollo Client

2. **第二阶段: 工具和 Hooks**
   - 复制 `lib/` 目录下的工具函数
   - 复制 `hooks/` 目录
   - 复制 `i18n.config.ts` 和 `middleware.ts`

3. **第三阶段: 核心组件**
   - 复制核心组件 (Preloader, ImageWall, Lenis, etc.)
   - 准备必要的静态资源 (图片, SVG logo)

4. **第四阶段: 页面结构**
   - 适配 `ClientLayoutWrapper` 为 Apollo
   - 复制 `app/[locale]/layout.tsx` 和 `page.tsx`
   - 复制 `HomePageClient.tsx` 并适配 GraphQL

5. **第五阶段: 功能模块**
   - 复制 Layout 组件 (Header, Footer)
   - 复制 Home 组件目录
   - 复制 HeroBanner 组件目录
   - 根据新项目的数据结构调整类型定义

6. **第六阶段: 测试和调整**
   - 测试加载动画
   - 测试语言切换
   - 测试平滑滚动
   - 调整样式和颜色以匹配新项目设计

### 注意事项

- 所有组件路径使用 `@/` 别名,确保新项目配置了相同的路径别名
- 图片资源放在 `public/` 目录
- 根据新项目的 GraphQL schema 调整数据类型
- 测试移动端和桌面端的响应式布局
- 确保所有动画在不同设备上流畅运行

如有任何问题,请参考原项目代码或咨询开发团队。
