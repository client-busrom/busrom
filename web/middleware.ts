import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, nonDefaultLocales } from '@/i18n.config';

/**
 * URL 路由策略:
 * - 英文(默认): busromhouse.com/  (无前缀)
 * - 其他语言: busromhouse.com/zh, busromhouse.com/fr 等
 *
 * SEO 301 重定向:
 * - /en -> /
 * - /en/about -> /about
 */

function getPreferredLocale(request: NextRequest): string {
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

  // 2. 如果没有 cookie，从 Accept-Language header 获取
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

  // 1. 处理 /en 和 /en/* 的 301 重定向 (SEO 保护)
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    // /en -> /
    // /en/about -> /about
    const newPath = pathname.replace(new RegExp(`^/${defaultLocale}/?`), '/') || '/';
    const url = new URL(newPath, request.url);
    url.search = request.nextUrl.search; // 保留查询参数
    return NextResponse.redirect(url, 301);
  }

  // 2. 检查路径是否已经有非默认语言前缀 (如 /zh, /fr)
  const hasNonDefaultLocale = nonDefaultLocales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // 3. 如果路径没有语言前缀，视为默认语言(英文)，直接通过
  //    但需要通过 rewrite 将请求路由到 /en/* 的页面
  if (!hasNonDefaultLocale) {
    // 没有语言前缀 = 英文内容
    // 使用 rewrite 将 / 映射到 /en (内部路由，URL 不变)
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    const response = NextResponse.rewrite(url);
    // Add Vary header to prevent CDN from caching RSC payload for HTML requests
    response.headers.set('Vary', 'Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch');
    return response;
  }

  // 4. 有非默认语言前缀的路径，直接通过
  const response = NextResponse.next();
  // Add Vary header to prevent CDN from caching RSC payload for HTML requests
  response.headers.set('Vary', 'Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch');
  return response;
}

export const config = {
  // Exclude: api, static files, sitemap routes, robots.txt, feed
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap|sitemaps\\.xml|robots\\.txt|feed|.*\\..*).*)'],
};